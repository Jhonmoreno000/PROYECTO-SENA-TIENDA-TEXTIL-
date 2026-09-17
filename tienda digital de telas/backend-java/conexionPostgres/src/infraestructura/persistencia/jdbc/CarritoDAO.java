package infraestructura.persistencia.jdbc;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import infraestructura.configuracion.Conexion;
import dominio.modelos.ItemCarrito;

/**
 * DAO para el Carrito de Compras.
 * Gestiona las operaciones CRUD sobre la tabla 'items_carrito'.
 */
public class CarritoDAO {

    /**
     * Recupera todos los ítems del carrito de un usuario.
     */
    public List<ItemCarrito> obtenerCarritoPorUsuario(int idUsuario) {
        List<ItemCarrito> items = new ArrayList<>();
        String consulta = "SELECT ci.*, p.name as product_name, p.price as product_price, " +
                "(SELECT pi.image_url FROM product_images pi WHERE pi.producto_id = ci.producto_id ORDER BY pi.display_order LIMIT 1) as product_image " +
                "FROM items_carrito ci JOIN products p ON ci.producto_id = p.id " +
                "WHERE ci.usuario_id = ? ORDER BY ci.added_at DESC";
        try (Connection con = Conexion.obtenerConexion();
             PreparedStatement pst = con.prepareStatement(consulta)) {
            pst.setInt(1, idUsuario);
            try (ResultSet rs = pst.executeQuery()) {
                while (rs.next()) {
                    ItemCarrito item = new ItemCarrito();
                    item.setId(rs.getInt("id"));
                    item.setIdUsuario(rs.getInt("usuario_id"));
                    item.setIdProducto(rs.getInt("producto_id"));
                    item.setCantidad(rs.getInt("quantity"));
                    item.setNombreProducto(rs.getString("product_name"));
                    item.setPrecioProducto(rs.getDouble("product_price"));
                    item.setImagenProducto(rs.getString("product_image"));
                    if (rs.getTimestamp("added_at") != null) item.setFechaAgregado(rs.getTimestamp("added_at").toString());
                    items.add(item);
                }
            }
        } catch (SQLException e) { 
            e.printStackTrace(); 
        }
        return items;
    }

    /**
     * Agrega un producto al carrito o incrementa su cantidad.
     */
    public boolean agregarAlCarrito(int idUsuario, int idProducto, int cantidad) {
        String consulta = "INSERT INTO items_carrito (usuario_id, producto_id, quantity) VALUES (?, ?, ?) " +
                "ON CONFLICT (usuario_id, producto_id) DO UPDATE SET quantity = items_carrito.quantity + EXCLUDED.quantity, actualizado_en = NOW()";
        try (Connection con = Conexion.obtenerConexion();
             PreparedStatement pst = con.prepareStatement(consulta)) {
            pst.setInt(1, idUsuario);
            pst.setInt(2, idProducto);
            pst.setInt(3, cantidad);
            return pst.executeUpdate() > 0;
        } catch (SQLException e) {
            String fallback = "INSERT INTO items_carrito (usuario_id, producto_id, quantity) VALUES (?, ?, ?)";
            try (Connection fallbackCon = Conexion.obtenerConexion();
                 PreparedStatement pst2 = fallbackCon.prepareStatement(fallback)) {
                pst2.setInt(1, idUsuario);
                pst2.setInt(2, idProducto);
                pst2.setInt(3, cantidad);
                return pst2.executeUpdate() > 0;
            } catch (SQLException e2) { 
                e2.printStackTrace(); 
                return false; 
            }
        }
    }

    /**
     * Actualiza la cantidad de un ítem del carrito.
     */
    public boolean actualizarCantidad(int idItem, int cantidad) {
        String consulta = "UPDATE items_carrito SET quantity = ?, actualizado_en = NOW() WHERE id = ?";
        try (Connection con = Conexion.obtenerConexion();
             PreparedStatement pst = con.prepareStatement(consulta)) {
            pst.setInt(1, cantidad);
            pst.setInt(2, idItem);
            return pst.executeUpdate() > 0;
        } catch (SQLException e) { 
            e.printStackTrace(); 
            return false; 
        }
    }

    /**
     * Elimina un ítem específico del carrito.
     */
    public boolean eliminarDelCarrito(int idItem) {
        String consulta = "DELETE FROM items_carrito WHERE id = ?";
        try (Connection con = Conexion.obtenerConexion();
             PreparedStatement pst = con.prepareStatement(consulta)) {
            pst.setInt(1, idItem);
            return pst.executeUpdate() > 0;
        } catch (SQLException e) { 
            e.printStackTrace(); 
            return false; 
        }
    }

    /**
     * Vacía completamente el carrito de un usuario.
     */
    public boolean vaciarCarrito(int idUsuario) {
        String consulta = "DELETE FROM items_carrito WHERE usuario_id = ?";
        try (Connection con = Conexion.obtenerConexion();
             PreparedStatement pst = con.prepareStatement(consulta)) {
            pst.setInt(1, idUsuario);
            return pst.executeUpdate() >= 0;
        } catch (SQLException e) { 
            e.printStackTrace(); 
            return false; 
        }
    }

    // Métodos alias para compatibilidad
    public List<ItemCarrito> getCartByUser(int userId) { return obtenerCarritoPorUsuario(userId); }
    public boolean addToCart(int userId, int productId, int quantity) { return agregarAlCarrito(userId, productId, quantity); }
    public boolean updateQuantity(int cartItemId, int quantity) { return actualizarCantidad(cartItemId, quantity); }
    public boolean removeFromCart(int cartItemId) { return eliminarDelCarrito(cartItemId); }
    public boolean clearCart(int userId) { return vaciarCarrito(userId); }
}

