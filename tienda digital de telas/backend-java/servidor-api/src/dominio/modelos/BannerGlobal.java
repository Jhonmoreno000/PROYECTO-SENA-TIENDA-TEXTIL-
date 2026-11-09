package dominio.modelos;

import com.google.gson.annotations.SerializedName;

/**
 * Modelo de dominio que representa el banner global informativo o promocional de la tienda.
 * Mapea a la tabla `banner_global` en PostgreSQL.
 */
public class BannerGlobal {

    /** Identificador único del banner (`int`). */
    @SerializedName(value = "id", alternate = {"idBanner"})
    private int id;

    /** Indica si el banner se encuentra activo y visible (`boolean`). */
    @SerializedName(value = "enabled", alternate = {"habilitado", "activo", "active"})
    private boolean habilitado;

    /** Texto informativo o promocional mostrado en el banner (`String`). */
    @SerializedName(value = "message", alternate = {"mensaje"})
    private String mensaje;

    /** Estilo visual del banner (`String`: `"info"`, `"warning"`, `"success"`, `"promo"`). */
    @SerializedName(value = "bannerType", alternate = {"tipoBanner"})
    private String tipoBanner;

    /** Fecha y hora de última modificación del banner (`String`). */
    @SerializedName(value = "updatedAt", alternate = {"fechaActualizacion"})
    private String fechaActualizacion;

    /**
     * Constructor vacío requerido para serialización JSON y mapeo JDBC.
     */
    public BannerGlobal() {}

    /**
     * Obtiene el identificador único del banner.
     *
     * @return Identificador numérico (`int`).
     */
    public int getId() { return id; }

    /**
     * Establece el identificador único del banner.
     *
     * @param id Identificador numérico (`int`).
     */
    public void setId(int id) { this.id = id; }

    /**
     * Indica si el banner está habilitado.
     *
     * @return `true` si está activo; `false` en caso contrario.
     */
    public boolean isHabilitado() { return habilitado; }

    /**
     * Establece si el banner está habilitado.
     *
     * @param habilitado Estado de visibilidad (`boolean`).
     */
    public void setHabilitado(boolean habilitado) { this.habilitado = habilitado; }

    /**
     * Obtiene el mensaje del banner.
     *
     * @return Texto del mensaje (`String`).
     */
    public String getMensaje() { return mensaje; }

    /**
     * Establece el mensaje del banner.
     *
     * @param mensaje Texto del mensaje (`String`).
     */
    public void setMensaje(String mensaje) { this.mensaje = mensaje; }

    /**
     * Obtiene el tipo visual del banner.
     *
     * @return Tipo de banner (`String`).
     */
    public String getTipoBanner() { return tipoBanner; }

    /**
     * Establece el tipo visual del banner.
     *
     * @param tipoBanner Tipo de banner (`String`).
     */
    public void setTipoBanner(String tipoBanner) { this.tipoBanner = tipoBanner; }

    /**
     * Obtiene la fecha de última actualización.
     *
     * @return Marca de tiempo (`String`).
     */
    public String getFechaActualizacion() { return fechaActualizacion; }

    /**
     * Establece la fecha de última actualización.
     *
     * @param fechaActualizacion Marca de tiempo (`String`).
     */
    public void setFechaActualizacion(String fechaActualizacion) { this.fechaActualizacion = fechaActualizacion; }
}
