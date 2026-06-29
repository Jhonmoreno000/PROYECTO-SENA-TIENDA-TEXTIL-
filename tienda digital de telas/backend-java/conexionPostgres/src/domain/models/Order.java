package domain.models;

import java.util.ArrayList;
import java.util.List;

/**
 * Modelo que representa un pedido realizado por un cliente en la plataforma.
 * Mapea a la tabla "orders" en la base de datos PostgreSQL.
 */
public class Order {
    /** Identificador único del pedido (clave primaria autoincremental). */
    private int id;
    /** ID del cliente que realizó el pedido (clave foránea a users). */
    private int clientId;
    /** ID del vendedor responsable de atender el pedido (clave foránea a users). */
    private int sellerId;
    /** Monto total del pedido en pesos colombianos. */
    private double total;
    /** Estado del pedido: "pending", "confirmed", "shipped", "delivered", "cancelled". */
    private String status;
    /** Fecha en que se realizó el pedido (Mapeada desde la columna "order_date" en BD). */
    private String date;
    /** Cantidad total de artículos (suma de quantities) incluidos en este pedido. */
    private int items;
    /** Lista de IDs de productos que componen este pedido. */
    private List<Integer> productIds;

    /**
     * Constructor vacío. Inicializa la lista de productos vacía.
     */
    public Order() {
        this.productIds = new ArrayList<>();
    }

    /** Obtiene el identificador único del pedido. */
    public int getId() {
        return id;
    }

    /** Asigna el identificador único del pedido. */
    public void setId(int id) {
        this.id = id;
    }

    /** Obtiene el ID del cliente que realizó el pedido. */
    public int getClientId() {
        return clientId;
    }

    /** Asigna el ID del cliente asociado al pedido. */
    public void setClientId(int clientId) {
        this.clientId = clientId;
    }

    /** Obtiene el ID del vendedor asignado al pedido. */
    public int getSellerId() {
        return sellerId;
    }

    /** Asigna el ID del vendedor responsable del pedido. */
    public void setSellerId(int sellerId) {
        this.sellerId = sellerId;
    }

    /** Obtiene el monto total del pedido. */
    public double getTotal() {
        return total;
    }

    /** Asigna el monto total del pedido. */
    public void setTotal(double total) {
        this.total = total;
    }

    /** Obtiene el estado actual del pedido. */
    public String getStatus() {
        return status;
    }

    /** Asigna el estado actual del pedido. */
    public void setStatus(String status) {
        this.status = status;
    }

    /** Obtiene la fecha del pedido (order_date). */
    public String getDate() {
        return date;
    }

    /** Asigna la fecha del pedido. */
    public void setDate(String date) {
        this.date = date;
    }

    /** Obtiene la cantidad total de artículos en el pedido. */
    public int getItems() {
        return items;
    }

    /** Asigna la cantidad total de artículos en el pedido. */
    public void setItems(int items) {
        this.items = items;
    }

    /** Obtiene la lista de IDs de productos en el pedido. */
    public List<Integer> getProductIds() {
        return productIds;
    }

    /** Asigna la lista de IDs de productos en el pedido. */
    public void setProductIds(List<Integer> productIds) {
        this.productIds = productIds;
    }

    /** Agrega un ID de producto a la lista del pedido. */
    public void addProductId(int productId) {
        this.productIds.add(productId);
    }
}
