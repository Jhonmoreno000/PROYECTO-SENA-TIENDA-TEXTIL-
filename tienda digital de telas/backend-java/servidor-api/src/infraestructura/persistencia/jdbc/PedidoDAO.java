package infraestructura.persistencia.jdbc;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import infraestructura.configuracion.Conexion;
import dominio.modelos.Pedido;

/**
 * DAO para la entidad Pedido.
 * Gestiona las consultas y actualizaciones sobre las tablas 'pedidos' e 'items_pedido'.
 */
public class PedidoDAO {

    /**
     * Recupera todos los pedidos del sistema con sus ítems asociados.
     * @return Lista de objetos Pedido.
     */
    public List<Pedido> obtenerTodosLosPedidos() {
        Map<Integer, Pedido> mapaPedidos = new LinkedHashMap<>();

        String consulta = "SELECT o.id, o.usuario_id, o.vendedor_id, o.monto_total, o.estado, o.creado_en, " +
                "oi.producto_id, oi.cantidad " +
                "FROM pedidos o " +
                "LEFT JOIN items_pedido oi ON o.id = oi.pedido_id " +
                "ORDER BY o.id ASC";

        try (Connection con = Conexion.obtenerConexion();
             PreparedStatement pst = con.prepareStatement(consulta);
             ResultSet rs = pst.executeQuery()) {

            while (rs.next()) {
                int idPedido = rs.getInt("id");

                Pedido pedido = mapaPedidos.get(idPedido);
                if (pedido == null) {
                    pedido = new Pedido();
                    pedido.setId(idPedido);
                    pedido.setIdCliente(rs.getInt("usuario_id"));
                    pedido.setIdVendedor(rs.getInt("vendedor_id"));
                    pedido.setTotal(rs.getDouble("monto_total"));
                    pedido.setEstado(rs.getString("estado"));

                    if (rs.getTimestamp("creado_en") != null) {
                        pedido.setFecha(rs.getTimestamp("creado_en").toString().split(" ")[0]);
                    }

                    pedido.setCantidadArticulos(0);
                    mapaPedidos.put(idPedido, pedido);
                }

                int idProducto = rs.getInt("producto_id");
                if (!rs.wasNull()) {
                    pedido.agregarIdProducto(idProducto);
                    pedido.setCantidadArticulos(pedido.getCantidadArticulos() + rs.getInt("cantidad"));
                }
            }

        } catch (SQLException e) {
            System.err.println("[ERROR] Error obteniendo pedidos: " + e.getMessage());
            e.printStackTrace();
        }

        return new ArrayList<>(mapaPedidos.values());
    }

    /**
     * Crea un nuevo pedido con sus artículos.
     * @param idCliente Identificador del cliente.
     * @param total Monto total.
     * @param articulos Lista de mapas con los artículos.
     * @return ID del pedido creado o -1 en caso de error.
     */
    public int crearPedido(int idCliente, double total, List<Map<String, Object>> articulos) {
        int idPedido = -1;
        // Se asumen valores por defecto para nombre, correo, etc. ya que no vienen en la firma antigua.
        String sqlPedido = "INSERT INTO pedidos (usuario_id, vendedor_id, monto_total, nombre_cliente, correo_cliente, direccion_envio, estado, creado_en, actualizado_en) " +
                           "VALUES (?, ?, ?, 'Cliente', 'cliente@tienda.com', 'N/A', 'pending', NOW(), NOW())";

        try (Connection con = Conexion.obtenerConexion()) {
            con.setAutoCommit(false);
            try {
                try (PreparedStatement pst = con.prepareStatement(sqlPedido, Statement.RETURN_GENERATED_KEYS)) {
                    int idVendedor = 1;
                    if (articulos != null && !articulos.isEmpty()) {
                        Object objVendedor = articulos.get(0).get("sellerId");
                        if (objVendedor instanceof Number) idVendedor = ((Number) objVendedor).intValue();
                    }
                    pst.setInt(1, idCliente);
                    pst.setInt(2, idVendedor);
                    pst.setDouble(3, total);
                    pst.executeUpdate();

                    try (ResultSet rs = pst.getGeneratedKeys()) {
                        if (rs.next()) idPedido = rs.getInt(1);
                    }
                }

                if (idPedido > 0 && articulos != null) {
                    // Consultas preparadas para control de concurrencia pesimista y reserva atómica
                    String sqlBloqueoPesimista = "SELECT id, stock, nombre FROM productos WHERE id = ? FOR UPDATE";
                    String sqlActualizarStock = "UPDATE productos SET stock = stock - ?, actualizado_en = NOW() WHERE id = ?";
                    String sqlArticulo = "INSERT INTO items_pedido (pedido_id, producto_id, cantidad, precio_por_metro, subtotal) VALUES (?, ?, ?, ?, ?)";

                    try (PreparedStatement pstBloqueo = con.prepareStatement(sqlBloqueoPesimista);
                         PreparedStatement pstActualizarStock = con.prepareStatement(sqlActualizarStock);
                         PreparedStatement pstItem = con.prepareStatement(sqlArticulo)) {

                        for (Map<String, Object> articulo : articulos) {
                            Object objProd = articulo.getOrDefault("productId", articulo.get("idProducto"));
                            Object objCant = articulo.getOrDefault("quantity", articulo.get("cantidad"));
                            Object objPrecio = articulo.getOrDefault("unitPrice", articulo.get("precioUnitario"));

                            int idProd = (objProd instanceof Number) ? ((Number) objProd).intValue() : Integer.parseInt(String.valueOf(objProd));
                            double cant = (objCant instanceof Number) ? ((Number) objCant).doubleValue() : Double.parseDouble(String.valueOf(objCant));
                            double precio = (objPrecio instanceof Number) ? ((Number) objPrecio).doubleValue() : Double.parseDouble(String.valueOf(objPrecio));

                            // 1. Bloqueo Pesimista (Pessimistic Locking): Bloquea la fila en BD para evitar Race Conditions
                            pstBloqueo.setInt(1, idProd);
                            try (ResultSet rsBloqueo = pstBloqueo.executeQuery()) {
                                if (!rsBloqueo.next()) {
                                    throw new SQLException("El producto con ID " + idProd + " no existe en el catálogo.");
                                }
                                double stockDisponible = rsBloqueo.getDouble("stock");
                                String nombreTela = rsBloqueo.getString("nombre");

                                // Validación estricta de metraje fraccionado
                                if (stockDisponible < cant) {
                                    throw new SQLException("Inventario insuficiente para la tela '" + nombreTela + "'. Metraje disponible: " 
                                            + stockDisponible + " m, metraje solicitado: " + cant + " m.");
                                }
                            }

                            // 2. Descuento atómico del inventario bajo la misma transacción
                            pstActualizarStock.setDouble(1, cant);
                            pstActualizarStock.setInt(2, idProd);
                            pstActualizarStock.executeUpdate();

                            // 3. Registro del ítem asociado al pedido
                            pstItem.setInt(1, idPedido);
                            pstItem.setInt(2, idProd);
                            pstItem.setDouble(3, cant);
                            pstItem.setDouble(4, precio);
                            pstItem.setDouble(5, cant * precio);
                            pstItem.addBatch();
                        }
                        pstItem.executeBatch();
                    }
                }

                con.commit();
            } catch (SQLException excepcion) {
                try {
                    con.rollback();
                } catch (SQLException exRollback) {
                    System.err.println("[ERROR] Error revirtiendo transacción: " + exRollback.getMessage());
                }
                System.err.println("[ERROR] Error creando pedido. Transacción revertida: " + excepcion.getMessage());
                excepcion.printStackTrace();
                return -1;
            }
        } catch (SQLException e) {
            System.err.println("[ERROR] Error de conexión al crear pedido: " + e.getMessage());
            e.printStackTrace();
        }
        return idPedido;
    }

    /**
     * Obtiene un pedido por su ID.
     */
    public Pedido obtenerPedidoPorId(int idPedido) {
        String consulta = "SELECT o.id, o.usuario_id, o.vendedor_id, o.monto_total, o.estado, o.creado_en, " +
                "oi.producto_id, oi.cantidad, oi.precio_por_metro " +
                "FROM pedidos o " +
                "LEFT JOIN items_pedido oi ON o.id = oi.pedido_id " +
                "WHERE o.id = ?";
        Pedido pedido = null;
        try (Connection con = Conexion.obtenerConexion();
             PreparedStatement pst = con.prepareStatement(consulta)) {
            pst.setInt(1, idPedido);
            try (ResultSet rs = pst.executeQuery()) {
                while (rs.next()) {
                    if (pedido == null) {
                        pedido = new Pedido();
                        pedido.setId(rs.getInt("id"));
                        pedido.setIdCliente(rs.getInt("usuario_id"));
                        pedido.setIdVendedor(rs.getInt("vendedor_id"));
                        pedido.setTotal(rs.getDouble("monto_total"));
                        pedido.setEstado(rs.getString("estado"));
                        if (rs.getTimestamp("creado_en") != null) {
                            pedido.setFecha(rs.getTimestamp("creado_en").toString().split(" ")[0]);
                        }
                        pedido.setCantidadArticulos(0);
                    }
                    int idProducto = rs.getInt("producto_id");
                    if (!rs.wasNull()) {
                        pedido.agregarIdProducto(idProducto);
                        pedido.setCantidadArticulos(pedido.getCantidadArticulos() + rs.getInt("cantidad"));
                    }
                }
            }
        } catch (SQLException e) {
            System.err.println("[ERROR] Error obteniendo pedido: " + e.getMessage());
        }
        return pedido;
    }

    /**
     * Actualiza el estado de un pedido.
     */
    public boolean actualizarEstadoPedido(int idPedido, String estado) {
        String consulta = "UPDATE pedidos SET estado = ?, actualizado_en = NOW() WHERE id = ?";
        try (Connection con = Conexion.obtenerConexion();
             PreparedStatement pst = con.prepareStatement(consulta)) {
            pst.setString(1, estado);
            pst.setInt(2, idPedido);
            int filasAfectadas = pst.executeUpdate();
            return filasAfectadas > 0;
        } catch (SQLException e) {
            System.err.println("[ERROR] Error actualizando estado de pedido: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }

    /**
     * Lista el resumen de facturas a partir de los pedidos registrados.
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
                Map<String, Object> fac = new java.util.HashMap<>();
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
     * Obtiene los datos de cabecera y totales de un pedido para generar su factura PDF.
     */
    public Map<String, Object> obtenerCabeceraFactura(int idPedido) {
        String consulta = "SELECT nombre_cliente, correo_cliente, telefono_cliente, direccion_envio, metodo_pago, " +
                "subtotal, monto_descuento, costo_envio, monto_impuesto " +
                "FROM pedidos WHERE id = ?";
        try (Connection con = Conexion.obtenerConexion();
             PreparedStatement pst = con.prepareStatement(consulta)) {
            pst.setInt(1, idPedido);
            try (ResultSet rs = pst.executeQuery()) {
                if (rs.next()) {
                    Map<String, Object> datos = new java.util.HashMap<>();
                    datos.put("nombreCliente", rs.getString("nombre_cliente"));
                    datos.put("correoCliente", rs.getString("correo_cliente"));
                    datos.put("telefonoCliente", rs.getString("telefono_cliente"));
                    datos.put("direccionEnvio", rs.getString("direccion_envio"));
                    datos.put("metodoPago", rs.getString("metodo_pago"));
                    datos.put("subtotal", rs.getDouble("subtotal"));
                    datos.put("descuento", rs.getDouble("monto_descuento"));
                    datos.put("envio", rs.getDouble("costo_envio"));
                    datos.put("impuesto", rs.getDouble("monto_impuesto"));
                    return datos;
                }
            }
        } catch (SQLException e) {
            System.err.println("[ERROR] Error obteniendo cabecera de factura: " + e.getMessage());
        }
        return null;
    }

    /**
     * Obtiene las líneas de detalle de un pedido para la factura PDF.
     */
    public List<Map<String, Object>> obtenerArticulosFactura(int idPedido) {
        List<Map<String, Object>> articulos = new ArrayList<>();
        String consulta = "SELECT ip.producto_id, ip.cantidad, ip.precio_por_metro, ip.subtotal, pr.nombre " +
                "FROM items_pedido ip " +
                "LEFT JOIN productos pr ON ip.producto_id = pr.id " +
                "WHERE ip.pedido_id = ?";
        try (Connection con = Conexion.obtenerConexion();
             PreparedStatement pst = con.prepareStatement(consulta)) {
            pst.setInt(1, idPedido);
            try (ResultSet rs = pst.executeQuery()) {
                while (rs.next()) {
                    Map<String, Object> item = new java.util.HashMap<>();
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
}
