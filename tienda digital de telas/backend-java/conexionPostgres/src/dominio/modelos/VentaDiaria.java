package dominio.modelos;

import com.google.gson.annotations.SerializedName;

/**
 * Modelo que representa un resumen de ventas acumuladas por día.
 * Mapea a la tabla "daily_sales" en PostgreSQL.
 */
public class VentaDiaria {
    /** Identificador único del registro. */
    @SerializedName(value = "id", alternate = {"idVentaDiaria"})
    private int id;

    /** Fecha de las ventas (formato YYYY-MM-DD). */
    @SerializedName(value = "saleDate", alternate = {"fechaVenta", "fecha"})
    private String fechaVenta;

    /** Monto total de ventas en el día. */
    @SerializedName(value = "totalSales", alternate = {"totalVentas"})
    private double totalVentas;

    /** Número total de pedidos en el día. */
    @SerializedName(value = "totalOrders", alternate = {"totalPedidos"})
    private int totalPedidos;

    /** Fecha de creación del registro. */
    @SerializedName(value = "createdAt", alternate = {"fechaCreacion"})
    private String fechaCreacion;

    /** Constructor vacío. */
    public VentaDiaria() {}

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getFechaVenta() { return fechaVenta; }
    public void setFechaVenta(String fechaVenta) { this.fechaVenta = fechaVenta; }

    public double getTotalVentas() { return totalVentas; }
    public void setTotalVentas(double totalVentas) { this.totalVentas = totalVentas; }

    public int getTotalPedidos() { return totalPedidos; }
    public void setTotalPedidos(int totalPedidos) { this.totalPedidos = totalPedidos; }

    public String getFechaCreacion() { return fechaCreacion; }
    public void setFechaCreacion(String fechaCreacion) { this.fechaCreacion = fechaCreacion; }
}
