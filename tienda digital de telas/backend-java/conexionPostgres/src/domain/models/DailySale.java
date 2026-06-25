package domain.models;

public class DailySale {
    private int id;
    private String saleDate;
    private double totalSales;
    private int totalOrders;
    private String createdAt;

    public DailySale() {}

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }
    public String getSaleDate() { return saleDate; }
    public void setSaleDate(String saleDate) { this.saleDate = saleDate; }
    public double getTotalSales() { return totalSales; }
    public void setTotalSales(double totalSales) { this.totalSales = totalSales; }
    public int getTotalOrders() { return totalOrders; }
    public void setTotalOrders(int totalOrders) { this.totalOrders = totalOrders; }
    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
}
