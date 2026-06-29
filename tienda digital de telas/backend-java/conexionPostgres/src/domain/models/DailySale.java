package domain.models;

/**
 * Modelo que representa un resumen de ventas acumuladas por día.
 * Mapea a la tabla "daily_sales" en la base de datos PostgreSQL.
 * Se usa para poblar gráficos y reportes del panel de administración.
 */
public class DailySale {
    /** Identificador único del registro de venta diaria (clave primaria autoincremental). */
    private int id;
    /** Fecha a la que corresponde el resumen de ventas (formato YYYY-MM-DD). */
    private String saleDate;
    /** Monto total de ventas acumulado en ese día. */
    private double totalSales;
    /** Número total de pedidos realizados en ese día. */
    private int totalOrders;
    /** Fecha y hora en que se generó este registro en la base de datos. */
    private String createdAt;

    /** Constructor vacío requerido por frameworks de serialización. */
    public DailySale() {}

    /** Obtiene el identificador único del registro. */
    public int getId() { return id; }
    /** Asigna el identificador único del registro. */
    public void setId(int id) { this.id = id; }
    /** Obtiene la fecha de venta. */
    public String getSaleDate() { return saleDate; }
    /** Asigna la fecha de venta. */
    public void setSaleDate(String saleDate) { this.saleDate = saleDate; }
    /** Obtiene el total de ventas del día. */
    public double getTotalSales() { return totalSales; }
    /** Asigna el total de ventas del día. */
    public void setTotalSales(double totalSales) { this.totalSales = totalSales; }
    /** Obtiene el número total de pedidos del día. */
    public int getTotalOrders() { return totalOrders; }
    /** Asigna el número total de pedidos del día. */
    public void setTotalOrders(int totalOrders) { this.totalOrders = totalOrders; }
    /** Obtiene la fecha de creación del registro. */
    public String getCreatedAt() { return createdAt; }
    /** Asigna la fecha de creación del registro. */
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
}
