package domain.models;

/**
 * Modelo que define los umbrales mínimos de inventario para alertas de stock.
 * Mapea a la tabla "stock_thresholds" en la base de datos PostgreSQL.
 * Cuando el inventario de un tipo de tela cae por debajo del mínimo, se genera una alerta.
 */
public class StockThreshold {
    /** Identificador único del umbral (clave primaria autoincremental). */
    private int id;
    /** Tipo de tela al que aplica este umbral (ej: "Algodón", "Poliéster"). */
    private String fabricType;
    /** Cantidad mínima en metros. Si el stock baja de este valor, se dispara la alerta. */
    private double minMeters;
    /** Indica si la alerta de stock bajo está habilitada para este umbral. */
    private boolean alertEnabled;

    /** Constructor vacío requerido por frameworks de serialización. */
    public StockThreshold() {}

    /** Obtiene el identificador único del umbral. */
    public int getId() { return id; }
    /** Asigna el identificador único del umbral. */
    public void setId(int id) { this.id = id; }
    /** Obtiene el tipo de tela del umbral. */
    public String getFabricType() { return fabricType; }
    /** Asigna el tipo de tela del umbral. */
    public void setFabricType(String fabricType) { this.fabricType = fabricType; }
    /** Obtiene la cantidad mínima en metros. */
    public double getMinMeters() { return minMeters; }
    /** Asigna la cantidad mínima en metros. */
    public void setMinMeters(double minMeters) { this.minMeters = minMeters; }
    /** Indica si la alerta está habilitada. */
    public boolean isAlertEnabled() { return alertEnabled; }
    /** Habilita o deshabilita la alerta para este umbral. */
    public void setAlertEnabled(boolean alertEnabled) { this.alertEnabled = alertEnabled; }
}
