package dominio.modelos;

import com.google.gson.annotations.SerializedName;

/**
 * Modelo que define los umbrales mínimos de inventario para alertas de stock.
 * Mapea a la tabla "stock_thresholds" en PostgreSQL.
 */
public class UmbralStock {
    /** Identificador único del umbral. */
    @SerializedName(value = "id", alternate = {"idUmbral"})
    private int id;

    /** Tipo de tela al que aplica este umbral. */
    @SerializedName(value = "fabricType", alternate = {"tipoTela"})
    private String tipoTela;

    /** Cantidad mínima en metros para disparar la alerta. */
    @SerializedName(value = "minMeters", alternate = {"metrosMinimos"})
    private double metrosMinimos;

    /** Indica si la alerta de stock bajo está habilitada. */
    @SerializedName(value = "alertEnabled", alternate = {"alertaHabilitada"})
    private boolean alertaHabilitada;

    /** Constructor vacío. */
    public UmbralStock() {}

    /** Obtiene el identificador único. */
    public int getId() { return id; }
    /** Asigna el identificador único. */
    public void setId(int id) { this.id = id; }

    /** Obtiene el tipo de tela. */
    public String getTipoTela() { return tipoTela; }
    /** Asigna el tipo de tela. */
    public void setTipoTela(String tipoTela) { this.tipoTela = tipoTela; }

    /** Obtiene los metros mínimos. */
    public double getMetrosMinimos() { return metrosMinimos; }
    /** Asigna los metros mínimos. */
    public void setMetrosMinimos(double metrosMinimos) { this.metrosMinimos = metrosMinimos; }

    /** Indica si la alerta está habilitada. */
    public boolean isAlertaHabilitada() { return alertaHabilitada; }
    /** Asigna si la alerta está habilitada. */
    public void setAlertaHabilitada(boolean alertaHabilitada) { this.alertaHabilitada = alertaHabilitada; }
}
