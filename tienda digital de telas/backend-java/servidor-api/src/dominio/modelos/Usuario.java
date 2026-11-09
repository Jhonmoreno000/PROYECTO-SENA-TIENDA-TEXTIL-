package dominio.modelos;

import com.google.gson.annotations.SerializedName;

/**
 * Modelo de dominio que representa un usuario del sistema (`administrador`, `vendedor` o `cliente`).
 * Mapea a la tabla `usuarios` en PostgreSQL.
 */
public class Usuario {

    /** Identificador único del usuario (`int`). */
    @SerializedName(value = "id", alternate = {"idUsuario"})
    private int id;

    /** Nombre completo del usuario (`String`). */
    @SerializedName(value = "name", alternate = {"nombre"})
    private String nombre;

    /** Correo electrónico único usado como credencial de acceso (`String`). */
    @SerializedName(value = "email", alternate = {"correo"})
    private String correo;

    /** Teléfono de contacto del usuario (`String`). */
    @SerializedName(value = "phone", alternate = {"telefono"})
    private String telefono;

    /** Rol asignado en la plataforma (`String`: `"administrador"`, `"vendedor"` o `"cliente"`). */
    @SerializedName(value = "role", alternate = {"rol"})
    private String rol;

    /** Indica si la cuenta se encuentra activa (`boolean`). */
    @SerializedName(value = "active", alternate = {"activo"})
    private boolean activo;

    /** Indica si la cuenta se encuentra suspendida temporalmente (`boolean`). */
    @SerializedName(value = "suspended", alternate = {"suspendido"})
    private boolean suspendido;

    /** Motivo administrativo de la suspensión, si aplica (`String`). */
    @SerializedName(value = "suspensionReason", alternate = {"motivoSuspension"})
    private String motivoSuspension;

    /** Porcentaje de comisión asignado cuando el usuario tiene rol `vendedor` (`Double`). */
    @SerializedName(value = "commissionRate", alternate = {"porcentajeComision", "tasaComision"})
    private Double porcentajeComision;

    /** Fecha y hora de registro en el sistema (`String`). */
    @SerializedName(value = "registeredAt", alternate = {"fechaRegistro", "registradoEn"})
    private String fechaRegistro;

    /** Fecha y hora del último inicio de sesión exitoso (`String`). */
    @SerializedName(value = "lastLogin", alternate = {"ultimoAcceso"})
    private String ultimoAcceso;

    /** Estado general calculado de la cuenta (`String`: `"active"`, `"inactive"`, `"suspended"`). */
    @SerializedName(value = "status", alternate = {"estado"})
    private String estado;

    /**
     * Constructor vacío requerido para serialización JSON y mapeo JDBC.
     */
    public Usuario() {}

    /**
     * Construye un usuario inicializando sus propiedades principales.
     *
     * @param id Identificador único (`int`).
     * @param nombre Nombre completo (`String`).
     * @param correo Correo electrónico (`String`).
     * @param rol Rol del usuario (`String`).
     * @param activo Indicador de cuenta activa (`boolean`).
     * @param suspendido Indicador de cuenta suspendida (`boolean`).
     * @param motivoSuspension Razón de suspensión (`String`).
     * @param porcentajeComision Tasa de comisión de vendedor (`Double`).
     * @param fechaRegistro Marca de tiempo de registro (`String`).
     * @param ultimoAcceso Marca de tiempo de último ingreso (`String`).
     * @param estado Estado general legible (`String`).
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

    /**
     * Obtiene el identificador único del usuario.
     *
     * @return Identificador numérico (`int`).
     */
    public int getId() { return id; }

    /**
     * Establece el identificador único del usuario.
     *
     * @param id Identificador numérico (`int`).
     */
    public void setId(int id) { this.id = id; }

    /**
     * Obtiene el nombre completo del usuario.
     *
     * @return Nombre (`String`).
     */
    public String getNombre() { return nombre; }

    /**
     * Establece el nombre completo del usuario.
     *
     * @param nombre Nombre (`String`).
     */
    public void setNombre(String nombre) { this.nombre = nombre; }

    /**
     * Obtiene el correo electrónico del usuario.
     *
     * @return Correo electrónico (`String`).
     */
    public String getCorreo() { return correo; }

    /**
     * Establece el correo electrónico del usuario.
     *
     * @param correo Correo electrónico (`String`).
     */
    public void setCorreo(String correo) { this.correo = correo; }

    /**
     * Obtiene el teléfono de contacto del usuario.
     *
     * @return Teléfono (`String`).
     */
    public String getTelefono() { return telefono; }

    /**
     * Establece el teléfono de contacto del usuario.
     *
     * @param telefono Teléfono (`String`).
     */
    public void setTelefono(String telefono) { this.telefono = telefono; }

    /**
     * Obtiene el rol del usuario.
     *
     * @return Rol (`String`).
     */
    public String getRol() { return rol; }

    /**
     * Establece el rol del usuario.
     *
     * @param rol Rol (`String`).
     */
    public void setRol(String rol) { this.rol = rol; }

    /**
     * Indica si la cuenta está activa.
     *
     * @return `true` si está activa; `false` en caso contrario.
     */
    public boolean isActivo() { return activo; }

    /**
     * Establece si la cuenta está activa.
     *
     * @param activo Estado activo (`boolean`).
     */
    public void setActivo(boolean activo) { this.activo = activo; }

    /**
     * Indica si la cuenta está suspendida.
     *
     * @return `true` si está suspendida; `false` en caso contrario.
     */
    public boolean isSuspendido() { return suspendido; }

    /**
     * Establece si la cuenta está suspendida.
     *
     * @param suspendido Estado de suspensión (`boolean`).
     */
    public void setSuspendido(boolean suspendido) { this.suspendido = suspendido; }

    /**
     * Obtiene el motivo de suspensión de la cuenta.
     *
     * @return Motivo de suspensión (`String`).
     */
    public String getMotivoSuspension() { return motivoSuspension; }

    /**
     * Establece el motivo de suspensión de la cuenta.
     *
     * @param motivoSuspension Motivo de suspensión (`String`).
     */
    public void setMotivoSuspension(String motivoSuspension) { this.motivoSuspension = motivoSuspension; }

    /**
     * Obtiene la tasa de comisión asignada al vendedor.
     *
     * @return Porcentaje de comisión (`Double`) o `null`.
     */
    public Double getPorcentajeComision() { return porcentajeComision; }

    /**
     * Establece la tasa de comisión asignada al vendedor.
     *
     * @param porcentajeComision Porcentaje de comisión (`Double`).
     */
    public void setPorcentajeComision(Double porcentajeComision) { this.porcentajeComision = porcentajeComision; }

    /**
     * Obtiene la fecha de registro del usuario.
     *
     * @return Fecha de registro (`String`).
     */
    public String getFechaRegistro() { return fechaRegistro; }

    /**
     * Establece la fecha de registro del usuario.
     *
     * @param fechaRegistro Fecha de registro (`String`).
     */
    public void setFechaRegistro(String fechaRegistro) { this.fechaRegistro = fechaRegistro; }

    /**
     * Obtiene la fecha del último inicio de sesión.
     *
     * @return Último acceso (`String`).
     */
    public String getUltimoAcceso() { return ultimoAcceso; }

    /**
     * Establece la fecha del último inicio de sesión.
     *
     * @param ultimoAcceso Último acceso (`String`).
     */
    public void setUltimoAcceso(String ultimoAcceso) { this.ultimoAcceso = ultimoAcceso; }

    /**
     * Obtiene el estado general de la cuenta.
     *
     * @return Estado (`String`).
     */
    public String getEstado() { return estado; }

    /**
     * Establece el estado general de la cuenta.
     *
     * @param estado Estado (`String`).
     */
    public void setEstado(String estado) { this.estado = estado; }
}
