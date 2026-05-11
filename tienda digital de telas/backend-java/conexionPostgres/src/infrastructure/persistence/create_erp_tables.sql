-- Crear las 3 tablas faltantes del schema ERP

-- 1. erp_sales_metrics: Metricas de ventas con objetivo
CREATE TABLE IF NOT EXISTS erp_sales_metrics (
    id SERIAL PRIMARY KEY,
    record_date DATE NOT NULL UNIQUE,
    actual_sales NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    target_sales NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    profit_margin NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. erp_system_notifications: Notificaciones del sistema
CREATE TABLE IF NOT EXISTS erp_system_notifications (
    id SERIAL PRIMARY KEY,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. erp_fabric_inventory: Inventario de telas ERP con umbrales de metraje
CREATE TABLE IF NOT EXISTS erp_fabric_inventory (
    id SERIAL PRIMARY KEY,
    sku VARCHAR(50) NOT NULL UNIQUE,
    fabric_name VARCHAR(150) NOT NULL,
    category VARCHAR(50) NOT NULL,
    supplier VARCHAR(100) NOT NULL,
    current_meters NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    min_threshold_meters NUMERIC(10, 2) NOT NULL DEFAULT 50.00,
    cost_per_meter NUMERIC(10, 2) NOT NULL,
    last_restock_date DATE
);

-- Poblar erp_sales_metrics con datos de los ultimos 14 dias
INSERT INTO erp_sales_metrics (record_date, actual_sales, target_sales, profit_margin)
VALUES
  (CURRENT_DATE - INTERVAL '13 days', 1100000, 1500000, 30.5),
  (CURRENT_DATE - INTERVAL '12 days', 1350000, 1500000, 31.2),
  (CURRENT_DATE - INTERVAL '11 days', 1750000, 1550000, 33.8),
  (CURRENT_DATE - INTERVAL '10 days', 1250000, 1550000, 29.5),
  (CURRENT_DATE - INTERVAL '9 days',  1900000, 1600000, 36.1),
  (CURRENT_DATE - INTERVAL '8 days',  2100000, 1600000, 38.4),
  (CURRENT_DATE - INTERVAL '7 days',  1800000, 1650000, 34.0),
  (CURRENT_DATE - INTERVAL '6 days',  1250000, 1500000, 32.5),
  (CURRENT_DATE - INTERVAL '5 days',  1800000, 1550000, 34.0),
  (CURRENT_DATE - INTERVAL '4 days',  1600000, 1600000, 33.2),
  (CURRENT_DATE - INTERVAL '3 days',  2100000, 1650000, 38.1),
  (CURRENT_DATE - INTERVAL '2 days',  1900000, 1700000, 36.4),
  (CURRENT_DATE - INTERVAL '1 days',  2400000, 1800000, 41.0),
  (CURRENT_DATE,                       1400000, 1850000, 35.5)
ON CONFLICT (record_date) DO NOTHING;

-- Poblar erp_system_notifications con alertas iniciales
INSERT INTO erp_system_notifications (type, title, message) VALUES
  ('error',   'Fallo de Pasarela de Pago',  '3 transacciones con tarjeta declinadas por el banco emisor.'),
  ('success', 'Pedido Mayorista B2B',        'Textiles Premium SAS solicito 500m de Lino Blanco.'),
  ('warning', 'Retraso de Proveedor',        'El envio de Seda Pura desde Italia presenta 2 dias de retraso.'),
  ('info',    'Reporte Semanal Generado',    'El balance de ventas semanales esta listo para descarga.');

-- Poblar erp_fabric_inventory con inventario de telas
INSERT INTO erp_fabric_inventory (sku, fabric_name, category, supplier, current_meters, min_threshold_meters, cost_per_meter, last_restock_date)
VALUES
  ('ALG-001', 'Algodon Egipcio Blanco',  'Algodon',    'Textil Corp',       1200.50, 100.00, 25000, CURRENT_DATE - INTERVAL '15 days'),
  ('SED-042', 'Seda Pura Escarlata',     'Seda',       'Importaciones V&G',   35.00,  50.00, 85000, CURRENT_DATE - INTERVAL '30 days'),
  ('LIN-112', 'Lino Rustico Crudo',      'Lino',       'Textil Corp',         450.00,  80.00, 42000, CURRENT_DATE - INTERVAL '10 days'),
  ('TER-998', 'Terciopelo Azul Noche',   'Terciopelo', 'Tejidos Premium',      15.00,  30.00,110000, CURRENT_DATE - INTERVAL '45 days'),
  ('DRL-201', 'Dril Elastico Natural',   'Dril',       'Drilones Industriales',380.00,  50.00, 38000, CURRENT_DATE - INTERVAL '5 days'),
  ('LAN-055', 'Lana Merino Gris',        'Lana',       'Lanera del Sur',      120.00,  20.00, 65000, CURRENT_DATE - INTERVAL '20 days')
ON CONFLICT (sku) DO NOTHING;
