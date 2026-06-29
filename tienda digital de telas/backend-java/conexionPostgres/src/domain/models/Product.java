package domain.models;

import java.util.ArrayList;
import java.util.List;

/**
 * Modelo que representa un producto (tela) disponible en el catálogo de D&D Textil.
 * Mapea a la tabla "products" en la base de datos PostgreSQL.
 */
public class Product {
    /** Identificador único del producto (UUID o código interno). */
    private String id;
    /** Nombre comercial del producto/tela. */
    private String name;
    /** Categoría del producto (ej: "Algodón", "Poliéster", "Mezcla"). */
    private String category;
    /** Precio de venta por unidad/metro del producto. */
    private double price;
    /** ID del vendedor que ofrece este producto (clave foránea a users). */
    private int sellerId;
    /** Descripción detallada del producto, incluyendo usos recomendados. */
    private String description;
    /** Material o composición textil del producto. */
    private String material;
    /** Ancho de la tela en metros (ej: "1.50m"). */
    private String width;
    /** Peso del producto en gramos por metro cuadrado (gr/m²). */
    private String weight;
    /** Instrucciones de cuidado y lavado del producto. */
    private String care;
    /** Cantidad disponible en inventario (stock actual). */
    private int stock;
    /** Indica si el producto debe aparecer destacado en la página principal. */
    private boolean featured;
    /** Lista de URLs de imágenes del producto. */
    private List<String> images;

    /**
     * Constructor vacío. Inicializa la lista de imágenes vacía para evitar NullPointerException.
     */
    public Product() {
        this.images = new ArrayList<>();
    }

    /** Obtiene el identificador único del producto. */
    public String getId() { return id; }
    /** Asigna el identificador único del producto. */
    public void setId(String id) { this.id = id; }
    /** Obtiene el nombre del producto. */
    public String getName() { return name; }
    /** Asigna el nombre del producto. */
    public void setName(String name) { this.name = name; }
    /** Obtiene la categoría del producto. */
    public String getCategory() { return category; }
    /** Asigna la categoría del producto. */
    public void setCategory(String category) { this.category = category; }
    /** Obtiene el precio del producto. */
    public double getPrice() { return price; }
    /** Asigna el precio del producto. */
    public void setPrice(double price) { this.price = price; }
    /** Obtiene el ID del vendedor asociado. */
    public int getSellerId() { return sellerId; }
    /** Asigna el ID del vendedor asociado. */
    public void setSellerId(int sellerId) { this.sellerId = sellerId; }
    /** Obtiene la descripción del producto. */
    public String getDescription() { return description; }
    /** Asigna la descripción del producto. */
    public void setDescription(String description) { this.description = description; }
    /** Obtiene el material del producto. */
    public String getMaterial() { return material; }
    /** Asigna el material del producto. */
    public void setMaterial(String material) { this.material = material; }
    /** Obtiene el ancho de la tela. */
    public String getWidth() { return width; }
    /** Asigna el ancho de la tela. */
    public void setWidth(String width) { this.width = width; }
    /** Obtiene el peso de la tela. */
    public String getWeight() { return weight; }
    /** Asigna el peso de la tela. */
    public void setWeight(String weight) { this.weight = weight; }
    /** Obtiene las instrucciones de cuidado. */
    public String getCare() { return care; }
    /** Asigna las instrucciones de cuidado. */
    public void setCare(String care) { this.care = care; }
    /** Obtiene la cantidad en stock. */
    public int getStock() { return stock; }
    /** Asigna la cantidad en stock. */
    public void setStock(int stock) { this.stock = stock; }
    /** Indica si el producto está destacado (featured). */
    public boolean isFeatured() { return featured; }
    /** Marca o desmarca el producto como destacado. */
    public void setFeatured(boolean featured) { this.featured = featured; }
    /** Obtiene la lista de URLs de imágenes del producto. */
    public List<String> getImages() { return images; }
    /** Asigna la lista de URLs de imágenes del producto. */
    public void setImages(List<String> images) { this.images = images; }
    /** Agrega una URL de imagen a la lista de imágenes del producto. */
    public void addImage(String url) { this.images.add(url); }
}
