package dominio.modelos;

import com.google.gson.annotations.SerializedName;

/**
 * Modelo de dominio que representa el consolidado de ventas acumuladas por día.
 * Mapea a la tabla `ventas_diarias` en PostgreSQL.
 */
public class VentaDiaria {

    /** Identificador único del registro diario (`int`). */
    @SerializedName(value = "id", alternate = {"idVentaDiaria"})
    private int id;

    /** Fecha de las ventas consolidadas en formato `YYYY-MM-DD` (`String`). */
    @SerializedName(value = "saleDate", alternate = {"fechaVenta", "fecha", "date"})
    private String fechaVenta;

    /** Monto total vendido en la jornada (`double`). */
    @SerializedName(value = "totalSales", alternate = {"totalVentas", "ventasTotales"})
    private double totalVentas;

    /** Cantidad total de pedidos procesados en la jornada (`int`). */
    @SerializedName(value = "totalOrders", alternate = {"totalPedidos", "pedidosTotales"})
    private int totalPedidos;

    /** Fecha de creación del registro en la base de datos (`String`). */
    @SerializedName(value = "createdAt", alternate = {"fechaCreacion"})
    private String fechaCreacion;

    /**
     * Constructor vacío requerido para serialización JSON y mapeo JDBC.
     */
    public VentaDiaria() {}

    /**
     * Obtiene el identificador único del registro.
     *
     * @return Identificador numérico (`int`).
     */
    public int getId() { return id; }

    /**
     * Establece el identificador único del registro.
     *
     * @param id Identificador numérico (`int`).
     */
    public void setId(int id) { this.id = id; }

    /**
     * Obtiene la fecha de las ventas consolidadas.
     *
     * @return Fecha de venta (`String`).
     */
    public String getFechaVenta() { return fechaVenta; }

    /**
     * Establece la fecha de las ventas consolidadas.
     *
     * @param fechaVenta Fecha de venta (`String`).
     */
    public void setFechaVenta(String fechaVenta) { this.fechaVenta = fechaVenta; }

    /**
     * Obtiene el monto total vendido en el día.
     *
     * @return Total de ventas (`double`).
     */
    public double getTotalVentas() { return totalVentas; }

    /**
     * Establece el monto total vendido en el día.
     *
     * @param totalVentas Total de ventas (`double`).
     */
    public void setTotalVentas(double totalVentas) { this.totalVentas = totalVentas; }

    /**
     * Obtiene la cantidad total de pedidos en el día.
     *
     * @return Total de pedidos (`int`).
     */
    public int getTotalPedidos() { return totalPedidos; }

    /**
     * Establece la cantidad total de pedidos en el día.
     *
     * @param totalPedidos Total de pedidos (`int`).
     */
    public void setTotalPedidos(int totalPedidos) { this.totalPedidos = totalPedidos; }

    /**
     * Obtiene la fecha de creación del registro.
     *
     * @return Marca de tiempo (`String`).
     */
    public String getFechaCreacion() { return fechaCreacion; }

    /**
     * Establece la fecha de creación del registro.
     *
     * @param fechaCreacion Marca de tiempo (`String`).
     */
    public void setFechaCreacion(String fechaCreacion) { this.fechaCreacion = fechaCreacion; }
}
