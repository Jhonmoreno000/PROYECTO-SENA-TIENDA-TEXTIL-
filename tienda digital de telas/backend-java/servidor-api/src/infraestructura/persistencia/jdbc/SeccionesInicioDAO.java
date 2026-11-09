package infraestructura.persistencia.jdbc;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

import infraestructura.configuracion.Conexion;
import dominio.modelos.SeccionInicio;

/**
 * DAO para la gestión de las secciones configurables de la página de inicio.
 * Opera sobre la tabla `secciones_inicio` en PostgreSQL.
 */
public class SeccionesInicioDAO {

    /**
     * Construye una nueva instancia del DAO de secciones de inicio.
     */
    public SeccionesInicioDAO() {}

    /**
     * Recupera todas las secciones de inicio ordenadas por posición ascendente.
     *
     * @return Lista (`List<SeccionInicio>`) con todas las secciones.
     */
    public List<SeccionInicio> obtenerTodasLasSecciones() {
        List<SeccionInicio> secciones = new ArrayList<>();
        String consulta = "SELECT * FROM secciones_inicio ORDER BY orden ASC, clave ASC";

        try (Connection con = Conexion.obtenerConexion();
             PreparedStatement pst = con.prepareStatement(consulta);
             ResultSet rs = pst.executeQuery()) {

            while (rs.next()) {
                secciones.add(mapearFila(rs));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return secciones;
    }

    /**
     * Recupera únicamente las secciones de inicio marcadas como activas.
     *
     * @return Lista (`List<SeccionInicio>`) de secciones visibles.
     */
    public List<SeccionInicio> obtenerSeccionesActivas() {
        List<SeccionInicio> secciones = new ArrayList<>();
        String consulta = "SELECT * FROM secciones_inicio WHERE activo = true ORDER BY orden ASC, clave ASC";

        try (Connection con = Conexion.obtenerConexion();
             PreparedStatement pst = con.prepareStatement(consulta);
             ResultSet rs = pst.executeQuery()) {

            while (rs.next()) {
                secciones.add(mapearFila(rs));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return secciones;
    }

    /**
     * Actualiza selectivamente los datos de una sección del inicio identificada por su clave.
     *
     * @param clave Clave única de la sección (`String`).
     * @param seccion Datos a actualizar ({@link SeccionInicio}).
     * @param activa Nuevo estado de activación (`Boolean`) o `null` para mantener el actual.
     * @return `true` si se actualizó la fila; `false` en caso contrario.
     */
    public boolean actualizarSeccion(String clave, SeccionInicio seccion, Boolean activa) {
        String consulta = "UPDATE secciones_inicio SET " +
                "titulo = COALESCE(?, titulo), " +
                "subtitulo = COALESCE(?, subtitulo), " +
                "activo = COALESCE(?, activo), " +
                "orden = COALESCE(?, orden) " +
                "WHERE clave = ?";
        try (Connection con = Conexion.obtenerConexion();
             PreparedStatement pst = con.prepareStatement(consulta)) {
            pst.setString(1, seccion.getTitulo());
            pst.setString(2, seccion.getSubtitulo());
            pst.setObject(3, activa);
            pst.setObject(4, seccion.getOrden() > 0 ? seccion.getOrden() : null);
            pst.setString(5, clave);
            return pst.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    /**
     * Convierte la fila actual de un {@link ResultSet} en un objeto {@link SeccionInicio}.
     *
     * @param rs Conjunto de resultados posicionado en la fila actual ({@link ResultSet}).
     * @return Instancia de {@link SeccionInicio}.
     * @throws SQLException Si ocurre un error leyendo las columnas.
     */
    private SeccionInicio mapearFila(ResultSet rs) throws SQLException {
        SeccionInicio seccion = new SeccionInicio();
        seccion.setClave(rs.getString("clave"));
        seccion.setTitulo(rs.getString("titulo"));
        seccion.setSubtitulo(rs.getString("subtitulo"));
        seccion.setActiva(rs.getBoolean("activo"));
        seccion.setOrden(rs.getInt("orden"));
        return seccion;
    }
}
