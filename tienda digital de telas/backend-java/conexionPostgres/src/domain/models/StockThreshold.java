package domain.models;

public class StockThreshold {
    private int id;
    private String fabricType;
    private double minMeters;
    private boolean alertEnabled;

    public StockThreshold() {}

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }
    public String getFabricType() { return fabricType; }
    public void setFabricType(String fabricType) { this.fabricType = fabricType; }
    public double getMinMeters() { return minMeters; }
    public void setMinMeters(double minMeters) { this.minMeters = minMeters; }
    public boolean isAlertEnabled() { return alertEnabled; }
    public void setAlertEnabled(boolean alertEnabled) { this.alertEnabled = alertEnabled; }
}
