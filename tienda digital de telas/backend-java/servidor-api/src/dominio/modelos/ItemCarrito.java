package dominio.modelos;

import com.google.gson.annotations.SerializedName;

/**
 * Modelo de dominio que representa un artículo dentro del carrito de compras de un usuario.
 * Mapea a la tabla `items_carrito` en PostgreSQL.
 */
public class ItemCarrito {

    /** Identificador único del registro en el carrito (`int`). */
    @SerializedName(value = "id", alternate = {"idItem"})
    private int id;

    /** Identificador del usuario propietario del carrito (`int`). */
    @SerializedName(value = "userId", alternate = {"idUsuario"})
    private int idUsuario;

    /** Identificador del producto textil agregado al carrito (`int`). */
    @SerializedName(value = "productId", alternate = {"idProducto"})
    private int idProducto;

    /** Cantidad de metros solicitados del producto (`double`). */
    @SerializedName(value = "quantity", alternate = {"cantidad", "meters"})
    private double cantidad;

    /** Fecha y hora en que se agregó el artículo al carrito (`String`). */
    @SerializedName(value = "addedAt", alternate = {"fechaAgregado"})
    private String fechaAgregado;

    /** Fecha y hora de la última modificación de cantidad (`String`). */
    @SerializedName(value = "updatedAt", alternate = {"fechaModificacion"})
    private String fechaModificacion;

    /** Nombre comercial del producto obtenido mediante `JOIN` (`String`). */
    @SerializedName(value = "productName", alternate = {"nombreProducto", "name"})
    private String nombreProducto;

    /** Precio unitario por metro del producto obtenido mediante `JOIN` (`double`). */
    @SerializedName(value = "productPrice", alternate = {"precioProducto", "price"})
    private double precioProducto;

    /** URL de la imagen principal del producto obtenida mediante `JOIN` (`String`). */
    @SerializedName(value = "productImage", alternate = {"imagenProducto", "image"})
    private String imagenProducto;

    /**
     * Constructor vacío requerido para serialización JSON y mapeo JDBC.
     */
    public ItemCarrito() {}

    /**
     * Obtiene el identificador único del ítem en el carrito.
     *
     * @return Identificador numérico (`int`).
     */
    public int getId() { return id; }

    /**
     * Establece el identificador único del ítem en el carrito.
     *
     * @param id Identificador numérico (`int`).
     */
    public void setId(int id) { this.id = id; }

    /**
     * Obtiene el identificador del usuario propietario del carrito.
     *
     * @return Identificador del usuario (`int`).
     */
    public int getIdUsuario() { return idUsuario; }

    /**
     * Establece el identificador del usuario propietario del carrito.
     *
     * @param idUsuario Identificador del usuario (`int`).
     */
    public void setIdUsuario(int idUsuario) { this.idUsuario = idUsuario; }

    /**
     * Obtiene el identificador del producto.
     *
     * @return Identificador del producto (`int`).
     */
    public int getIdProducto() { return idProducto; }

    /**
     * Establece el identificador del producto.
     *
     * @param idProducto Identificador del producto (`int`).
     */
    public void setIdProducto(int idProducto) { this.idProducto = idProducto; }

    /**
     * Obtiene la cantidad de metros del producto en el carrito.
     *
     * @return Cantidad en metros (`double`).
     */
    public double getCantidad() { return cantidad; }

    /**
     * Establece la cantidad de metros del producto en el carrito.
     *
     * @param cantidad Cantidad en metros (`double`).
     */
    public void setCantidad(double cantidad) { this.cantidad = cantidad; }

    /**
     * Obtiene la fecha en que el artículo fue agregado al carrito.
     *
     * @return Marca de tiempo (`String`).
     */
    public String getFechaAgregado() { return fechaAgregado; }

    /**
     * Establece la fecha en que el artículo fue agregado al carrito.
     *
     * @param fechaAgregado Marca de tiempo (`String`).
     */
    public void setFechaAgregado(String fechaAgregado) { this.fechaAgregado = fechaAgregado; }

    /**
     * Obtiene la fecha de última modificación del artículo.
     *
     * @return Marca de tiempo (`String`).
     */
    public String getFechaModificacion() { return fechaModificacion; }

    /**
     * Establece la fecha de última modificación del artículo.
     *
     * @param fechaModificacion Marca de tiempo (`String`).
     */
    public void setFechaModificacion(String fechaModificacion) { this.fechaModificacion = fechaModificacion; }

    /**
     * Obtiene el nombre comercial del producto.
     *
     * @return Nombre del producto (`String`).
     */
    public String getNombreProducto() { return nombreProducto; }

    /**
     * Establece el nombre comercial del producto.
     *
     * @param nombreProducto Nombre del producto (`String`).
     */
    public void setNombreProducto(String nombreProducto) { this.nombreProducto = nombreProducto; }

    /**
     * Obtiene el precio unitario por metro del producto.
     *
     * @return Precio por metro (`double`).
     */
    public double getPrecioProducto() { return precioProducto; }

    /**
     * Establece el precio unitario por metro del producto.
     *
     * @param precioProducto Precio por metro (`double`).
     */
    public void setPrecioProducto(double precioProducto) { this.precioProducto = precioProducto; }

    /**
     * Obtiene la URL de la imagen principal del producto.
     *
     * @return URL de imagen (`String`).
     */
    public String getImagenProducto() { return imagenProducto; }

    /**
     * Establece la URL de la imagen principal del producto.
     *
     * @param imagenProducto URL de imagen (`String`).
     */
    public void setImagenProducto(String imagenProducto) { this.imagenProducto = imagenProducto; }
}
