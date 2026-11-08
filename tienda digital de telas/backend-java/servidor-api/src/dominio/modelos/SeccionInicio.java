package dominio.modelos;

import com.google.gson.annotations.SerializedName;

/**
 * Modelo de dominio que representa una sección configurable de la página de inicio.
 * Mapea a la tabla `secciones_inicio` en PostgreSQL.
 */
public class SeccionInicio {

    /** Clave única identificadora de la sección (`String`: `"nuevas"`, `"exclusivas"`, `"ofertas"`). */
    @SerializedName(value = "key", alternate = {"clave"})
    private String clave;

    /** Título principal mostrado en la portada (`String`). */
    @SerializedName(value = "title", alternate = {"titulo"})
    private String titulo;

    /** Subtítulo descriptivo de la sección (`String`). */
    @SerializedName(value = "subtitle", alternate = {"subtitulo"})
    private String subtitulo;

    /** Indica si la sección se encuentra habilitada y visible (`boolean`). */
    @SerializedName(value = "active", alternate = {"activo", "activa"})
    private boolean activa;

    /** Posición de ordenamiento visual (`int`). */
    @SerializedName(value = "sortOrder", alternate = {"orden"})
    private int orden;

    /**
     * Constructor vacío requerido para serialización JSON y mapeo JDBC.
     */
    public SeccionInicio() {}

    /**
     * Construye una sección de inicio con todos sus atributos.
     *
     * @param clave Clave única de la sección (`String`).
     * @param titulo Título visible (`String`).
     * @param subtitulo Subtítulo descriptivo (`String`).
     * @param activa Estado de visibilidad (`boolean`).
     * @param orden Orden de aparición (`int`).
     */
    public SeccionInicio(String clave, String titulo, String subtitulo, boolean activa, int orden) {
        this.clave = clave;
        this.titulo = titulo;
        this.subtitulo = subtitulo;
        this.activa = activa;
        this.orden = orden;
    }

    /**
     * Obtiene la clave única de la sección.
     *
     * @return Clave (`String`).
     */
    public String getClave() { return clave; }

    /**
     * Establece la clave única de la sección.
     *
     * @param clave Clave (`String`).
     */
    public void setClave(String clave) { this.clave = clave; }

    /**
     * Obtiene el título de la sección.
     *
     * @return Título (`String`).
     */
    public String getTitulo() { return titulo; }

    /**
     * Establece el título de la sección.
     *
     * @param titulo Título (`String`).
     */
    public void setTitulo(String titulo) { this.titulo = titulo; }

    /**
     * Obtiene el subtítulo de la sección.
     *
     * @return Subtítulo (`String`).
     */
    public String getSubtitulo() { return subtitulo; }

    /**
     * Establece el subtítulo de la sección.
     *
     * @param subtitulo Subtítulo (`String`).
     */
    public void setSubtitulo(String subtitulo) { this.subtitulo = subtitulo; }

    /**
     * Indica si la sección está activa.
     *
     * @return `true` si está activa; `false` en caso contrario.
     */
    public boolean isActiva() { return activa; }

    /**
     * Establece si la sección está activa.
     *
     * @param activa Estado activo (`boolean`).
     */
    public void setActiva(boolean activa) { this.activa = activa; }

    /**
     * Obtiene el orden de visualización.
     *
     * @return Orden numérico (`int`).
     */
    public int getOrden() { return orden; }

    /**
     * Establece el orden de visualización.
     *
     * @param orden Orden numérico (`int`).
     */
    public void setOrden(int orden) { this.orden = orden; }
}

