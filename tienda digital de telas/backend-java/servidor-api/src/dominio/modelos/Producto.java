package dominio.modelos;

import com.google.gson.annotations.SerializedName;
import java.util.ArrayList;
import java.util.List;

/**
 * Modelo de dominio que representa un producto (tela) disponible en el catálogo de D&D Textil.
 * Mapea a la tabla `productos` y sus imágenes en `imagenes_producto` en PostgreSQL.
 */
public class Producto {

    /** Identificador único del producto (`String`). */
    @SerializedName(value = "id", alternate = {"idProducto"})
    private String id;

    /** Nombre comercial del producto o tela (`String`). */
    @SerializedName(value = "name", alternate = {"nombre"})
    private String nombre;

    /** Nombre de la categoría textil (`String`, ej. `"Algodon"`, `"Seda"`). */
    @SerializedName(value = "category", alternate = {"categoria"})
    private String categoria;

    /** Precio de venta por metro en pesos (`double`). */
    @SerializedName(value = "price", alternate = {"precio"})
    private double precio;

    /** Identificador del vendedor propietario del producto (`int`). */
    @SerializedName(value = "sellerId", alternate = {"idVendedor"})
    private int idVendedor;

    /** Nombre del vendedor propietario obtenido mediante `JOIN` (`String`). */
    @SerializedName(value = "sellerName", alternate = {"nombreVendedor"})
    private String nombreVendedor;

    /** Descripción detallada del producto (`String`). */
    @SerializedName(value = "description", alternate = {"descripcion"})
    private String descripcion;

    /** Composición o material textil (`String`). */
    @SerializedName(value = "material", alternate = {"composicion"})
    private String material;

    /** Ancho del rollo de tela (`String`, ej. `"1.50m"`). */
    @SerializedName(value = "width", alternate = {"ancho"})
    private String ancho;

    /** Gramaje o peso por metro cuadrado (`String`, ej. `"150g/m2"`). */
    @SerializedName(value = "weight", alternate = {"peso"})
    private String peso;

    /** Instrucciones de lavado y cuidado (`String`). */
    @SerializedName(value = "care", alternate = {"cuidado", "cuidados", "instruccionesCuidado"})
    private String cuidado;

    /** Cantidad de metros disponibles en inventario (`double`). */
    @SerializedName(value = "stock", alternate = {"existencias"})
    private double existencias;

    /** Indica si el producto aparece destacado en el catálogo (`boolean`). */
    @SerializedName(value = "featured", alternate = {"destacado"})
    private boolean destacado;

    /** Indica si el producto se encuentra activo en tienda (`boolean`). */
    @SerializedName(value = "active", alternate = {"activo"})
    private boolean activo = true;

    /** Estado de moderación del producto (`String`: `"approved"`, `"pending"`, `"rejected"`, `"changes_requested"`). */
    @SerializedName(value = "status", alternate = {"estadoModeracion", "moderationStatus"})
    private String estadoModeracion = "approved";

    /** Motivo de rechazo o solicitud de cambios en moderación (`String`). */
    @SerializedName(value = "rejectionReason", alternate = {"motivoRechazo"})
    private String motivoRechazo;

    /** Indica si pertenece a la sección "Nuevas Colecciones" (`boolean`). */
    @SerializedName(value = "isNewCollection", alternate = {"esNuevaColeccion"})
    private boolean esNuevaColeccion;

    /** Indica si pertenece a la sección "Telas Exclusivas" (`boolean`). */
    @SerializedName(value = "isExclusive", alternate = {"esExclusivo"})
    private boolean esExclusivo;

    /** Indica si pertenece a la sección "Ofertas Especiales" (`boolean`). */
    @SerializedName(value = "isOffer", alternate = {"esOferta", "isSale"})
    private boolean esOferta;

    /** Fecha de creación del producto en el catálogo (`String`). */
    @SerializedName(value = "createdAt", alternate = {"fechaCreacion"})
    private String fechaCreacion;

    /** Lista de rutas o URLs de imágenes del producto (`List<String>`). */
    @SerializedName(value = "images", alternate = {"imagenes"})
    private List<String> imagenes;

    /**
     * Constructor vacío que inicializa la colección de imágenes.
     */
    public Producto() {
        this.imagenes = new ArrayList<>();
    }

    /**
     * Obtiene el identificador único del producto.
     *
     * @return Identificador del producto (`String`).
     */
    public String getId() { return id; }

    /**
     * Establece el identificador único del producto.
     *
     * @param id Identificador del producto (`String`).
     */
    public void setId(String id) { this.id = id; }

    /**
     * Obtiene el nombre comercial del producto.
     *
     * @return Nombre del producto (`String`).
     */
    public String getNombre() { return nombre; }

    /**
     * Establece el nombre comercial del producto.
     *
     * @param nombre Nombre del producto (`String`).
     */
    public void setNombre(String nombre) { this.nombre = nombre; }

    /**
     * Obtiene la categoría del producto.
     *
     * @return Categoría (`String`).
     */
    public String getCategoria() { return categoria; }

    /**
     * Establece la categoría del producto.
     *
     * @param categoria Categoría (`String`).
     */
    public void setCategoria(String categoria) { this.categoria = categoria; }

    /**
     * Obtiene el precio por metro del producto.
     *
     * @return Precio unitario (`double`).
     */
    public double getPrecio() { return precio; }

    /**
     * Establece el precio por metro del producto.
     *
     * @param precio Precio unitario (`double`).
     */
    public void setPrecio(double precio) { this.precio = precio; }

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
     * Obtiene el nombre del vendedor propietario.
     *
     * @return Nombre del vendedor (`String`).
     */
    public String getNombreVendedor() { return nombreVendedor; }

    /**
     * Establece el nombre del vendedor propietario.
     *
     * @param nombreVendedor Nombre del vendedor (`String`).
     */
    public void setNombreVendedor(String nombreVendedor) { this.nombreVendedor = nombreVendedor; }

    /**
     * Obtiene la descripción del producto.
     *
     * @return Descripción (`String`).
     */
    public String getDescripcion() { return descripcion; }

    /**
     * Establece la descripción del producto.
     *
     * @param descripcion Descripción (`String`).
     */
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }

    /**
     * Obtiene la composición o material textil.
     *
     * @return Material (`String`).
     */
    public String getMaterial() { return material; }

    /**
     * Establece la composición o material textil.
     *
     * @param material Material (`String`).
     */
    public void setMaterial(String material) { this.material = material; }

    /**
     * Obtiene el ancho de la tela.
     *
     * @return Ancho (`String`).
     */
    public String getAncho() { return ancho; }

    /**
     * Establece el ancho de la tela.
     *
     * @param ancho Ancho (`String`).
     */
    public void setAncho(String ancho) { this.ancho = ancho; }

    /**
     * Obtiene el gramaje o peso de la tela.
     *
     * @return Peso (`String`).
     */
    public String getPeso() { return peso; }

    /**
     * Establece el gramaje o peso de la tela.
     *
     * @param peso Peso (`String`).
     */
    public void setPeso(String peso) { this.peso = peso; }

    /**
     * Obtiene las instrucciones de cuidado y lavado.
     *
     * @return Instrucciones de cuidado (`String`).
     */
    public String getCuidado() { return cuidado; }

    /**
     * Establece las instrucciones de cuidado y lavado.
     *
     * @param cuidado Instrucciones de cuidado (`String`).
     */
    public void setCuidado(String cuidado) { this.cuidado = cuidado; }

    /**
     * Obtiene la cantidad disponible en stock.
     *
     * @return Existencias en metros (`double`).
     */
    public double getExistencias() { return existencias; }

    /**
     * Establece la cantidad disponible en stock con precisión decimal.
     *
     * @param existencias Existencias en metros (`double`).
     */
    public void setExistencias(double existencias) { this.existencias = existencias; }

    /**
     * Establece la cantidad disponible en stock a partir de un valor entero.
     *
     * @param existencias Existencias en metros (`int`).
     */
    public void setExistencias(int existencias) { this.existencias = (double) existencias; }

    /**
     * Obtiene la cantidad disponible en stock (alias bilingüe).
     *
     * @return Existencias en metros (`double`).
     */
    public double getStock() { return existencias; }

    /**
     * Establece la cantidad disponible en stock (alias bilingüe).
     *
     * @param stock Existencias en metros (`double`).
     */
    public void setStock(double stock) { this.existencias = stock; }

    /**
     * Indica si el producto está destacado.
     *
     * @return `true` si es destacado; `false` en caso contrario.
     */
    public boolean isDestacado() { return destacado; }

    /**
     * Establece si el producto está destacado.
     *
     * @param destacado Estado destacado (`boolean`).
     */
    public void setDestacado(boolean destacado) { this.destacado = destacado; }

    /**
     * Indica si el producto está activo.
     *
     * @return `true` si está activo; `false` en caso contrario.
     */
    public boolean isActivo() { return activo; }

    /**
     * Establece si el producto está activo.
     *
     * @param activo Estado activo (`boolean`).
     */
    public void setActivo(boolean activo) { this.activo = activo; }

    /**
     * Obtiene el estado de moderación del producto.
     *
     * @return Estado de moderación (`String`).
     */
    public String getEstadoModeracion() { return estadoModeracion; }

    /**
     * Establece el estado de moderación del producto.
     *
     * @param estadoModeracion Estado de moderación (`String`).
     */
    public void setEstadoModeracion(String estadoModeracion) { this.estadoModeracion = estadoModeracion; }

    /**
     * Obtiene el motivo de rechazo o retroalimentación de moderación.
     *
     * @return Motivo de rechazo (`String`).
     */
    public String getMotivoRechazo() { return motivoRechazo; }

    /**
     * Establece el motivo de rechazo o retroalimentación de moderación.
     *
     * @param motivoRechazo Motivo de rechazo (`String`).
     */
    public void setMotivoRechazo(String motivoRechazo) { this.motivoRechazo = motivoRechazo; }

    /**
     * Indica si pertenece a Nuevas Colecciones.
     *
     * @return `true` si es nueva colección; `false` en caso contrario.
     */
    public boolean isEsNuevaColeccion() { return esNuevaColeccion; }

    /**
     * Establece si pertenece a Nuevas Colecciones.
     *
     * @param esNuevaColeccion `true` si es nueva colección.
     */
    public void setEsNuevaColeccion(boolean esNuevaColeccion) { this.esNuevaColeccion = esNuevaColeccion; }

    /**
     * Indica si pertenece a Telas Exclusivas.
     *
     * @return `true` si es exclusivo; `false` en caso contrario.
     */
    public boolean isEsExclusivo() { return esExclusivo; }

    /**
     * Establece si pertenece a Telas Exclusivas.
     *
     * @param esExclusivo `true` si es exclusivo.
     */
    public void setEsExclusivo(boolean esExclusivo) { this.esExclusivo = esExclusivo; }

    /**
     * Indica si pertenece a Ofertas Especiales.
     *
     * @return `true` si está en oferta; `false` en caso contrario.
     */
    public boolean isEsOferta() { return esOferta; }

    /**
     * Establece si pertenece a Ofertas Especiales.
     *
     * @param esOferta `true` si está en oferta.
     */
    public void setEsOferta(boolean esOferta) { this.esOferta = esOferta; }

    /**
     * Obtiene la fecha de creación del producto.
     *
     * @return Fecha de creación (`String`).
     */
    public String getFechaCreacion() { return fechaCreacion; }

    /**
     * Establece la fecha de creación del producto.
     *
     * @param fechaCreacion Fecha de creación (`String`).
     */
    public void setFechaCreacion(String fechaCreacion) { this.fechaCreacion = fechaCreacion; }

    /**
     * Obtiene la lista de URLs de imágenes del producto.
     *
     * @return Lista de imágenes (`List<String>`).
     */
    public List<String> getImagenes() { return imagenes; }

    /**
     * Establece la lista de URLs de imágenes del producto.
     *
     * @param imagenes Lista de imágenes (`List<String>`).
     */
    public void setImagenes(List<String> imagenes) { this.imagenes = imagenes; }
}
