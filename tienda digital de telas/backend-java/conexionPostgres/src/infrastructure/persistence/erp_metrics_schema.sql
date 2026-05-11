-- Archivo: backend-java/conexionPostgres/src/infrastructure/persistence/erp_metrics_schema.sql
-- Contraseña de DB esperada por el usuario: Mp.1025889078

-- 1. Tabla de Objetivos y Ventas (Para el AreaChart Compuesto)
CREATE TABLE IF NOT EXISTS erp_sales_metrics (
    id SERIAL PRIMARY KEY,
    record_date DATE NOT NULL UNIQUE,
    actual_sales NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    target_sales NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    profit_margin NUMERIC(5, 2) NOT NULL DEFAULT 0.00, -- Ej: 35.50 (Porcentaje)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabla de Notificaciones del Sistema (Para el Notification Center)
CREATE TABLE IF NOT EXISTS erp_system_notifications (
    id SERIAL PRIMARY KEY,
    type VARCHAR(50) NOT NULL, -- 'error', 'success', 'warning', 'info'
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabla de Inventario de Telas (Para Alertas de Stock Bajo por Metraje)
CREATE TABLE IF NOT EXISTS erp_fabric_inventory (
    id SERIAL PRIMARY KEY,
    sku VARCHAR(50) NOT NULL UNIQUE,
    fabric_name VARCHAR(150) NOT NULL,
    category VARCHAR(50) NOT NULL, -- 'Algodón', 'Seda', etc.
    supplier VARCHAR(100) NOT NULL,
    current_meters NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    min_threshold_meters NUMERIC(10, 2) NOT NULL DEFAULT 50.00, -- Umbral dinámico para Alerta "Stock Bajo"
    cost_per_meter NUMERIC(10, 2) NOT NULL,
    last_restock_date DATE
);

-- Datos Iniciales (Seeders) para alimentar el Dashboard React ERP:

-- Insertar métricas de ventas históricas y objetivos (Últimos 7 días)
INSERT INTO erp_sales_metrics (record_date, actual_sales, target_sales, profit_margin) VALUES
(CURRENT_DATE - INTERVAL '6 days', 1250000, 1500000, 32.5),
(CURRENT_DATE - INTERVAL '5 days', 1800000, 1550000, 34.0),
(CURRENT_DATE - INTERVAL '4 days', 1600000, 1600000, 33.2),
(CURRENT_DATE - INTERVAL '3 days', 2100000, 1650000, 38.1),
(CURRENT_DATE - INTERVAL '2 days', 1900000, 1700000, 36.4),
(CURRENT_DATE - INTERVAL '1 days', 2400000, 1800000, 41.0),
(CURRENT_DATE, 1400000, 1850000, 35.5) -- Día actual (en progreso)
ON CONFLICT (record_date) DO NOTHING;

-- Insertar notificaciones iniciales
INSERT INTO erp_system_notifications (type, title, message) VALUES
('error', 'Fallo de Pasarela de Pago', '3 transacciones con tarjeta declinadas por el banco.'),
('success', 'Pedido Mayorista B2B', 'Textiles Premium SAS solicitó 500m de Lino Blanco.'),
('warning', 'Retraso de Proveedor', 'El envío de Seda Pura desde Italia presenta 2 días de retraso.'),
('info', 'Reporte Semanal Generado', 'El balance de ventas semanales está listo para descarga.');

-- Insertar inventario base para alertas de metraje
INSERT INTO erp_fabric_inventory (sku, fabric_name, category, supplier, current_meters, min_threshold_meters, cost_per_meter) VALUES
('ALG-001', 'Algodón Egipcio Blanco', 'Algodón', 'Textil Corp', 1200.50, 100.00, 25000),
('SED-042', 'Seda Pura Escarlata', 'Seda', 'Importaciones V&G', 35.00, 50.00, 85000), -- STOCK BAJO
('LIN-112', 'Lino Rústico Crudo', 'Lino', 'Textil Corp', 450.00, 80.00, 42000),
('TER-998', 'Terciopelo Azul Noche', 'Terciopelo', 'Tejidos Premium', 15.00, 30.00, 110000); -- STOCK CRÍTICO
