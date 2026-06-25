package domain.models;

public class WasteEvent {
    private int id;
    private String batchId;
    private double meters;
    private String reason;
    private String description;
    private String responsible;
    private String eventDate;
    private String createdAt;
    private int userId;

    public WasteEvent() {}

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }
    public String getBatchId() { return batchId; }
    public void setBatchId(String batchId) { this.batchId = batchId; }
    public double getMeters() { return meters; }
    public void setMeters(double meters) { this.meters = meters; }
    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getResponsible() { return responsible; }
    public void setResponsible(String responsible) { this.responsible = responsible; }
    public String getEventDate() { return eventDate; }
    public void setEventDate(String eventDate) { this.eventDate = eventDate; }
    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
    public int getUserId() { return userId; }
    public void setUserId(int userId) { this.userId = userId; }
}
