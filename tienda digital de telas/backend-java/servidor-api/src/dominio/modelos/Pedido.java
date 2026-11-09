package dominio.modelos;

import com.google.gson.annotations.SerializedName;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Modelo de dominio que representa un pedido realizado por un cliente en la plataforma.
 * Mapea a la tabla `pedidos` y sus líneas asociadas en `items_pedido` en PostgreSQL.
 */
public class Pedido {

    /** Identificador único del pedido (`int`). */
    @SerializedName(value = "id", alternate = {"idPedido"})
    private int id;

    /** Identificador del cliente comprador (`int`). */
    @SerializedName(value = "clientId", alternate = {"idCliente", "idUsuario"})
    private int idCliente;

    /** Identificador del vendedor principal asociado al pedido (`int`). */
    @SerializedName(value = "sellerId", alternate = {"idVendedor"})
    private int idVendedor;

    /** Nombre completo del cliente comprador (`String`). */
    @SerializedName(value = "client", alternate = {"nombreCliente", "clientName"})
    private String nombreCliente;

    /** Correo electrónico del cliente comprador (`String`). */
    @SerializedName(value = "clientEmail", alternate = {"correoCliente"})
    private String correoCliente;

    /** Teléfono de contacto del cliente comprador (`String`). */
    @SerializedName(value = "clientPhone", alternate = {"telefonoCliente"})
    private String telefonoCliente;

    /** Monto total final del pedido en pesos (`double`). */
    @SerializedName(value = "total", alternate = {"montoTotal"})
    private double total;

    /** Subtotal antes de impuestos y costos de envío (`double`). */
    @SerializedName(value = "subtotal")
    private double subtotal;

    /** Costo logístico de envío (`double`). */
    @SerializedName(value = "shippingCost", alternate = {"costoEnvio"})
    private double costoEnvio;

    /** Monto de impuesto IVA facturado (`double`). */
    @SerializedName(value = "tax", alternate = {"impuestos", "montoImpuesto"})
    private double impuestos;

    /** Monto total descontado por cupones o promociones (`double`). */
    @SerializedName(value = "discountAmount", alternate = {"descuento", "montoDescuento"})
    private double descuento;

    /** Código del cupón aplicado en el pedido (`String`). */
    @SerializedName(value = "couponCode", alternate = {"codigoCupon"})
    private String codigoCupon;

    /** Estado logístico del pedido (`String`: `"pending"`, `"paid"`, `"cutting"`, `"packed"`, `"shipped"`, `"delivered"`, `"cancelled"`). */
    @SerializedName(value = "status", alternate = {"estado"})
    private String estado;

    /** Medio de pago empleado (`String`). */
    @SerializedName(value = "paymentMethod", alternate = {"metodoPago"})
    private String metodoPago;

    /** Estado financiero del pago (`String`: `"pending"`, `"APPROVED"`, `"DECLINED"`, `"VOIDED"`). */
    @SerializedName(value = "paymentStatus", alternate = {"estadoPago"})
    private String estadoPago;

    /** Dirección física de entrega (`String`). */
    @SerializedName(value = "shippingAddress", alternate = {"direccionEnvio"})
    private String direccionEnvio;

    /** Ciudad de destino del envío (`String`). */
    @SerializedName(value = "shippingCity", alternate = {"ciudadEnvio"})
    private String ciudadEnvio;

    /** Departamento de destino del envío (`String`). */
    @SerializedName(value = "shippingDepartment", alternate = {"departamentoEnvio"})
    private String departamentoEnvio;

    /** Número de guía de transporte asignado (`String`). */
    @SerializedName(value = "trackingNumber", alternate = {"numeroGuia"})
    private String numeroGuia;

    /** Notas u observaciones adicionales del pedido (`String`). */
    @SerializedName(value = "notes", alternate = {"notas"})
    private String notas;

    /** Fecha de creación del pedido (`String`). */
    @SerializedName(value = "date", alternate = {"fecha", "orderDate", "createdAt"})
    private String fecha;

    /** Cantidad total de artículos o unidades en el pedido (`int`). */
    @SerializedName(value = "items", alternate = {"cantidadArticulos"})
    private int cantidadArticulos;

    /** Metraje total acumulado en el pedido (`double`). */
    @SerializedName(value = "totalMeters", alternate = {"metrosTotales"})
    private double totalMeters;

    /** Lista de identificadores de los productos incluidos en el pedido (`List<Integer>`). */
    @SerializedName(value = "productIds", alternate = {"idsProductos"})
    private List<Integer> idsProductos;

    /** Lista de nombres comerciales de los productos incluidos (`List<String>`). */
    @SerializedName(value = "productNames", alternate = {"nombresProductos"})
    private List<String> productNames;

    /** Lista detallada de líneas del pedido (`List<Map<String, Object>>`). */
    @SerializedName(value = "lineItems", alternate = {"itemsDetalle"})
    private List<Map<String, Object>> lineItems;

    /**
     * Constructor vacío que inicializa las colecciones del pedido.
     */
    public Pedido() {
        this.idsProductos = new ArrayList<>();
        this.productNames = new ArrayList<>();
        this.lineItems = new ArrayList<>();
    }

    /**
     * Obtiene el identificador único del pedido.
     *
     * @return Identificador numérico (`int`).
     */
    public int getId() { return id; }

    /**
     * Establece el identificador único del pedido.
     *
     * @param id Identificador numérico (`int`).
     */
    public void setId(int id) { this.id = id; }

    /**
     * Obtiene el identificador del cliente.
     *
     * @return Identificador del cliente (`int`).
     */
    public int getIdCliente() { return idCliente; }

    /**
     * Establece el identificador del cliente.
     *
     * @param idCliente Identificador del cliente (`int`).
     */
    public void setIdCliente(int idCliente) { this.idCliente = idCliente; }

    /**
     * Obtiene el identificador del vendedor.
     *
     * @return Identificador del vendedor (`int`).
     */
    public int getIdVendedor() { return idVendedor; }

    /**
     * Establece el identificador del vendedor.
     *
     * @param idVendedor Identificador del vendedor (`int`).
     */
    public void setIdVendedor(int idVendedor) { this.idVendedor = idVendedor; }

    /**
     * Obtiene el nombre completo del cliente.
     *
     * @return Nombre del cliente (`String`).
     */
    public String getNombreCliente() { return nombreCliente; }

    /**
     * Establece el nombre completo del cliente.
     *
     * @param nombreCliente Nombre del cliente (`String`).
     */
    public void setNombreCliente(String nombreCliente) { this.nombreCliente = nombreCliente; }

    /**
     * Obtiene el correo electrónico del cliente.
     *
     * @return Correo del cliente (`String`).
     */
    public String getCorreoCliente() { return correoCliente; }

    /**
     * Establece el correo electrónico del cliente.
     *
     * @param correoCliente Correo del cliente (`String`).
     */
    public void setCorreoCliente(String correoCliente) { this.correoCliente = correoCliente; }

    /**
     * Obtiene el teléfono de contacto del cliente.
     *
     * @return Teléfono del cliente (`String`).
     */
    public String getTelefonoCliente() { return telefonoCliente; }

    /**
     * Establece el teléfono de contacto del cliente.
     *
     * @param telefonoCliente Teléfono del cliente (`String`).
     */
    public void setTelefonoCliente(String telefonoCliente) { this.telefonoCliente = telefonoCliente; }

    /**
     * Obtiene el monto total del pedido.
     *
     * @return Total en pesos (`double`).
     */
    public double getTotal() { return total; }

    /**
     * Establece el monto total del pedido.
     *
     * @param total Total en pesos (`double`).
     */
    public void setTotal(double total) { this.total = total; }

    /**
     * Obtiene el subtotal del pedido.
     *
     * @return Subtotal en pesos (`double`).
     */
    public double getSubtotal() { return subtotal; }

    /**
     * Establece el subtotal del pedido.
     *
     * @param subtotal Subtotal en pesos (`double`).
     */
    public void setSubtotal(double subtotal) { this.subtotal = subtotal; }

    /**
     * Obtiene el costo de envío del pedido.
     *
     * @return Costo de envío (`double`).
     */
    public double getCostoEnvio() { return costoEnvio; }

    /**
     * Establece el costo de envío del pedido.
     *
     * @param costoEnvio Costo de envío (`double`).
     */
    public void setCostoEnvio(double costoEnvio) { this.costoEnvio = costoEnvio; }

    /**
     * Obtiene el monto de impuestos del pedido.
     *
     * @return Impuestos en pesos (`double`).
     */
    public double getImpuestos() { return impuestos; }

    /**
     * Establece el monto de impuestos del pedido.
     *
     * @param impuestos Impuestos en pesos (`double`).
     */
    public void setImpuestos(double impuestos) { this.impuestos = impuestos; }

    /**
     * Obtiene el monto de descuento aplicado.
     *
     * @return Descuento en pesos (`double`).
     */
    public double getDescuento() { return descuento; }

    /**
     * Establece el monto de descuento aplicado.
     *
     * @param descuento Descuento en pesos (`double`).
     */
    public void setDescuento(double descuento) { this.descuento = descuento; }

    /**
     * Obtiene el código de cupón utilizado.
     *
     * @return Código de cupón (`String`).
     */
    public String getCodigoCupon() { return codigoCupon; }

    /**
     * Establece el código de cupón utilizado.
     *
     * @param codigoCupon Código de cupón (`String`).
     */
    public void setCodigoCupon(String codigoCupon) { this.codigoCupon = codigoCupon; }

    /**
     * Obtiene el estado actual del pedido.
     *
     * @return Estado del pedido (`String`).
     */
    public String getEstado() { return estado; }

    /**
     * Establece el estado actual del pedido.
     *
     * @param estado Estado del pedido (`String`).
     */
    public void setEstado(String estado) { this.estado = estado; }

    /**
     * Obtiene el método de pago del pedido.
     *
     * @return Método de pago (`String`).
     */
    public String getMetodoPago() { return metodoPago; }

    /**
     * Establece el método de pago del pedido.
     *
     * @param metodoPago Método de pago (`String`).
     */
    public void setMetodoPago(String metodoPago) { this.metodoPago = metodoPago; }

    /**
     * Obtiene el estado del pago.
     *
     * @return Estado del pago (`String`).
     */
    public String getEstadoPago() { return estadoPago; }

    /**
     * Establece el estado del pago.
     *
     * @param estadoPago Estado del pago (`String`).
     */
    public void setEstadoPago(String estadoPago) { this.estadoPago = estadoPago; }

    /**
     * Obtiene la dirección de envío.
     *
     * @return Dirección de envío (`String`).
     */
    public String getDireccionEnvio() { return direccionEnvio; }

    /**
     * Establece la dirección de envío.
     *
     * @param direccionEnvio Dirección de envío (`String`).
     */
    public void setDireccionEnvio(String direccionEnvio) { this.direccionEnvio = direccionEnvio; }

    /**
     * Obtiene la ciudad de envío.
     *
     * @return Ciudad de envío (`String`).
     */
    public String getCiudadEnvio() { return ciudadEnvio; }

    /**
     * Establece la ciudad de envío.
     *
     * @param ciudadEnvio Ciudad de envío (`String`).
     */
    public void setCiudadEnvio(String ciudadEnvio) { this.ciudadEnvio = ciudadEnvio; }

    /**
     * Obtiene el departamento de envío.
     *
     * @return Departamento de envío (`String`).
     */
    public String getDepartamentoEnvio() { return departamentoEnvio; }

    /**
     * Establece el departamento de envío.
     *
     * @param departamentoEnvio Departamento de envío (`String`).
     */
    public void setDepartamentoEnvio(String departamentoEnvio) { this.departamentoEnvio = departamentoEnvio; }

    /**
     * Obtiene el número de guía de rastreo.
     *
     * @return Número de guía (`String`).
     */
    public String getNumeroGuia() { return numeroGuia; }

    /**
     * Establece el número de guía de rastreo.
     *
     * @param numeroGuia Número de guía (`String`).
     */
    public void setNumeroGuia(String numeroGuia) { this.numeroGuia = numeroGuia; }

    /**
     * Obtiene las notas asociadas al pedido.
     *
     * @return Notas del pedido (`String`).
     */
    public String getNotas() { return notas; }

    /**
     * Establece las notas asociadas al pedido.
     *
     * @param notas Notas del pedido (`String`).
     */
    public void setNotas(String notas) { this.notas = notas; }

    /**
     * Obtiene la fecha del pedido.
     *
     * @return Fecha en formato texto (`String`).
     */
    public String getFecha() { return fecha; }

    /**
     * Establece la fecha del pedido.
     *
     * @param fecha Fecha en formato texto (`String`).
     */
    public void setFecha(String fecha) { this.fecha = fecha; }

    /**
     * Obtiene la cantidad total de artículos.
     *
     * @return Cantidad de artículos (`int`).
     */
    public int getCantidadArticulos() { return cantidadArticulos; }

    /**
     * Establece la cantidad total de artículos.
     *
     * @param cantidadArticulos Cantidad de artículos (`int`).
     */
    public void setCantidadArticulos(int cantidadArticulos) { this.cantidadArticulos = cantidadArticulos; }

    /**
     * Obtiene el metraje total acumulado del pedido.
     *
     * @return Metros totales (`double`).
     */
    public double getTotalMeters() { return totalMeters; }

    /**
     * Establece el metraje total acumulado del pedido.
     *
     * @param totalMeters Metros totales (`double`).
     */
    public void setTotalMeters(double totalMeters) { this.totalMeters = totalMeters; }

    /**
     * Obtiene la lista de identificadores de productos del pedido.
     *
     * @return Lista de IDs (`List<Integer>`).
     */
    public List<Integer> getIdsProductos() { return idsProductos; }

    /**
     * Establece la lista de identificadores de productos del pedido.
     *
     * @param idsProductos Lista de IDs (`List<Integer>`).
     */
    public void setIdsProductos(List<Integer> idsProductos) { this.idsProductos = idsProductos; }

    /**
     * Agrega un identificador de producto a la colección del pedido.
     *
     * @param idProducto Identificador del producto (`int`).
     */
    public void agregarIdProducto(int idProducto) {
        if (!this.idsProductos.contains(idProducto)) {
            this.idsProductos.add(idProducto);
        }
    }

    /**
     * Obtiene la lista de nombres de productos del pedido.
     *
     * @return Lista de nombres (`List<String>`).
     */
    public List<String> getProductNames() { return productNames; }

    /**
     * Establece la lista de nombres de productos del pedido.
     *
     * @param productNames Lista de nombres (`List<String>`).
     */
    public void setProductNames(List<String> productNames) { this.productNames = productNames; }

    /**
     * Agrega el nombre de un producto a la lista del pedido evitando duplicados.
     *
     * @param nombre Nombre comercial del producto (`String`).
     */
    public void agregarNombreProducto(String nombre) {
        if (nombre != null && !nombre.isBlank() && !this.productNames.contains(nombre)) {
            this.productNames.add(nombre);
        }
    }

    /**
     * Obtiene el detalle de líneas del pedido.
     *
     * @return Lista de mapas (`List<Map<String, Object>>`) con las líneas del pedido.
     */
    public List<Map<String, Object>> getLineItems() { return lineItems; }

    /**
     * Establece el detalle de líneas del pedido.
     *
     * @param lineItems Lista de mapas (`List<Map<String, Object>>`).
     */
    public void setLineItems(List<Map<String, Object>> lineItems) { this.lineItems = lineItems; }

    /**
     * Agrega una línea de detalle al pedido.
     *
     * @param linea Mapa (`Map<String, Object>`) con los datos del ítem.
     */
    public void agregarLineaDetalle(Map<String, Object> linea) {
        if (linea != null) {
            this.lineItems.add(linea);
        }
    }
}
