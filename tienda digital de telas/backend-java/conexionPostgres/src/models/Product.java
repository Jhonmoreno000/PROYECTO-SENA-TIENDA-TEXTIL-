package models;

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

    // Getters
    public String getId() { return id; }
    public String getName() { return name; }
    public String getCategory() { return category; }
    public double getPrice() { return price; }
    public int getSellerId() { return sellerId; }
    public String getDescription() { return description; }
    public String getMaterial() { return material; }
    public String getWidth() { return width; }
    public String getWeight() { return weight; }
    public String getCare() { return care; }
    public int getStock() { return stock; }
    public boolean isFeatured() { return featured; }
    public List<String> getImages() { return images; }

    // Setters
    public void setId(String id) { this.id = id; }
    public void setName(String name) { this.name = name; }
    public void setCategory(String category) { this.category = category; }
    public void setPrice(double price) { this.price = price; }
    public void setSellerId(int sellerId) { this.sellerId = sellerId; }
    public void setDescription(String description) { this.description = description; }
    public void setMaterial(String material) { this.material = material; }
    public void setWidth(String width) { this.width = width; }
    public void setWeight(String weight) { this.weight = weight; }
    public void setCare(String care) { this.care = care; }
    public void setStock(int stock) { this.stock = stock; }
    public void setFeatured(boolean featured) { this.featured = featured; }
    public void setImages(List<String> images) { this.images = images; }
    public void addImage(String url) { this.images.add(url); }
}
