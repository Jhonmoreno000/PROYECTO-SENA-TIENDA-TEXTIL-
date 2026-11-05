package infraestructura.persistencia.jdbc;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import aplicacion.servicios.ServicioCriptoWompi;
import dominio.excepciones.ExcepcionDominio;
import dominio.modelos.TransaccionWompi;
import infraestructura.configuracion.Conexion;
import infraestructura.configuracion.ConfiguracionWompi;

/**
 * DAO especializado en el ciclo de vida de pagos seguros con Wompi (Bancolombia).
 *
 * Garantiza:
 *  1. Cálculo estricto en el servidor (el cliente no puede alterar precios ni totales).
 *  2. Generación de firmas SHA-256 de integridad para el Widget.
 *  3. Procesamiento idempotente de Webhooks con transacciones ACID y bloqueo FOR UPDATE.
 *  4. Descuento automático de metros de tela (stock) sólo tras pago APROBADO.
 */
public class PagoWompiDAO {

    /**
     * DTO interno para retornar el resultado de la intención de pago.
     */
    public static class ResultadoIntencionPago {
        public int idPedido;
        public String referencia;
        public long montoEnCentavos;
        public double subtotal;
        public double descuento;
        public double envio;
        public double iva;
        public double total;
        public String moneda;
        public String firmaIntegridad;
        public String llavePublica;
        public String correoCliente;
        public String nombreCliente;
        public String telefonoCliente;
    }

    /**
     * Crea una orden en estado PENDING y genera la intención de pago con su firma de integridad.
     * Consulta los precios reales directamente en PostgreSQL.
     */
    public ResultadoIntencionPago crearIntencionPago(
            int idUsuario,
            String nombreCliente,
            String correoCliente,
            String telefonoCliente,
            String direccionEnvio,
            String ciudadEnvio,
            String departamentoEnvio,
            String notas,
            String codigoCupon,
            List<Map<String, Object>> articulosSolicitados) {

        if (articulosSolicitados == null || articulosSolicitados.isEmpty()) {
            throw new ExcepcionDominio("El carrito no contiene productos.");
        }

        try (Connection con = Conexion.obtenerConexion()) {
            con.setAutoCommit(false);
            try {
                // 1. Validar y calcular precios desde la base de datos
                double subtotal = 0.0;
                int idVendedorPrincipal = 1;
                List<ItemCalculado> itemsCalculados = new ArrayList<>();

                String sqlProducto = "SELECT id, nombre, precio, stock, vendedor_id, activo FROM productos WHERE id = ? FOR SHARE";

                for (Map<String, Object> art : articulosSolicitados) {
                    Object pIdObj = art.getOrDefault("productId", art.get("id"));
                    Object cantObj = art.getOrDefault("quantity", art.get("cantidad"));

                    if (pIdObj == null || cantObj == null) {
                        throw new ExcepcionDominio("Producto o cantidad no especificada.");
                    }

                    int idProd = (pIdObj instanceof Number) ? ((Number) pIdObj).intValue() : Integer.parseInt(pIdObj.toString());
                    double metros = (cantObj instanceof Number) ? ((Number) cantObj).doubleValue() : Double.parseDouble(cantObj.toString());

                    if (metros <= 0) {
                        throw new ExcepcionDominio("La cantidad de metros debe ser mayor a 0.");
                    }

                    try (PreparedStatement pst = con.prepareStatement(sqlProducto)) {
                        pst.setInt(1, idProd);
                        try (ResultSet rs = pst.executeQuery()) {
                            if (!rs.next()) {
                                throw new ExcepcionDominio("El producto con ID " + idProd + " no existe.");
                            }
                            if (!rs.getBoolean("activo")) {
                                throw new ExcepcionDominio("El producto '" + rs.getString("nombre") + "' no está disponible.");
                            }

                            int stockDisponible = rs.getInt("stock");
                            if (stockDisponible < metros) {
                                throw new ExcepcionDominio("Stock insuficiente para '" + rs.getString("nombre") + "'. Disponibles: " + stockDisponible + " metros.");
                            }

                            double precioUnitario = rs.getDouble("precio");
                            int vendedorId = rs.getInt("vendedor_id");
                            if (vendedorId > 0) idVendedorPrincipal = vendedorId;

                            double subtotalLinea = Math.round((precioUnitario * metros) * 100.0) / 100.0;
                            subtotal += subtotalLinea;

                            itemsCalculados.add(new ItemCalculado(idProd, rs.getString("nombre"), metros, precioUnitario, subtotalLinea));
                        }
                    }
                }

                // 2. Aplicar Cupón si existe
                double descuento = 0.0;
                if (codigoCupon != null && !codigoCupon.trim().isEmpty()) {
                    String sqlCupon = "SELECT tipo_descuento, valor_descuento, compra_minima, activo, expira_en, usos_maximos, conteo_usos FROM cupones WHERE UPPER(codigo) = UPPER(?)";
                    try (PreparedStatement pst = con.prepareStatement(sqlCupon)) {
                        pst.setString(1, codigoCupon.trim());
                        try (ResultSet rs = pst.executeQuery()) {
                            if (rs.next() && rs.getBoolean("activo")) {
                                java.sql.Timestamp expira = rs.getTimestamp("expira_en");
                                boolean expirado = (expira != null && expira.before(new java.util.Date()));
                                int usosMax = rs.getInt("usos_maximos");
                                int conteoUsos = rs.getInt("conteo_usos");
                                boolean limiteAlcanzado = (usosMax > 0 && conteoUsos >= usosMax);

                                if (!expirado && !limiteAlcanzado) {
                                    double compraMinima = rs.getDouble("compra_minima");
                                    if (compraMinima <= 0 || subtotal >= compraMinima) {
                                        String tipo = rs.getString("tipo_descuento");
                                        double valor = rs.getDouble("valor_descuento");
                                        if ("percentage".equalsIgnoreCase(tipo) || "porcentaje".equalsIgnoreCase(tipo)) {
                                            descuento = subtotal * (valor / 100.0);
                                        } else {
                                            descuento = valor;
                                        }
                                        descuento = Math.min(descuento, subtotal);
                                    }
                                }
                            }
                        }
                    }
                }

                double subtotalConDescuento = Math.max(0.0, subtotal - descuento);

                // 3. Envío e IVA
                // Envío gratis si el subtotal con descuento supera los $100.000 COP
                double costoEnvio = subtotalConDescuento >= 100000.0 ? 0.0 : 15000.0;
                double iva = Math.round((subtotalConDescuento * 0.19) * 100.0) / 100.0;
                double total = Math.round((subtotalConDescuento + costoEnvio + iva) * 100.0) / 100.0;

                long montoCentavos = Math.round(total * 100.0);

                // 4. Generar referencia única
                String sufijoUuid = UUID.randomUUID().toString().replace("-", "").substring(0, 8).toUpperCase();
                String referencia = "DD-" + System.currentTimeMillis() + "-" + sufijoUuid;

                // 5. Guardar Pedido en PostgreSQL con estado 'pending'
                String sqlInsertPedido = "INSERT INTO pedidos (" +
                        "  usuario_id, vendedor_id, nombre_cliente, correo_cliente, telefono_cliente, " +
                        "  direccion_envio, ciudad_envio, departamento_envio, monto_total, subtotal, " +
                        "  monto_impuesto, costo_envio, monto_descuento, codigo_cupon, estado, " +
                        "  metodo_pago, estado_pago, referencia_pago, monto_centavos, moneda, notas, creado_en, actualizado_en" +
                        ") VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 'wompi', 'pending', ?, ?, 'COP', ?, NOW(), NOW())";

                int idPedido = -1;
                try (PreparedStatement pst = con.prepareStatement(sqlInsertPedido, Statement.RETURN_GENERATED_KEYS)) {
                    pst.setInt(1, idUsuario > 0 ? idUsuario : 1);
                    pst.setInt(2, idVendedorPrincipal);
                    pst.setString(3, nombreCliente != null ? nombreCliente : "Cliente");
                    pst.setString(4, correoCliente != null ? correoCliente : "cliente@tienda.com");
                    pst.setString(5, telefonoCliente != null ? telefonoCliente : "");
                    pst.setString(6, direccionEnvio != null ? direccionEnvio : "No especificada");
                    pst.setString(7, ciudadEnvio != null ? ciudadEnvio : "Bogotá");
                    pst.setString(8, departamentoEnvio != null ? departamentoEnvio : "Cundinamarca");
                    pst.setDouble(9, total);
                    pst.setDouble(10, subtotal);
                    pst.setDouble(11, iva);
                    pst.setDouble(12, costoEnvio);
                    pst.setDouble(13, descuento);
                    pst.setString(14, codigoCupon);
                    pst.setString(15, referencia);
                    pst.setLong(16, montoCentavos);
                    pst.setString(17, notas != null ? notas : "");

                    pst.executeUpdate();
                    try (ResultSet rs = pst.getGeneratedKeys()) {
                        if (rs.next()) idPedido = rs.getInt(1);
                    }
                }

                if (idPedido <= 0) {
                    throw new SQLException("No se pudo obtener el ID del pedido generado.");
                }

                // 6. Guardar líneas del pedido
                String sqlInsertItem = "INSERT INTO items_pedido (pedido_id, producto_id, cantidad, precio_por_metro, subtotal) VALUES (?, ?, ?, ?, ?)";
                try (PreparedStatement pst = con.prepareStatement(sqlInsertItem)) {
                    for (ItemCalculado item : itemsCalculados) {
                        pst.setInt(1, idPedido);
                        pst.setInt(2, item.idProducto);
                        pst.setDouble(3, item.metros);
                        pst.setDouble(4, item.precioUnitario);
                        pst.setDouble(5, item.subtotal);
                        pst.addBatch();
                    }
                    pst.executeBatch();
                }

                con.commit();

                // 7. Generar firma de integridad para Wompi Widget
                String firmaIntegridad = ServicioCriptoWompi.generarFirmaIntegridad(referencia, montoCentavos, ConfiguracionWompi.MONEDA);

                ResultadoIntencionPago res = new ResultadoIntencionPago();
                res.idPedido = idPedido;
                res.referencia = referencia;
                res.montoEnCentavos = montoCentavos;
                res.subtotal = subtotal;
                res.descuento = descuento;
                res.envio = costoEnvio;
                res.iva = iva;
                res.total = total;
                res.moneda = ConfiguracionWompi.MONEDA;
                res.firmaIntegridad = firmaIntegridad;
                res.llavePublica = ConfiguracionWompi.llavePublica();
                res.correoCliente = correoCliente;
                res.nombreCliente = nombreCliente;
                res.telefonoCliente = telefonoCliente;

                return res;

            } catch (Exception e) {
                con.rollback();
                if (e instanceof ExcepcionDominio) throw (ExcepcionDominio) e;
                throw new RuntimeException("Error creando intención de pago: " + e.getMessage(), e);
            }
        } catch (SQLException e) {
            throw new RuntimeException("Error en base de datos al crear intención de pago: " + e.getMessage(), e);
        }
    }

    /**
     * Procesa un evento de webhook de Wompi de forma IDEMPOTENTE y con ACID en PostgreSQL.
     */
    public boolean procesarTransaccionWompi(TransaccionWompi tx, String payloadRaw) {
        if (tx == null || tx.referencia() == null || tx.referencia().isBlank()) {
            System.err.println("[WOMPI] Transacción recibida sin referencia válida.");
            return false;
        }

        String sqlBloqueo = "SELECT id, estado, estado_pago, codigo_cupon, monto_centavos, moneda FROM pedidos WHERE referencia_pago = ? FOR UPDATE";

        try (Connection con = Conexion.obtenerConexion()) {
            con.setAutoCommit(false);
            try {
                int idPedido = -1;
                String estadoActual = null;
                String estadoPagoActual = null;
                String codigoCuponUsado = null;
                long montoCentavosEsperado = 0L;
                String monedaEsperada = "COP";

                try (PreparedStatement pst = con.prepareStatement(sqlBloqueo)) {
                    pst.setString(1, tx.referencia());
                    try (ResultSet rs = pst.executeQuery()) {
                        if (rs.next()) {
                            idPedido = rs.getInt("id");
                            estadoActual = rs.getString("estado");
                            estadoPagoActual = rs.getString("estado_pago");
                            codigoCuponUsado = rs.getString("codigo_cupon");
                            montoCentavosEsperado = rs.getLong("monto_centavos");
                            if (rs.getString("moneda") != null) {
                                monedaEsperada = rs.getString("moneda");
                            }
                        }
                    }
                }

                if (idPedido <= 0) {
                    System.err.println("[WOMPI] No se encontró pedido con referencia: " + tx.referencia());
                    registrarEvento(con, tx.referencia(), tx.id(), tx.estado(), "webhook", "PEDIDO_NO_ENCONTRADO", payloadRaw);
                    con.commit();
                    return false;
                }

                // IDEMPOTENCIA: Si ya está pagado/aprobado, ignorar sin duplicar acciones
                if ("APPROVED".equalsIgnoreCase(estadoPagoActual) || "paid".equalsIgnoreCase(estadoActual)) {
                    System.out.println("[WOMPI] Idempotencia: El pedido #" + idPedido + " (" + tx.referencia() + ") ya fue aprobado anteriormente.");
                    registrarEvento(con, tx.referencia(), tx.id(), tx.estado(), "webhook", "IGNORADO_YA_APROBADO", payloadRaw);
                    con.commit();
                    return true;
                }

                String nuevoEstadoWompi = tx.estado() != null ? tx.estado().toUpperCase() : "PENDING";

                if ("APPROVED".equals(nuevoEstadoWompi)) {
                    if (montoCentavosEsperado > 0 && (tx.montoEnCentavos() != montoCentavosEsperado || !monedaEsperada.equalsIgnoreCase(tx.moneda()))) {
                        System.err.println("[WOMPI SEGURIDAD] Monto o moneda discordante en webhook para " + tx.referencia()
                                + ". Esperado: " + montoCentavosEsperado + " " + monedaEsperada
                                + ", Recibido: " + tx.montoEnCentavos() + " " + tx.moneda());
                        registrarEvento(con, tx.referencia(), tx.id(), nuevoEstadoWompi, "webhook", "MONTO_O_MONEDA_DISCORDANTE", payloadRaw);
                        con.commit();
                        return false;
                    }
                    // Actualizar pedido a PAGADO
                    String sqlActualizarPedido = "UPDATE pedidos SET estado = 'paid', estado_pago = 'APPROVED', " +
                            "wompi_transaccion_id = ?, metodo_pago = ?, pagado_en = NOW(), actualizado_en = NOW() WHERE id = ?";
                    try (PreparedStatement pst = con.prepareStatement(sqlActualizarPedido)) {
                        pst.setString(1, tx.id());
                        pst.setString(2, tx.metodoPago() != null ? tx.metodoPago() : "WOMPI");
                        pst.setInt(3, idPedido);
                        pst.executeUpdate();
                    }

                    // Descontar inventario de metros en PostgreSQL
                    String sqlItems = "SELECT producto_id, cantidad FROM items_pedido WHERE pedido_id = ?";
                    String sqlDescontarStock = "UPDATE productos SET stock = GREATEST(0, stock - CAST(? AS INTEGER)), actualizado_en = NOW() WHERE id = ?";

                    try (PreparedStatement pstItems = con.prepareStatement(sqlItems);
                         PreparedStatement pstStock = con.prepareStatement(sqlDescontarStock)) {
                        pstItems.setInt(1, idPedido);
                        try (ResultSet rsItems = pstItems.executeQuery()) {
                            boolean hayItems = false;
                            while (rsItems.next()) {
                                int idProducto = rsItems.getInt("producto_id");
                                double cantidad = rsItems.getDouble("cantidad");
                                if (idProducto > 0 && cantidad > 0) {
                                    pstStock.setDouble(1, cantidad);
                                    pstStock.setInt(2, idProducto);
                                    pstStock.addBatch();
                                    hayItems = true;
                                }
                            }
                            if (hayItems) {
                                pstStock.executeBatch();
                            }
                        }
                    }

                    // Si usó cupón, incrementar conteo de usos
                    if (codigoCuponUsado != null && !codigoCuponUsado.isBlank()) {
                        String sqlIncrementarCupon = "UPDATE cupones SET conteo_usos = conteo_usos + 1 WHERE UPPER(codigo) = UPPER(?)";
                        try (PreparedStatement pst = con.prepareStatement(sqlIncrementarCupon)) {
                            pst.setString(1, codigoCuponUsado);
                            pst.executeUpdate();
                        }
                    }

                    registrarEvento(con, tx.referencia(), tx.id(), nuevoEstadoWompi, "webhook", "PAGO_PROCESADO_EXITOSO", payloadRaw);
                    System.out.println("[WOMPI] [EXITO] Pedido #" + idPedido + " (" + tx.referencia() + ") marcado como PAGADO e inventario descontado.");

                } else if ("DECLINED".equals(nuevoEstadoWompi) || "ERROR".equals(nuevoEstadoWompi) || "VOIDED".equals(nuevoEstadoWompi)) {
                    String sqlRechazar = "UPDATE pedidos SET estado = 'cancelled', estado_pago = ?, wompi_transaccion_id = ?, actualizado_en = NOW() WHERE id = ?";
                    try (PreparedStatement pst = con.prepareStatement(sqlRechazar)) {
                        pst.setString(1, nuevoEstadoWompi);
                        pst.setString(2, tx.id());
                        pst.setInt(3, idPedido);
                        pst.executeUpdate();
                    }
                    registrarEvento(con, tx.referencia(), tx.id(), nuevoEstadoWompi, "webhook", "PAGO_RECHAZADO", payloadRaw);
                    System.out.println("[WOMPI] [RECHAZADO] Pedido #" + idPedido + " marcado como " + nuevoEstadoWompi);
                } else {
                    // PENDING u otro estado intermedio
                    registrarEvento(con, tx.referencia(), tx.id(), nuevoEstadoWompi, "webhook", "ESTADO_PENDIENTE", payloadRaw);
                }

                con.commit();
                return true;

            } catch (SQLException e) {
                con.rollback();
                System.err.println("[WOMPI] Error procesando transacción de webhook: " + e.getMessage());
                e.printStackTrace();
                return false;
            }
        } catch (SQLException e) {
            System.err.println("[WOMPI] Error de conexión en webhook: " + e.getMessage());
            return false;
        }
    }

    /**
     * Consulta el estado actual de un pedido por su referencia de pago de Wompi o ID de transacción.
     */
    public Map<String, Object> consultarPedidoPorReferencia(String referencia) {
        String sql = "SELECT p.*, " +
                "COALESCE(json_agg(json_build_object(" +
                "  'id', pr.id, " +
                "  'name', pr.nombre, " +
                "  'quantity', ip.cantidad, " +
                "  'price', ip.precio_por_metro, " +
                "  'subtotal', ip.subtotal, " +
                "  'images', ARRAY(SELECT ipr.url_imagen FROM imagenes_producto ipr WHERE ipr.producto_id = pr.id ORDER BY ipr.orden_visualizacion ASC LIMIT 1)" +
                ") FILTER (WHERE pr.id IS NOT NULL), '[]'::json) as articulos " +
                "FROM pedidos p " +
                "LEFT JOIN items_pedido ip ON p.id = ip.pedido_id " +
                "LEFT JOIN productos pr ON ip.producto_id = pr.id " +
                "WHERE p.referencia_pago = ? OR p.wompi_transaccion_id = ? " +
                "GROUP BY p.id";

        try (Connection con = Conexion.obtenerConexion();
             PreparedStatement pst = con.prepareStatement(sql)) {
            pst.setString(1, referencia);
            pst.setString(2, referencia);
            try (ResultSet rs = pst.executeQuery()) {
                if (rs.next()) {
                    Map<String, Object> res = new HashMap<>();
                    res.put("id", rs.getInt("id"));
                    res.put("orderNumber", rs.getString("referencia_pago"));
                    res.put("reference", rs.getString("referencia_pago"));
                    res.put("status", rs.getString("estado"));
                    res.put("paymentStatus", rs.getString("estado_pago"));
                    res.put("paymentMethod", rs.getString("metodo_pago"));
                    res.put("wompiTransactionId", rs.getString("wompi_transaccion_id"));
                    res.put("total", rs.getDouble("monto_total"));
                    res.put("subtotal", rs.getDouble("subtotal"));
                    res.put("shipping", rs.getDouble("costo_envio"));
                    res.put("tax", rs.getDouble("monto_impuesto"));
                    res.put("discount", rs.getDouble("monto_descuento"));
                    res.put("date", rs.getTimestamp("creado_en") != null ? rs.getTimestamp("creado_en").toString() : null);

                    Map<String, Object> customer = new HashMap<>();
                    customer.put("fullName", rs.getString("nombre_cliente"));
                    customer.put("email", rs.getString("correo_cliente"));
                    customer.put("phone", rs.getString("telefono_cliente"));
                    customer.put("address", rs.getString("direccion_envio"));
                    customer.put("city", rs.getString("ciudad_envio"));
                    customer.put("state", rs.getString("departamento_envio"));
                    customer.put("notes", rs.getString("notas"));
                    res.put("customerInfo", customer);

                    String articulosJson = rs.getString("articulos");
                    res.put("itemsRaw", articulosJson);

                    return res;
                }
            }
        } catch (SQLException e) {
            System.err.println("[WOMPI] Error consultando pedido por referencia: " + e.getMessage());
        }
        return null;
    }

    private void registrarEvento(Connection con, String referencia, String transaccionId, String estado, String origen, String resultado, String cargaUtil) {
        String sql = "INSERT INTO eventos_pago_wompi (referencia_pago, transaccion_id, estado, origen, resultado, carga_util) VALUES (?, ?, ?, ?, ?, ?)";
        java.sql.Savepoint sp = null;
        try {
            if (!con.getAutoCommit()) {
                sp = con.setSavepoint();
            }
            try (PreparedStatement pst = con.prepareStatement(sql)) {
                pst.setString(1, truncar(referencia, 64));
                pst.setString(2, truncar(transaccionId, 100));
                pst.setString(3, truncar(estado, 30));
                pst.setString(4, truncar(origen, 30));
                pst.setString(5, truncar(resultado, 60));
                pst.setString(6, cargaUtil);
                pst.executeUpdate();
            }
        } catch (SQLException e) {
            if (sp != null) {
                try { con.rollback(sp); } catch (SQLException ignored) {}
            }
            System.err.println("[WOMPI] Error registrando bitácora de evento (resguardado): " + e.getMessage());
        }
    }

    private static String truncar(String valor, int maxLongitud) {
        if (valor == null) return null;
        return valor.length() > maxLongitud ? valor.substring(0, maxLongitud) : valor;
    }

    private static class ItemCalculado {
        int idProducto;
        String nombre;
        double metros;
        double precioUnitario;
        double subtotal;

        ItemCalculado(int idProducto, String nombre, double metros, double precioUnitario, double subtotal) {
            this.idProducto = idProducto;
            this.nombre = nombre;
            this.metros = metros;
            this.precioUnitario = precioUnitario;
            this.subtotal = subtotal;
        }
    }
}
