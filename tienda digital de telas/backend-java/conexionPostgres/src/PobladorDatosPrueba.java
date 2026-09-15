import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Statement;
import java.sql.SQLException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import infraestructura.configuracion.Conexion;

/**
 * Inicializador y Poblador de Base de Datos PostgreSQL para D&D Textil.
 * 
 * Este script inserta la información inicial completa en las tablas relacionales de PostgreSQL:
 *  - Cuentas de usuarios (Administrador, Vendedores, Clientes).
 *  - Categorías textiles base.
 *  - Catálogo inicial de productos de muestra con especificaciones e imágenes.
 *  - Lotes de inventario iniciales.
 *  - Cupones de descuento activos.
 *  - Apartados y diapositivas del inicio (Home/Carrusel).
 *  - Umbrales de alerta de stock y configuración global del sistema.
 * 
 * Todo el backend Java lee y escribe esta información de forma 100% dinámica mediante SQL JDBC (DAOs).
 */
public class PobladorDatosPrueba {

    /**
     * Genera el hash criptográfico SHA-256 idéntico al de ServicioAutenticacion.
     */
    private static String encriptarContrasena(String contrasenaPlana) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            digest.update(contrasenaPlana.getBytes(java.nio.charset.StandardCharsets.UTF_8));
            byte[] resumen = digest.digest();
            StringBuilder cadenaHex = new StringBuilder();
            for (byte b : resumen) {
                cadenaHex.append(String.format("%02x", b));
            }
            return cadenaHex.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("Algoritmo SHA-256 no disponible en la JVM", e);
        }
    }

    public static void main(String[] args) {
        System.out.println("=== Poblando Base de Datos PostgreSQL para D&D Textil ===");

        Connection conexion = Conexion.obtenerConexion();
        if (conexion == null) {
            System.err.println("ERROR: No se pudo conectar a la base de datos PostgreSQL.");
            return;
        }

        try {
            conexion.setAutoCommit(false);
            Statement sentencia = conexion.createStatement();

            // 1. Limpiar tablas anteriores manteniendo orden de dependencias FK
            System.out.println("[1/10] Limpiando datos anteriores...");
            sentencia.executeUpdate("TRUNCATE TABLE waste_events, order_items, cart_items, coupon_categories, product_images, bug_reports, support_tickets, daily_sales, region_sales, recent_activity CASCADE");
            sentencia.executeUpdate("TRUNCATE TABLE orders CASCADE");
            sentencia.executeUpdate("TRUNCATE TABLE products CASCADE");
            sentencia.executeUpdate("TRUNCATE TABLE coupons CASCADE");
            sentencia.executeUpdate("TRUNCATE TABLE inventory_batches CASCADE");
            sentencia.executeUpdate("TRUNCATE TABLE categories CASCADE");
            sentencia.executeUpdate("TRUNCATE TABLE stock_thresholds CASCADE");
            sentencia.executeUpdate("TRUNCATE TABLE global_banner CASCADE");
            sentencia.executeUpdate("TRUNCATE TABLE home_sections CASCADE");
            sentencia.executeUpdate("TRUNCATE TABLE carousel_slides CASCADE");
            sentencia.executeUpdate("TRUNCATE TABLE system_config CASCADE");
            sentencia.executeUpdate("TRUNCATE TABLE users CASCADE");

            // 2. Insertar Usuarios del Sistema (Admin, Vendedores, Cliente)
            System.out.println("[2/10] Insertando usuarios (Admin, Vendedores, Cliente)...");
            String sqlInsertarUsuario = "INSERT INTO users (name, email, password_hash, role, active, commission_rate) VALUES (?, ?, ?, ?, true, ?)";
            
            int idAdmin = 0, idVendedor1 = 0, idVendedor2 = 0, idCliente = 0;

            try (PreparedStatement pst = conexion.prepareStatement(sqlInsertarUsuario, Statement.RETURN_GENERATED_KEYS)) {
                // Admin
                pst.setString(1, "Anderson Moreno");
                pst.setString(2, "admin@ddtextil.com");
                pst.setString(3, encriptarContrasena("admin123"));
                pst.setString(4, "administrador");
                pst.setNull(5, java.sql.Types.DOUBLE);
                pst.executeUpdate();
                try (ResultSet rs = pst.getGeneratedKeys()) { if (rs.next()) idAdmin = rs.getInt(1); }

                // Vendedor 1
                pst.setString(1, "Carlos Pérez");
                pst.setString(2, "vendedor@ddtextil.com");
                pst.setString(3, encriptarContrasena("vendedor123"));
                pst.setString(4, "vendedor");
                pst.setDouble(5, 5.0);
                pst.executeUpdate();
                try (ResultSet rs = pst.getGeneratedKeys()) { if (rs.next()) idVendedor1 = rs.getInt(1); }

                // Vendedor 2
                pst.setString(1, "María González");
                pst.setString(2, "maria.gonzalez@ddtextil.com");
                pst.setString(3, encriptarContrasena("vendedor123"));
                pst.setString(4, "vendedor");
                pst.setDouble(5, 4.5);
                pst.executeUpdate();
                try (ResultSet rs = pst.getGeneratedKeys()) { if (rs.next()) idVendedor2 = rs.getInt(1); }

                // Cliente
                pst.setString(1, "Juan Cliente");
                pst.setString(2, "cliente@gmail.com");
                pst.setString(3, encriptarContrasena("cliente123"));
                pst.setString(4, "cliente");
                pst.setNull(5, java.sql.Types.DOUBLE);
                pst.executeUpdate();
                try (ResultSet rs = pst.getGeneratedKeys()) { if (rs.next()) idCliente = rs.getInt(1); }
            }

            // 3. Insertar Categorías Textiles Base
            System.out.println("[3/10] Insertando categorías textiles...");
            String[] listaCategorias = {"Algodon", "Seda", "Lino", "Lana", "Poliester", "Terciopelo", "Dril", "Mezclilla"};
            String sqlInsertarCategoria = "INSERT INTO categories (name, description) VALUES (?, ?)";
            try (PreparedStatement pst = conexion.prepareStatement(sqlInsertarCategoria)) {
                for (String categoria : listaCategorias) {
                    pst.setString(1, categoria);
                    pst.setString(2, "Telas de alta calidad tipo " + categoria);
                    pst.executeUpdate();
                }
            }

            // 4. Insertar Productos en el Catálogo de PostgreSQL
            System.out.println("[4/10] Insertando productos en el catálogo de PostgreSQL...");
            Object[][] datosProductos = {
                // Nombre, Categoría, Precio, VendedorId, Descripción, Material, Ancho, Peso, Cuidados, Stock, Destacado, EsNuevo, EsExclusivo, EsOferta, UrlImagen
                {"Algodon Premium",       "Algodon",    25000.0, idVendedor1, "Tela de algodón 100% natural, ideal para camisas y blusas de alta durabilidad.", "Algodón 100%", "1.50m", "150g/m2", "Lavar en frío, no blanquear", 100, true, true, false, false, "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=600"},
                {"Seda Italiana",         "Seda",       85000.0, idVendedor1, "Seda pura con acabado brillante, perfecta para vestidos de gala y eventos especiales.", "Seda pura", "1.40m", "80g/m2", "Limpieza en seco únicamente", 50, true, false, true, false, "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=600"},
                {"Lino Organico",         "Lino",       45000.0, idVendedor2, "Lino fresco y transpirable para ropa de verano, cortinas y mantelería fina.", "Lino orgánico", "1.50m", "200g/m2", "No usar secadora", 80, false, true, false, true, "https://images.unsplash.com/photo-1579656381226-5fc0f0100c3b?w=600"},
                {"Lana Merino",           "Lana",       65000.0, idVendedor2, "Lana suave y cálida de alta calidad para abrigos, trajes y prendas invernales.", "Lana Merino 100%", "1.45m", "320g/m2", "Lavar a mano con agua tibia", 40, false, false, true, false, "https://images.unsplash.com/photo-1520006403909-838d6b92c22e?w=600"},
                {"Poliester Deportivo",   "Poliester",  18000.0, idVendedor1, "Tela sintética de secado rápido ideal para uniformes y ropa deportiva de alto rendimiento.", "Poliéster 100%", "1.60m", "130g/m2", "Lavado máquina ciclo normal", 150, true, false, false, true, "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=600"},
                {"Terciopelo Azul Noche", "Terciopelo", 95000.0, idVendedor2, "Terciopelo espeso de tacto suave y gran sofisticación para tapicería y alta costura.", "Poliéster / Algodón", "1.40m", "380g/m2", "Limpieza profesional en seco", 30, true, true, true, false, "https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?w=600"},
                {"Dril Elastico Natural", "Dril",       38000.0, idVendedor1, "Dril resistente con Spandex para mayor comodidad en pantalones de trabajo y chaquetas.", "Algodón 98% / Spandex 2%", "1.50m", "280g/m2", "Lavar a temperatura ambiente", 120, false, false, false, false, "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=600"},
                {"Mezclilla Denim Heavy", "Mezclilla",  42000.0, idVendedor2, "Mezclilla rígida tradicional de 14oz para jeaneado clásico y chaquetas duraderas.", "Algodón 100%", "1.50m", "420g/m2", "Lavar al revés con colores similares", 90, true, true, false, true, "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600"}
            };

            String sqlInsertarProd = "INSERT INTO products (name, category_id, price, seller_id, description, material, width, weight, care, stock, featured, active, moderation_status, is_new_collection, is_exclusive, is_offer) " +
                                  "VALUES (?, (SELECT id FROM categories WHERE name = ? LIMIT 1), ?, ?, ?, ?, ?, ?, ?, ?, ?, true, 'approved', ?, ?, ?)";
            String sqlInsertarImg = "INSERT INTO product_images (product_id, image_url, display_order) VALUES (?, ?, 0)";
            String sqlInsertarLote = "INSERT INTO inventory_batches (product_id, meters_received, cost_per_meter, supplier, received_date) VALUES (?, ?, ?, ?, CURRENT_DATE)";

            try (PreparedStatement pstProd = conexion.prepareStatement(sqlInsertarProd, Statement.RETURN_GENERATED_KEYS);
                 PreparedStatement pstImg = conexion.prepareStatement(sqlInsertarImg);
                 PreparedStatement pstLote = conexion.prepareStatement(sqlInsertarLote)) {

                for (Object[] fila : datosProductos) {
                    pstProd.setString(1, (String) fila[0]);
                    pstProd.setString(2, (String) fila[1]);
                    pstProd.setDouble(3, (Double) fila[2]);
                    pstProd.setInt(4, (Integer) fila[3]);
                    pstProd.setString(5, (String) fila[4]);
                    pstProd.setString(6, (String) fila[5]);
                    pstProd.setString(7, (String) fila[6]);
                    pstProd.setString(8, (String) fila[7]);
                    pstProd.setString(9, (String) fila[8]);
                    pstProd.setInt(10, (Integer) fila[9]);
                    pstProd.setBoolean(11, (Boolean) fila[10]);
                    pstProd.setBoolean(12, (Boolean) fila[11]);
                    pstProd.setBoolean(13, (Boolean) fila[12]);
                    pstProd.setBoolean(14, (Boolean) fila[13]);
                    pstProd.executeUpdate();

                    int idProdGenerado = 0;
                    try (ResultSet rs = pstProd.getGeneratedKeys()) {
                        if (rs.next()) idProdGenerado = rs.getInt(1);
                    }

                    if (idProdGenerado > 0) {
                        // Imagen de portada
                        pstImg.setInt(1, idProdGenerado);
                        pstImg.setString(2, (String) fila[14]);
                        pstImg.executeUpdate();

                        // Lote de inventario inicial
                        pstLote.setInt(1, idProdGenerado);
                        pstLote.setDouble(2, (Integer) fila[9]);
                        pstLote.setDouble(3, ((Double) fila[2]) * 0.6);
                        pstLote.setString(4, "Proveedor Textil Central");
                        pstLote.executeUpdate();
                    }
                }
            }

            // 5. Insertar Cupones de Descuento
            System.out.println("[5/10] Insertando cupones de descuento...");
            String sqlInsertarCupon = "INSERT INTO coupons (code, discount_percent, max_uses, active) VALUES (?, ?, ?, true)";
            try (PreparedStatement pst = conexion.prepareStatement(sqlInsertarCupon)) {
                pst.setString(1, "DESCUENTO10");
                pst.setDouble(2, 10.0);
                pst.setInt(3, 100);
                pst.executeUpdate();

                pst.setString(1, "BIENVENIDA20");
                pst.setDouble(2, 20.0);
                pst.setInt(3, 50);
                pst.executeUpdate();
            }

            // 6. Configurar Apartados del Inicio (Home Sections)
            System.out.println("[6/10] Insertando apartados de la página de inicio...");
            String sqlInsertarSeccion = "INSERT INTO home_sections (key, title, subtitle, active, sort_order) VALUES (?, ?, ?, true, ?)";
            try (PreparedStatement pst = conexion.prepareStatement(sqlInsertarSeccion)) {
                pst.setString(1, "nuevas");
                pst.setString(2, "Nuevas Colecciones");
                pst.setString(3, "Lo último en tendencias de moda y textiles");
                pst.setInt(4, 1);
                pst.executeUpdate();

                pst.setString(1, "exclusivas");
                pst.setString(2, "Telas Exclusivas");
                pst.setString(3, "Materiales de alta costura e importación especial");
                pst.setInt(4, 2);
                pst.executeUpdate();

                pst.setString(1, "ofertas");
                pst.setString(2, "Ofertas Especiales");
                pst.setString(3, "Descuentos por metraje y liquidación de inventario");
                pst.setInt(4, 3);
                pst.executeUpdate();
            }

            // 7. Insertar Diapositivas del Carrusel principal
            System.out.println("[7/10] Insertando diapositivas del carrusel...");
            String sqlInsertarDiapositiva = "INSERT INTO carousel_slides (title, subtitle, image, cta, section_key, active, sort_order) VALUES (?, ?, ?, ?, ?, true, ?)";
            try (PreparedStatement pst = conexion.prepareStatement(sqlInsertarDiapositiva)) {
                pst.setString(1, "Gran Colección Primavera - Verano");
                pst.setString(2, "Descubre nuestras telas de Lino y Algodón 100% natural con hasta 20% de descuento.");
                pst.setString(3, "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=1200");
                pst.setString(4, "Ver Colección");
                pst.setString(5, "nuevas");
                pst.setInt(6, 1);
                pst.executeUpdate();

                pst.setString(1, "Seda Italiana y Terciopelo de Lujo");
                pst.setString(2, "Elegancia y textura única para tus confecciones de alta costura.");
                pst.setString(3, "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=1200");
                pst.setString(4, "Explorar Exclusivos");
                pst.setString(5, "exclusivas");
                pst.setInt(6, 2);
                pst.executeUpdate();
            }

            // 8. Configurar Umbrales de Alerta de Stock por Categoría
            System.out.println("[8/10] Configurando umbrales de stock por categoría...");
            String sqlInsertarUmbral = "INSERT INTO stock_thresholds (fabric_type, min_meters, alert_enabled) VALUES (?, ?, ?)";
            try (PreparedStatement pst = conexion.prepareStatement(sqlInsertarUmbral)) {
                for (String categoria : listaCategorias) {
                    pst.setString(1, categoria);
                    pst.setDouble(2, 20.0);
                    pst.setBoolean(3, true);
                    pst.executeUpdate();
                }
            }

            // 9. Configuración del Sistema y Banner Global
            System.out.println("[9/10] Configurando parámetros globales y banner...");
            String sqlInsertarBanner = "INSERT INTO global_banner (enabled, message, banner_type) VALUES (?, ?, ?)";
            try (PreparedStatement pst = conexion.prepareStatement(sqlInsertarBanner)) {
                pst.setBoolean(1, true);
                pst.setString(2, "¡Envío gratis en compras superiores a $200.000 COP a todo el país!");
                pst.setString(3, "info");
                pst.executeUpdate();
            }

            String sqlInsertarConfig = "INSERT INTO system_config (key, value) VALUES (?, ?) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value";
            try (PreparedStatement pst = conexion.prepareStatement(sqlInsertarConfig)) {
                pst.setString(1, "system_config");
                pst.setString(2, "{\"siteName\":\"D&D Textil\",\"defaultDarkMode\":false,\"primaryColor\":\"#8B5CF6\",\"secondaryColor\":\"#EC4899\",\"accentColor\":\"#F59E0B\",\"taxRate\":0.19,\"shippingCost\":15000,\"freeShippingThreshold\":200000,\"lowStockThreshold\":20,\"maintenanceMode\":false}");
                pst.executeUpdate();
            }

            // 10. Crear tablas adicionales de ERP si no existen y poblarlas
            System.out.println("[10/10] Asegurando métricas ERP...");
            sentencia.executeUpdate("CREATE TABLE IF NOT EXISTS erp_sales_metrics (" +
                               "id SERIAL PRIMARY KEY, " +
                               "record_date DATE NOT NULL UNIQUE, " +
                               "actual_sales NUMERIC(15, 2) NOT NULL DEFAULT 0.00, " +
                               "target_sales NUMERIC(15, 2) NOT NULL DEFAULT 0.00, " +
                               "profit_margin NUMERIC(5, 2) NOT NULL DEFAULT 0.00, " +
                               "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)");

            sentencia.executeUpdate("INSERT INTO erp_sales_metrics (record_date, actual_sales, target_sales, profit_margin) VALUES " +
                               "(CURRENT_DATE - INTERVAL '3 days', 2100000, 1650000, 38.1), " +
                               "(CURRENT_DATE - INTERVAL '2 days', 1900000, 1700000, 36.4), " +
                               "(CURRENT_DATE - INTERVAL '1 days', 2400000, 1800000, 41.0), " +
                               "(CURRENT_DATE, 1400000, 1850000, 35.5) " +
                               "ON CONFLICT (record_date) DO NOTHING");

            conexion.commit();
            System.out.println("\n=== BASE DE DATOS POSTGRESQL POBLADA EXITOSAMENTE ===");
            System.out.println("Cuentas disponibles para pruebas:");
            System.out.println("  1. Admin: admin@ddtextil.com / admin123");
            System.out.println("  2. Vendedor 1: vendedor@ddtextil.com / vendedor123");
            System.out.println("  3. Vendedor 2: maria.gonzalez@ddtextil.com / vendedor123");
            System.out.println("  4. Cliente: cliente@gmail.com / cliente123");
            System.out.println("\nLos datos están almacenados directamente en PostgreSQL y el backend los sirve dinámicamente.");

        } catch (Exception e) {
            System.err.println("ERROR poblando la base de datos: " + e.getMessage());
            e.printStackTrace();
            try {
                conexion.rollback();
            } catch (SQLException ex) {
                ex.printStackTrace();
            }
        }
    }
}
