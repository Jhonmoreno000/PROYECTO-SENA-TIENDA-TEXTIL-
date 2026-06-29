package infrastructure.persistence.jdbc;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import infrastructure.config.Conexion;
import domain.models.CartItem;

/**
 * DAO (Data Access Object) para el Carrito de Compras.
 * Gestiona las operaciones CRUD sobre la tabla 'cart_items' del sistema
 * D&D Textil.
 */
public class CartDAO {

    /**
     * Recupera todos los items del carrito para un usuario especifico,
     * incluyendo informacion del producto (nombre, precio, imagen principal).
     * @param userId Identificador del usuario.
     * @return Lista de objetos CartItem con datos del producto agregados.
     */
    public List<CartItem> getCartByUser(int userId) {
        List<CartItem> items = new ArrayList<>();
        // JOIN con products y subconsulta para obtener la primera imagen del producto
        String query = "SELECT ci.*, p.name as product_name, p.price as product_price, " +
                "(SELECT pi.image_url FROM product_images pi WHERE pi.product_id = ci.product_id ORDER BY pi.display_order LIMIT 1) as product_image " +
                "FROM cart_items ci JOIN products p ON ci.product_id = p.id " +
                "WHERE ci.user_id = ? ORDER BY ci.added_at DESC";
        try (Connection con = Conexion.getConnection();
             PreparedStatement pst = con.prepareStatement(query)) {
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
        } catch (SQLException e) { 
            // Error: No se pudo recuperar el carrito del usuario
            e.printStackTrace(); 
        }
        return items;
    }

    /**
     * Agrega un producto al carrito de un usuario. Si el producto ya existe
     * en el carrito, incrementa la cantidad (UPSERT).
     * @param userId    Identificador del usuario.
     * @param productId Identificador del producto.
     * @param quantity  Cantidad a agregar.
     * @return true si la operacion fue exitosa, false en caso de error.
     */
    public boolean addToCart(int userId, int productId, int quantity) {
        // UPSERT: si ya esta en el carrito, incrementa la cantidad
        String query = "INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?) " +
                "ON CONFLICT (user_id, product_id) DO UPDATE SET quantity = cart_items.quantity + EXCLUDED.quantity, updated_at = NOW()";
        try (Connection con = Conexion.getConnection();
             PreparedStatement pst = con.prepareStatement(query)) {
            pst.setInt(1, userId);
            pst.setInt(2, productId);
            pst.setInt(3, quantity);
            return pst.executeUpdate() > 0;
        } catch (SQLException e) {
            // Si no existe la constraint UNIQUE, fallback a INSERT simple
            String fallback = "INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)";
            try (Connection fallbackCon = Conexion.getConnection();
                 PreparedStatement pst2 = fallbackCon.prepareStatement(fallback)) {
                pst2.setInt(1, userId);
                pst2.setInt(2, productId);
                pst2.setInt(3, quantity);
                return pst2.executeUpdate() > 0;
            } catch (SQLException e2) { 
                // Error: Fallo incluso el INSERT de respaldo
                e2.printStackTrace(); 
                return false; 
            }
        }
    }

    /**
     * Actualiza la cantidad de un item especifico en el carrito.
     * @param cartItemId Identificador del item en el carrito.
     * @param quantity   Nueva cantidad.
     * @return true si la actualizacion fue exitosa, false en caso de error.
     */
    public boolean updateQuantity(int cartItemId, int quantity) {
        String query = "UPDATE cart_items SET quantity = ?, updated_at = NOW() WHERE id = ?";
        try (Connection con = Conexion.getConnection();
             PreparedStatement pst = con.prepareStatement(query)) {
            pst.setInt(1, quantity);
            pst.setInt(2, cartItemId);
            return pst.executeUpdate() > 0;
        } catch (SQLException e) { 
            // Error: No se pudo actualizar la cantidad del item
            e.printStackTrace(); 
            return false; 
        }
    }

    /**
     * Elimina un item especifico del carrito.
     * @param cartItemId Identificador del item a eliminar.
     * @return true si la eliminacion fue exitosa, false en caso de error.
     */
    public boolean removeFromCart(int cartItemId) {
        String query = "DELETE FROM cart_items WHERE id = ?";
        try (Connection con = Conexion.getConnection();
             PreparedStatement pst = con.prepareStatement(query)) {
            pst.setInt(1, cartItemId);
            return pst.executeUpdate() > 0;
        } catch (SQLException e) { 
            // Error: No se pudo eliminar el item del carrito
            e.printStackTrace(); 
            return false; 
        }
    }

    /**
     * Vacia completamente el carrito de un usuario.
     * @param userId Identificador del usuario.
     * @return true si la operacion fue exitosa, false en caso de error.
     */
    public boolean clearCart(int userId) {
        String query = "DELETE FROM cart_items WHERE user_id = ?";
        try (Connection con = Conexion.getConnection();
             PreparedStatement pst = con.prepareStatement(query)) {
            pst.setInt(1, userId);
            return pst.executeUpdate() >= 0;
        } catch (SQLException e) { 
            // Error: No se pudo vaciar el carrito del usuario
            e.printStackTrace(); 
            return false; 
        }
    }
}
