package dominio.modelos;

import com.google.gson.annotations.SerializedName;

/**
 * Modelo de dominio que representa una diapositiva del carrusel principal de inicio.
 * Mapea a la tabla `diapositivas_carrusel` en PostgreSQL.
 */
public class DiapositivaCarrusel {

    /** Identificador único de la diapositiva (`int`). */
    @SerializedName(value = "id", alternate = {"idDiapositiva"})
    private int id;

    /** Título principal mostrado en la diapositiva (`String`). */
    @SerializedName(value = "title", alternate = {"titulo"})
    private String titulo;

    /** Subtítulo descriptivo de apoyo (`String`). */
    @SerializedName(value = "subtitle", alternate = {"subtitulo"})
    private String subtitulo;

    /** Ruta o URL de la imagen de fondo (`String`). */
    @SerializedName(value = "image", alternate = {"imagen", "urlImagen"})
    private String imagen;

    /** Texto del botón de llamada a la acción (`String`). */
    @SerializedName(value = "cta", alternate = {"textoBoton"})
    private String textoBoton;

    /** Clave de la sección del catálogo vinculada al botón (`String`). */
    @SerializedName(value = "sectionKey", alternate = {"claveSeccion"})
    private String claveSeccion;

    /** Indica si la diapositiva está activa en la portada (`boolean`). */
    @SerializedName(value = "active", alternate = {"activo"})
    private boolean activo;

    /** Posición de ordenamiento dentro del carrusel (`int`). */
    @SerializedName(value = "sortOrder", alternate = {"orden"})
    private int orden;

    /**
     * Constructor vacío requerido para serialización JSON y mapeo JDBC.
     */
    public DiapositivaCarrusel() {}

    /**
     * Construye una diapositiva con sus atributos principales.
     *
     * @param titulo Título principal (`String`).
     * @param subtitulo Subtítulo descriptivo (`String`).
     * @param imagen URL de la imagen (`String`).
     * @param textoBoton Texto del botón CTA (`String`).
     * @param claveSeccion Clave de sección destino (`String`).
     * @param activo Indicador de estado activo (`boolean`).
     * @param orden Posición de visualización (`int`).
     */
    public DiapositivaCarrusel(String titulo, String subtitulo, String imagen, String textoBoton, String claveSeccion, boolean activo, int orden) {
        this.titulo = titulo;
        this.subtitulo = subtitulo;
        this.imagen = imagen;
        this.textoBoton = textoBoton;
        this.claveSeccion = claveSeccion;
        this.activo = activo;
        this.orden = orden;
    }

    /**
     * Obtiene el identificador único de la diapositiva.
     *
     * @return Identificador numérico (`int`).
     */
    public int getId() { return id; }

    /**
     * Establece el identificador único de la diapositiva.
     *
     * @param id Identificador numérico (`int`).
     */
    public void setId(int id) { this.id = id; }

    /**
     * Obtiene el título principal.
     *
     * @return Título (`String`).
     */
    public String getTitulo() { return titulo; }

    /**
     * Establece el título principal.
     *
     * @param titulo Título (`String`).
     */
    public void setTitulo(String titulo) { this.titulo = titulo; }

    /**
     * Obtiene el subtítulo descriptivo.
     *
     * @return Subtítulo (`String`).
     */
    public String getSubtitulo() { return subtitulo; }

    /**
     * Establece el subtítulo descriptivo.
     *
     * @param subtitulo Subtítulo (`String`).
     */
    public void setSubtitulo(String subtitulo) { this.subtitulo = subtitulo; }

    /**
     * Obtiene la URL de la imagen.
     *
     * @return URL de imagen (`String`).
     */
    public String getImagen() { return imagen; }

    /**
     * Establece la URL de la imagen.
     *
     * @param imagen URL de imagen (`String`).
     */
    public void setImagen(String imagen) { this.imagen = imagen; }

    /**
     * Obtiene el texto del botón de acción (CTA).
     *
     * @return Texto del botón (`String`).
     */
    public String getTextoBoton() { return textoBoton; }

    /**
     * Establece el texto del botón de acción (CTA).
     *
     * @param textoBoton Texto del botón (`String`).
     */
    public void setTextoBoton(String textoBoton) { this.textoBoton = textoBoton; }

    /**
     * Obtiene la clave de la sección asociada.
     *
     * @return Clave de sección (`String`).
     */
    public String getClaveSeccion() { return claveSeccion; }

    /**
     * Establece la clave de la sección asociada.
     *
     * @param claveSeccion Clave de sección (`String`).
     */
    public void setClaveSeccion(String claveSeccion) { this.claveSeccion = claveSeccion; }

    /**
     * Indica si la diapositiva está activa.
     *
     * @return `true` si está activa; `false` en caso contrario.
     */
    public boolean isActivo() { return activo; }

    /**
     * Establece si la diapositiva está activa.
     *
     * @param activo Estado activo (`boolean`).
     */
    public void setActivo(boolean activo) { this.activo = activo; }

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

