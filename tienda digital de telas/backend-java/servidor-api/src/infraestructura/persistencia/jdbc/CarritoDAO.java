package infraestructura.persistencia.jdbc;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import infraestructura.configuracion.Conexion;
import dominio.modelos.ItemCarrito;

/**
 * DAO para el carrito de compras.
 * Gestiona las operaciones CRUD sobre la tabla `items_carrito` en PostgreSQL.
 */
public class CarritoDAO {

    /**
     * Construye una nueva instancia del DAO de carrito de compras.
     */
    public CarritoDAO() {}

    /**
     * Recupera todos los artículos del carrito pertenecientes a un usuario junto con el detalle del producto.
     *
     * @param idUsuario Identificador único del usuario (`int`).
     * @return Lista (`List<ItemCarrito>`) de artículos en el carrito.
     */
    public List<ItemCarrito> obtenerCarritoPorUsuario(int idUsuario) {
        List<ItemCarrito> items = new ArrayList<>();
        String consulta = "SELECT ci.*, p.nombre as product_name, p.precio as product_price, " +
                "(SELECT pi.url_imagen FROM imagenes_producto pi WHERE pi.producto_id = ci.producto_id ORDER BY pi.orden_visualizacion ASC LIMIT 1) as product_image " +
                "FROM items_carrito ci JOIN productos p ON ci.producto_id = p.id " +
                "WHERE ci.usuario_id = ? ORDER BY ci.agregado_en DESC";
        try (Connection con = Conexion.obtenerConexion();
             PreparedStatement pst = con.prepareStatement(consulta)) {
            pst.setInt(1, idUsuario);
            try (ResultSet rs = pst.executeQuery()) {
                while (rs.next()) {
                    ItemCarrito item = new ItemCarrito();
                    item.setId(rs.getInt("id"));
                    item.setIdUsuario(rs.getInt("usuario_id"));
                    item.setIdProducto(rs.getInt("producto_id"));
                    item.setCantidad(rs.getDouble("cantidad"));
                    item.setNombreProducto(rs.getString("product_name"));
                    item.setPrecioProducto(rs.getDouble("product_price"));
                    item.setImagenProducto(rs.getString("product_image"));
                    if (rs.getTimestamp("agregado_en") != null) {
                        item.setFechaAgregado(rs.getTimestamp("agregado_en").toString());
                    }
                    if (rs.getTimestamp("actualizado_en") != null) {
                        item.setFechaModificacion(rs.getTimestamp("actualizado_en").toString());
                    }
                    items.add(item);
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return items;
    }

    /**
     * Agrega un producto al carrito o incrementa su metraje si ya existe para el usuario.
     *
     * @param idUsuario Identificador del usuario (`int`).
     * @param idProducto Identificador del producto (`int`).
     * @param cantidad Cantidad en metros a agregar (`double`).
     * @return `true` si la operación afectó filas; `false` en caso contrario.
     */
    public boolean agregarAlCarrito(int idUsuario, int idProducto, double cantidad) {
        if (cantidad <= 0) {
            return false;
        }
        String consulta = "INSERT INTO items_carrito (usuario_id, producto_id, cantidad) VALUES (?, ?, ?) " +
                "ON CONFLICT (usuario_id, producto_id) DO UPDATE SET cantidad = items_carrito.cantidad + EXCLUDED.cantidad, actualizado_en = NOW()";
        try (Connection con = Conexion.obtenerConexion();
             PreparedStatement pst = con.prepareStatement(consulta)) {
            pst.setInt(1, idUsuario);
            pst.setInt(2, idProducto);
            pst.setDouble(3, cantidad);
            return pst.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    /**
     * Sobrecarga de compatibilidad para agregar una cantidad entera de metros al carrito.
     *
     * @param idUsuario Identificador del usuario (`int`).
     * @param idProducto Identificador del producto (`int`).
     * @param cantidad Cantidad entera de metros (`int`).
     * @return `true` si se agregó correctamente.
     */
    public boolean agregarAlCarrito(int idUsuario, int idProducto, int cantidad) {
        return agregarAlCarrito(idUsuario, idProducto, (double) cantidad);
    }

    /**
     * Actualiza la cantidad en metros de un ítem específico del carrito.
     *
     * @param idItem Identificador de la fila en `items_carrito` (`int`).
     * @param cantidad Nueva cantidad en metros (`double`).
     * @return `true` si se actualizó el registro; `false` en caso contrario.
     */
    public boolean actualizarCantidad(int idItem, double cantidad) {
        if (cantidad <= 0) {
            return eliminarDelCarrito(idItem);
        }
        String consulta = "UPDATE items_carrito SET cantidad = ?, actualizado_en = NOW() WHERE id = ?";
        try (Connection con = Conexion.obtenerConexion();
             PreparedStatement pst = con.prepareStatement(consulta)) {
            pst.setDouble(1, cantidad);
            pst.setInt(2, idItem);
            return pst.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    /**
     * Sobrecarga de compatibilidad para actualizar una cantidad entera en el carrito.
     *
     * @param idItem Identificador del ítem (`int`).
     * @param cantidad Nueva cantidad entera (`int`).
     * @return `true` si se actualizó correctamente.
     */
    public boolean actualizarCantidad(int idItem, int cantidad) {
        return actualizarCantidad(idItem, (double) cantidad);
    }

    /**
     * Elimina un ítem específico del carrito por su identificador.
     *
     * @param idItem Identificador del ítem (`int`).
     * @return `true` si se eliminó el registro; `false` en caso contrario.
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
     * Vacía todos los artículos del carrito pertenecientes a un usuario.
     *
     * @param idUsuario Identificador del usuario (`int`).
     * @return `true` si la operación se ejecutó sin errores SQL; `false` en caso de fallo.
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
}
