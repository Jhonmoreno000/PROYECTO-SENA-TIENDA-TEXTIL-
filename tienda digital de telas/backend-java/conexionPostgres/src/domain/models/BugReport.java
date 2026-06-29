package domain.models;

/**
 * Modelo que representa un reporte de error (bug) enviado por un vendedor.
 * Mapea a la tabla "bug_reports" en la base de datos PostgreSQL.
 */
public class BugReport {
    /** Identificador único del reporte de error (clave primaria autoincremental). */
    private int id;
    /** ID del vendedor que reportó el error (puede ser nulo si el reporte es anónimo). */
    private Integer sellerId;
    /** Nombre del vendedor que reportó el error, para referencia visual. */
    private String sellerName;
    /** Área o módulo de la aplicación donde ocurrió el error (ej: "checkout", "inventario"). */
    private String area;
    /** Descripción detallada del error observado. */
    private String description;
    /** Pasos para reproducir el error. */
    private String steps;
    /** Estado del reporte: "pending", "reviewing", "fixed", "closed". */
    private String status;
    /** Prioridad del error: "low", "medium", "high", "critical". */
    private String priority;
    /** ID del desarrollador o persona asignada para resolver el error (nulo si no asignado). */
    private Integer assignedTo;
    /** Fecha y hora en que se reportó el error. */
    private String reportedAt;
    /** Fecha y hora en que se resolvió el error (nulo si aún no se ha resuelto). */
    private String resolvedAt;

    /** Constructor vacío requerido por frameworks de serialización. */
    public BugReport() {}

    /** Obtiene el identificador único del reporte. */
    public int getId() { return id; }
    /** Asigna el identificador único del reporte. */
    public void setId(int id) { this.id = id; }

    /** Obtiene el ID del vendedor que reportó el error. */
    public Integer getSellerId() { return sellerId; }
    /** Asigna el ID del vendedor que reportó el error. */
    public void setSellerId(Integer sellerId) { this.sellerId = sellerId; }

    /** Obtiene el nombre del vendedor que reportó el error. */
    public String getSellerName() { return sellerName; }
    /** Asigna el nombre del vendedor que reportó el error. */
    public void setSellerName(String sellerName) { this.sellerName = sellerName; }

    /** Obtiene el área de la aplicación donde ocurrió el error. */
    public String getArea() { return area; }
    /** Asigna el área de la aplicación donde ocurrió el error. */
    public void setArea(String area) { this.area = area; }

    /** Obtiene la descripción del error. */
    public String getDescription() { return description; }
    /** Asigna la descripción del error. */
    public void setDescription(String description) { this.description = description; }

    /** Obtiene los pasos para reproducir el error. */
    public String getSteps() { return steps; }
    /** Asigna los pasos para reproducir el error. */
    public void setSteps(String steps) { this.steps = steps; }

    /** Obtiene el estado del reporte. */
    public String getStatus() { return status; }
    /** Asigna el estado del reporte. */
    public void setStatus(String status) { this.status = status; }

    /** Obtiene la prioridad del error. */
    public String getPriority() { return priority; }
    /** Asigna la prioridad del error. */
    public void setPriority(String priority) { this.priority = priority; }

    /** Obtiene el ID de la persona asignada para resolver el error. */
    public Integer getAssignedTo() { return assignedTo; }
    /** Asigna el ID de la persona asignada para resolver el error. */
    public void setAssignedTo(Integer assignedTo) { this.assignedTo = assignedTo; }

    /** Obtiene la fecha en que se reportó el error. */
    public String getReportedAt() { return reportedAt; }
    /** Asigna la fecha en que se reportó el error. */
    public void setReportedAt(String reportedAt) { this.reportedAt = reportedAt; }

    /** Obtiene la fecha en que se resolvió el error. */
    public String getResolvedAt() { return resolvedAt; }
    /** Asigna la fecha en que se resolvió el error. */
    public void setResolvedAt(String resolvedAt) { this.resolvedAt = resolvedAt; }
}
