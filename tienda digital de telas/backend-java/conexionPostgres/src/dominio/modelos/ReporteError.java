package dominio.modelos;

import com.google.gson.annotations.SerializedName;

/**
 * Modelo que representa un reporte de error (bug) del sistema.
 * Mapea a la tabla "bug_reports" en PostgreSQL.
 */
public class ReporteError {
    /** Identificador único del reporte. */
    @SerializedName(value = "id", alternate = {"idReporte"})
    private int id;

    /** ID del vendedor que reportó el error. */
    @SerializedName(value = "sellerId", alternate = {"idVendedor"})
    private Integer idVendedor;

    /** Nombre del vendedor. */
    @SerializedName(value = "sellerName", alternate = {"nombreVendedor"})
    private String nombreVendedor;

    /** Área o módulo donde ocurrió el error. */
    @SerializedName(value = "area", alternate = {"modulo"})
    private String area;

    /** Título del reporte de error. */
    @SerializedName(value = "title", alternate = {"titulo"})
    private String titulo;

    /** Descripción del error. */
    @SerializedName(value = "description", alternate = {"descripcion"})
    private String descripcion;

    /** Pasos para reproducir el error. */
    @SerializedName(value = "steps", alternate = {"pasos"})
    private String pasos;

    /** Estado del reporte: "pending", "reviewing", "fixed", "closed", "open", "resolved". */
    @SerializedName(value = "status", alternate = {"estado"})
    private String estado;

    /** Prioridad del error. */
    @SerializedName(value = "priority", alternate = {"prioridad"})
    private String prioridad;

    /** Severidad del error (alta, media, baja / high, medium, low). */
    @SerializedName(value = "severity", alternate = {"severidad"})
    private String severidad;

    /** ID de la persona asignada. */
    @SerializedName(value = "assignedTo", alternate = {"asignadoA"})
    private Integer asignadoA;

    /** Fecha y hora en que se reportó. */
    @SerializedName(value = "reportedAt", alternate = {"fechaReporte"})
    private String fechaReporte;

    /** Fecha y hora de resolución. */
    @SerializedName(value = "resolvedAt", alternate = {"fechaResolucion"})
    private String fechaResolucion;

    /** Constructor vacío. */
    public ReporteError() {}

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public Integer getIdVendedor() { return idVendedor; }
    public void setIdVendedor(Integer idVendedor) { this.idVendedor = idVendedor; }

    public String getNombreVendedor() { return nombreVendedor; }
    public void setNombreVendedor(String nombreVendedor) { this.nombreVendedor = nombreVendedor; }

    public String getArea() { return (area != null && !area.isBlank()) ? area : titulo; }
    public void setArea(String area) { this.area = area; if (this.titulo == null) this.titulo = area; }

    public String getTitulo() { return (titulo != null && !titulo.isBlank()) ? titulo : area; }
    public void setTitulo(String titulo) { this.titulo = titulo; if (this.area == null) this.area = titulo; }

    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }

    public String getPasos() { return pasos; }
    public void setPasos(String pasos) { this.pasos = pasos; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    public String getPrioridad() { return prioridad != null ? prioridad : (severidad != null ? severidad : "low"); }
    public void setPrioridad(String prioridad) { this.prioridad = prioridad; if (this.severidad == null) this.severidad = prioridad; }

    public String getSeveridad() { return severidad != null ? severidad : (prioridad != null ? prioridad : "low"); }
    public void setSeveridad(String severidad) { this.severidad = severidad; if (this.prioridad == null) this.prioridad = severidad; }

    public Integer getAsignadoA() { return asignadoA; }
    public void setAsignadoA(Integer asignadoA) { this.asignadoA = asignadoA; }

    public String getFechaReporte() { return fechaReporte; }
    public void setFechaReporte(String fechaReporte) { this.fechaReporte = fechaReporte; }

    public String getFechaResolucion() { return fechaResolucion; }
    public void setFechaResolucion(String fechaResolucion) { this.fechaResolucion = fechaResolucion; }
}
