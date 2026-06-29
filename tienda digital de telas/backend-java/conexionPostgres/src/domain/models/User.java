package domain.models;

/**
 * Modelo que representa un usuario del sistema (clientes, vendedores, administradores).
 * Mapea directamente a la tabla "users" en la base de datos PostgreSQL.
 */
public class User {
    /** Identificador único del usuario (clave primaria en BD: id SERIAL PRIMARY KEY). */
    private int id;
    /** Nombre completo del usuario. */
    private String name;
    /** Correo electrónico del usuario, usado como credencial de inicio de sesión. */
    private String email;
    /** Rol del usuario en el sistema: "admin", "seller" o "client". */
    private String role;
    /** Indica si la cuenta del usuario está activa (true = activo, false = desactivado). */
    private boolean active;
    /** Indica si la cuenta del usuario está suspendida temporalmente. */
    private boolean suspended;
    /** Razón por la cual la cuenta fue suspendida (nulo si no está suspendido). */
    private String suspensionReason;
    /** Tasa de comisión del vendedor (porcentaje), aplicable solo si el rol es "seller". */
    private Double commissionRate;
    /** Fecha y hora en que el usuario se registró en la plataforma (TIMESTAMP en BD). */
    private String registeredAt;
    /** Fecha y hora del último inicio de sesión del usuario. */
    private String lastLogin;
    /** Estado general del usuario: "active", "inactive", "banned", etc. */
    private String status;

    /** Constructor vacío requerido por frameworks de serialización (Jackson, etc.). */
    public User() {}

    /**
     * Constructor completo para inicializar todas las propiedades del usuario.
     * @param id               Identificador único
     * @param name             Nombre completo
     * @param email            Correo electrónico
     * @param role             Rol asignado
     * @param active           Estado activo/inactivo
     * @param suspended        Estado de suspensión
     * @param suspensionReason Motivo de suspensión
     * @param commissionRate   Tasa de comisión
     * @param registeredAt     Fecha de registro
     * @param lastLogin        Último inicio de sesión
     * @param status           Estado general
     */
    public User(int id, String name, String email, String role, boolean active, boolean suspended,
                String suspensionReason, Double commissionRate, String registeredAt, String lastLogin, String status) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.role = role;
        this.active = active;
        this.suspended = suspended;
        this.suspensionReason = suspensionReason;
        this.commissionRate = commissionRate;
        this.registeredAt = registeredAt;
        this.lastLogin = lastLogin;
        this.status = status;
    }

    /** Obtiene el identificador único del usuario. */
    public int getId() { return id; }
    /** Asigna el identificador único del usuario. */
    public void setId(int id) { this.id = id; }

    /** Obtiene el nombre completo del usuario. */
    public String getName() { return name; }
    /** Asigna el nombre completo del usuario. */
    public void setName(String name) { this.name = name; }

    /** Obtiene el correo electrónico del usuario. */
    public String getEmail() { return email; }
    /** Asigna el correo electrónico del usuario. */
    public void setEmail(String email) { this.email = email; }

    /** Obtiene el rol del usuario (admin, seller, client). */
    public String getRole() { return role; }
    /** Asigna el rol del usuario. */
    public void setRole(String role) { this.role = role; }

    /** Indica si la cuenta del usuario está activa. */
    public boolean isActive() { return active; }
    /** Activa o desactiva la cuenta del usuario. */
    public void setActive(boolean active) { this.active = active; }

    /** Indica si la cuenta del usuario está suspendida. */
    public boolean isSuspended() { return suspended; }
    /** Suspende o reactiva la cuenta del usuario. */
    public void setSuspended(boolean suspended) { this.suspended = suspended; }

    /** Obtiene la razón de suspensión del usuario. */
    public String getSuspensionReason() { return suspensionReason; }
    /** Asigna la razón de suspensión del usuario. */
    public void setSuspensionReason(String suspensionReason) { this.suspensionReason = suspensionReason; }

    /** Obtiene la tasa de comisión del vendedor. */
    public Double getCommissionRate() { return commissionRate; }
    /** Asigna la tasa de comisión del vendedor. */
    public void setCommissionRate(Double commissionRate) { this.commissionRate = commissionRate; }

    /** Obtiene la fecha de registro del usuario. */
    public String getRegisteredAt() { return registeredAt; }
    /** Asigna la fecha de registro del usuario. */
    public void setRegisteredAt(String registeredAt) { this.registeredAt = registeredAt; }

    /** Obtiene la fecha del último inicio de sesión. */
    public String getLastLogin() { return lastLogin; }
    /** Asigna la fecha del último inicio de sesión. */
    public void setLastLogin(String lastLogin) { this.lastLogin = lastLogin; }

    /** Obtiene el estado general del usuario. */
    public String getStatus() { return status; }
    /** Asigna el estado general del usuario. */
    public void setStatus(String status) { this.status = status; }
}
