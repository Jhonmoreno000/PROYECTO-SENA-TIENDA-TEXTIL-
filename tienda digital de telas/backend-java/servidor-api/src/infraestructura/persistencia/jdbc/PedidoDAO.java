package infraestructura.persistencia.jdbc;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import dominio.modelos.Pedido;
import infraestructura.configuracion.Conexion;

/**
 * Objeto de acceso a datos (DAO) para la entidad `Pedido`.
 * Gestiona las consultas, creación transaccional con bloqueo pesimista, facturación
 * y actualizaciones de estado sobre las tablas `pedidos` e `items_pedido` en PostgreSQL.
 */
public class PedidoDAO {

    /**
     * Recupera todos los pedidos del sistema con sus ítems, cliente y desglose financiero.
     *
     * @return Lista de objetos `Pedido` ordenados por identificador ascendente.
     */
    public List<Pedido> obtenerTodosLosPedidos() {
        Map<Integer, Pedido> mapaPedidos = new LinkedHashMap<>();

        String consulta = "SELECT o.*, " +
                "oi.id AS item_id, oi.producto_id, oi.cantidad, oi.precio_por_metro, oi.subtotal AS item_subtotal, " +
                "p.nombre AS nombre_producto, " +
                "(SELECT ip.url_imagen FROM imagenes_producto ip WHERE ip.producto_id = p.id ORDER BY ip.orden_visualizacion ASC LIMIT 1) AS url_imagen " +
                "FROM pedidos o " +
                "LEFT JOIN items_pedido oi ON o.id = oi.pedido_id " +
                "LEFT JOIN productos p ON oi.producto_id = p.id " +
                "ORDER BY o.id ASC, oi.id ASC";

        try (Connection con = Conexion.obtenerConexion();
             PreparedStatement pst = con.prepareStatement(consulta);
             ResultSet rs = pst.executeQuery()) {

            while (rs.next()) {
                int idPedido = rs.getInt("id");
                Pedido pedido = mapaPedidos.get(idPedido);
                if (pedido == null) {
                    pedido = mapearCabeceraPedido(rs);
                    mapaPedidos.put(idPedido, pedido);
                }
                agregarLineaDesdeResultSet(rs, pedido);
            }

        } catch (SQLException e) {
            System.err.println("[ERROR] Error obteniendo pedidos: " + e.getMessage());
            e.printStackTrace();
        }

        return new ArrayList<>(mapaPedidos.values());
    }

    /**
     * Crea un nuevo pedido con sus artículos usando valores por defecto para los metadatos de envío.
     *
     * @param idCliente Identificador del cliente comprador (`int`).
     * @param total     Monto total del pedido (`double`).
     * @param articulos Lista de mapas con los artículos solicitados (`List<Map<String, Object>>`).
     * @return Identificador del pedido creado o `-1` en caso de error.
     */
    public int crearPedido(int idCliente, double total, List<Map<String, Object>> articulos) {
        return crearPedido(idCliente, total, articulos, null, null, null, null, null, null, null);
    }

    /**
     * Crea un nuevo pedido con datos explícitos del comprador y dirección de entrega.
     *
     * @param idCliente         Identificador del cliente (`int`).
     * @param total             Monto total del pedido (`double`).
     * @param articulos         Lista de artículos (`List<Map<String, Object>>`).
     * @param nombreCliente     Nombre completo del comprador (`String`).
     * @param correoCliente     Correo electrónico del comprador (`String`).
     * @param telefonoCliente   Teléfono del comprador (`String`).
     * @param direccionEnvio    Dirección física de entrega (`String`).
     * @param ciudadEnvio       Ciudad de entrega (`String`).
     * @param departamentoEnvio Departamento de entrega (`String`).
     * @return Identificador del pedido creado o `-1` en caso de error.
     */
    public int crearPedido(int idCliente, double total, List<Map<String, Object>> articulos,
                           String nombreCliente, String correoCliente, String telefonoCliente,
                           String direccionEnvio, String ciudadEnvio, String departamentoEnvio) {
        return crearPedido(idCliente, total, articulos, nombreCliente, correoCliente, telefonoCliente,
                           direccionEnvio, ciudadEnvio, departamentoEnvio, null);
    }

    /**
     * Crea un nuevo pedido con datos del comprador, dirección de entrega y documento de identidad.
     *
     * @param idCliente         Identificador del cliente (`int`).
     * @param total             Monto total del pedido (`double`).
     * @param articulos         Lista de artículos (`List<Map<String, Object>>`).
     * @param nombreCliente     Nombre completo del comprador (`String`).
     * @param correoCliente     Correo electrónico del comprador (`String`).
     * @param telefonoCliente   Teléfono del comprador (`String`).
     * @param direccionEnvio    Dirección física de entrega (`String`).
     * @param ciudadEnvio       Ciudad de entrega (`String`).
     * @param departamentoEnvio Departamento de entrega (`String`).
     * @param documentoCliente  Documento tributario o cédula (`String`).
     * @return Identificador del pedido creado o `-1` en caso de error.
     */
    public int crearPedido(int idCliente, double total, List<Map<String, Object>> articulos,
                           String nombreCliente, String correoCliente, String telefonoCliente,
                           String direccionEnvio, String ciudadEnvio, String departamentoEnvio,
                           String documentoCliente) {
        Map<String, Object> metadatos = new HashMap<>();
        if (nombreCliente != null) metadatos.put("nombreCliente", nombreCliente);
        if (correoCliente != null) metadatos.put("correoCliente", correoCliente);
        if (telefonoCliente != null) metadatos.put("telefonoCliente", telefonoCliente);
        if (direccionEnvio != null) metadatos.put("direccionEnvio", direccionEnvio);
        if (ciudadEnvio != null) metadatos.put("ciudadEnvio", ciudadEnvio);
        if (departamentoEnvio != null) metadatos.put("departamentoEnvio", departamentoEnvio);
        if (documentoCliente != null) metadatos.put("documentoCliente", documentoCliente);
        return crearPedidoConMetadatos(idCliente, total, articulos, metadatos);
    }

    /**
     * Crea un nuevo pedido de forma transaccional (ACID) con bloqueo pesimista `FOR UPDATE`
     * sobre el inventario y soporte completo de metadatos financieros y de envío.
     *
     * @param idCliente Identificador del cliente comprador (`int`).
     * @param total     Monto total del pedido (`double`).
     * @param articulos Lista de artículos solicitados (`List<Map<String, Object>>`).
     * @param metadatos Mapa opcional con datos de envío, pago, cupón e impuestos (`Map<String, Object>`).
     * @return Identificador del pedido creado o `-1` si ocurre un error o falta de stock.
     */
    public int crearPedidoConMetadatos(int idCliente, double total, List<Map<String, Object>> articulos, Map<String, Object> metadatos) {
        int idPedido = -1;
        Map<String, Object> meta = metadatos != null ? metadatos : new HashMap<>();

        String nombreCliente = comoTexto(meta.getOrDefault("nombreCliente", meta.get("clientName")));
        String correoCliente = comoTexto(meta.getOrDefault("correoCliente", meta.get("clientEmail")));
        String telefonoCliente = comoTexto(meta.getOrDefault("telefonoCliente", meta.get("clientPhone")));
        String direccionEnvio = comoTexto(meta.getOrDefault("direccionEnvio", meta.get("shippingAddress")));
        String ciudadEnvio = comoTexto(meta.getOrDefault("ciudadEnvio", meta.get("shippingCity")));
        String departamentoEnvio = comoTexto(meta.getOrDefault("departamentoEnvio", meta.get("shippingDepartment")));
        String documentoCliente = comoTexto(meta.getOrDefault("documentoCliente", meta.get("document")));
        String metodoPago = comoTexto(meta.getOrDefault("metodoPago", meta.get("paymentMethod")));
        String estadoPago = comoTexto(meta.getOrDefault("estadoPago", meta.get("paymentStatus")));
        String codigoCupon = comoTexto(meta.getOrDefault("codigoCupon", meta.get("couponCode")));
        String notas = comoTexto(meta.getOrDefault("notas", meta.get("notes")));

        double subtotal = comoDouble(meta.get("subtotal"), total);
        double costoEnvio = comoDouble(meta.getOrDefault("costoEnvio", meta.get("shippingCost")), 0.0);
        double montoImpuesto = comoDouble(meta.getOrDefault("impuestos", meta.get("tax")), 0.0);
        double montoDescuento = comoDouble(meta.getOrDefault("descuento", meta.get("discount")), 0.0);

        try (Connection con = Conexion.obtenerConexion()) {
            con.setAutoCommit(false);
            try {
                if (idCliente > 0 && (nombreCliente == null || nombreCliente.isBlank()
                        || correoCliente == null || correoCliente.isBlank()
                        || telefonoCliente == null || telefonoCliente.isBlank())) {
                    String sqlUsuario = "SELECT nombre, correo, telefono FROM usuarios WHERE id = ?";
                    try (PreparedStatement pstU = con.prepareStatement(sqlUsuario)) {
                        pstU.setInt(1, idCliente);
                        try (ResultSet rsU = pstU.executeQuery()) {
                            if (rsU.next()) {
                                if (nombreCliente == null || nombreCliente.isBlank()) nombreCliente = rsU.getString("nombre");
                                if (correoCliente == null || correoCliente.isBlank()) correoCliente = rsU.getString("correo");
                                if (telefonoCliente == null || telefonoCliente.isBlank()) telefonoCliente = rsU.getString("telefono");
                            }
                        }
                    }
                }

                if (idCliente > 0 && (direccionEnvio == null || direccionEnvio.isBlank())) {
                    String sqlDir = "SELECT direccion, ciudad, departamento FROM direcciones_usuario WHERE usuario_id = ? ORDER BY es_predeterminada DESC, id ASC LIMIT 1";
                    try (PreparedStatement pstD = con.prepareStatement(sqlDir)) {
                        pstD.setInt(1, idCliente);
                        try (ResultSet rsD = pstD.executeQuery()) {
                            if (rsD.next()) {
                                direccionEnvio = rsD.getString("direccion");
                                if (ciudadEnvio == null || ciudadEnvio.isBlank()) ciudadEnvio = rsD.getString("ciudad");
                                if (departamentoEnvio == null || departamentoEnvio.isBlank()) departamentoEnvio = rsD.getString("departamento");
                            }
                        }
                    } catch (SQLException ignored) {}
                }

                if (nombreCliente == null || nombreCliente.isBlank()) nombreCliente = "Usuario #" + idCliente;
                if (correoCliente == null || correoCliente.isBlank()) correoCliente = "usuario" + idCliente + "@ddtextil.local";
                if (telefonoCliente == null || telefonoCliente.isBlank()) telefonoCliente = "N/A";
                if (direccionEnvio == null || direccionEnvio.isBlank()) direccionEnvio = "N/A";
                if (ciudadEnvio == null || ciudadEnvio.isBlank()) ciudadEnvio = "N/A";
                if (departamentoEnvio == null || departamentoEnvio.isBlank()) departamentoEnvio = "N/A";
                if (documentoCliente == null || documentoCliente.isBlank()) documentoCliente = "N/A";
                if (metodoPago == null || metodoPago.isBlank()) metodoPago = "wompi";
                if (estadoPago == null || estadoPago.isBlank()) estadoPago = "pending";

                int idVendedor = 1;
                if (articulos != null && !articulos.isEmpty()) {
                    Object objVendedor = articulos.get(0).getOrDefault("sellerId", articulos.get(0).get("idVendedor"));
                    if (objVendedor instanceof Number) {
                        idVendedor = ((Number) objVendedor).intValue();
                    }
                }

                String sqlPedido = "INSERT INTO pedidos (" +
                        "usuario_id, vendedor_id, monto_total, subtotal, costo_envio, monto_impuesto, monto_descuento, " +
                        "codigo_cupon, metodo_pago, estado_pago, notas, " +
                        "nombre_cliente, correo_cliente, telefono_cliente, " +
                        "direccion_envio, ciudad_envio, departamento_envio, documento_cliente, " +
                        "estado, creado_en, actualizado_en) " +
                        "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW(), NOW())";

                try (PreparedStatement pst = con.prepareStatement(sqlPedido, Statement.RETURN_GENERATED_KEYS)) {
                    pst.setInt(1, idCliente);
                    pst.setInt(2, idVendedor);
                    pst.setDouble(3, total);
                    pst.setDouble(4, subtotal);
                    pst.setDouble(5, costoEnvio);
                    pst.setDouble(6, montoImpuesto);
                    pst.setDouble(7, montoDescuento);
                    pst.setString(8, codigoCupon);
                    pst.setString(9, metodoPago);
                    pst.setString(10, estadoPago);
                    pst.setString(11, notas);
                    pst.setString(12, nombreCliente);
                    pst.setString(13, correoCliente);
                    pst.setString(14, telefonoCliente);
                    pst.setString(15, direccionEnvio);
                    pst.setString(16, ciudadEnvio);
                    pst.setString(17, departamentoEnvio);
                    pst.setString(18, documentoCliente);
                    pst.executeUpdate();

                    try (ResultSet rs = pst.getGeneratedKeys()) {
                        if (rs.next()) idPedido = rs.getInt(1);
                    }
                }

                if (idPedido > 0 && articulos != null && !articulos.isEmpty()) {
                    List<Map<String, Object>> articulosOrdenados = new ArrayList<>(articulos);
                    articulosOrdenados.sort(Comparator.comparingInt(art -> {
                        Object objProd = art.getOrDefault("productId", art.getOrDefault("idProducto", art.get("id")));
                        if (objProd instanceof Number) return ((Number) objProd).intValue();
                        try {
                            return Integer.parseInt(String.valueOf(objProd));
                        } catch (Exception e) {
                            return 0;
                        }
                    }));

                    String sqlBloqueoPesimista = "SELECT id, stock, nombre, precio, vendedor_id FROM productos WHERE id = ? FOR UPDATE";
                    String sqlActualizarStock = "UPDATE productos SET stock = stock - ?, actualizado_en = NOW() WHERE id = ?";
                    String sqlArticulo = "INSERT INTO items_pedido (pedido_id, producto_id, cantidad, precio_por_metro, subtotal) VALUES (?, ?, ?, ?, ?)";

                    try (PreparedStatement pstBloqueo = con.prepareStatement(sqlBloqueoPesimista);
                         PreparedStatement pstActualizarStock = con.prepareStatement(sqlActualizarStock);
                         PreparedStatement pstItem = con.prepareStatement(sqlArticulo)) {

                        for (Map<String, Object> articulo : articulosOrdenados) {
                            Object objProd = articulo.getOrDefault("productId", articulo.getOrDefault("idProducto", articulo.get("id")));
                            Object objCant = articulo.getOrDefault("quantity", articulo.getOrDefault("cantidad", articulo.get("meters")));
                            Object objPrecio = articulo.getOrDefault("unitPrice", articulo.getOrDefault("precioUnitario", articulo.get("price")));

                            int idProd = (objProd instanceof Number) ? ((Number) objProd).intValue() : Integer.parseInt(String.valueOf(objProd));
                            double cant = (objCant instanceof Number) ? ((Number) objCant).doubleValue() : Double.parseDouble(String.valueOf(objCant));
                            double precio = -1.0;
                            if (objPrecio != null) {
                                precio = (objPrecio instanceof Number) ? ((Number) objPrecio).doubleValue() : Double.parseDouble(String.valueOf(objPrecio));
                            }

                            pstBloqueo.setInt(1, idProd);
                            try (ResultSet rsBloqueo = pstBloqueo.executeQuery()) {
                                if (!rsBloqueo.next()) {
                                    throw new SQLException("El producto con ID " + idProd + " no existe en el catálogo.");
                                }
                                double stockDisponible = rsBloqueo.getDouble("stock");
                                String nombreTela = rsBloqueo.getString("nombre");
                                if (precio < 0) {
                                    precio = rsBloqueo.getDouble("precio");
                                }

                                if (stockDisponible < cant) {
                                    throw new SQLException("Inventario insuficiente para la tela '" + nombreTela + "'. Metraje disponible: "
                                            + stockDisponible + " m, metraje solicitado: " + cant + " m.");
                                }
                            }

                            pstActualizarStock.setDouble(1, cant);
                            pstActualizarStock.setInt(2, idProd);
                            pstActualizarStock.executeUpdate();

                            pstItem.setInt(1, idPedido);
                            pstItem.setInt(2, idProd);
                            pstItem.setDouble(3, cant);
                            pstItem.setDouble(4, precio);
                            pstItem.setDouble(5, Math.round((cant * precio) * 100.0) / 100.0);
                            pstItem.addBatch();
                        }
                        pstItem.executeBatch();
                    }
                }

                registrarMetricasPedido(con, idPedido, total);
                con.commit();
            } catch (Exception excepcion) {
                try {
                    con.rollback();
                } catch (SQLException exRollback) {
                    System.err.println("[ERROR] Error revirtiendo transacción: " + exRollback.getMessage());
                }
                System.err.println("[ERROR] Error creando pedido. Transacción revertida: " + excepcion.getMessage());
                return -1;
            }
        } catch (SQLException e) {
            System.err.println("[ERROR] Error de conexión al crear pedido: " + e.getMessage());
            e.printStackTrace();
        }
        return idPedido;
    }

    /**
     * Obtiene un pedido específico por su identificador único con el detalle de sus ítems.
     *
     * @param idPedido Identificador numérico del pedido (`int`).
     * @return Instancia de `Pedido` o `null` si no existe.
     */
    public Pedido obtenerPedidoPorId(int idPedido) {
        String consulta = "SELECT o.*, " +
                "oi.id AS item_id, oi.producto_id, oi.cantidad, oi.precio_por_metro, oi.subtotal AS item_subtotal, " +
                "p.nombre AS nombre_producto, " +
                "(SELECT ip.url_imagen FROM imagenes_producto ip WHERE ip.producto_id = p.id ORDER BY ip.orden_visualizacion ASC LIMIT 1) AS url_imagen " +
                "FROM pedidos o " +
                "LEFT JOIN items_pedido oi ON o.id = oi.pedido_id " +
                "LEFT JOIN productos p ON oi.producto_id = p.id " +
                "WHERE o.id = ? " +
                "ORDER BY oi.id ASC";
        Pedido pedido = null;
        try (Connection con = Conexion.obtenerConexion();
             PreparedStatement pst = con.prepareStatement(consulta)) {
            pst.setInt(1, idPedido);
            try (ResultSet rs = pst.executeQuery()) {
                while (rs.next()) {
                    if (pedido == null) {
                        pedido = mapearCabeceraPedido(rs);
                    }
                    agregarLineaDesdeResultSet(rs, pedido);
                }
            }
        } catch (SQLException e) {
            System.err.println("[ERROR] Error obteniendo pedido: " + e.getMessage());
        }
        return pedido;
    }

    /**
     * Actualiza el estado logístico de un pedido en PostgreSQL.
     *
     * @param idPedido Identificador del pedido (`int`).
     * @param estado   Nuevo estado del pedido (`String`).
     * @return `true` si el pedido fue actualizado; `false` en caso contrario.
     */
    public boolean actualizarEstadoPedido(int idPedido, String estado) {
        return actualizarPedido(idPedido, estado, null, null);
    }

    /**
     * Actualiza el estado, número de guía transportadora y notas de un pedido.
     *
     * @param idPedido   Identificador del pedido (`int`).
     * @param estado     Nuevo estado del pedido (`String`).
     * @param numeroGuia Número de guía de despacho opcional (`String`).
     * @param notas      Notas u observaciones actualizadas (`String`).
     * @return `true` si se actualizó el registro; `false` en caso contrario.
     */
    public boolean actualizarPedido(int idPedido, String estado, String numeroGuia, String notas) {
        String consulta = "UPDATE pedidos SET " +
                "estado = COALESCE(?, estado), " +
                "numero_guia = COALESCE(?, numero_guia), " +
                "notas = COALESCE(?, notas), " +
                "actualizado_en = NOW() " +
                "WHERE id = ?";
        try (Connection con = Conexion.obtenerConexion();
             PreparedStatement pst = con.prepareStatement(consulta)) {
            pst.setString(1, estado);
            pst.setString(2, numeroGuia);
            pst.setString(3, notas);
            pst.setInt(4, idPedido);
            int filasAfectadas = pst.executeUpdate();
            return filasAfectadas > 0;
        } catch (SQLException e) {
            System.err.println("[ERROR] Error actualizando estado de pedido: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }

    /**
     * Lista el resumen de facturas disponibles a partir de los pedidos registrados en PostgreSQL.
     *
     * @return Lista de mapas con los datos resumidos de cada factura (`List<Map<String, Object>>`).
     */
    public List<Map<String, Object>> obtenerResumenFacturas() {
        List<Map<String, Object>> facturas = new ArrayList<>();
        String consulta = "SELECT p.id, p.usuario_id, p.monto_total, p.estado, p.creado_en, " +
                "p.nombre_cliente, p.correo_cliente " +
                "FROM pedidos p ORDER BY p.id DESC";
        try (Connection con = Conexion.obtenerConexion();
             PreparedStatement pst = con.prepareStatement(consulta);
             ResultSet rs = pst.executeQuery()) {
            while (rs.next()) {
                Map<String, Object> fac = new HashMap<>();
                fac.put("orderId", rs.getInt("id"));
                fac.put("clientId", rs.getInt("usuario_id"));
                fac.put("clientName", rs.getString("nombre_cliente"));
                fac.put("clientEmail", rs.getString("correo_cliente"));
                fac.put("total", rs.getDouble("monto_total"));
                fac.put("status", rs.getString("estado"));
                fac.put("date", rs.getTimestamp("creado_en") != null ? rs.getTimestamp("creado_en").toString() : "");
                facturas.add(fac);
            }
        } catch (SQLException e) {
            System.err.println("[ERROR] Error listando facturas: " + e.getMessage());
        }
        return facturas;
    }

    /**
     * Obtiene los datos de cabecera y totales de un pedido para la generación de su factura PDF.
     *
     * @param idPedido Identificador del pedido (`int`).
     * @return Mapa con los datos del comprador y desglose tributario o `null` si no existe.
     */
    public Map<String, Object> obtenerCabeceraFactura(int idPedido) {
        String consulta = "SELECT nombre_cliente, correo_cliente, telefono_cliente, direccion_envio, metodo_pago, " +
                "subtotal, monto_descuento, costo_envio, monto_impuesto, documento_cliente " +
                "FROM pedidos WHERE id = ?";
        try (Connection con = Conexion.obtenerConexion();
             PreparedStatement pst = con.prepareStatement(consulta)) {
            pst.setInt(1, idPedido);
            try (ResultSet rs = pst.executeQuery()) {
                if (rs.next()) {
                    Map<String, Object> datos = new HashMap<>();
                    datos.put("nombreCliente", rs.getString("nombre_cliente"));
                    datos.put("correoCliente", rs.getString("correo_cliente"));
                    datos.put("telefonoCliente", rs.getString("telefono_cliente"));
                    datos.put("direccionEnvio", rs.getString("direccion_envio"));
                    datos.put("metodoPago", rs.getString("metodo_pago"));
                    datos.put("subtotal", rs.getDouble("subtotal"));
                    datos.put("descuento", rs.getDouble("monto_descuento"));
                    datos.put("envio", rs.getDouble("costo_envio"));
                    datos.put("impuesto", rs.getDouble("monto_impuesto"));
                    try {
                        datos.put("documentoCliente", rs.getString("documento_cliente"));
                    } catch (SQLException ignored) {}
                    return datos;
                }
            }
        } catch (SQLException e) {
            System.err.println("[ERROR] Error obteniendo cabecera de factura: " + e.getMessage());
        }
        return null;
    }

    /**
     * Obtiene las líneas de detalle de un pedido para construir la tabla de la factura PDF.
     *
     * @param idPedido Identificador del pedido (`int`).
     * @return Lista de mapas con los artículos facturados (`List<Map<String, Object>>`).
     */
    public List<Map<String, Object>> obtenerArticulosFactura(int idPedido) {
        List<Map<String, Object>> articulos = new ArrayList<>();
        String consulta = "SELECT ip.producto_id, ip.cantidad, ip.precio_por_metro, ip.subtotal, pr.nombre " +
                "FROM items_pedido ip " +
                "LEFT JOIN productos pr ON ip.producto_id = pr.id " +
                "WHERE ip.pedido_id = ? ORDER BY ip.id ASC";
        try (Connection con = Conexion.obtenerConexion();
             PreparedStatement pst = con.prepareStatement(consulta)) {
            pst.setInt(1, idPedido);
            try (ResultSet rs = pst.executeQuery()) {
                while (rs.next()) {
                    Map<String, Object> item = new HashMap<>();
                    item.put("productId", rs.getInt("producto_id"));
                    item.put("quantity", rs.getDouble("cantidad"));
                    item.put("unitPrice", rs.getDouble("precio_por_metro"));
                    item.put("name", rs.getString("nombre") != null ? rs.getString("nombre") : "Tela Textil");
                    articulos.add(item);
                }
            }
        } catch (SQLException e) {
            System.err.println("[ERROR] Error obteniendo artículos de factura: " + e.getMessage());
        }
        return articulos;
    }

    /**
     * Construye el objeto `Pedido` con todos los campos de cabecera desde una fila del `ResultSet`.
     *
     * @param rs Conjunto de resultados posicionado en la fila actual (`ResultSet`).
     * @return Objeto `Pedido` inicializado.
     * @throws SQLException Si ocurre un error leyendo las columnas.
     */
    private Pedido mapearCabeceraPedido(ResultSet rs) throws SQLException {
        Pedido pedido = new Pedido();
        pedido.setId(rs.getInt("id"));
        pedido.setIdCliente(rs.getInt("usuario_id"));
        pedido.setIdVendedor(rs.getInt("vendedor_id"));
        pedido.setNombreCliente(rs.getString("nombre_cliente"));
        pedido.setCorreoCliente(rs.getString("correo_cliente"));
        pedido.setTelefonoCliente(rs.getString("telefono_cliente"));
        pedido.setTotal(rs.getDouble("monto_total"));
        pedido.setSubtotal(rs.getDouble("subtotal"));
        pedido.setCostoEnvio(rs.getDouble("costo_envio"));
        pedido.setImpuestos(rs.getDouble("monto_impuesto"));
        pedido.setDescuento(rs.getDouble("monto_descuento"));
        pedido.setCodigoCupon(rs.getString("codigo_cupon"));
        pedido.setEstado(rs.getString("estado"));
        pedido.setMetodoPago(rs.getString("metodo_pago"));
        pedido.setEstadoPago(rs.getString("estado_pago"));
        pedido.setDireccionEnvio(rs.getString("direccion_envio"));
        pedido.setCiudadEnvio(rs.getString("ciudad_envio"));
        pedido.setDepartamentoEnvio(rs.getString("departamento_envio"));
        pedido.setNumeroGuia(rs.getString("numero_guia"));
        pedido.setNotas(rs.getString("notas"));
        if (rs.getTimestamp("creado_en") != null) {
            pedido.setFecha(rs.getTimestamp("creado_en").toString().split(" ")[0]);
        }
        pedido.setCantidadArticulos(0);
        pedido.setTotalMeters(0.0);
        return pedido;
    }

    /**
     * Agrega una línea de artículo al objeto `Pedido` a partir de la fila actual del `ResultSet`.
     *
     * @param rs     Conjunto de resultados posicionado (`ResultSet`).
     * @param pedido Instancia de `Pedido` a enriquecer (`Pedido`).
     * @throws SQLException Si ocurre un error leyendo las columnas del ítem.
     */
    private void agregarLineaDesdeResultSet(ResultSet rs, Pedido pedido) throws SQLException {
        int idProducto = rs.getInt("producto_id");
        if (rs.wasNull()) {
            return;
        }
        double cantidadMetros = rs.getDouble("cantidad");
        int cantidadEntera = rs.getInt("cantidad");
        double precioUnitario = rs.getDouble("precio_por_metro");
        double subtotalItem = rs.getDouble("item_subtotal");
        String nombreProducto = rs.getString("nombre_producto");
        String urlImagen = rs.getString("url_imagen");

        pedido.agregarIdProducto(idProducto);
        pedido.setCantidadArticulos(pedido.getCantidadArticulos() + (cantidadEntera > 0 ? cantidadEntera : (cantidadMetros > 0 ? 1 : 0)));
        pedido.setTotalMeters(Math.round((pedido.getTotalMeters() + cantidadMetros) * 100.0) / 100.0);

        if (nombreProducto != null && !pedido.getProductNames().contains(nombreProducto)) {
            pedido.getProductNames().add(nombreProducto);
        }

        Map<String, Object> linea = new HashMap<>();
        linea.put("id", rs.getInt("item_id"));
        linea.put("productId", idProducto);
        linea.put("name", nombreProducto != null ? nombreProducto : ("Producto #" + idProducto));
        linea.put("quantity", cantidadMetros);
        linea.put("meters", cantidadMetros);
        linea.put("unitPrice", precioUnitario);
        linea.put("price", precioUnitario);
        linea.put("subtotal", subtotalItem > 0 ? subtotalItem : Math.round((cantidadMetros * precioUnitario) * 100.0) / 100.0);
        if (urlImagen != null) {
            linea.put("image", urlImagen);
        }
        pedido.getLineItems().add(linea);
    }

    /**
     * Registra el impacto del nuevo pedido en las tablas `ventas_diarias` y `actividad_reciente`.
     *
     * @param con      Conexión JDBC transaccional activa (`Connection`).
     * @param idPedido Identificador del pedido creado (`int`).
     * @param total    Monto total del pedido (`double`).
     */
    private void registrarMetricasPedido(Connection con, int idPedido, double total) {
        java.sql.Savepoint sp = null;
        try {
            if (!con.getAutoCommit()) {
                sp = con.setSavepoint();
            }
            String sqlVd = "INSERT INTO ventas_diarias (fecha_venta, ventas_totales, pedidos_totales) " +
                    "VALUES (CURRENT_DATE, ?, 1) " +
                    "ON CONFLICT (fecha_venta) DO UPDATE SET " +
                    "ventas_totales = ventas_diarias.ventas_totales + EXCLUDED.ventas_totales, " +
                    "pedidos_totales = ventas_diarias.pedidos_totales + 1";
            try (PreparedStatement pstVd = con.prepareStatement(sqlVd)) {
                pstVd.setDouble(1, total);
                pstVd.executeUpdate();
            }

            String sqlAct = "INSERT INTO actividad_reciente (tipo, nombre_usuario, accion) VALUES ('venta', 'Sistema', ?)";
            try (PreparedStatement pstAct = con.prepareStatement(sqlAct)) {
                pstAct.setString(1, "Nuevo pedido registrado #" + idPedido + " por $" + Math.round(total));
                pstAct.executeUpdate();
            }
        } catch (SQLException e) {
            if (sp != null) {
                try { con.rollback(sp); } catch (SQLException ignored) {}
            }
        }
    }

    /**
     * Convierte un objeto genérico a cadena de texto recortada o `null`.
     *
     * @param valor Objeto a evaluar (`Object`).
     * @return Cadena limpia o `null`.
     */
    private String comoTexto(Object valor) {
        if (valor == null) return null;
        String texto = String.valueOf(valor).trim();
        return texto.isEmpty() ? null : texto;
    }

    /**
     * Convierte un objeto genérico a valor numérico `double` con respaldo por defecto.
     *
     * @param valor      Objeto a convertir (`Object`).
     * @param porDefecto Valor de respaldo (`double`).
     * @return Valor numérico resultante (`double`).
     */
    private double comoDouble(Object valor, double porDefecto) {
        if (valor == null) return porDefecto;
        if (valor instanceof Number) return ((Number) valor).doubleValue();
        try {
            return Double.parseDouble(String.valueOf(valor).trim());
        } catch (NumberFormatException e) {
            return porDefecto;
        }
    }
}
