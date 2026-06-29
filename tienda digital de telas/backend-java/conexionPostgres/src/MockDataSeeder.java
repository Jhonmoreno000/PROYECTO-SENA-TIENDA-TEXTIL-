// Importa la interfaz Connection de JDBC para gestionar la conexión con la base de datos PostgreSQL
import java.sql.Connection;
// Importa PreparedStatement para ejecutar consultas SQL parametrizadas de forma segura
import java.sql.PreparedStatement;
// Importa Statement para ejecutar sentencias SQL sin parámetros, como TRUNCATE
import java.sql.Statement;
// Importa SQLException para manejar errores específicos de la base de datos
import java.sql.SQLException;
// Importa MessageDigest del paquete de seguridad para generar hashes SHA-256 de las contraseñas
import java.security.MessageDigest;
// Importa NoSuchAlgorithmException para capturar la ausencia del algoritmo de hash en el entorno JVM
import java.security.NoSuchAlgorithmException;
// Importa la clase Conexion del paquete infrastructure.config que provee la conexión a la base de datos
import infrastructure.config.Conexion;
// Importa Random para generar valores aleatorios reproducibles en las ventas diarias y regionales
import java.util.Random;
// Importa LocalDate del paquete java.time para manejar fechas sin componente de hora (ventas diarias)
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
            // Obtiene una instancia del algoritmo MessageDigest para SHA-256
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            // Convierte la contraseña en bytes y los pasa al digestor para su procesamiento
            md.update(password.getBytes());
            // Calcula el hash y obtiene el arreglo de bytes resultante (32 bytes para SHA-256)
            byte[] digest = md.digest();
            // Crea un StringBuilder para construir la representación hexadecimal del hash
            StringBuilder sb = new StringBuilder();
            // Recorre cada byte del arreglo digest para convertirlo a hexadecimal
            for (byte b : digest) {
                // Convierte el byte a cadena hexadecimal de dos caracteres y lo agrega al StringBuilder
                sb.append(String.format("%02x", b));
            }
            // Retorna la representación hexadecimal completa del hash SHA-256
            return sb.toString();
        // Captura la excepción si el algoritmo SHA-256 no está disponible en el entorno JVM
        } catch (NoSuchAlgorithmException e) {
            // Lanza una excepción RuntimeException indicando que el sistema criptográfico falló
            throw new RuntimeException("SHA-256 no disponible", e);
        }
    }

    // Método principal que ejecuta el proceso de inserción masiva de datos de prueba
    public static void main(String[] args) {
        // Imprime un encabezado indicando que el seeder de datos ha comenzado su ejecución
        System.out.println("=== Iniciando Seeder de Datos ===");

        // Obtiene una conexión activa a la base de datos PostgreSQL mediante la clase Conexion
        Connection con = Conexion.getConnection();
        // Verifica si la conexión es nula (no se pudo establecer conexión con la base de datos)
        if (con == null) {
            // Imprime un mensaje de error en la salida estándar de error indicando fallo de conexión
            System.err.println("ERROR: No se pudo conectar a la base de datos.");
            // Finaliza la ejecución del método main si no hay conexión disponible
            return;
        }

        try {
            // Desactiva el modo de auto-commit para manejar manualmente la transacción (atómica)
            con.setAutoCommit(false);  // Transaccion atomica
            // Crea un objeto Statement para ejecutar sentencias SQL sin parámetros
            Statement stmt = con.createStatement();

            // ── 0. Limpiar datos anteriores ──────────────────────────
            // Imprime el progreso indicando que se está en el paso 1 de 12: limpieza de datos previos
            System.out.println("[1/12] Limpiando datos anteriores...");
            // Ejecuta TRUNCATE en waste_events y otras tablas secundarias con CASCADE para eliminar dependencias
            stmt.executeUpdate("TRUNCATE TABLE waste_events, order_items, cart_items, coupon_categories, product_images, bug_reports, support_tickets, daily_sales, region_sales, recent_activity CASCADE");
            // Ejecuta TRUNCATE en la tabla orders con CASCADE para eliminar registros relacionados
            stmt.executeUpdate("TRUNCATE TABLE orders CASCADE");
            // Ejecuta TRUNCATE en la tabla products con CASCADE para eliminar referencias
            stmt.executeUpdate("TRUNCATE TABLE products CASCADE");
            // Ejecuta TRUNCATE en la tabla coupons con CASCADE para limpiar cupones existentes
            stmt.executeUpdate("TRUNCATE TABLE coupons CASCADE");
            // Ejecuta TRUNCATE en la tabla inventory_batches con CASCADE para limpiar lotes de inventario
            stmt.executeUpdate("TRUNCATE TABLE inventory_batches CASCADE");
            // Ejecuta TRUNCATE en la tabla categories con CASCADE para eliminar categorías previas
            stmt.executeUpdate("TRUNCATE TABLE categories CASCADE");
            // Ejecuta TRUNCATE en la tabla stock_thresholds con CASCADE para limpiar umbrales de stock
            stmt.executeUpdate("TRUNCATE TABLE stock_thresholds CASCADE");
            // Ejecuta TRUNCATE en la tabla global_banner con CASCADE para limpiar el banner global
            stmt.executeUpdate("TRUNCATE TABLE global_banner CASCADE");
            // Ejecuta TRUNCATE en la tabla system_config con CASCADE para limpiar configuración del sistema
            stmt.executeUpdate("TRUNCATE TABLE system_config CASCADE");
            // Ejecuta TRUNCATE en la tabla users con CASCADE para eliminar todos los usuarios registrados
            stmt.executeUpdate("TRUNCATE TABLE users CASCADE");

            // ── 1. Usuarios ──────────────────────────────────────────
            // Imprime el progreso indicando que se está insertando los usuarios de prueba
            System.out.println("[2/12] Insertando usuarios...");
            // Define la sentencia SQL parametrizada para insertar un nuevo usuario en la tabla users
            String insertUser = "INSERT INTO users (name, email, password_hash, role, active, commission_rate) VALUES (?, ?, ?, ?, true, ?)";
            // Crea un PreparedStatement con la consulta de inserción dentro de un bloque try-with-resources
            try (PreparedStatement ps = con.prepareStatement(insertUser)) {
                // Admin (CREDENCIALES.md: admin@ddtextil.com / admin123)
                // Establece el nombre del usuario administrador como primer parámetro de la consulta
                ps.setString(1, "Anderson Moreno");
                // Establece el correo electrónico del administrador como segundo parámetro
                ps.setString(2, "admin@ddtextil.com");
                // Calcula y establece el hash SHA-256 de la contraseña "admin123" como tercer parámetro
                ps.setString(3, hashPassword("admin123"));
                // Establece el rol del usuario como "administrador" en el cuarto parámetro
                ps.setString(4, "administrador");
                // Establece el quinto parámetro (commission_rate) como nulo porque el admin no tiene comisión
                ps.setNull(5, java.sql.Types.NUMERIC);
                // Ejecuta la inserción del usuario administrador en la base de datos
                ps.executeUpdate();

                // Vendedor 1 (CREDENCIALES.md: vendedor@ddtextil.com / vendedor123)
                // Establece el nombre del primer vendedor como parámetro de la consulta
                ps.setString(1, "Carlos Rodriguez");
                // Establece el correo del primer vendedor como parámetro de la consulta
                ps.setString(2, "vendedor@ddtextil.com");
                // Calcula y establece el hash SHA-256 de la contraseña "vendedor123" como parámetro
                ps.setString(3, hashPassword("vendedor123"));
                // Establece el rol del usuario como "vendedor" en el cuarto parámetro
                ps.setString(4, "vendedor");
                // Establece la tasa de comisión del vendedor en 8.5% como quinto parámetro
                ps.setDouble(5, 8.5);
                // Ejecuta la inserción del primer vendedor en la base de datos
                ps.executeUpdate();

                // Vendedor 2
                // Establece el nombre del segundo vendedor como parámetro de la consulta
                ps.setString(1, "Maria Gonzalez");
                // Establece el correo del segundo vendedor como parámetro de la consulta
                ps.setString(2, "maria.gonzalez@ddtextil.com");
                // Reutiliza el hash de "vendedor123" para el segundo vendedor
                ps.setString(3, hashPassword("vendedor123"));
                // Establece el rol del segundo vendedor como "vendedor"
                ps.setString(4, "vendedor");
                // Establece la tasa de comisión del segundo vendedor en 10.0%
                ps.setDouble(5, 10.0);
                // Ejecuta la inserción del segundo vendedor en la base de datos
                ps.executeUpdate();

                // Vendedor 3
                // Establece el nombre del tercer vendedor como parámetro de la consulta
                ps.setString(1, "Ana Martinez");
                // Establece el correo del tercer vendedor como parámetro de la consulta
                ps.setString(2, "ana.martinez@ddtextil.com");
                // Reutiliza el hash de "vendedor123" para el tercer vendedor
                ps.setString(3, hashPassword("vendedor123"));
                // Establece el rol del tercer vendedor como "vendedor"
                ps.setString(4, "vendedor");
                // Establece la tasa de comisión del tercer vendedor en 7.0%
                ps.setDouble(5, 7.0);
                // Ejecuta la inserción del tercer vendedor en la base de datos
                ps.executeUpdate();

                // Cliente 1 (CREDENCIALES.md: cliente@ddtextil.com / cliente123)
                // Establece el nombre del primer cliente de demostración como parámetro
                ps.setString(1, "Cliente Demo");
                // Establece el correo del primer cliente como parámetro de la consulta
                ps.setString(2, "cliente@ddtextil.com");
                // Calcula y establece el hash SHA-256 de la contraseña "cliente123" como parámetro
                ps.setString(3, hashPassword("cliente123"));
                // Establece el rol del usuario como "cliente" en el cuarto parámetro
                ps.setString(4, "cliente");
                // Establece el quinto parámetro (commission_rate) como nulo porque los clientes no tienen comisión
                ps.setNull(5, java.sql.Types.NUMERIC);
                // Ejecuta la inserción del primer cliente en la base de datos
                ps.executeUpdate();

                // Cliente 2
                // Establece el nombre del segundo cliente como parámetro de la consulta
                ps.setString(1, "Laura Sanchez");
                // Establece el correo del segundo cliente como parámetro de la consulta
                ps.setString(2, "laura.sanchez@email.com");
                // Reutiliza el hash de "cliente123" para el segundo cliente
                ps.setString(3, hashPassword("cliente123"));
                // Establece el rol del segundo cliente como "cliente"
                ps.setString(4, "cliente");
                // Establece el quinto parámetro como nulo porque los clientes no tienen comisión
                ps.setNull(5, java.sql.Types.NUMERIC);
                // Ejecuta la inserción del segundo cliente en la base de datos
                ps.executeUpdate();
            }

            // ── 2. Categorias ────────────────────────────────────────
            // Imprime el progreso indicando que se están insertando las categorías de productos
            System.out.println("[3/12] Insertando categorias...");
            // Define un arreglo con los nombres de las cinco categorías de tela disponibles
            String[] categoriesList = {"Algodon", "Seda", "Lino", "Lana", "Poliester"};
            // Define la sentencia SQL parametrizada para insertar una categoría con nombre y descripción
            String insertCat = "INSERT INTO categories (name, description) VALUES (?, ?)";
            // Crea un PreparedStatement para insertar categorías dentro de un bloque try-with-resources
            try (PreparedStatement ps = con.prepareStatement(insertCat)) {
                // Itera sobre cada nombre de categoría en el arreglo categoriesList
                for (String cat : categoriesList) {
                    // Establece el nombre de la categoría actual como primer parámetro
                    ps.setString(1, cat);
                    // Establece una descripción genérica de alta calidad para la categoría actual
                    ps.setString(2, "Telas de alta calidad tipo " + cat);
                    // Ejecuta la inserción de la categoría en la base de datos
                    ps.executeUpdate();
                }
            }

            // ── 3. Productos ─────────────────────────────────────────
            // Imprime el progreso indicando que se están insertando los productos de prueba
            System.out.println("[4/12] Insertando productos...");
            // Define la consulta SQL parametrizada para insertar un producto con subconsultas de categoría y vendedor
            String insertProd = "INSERT INTO products (name, category_id, price, seller_id, description, material, width, weight, care, stock, featured, active, moderation_status) " +
                               "VALUES (?, (SELECT id FROM categories WHERE name = ? LIMIT 1), ?, " +
                               "(SELECT id FROM users WHERE email = ? LIMIT 1), ?, ?, ?, ?, ?, ?, ?, true, 'approved')";

            // Define una matriz de objetos con los datos de los ocho productos de muestra
            Object[][] productsList = {
                // Nombre, Categoría, Precio, Vendedor, Descripción, Material, Ancho, Peso, Cuidados, Stock, Destacado
                {"Algodon Premium",  "Algodon", 25000.0, "vendedor@ddtextil.com",        "Tela de algodon 100% natural, ideal para camisas y blusas.", "Algodon 100%",   "1.50m", "150g/m2", "Lavar en frio, no blanquear",    100, true},
                {"Seda Italiana",    "Seda",    85000.0, "vendedor@ddtextil.com",        "Seda pura con acabado brillante, perfecta para vestidos de gala.", "Seda pura",  "1.40m", "80g/m2",  "Limpieza en seco unicamente",     50, true},
                {"Lino Organico",    "Lino",    45000.0, "maria.gonzalez@ddtextil.com",  "Lino fresco y transpirable para ropa de verano.", "Lino organico",              "1.50m", "200g/m2", "No usar secadora",                80, false},
                {"Lana Merino",      "Lana",    65000.0, "maria.gonzalez@ddtextil.com",  "Lana suave y calida, ideal para abrigos de invierno.", "Lana merino",            "1.60m", "300g/m2", "Lavar a mano con agua tibia",     30, true},
                {"Dril Elastico",    "Algodon", 35000.0, "ana.martinez@ddtextil.com",    "Dril resistente con toque de elasticidad para pantalones.", "Algodon/Lycra 95/5", "1.50m", "250g/m2", "Lavar a maquina en ciclo suave", 120, false},
                {"Gasa de Seda",     "Seda",    72000.0, "ana.martinez@ddtextil.com",    "Gasa ligera y transparente para panuelos y cortinas.", "Seda/Poliester",         "1.40m", "45g/m2",  "Lavar a mano",                    60, true},
                {"Tela Polar",       "Poliester",22000.0,"vendedor@ddtextil.com",        "Tela polar suave para cobijas y chaquetas.", "Poliester 100%",                   "1.50m", "280g/m2", "Lavar a maquina, no planchar",   150, false},
                {"Oxford Camisa",    "Algodon", 38000.0, "maria.gonzalez@ddtextil.com",  "Tela oxford clasica para camisas formales.", "Algodon peinado",                 "1.50m", "130g/m2", "Planchar a temperatura media",    90, false},
            };

            // Crea un PreparedStatement para insertar productos solicitando las claves generadas automáticamente
            try (PreparedStatement ps = con.prepareStatement(insertProd, Statement.RETURN_GENERATED_KEYS)) {
                // Define un arreglo con las URLs de imágenes de Unsplash para cada producto
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

                // Itera sobre cada producto en la lista de productos para insertarlos uno por uno
                for (int i = 0; i < productsList.length; i++) {
                    // Obtiene el arreglo de datos del producto en la posición actual
                    Object[] p = productsList[i];
                    // Establece el nombre del producto como primer parámetro de la consulta
                    ps.setString(1, (String)p[0]);
                    // Establece el nombre de la categoría como segundo parámetro (subconsulta)
                    ps.setString(2, (String)p[1]);
                    // Establece el precio del producto como tercer parámetro
                    ps.setDouble(3, (Double)p[2]);
                    // Establece el correo del vendedor como cuarto parámetro (subconsulta)
                    ps.setString(4, (String)p[3]);
                    // Establece la descripción del producto como quinto parámetro
                    ps.setString(5, (String)p[4]);
                    // Establece el material del producto como sexto parámetro
                    ps.setString(6, (String)p[5]);
                    // Establece el ancho de la tela como séptimo parámetro
                    ps.setString(7, (String)p[6]);
                    // Establece el peso de la tela como octavo parámetro
                    ps.setString(8, (String)p[7]);
                    // Establece las instrucciones de cuidado como noveno parámetro
                    ps.setString(9, (String)p[8]);
                    // Establece la cantidad en stock como décimo parámetro
                    ps.setInt(10, (Integer)p[9]);
                    // Establece el indicador de producto destacado como undécimo parámetro
                    ps.setBoolean(11, (Boolean)p[10]);
                    // Ejecuta la inserción del producto en la base de datos
                    ps.executeUpdate();

                    // Obtiene el ResultSet con las claves generadas automáticamente por la inserción
                    try (var rs = ps.getGeneratedKeys()) {
                        // Verifica si hay al menos una clave generada disponible en el ResultSet
                        if (rs.next()) {
                            // Obtiene el identificador numérico del producto recién insertado
                            int prodId = rs.getInt(1);
                            // Define la consulta SQL para insertar una imagen asociada al producto
                            String insertImg = "INSERT INTO product_images (product_id, image_url, display_order) VALUES (?, ?, 0)";
                            // Crea un PreparedStatement para insertar la imagen del producto
                            try (PreparedStatement psImg = con.prepareStatement(insertImg)) {
                                // Establece el identificador del producto como primer parámetro de la imagen
                                psImg.setInt(1, prodId);
                                // Establece la URL de la imagen correspondiente al producto actual
                                psImg.setString(2, imageUrls[i]);
                                // Ejecuta la inserción de la imagen en la base de datos
                                psImg.executeUpdate();
                            }
                        }
                    }
                }
            }

            // ── 4. Pedidos y Order Items ─────────────────────────────
            // Imprime el progreso indicando que se están insertando los pedidos de prueba
            System.out.println("[5/12] Insertando pedidos...");
            // Define la consulta SQL parametrizada para insertar un pedido con subconsultas de cliente y vendedor
            String insertOrder = "INSERT INTO orders (client_id, seller_id, total, status, order_date) VALUES (" +
                "(SELECT id FROM users WHERE email = ?), " +
                "(SELECT id FROM users WHERE email = ?), ?, ?, CURRENT_TIMESTAMP - (? || ' days')::INTERVAL)";
            // Define la consulta SQL parametrizada para insertar un ítem dentro de un pedido
            String insertItem = "INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES (?, (SELECT id FROM products WHERE name = ? LIMIT 1), ?, ?)";

            // Define una matriz con los datos de los cinco pedidos de muestra
            Object[][] ordersList = {
                // Cliente, Vendedor, Total, Estado, Días atrás
                {"cliente@ddtextil.com", "vendedor@ddtextil.com",  75000.0, "delivered", 15},
                {"cliente@ddtextil.com", "maria.gonzalez@ddtextil.com", 130000.0, "delivered", 10},
                {"laura.sanchez@email.com", "ana.martinez@ddtextil.com", 35000.0, "shipped", 3},
                {"laura.sanchez@email.com", "vendedor@ddtextil.com", 85000.0, "processing", 1},
                {"cliente@ddtextil.com", "ana.martinez@ddtextil.com", 72000.0, "pending", 0},
            };
            // Define una matriz con los ítems de cada pedido (nombre, cantidad, precio unitario)
            String[][] orderItems = {
                // Pedido 1: 2 productos diferentes
                {"Algodon Premium", "2", "25000.0", "Seda Italiana", "1", "85000.0"},
                // Pedido 2: 1 producto
                {"Lana Merino", "2", "65000.0"},
                // Pedido 3: 1 producto
                {"Dril Elastico", "1", "35000.0"},
                // Pedido 4: 1 producto
                {"Seda Italiana", "1", "85000.0"},
                // Pedido 5: 1 producto
                {"Gasa de Seda", "1", "72000.0"},
            };

            // Crea un PreparedStatement para insertar pedidos solicitando las claves generadas
            try (PreparedStatement psOrder = con.prepareStatement(insertOrder, Statement.RETURN_GENERATED_KEYS)) {
                // Itera sobre cada pedido en la lista de pedidos para insertarlos uno por uno
                for (int i = 0; i < ordersList.length; i++) {
                    // Obtiene el arreglo de datos del pedido en la posición actual
                    Object[] o = ordersList[i];
                    // Establece el correo del cliente como primer parámetro de la consulta
                    psOrder.setString(1, (String)o[0]);
                    // Establece el correo del vendedor como segundo parámetro de la consulta
                    psOrder.setString(2, (String)o[1]);
                    // Establece el total del pedido como tercer parámetro
                    psOrder.setDouble(3, (Double)o[2]);
                    // Establece el estado del pedido como cuarto parámetro
                    psOrder.setString(4, (String)o[3]);
                    // Establece los días atrás para calcular la fecha del pedido como quinto parámetro
                    psOrder.setInt(5, (Integer)o[4]);
                    // Ejecuta la inserción del pedido en la base de datos
                    psOrder.executeUpdate();

                    // Obtiene el ResultSet con la clave generada del pedido recién insertado
                    try (var rs = psOrder.getGeneratedKeys()) {
                        // Verifica si hay al menos una clave generada disponible
                        if (rs.next()) {
                            // Obtiene el identificador numérico del pedido recién insertado
                            int orderId = rs.getInt(1);
                            // Obtiene el arreglo de strings con los ítems del pedido actual
                            String[] items = orderItems[i];
                            // Crea un PreparedStatement para insertar los ítems del pedido
                            try (PreparedStatement psItem = con.prepareStatement(insertItem)) {
                                // Itera sobre los ítems en grupos de tres (nombre, cantidad, precio)
                                for (int j = 0; j < items.length; j += 3) {
                                    // Establece el identificador del pedido como primer parámetro
                                    psItem.setInt(1, orderId);
                                    // Establece el nombre del producto como segundo parámetro (subconsulta)
                                    psItem.setString(2, items[j]);
                                    // Convierte y establece la cantidad del producto como tercer parámetro
                                    psItem.setInt(3, Integer.parseInt(items[j+1]));
                                    // Convierte y establece el precio unitario como cuarto parámetro
                                    psItem.setDouble(4, Double.parseDouble(items[j+2]));
                                    // Ejecuta la inserción del ítem en la base de datos
                                    psItem.executeUpdate();
                                }
                            }
                        }
                    }
                }
            }

            // ── 5. Cupones ───────────────────────────────────────────
            // Imprime el progreso indicando que se están insertando los cupones de descuento
            System.out.println("[6/12] Insertando cupones...");
            // Define la consulta SQL parametrizada para insertar un cupón con fecha de expiración calculada
            String insertCoupon = "INSERT INTO coupons (code, discount_type, discount_value, expires_at, min_purchase, max_uses, first_time_only, active) VALUES (?, ?, ?, CURRENT_TIMESTAMP + (? || ' days')::INTERVAL, ?, ?, ?, true)";
            // Crea un PreparedStatement para insertar cupones dentro de un bloque try-with-resources
            try (PreparedStatement ps = con.prepareStatement(insertCoupon)) {
                // Cupon 1: 10% descuento
                // Establece el código del cupón "BIENVENIDO10" como primer parámetro
                ps.setString(1, "BIENVENIDO10");
                // Establece el tipo de descuento como "percentage" (porcentual) en el segundo parámetro
                ps.setString(2, "percentage");
                // Establece el valor del descuento en 10.0 como tercer parámetro
                ps.setDouble(3, 10.0);
                // Establece la vigencia del cupón en 90 días como cuarto parámetro
                ps.setInt(4, 90);
                // Establece la compra mínima requerida de $50.000 como quinto parámetro
                ps.setDouble(5, 50000);
                // Establece el número máximo de usos en 100 como sexto parámetro
                ps.setInt(6, 100);
                // Establece que el cupón es solo para primera compra (true) como séptimo parámetro
                ps.setBoolean(7, true);
                // Ejecuta la inserción del primer cupón en la base de datos
                ps.executeUpdate();

                // Cupon 2: $15.000 de descuento
                // Establece el código del cupón "PROMO15K" como primer parámetro
                ps.setString(1, "PROMO15K");
                // Establece el tipo de descuento como "fixed" (monto fijo) en el segundo parámetro
                ps.setString(2, "fixed");
                // Establece el valor del descuento en 15.000 como tercer parámetro
                ps.setDouble(3, 15000.0);
                // Establece la vigencia del cupón en 30 días como cuarto parámetro
                ps.setInt(4, 30);
                // Establece la compra mínima requerida de $100.000 como quinto parámetro
                ps.setDouble(5, 100000);
                // Establece el número máximo de usos en 50 como sexto parámetro
                ps.setInt(6, 50);
                // Establece que el cupón no es solo para primera compra (false) como séptimo parámetro
                ps.setBoolean(7, false);
                // Ejecuta la inserción del segundo cupón en la base de datos
                ps.executeUpdate();

                // Cupon 3: 20% descuento
                // Establece el código del cupón "TELAS20" como primer parámetro
                ps.setString(1, "TELAS20");
                // Establece el tipo de descuento como "percentage" en el segundo parámetro
                ps.setString(2, "percentage");
                // Establece el valor del descuento en 20.0 como tercer parámetro
                ps.setDouble(3, 20.0);
                // Establece la vigencia del cupón en 60 días como cuarto parámetro
                ps.setInt(4, 60);
                // Establece la compra mínima requerida de $150.000 como quinto parámetro
                ps.setDouble(5, 150000);
                // Establece el número máximo de usos en 30 como sexto parámetro
                ps.setInt(6, 30);
                // Establece que el cupón no es solo para primera compra (false) como séptimo parámetro
                ps.setBoolean(7, false);
                // Ejecuta la inserción del tercer cupón en la base de datos
                ps.executeUpdate();
            }

            // ── 6. Ventas Diarias (ultimos 30 dias) ──────────────────
            // Imprime el progreso indicando que se están insertando las ventas diarias simuladas
            System.out.println("[7/12] Insertando ventas diarias...");
            // Crea una instancia de Random con semilla fija 42 para garantizar reproducibilidad en los datos
            Random rand = new Random(42); // Semilla fija para reproducibilidad
            // Define la consulta SQL parametrizada para insertar un registro de venta diaria
            String insertDaily = "INSERT INTO daily_sales (sale_date, total_sales, total_orders) VALUES (?, ?, ?)";
            // Crea un PreparedStatement para insertar ventas diarias dentro de un bloque try-with-resources
            try (PreparedStatement ps = con.prepareStatement(insertDaily)) {
                // Obtiene la fecha actual del sistema para calcular el rango de fechas
                LocalDate today = LocalDate.now();
                // Itera desde 30 días atrás hasta hoy inclusive (31 registros en total)
                for (int i = 30; i >= 0; i--) {
                    // Convierte y establece la fecha restando i días a la fecha actual como primer parámetro
                    ps.setDate(1, java.sql.Date.valueOf(today.minusDays(i)));
                    // Genera un valor aleatorio de ventas entre $500.000 y $3.500.000 como segundo parámetro
                    ps.setDouble(2, 500000 + (3000000 * rand.nextDouble()));
                    // Genera un número aleatorio de pedidos entre 5 y 44 como tercer parámetro
                    ps.setInt(3, 5 + rand.nextInt(40));
                    // Ejecuta la inserción del registro de venta diaria en la base de datos
                    ps.executeUpdate();
                }
            }

            // ── 7. Ventas por Region ─────────────────────────────────
            // Imprime el progreso indicando que se están insertando las ventas regionales
            System.out.println("[8/12] Insertando ventas regionales...");
            // Define la consulta SQL parametrizada para insertar un registro de ventas por región
            String insertRegion = "INSERT INTO region_sales (department, capital, sales, orders) VALUES (?, ?, ?, ?)";
            // Crea un PreparedStatement para insertar ventas regionales dentro de un bloque try-with-resources
            try (PreparedStatement ps = con.prepareStatement(insertRegion)) {
                // Define una matriz con los nombres de departamentos y sus capitales correspondientes
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
                // Itera sobre cada región en la matriz de regiones para insertarlas una por una
                for (String[] r : regions) {
                    // Establece el nombre del departamento como primer parámetro
                    ps.setString(1, r[0]);
                    // Establece el nombre de la capital como segundo parámetro
                    ps.setString(2, r[1]);
                    // Genera un valor aleatorio de ventas entre $5.000.000 y $50.000.000 como tercer parámetro
                    ps.setDouble(3, 5000000 + (45000000 * rand.nextDouble()));
                    // Genera un número aleatorio de pedidos entre 30 y 229 como cuarto parámetro
                    ps.setInt(4, 30 + rand.nextInt(200));
                    // Ejecuta la inserción del registro de ventas regionales en la base de datos
                    ps.executeUpdate();
                }
            }

            // ── 8. Actividad Reciente ────────────────────────────────
            // Imprime el progreso indicando que se están insertando los registros de actividad reciente
            System.out.println("[9/12] Insertando actividad reciente...");
            // Define la consulta SQL parametrizada para insertar un registro de actividad reciente
            String insertActivity = "INSERT INTO recent_activity (type, user_id, user_name, action, amount, icon) VALUES (?, ?, ?, ?, ?, ?)";
            // Crea un PreparedStatement para insertar actividad dentro de un bloque try-with-resources
            try (PreparedStatement ps = con.prepareStatement(insertActivity)) {
                // Define una matriz con los datos de las seis actividades recientes de muestra
                Object[][] activities = {
                    {"sale",   1, "Anderson Moreno",   "Venta de Algodon Premium x50m",       450000.0, "ShoppingBag"},
                    {"user",   5, "Cliente Demo",      "Se registro como nuevo cliente",       null,     "UserPlus"},
                    {"system", 0, "Sistema",           "Alerta de stock bajo: Lana Merino",    null,     "AlertTriangle"},
                    {"sale",   6, "Laura Sanchez",     "Compra de Seda Italiana x3m",          255000.0, "ShoppingBag"},
                    {"waste",  2, "Carlos Rodriguez",  "Reporto merma por humedad en bodega",  15.0,     "Trash2"},
                    {"order",  5, "Cliente Demo",      "Pedido #1001 entregado exitosamente",  75000.0,  "Package"},
                };
                // Itera sobre cada actividad en la matriz para insertarlas una por una
                for (Object[] a : activities) {
                    // Establece el tipo de actividad como primer parámetro
                    ps.setString(1, (String)a[0]);
                    // Establece el identificador del usuario como segundo parámetro
                    ps.setInt(2, (Integer)a[1]);
                    // Establece el nombre del usuario como tercer parámetro
                    ps.setString(3, (String)a[2]);
                    // Establece la descripción de la acción como cuarto parámetro
                    ps.setString(4, (String)a[3]);
                    // Verifica si el monto no es nulo para establecerlo o poner null en la base de datos
                    if (a[4] != null) ps.setDouble(5, (Double)a[4]);
                    // Si el monto es nulo, establece el quinto parámetro como NULL numérico en SQL
                    else ps.setNull(5, java.sql.Types.NUMERIC);
                    // Establece el nombre del icono representativo como sexto parámetro
                    ps.setString(6, (String)a[5]);
                    // Ejecuta la inserción del registro de actividad en la base de datos
                    ps.executeUpdate();
                }
            }

            // ── 9. Lotes de Inventario ───────────────────────────────
            // Imprime el progreso indicando que se están insertando el inventario y los registros de merma
            System.out.println("[10/12] Insertando inventario y mermas...");
            // Define la consulta SQL parametrizada para insertar un lote de inventario
            String insertBatch = "INSERT INTO inventory_batches (id, fabric_type, supplier, initial_meters, current_meters, status) VALUES (?, ?, ?, ?, ?, ?)";
            // Crea un PreparedStatement para insertar lotes dentro de un bloque try-with-resources
            try (PreparedStatement ps = con.prepareStatement(insertBatch)) {
                // Define una matriz con los datos de los cinco lotes de inventario de muestra
                Object[][] batches = {
                    // Código, Tipo de tela, Proveedor, Metros iniciales, Metros actuales, Estado
                    {"BTN-2026-01", "Algodon Premium",  "Textiles Andinos S.A.",  500.0, 420.5, "active"},
                    {"BTN-2026-02", "Seda Italiana",    "Importaciones Milan",    200.0,  15.0, "low_stock"},
                    {"BTN-2026-03", "Lino Organico",    "EcoTextil Colombia",     300.0,   0.0, "depleted"},
                    {"BTN-2026-04", "Lana Merino",      "Lanera del Sur",         150.0, 120.0, "active"},
                    {"BTN-2026-05", "Dril Elastico",    "Drilones Industriales",  400.0, 380.0, "active"},
                };
                // Itera sobre cada lote en la matriz para insertarlos uno por uno
                for (Object[] b : batches) {
                    // Establece el código identificador del lote como primer parámetro
                    ps.setString(1, (String)b[0]);
                    // Establece el tipo de tela como segundo parámetro
                    ps.setString(2, (String)b[1]);
                    // Establece el nombre del proveedor como tercer parámetro
                    ps.setString(3, (String)b[2]);
                    // Establece la cantidad de metros iniciales como cuarto parámetro
                    ps.setDouble(4, (Double)b[3]);
                    // Establece la cantidad de metros actuales como quinto parámetro
                    ps.setDouble(5, (Double)b[4]);
                    // Establece el estado del lote como sexto parámetro
                    ps.setString(6, (String)b[5]);
                    // Ejecuta la inserción del lote en la base de datos
                    ps.executeUpdate();
                }
            }

            // Mermas
            // Define la consulta SQL parametrizada para insertar un evento de merma o desperdicio
            String insertWaste = "INSERT INTO waste_events (batch_id, meters, reason, description, responsible, user_id) VALUES (?, ?, ?, ?, ?, ?)";
            // Crea un PreparedStatement para insertar eventos de merma dentro de un bloque try-with-resources
            try (PreparedStatement ps = con.prepareStatement(insertWaste)) {
                // Primera merma: establece lote, metros, motivo, descripción, responsable y usuario
                ps.setString(1, "BTN-2026-01"); ps.setDouble(2, 5.5); ps.setString(3, "Humedad");
                ps.setString(4, "Goteras en bodega B afectaron rollo principal"); ps.setString(5, "Anderson Moreno"); ps.setInt(6, 1);
                // Ejecuta la inserción del primer evento de merma en la base de datos
                ps.executeUpdate();

                // Segunda merma: establece lote, metros, motivo, descripción, responsable y usuario
                ps.setString(1, "BTN-2026-02"); ps.setDouble(2, 2.0); ps.setString(3, "Corte defectuoso");
                ps.setString(4, "Cortes defectuosos de fabrica"); ps.setString(5, "Carlos Rodriguez"); ps.setInt(6, 2);
                // Ejecuta la inserción del segundo evento de merma en la base de datos
                ps.executeUpdate();

                // Tercera merma: establece lote, metros, motivo, descripción, responsable y usuario
                ps.setString(1, "BTN-2026-03"); ps.setDouble(2, 10.0); ps.setString(3, "Decoloracion");
                ps.setString(4, "Exposicion solar prolongada en almacen"); ps.setString(5, "Maria Gonzalez"); ps.setInt(6, 3);
                // Ejecuta la inserción del tercer evento de merma en la base de datos
                ps.executeUpdate();
            }

            // Umbrales de stock
            // Define la consulta SQL parametrizada para insertar un umbral mínimo de stock por tipo de tela
            String insertThreshold = "INSERT INTO stock_thresholds (fabric_type, min_meters, alert_enabled) VALUES (?, ?, ?)";
            // Crea un PreparedStatement para insertar umbrales dentro de un bloque try-with-resources
            try (PreparedStatement ps = con.prepareStatement(insertThreshold)) {
                // Define una matriz con los umbrales de stock para cada tipo de tela
                Object[][] thresholds = {
                    // Tipo de tela, Metros mínimos, Alertas activadas
                    {"Algodon Premium",  20.0, true},
                    {"Seda Italiana",    15.0, true},
                    {"Lino Organico",    25.0, true},
                    {"Lana Merino",      10.0, true},
                    {"Dril Elastico",    30.0, true},
                };
                // Itera sobre cada umbral en la matriz para insertarlos uno por uno
                for (Object[] t : thresholds) {
                    // Establece el tipo de tela como primer parámetro
                    ps.setString(1, (String)t[0]);
                    // Establece la cantidad mínima de metros como segundo parámetro
                    ps.setDouble(2, (Double)t[1]);
                    // Establece si la alerta está habilitada como tercer parámetro
                    ps.setBoolean(3, (Boolean)t[2]);
                    // Ejecuta la inserción del umbral en la base de datos
                    ps.executeUpdate();
                }
            }

            // ── 10. Tickets de Soporte ───────────────────────────────
            // Imprime el progreso indicando que se están insertando tickets de soporte y reportes de errores
            System.out.println("[11/12] Insertando tickets y bug reports...");
            // Define la consulta SQL parametrizada para insertar un ticket de soporte con subconsulta de usuario
            String insertTicket = "INSERT INTO support_tickets (user_id, user_name, user_email, subject, description, status, priority) VALUES " +
                                  "((SELECT id FROM users WHERE email = ?), ?, ?, ?, ?, ?, ?)";
            // Crea un PreparedStatement para insertar tickets dentro de un bloque try-with-resources
            try (PreparedStatement ps = con.prepareStatement(insertTicket)) {
                // Primer ticket: cliente Demo reporta producto dañado, prioridad alta, estado abierto
                ps.setString(1, "cliente@ddtextil.com"); ps.setString(2, "Cliente Demo"); ps.setString(3, "cliente@ddtextil.com");
                ps.setString(4, "Producto llego danado"); ps.setString(5, "La tela Algodon Premium llego con manchas de humedad.");
                ps.setString(6, "open"); ps.setString(7, "high");
                // Ejecuta la inserción del primer ticket de soporte en la base de datos
                ps.executeUpdate();

                // Segundo ticket: Laura Sánchez reporta demora en envío, prioridad media, en progreso
                ps.setString(1, "laura.sanchez@email.com"); ps.setString(2, "Laura Sanchez"); ps.setString(3, "laura.sanchez@email.com");
                ps.setString(4, "Demora en el envio"); ps.setString(5, "Mi pedido lleva 5 dias y no ha llegado.");
                ps.setString(6, "in_progress"); ps.setString(7, "medium");
                // Ejecuta la inserción del segundo ticket de soporte en la base de datos
                ps.executeUpdate();

                // Tercer ticket: cliente Demo consulta sobre tallas, prioridad baja, resuelto
                ps.setString(1, "cliente@ddtextil.com"); ps.setString(2, "Cliente Demo"); ps.setString(3, "cliente@ddtextil.com");
                ps.setString(4, "Consulta sobre tallas"); ps.setString(5, "Necesito saber el ancho exacto de la Seda Italiana.");
                ps.setString(6, "resolved"); ps.setString(7, "low");
                // Ejecuta la inserción del tercer ticket de soporte en la base de datos
                ps.executeUpdate();
            }

            // Bug Reports
            // Define la consulta SQL parametrizada para insertar un reporte de error con subconsulta de vendedor
            String insertBug = "INSERT INTO bug_reports (seller_id, seller_name, area, description, steps, status, priority) VALUES " +
                                "((SELECT id FROM users WHERE email = ?), ?, ?, ?, ?, ?, ?)";
            // Crea un PreparedStatement para insertar reportes de error dentro de un bloque try-with-resources
            try (PreparedStatement ps = con.prepareStatement(insertBug)) {
                // Primer bug report: vendedor reporta gráfico de ventas que no carga, prioridad media
                ps.setString(1, "vendedor@ddtextil.com"); ps.setString(2, "Carlos Rodriguez"); ps.setString(3, "Dashboard Vendedor");
                ps.setString(4, "El grafico de ventas no carga"); ps.setString(5, "1. Ir a Dashboard\n2. Ver seccion Ventas\n3. El grafico queda en blanco");
                ps.setString(6, "new"); ps.setString(7, "medium");
                // Ejecuta la inserción del primer reporte de error en la base de datos
                ps.executeUpdate();

                // Segundo bug report: vendedora reporta error al subir imágenes grandes, prioridad alta
                ps.setString(1, "maria.gonzalez@ddtextil.com"); ps.setString(2, "Maria Gonzalez"); ps.setString(3, "Gestion de Productos");
                ps.setString(4, "No puedo subir imagenes mayores a 2MB"); ps.setString(5, "1. Editar producto\n2. Subir imagen de 3MB\n3. Error sin mensaje");
                ps.setString(6, "in_progress"); ps.setString(7, "high");
                // Ejecuta la inserción del segundo reporte de error en la base de datos
                ps.executeUpdate();
            }

            // ── 11. Banner Global ────────────────────────────────────
            // Imprime el progreso indicando que se están insertando el banner global y la configuración del sistema
            System.out.println("[12/12] Insertando banner y config...");
            // Define la consulta SQL parametrizada para insertar la configuración del banner global
            String insertBanner = "INSERT INTO global_banner (enabled, message, banner_type) VALUES (?, ?, ?)";
            // Crea un PreparedStatement para insertar el banner dentro de un bloque try-with-resources
            try (PreparedStatement ps = con.prepareStatement(insertBanner)) {
                // Establece el banner como deshabilitado (false) como primer parámetro
                ps.setBoolean(1, false);
                // Establece el mensaje promocional de envío gratis como segundo parámetro
                ps.setString(2, "Envio gratis en compras superiores a $200.000");
                // Establece el tipo de banner como "info" (informativo) como tercer parámetro
                ps.setString(3, "info");
                // Ejecuta la inserción del banner global en la base de datos
                ps.executeUpdate();
            }

            // Config del sistema
            // Define la consulta SQL parametrizada para insertar o actualizar la configuración del sistema
            String insertConfig = "INSERT INTO system_config (key, value) VALUES (?, ?) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value";
            // Crea un PreparedStatement para insertar la configuración dentro de un bloque try-with-resources
            try (PreparedStatement ps = con.prepareStatement(insertConfig)) {
                // Establece la clave "system_config" como primer parámetro de la consulta
                ps.setString(1, "system_config");
                // Establece un objeto JSON con toda la configuración del sistema como segundo parámetro
                ps.setString(2, "{\"siteName\":\"D&D Textil\",\"defaultDarkMode\":false,\"primaryColor\":\"#8B5CF6\",\"secondaryColor\":\"#EC4899\",\"accentColor\":\"#F59E0B\",\"taxRate\":0.19,\"shippingCost\":15000,\"freeShippingThreshold\":200000,\"lowStockThreshold\":20,\"maintenanceMode\":false}");
                // Ejecuta la inserción o actualización de la configuración en la base de datos
                ps.executeUpdate();
            }

            // Confirma de forma explícita la transacción completa, haciendo persistentes todos los cambios
            con.commit();
            // Imprime un mensaje de éxito indicando que todos los datos se insertaron correctamente
            System.out.println("\n=== Todos los datos insertados correctamente ===");
            // Imprime el encabezado de la sección de credenciales de acceso para los usuarios de prueba
            System.out.println("Credenciales de acceso:");
            // Imprime las credenciales del usuario administrador (correo y contraseña)
            System.out.println("  Admin:    admin@ddtextil.com / admin123");
            // Imprime las credenciales del usuario vendedor (correo y contraseña)
            System.out.println("  Vendedor: vendedor@ddtextil.com / vendedor123");
            // Imprime las credenciales del usuario cliente (correo y contraseña)
            System.out.println("  Cliente:  cliente@ddtextil.com / cliente123");

        // Captura cualquier excepción que ocurra durante el proceso de inserción de datos
        } catch (Exception e) {
            // Imprime un mensaje de error en la salida estándar de error con el detalle de la excepción
            System.err.println("ERROR: " + e.getMessage());
            // Imprime el rastro completo de la pila de la excepción para facilitar la depuración
            e.printStackTrace();
            try {
                // Intenta realizar un rollback de la transacción para deshacer los cambios parciales
                con.rollback();
            // Captura cualquier excepción SQL que ocurra durante la operación de rollback
            } catch (SQLException ex) {
                // Imprime el rastro de la pila de la excepción de rollback en la salida de error
                ex.printStackTrace();
            }
        }
    }
}
