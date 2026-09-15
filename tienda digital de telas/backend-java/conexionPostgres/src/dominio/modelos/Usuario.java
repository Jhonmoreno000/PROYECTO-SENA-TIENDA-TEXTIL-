package dominio.modelos;

import com.google.gson.annotations.SerializedName;

/**
 * Modelo que representa un usuario del sistema (clientes, vendedores, administradores).
 * Mapea a la tabla "users" (o "usuarios") en la base de datos PostgreSQL.
 */
public class Usuario {
    /** Identificador único del usuario. */
    @SerializedName(value = "id", alternate = {"idUsuario"})
    private int id;

    /** Nombre completo del usuario. */
    @SerializedName(value = "name", alternate = {"nombre"})
    private String nombre;

    /** Correo electrónico del usuario, usado como credencial de inicio de sesión. */
    @SerializedName(value = "email", alternate = {"correo"})
    private String correo;

    /** Rol del usuario en el sistema: "admin", "seller" o "client". */
    @SerializedName(value = "role", alternate = {"rol"})
    private String rol;

    /** Indica si la cuenta del usuario está activa (true = activo, false = desactivado). */
    @SerializedName(value = "active", alternate = {"activo"})
    private boolean activo;

    /** Indica si la cuenta del usuario está suspendida temporalmente. */
    @SerializedName(value = "suspended", alternate = {"suspendido"})
    private boolean suspendido;

    /** Razón por la cual la cuenta fue suspendida. */
    @SerializedName(value = "suspensionReason", alternate = {"motivoSuspension"})
    private String motivoSuspension;

    /** Tasa de comisión del vendedor (porcentaje), aplicable solo si el rol es vendedor. */
    @SerializedName(value = "commissionRate", alternate = {"porcentajeComision"})
    private Double porcentajeComision;

    /** Fecha y hora en que el usuario se registró en la plataforma. */
    @SerializedName(value = "registeredAt", alternate = {"fechaRegistro"})
    private String fechaRegistro;

    /** Fecha y hora del último inicio de sesión del usuario. */
    @SerializedName(value = "lastLogin", alternate = {"ultimoAcceso"})
    private String ultimoAcceso;

    /** Estado general del usuario: "active", "inactive", "banned", etc. */
    @SerializedName(value = "status", alternate = {"estado"})
    private String estado;

    /** Constructor vacío requerido por frameworks y serializadores. */
    public Usuario() {}

    /**
     * Constructor completo para inicializar todas las propiedades del usuario.
     */
    public Usuario(int id, String nombre, String correo, String rol, boolean activo, boolean suspendido,
                   String motivoSuspension, Double porcentajeComision, String fechaRegistro, String ultimoAcceso, String estado) {
        this.id = id;
        this.nombre = nombre;
        this.correo = correo;
        this.rol = rol;
        this.activo = activo;
        this.suspendido = suspendido;
        this.motivoSuspension = motivoSuspension;
        this.porcentajeComision = porcentajeComision;
        this.fechaRegistro = fechaRegistro;
        this.ultimoAcceso = ultimoAcceso;
        this.estado = estado;
    }

    /** Obtiene el identificador único del usuario. */
    public int getId() { return id; }
    /** Asigna el identificador único del usuario. */
    public void setId(int id) { this.id = id; }

    /** Obtiene el nombre completo del usuario. */
    public String getNombre() { return nombre; }
    /** Asigna el nombre completo del usuario. */
    public void setNombre(String nombre) { this.nombre = nombre; }

    /** Obtiene el correo electrónico del usuario. */
    public String getCorreo() { return correo; }
    /** Asigna el correo electrónico del usuario. */
    public void setCorreo(String correo) { this.correo = correo; }

    /** Obtiene el rol del usuario (admin, seller, client). */
    public String getRol() { return rol; }
    /** Asigna el rol del usuario. */
    public void setRol(String rol) { this.rol = rol; }

    /** Indica si la cuenta del usuario está activa. */
    public boolean isActivo() { return activo; }
    /** Activa o desactiva la cuenta del usuario. */
    public void setActivo(boolean activo) { this.activo = activo; }

    /** Indica si la cuenta del usuario está suspendida. */
    public boolean isSuspendido() { return suspendido; }
    /** Suspende o reactiva la cuenta del usuario. */
    public void setSuspendido(boolean suspendido) { this.suspendido = suspendido; }

    /** Obtiene la razón de suspensión del usuario. */
    public String getMotivoSuspension() { return motivoSuspension; }
    /** Asigna la razón de suspensión del usuario. */
    public void setMotivoSuspension(String motivoSuspension) { this.motivoSuspension = motivoSuspension; }

    /** Obtiene la tasa de comisión del vendedor. */
    public Double getPorcentajeComision() { return porcentajeComision; }
    /** Asigna la tasa de comisión del vendedor. */
    public void setPorcentajeComision(Double porcentajeComision) { this.porcentajeComision = porcentajeComision; }

    /** Obtiene la fecha de registro del usuario. */
    public String getFechaRegistro() { return fechaRegistro; }
    /** Asigna la fecha de registro del usuario. */
    public void setFechaRegistro(String fechaRegistro) { this.fechaRegistro = fechaRegistro; }

    /** Obtiene la fecha del último inicio de sesión. */
    public String getUltimoAcceso() { return ultimoAcceso; }
    /** Asigna la fecha del último inicio de sesión. */
    public void setUltimoAcceso(String ultimoAcceso) { this.ultimoAcceso = ultimoAcceso; }

    /** Obtiene el estado general del usuario. */
    public String getEstado() { return estado; }
    /** Asigna el estado general del usuario. */
    public void setEstado(String estado) { this.estado = estado; }
}
