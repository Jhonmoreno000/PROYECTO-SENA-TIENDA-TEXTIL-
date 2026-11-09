package dominio.modelos;

import com.google.gson.annotations.SerializedName;

/**
 * Modelo de dominio que define los umbrales mínimos de metraje para disparar alertas de stock.
 * Mapea a la tabla `umbrales_stock` en PostgreSQL.
 */
public class UmbralStock {

    /** Identificador único del umbral (`int`). */
    @SerializedName(value = "id", alternate = {"idUmbral"})
    private int id;

    /** Nombre o categoría de tela sobre la que aplica el umbral (`String`). */
    @SerializedName(value = "fabricType", alternate = {"tipoTela"})
    private String tipoTela;

    /** Cantidad mínima de metros antes de activar la alerta de reposición (`double`). */
    @SerializedName(value = "minMeters", alternate = {"metrosMinimos"})
    private double metrosMinimos;

    /** Indica si la notificación de alerta está activa para este tipo de tela (`boolean`). */
    @SerializedName(value = "alertEnabled", alternate = {"alertaHabilitada", "alertaActiva"})
    private boolean alertaHabilitada;

    /**
     * Constructor vacío requerido para serialización JSON y mapeo JDBC.
     */
    public UmbralStock() {}

    /**
     * Obtiene el identificador único del umbral.
     *
     * @return Identificador numérico (`int`).
     */
    public int getId() { return id; }

    /**
     * Establece el identificador único del umbral.
     *
     * @param id Identificador numérico (`int`).
     */
    public void setId(int id) { this.id = id; }

    /**
     * Obtiene el tipo de tela asociado al umbral.
     *
     * @return Tipo de tela (`String`).
     */
    public String getTipoTela() { return tipoTela; }

    /**
     * Establece el tipo de tela asociado al umbral.
     *
     * @param tipoTela Tipo de tela (`String`).
     */
    public void setTipoTela(String tipoTela) { this.tipoTela = tipoTela; }

    /**
     * Obtiene el metraje mínimo configurado.
     *
     * @return Metros mínimos (`double`).
     */
    public double getMetrosMinimos() { return metrosMinimos; }

    /**
     * Establece el metraje mínimo configurado.
     *
     * @param metrosMinimos Metros mínimos (`double`).
     */
    public void setMetrosMinimos(double metrosMinimos) { this.metrosMinimos = metrosMinimos; }

    /**
     * Indica si la alerta de stock bajo está habilitada.
     *
     * @return `true` si la alerta está activa; `false` en caso contrario.
     */
    public boolean isAlertaHabilitada() { return alertaHabilitada; }

    /**
     * Establece si la alerta de stock bajo está habilitada.
     *
     * @param alertaHabilitada Estado de la alerta (`boolean`).
     */
    public void setAlertaHabilitada(boolean alertaHabilitada) { this.alertaHabilitada = alertaHabilitada; }
}
