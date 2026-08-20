package infrastructure.persistence.jdbc;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

import infrastructure.config.Conexion;
import domain.models.HomeSection;

/**
 * DAO (Data Access Object) para la entidad HomeSection.
 * Gestiona los apartados del inicio (Nuevas Colecciones, Telas Exclusivas,
 * Ofertas Especiales) sobre la tabla 'home_sections'. Los apartados los
 * administra el panel de administración vía la API y controlan qué secciones
 * se muestran en el Home y en el Catálogo.
 */
public class HomeSectionsDAO {

    /**
     * Recupera todos los apartados ordenados por su posición.
     * @return Lista de apartados del inicio.
     */
    public List<HomeSection> getAllSections() {
        List<HomeSection> sections = new ArrayList<>();
        Connection conn = Conexion.getConnection();

        String query = "SELECT * FROM home_sections ORDER BY sort_order ASC, key ASC";

        try (PreparedStatement stmt = conn.prepareStatement(query);
                ResultSet rs = stmt.executeQuery()) {

            while (rs.next()) {
                sections.add(mapRow(rs));
            }
        } catch (SQLException e) {
            // Error: Fallo la consulta de apartados
            e.printStackTrace();
        }
        return sections;
    }

    /**
     * Recupera los apartados activos (se muestran en el Home).
     * @return Lista de apartados con active = true ordenados por sort_order.
     */
    public List<HomeSection> getActiveSections() {
        List<HomeSection> sections = new ArrayList<>();
        Connection conn = Conexion.getConnection();

        String query = "SELECT * FROM home_sections WHERE active = true ORDER BY sort_order ASC, key ASC";

        try (PreparedStatement stmt = conn.prepareStatement(query);
                ResultSet rs = stmt.executeQuery()) {

            while (rs.next()) {
                sections.add(mapRow(rs));
            }
        } catch (SQLException e) {
            // Error: Fallo la consulta de apartados activos
            e.printStackTrace();
        }
        return sections;
    }

    /**
     * Actualiza un apartado existente usando COALESCE para solo sobrescribir
     * los campos que realmente se proporcionan.
     * @param key     Clave del apartado a actualizar ('nuevas', 'exclusivas', 'ofertas').
     * @param section Datos nuevos del apartado.
     * @param active  Nuevo estado de activación, o null si no debe cambiar.
     * @return true si la actualización fue exitosa, false en caso de error.
     */
    public boolean updateSection(String key, HomeSection section, Boolean active) {
        String query = "UPDATE home_sections SET " +
                "title = COALESCE(?, title), " +
                "subtitle = COALESCE(?, subtitle), " +
                "active = COALESCE(?, active), " +
                "sort_order = COALESCE(?, sort_order) " +
                "WHERE key = ?";
        try (Connection conn = Conexion.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {
            stmt.setString(1, section.getTitle());
            stmt.setString(2, section.getSubtitle());
            stmt.setObject(3, active);
            stmt.setObject(4, section.getSortOrder() > 0 ? section.getSortOrder() : null);
            stmt.setString(5, key);
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            // Error: No se pudo actualizar el apartado
            e.printStackTrace();
            return false;
        }
    }

    /**
     * Convierte la fila actual de un ResultSet en un objeto HomeSection.
     * @param rs ResultSet posicionado en la fila a mapear.
     * @return HomeSection con los datos de la fila.
     * @throws SQLException Si ocurre un error leyendo la fila.
     */
    private HomeSection mapRow(ResultSet rs) throws SQLException {
        HomeSection section = new HomeSection();
        section.setKey(rs.getString("key"));
        section.setTitle(rs.getString("title"));
        section.setSubtitle(rs.getString("subtitle"));
        section.setActive(rs.getBoolean("active"));
        section.setSortOrder(rs.getInt("sort_order"));
        return section;
    }
}