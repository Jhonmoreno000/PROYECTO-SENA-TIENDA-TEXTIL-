package domain.models;

public class RecentActivity {
    private int id;
    private String type;
    private int userId;
    private String userName;
    private String action;
    private Double amount;
    private String createdAt;
    private String icon;

    public RecentActivity() {}

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public int getUserId() { return userId; }
    public void setUserId(int userId) { this.userId = userId; }
    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }
    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }
    public Double getAmount() { return amount; }
    public void setAmount(Double amount) { this.amount = amount; }
    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
    public String getIcon() { return icon; }
    public void setIcon(String icon) { this.icon = icon; }
}
