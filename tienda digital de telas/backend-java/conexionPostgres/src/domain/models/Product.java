package domain.models;

import java.util.ArrayList;
import java.util.List;

public class Product {
    private String id;
    private String name;
    private String category;
    private double price;
    private int sellerId;
    private String description;
    private String material;
    private String width;
    private String weight;
    private String care;
    private int stock;
    private boolean featured;
    private List<String> images;

    public Product() {
        this.images = new ArrayList<>();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public double getPrice() { return price; }
    public void setPrice(double price) { this.price = price; }
    public int getSellerId() { return sellerId; }
    public void setSellerId(int sellerId) { this.sellerId = sellerId; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getMaterial() { return material; }
    public void setMaterial(String material) { this.material = material; }
    public String getWidth() { return width; }
    public void setWidth(String width) { this.width = width; }
    public String getWeight() { return weight; }
    public void setWeight(String weight) { this.weight = weight; }
    public String getCare() { return care; }
    public void setCare(String care) { this.care = care; }
    public int getStock() { return stock; }
    public void setStock(int stock) { this.stock = stock; }
    public boolean isFeatured() { return featured; }
    public void setFeatured(boolean featured) { this.featured = featured; }
    public List<String> getImages() { return images; }
    public void setImages(List<String> images) { this.images = images; }
    public void addImage(String url) { this.images.add(url); }
}
