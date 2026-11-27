-- ============================================================================
-- 02_datos_iniciales.sql — Población de Datos Iniciales para D&D Textil
-- ============================================================================

-- Asegurar hashes SHA-256 en UTF-8 y cuentas reales iniciales
UPDATE usuarios SET contrasena_hash = '56976bf24998ca63e35fe4f1e2469b5751d1856003e8d16fef0aafef496ed044',
    telefono = COALESCE(NULLIF(telefono, ''), '+57 301 482 1940')
WHERE correo = 'vendedor@ddtextil.com';
UPDATE usuarios SET contrasena_hash = '56976bf24998ca63e35fe4f1e2469b5751d1856003e8d16fef0aafef496ed044',
    telefono = COALESCE(NULLIF(telefono, ''), '+57 312 654 8821')
WHERE correo = 'maria.gonzalez@ddtextil.com';
UPDATE usuarios SET contrasena_hash = '09a31a7001e261ab1e056182a71d3cf57f582ca9a29cff5eb83be0f0549730a9' WHERE correo IN ('cliente@gmail.com', 'cliente@ddtextil.com');

INSERT INTO usuarios (nombre, correo, telefono, contrasena_hash, rol, activo, tasa_comision) VALUES
('Andrés Restrepo', 'andres.restrepo@hilosdelvalle.com', '+57 318 742 3319', '56976bf24998ca63e35fe4f1e2469b5751d1856003e8d16fef0aafef496ed044', 'vendedor', true, 10.00),
('Valentina Castro', 'valentina.castro@telasdelcaribe.com', '+57 300 915 4472', '56976bf24998ca63e35fe4f1e2469b5751d1856003e8d16fef0aafef496ed044', 'vendedor', true, 10.00),
('Camila Ruiz', 'camila.ruiz@correo.com', '+57 315 809 2214', '09a31a7001e261ab1e056182a71d3cf57f582ca9a29cff5eb83be0f0549730a9', 'cliente', true, NULL)
ON CONFLICT (correo) DO UPDATE SET
    contrasena_hash = EXCLUDED.contrasena_hash,
    telefono = COALESCE(NULLIF(usuarios.telefono, ''), EXCLUDED.telefono);

-- 1. PRODUCTOS
INSERT INTO productos (id, nombre, categoria_id, precio, vendedor_id, descripcion, material, ancho, peso, cuidados, stock, destacado, activo, estado_moderacion, es_nueva_coleccion, es_exclusivo, es_oferta) VALUES
(1, 'Algodón Premium', 1, 25000.00, 2, 'Tela de algodón 100% natural, ideal para camisas y blusas.', 'Algodón 100%', '1.50m', '150g/m2', 'Lavar en frío, no blanquear', 100, true, true, 'approved', true, false, false),
(2, 'Seda Italiana', 2, 85000.00, 2, 'Seda pura con acabado brillante, perfecta para vestidos de gala.', 'Seda pura', '1.40m', '80g/m2', 'Limpieza en seco únicamente', 50, true, true, 'approved', false, true, false),
(3, 'Lino Orgánico', 3, 45000.00, 3, 'Lino fresco y transpirable para ropa de verano.', 'Lino orgánico', '1.50m', '200g/m2', 'No usar secadora', 80, false, true, 'approved', true, false, false),
(4, 'Lana Merino', 4, 65000.00, 3, 'Lana suave y cálida, ideal para abrigos de invierno.', 'Lana merino', '1.60m', '300g/m2', 'Lavar a mano con agua tibia', 30, true, true, 'approved', false, true, false),
(5, 'Dril Elástico', 7, 35000.00, 2, 'Dril resistente con toque de elasticidad para pantalones.', 'Algodón/Lycra 95/5', '1.50m', '250g/m2', 'Lavar a máquina en ciclo suave', 120, false, true, 'approved', false, false, true),
(6, 'Gasa de Seda', 2, 72000.00, 3, 'Gasa ligera y transparente para pañuelos y cortinas.', 'Seda/Poliéster', '1.40m', '45g/m2', 'Lavar a mano', 60, true, true, 'approved', false, true, false),
(7, 'Tela Polar', 5, 22000.00, 2, 'Tela polar suave para cobijas y chaquetas.', 'Poliéster 100%', '1.50m', '280g/m2', 'Lavar a máquina, no planchar', 150, false, true, 'approved', false, false, true),
(8, 'Oxford Camisa', 1, 38000.00, 3, 'Tela oxford clásica para camisas formales.', 'Algodón peinado', '1.50m', '130g/m2', 'Planchar a temperatura media', 90, false, true, 'approved', true, false, false),
(9, 'Retazo Algodón', 1, 12000.00, 2, 'Retazo de algodón premium, disponible para proyectos pequeños.', 'Algodón', '1.40m', '150g/m2', 'Lavar a máquina', 3, false, true, 'approved', false, false, true),
(10, 'Seda Cruda', 2, 95000.00, 2, 'Seda cruda sin teñir, última pieza disponible.', 'Seda pura', '1.10m', '60g/m2', 'Limpieza en seco', 8, false, true, 'approved', false, true, false),
(11, 'Lino Arrugado', 3, 38000.00, 2, 'Lino con textura arrugada natural.', 'Lino', '1.50m', '180g/m2', 'Planchar en caliente', 25, false, true, 'approved', false, false, true),
(12, 'Lana Bebé', 4, 72000.00, 3, 'Lana ultra suave para ropa de bebé. Quedan pocos metros.', 'Lana merino', '1.30m', '200g/m2', 'Lavar a mano', 5, false, true, 'approved', true, false, false),
(13, 'Algodón Estampado', 1, 28000.00, 3, 'Algodón con estampado floral, edición limitada.', 'Algodón', '1.45m', '130g/m2', 'Lavar a máquina', 12, false, true, 'approved', true, false, false)
ON CONFLICT (id) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    precio = EXCLUDED.precio,
    stock = EXCLUDED.stock,
    destacado = EXCLUDED.destacado,
    activo = EXCLUDED.activo,
    estado_moderacion = EXCLUDED.estado_moderacion,
    es_nueva_coleccion = EXCLUDED.es_nueva_coleccion,
    es_exclusivo = EXCLUDED.es_exclusivo,
    es_oferta = EXCLUDED.es_oferta;

SELECT pg_catalog.setval('public.productos_id_seq', 13, true);

-- 2. IMÁGENES DE PRODUCTOS
DELETE FROM imagenes_producto;
INSERT INTO imagenes_producto (producto_id, url_imagen, orden_visualizacion) VALUES
(1, '/uploads/product_12_1775767112691.jpg', 0),
(2, '/uploads/product_16_1775766690228.webp', 0),
(3, '/uploads/product_14_1775766898975.webp', 0),
(4, '/uploads/product_14_1775766898975.webp', 0),
(5, '/uploads/product_10_1775767265179.jpg', 0),
(6, '/uploads/product_16_1775766690228.webp', 0),
(7, '/uploads/product_15_1775767332095.jpg', 0),
(8, '/uploads/product_12_1775767112691.jpg', 0),
(9, '/uploads/product_9_1775766848979.jpg', 0),
(10, '/uploads/product_10_1775766963190.webp', 0),
(11, '/uploads/product_11_1775767027618.jpg', 0),
(12, '/uploads/product_15_1775767332095.jpg', 0),
(13, '/uploads/product_13_1777056293881.jpg', 0);

-- 3. DIAPOSITIVAS DEL CARRUSEL
INSERT INTO diapositivas_carrusel (id, titulo, subtitulo, imagen, cta, clave_seccion, activo, orden) VALUES
(1, 'Nueva Colección 2026', 'Tendencias exclusivas en telas premium', '/images/carousel-nueva-coleccion.webp', 'Ver Más', 'nuevas', true, 1),
(2, 'Telas Exclusivas', 'Diseños únicos para proyectos especiales', '/images/carousel-telas-exclusivas.webp', 'Explorar', 'exclusivas', true, 2),
(3, 'Ofertas Especiales', 'Descuentos increíbles en telas seleccionadas', '/images/carousel-ofertas-especiales.webp', 'Ver Ofertas', 'ofertas', true, 3)
ON CONFLICT (id) DO UPDATE SET
    titulo = EXCLUDED.titulo,
    subtitulo = EXCLUDED.subtitulo,
    imagen = EXCLUDED.imagen,
    cta = EXCLUDED.cta,
    clave_seccion = EXCLUDED.clave_seccion,
    activo = EXCLUDED.activo,
    orden = EXCLUDED.orden;

SELECT pg_catalog.setval('public.diapositivas_carrusel_id_seq', 3, true);

-- 4. UMBRALES DE STOCK
INSERT INTO umbrales_stock (tipo_tela, metros_minimos, alerta_activa) VALUES
('Algodón Premium', 20.00, true),
('Seda Italiana', 15.00, true),
('Lino Orgánico', 25.00, true),
('Lana Merino', 10.00, true),
('Dril Elástico', 30.00, true)
ON CONFLICT (tipo_tela) DO NOTHING;

-- 5. VENTAS POR REGIÓN
INSERT INTO ventas_region (region, capital, ventas_totales, pedidos_totales, porcentaje) VALUES
('Bogotá D.C.', 'Bogotá', 43955905.83, 145, 35.50),
('Antioquia', 'Medellín', 20517276.65, 82, 18.20),
('Valle del Cauca', 'Cali', 29667382.08, 98, 22.40),
('Atlántico', 'Barranquilla', 33479140.61, 64, 15.10),
('Santander', 'Bucaramanga', 33396670.43, 41, 8.80)
ON CONFLICT (region) DO UPDATE SET
    capital = EXCLUDED.capital,
    ventas_totales = EXCLUDED.ventas_totales,
    pedidos_totales = EXCLUDED.pedidos_totales,
    porcentaje = EXCLUDED.porcentaje;

-- 6. ACTIVIDAD RECIENTE
INSERT INTO actividad_reciente (tipo, usuario_id, nombre_usuario, accion) VALUES
('venta', 2, 'Carlos Pérez', 'Venta de Algodón Premium x50m'),
('usuario', 4, 'Juan Cliente', 'Se registró como nuevo cliente'),
('sistema', 1, 'Sistema', 'Alerta de stock bajo: Lana Merino'),
('venta', 3, 'María González', 'Compra de Seda Italiana x3m');

-- 7. INVENTARIO TELAS ERP
INSERT INTO inventario_telas_erp (sku, nombre_tela, categoria, proveedor, metros_actuales, metros_minimos, costo_por_metro, fecha_ultima_reposicion) VALUES
('ALG-001', 'Algodón Egipcio Blanco', 'Algodón', 'Textil Corp', 1200.50, 100.00, 25000, '2026-06-14'),
('SED-042', 'Seda Pura Escarlata', 'Seda', 'Importaciones V&G', 35.00, 50.00, 85000, '2026-05-30'),
('LIN-112', 'Lino Rústico Crudo', 'Lino', 'Textil Corp', 450.00, 80.00, 42000, '2026-06-19'),
('TER-998', 'Terciopelo Azul Noche', 'Terciopelo', 'Tejidos Premium', 15.00, 30.00, 110000, '2026-05-15'),
('DRL-201', 'Dril Elástico Natural', 'Dril', 'Drilones Industriales', 380.00, 50.00, 38000, '2026-06-24'),
('LAN-055', 'Lana Merino Gris', 'Lana', 'Lanera del Sur', 120.00, 20.00, 65000, '2026-06-09')
ON CONFLICT (sku) DO NOTHING;

-- 8. NOTIFICACIONES ERP
INSERT INTO notificaciones_sistema_erp (tipo, titulo, mensaje, leido) VALUES
('warning', 'Retraso de Proveedor', 'El envío de Seda Pura desde Italia presenta 2 días de retraso.', false),
('success', 'Pedido Mayorista B2B', 'Textiles Premium SAS solicitó 500m de Lino Blanco.', false),
('info', 'Reporte Semanal Generado', 'El balance de ventas semanales está listo para descarga.', false);

-- 9. LOTES DE INVENTARIO
INSERT INTO lotes_inventario (id, producto_id, numero_lote, metros_recibidos, metros_actuales, costo_por_metro, proveedor, estado, fecha_recepcion, notas) VALUES
(1, 1, 'LOT-2026-ALG01', 120.00, 100.00, 15000.00, 'Textil Corp', 'active', '2026-06-01', 'Lote inicial de Algodón Premium'),
(2, 2, 'LOT-2026-SED01', 60.00, 50.00, 52000.00, 'Importaciones V&G', 'active', '2026-06-05', 'Seda importada grado A'),
(3, 3, 'LOT-2026-LIN01', 100.00, 80.00, 28000.00, 'Textil Corp', 'active', '2026-06-10', 'Lino orgánico certificado'),
(4, 4, 'LOT-2026-LAN01', 40.00, 30.00, 42000.00, 'Lanera del Sur', 'low', '2026-06-12', 'Lote de Lana Merino'),
(5, 5, 'LOT-2026-DRL01', 150.00, 120.00, 21000.00, 'Drilones Industriales', 'active', '2026-06-15', 'Dril elástico industrial')
ON CONFLICT (id) DO UPDATE SET
    metros_actuales = EXCLUDED.metros_actuales,
    estado = EXCLUDED.estado;

SELECT pg_catalog.setval('public.lotes_inventario_id_seq', 5, true);

-- 10. ROLLOS TEXTILES FÍSICOS
INSERT INTO rollos_textil (codigo_rollo, producto_id, metraje_inicial, metraje_remanente, lote_tintoreria, estado, ubicacion_bodega) VALUES
('ROL-001', 3, 50.00, 45.00, 'LOT-2026-A', 'disponible', 'PAS-02-EST-04'),
('ROL-002', 1, 100.00, 100.00, 'LOT-2026-ALG01', 'disponible', 'PAS-01-EST-01'),
('ROL-003', 2, 60.00, 50.00, 'LOT-2026-SED01', 'disponible', 'PAS-03-EST-02'),
('ROL-004', 4, 40.00, 30.00, 'LOT-2026-LAN01', 'disponible', 'PAS-04-EST-01'),
('ROL-005', 5, 150.00, 120.00, 'LOT-2026-DRL01', 'disponible', 'PAS-01-EST-05')
ON CONFLICT (codigo_rollo) DO UPDATE SET
    metraje_remanente = EXCLUDED.metraje_remanente,
    ubicacion_bodega = EXCLUDED.ubicacion_bodega;

-- 11. VENTAS DIARIAS E HISTÓRICO ERP
INSERT INTO ventas_diarias (fecha_venta, ventas_totales, pedidos_totales) VALUES
(CURRENT_DATE - INTERVAL '6 days', 1850000.00, 6),
(CURRENT_DATE - INTERVAL '5 days', 2420000.00, 8),
(CURRENT_DATE - INTERVAL '4 days', 1980000.00, 5),
(CURRENT_DATE - INTERVAL '3 days', 3150000.00, 11),
(CURRENT_DATE - INTERVAL '2 days', 2760000.00, 9),
(CURRENT_DATE - INTERVAL '1 day', 3490000.00, 12),
(CURRENT_DATE, 2890000.00, 10)
ON CONFLICT (fecha_venta) DO NOTHING;

INSERT INTO metricas_ventas_erp (fecha_registro, ventas_reales, ventas_objetivo, margen_ganancia) VALUES
(CURRENT_DATE - INTERVAL '4 days', 1980000.00, 2200000.00, 31.50),
(CURRENT_DATE - INTERVAL '3 days', 3150000.00, 2800000.00, 34.20),
(CURRENT_DATE - INTERVAL '2 days', 2760000.00, 2600000.00, 32.80),
(CURRENT_DATE - INTERVAL '1 day', 3490000.00, 3000000.00, 35.10),
(CURRENT_DATE, 2890000.00, 3100000.00, 33.40)
ON CONFLICT (fecha_registro) DO NOTHING;

-- 12. PERFILES PÚBLICOS DE VENDEDORES (TIENDAS MARKETPLACE TIPO FACEBOOK)
UPDATE usuarios SET tasa_comision = COALESCE(tasa_comision, 10.00) WHERE rol = 'vendedor';

-- Productos adicionales para Hilos del Valle Textil y Telas & Seda del Caribe
INSERT INTO productos (id, nombre, categoria_id, precio, vendedor_id, descripcion, material, ancho, peso, cuidados, stock, destacado, activo, estado_moderacion, es_nueva_coleccion, es_exclusivo, es_oferta, porcentaje_descuento, metros_vendidos, calificacion_promedio, total_resenas) VALUES
(14, 'Mezclilla Denim Heavy 14oz', 8, 41000.00, (SELECT id FROM usuarios WHERE correo = 'andres.restrepo@hilosdelvalle.com'), 'Mezclilla rígida tejida en telar tradicional de 14 onzas para jeans, chaquetas y overoles.', 'Algodón 100%', '1.50m', '420g/m2', 'Lavar al revés con colores oscuros', 140, true, true, 'approved', true, false, false, 0.00, 165.00, 4.90, 9),
(15, 'Dril Técnico Antifluido', 7, 32500.00, (SELECT id FROM usuarios WHERE correo = 'andres.restrepo@hilosdelvalle.com'), 'Dril industrial con repelencia a líquidos ideal para dotación empresarial y ropa utilitaria.', 'Algodón 65% / Poliéster 35%', '1.55m', '260g/m2', 'No usar suavizante para preservar acabado', 180, false, true, 'approved', false, false, true, 12.00, 140.00, 4.75, 7),
(16, 'Poliéster Deportivo Dry-Fit', 5, 19500.00, (SELECT id FROM usuarios WHERE correo = 'andres.restrepo@hilosdelvalle.com'), 'Microfibra transpirable de secado ultrarrápido con protección UV para líneas deportivas.', 'Microfibra Poliéster', '1.60m', '145g/m2', 'Lavado en agua fría', 210, false, true, 'approved', true, false, false, 0.00, 120.00, 4.80, 6),
(17, 'Lino Tropical Caribeño', 3, 43000.00, (SELECT id FROM usuarios WHERE correo = 'valentina.castro@telasdelcaribe.com'), 'Lino liviano de fibra larga pensado para guayaberas, vestidos frescos y sastrería de clima cálido.', 'Lino 85% / Viscosa 15%', '1.48m', '170g/m2', 'Planchado a vapor suave', 95, true, true, 'approved', true, false, true, 10.00, 178.00, 4.95, 11),
(18, 'Terciopelo Esmeralda Real', 6, 92000.00, (SELECT id FROM usuarios WHERE correo = 'valentina.castro@telasdelcaribe.com'), 'Terciopelo denso de pelo corto y brillo sedoso para alta costura y decoración de lujo.', 'Seda / Rayón Viscosa', '1.40m', '340g/m2', 'Limpieza profesional en seco', 36, true, true, 'approved', false, true, false, 0.00, 74.00, 4.90, 5),
(19, 'Seda Satinada Champagne', 2, 79000.00, (SELECT id FROM usuarios WHERE correo = 'valentina.castro@telasdelcaribe.com'), 'Seda satinada fluida con caída elegante en tono champaña natural para novias y gala.', 'Seda Mulberry', '1.40m', '90g/m2', 'Lavar en seco únicamente', 54, false, true, 'approved', false, false, false, 0.00, 88.00, 4.85, 6)
ON CONFLICT (id) DO UPDATE SET
    vendedor_id = EXCLUDED.vendedor_id,
    precio = EXCLUDED.precio,
    activo = true,
    porcentaje_descuento = EXCLUDED.porcentaje_descuento,
    metros_vendidos = EXCLUDED.metros_vendidos;

SELECT pg_catalog.setval('public.productos_id_seq', GREATEST(19, (SELECT COALESCE(MAX(id), 1) FROM productos)), true);

DELETE FROM imagenes_producto WHERE producto_id BETWEEN 14 AND 19;
INSERT INTO imagenes_producto (producto_id, url_imagen, orden_visualizacion) VALUES
(14, '/uploads/product_11_1775767027618.jpg', 0),
(15, '/uploads/product_10_1775767265179.jpg', 0),
(16, '/uploads/product_15_1775767332095.jpg', 0),
(17, '/uploads/product_14_1775766898975.webp', 0),
(18, '/uploads/product_10_1775766963190.webp', 0),
(19, '/uploads/product_16_1775766690228.webp', 0);

INSERT INTO perfiles_vendedor (
    vendedor_id, nombre_tienda, slug_tienda, descripcion_bio, url_avatar, url_portada,
    ciudad, pais, especialidad, verificado, politica_envio, calificacion_promedio, total_resenas, total_ventas_metros
) VALUES
(
    (SELECT id FROM usuarios WHERE correo = 'vendedor@ddtextil.com'),
    'Textiles Pérez & Cía',
    'textiles-perez-cia',
    'Proveedores mayoristas y al detal de algodones peinados, driles industriales y sedas importadas con más de 15 años vistiendo confecciones en toda Latinoamérica.',
    '/images/hero-detail-1.webp',
    '/images/carousel-nueva-coleccion.webp',
    'Medellín',
    'Colombia',
    'Algodón Peinado, Dril y Seda Importada',
    true,
    'Despachos express en 24 horas hábiles desde Medellín. Cortes exactos certificados sin merma.',
    0.00, 0, 0.00
),
(
    (SELECT id FROM usuarios WHERE correo = 'maria.gonzalez@ddtextil.com'),
    'Casa Textil González',
    'casa-textil-gonzalez',
    'Boutique textil especializada en linos orgánicos certificados, lanas merino y gasas de alta costura para diseñadores y talleres exigentes.',
    '/images/hero-detail-2.webp',
    '/images/carousel-telas-exclusivas.webp',
    'Bogotá',
    'Colombia',
    'Lino Orgánico, Lana Merino y Alta Costura',
    true,
    'Envío asegurado nacional e internacional desde Bogotá. Muestras físicas disponibles bajo pedido.',
    0.00, 0, 0.00
),
(
    (SELECT id FROM usuarios WHERE correo = 'andres.restrepo@hilosdelvalle.com'),
    'Hilos del Valle Textil',
    'hilos-del-valle-textil',
    'Fábrica y distribuidora vallecaucana líder en mezclilla denim heavy, driles antifluido y textiles técnicos de alto rendimiento para dotación y moda urbana.',
    '/images/hero-detail-3.webp',
    '/images/hero-telas-premium.webp',
    'Cali',
    'Colombia',
    'Denim Heavy, Dril Técnico y Poliéster Deportivo',
    true,
    'Entrega en 24-48h a todo el país con control de calidad rollo a rollo y descuento por volumen.',
    0.00, 0, 0.00
),
(
    (SELECT id FROM usuarios WHERE correo = 'valentina.castro@telasdelcaribe.com'),
    'Telas & Seda del Caribe',
    'telas-y-seda-del-caribe',
    'Curaduría de linos tropicales frescos, terciopelos de autor y sedas satinadas inspiradas en la luz del Caribe colombiano para diseñadores de ocasión.',
    '/uploads/product_10_1775766963190.webp',
    '/images/carousel-ofertas-especiales.webp',
    'Barranquilla',
    'Colombia',
    'Lino Tropical, Terciopelo y Seda Satinada',
    true,
    'Despacho refrigerado contra humedad en empaque sellado. Envíos prioritarios a costa e interior.',
    0.00, 0, 0.00
)
ON CONFLICT (vendedor_id) DO UPDATE SET
    nombre_tienda = EXCLUDED.nombre_tienda,
    descripcion_bio = EXCLUDED.descripcion_bio,
    url_avatar = EXCLUDED.url_avatar,
    url_portada = EXCLUDED.url_portada,
    ciudad = EXCLUDED.ciudad,
    especialidad = EXCLUDED.especialidad,
    politica_envio = EXCLUDED.politica_envio;

-- Métricas iniciales competitivas en productos base
UPDATE productos SET metros_vendidos = 245.50, calificacion_promedio = 4.90, total_resenas = 14 WHERE id = 1;
UPDATE productos SET metros_vendidos = 132.00, calificacion_promedio = 4.85, total_resenas = 9 WHERE id = 2;
UPDATE productos SET metros_vendidos = 198.00, calificacion_promedio = 4.95, total_resenas = 16 WHERE id = 3;
UPDATE productos SET metros_vendidos = 84.00,  calificacion_promedio = 4.80, total_resenas = 7 WHERE id = 4;
UPDATE productos SET metros_vendidos = 175.00, porcentaje_descuento = 15.00, calificacion_promedio = 4.75, total_resenas = 11 WHERE id = 5;
UPDATE productos SET metros_vendidos = 96.00,  calificacion_promedio = 4.90, total_resenas = 8 WHERE id = 6;
UPDATE productos SET metros_vendidos = 160.00, porcentaje_descuento = 12.00, calificacion_promedio = 4.65, total_resenas = 10 WHERE id = 7;
UPDATE productos SET metros_vendidos = 210.00, calificacion_promedio = 4.88, total_resenas = 12 WHERE id = 8;
UPDATE productos SET metros_vendidos = 64.00,  porcentaje_descuento = 20.00, calificacion_promedio = 4.70, total_resenas = 5 WHERE id = 9;
UPDATE productos SET metros_vendidos = 52.00,  calificacion_promedio = 4.95, total_resenas = 4 WHERE id = 10;
UPDATE productos SET metros_vendidos = 115.00, porcentaje_descuento = 10.00, calificacion_promedio = 4.60, total_resenas = 6 WHERE id = 11;

-- 13. RESEÑAS REALES INICIALES DE VENDEDORES
INSERT INTO resenas_vendedor (vendedor_id, usuario_id, calificacion, comentario) VALUES
((SELECT id FROM usuarios WHERE correo = 'vendedor@ddtextil.com'), (SELECT id FROM usuarios WHERE correo = 'cliente@gmail.com'), 5, 'Excelente proveedor, el algodón llegó con el metraje exacto y empacado al vacío sin arrugas.'),
((SELECT id FROM usuarios WHERE correo = 'vendedor@ddtextil.com'), (SELECT id FROM usuarios WHERE correo = 'cliente@ddtextil.com'), 5, 'Muy buena atención y despacho rápido desde Medellín. Recomendado para producción en serie.'),
((SELECT id FROM usuarios WHERE correo = 'vendedor@ddtextil.com'), (SELECT id FROM usuarios WHERE correo = 'camila.ruiz@correo.com'), 4, 'Excelente rendimiento del dril elástico en corte industrial; el envío tardó un día adicional pero llegó intacto.'),
((SELECT id FROM usuarios WHERE correo = 'maria.gonzalez@ddtextil.com'), (SELECT id FROM usuarios WHERE correo = 'cliente@gmail.com'), 5, 'El lino orgánico de Casa Textil González tiene una caída incomparable. Muy cumplidos.'),
((SELECT id FROM usuarios WHERE correo = 'maria.gonzalez@ddtextil.com'), (SELECT id FROM usuarios WHERE correo = 'cliente@ddtextil.com'), 5, 'Calidad superior en lanas merino, siempre responden rápido todas las dudas técnicas.'),
((SELECT id FROM usuarios WHERE correo = 'andres.restrepo@hilosdelvalle.com'), (SELECT id FROM usuarios WHERE correo = 'cliente@gmail.com'), 5, 'La mezclilla heavy 14oz conserva el teñido perfecto después de lavandería industrial.'),
((SELECT id FROM usuarios WHERE correo = 'andres.restrepo@hilosdelvalle.com'), (SELECT id FROM usuarios WHERE correo = 'camila.ruiz@correo.com'), 4, 'Muy buen dril antifluido para dotaciones clínicas, corte limpio de punta a punta.'),
((SELECT id FROM usuarios WHERE correo = 'valentina.castro@telasdelcaribe.com'), (SELECT id FROM usuarios WHERE correo = 'cliente@ddtextil.com'), 5, 'El lino tropical caribeño es fresquísimo para camisería de verano y viene sin fallas de urdimbre.'),
((SELECT id FROM usuarios WHERE correo = 'valentina.castro@telasdelcaribe.com'), (SELECT id FROM usuarios WHERE correo = 'camila.ruiz@correo.com'), 5, 'La seda satinada champagne tiene un brillo delicado espectacular, ideal para colección de fiesta.')
ON CONFLICT (vendedor_id, usuario_id) DO NOTHING;

-- Recalcular métricas agregadas reales desde resenas_vendedor y productos
UPDATE perfiles_vendedor pv SET
    calificacion_promedio = COALESCE((SELECT ROUND(AVG(rv.calificacion)::numeric, 2) FROM resenas_vendedor rv WHERE rv.vendedor_id = pv.vendedor_id), 0.00),
    total_resenas = COALESCE((SELECT COUNT(*) FROM resenas_vendedor rv WHERE rv.vendedor_id = pv.vendedor_id), 0),
    total_ventas_metros = COALESCE((SELECT SUM(COALESCE(p.metros_vendidos, 0)) FROM productos p WHERE p.vendedor_id = pv.vendedor_id AND p.activo = true), 0.00);

-- 14. ALERTAS INTELIGENTES DE OPORTUNIDAD PARA VENDEDORES
INSERT INTO alertas_vendedor (vendedor_id, producto_id, tipo_alerta, titulo, mensaje, sugerencia_accion, descuento_sugerido)
SELECT (SELECT id FROM usuarios WHERE correo = 'vendedor@ddtextil.com'), 1, 'demanda_vip', 'Alta demanda de clientes frecuentes en Algodón', 'Clientes recurrentes buscan telas premium de Algodón. Activa exclusividad o una oferta especial en tu tela líder para capturar compras VIP.', 'activar_exclusivo', 10.00
WHERE NOT EXISTS (SELECT 1 FROM alertas_vendedor WHERE vendedor_id = (SELECT id FROM usuarios WHERE correo = 'vendedor@ddtextil.com') AND producto_id = 1 AND tipo_alerta = 'demanda_vip');

INSERT INTO alertas_vendedor (vendedor_id, producto_id, tipo_alerta, titulo, mensaje, sugerencia_accion, descuento_sugerido)
SELECT (SELECT id FROM usuarios WHERE correo = 'maria.gonzalez@ddtextil.com'), 8, 'competencia_precio', 'Competencia activa en categoría Algodón', 'Otro proveedor lidera el volumen de ventas en Algodón. Activa un descuento del 12% en Oxford Camisa para mejorar tu posicionamiento competitivo.', 'activar_descuento', 12.00
WHERE NOT EXISTS (SELECT 1 FROM alertas_vendedor WHERE vendedor_id = (SELECT id FROM usuarios WHERE correo = 'maria.gonzalez@ddtextil.com') AND producto_id = 8 AND tipo_alerta = 'competencia_precio');

INSERT INTO alertas_vendedor (vendedor_id, producto_id, tipo_alerta, titulo, mensaje, sugerencia_accion, descuento_sugerido)
SELECT (SELECT id FROM usuarios WHERE correo = 'andres.restrepo@hilosdelvalle.com'), 14, 'demanda_vip', 'Tendencia en Denim Heavy para clientes recurrentes', 'Tus compradores de dotación y moda urbana consultan telas exclusivas. Considera promover tu línea Denim o activar un descuento competitivo.', 'activar_descuento', 10.00
WHERE NOT EXISTS (SELECT 1 FROM alertas_vendedor WHERE vendedor_id = (SELECT id FROM usuarios WHERE correo = 'andres.restrepo@hilosdelvalle.com') AND tipo_alerta = 'demanda_vip');

INSERT INTO alertas_vendedor (vendedor_id, producto_id, tipo_alerta, titulo, mensaje, sugerencia_accion, descuento_sugerido)
SELECT (SELECT id FROM usuarios WHERE correo = 'valentina.castro@telasdelcaribe.com'), 19, 'demanda_vip', 'Alta demanda VIP en Sedas de Gala', 'Clientes frecuentes VIP están buscando sedas satinadas importadas. Activa exclusividad VIP en Seda Satinada Champagne para maximizar margen.', 'activar_exclusivo', 0.00
WHERE NOT EXISTS (SELECT 1 FROM alertas_vendedor WHERE vendedor_id = (SELECT id FROM usuarios WHERE correo = 'valentina.castro@telasdelcaribe.com') AND producto_id = 19 AND tipo_alerta = 'demanda_vip');

-- 15. LOTES REALES POR VENDEDOR Y EVENTOS REALES DE MERMA PARA AUDITORÍA
UPDATE lotes_inventario l SET proveedor = pv.nombre_tienda
FROM productos p JOIN perfiles_vendedor pv ON pv.vendedor_id = p.vendedor_id
WHERE l.producto_id = p.id;

INSERT INTO lotes_inventario (producto_id, numero_lote, metros_recibidos, metros_actuales, costo_por_metro, proveedor, estado, notas)
SELECT p.id, 'LOT-2026-RET09', 45.00, 3.00, 7440.00, COALESCE(pv.nombre_tienda, 'Textiles Pérez & Cía'), 'critical', 'Lote con stock crítico para reposición prioritaria'
FROM productos p LEFT JOIN perfiles_vendedor pv ON pv.vendedor_id = p.vendedor_id
WHERE p.nombre = 'Retazo Algodón' AND NOT EXISTS (SELECT 1 FROM lotes_inventario WHERE numero_lote = 'LOT-2026-RET09');

INSERT INTO lotes_inventario (producto_id, numero_lote, metros_recibidos, metros_actuales, costo_por_metro, proveedor, estado, notas)
SELECT p.id, 'LOT-2026-LNB12', 40.00, 5.00, 44640.00, COALESCE(pv.nombre_tienda, 'Casa Textil González'), 'critical', 'Lana Bebé en nivel crítico de inventario'
FROM productos p LEFT JOIN perfiles_vendedor pv ON pv.vendedor_id = p.vendedor_id
WHERE p.nombre = 'Lana Bebé' AND NOT EXISTS (SELECT 1 FROM lotes_inventario WHERE numero_lote = 'LOT-2026-LNB12');

INSERT INTO lotes_inventario (producto_id, numero_lote, metros_recibidos, metros_actuales, costo_por_metro, proveedor, estado, notas)
SELECT p.id, 'LOT-2026-DNM14', 180.00, 140.00, 25420.00, COALESCE(pv.nombre_tienda, 'Hilos del Valle Textil'), 'active', 'Lote principal Mezclilla Denim Heavy 14oz'
FROM productos p LEFT JOIN perfiles_vendedor pv ON pv.vendedor_id = p.vendedor_id
WHERE p.nombre = 'Mezclilla Denim Heavy 14oz' AND NOT EXISTS (SELECT 1 FROM lotes_inventario WHERE numero_lote = 'LOT-2026-DNM14');

INSERT INTO lotes_inventario (producto_id, numero_lote, metros_recibidos, metros_actuales, costo_por_metro, proveedor, estado, notas)
SELECT p.id, 'LOT-2026-LTC17', 120.00, 95.00, 26660.00, COALESCE(pv.nombre_tienda, 'Telas & Seda del Caribe'), 'active', 'Lino Tropical Caribeño lote costero'
FROM productos p LEFT JOIN perfiles_vendedor pv ON pv.vendedor_id = p.vendedor_id
WHERE p.nombre = 'Lino Tropical Caribeño' AND NOT EXISTS (SELECT 1 FROM lotes_inventario WHERE numero_lote = 'LOT-2026-LTC17');

SELECT pg_catalog.setval('public.lotes_inventario_id_seq', GREATEST(1, (SELECT COALESCE(MAX(id), 1) FROM lotes_inventario)), true);

INSERT INTO eventos_merma (producto_id, id_lote, metros_perdidos, motivo, descripcion, impacto_costo, responsable, usuario_id)
SELECT p.id, l.numero_lote, 4.50, 'cutting_error', 'Descuadre inicial de mesa en trazado de lote Algodón Premium.', ROUND((4.50 * l.costo_por_metro)::numeric, 2), u.nombre, u.id
FROM lotes_inventario l JOIN productos p ON p.id = l.producto_id JOIN usuarios u ON u.id = p.vendedor_id
WHERE l.numero_lote = 'LOT-2026-ALG01' AND NOT EXISTS (SELECT 1 FROM eventos_merma);

INSERT INTO eventos_merma (producto_id, id_lote, metros_perdidos, motivo, descripcion, impacto_costo, responsable, usuario_id)
SELECT p.id, l.numero_lote, 3.20, 'factory_defect', 'Falla de tejeduría en orillo registrada al recibir rollo de Dril Elástico.', ROUND((3.20 * l.costo_por_metro)::numeric, 2), u.nombre, u.id
FROM lotes_inventario l JOIN productos p ON p.id = l.producto_id JOIN usuarios u ON u.id = p.vendedor_id
WHERE l.numero_lote = 'LOT-2026-DRL01' AND NOT EXISTS (SELECT 1 FROM eventos_merma e WHERE e.id_lote = 'LOT-2026-DRL01');

INSERT INTO eventos_merma (producto_id, id_lote, metros_perdidos, motivo, descripcion, impacto_costo, responsable, usuario_id)
SELECT p.id, l.numero_lote, 2.80, 'quality_control', 'Muestras técnicas de laboratorio textil extraídas de Lana Merino.', ROUND((2.80 * l.costo_por_metro)::numeric, 2), u.nombre, u.id
FROM lotes_inventario l JOIN productos p ON p.id = l.producto_id JOIN usuarios u ON u.id = p.vendedor_id
WHERE l.numero_lote = 'LOT-2026-LAN01' AND NOT EXISTS (SELECT 1 FROM eventos_merma e WHERE e.id_lote = 'LOT-2026-LAN01');

INSERT INTO eventos_merma (producto_id, id_lote, metros_perdidos, motivo, descripcion, impacto_costo, responsable, usuario_id)
SELECT p.id, l.numero_lote, 5.00, 'damaged', 'Humedad superficial detectada en extremo de rollo Mezclilla Denim 14oz.', ROUND((5.00 * l.costo_por_metro)::numeric, 2), u.nombre, u.id
FROM lotes_inventario l JOIN productos p ON p.id = l.producto_id JOIN usuarios u ON u.id = p.vendedor_id
WHERE l.numero_lote = 'LOT-2026-DNM14' AND NOT EXISTS (SELECT 1 FROM eventos_merma e WHERE e.id_lote = 'LOT-2026-DNM14');

INSERT INTO eventos_merma (producto_id, id_lote, metros_perdidos, motivo, descripcion, impacto_costo, responsable, usuario_id)
SELECT p.id, l.numero_lote, 2.50, 'cutting_error', 'Ajuste por sesgo de trama en punta inicial de Lino Tropical Caribeño.', ROUND((2.50 * l.costo_por_metro)::numeric, 2), u.nombre, u.id
FROM lotes_inventario l JOIN productos p ON p.id = l.producto_id JOIN usuarios u ON u.id = p.vendedor_id
WHERE l.numero_lote = 'LOT-2026-LTC17' AND NOT EXISTS (SELECT 1 FROM eventos_merma e WHERE e.id_lote = 'LOT-2026-LTC17');
