package infraestructura.persistencia.jdbc;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;

import infraestructura.configuracion.Conexion;
import dominio.modelos.DiapositivaCarrusel;

/**
 * DAO para las diapositivas del carrusel de inicio.
 * Opera sobre la tabla `diapositivas_carrusel` en PostgreSQL.
 */
public class CarruselDAO {

    /**
     * Construye una nueva instancia del DAO de carrusel.
     */
    public CarruselDAO() {}

    /**
     * Recupera las diapositivas activas ordenadas por su posición ascendente.
     *
     * @return Lista (`List<DiapositivaCarrusel>`) de diapositivas activas.
     */
    public List<DiapositivaCarrusel> obtenerDiapositivasActivas() {
        List<DiapositivaCarrusel> diapositivas = new ArrayList<>();
        String consulta = "SELECT * FROM diapositivas_carrusel WHERE activo = true ORDER BY orden ASC, id ASC";

        try (Connection con = Conexion.obtenerConexion();
             PreparedStatement pst = con.prepareStatement(consulta);
             ResultSet rs = pst.executeQuery()) {

            while (rs.next()) {
                diapositivas.add(mapearFila(rs));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return diapositivas;
    }

    /**
     * Recupera todas las diapositivas registradas (activas e inactivas).
     *
     * @return Lista (`List<DiapositivaCarrusel>`) completa de diapositivas.
     */
    public List<DiapositivaCarrusel> obtenerTodasLasDiapositivas() {
        List<DiapositivaCarrusel> diapositivas = new ArrayList<>();
        String consulta = "SELECT * FROM diapositivas_carrusel ORDER BY orden ASC, id ASC";

        try (Connection con = Conexion.obtenerConexion();
             PreparedStatement pst = con.prepareStatement(consulta);
             ResultSet rs = pst.executeQuery()) {

            while (rs.next()) {
                diapositivas.add(mapearFila(rs));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return diapositivas;
    }

    /**
     * Inserta una nueva diapositiva en la base de datos y asigna el identificador generado al objeto.
     *
     * @param diapositiva Entidad {@link DiapositivaCarrusel} a insertar.
     * @return `true` si la inserción fue exitosa; `false` en caso de error.
     */
    public boolean agregarDiapositiva(DiapositivaCarrusel diapositiva) {
        String consulta = "INSERT INTO diapositivas_carrusel (titulo, subtitulo, imagen, cta, clave_seccion, activo, orden) " +
                "VALUES (?, ?, ?, ?, ?, ?, ?)";
        try (Connection con = Conexion.obtenerConexion();
             PreparedStatement pst = con.prepareStatement(consulta, Statement.RETURN_GENERATED_KEYS)) {
            pst.setString(1, diapositiva.getTitulo());
            pst.setString(2, diapositiva.getSubtitulo());
            pst.setString(3, diapositiva.getImagen() != null ? diapositiva.getImagen() : "");
            pst.setString(4, diapositiva.getTextoBoton());
            pst.setString(5, diapositiva.getClaveSeccion());
            pst.setBoolean(6, diapositiva.isActivo());
            pst.setInt(7, diapositiva.getOrden() > 0 ? diapositiva.getOrden() : 1);
            int filas = pst.executeUpdate();
            if (filas > 0) {
                try (ResultSet rs = pst.getGeneratedKeys()) {
                    if (rs.next()) {
                        diapositiva.setId(rs.getInt(1));
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
     * Actualiza selectivamente los campos de una diapositiva existente.
     *
     * @param id Identificador único de la diapositiva (`int`).
     * @param diapositiva Datos actualizados ({@link DiapositivaCarrusel}).
     * @param activo Nuevo estado activo explícito (`Boolean`) o `null` para conservar el actual.
     * @return `true` si se actualizó la fila; `false` en caso contrario.
     */
    public boolean actualizarDiapositiva(int id, DiapositivaCarrusel diapositiva, Boolean activo) {
        String consulta = "UPDATE diapositivas_carrusel SET " +
                "titulo = COALESCE(?, titulo), " +
                "subtitulo = COALESCE(?, subtitulo), " +
                "imagen = COALESCE(?, imagen), " +
                "cta = COALESCE(?, cta), " +
                "clave_seccion = COALESCE(?, clave_seccion), " +
                "activo = COALESCE(?, activo), " +
                "orden = COALESCE(?, orden) " +
                "WHERE id = ?";
        try (Connection con = Conexion.obtenerConexion();
             PreparedStatement pst = con.prepareStatement(consulta)) {
            pst.setString(1, diapositiva.getTitulo());
            pst.setString(2, diapositiva.getSubtitulo());
            pst.setString(3, diapositiva.getImagen());
            pst.setString(4, diapositiva.getTextoBoton());
            pst.setString(5, diapositiva.getClaveSeccion());
            pst.setObject(6, activo);
            pst.setObject(7, diapositiva.getOrden() > 0 ? diapositiva.getOrden() : null);
            pst.setInt(8, id);
            return pst.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    /**
     * Elimina una diapositiva por su identificador.
     *
     * @param id Identificador único de la diapositiva (`int`).
     * @return `true` si fue eliminada; `false` en caso contrario.
     */
    public boolean eliminarDiapositiva(int id) {
        String consulta = "DELETE FROM diapositivas_carrusel WHERE id = ?";
        try (Connection con = Conexion.obtenerConexion();
             PreparedStatement pst = con.prepareStatement(consulta)) {
            pst.setInt(1, id);
            return pst.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    /**
     * Convierte la fila actual de un {@link ResultSet} en un objeto {@link DiapositivaCarrusel}.
     *
     * @param rs Conjunto de resultados posicionado en la fila actual ({@link ResultSet}).
     * @return Instancia mapeada de {@link DiapositivaCarrusel}.
     * @throws SQLException Si ocurre un error leyendo las columnas.
     */
    private DiapositivaCarrusel mapearFila(ResultSet rs) throws SQLException {
        DiapositivaCarrusel slide = new DiapositivaCarrusel();
        slide.setId(rs.getInt("id"));
        slide.setTitulo(rs.getString("titulo"));
        slide.setSubtitulo(rs.getString("subtitulo"));
        slide.setImagen(rs.getString("imagen"));
        slide.setTextoBoton(rs.getString("cta"));
        slide.setClaveSeccion(rs.getString("clave_seccion"));
        slide.setActivo(rs.getBoolean("activo"));
        slide.setOrden(rs.getInt("orden"));
        return slide;
    }
}
