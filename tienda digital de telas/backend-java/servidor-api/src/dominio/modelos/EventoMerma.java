package dominio.modelos;

import com.google.gson.annotations.SerializedName;

/**
 * Modelo de dominio que representa un evento de merma o desperdicio textil en bodega.
 * Mapea a la tabla `eventos_merma` en PostgreSQL.
 */
public class EventoMerma {

    /** Identificador único del evento de merma (`int`). */
    @SerializedName(value = "id", alternate = {"idMerma"})
    private int id;

    /** Identificador del producto textil afectado (`Integer`). */
    @SerializedName(value = "productId", alternate = {"idProducto", "productoId"})
    private Integer idProducto;

    /** Código o identificador del lote o rollo afectado (`String`). */
    @SerializedName(value = "batchId", alternate = {"idLote"})
    private String idLote;

    /** Cantidad de metros de tela perdidos o reclasificados (`double`). */
    @SerializedName(value = "meters", alternate = {"metros", "metersLost", "metrosPerdidos"})
    private double metros;

    /** Motivo clasificado de la merma (`String`). */
    @SerializedName(value = "reason", alternate = {"motivo"})
    private String motivo;

    /** Descripción detallada del suceso (`String`). */
    @SerializedName(value = "description", alternate = {"descripcion"})
    private String descripcion;

    /** Impacto económico calculado en pesos colombianos (`Double`). */
    @SerializedName(value = "costImpact", alternate = {"impactoCosto"})
    private Double impactoCosto;

    /** Nombre del operario o supervisor responsable del registro (`String`). */
    @SerializedName(value = "responsible", alternate = {"responsable"})
    private String responsable;

    /** Fecha en que ocurrió el evento de merma (`String`). */
    @SerializedName(value = "eventDate", alternate = {"fechaEvento"})
    private String fechaEvento;

    /** Marca de tiempo de creación del registro (`String`). */
    @SerializedName(value = "createdAt", alternate = {"fechaCreacion"})
    private String fechaCreacion;

    /** Identificador del usuario que reportó el evento (`int`). */
    @SerializedName(value = "userId", alternate = {"idUsuario"})
    private int idUsuario;

    /**
     * Constructor vacío requerido para serialización JSON y mapeo JDBC.
     */
    public EventoMerma() {}

    /**
     * Obtiene el identificador único del evento de merma.
     *
     * @return Identificador numérico (`int`).
     */
    public int getId() { return id; }

    /**
     * Establece el identificador único del evento de merma.
     *
     * @param id Identificador numérico (`int`).
     */
    public void setId(int id) { this.id = id; }

    /**
     * Obtiene el identificador del producto asociado.
     *
     * @return Identificador del producto (`Integer`) o `null`.
     */
    public Integer getIdProducto() { return idProducto; }

    /**
     * Establece el identificador del producto asociado.
     *
     * @param idProducto Identificador del producto (`Integer`).
     */
    public void setIdProducto(Integer idProducto) { this.idProducto = idProducto; }

    /**
     * Obtiene el identificador del producto asociado.
     *
     * @return Identificador del producto (`Integer`).
     */
    public Integer getProductoId() { return idProducto; }

    /**
     * Establece el identificador del producto asociado.
     *
     * @param productoId Identificador del producto (`Integer`).
     */
    public void setProductoId(Integer productoId) { this.idProducto = productoId; }

    /**
     * Obtiene el identificador del lote o rollo afectado.
     *
     * @return Código del lote (`String`).
     */
    public String getIdLote() { return idLote; }

    /**
     * Establece el identificador del lote o rollo afectado.
     *
     * @param idLote Código del lote (`String`).
     */
    public void setIdLote(String idLote) { this.idLote = idLote; }

    /**
     * Obtiene la cantidad de metros perdidos.
     *
     * @return Metros de merma (`double`).
     */
    public double getMetros() { return metros; }

    /**
     * Establece la cantidad de metros perdidos.
     *
     * @param metros Metros de merma (`double`).
     */
    public void setMetros(double metros) { this.metros = metros; }

    /**
     * Obtiene el motivo de la merma.
     *
     * @return Motivo (`String`).
     */
    public String getMotivo() { return motivo; }

    /**
     * Establece el motivo de la merma.
     *
     * @param motivo Motivo (`String`).
     */
    public void setMotivo(String motivo) { this.motivo = motivo; }

    /**
     * Obtiene la descripción detallada del evento.
     *
     * @return Descripción (`String`).
     */
    public String getDescripcion() { return descripcion; }

    /**
     * Establece la descripción detallada del evento.
     *
     * @param descripcion Descripción (`String`).
     */
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }

    /**
     * Obtiene el impacto económico de la merma en pesos.
     *
     * @return Impacto en costo (`Double`) o `null`.
     */
    public Double getImpactoCosto() { return impactoCosto; }

    /**
     * Establece el impacto económico de la merma en pesos.
     *
     * @param impactoCosto Impacto en costo (`Double`).
     */
    public void setImpactoCosto(Double impactoCosto) { this.impactoCosto = impactoCosto; }

    /**
     * Obtiene el nombre del responsable que registró la merma.
     *
     * @return Nombre del responsable (`String`).
     */
    public String getResponsable() { return responsable; }

    /**
     * Establece el nombre del responsable que registró la merma.
     *
     * @param responsable Nombre del responsable (`String`).
     */
    public void setResponsable(String responsable) { this.responsable = responsable; }

    /**
     * Obtiene la fecha del evento.
     *
     * @return Fecha del evento (`String`).
     */
    public String getFechaEvento() { return fechaEvento; }

    /**
     * Establece la fecha del evento.
     *
     * @param fechaEvento Fecha del evento (`String`).
     */
    public void setFechaEvento(String fechaEvento) { this.fechaEvento = fechaEvento; }

    /**
     * Obtiene la fecha de registro en el sistema.
     *
     * @return Fecha de creación (`String`).
     */
    public String getFechaCreacion() { return fechaCreacion; }

    /**
     * Establece la fecha de registro en el sistema.
     *
     * @param fechaCreacion Fecha de creación (`String`).
     */
    public void setFechaCreacion(String fechaCreacion) { this.fechaCreacion = fechaCreacion; }

    /**
     * Obtiene el identificador del usuario que reportó la merma.
     *
     * @return Identificador de usuario (`int`).
     */
    public int getIdUsuario() { return idUsuario; }

    /**
     * Establece el identificador del usuario que reportó la merma.
     *
     * @param idUsuario Identificador de usuario (`int`).
     */
    public void setIdUsuario(int idUsuario) { this.idUsuario = idUsuario; }
}
