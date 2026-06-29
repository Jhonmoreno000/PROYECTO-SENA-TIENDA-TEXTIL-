package infrastructure.persistence.jdbc;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import java.io.File;
import java.io.FileOutputStream;
import java.util.Base64;

import infrastructure.config.Conexion;
import domain.models.Product;

/**
 * DAO (Data Access Object) para la entidad Producto.
 * Gestiona todas las operaciones CRUD sobre la tabla 'products' y su tabla
 * relacionada 'product_images'. Esta clase pertenece a la capa de
 * infraestructura/persistencia en la arquitectura Clean Architecture del
 * backend de D&D Textil.
 */
public class ProductDAO {

    /**
     * Recupera todos los productos activos del catalogo, incluyendo el nombre
     * de su categoria mediante un LEFT JOIN.
     * @return Lista de objetos Product con todos sus datos e imagenes asociadas.
     */
    public List<Product> getAllProducts() {
        List<Product> products = new ArrayList<>();
        Connection conn = Conexion.getConnection();

        // LEFT JOIN para obtener el nombre de la categoria desde la tabla categories
        String query = "SELECT p.*, c.name as category_name " +
                "FROM products p " +
                "LEFT JOIN categories c ON p.category_id = c.id " +
                "WHERE p.active = true";

        try (PreparedStatement stmt = conn.prepareStatement(query);
                ResultSet rs = stmt.executeQuery()) {

            while (rs.next()) {
                Product product = new Product();
                int productId = rs.getInt("id");

                product.setId(String.valueOf(productId));
                product.setName(rs.getString("name"));
                product.setCategory(rs.getString("category_name"));
                product.setPrice(rs.getDouble("price"));
                product.setSellerId(rs.getInt("seller_id"));
                product.setDescription(rs.getString("description"));
                product.setMaterial(rs.getString("material"));
                product.setWidth(rs.getString("width"));
                product.setWeight(rs.getString("weight"));
                product.setCare(rs.getString("care"));
                product.setStock(rs.getInt("stock"));
                product.setFeatured(rs.getBoolean("featured"));
                product.setImages(getProductImages(conn, productId));

                products.add(product);
            }
        } catch (SQLException e) {
            // Error: Fallo la consulta de productos activos (problema de BD o conexion)
            e.printStackTrace();
        }
        return products;
    }

    /**
     * Recupera los productos activos de un vendedor especifico.
     * @param sellerId Identificador unico del vendedor.
     * @return Lista de productos pertenecientes a ese vendedor que esten activos.
     */
    public List<Product> getProductsBySeller(int sellerId) {
        List<Product> products = new ArrayList<>();
        Connection conn = Conexion.getConnection();

        // Incluye filtro active=true para que productos eliminados no reaparezcan en la vista del vendedor
        String query = "SELECT p.*, c.name as category_name " +
                "FROM products p " +
                "LEFT JOIN categories c ON p.category_id = c.id " +
                "WHERE p.seller_id = ? AND p.active = true";

        try (PreparedStatement stmt = conn.prepareStatement(query)) {
            stmt.setInt(1, sellerId);
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    Product product = new Product();
                    int productId = rs.getInt("id");

                    product.setId(String.valueOf(productId));
                    product.setName(rs.getString("name"));
                    product.setCategory(rs.getString("category_name"));
                    product.setPrice(rs.getDouble("price"));
                    product.setSellerId(rs.getInt("seller_id"));
                    product.setDescription(rs.getString("description"));
                    product.setMaterial(rs.getString("material"));
                    product.setWidth(rs.getString("width"));
                    product.setWeight(rs.getString("weight"));
                    product.setCare(rs.getString("care"));
                    product.setStock(rs.getInt("stock"));
                    product.setFeatured(rs.getBoolean("featured"));
                    product.setImages(getProductImages(conn, productId));

                    products.add(product);
                }
            }
        } catch (SQLException e) {
            // Error: Fallo la consulta de productos por vendedor
            e.printStackTrace();
        }
        return products;
    }

    /**
     * Obtiene las URLs de las imagenes asociadas a un producto, ordenadas
     * por su posicion de visualizacion.
     * @param conn     Conexion activa a la base de datos.
     * @param productId Identificador del producto.
     * @return Lista de strings con las URLs de las imagenes.
     */
    private List<String> getProductImages(Connection conn, int productId) {
        List<String> images = new ArrayList<>();
        // Consulta las imagenes ordenadas por display_order para mantener el orden definido
        String query = "SELECT image_url FROM product_images WHERE product_id = ? ORDER BY display_order ASC";

        try (PreparedStatement stmt = conn.prepareStatement(query)) {
            stmt.setInt(1, productId);
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    images.add(rs.getString("image_url"));
                }
            }
        } catch (SQLException e) {
            // Error: No se pudieron recuperar las imagenes del producto
            e.printStackTrace();
        }
        return images;
    }

    /**
     * Recibe una cadena Base64 de una imagen, la guarda en la carpeta uploads/
     * y luego inserta/reemplaza la URL de la imagen en la tabla product_images.
     * @param productId  Identificador del producto al que asociar la imagen.
     * @param base64Data Cadena con la imagen en formato Base64 (puede incluir prefijo data URI).
     * @return La URL publica de la imagen guardada, o null si falla.
     */
    public String saveProductImage(int productId, String base64Data) {
        try {
            // Elimina el prefijo data URI: data:image/png;base64,xxxx
            String base64 = base64Data;
            String ext = "png";
            if (base64Data.contains(",")) {
                String header = base64Data.substring(0, base64Data.indexOf(','));
                base64 = base64Data.substring(base64Data.indexOf(',') + 1);
                // Detecta la extension a partir del tipo MIME
                if (header.contains("jpeg") || header.contains("jpg"))
                    ext = "jpg";
                else if (header.contains("webp"))
                    ext = "webp";
                else if (header.contains("gif"))
                    ext = "gif";
            }

            // Asegura que el directorio de subida exista
            File uploadsDir = new File("uploads");
            if (!uploadsDir.exists())
                uploadsDir.mkdir();

            // Guarda los bytes decodificados en un archivo
            String fileName = "product_" + productId + "_" + System.currentTimeMillis() + "." + ext;
            File imageFile = new File(uploadsDir, fileName);
            byte[] imageBytes = Base64.getDecoder().decode(base64);
            try (FileOutputStream fos = new FileOutputStream(imageFile)) {
                fos.write(imageBytes);
            }

            String imageUrl = "http://localhost:8081/uploads/" + fileName;

            // Elimina las imagenes viejas de este producto
            Connection conn = Conexion.getConnection();
            String deleteQuery = "DELETE FROM product_images WHERE product_id = ?";
            try (PreparedStatement delStmt = conn.prepareStatement(deleteQuery)) {
                delStmt.setInt(1, productId);
                delStmt.executeUpdate();
            }

            // Inserta la nueva URL de la imagen
            String insertQuery = "INSERT INTO product_images (product_id, image_url, display_order) VALUES (?, ?, 0)";
            try (PreparedStatement insStmt = conn.prepareStatement(insertQuery)) {
                insStmt.setInt(1, productId);
                insStmt.setString(2, imageUrl);
                insStmt.executeUpdate();
            }

            return imageUrl;
        } catch (Exception e) {
            // Error: Fallo al guardar la imagen (Base64 invalido, permisos de archivo, BD caida)
            e.printStackTrace();
            return null;
        }
    }

    /**
     * Actualiza el precio y el stock de un producto en la base de datos.
     * @param productId Identificador del producto a actualizar.
     * @param price     Nuevo precio del producto.
     * @param stock     Nueva cantidad en stock.
     * @return true si la actualizacion fue exitosa, false en caso de error.
     */
    public boolean updateProduct(int productId, double price, int stock) {
        Connection conn = Conexion.getConnection();
        // Actualiza precio y stock, y registra la fecha/hora de la modificacion
        String query = "UPDATE products SET price = ?, stock = ?, updated_at = NOW() WHERE id = ?";
        try (PreparedStatement stmt = conn.prepareStatement(query)) {
            stmt.setDouble(1, price);
            stmt.setInt(2, stock);
            stmt.setInt(3, productId);
            stmt.executeUpdate();
            return true;
        } catch (SQLException e) {
            // Error: No se pudo actualizar el producto (problema de BD)
            e.printStackTrace();
            return false;
        }
    }

    /**
     * Recupera los productos pendientes de moderacion (moderation_status = 'pending').
     * @return Lista de productos que aun no han sido moderados.
     */
    public List<Product> getPendingProducts() {
        List<Product> products = new ArrayList<>();
        Connection conn = Conexion.getConnection();

        // LEFT JOIN para incluir el nombre de categoria, filtrando solo pendientes de moderacion
        String query = "SELECT p.*, c.name as category_name " +
                "FROM products p " +
                "LEFT JOIN categories c ON p.category_id = c.id " +
                "WHERE p.moderation_status = 'pending'";

        try (PreparedStatement stmt = conn.prepareStatement(query);
                ResultSet rs = stmt.executeQuery()) {

            while (rs.next()) {
                Product product = new Product();
                int productId = rs.getInt("id");

                product.setId(String.valueOf(productId));
                product.setName(rs.getString("name"));
                product.setCategory(rs.getString("category_name"));
                product.setPrice(rs.getDouble("price"));
                product.setSellerId(rs.getInt("seller_id"));
                product.setDescription(rs.getString("description"));
                product.setMaterial(rs.getString("material"));
                product.setWidth(rs.getString("width"));
                product.setWeight(rs.getString("weight"));
                product.setCare(rs.getString("care"));
                product.setStock(rs.getInt("stock"));
                product.setFeatured(rs.getBoolean("featured"));

                product.setImages(getProductImages(conn, productId));
                products.add(product);
            }
        } catch (SQLException e) {
            // Error: Fallo la consulta de productos pendientes de moderacion
            e.printStackTrace();
        }
        return products;
    }

    /**
     * Actualiza el estado de moderacion de un producto (approved / rejected).
     * Si se aprueba, el producto se marca como activo; si se rechaza, permanece inactivo.
     * @param productId Identificador del producto.
     * @param status    Nuevo estado de moderacion ('approved' o 'rejected').
     * @param reason    Razon del rechazo (puede ser null o vacio si se aprueba).
     * @return true si la actualizacion fue exitosa, false en caso de error.
     */
    public boolean updateModerationStatus(int productId, String status, String reason) {
        Connection conn = Conexion.getConnection();
        // Si se aprueba, active debe ser true. Si se rechaza, permanece false.
        boolean active = status.equals("approved");
        String query = "UPDATE products SET moderation_status = ?, rejection_reason = ?, active = ?, updated_at = NOW() WHERE id = ?";
        try (PreparedStatement stmt = conn.prepareStatement(query)) {
            stmt.setString(1, status);
            stmt.setString(2, reason);
            stmt.setBoolean(3, active);
            stmt.setInt(4, productId);
            stmt.executeUpdate();
            return true;
        } catch (SQLException e) {
            // Error: No se pudo actualizar el estado de moderacion
            e.printStackTrace();
            return false;
        }
    }

    /**
     * Agrega un nuevo producto a la base de datos.
     * Los productos se insertan como activos para que los vendedores puedan verlos
     * inmediatamente. La moderacion se registra en moderation_status pero no bloquea
     * la visibilidad inicial.
     * @param product Objeto Product con los datos a insertar.
     * @return true si la insercion fue exitosa, false en caso de error.
     */
    public boolean addProduct(Product product) {
        // Los productos se insertan como active=true para que los vendedores vean sus productos de inmediato.
        // La moderacion se rastrea via moderation_status pero no bloquea la visibilidad.
        String query = "INSERT INTO products (name, category_id, price, seller_id, description, material, width, weight, care, stock, featured, active, moderation_status) " +
                       "VALUES (?, (SELECT id FROM categories WHERE name = ? LIMIT 1), ?, ?, ?, ?, ?, ?, ?, ?, ?, true, 'pending')";
        try (Connection conn = Conexion.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {
            stmt.setString(1, product.getName());
            stmt.setString(2, product.getCategory());
            stmt.setDouble(3, product.getPrice());
            stmt.setInt(4, product.getSellerId());
            stmt.setString(5, product.getDescription());
            stmt.setString(6, product.getMaterial());
            stmt.setString(7, product.getWidth());
            stmt.setString(8, product.getWeight());
            stmt.setString(9, product.getCare());
            stmt.setInt(10, product.getStock());
            stmt.setBoolean(11, product.isFeatured());
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            // Error: No se pudo insertar el producto (problema de BD, categoria inexistente)
            e.printStackTrace();
            return false;
        }
    }

    /**
     * Actualiza campos especificos de un producto usando COALESCE para solo
     * sobrescribir los campos que realmente se proporcionan. Si el frontend
     * solo envia {price, stock}, el nombre/descripcion/etc. se conservan.
     * @param id      Identificador del producto a actualizar.
     * @param updates Objeto Product con los campos a actualizar (los null no se modifican).
     * @return true si la actualizacion fue exitosa, false en caso de error.
     */
    public boolean updateProduct(int id, Product updates) {
        // Usa COALESCE para solo sobrescribir campos que realmente se proporcionan.
        // Si el frontend solo envia {price, stock}, name/description/etc se conservan.
        String query = "UPDATE products SET " +
                "name = COALESCE(?, name), " +
                "price = COALESCE(NULLIF(?, 0), price), " +
                "description = COALESCE(?, description), " +
                "material = COALESCE(?, material), " +
                "width = COALESCE(?, width), " +
                "weight = COALESCE(?, weight), " +
                "care = COALESCE(?, care), " +
                "stock = COALESCE(NULLIF(?, -1), stock), " +
                "featured = COALESCE(?, featured), " +
                "updated_at = NOW() " +
                "WHERE id = ?";
        try (Connection conn = Conexion.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {
            // Asigna parametros nulos - null significa "no cambiar este campo"
            stmt.setString(1, updates.getName());
            // Precio: usa 0 como valor centinela para "no proporcionado" (el precio no puede ser 0 realmente)
            stmt.setDouble(2, updates.getPrice());
            stmt.setString(3, updates.getDescription());
            stmt.setString(4, updates.getMaterial());
            stmt.setString(5, updates.getWidth());
            stmt.setString(6, updates.getWeight());
            stmt.setString(7, updates.getCare());
            // Stock: usa -1 como valor centinela para "no proporcionado"
            stmt.setInt(8, updates.getStock() > 0 ? updates.getStock() : -1);
            // Featured: no se puede distinguir false de null con boolean, se usa tipo Object
            stmt.setObject(9, updates.isFeatured());
            stmt.setInt(10, id);
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            // Error: No se pudo actualizar el producto (problema de BD)
            e.printStackTrace();
            return false;
        }
    }

    /**
     * Elimina (soft-delete) un producto marcandolo como inactivo.
     * @param id Identificador del producto a eliminar.
     * @return true si se marco como inactivo, false en caso de error.
     */
    public boolean deleteProduct(int id) {
        // Soft-delete: marca el producto como inactivo en lugar de borrar el registro
        String query = "UPDATE products SET active = false WHERE id = ?";
        try (Connection conn = Conexion.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {
            stmt.setInt(1, id);
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            // Error: No se pudo eliminar (desactivar) el producto
            e.printStackTrace();
            return false;
        }
    }
}
