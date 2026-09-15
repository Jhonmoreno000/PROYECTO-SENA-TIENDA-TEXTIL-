package dominio.modelos;

import com.google.gson.annotations.SerializedName;

/**
 * Modelo que representa un ticket de soporte técnico o atención al cliente.
 * Mapea a la tabla "support_tickets" en PostgreSQL.
 */
public class TicketSoporte {
    /** Identificador único del ticket. */
    @SerializedName(value = "id", alternate = {"idTicket"})
    private int id;

    /** ID del cliente que abrió el ticket. */
    @SerializedName(value = "clientId", alternate = {"idCliente"})
    private Integer idCliente;

    /** Nombre del cliente. */
    @SerializedName(value = "clientName", alternate = {"nombreCliente"})
    private String nombreCliente;

    /** Correo electrónico del cliente. */
    @SerializedName(value = "clientEmail", alternate = {"correoCliente"})
    private String correoCliente;

    /** ID del pedido relacionado. */
    @SerializedName(value = "orderId", alternate = {"idPedido"})
    private Integer idPedido;

    /** Asunto o título breve del ticket. */
    @SerializedName(value = "subject", alternate = {"asunto"})
    private String asunto;

    /** Descripción detallada del problema. */
    @SerializedName(value = "description", alternate = {"descripcion"})
    private String descripcion;

    /** Prioridad del ticket: "low", "medium", "high", "critical". */
    @SerializedName(value = "priority", alternate = {"prioridad"})
    private String prioridad;

    /** Estado del ticket: "open", "in_progress", "resolved", "closed". */
    @SerializedName(value = "status", alternate = {"estado"})
    private String estado;

    /** Categoría del problema. */
    @SerializedName(value = "category", alternate = {"categoria"})
    private String categoria;

    /** ID del agente asignado. */
    @SerializedName(value = "assignedTo", alternate = {"asignadoA"})
    private Integer asignadoA;

    /** Fecha y hora de creación. */
    @SerializedName(value = "createdAt", alternate = {"fechaCreacion"})
    private String fechaCreacion;

    /** Fecha y hora de última actualización. */
    @SerializedName(value = "updatedAt", alternate = {"fechaModificacion"})
    private String fechaModificacion;

    /** Fecha y hora de resolución. */
    @SerializedName(value = "resolvedAt", alternate = {"fechaResolucion"})
    private String fechaResolucion;

    /** Constructor vacío. */
    public TicketSoporte() {}

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public Integer getIdCliente() { return idCliente; }
    public void setIdCliente(Integer idCliente) { this.idCliente = idCliente; }

    public String getNombreCliente() { return nombreCliente; }
    public void setNombreCliente(String nombreCliente) { this.nombreCliente = nombreCliente; }

    public String getCorreoCliente() { return correoCliente; }
    public void setCorreoCliente(String correoCliente) { this.correoCliente = correoCliente; }

    public Integer getIdPedido() { return idPedido; }
    public void setIdPedido(Integer idPedido) { this.idPedido = idPedido; }

    public String getAsunto() { return asunto; }
    public void setAsunto(String asunto) { this.asunto = asunto; }

    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }

    public String getPrioridad() { return prioridad; }
    public void setPrioridad(String prioridad) { this.prioridad = prioridad; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    public String getCategoria() { return categoria; }
    public void setCategoria(String categoria) { this.categoria = categoria; }

    public Integer getAsignadoA() { return asignadoA; }
    public void setAsignadoA(Integer asignadoA) { this.asignadoA = asignadoA; }

    public String getFechaCreacion() { return fechaCreacion; }
    public void setFechaCreacion(String fechaCreacion) { this.fechaCreacion = fechaCreacion; }

    public String getFechaModificacion() { return fechaModificacion; }
    public void setFechaModificacion(String fechaModificacion) { this.fechaModificacion = fechaModificacion; }

    public String getFechaResolucion() { return fechaResolucion; }
    public void setFechaResolucion(String fechaResolucion) { this.fechaResolucion = fechaResolucion; }
}
