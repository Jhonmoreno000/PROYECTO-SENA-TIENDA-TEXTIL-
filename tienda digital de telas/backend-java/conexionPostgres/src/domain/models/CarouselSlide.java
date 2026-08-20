package domain.models;

/**
 * Modelo que representa una diapositiva del carrusel del Home de D&D Textil.
 * Cada slide corresponde a un "apartado" de la tienda (Nuevas Colecciones,
 * Telas Exclusivas, Ofertas Especiales, etc.) y puede enlazar a una sección
 * del catálogo mediante sectionKey. Mapea a la tabla "carousel_slides".
 */
public class CarouselSlide {
    /** Identificador único del slide. */
    private int id;
    /** Título principal del slide (ej: "Nueva Colección 2024"). */
    private String title;
    /** Subtítulo de apoyo mostrado bajo el título. */
    private String subtitle;
    /** URL de la imagen de fondo del slide. */
    private String image;
    /** Texto del botón de acción (ej: "Ver Más", "Explorar"). */
    private String cta;
    /** Clave de la sección del catálogo a la que lleva el botón ('nuevas', 'exclusivas', 'ofertas' o null). */
    private String sectionKey;
    /** Indica si el slide está activo y se muestra en el Home. */
    private boolean active;
    /** Orden de visualización dentro del carrusel. */
    private int sortOrder;

    /** Constructor vacío. */
    public CarouselSlide() {}

    /** Constructor con los datos principales del slide. */
    public CarouselSlide(String title, String subtitle, String image, String cta, String sectionKey, boolean active, int sortOrder) {
        this.title = title;
        this.subtitle = subtitle;
        this.image = image;
        this.cta = cta;
        this.sectionKey = sectionKey;
        this.active = active;
        this.sortOrder = sortOrder;
    }

    /** Obtiene el identificador único del slide. */
    public int getId() { return id; }
    /** Asigna el identificador único del slide. */
    public void setId(int id) { this.id = id; }
    /** Obtiene el título del slide. */
    public String getTitle() { return title; }
    /** Asigna el título del slide. */
    public void setTitle(String title) { this.title = title; }
    /** Obtiene el subtítulo del slide. */
    public String getSubtitle() { return subtitle; }
    /** Asigna el subtítulo del slide. */
    public void setSubtitle(String subtitle) { this.subtitle = subtitle; }
    /** Obtiene la URL de la imagen de fondo. */
    public String getImage() { return image; }
    /** Asigna la URL de la imagen de fondo. */
    public void setImage(String image) { this.image = image; }
    /** Obtiene el texto del botón de acción. */
    public String getCta() { return cta; }
    /** Asigna el texto del botón de acción. */
    public void setCta(String cta) { this.cta = cta; }
    /** Obtiene la clave de sección del catálogo asociada. */
    public String getSectionKey() { return sectionKey; }
    /** Asigna la clave de sección del catálogo asociada. */
    public void setSectionKey(String sectionKey) { this.sectionKey = sectionKey; }
    /** Indica si el slide está activo. */
    public boolean isActive() { return active; }
    /** Asigna si el slide está activo. */
    public void setActive(boolean active) { this.active = active; }
    /** Obtiene el orden de visualización. */
    public int getSortOrder() { return sortOrder; }
    /** Asigna el orden de visualización. */
    public void setSortOrder(int sortOrder) { this.sortOrder = sortOrder; }
}