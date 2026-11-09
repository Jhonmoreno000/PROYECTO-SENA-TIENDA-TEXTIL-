package dominio.modelos;

import com.google.gson.annotations.SerializedName;

/**
 * Modelo de dominio que representa un reporte de error o novedad operativa del sistema.
 * Mapea a la tabla `reportes_errores` en PostgreSQL.
 */
public class ReporteError {

    /** Identificador único del reporte (`int`). */
    @SerializedName(value = "id", alternate = {"idReporte"})
    private int id;

    /** Identificador del vendedor o usuario que reportó el incidente (`Integer`). */
    @SerializedName(value = "sellerId", alternate = {"idVendedor", "userId", "idUsuario"})
    private Integer idVendedor;

    /** Nombre del vendedor o reportante (`String`). */
    @SerializedName(value = "sellerName", alternate = {"nombreVendedor"})
    private String nombreVendedor;

    /** Alias de usuario reportante sincronizado para el frontend (`String`). */
    @SerializedName(value = "user", alternate = {"usuario"})
    private String usuario;

    /** Correo electrónico de quien reporta el incidente (`String`). */
    @SerializedName(value = "email", alternate = {"correo", "correoReportante"})
    private String correo;

    /** Identificador del producto relacionado con el reporte, si aplica (`Integer`). */
    @SerializedName(value = "productId", alternate = {"idProducto", "productoId"})
    private Integer idProducto;

    /** Nombre del producto relacionado con el reporte, si aplica (`String`). */
    @SerializedName(value = "productName", alternate = {"nombreProducto"})
    private String nombreProducto;

    /** Área o módulo funcional donde se presentó el problema (`String`). */
    @SerializedName(value = "area", alternate = {"modulo"})
    private String area;

    /** Título descriptivo del reporte (`String`). */
    @SerializedName(value = "title", alternate = {"titulo"})
    private String titulo;

    /** Descripción detallada del incidente (`String`). */
    @SerializedName(value = "description", alternate = {"descripcion"})
    private String descripcion;

    /** Pasos para reproducir el error (`String`). */
    @SerializedName(value = "steps", alternate = {"pasos"})
    private String pasos;

    /** Estado del reporte (`String`: `"new"`, `"pending"`, `"reviewing"`, `"fixed"`, `"resolved"`, `"closed"`). */
    @SerializedName(value = "status", alternate = {"estado"})
    private String estado;

    /** Nivel de prioridad del incidente (`String`). */
    @SerializedName(value = "priority", alternate = {"prioridad"})
    private String prioridad;

    /** Nivel de severidad del incidente (`String`). */
    @SerializedName(value = "severity", alternate = {"severidad"})
    private String severidad;

    /** Identificador del administrador o técnico asignado (`Integer`). */
    @SerializedName(value = "assignedTo", alternate = {"asignadoA"})
    private Integer asignadoA;

    /** Fecha y hora en que se registró el reporte (`String`). */
    @SerializedName(value = "reportedAt", alternate = {"fechaReporte"})
    private String fechaReporte;

    /** Alias de fecha sincronizado con `fechaReporte` para vistas de administración (`String`). */
    @SerializedName(value = "date", alternate = {"fecha"})
    private String fecha;

    /** Alias `createdAt` sincronizado con `fechaReporte` (`String`). */
    @SerializedName(value = "createdAt")
    private String createdAt;

    /** Fecha y hora de resolución del reporte (`String`). */
    @SerializedName(value = "resolvedAt", alternate = {"fechaResolucion"})
    private String fechaResolucion;

    /**
     * Constructor vacío requerido para serialización JSON y mapeo JDBC.
     */
    public ReporteError() {}

    /**
     * Obtiene el identificador único del reporte.
     *
     * @return Identificador numérico (`int`).
     */
    public int getId() { return id; }

    /**
     * Establece el identificador único del reporte.
     *
     * @param id Identificador numérico (`int`).
     */
    public void setId(int id) { this.id = id; }

    /**
     * Obtiene el identificador del vendedor o usuario reportante.
     *
     * @return Identificador del usuario (`Integer`) o `null`.
     */
    public Integer getIdVendedor() { return idVendedor; }

    /**
     * Establece el identificador del vendedor o usuario reportante.
     *
     * @param idVendedor Identificador del usuario (`Integer`).
     */
    public void setIdVendedor(Integer idVendedor) { this.idVendedor = idVendedor; }

    /**
     * Obtiene el nombre del vendedor o usuario reportante.
     *
     * @return Nombre del reportante (`String`).
     */
    public String getNombreVendedor() {
        return (nombreVendedor != null && !nombreVendedor.isBlank()) ? nombreVendedor : usuario;
    }

    /**
     * Establece el nombre del vendedor y sincroniza el alias `user`.
     *
     * @param nombreVendedor Nombre del reportante (`String`).
     */
    public void setNombreVendedor(String nombreVendedor) {
        this.nombreVendedor = nombreVendedor;
        this.usuario = nombreVendedor;
    }

    /**
     * Obtiene el alias de usuario reportante.
     *
     * @return Nombre del usuario (`String`).
     */
    public String getUsuario() {
        return (usuario != null && !usuario.isBlank()) ? usuario : nombreVendedor;
    }

    /**
     * Establece el alias de usuario reportante y sincroniza `nombreVendedor`.
     *
     * @param usuario Nombre del usuario (`String`).
     */
    public void setUsuario(String usuario) {
        this.usuario = usuario;
        if (this.nombreVendedor == null || this.nombreVendedor.isBlank()) {
            this.nombreVendedor = usuario;
        }
    }

    /**
     * Obtiene el correo electrónico del reportante.
     *
     * @return Correo electrónico (`String`).
     */
    public String getCorreo() { return correo; }

    /**
     * Establece el correo electrónico del reportante.
     *
     * @param correo Correo electrónico (`String`).
     */
    public void setCorreo(String correo) { this.correo = correo; }

    /**
     * Obtiene el identificador del producto asociado al reporte.
     *
     * @return Identificador del producto (`Integer`) o `null`.
     */
    public Integer getIdProducto() { return idProducto; }

    /**
     * Establece el identificador del producto asociado al reporte.
     *
     * @param idProducto Identificador del producto (`Integer`).
     */
    public void setIdProducto(Integer idProducto) { this.idProducto = idProducto; }

    /**
     * Obtiene el nombre del producto asociado al reporte.
     *
     * @return Nombre del producto (`String`).
     */
    public String getNombreProducto() { return nombreProducto; }

    /**
     * Establece el nombre del producto asociado al reporte.
     *
     * @param nombreProducto Nombre del producto (`String`).
     */
    public void setNombreProducto(String nombreProducto) { this.nombreProducto = nombreProducto; }

    /**
     * Obtiene el área o módulo del reporte, usando el título como respaldo.
     *
     * @return Área del reporte (`String`).
     */
    public String getArea() { return (area != null && !area.isBlank()) ? area : titulo; }

    /**
     * Establece el área o módulo del reporte.
     *
     * @param area Área del reporte (`String`).
     */
    public void setArea(String area) {
        this.area = area;
        if (this.titulo == null) this.titulo = area;
    }

    /**
     * Obtiene el título del reporte, usando el área como respaldo.
     *
     * @return Título del reporte (`String`).
     */
    public String getTitulo() { return (titulo != null && !titulo.isBlank()) ? titulo : area; }

    /**
     * Establece el título del reporte.
     *
     * @param titulo Título del reporte (`String`).
     */
    public void setTitulo(String titulo) {
        this.titulo = titulo;
        if (this.area == null) this.area = titulo;
    }

    /**
     * Obtiene la descripción del error.
     *
     * @return Descripción (`String`).
     */
    public String getDescripcion() { return descripcion; }

    /**
     * Establece la descripción del error.
     *
     * @param descripcion Descripción (`String`).
     */
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }

    /**
     * Obtiene los pasos para reproducir el error.
     *
     * @return Pasos de reproducción (`String`).
     */
    public String getPasos() { return pasos; }

    /**
     * Establece los pasos para reproducir el error.
     *
     * @param pasos Pasos de reproducción (`String`).
     */
    public void setPasos(String pasos) { this.pasos = pasos; }

    /**
     * Obtiene el estado del reporte.
     *
     * @return Estado (`String`).
     */
    public String getEstado() { return estado; }

    /**
     * Establece el estado del reporte.
     *
     * @param estado Estado (`String`).
     */
    public void setEstado(String estado) { this.estado = estado; }

    /**
     * Obtiene la prioridad del reporte.
     *
     * @return Prioridad (`String`).
     */
    public String getPrioridad() { return prioridad != null ? prioridad : (severidad != null ? severidad : "low"); }

    /**
     * Establece la prioridad del reporte.
     *
     * @param prioridad Prioridad (`String`).
     */
    public void setPrioridad(String prioridad) {
        this.prioridad = prioridad;
        if (this.severidad == null) this.severidad = prioridad;
    }

    /**
     * Obtiene la severidad del reporte.
     *
     * @return Severidad (`String`).
     */
    public String getSeveridad() { return severidad != null ? severidad : (prioridad != null ? prioridad : "low"); }

    /**
     * Establece la severidad del reporte.
     *
     * @param severidad Severidad (`String`).
     */
    public void setSeveridad(String severidad) {
        this.severidad = severidad;
        if (this.prioridad == null) this.prioridad = severidad;
    }

    /**
     * Obtiene el identificador de la persona asignada.
     *
     * @return Identificador del usuario asignado (`Integer`) o `null`.
     */
    public Integer getAsignadoA() { return asignadoA; }

    /**
     * Establece el identificador de la persona asignada.
     *
     * @param asignadoA Identificador del usuario asignado (`Integer`).
     */
    public void setAsignadoA(Integer asignadoA) { this.asignadoA = asignadoA; }

    /**
     * Obtiene la fecha de creación del reporte.
     *
     * @return Marca de tiempo (`String`).
     */
    public String getFechaReporte() {
        if (fechaReporte != null) return fechaReporte;
        return fecha != null ? fecha : createdAt;
    }

    /**
     * Establece la fecha del reporte y sincroniza los alias `date` y `createdAt`.
     *
     * @param fechaReporte Marca de tiempo (`String`).
     */
    public void setFechaReporte(String fechaReporte) {
        this.fechaReporte = fechaReporte;
        this.fecha = fechaReporte;
        this.createdAt = fechaReporte;
    }

    /**
     * Obtiene la fecha de resolución del reporte.
     *
     * @return Marca de tiempo (`String`) o `null`.
     */
    public String getFechaResolucion() { return fechaResolucion; }

    /**
     * Establece la fecha de resolución del reporte.
     *
     * @param fechaResolucion Marca de tiempo (`String`).
     */
    public void setFechaResolucion(String fechaResolucion) { this.fechaResolucion = fechaResolucion; }
}
