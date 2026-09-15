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
 * Opera sobre la tabla 'carousel_slides'.
 */
public class CarruselDAO {

    /**
     * Recupera las diapositivas activas ordenadas por su posición.
     */
    public List<DiapositivaCarrusel> obtenerDiapositivasActivas() {
        List<DiapositivaCarrusel> diapositivas = new ArrayList<>();
        String consulta = "SELECT * FROM carousel_slides WHERE active = true ORDER BY sort_order ASC, id ASC";

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
     * Recupera todas las diapositivas (activas e inactivas).
     */
    public List<DiapositivaCarrusel> obtenerTodasLasDiapositivas() {
        List<DiapositivaCarrusel> diapositivas = new ArrayList<>();
        String consulta = "SELECT * FROM carousel_slides ORDER BY sort_order ASC, id ASC";

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
     * Inserta una nueva diapositiva en la base de datos.
     */
    public boolean agregarDiapositiva(DiapositivaCarrusel diapositiva) {
        String consulta = "INSERT INTO carousel_slides (title, subtitle, image, cta, section_key, active, sort_order) " +
                "VALUES (?, ?, ?, ?, ?, ?, ?)";
        try (Connection con = Conexion.obtenerConexion();
             PreparedStatement pst = con.prepareStatement(consulta, Statement.RETURN_GENERATED_KEYS)) {
            pst.setString(1, diapositiva.getTitulo());
            pst.setString(2, diapositiva.getSubtitulo());
            pst.setString(3, diapositiva.getImagen());
            pst.setString(4, diapositiva.getTextoBoton());
            pst.setString(5, diapositiva.getClaveSeccion());
            pst.setBoolean(6, diapositiva.isActivo());
            pst.setInt(7, diapositiva.getOrden());
            return pst.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    /**
     * Actualiza una diapositiva existente.
     */
    public boolean actualizarDiapositiva(int id, DiapositivaCarrusel diapositiva, Boolean activo) {
        String consulta = "UPDATE carousel_slides SET " +
                "title = COALESCE(?, title), " +
                "subtitle = COALESCE(?, subtitle), " +
                "image = COALESCE(?, image), " +
                "cta = COALESCE(?, cta), " +
                "section_key = COALESCE(?, section_key), " +
                "active = COALESCE(?, active), " +
                "sort_order = COALESCE(?, sort_order) " +
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
     * Elimina una diapositiva.
     */
    public boolean eliminarDiapositiva(int id) {
        String consulta = "DELETE FROM carousel_slides WHERE id = ?";
        try (Connection con = Conexion.obtenerConexion();
             PreparedStatement pst = con.prepareStatement(consulta)) {
            pst.setInt(1, id);
            return pst.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    private DiapositivaCarrusel mapearFila(ResultSet rs) throws SQLException {
        DiapositivaCarrusel slide = new DiapositivaCarrusel();
        slide.setId(rs.getInt("id"));
        slide.setTitulo(rs.getString("title"));
        slide.setSubtitulo(rs.getString("subtitle"));
        slide.setImagen(rs.getString("image"));
        slide.setTextoBoton(rs.getString("cta"));
        slide.setClaveSeccion(rs.getString("section_key"));
        slide.setActivo(rs.getBoolean("active"));
        slide.setOrden(rs.getInt("sort_order"));
        return slide;
    }

    // Métodos alias para compatibilidad
    public List<DiapositivaCarrusel> getActiveSlides() { return obtenerDiapositivasActivas(); }
    public List<DiapositivaCarrusel> getAllSlides() { return obtenerTodasLasDiapositivas(); }
    public boolean addSlide(DiapositivaCarrusel slide) { return agregarDiapositiva(slide); }
    public boolean updateSlide(int id, DiapositivaCarrusel slide, Boolean active) { return actualizarDiapositiva(id, slide, active); }
    public boolean deleteSlide(int id) { return eliminarDiapositiva(id); }
}
