package dominio.modelos;

import com.google.gson.annotations.SerializedName;

/**
 * Modelo de dominio que representa una unidad física de rollo de tela en bodega.
 * Mapea a la tabla `rollos_textil` en PostgreSQL, garantizando trazabilidad por metraje continuo y lote de tintorería.
 */
public class RolloTextil {

    /** Identificador numérico único del rollo (`int`). */
    @SerializedName(value = "id", alternate = {"idRollo"})
    private int id;

    /** Identificador del producto asociado al rollo (`int`). */
    @SerializedName(value = "productId", alternate = {"productoId", "idProducto"})
    private int productoId;

    /** Nombre comercial de la tela asociado mediante `JOIN` (`String`). */
    @SerializedName(value = "productName", alternate = {"nombreProducto", "fabricType"})
    private String nombreProducto;

    /** Código único de barras o etiqueta del rollo físico (`String`, ej. `"ROL-001"`). */
    @SerializedName(value = "rollCode", alternate = {"codigoRollo"})
    private String codigoRollo;

    /** Metraje continuo original con el que ingresó el rollo (`double`). */
    @SerializedName(value = "initialMeters", alternate = {"metrajeInicial"})
    private double metrajeInicial;

    /** Metraje continuo remanente disponible en el rollo (`double`). */
    @SerializedName(value = "remainingMeters", alternate = {"metrajeRemanente"})
    private double metrajeRemanente;

    /** Código del lote de tintorería para control de tono cromático (`String`). */
    @SerializedName(value = "dyeLot", alternate = {"loteTintoreria"})
    private String loteTintoreria;

    /** Estado operativo del rollo (`String`: `"disponible"`, `"reservado"`, `"retazo_liquidado"`, `"agotado"`). */
    @SerializedName(value = "status", alternate = {"estado"})
    private String estado;

    /** Ubicación física en pasillo y estante de la bodega (`String`). */
    @SerializedName(value = "warehouseLocation", alternate = {"ubicacionBodega"})
    private String ubicacionBodega;

    /**
     * Constructor vacío requerido para serialización JSON y mapeo JDBC.
     */
    public RolloTextil() {}

    /**
     * Construye una instancia de rollo textil con sus datos operativos principales.
     *
     * @param id Identificador único del rollo (`int`).
     * @param productoId Identificador del producto (`int`).
     * @param codigoRollo Código único del rollo (`String`).
     * @param metrajeInicial Metraje inicial en metros (`double`).
     * @param metrajeRemanente Metraje remanente en metros (`double`).
     * @param loteTintoreria Código del lote de tintorería (`String`).
     * @param estado Estado actual del rollo (`String`).
     */
    public RolloTextil(int id, int productoId, String codigoRollo, double metrajeInicial, double metrajeRemanente, String loteTintoreria, String estado) {
        this.id = id;
        this.productoId = productoId;
        this.codigoRollo = codigoRollo;
        this.metrajeInicial = metrajeInicial;
        this.metrajeRemanente = metrajeRemanente;
        this.loteTintoreria = loteTintoreria;
        this.estado = estado;
    }

    /**
     * Obtiene el identificador único del rollo.
     *
     * @return Identificador numérico (`int`).
     */
    public int getId() { return id; }

    /**
     * Establece el identificador único del rollo.
     *
     * @param id Identificador numérico (`int`).
     */
    public void setId(int id) { this.id = id; }

    /**
     * Obtiene el identificador del producto asociado.
     *
     * @return Identificador del producto (`int`).
     */
    public int getProductoId() { return productoId; }

    /**
     * Establece el identificador del producto asociado.
     *
     * @param productoId Identificador del producto (`int`).
     */
    public void setProductoId(int productoId) { this.productoId = productoId; }

    /**
     * Alias para {@link #getProductoId()}.
     *
     * @return Identificador del producto (`int`).
     */
    public int getIdProducto() { return productoId; }

    /**
     * Alias para {@link #setProductoId(int)}.
     *
     * @param idProducto Identificador del producto (`int`).
     */
    public void setIdProducto(int idProducto) { this.productoId = idProducto; }

    /**
     * Obtiene el nombre comercial de la tela.
     *
     * @return Nombre de la tela (`String`).
     */
    public String getNombreProducto() { return nombreProducto; }

    /**
     * Establece el nombre comercial de la tela.
     *
     * @param nombreProducto Nombre de la tela (`String`).
     */
    public void setNombreProducto(String nombreProducto) { this.nombreProducto = nombreProducto; }

    /**
     * Obtiene el código único del rollo.
     *
     * @return Código del rollo (`String`).
     */
    public String getCodigoRollo() { return codigoRollo; }

    /**
     * Establece el código único del rollo.
     *
     * @param codigoRollo Código del rollo (`String`).
     */
    public void setCodigoRollo(String codigoRollo) { this.codigoRollo = codigoRollo; }

    /**
     * Obtiene el metraje inicial del rollo.
     *
     * @return Metraje inicial (`double`).
     */
    public double getMetrajeInicial() { return metrajeInicial; }

    /**
     * Establece el metraje inicial del rollo.
     *
     * @param metrajeInicial Metraje inicial (`double`).
     */
    public void setMetrajeInicial(double metrajeInicial) { this.metrajeInicial = metrajeInicial; }

    /**
     * Obtiene el metraje continuo remanente del rollo.
     *
     * @return Metraje remanente (`double`).
     */
    public double getMetrajeRemanente() { return metrajeRemanente; }

    /**
     * Establece el metraje continuo remanente del rollo.
     *
     * @param metrajeRemanente Metraje remanente (`double`).
     */
    public void setMetrajeRemanente(double metrajeRemanente) { this.metrajeRemanente = metrajeRemanente; }

    /**
     * Obtiene el código del lote de tintorería.
     *
     * @return Lote de tintorería (`String`).
     */
    public String getLoteTintoreria() { return loteTintoreria; }

    /**
     * Establece el código del lote de tintorería.
     *
     * @param loteTintoreria Lote de tintorería (`String`).
     */
    public void setLoteTintoreria(String loteTintoreria) { this.loteTintoreria = loteTintoreria; }

    /**
     * Obtiene el estado operativo del rollo.
     *
     * @return Estado del rollo (`String`).
     */
    public String getEstado() { return estado; }

    /**
     * Establece el estado operativo del rollo.
     *
     * @param estado Estado del rollo (`String`).
     */
    public void setEstado(String estado) { this.estado = estado; }

    /**
     * Obtiene la ubicación física en bodega.
     *
     * @return Ubicación en bodega (`String`).
     */
    public String getUbicacionBodega() { return ubicacionBodega; }

    /**
     * Establece la ubicación física en bodega.
     *
     * @param ubicacionBodega Ubicación en bodega (`String`).
     */
    public void setUbicacionBodega(String ubicacionBodega) { this.ubicacionBodega = ubicacionBodega; }
}
