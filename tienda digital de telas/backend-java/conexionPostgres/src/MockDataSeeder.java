import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.Statement;
import java.sql.SQLException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import infrastructure.config.Conexion;
import java.util.Random;
import java.time.LocalDate;

/**
 * Pobla la base de datos con datos de prueba realistas.
 * Las contraseñas se almacenan con hash SHA-256 (mismo algoritmo que AuthService).
 * Las credenciales de acceso están documentadas en CREDENCIALES.md
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
        System.out.println("=== Iniciando Seeder de Datos ===");

        Connection con = Conexion.getConnection();
        if (con == null) {
            System.err.println("ERROR: No se pudo conectar a la base de datos.");
            return;
        }

        try {
            con.setAutoCommit(false);  // Transaccion atomica
            Statement stmt = con.createStatement();

            // ── 0. Limpiar datos anteriores ──────────────────────────
            System.out.println("[1/12] Limpiando datos anteriores...");
            stmt.executeUpdate("TRUNCATE TABLE waste_events, order_items, cart_items, coupon_categories, product_images, bug_reports, support_tickets, daily_sales, region_sales, recent_activity CASCADE");
            stmt.executeUpdate("TRUNCATE TABLE orders CASCADE");
            stmt.executeUpdate("TRUNCATE TABLE products CASCADE");
            stmt.executeUpdate("TRUNCATE TABLE coupons CASCADE");
            stmt.executeUpdate("TRUNCATE TABLE inventory_batches CASCADE");
            stmt.executeUpdate("TRUNCATE TABLE categories CASCADE");
            stmt.executeUpdate("TRUNCATE TABLE stock_thresholds CASCADE");
            stmt.executeUpdate("TRUNCATE TABLE global_banner CASCADE");
            stmt.executeUpdate("TRUNCATE TABLE system_config CASCADE");
            stmt.executeUpdate("TRUNCATE TABLE users CASCADE");

            // ── 1. Usuarios ──────────────────────────────────────────
            System.out.println("[2/12] Insertando usuarios...");
            String insertUser = "INSERT INTO users (name, email, password_hash, role, active, commission_rate) VALUES (?, ?, ?, ?, true, ?)";
            try (PreparedStatement ps = con.prepareStatement(insertUser)) {
                // Admin (CREDENCIALES.md: admin@ddtextil.com / admin123)
                ps.setString(1, "Anderson Moreno");
                ps.setString(2, "admin@ddtextil.com");
                ps.setString(3, hashPassword("admin123"));
                ps.setString(4, "administrador");
                ps.setNull(5, java.sql.Types.NUMERIC);
                ps.executeUpdate();

                // Vendedor 1 (CREDENCIALES.md: vendedor@ddtextil.com / vendedor123)
                ps.setString(1, "Carlos Rodriguez");
                ps.setString(2, "vendedor@ddtextil.com");
                ps.setString(3, hashPassword("vendedor123"));
                ps.setString(4, "vendedor");
                ps.setDouble(5, 8.5);
                ps.executeUpdate();

                // Vendedor 2
                ps.setString(1, "Maria Gonzalez");
                ps.setString(2, "maria.gonzalez@ddtextil.com");
                ps.setString(3, hashPassword("vendedor123"));
                ps.setString(4, "vendedor");
                ps.setDouble(5, 10.0);
                ps.executeUpdate();

                // Vendedor 3
                ps.setString(1, "Ana Martinez");
                ps.setString(2, "ana.martinez@ddtextil.com");
                ps.setString(3, hashPassword("vendedor123"));
                ps.setString(4, "vendedor");
                ps.setDouble(5, 7.0);
                ps.executeUpdate();

                // Cliente 1 (CREDENCIALES.md: cliente@ddtextil.com / cliente123)
                ps.setString(1, "Cliente Demo");
                ps.setString(2, "cliente@ddtextil.com");
                ps.setString(3, hashPassword("cliente123"));
                ps.setString(4, "cliente");
                ps.setNull(5, java.sql.Types.NUMERIC);
                ps.executeUpdate();

                // Cliente 2
                ps.setString(1, "Laura Sanchez");
                ps.setString(2, "laura.sanchez@email.com");
                ps.setString(3, hashPassword("cliente123"));
                ps.setString(4, "cliente");
                ps.setNull(5, java.sql.Types.NUMERIC);
                ps.executeUpdate();
            }

            // ── 2. Categorias ────────────────────────────────────────
            System.out.println("[3/12] Insertando categorias...");
            String[] categoriesList = {"Algodon", "Seda", "Lino", "Lana", "Poliester"};
            String insertCat = "INSERT INTO categories (name, description) VALUES (?, ?)";
            try (PreparedStatement ps = con.prepareStatement(insertCat)) {
                for (String cat : categoriesList) {
                    ps.setString(1, cat);
                    ps.setString(2, "Telas de alta calidad tipo " + cat);
                    ps.executeUpdate();
                }
            }

            // ── 3. Productos ─────────────────────────────────────────
            System.out.println("[4/12] Insertando productos...");
            String insertProd = "INSERT INTO products (name, category_id, price, seller_id, description, material, width, weight, care, stock, featured, active, moderation_status) " +
                               "VALUES (?, (SELECT id FROM categories WHERE name = ? LIMIT 1), ?, " +
                               "(SELECT id FROM users WHERE email = ? LIMIT 1), ?, ?, ?, ?, ?, ?, ?, true, 'approved')";

            Object[][] productsList = {
                {"Algodon Premium",  "Algodon", 25000.0, "vendedor@ddtextil.com",        "Tela de algodon 100% natural, ideal para camisas y blusas.", "Algodon 100%",   "1.50m", "150g/m2", "Lavar en frio, no blanquear",    100, true},
                {"Seda Italiana",    "Seda",    85000.0, "vendedor@ddtextil.com",        "Seda pura con acabado brillante, perfecta para vestidos de gala.", "Seda pura",  "1.40m", "80g/m2",  "Limpieza en seco unicamente",     50, true},
                {"Lino Organico",    "Lino",    45000.0, "maria.gonzalez@ddtextil.com",  "Lino fresco y transpirable para ropa de verano.", "Lino organico",              "1.50m", "200g/m2", "No usar secadora",                80, false},
                {"Lana Merino",      "Lana",    65000.0, "maria.gonzalez@ddtextil.com",  "Lana suave y calida, ideal para abrigos de invierno.", "Lana merino",            "1.60m", "300g/m2", "Lavar a mano con agua tibia",     30, true},
                {"Dril Elastico",    "Algodon", 35000.0, "ana.martinez@ddtextil.com",    "Dril resistente con toque de elasticidad para pantalones.", "Algodon/Lycra 95/5", "1.50m", "250g/m2", "Lavar a maquina en ciclo suave", 120, false},
                {"Gasa de Seda",     "Seda",    72000.0, "ana.martinez@ddtextil.com",    "Gasa ligera y transparente para panuelos y cortinas.", "Seda/Poliester",         "1.40m", "45g/m2",  "Lavar a mano",                    60, true},
                {"Tela Polar",       "Poliester",22000.0,"vendedor@ddtextil.com",        "Tela polar suave para cobijas y chaquetas.", "Poliester 100%",                   "1.50m", "280g/m2", "Lavar a maquina, no planchar",   150, false},
                {"Oxford Camisa",    "Algodon", 38000.0, "maria.gonzalez@ddtextil.com",  "Tela oxford clasica para camisas formales.", "Algodon peinado",                 "1.50m", "130g/m2", "Planchar a temperatura media",    90, false},
            };

            try (PreparedStatement ps = con.prepareStatement(insertProd, Statement.RETURN_GENERATED_KEYS)) {
                String[] imageUrls = {
                    "https://images.unsplash.com/photo-1558171813-4c088753af8f?auto=format&fit=crop&q=80&w=800",
                    "https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?auto=format&fit=crop&q=80&w=800",
                    "https://images.unsplash.com/photo-1606722590583-6951b5ea92ad?auto=format&fit=crop&q=80&w=800",
                    "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?auto=format&fit=crop&q=80&w=800",
                    "https://images.unsplash.com/photo-1620799139834-6b8f844fbe61?auto=format&fit=crop&q=80&w=800",
                    "https://images.unsplash.com/photo-1553531384-397c80973a0b?auto=format&fit=crop&q=80&w=800",
                    "https://images.unsplash.com/photo-1558171813-4c088753af8f?auto=format&fit=crop&q=80&w=800",
                    "https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?auto=format&fit=crop&q=80&w=800"
                };

                for (int i = 0; i < productsList.length; i++) {
                    Object[] p = productsList[i];
                    ps.setString(1, (String)p[0]);
                    ps.setString(2, (String)p[1]);
                    ps.setDouble(3, (Double)p[2]);
                    ps.setString(4, (String)p[3]);
                    ps.setString(5, (String)p[4]);
                    ps.setString(6, (String)p[5]);
                    ps.setString(7, (String)p[6]);
                    ps.setString(8, (String)p[7]);
                    ps.setString(9, (String)p[8]);
                    ps.setInt(10, (Integer)p[9]);
                    ps.setBoolean(11, (Boolean)p[10]);
                    ps.executeUpdate();

                    try (var rs = ps.getGeneratedKeys()) {
                        if (rs.next()) {
                            int prodId = rs.getInt(1);
                            String insertImg = "INSERT INTO product_images (product_id, image_url, display_order) VALUES (?, ?, 0)";
                            try (PreparedStatement psImg = con.prepareStatement(insertImg)) {
                                psImg.setInt(1, prodId);
                                psImg.setString(2, imageUrls[i]);
                                psImg.executeUpdate();
                            }
                        }
                    }
                }
            }

            // ── 4. Pedidos y Order Items ─────────────────────────────
            System.out.println("[5/12] Insertando pedidos...");
            String insertOrder = "INSERT INTO orders (client_id, seller_id, total, status, order_date) VALUES (" +
                "(SELECT id FROM users WHERE email = ?), " +
                "(SELECT id FROM users WHERE email = ?), ?, ?, CURRENT_TIMESTAMP - (? || ' days')::INTERVAL)";
            String insertItem = "INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES (?, (SELECT id FROM products WHERE name = ? LIMIT 1), ?, ?)";

            Object[][] ordersList = {
                {"cliente@ddtextil.com", "vendedor@ddtextil.com",  75000.0, "delivered", 15},
                {"cliente@ddtextil.com", "maria.gonzalez@ddtextil.com", 130000.0, "delivered", 10},
                {"laura.sanchez@email.com", "ana.martinez@ddtextil.com", 35000.0, "shipped", 3},
                {"laura.sanchez@email.com", "vendedor@ddtextil.com", 85000.0, "processing", 1},
                {"cliente@ddtextil.com", "ana.martinez@ddtextil.com", 72000.0, "pending", 0},
            };
            String[][] orderItems = {
                {"Algodon Premium", "2", "25000.0", "Seda Italiana", "1", "85000.0"},   // order 1: 2 items
                {"Lana Merino", "2", "65000.0"},                                          // order 2
                {"Dril Elastico", "1", "35000.0"},                                        // order 3
                {"Seda Italiana", "1", "85000.0"},                                        // order 4
                {"Gasa de Seda", "1", "72000.0"},                                         // order 5
            };

            try (PreparedStatement psOrder = con.prepareStatement(insertOrder, Statement.RETURN_GENERATED_KEYS)) {
                for (int i = 0; i < ordersList.length; i++) {
                    Object[] o = ordersList[i];
                    psOrder.setString(1, (String)o[0]);
                    psOrder.setString(2, (String)o[1]);
                    psOrder.setDouble(3, (Double)o[2]);
                    psOrder.setString(4, (String)o[3]);
                    psOrder.setInt(5, (Integer)o[4]);
                    psOrder.executeUpdate();

                    try (var rs = psOrder.getGeneratedKeys()) {
                        if (rs.next()) {
                            int orderId = rs.getInt(1);
                            String[] items = orderItems[i];
                            try (PreparedStatement psItem = con.prepareStatement(insertItem)) {
                                for (int j = 0; j < items.length; j += 3) {
                                    psItem.setInt(1, orderId);
                                    psItem.setString(2, items[j]);
                                    psItem.setInt(3, Integer.parseInt(items[j+1]));
                                    psItem.setDouble(4, Double.parseDouble(items[j+2]));
                                    psItem.executeUpdate();
                                }
                            }
                        }
                    }
                }
            }

            // ── 5. Cupones ───────────────────────────────────────────
            System.out.println("[6/12] Insertando cupones...");
            String insertCoupon = "INSERT INTO coupons (code, discount_type, discount_value, expires_at, min_purchase, max_uses, first_time_only, active) VALUES (?, ?, ?, CURRENT_TIMESTAMP + (? || ' days')::INTERVAL, ?, ?, ?, true)";
            try (PreparedStatement ps = con.prepareStatement(insertCoupon)) {
                // Cupon 1: 10% descuento
                ps.setString(1, "BIENVENIDO10");
                ps.setString(2, "percentage");
                ps.setDouble(3, 10.0);
                ps.setInt(4, 90);
                ps.setDouble(5, 50000);
                ps.setInt(6, 100);
                ps.setBoolean(7, true);
                ps.executeUpdate();

                // Cupon 2: $15.000 de descuento
                ps.setString(1, "PROMO15K");
                ps.setString(2, "fixed");
                ps.setDouble(3, 15000.0);
                ps.setInt(4, 30);
                ps.setDouble(5, 100000);
                ps.setInt(6, 50);
                ps.setBoolean(7, false);
                ps.executeUpdate();

                // Cupon 3: 20% descuento
                ps.setString(1, "TELAS20");
                ps.setString(2, "percentage");
                ps.setDouble(3, 20.0);
                ps.setInt(4, 60);
                ps.setDouble(5, 150000);
                ps.setInt(6, 30);
                ps.setBoolean(7, false);
                ps.executeUpdate();
            }

            // ── 6. Ventas Diarias (ultimos 30 dias) ──────────────────
            System.out.println("[7/12] Insertando ventas diarias...");
            Random rand = new Random(42); // Semilla fija para reproducibilidad
            String insertDaily = "INSERT INTO daily_sales (sale_date, total_sales, total_orders) VALUES (?, ?, ?)";
            try (PreparedStatement ps = con.prepareStatement(insertDaily)) {
                LocalDate today = LocalDate.now();
                for (int i = 30; i >= 0; i--) {
                    ps.setDate(1, java.sql.Date.valueOf(today.minusDays(i)));
                    ps.setDouble(2, 500000 + (3000000 * rand.nextDouble()));
                    ps.setInt(3, 5 + rand.nextInt(40));
                    ps.executeUpdate();
                }
            }

            // ── 7. Ventas por Region ─────────────────────────────────
            System.out.println("[8/12] Insertando ventas regionales...");
            String insertRegion = "INSERT INTO region_sales (department, capital, sales, orders) VALUES (?, ?, ?, ?)";
            try (PreparedStatement ps = con.prepareStatement(insertRegion)) {
                String[][] regions = {
                    {"Antioquia", "Medellin"},
                    {"Cundinamarca", "Bogota"},
                    {"Valle del Cauca", "Cali"},
                    {"Atlantico", "Barranquilla"},
                    {"Santander", "Bucaramanga"},
                    {"Bolivar", "Cartagena"},
                    {"Norte de Santander", "Cucuta"},
                    {"Tolima", "Ibague"}
                };
                for (String[] r : regions) {
                    ps.setString(1, r[0]);
                    ps.setString(2, r[1]);
                    ps.setDouble(3, 5000000 + (45000000 * rand.nextDouble()));
                    ps.setInt(4, 30 + rand.nextInt(200));
                    ps.executeUpdate();
                }
            }

            // ── 8. Actividad Reciente ────────────────────────────────
            System.out.println("[9/12] Insertando actividad reciente...");
            String insertActivity = "INSERT INTO recent_activity (type, user_id, user_name, action, amount, icon) VALUES (?, ?, ?, ?, ?, ?)";
            try (PreparedStatement ps = con.prepareStatement(insertActivity)) {
                Object[][] activities = {
                    {"sale",   1, "Anderson Moreno",   "Venta de Algodon Premium x50m",       450000.0, "ShoppingBag"},
                    {"user",   5, "Cliente Demo",      "Se registro como nuevo cliente",       null,     "UserPlus"},
                    {"system", 0, "Sistema",           "Alerta de stock bajo: Lana Merino",    null,     "AlertTriangle"},
                    {"sale",   6, "Laura Sanchez",     "Compra de Seda Italiana x3m",          255000.0, "ShoppingBag"},
                    {"waste",  2, "Carlos Rodriguez",  "Reporto merma por humedad en bodega",  15.0,     "Trash2"},
                    {"order",  5, "Cliente Demo",      "Pedido #1001 entregado exitosamente",  75000.0,  "Package"},
                };
                for (Object[] a : activities) {
                    ps.setString(1, (String)a[0]);
                    ps.setInt(2, (Integer)a[1]);
                    ps.setString(3, (String)a[2]);
                    ps.setString(4, (String)a[3]);
                    if (a[4] != null) ps.setDouble(5, (Double)a[4]);
                    else ps.setNull(5, java.sql.Types.NUMERIC);
                    ps.setString(6, (String)a[5]);
                    ps.executeUpdate();
                }
            }

            // ── 9. Lotes de Inventario ───────────────────────────────
            System.out.println("[10/12] Insertando inventario y mermas...");
            String insertBatch = "INSERT INTO inventory_batches (id, fabric_type, supplier, initial_meters, current_meters, status) VALUES (?, ?, ?, ?, ?, ?)";
            try (PreparedStatement ps = con.prepareStatement(insertBatch)) {
                Object[][] batches = {
                    {"BTN-2026-01", "Algodon Premium",  "Textiles Andinos S.A.",  500.0, 420.5, "active"},
                    {"BTN-2026-02", "Seda Italiana",    "Importaciones Milan",    200.0,  15.0, "low_stock"},
                    {"BTN-2026-03", "Lino Organico",    "EcoTextil Colombia",     300.0,   0.0, "depleted"},
                    {"BTN-2026-04", "Lana Merino",      "Lanera del Sur",         150.0, 120.0, "active"},
                    {"BTN-2026-05", "Dril Elastico",    "Drilones Industriales",  400.0, 380.0, "active"},
                };
                for (Object[] b : batches) {
                    ps.setString(1, (String)b[0]);
                    ps.setString(2, (String)b[1]);
                    ps.setString(3, (String)b[2]);
                    ps.setDouble(4, (Double)b[3]);
                    ps.setDouble(5, (Double)b[4]);
                    ps.setString(6, (String)b[5]);
                    ps.executeUpdate();
                }
            }

            // Mermas
            String insertWaste = "INSERT INTO waste_events (batch_id, meters, reason, description, responsible, user_id) VALUES (?, ?, ?, ?, ?, ?)";
            try (PreparedStatement ps = con.prepareStatement(insertWaste)) {
                ps.setString(1, "BTN-2026-01"); ps.setDouble(2, 5.5); ps.setString(3, "Humedad");
                ps.setString(4, "Goteras en bodega B afectaron rollo principal"); ps.setString(5, "Anderson Moreno"); ps.setInt(6, 1);
                ps.executeUpdate();

                ps.setString(1, "BTN-2026-02"); ps.setDouble(2, 2.0); ps.setString(3, "Corte defectuoso");
                ps.setString(4, "Cortes defectuosos de fabrica"); ps.setString(5, "Carlos Rodriguez"); ps.setInt(6, 2);
                ps.executeUpdate();

                ps.setString(1, "BTN-2026-03"); ps.setDouble(2, 10.0); ps.setString(3, "Decoloracion");
                ps.setString(4, "Exposicion solar prolongada en almacen"); ps.setString(5, "Maria Gonzalez"); ps.setInt(6, 3);
                ps.executeUpdate();
            }

            // Umbrales de stock
            String insertThreshold = "INSERT INTO stock_thresholds (fabric_type, min_meters, alert_enabled) VALUES (?, ?, ?)";
            try (PreparedStatement ps = con.prepareStatement(insertThreshold)) {
                Object[][] thresholds = {
                    {"Algodon Premium",  20.0, true},
                    {"Seda Italiana",    15.0, true},
                    {"Lino Organico",    25.0, true},
                    {"Lana Merino",      10.0, true},
                    {"Dril Elastico",    30.0, true},
                };
                for (Object[] t : thresholds) {
                    ps.setString(1, (String)t[0]);
                    ps.setDouble(2, (Double)t[1]);
                    ps.setBoolean(3, (Boolean)t[2]);
                    ps.executeUpdate();
                }
            }

            // ── 10. Tickets de Soporte ───────────────────────────────
            System.out.println("[11/12] Insertando tickets y bug reports...");
            String insertTicket = "INSERT INTO support_tickets (user_id, user_name, user_email, subject, description, status, priority) VALUES " +
                                  "((SELECT id FROM users WHERE email = ?), ?, ?, ?, ?, ?, ?)";
            try (PreparedStatement ps = con.prepareStatement(insertTicket)) {
                ps.setString(1, "cliente@ddtextil.com"); ps.setString(2, "Cliente Demo"); ps.setString(3, "cliente@ddtextil.com");
                ps.setString(4, "Producto llego danado"); ps.setString(5, "La tela Algodon Premium llego con manchas de humedad.");
                ps.setString(6, "open"); ps.setString(7, "high");
                ps.executeUpdate();

                ps.setString(1, "laura.sanchez@email.com"); ps.setString(2, "Laura Sanchez"); ps.setString(3, "laura.sanchez@email.com");
                ps.setString(4, "Demora en el envio"); ps.setString(5, "Mi pedido lleva 5 dias y no ha llegado.");
                ps.setString(6, "in_progress"); ps.setString(7, "medium");
                ps.executeUpdate();

                ps.setString(1, "cliente@ddtextil.com"); ps.setString(2, "Cliente Demo"); ps.setString(3, "cliente@ddtextil.com");
                ps.setString(4, "Consulta sobre tallas"); ps.setString(5, "Necesito saber el ancho exacto de la Seda Italiana.");
                ps.setString(6, "resolved"); ps.setString(7, "low");
                ps.executeUpdate();
            }

            // Bug Reports
            String insertBug = "INSERT INTO bug_reports (seller_id, seller_name, area, description, steps, status, priority) VALUES " +
                                "((SELECT id FROM users WHERE email = ?), ?, ?, ?, ?, ?, ?)";
            try (PreparedStatement ps = con.prepareStatement(insertBug)) {
                ps.setString(1, "vendedor@ddtextil.com"); ps.setString(2, "Carlos Rodriguez"); ps.setString(3, "Dashboard Vendedor");
                ps.setString(4, "El grafico de ventas no carga"); ps.setString(5, "1. Ir a Dashboard\n2. Ver seccion Ventas\n3. El grafico queda en blanco");
                ps.setString(6, "new"); ps.setString(7, "medium");
                ps.executeUpdate();

                ps.setString(1, "maria.gonzalez@ddtextil.com"); ps.setString(2, "Maria Gonzalez"); ps.setString(3, "Gestion de Productos");
                ps.setString(4, "No puedo subir imagenes mayores a 2MB"); ps.setString(5, "1. Editar producto\n2. Subir imagen de 3MB\n3. Error sin mensaje");
                ps.setString(6, "in_progress"); ps.setString(7, "high");
                ps.executeUpdate();
            }

            // ── 11. Banner Global ────────────────────────────────────
            System.out.println("[12/12] Insertando banner y config...");
            String insertBanner = "INSERT INTO global_banner (enabled, message, banner_type) VALUES (?, ?, ?)";
            try (PreparedStatement ps = con.prepareStatement(insertBanner)) {
                ps.setBoolean(1, false);
                ps.setString(2, "Envio gratis en compras superiores a $200.000");
                ps.setString(3, "info");
                ps.executeUpdate();
            }

            // Config del sistema
            String insertConfig = "INSERT INTO system_config (key, value) VALUES (?, ?) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value";
            try (PreparedStatement ps = con.prepareStatement(insertConfig)) {
                ps.setString(1, "system_config");
                ps.setString(2, "{\"siteName\":\"D&D Textil\",\"defaultDarkMode\":false,\"primaryColor\":\"#8B5CF6\",\"secondaryColor\":\"#EC4899\",\"accentColor\":\"#F59E0B\",\"taxRate\":0.19,\"shippingCost\":15000,\"freeShippingThreshold\":200000,\"lowStockThreshold\":20,\"maintenanceMode\":false}");
                ps.executeUpdate();
            }

            con.commit();
            System.out.println("\n=== Todos los datos insertados correctamente ===");
            System.out.println("Credenciales de acceso:");
            System.out.println("  Admin:    admin@ddtextil.com / admin123");
            System.out.println("  Vendedor: vendedor@ddtextil.com / vendedor123");
            System.out.println("  Cliente:  cliente@ddtextil.com / cliente123");

        } catch (Exception e) {
            System.err.println("ERROR: " + e.getMessage());
            e.printStackTrace();
            try { con.rollback(); } catch (SQLException ex) { ex.printStackTrace(); }
        }
    }
}
