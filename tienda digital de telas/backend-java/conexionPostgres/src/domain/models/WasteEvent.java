package domain.models;

/**
 * Modelo que representa un evento de desperdicio o merma de tela en el inventario.
 * Mapea a la tabla "waste_events" en la base de datos PostgreSQL.
 * Registra cuándo y por qué se descarta material de un lote.
 */
public class WasteEvent {
    /** Identificador único del evento de desperdicio (clave primaria autoincremental). */
    private int id;
    /** ID del lote de inventario del cual se descartó material (clave foránea a inventory_batches). */
    private String batchId;
    /** Cantidad de metros de tela desperdiciados en este evento. */
    private double meters;
    /** Razón o motivo del desperdicio (ej: "defecto", "daño", "caducado"). */
    private String reason;
    /** Descripción detallada de las circunstancias del desperdicio. */
    private String description;
    /** Nombre de la persona responsable de registrar el desperdicio. */
    private String responsible;
    /** Fecha en que ocurrió el evento de desperdicio. */
    private String eventDate;
    /** Fecha y hora de creación del registro en el sistema. */
    private String createdAt;
    /** ID del usuario que registró el evento (clave foránea a users). */
    private int userId;

    /** Constructor vacío requerido por frameworks de serialización. */
    public WasteEvent() {}

    /** Obtiene el identificador único del evento. */
    public int getId() { return id; }
    /** Asigna el identificador único del evento. */
    public void setId(int id) { this.id = id; }
    /** Obtiene el ID del lote asociado. */
    public String getBatchId() { return batchId; }
    /** Asigna el ID del lote asociado. */
    public void setBatchId(String batchId) { this.batchId = batchId; }
    /** Obtiene los metros desperdiciados. */
    public double getMeters() { return meters; }
    /** Asigna los metros desperdiciados. */
    public void setMeters(double meters) { this.meters = meters; }
    /** Obtiene la razón del desperdicio. */
    public String getReason() { return reason; }
    /** Asigna la razón del desperdicio. */
    public void setReason(String reason) { this.reason = reason; }
    /** Obtiene la descripción del evento. */
    public String getDescription() { return description; }
    /** Asigna la descripción del evento. */
    public void setDescription(String description) { this.description = description; }
    /** Obtiene el responsable del registro. */
    public String getResponsible() { return responsible; }
    /** Asigna el responsable del registro. */
    public void setResponsible(String responsible) { this.responsible = responsible; }
    /** Obtiene la fecha del evento. */
    public String getEventDate() { return eventDate; }
    /** Asigna la fecha del evento. */
    public void setEventDate(String eventDate) { this.eventDate = eventDate; }
    /** Obtiene la fecha de creación del registro. */
    public String getCreatedAt() { return createdAt; }
    /** Asigna la fecha de creación del registro. */
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
    /** Obtiene el ID del usuario que registró el evento. */
    public int getUserId() { return userId; }
    /** Asigna el ID del usuario que registró el evento. */
    public void setUserId(int userId) { this.userId = userId; }
}
