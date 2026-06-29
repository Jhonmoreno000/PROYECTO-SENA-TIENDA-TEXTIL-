package domain.models;

/**
 * Modelo que representa una actividad reciente en el sistema para el panel de resumen.
 * Mapea a la tabla "recent_activities" en la base de datos PostgreSQL.
 * Se usa para mostrar un feed de acciones recientes (ventas, registros, etc.).
 */
public class RecentActivity {
    /** Identificador único de la actividad (clave primaria autoincremental). */
    private int id;
    /** Tipo de actividad: "sale", "registration", "order", "ticket", etc. */
    private String type;
    /** ID del usuario que realizó la actividad (clave foránea a users). */
    private int userId;
    /** Nombre del usuario que realizó la actividad, para mostrar en la interfaz. */
    private String userName;
    /** Descripción breve de la acción realizada (ej: "Realizó una venta por $50.000"). */
    private String action;
    /** Monto asociado a la actividad (puede ser nulo si la actividad no involucra dinero). */
    private Double amount;
    /** Fecha y hora en que ocurrió la actividad. */
    private String createdAt;
    /** Clase o nombre del ícono para mostrar visualmente el tipo de actividad en la UI. */
    private String icon;

    /** Constructor vacío requerido por frameworks de serialización. */
    public RecentActivity() {}

    /** Obtiene el identificador único de la actividad. */
    public int getId() { return id; }
    /** Asigna el identificador único de la actividad. */
    public void setId(int id) { this.id = id; }
    /** Obtiene el tipo de actividad. */
    public String getType() { return type; }
    /** Asigna el tipo de actividad. */
    public void setType(String type) { this.type = type; }
    /** Obtiene el ID del usuario asociado. */
    public int getUserId() { return userId; }
    /** Asigna el ID del usuario asociado. */
    public void setUserId(int userId) { this.userId = userId; }
    /** Obtiene el nombre del usuario asociado. */
    public String getUserName() { return userName; }
    /** Asigna el nombre del usuario asociado. */
    public void setUserName(String userName) { this.userName = userName; }
    /** Obtiene la descripción de la acción realizada. */
    public String getAction() { return action; }
    /** Asigna la descripción de la acción realizada. */
    public void setAction(String action) { this.action = action; }
    /** Obtiene el monto asociado a la actividad. */
    public Double getAmount() { return amount; }
    /** Asigna el monto asociado a la actividad. */
    public void setAmount(Double amount) { this.amount = amount; }
    /** Obtiene la fecha de creación de la actividad. */
    public String getCreatedAt() { return createdAt; }
    /** Asigna la fecha de creación de la actividad. */
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
    /** Obtiene el ícono representativo de la actividad. */
    public String getIcon() { return icon; }
    /** Asigna el ícono representativo de la actividad. */
    public void setIcon(String icon) { this.icon = icon; }
}
