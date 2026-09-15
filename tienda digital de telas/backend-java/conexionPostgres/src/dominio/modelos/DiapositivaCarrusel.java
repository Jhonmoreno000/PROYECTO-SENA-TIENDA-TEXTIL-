package dominio.modelos;

import com.google.gson.annotations.SerializedName;

/**
 * Modelo que representa una diapositiva del carrusel de inicio.
 * Mapea a la tabla "carousel_slides" en PostgreSQL.
 */
public class DiapositivaCarrusel {
    /** Identificador único del slide. */
    @SerializedName(value = "id", alternate = {"idDiapositiva"})
    private int id;

    /** Título principal del slide. */
    @SerializedName(value = "title", alternate = {"titulo"})
    private String titulo;

    /** Subtítulo de apoyo mostrado bajo el título. */
    @SerializedName(value = "subtitle", alternate = {"subtitulo"})
    private String subtitulo;

    /** URL de la imagen de fondo del slide. */
    @SerializedName(value = "image", alternate = {"imagen", "urlImagen"})
    private String imagen;

    /** Texto del botón de acción (Call to Action). */
    @SerializedName(value = "cta", alternate = {"textoBoton"})
    private String textoBoton;

    /** Clave de la sección del catálogo a la que enlaza. */
    @SerializedName(value = "sectionKey", alternate = {"claveSeccion"})
    private String claveSeccion;

    /** Indica si el slide está activo. */
    @SerializedName(value = "active", alternate = {"activo"})
    private boolean activo;

    /** Orden de visualización en el carrusel. */
    @SerializedName(value = "sortOrder", alternate = {"orden"})
    private int orden;

    /** Constructor vacío. */
    public DiapositivaCarrusel() {}

    /** Constructor con datos principales. */
    public DiapositivaCarrusel(String titulo, String subtitulo, String imagen, String textoBoton, String claveSeccion, boolean activo, int orden) {
        this.titulo = titulo;
        this.subtitulo = subtitulo;
        this.imagen = imagen;
        this.textoBoton = textoBoton;
        this.claveSeccion = claveSeccion;
        this.activo = activo;
        this.orden = orden;
    }

    /** Obtiene el identificador único. */
    public int getId() { return id; }
    /** Asigna el identificador único. */
    public void setId(int id) { this.id = id; }

    /** Obtiene el título. */
    public String getTitulo() { return titulo; }
    /** Asigna el título. */
    public void setTitulo(String titulo) { this.titulo = titulo; }

    /** Obtiene el subtítulo. */
    public String getSubtitulo() { return subtitulo; }
    /** Asigna el subtítulo. */
    public void setSubtitulo(String subtitulo) { this.subtitulo = subtitulo; }

    /** Obtiene la imagen. */
    public String getImagen() { return imagen; }
    /** Asigna la imagen. */
    public void setImagen(String imagen) { this.imagen = imagen; }

    /** Obtiene el texto del botón. */
    public String getTextoBoton() { return textoBoton; }
    /** Asigna el texto del botón. */
    public void setTextoBoton(String textoBoton) { this.textoBoton = textoBoton; }

    /** Obtiene la clave de sección. */
    public String getClaveSeccion() { return claveSeccion; }
    /** Asigna la clave de sección. */
    public void setClaveSeccion(String claveSeccion) { this.claveSeccion = claveSeccion; }

    /** Indica si está activo. */
    public boolean isActivo() { return activo; }
    /** Asigna estado activo. */
    public void setActivo(boolean activo) { this.activo = activo; }

    /** Obtiene el orden de visualización. */
    public int getOrden() { return orden; }
    /** Asigna el orden de visualización. */
    public void setOrden(int orden) { this.orden = orden; }

    // Métodos alias para compatibilidad
    public String getTitle() { return getTitulo(); }
    public void setTitle(String title) { setTitulo(title); }
    public String getSubtitle() { return getSubtitulo(); }
    public void setSubtitle(String subtitle) { setSubtitulo(subtitle); }
    public String getImage() { return getImagen(); }
    public void setImage(String image) { setImagen(image); }
    public String getCta() { return getTextoBoton(); }
    public void setCta(String cta) { setTextoBoton(cta); }
    public String getSectionKey() { return getClaveSeccion(); }
    public void setSectionKey(String sectionKey) { setClaveSeccion(sectionKey); }
    public boolean isActive() { return isActivo(); }
    public int getSortOrder() { return getOrden(); }
    public void setSortOrder(int sortOrder) { setOrden(sortOrder); }
}
