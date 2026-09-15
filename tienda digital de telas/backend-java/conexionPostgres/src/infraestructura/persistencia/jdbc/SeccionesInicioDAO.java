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
 * Opera sobre la tabla 'home_sections'.
 */
public class SeccionesInicioDAO {

    /**
     * Recupera todas las secciones ordenadas por posición.
     */
    public List<SeccionInicio> obtenerTodasLasSecciones() {
        List<SeccionInicio> secciones = new ArrayList<>();
        String consulta = "SELECT * FROM home_sections ORDER BY sort_order ASC, key ASC";

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
        String consulta = "SELECT * FROM home_sections WHERE active = true ORDER BY sort_order ASC, key ASC";

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
        String consulta = "UPDATE home_sections SET " +
                "title = COALESCE(?, title), " +
                "subtitle = COALESCE(?, subtitle), " +
                "active = COALESCE(?, active), " +
                "sort_order = COALESCE(?, sort_order) " +
                "WHERE key = ?";
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
        seccion.setClave(rs.getString("key"));
        seccion.setTitulo(rs.getString("title"));
        seccion.setSubtitulo(rs.getString("subtitle"));
        seccion.setActiva(rs.getBoolean("active"));
        seccion.setOrden(rs.getInt("sort_order"));
        return seccion;
    }

    // Métodos alias para compatibilidad
    public List<SeccionInicio> getAllSections() { return obtenerTodasLasSecciones(); }
    public List<SeccionInicio> getActiveSections() { return obtenerSeccionesActivas(); }
    public boolean updateSection(String key, SeccionInicio section, Boolean active) { return actualizarSeccion(key, section, active); }
}
