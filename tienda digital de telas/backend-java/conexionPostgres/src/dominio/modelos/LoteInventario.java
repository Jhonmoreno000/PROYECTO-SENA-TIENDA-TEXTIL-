package dominio.modelos;

import com.google.gson.annotations.SerializedName;

/**
 * Modelo que representa un lote de inventario de tela en el almacén.
 * Mapea a la tabla "inventory_batches" en PostgreSQL.
 */
public class LoteInventario {
    /** Identificador único del lote. */
    @SerializedName(value = "id", alternate = {"idLote"})
    private String id;

    /** Tipo de tela o material del lote. */
    @SerializedName(value = "fabricType", alternate = {"tipoTela"})
    private String tipoTela;

    /** Nombre del proveedor que suministró el lote. */
    @SerializedName(value = "supplier", alternate = {"proveedor"})
    private String proveedor;

    /** Metros iniciales del lote. */
    @SerializedName(value = "initialMeters", alternate = {"metrosIniciales"})
    private double metrosIniciales;

    /** Metros actuales disponibles. */
    @SerializedName(value = "currentMeters", alternate = {"metrosActuales"})
    private double metrosActuales;

    /** Estado del lote: "available", "low", "depleted", "reserved". */
    @SerializedName(value = "status", alternate = {"estado"})
    private String estado;

    /** Fecha de registro del lote. */
    @SerializedName(value = "createdAt", alternate = {"fechaCreacion"})
    private String fechaCreacion;

    /** Fecha de última modificación. */
    @SerializedName(value = "lastUpdate", alternate = {"ultimaActualizacion"})
    private String ultimaActualizacion;

    /** Constructor vacío. */
    public LoteInventario() {}

    /** Obtiene el identificador del lote. */
    public String getId() { return id; }
    /** Asigna el identificador del lote. */
    public void setId(String id) { this.id = id; }

    /** Obtiene el tipo de tela. */
    public String getTipoTela() { return tipoTela; }
    /** Asigna el tipo de tela. */
    public void setTipoTela(String tipoTela) { this.tipoTela = tipoTela; }

    /** Obtiene el proveedor. */
    public String getProveedor() { return proveedor; }
    /** Asigna el proveedor. */
    public void setProveedor(String proveedor) { this.proveedor = proveedor; }

    /** Obtiene los metros iniciales. */
    public double getMetrosIniciales() { return metrosIniciales; }
    /** Asigna los metros iniciales. */
    public void setMetrosIniciales(double metrosIniciales) { this.metrosIniciales = metrosIniciales; }

    /** Obtiene los metros actuales. */
    public double getMetrosActuales() { return metrosActuales; }
    /** Asigna los metros actuales. */
    public void setMetrosActuales(double metrosActuales) { this.metrosActuales = metrosActuales; }

    /** Obtiene el estado del lote. */
    public String getEstado() { return estado; }
    /** Asigna el estado del lote. */
    public void setEstado(String estado) { this.estado = estado; }

    /** Obtiene la fecha de creación. */
    public String getFechaCreacion() { return fechaCreacion; }
    /** Asigna la fecha de creación. */
    public void setFechaCreacion(String fechaCreacion) { this.fechaCreacion = fechaCreacion; }

    /** Obtiene la fecha de última actualización. */
    public String getUltimaActualizacion() { return ultimaActualizacion; }
    /** Asigna la fecha de última actualización. */
    public void setUltimaActualizacion(String ultimaActualizacion) { this.ultimaActualizacion = ultimaActualizacion; }
}
