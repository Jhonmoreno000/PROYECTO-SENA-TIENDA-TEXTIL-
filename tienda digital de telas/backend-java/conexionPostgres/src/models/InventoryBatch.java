package models;

public class InventoryBatch {
    private String id;
    private String fabricType;
    private String supplier;
    private double initialMeters;
    private double currentMeters;
    private String status;
    private String createdAt;
    private String lastUpdate;

    public InventoryBatch() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getFabricType() { return fabricType; }
    public void setFabricType(String fabricType) { this.fabricType = fabricType; }
    public String getSupplier() { return supplier; }
    public void setSupplier(String supplier) { this.supplier = supplier; }
    public double getInitialMeters() { return initialMeters; }
    public void setInitialMeters(double initialMeters) { this.initialMeters = initialMeters; }
    public double getCurrentMeters() { return currentMeters; }
    public void setCurrentMeters(double currentMeters) { this.currentMeters = currentMeters; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
    public String getLastUpdate() { return lastUpdate; }
    public void setLastUpdate(String lastUpdate) { this.lastUpdate = lastUpdate; }
}
