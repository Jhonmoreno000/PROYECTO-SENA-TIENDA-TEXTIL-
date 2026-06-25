package domain.models;

public class GlobalBanner {
    private int id;
    private boolean enabled;
    private String message;
    private String bannerType;
    private String updatedAt;

    public GlobalBanner() {}

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }
    public boolean isEnabled() { return enabled; }
    public void setEnabled(boolean enabled) { this.enabled = enabled; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public String getBannerType() { return bannerType; }
    public void setBannerType(String bannerType) { this.bannerType = bannerType; }
    public String getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(String updatedAt) { this.updatedAt = updatedAt; }
}
