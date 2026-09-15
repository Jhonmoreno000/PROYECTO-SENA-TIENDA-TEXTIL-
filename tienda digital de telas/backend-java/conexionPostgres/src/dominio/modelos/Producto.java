package dominio.modelos;

import com.google.gson.annotations.SerializedName;
import java.util.ArrayList;
import java.util.List;

/**
 * Modelo que representa un producto (tela) disponible en el catálogo de D&D Textil.
 * Mapea a la tabla "products" (o "productos") en la base de datos PostgreSQL.
 */
public class Producto {
    /** Identificador único del producto. */
    @SerializedName(value = "id", alternate = {"idProducto"})
    private String id;

    /** Nombre comercial del producto/tela. */
    @SerializedName(value = "name", alternate = {"nombre"})
    private String nombre;

    /** Categoría del producto (ej: "Algodón", "Poliéster", "Mezcla"). */
    @SerializedName(value = "category", alternate = {"categoria"})
    private String categoria;

    /** Precio de venta por unidad/metro del producto. */
    @SerializedName(value = "price", alternate = {"precio"})
    private double precio;

    /** ID del vendedor que ofrece este producto. */
    @SerializedName(value = "sellerId", alternate = {"idVendedor"})
    private int idVendedor;

    /** Descripción detallada del producto. */
    @SerializedName(value = "description", alternate = {"descripcion"})
    private String descripcion;

    /** Material o composición textil del producto. */
    @SerializedName(value = "material", alternate = {"composicion"})
    private String material;

    /** Ancho de la tela en metros (ej: "1.50m"). */
    @SerializedName(value = "width", alternate = {"ancho"})
    private String ancho;

    /** Peso del producto en gramos por metro cuadrado (gr/m²). */
    @SerializedName(value = "weight", alternate = {"peso"})
    private String peso;

    /** Instrucciones de cuidado y lavado del producto. */
    @SerializedName(value = "care", alternate = {"cuidado", "instruccionesCuidado"})
    private String cuidado;

    /** Cantidad disponible en existencias / inventario. */
    @SerializedName(value = "stock", alternate = {"existencias"})
    private int existencias;

    /** Indica si el producto debe aparecer destacado en la página principal. */
    @SerializedName(value = "featured", alternate = {"destacado"})
    private boolean destacado;

    /** Indica si el producto pertenece a la sección "Nuevas Colecciones". */
    @SerializedName(value = "isNewCollection", alternate = {"esNuevaColeccion"})
    private boolean esNuevaColeccion;

    /** Indica si el producto pertenece a la sección "Telas Exclusivas". */
    @SerializedName(value = "isExclusive", alternate = {"esExclusivo"})
    private boolean esExclusivo;

    /** Indica si el producto pertenece a la sección "Ofertas Especiales". */
    @SerializedName(value = "isOffer", alternate = {"esOferta"})
    private boolean esOferta;

    /** Lista de URLs de imágenes del producto. */
    @SerializedName(value = "images", alternate = {"imagenes"})
    private List<String> imagenes;

    /**
     * Constructor vacío. Inicializa la lista de imágenes vacía.
     */
    public Producto() {
        this.imagenes = new ArrayList<>();
    }

    /** Obtiene el identificador único del producto. */
    public String getId() { return id; }
    /** Asigna el identificador único del producto. */
    public void setId(String id) { this.id = id; }

    /** Obtiene el nombre del producto. */
    public String getNombre() { return nombre; }
    /** Asigna el nombre del producto. */
    public void setNombre(String nombre) { this.nombre = nombre; }

    /** Obtiene la categoría del producto. */
    public String getCategoria() { return categoria; }
    /** Asigna la categoría del producto. */
    public void setCategoria(String categoria) { this.categoria = categoria; }

    /** Obtiene el precio del producto. */
    public double getPrecio() { return precio; }
    /** Asigna el precio del producto. */
    public void setPrecio(double precio) { this.precio = precio; }

    /** Obtiene el ID del vendedor. */
    public int getIdVendedor() { return idVendedor; }
    /** Asigna el ID del vendedor. */
    public void setIdVendedor(int idVendedor) { this.idVendedor = idVendedor; }

    /** Obtiene la descripción del producto. */
    public String getDescripcion() { return descripcion; }
    /** Asigna la descripción del producto. */
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }

    /** Obtiene la composición o material textil. */
    public String getMaterial() { return material; }
    /** Asigna la composición o material textil. */
    public void setMaterial(String material) { this.material = material; }

    /** Obtiene el ancho de la tela. */
    public String getAncho() { return ancho; }
    /** Asigna el ancho de la tela. */
    public void setAncho(String ancho) { this.ancho = ancho; }

    /** Obtiene el peso de la tela. */
    public String getPeso() { return peso; }
    /** Asigna el peso de la tela. */
    public void setPeso(String peso) { this.peso = peso; }

    /** Obtiene las instrucciones de cuidado y lavado. */
    public String getCuidado() { return cuidado; }
    /** Asigna las instrucciones de cuidado y lavado. */
    public void setCuidado(String cuidado) { this.cuidado = cuidado; }

    /** Obtiene la cantidad de existencias / stock. */
    public int getExistencias() { return existencias; }
    /** Asigna la cantidad de existencias / stock. */
    public void setExistencias(int existencias) { this.existencias = existencias; }

    /** Indica si el producto está destacado. */
    public boolean isDestacado() { return destacado; }
    /** Establece si el producto está destacado. */
    public void setDestacado(boolean destacado) { this.destacado = destacado; }

    /** Indica si es parte de nueva colección. */
    public boolean isEsNuevaColeccion() { return esNuevaColeccion; }
    /** Establece si es nueva colección. */
    public void setEsNuevaColeccion(boolean esNuevaColeccion) { this.esNuevaColeccion = esNuevaColeccion; }

    /** Indica si es tela exclusiva. */
    public boolean isEsExclusivo() { return esExclusivo; }
    /** Establece si es tela exclusiva. */
    public void setEsExclusivo(boolean esExclusivo) { this.esExclusivo = esExclusivo; }

    /** Indica si está en oferta. */
    public boolean isEsOferta() { return esOferta; }
    /** Establece si está en oferta. */
    public void setEsOferta(boolean esOferta) { this.esOferta = esOferta; }

    /** Obtiene la lista de imágenes del producto. */
    public List<String> getImagenes() { return imagenes; }
    /** Asigna la lista de imágenes del producto. */
    public void setImagenes(List<String> imagenes) { this.imagenes = imagenes; }
}
