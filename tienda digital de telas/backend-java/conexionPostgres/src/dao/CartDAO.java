package dao;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import conexion.Conexion;
import models.CartItem;

public class CartDAO {

    public List<CartItem> getCartByUser(int userId) {
        List<CartItem> items = new ArrayList<>();
        String query = "SELECT ci.*, p.name as product_name, p.price as product_price, " +
                "(SELECT pi.image_url FROM product_images pi WHERE pi.product_id = ci.product_id ORDER BY pi.display_order LIMIT 1) as product_image " +
                "FROM cart_items ci JOIN products p ON ci.product_id = p.id " +
                "WHERE ci.user_id = ? ORDER BY ci.added_at DESC";
        Connection con = Conexion.getConnection();
        try (PreparedStatement pst = con.prepareStatement(query)) {
            pst.setInt(1, userId);
            try (ResultSet rs = pst.executeQuery()) {
                while (rs.next()) {
                    CartItem item = new CartItem();
                    item.setId(rs.getInt("id"));
                    item.setUserId(rs.getInt("user_id"));
                    item.setProductId(rs.getInt("product_id"));
                    item.setQuantity(rs.getInt("quantity"));
                    item.setProductName(rs.getString("product_name"));
                    item.setProductPrice(rs.getDouble("product_price"));
                    item.setProductImage(rs.getString("product_image"));
                    if (rs.getTimestamp("added_at") != null) item.setAddedAt(rs.getTimestamp("added_at").toString());
                    items.add(item);
                }
            }
        } catch (SQLException e) { e.printStackTrace(); }
        return items;
    }

    public boolean addToCart(int userId, int productId, int quantity) {
        // Upsert: if already in cart, increase quantity
        String query = "INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?) " +
                "ON CONFLICT (user_id, product_id) DO UPDATE SET quantity = cart_items.quantity + EXCLUDED.quantity, updated_at = NOW()";
        Connection con = Conexion.getConnection();
        try (PreparedStatement pst = con.prepareStatement(query)) {
            pst.setInt(1, userId);
            pst.setInt(2, productId);
            pst.setInt(3, quantity);
            return pst.executeUpdate() > 0;
        } catch (SQLException e) {
            // If no unique constraint, fallback to simple insert
            String fallback = "INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)";
            try (PreparedStatement pst2 = con.prepareStatement(fallback)) {
                pst2.setInt(1, userId);
                pst2.setInt(2, productId);
                pst2.setInt(3, quantity);
                return pst2.executeUpdate() > 0;
            } catch (SQLException e2) { e2.printStackTrace(); return false; }
        }
    }

    public boolean updateQuantity(int cartItemId, int quantity) {
        String query = "UPDATE cart_items SET quantity = ?, updated_at = NOW() WHERE id = ?";
        Connection con = Conexion.getConnection();
        try (PreparedStatement pst = con.prepareStatement(query)) {
            pst.setInt(1, quantity);
            pst.setInt(2, cartItemId);
            return pst.executeUpdate() > 0;
        } catch (SQLException e) { e.printStackTrace(); return false; }
    }

    public boolean removeFromCart(int cartItemId) {
        String query = "DELETE FROM cart_items WHERE id = ?";
        Connection con = Conexion.getConnection();
        try (PreparedStatement pst = con.prepareStatement(query)) {
            pst.setInt(1, cartItemId);
            return pst.executeUpdate() > 0;
        } catch (SQLException e) { e.printStackTrace(); return false; }
    }

    public boolean clearCart(int userId) {
        String query = "DELETE FROM cart_items WHERE user_id = ?";
        Connection con = Conexion.getConnection();
        try (PreparedStatement pst = con.prepareStatement(query)) {
            pst.setInt(1, userId);
            return pst.executeUpdate() >= 0;
        } catch (SQLException e) { e.printStackTrace(); return false; }
    }
}
