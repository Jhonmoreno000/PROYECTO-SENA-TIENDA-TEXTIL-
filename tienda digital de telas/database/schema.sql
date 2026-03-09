-- ============================================================
-- D&D TEXTIL - Base de datos PostgreSQL
-- Tienda digital de telas
-- Generado: 2026-02-23
-- ============================================================

-- Eliminar tablas si existen (en orden inverso por dependencias)
DROP TABLE IF EXISTS coupon_usage CASCADE;
DROP TABLE IF EXISTS support_ticket_photos CASCADE;
DROP TABLE IF EXISTS support_tickets CASCADE;
DROP TABLE IF EXISTS bug_reports CASCADE;
DROP TABLE IF EXISTS waste_events CASCADE;
DROP TABLE IF EXISTS inventory_batches CASCADE;
DROP TABLE IF EXISTS stock_thresholds CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS cart_items CASCADE;
DROP TABLE IF EXISTS product_images CASCADE;
DROP TABLE IF EXISTS pending_products CASCADE;
DROP TABLE IF EXISTS pending_product_images CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS coupons CASCADE;
DROP TABLE IF EXISTS coupon_categories CASCADE;
DROP TABLE IF EXISTS region_sales CASCADE;
DROP TABLE IF EXISTS daily_sales CASCADE;
DROP TABLE IF EXISTS recent_activity CASCADE;
DROP TABLE IF EXISTS system_config CASCADE;
DROP TABLE IF EXISTS global_banner CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ============================================================
-- 1. USUARIOS
-- ============================================================
CREATE TABLE users (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(150) NOT NULL,
    email           VARCHAR(255) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    role            VARCHAR(20)  NOT NULL DEFAULT 'client'
                        CHECK (role IN ('admin', 'seller', 'client')),
    active          BOOLEAN      NOT NULL DEFAULT TRUE,
    suspended       BOOLEAN      NOT NULL DEFAULT FALSE,
    suspension_reason TEXT       NULL,
    commission_rate  DECIMAL(5,2) NULL,  -- Solo para vendedores (%)
    registered_at   TIMESTAMP    NOT NULL DEFAULT NOW(),
    last_login      TIMESTAMP    NULL,
    created_at      TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP    NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  users IS 'Usuarios del sistema: administradores, vendedores y clientes';
COMMENT ON COLUMN users.role IS 'Rol del usuario: admin, seller, client';
COMMENT ON COLUMN users.commission_rate IS 'Tasa de comisión del vendedor en porcentaje';

-- Índices
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_active ON users(active);

-- ============================================================
-- 2. CATEGORÍAS DE PRODUCTOS
-- ============================================================
CREATE TABLE categories (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(100) NOT NULL UNIQUE,
    description     TEXT         NULL,
    created_at      TIMESTAMP    NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE categories IS 'Categorías de telas: Algodón, Seda, Lino, Terciopelo, etc.';

-- ============================================================
-- 3. PRODUCTOS
-- ============================================================
CREATE TABLE products (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(255) NOT NULL,
    category_id     INT          NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    price           DECIMAL(12,2) NOT NULL CHECK (price >= 0),
    seller_id       INT          NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    description     TEXT         NULL,
    material        VARCHAR(255) NULL,
    width           VARCHAR(50)  NULL,     -- Ej: '150 cm'
    weight          VARCHAR(50)  NULL,     -- Ej: '180 g/m²'
    care            VARCHAR(255) NULL,     -- Instrucciones de cuidado
    stock           INT          NOT NULL DEFAULT 0 CHECK (stock >= 0),
    featured        BOOLEAN      NOT NULL DEFAULT FALSE,
    active          BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP    NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  products IS 'Catálogo de productos (telas) de la tienda';
COMMENT ON COLUMN products.width IS 'Ancho de la tela, ej: 150 cm';
COMMENT ON COLUMN products.weight IS 'Peso de la tela, ej: 180 g/m²';

CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_seller ON products(seller_id);
CREATE INDEX idx_products_featured ON products(featured);
CREATE INDEX idx_products_active ON products(active);

-- ============================================================
-- 4. IMÁGENES DE PRODUCTOS
-- ============================================================
CREATE TABLE product_images (
    id              SERIAL PRIMARY KEY,
    product_id      INT          NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    image_url       TEXT         NOT NULL,
    display_order   INT          NOT NULL DEFAULT 0,
    alt_text        VARCHAR(255) NULL,
    created_at      TIMESTAMP    NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE product_images IS 'Imágenes asociadas a cada producto';

CREATE INDEX idx_product_images_product ON product_images(product_id);

-- ============================================================
-- 5. PRODUCTOS PENDIENTES DE APROBACIÓN
-- ============================================================
CREATE TABLE pending_products (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(255) NOT NULL,
    description     TEXT         NULL,
    price           DECIMAL(12,2) NOT NULL CHECK (price >= 0),
    category        VARCHAR(100) NOT NULL,
    seller_id       INT          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status          VARCHAR(20)  NOT NULL DEFAULT 'pending'
                        CHECK (status IN ('pending', 'approved', 'rejected')),
    rejection_reason TEXT        NULL,
    submitted_at    TIMESTAMP    NOT NULL DEFAULT NOW(),
    reviewed_at     TIMESTAMP    NULL,
    reviewed_by     INT          NULL REFERENCES users(id)
);

COMMENT ON TABLE pending_products IS 'Productos enviados por vendedores pendientes de aprobación del admin';

CREATE INDEX idx_pending_products_seller ON pending_products(seller_id);
CREATE INDEX idx_pending_products_status ON pending_products(status);

-- Imágenes de productos pendientes
CREATE TABLE pending_product_images (
    id              SERIAL PRIMARY KEY,
    pending_product_id INT      NOT NULL REFERENCES pending_products(id) ON DELETE CASCADE,
    image_url       TEXT         NOT NULL,
    display_order   INT          NOT NULL DEFAULT 0
);

-- ============================================================
-- 6. CUPONES DE DESCUENTO
-- ============================================================
CREATE TABLE coupons (
    id              SERIAL PRIMARY KEY,
    code            VARCHAR(50)  NOT NULL UNIQUE,
    discount_type   VARCHAR(20)  NOT NULL
                        CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value  DECIMAL(12,2) NOT NULL CHECK (discount_value > 0),
    min_purchase    DECIMAL(12,2) NULL DEFAULT 0,
    first_time_only BOOLEAN      NOT NULL DEFAULT FALSE,
    max_uses        INT          NULL,
    usage_count     INT          NOT NULL DEFAULT 0,
    active          BOOLEAN      NOT NULL DEFAULT TRUE,
    expires_at      DATE         NULL,
    created_at      TIMESTAMP    NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE coupons IS 'Cupones de descuento: porcentaje o valor fijo';

CREATE INDEX idx_coupons_code ON coupons(code);
CREATE INDEX idx_coupons_active ON coupons(active);

-- Categorías aplicables a cada cupón (muchos a muchos)
CREATE TABLE coupon_categories (
    id              SERIAL PRIMARY KEY,
    coupon_id       INT          NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
    category_name   VARCHAR(100) NOT NULL,
    UNIQUE(coupon_id, category_name)
);

-- ============================================================
-- 7. PEDIDOS (ORDERS)
-- ============================================================
CREATE TABLE orders (
    id              SERIAL PRIMARY KEY,
    client_id       INT          NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    seller_id       INT          NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    total           DECIMAL(12,2) NOT NULL CHECK (total >= 0),
    status          VARCHAR(30)  NOT NULL DEFAULT 'preparing'
                        CHECK (status IN ('preparing', 'shipped', 'delivered', 'cancelled', 'returned')),
    coupon_id       INT          NULL REFERENCES coupons(id),
    discount_amount DECIMAL(12,2) NULL DEFAULT 0,
    shipping_cost   DECIMAL(12,2) NOT NULL DEFAULT 0,
    shipping_address TEXT        NULL,
    notes           TEXT         NULL,
    order_date      TIMESTAMP    NOT NULL DEFAULT NOW(),
    shipped_at      TIMESTAMP    NULL,
    delivered_at    TIMESTAMP    NULL,
    created_at      TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP    NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE orders IS 'Pedidos realizados por los clientes';

CREATE INDEX idx_orders_client ON orders(client_id);
CREATE INDEX idx_orders_seller ON orders(seller_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_date ON orders(order_date);

-- ============================================================
-- 8. ITEMS DE PEDIDO
-- ============================================================
CREATE TABLE order_items (
    id              SERIAL PRIMARY KEY,
    order_id        INT          NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id      INT          NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    quantity        INT          NOT NULL CHECK (quantity > 0),
    unit_price      DECIMAL(12,2) NOT NULL CHECK (unit_price >= 0),
    subtotal        DECIMAL(12,2) NOT NULL GENERATED ALWAYS AS (quantity * unit_price) STORED,
    created_at      TIMESTAMP    NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE order_items IS 'Detalle de productos en cada pedido';

CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);

-- ============================================================
-- 9. CARRITO DE COMPRAS
-- ============================================================
CREATE TABLE cart_items (
    id              SERIAL PRIMARY KEY,
    user_id         INT          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id      INT          NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity        INT          NOT NULL DEFAULT 1 CHECK (quantity > 0),
    added_at        TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP    NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);

COMMENT ON TABLE cart_items IS 'Carrito de compras de cada usuario';

CREATE INDEX idx_cart_items_user ON cart_items(user_id);

-- Registro de uso de cupones (depende de coupons, users y orders)
CREATE TABLE coupon_usage (
    id              SERIAL PRIMARY KEY,
    coupon_id       INT          NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
    user_id         INT          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    order_id        INT          NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    used_at         TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_coupon_usage_coupon ON coupon_usage(coupon_id);
CREATE INDEX idx_coupon_usage_user ON coupon_usage(user_id);

-- ============================================================
-- 10. LOTES DE INVENTARIO (Rollos de tela)
-- ============================================================
CREATE TABLE inventory_batches (
    id              VARCHAR(10)  PRIMARY KEY,  -- Ej: R001, R002
    fabric_type     VARCHAR(150) NOT NULL,
    supplier        VARCHAR(255) NOT NULL,
    initial_meters  DECIMAL(10,2) NOT NULL CHECK (initial_meters > 0),
    current_meters  DECIMAL(10,2) NOT NULL CHECK (current_meters >= 0),
    status          VARCHAR(20)  NOT NULL DEFAULT 'active'
                        CHECK (status IN ('active', 'low', 'critical', 'depleted')),
    created_at      TIMESTAMP    NOT NULL DEFAULT NOW(),
    last_update     TIMESTAMP    NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE inventory_batches IS 'Lotes/rollos de tela en inventario';
COMMENT ON COLUMN inventory_batches.id IS 'Código del rollo, ej: R001';

CREATE INDEX idx_inventory_batches_status ON inventory_batches(status);
CREATE INDEX idx_inventory_batches_fabric ON inventory_batches(fabric_type);

-- ============================================================
-- 11. EVENTOS DE MERMA / DESPERDICIO
-- ============================================================
CREATE TABLE waste_events (
    id              SERIAL PRIMARY KEY,
    roll_id         VARCHAR(10)  NOT NULL REFERENCES inventory_batches(id) ON DELETE CASCADE,
    meters          DECIMAL(10,2) NOT NULL CHECK (meters > 0),
    reason          VARCHAR(30)  NOT NULL
                        CHECK (reason IN ('factory_defect', 'cutting_error', 'damaged', 'quality_control', 'other')),
    description     TEXT         NULL,
    responsible     VARCHAR(255) NULL,
    user_id         INT          NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    event_date      DATE         NOT NULL DEFAULT CURRENT_DATE,
    created_at      TIMESTAMP    NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE waste_events IS 'Registro de mermas y desperdicios de tela';

CREATE INDEX idx_waste_events_roll ON waste_events(roll_id);
CREATE INDEX idx_waste_events_reason ON waste_events(reason);
CREATE INDEX idx_waste_events_date ON waste_events(event_date);

-- ============================================================
-- 12. UMBRALES DE STOCK
-- ============================================================
CREATE TABLE stock_thresholds (
    id              SERIAL PRIMARY KEY,
    fabric_type     VARCHAR(150) NOT NULL UNIQUE,
    min_meters      DECIMAL(10,2) NOT NULL CHECK (min_meters >= 0),
    alert_enabled   BOOLEAN      NOT NULL DEFAULT TRUE,
    updated_at      TIMESTAMP    NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE stock_thresholds IS 'Umbrales mínimos de stock por tipo de tela';

-- ============================================================
-- 13. REPORTES DE FALLOS / BUG REPORTS
-- ============================================================
CREATE TABLE bug_reports (
    id              SERIAL PRIMARY KEY,
    product_id      INT          NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    seller_id       INT          NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    client_id       INT          NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    title           VARCHAR(255) NOT NULL,
    description     TEXT         NOT NULL,
    status          VARCHAR(20)  NOT NULL DEFAULT 'open'
                        CHECK (status IN ('open', 'in_review', 'resolved', 'closed')),
    priority        VARCHAR(10)  NOT NULL DEFAULT 'medium'
                        CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    assigned_to     INT          NULL REFERENCES users(id),
    resolved_at     DATE         NULL,
    created_at      TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP    NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE bug_reports IS 'Reportes de problemas de calidad en productos';

CREATE INDEX idx_bug_reports_status ON bug_reports(status);
CREATE INDEX idx_bug_reports_seller ON bug_reports(seller_id);
CREATE INDEX idx_bug_reports_client ON bug_reports(client_id);
CREATE INDEX idx_bug_reports_priority ON bug_reports(priority);

-- ============================================================
-- 14. TICKETS DE SOPORTE
-- ============================================================
CREATE TABLE support_tickets (
    id              SERIAL PRIMARY KEY,
    client_id       INT          NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    order_id        INT          NULL REFERENCES orders(id) ON DELETE SET NULL,
    subject         VARCHAR(255) NOT NULL,
    description     TEXT         NOT NULL,
    priority        VARCHAR(10)  NOT NULL DEFAULT 'medium'
                        CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    status          VARCHAR(20)  NOT NULL DEFAULT 'open'
                        CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
    category        VARCHAR(30)  NOT NULL
                        CHECK (category IN ('quality', 'quantity', 'defect', 'shipping', 'payment', 'other')),
    assigned_to     INT          NULL REFERENCES users(id),
    resolved_at     DATE         NULL,
    created_at      TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP    NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE support_tickets IS 'Tickets de soporte creados por los clientes';

CREATE INDEX idx_support_tickets_client ON support_tickets(client_id);
CREATE INDEX idx_support_tickets_status ON support_tickets(status);
CREATE INDEX idx_support_tickets_category ON support_tickets(category);
CREATE INDEX idx_support_tickets_assigned ON support_tickets(assigned_to);

-- Fotos adjuntas a tickets
CREATE TABLE support_ticket_photos (
    id              SERIAL PRIMARY KEY,
    ticket_id       INT          NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
    photo_url       TEXT         NOT NULL,
    uploaded_at     TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ticket_photos_ticket ON support_ticket_photos(ticket_id);

-- ============================================================
-- 15. VENTAS DIARIAS (Histórico)
-- ============================================================
CREATE TABLE daily_sales (
    id              SERIAL PRIMARY KEY,
    sale_date       DATE         NOT NULL UNIQUE,
    total_sales     DECIMAL(14,2) NOT NULL DEFAULT 0,
    total_orders    INT          NOT NULL DEFAULT 0,
    created_at      TIMESTAMP    NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE daily_sales IS 'Resumen de ventas agregadas por día';

CREATE INDEX idx_daily_sales_date ON daily_sales(sale_date);

-- ============================================================
-- 16. VENTAS POR REGIÓN (Colombia)
-- ============================================================
CREATE TABLE region_sales (
    id              SERIAL PRIMARY KEY,
    department      VARCHAR(100) NOT NULL UNIQUE,
    capital         VARCHAR(100) NOT NULL,
    total_sales     DECIMAL(14,2) NOT NULL DEFAULT 0,
    total_orders    INT          NOT NULL DEFAULT 0,
    updated_at      TIMESTAMP    NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE region_sales IS 'Ventas acumuladas por departamento de Colombia';

-- ============================================================
-- 17. ACTIVIDAD RECIENTE
-- ============================================================
CREATE TABLE recent_activity (
    id              SERIAL PRIMARY KEY,
    activity_type   VARCHAR(20)  NOT NULL
                        CHECK (activity_type IN ('order', 'user', 'bug', 'product', 'system')),
    user_id         INT          NULL REFERENCES users(id) ON DELETE SET NULL,
    action          VARCHAR(255) NOT NULL,
    amount          DECIMAL(12,2) NULL,
    icon            VARCHAR(30)  NULL,
    created_at      TIMESTAMP    NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE recent_activity IS 'Log de actividad reciente del sistema';

CREATE INDEX idx_recent_activity_type ON recent_activity(activity_type);
CREATE INDEX idx_recent_activity_date ON recent_activity(created_at);

-- ============================================================
-- 18. CONFIGURACIÓN DEL SISTEMA
-- ============================================================
CREATE TABLE system_config (
    id              SERIAL PRIMARY KEY,
    key             VARCHAR(100) NOT NULL UNIQUE,
    value           TEXT         NOT NULL,
    value_type      VARCHAR(20)  NOT NULL DEFAULT 'string'
                        CHECK (value_type IN ('string', 'number', 'boolean', 'json')),
    description     VARCHAR(255) NULL,
    updated_at      TIMESTAMP    NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE system_config IS 'Configuración global del sistema (clave-valor)';

CREATE INDEX idx_system_config_key ON system_config(key);

-- ============================================================
-- 19. BANNER GLOBAL
-- ============================================================
CREATE TABLE global_banner (
    id              SERIAL PRIMARY KEY,
    enabled         BOOLEAN      NOT NULL DEFAULT FALSE,
    message         TEXT         NOT NULL,
    banner_type     VARCHAR(20)  NOT NULL DEFAULT 'info'
                        CHECK (banner_type IN ('info', 'warning', 'success', 'error')),
    updated_at      TIMESTAMP    NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE global_banner IS 'Banner global mostrado en la parte superior del sitio';


-- ============================================================
-- DATOS INICIALES (SEEDS)
-- ============================================================

-- -------------------------------------------------------
-- Usuarios
-- -------------------------------------------------------
INSERT INTO users (id, name, email, password_hash, role, active, suspended, suspension_reason, commission_rate, registered_at, last_login) VALUES
(1,  'Admin Principal',    'admin@ddtextil.com',            '$2b$10$hashplaceholder1', 'admin',  TRUE,  FALSE, NULL, NULL, '2024-01-15', '2026-01-27'),
(2,  'Carlos Rodríguez',   'vendedor@ddtextil.com',         '$2b$10$hashplaceholder2', 'seller', TRUE,  FALSE, NULL, 15,   '2024-02-01', '2026-01-26'),
(3,  'María González',     'maria.gonzalez@ddtextil.com',   '$2b$10$hashplaceholder3', 'seller', TRUE,  FALSE, NULL, 12,   '2024-03-10', '2026-01-27'),
(4,  'Juan Pérez',         'juan.perez@ddtextil.com',       '$2b$10$hashplaceholder4', 'seller', FALSE, TRUE,  'Múltiples reportes de calidad', 10, '2024-04-20', '2025-12-15'),
(5,  'Ana Martínez',       'ana.martinez@ddtextil.com',     '$2b$10$hashplaceholder5', 'seller', TRUE,  FALSE, NULL, 18,   '2024-05-05', '2026-01-25'),
(6,  'Cliente Demo',       'cliente@ddtextil.com',          '$2b$10$hashplaceholder6', 'client', TRUE,  FALSE, NULL, NULL, '2024-06-01', '2026-01-27'),
(7,  'Laura Sánchez',      'laura.sanchez@email.com',       '$2b$10$hashplaceholder7', 'client', TRUE,  FALSE, NULL, NULL, '2024-07-12', '2026-01-26'),
(8,  'Pedro Ramírez',      'pedro.ramirez@email.com',       '$2b$10$hashplaceholder8', 'client', TRUE,  FALSE, NULL, NULL, '2024-08-03', '2026-01-24'),
(9,  'Sofía Torres',       'sofia.torres@email.com',        '$2b$10$hashplaceholder9', 'client', TRUE,  FALSE, NULL, NULL, '2024-09-15', '2026-01-27'),
(10, 'Diego Morales',      'diego.morales@email.com',       '$2b$10$hashplaceholderA', 'client', FALSE, FALSE, NULL, NULL, '2024-10-20', '2025-11-10'),
(11, 'Valentina Cruz',     'valentina.cruz@email.com',      '$2b$10$hashplaceholderB', 'client', TRUE,  FALSE, NULL, NULL, '2024-11-05', '2026-01-25'),
(12, 'Andrés Vargas',      'andres.vargas@email.com',       '$2b$10$hashplaceholderC', 'client', TRUE,  FALSE, NULL, NULL, '2024-12-01', '2026-01-23');

-- Reiniciar secuencia
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));

-- -------------------------------------------------------
-- Categorías
-- -------------------------------------------------------
INSERT INTO categories (name) VALUES
('Algodón'), ('Seda'), ('Lino'), ('Terciopelo'), ('Denim'),
('Gasa'), ('Satén'), ('Tweed'), ('Jersey'), ('Organza'),
('Pana'), ('Encaje'), ('Poliéster');

-- -------------------------------------------------------
-- Productos
-- -------------------------------------------------------
INSERT INTO products (id, name, category_id, price, seller_id, description, material, width, weight, care, stock, featured) VALUES
(1,  'Tela de Algodón Premium',  (SELECT id FROM categories WHERE name='Algodón'),     25000,  2, 'Tela de algodón 100% natural, perfecta para prendas de vestir cómodas y transpirables.', '100% Algodón',                     '150 cm', '180 g/m²', 'Lavable a máquina a 30°C',       50, TRUE),
(2,  'Seda Italiana Luxury',     (SELECT id FROM categories WHERE name='Seda'),         85000,  2, 'Seda italiana de la más alta calidad con acabado brillante.',                            '100% Seda Natural',                '140 cm', '120 g/m²', 'Lavado en seco únicamente',      25, TRUE),
(3,  'Lino Natural Beige',       (SELECT id FROM categories WHERE name='Lino'),         42000,  3, 'Lino natural de alta calidad en tono beige neutro.',                                    '100% Lino',                        '145 cm', '200 g/m²', 'Lavable a máquina a 40°C',       35, TRUE),
(4,  'Terciopelo Azul Real',     (SELECT id FROM categories WHERE name='Terciopelo'),   65000,  2, 'Terciopelo suave y lujoso en color azul real.',                                         '95% Poliéster, 5% Elastano',       '150 cm', '350 g/m²', 'Lavado en seco recomendado',     20, TRUE),
(5,  'Denim Stretch Negro',      (SELECT id FROM categories WHERE name='Denim'),        38000,  2, 'Tela denim con elastano para mayor comodidad. Color negro profundo.',                    '98% Algodón, 2% Elastano',         '160 cm', '320 g/m²', 'Lavable a máquina a 30°C',       45, FALSE),
(6,  'Gasa Floral Primavera',    (SELECT id FROM categories WHERE name='Gasa'),         32000,  4, 'Gasa ligera con estampado floral delicado.',                                            '100% Poliéster',                   '145 cm', '90 g/m²',  'Lavable a mano',                 30, TRUE),
(7,  'Satén Champagne',          (SELECT id FROM categories WHERE name='Satén'),        48000,  3, 'Satén brillante en tono champagne elegante.',                                           '100% Poliéster',                   '150 cm', '140 g/m²', 'Lavado en seco',                 28, FALSE),
(8,  'Tweed Multicolor',         (SELECT id FROM categories WHERE name='Tweed'),        72000,  3, 'Tweed de alta calidad con mezcla de colores vibrantes.',                                '60% Lana, 30% Poliéster, 10% Acrílico', '145 cm', '380 g/m²', 'Lavado en seco únicamente', 15, TRUE),
(9,  'Jersey Punto Gris',        (SELECT id FROM categories WHERE name='Jersey'),       28000,  5, 'Jersey de punto suave y elástico en color gris melange.',                               '95% Algodón, 5% Elastano',         '160 cm', '220 g/m²', 'Lavable a máquina a 30°C',       60, FALSE),
(10, 'Organza Blanca',           (SELECT id FROM categories WHERE name='Organza'),      35000,  5, 'Organza transparente y delicada en blanco puro.',                                       '100% Poliéster',                   '150 cm', '70 g/m²',  'Lavado a mano delicado',         40, FALSE),
(11, 'Pana Camel',               (SELECT id FROM categories WHERE name='Pana'),         45000,  3, 'Pana de grosor medio en tono camel cálido. Ideal para pantalones, chaquetas y prendas de otoño-invierno.', '100% Algodón', '145 cm', '280 g/m²', 'Lavable a máquina a 30°C', 32, FALSE),
(12, 'Encaje Francés Marfil',    (SELECT id FROM categories WHERE name='Encaje'),       95000,  2, 'Encaje francés de lujo con diseño floral intrincado.',                                  '80% Nylon, 20% Elastano',          '135 cm', '110 g/m²', 'Lavado a mano',                  18, TRUE);

SELECT setval('products_id_seq', (SELECT MAX(id) FROM products));

-- -------------------------------------------------------
-- Imágenes de productos
-- -------------------------------------------------------
INSERT INTO product_images (product_id, image_url, display_order, alt_text) VALUES
-- Producto 1
(1, 'https://placehold.co/600x400/e2e8f0/1e293b?text=Algodon+Premium',   0, 'Algodón Premium - Vista principal'),
(1, 'https://placehold.co/600x400/f1f5f9/0f172a?text=Detalle+Textura',   1, 'Detalle de textura'),
(1, 'https://placehold.co/600x400/e2e8f0/1e293b?text=Uso+Prenda',        2, 'Uso en prenda'),
-- Producto 2
(2, 'https://placehold.co/600x400/fbcfe8/831843?text=Seda+Italiana',     0, 'Seda Italiana'),
(2, 'https://placehold.co/600x400/fce7f3/9d174d?text=Brillo+Seda',       1, 'Brillo de la seda'),
(2, 'https://placehold.co/600x400/fbcfe8/831843?text=Caida+Tela',        2, 'Caída de la tela'),
-- Producto 3
(3, 'https://placehold.co/600x400/f5f5dc/5D4037?text=Lino+Natural',      0, 'Lino Natural'),
(3, 'https://placehold.co/600x400/e6e2d3/5D4037?text=Textura+Lino',      1, 'Textura del lino'),
(3, 'https://placehold.co/600x400/f5f5dc/5D4037?text=Primer+Plano',      2, 'Primer plano'),
-- Producto 4
(4, 'https://placehold.co/600x400/1e3a8a/bfdbfe?text=Terciopelo+Azul',   0, 'Terciopelo Azul'),
(4, 'https://placehold.co/600x400/172554/dbeafe?text=Suavidad+Royal',     1, 'Suavidad Royal'),
(4, 'https://placehold.co/600x400/1e3a8a/bfdbfe?text=Detalle',           2, 'Detalle'),
-- Producto 5
(5, 'https://placehold.co/600x400/1f2937/f3f4f6?text=Denim+Negro',       0, 'Denim Negro'),
(5, 'https://placehold.co/600x400/111827/e5e7eb?text=Tejido+Jean',       1, 'Tejido Jean'),
(5, 'https://placehold.co/600x400/1f2937/f3f4f6?text=Elastico',          2, 'Elástico'),
-- Producto 6
(6, 'https://placehold.co/600x400/fcd34d/78350f?text=Gasa+Floral',       0, 'Gasa Floral'),
(6, 'https://placehold.co/600x400/fde68a/92400e?text=Estampado',          1, 'Estampado'),
(6, 'https://placehold.co/600x400/fcd34d/78350f?text=Transparencia',     2, 'Transparencia'),
-- Producto 7
(7, 'https://placehold.co/600x400/fef3c7/92400e?text=Saten+Champagne',   0, 'Satén Champagne'),
(7, 'https://placehold.co/600x400/fffbeb/b45309?text=Brillo+Suave',      1, 'Brillo Suave'),
(7, 'https://placehold.co/600x400/fef3c7/92400e?text=Elegancia',         2, 'Elegancia'),
-- Producto 8
(8, 'https://placehold.co/600x400/ec4899/831843?text=Tweed+Color',       0, 'Tweed Color'),
(8, 'https://placehold.co/600x400/f9a8d4/9d174d?text=Textura+Gruesa',    1, 'Textura Gruesa'),
(8, 'https://placehold.co/600x400/ec4899/831843?text=Tejido',            2, 'Tejido'),
-- Producto 9
(9, 'https://placehold.co/600x400/9ca3af/1f2937?text=Jersey+Gris',       0, 'Jersey Gris'),
(9, 'https://placehold.co/600x400/d1d5db/374151?text=Punto+Melange',     1, 'Punto Melange'),
(9, 'https://placehold.co/600x400/9ca3af/1f2937?text=Elastico',          2, 'Elástico'),
-- Producto 10
(10, 'https://placehold.co/600x400/ffffff/94a3b8?text=Organza+Blanca',   0, 'Organza Blanca'),
(10, 'https://placehold.co/600x400/f8fafc/64748b?text=Transparencia',    1, 'Transparencia'),
(10, 'https://placehold.co/600x400/ffffff/94a3b8?text=Delicada',         2, 'Delicada'),
-- Producto 11
(11, 'https://placehold.co/600x400/d97706/fffbeb?text=Pana+Camel',       0, 'Pana Camel'),
(11, 'https://placehold.co/600x400/b45309/fef3c7?text=Canale+Grueso',    1, 'Canalé Grueso'),
(11, 'https://placehold.co/600x400/d97706/fffbeb?text=Invierno',         2, 'Invierno'),
-- Producto 12
(12, 'https://placehold.co/600x400/fefce8/854d0e?text=Encaje+Marfil',    0, 'Encaje Marfil'),
(12, 'https://placehold.co/600x400/fef9c3/a16207?text=Detalle+Floral',   1, 'Detalle Floral'),
(12, 'https://placehold.co/600x400/fefce8/854d0e?text=Boda',             2, 'Boda');

-- -------------------------------------------------------
-- Pedidos
-- -------------------------------------------------------
INSERT INTO orders (id, client_id, seller_id, total, status, order_date) VALUES
(1001, 6,  2, 245000, 'delivered',  '2026-01-20'),
(1002, 7,  3, 180000, 'delivered',  '2026-01-21'),
(1003, 8,  2, 320000, 'shipped',    '2026-01-22'),
(1004, 9,  4, 150000, 'preparing',  '2026-01-23'),
(1005, 6,  3, 410000, 'delivered',  '2026-01-23'),
(1006, 11, 2, 125000, 'delivered',  '2026-01-24'),
(1007, 12, 5, 280000, 'shipped',    '2026-01-24'),
(1008, 7,  2, 305000, 'preparing',  '2026-01-25'),
(1009, 8,  3, 165000, 'delivered',  '2026-01-25'),
(1010, 9,  2, 495000, 'preparing',  '2026-01-26'),
(1011, 6,  3, 190000, 'delivered',  '2026-01-26'),
(1012, 11, 5, 140000, 'preparing',  '2026-01-27'),
(1013, 12, 2, 430000, 'preparing',  '2026-01-27'),
(1014, 7,  3, 285000, 'preparing',  '2026-01-27');

SELECT setval('orders_id_seq', (SELECT MAX(id) FROM orders));

-- Items de pedido
INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES
(1001, 1, 1, 25000),  (1001, 2, 1, 85000),
(1002, 3, 1, 42000),
(1003, 4, 1, 65000),  (1003, 5, 1, 38000),
(1004, 6, 1, 32000),
(1005, 7, 1, 48000),  (1005, 8, 1, 72000),
(1006, 1, 1, 25000),
(1007, 9, 1, 28000),  (1007, 10, 1, 35000),
(1008, 2, 1, 85000),  (1008, 3, 1, 42000),
(1009, 4, 1, 65000),
(1010, 5, 1, 38000),  (1010, 6, 1, 32000),  (1010, 7, 1, 48000),
(1011, 8, 1, 72000),
(1012, 9, 1, 28000),
(1013, 1, 1, 25000),  (1013, 2, 1, 85000),  (1013, 3, 1, 42000),
(1014, 4, 1, 65000),  (1014, 5, 1, 38000);

-- -------------------------------------------------------
-- Cupones
-- -------------------------------------------------------
INSERT INTO coupons (id, code, discount_type, discount_value, min_purchase, first_time_only, max_uses, usage_count, active, expires_at, created_at) VALUES
(1, 'VERANO2026',      'percentage', 20,    100000, FALSE, 100,  45,  TRUE,  '2026-03-31', '2026-01-01'),
(2, 'PRIMERACOMPRA',   'fixed',      50000, 200000, TRUE,  500,  234, TRUE,  '2026-12-31', '2025-11-15'),
(3, 'NAVIDAD2025',     'percentage', 25,    150000, FALSE, 200,  198, FALSE, '2025-12-31', '2025-12-01'),
(4, 'SEDAS10',         'percentage', 10,    0,      FALSE, 1000, 67,  TRUE,  '2026-06-30', '2026-01-10');

SELECT setval('coupons_id_seq', (SELECT MAX(id) FROM coupons));

-- Categorías de cupones
INSERT INTO coupon_categories (coupon_id, category_name) VALUES
(1, 'Algodón'), (1, 'Lino'),
(4, 'Seda'), (4, 'Satén');

-- -------------------------------------------------------
-- Lotes de inventario
-- -------------------------------------------------------
INSERT INTO inventory_batches (id, fabric_type, supplier, initial_meters, current_meters, status, created_at, last_update) VALUES
('R001', 'Algodón Premium',    'Textiles del Valle', 500,  320, 'active',   '2025-12-15', '2026-01-27'),
('R002', 'Seda Natural',       'Sedas Iberia',       300,  45,  'low',      '2025-11-20', '2026-01-25'),
('R003', 'Lino Natural',       'Linos Colombia',     600,  520, 'active',   '2026-01-05', '2026-01-26'),
('R004', 'Poliéster Técnico',  'Sintéticos SA',      800,  780, 'active',   '2026-01-10', '2026-01-20'),
('R005', 'Terciopelo Luxury',  'Premium Textiles',   250,  12,  'critical', '2025-10-15', '2026-01-27'),
('R006', 'Satén Brillante',    'Brillo y Tela',      400,  310, 'active',   '2025-12-01', '2026-01-24'),
('R007', 'Denim Premium',      'Jeans Factory',      1000, 850, 'active',   '2025-11-10', '2026-01-22'),
('R008', 'Algodón Premium',    'Textiles del Valle', 500,  465, 'active',   '2026-01-12', '2026-01-23'),
('R009', 'Lino Natural',       'Linos Colombia',     450,  180, 'low',      '2025-10-20', '2026-01-26'),
('R010', 'Seda Natural',       'Sedas Iberia',       350,  290, 'active',   '2025-12-28', '2026-01-21');

-- -------------------------------------------------------
-- Eventos de merma
-- -------------------------------------------------------
INSERT INTO waste_events (id, roll_id, meters, reason, description, responsible, user_id, event_date) VALUES
(1, 'R001', 15, 'factory_defect',  'Defecto de fábrica en el tejido',       'N/A',              2, '2026-01-15'),
(2, 'R002', 8,  'cutting_error',   'Error al cortar medida para cliente',   'Carlos Rodríguez', 2, '2026-01-20'),
(3, 'R005', 5,  'damaged',         'Daño durante transporte',               'N/A',              1, '2026-01-10'),
(4, 'R003', 12, 'factory_defect',  'Manchas en la tela',                    'N/A',              3, '2026-01-12'),
(5, 'R006', 6,  'cutting_error',   'Recorte erróneo',                       'María González',   3, '2026-01-22'),
(6, 'R001', 10, 'quality_control', 'No pasó control de calidad',            'Admin Principal',  1, '2026-01-25');

SELECT setval('waste_events_id_seq', (SELECT MAX(id) FROM waste_events));

-- -------------------------------------------------------
-- Umbrales de stock
-- -------------------------------------------------------
INSERT INTO stock_thresholds (fabric_type, min_meters, alert_enabled) VALUES
('Algodón Premium',    100, TRUE),
('Seda Natural',       50,  TRUE),
('Lino Natural',       150, TRUE),
('Poliéster Técnico',  200, TRUE),
('Terciopelo Luxury',  30,  TRUE),
('Satén Brillante',    80,  TRUE),
('Denim Premium',      250, TRUE);

-- -------------------------------------------------------
-- Reportes de fallos
-- -------------------------------------------------------
INSERT INTO bug_reports (id, product_id, seller_id, client_id, title, description, status, priority, assigned_to, resolved_at, created_at) VALUES
(1, 1, 2, 6,  'Color no coincide con la foto', 'El color de la tela recibida es más oscuro que en las fotos del producto', 'open',      'medium', NULL, NULL,         '2026-01-25'),
(2, 3, 3, 7,  'Metraje incorrecto',            'Pedí 5 metros pero solo recibí 4.5 metros',                              'in_review', 'high',   1,    NULL,         '2026-01-23'),
(3, 5, 2, 8,  'Defecto en la tela',            'La tela tiene una pequeña mancha que no se puede quitar',                 'resolved',  'high',   1,    '2026-01-22', '2026-01-20'),
(4, 7, 3, 9,  'Textura diferente',             'La textura no es tan suave como esperaba según la descripción',           'open',      'low',    NULL, NULL,         '2026-01-26');

SELECT setval('bug_reports_id_seq', (SELECT MAX(id) FROM bug_reports));

-- -------------------------------------------------------
-- Tickets de soporte
-- -------------------------------------------------------
INSERT INTO support_tickets (id, client_id, order_id, subject, description, priority, status, category, assigned_to, resolved_at, created_at, updated_at) VALUES
(1, 6,  1001, 'Color no coincide con la foto', 'El color de la tela recibida es más oscuro que en las fotos del producto',        'medium', 'open',        'quality',  NULL, NULL,         '2026-01-25', '2026-01-25'),
(2, 7,  1002, 'Metraje incorrecto',            'Pedí 5 metros pero solo recibí 4.5 metros. Necesito el metraje completo.',       'high',   'in_progress', 'quantity', 1,    NULL,         '2026-01-23', '2026-01-24'),
(3, 8,  1003, 'Defecto en la tela',            'La tela tiene una pequeña mancha que no se puede quitar',                        'high',   'resolved',    'defect',   1,    '2026-01-22', '2026-01-20', '2026-01-22'),
(4, 9,  1005, 'Textura diferente',             'La textura no es tan suave como esperaba según la descripción',                  'low',    'open',        'quality',  NULL, NULL,         '2026-01-26', '2026-01-26'),
(5, 11, 1006, 'Entrega tardía',                'Mi pedido debía llegar hace 3 días y aún no ha sido despachado',                 'medium', 'in_progress', 'shipping', 1,    NULL,         '2026-01-24', '2026-01-25');

SELECT setval('support_tickets_id_seq', (SELECT MAX(id) FROM support_tickets));

-- -------------------------------------------------------
-- Ventas diarias
-- -------------------------------------------------------
INSERT INTO daily_sales (sale_date, total_sales, total_orders) VALUES
('2026-01-01', 450000, 5), ('2026-01-02', 380000, 4), ('2026-01-03', 520000, 6),
('2026-01-04', 290000, 3), ('2026-01-05', 610000, 7), ('2026-01-06', 470000, 5),
('2026-01-07', 540000, 6), ('2026-01-08', 390000, 4), ('2026-01-09', 680000, 8),
('2026-01-10', 510000, 6), ('2026-01-11', 420000, 5), ('2026-01-12', 560000, 6),
('2026-01-13', 490000, 5), ('2026-01-14', 630000, 7), ('2026-01-15', 380000, 4),
('2026-01-16', 720000, 8), ('2026-01-17', 450000, 5), ('2026-01-18', 590000, 7),
('2026-01-19', 410000, 4), ('2026-01-20', 670000, 8), ('2026-01-21', 530000, 6),
('2026-01-22', 480000, 5), ('2026-01-23', 710000, 8), ('2026-01-24', 550000, 6),
('2026-01-25', 620000, 7), ('2026-01-26', 490000, 5), ('2026-01-27', 580000, 6);

-- -------------------------------------------------------
-- Ventas por región
-- -------------------------------------------------------
INSERT INTO region_sales (department, capital, total_sales, total_orders) VALUES
('Antioquia',            'Medellín',       12500000, 145),
('Cundinamarca',         'Bogotá',         18200000, 210),
('Valle del Cauca',      'Cali',           9800000,  112),
('Atlántico',            'Barranquilla',   7300000,  85),
('Santander',            'Bucaramanga',    5600000,  68),
('Bolívar',              'Cartagena',      4200000,  52),
('Caldas',               'Manizales',      3100000,  38),
('Risaralda',            'Pereira',        2900000,  34),
('Quindío',              'Armenia',        2500000,  29),
('Tolima',               'Ibagué',         2200000,  26),
('Norte de Santander',   'Cúcuta',         1800000,  22),
('Magdalena',            'Santa Marta',    1600000,  19),
('Huila',                'Neiva',          1400000,  17),
('Nariño',               'Pasto',          1200000,  15),
('Cauca',                'Popayán',        1100000,  13),
('Córdoba',              'Montería',       980000,   12),
('Meta',                 'Villavicencio',  850000,   10),
('Cesar',                'Valledupar',     720000,   9),
('Sucre',                'Sincelejo',      650000,   8),
('Boyacá',               'Tunja',          580000,   7);

-- -------------------------------------------------------
-- Productos pendientes de aprobación
-- -------------------------------------------------------
INSERT INTO pending_products (id, name, description, price, category, seller_id, status, submitted_at) VALUES
(1, 'Lino Orgánico Premium',  'Lino 100% orgánico certificado, perfecto para ropa de verano',  185000, 'Lino',       2, 'pending', '2026-01-26'),
(2, 'Terciopelo Italiano',    'Terciopelo importado de Italia, textura suave y elegante',       320000, 'Terciopelo', 3, 'pending', '2026-01-25'),
(3, 'Algodón Egipcio',        'Algodón de fibra larga procedente de Egipto',                    165000, 'Algodón',    5, 'pending', '2026-01-27');

SELECT setval('pending_products_id_seq', (SELECT MAX(id) FROM pending_products));

-- Imágenes de productos pendientes
INSERT INTO pending_product_images (pending_product_id, image_url, display_order) VALUES
(1, 'https://placehold.co/400x400/e5e7eb/6b7280?text=Lino+Orgánico',        0),
(2, 'https://placehold.co/400x400/e5e7eb/6b7280?text=Terciopelo+Italiano',   0),
(3, 'https://placehold.co/400x400/e5e7eb/6b7280?text=Algodón+Egipcio',       0);

-- -------------------------------------------------------
-- Actividad reciente
-- -------------------------------------------------------
INSERT INTO recent_activity (activity_type, user_id, action, amount, icon) VALUES
('order',   6,  'realizó un pedido',        245000, 'shopping'),
('user',    12, 'se registró en el sistema', NULL,   'user'),
('order',   7,  'realizó un pedido',        180000, 'shopping'),
('bug',     8,  'reportó un problema',       NULL,   'alert'),
('order',   9,  'realizó un pedido',        320000, 'shopping'),
('product', 2,  'agregó un nuevo producto',  NULL,   'package');

-- -------------------------------------------------------
-- Configuración del sistema
-- -------------------------------------------------------
INSERT INTO system_config (key, value, value_type, description) VALUES
('site_name',                'D&D Textil',  'string',  'Nombre del sitio'),
('default_dark_mode',        'false',       'boolean', 'Modo oscuro por defecto'),
('primary_color',            '#8B5CF6',     'string',  'Color primario del tema'),
('secondary_color',          '#EC4899',     'string',  'Color secundario del tema'),
('accent_color',             '#F59E0B',     'string',  'Color de acento'),
('tax_rate',                 '0.19',        'number',  'Tasa de impuesto (IVA 19%)'),
('shipping_cost',            '15000',       'number',  'Costo de envío estándar'),
('free_shipping_threshold',  '200000',      'number',  'Mínimo de compra para envío gratis'),
('low_stock_threshold',      '20',          'number',  'Umbral de stock bajo'),
('maintenance_mode',         'false',       'boolean', 'Modo mantenimiento'),
('maintenance_message',      'Estamos realizando mejoras en el sistema. Volvemos pronto.', 'string', 'Mensaje de mantenimiento');

-- Banner global
INSERT INTO global_banner (enabled, message, banner_type) VALUES
(TRUE, '¡Envío gratis en compras superiores a $200.000!', 'info');


-- ============================================================
-- FUNCIONES AUXILIARES
-- ============================================================

-- Función para actualizar el campo updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER trigger_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_cart_items_updated_at
    BEFORE UPDATE ON cart_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_bug_reports_updated_at
    BEFORE UPDATE ON bug_reports
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_support_tickets_updated_at
    BEFORE UPDATE ON support_tickets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_stock_thresholds_updated_at
    BEFORE UPDATE ON stock_thresholds
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_system_config_updated_at
    BEFORE UPDATE ON system_config
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ============================================================
-- VISTAS ÚTILES
-- ============================================================

-- Vista: resumen de vendedores con sus métricas
CREATE OR REPLACE VIEW vw_seller_summary AS
SELECT
    u.id,
    u.name,
    u.email,
    u.commission_rate,
    u.active,
    u.suspended,
    COUNT(DISTINCT o.id)   AS total_orders,
    COALESCE(SUM(o.total), 0) AS total_revenue,
    COUNT(DISTINCT br.id)  AS total_bug_reports
FROM users u
LEFT JOIN orders o       ON u.id = o.seller_id
LEFT JOIN bug_reports br ON u.id = br.seller_id
WHERE u.role = 'seller'
GROUP BY u.id, u.name, u.email, u.commission_rate, u.active, u.suspended;

-- Vista: stock actual por tipo de tela
CREATE OR REPLACE VIEW vw_stock_status AS
SELECT
    ib.fabric_type,
    SUM(ib.current_meters) AS total_meters,
    COUNT(*)               AS total_rolls,
    st.min_meters          AS threshold,
    CASE
        WHEN SUM(ib.current_meters) <= st.min_meters * 0.3 THEN 'critical'
        WHEN SUM(ib.current_meters) <= st.min_meters        THEN 'low'
        ELSE 'active'
    END AS stock_status
FROM inventory_batches ib
LEFT JOIN stock_thresholds st ON ib.fabric_type = st.fabric_type
GROUP BY ib.fabric_type, st.min_meters;

-- Vista: resumen de pedidos por cliente
CREATE OR REPLACE VIEW vw_client_orders AS
SELECT
    u.id         AS client_id,
    u.name       AS client_name,
    u.email,
    COUNT(o.id)           AS total_orders,
    COALESCE(SUM(o.total), 0) AS total_spent,
    MAX(o.order_date)     AS last_order_date
FROM users u
LEFT JOIN orders o ON u.id = o.client_id
WHERE u.role = 'client'
GROUP BY u.id, u.name, u.email;


-- ============================================================
-- FIN DEL SCRIPT
-- ============================================================
