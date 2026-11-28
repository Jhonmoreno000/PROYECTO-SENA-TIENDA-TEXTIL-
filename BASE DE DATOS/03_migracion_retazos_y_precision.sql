-- ============================================================================
-- MIGRACION SEGURA (NO DESTRUCTIVA): MODULO DE VENTA DE RETAZOS Y PRECISION
-- Proyecto: D&D Textil (PostgreSQL)
-- ============================================================================

-- 1. Nueva tabla: retazos (sobrantes de rollos < 1.00m con dimensiones fijas y precio cerrado)
CREATE TABLE IF NOT EXISTS retazos (
    id SERIAL PRIMARY KEY,
    codigo_retazo VARCHAR(60) NOT NULL UNIQUE,
    producto_id INTEGER NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
    rollo_id INTEGER REFERENCES rollos_textil(id) ON DELETE SET NULL,
    largo_metros NUMERIC(10,2) NOT NULL CHECK (largo_metros > 0 AND largo_metros < 1.00),
    ancho_metros NUMERIC(10,2) NOT NULL DEFAULT 1.50 CHECK (ancho_metros > 0),
    precio_original NUMERIC(12,2) NOT NULL CHECK (precio_original >= 0),
    precio_liquidacion NUMERIC(12,2) NOT NULL CHECK (precio_liquidacion >= 0),
    porcentaje_descuento NUMERIC(5,2) NOT NULL DEFAULT 40.00,
    estado VARCHAR(30) NOT NULL DEFAULT 'DISPONIBLE' CHECK (estado IN ('DISPONIBLE', 'RESERVADO', 'VENDIDO')),
    lote_tintoreria VARCHAR(50),
    ubicacion_bodega VARCHAR(100),
    notas TEXT,
    pedido_id INTEGER REFERENCES pedidos(id) ON DELETE SET NULL,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    vendido_en TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_retazos_estado ON retazos(estado);
CREATE INDEX IF NOT EXISTS idx_retazos_producto_id ON retazos(producto_id);
CREATE INDEX IF NOT EXISTS idx_retazos_rollo_id ON retazos(rollo_id);

-- 2. Extensiones no destructivas en items_pedido para soporte hibrido (TELA + RETAZO) y trazabilidad de rollo
ALTER TABLE items_pedido ADD COLUMN IF NOT EXISTS tipo_item VARCHAR(20) DEFAULT 'TELA';
ALTER TABLE items_pedido ADD COLUMN IF NOT EXISTS retazo_id INTEGER REFERENCES retazos(id) ON DELETE SET NULL;
ALTER TABLE items_pedido ADD COLUMN IF NOT EXISTS rollo_id INTEGER REFERENCES rollos_textil(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_items_pedido_retazo_id ON items_pedido(retazo_id);

-- 3. Extensiones no destructivas en items_carrito para soporte hibrido (TELA + RETAZO)
ALTER TABLE items_carrito ADD COLUMN IF NOT EXISTS tipo_item VARCHAR(20) DEFAULT 'TELA';
ALTER TABLE items_carrito ADD COLUMN IF NOT EXISTS retazo_id INTEGER REFERENCES retazos(id) ON DELETE SET NULL;

-- 4. Verificacion de precision decimal (NUMERIC(10,2) / NUMERIC(12,2)) en tablas existentes
ALTER TABLE productos ALTER COLUMN stock TYPE NUMERIC(10,2);
ALTER TABLE items_pedido ALTER COLUMN cantidad TYPE NUMERIC(10,2);
ALTER TABLE items_carrito ALTER COLUMN cantidad TYPE NUMERIC(10,2);
ALTER TABLE rollos_textil ALTER COLUMN metraje_inicial TYPE NUMERIC(10,2);
ALTER TABLE rollos_textil ALTER COLUMN metraje_remanente TYPE NUMERIC(10,2);

-- 5. Semilla segura de retazos desde rollos ya reclasificados como 'retazo_liquidado' (si existen)
INSERT INTO retazos (
    codigo_retazo, producto_id, rollo_id, largo_metros, ancho_metros,
    precio_original, precio_liquidacion, porcentaje_descuento,
    estado, lote_tintoreria, ubicacion_bodega, notas
)
SELECT
    'RET-' || r.codigo_rollo,
    r.producto_id,
    r.id,
    r.metraje_remanente,
    1.50,
    ROUND((p.precio * r.metraje_remanente)::numeric, 2),
    ROUND((p.precio * r.metraje_remanente * 0.60)::numeric, 2),
    40.00,
    'DISPONIBLE',
    r.lote_tintoreria,
    COALESCE(r.ubicacion_bodega, 'Bodega Central'),
    'Retazo generado automaticamente desde rollo ' || r.codigo_rollo
FROM rollos_textil r
JOIN productos p ON p.id = r.producto_id
WHERE LOWER(r.estado) = 'retazo_liquidado'
  AND r.metraje_remanente > 0
  AND r.metraje_remanente < 1.00
ON CONFLICT (codigo_retazo) DO NOTHING;

-- 6. Semilla inicial de retazos de demostracion si la tabla esta vacia y existen productos activos
INSERT INTO retazos (
    codigo_retazo, producto_id, largo_metros, ancho_metros,
    precio_original, precio_liquidacion, porcentaje_descuento,
    estado, lote_tintoreria, ubicacion_bodega, notas
)
SELECT
    'RET-DEMO-' || p.id,
    p.id,
    CASE (p.id % 3)
        WHEN 0 THEN 0.85
        WHEN 1 THEN 0.70
        ELSE 0.60
    END,
    1.50,
    ROUND((p.precio * CASE (p.id % 3) WHEN 0 THEN 0.85 WHEN 1 THEN 0.70 ELSE 0.60 END)::numeric, 2),
    ROUND((p.precio * CASE (p.id % 3) WHEN 0 THEN 0.85 WHEN 1 THEN 0.70 ELSE 0.60 END * 0.60)::numeric, 2),
    40.00,
    'DISPONIBLE',
    'LT-2026-0' || p.id,
    'Estante Retazos A-' || p.id,
    'Pieza unica de corte limpio lista para confeccion o manualidades'
FROM productos p
WHERE p.activo = true
  AND NOT EXISTS (SELECT 1 FROM retazos)
ORDER BY p.id ASC
LIMIT 6
ON CONFLICT (codigo_retazo) DO NOTHING;
