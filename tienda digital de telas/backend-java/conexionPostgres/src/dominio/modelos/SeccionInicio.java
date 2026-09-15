package dominio.modelos;

import com.google.gson.annotations.SerializedName;

/**
 * Modelo que representa un apartado/sección del inicio de D&D Textil.
 * Mapea a la tabla "home_sections" en PostgreSQL.
 */
public class SeccionInicio {
    /** Clave única de la sección ('nuevas', 'exclusivas', 'ofertas'). */
    @SerializedName(value = "key", alternate = {"clave"})
    private String clave;

    /** Título de la sección mostrado en el Home. */
    @SerializedName(value = "title", alternate = {"titulo"})
    private String titulo;

    /** Subtítulo descriptivo. */
    @SerializedName(value = "subtitle", alternate = {"subtitulo"})
    private String subtitulo;

    /** Indica si la sección está activa. */
    @SerializedName(value = "active", alternate = {"activo", "activa"})
    private boolean activa;

    /** Orden de visualización. */
    @SerializedName(value = "sortOrder", alternate = {"orden"})
    private int orden;

    /** Constructor vacío. */
    public SeccionInicio() {}

    /** Constructor con datos principales. */
    public SeccionInicio(String clave, String titulo, String subtitulo, boolean activa, int orden) {
        this.clave = clave;
        this.titulo = titulo;
        this.subtitulo = subtitulo;
        this.activa = activa;
        this.orden = orden;
    }

    /** Obtiene la clave única. */
    public String getClave() { return clave; }
    /** Asigna la clave única. */
    public void setClave(String clave) { this.clave = clave; }

    /** Obtiene el título. */
    public String getTitulo() { return titulo; }
    /** Asigna el título. */
    public void setTitulo(String titulo) { this.titulo = titulo; }

    /** Obtiene el subtítulo. */
    public String getSubtitulo() { return subtitulo; }
    /** Asigna el subtítulo. */
    public void setSubtitulo(String subtitulo) { this.subtitulo = subtitulo; }

    /** Indica si está activa. */
    public boolean isActiva() { return activa; }
    /** Asigna si está activa. */
    public void setActiva(boolean activa) { this.activa = activa; }

    /** Obtiene el orden de visualización. */
    public int getOrden() { return orden; }
    /** Asigna el orden de visualización. */
    public void setOrden(int orden) { this.orden = orden; }

    // Métodos alias para compatibilidad
    public String getKey() { return getClave(); }
    public void setKey(String key) { setClave(key); }
    public String getTitle() { return getTitulo(); }
    public void setTitle(String title) { setTitulo(title); }
    public String getSubtitle() { return getSubtitulo(); }
    public void setSubtitle(String subtitle) { setSubtitulo(subtitle); }
    public boolean isActive() { return isActiva(); }
    public int getSortOrder() { return getOrden(); }
    public void setSortOrder(int sortOrder) { setOrden(sortOrder); }
}
