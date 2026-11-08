package dominio.modelos;

import com.google.gson.annotations.SerializedName;

/**
 * Modelo de dominio que representa un lote de inventario de tela recibido en almacén.
 * Mapea a la tabla `lotes_inventario` en PostgreSQL.
 */
public class LoteInventario {

    /** Identificador único del lote (`String`). */
    @SerializedName(value = "id", alternate = {"idLote"})
    private String id;

    /** Identificador del producto asociado al lote (`Integer`). */
    @SerializedName(value = "productId", alternate = {"idProducto", "productoId"})
    private Integer idProducto;

    /** Código de lote de tintorería o recepción (`String`). */
    @SerializedName(value = "batchNumber", alternate = {"numeroLote", "dyeLot", "batchCode"})
    private String numeroLote;

    /** Nombre o tipo de tela asociada al lote (`String`). */
    @SerializedName(value = "fabricType", alternate = {"tipoTela"})
    private String tipoTela;

    /** Nombre del proveedor que suministró el lote (`String`). */
    @SerializedName(value = "supplier", alternate = {"proveedor"})
    private String proveedor;

    /** Metraje inicial recibido en el lote (`double`). */
    @SerializedName(value = "initialMeters", alternate = {"metrosIniciales", "metrosRecibidos"})
    private double metrosIniciales;

    /** Metraje actual disponible en el lote (`double`). */
    @SerializedName(value = "currentMeters", alternate = {"metrosActuales"})
    private double metrosActuales;

    /** Costo de adquisición por metro del lote (`Double`). */
    @SerializedName(value = "costPerMeter", alternate = {"costoPorMetro", "unitCost"})
    private Double costoPorMetro;

    /** Estado operativo del lote (`String`: `"active"`, `"available"`, `"low"`, `"depleted"`). */
    @SerializedName(value = "status", alternate = {"estado"})
    private String estado;

    /** Notas u observaciones de recepción (`String`). */
    @SerializedName(value = "notes", alternate = {"notas"})
    private String notas;

    /** Fecha de recepción o registro del lote (`String`). */
    @SerializedName(value = "createdAt", alternate = {"fechaCreacion", "fechaRecepcion"})
    private String fechaCreacion;

    /** Fecha de última actualización del lote (`String`). */
    @SerializedName(value = "lastUpdate", alternate = {"ultimaActualizacion"})
    private String ultimaActualizacion;

    /**
     * Constructor vacío requerido para serialización JSON y mapeo JDBC.
     */
    public LoteInventario() {}

    /**
     * Obtiene el identificador del lote.
     *
     * @return Identificador del lote (`String`).
     */
    public String getId() { return id; }

    /**
     * Establece el identificador del lote.
     *
     * @param id Identificador del lote (`String`).
     */
    public void setId(String id) { this.id = id; }

    /**
     * Obtiene el identificador numérico del producto asociado.
     *
     * @return Identificador del producto (`Integer`) o `null`.
     */
    public Integer getIdProducto() { return idProducto; }

    /**
     * Establece el identificador numérico del producto asociado.
     *
     * @param idProducto Identificador del producto (`Integer`).
     */
    public void setIdProducto(Integer idProducto) { this.idProducto = idProducto; }

    /**
     * Obtiene el código de lote de tintorería.
     *
     * @return Número o código de lote (`String`).
     */
    public String getNumeroLote() { return numeroLote; }

    /**
     * Establece el código de lote de tintorería.
     *
     * @param numeroLote Número o código de lote (`String`).
     */
    public void setNumeroLote(String numeroLote) { this.numeroLote = numeroLote; }

    /**
     * Obtiene el tipo o nombre de tela del lote.
     *
     * @return Tipo de tela (`String`).
     */
    public String getTipoTela() { return tipoTela; }

    /**
     * Establece el tipo o nombre de tela del lote.
     *
     * @param tipoTela Tipo de tela (`String`).
     */
    public void setTipoTela(String tipoTela) { this.tipoTela = tipoTela; }

    /**
     * Obtiene el nombre del proveedor.
     *
     * @return Proveedor (`String`).
     */
    public String getProveedor() { return proveedor; }

    /**
     * Establece el nombre del proveedor.
     *
     * @param proveedor Proveedor (`String`).
     */
    public void setProveedor(String proveedor) { this.proveedor = proveedor; }

    /**
     * Obtiene el metraje inicial recibido.
     *
     * @return Metros iniciales (`double`).
     */
    public double getMetrosIniciales() { return metrosIniciales; }

    /**
     * Establece el metraje inicial recibido.
     *
     * @param metrosIniciales Metros iniciales (`double`).
     */
    public void setMetrosIniciales(double metrosIniciales) { this.metrosIniciales = metrosIniciales; }

    /**
     * Obtiene el metraje actual disponible.
     *
     * @return Metros actuales (`double`).
     */
    public double getMetrosActuales() { return metrosActuales; }

    /**
     * Establece el metraje actual disponible.
     *
     * @param metrosActuales Metros actuales (`double`).
     */
    public void setMetrosActuales(double metrosActuales) { this.metrosActuales = metrosActuales; }

    /**
     * Obtiene el costo de compra por metro.
     *
     * @return Costo por metro (`Double`) o `null`.
     */
    public Double getCostoPorMetro() { return costoPorMetro; }

    /**
     * Establece el costo de compra por metro.
     *
     * @param costoPorMetro Costo por metro (`Double`).
     */
    public void setCostoPorMetro(Double costoPorMetro) { this.costoPorMetro = costoPorMetro; }

    /**
     * Obtiene el estado actual del lote.
     *
     * @return Estado del lote (`String`).
     */
    public String getEstado() { return estado; }

    /**
     * Establece el estado actual del lote.
     *
     * @param estado Estado del lote (`String`).
     */
    public void setEstado(String estado) { this.estado = estado; }

    /**
     * Obtiene las notas asociadas al lote.
     *
     * @return Notas (`String`).
     */
    public String getNotas() { return notas; }

    /**
     * Establece las notas asociadas al lote.
     *
     * @param notas Notas (`String`).
     */
    public void setNotas(String notas) { this.notas = notas; }

    /**
     * Obtiene la fecha de creación o recepción del lote.
     *
     * @return Fecha de creación (`String`).
     */
    public String getFechaCreacion() { return fechaCreacion; }

    /**
     * Establece la fecha de creación o recepción del lote.
     *
     * @param fechaCreacion Fecha de creación (`String`).
     */
    public void setFechaCreacion(String fechaCreacion) { this.fechaCreacion = fechaCreacion; }

    /**
     * Obtiene la fecha de última actualización.
     *
     * @return Fecha de actualización (`String`).
     */
    public String getUltimaActualizacion() { return ultimaActualizacion; }

    /**
     * Establece la fecha de última actualización.
     *
     * @param ultimaActualizacion Fecha de actualización (`String`).
     */
    public void setUltimaActualizacion(String ultimaActualizacion) { this.ultimaActualizacion = ultimaActualizacion; }
}
