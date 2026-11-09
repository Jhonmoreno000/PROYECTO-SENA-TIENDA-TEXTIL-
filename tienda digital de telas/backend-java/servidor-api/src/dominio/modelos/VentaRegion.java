package dominio.modelos;

import com.google.gson.annotations.SerializedName;

/**
 * Modelo de dominio que representa las ventas agregadas por departamento o región geográfica.
 * Mapea a la tabla `ventas_region` en PostgreSQL.
 */
public class VentaRegion {

    /** Identificador único del registro regional (`int`). */
    @SerializedName(value = "id", alternate = {"idVentaRegion"})
    private int id;

    /** Nombre del departamento o región (`String`, ej. `"Antioquia"`, `"Bogotá D.C."`). */
    @SerializedName(value = "department", alternate = {"departamento", "region"})
    private String departamento;

    /** Monto total de ventas acumuladas en la región (`double`). */
    @SerializedName(value = "sales", alternate = {"ventas", "totalVentas", "ventasTotales"})
    private double ventas;

    /** Cantidad total de pedidos registrados en la región (`int`). */
    @SerializedName(value = "orders", alternate = {"pedidos", "cantidadPedidos", "pedidosTotales"})
    private int pedidos;

    /** Porcentaje de participación sobre el total nacional (`double`). */
    @SerializedName(value = "percentage", alternate = {"porcentaje"})
    private double porcentaje;

    /** Ciudad capital del departamento (`String`). */
    @SerializedName(value = "capital", alternate = {"ciudadPrincipal"})
    private String capital;

    /**
     * Constructor vacío requerido para serialización JSON y mapeo JDBC.
     */
    public VentaRegion() {}

    /**
     * Obtiene el identificador único del registro regional.
     *
     * @return Identificador numérico (`int`).
     */
    public int getId() { return id; }

    /**
     * Establece el identificador único del registro regional.
     *
     * @param id Identificador numérico (`int`).
     */
    public void setId(int id) { this.id = id; }

    /**
     * Obtiene el nombre del departamento o región.
     *
     * @return Departamento (`String`).
     */
    public String getDepartamento() { return departamento; }

    /**
     * Establece el nombre del departamento o región.
     *
     * @param departamento Departamento (`String`).
     */
    public void setDepartamento(String departamento) { this.departamento = departamento; }

    /**
     * Obtiene el monto total de ventas en la región.
     *
     * @return Ventas acumuladas (`double`).
     */
    public double getVentas() { return ventas; }

    /**
     * Establece el monto total de ventas en la región.
     *
     * @param ventas Ventas acumuladas (`double`).
     */
    public void setVentas(double ventas) { this.ventas = ventas; }

    /**
     * Obtiene la cantidad total de pedidos en la región.
     *
     * @return Total de pedidos (`int`).
     */
    public int getPedidos() { return pedidos; }

    /**
     * Establece la cantidad total de pedidos en la región.
     *
     * @param pedidos Total de pedidos (`int`).
     */
    public void setPedidos(int pedidos) { this.pedidos = pedidos; }

    /**
     * Obtiene el porcentaje de participación regional.
     *
     * @return Porcentaje (`double`).
     */
    public double getPorcentaje() { return porcentaje; }

    /**
     * Establece el porcentaje de participación regional.
     *
     * @param porcentaje Porcentaje (`double`).
     */
    public void setPorcentaje(double porcentaje) { this.porcentaje = porcentaje; }

    /**
     * Obtiene la ciudad capital de la región.
     *
     * @return Ciudad capital (`String`).
     */
    public String getCapital() { return capital; }

    /**
     * Establece la ciudad capital de la región.
     *
     * @param capital Ciudad capital (`String`).
     */
    public void setCapital(String capital) { this.capital = capital; }
}
