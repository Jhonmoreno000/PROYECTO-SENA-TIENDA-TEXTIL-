-- ============================================================================
-- ESQUEMA DE BASE DE DATOS EN ESPAÑOL - D&D TEXTIL (PostgreSQL)
-- Generado para el proyecto SENA Tienda Digital de Telas
-- ============================================================================

-- Configuración inicial
SET statement_timeout = 0;
SET lock_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;

-- 1. TABLA: usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(150) NOT NULL UNIQUE,
    telefono VARCHAR(50),
    contrasena_hash VARCHAR(255) NOT NULL,
    rol VARCHAR(50) DEFAULT 'cliente' CHECK (rol IN ('administrador', 'vendedor', 'cliente')),
    activo BOOLEAN DEFAULT true,
    suspendido BOOLEAN DEFAULT false,
    motivo_suspension TEXT,
    tasa_comision NUMERIC(5,2),
    registrado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ultimo_acceso TIMESTAMP
);

-- 2. TABLA: categorias
CREATE TABLE IF NOT EXISTS categorias (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. TABLA: productos
CREATE TABLE IF NOT EXISTS productos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(200) NOT NULL,
    categoria_id INTEGER REFERENCES categorias(id) ON DELETE SET NULL,
    precio NUMERIC(12,2) NOT NULL CHECK (precio >= 0),
    vendedor_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
    descripcion TEXT,
    material VARCHAR(100),
    ancho VARCHAR(50),
    peso VARCHAR(50),
    cuidados TEXT,
    stock NUMERIC(10,2) DEFAULT 0.00 CHECK (stock >= 0),
    destacado BOOLEAN DEFAULT false,
    activo BOOLEAN DEFAULT true,
    estado_moderacion VARCHAR(50) DEFAULT 'approved',
    motivo_rechazo TEXT,
    es_nueva_coleccion BOOLEAN DEFAULT false,
    es_exclusivo BOOLEAN DEFAULT false,
    es_oferta BOOLEAN DEFAULT false,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP
);

-- 4. TABLA: imagenes_producto
CREATE TABLE IF NOT EXISTS imagenes_producto (
    id SERIAL PRIMARY KEY,
    producto_id INTEGER NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
    url_imagen TEXT NOT NULL,
    orden_visualizacion INTEGER DEFAULT 0
);

-- 5. TABLA: lotes_inventario
CREATE TABLE IF NOT EXISTS lotes_inventario (
    id SERIAL PRIMARY KEY,
    producto_id INTEGER REFERENCES productos(id) ON DELETE CASCADE,
    numero_lote VARCHAR(50),
    metros_recibidos NUMERIC(10,2) NOT NULL,
    metros_actuales NUMERIC(10,2),
    costo_por_metro NUMERIC(10,2) NOT NULL,
    proveedor VARCHAR(100),
    estado VARCHAR(50) DEFAULT 'active',
    fecha_recepcion DATE DEFAULT CURRENT_DATE,
    notas TEXT,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. TABLA: eventos_merma
CREATE TABLE IF NOT EXISTS eventos_merma (
    id SERIAL PRIMARY KEY,
    producto_id INTEGER REFERENCES productos(id) ON DELETE CASCADE,
    id_lote VARCHAR(50),
    metros_perdidos NUMERIC(10,2) NOT NULL,
    motivo VARCHAR(100) NOT NULL,
    descripcion TEXT,
    impacto_costo NUMERIC(10,2),
    responsable VARCHAR(100),
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. TABLA: umbrales_stock
CREATE TABLE IF NOT EXISTS umbrales_stock (
    id SERIAL PRIMARY KEY,
    tipo_tela VARCHAR(100) NOT NULL UNIQUE,
    metros_minimos NUMERIC(10,2) DEFAULT 20.0,
    alerta_activa BOOLEAN DEFAULT true
);

-- 8. TABLA: cupones
CREATE TABLE IF NOT EXISTS cupones (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(50) NOT NULL UNIQUE,
    tipo_descuento VARCHAR(20) DEFAULT 'percentage',
    valor_descuento NUMERIC(10,2) NOT NULL,
    expira_en TIMESTAMP,
    compra_minima NUMERIC(12,2),
    usos_maximos INTEGER,
    solo_primera_vez BOOLEAN DEFAULT false,
    conteo_usos INTEGER DEFAULT 0,
    activo BOOLEAN DEFAULT true,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9. TABLA: categorias_cupon
CREATE TABLE IF NOT EXISTS categorias_cupon (
    id SERIAL PRIMARY KEY,
    cupon_id INTEGER REFERENCES cupones(id) ON DELETE CASCADE,
    categoria_id INTEGER REFERENCES categorias(id) ON DELETE CASCADE
);

-- 10. TABLA: pedidos
CREATE TABLE IF NOT EXISTS pedidos (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
    vendedor_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
    nombre_cliente VARCHAR(150) NOT NULL,
    correo_cliente VARCHAR(150) NOT NULL,
    telefono_cliente VARCHAR(50),
    documento_cliente VARCHAR(50),
    direccion_envio TEXT NOT NULL,
    ciudad_envio VARCHAR(100),
    departamento_envio VARCHAR(100),
    monto_total NUMERIC(12,2) NOT NULL,
    subtotal NUMERIC(12,2),
    monto_impuesto NUMERIC(12,2) DEFAULT 0.00,
    costo_envio NUMERIC(12,2) DEFAULT 0.00,
    monto_descuento NUMERIC(12,2) DEFAULT 0.00,
    codigo_cupon VARCHAR(50),
    estado VARCHAR(50) DEFAULT 'pending',
    metodo_pago VARCHAR(50),
    estado_pago VARCHAR(50) DEFAULT 'pending',
    referencia_pago VARCHAR(64) UNIQUE,
    monto_centavos BIGINT,
    moneda VARCHAR(3) DEFAULT 'COP',
    wompi_transaccion_id VARCHAR(100),
    pagado_en TIMESTAMP,
    numero_guia VARCHAR(100),
    notas TEXT,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP
);

-- 11. TABLA: items_pedido
CREATE TABLE IF NOT EXISTS items_pedido (
    id SERIAL PRIMARY KEY,
    pedido_id INTEGER NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
    producto_id INTEGER REFERENCES productos(id) ON DELETE SET NULL,
    cantidad NUMERIC(10,2) NOT NULL,
    precio_por_metro NUMERIC(12,2) NOT NULL,
    subtotal NUMERIC(12,2) NOT NULL
);

-- 12. TABLA: items_carrito
CREATE TABLE IF NOT EXISTS items_carrito (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    producto_id INTEGER NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
    cantidad NUMERIC(10,2) DEFAULT 1.00 NOT NULL CHECK (cantidad > 0),
    agregado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP,
    UNIQUE (usuario_id, producto_id)
);

-- 13. TABLA: resenas
CREATE TABLE IF NOT EXISTS resenas (
    id SERIAL PRIMARY KEY,
    producto_id INTEGER NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    calificacion INTEGER CHECK (calificacion >= 1 AND calificacion <= 5),
    comentario TEXT NOT NULL,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (producto_id, usuario_id)
);

-- 14. TABLA: tickets_soporte
CREATE TABLE IF NOT EXISTS tickets_soporte (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
    pedido_id INTEGER REFERENCES pedidos(id) ON DELETE SET NULL,
    nombre_usuario VARCHAR(100),
    correo_usuario VARCHAR(150),
    categoria VARCHAR(100),
    asunto VARCHAR(200) NOT NULL,
    descripcion TEXT NOT NULL,
    estado VARCHAR(50) DEFAULT 'open',
    prioridad VARCHAR(50) DEFAULT 'medium',
    asignado_a INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP,
    resuelto_en TIMESTAMP
);

-- 15. TABLA: reportes_errores
CREATE TABLE IF NOT EXISTS reportes_errores (
    id SERIAL PRIMARY KEY,
    vendedor_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
    nombre_vendedor VARCHAR(100),
    correo_reportante VARCHAR(150),
    titulo VARCHAR(200),
    area VARCHAR(100),
    severidad VARCHAR(50),
    producto_id INTEGER REFERENCES productos(id) ON DELETE SET NULL,
    nombre_producto VARCHAR(200),
    descripcion TEXT NOT NULL,
    pasos TEXT,
    estado VARCHAR(50) DEFAULT 'new',
    prioridad VARCHAR(50) DEFAULT 'medium',
    asignado_a INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
    reportado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resuelto_en TIMESTAMP
);

-- 16. TABLA: configuracion_sistema
CREATE TABLE IF NOT EXISTS configuracion_sistema (
    id SERIAL PRIMARY KEY,
    clave VARCHAR(100) NOT NULL UNIQUE,
    valor TEXT NOT NULL,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 17. TABLA: secciones_inicio
CREATE TABLE IF NOT EXISTS secciones_inicio (
    id SERIAL PRIMARY KEY,
    clave VARCHAR(50) NOT NULL UNIQUE,
    titulo VARCHAR(150) NOT NULL,
    subtitulo VARCHAR(255),
    activo BOOLEAN DEFAULT true,
    orden INTEGER DEFAULT 1,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 18. TABLA: diapositivas_carrusel
CREATE TABLE IF NOT EXISTS diapositivas_carrusel (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(150) NOT NULL,
    subtitulo VARCHAR(255),
    imagen TEXT NOT NULL,
    cta VARCHAR(100),
    clave_seccion VARCHAR(50),
    activo BOOLEAN DEFAULT true,
    orden INTEGER DEFAULT 1,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 19. TABLA: banner_global
CREATE TABLE IF NOT EXISTS banner_global (
    id SERIAL PRIMARY KEY,
    activo BOOLEAN DEFAULT true,
    mensaje TEXT NOT NULL,
    tipo_banner VARCHAR(50) DEFAULT 'info',
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 20. TABLA: metricas_ventas_erp
CREATE TABLE IF NOT EXISTS metricas_ventas_erp (
    id SERIAL PRIMARY KEY,
    fecha_registro DATE NOT NULL UNIQUE,
    ventas_reales NUMERIC(15,2) NOT NULL DEFAULT 0.00,
    ventas_objetivo NUMERIC(15,2) NOT NULL DEFAULT 0.00,
    margen_ganancia NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 21. TABLA: ventas_diarias
CREATE TABLE IF NOT EXISTS ventas_diarias (
    id SERIAL PRIMARY KEY,
    fecha_venta DATE NOT NULL UNIQUE,
    ventas_totales NUMERIC(14,2) DEFAULT 0.00,
    pedidos_totales INTEGER DEFAULT 0,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 22. TABLA: ventas_region
CREATE TABLE IF NOT EXISTS ventas_region (
    id SERIAL PRIMARY KEY,
    region VARCHAR(100) NOT NULL UNIQUE,
    capital VARCHAR(100),
    ventas_totales NUMERIC(14,2) DEFAULT 0.00,
    pedidos_totales INTEGER DEFAULT 0,
    porcentaje NUMERIC(5,2) DEFAULT 0.00,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 23. TABLA: actividad_reciente
CREATE TABLE IF NOT EXISTS actividad_reciente (
    id SERIAL PRIMARY KEY,
    tipo VARCHAR(50) NOT NULL,
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
    nombre_usuario VARCHAR(100),
    accion TEXT NOT NULL,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices en claves foráneas de alta frecuencia de consulta
CREATE INDEX IF NOT EXISTS idx_pedidos_usuario_id ON pedidos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_items_pedido_pedido_id ON items_pedido(pedido_id);
CREATE INDEX IF NOT EXISTS idx_items_carrito_usuario_id ON items_carrito(usuario_id);
CREATE INDEX IF NOT EXISTS idx_resenas_producto_id ON resenas(producto_id);
CREATE INDEX IF NOT EXISTS idx_productos_vendedor_id ON productos(vendedor_id);
CREATE INDEX IF NOT EXISTS idx_imagenes_producto_producto_id ON imagenes_producto(producto_id);

-- ============================================================================
-- DATOS INICIALES EN ESPAÑOL
-- ============================================================================

INSERT INTO categorias (nombre, descripcion) VALUES
('Algodon', 'Telas de alta calidad tipo Algodon'),
('Seda', 'Telas de alta calidad tipo Seda'),
('Lino', 'Telas de alta calidad tipo Lino'),
('Lana', 'Telas de alta calidad tipo Lana'),
('Poliester', 'Telas de alta calidad tipo Poliester'),
('Terciopelo', 'Telas de alta calidad tipo Terciopelo'),
('Dril', 'Telas de alta calidad tipo Dril'),
('Mezclilla', 'Telas de alta calidad tipo Mezclilla')
ON CONFLICT (nombre) DO NOTHING;

INSERT INTO usuarios (nombre, correo, contrasena_hash, rol, activo) VALUES
('Anderson Moreno', 'admin@ddtextil.com', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', 'administrador', true),
('Carlos Pérez', 'vendedor@ddtextil.com', '56976bf24998ca63e35fe4f1e2469b5751d1856003e8d16fef0aafef496ed044', 'vendedor', true),
('María González', 'maria.gonzalez@ddtextil.com', '56976bf24998ca63e35fe4f1e2469b5751d1856003e8d16fef0aafef496ed044', 'vendedor', true),
('Juan Cliente', 'cliente@gmail.com', '09a31a7001e261ab1e056182a71d3cf57f582ca9a29cff5eb83be0f0549730a9', 'cliente', true),
('Cliente Demo', 'cliente@ddtextil.com', '09a31a7001e261ab1e056182a71d3cf57f582ca9a29cff5eb83be0f0549730a9', 'cliente', true)
ON CONFLICT (correo) DO UPDATE SET contrasena_hash = EXCLUDED.contrasena_hash;

INSERT INTO secciones_inicio (clave, titulo, subtitulo, activo, orden) VALUES
('nuevas', 'Nuevas Colecciones', 'Lo último en tendencias de moda y textiles', true, 1),
('exclusivas', 'Telas Exclusivas', 'Materiales de alta costura e importación especial', true, 2),
('ofertas', 'Ofertas Especiales', 'Descuentos por metraje y liquidación de inventario', true, 3)
ON CONFLICT (clave) DO NOTHING;

INSERT INTO cupones (codigo, valor_descuento, usos_maximos, activo) VALUES
('DESCUENTO10', 10.0, 100, true),
('BIENVENIDA20', 20.0, 50, true)
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO banner_global (activo, mensaje, tipo_banner)
SELECT true, '¡Envío gratis en compras superiores a $200.000 COP a todo el país!', 'info'
WHERE NOT EXISTS (SELECT 1 FROM banner_global);

INSERT INTO configuracion_sistema (clave, valor) VALUES
('system_config', '{"siteName":"D&D Textil","defaultDarkMode":false,"primaryColor":"#8B5CF6","secondaryColor":"#EC4899","accentColor":"#F59E0B","taxRate":0.19,"shippingCost":15000,"freeShippingThreshold":200000,"lowStockThreshold":20,"maintenanceMode":false}')
ON CONFLICT (clave) DO NOTHING;

-- 24. TABLA: notificaciones_sistema_erp
CREATE TABLE IF NOT EXISTS notificaciones_sistema_erp (
    id SERIAL PRIMARY KEY,
    tipo VARCHAR(50) NOT NULL,
    titulo VARCHAR(150) NOT NULL,
    mensaje TEXT NOT NULL,
    leido BOOLEAN DEFAULT false,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 25. TABLA: inventario_telas_erp
CREATE TABLE IF NOT EXISTS inventario_telas_erp (
    id SERIAL PRIMARY KEY,
    sku VARCHAR(50) NOT NULL UNIQUE,
    nombre_tela VARCHAR(150) NOT NULL,
    categoria VARCHAR(100),
    proveedor VARCHAR(150),
    metros_actuales NUMERIC(10,2) DEFAULT 0.00,
    metros_minimos NUMERIC(10,2) DEFAULT 20.00,
    costo_por_metro NUMERIC(12,2) DEFAULT 0.00,
    fecha_ultima_reposicion DATE
);

-- 26. TABLA: rollos_textil
CREATE TABLE IF NOT EXISTS rollos_textil (
    id SERIAL PRIMARY KEY,
    producto_id INTEGER NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
    codigo_rollo VARCHAR(50) NOT NULL UNIQUE,
    metraje_inicial NUMERIC(10,2) NOT NULL CHECK (metraje_inicial >= 0),
    metraje_remanente NUMERIC(10,2) NOT NULL CHECK (metraje_remanente >= 0),
    lote_tintoreria VARCHAR(50),
    estado VARCHAR(50) DEFAULT 'disponible',
    ubicacion_bodega VARCHAR(100),
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 27. TABLA: eventos_pago_wompi
CREATE TABLE IF NOT EXISTS eventos_pago_wompi (
    id SERIAL PRIMARY KEY,
    referencia_pago VARCHAR(64),
    transaccion_id VARCHAR(100),
    estado VARCHAR(30),
    origen VARCHAR(30),
    resultado VARCHAR(60),
    carga_util TEXT,
    recibido_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 28. TABLA: direcciones_usuario
CREATE TABLE IF NOT EXISTS direcciones_usuario (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    etiqueta VARCHAR(100) DEFAULT 'Casa',
    nombre_destinatario VARCHAR(150),
    telefono VARCHAR(50),
    direccion TEXT NOT NULL,
    ciudad VARCHAR(100),
    departamento VARCHAR(100),
    codigo_postal VARCHAR(20),
    predeterminada BOOLEAN DEFAULT false,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_pedidos_referencia_pago ON pedidos(referencia_pago);
CREATE INDEX IF NOT EXISTS idx_eventos_wompi_referencia ON eventos_pago_wompi(referencia_pago);
CREATE INDEX IF NOT EXISTS idx_direcciones_usuario_id ON direcciones_usuario(usuario_id);
CREATE INDEX IF NOT EXISTS idx_rollos_textil_producto_id ON rollos_textil(producto_id);

-- Índices compuestos para optimización de alto rendimiento y eliminación de contención
CREATE INDEX IF NOT EXISTS idx_productos_activo_id ON productos(activo, id);
CREATE INDEX IF NOT EXISTS idx_productos_activo_vendedor ON productos(activo, vendedor_id);
CREATE INDEX IF NOT EXISTS idx_productos_activo_destacado ON productos(activo, destacado);
CREATE INDEX IF NOT EXISTS idx_imagenes_producto_prod_orden ON imagenes_producto(producto_id, orden_visualizacion);
CREATE INDEX IF NOT EXISTS idx_pedidos_usuario_estado ON pedidos(usuario_id, estado);
CREATE INDEX IF NOT EXISTS idx_rollos_textil_prod_estado_rem ON rollos_textil(producto_id, estado, metraje_remanente);
CREATE INDEX IF NOT EXISTS idx_cupones_codigo_activo ON cupones(codigo, activo);
