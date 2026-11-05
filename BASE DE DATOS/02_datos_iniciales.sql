-- ============================================================================
-- 02_datos_iniciales.sql — Población de Datos Iniciales para D&D Textil
-- ============================================================================

-- Asegurar hashes SHA-256 en UTF-8 para las cuentas iniciales
UPDATE usuarios SET contrasena_hash = '56976bf24998ca63e35fe4f1e2469b5751d1856003e8d16fef0aafef496ed044' WHERE correo IN ('vendedor@ddtextil.com', 'maria.gonzalez@ddtextil.com');
UPDATE usuarios SET contrasena_hash = '09a31a7001e261ab1e056182a71d3cf57f582ca9a29cff5eb83be0f0549730a9' WHERE correo IN ('cliente@gmail.com', 'cliente@ddtextil.com');

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
INSERT INTO ventas_region (region, ventas_totales, porcentaje) VALUES
('Bogotá D.C.', 43955905.83, 35.50),
('Antioquia', 20517276.65, 18.20),
('Valle del Cauca', 29667382.08, 22.40),
('Atlántico', 33479140.61, 15.10),
('Santander', 33396670.43, 8.80)
ON CONFLICT DO NOTHING;

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
