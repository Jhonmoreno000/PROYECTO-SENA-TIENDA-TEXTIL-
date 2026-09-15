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
    contrasena_hash VARCHAR(255) NOT NULL,
    rol VARCHAR(50) DEFAULT 'cliente',
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
    precio NUMERIC(12,2) NOT NULL,
    vendedor_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
    descripcion TEXT,
    material VARCHAR(100),
    ancho VARCHAR(50),
    peso VARCHAR(50),
    cuidados TEXT,
    stock INTEGER DEFAULT 0,
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
    costo_por_metro NUMERIC(10,2) NOT NULL,
    proveedor VARCHAR(100),
    fecha_recepcion DATE DEFAULT CURRENT_DATE,
    notas TEXT,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. TABLA: eventos_merma
CREATE TABLE IF NOT EXISTS eventos_merma (
    id SERIAL PRIMARY KEY,
    producto_id INTEGER REFERENCES productos(id) ON DELETE CASCADE,
    metros_perdidos NUMERIC(10,2) NOT NULL,
    motivo VARCHAR(100) NOT NULL,
    impacto_costo NUMERIC(10,2),
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
    nombre_cliente VARCHAR(150) NOT NULL,
    correo_cliente VARCHAR(150) NOT NULL,
    telefono_cliente VARCHAR(50),
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
    cantidad INTEGER DEFAULT 1 NOT NULL,
    agregado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP
);

-- 13. TABLA: resenas
CREATE TABLE IF NOT EXISTS resenas (
    id SERIAL PRIMARY KEY,
    producto_id INTEGER NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    calificacion INTEGER CHECK (calificacion >= 1 AND calificacion <= 5),
    comentario TEXT NOT NULL,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 14. TABLA: tickets_soporte
CREATE TABLE IF NOT EXISTS tickets_soporte (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
    nombre_usuario VARCHAR(100),
    correo_usuario VARCHAR(150),
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
    area VARCHAR(100),
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
    region VARCHAR(100) NOT NULL,
    ventas_totales NUMERIC(14,2) DEFAULT 0.00,
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
('Carlos Pérez', 'vendedor@ddtextil.com', 'c95c735d5dd15e3ae1eb64e9a4f6cf70e30d7b2759e0a701d89da59d2a6a61b8', 'vendedor', true),
('María González', 'maria.gonzalez@ddtextil.com', 'c95c735d5dd15e3ae1eb64e9a4f6cf70e30d7b2759e0a701d89da59d2a6a61b8', 'vendedor', true),
('Juan Cliente', 'cliente@gmail.com', '49f074d0e9fcb95ec70c2a71569931fc484fcde1e0e8e9ceeb5ad334a1ce2105', 'cliente', true)
ON CONFLICT (correo) DO NOTHING;

INSERT INTO secciones_inicio (clave, titulo, subtitulo, activo, orden) VALUES
('nuevas', 'Nuevas Colecciones', 'Lo último en tendencias de moda y textiles', true, 1),
('exclusivas', 'Telas Exclusivas', 'Materiales de alta costura e importación especial', true, 2),
('ofertas', 'Ofertas Especiales', 'Descuentos por metraje y liquidación de inventario', true, 3)
ON CONFLICT (clave) DO NOTHING;

INSERT INTO cupones (codigo, valor_descuento, usos_maximos, activo) VALUES
('DESCUENTO10', 10.0, 100, true),
('BIENVENIDA20', 20.0, 50, true)
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO banner_global (activo, mensaje, tipo_banner) VALUES
(true, '¡Envío gratis en compras superiores a $200.000 COP a todo el país!', 'info');

INSERT INTO configuracion_sistema (clave, valor) VALUES
('system_config', '{"siteName":"D&D Textil","defaultDarkMode":false,"primaryColor":"#8B5CF6","secondaryColor":"#EC4899","accentColor":"#F59E0B","taxRate":0.19,"shippingCost":15000,"freeShippingThreshold":200000,"lowStockThreshold":20,"maintenanceMode":false}')
ON CONFLICT (clave) DO NOTHING;
