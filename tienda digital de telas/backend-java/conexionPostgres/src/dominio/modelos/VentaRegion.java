package dominio.modelos;

import com.google.gson.annotations.SerializedName;

/**
 * Modelo que representa las ventas agregadas por departamento o región.
 * Mapea a la tabla "region_sales" en PostgreSQL.
 */
public class VentaRegion {
    /** Identificador único del registro. */
    @SerializedName(value = "id", alternate = {"idVentaRegion"})
    private int id;

    /** Nombre del departamento o región (ej: "Antioquia", "Cundinamarca"). */
    @SerializedName(value = "department", alternate = {"departamento"})
    private String departamento;

    /** Monto total de ventas en el departamento. */
    @SerializedName(value = "sales", alternate = {"ventas", "totalVentas"})
    private double ventas;

    /** Número total de pedidos en el departamento. */
    @SerializedName(value = "orders", alternate = {"pedidos", "cantidadPedidos"})
    private int pedidos;

    /** Capital del departamento. */
    @SerializedName(value = "capital", alternate = {"ciudadPrincipal"})
    private String capital;

    /** Constructor vacío. */
    public VentaRegion() {}

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getDepartamento() { return departamento; }
    public void setDepartamento(String departamento) { this.departamento = departamento; }

    public double getVentas() { return ventas; }
    public void setVentas(double ventas) { this.ventas = ventas; }

    public int getPedidos() { return pedidos; }
    public void setPedidos(int pedidos) { this.pedidos = pedidos; }

    public String getCapital() { return capital; }
    public void setCapital(String capital) { this.capital = capital; }
}
