package infraestructura.persistencia.jdbc;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;

import infraestructura.configuracion.Conexion;
import dominio.modelos.Resena;

/**
 * DAO para la gestión de reseñas y valoraciones de productos.
 * Opera sobre la tabla `resenas` en PostgreSQL.
 */
public class ResenasDAO {

    /**
     * Construye una nueva instancia del DAO de reseñas.
     */
    public ResenasDAO() {}

    /**
     * Recupera todas las reseñas asociadas a un producto junto con el nombre del autor.
     *
     * @param idProducto Identificador del producto (`int`).
     * @return Lista (`List<Resena>`) de reseñas ordenadas por fecha descendente.
     */
    public List<Resena> obtenerResenasPorProducto(int idProducto) {
        List<Resena> resenas = new ArrayList<>();
        String consulta = "SELECT r.*, u.nombre as nombre_usuario " +
                "FROM resenas r " +
                "JOIN usuarios u ON u.id = r.usuario_id " +
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
     * Inserta una nueva reseña en la base de datos y asigna el identificador generado.
     *
     * @param resena Entidad {@link Resena} a almacenar.
     * @return `true` si se registró correctamente; `false` en caso de error.
     */
    public boolean agregarResena(Resena resena) {
        String consulta = "INSERT INTO resenas (producto_id, usuario_id, calificacion, comentario) VALUES (?, ?, ?, ?)";
        try (Connection con = Conexion.obtenerConexion();
             PreparedStatement pst = con.prepareStatement(consulta, Statement.RETURN_GENERATED_KEYS)) {
            pst.setInt(1, resena.getIdProducto());
            pst.setInt(2, resena.getIdUsuario());
            pst.setInt(3, resena.getCalificacion());
            pst.setString(4, resena.getComentario());
            int filas = pst.executeUpdate();
            if (filas > 0) {
                try (ResultSet rs = pst.getGeneratedKeys()) {
                    if (rs.next()) {
                        resena.setId(rs.getInt(1));
                    }
                }
                return true;
            }
            return false;
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    /**
     * Verifica si un usuario ya registró una reseña previa para el mismo producto.
     *
     * @param idProducto Identificador del producto (`int`).
     * @param idUsuario Identificador del usuario (`int`).
     * @return `true` si ya existe una reseña registrada; `false` en caso contrario.
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
}
