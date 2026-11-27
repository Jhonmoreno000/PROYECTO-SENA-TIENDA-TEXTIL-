package dominio.modelos;

import com.google.gson.annotations.SerializedName;

/**
 * Modelo de dominio que representa un retazo textil (pieza unica sobrante de un rollo < 1.00 m).
 * Mapea a la tabla `retazos` en PostgreSQL y mantiene trazabilidad hacia el producto y rollo de origen.
 */
public class Retazo {

    @SerializedName(value = "id", alternate = {"retazoId", "idRetazo"})
    private int id;

    @SerializedName(value = "remnantCode", alternate = {"codigoRetazo", "code"})
    private String codigoRetazo;

    @SerializedName(value = "productId", alternate = {"productoId", "idProducto"})
    private int productoId;

    @SerializedName(value = "rollId", alternate = {"rolloId", "idRollo"})
    private Integer rolloId;

    @SerializedName(value = "name", alternate = {"productName", "nombreProducto"})
    private String nombreProducto;

    @SerializedName(value = "category", alternate = {"categoria"})
    private String categoria;

    @SerializedName(value = "material")
    private String material;

    @SerializedName(value = "image", alternate = {"imagen", "urlImagen"})
    private String imagen;

    @SerializedName(value = "lengthMeters", alternate = {"largoMetros", "largo"})
    private double largoMetros;

    @SerializedName(value = "widthMeters", alternate = {"anchoMetros", "ancho"})
    private double anchoMetros;

    @SerializedName(value = "originalPrice", alternate = {"precioOriginal"})
    private double precioOriginal;

    @SerializedName(value = "price", alternate = {"precioLiquidacion", "liquidationPrice"})
    private double precioLiquidacion;

    @SerializedName(value = "discountPercent", alternate = {"porcentajeDescuento"})
    private double porcentajeDescuento;

    @SerializedName(value = "status", alternate = {"estado"})
    private String estado;

    @SerializedName(value = "dyeLot", alternate = {"loteTintoreria"})
    private String loteTintoreria;

    @SerializedName(value = "warehouseLocation", alternate = {"ubicacionBodega"})
    private String ubicacionBodega;

    @SerializedName(value = "notes", alternate = {"notas"})
    private String notas;

    @SerializedName(value = "orderId", alternate = {"pedidoId"})
    private Integer pedidoId;

    @SerializedName(value = "createdAt", alternate = {"creadoEn"})
    private String creadoEn;

    @SerializedName(value = "itemType")
    private String itemType = "RETAZO";

    public Retazo() {}

    public static Retazo crearDemo(int id, String codigo, int productoId, String nombre, String categoria,
                                   String material, String imagen, double largo, double ancho,
                                   double original, double precio, double desc, String estado,
                                   String lote, String notas) {
        Retazo r = new Retazo();
        r.id = id;
        r.codigoRetazo = codigo;
        r.productoId = productoId;
        r.nombreProducto = nombre;
        r.categoria = categoria;
        r.material = material;
        r.imagen = imagen;
        r.largoMetros = largo;
        r.anchoMetros = ancho;
        r.precioOriginal = original;
        r.precioLiquidacion = precio;
        r.porcentajeDescuento = desc;
        r.estado = estado;
        r.loteTintoreria = lote;
        r.notas = notas;
        r.creadoEn = "2026-11-23 10:00:00";
        return r;
    }

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getCodigoRetazo() { return codigoRetazo; }
    public void setCodigoRetazo(String codigoRetazo) { this.codigoRetazo = codigoRetazo; }

    public int getProductoId() { return productoId; }
    public void setProductoId(int productoId) { this.productoId = productoId; }

    public Integer getRolloId() { return rolloId; }
    public void setRolloId(Integer rolloId) { this.rolloId = rolloId; }

    public String getNombreProducto() { return nombreProducto; }
    public void setNombreProducto(String nombreProducto) { this.nombreProducto = nombreProducto; }

    public String getCategoria() { return categoria; }
    public void setCategoria(String categoria) { this.categoria = categoria; }

    public String getMaterial() { return material; }
    public void setMaterial(String material) { this.material = material; }

    public String getImagen() { return imagen; }
    public void setImagen(String imagen) { this.imagen = imagen; }

    public double getLargoMetros() { return largoMetros; }
    public void setLargoMetros(double largoMetros) { this.largoMetros = largoMetros; }

    public double getAnchoMetros() { return anchoMetros; }
    public void setAnchoMetros(double anchoMetros) { this.anchoMetros = anchoMetros; }

    public double getPrecioOriginal() { return precioOriginal; }
    public void setPrecioOriginal(double precioOriginal) { this.precioOriginal = precioOriginal; }

    public double getPrecioLiquidacion() { return precioLiquidacion; }
    public void setPrecioLiquidacion(double precioLiquidacion) { this.precioLiquidacion = precioLiquidacion; }

    public double getPorcentajeDescuento() { return porcentajeDescuento; }
    public void setPorcentajeDescuento(double porcentajeDescuento) { this.porcentajeDescuento = porcentajeDescuento; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    public String getLoteTintoreria() { return loteTintoreria; }
    public void setLoteTintoreria(String loteTintoreria) { this.loteTintoreria = loteTintoreria; }

    public String getUbicacionBodega() { return ubicacionBodega; }
    public void setUbicacionBodega(String ubicacionBodega) { this.ubicacionBodega = ubicacionBodega; }

    public String getNotas() { return notas; }
    public void setNotas(String notas) { this.notas = notas; }

    public Integer getPedidoId() { return pedidoId; }
    public void setPedidoId(Integer pedidoId) { this.pedidoId = pedidoId; }

    public String getCreadoEn() { return creadoEn; }
    public void setCreadoEn(String creadoEn) { this.creadoEn = creadoEn; }

    public String getItemType() { return itemType; }
    public void setItemType(String itemType) { this.itemType = itemType; }
}
