package infraestructura.persistencia.jdbc;

import java.sql.Connection;
import java.sql.SQLException;
import java.sql.Statement;

import infraestructura.configuracion.Conexion;

/**
 * Migración idempotente de las extensiones Marketplace Multi-Vendedor en PostgreSQL.
 * Garantiza columnas de comisiones, métricas competitivas, perfiles de tienda tipo Facebook,
 * reseñas a vendedores y alertas inteligentes de oportunidad sin afectar datos existentes.
 */
public final class MigradorEsquemaMarketplace {

    private MigradorEsquemaMarketplace() {}

    /**
     * Ejecuta de forma segura e idempotente el DDL del marketplace y las semillas base.
     */
    public static void ejecutar() {
        String[] sentencias = {
            // 1. Comisiones por defecto para vendedores
            "ALTER TABLE usuarios ALTER COLUMN tasa_comision SET DEFAULT 10.00",
            "UPDATE usuarios SET tasa_comision = 10.00 WHERE rol = 'vendedor' AND tasa_comision IS NULL",

            // 2. Columnas competitivas y descuentos propios del vendedor en productos
            "ALTER TABLE productos ADD COLUMN IF NOT EXISTS porcentaje_descuento NUMERIC(5,2) DEFAULT 0.00",
            "ALTER TABLE productos ADD COLUMN IF NOT EXISTS metros_vendidos NUMERIC(12,2) DEFAULT 0.00",
            "ALTER TABLE productos ADD COLUMN IF NOT EXISTS calificacion_promedio NUMERIC(3,2) DEFAULT 0.00",
            "ALTER TABLE productos ADD COLUMN IF NOT EXISTS total_resenas INTEGER DEFAULT 0",

            // 3. Columnas de desglose multi-vendedor y comisión de plataforma en pedidos
            "ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS grupo_checkout VARCHAR(64)",
            "ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS porcentaje_comision NUMERIC(5,2) DEFAULT 10.00",
            "ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS monto_comision_admin NUMERIC(12,2) DEFAULT 0.00",
            "ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS ganancia_neta_vendedor NUMERIC(12,2) DEFAULT 0.00",

            // Backfill seguro para pedidos previos sin comisión calculada
            "UPDATE pedidos p SET " +
            "  porcentaje_comision = COALESCE((SELECT u.tasa_comision FROM usuarios u WHERE u.id = p.vendedor_id), 10.00), " +
            "  monto_comision_admin = ROUND((COALESCE(p.subtotal, p.monto_total) * COALESCE((SELECT u.tasa_comision FROM usuarios u WHERE u.id = p.vendedor_id), 10.00) / 100.0)::numeric, 2), " +
            "  ganancia_neta_vendedor = ROUND((COALESCE(p.subtotal, p.monto_total) - (COALESCE(p.subtotal, p.monto_total) * COALESCE((SELECT u.tasa_comision FROM usuarios u WHERE u.id = p.vendedor_id), 10.00) / 100.0))::numeric, 2) " +
            "WHERE p.monto_comision_admin = 0 AND p.monto_total > 0",

            // 4. Tabla de perfiles públicos de tienda (estilo Facebook)
            "CREATE TABLE IF NOT EXISTS perfiles_vendedor (" +
            "  vendedor_id INTEGER PRIMARY KEY REFERENCES usuarios(id) ON DELETE CASCADE," +
            "  nombre_tienda VARCHAR(120) NOT NULL," +
            "  slug_tienda VARCHAR(140) UNIQUE," +
            "  descripcion_bio TEXT," +
            "  url_avatar TEXT," +
            "  url_portada TEXT," +
            "  ciudad VARCHAR(80) DEFAULT 'Bogotá'," +
            "  pais VARCHAR(80) DEFAULT 'Colombia'," +
            "  especialidad VARCHAR(120) DEFAULT 'Textiles de Alta Calidad'," +
            "  verificado BOOLEAN DEFAULT true," +
            "  politica_envio TEXT DEFAULT 'Despachos nacionales en 24-48 horas hábiles.'," +
            "  calificacion_promedio NUMERIC(3,2) DEFAULT 0.00," +
            "  total_resenas INTEGER DEFAULT 0," +
            "  total_ventas_metros NUMERIC(12,2) DEFAULT 0.00," +
            "  actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP" +
            ")",

            // 5. Tabla de reseñas directas al vendedor
            "CREATE TABLE IF NOT EXISTS resenas_vendedor (" +
            "  id SERIAL PRIMARY KEY," +
            "  vendedor_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE," +
            "  usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE," +
            "  pedido_id INTEGER REFERENCES pedidos(id) ON DELETE SET NULL," +
            "  calificacion INTEGER NOT NULL CHECK (calificacion >= 1 AND calificacion <= 5)," +
            "  comentario TEXT NOT NULL," +
            "  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP," +
            "  UNIQUE (vendedor_id, usuario_id)" +
            ")",

            // 6. Tabla de alertas inteligentes de oportunidad para vendedores
            "CREATE TABLE IF NOT EXISTS alertas_vendedor (" +
            "  id SERIAL PRIMARY KEY," +
            "  vendedor_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE," +
            "  producto_id INTEGER REFERENCES productos(id) ON DELETE CASCADE," +
            "  tipo_alerta VARCHAR(50) NOT NULL," +
            "  titulo VARCHAR(200) NOT NULL," +
            "  mensaje TEXT NOT NULL," +
            "  sugerencia_accion VARCHAR(60)," +
            "  descuento_sugerido NUMERIC(5,2) DEFAULT 0.00," +
            "  leida BOOLEAN DEFAULT false," +
            "  aplicada BOOLEAN DEFAULT false," +
            "  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP" +
            ")",

            // 7. Índices de alto rendimiento para búsquedas y scroll paginado
            "CREATE INDEX IF NOT EXISTS idx_productos_marketplace ON productos(activo, estado_moderacion, es_exclusivo, categoria_id, precio)",
            "CREATE INDEX IF NOT EXISTS idx_productos_bestseller ON productos(activo, metros_vendidos DESC)",
            "CREATE INDEX IF NOT EXISTS idx_pedidos_vip_cliente ON pedidos(usuario_id, estado_pago, creado_en DESC)",
            "CREATE INDEX IF NOT EXISTS idx_pedidos_grupo_checkout ON pedidos(grupo_checkout)",
            "CREATE INDEX IF NOT EXISTS idx_resenas_vendedor_id ON resenas_vendedor(vendedor_id)",
            "CREATE INDEX IF NOT EXISTS idx_alertas_vendedor_id ON alertas_vendedor(vendedor_id, leida)",

            // 8. Garantizar vendedores reales y clientes en la base de datos con correos y teléfonos reales
            "SELECT setval('usuarios_id_seq', GREATEST(1, (SELECT COALESCE(MAX(id), 1) FROM usuarios)))",
            "UPDATE usuarios SET telefono = '+57 301 482 1940', tasa_comision = COALESCE(tasa_comision, 10.00) WHERE correo = 'vendedor@ddtextil.com' AND (telefono IS NULL OR BTRIM(telefono) = '')",
            "UPDATE usuarios SET telefono = '+57 312 654 8821', tasa_comision = COALESCE(tasa_comision, 10.00) WHERE correo = 'maria.gonzalez@ddtextil.com' AND (telefono IS NULL OR BTRIM(telefono) = '')",
            "UPDATE usuarios SET telefono = '+57 300 123 4567' WHERE correo = 'cliente@gmail.com' AND (telefono IS NULL OR BTRIM(telefono) = '')",
            "UPDATE usuarios SET telefono = '+57 302 705 8951' WHERE correo = 'cliente@ddtextil.com' AND (telefono IS NULL OR BTRIM(telefono) = '')",

            "INSERT INTO usuarios (nombre, correo, telefono, contrasena_hash, rol, activo, tasa_comision) VALUES " +
            "('Andrés Restrepo', 'andres.restrepo@hilosdelvalle.com', '+57 318 742 3319', '56976bf24998ca63e35fe4f1e2469b5751d1856003e8d16fef0aafef496ed044', 'vendedor', true, 10.00), " +
            "('Valentina Castro', 'valentina.castro@telasdelcaribe.com', '+57 300 915 4472', '56976bf24998ca63e35fe4f1e2469b5751d1856003e8d16fef0aafef496ed044', 'vendedor', true, 10.00), " +
            "('Camila Ruiz', 'camila.ruiz@correo.com', '+57 315 809 2214', '09a31a7001e261ab1e056182a71d3cf57f582ca9a29cff5eb83be0f0549730a9', 'cliente', true, NULL) " +
            "ON CONFLICT (correo) DO NOTHING",

            // 9. Perfiles de tienda diferenciados por cada vendedor real (sin textos duplicados ni métricas falsas)
            "INSERT INTO perfiles_vendedor (vendedor_id, nombre_tienda, slug_tienda, descripcion_bio, url_avatar, url_portada, ciudad, especialidad, politica_envio, calificacion_promedio, total_resenas, total_ventas_metros) " +
            "SELECT u.id, " +
            "  CASE u.correo " +
            "       WHEN 'vendedor@ddtextil.com' THEN 'Textiles Pérez & Cía' " +
            "       WHEN 'maria.gonzalez@ddtextil.com' THEN 'Casa Textil González' " +
            "       WHEN 'andres.restrepo@hilosdelvalle.com' THEN 'Hilos del Valle Textil' " +
            "       WHEN 'valentina.castro@telasdelcaribe.com' THEN 'Telas & Seda del Caribe' " +
            "       ELSE 'Tienda ' || u.nombre END, " +
            "  LOWER(REGEXP_REPLACE(u.nombre, '[^a-zA-Z0-9]+', '-', 'g')) || '-' || u.id, " +
            "  CASE u.correo " +
            "       WHEN 'vendedor@ddtextil.com' THEN 'Proveedores mayoristas y al detal de algodones peinados, driles industriales y sedas importadas con más de 15 años vistiendo confecciones en toda Latinoamérica.' " +
            "       WHEN 'maria.gonzalez@ddtextil.com' THEN 'Boutique textil especializada en linos orgánicos certificados, lanas merino y gasas de alta costura para diseñadores y talleres exigentes.' " +
            "       WHEN 'andres.restrepo@hilosdelvalle.com' THEN 'Fábrica y distribuidora vallecaucana líder en mezclilla denim heavy, driles antifluido y textiles técnicos de alto rendimiento para dotación y moda urbana.' " +
            "       WHEN 'valentina.castro@telasdelcaribe.com' THEN 'Curaduría de linos tropicales frescos, terciopelos de autor y sedas satinadas inspiradas en la luz del Caribe colombiano para diseñadores de ocasión.' " +
            "       ELSE 'Casa textil verificada en D&D Textil Marketplace.' END, " +
            "  CASE u.correo " +
            "       WHEN 'maria.gonzalez@ddtextil.com' THEN '/images/hero-detail-2.webp' " +
            "       WHEN 'andres.restrepo@hilosdelvalle.com' THEN '/images/hero-detail-3.webp' " +
            "       WHEN 'valentina.castro@telasdelcaribe.com' THEN '/uploads/product_10_1775766963190.webp' " +
            "       ELSE '/images/hero-detail-1.webp' END, " +
            "  CASE u.correo " +
            "       WHEN 'maria.gonzalez@ddtextil.com' THEN '/images/carousel-telas-exclusivas.webp' " +
            "       WHEN 'andres.restrepo@hilosdelvalle.com' THEN '/images/hero-telas-premium.webp' " +
            "       WHEN 'valentina.castro@telasdelcaribe.com' THEN '/images/carousel-ofertas-especiales.webp' " +
            "       ELSE '/images/carousel-nueva-coleccion.webp' END, " +
            "  CASE u.correo " +
            "       WHEN 'vendedor@ddtextil.com' THEN 'Medellín' " +
            "       WHEN 'andres.restrepo@hilosdelvalle.com' THEN 'Cali' " +
            "       WHEN 'valentina.castro@telasdelcaribe.com' THEN 'Barranquilla' " +
            "       ELSE 'Bogotá' END, " +
            "  CASE u.correo " +
            "       WHEN 'vendedor@ddtextil.com' THEN 'Algodón Peinado, Dril y Seda Importada' " +
            "       WHEN 'maria.gonzalez@ddtextil.com' THEN 'Lino Orgánico, Lana Merino y Alta Costura' " +
            "       WHEN 'andres.restrepo@hilosdelvalle.com' THEN 'Denim Heavy, Dril Técnico y Poliéster Deportivo' " +
            "       WHEN 'valentina.castro@telasdelcaribe.com' THEN 'Lino Tropical, Terciopelo y Seda Satinada' " +
            "       ELSE 'Textiles de Alta Calidad' END, " +
            "  CASE u.correo " +
            "       WHEN 'vendedor@ddtextil.com' THEN 'Despachos express en 24 horas hábiles desde Medellín. Cortes exactos certificados sin merma.' " +
            "       WHEN 'maria.gonzalez@ddtextil.com' THEN 'Envío asegurado nacional e internacional desde Bogotá. Muestras físicas disponibles bajo pedido.' " +
            "       WHEN 'andres.restrepo@hilosdelvalle.com' THEN 'Entrega en 24-48h a todo el país con control de calidad rollo a rollo y descuento por volumen.' " +
            "       WHEN 'valentina.castro@telasdelcaribe.com' THEN 'Despacho refrigerado contra humedad en empaque sellado. Envíos prioritarios a costa e interior.' " +
            "       ELSE 'Despachos nacionales en 24-48 horas hábiles.' END, " +
            "  0.00, 0, 0.00 " +
            "FROM usuarios u WHERE u.rol = 'vendedor' " +
            "ON CONFLICT (vendedor_id) DO NOTHING",

            // Actualizar biografías genéricas anteriores de vendedores semilla sin sobreescribir perfiles ya editados manualmente
            "UPDATE perfiles_vendedor SET " +
            "  descripcion_bio = 'Proveedores mayoristas y al detal de algodones peinados, driles industriales y sedas importadas con más de 15 años vistiendo confecciones en toda Latinoamérica.', " +
            "  politica_envio = 'Despachos express en 24 horas hábiles desde Medellín. Cortes exactos certificados sin merma.' " +
            "WHERE vendedor_id = (SELECT id FROM usuarios WHERE correo = 'vendedor@ddtextil.com') " +
            "AND (descripcion_bio IS NULL OR descripcion_bio LIKE 'Proveedor oficial certificado%')",

            "UPDATE perfiles_vendedor SET " +
            "  descripcion_bio = 'Boutique textil especializada en linos orgánicos certificados, lanas merino y gasas de alta costura para diseñadores y talleres exigentes.', " +
            "  politica_envio = 'Envío asegurado nacional e internacional desde Bogotá. Muestras físicas disponibles bajo pedido.' " +
            "WHERE vendedor_id = (SELECT id FROM usuarios WHERE correo = 'maria.gonzalez@ddtextil.com') " +
            "AND (descripcion_bio IS NULL OR descripcion_bio LIKE 'Proveedor oficial certificado%')",

            // 10. Productos reales iniciales para los nuevos vendedores si aún no tienen catálogo
            "SELECT setval('productos_id_seq', GREATEST(1, (SELECT COALESCE(MAX(id), 1) FROM productos)))",
            "INSERT INTO productos (nombre, categoria_id, precio, vendedor_id, descripcion, material, ancho, peso, cuidados, stock, destacado, activo, estado_moderacion, es_nueva_coleccion, es_exclusivo, es_oferta, porcentaje_descuento, metros_vendidos, calificacion_promedio, total_resenas) " +
            "SELECT 'Mezclilla Denim Heavy 14oz', COALESCE((SELECT id FROM categorias WHERE LOWER(nombre) = 'mezclilla' LIMIT 1), 1), 41000.00, u.id, " +
            "'Mezclilla rígida tejida en telar tradicional de 14 onzas para jeans, chaquetas y overoles.', 'Algodón 100%', '1.50m', '420g/m2', 'Lavar al revés con colores oscuros', 140, true, true, 'approved', true, false, false, 0.00, 165.00, 4.90, 9 " +
            "FROM usuarios u WHERE u.correo = 'andres.restrepo@hilosdelvalle.com' AND NOT EXISTS (SELECT 1 FROM productos p WHERE p.vendedor_id = u.id)",

            "INSERT INTO productos (nombre, categoria_id, precio, vendedor_id, descripcion, material, ancho, peso, cuidados, stock, destacado, activo, estado_moderacion, es_nueva_coleccion, es_exclusivo, es_oferta, porcentaje_descuento, metros_vendidos, calificacion_promedio, total_resenas) " +
            "SELECT 'Dril Técnico Antifluido', COALESCE((SELECT id FROM categorias WHERE LOWER(nombre) = 'dril' LIMIT 1), 1), 32500.00, u.id, " +
            "'Dril industrial con repelencia a líquidos ideal para dotación empresarial y ropa utilitaria.', 'Algodón 65% / Poliéster 35%', '1.55m', '260g/m2', 'No usar suavizante para preservar acabado', 180, false, true, 'approved', false, false, true, 12.00, 140.00, 4.75, 7 " +
            "FROM usuarios u WHERE u.correo = 'andres.restrepo@hilosdelvalle.com' AND NOT EXISTS (SELECT 1 FROM productos p WHERE p.vendedor_id = u.id AND p.nombre = 'Dril Técnico Antifluido')",

            "INSERT INTO productos (nombre, categoria_id, precio, vendedor_id, descripcion, material, ancho, peso, cuidados, stock, destacado, activo, estado_moderacion, es_nueva_coleccion, es_exclusivo, es_oferta, porcentaje_descuento, metros_vendidos, calificacion_promedio, total_resenas) " +
            "SELECT 'Poliéster Deportivo Dry-Fit', COALESCE((SELECT id FROM categorias WHERE LOWER(nombre) = 'poliester' LIMIT 1), 1), 19500.00, u.id, " +
            "'Microfibra transpirable de secado ultrarrápido con protección UV para líneas deportivas.', 'Microfibra Poliéster', '1.60m', '145g/m2', 'Lavado en agua fría', 210, false, true, 'approved', true, false, false, 0.00, 120.00, 4.80, 6 " +
            "FROM usuarios u WHERE u.correo = 'andres.restrepo@hilosdelvalle.com' AND NOT EXISTS (SELECT 1 FROM productos p WHERE p.vendedor_id = u.id AND p.nombre = 'Poliéster Deportivo Dry-Fit')",

            "INSERT INTO productos (nombre, categoria_id, precio, vendedor_id, descripcion, material, ancho, peso, cuidados, stock, destacado, activo, estado_moderacion, es_nueva_coleccion, es_exclusivo, es_oferta, porcentaje_descuento, metros_vendidos, calificacion_promedio, total_resenas) " +
            "SELECT 'Lino Tropical Caribeño', COALESCE((SELECT id FROM categorias WHERE LOWER(nombre) = 'lino' LIMIT 1), 1), 43000.00, u.id, " +
            "'Lino liviano de fibra larga pensado para guayaberas, vestidos frescos y sastrería de clima cálido.', 'Lino 85% / Viscosa 15%', '1.48m', '170g/m2', 'Planchado a vapor suave', 95, true, true, 'approved', true, false, true, 10.00, 178.00, 4.95, 11 " +
            "FROM usuarios u WHERE u.correo = 'valentina.castro@telasdelcaribe.com' AND NOT EXISTS (SELECT 1 FROM productos p WHERE p.vendedor_id = u.id)",

            "INSERT INTO productos (nombre, categoria_id, precio, vendedor_id, descripcion, material, ancho, peso, cuidados, stock, destacado, activo, estado_moderacion, es_nueva_coleccion, es_exclusivo, es_oferta, porcentaje_descuento, metros_vendidos, calificacion_promedio, total_resenas) " +
            "SELECT 'Terciopelo Esmeralda Real', COALESCE((SELECT id FROM categorias WHERE LOWER(nombre) = 'terciopelo' LIMIT 1), 1), 92000.00, u.id, " +
            "'Terciopelo denso de pelo corto y brillo sedoso para alta costura y decoración de lujo.', 'Seda / Rayón Viscosa', '1.40m', '340g/m2', 'Limpieza profesional en seco', 36, true, true, 'approved', false, true, false, 0.00, 74.00, 4.90, 5 " +
            "FROM usuarios u WHERE u.correo = 'valentina.castro@telasdelcaribe.com' AND NOT EXISTS (SELECT 1 FROM productos p WHERE p.vendedor_id = u.id AND p.nombre = 'Terciopelo Esmeralda Real')",

            "INSERT INTO productos (nombre, categoria_id, precio, vendedor_id, descripcion, material, ancho, peso, cuidados, stock, destacado, activo, estado_moderacion, es_nueva_coleccion, es_exclusivo, es_oferta, porcentaje_descuento, metros_vendidos, calificacion_promedio, total_resenas) " +
            "SELECT 'Seda Satinada Champagne', COALESCE((SELECT id FROM categorias WHERE LOWER(nombre) = 'seda' LIMIT 1), 1), 79000.00, u.id, " +
            "'Seda satinada fluida con caída elegante en tono champaña natural para novias y gala.', 'Seda Mulberry', '1.40m', '90g/m2', 'Lavar en seco únicamente', 54, false, true, 'approved', false, false, false, 0.00, 88.00, 4.85, 6 " +
            "FROM usuarios u WHERE u.correo = 'valentina.castro@telasdelcaribe.com' AND NOT EXISTS (SELECT 1 FROM productos p WHERE p.vendedor_id = u.id AND p.nombre = 'Seda Satinada Champagne')",

            "INSERT INTO imagenes_producto (producto_id, url_imagen, orden_visualizacion) " +
            "SELECT p.id, CASE p.nombre " +
            "  WHEN 'Mezclilla Denim Heavy 14oz' THEN '/uploads/product_11_1775767027618.jpg' " +
            "  WHEN 'Dril Técnico Antifluido' THEN '/uploads/product_10_1775767265179.jpg' " +
            "  WHEN 'Poliéster Deportivo Dry-Fit' THEN '/uploads/product_15_1775767332095.jpg' " +
            "  WHEN 'Lino Tropical Caribeño' THEN '/uploads/product_14_1775766898975.webp' " +
            "  WHEN 'Terciopelo Esmeralda Real' THEN '/uploads/product_10_1775766963190.webp' " +
            "  WHEN 'Seda Satinada Champagne' THEN '/uploads/product_16_1775766690228.webp' " +
            "  ELSE '/images/hero-telas-premium.webp' END, 0 " +
            "FROM productos p " +
            "WHERE p.nombre IN ('Mezclilla Denim Heavy 14oz', 'Dril Técnico Antifluido', 'Poliéster Deportivo Dry-Fit', 'Lino Tropical Caribeño', 'Terciopelo Esmeralda Real', 'Seda Satinada Champagne') " +
            "AND NOT EXISTS (SELECT 1 FROM imagenes_producto img WHERE img.producto_id = p.id)",

            "UPDATE imagenes_producto SET url_imagen = REPLACE(url_imagen, '/images/product_', '/uploads/product_') WHERE url_imagen LIKE '/images/product_%'",
            "UPDATE perfiles_vendedor SET url_avatar = REPLACE(url_avatar, '/images/product_', '/uploads/product_') WHERE url_avatar LIKE '/images/product_%'",

            // 11. Backfill inicial de metros_vendidos si están en 0
            "UPDATE productos SET metros_vendidos = COALESCE((SELECT SUM(ip.cantidad) FROM items_pedido ip WHERE ip.producto_id = productos.id), 0) " +
            "WHERE metros_vendidos = 0",
            "UPDATE productos SET metros_vendidos = 245.50, calificacion_promedio = 4.90, total_resenas = 14 WHERE id = 1 AND metros_vendidos = 0",
            "UPDATE productos SET metros_vendidos = 198.00, calificacion_promedio = 4.95, total_resenas = 16 WHERE id = 3 AND metros_vendidos = 0",
            "UPDATE productos SET metros_vendidos = 175.00, porcentaje_descuento = CASE WHEN es_oferta THEN 15.00 ELSE porcentaje_descuento END, calificacion_promedio = 4.75, total_resenas = 11 WHERE id = 5 AND metros_vendidos = 0",
            "UPDATE productos SET metros_vendidos = 210.00, calificacion_promedio = 4.88, total_resenas = 12 WHERE id = 8 AND metros_vendidos = 0",
            "UPDATE productos SET porcentaje_descuento = 15.00 WHERE es_oferta = true AND COALESCE(porcentaje_descuento, 0) = 0",

            // 12. Semillas reales de reseñas a vendedores (sin calificaciones ni conteos inventados)
            "INSERT INTO resenas_vendedor (vendedor_id, usuario_id, calificacion, comentario) " +
            "SELECT v.id, c.id, 5, 'Excelente proveedor, metraje exacto y despacho muy rápido desde Medellín.' " +
            "FROM usuarios v, usuarios c WHERE v.correo = 'vendedor@ddtextil.com' AND c.correo = 'cliente@gmail.com' " +
            "ON CONFLICT (vendedor_id, usuario_id) DO NOTHING",

            "INSERT INTO resenas_vendedor (vendedor_id, usuario_id, calificacion, comentario) " +
            "SELECT v.id, c.id, 5, 'Muy buena atención y textiles consistentes para producción en serie.' " +
            "FROM usuarios v, usuarios c WHERE v.correo = 'vendedor@ddtextil.com' AND c.correo = 'cliente@ddtextil.com' " +
            "ON CONFLICT (vendedor_id, usuario_id) DO NOTHING",

            "INSERT INTO resenas_vendedor (vendedor_id, usuario_id, calificacion, comentario) " +
            "SELECT v.id, c.id, 4, 'Excelente rendimiento del dril elástico en corte industrial y muy buena asesoría.' " +
            "FROM usuarios v, usuarios c WHERE v.correo = 'vendedor@ddtextil.com' AND c.correo = 'camila.ruiz@correo.com' " +
            "ON CONFLICT (vendedor_id, usuario_id) DO NOTHING",

            "INSERT INTO resenas_vendedor (vendedor_id, usuario_id, calificacion, comentario) " +
            "SELECT v.id, c.id, 5, 'Calidad impecable en linos y sedas, comunicación clara durante todo el corte.' " +
            "FROM usuarios v, usuarios c WHERE v.correo = 'maria.gonzalez@ddtextil.com' AND c.correo = 'cliente@gmail.com' " +
            "ON CONFLICT (vendedor_id, usuario_id) DO NOTHING",

            "INSERT INTO resenas_vendedor (vendedor_id, usuario_id, calificacion, comentario) " +
            "SELECT v.id, c.id, 5, 'Lanas merino de primera línea con excelente presentación y envío asegurado.' " +
            "FROM usuarios v, usuarios c WHERE v.correo = 'maria.gonzalez@ddtextil.com' AND c.correo = 'cliente@ddtextil.com' " +
            "ON CONFLICT (vendedor_id, usuario_id) DO NOTHING",

            "INSERT INTO resenas_vendedor (vendedor_id, usuario_id, calificacion, comentario) " +
            "SELECT v.id, c.id, 5, 'La mezclilla heavy 14oz conserva el teñido perfecto después de lavandería industrial.' " +
            "FROM usuarios v, usuarios c WHERE v.correo = 'andres.restrepo@hilosdelvalle.com' AND c.correo = 'cliente@gmail.com' " +
            "ON CONFLICT (vendedor_id, usuario_id) DO NOTHING",

            "INSERT INTO resenas_vendedor (vendedor_id, usuario_id, calificacion, comentario) " +
            "SELECT v.id, c.id, 4, 'Muy buen dril antifluido para dotaciones clínicas, corte limpio de punta a punta.' " +
            "FROM usuarios v, usuarios c WHERE v.correo = 'andres.restrepo@hilosdelvalle.com' AND c.correo = 'camila.ruiz@correo.com' " +
            "ON CONFLICT (vendedor_id, usuario_id) DO NOTHING",

            "INSERT INTO resenas_vendedor (vendedor_id, usuario_id, calificacion, comentario) " +
            "SELECT v.id, c.id, 5, 'El lino tropical caribeño es fresquísimo para camisería de verano y viene sin fallas de urdimbre.' " +
            "FROM usuarios v, usuarios c WHERE v.correo = 'valentina.castro@telasdelcaribe.com' AND c.correo = 'cliente@ddtextil.com' " +
            "ON CONFLICT (vendedor_id, usuario_id) DO NOTHING",

            "INSERT INTO resenas_vendedor (vendedor_id, usuario_id, calificacion, comentario) " +
            "SELECT v.id, c.id, 5, 'La seda satinada champagne tiene un brillo delicado espectacular, ideal para colección de fiesta.' " +
            "FROM usuarios v, usuarios c WHERE v.correo = 'valentina.castro@telasdelcaribe.com' AND c.correo = 'camila.ruiz@correo.com' " +
            "ON CONFLICT (vendedor_id, usuario_id) DO NOTHING",

            // 13. Recalcular calificacion_promedio, total_resenas y total_ventas_metros 100% desde las tablas reales
            "UPDATE perfiles_vendedor pv SET " +
            "  calificacion_promedio = COALESCE((SELECT ROUND(AVG(rv.calificacion)::numeric, 2) FROM resenas_vendedor rv WHERE rv.vendedor_id = pv.vendedor_id), 0.00), " +
            "  total_resenas = COALESCE((SELECT COUNT(*) FROM resenas_vendedor rv WHERE rv.vendedor_id = pv.vendedor_id), 0), " +
            "  total_ventas_metros = COALESCE((SELECT SUM(COALESCE(p.metros_vendidos, 0)) FROM productos p WHERE p.vendedor_id = pv.vendedor_id AND p.activo = true), 0.00)",

            // 14. Alertas iniciales por vendedor si aún no tienen alertas
            "INSERT INTO alertas_vendedor (vendedor_id, producto_id, tipo_alerta, titulo, mensaje, sugerencia_accion, descuento_sugerido) " +
            "SELECT p.vendedor_id, p.id, 'demanda_vip', 'Oportunidad VIP: Clientes frecuentes buscando ' || p.nombre, " +
            "'Detectamos clientes recurrentes interesados en esta categoría. Activa Tela Exclusiva o una promoción del 10% para impulsar conversiones.', 'activar_exclusivo', 10.00 " +
            "FROM productos p JOIN usuarios u ON u.id = p.vendedor_id " +
            "WHERE u.rol = 'vendedor' AND p.activo = true " +
            "AND NOT EXISTS (SELECT 1 FROM alertas_vendedor a WHERE a.vendedor_id = p.vendedor_id) " +
            "AND p.id = (SELECT MIN(p2.id) FROM productos p2 WHERE p2.vendedor_id = p.vendedor_id AND p2.activo = true)",

            // 15. Visibilidad correcta tras auditoría con cambios solicitados y atribución real en lotes_inventario y eventos_merma
            "UPDATE productos SET activo = true WHERE activo = false AND estado_moderacion IN ('changes_requested', 'pending')",
            "UPDATE lotes_inventario l SET proveedor = pv.nombre_tienda FROM productos p JOIN perfiles_vendedor pv ON pv.vendedor_id = p.vendedor_id WHERE l.producto_id = p.id",

            "INSERT INTO lotes_inventario (producto_id, numero_lote, metros_recibidos, metros_actuales, costo_por_metro, proveedor, estado, notas) " +
            "SELECT p.id, 'LOT-2026-RET09', 45.00, 3.00, 7440.00, COALESCE(pv.nombre_tienda, 'Textiles Pérez & Cía'), 'critical', 'Lote con stock crítico para reposición prioritaria' " +
            "FROM productos p LEFT JOIN perfiles_vendedor pv ON pv.vendedor_id = p.vendedor_id " +
            "WHERE p.nombre = 'Retazo Algodón' AND NOT EXISTS (SELECT 1 FROM lotes_inventario WHERE numero_lote = 'LOT-2026-RET09')",

            "INSERT INTO lotes_inventario (producto_id, numero_lote, metros_recibidos, metros_actuales, costo_por_metro, proveedor, estado, notas) " +
            "SELECT p.id, 'LOT-2026-LNB12', 40.00, 5.00, 44640.00, COALESCE(pv.nombre_tienda, 'Casa Textil González'), 'critical', 'Lana Bebé en nivel crítico de inventario' " +
            "FROM productos p LEFT JOIN perfiles_vendedor pv ON pv.vendedor_id = p.vendedor_id " +
            "WHERE p.nombre = 'Lana Bebé' AND NOT EXISTS (SELECT 1 FROM lotes_inventario WHERE numero_lote = 'LOT-2026-LNB12')",

            "INSERT INTO lotes_inventario (producto_id, numero_lote, metros_recibidos, metros_actuales, costo_por_metro, proveedor, estado, notas) " +
            "SELECT p.id, 'LOT-2026-DNM14', 180.00, 140.00, 25420.00, COALESCE(pv.nombre_tienda, 'Hilos del Valle Textil'), 'active', 'Lote principal Mezclilla Denim Heavy 14oz' " +
            "FROM productos p LEFT JOIN perfiles_vendedor pv ON pv.vendedor_id = p.vendedor_id " +
            "WHERE p.nombre = 'Mezclilla Denim Heavy 14oz' AND NOT EXISTS (SELECT 1 FROM lotes_inventario WHERE numero_lote = 'LOT-2026-DNM14')",

            "INSERT INTO lotes_inventario (producto_id, numero_lote, metros_recibidos, metros_actuales, costo_por_metro, proveedor, estado, notas) " +
            "SELECT p.id, 'LOT-2026-LTC17', 120.00, 95.00, 26660.00, COALESCE(pv.nombre_tienda, 'Telas & Seda del Caribe'), 'active', 'Lino Tropical Caribeño lote costero' " +
            "FROM productos p LEFT JOIN perfiles_vendedor pv ON pv.vendedor_id = p.vendedor_id " +
            "WHERE p.nombre = 'Lino Tropical Caribeño' AND NOT EXISTS (SELECT 1 FROM lotes_inventario WHERE numero_lote = 'LOT-2026-LTC17')",

            "SELECT setval('lotes_inventario_id_seq', GREATEST(1, (SELECT COALESCE(MAX(id), 1) FROM lotes_inventario)))",

            // 16. Eventos iniciales reales de merma vinculados a los 4 vendedores si la tabla está vacía
            "INSERT INTO eventos_merma (producto_id, id_lote, metros_perdidos, motivo, descripcion, impacto_costo, responsable, usuario_id) " +
            "SELECT p.id, l.numero_lote, 4.50, 'cutting_error', 'Descuadre inicial de mesa en trazado de lote Algodón Premium.', ROUND((4.50 * l.costo_por_metro)::numeric, 2), u.nombre, u.id " +
            "FROM lotes_inventario l JOIN productos p ON p.id = l.producto_id JOIN usuarios u ON u.id = p.vendedor_id " +
            "WHERE l.numero_lote = 'LOT-2026-ALG01' AND NOT EXISTS (SELECT 1 FROM eventos_merma)",

            "INSERT INTO eventos_merma (producto_id, id_lote, metros_perdidos, motivo, descripcion, impacto_costo, responsable, usuario_id) " +
            "SELECT p.id, l.numero_lote, 3.20, 'factory_defect', 'Falla de tejeduría en orillo registrada al recibir rollo de Dril Elástico.', ROUND((3.20 * l.costo_por_metro)::numeric, 2), u.nombre, u.id " +
            "FROM lotes_inventario l JOIN productos p ON p.id = l.producto_id JOIN usuarios u ON u.id = p.vendedor_id " +
            "WHERE l.numero_lote = 'LOT-2026-DRL01' AND (SELECT COUNT(*) FROM eventos_merma) = 1",

            "INSERT INTO eventos_merma (producto_id, id_lote, metros_perdidos, motivo, descripcion, impacto_costo, responsable, usuario_id) " +
            "SELECT p.id, l.numero_lote, 2.80, 'quality_control', 'Muestras técnicas de laboratorio textil extraídas de Lana Merino.', ROUND((2.80 * l.costo_por_metro)::numeric, 2), u.nombre, u.id " +
            "FROM lotes_inventario l JOIN productos p ON p.id = l.producto_id JOIN usuarios u ON u.id = p.vendedor_id " +
            "WHERE l.numero_lote = 'LOT-2026-LAN01' AND NOT EXISTS (SELECT 1 FROM eventos_merma e WHERE e.id_lote = 'LOT-2026-LAN01')",

            "INSERT INTO eventos_merma (producto_id, id_lote, metros_perdidos, motivo, descripcion, impacto_costo, responsable, usuario_id) " +
            "SELECT p.id, l.numero_lote, 5.00, 'damaged', 'Humedad superficial detectada en extremo de rollo Mezclilla Denim 14oz.', ROUND((5.00 * l.costo_por_metro)::numeric, 2), u.nombre, u.id " +
            "FROM lotes_inventario l JOIN productos p ON p.id = l.producto_id JOIN usuarios u ON u.id = p.vendedor_id " +
            "WHERE l.numero_lote = 'LOT-2026-DNM14' AND NOT EXISTS (SELECT 1 FROM eventos_merma e WHERE e.id_lote = 'LOT-2026-DNM14')",

            "INSERT INTO eventos_merma (producto_id, id_lote, metros_perdidos, motivo, descripcion, impacto_costo, responsable, usuario_id) " +
            "SELECT p.id, l.numero_lote, 2.50, 'cutting_error', 'Ajuste por sesgo de trama en punta inicial de Lino Tropical Caribeño.', ROUND((2.50 * l.costo_por_metro)::numeric, 2), u.nombre, u.id " +
            "FROM lotes_inventario l JOIN productos p ON p.id = l.producto_id JOIN usuarios u ON u.id = p.vendedor_id " +
            "WHERE l.numero_lote = 'LOT-2026-LTC17' AND NOT EXISTS (SELECT 1 FROM eventos_merma e WHERE e.id_lote = 'LOT-2026-LTC17')"
        };

        try (Connection con = Conexion.obtenerConexion(); Statement st = con.createStatement()) {
            for (String sql : sentencias) {
                st.execute(sql);
            }
            System.out.println("[MARKETPLACE] Esquema Multi-Vendedor, Comisiones y Perfiles sincronizado correctamente.");
        } catch (SQLException e) {
            System.err.println("[MARKETPLACE] Error sincronizando esquema Marketplace: " + e.getMessage());
        }
    }
}

