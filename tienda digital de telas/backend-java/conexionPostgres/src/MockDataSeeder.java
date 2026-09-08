import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Statement;
import java.sql.SQLException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import infrastructure.config.Conexion;

/**
 * Inicializador y Poblador de Base de Datos PostgreSQL para D&D Textil.
 * 
 * Este script inserta la información inicial completa en las tablas relacionales de PostgreSQL:
 *  - Cuentas de usuarios (Administrador, Vendedores, Clientes).
 *  - Categorías textiles base.
 *  - Catálogo inicial de productos de muestra con especificaciones e imágenes.
 *  - Lotes de inventario iniciales.
 *  - Cupones de descuento activos.
 *  - Apartados y slides del inicio (Home/Carrusel).
 *  - Umbrales de alerta de stock y configuración global del sistema.
 * 
 * Todo el backend Java lee y escribe esta información de forma 100% dinámica mediante SQL JDBC (DAOs).
 * Cualquier producto, pedido o usuario creado o modificado desde la interfaz web (Dashboard)
 * se guarda permanentemente en la base de datos PostgreSQL.
 */
public class MockDataSeeder {

    /** Genera hash SHA-256 idéntico al de AuthService */
    private static String hashPassword(String password) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            md.update(password.getBytes());
            byte[] digest = md.digest();
            StringBuilder sb = new StringBuilder();
            for (byte b : digest) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 no disponible", e);
        }
    }

    public static void main(String[] args) {
        System.out.println("=== Poblando Base de Datos PostgreSQL para D&D Textil ===");

        Connection con = Conexion.getConnection();
        if (con == null) {
            System.err.println("ERROR: No se pudo conectar a la base de datos PostgreSQL.");
            return;
        }

        try {
            con.setAutoCommit(false);
            Statement stmt = con.createStatement();

            // 1. Limpiar tablas anteriores manteniendo orden de dependencias FK
            System.out.println("[1/10] Limpiando datos anteriores...");
            stmt.executeUpdate("TRUNCATE TABLE waste_events, order_items, cart_items, coupon_categories, product_images, bug_reports, support_tickets, daily_sales, region_sales, recent_activity CASCADE");
            stmt.executeUpdate("TRUNCATE TABLE orders CASCADE");
            stmt.executeUpdate("TRUNCATE TABLE products CASCADE");
            stmt.executeUpdate("TRUNCATE TABLE coupons CASCADE");
            stmt.executeUpdate("TRUNCATE TABLE inventory_batches CASCADE");
            stmt.executeUpdate("TRUNCATE TABLE categories CASCADE");
            stmt.executeUpdate("TRUNCATE TABLE stock_thresholds CASCADE");
            stmt.executeUpdate("TRUNCATE TABLE global_banner CASCADE");
            stmt.executeUpdate("TRUNCATE TABLE home_sections CASCADE");
            stmt.executeUpdate("TRUNCATE TABLE carousel_slides CASCADE");
            stmt.executeUpdate("TRUNCATE TABLE system_config CASCADE");
            stmt.executeUpdate("TRUNCATE TABLE users CASCADE");

            // 2. Insertar Usuarios del Sistema (Admin, Vendedores, Cliente)
            System.out.println("[2/10] Insertando usuarios (Admin, Vendedores, Cliente)...");
            String insertUser = "INSERT INTO users (name, email, password_hash, role, active, commission_rate) VALUES (?, ?, ?, ?, true, ?)";
            
            int adminId = 0, seller1Id = 0, seller2Id = 0, buyerId = 0;

            try (PreparedStatement ps = con.prepareStatement(insertUser, Statement.RETURN_GENERATED_KEYS)) {
                // Admin
                ps.setString(1, "Anderson Moreno");
                ps.setString(2, "admin@ddtextil.com");
                ps.setString(3, hashPassword("admin123"));
                ps.setString(4, "administrador");
                ps.setNull(5, java.sql.Types.DOUBLE);
                ps.executeUpdate();
                try (ResultSet rs = ps.getGeneratedKeys()) { if (rs.next()) adminId = rs.getInt(1); }

                // Vendedor 1
                ps.setString(1, "Carlos Pérez");
                ps.setString(2, "vendedor@ddtextil.com");
                ps.setString(3, hashPassword("vendedor123"));
                ps.setString(4, "vendedor");
                ps.setDouble(5, 5.0);
                ps.executeUpdate();
                try (ResultSet rs = ps.getGeneratedKeys()) { if (rs.next()) seller1Id = rs.getInt(1); }

                // Vendedor 2
                ps.setString(1, "María González");
                ps.setString(2, "maria.gonzalez@ddtextil.com");
                ps.setString(3, hashPassword("vendedor123"));
                ps.setString(4, "vendedor");
                ps.setDouble(5, 4.5);
                ps.executeUpdate();
                try (ResultSet rs = ps.getGeneratedKeys()) { if (rs.next()) seller2Id = rs.getInt(1); }

                // Cliente
                ps.setString(1, "Juan Cliente");
                ps.setString(2, "cliente@gmail.com");
                ps.setString(3, hashPassword("cliente123"));
                ps.setString(4, "cliente");
                ps.setNull(5, java.sql.Types.DOUBLE);
                ps.executeUpdate();
                try (ResultSet rs = ps.getGeneratedKeys()) { if (rs.next()) buyerId = rs.getInt(1); }
            }

            // 3. Insertar Categorías Textiles Base
            System.out.println("[3/10] Insertando categorias textiles...");
            String[] categoriesList = {"Algodon", "Seda", "Lino", "Lana", "Poliester", "Terciopelo", "Dril", "Mezclilla"};
            String insertCat = "INSERT INTO categories (name, description) VALUES (?, ?)";
            try (PreparedStatement ps = con.prepareStatement(insertCat)) {
                for (String cat : categoriesList) {
                    ps.setString(1, cat);
                    ps.setString(2, "Telas de alta calidad tipo " + cat);
                    ps.executeUpdate();
                }
            }

            // 4. Insertar Productos en el Catálogo de PostgreSQL
            System.out.println("[4/10] Insertando productos en el catalogo de PostgreSQL...");
            Object[][] productsData = {
                // Nombre, Categoría, Precio, SellerId, Descripción, Material, Ancho, Peso, Cuidados, Stock, Featured, isNew, isExclusive, isOffer, ImageUrl
                {"Algodon Premium",  "Algodon", 25000.0, seller1Id, "Tela de algodon 100% natural, ideal para camisas y blusas de alta durabilidad.", "Algodon 100%", "1.50m", "150g/m2", "Lavar en frio, no blanquear", 100, true, true, false, false, "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=600"},
                {"Seda Italiana",    "Seda",    85000.0, seller1Id, "Seda pura con acabado brillante, perfecta para vestidos de gala y eventos especiales.", "Seda pura", "1.40m", "80g/m2", "Limpieza en seco unicamente", 50, true, false, true, false, "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=600"},
                {"Lino Organico",    "Lino",    45000.0, seller2Id, "Lino fresco y transpirable para ropa de verano, cortinas y manteleria fina.", "Lino organico", "1.50m", "200g/m2", "No usar secadora", 80, false, true, false, true, "https://images.unsplash.com/photo-1579656381226-5fc0f0100c3b?w=600"},
                {"Lana Merino",      "Lana",    65000.0, seller2Id, "Lana suave y calida de alta calidad para abrigos, trajes y prendas invernales.", "Lana Merino 100%", "1.45m", "320g/m2", "Lavar a mano con agua tibia", 40, false, false, true, false, "https://images.unsplash.com/photo-1520006403909-838d6b92c22e?w=600"},
                {"Poliester Deportivo", "Poliester", 18000.0, seller1Id, "Tela sintetica de secado rapido ideal para uniformes y ropa deportiva de alto rendimiento.", "Poliester 100%", "1.60m", "130g/m2", "Lavado maquina ciclo normal", 150, true, false, false, true, "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=600"},
                {"Terciopelo Azul Noche", "Terciopelo", 95000.0, seller2Id, "Terciopelo espeso de tacto suave y gran sofisticacion para tapiceria y alta costura.", "Poliester / Algodon", "1.40m", "380g/m2", "Limpieza profesional en seco", 30, true, true, true, false, "https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?w=600"},
                {"Dril Elastico Natural", "Dril", 38000.0, seller1Id, "Dril resistente con Spandex para mayor comodidad en pantalones de trabajo y chaquetas.", "Algodon 98% / Spandex 2%", "1.50m", "280g/m2", "Lavar a temperatura ambiente", 120, false, false, false, false, "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=600"},
                {"Mezclilla Denim Heavy", "Mezclilla", 42000.0, seller2Id, "Mezclilla rigida tradicional de 14oz para jeaneado clasico y chaquetas duraderas.", "Algodon 100%", "1.50m", "420g/m2", "Lavar al reves con colores similares", 90, true, true, false, true, "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600"}
            };

            String insertProdSql = "INSERT INTO products (name, category_id, price, seller_id, description, material, width, weight, care, stock, featured, active, moderation_status, is_new_collection, is_exclusive, is_offer) " +
                                  "VALUES (?, (SELECT id FROM categories WHERE name = ? LIMIT 1), ?, ?, ?, ?, ?, ?, ?, ?, ?, true, 'approved', ?, ?, ?)";
            String insertImgSql = "INSERT INTO product_images (product_id, image_url, display_order) VALUES (?, ?, 0)";
            String insertBatchSql = "INSERT INTO inventory_batches (product_id, meters_received, cost_per_meter, supplier, received_date) VALUES (?, ?, ?, ?, CURRENT_DATE)";

            try (PreparedStatement psProd = con.prepareStatement(insertProdSql, Statement.RETURN_GENERATED_KEYS);
                 PreparedStatement psImg = con.prepareStatement(insertImgSql);
                 PreparedStatement psBatch = con.prepareStatement(insertBatchSql)) {

                for (Object[] p : productsData) {
                    psProd.setString(1, (String) p[0]);
                    psProd.setString(2, (String) p[1]);
                    psProd.setDouble(3, (Double) p[2]);
                    psProd.setInt(4, (Integer) p[3]);
                    psProd.setString(5, (String) p[4]);
                    psProd.setString(6, (String) p[5]);
                    psProd.setString(7, (String) p[6]);
                    psProd.setString(8, (String) p[7]);
                    psProd.setString(9, (String) p[8]);
                    psProd.setInt(10, (Integer) p[9]);
                    psProd.setBoolean(11, (Boolean) p[10]);
                    psProd.setBoolean(12, (Boolean) p[11]);
                    psProd.setBoolean(13, (Boolean) p[12]);
                    psProd.setBoolean(14, (Boolean) p[13]);
                    psProd.executeUpdate();

                    int pId = 0;
                    try (ResultSet rs = psProd.getGeneratedKeys()) {
                        if (rs.next()) pId = rs.getInt(1);
                    }

                    if (pId > 0) {
                        // Imagen del producto
                        psImg.setInt(1, pId);
                        psImg.setString(2, (String) p[14]);
                        psImg.executeUpdate();

                        // Lote de inventario inicial
                        psBatch.setInt(1, pId);
                        psBatch.setDouble(2, (Integer) p[9]);
                        psBatch.setDouble(3, ((Double) p[2]) * 0.6);
                        psBatch.setString(4, "Proveedor Textil Central");
                        psBatch.executeUpdate();
                    }
                }
            }

            // 5. Insertar Cupones de Descuento
            System.out.println("[5/10] Insertando cupones de descuento...");
            String insertCoupon = "INSERT INTO coupons (code, discount_percent, max_uses, active) VALUES (?, ?, ?, true)";
            try (PreparedStatement ps = con.prepareStatement(insertCoupon)) {
                ps.setString(1, "DESCUENTO10");
                ps.setDouble(2, 10.0);
                ps.setInt(3, 100);
                ps.executeUpdate();

                ps.setString(1, "BIENVENIDA20");
                ps.setDouble(2, 20.0);
                ps.setInt(3, 50);
                ps.executeUpdate();
            }

            // 6. Configurar Apartados del Inicio (Home Sections)
            System.out.println("[6/10] Insertando apartados de la pagina de inicio...");
            String insertSection = "INSERT INTO home_sections (key, title, subtitle, active, sort_order) VALUES (?, ?, ?, true, ?)";
            try (PreparedStatement ps = con.prepareStatement(insertSection)) {
                ps.setString(1, "nuevas");
                ps.setString(2, "Nuevas Colecciones");
                ps.setString(3, "Lo ultimo en tendencias de moda y textiles");
                ps.setInt(4, 1);
                ps.executeUpdate();

                ps.setString(1, "exclusivas");
                ps.setString(2, "Telas Exclusivas");
                ps.setString(3, "Materiales de alta costura e importacion especial");
                ps.setInt(4, 2);
                ps.executeUpdate();

                ps.setString(1, "ofertas");
                ps.setString(2, "Ofertas Especiales");
                ps.setString(3, "Descuentos por metraje y liquidacion de inventario");
                ps.setInt(4, 3);
                ps.executeUpdate();
            }

            // 7. Insertar Slides del Carrusel principal
            System.out.println("[7/10] Insertando slides del carrusel...");
            String insertSlide = "INSERT INTO carousel_slides (title, subtitle, image, cta, section_key, active, sort_order) VALUES (?, ?, ?, ?, ?, true, ?)";
            try (PreparedStatement ps = con.prepareStatement(insertSlide)) {
                ps.setString(1, "Gran Coleccion Primavera - Verano");
                ps.setString(2, "Descubre nuestras telas de Lino y Algodon 100% natural con hasta 20% de descuento.");
                ps.setString(3, "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=1200");
                ps.setString(4, "Ver Colección");
                ps.setString(5, "nuevas");
                ps.setInt(6, 1);
                ps.executeUpdate();

                ps.setString(1, "Seda Italiana y Terciopelo de Lujo");
                ps.setString(2, "Elegancia y textura unica para tus confecciones de alta costura.");
                ps.setString(3, "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=1200");
                ps.setString(4, "Explorar Exclusivos");
                ps.setString(5, "exclusivas");
                ps.setInt(6, 2);
                ps.executeUpdate();
            }

            // 8. Configurar Umbrales de Alerta de Stock por Categoría
            System.out.println("[8/10] Configurando umbrales de stock por categoria...");
            String insertThreshold = "INSERT INTO stock_thresholds (fabric_type, min_meters, alert_enabled) VALUES (?, ?, ?)";
            try (PreparedStatement ps = con.prepareStatement(insertThreshold)) {
                for (String cat : categoriesList) {
                    ps.setString(1, cat);
                    ps.setDouble(2, 20.0);
                    ps.setBoolean(3, true);
                    ps.executeUpdate();
                }
            }

            // 9. Configuración del Sistema y Banner Global
            System.out.println("[9/10] Configurando parametros globales y banner...");
            String insertBanner = "INSERT INTO global_banner (enabled, message, banner_type) VALUES (?, ?, ?)";
            try (PreparedStatement ps = con.prepareStatement(insertBanner)) {
                ps.setBoolean(1, true);
                ps.setString(2, "¡Envío gratis en compras superiores a $200.000 COP a todo el país!");
                ps.setString(3, "info");
                ps.executeUpdate();
            }

            String insertConfig = "INSERT INTO system_config (key, value) VALUES (?, ?) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value";
            try (PreparedStatement ps = con.prepareStatement(insertConfig)) {
                ps.setString(1, "system_config");
                ps.setString(2, "{\"siteName\":\"D&D Textil\",\"defaultDarkMode\":false,\"primaryColor\":\"#8B5CF6\",\"secondaryColor\":\"#EC4899\",\"accentColor\":\"#F59E0B\",\"taxRate\":0.19,\"shippingCost\":15000,\"freeShippingThreshold\":200000,\"lowStockThreshold\":20,\"maintenanceMode\":false}");
                ps.executeUpdate();
            }

            // 10. Crear tablas adicionales de ERP si no existen y poblarlas
            System.out.println("[10/10] Asegurando metricas ERP...");
            stmt.executeUpdate("CREATE TABLE IF NOT EXISTS erp_sales_metrics (" +
                               "id SERIAL PRIMARY KEY, " +
                               "record_date DATE NOT NULL UNIQUE, " +
                               "actual_sales NUMERIC(15, 2) NOT NULL DEFAULT 0.00, " +
                               "target_sales NUMERIC(15, 2) NOT NULL DEFAULT 0.00, " +
                               "profit_margin NUMERIC(5, 2) NOT NULL DEFAULT 0.00, " +
                               "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)");

            stmt.executeUpdate("INSERT INTO erp_sales_metrics (record_date, actual_sales, target_sales, profit_margin) VALUES " +
                               "(CURRENT_DATE - INTERVAL '3 days', 2100000, 1650000, 38.1), " +
                               "(CURRENT_DATE - INTERVAL '2 days', 1900000, 1700000, 36.4), " +
                               "(CURRENT_DATE - INTERVAL '1 days', 2400000, 1800000, 41.0), " +
                               "(CURRENT_DATE, 1400000, 1850000, 35.5) " +
                               "ON CONFLICT (record_date) DO NOTHING");

            con.commit();
            System.out.println("\n=== BASE DE DATOS POSTGRESQL POBLADA EXITOSAMENTE ===");
            System.out.println("Cuentas disponibles para pruebas:");
            System.out.println("  1. Admin: admin@ddtextil.com / admin123");
            System.out.println("  2. Vendedor 1: vendedor@ddtextil.com / vendedor123");
            System.out.println("  3. Vendedor 2: maria.gonzalez@ddtextil.com / vendedor123");
            System.out.println("  4. Cliente: cliente@gmail.com / cliente123");
            System.out.println("\nLos datos estan almacenados directamente en PostgreSQL y el backend los sirve dinamicamente.");
            System.out.println("Cualquier alta/modificacion desde la app se guardara permanentemente en PostgreSQL.");

        } catch (Exception e) {
            System.err.println("ERROR poblando la base de datos: " + e.getMessage());
            e.printStackTrace();
            try {
                con.rollback();
            } catch (SQLException ex) {
                ex.printStackTrace();
            }
        }
    }
}

