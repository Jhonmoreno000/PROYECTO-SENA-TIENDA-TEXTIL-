package domain.models;

/**
 * Modelo que representa un artículo en el carrito de compras de un usuario.
 * Mapea a la tabla "cart_items" en la base de datos PostgreSQL.
 * Incluye campos adicionales para datos del producto obtenidos mediante JOIN.
 */
public class CartItem {
    /** Identificador único del registro en el carrito (clave primaria autoincremental). */
    private int id;
    /** ID del usuario propietario del carrito (clave foránea a users). */
    private int userId;
    /** ID del producto agregado al carrito (clave foránea a products). */
    private int productId;
    /** Cantidad de unidades del producto que el usuario desea comprar. */
    private int quantity;
    /** Fecha y hora en que se agregó el producto al carrito. */
    private String addedAt;
    /** Fecha y hora de la última modificación del artículo en el carrito. */
    private String updatedAt;

    // campos extra para datos combinados (JOIN con la tabla products)
    /** Nombre del producto, obtenido mediante JOIN con la tabla products. */
    private String productName;
    /** Precio del producto, obtenido mediante JOIN con la tabla products. */
    private double productPrice;
    /** URL de la imagen del producto, obtenida mediante JOIN con la tabla products. */
    private String productImage;

    /** Constructor vacío requerido por frameworks de serialización. */
    public CartItem() {}

    /** Obtiene el identificador único del artículo en el carrito. */
    public int getId() { return id; }
    /** Asigna el identificador único del artículo en el carrito. */
    public void setId(int id) { this.id = id; }
    /** Obtiene el ID del usuario propietario del carrito. */
    public int getUserId() { return userId; }
    /** Asigna el ID del usuario propietario del carrito. */
    public void setUserId(int userId) { this.userId = userId; }
    /** Obtiene el ID del producto en el carrito. */
    public int getProductId() { return productId; }
    /** Asigna el ID del producto en el carrito. */
    public void setProductId(int productId) { this.productId = productId; }
    /** Obtiene la cantidad del producto en el carrito. */
    public int getQuantity() { return quantity; }
    /** Asigna la cantidad del producto en el carrito. */
    public void setQuantity(int quantity) { this.quantity = quantity; }
    /** Obtiene la fecha de agregado al carrito. */
    public String getAddedAt() { return addedAt; }
    /** Asigna la fecha de agregado al carrito. */
    public void setAddedAt(String addedAt) { this.addedAt = addedAt; }
    /** Obtiene la fecha de última modificación. */
    public String getUpdatedAt() { return updatedAt; }
    /** Asigna la fecha de última modificación. */
    public void setUpdatedAt(String updatedAt) { this.updatedAt = updatedAt; }
    /** Obtiene el nombre del producto (desde JOIN). */
    public String getProductName() { return productName; }
    /** Asigna el nombre del producto (para datos combinados). */
    public void setProductName(String productName) { this.productName = productName; }
    /** Obtiene el precio del producto (desde JOIN). */
    public double getProductPrice() { return productPrice; }
    /** Asigna el precio del producto (para datos combinados). */
    public void setProductPrice(double productPrice) { this.productPrice = productPrice; }
    /** Obtiene la URL de la imagen del producto (desde JOIN). */
    public String getProductImage() { return productImage; }
    /** Asigna la URL de la imagen del producto (para datos combinados). */
    public void setProductImage(String productImage) { this.productImage = productImage; }
}
