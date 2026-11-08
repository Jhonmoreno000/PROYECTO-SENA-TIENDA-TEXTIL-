import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;

import infraestructura.configuracion.Conexion;
import infraestructura.persistencia.jdbc.MigradorEsquemaPagos;

/**
 * Inicializador y sembrador de datos (`Seeder`) en PostgreSQL para D&D Textil.
 * Inserta las cuentas base, categorías, catálogo de productos, lotes de inventario,
 * rollos físicos, cupones, secciones de inicio, diapositivas, umbrales y métricas iniciales.
 */
public class SembradorDatosPrueba {

    /**
     * Calcula el resumen criptográfico SHA-256 en formato hexadecimal para una contraseña en texto plano.
     *
     * @param contrasenaPlana Contraseña en texto plano (`String`) a codificar.
     * @return Cadena hexadecimal (`String`) de 64 caracteres con el hash SHA-256.
     */
    private static String encriptarContrasena(String contrasenaPlana) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            digest.update(contrasenaPlana.getBytes(StandardCharsets.UTF_8));
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

    /**
     * Ejecuta el proceso transaccional de limpieza y población inicial de tablas en PostgreSQL.
     *
     * @param args Argumentos de línea de comandos (`String[]`, no utilizados).
     * @throws Exception Si ocurre un fallo crítico durante la conexión o ejecución SQL.
     */
    public static void main(String[] args) throws Exception {
        System.out.println("Iniciando poblado de datos de prueba (D&D Textil)...");

        MigradorEsquemaPagos.ejecutar();

        try (Connection conexion = Conexion.obtenerConexion()) {
            if (conexion == null) {
                System.err.println("ERROR: No se pudo conectar a la base de datos PostgreSQL.");
                return;
            }

            conexion.setAutoCommit(false);
            try (Statement sentencia = conexion.createStatement()) {
                // 1. Limpieza ordenada de tablas respetando dependencias de llaves foráneas
                System.out.println("[1/10] Limpiando datos anteriores en tablas en español...");
                sentencia.executeUpdate(
                    "TRUNCATE TABLE eventos_merma, items_pedido, items_carrito, imagenes_producto, resenas, " +
                    "reportes_errores, tickets_soporte, ventas_diarias, ventas_region, actividad_reciente, " +
                    "metricas_ventas_erp, eventos_pago_wompi, direcciones_usuario RESTART IDENTITY CASCADE"
                );
                sentencia.executeUpdate("TRUNCATE TABLE pedidos, lotes_inventario, rollos_textil RESTART IDENTITY CASCADE");
                try {
                    sentencia.executeUpdate("TRUNCATE TABLE categorias_cupon RESTART IDENTITY CASCADE");
                } catch (SQLException ignored) {}
                sentencia.executeUpdate("TRUNCATE TABLE productos, cupones, categorias, umbrales_stock, banner_global, secciones_inicio, diapositivas_carrusel, configuracion_sistema, usuarios RESTART IDENTITY CASCADE");

                // 2. Insertar Usuarios del Sistema
                System.out.println("[2/10] Insertando usuarios con credenciales SHA-256 en UTF-8...");
                String sqlInsertarUsuario = "INSERT INTO usuarios (nombre, correo, contrasena_hash, rol, activo, tasa_comision) VALUES (?, ?, ?, ?, true, ?)";

                int idVendedor1 = 0;
                int idVendedor2 = 0;

                try (PreparedStatement pst = conexion.prepareStatement(sqlInsertarUsuario, Statement.RETURN_GENERATED_KEYS)) {
                    // Administrador
                    pst.setString(1, "Anderson Moreno");
                    pst.setString(2, "admin@ddtextil.com");
                    pst.setString(3, encriptarContrasena("admin123"));
                    pst.setString(4, "administrador");
                    pst.setNull(5, java.sql.Types.DOUBLE);
                    pst.executeUpdate();

                    // Vendedor 1
                    pst.setString(1, "Carlos Pérez");
                    pst.setString(2, "vendedor@ddtextil.com");
                    pst.setString(3, encriptarContrasena("vendedor123"));
                    pst.setString(4, "vendedor");
                    pst.setDouble(5, 5.0);
                    pst.executeUpdate();
                    try (ResultSet rs = pst.getGeneratedKeys()) {
                        if (rs.next()) idVendedor1 = rs.getInt(1);
                    }

                    // Vendedor 2
                    pst.setString(1, "María González");
                    pst.setString(2, "maria.gonzalez@ddtextil.com");
                    pst.setString(3, encriptarContrasena("vendedor123"));
                    pst.setString(4, "vendedor");
                    pst.setDouble(5, 4.5);
                    pst.executeUpdate();
                    try (ResultSet rs = pst.getGeneratedKeys()) {
                        if (rs.next()) idVendedor2 = rs.getInt(1);
                    }

                    // Cliente General
                    pst.setString(1, "Juan Cliente");
                    pst.setString(2, "cliente@gmail.com");
                    pst.setString(3, encriptarContrasena("cliente123"));
                    pst.setString(4, "cliente");
                    pst.setNull(5, java.sql.Types.DOUBLE);
                    pst.executeUpdate();

                    // Cliente Demo
                    pst.setString(1, "Cliente Demo D&D");
                    pst.setString(2, "cliente@ddtextil.com");
                    pst.setString(3, encriptarContrasena("cliente123"));
                    pst.setString(4, "cliente");
                    pst.setNull(5, java.sql.Types.DOUBLE);
                    pst.executeUpdate();
                }

                // 3. Insertar Categorías Textiles
                System.out.println("[3/10] Insertando categorías textiles base...");
                String[] listaCategorias = {"Algodon", "Seda", "Lino", "Lana", "Poliester", "Terciopelo", "Dril", "Mezclilla"};
                String sqlInsertarCategoria = "INSERT INTO categorias (nombre, descripcion) VALUES (?, ?)";
                try (PreparedStatement pst = conexion.prepareStatement(sqlInsertarCategoria)) {
                    for (String categoria : listaCategorias) {
                        pst.setString(1, categoria);
                        pst.setString(2, "Telas de alta calidad tipo " + categoria);
                        pst.executeUpdate();
                    }
                }

                // 4. Insertar Catálogo de Productos, Lotes y Rollos Textiles
                System.out.println("[4/10] Insertando catálogo de productos y rollos textiles...");
                Object[][] datosProductos = {
                    {"Algodón Premium",       "Algodon",    25000.0, idVendedor1, "Tela de algodón 100% natural, ideal para camisas y blusas de alta durabilidad.", "Algodón 100%", "1.50m", "150g/m2", "Lavar en frío, no blanquear", 100, true, true, false, false, "/uploads/product_12_1775767112691.jpg"},
                    {"Seda Italiana",         "Seda",       85000.0, idVendedor1, "Seda pura con acabado brillante, perfecta para vestidos de gala y eventos especiales.", "Seda pura", "1.40m", "80g/m2", "Limpieza en seco únicamente", 50, true, false, true, false, "/uploads/product_16_1775766690228.webp"},
                    {"Lino Orgánico",         "Lino",       45000.0, idVendedor2, "Lino fresco y transpirable para ropa de verano, cortinas y mantelería fina.", "Lino orgánico", "1.50m", "200g/m2", "No usar secadora", 80, false, true, false, true, "/uploads/product_14_1775766898975.webp"},
                    {"Lana Merino",           "Lana",       65000.0, idVendedor2, "Lana suave y cálida de alta calidad para abrigos, trajes y prendas invernales.", "Lana Merino 100%", "1.45m", "320g/m2", "Lavar a mano con agua tibia", 40, false, false, true, false, "/uploads/product_14_1775766898975.webp"},
                    {"Poliéster Deportivo",   "Poliester",  18000.0, idVendedor1, "Tela sintética de secado rápido ideal para uniformes y ropa deportiva.", "Poliéster 100%", "1.60m", "130g/m2", "Lavado máquina ciclo normal", 150, true, false, false, true, "/uploads/product_15_1775767332095.jpg"},
                    {"Terciopelo Azul Noche", "Terciopelo", 95000.0, idVendedor2, "Terciopelo espeso de tacto suave para tapicería y alta costura.", "Poliéster / Algodón", "1.40m", "380g/m2", "Limpieza profesional en seco", 30, true, true, true, false, "/uploads/product_10_1775766963190.webp"},
                    {"Dril Elástico Natural", "Dril",       38000.0, idVendedor1, "Dril resistente con Spandex para pantalones de trabajo y chaquetas.", "Algodón 98% / Spandex 2%", "1.50m", "280g/m2", "Lavar a temperatura ambiente", 120, false, false, false, false, "/uploads/product_10_1775767265179.jpg"},
                    {"Mezclilla Denim Heavy", "Mezclilla",  42000.0, idVendedor2, "Mezclilla rígida tradicional de 14oz para jeaneado clásico y chaquetas.", "Algodón 100%", "1.50m", "420g/m2", "Lavar al revés con colores similares", 90, true, true, false, true, "/uploads/product_11_1775767027618.jpg"}
                };

                String sqlInsertarProd =
                    "INSERT INTO productos (nombre, categoria_id, precio, vendedor_id, descripcion, material, ancho, peso, cuidados, stock, destacado, activo, estado_moderacion, es_nueva_coleccion, es_exclusivo, es_oferta) " +
                    "VALUES (?, (SELECT id FROM categorias WHERE nombre = ? LIMIT 1), ?, ?, ?, ?, ?, ?, ?, ?, ?, true, 'approved', ?, ?, ?)";
                String sqlInsertarImg = "INSERT INTO imagenes_producto (producto_id, url_imagen, orden_visualizacion) VALUES (?, ?, 0)";
                String sqlInsertarLote = "INSERT INTO lotes_inventario (producto_id, numero_lote, metros_recibidos, metros_actuales, costo_por_metro, proveedor, estado, fecha_recepcion) VALUES (?, ?, ?, ?, ?, ?, 'active', CURRENT_DATE)";
                String sqlInsertarRollo = "INSERT INTO rollos_textil (producto_id, codigo_rollo, metraje_inicial, metraje_remanente, lote_tintoreria, estado, ubicacion_bodega) VALUES (?, ?, ?, ?, ?, 'disponible', ?)";

                try (PreparedStatement pstProd = conexion.prepareStatement(sqlInsertarProd, Statement.RETURN_GENERATED_KEYS);
                     PreparedStatement pstImg = conexion.prepareStatement(sqlInsertarImg);
                     PreparedStatement pstLote = conexion.prepareStatement(sqlInsertarLote);
                     PreparedStatement pstRollo = conexion.prepareStatement(sqlInsertarRollo)) {

                    int contadorRollo = 1;
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
                            String loteCodigo = "LOT-2026-A" + contadorRollo;
                            double metraje = ((Integer) fila[9]).doubleValue();

                            pstImg.setInt(1, idProdGenerado);
                            pstImg.setString(2, (String) fila[14]);
                            pstImg.executeUpdate();

                            pstLote.setInt(1, idProdGenerado);
                            pstLote.setString(2, loteCodigo);
                            pstLote.setDouble(3, metraje);
                            pstLote.setDouble(4, metraje);
                            pstLote.setDouble(5, ((Double) fila[2]) * 0.6);
                            pstLote.setString(6, "Proveedor Textil Central");
                            pstLote.executeUpdate();

                            pstRollo.setInt(1, idProdGenerado);
                            pstRollo.setString(2, String.format("ROL-%03d", contadorRollo));
                            pstRollo.setDouble(3, metraje);
                            pstRollo.setDouble(4, metraje);
                            pstRollo.setString(5, loteCodigo);
                            pstRollo.setString(6, "PAS-0" + (contadorRollo % 4 + 1) + "-EST-02");
                            pstRollo.executeUpdate();
                            contadorRollo++;
                        }
                    }
                }

                // 5. Insertar Cupones de Descuento
                System.out.println("[5/10] Insertando cupones comerciales...");
                String sqlInsertarCupon = "INSERT INTO cupones (codigo, valor_descuento, usos_maximos, activo) VALUES (?, ?, ?, true)";
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

                // 6. Configurar Secciones del Inicio
                System.out.println("[6/10] Insertando secciones de la página de inicio...");
                String sqlInsertarSeccion = "INSERT INTO secciones_inicio (clave, titulo, subtitulo, activo, orden) VALUES (?, ?, ?, true, ?)";
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

                // 7. Insertar Diapositivas del Carrusel
                System.out.println("[7/10] Insertando diapositivas del carrusel...");
                String sqlInsertarDiapositiva = "INSERT INTO diapositivas_carrusel (titulo, subtitulo, imagen, cta, clave_seccion, activo, orden) VALUES (?, ?, ?, ?, ?, true, ?)";
                try (PreparedStatement pst = conexion.prepareStatement(sqlInsertarDiapositiva)) {
                    pst.setString(1, "Gran Colección 2026");
                    pst.setString(2, "Telas de Lino y Algodón 100% natural con hasta 20% de descuento por escala.");
                    pst.setString(3, "/images/carousel-nueva-coleccion.webp");
                    pst.setString(4, "Ver Colección");
                    pst.setString(5, "nuevas");
                    pst.setInt(6, 1);
                    pst.executeUpdate();

                    pst.setString(1, "Seda Italiana y Terciopelo de Lujo");
                    pst.setString(2, "Elegancia y textura única para tus confecciones de alta costura.");
                    pst.setString(3, "/images/carousel-telas-exclusivas.webp");
                    pst.setString(4, "Explorar Exclusivos");
                    pst.setString(5, "exclusivas");
                    pst.setInt(6, 2);
                    pst.executeUpdate();
                }

                // 8. Configurar Umbrales de Stock
                System.out.println("[8/10] Configurando umbrales de alerta de stock...");
                String sqlInsertarUmbral = "INSERT INTO umbrales_stock (tipo_tela, metros_minimos, alerta_activa) VALUES (?, ?, ?)";
                try (PreparedStatement pst = conexion.prepareStatement(sqlInsertarUmbral)) {
                    for (String categoria : listaCategorias) {
                        pst.setString(1, categoria);
                        pst.setDouble(2, 20.0);
                        pst.setBoolean(3, true);
                        pst.executeUpdate();
                    }
                }

                // 9. Banner Global y Configuración
                System.out.println("[9/10] Configurando banner y parámetros globales...");
                String sqlInsertarBanner = "INSERT INTO banner_global (activo, mensaje, tipo_banner) VALUES (?, ?, ?)";
                try (PreparedStatement pst = conexion.prepareStatement(sqlInsertarBanner)) {
                    pst.setBoolean(1, true);
                    pst.setString(2, "¡Envío gratis en compras superiores a $200.000 COP a todo el país!");
                    pst.setString(3, "info");
                    pst.executeUpdate();
                }

                String jsonConfig = "{\"siteName\":\"D&D Textil\",\"defaultDarkMode\":false,\"primaryColor\":\"#8B5CF6\",\"secondaryColor\":\"#EC4899\",\"accentColor\":\"#F59E0B\",\"taxRate\":0.19,\"shippingCost\":15000,\"freeShippingThreshold\":200000,\"lowStockThreshold\":20,\"maintenanceMode\":false}";
                String sqlInsertarConfig = "INSERT INTO configuracion_sistema (clave, valor) VALUES (?, ?) ON CONFLICT (clave) DO UPDATE SET valor = EXCLUDED.valor";
                try (PreparedStatement pst = conexion.prepareStatement(sqlInsertarConfig)) {
                    pst.setString(1, "system_config");
                    pst.setString(2, jsonConfig);
                    pst.executeUpdate();
                }

                // 10. Métricas de Venta y Regiones para Analítica
                System.out.println("[10/10] Insertando métricas de ventas iniciales...");
                sentencia.executeUpdate(
                    "INSERT INTO metricas_ventas_erp (fecha_registro, ventas_reales, ventas_objetivo, margen_ganancia) VALUES " +
                    "(CURRENT_DATE - INTERVAL '3 days', 2100000, 1650000, 38.1), " +
                    "(CURRENT_DATE - INTERVAL '2 days', 1900000, 1700000, 36.4), " +
                    "(CURRENT_DATE - INTERVAL '1 day', 2400000, 1800000, 41.0), " +
                    "(CURRENT_DATE, 1400000, 1850000, 35.5) " +
                    "ON CONFLICT (fecha_registro) DO NOTHING"
                );
                sentencia.executeUpdate(
                    "INSERT INTO ventas_diarias (fecha_venta, ventas_totales, pedidos_totales) VALUES " +
                    "(CURRENT_DATE - INTERVAL '3 days', 2100000, 7), " +
                    "(CURRENT_DATE - INTERVAL '2 days', 1900000, 6), " +
                    "(CURRENT_DATE - INTERVAL '1 day', 2400000, 9), " +
                    "(CURRENT_DATE, 1400000, 5) " +
                    "ON CONFLICT (fecha_venta) DO NOTHING"
                );
                sentencia.executeUpdate(
                    "INSERT INTO ventas_region (region, capital, ventas_totales, pedidos_totales, porcentaje) VALUES " +
                    "('Bogotá D.C.', 'Bogotá', 43955905.83, 145, 35.50), " +
                    "('Antioquia', 'Medellín', 20517276.65, 82, 18.20), " +
                    "('Valle del Cauca', 'Cali', 29667382.08, 98, 22.40), " +
                    "('Atlántico', 'Barranquilla', 33479140.61, 64, 15.10), " +
                    "('Santander', 'Bucaramanga', 33396670.43, 41, 8.80) " +
                    "ON CONFLICT (region) DO NOTHING"
                );

                conexion.commit();
                System.out.println("\n=== BASE DE DATOS POSTGRESQL POBLADA EXITOSAMENTE ===");
                System.out.println("Cuentas preparadas para verificación:");
                System.out.println("  1. Administrador: admin@ddtextil.com / admin123");
                System.out.println("  2. Vendedor 1:    vendedor@ddtextil.com / vendedor123");
                System.out.println("  3. Vendedor 2:    maria.gonzalez@ddtextil.com / vendedor123");
                System.out.println("  4. Cliente:       cliente@ddtextil.com o cliente@gmail.com / cliente123");
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
}
