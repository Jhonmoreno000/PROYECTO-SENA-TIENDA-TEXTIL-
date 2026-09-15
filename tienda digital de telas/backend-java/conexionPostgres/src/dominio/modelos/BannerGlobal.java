package dominio.modelos;

import com.google.gson.annotations.SerializedName;

/**
 * Modelo que representa un banner global informativo o promocional.
 * Mapea a la tabla "global_banners" en PostgreSQL.
 */
public class BannerGlobal {
    /** Identificador único del banner. */
    @SerializedName(value = "id", alternate = {"idBanner"})
    private int id;

    /** Indica si el banner está habilitado. */
    @SerializedName(value = "enabled", alternate = {"habilitado", "activo"})
    private boolean habilitado;

    /** Contenido del mensaje del banner. */
    @SerializedName(value = "message", alternate = {"mensaje"})
    private String mensaje;

    /** Tipo de banner: "info", "warning", "success", "promo". */
    @SerializedName(value = "bannerType", alternate = {"tipoBanner"})
    private String tipoBanner;

    /** Fecha y hora de última actualización. */
    @SerializedName(value = "updatedAt", alternate = {"fechaActualizacion"})
    private String fechaActualizacion;

    /** Constructor vacío. */
    public BannerGlobal() {}

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public boolean isHabilitado() { return habilitado; }
    public void setHabilitado(boolean habilitado) { this.habilitado = habilitado; }

    public String getMensaje() { return mensaje; }
    public void setMensaje(String mensaje) { this.mensaje = mensaje; }

    public String getTipoBanner() { return tipoBanner; }
    public void setTipoBanner(String tipoBanner) { this.tipoBanner = tipoBanner; }

    public String getFechaActualizacion() { return fechaActualizacion; }
    public void setFechaActualizacion(String fechaActualizacion) { this.fechaActualizacion = fechaActualizacion; }
}
