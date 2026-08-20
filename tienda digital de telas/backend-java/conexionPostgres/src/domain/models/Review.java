package domain.models;

/**
 * Modelo que representa una reseña (review) de un producto de la tienda.
 * Mapea a la tabla "reviews" en la base de datos PostgreSQL.
 * Una reseña la escribe un usuario registrado sobre un producto específico,
 * con una calificación de 1 a 5 estrellas y un comentario.
 */
public class Review {
    /** Identificador único de la reseña (clave primaria en BD). */
    private int id;
    /** Identificador del producto reseñado (clave foránea a products). */
    private int productId;
    /** Identificador del usuario que escribió la reseña (clave foránea a users). */
    private int userId;
    /** Nombre del usuario que escribió la reseña (se une desde la tabla users). */
    private String userName;
    /** Calificación en estrellas (1 a 5). */
    private int rating;
    /** Comentario del usuario sobre el producto. */
    private String comment;
    /** Fecha y hora de creación de la reseña. */
    private String createdAt;

    /** Constructor vacío requerido por Gson para la deserialización. */
    public Review() {}

    /** Obtiene el identificador único de la reseña. */
    public int getId() { return id; }
    /** Asigna el identificador único de la reseña. */
    public void setId(int id) { this.id = id; }
    /** Obtiene el identificador del producto reseñado. */
    public int getProductId() { return productId; }
    /** Asigna el identificador del producto reseñado. */
    public void setProductId(int productId) { this.productId = productId; }
    /** Obtiene el identificador del usuario que escribió la reseña. */
    public int getUserId() { return userId; }
    /** Asigna el identificador del usuario que escribió la reseña. */
    public void setUserId(int userId) { this.userId = userId; }
    /** Obtiene el nombre del usuario que escribió la reseña. */
    public String getUserName() { return userName; }
    /** Asigna el nombre del usuario que escribió la reseña. */
    public void setUserName(String userName) { this.userName = userName; }
    /** Obtiene la calificación en estrellas (1 a 5). */
    public int getRating() { return rating; }
    /** Asigna la calificación en estrellas (1 a 5). */
    public void setRating(int rating) { this.rating = rating; }
    /** Obtiene el comentario de la reseña. */
    public String getComment() { return comment; }
    /** Asigna el comentario de la reseña. */
    public void setComment(String comment) { this.comment = comment; }
    /** Obtiene la fecha y hora de creación de la reseña. */
    public String getCreatedAt() { return createdAt; }
    /** Asigna la fecha y hora de creación de la reseña. */
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
}