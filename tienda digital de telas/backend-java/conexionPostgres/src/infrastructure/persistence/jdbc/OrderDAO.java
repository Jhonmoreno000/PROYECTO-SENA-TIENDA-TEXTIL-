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

public class OrderDAO {

    public List<Order> getAllOrders() {
        // We use a map to group order items into their respective orders
        Map<Integer, Order> ordersMap = new LinkedHashMap<>();

        // Join orders with order_items to get total items and product IDs
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
                        // Format date to string YYYY-MM-DD for the frontend
                        order.setDate(rs.getTimestamp("order_date").toString().split(" ")[0]);
                    }

                    order.setItems(0);
                    ordersMap.put(orderId, order);
                }

                int productId = rs.getInt("product_id");
                if (!rs.wasNull()) {
                    order.addProductId(productId);
                    order.setItems(order.getItems() + rs.getInt("quantity")); // Accumulate item quantities
                }
            }

        } catch (SQLException e) {
            System.err.println(" Error obteniendo pedidos: " + e.getMessage());
            e.printStackTrace();
        }

        return new ArrayList<>(ordersMap.values());
    }

    public boolean updateOrderStatus(int orderId, String status) {
        String query = "UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?";
        try (Connection con = Conexion.getConnection();
             PreparedStatement pst = con.prepareStatement(query)) {
            pst.setString(1, status);
            pst.setInt(2, orderId);
            int rowsAffected = pst.executeUpdate();
            return rowsAffected > 0;
        } catch (SQLException e) {
            System.err.println(" Error updating order status: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }
}
