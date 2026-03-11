package dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import java.io.File;
import java.io.FileOutputStream;
import java.util.Base64;

import conexion.Conexion;
import models.Product;

public class ProductDAO {

    public List<Product> getAllProducts() {
        List<Product> products = new ArrayList<>();
        Connection conn = Conexion.getConnection();

        // Left Join to retrieve category names
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

                // Get images for this product
                product.setImages(getProductImages(conn, productId));

                products.add(product);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return products;
    }

    private List<String> getProductImages(Connection conn, int productId) {
        List<String> images = new ArrayList<>();
        String query = "SELECT image_url FROM product_images WHERE product_id = ? ORDER BY display_order ASC";

        try (PreparedStatement stmt = conn.prepareStatement(query)) {
            stmt.setInt(1, productId);
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    images.add(rs.getString("image_url"));
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return images;
    }

    /**
     * Receives a Base64 image string, saves it to the uploads/ folder,
     * then inserts/replaces the image URL in product_images table.
     * Returns the public URL for the saved image, or null on failure.
     */
    public String saveProductImage(int productId, String base64Data) {
        try {
            // Strip the data URI prefix: data:image/png;base64,xxxx
            String base64 = base64Data;
            String ext = "png";
            if (base64Data.contains(",")) {
                String header = base64Data.substring(0, base64Data.indexOf(','));
                base64 = base64Data.substring(base64Data.indexOf(',') + 1);
                // Detect extension from MIME type
                if (header.contains("jpeg") || header.contains("jpg"))
                    ext = "jpg";
                else if (header.contains("webp"))
                    ext = "webp";
                else if (header.contains("gif"))
                    ext = "gif";
            }

            // Ensure uploads directory exists
            File uploadsDir = new File("uploads");
            if (!uploadsDir.exists())
                uploadsDir.mkdir();

            // Save the decoded bytes to a file
            String fileName = "product_" + productId + "_" + System.currentTimeMillis() + "." + ext;
            File imageFile = new File(uploadsDir, fileName);
            byte[] imageBytes = Base64.getDecoder().decode(base64);
            try (FileOutputStream fos = new FileOutputStream(imageFile)) {
                fos.write(imageBytes);
            }

            String imageUrl = "http://localhost:8081/uploads/" + fileName;

            // Delete old images for this product
            Connection conn = Conexion.getConnection();
            String deleteQuery = "DELETE FROM product_images WHERE product_id = ?";
            try (PreparedStatement delStmt = conn.prepareStatement(deleteQuery)) {
                delStmt.setInt(1, productId);
                delStmt.executeUpdate();
            }

            // Insert new image URL
            String insertQuery = "INSERT INTO product_images (product_id, image_url, display_order) VALUES (?, ?, 0)";
            try (PreparedStatement insStmt = conn.prepareStatement(insertQuery)) {
                insStmt.setInt(1, productId);
                insStmt.setString(2, imageUrl);
                insStmt.executeUpdate();
            }

            return imageUrl;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    /**
     * Updates a product's stock and price in the database.
     */
    public boolean updateProduct(int productId, double price, int stock) {
        Connection conn = Conexion.getConnection();
        String query = "UPDATE products SET price = ?, stock = ?, updated_at = NOW() WHERE id = ?";
        try (PreparedStatement stmt = conn.prepareStatement(query)) {
            stmt.setDouble(1, price);
            stmt.setInt(2, stock);
            stmt.setInt(3, productId);
            stmt.executeUpdate();
            return true;
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    public List<Product> getPendingProducts() {
        List<Product> products = new ArrayList<>();
        Connection conn = Conexion.getConnection();

        // Left Join to retrieve category names, filtering by moderation_status 'pending'
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
            e.printStackTrace();
        }
        return products;
    }

    public boolean updateModerationStatus(int productId, String status, String reason) {
        Connection conn = Conexion.getConnection();
        // If approved, active should also be true. If rejected, it stays false.
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
            e.printStackTrace();
            return false;
        }
    }

    public boolean addProduct(Product product) {
        String query = "INSERT INTO products (name, category_id, price, seller_id, description, material, width, weight, care, stock, featured, active, moderation_status) " +
                       "VALUES (?, (SELECT id FROM categories WHERE name = ? LIMIT 1), ?, ?, ?, ?, ?, ?, ?, ?, ?, true, 'pending')";
        Connection conn = Conexion.getConnection();
        try (PreparedStatement stmt = conn.prepareStatement(query)) {
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
            e.printStackTrace();
            return false;
        }
    }

    public boolean updateProduct(int id, Product updates) {
        String query = "UPDATE products SET name=?, price=?, description=?, material=?, width=?, weight=?, care=?, stock=?, featured=? WHERE id=?";
        Connection conn = Conexion.getConnection();
        try (PreparedStatement stmt = conn.prepareStatement(query)) {
            stmt.setString(1, updates.getName());
            stmt.setDouble(2, updates.getPrice());
            stmt.setString(3, updates.getDescription());
            stmt.setString(4, updates.getMaterial());
            stmt.setString(5, updates.getWidth());
            stmt.setString(6, updates.getWeight());
            stmt.setString(7, updates.getCare());
            stmt.setInt(8, updates.getStock());
            stmt.setBoolean(9, updates.isFeatured());
            stmt.setInt(10, id);
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    public boolean deleteProduct(int id) {
        String query = "UPDATE products SET active = false WHERE id = ?";
        Connection conn = Conexion.getConnection();
        try (PreparedStatement stmt = conn.prepareStatement(query)) {
            stmt.setInt(1, id);
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }
}
