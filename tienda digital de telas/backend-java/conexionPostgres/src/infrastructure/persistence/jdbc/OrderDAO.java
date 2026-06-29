package infrastructure.persistence.jdbc;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import infrastructure.config.Conexion;
import domain.models.Order;

/**
 * DAO (Data Access Object) para la entidad Pedido (Order).
 * Gestiona las operaciones de consulta y actualizacion sobre las tablas
 * 'orders' y 'order_items' del sistema D&D Textil.
 */
public class OrderDAO {

    /**
     * Recupera todos los pedidos del sistema con sus items asociados.
     * Agrupa los items dentro de cada pedido usando un Map para evitar
     * duplicados en el JOIN.
     * @return Lista de objetos Order con items y productos agregados.
     */
    public List<Order> getAllOrders() {
        // Usa un Map para agrupar los items de orden dentro de sus respectivos pedidos
        Map<Integer, Order> ordersMap = new LinkedHashMap<>();

        // JOIN entre orders y order_items para obtener total de items y IDs de productos
        String query = "SELECT o.id, o.client_id, o.seller_id, o.total, o.status, o.order_date, " +
                "oi.product_id, oi.quantity " +
                "FROM orders o " +
                "LEFT JOIN order_items oi ON o.id = oi.order_id " +
                "ORDER BY o.id ASC";

        try (Connection con = Conexion.getConnection();
             PreparedStatement pst = con.prepareStatement(query);
                ResultSet rs = pst.executeQuery()) {

            while (rs.next()) {
                int orderId = rs.getInt("id");

                Order order = ordersMap.get(orderId);
                if (order == null) {
                    order = new Order();
                    order.setId(orderId);
                    order.setClientId(rs.getInt("client_id"));
                    order.setSellerId(rs.getInt("seller_id"));
                    order.setTotal(rs.getDouble("total"));
                    order.setStatus(rs.getString("status"));

                    if (rs.getTimestamp("order_date") != null) {
                        // Formatea la fecha a string YYYY-MM-DD para el frontend
                        order.setDate(rs.getTimestamp("order_date").toString().split(" ")[0]);
                    }

                    order.setItems(0);
                    ordersMap.put(orderId, order);
                }

                int productId = rs.getInt("product_id");
                if (!rs.wasNull()) {
                    order.addProductId(productId);
                    // Acumula las cantidades de los items
                    order.setItems(order.getItems() + rs.getInt("quantity"));
                }
            }

        } catch (SQLException e) {
            // Error: No se pudieron recuperar los pedidos (problema de BD o conexion)
            System.err.println("[ERROR] Error obteniendo pedidos: " + e.getMessage());
            e.printStackTrace();
        }

        return new ArrayList<>(ordersMap.values());
    }

    /**
     * Actualiza el estado de un pedido especifico.
     * @param orderId Identificador del pedido a actualizar.
     * @param status  Nuevo estado del pedido (ej: 'pendiente', 'enviado', 'entregado', 'cancelado').
     * @return true si la actualizacion fue exitosa, false en caso de error.
     */
    public boolean updateOrderStatus(int orderId, String status) {
        // Actualiza el estado y registra la fecha/hora de modificacion
        String query = "UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?";
        try (Connection con = Conexion.getConnection();
             PreparedStatement pst = con.prepareStatement(query)) {
            pst.setString(1, status);
            pst.setInt(2, orderId);
            int rowsAffected = pst.executeUpdate();
            return rowsAffected > 0;
        } catch (SQLException e) {
            // Error: No se pudo actualizar el estado del pedido
            System.err.println("[ERROR] Error updating order status: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }
}
