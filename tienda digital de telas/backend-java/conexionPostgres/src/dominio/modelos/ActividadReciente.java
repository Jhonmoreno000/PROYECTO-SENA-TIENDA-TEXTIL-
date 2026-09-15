package dominio.modelos;

import com.google.gson.annotations.SerializedName;

/**
 * Modelo que representa una actividad reciente en el sistema.
 * Mapea a la tabla "recent_activities" en PostgreSQL.
 */
public class ActividadReciente {
    /** Identificador único de la actividad. */
    @SerializedName(value = "id", alternate = {"idActividad"})
    private int id;

    /** Tipo de actividad: "sale", "registration", "order", "ticket", etc. */
    @SerializedName(value = "type", alternate = {"tipo"})
    private String tipo;

    /** ID del usuario que realizó la actividad. */
    @SerializedName(value = "userId", alternate = {"idUsuario"})
    private int idUsuario;

    /** Nombre del usuario para visualización. */
    @SerializedName(value = "userName", alternate = {"nombreUsuario"})
    private String nombreUsuario;

    /** Descripción de la acción realizada. */
    @SerializedName(value = "action", alternate = {"accion"})
    private String accion;

    /** Monto asociado a la actividad (si aplica). */
    @SerializedName(value = "amount", alternate = {"monto"})
    private Double monto;

    /** Fecha y hora en que ocurrió la actividad. */
    @SerializedName(value = "createdAt", alternate = {"fechaCreacion"})
    private String fechaCreacion;

    /** Ícono representativo en la interfaz. */
    @SerializedName(value = "icon", alternate = {"icono"})
    private String icono;

    /** Constructor vacío. */
    public ActividadReciente() {}

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getTipo() { return tipo; }
    public void setTipo(String tipo) { this.tipo = tipo; }

    public int getIdUsuario() { return idUsuario; }
    public void setIdUsuario(int idUsuario) { this.idUsuario = idUsuario; }

    public String getNombreUsuario() { return nombreUsuario; }
    public void setNombreUsuario(String nombreUsuario) { this.nombreUsuario = nombreUsuario; }

    public String getAccion() { return accion; }
    public void setAccion(String accion) { this.accion = accion; }

    public Double getMonto() { return monto; }
    public void setMonto(Double monto) { this.monto = monto; }

    public String getFechaCreacion() { return fechaCreacion; }
    public void setFechaCreacion(String fechaCreacion) { this.fechaCreacion = fechaCreacion; }

    public String getIcono() { return icono; }
    public void setIcono(String icono) { this.icono = icono; }
}
