package models;

public class Coupon {
    private int id;
    private String code;
    private String discountType;
    private double discountValue;
    private String expiresAt;
    private boolean active;
    private int usageCount;
    private Rules rules;
    
    public Coupon() {
        this.rules = new Rules();
    }

    public static class Rules {
        private Double minPurchase;
        private Integer maxUses;
        private boolean firstTimeOnly;

        public Rules() {}

        public Double getMinPurchase() { return minPurchase; }
        public void setMinPurchase(Double minPurchase) { this.minPurchase = minPurchase; }

        public Integer getMaxUses() { return maxUses; }
        public void setMaxUses(Integer maxUses) { this.maxUses = maxUses; }

        public boolean isFirstTimeOnly() { return firstTimeOnly; }
        public void setFirstTimeOnly(boolean firstTimeOnly) { this.firstTimeOnly = firstTimeOnly; }
    }

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getDiscountType() { return discountType; }
    public void setDiscountType(String discountType) { this.discountType = discountType; }

    public double getDiscountValue() { return discountValue; }
    public void setDiscountValue(double discountValue) { this.discountValue = discountValue; }

    public String getExpiresAt() { return expiresAt; }
    public void setExpiresAt(String expiresAt) { this.expiresAt = expiresAt; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }

    public int getUsageCount() { return usageCount; }
    public void setUsageCount(int usageCount) { this.usageCount = usageCount; }

    public Rules getRules() { return rules; }
    public void setRules(Rules rules) { this.rules = rules; }
}
