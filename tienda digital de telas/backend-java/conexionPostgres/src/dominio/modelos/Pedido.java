package dominio.modelos;

import com.google.gson.annotations.SerializedName;
import java.util.ArrayList;
import java.util.List;

/**
 * Modelo que representa un pedido realizado por un cliente en la plataforma.
 * Mapea a la tabla "orders" (o "pedidos") en la base de datos PostgreSQL.
 */
public class Pedido {
    /** Identificador único del pedido. */
    @SerializedName(value = "id", alternate = {"idPedido"})
    private int id;

    /** ID del cliente que realizó el pedido. */
    @SerializedName(value = "clientId", alternate = {"idCliente", "idUsuario"})
    private int idCliente;

    /** ID del vendedor responsable de atender el pedido. */
    @SerializedName(value = "sellerId", alternate = {"idVendedor"})
    private int idVendedor;

    /** Monto total del pedido. */
    @SerializedName(value = "total", alternate = {"montoTotal"})
    private double total;

    /** Estado del pedido: "pending", "confirmed", "shipped", "delivered", "cancelled". */
    @SerializedName(value = "status", alternate = {"estado"})
    private String estado;

    /** Fecha en que se realizó el pedido. */
    @SerializedName(value = "date", alternate = {"fecha", "orderDate"})
    private String fecha;

    /** Cantidad total de artículos en el pedido. */
    @SerializedName(value = "items", alternate = {"cantidadArticulos"})
    private int cantidadArticulos;

    /** Lista de IDs de productos que componen este pedido. */
    @SerializedName(value = "productIds", alternate = {"idsProductos"})
    private List<Integer> idsProductos;

    /** Constructor vacío. Inicializa la lista de IDs de productos. */
    public Pedido() {
        this.idsProductos = new ArrayList<>();
    }

    /** Obtiene el identificador único del pedido. */
    public int getId() { return id; }
    /** Asigna el identificador único del pedido. */
    public void setId(int id) { this.id = id; }

    /** Obtiene el ID del cliente. */
    public int getIdCliente() { return idCliente; }
    /** Asigna el ID del cliente. */
    public void setIdCliente(int idCliente) { this.idCliente = idCliente; }

    /** Obtiene el ID del vendedor. */
    public int getIdVendedor() { return idVendedor; }
    /** Asigna el ID del vendedor. */
    public void setIdVendedor(int idVendedor) { this.idVendedor = idVendedor; }

    /** Obtiene el total del pedido. */
    public double getTotal() { return total; }
    /** Asigna el total del pedido. */
    public void setTotal(double total) { this.total = total; }

    /** Obtiene el estado del pedido. */
    public String getEstado() { return estado; }
    /** Asigna el estado del pedido. */
    public void setEstado(String estado) { this.estado = estado; }

    /** Obtiene la fecha del pedido. */
    public String getFecha() { return fecha; }
    /** Asigna la fecha del pedido. */
    public void setFecha(String fecha) { this.fecha = fecha; }

    /** Obtiene la cantidad total de artículos. */
    public int getCantidadArticulos() { return cantidadArticulos; }
    /** Asigna la cantidad total de artículos. */
    public void setCantidadArticulos(int cantidadArticulos) { this.cantidadArticulos = cantidadArticulos; }

    public int getItems() { return getCantidadArticulos(); }
    public void setItems(int items) { setCantidadArticulos(items); }

    /** Obtiene los IDs de los productos. */
    public List<Integer> getIdsProductos() { return idsProductos; }
    /** Asigna los IDs de los productos. */
    public void setIdsProductos(List<Integer> idsProductos) { this.idsProductos = idsProductos; }

    /** Agrega un ID de producto a la lista. */
    public void agregarIdProducto(int idProducto) { this.idsProductos.add(idProducto); }
    /** Alias para compatibilidad. */
    public void addProductId(int id) { agregarIdProducto(id); }
}
