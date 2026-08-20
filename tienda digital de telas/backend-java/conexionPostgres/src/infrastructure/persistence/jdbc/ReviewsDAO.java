package infrastructure.persistence.jdbc;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

import infrastructure.config.Conexion;
import domain.models.Review;

/**
 * DAO (Data Access Object) para la entidad Review.
 * Gestiona las operaciones CRUD sobre la tabla 'reviews' en la base de datos.
 * Pertenece a la capa de infraestructura/persistencia de la arquitectura
 * Clean Architecture del backend de D&D Textil.
 */
public class ReviewsDAO {

    /**
     * Recupera todas las reseñas de un producto, incluyendo el nombre del
     * usuario autor mediante un JOIN, ordenadas de más reciente a más antigua.
     * @param productId Identificador del producto.
     * @return Lista de reseñas con el nombre del autor incluido.
     */
    public List<Review> getReviewsByProduct(int productId) {
        List<Review> reviews = new ArrayList<>();
        Connection conn = Conexion.getConnection();

        // JOIN con users para incluir el nombre del autor en la respuesta
        String query = "SELECT r.*, u.name as user_name " +
                "FROM reviews r " +
                "JOIN users u ON u.id = r.user_id " +
                "WHERE r.product_id = ? " +
                "ORDER BY r.created_at DESC, r.id DESC";

        try (PreparedStatement stmt = conn.prepareStatement(query)) {
            stmt.setInt(1, productId);
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    Review review = new Review();
                    review.setId(rs.getInt("id"));
                    review.setProductId(rs.getInt("product_id"));
                    review.setUserId(rs.getInt("user_id"));
                    review.setUserName(rs.getString("user_name"));
                    review.setRating(rs.getInt("rating"));
                    review.setComment(rs.getString("comment"));
                    review.setCreatedAt(rs.getTimestamp("created_at") != null
                            ? rs.getTimestamp("created_at").toString() : null);
                    reviews.add(review);
                }
            }
        } catch (SQLException e) {
            // Error: Fallo la consulta de reseñas (problema de BD o conexion)
            e.printStackTrace();
        }
        return reviews;
    }

    /**
     * Inserta una nueva reseña en la base de datos.
     * @param review Objeto Review con productId, userId, rating y comment.
     * @return true si la insercion fue exitosa, false en caso de error.
     */
    public boolean addReview(Review review) {
        String query = "INSERT INTO reviews (product_id, user_id, rating, comment) VALUES (?, ?, ?, ?)";
        try (Connection conn = Conexion.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {
            stmt.setInt(1, review.getProductId());
            stmt.setInt(2, review.getUserId());
            stmt.setInt(3, review.getRating());
            stmt.setString(4, review.getComment());
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            // Error: No se pudo insertar la reseña (problema de BD, FK inexistente)
            e.printStackTrace();
            return false;
        }
    }

    /**
     * Verifica si un usuario ya reseñó un producto, para evitar duplicados.
     * @param productId Identificador del producto.
     * @param userId    Identificador del usuario.
     * @return true si el usuario ya tiene una reseña en ese producto.
     */
    public boolean userHasReviewed(int productId, int userId) {
        String query = "SELECT COUNT(*) FROM reviews WHERE product_id = ? AND user_id = ?";
        try (Connection conn = Conexion.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {
            stmt.setInt(1, productId);
            stmt.setInt(2, userId);
            try (ResultSet rs = stmt.executeQuery()) {
                return rs.next() && rs.getInt(1) > 0;
            }
        } catch (SQLException e) {
            // Error: Fallo la consulta de reseñas existentes
            e.printStackTrace();
            return false;
        }
    }
}