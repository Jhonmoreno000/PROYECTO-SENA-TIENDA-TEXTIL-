package infrastructure.persistence.jdbc;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;

import infrastructure.config.Conexion;
import domain.models.CarouselSlide;

/**
 * DAO (Data Access Object) para la entidad CarouselSlide.
 * Gestiona el CRUD de las diapositivas del carrusel del Home sobre la tabla
 * 'carousel_slides'. Los slides los administra el panel de administración y
 * se muestran en la página principal en el orden definido por sort_order.
 */
public class CarouselDAO {

    /**
     * Recupera los slides activos del carrusel ordenados por su posición.
     * @return Lista de slides activos (active = true) ordenados por sort_order.
     */
    public List<CarouselSlide> getActiveSlides() {
        List<CarouselSlide> slides = new ArrayList<>();
        Connection conn = Conexion.getConnection();

        String query = "SELECT * FROM carousel_slides WHERE active = true ORDER BY sort_order ASC, id ASC";

        try (PreparedStatement stmt = conn.prepareStatement(query);
                ResultSet rs = stmt.executeQuery()) {

            while (rs.next()) {
                slides.add(mapRow(rs));
            }
        } catch (SQLException e) {
            // Error: Fallo la consulta de slides activos (problema de BD o conexion)
            e.printStackTrace();
        }
        return slides;
    }

    /**
     * Recupera todos los slides del carrusel, activos e inactivos, para la administración.
     * @return Lista completa de slides ordenados por sort_order.
     */
    public List<CarouselSlide> getAllSlides() {
        List<CarouselSlide> slides = new ArrayList<>();
        Connection conn = Conexion.getConnection();

        String query = "SELECT * FROM carousel_slides ORDER BY sort_order ASC, id ASC";

        try (PreparedStatement stmt = conn.prepareStatement(query);
                ResultSet rs = stmt.executeQuery()) {

            while (rs.next()) {
                slides.add(mapRow(rs));
            }
        } catch (SQLException e) {
            // Error: Fallo la consulta de todos los slides
            e.printStackTrace();
        }
        return slides;
    }

    /**
     * Inserta un nuevo slide en la base de datos.
     * @param slide Datos del slide a crear.
     * @return true si la inserción fue exitosa, false en caso de error.
     */
    public boolean addSlide(CarouselSlide slide) {
        String query = "INSERT INTO carousel_slides (title, subtitle, image, cta, section_key, active, sort_order) " +
                "VALUES (?, ?, ?, ?, ?, ?, ?)";
        try (Connection conn = Conexion.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query, Statement.RETURN_GENERATED_KEYS)) {
            stmt.setString(1, slide.getTitle());
            stmt.setString(2, slide.getSubtitle());
            stmt.setString(3, slide.getImage());
            stmt.setString(4, slide.getCta());
            stmt.setString(5, slide.getSectionKey());
            stmt.setBoolean(6, slide.isActive());
            stmt.setInt(7, slide.getSortOrder());
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            // Error: No se pudo insertar el slide
            e.printStackTrace();
            return false;
        }
    }

    /**
     * Actualiza un slide existente usando COALESCE para solo sobrescribir
     * los campos que realmente se proporcionan (null = no cambiar).
     * @param id     Identificador del slide a actualizar.
     * @param slide  Datos nuevos del slide.
     * @param active Nuevo estado de activación, o null si no debe cambiar.
     * @return true si la actualización fue exitosa, false en caso de error.
     */
    public boolean updateSlide(int id, CarouselSlide slide, Boolean active) {
        String query = "UPDATE carousel_slides SET " +
                "title = COALESCE(?, title), " +
                "subtitle = COALESCE(?, subtitle), " +
                "image = COALESCE(?, image), " +
                "cta = COALESCE(?, cta), " +
                "section_key = COALESCE(?, section_key), " +
                "active = COALESCE(?, active), " +
                "sort_order = COALESCE(?, sort_order) " +
                "WHERE id = ?";
        try (Connection conn = Conexion.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {
            stmt.setString(1, slide.getTitle());
            stmt.setString(2, slide.getSubtitle());
            stmt.setString(3, slide.getImage());
            stmt.setString(4, slide.getCta());
            stmt.setString(5, slide.getSectionKey());
            stmt.setObject(6, active);
            stmt.setObject(7, slide.getSortOrder() > 0 ? slide.getSortOrder() : null);
            stmt.setInt(8, id);
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            // Error: No se pudo actualizar el slide
            e.printStackTrace();
            return false;
        }
    }

    /**
     * Elimina un slide del carrusel.
     * @param id Identificador del slide a eliminar.
     * @return true si la eliminación fue exitosa, false en caso de error.
     */
    public boolean deleteSlide(int id) {
        String query = "DELETE FROM carousel_slides WHERE id = ?";
        try (Connection conn = Conexion.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {
            stmt.setInt(1, id);
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            // Error: No se pudo eliminar el slide
            e.printStackTrace();
            return false;
        }
    }

    /**
     * Convierte la fila actual de un ResultSet en un objeto CarouselSlide.
     * @param rs ResultSet posicionado en la fila a mapear.
     * @return CarouselSlide con los datos de la fila.
     * @throws SQLException Si ocurre un error leyendo la fila.
     */
    private CarouselSlide mapRow(ResultSet rs) throws SQLException {
        CarouselSlide slide = new CarouselSlide();
        slide.setId(rs.getInt("id"));
        slide.setTitle(rs.getString("title"));
        slide.setSubtitle(rs.getString("subtitle"));
        slide.setImage(rs.getString("image"));
        slide.setCta(rs.getString("cta"));
        slide.setSectionKey(rs.getString("section_key"));
        slide.setActive(rs.getBoolean("active"));
        slide.setSortOrder(rs.getInt("sort_order"));
        return slide;
    }
}