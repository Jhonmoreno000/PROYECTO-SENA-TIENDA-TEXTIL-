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
 * DAO para la gestión de las secciones del inicio.
 * Opera sobre la tabla 'secciones_inicio'.
 */
public class SeccionesInicioDAO {

    /**
     * Recupera todas las secciones ordenadas por posición.
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
     * Recupera las secciones activas.
     */
    public List<SeccionInicio> obtenerSeccionesActivas() {
        List<SeccionInicio> secciones = new ArrayList<>();
        String consulta = "SELECT * FROM secciones_inicio WHERE active = true ORDER BY orden ASC, clave ASC";

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
     * Actualiza una sección del inicio.
     */
    public boolean actualizarSeccion(String clave, SeccionInicio seccion, Boolean activa) {
        String consulta = "UPDATE secciones_inicio SET " +
                "titulo = COALESCE(?, titulo), " +
                "subtitulo = COALESCE(?, subtitulo), " +
                "active = COALESCE(?, active), " +
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

    private SeccionInicio mapearFila(ResultSet rs) throws SQLException {
        SeccionInicio seccion = new SeccionInicio();
        seccion.setClave(rs.getString("clave"));
        seccion.setTitulo(rs.getString("titulo"));
        seccion.setSubtitulo(rs.getString("subtitulo"));
        seccion.setActiva(rs.getBoolean("active"));
        seccion.setOrden(rs.getInt("orden"));
        return seccion;
    }

    // Métodos alias para compatibilidad
    public List<SeccionInicio> getAllSections() { return obtenerTodasLasSecciones(); }
    public List<SeccionInicio> getActiveSections() { return obtenerSeccionesActivas(); }
    public boolean updateSection(String clave, SeccionInicio section, Boolean active) { return actualizarSeccion(clave, section, active); }
}

