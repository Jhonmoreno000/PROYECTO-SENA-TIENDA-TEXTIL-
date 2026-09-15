package dominio.modelos;

import com.google.gson.annotations.SerializedName;

/**
 * Modelo que representa una reseña o valoración de un producto.
 * Mapea a la tabla "reviews" en PostgreSQL.
 */
public class Resena {
    /** Identificador único de la reseña. */
    @SerializedName(value = "id", alternate = {"idResena"})
    private int id;

    /** Identificador del producto reseñado. */
    @SerializedName(value = "productId", alternate = {"idProducto"})
    private int idProducto;

    /** Identificador del usuario que escribió la reseña. */
    @SerializedName(value = "userId", alternate = {"idUsuario"})
    private int idUsuario;

    /** Nombre del usuario que escribió la reseña. */
    @SerializedName(value = "userName", alternate = {"nombreUsuario"})
    private String nombreUsuario;

    /** Calificación en estrellas (1 a 5). */
    @SerializedName(value = "rating", alternate = {"calificacion"})
    private int calificacion;

    /** Comentario de la reseña. */
    @SerializedName(value = "comment", alternate = {"comentario"})
    private String comentario;

    /** Fecha y hora de creación. */
    @SerializedName(value = "createdAt", alternate = {"fechaCreacion"})
    private String fechaCreacion;

    /** Constructor vacío. */
    public Resena() {}

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public int getIdProducto() { return idProducto; }
    public void setIdProducto(int idProducto) { this.idProducto = idProducto; }

    public int getIdUsuario() { return idUsuario; }
    public void setIdUsuario(int idUsuario) { this.idUsuario = idUsuario; }

    public String getNombreUsuario() { return nombreUsuario; }
    public void setNombreUsuario(String nombreUsuario) { this.nombreUsuario = nombreUsuario; }

    public int getCalificacion() { return calificacion; }
    public void setCalificacion(int calificacion) { this.calificacion = calificacion; }

    public String getComentario() { return comentario; }
    public void setComentario(String comentario) { this.comentario = comentario; }

    public String getFechaCreacion() { return fechaCreacion; }
    public void setFechaCreacion(String fechaCreacion) { this.fechaCreacion = fechaCreacion; }

    // Métodos alias para compatibilidad
    public int getProductId() { return getIdProducto(); }
    public void setProductId(int id) { setIdProducto(id); }
    public int getUserId() { return getIdUsuario(); }
    public void setUserId(int id) { setIdUsuario(id); }
    public String getUserName() { return getNombreUsuario(); }
    public void setUserName(String name) { setNombreUsuario(name); }
    public int getRating() { return getCalificacion(); }
    public void setRating(int r) { setCalificacion(r); }
    public String getComment() { return getComentario(); }
    public void setComment(String c) { setComentario(c); }
    public String getCreatedAt() { return getFechaCreacion(); }
    public void setCreatedAt(String date) { setFechaCreacion(date); }
}
