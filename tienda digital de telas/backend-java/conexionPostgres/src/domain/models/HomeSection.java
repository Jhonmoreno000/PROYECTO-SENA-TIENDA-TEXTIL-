package domain.models;

/**
 * Modelo que representa un apartado del inicio de D&D Textil.
 * Los apartados son las secciones de productos del Home (Nuevas Colecciones,
 * Telas Exclusivas, Ofertas Especiales). Cada uno tiene un título, subtítulo
 * y estado de visibilidad, y agrupa productos por un flag booleano.
 * Mapea a la tabla "home_sections".
 */
public class HomeSection {
    /** Clave única del apartado ('nuevas', 'exclusivas', 'ofertas'). */
    private String key;
    /** Título del apartado mostrado en el Home y el Catálogo. */
    private String title;
    /** Subtítulo de apoyo del apartado. */
    private String subtitle;
    /** Indica si el apartado está activo y se muestra. */
    private boolean active;
    /** Orden de visualización de los apartados. */
    private int sortOrder;

    /** Constructor vacío. */
    public HomeSection() {}

    /** Constructor con los datos principales del apartado. */
    public HomeSection(String key, String title, String subtitle, boolean active, int sortOrder) {
        this.key = key;
        this.title = title;
        this.subtitle = subtitle;
        this.active = active;
        this.sortOrder = sortOrder;
    }

    /** Obtiene la clave única del apartado. */
    public String getKey() { return key; }
    /** Asigna la clave única del apartado. */
    public void setKey(String key) { this.key = key; }
    /** Obtiene el título del apartado. */
    public String getTitle() { return title; }
    /** Asigna el título del apartado. */
    public void setTitle(String title) { this.title = title; }
    /** Obtiene el subtítulo del apartado. */
    public String getSubtitle() { return subtitle; }
    /** Asigna el subtítulo del apartado. */
    public void setSubtitle(String subtitle) { this.subtitle = subtitle; }
    /** Indica si el apartado está activo. */
    public boolean isActive() { return active; }
    /** Asigna si el apartado está activo. */
    public void setActive(boolean active) { this.active = active; }
    /** Obtiene el orden de visualización. */
    public int getSortOrder() { return sortOrder; }
    /** Asigna el orden de visualización. */
    public void setSortOrder(int sortOrder) { this.sortOrder = sortOrder; }
}