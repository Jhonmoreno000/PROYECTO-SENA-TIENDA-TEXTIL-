package domain.models;

/**
 * Modelo que representa las ventas agregadas por departamento/región.
 * Mapea a la tabla "region_sales" en la base de datos PostgreSQL.
 * Se usa para el panel de análisis geográfico de ventas.
 */
public class RegionSale {
    /** Identificador único del registro de venta regional (clave primaria autoincremental). */
    private int id;
    /** Nombre del departamento o región de Colombia (ej: "Antioquia", "Cundinamarca"). */
    private String department;
    /** Monto total de ventas acumulado en el departamento. */
    private double sales;
    /** Número total de pedidos realizados en el departamento. */
    private int orders;
    /** Capital del departamento (ej: "Medellín", "Bogotá"). */
    private String capital;

    /** Constructor vacío requerido por frameworks de serialización. */
    public RegionSale() {}

    /** Obtiene el identificador único del registro. */
    public int getId() { return id; }
    /** Asigna el identificador único del registro. */
    public void setId(int id) { this.id = id; }
    /** Obtiene el nombre del departamento. */
    public String getDepartment() { return department; }
    /** Asigna el nombre del departamento. */
    public void setDepartment(String department) { this.department = department; }
    /** Obtiene el monto de ventas del departamento. */
    public double getSales() { return sales; }
    /** Asigna el monto de ventas del departamento. */
    public void setSales(double sales) { this.sales = sales; }
    /** Obtiene el número de pedidos del departamento. */
    public int getOrders() { return orders; }
    /** Asigna el número de pedidos del departamento. */
    public void setOrders(int orders) { this.orders = orders; }
    /** Obtiene la capital del departamento. */
    public String getCapital() { return capital; }
    /** Asigna la capital del departamento. */
    public void setCapital(String capital) { this.capital = capital; }
}
