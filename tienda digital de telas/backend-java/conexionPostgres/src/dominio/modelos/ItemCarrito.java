package dominio.modelos;

import com.google.gson.annotations.SerializedName;

/**
 * Modelo que representa un artículo en el carrito de compras de un usuario.
 * Mapea a la tabla "cart_items" en PostgreSQL.
 */
public class ItemCarrito {
    /** Identificador único del registro en el carrito. */
    @SerializedName(value = "id", alternate = {"idItem"})
    private int id;

    /** ID del usuario propietario del carrito. */
    @SerializedName(value = "userId", alternate = {"idUsuario"})
    private int idUsuario;

    /** ID del producto agregado al carrito. */
    @SerializedName(value = "productId", alternate = {"idProducto"})
    private int idProducto;

    /** Cantidad de unidades del producto. */
    @SerializedName(value = "quantity", alternate = {"cantidad"})
    private int cantidad;

    /** Fecha y hora en que se agregó el producto al carrito. */
    @SerializedName(value = "addedAt", alternate = {"fechaAgregado"})
    private String fechaAgregado;

    /** Fecha y hora de la última modificación del artículo. */
    @SerializedName(value = "updatedAt", alternate = {"fechaModificacion"})
    private String fechaModificacion;

    /** Nombre del producto (obtenido mediante JOIN). */
    @SerializedName(value = "productName", alternate = {"nombreProducto"})
    private String nombreProducto;

    /** Precio del producto (obtenido mediante JOIN). */
    @SerializedName(value = "productPrice", alternate = {"precioProducto"})
    private double precioProducto;

    /** URL de la imagen del producto (obtenida mediante JOIN). */
    @SerializedName(value = "productImage", alternate = {"imagenProducto"})
    private String imagenProducto;

    /** Constructor vacío. */
    public ItemCarrito() {}

    /** Obtiene el identificador único del artículo. */
    public int getId() { return id; }
    /** Asigna el identificador único del artículo. */
    public void setId(int id) { this.id = id; }

    /** Obtiene el ID del usuario propietario del carrito. */
    public int getIdUsuario() { return idUsuario; }
    /** Asigna el ID del usuario propietario del carrito. */
    public void setIdUsuario(int idUsuario) { this.idUsuario = idUsuario; }

    /** Obtiene el ID del producto. */
    public int getIdProducto() { return idProducto; }
    /** Asigna el ID del producto. */
    public void setIdProducto(int idProducto) { this.idProducto = idProducto; }

    /** Obtiene la cantidad. */
    public int getCantidad() { return cantidad; }
    /** Asigna la cantidad. */
    public void setCantidad(int cantidad) { this.cantidad = cantidad; }

    /** Obtiene la fecha en que se agregó. */
    public String getFechaAgregado() { return fechaAgregado; }
    /** Asigna la fecha en que se agregó. */
    public void setFechaAgregado(String fechaAgregado) { this.fechaAgregado = fechaAgregado; }

    /** Obtiene la fecha de modificación. */
    public String getFechaModificacion() { return fechaModificacion; }
    /** Asigna la fecha de modificación. */
    public void setFechaModificacion(String fechaModificacion) { this.fechaModificacion = fechaModificacion; }

    /** Obtiene el nombre del producto. */
    public String getNombreProducto() { return nombreProducto; }
    /** Asigna el nombre del producto. */
    public void setNombreProducto(String nombreProducto) { this.nombreProducto = nombreProducto; }

    /** Obtiene el precio del producto. */
    public double getPrecioProducto() { return precioProducto; }
    /** Asigna el precio del producto. */
    public void setPrecioProducto(double precioProducto) { this.precioProducto = precioProducto; }

    /** Obtiene la imagen del producto. */
    public String getImagenProducto() { return imagenProducto; }
    /** Asigna la imagen del producto. */
    public void setImagenProducto(String imagenProducto) { this.imagenProducto = imagenProducto; }
}
