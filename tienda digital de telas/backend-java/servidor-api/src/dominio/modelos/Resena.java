package dominio.modelos;

import com.google.gson.annotations.SerializedName;

/**
 * Modelo de dominio que representa una reseña y calificación de un producto textil.
 * Mapea a la tabla `resenas` en PostgreSQL.
 */
public class Resena {

    /** Identificador único de la reseña (`int`). */
    @SerializedName(value = "id", alternate = {"idResena"})
    private int id;

    /** Identificador del producto reseñado (`int`). */
    @SerializedName(value = "productId", alternate = {"idProducto"})
    private int idProducto;

    /** Identificador del usuario autor de la reseña (`int`). */
    @SerializedName(value = "userId", alternate = {"idUsuario"})
    private int idUsuario;

    /** Nombre visible del autor obtenido mediante `JOIN` (`String`). */
    @SerializedName(value = "userName", alternate = {"nombreUsuario", "author"})
    private String nombreUsuario;

    /** Calificación otorgada en escala de 1 a 5 estrellas (`int`). */
    @SerializedName(value = "rating", alternate = {"calificacion"})
    private int calificacion;

    /** Comentario u opinión escrita sobre la tela (`String`). */
    @SerializedName(value = "comment", alternate = {"comentario"})
    private String comentario;

    /** Fecha y hora de publicación de la reseña (`String`). */
    @SerializedName(value = "createdAt", alternate = {"fechaCreacion", "date"})
    private String fechaCreacion;

    /**
     * Constructor vacío requerido para serialización JSON y mapeo JDBC.
     */
    public Resena() {}

    /**
     * Obtiene el identificador único de la reseña.
     *
     * @return Identificador numérico (`int`).
     */
    public int getId() { return id; }

    /**
     * Establece el identificador único de la reseña.
     *
     * @param id Identificador numérico (`int`).
     */
    public void setId(int id) { this.id = id; }

    /**
     * Obtiene el identificador del producto reseñado.
     *
     * @return Identificador del producto (`int`).
     */
    public int getIdProducto() { return idProducto; }

    /**
     * Establece el identificador del producto reseñado.
     *
     * @param idProducto Identificador del producto (`int`).
     */
    public void setIdProducto(int idProducto) { this.idProducto = idProducto; }

    /**
     * Obtiene el identificador del usuario autor.
     *
     * @return Identificador del usuario (`int`).
     */
    public int getIdUsuario() { return idUsuario; }

    /**
     * Establece el identificador del usuario autor.
     *
     * @param idUsuario Identificador del usuario (`int`).
     */
    public void setIdUsuario(int idUsuario) { this.idUsuario = idUsuario; }

    /**
     * Obtiene el nombre del usuario autor.
     *
     * @return Nombre del usuario (`String`).
     */
    public String getNombreUsuario() { return nombreUsuario; }

    /**
     * Establece el nombre del usuario autor.
     *
     * @param nombreUsuario Nombre del usuario (`String`).
     */
    public void setNombreUsuario(String nombreUsuario) { this.nombreUsuario = nombreUsuario; }

    /**
     * Obtiene la calificación en estrellas (1 a 5).
     *
     * @return Calificación (`int`).
     */
    public int getCalificacion() { return calificacion; }

    /**
     * Establece la calificación en estrellas (1 a 5).
     *
     * @param calificacion Calificación (`int`).
     */
    public void setCalificacion(int calificacion) { this.calificacion = calificacion; }

    /**
     * Obtiene el comentario de la reseña.
     *
     * @return Comentario (`String`).
     */
    public String getComentario() { return comentario; }

    /**
     * Establece el comentario de la reseña.
     *
     * @param comentario Comentario (`String`).
     */
    public void setComentario(String comentario) { this.comentario = comentario; }

    /**
     * Obtiene la fecha de creación de la reseña.
     *
     * @return Fecha de creación (`String`).
     */
    public String getFechaCreacion() { return fechaCreacion; }

    /**
     * Establece la fecha de creación de la reseña.
     *
     * @param fechaCreacion Fecha de creación (`String`).
     */
    public void setFechaCreacion(String fechaCreacion) { this.fechaCreacion = fechaCreacion; }
}

