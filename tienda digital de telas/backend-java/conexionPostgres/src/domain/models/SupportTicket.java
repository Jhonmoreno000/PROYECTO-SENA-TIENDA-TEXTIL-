package domain.models;

/**
 * Modelo que representa un ticket de soporte técnico o atención al cliente.
 * Mapea a la tabla "support_tickets" en la base de datos PostgreSQL.
 */
public class SupportTicket {
    /** Identificador único del ticket de soporte (clave primaria autoincremental). */
    private int id;
    /** ID del cliente que abrió el ticket (puede ser nulo si el cliente no está registrado). */
    private Integer clientId;
    /** Nombre del cliente para mostrar en el ticket. */
    private String clientName;
    /** Correo electrónico del cliente para contacto y notificaciones. */
    private String clientEmail;
    /** ID del pedido relacionado con el ticket (nulo si no aplica a un pedido específico). */
    private Integer orderId;
    /** Asunto o título breve del ticket. */
    private String subject;
    /** Descripción detallada del problema o consulta del cliente. */
    private String description;
    /** Prioridad del ticket: "low", "medium", "high", "critical". */
    private String priority;
    /** Estado del ticket: "open", "in_progress", "resolved", "closed". */
    private String status;
    /** Categoría del problema: "billing", "shipping", "product", "account", etc. */
    private String category;
    /** ID del agente de soporte asignado para atender el ticket (nulo si no asignado). */
    private Integer assignedTo;
    /** Fecha y hora de creación del ticket. */
    private String createdAt;
    /** Fecha y hora de la última actualización del ticket. */
    private String updatedAt;
    /** Fecha y hora en que se resolvió el ticket (nulo si aún no está resuelto). */
    private String resolvedAt;

    /** Constructor vacío requerido por frameworks de serialización. */
    public SupportTicket() {}

    /** Obtiene el identificador único del ticket. */
    public int getId() { return id; }
    /** Asigna el identificador único del ticket. */
    public void setId(int id) { this.id = id; }

    /** Obtiene el ID del cliente asociado al ticket. */
    public Integer getClientId() { return clientId; }
    /** Asigna el ID del cliente asociado al ticket. */
    public void setClientId(Integer clientId) { this.clientId = clientId; }

    /** Obtiene el nombre del cliente. */
    public String getClientName() { return clientName; }
    /** Asigna el nombre del cliente. */
    public void setClientName(String clientName) { this.clientName = clientName; }

    /** Obtiene el correo electrónico del cliente. */
    public String getClientEmail() { return clientEmail; }
    /** Asigna el correo electrónico del cliente. */
    public void setClientEmail(String clientEmail) { this.clientEmail = clientEmail; }

    /** Obtiene el ID del pedido relacionado. */
    public Integer getOrderId() { return orderId; }
    /** Asigna el ID del pedido relacionado. */
    public void setOrderId(Integer orderId) { this.orderId = orderId; }

    /** Obtiene el asunto del ticket. */
    public String getSubject() { return subject; }
    /** Asigna el asunto del ticket. */
    public void setSubject(String subject) { this.subject = subject; }

    /** Obtiene la descripción detallada del problema. */
    public String getDescription() { return description; }
    /** Asigna la descripción detallada del problema. */
    public void setDescription(String description) { this.description = description; }

    /** Obtiene la prioridad del ticket. */
    public String getPriority() { return priority; }
    /** Asigna la prioridad del ticket. */
    public void setPriority(String priority) { this.priority = priority; }

    /** Obtiene el estado actual del ticket. */
    public String getStatus() { return status; }
    /** Asigna el estado actual del ticket. */
    public void setStatus(String status) { this.status = status; }

    /** Obtiene la categoría del ticket. */
    public String getCategory() { return category; }
    /** Asigna la categoría del ticket. */
    public void setCategory(String category) { this.category = category; }

    /** Obtiene el ID del agente asignado al ticket. */
    public Integer getAssignedTo() { return assignedTo; }
    /** Asigna el ID del agente asignado al ticket. */
    public void setAssignedTo(Integer assignedTo) { this.assignedTo = assignedTo; }

    /** Obtiene la fecha de creación del ticket. */
    public String getCreatedAt() { return createdAt; }
    /** Asigna la fecha de creación del ticket. */
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }

    /** Obtiene la fecha de última actualización del ticket. */
    public String getUpdatedAt() { return updatedAt; }
    /** Asigna la fecha de última actualización del ticket. */
    public void setUpdatedAt(String updatedAt) { this.updatedAt = updatedAt; }

    /** Obtiene la fecha de resolución del ticket. */
    public String getResolvedAt() { return resolvedAt; }
    /** Asigna la fecha de resolución del ticket. */
    public void setResolvedAt(String resolvedAt) { this.resolvedAt = resolvedAt; }
}
