package domain.models;

public class User {
    private int id;
    private String name;
    private String email;
    private String role;
    private boolean active;
    private boolean suspended;
    private String suspensionReason;
    private Double commissionRate;
    private String registeredAt;
    private String lastLogin;
    private String status;

    public User() {}

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

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
    public boolean isSuspended() { return suspended; }
    public void setSuspended(boolean suspended) { this.suspended = suspended; }
    public String getSuspensionReason() { return suspensionReason; }
    public void setSuspensionReason(String suspensionReason) { this.suspensionReason = suspensionReason; }
    public Double getCommissionRate() { return commissionRate; }
    public void setCommissionRate(Double commissionRate) { this.commissionRate = commissionRate; }
    public String getRegisteredAt() { return registeredAt; }
    public void setRegisteredAt(String registeredAt) { this.registeredAt = registeredAt; }
    public String getLastLogin() { return lastLogin; }
    public void setLastLogin(String lastLogin) { this.lastLogin = lastLogin; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
