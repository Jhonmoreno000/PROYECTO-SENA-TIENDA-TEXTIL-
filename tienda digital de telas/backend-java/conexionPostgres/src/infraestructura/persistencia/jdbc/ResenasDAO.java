package infraestructura.persistencia.jdbc;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

import infraestructura.configuracion.Conexion;
import dominio.modelos.Resena;

/**
 * DAO para la gestión de reseñas de productos.
 * Opera sobre la tabla 'resenas'.
 */
public class ResenasDAO {

    /**
     * Recupera todas las reseñas de un producto.
     */
    public List<Resena> obtenerResenasPorProducto(int idProducto) {
        List<Resena> resenas = new ArrayList<>();
        String consulta = "SELECT r.*, u.name as nombre_usuario " +
                "FROM resenas r " +
                "JOIN users u ON u.id = r.usuario_id " +
                "WHERE r.producto_id = ? " +
                "ORDER BY r.creado_en DESC, r.id DESC";

        try (Connection con = Conexion.obtenerConexion();
             PreparedStatement pst = con.prepareStatement(consulta)) {
            pst.setInt(1, idProducto);
            try (ResultSet rs = pst.executeQuery()) {
                while (rs.next()) {
                    Resena resena = new Resena();
                    resena.setId(rs.getInt("id"));
                    resena.setIdProducto(rs.getInt("producto_id"));
                    resena.setIdUsuario(rs.getInt("usuario_id"));
                    resena.setNombreUsuario(rs.getString("nombre_usuario"));
                    resena.setCalificacion(rs.getInt("calificacion"));
                    resena.setComentario(rs.getString("comentario"));
                    resena.setFechaCreacion(rs.getTimestamp("creado_en") != null
                            ? rs.getTimestamp("creado_en").toString() : null);
                    resenas.add(resena);
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return resenas;
    }

    /**
     * Inserta una nueva reseña.
     */
    public boolean agregarResena(Resena resena) {
        String consulta = "INSERT INTO resenas (producto_id, usuario_id, calificacion, comentario) VALUES (?, ?, ?, ?)";
        try (Connection con = Conexion.obtenerConexion();
             PreparedStatement pst = con.prepareStatement(consulta)) {
            pst.setInt(1, resena.getIdProducto());
            pst.setInt(2, resena.getIdUsuario());
            pst.setInt(3, resena.getCalificacion());
            pst.setString(4, resena.getComentario());
            return pst.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    /**
     * Verifica si un usuario ya calificó un producto.
     */
    public boolean usuarioYaReseno(int idProducto, int idUsuario) {
        String consulta = "SELECT COUNT(*) FROM resenas WHERE producto_id = ? AND usuario_id = ?";
        try (Connection con = Conexion.obtenerConexion();
             PreparedStatement pst = con.prepareStatement(consulta)) {
            pst.setInt(1, idProducto);
            pst.setInt(2, idUsuario);
            try (ResultSet rs = pst.executeQuery()) {
                return rs.next() && rs.getInt(1) > 0;
            }
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    // Métodos alias para compatibilidad
    public List<Resena> getReviewsByProduct(int productId) { return obtenerResenasPorProducto(productId); }
    public boolean addReview(Resena review) { return agregarResena(review); }
    public boolean userHasReviewed(int productId, int userId) { return usuarioYaReseno(productId, userId); }
}

