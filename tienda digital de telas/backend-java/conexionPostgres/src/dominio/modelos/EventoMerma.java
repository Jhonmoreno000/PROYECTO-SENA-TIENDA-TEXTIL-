package dominio.modelos;

import com.google.gson.annotations.SerializedName;

/**
 * Modelo que representa un evento de merma o desperdicio en el inventario.
 * Mapea a la tabla "waste_events" en PostgreSQL.
 */
public class EventoMerma {
    /** Identificador único del evento. */
    @SerializedName(value = "id", alternate = {"idMerma"})
    private int id;

    /** ID del lote asociado. */
    @SerializedName(value = "batchId", alternate = {"idLote"})
    private String idLote;

    /** Metros de tela desperdiciados. */
    @SerializedName(value = "meters", alternate = {"metros"})
    private double metros;

    /** Motivo o razón del desperdicio. */
    @SerializedName(value = "reason", alternate = {"motivo"})
    private String motivo;

    /** Descripción detallada del suceso. */
    @SerializedName(value = "description", alternate = {"descripcion"})
    private String descripcion;

    /** Persona responsable de registrar el evento. */
    @SerializedName(value = "responsible", alternate = {"responsable"})
    private String responsable;

    /** Fecha del evento. */
    @SerializedName(value = "eventDate", alternate = {"fechaEvento"})
    private String fechaEvento;

    /** Fecha de creación en el sistema. */
    @SerializedName(value = "createdAt", alternate = {"fechaCreacion"})
    private String fechaCreacion;

    /** ID del usuario que registró el evento. */
    @SerializedName(value = "userId", alternate = {"idUsuario"})
    private int idUsuario;

    /** Constructor vacío. */
    public EventoMerma() {}

    /** Obtiene el ID del evento. */
    public int getId() { return id; }
    /** Asigna el ID del evento. */
    public void setId(int id) { this.id = id; }

    /** Obtiene el ID del lote. */
    public String getIdLote() { return idLote; }
    /** Asigna el ID del lote. */
    public void setIdLote(String idLote) { this.idLote = idLote; }

    /** Obtiene los metros desperdiciados. */
    public double getMetros() { return metros; }
    /** Asigna los metros desperdiciados. */
    public void setMetros(double metros) { this.metros = metros; }

    /** Obtiene el motivo del desperdicio. */
    public String getMotivo() { return motivo; }
    /** Asigna el motivo del desperdicio. */
    public void setMotivo(String motivo) { this.motivo = motivo; }

    /** Obtiene la descripción. */
    public String getDescripcion() { return descripcion; }
    /** Asigna la descripción. */
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }

    /** Obtiene el responsable. */
    public String getResponsable() { return responsable; }
    /** Asigna el responsable. */
    public void setResponsable(String responsable) { this.responsable = responsable; }

    /** Obtiene la fecha del evento. */
    public String getFechaEvento() { return fechaEvento; }
    /** Asigna la fecha del evento. */
    public void setFechaEvento(String fechaEvento) { this.fechaEvento = fechaEvento; }

    /** Obtiene la fecha de registro. */
    public String getFechaCreacion() { return fechaCreacion; }
    /** Asigna la fecha de registro. */
    public void setFechaCreacion(String fechaCreacion) { this.fechaCreacion = fechaCreacion; }

    /** Obtiene el ID del usuario. */
    public int getIdUsuario() { return idUsuario; }
    /** Asigna el ID del usuario. */
    public void setIdUsuario(int idUsuario) { this.idUsuario = idUsuario; }
}
