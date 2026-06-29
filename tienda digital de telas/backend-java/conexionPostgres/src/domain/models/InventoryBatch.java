package domain.models;

/**
 * Modelo que representa un lote de inventario de tela en el almacén.
 * Mapea a la tabla "inventory_batches" en la base de datos PostgreSQL.
 * Controla el ingreso, consumo y estado de cada rollo o lote de tela.
 */
public class InventoryBatch {
    /** Identificador único del lote (código alfanumérico, ej: "LOTE-001"). */
    private String id;
    /** Tipo de tela o material del lote (ej: "Algodón 100%", "Poliéster"). */
    private String fabricType;
    /** Nombre del proveedor que suministró el lote. */
    private String supplier;
    /** Cantidad inicial en metros del lote al momento de ingreso. */
    private double initialMeters;
    /** Cantidad actual disponible en metros (se reduce con cada consumo). */
    private double currentMeters;
    /** Estado del lote: "available", "low", "depleted", "reserved". */
    private String status;
    /** Fecha y hora de registro del lote en el sistema. */
    private String createdAt;
    /** Fecha y hora de la última modificación del lote. */
    private String lastUpdate;

    /** Constructor vacío requerido por frameworks de serialización. */
    public InventoryBatch() {}

    /** Obtiene el identificador único del lote. */
    public String getId() { return id; }
    /** Asigna el identificador único del lote. */
    public void setId(String id) { this.id = id; }
    /** Obtiene el tipo de tela del lote. */
    public String getFabricType() { return fabricType; }
    /** Asigna el tipo de tela del lote. */
    public void setFabricType(String fabricType) { this.fabricType = fabricType; }
    /** Obtiene el nombre del proveedor. */
    public String getSupplier() { return supplier; }
    /** Asigna el nombre del proveedor. */
    public void setSupplier(String supplier) { this.supplier = supplier; }
    /** Obtiene los metros iniciales del lote. */
    public double getInitialMeters() { return initialMeters; }
    /** Asigna los metros iniciales del lote. */
    public void setInitialMeters(double initialMeters) { this.initialMeters = initialMeters; }
    /** Obtiene los metros actuales disponibles. */
    public double getCurrentMeters() { return currentMeters; }
    /** Asigna los metros actuales disponibles. */
    public void setCurrentMeters(double currentMeters) { this.currentMeters = currentMeters; }
    /** Obtiene el estado del lote. */
    public String getStatus() { return status; }
    /** Asigna el estado del lote. */
    public void setStatus(String status) { this.status = status; }
    /** Obtiene la fecha de creación del lote. */
    public String getCreatedAt() { return createdAt; }
    /** Asigna la fecha de creación del lote. */
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
    /** Obtiene la fecha de última actualización. */
    public String getLastUpdate() { return lastUpdate; }
    /** Asigna la fecha de última actualización. */
    public void setLastUpdate(String lastUpdate) { this.lastUpdate = lastUpdate; }
}
