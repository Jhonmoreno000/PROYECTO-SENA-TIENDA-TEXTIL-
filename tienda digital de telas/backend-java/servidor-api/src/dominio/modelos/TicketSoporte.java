package dominio.modelos;

import com.google.gson.annotations.SerializedName;

/**
 * Modelo de dominio que representa un ticket de soporte técnico o atención al cliente.
 * Mapea a la tabla `tickets_soporte` en PostgreSQL.
 */
public class TicketSoporte {

    /** Identificador único del ticket (`int`). */
    @SerializedName(value = "id", alternate = {"idTicket"})
    private int id;

    /** Identificador del cliente o usuario que abrió el ticket (`Integer`). */
    @SerializedName(value = "clientId", alternate = {"idCliente", "userId", "idUsuario"})
    private Integer idCliente;

    /** Nombre completo del cliente solicitante (`String`). */
    @SerializedName(value = "clientName", alternate = {"nombreCliente", "customerName", "userName"})
    private String nombreCliente;

    /** Correo electrónico de contacto del cliente (`String`). */
    @SerializedName(value = "clientEmail", alternate = {"correoCliente", "customerEmail", "email"})
    private String correoCliente;

    /** Identificador del pedido asociado al ticket, si aplica (`Integer`). */
    @SerializedName(value = "orderId", alternate = {"idPedido", "pedidoId"})
    private Integer idPedido;

    /** Asunto o resumen breve del ticket (`String`). */
    @SerializedName(value = "subject", alternate = {"asunto"})
    private String asunto;

    /** Descripción detallada de la solicitud o inconveniente (`String`). */
    @SerializedName(value = "description", alternate = {"descripcion"})
    private String descripcion;

    /** Alias `message` sincronizado con `descripcion` para compatibilidad con el frontend (`String`). */
    @SerializedName(value = "message", alternate = {"mensaje"})
    private String mensaje;

    /** Prioridad del ticket (`String`: `"low"`, `"medium"`, `"high"`, `"critical"`). */
    @SerializedName(value = "priority", alternate = {"prioridad"})
    private String prioridad;

    /** Estado operativo del ticket (`String`: `"open"`, `"in_progress"`, `"resolved"`, `"closed"`). */
    @SerializedName(value = "status", alternate = {"estado"})
    private String estado;

    /** Categoría de clasificación del ticket (`String`). */
    @SerializedName(value = "category", alternate = {"categoria"})
    private String categoria;

    /** Identificador del agente o administrador asignado (`Integer`). */
    @SerializedName(value = "assignedTo", alternate = {"asignadoA"})
    private Integer asignadoA;

    /** Fecha y hora de creación del ticket (`String`). */
    @SerializedName(value = "createdAt", alternate = {"fechaCreacion"})
    private String fechaCreacion;

    /** Fecha y hora de última modificación (`String`). */
    @SerializedName(value = "updatedAt", alternate = {"fechaModificacion"})
    private String fechaModificacion;

    /** Fecha y hora de cierre o resolución (`String`). */
    @SerializedName(value = "resolvedAt", alternate = {"fechaResolucion"})
    private String fechaResolucion;

    /**
     * Constructor vacío requerido para serialización JSON y mapeo JDBC.
     */
    public TicketSoporte() {}

    /**
     * Obtiene el identificador único del ticket.
     *
     * @return Identificador numérico (`int`).
     */
    public int getId() { return id; }

    /**
     * Establece el identificador único del ticket.
     *
     * @param id Identificador numérico (`int`).
     */
    public void setId(int id) { this.id = id; }

    /**
     * Obtiene el identificador del cliente solicitante.
     *
     * @return Identificador del cliente (`Integer`) o `null`.
     */
    public Integer getIdCliente() { return idCliente; }

    /**
     * Establece el identificador del cliente solicitante.
     *
     * @param idCliente Identificador del cliente (`Integer`).
     */
    public void setIdCliente(Integer idCliente) { this.idCliente = idCliente; }

    /**
     * Obtiene el nombre del cliente.
     *
     * @return Nombre del cliente (`String`).
     */
    public String getNombreCliente() { return nombreCliente; }

    /**
     * Establece el nombre del cliente.
     *
     * @param nombreCliente Nombre del cliente (`String`).
     */
    public void setNombreCliente(String nombreCliente) { this.nombreCliente = nombreCliente; }

    /**
     * Obtiene el correo electrónico del cliente.
     *
     * @return Correo del cliente (`String`).
     */
    public String getCorreoCliente() { return correoCliente; }

    /**
     * Establece el correo electrónico del cliente.
     *
     * @param correoCliente Correo del cliente (`String`).
     */
    public void setCorreoCliente(String correoCliente) { this.correoCliente = correoCliente; }

    /**
     * Obtiene el identificador del pedido relacionado.
     *
     * @return Identificador del pedido (`Integer`) o `null`.
     */
    public Integer getIdPedido() { return idPedido; }

    /**
     * Establece el identificador del pedido relacionado.
     *
     * @param idPedido Identificador del pedido (`Integer`).
     */
    public void setIdPedido(Integer idPedido) { this.idPedido = idPedido; }

    /**
     * Obtiene el asunto del ticket.
     *
     * @return Asunto (`String`).
     */
    public String getAsunto() { return asunto; }

    /**
     * Establece el asunto del ticket.
     *
     * @param asunto Asunto (`String`).
     */
    public void setAsunto(String asunto) { this.asunto = asunto; }

    /**
     * Obtiene la descripción del ticket, usando `mensaje` como respaldo si se deserializó bajo esa clave.
     *
     * @return Descripción del ticket (`String`).
     */
    public String getDescripcion() {
        return (descripcion != null && !descripcion.isBlank()) ? descripcion : mensaje;
    }

    /**
     * Establece la descripción del ticket y sincroniza el campo `mensaje`.
     *
     * @param descripcion Descripción del ticket (`String`).
     */
    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
        this.mensaje = descripcion;
    }

    /**
     * Obtiene el mensaje del ticket.
     *
     * @return Mensaje (`String`).
     */
    public String getMensaje() {
        return (mensaje != null && !mensaje.isBlank()) ? mensaje : descripcion;
    }

    /**
     * Establece el mensaje del ticket y sincroniza `descripcion`.
     *
     * @param mensaje Mensaje (`String`).
     */
    public void setMensaje(String mensaje) {
        this.mensaje = mensaje;
        if (this.descripcion == null || this.descripcion.isBlank()) {
            this.descripcion = mensaje;
        }
    }

    /**
     * Obtiene la prioridad del ticket.
     *
     * @return Prioridad (`String`).
     */
    public String getPrioridad() { return prioridad; }

    /**
     * Establece la prioridad del ticket.
     *
     * @param prioridad Prioridad (`String`).
     */
    public void setPrioridad(String prioridad) { this.prioridad = prioridad; }

    /**
     * Obtiene el estado del ticket.
     *
     * @return Estado (`String`).
     */
    public String getEstado() { return estado; }

    /**
     * Establece el estado del ticket.
     *
     * @param estado Estado (`String`).
     */
    public void setEstado(String estado) { this.estado = estado; }

    /**
     * Obtiene la categoría del ticket.
     *
     * @return Categoría (`String`).
     */
    public String getCategoria() { return categoria; }

    /**
     * Establece la categoría del ticket.
     *
     * @param categoria Categoría (`String`).
     */
    public void setCategoria(String categoria) { this.categoria = categoria; }

    /**
     * Obtiene el identificador del agente asignado.
     *
     * @return Identificador del usuario asignado (`Integer`) o `null`.
     */
    public Integer getAsignadoA() { return asignadoA; }

    /**
     * Establece el identificador del agente asignado.
     *
     * @param asignadoA Identificador del usuario asignado (`Integer`).
     */
    public void setAsignadoA(Integer asignadoA) { this.asignadoA = asignadoA; }

    /**
     * Obtiene la fecha de creación del ticket.
     *
     * @return Fecha de creación (`String`).
     */
    public String getFechaCreacion() { return fechaCreacion; }

    /**
     * Establece la fecha de creación del ticket.
     *
     * @param fechaCreacion Fecha de creación (`String`).
     */
    public void setFechaCreacion(String fechaCreacion) { this.fechaCreacion = fechaCreacion; }

    /**
     * Obtiene la fecha de última modificación.
     *
     * @return Fecha de modificación (`String`).
     */
    public String getFechaModificacion() { return fechaModificacion; }

    /**
     * Establece la fecha de última modificación.
     *
     * @param fechaModificacion Fecha de modificación (`String`).
     */
    public void setFechaModificacion(String fechaModificacion) { this.fechaModificacion = fechaModificacion; }

    /**
     * Obtiene la fecha de resolución del ticket.
     *
     * @return Fecha de resolución (`String`).
     */
    public String getFechaResolucion() { return fechaResolucion; }

    /**
     * Establece la fecha de resolución del ticket.
     *
     * @param fechaResolucion Fecha de resolución (`String`).
     */
    public void setFechaResolucion(String fechaResolucion) { this.fechaResolucion = fechaResolucion; }
}
