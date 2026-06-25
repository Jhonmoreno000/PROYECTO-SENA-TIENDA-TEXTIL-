package domain.models;

public class RegionSale {
    private int id;
    private String department;
    private double sales;
    private int orders;
    private String capital;

    public RegionSale() {}

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }
    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
    public double getSales() { return sales; }
    public void setSales(double sales) { this.sales = sales; }
    public int getOrders() { return orders; }
    public void setOrders(int orders) { this.orders = orders; }
    public String getCapital() { return capital; }
    public void setCapital(String capital) { this.capital = capital; }
}
