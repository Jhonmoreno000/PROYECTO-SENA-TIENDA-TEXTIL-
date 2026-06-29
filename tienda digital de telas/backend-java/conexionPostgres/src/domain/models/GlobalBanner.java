package domain.models;

/**
 * Modelo que representa un banner global mostrado en la interfaz de la tienda.
 * Mapea a la tabla "global_banners" en la base de datos PostgreSQL.
 * Se usa para mostrar avisos, promociones o mensajes importantes a todos los usuarios.
 */
public class GlobalBanner {
    /** Identificador único del banner (clave primaria autoincremental). */
    private int id;
    /** Indica si el banner está habilitado y debe mostrarse (true = visible, false = oculto). */
    private boolean enabled;
    /** Contenido del mensaje del banner (HTML o texto plano). */
    private String message;
    /** Tipo de banner: "info", "warning", "success", "promo", etc. Define el estilo visual. */
    private String bannerType;
    /** Fecha y hora de la última actualización del banner. */
    private String updatedAt;

    /** Constructor vacío requerido por frameworks de serialización. */
    public GlobalBanner() {}

    /** Obtiene el identificador único del banner. */
    public int getId() { return id; }
    /** Asigna el identificador único del banner. */
    public void setId(int id) { this.id = id; }
    /** Indica si el banner está habilitado. */
    public boolean isEnabled() { return enabled; }
    /** Habilita o deshabilita la visualización del banner. */
    public void setEnabled(boolean enabled) { this.enabled = enabled; }
    /** Obtiene el mensaje del banner. */
    public String getMessage() { return message; }
    /** Asigna el mensaje del banner. */
    public void setMessage(String message) { this.message = message; }
    /** Obtiene el tipo de banner. */
    public String getBannerType() { return bannerType; }
    /** Asigna el tipo de banner. */
    public void setBannerType(String bannerType) { this.bannerType = bannerType; }
    /** Obtiene la fecha de última actualización. */
    public String getUpdatedAt() { return updatedAt; }
    /** Asigna la fecha de última actualización. */
    public void setUpdatedAt(String updatedAt) { this.updatedAt = updatedAt; }
}
