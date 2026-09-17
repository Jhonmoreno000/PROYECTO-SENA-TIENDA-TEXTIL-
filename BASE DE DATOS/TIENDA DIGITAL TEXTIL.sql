--
-- ============================================================================
-- VOLCADO DE BASE DE DATOS POSTGRESQL - D&D TEXTIL
-- PROYECTO FORMATIVO SENA: TIENDA DIGITAL DE TELAS Y GESTIÓN TEXTIL
-- ============================================================================
--

\restrict N0ZrrFfSENKgOisUPO7tzvkaLla9MuffG8eNBphhCJihO2oabNvhZjzFhMAyfyU

-- Volcado generado desde base de datos versión: 18.3
-- Volcado extraído mediante herramienta pg_dump versión: 18.3

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Nombre: public; Tipo: ESQUEMA; Esquema: -; Propietario: postgres
--

-- *Nota*: No se crea el esquema directamente, ya que la inicialización de la base de datos (initdb) lo crea por defecto.


ALTER SCHEMA public OWNER TO postgres;

--
-- Nombre: SCHEMA public; Tipo: COMENTARIO; Esquema: -; Propietario: postgres
--

COMMENT ON SCHEMA public IS '';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- ============================================================================
-- TABLA: bug_reports
-- Propósito: Módulo de Soporte y Calidad: Almacena los reportes de incidencias técnicas y errores presentados por los vendedores, facilitando su priorización, asignación y resolución por el equipo técnico.
-- ============================================================================
-- Nombre: bug_reports; Tipo: TABLA; Esquema: public; Propietario: postgres
--

CREATE TABLE public.bug_reports (
    id integer NOT NULL,
    seller_id integer,
    seller_name character varying(100),
    area character varying(100),
    description text,
    steps text,
    status character varying(30) DEFAULT 'new'::character varying,
    priority character varying(20) DEFAULT 'medium'::character varying,
    assigned_to integer,
    reported_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    resolved_at timestamp without time zone
);


ALTER TABLE public.bug_reports OWNER TO postgres;

--
-- Nombre: bug_reports_id_seq; Tipo: SECUENCIA (GENERADOR AUTOINCREMENTAL); Esquema: public; Propietario: postgres
--

CREATE SEQUENCE public.bug_reports_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.bug_reports_id_seq OWNER TO postgres;

--
-- Nombre: bug_reports_id_seq; Tipo: SECUENCIA VINCULADA A TABLA; Esquema: public; Propietario: postgres
--

ALTER SEQUENCE public.bug_reports_id_seq OWNED BY public.bug_reports.id;


--
-- ============================================================================
-- TABLA: cart_items
-- Propósito: Módulo de Carrito de Compras: Permite la persistencia de productos y metros de tela añadidos por cada cliente antes de formalizar y pagar la orden.
-- ============================================================================
-- Nombre: cart_items; Tipo: TABLA; Esquema: public; Propietario: postgres
--

CREATE TABLE public.cart_items (
    id integer NOT NULL,
    user_id integer NOT NULL,
    product_id integer NOT NULL,
    quantity integer DEFAULT 1 NOT NULL,
    added_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone
);


ALTER TABLE public.cart_items OWNER TO postgres;

--
-- Nombre: cart_items_id_seq; Tipo: SECUENCIA (GENERADOR AUTOINCREMENTAL); Esquema: public; Propietario: postgres
--

CREATE SEQUENCE public.cart_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.cart_items_id_seq OWNER TO postgres;

--
-- Nombre: cart_items_id_seq; Tipo: SECUENCIA VINCULADA A TABLA; Esquema: public; Propietario: postgres
--

ALTER SEQUENCE public.cart_items_id_seq OWNED BY public.cart_items.id;


--
-- ============================================================================
-- TABLA: categories
-- Propósito: Módulo de Catálogo de Telas: Define las categorías taxonómicas de textiles (ej. Algodón, Seda, Lino, Lana, Poliéster, Terciopelo, Dril, Mezclilla).
-- ============================================================================
-- Nombre: categories; Tipo: TABLA; Esquema: public; Propietario: postgres
--

CREATE TABLE public.categories (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.categories OWNER TO postgres;

--
-- Nombre: categories_id_seq; Tipo: SECUENCIA (GENERADOR AUTOINCREMENTAL); Esquema: public; Propietario: postgres
--

CREATE SEQUENCE public.categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.categories_id_seq OWNER TO postgres;

--
-- Nombre: categories_id_seq; Tipo: SECUENCIA VINCULADA A TABLA; Esquema: public; Propietario: postgres
--

ALTER SEQUENCE public.categories_id_seq OWNED BY public.categories.id;


--
-- ============================================================================
-- TABLA: coupon_categories
-- Propósito: Módulo de Promociones (Relación N:M): Tabla intermedia que asocia cupones promocionales con las categorías específicas de telas a las que aplican.
-- ============================================================================
-- Nombre: coupon_categories; Tipo: TABLA; Esquema: public; Propietario: postgres
--

CREATE TABLE public.coupon_categories (
    id integer NOT NULL,
    coupon_id integer,
    category_id integer
);


ALTER TABLE public.coupon_categories OWNER TO postgres;

--
-- Nombre: coupon_categories_id_seq; Tipo: SECUENCIA (GENERADOR AUTOINCREMENTAL); Esquema: public; Propietario: postgres
--

CREATE SEQUENCE public.coupon_categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.coupon_categories_id_seq OWNER TO postgres;

--
-- Nombre: coupon_categories_id_seq; Tipo: SECUENCIA VINCULADA A TABLA; Esquema: public; Propietario: postgres
--

ALTER SEQUENCE public.coupon_categories_id_seq OWNED BY public.coupon_categories.id;


--
-- ============================================================================
-- TABLA: coupons
-- Propósito: Módulo de Marketing y Promociones: Gestiona cupones de descuento (porcentuales o de monto fijo), con reglas de vigencia, compra mínima y límites de uso.
-- ============================================================================
-- Nombre: coupons; Tipo: TABLA; Esquema: public; Propietario: postgres
--

CREATE TABLE public.coupons (
    id integer NOT NULL,
    code character varying(50) NOT NULL,
    discount_type character varying(20) DEFAULT 'percentage'::character varying NOT NULL,
    discount_value numeric(10,2) NOT NULL,
    expires_at timestamp without time zone,
    min_purchase numeric(12,2),
    max_uses integer,
    first_time_only boolean DEFAULT false,
    usage_count integer DEFAULT 0,
    active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.coupons OWNER TO postgres;

--
-- Nombre: coupons_id_seq; Tipo: SECUENCIA (GENERADOR AUTOINCREMENTAL); Esquema: public; Propietario: postgres
--

CREATE SEQUENCE public.coupons_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.coupons_id_seq OWNER TO postgres;

--
-- Nombre: coupons_id_seq; Tipo: SECUENCIA VINCULADA A TABLA; Esquema: public; Propietario: postgres
--

ALTER SEQUENCE public.coupons_id_seq OWNED BY public.coupons.id;


--
-- ============================================================================
-- TABLA: daily_sales
-- Propósito: Módulo de Analítica Comercial: Registra el acumulado diario de ventas monetarias y número de pedidos para la generación de gráficas de rendimiento financiero.
-- ============================================================================
-- Nombre: daily_sales; Tipo: TABLA; Esquema: public; Propietario: postgres
--

CREATE TABLE public.daily_sales (
    id integer NOT NULL,
    sale_date date NOT NULL,
    total_sales numeric(14,2),
    total_orders integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.daily_sales OWNER TO postgres;

--
-- Nombre: daily_sales_id_seq; Tipo: SECUENCIA (GENERADOR AUTOINCREMENTAL); Esquema: public; Propietario: postgres
--

CREATE SEQUENCE public.daily_sales_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.daily_sales_id_seq OWNER TO postgres;

--
-- Nombre: daily_sales_id_seq; Tipo: SECUENCIA VINCULADA A TABLA; Esquema: public; Propietario: postgres
--

ALTER SEQUENCE public.daily_sales_id_seq OWNED BY public.daily_sales.id;


--
-- ============================================================================
-- TABLA: global_banner
-- Propósito: Módulo de Comunicación Visual: Controla el banner superior del portal para anuncios globales (ej. envíos gratis, novedades o alertas de mantenimiento).
-- ============================================================================
-- Nombre: global_banner; Tipo: TABLA; Esquema: public; Propietario: postgres
--

CREATE TABLE public.global_banner (
    id integer NOT NULL,
    enabled boolean DEFAULT false,
    message text,
    banner_type character varying(20) DEFAULT 'info'::character varying,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.global_banner OWNER TO postgres;

--
-- Nombre: global_banner_id_seq; Tipo: SECUENCIA (GENERADOR AUTOINCREMENTAL); Esquema: public; Propietario: postgres
--

CREATE SEQUENCE public.global_banner_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.global_banner_id_seq OWNER TO postgres;

--
-- Nombre: global_banner_id_seq; Tipo: SECUENCIA VINCULADA A TABLA; Esquema: public; Propietario: postgres
--

ALTER SEQUENCE public.global_banner_id_seq OWNED BY public.global_banner.id;


--
-- ============================================================================
-- TABLA: inventory_batches
-- Propósito: Módulo de Logística e Inventario: Control de lotes de rollos de tela recibidos en bodega, registrando proveedor, metros ingresados, costo por metro y fecha.
-- ============================================================================
-- Nombre: inventory_batches; Tipo: TABLA; Esquema: public; Propietario: postgres
--

CREATE TABLE public.inventory_batches (
    id character varying(30) NOT NULL,
    fabric_type character varying(100),
    supplier character varying(150),
    initial_meters numeric(10,2),
    current_meters numeric(10,2),
    status character varying(30) DEFAULT 'active'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    last_update timestamp without time zone
);


ALTER TABLE public.inventory_batches OWNER TO postgres;

--
-- ============================================================================
-- TABLA: order_items
-- Propósito: Módulo de Detalle de Ventas: Registra el desglose de cada producto dentro de un pedido, incluyendo la cantidad en metros, precio unitario y subtotal.
-- ============================================================================
-- Nombre: order_items; Tipo: TABLA; Esquema: public; Propietario: postgres
--

CREATE TABLE public.order_items (
    id integer NOT NULL,
    order_id integer NOT NULL,
    product_id integer,
    quantity integer DEFAULT 1 NOT NULL,
    unit_price numeric(12,2)
);


ALTER TABLE public.order_items OWNER TO postgres;

--
-- Nombre: order_items_id_seq; Tipo: SECUENCIA (GENERADOR AUTOINCREMENTAL); Esquema: public; Propietario: postgres
--

CREATE SEQUENCE public.order_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.order_items_id_seq OWNER TO postgres;

--
-- Nombre: order_items_id_seq; Tipo: SECUENCIA VINCULADA A TABLA; Esquema: public; Propietario: postgres
--

ALTER SEQUENCE public.order_items_id_seq OWNED BY public.order_items.id;


--
-- ============================================================================
-- TABLA: orders
-- Propósito: Módulo Central de Pedidos: Registra la cabecera de las órdenes de compra efectuadas por los clientes, asociando cliente, vendedor, valor total y estado de despacho.
-- ============================================================================
-- Nombre: orders; Tipo: TABLA; Esquema: public; Propietario: postgres
--

CREATE TABLE public.orders (
    id integer NOT NULL,
    client_id integer,
    seller_id integer,
    total numeric(14,2) DEFAULT 0 NOT NULL,
    status character varying(30) DEFAULT 'pending'::character varying NOT NULL,
    order_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone
);


ALTER TABLE public.orders OWNER TO postgres;

--
-- Nombre: orders_id_seq; Tipo: SECUENCIA (GENERADOR AUTOINCREMENTAL); Esquema: public; Propietario: postgres
--

CREATE SEQUENCE public.orders_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.orders_id_seq OWNER TO postgres;

--
-- Nombre: orders_id_seq; Tipo: SECUENCIA VINCULADA A TABLA; Esquema: public; Propietario: postgres
--

ALTER SEQUENCE public.orders_id_seq OWNED BY public.orders.id;


--
-- ============================================================================
-- TABLA: product_images
-- Propósito: Módulo Multimedia de Catálogo: Almacena las URLs y recursos gráficos de cada tela, ordenados secuencialmente para la galería del cliente.
-- ============================================================================
-- Nombre: product_images; Tipo: TABLA; Esquema: public; Propietario: postgres
--

CREATE TABLE public.product_images (
    id integer NOT NULL,
    product_id integer NOT NULL,
    image_url text NOT NULL,
    display_order integer DEFAULT 0
);


ALTER TABLE public.product_images OWNER TO postgres;

--
-- Nombre: product_images_id_seq; Tipo: SECUENCIA (GENERADOR AUTOINCREMENTAL); Esquema: public; Propietario: postgres
--

CREATE SEQUENCE public.product_images_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.product_images_id_seq OWNER TO postgres;

--
-- Nombre: product_images_id_seq; Tipo: SECUENCIA VINCULADA A TABLA; Esquema: public; Propietario: postgres
--

ALTER SEQUENCE public.product_images_id_seq OWNED BY public.product_images.id;


--
-- ============================================================================
-- TABLA: reviews
-- Propósito: Módulo de Valoraciones y Experiencia: Guarda las calificaciones de 1 a 5 estrellas y comentarios de los clientes sobre la calidad de las telas adquiridas.
-- ============================================================================
-- Nombre: reviews; Tipo: TABLA; Esquema: public; Propietario: postgres
--

CREATE TABLE public.reviews (
    id integer NOT NULL,
    product_id integer NOT NULL,
    user_id integer NOT NULL,
    rating integer NOT NULL,
    comment text NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.reviews OWNER TO postgres;

--
-- Nombre: reviews_id_seq; Tipo: SECUENCIA (GENERADOR AUTOINCREMENTAL); Esquema: public; Propietario: postgres
--

CREATE SEQUENCE public.reviews_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.reviews_id_seq OWNER TO postgres;

--
-- Nombre: reviews_id_seq; Tipo: SECUENCIA VINCULADA A TABLA; Esquema: public; Propietario: postgres
--

ALTER SEQUENCE public.reviews_id_seq OWNED BY public.reviews.id;

--
-- Nombre: reviews id; Tipo: VALOR PREDETERMINADO (DEFAULT); Esquema: public; Propietario: postgres
--

ALTER TABLE ONLY public.reviews ALTER COLUMN id SET DEFAULT nextval('public.reviews_id_seq'::regclass);

--
-- Nombre: reviews reviews_pkey; Tipo: RESTRICCIÓN (LLAVE PRIMARIA / ÚNICA); Esquema: public; Propietario: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_pkey PRIMARY KEY (id);

--
-- Nombre: reviews reviews_rating_check; Tipo: RESTRICCIÓN DE VALIDACIÓN (CHECK); Esquema: public; Propietario: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_rating_check CHECK ((rating >= 1) AND (rating <= 5));

--
-- Nombre: reviews reviews_product_fk; Tipo: RESTRICCIÓN DE LLAVE FORÁNEA (RELACIÓN REFERENCIAL); Esquema: public; Propietario: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_product_fk FOREIGN KEY (product_id) REFERENCES public.products(id);

--
-- Nombre: reviews reviews_user_fk; Tipo: RESTRICCIÓN DE LLAVE FORÁNEA (RELACIÓN REFERENCIAL); Esquema: public; Propietario: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_user_fk FOREIGN KEY (public.reviews.user_id) REFERENCES public.users(id);


--
-- ============================================================================
-- TABLA: home_sections
-- Propósito: Módulo de Personalización del Portal: Parametriza el orden, visibilidad y títulos de las secciones dinámicas de la página de inicio (Nuevas, Exclusivas, Ofertas).
-- ============================================================================
-- Nombre: home_sections; Tipo: TABLA; Esquema: public; Propietario: postgres
--

CREATE TABLE public.home_sections (
    key character varying(30) NOT NULL,
    title character varying(150) NOT NULL,
    subtitle character varying(300),
    active boolean DEFAULT true NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.home_sections OWNER TO postgres;

--
-- Nombre: home_sections home_sections_pkey; Tipo: RESTRICCIÓN (LLAVE PRIMARIA / ÚNICA); Esquema: public; Propietario: postgres
--

ALTER TABLE ONLY public.home_sections
    ADD CONSTRAINT home_sections_pkey PRIMARY KEY (key);

--
-- ============================================================================
-- SECCIÓN 5: CARGA DE REGISTROS Y DATOS INICIALES (DML / SEMILLAS DEL SISTEMA)
-- ============================================================================
--
-- Datos iniciales para la tabla: home_sections | Tipo: DATOS DE TABLA | Esquema: public | Propietario: postgres
--

COPY public.home_sections (key, title, subtitle, active, sort_order, created_at) FROM stdin;
nuevas	Nuevas Colecciones	Descubre las telas más recientes que llegan a la tienda	t	1	2026-08-20 01:30:00
exclusivas	Telas Exclusivas	Diseños únicos seleccionados para tus proyectos especiales	t	2	2026-08-20 01:30:00
ofertas	Ofertas Especiales	Precios especiales en telas seleccionadas por tiempo limitado	t	3	2026-08-20 01:30:00
\.

--
-- ============================================================================
-- TABLA: carousel_slides
-- Propósito: Módulo de Banners y Marketing: Gestiona las diapositivas interactivas del carrusel principal, con llamadas a la acción (CTA) y enlaces promocionales.
-- ============================================================================
-- Nombre: carousel_slides; Tipo: TABLA; Esquema: public; Propietario: postgres
--

CREATE TABLE public.carousel_slides (
    id integer NOT NULL,
    title character varying(150) NOT NULL,
    subtitle character varying(300),
    image text,
    cta character varying(50),
    section_key character varying(30),
    active boolean DEFAULT true NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.carousel_slides OWNER TO postgres;

--
-- Nombre: carousel_slides_id_seq; Tipo: SECUENCIA (GENERADOR AUTOINCREMENTAL); Esquema: public; Propietario: postgres
--

CREATE SEQUENCE public.carousel_slides_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.carousel_slides_id_seq OWNER TO postgres;

--
-- Nombre: carousel_slides_id_seq; Tipo: SECUENCIA VINCULADA A TABLA; Esquema: public; Propietario: postgres
--

ALTER SEQUENCE public.carousel_slides_id_seq OWNED BY public.carousel_slides.id;

--
-- Nombre: carousel_slides id; Tipo: VALOR PREDETERMINADO (DEFAULT); Esquema: public; Propietario: postgres
--

ALTER TABLE ONLY public.carousel_slides ALTER COLUMN id SET DEFAULT nextval('public.carousel_slides_id_seq'::regclass);

--
-- Nombre: carousel_slides carousel_slides_pkey; Tipo: RESTRICCIÓN (LLAVE PRIMARIA / ÚNICA); Esquema: public; Propietario: postgres
--

ALTER TABLE ONLY public.carousel_slides
    ADD CONSTRAINT carousel_slides_pkey PRIMARY KEY (id);

--
-- Datos iniciales para la tabla: carousel_slides | Tipo: DATOS DE TABLA | Esquema: public | Propietario: postgres
--

COPY public.carousel_slides (id, title, subtitle, image, cta, section_key, active, sort_order, created_at) FROM stdin;
1	Nueva Colección 2024	Tendencias exclusivas en telas premium	/images/carousel-nueva-coleccion.png	Ver Más	nuevas	t	1	2026-08-20 01:00:00
2	Telas Exclusivas	Diseños únicos para proyectos especiales	/images/carousel-telas-exclusivas.png	Explorar	exclusivas	t	2	2026-08-20 01:00:00
3	Ofertas Especiales	Descuentos increíbles en telas seleccionadas	/images/carousel-ofertas-especiales.png	Ver Ofertas	ofertas	t	3	2026-08-20 01:00:00
\.

--
-- Nombre: carousel_slides_id_seq; Tipo: ACTUALIZACIÓN DEL VALOR DE SECUENCIA; Esquema: public; Propietario: postgres
--

SELECT pg_catalog.setval('public.carousel_slides_id_seq', 3, true);


--
-- ============================================================================
-- TABLA: products
-- Propósito: Módulo Maestro de Productos: Catálogo general de telas con ficha técnica completa (material, ancho, peso, cuidados), stock en metros, precios y estado de moderación.
-- ============================================================================
-- Nombre: products; Tipo: TABLA; Esquema: public; Propietario: postgres
--

CREATE TABLE public.products (
    id integer NOT NULL,
    name character varying(150) NOT NULL,
    category_id integer,
    price numeric(12,2) DEFAULT 0 NOT NULL,
    seller_id integer,
    description text,
    material character varying(100),
    width character varying(30),
    weight character varying(30),
    care text,
    stock integer DEFAULT 0 NOT NULL,
    featured boolean DEFAULT false NOT NULL,
    is_new_collection boolean DEFAULT false NOT NULL,
    is_exclusive boolean DEFAULT false NOT NULL,
    is_offer boolean DEFAULT false NOT NULL,
    active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone,
    moderation_status character varying(20) DEFAULT 'pending'::character varying,
    rejection_reason text
);


ALTER TABLE public.products OWNER TO postgres;

--
-- Nombre: products_id_seq; Tipo: SECUENCIA (GENERADOR AUTOINCREMENTAL); Esquema: public; Propietario: postgres
--

CREATE SEQUENCE public.products_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.products_id_seq OWNER TO postgres;

--
-- Nombre: products_id_seq; Tipo: SECUENCIA VINCULADA A TABLA; Esquema: public; Propietario: postgres
--

ALTER SEQUENCE public.products_id_seq OWNED BY public.products.id;


--
-- ============================================================================
-- TABLA: recent_activity
-- Propósito: Módulo de Auditoría del Sistema: Bitácora cronológica de eventos relevantes y acciones ejecutadas por usuarios en la plataforma para trazabilidad.
-- ============================================================================
-- Nombre: recent_activity; Tipo: TABLA; Esquema: public; Propietario: postgres
--

CREATE TABLE public.recent_activity (
    id integer NOT NULL,
    type character varying(30),
    user_id integer,
    user_name character varying(100),
    action text,
    amount numeric(14,2),
    icon character varying(50),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.recent_activity OWNER TO postgres;

--
-- Nombre: recent_activity_id_seq; Tipo: SECUENCIA (GENERADOR AUTOINCREMENTAL); Esquema: public; Propietario: postgres
--

CREATE SEQUENCE public.recent_activity_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.recent_activity_id_seq OWNER TO postgres;

--
-- Nombre: recent_activity_id_seq; Tipo: SECUENCIA VINCULADA A TABLA; Esquema: public; Propietario: postgres
--

ALTER SEQUENCE public.recent_activity_id_seq OWNED BY public.recent_activity.id;


--
-- ============================================================================
-- TABLA: region_sales
-- Propósito: Módulo de Inteligencia Geográfica: Almacena las ventas segmentadas por región geográfica (departamento/ciudad) y porcentaje de participación.
-- ============================================================================
-- Nombre: region_sales; Tipo: TABLA; Esquema: public; Propietario: postgres
--

CREATE TABLE public.region_sales (
    id integer NOT NULL,
    department character varying(100),
    capital character varying(100),
    sales numeric(14,2),
    orders integer,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.region_sales OWNER TO postgres;

--
-- Nombre: region_sales_id_seq; Tipo: SECUENCIA (GENERADOR AUTOINCREMENTAL); Esquema: public; Propietario: postgres
--

CREATE SEQUENCE public.region_sales_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.region_sales_id_seq OWNER TO postgres;

--
-- Nombre: region_sales_id_seq; Tipo: SECUENCIA VINCULADA A TABLA; Esquema: public; Propietario: postgres
--

ALTER SEQUENCE public.region_sales_id_seq OWNED BY public.region_sales.id;


--
-- ============================================================================
-- TABLA: stock_thresholds
-- Propósito: Módulo de Alertas de Abastecimiento: Define los metros mínimos de seguridad requeridos por tipo de tela para disparar alertas automáticas de reabastecimiento.
-- ============================================================================
-- Nombre: stock_thresholds; Tipo: TABLA; Esquema: public; Propietario: postgres
--

CREATE TABLE public.stock_thresholds (
    id integer NOT NULL,
    fabric_type character varying(100) NOT NULL,
    min_meters numeric(10,2) DEFAULT 20 NOT NULL,
    alert_enabled boolean DEFAULT true
);


ALTER TABLE public.stock_thresholds OWNER TO postgres;

--
-- Nombre: stock_thresholds_id_seq; Tipo: SECUENCIA (GENERADOR AUTOINCREMENTAL); Esquema: public; Propietario: postgres
--

CREATE SEQUENCE public.stock_thresholds_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.stock_thresholds_id_seq OWNER TO postgres;

--
-- Nombre: stock_thresholds_id_seq; Tipo: SECUENCIA VINCULADA A TABLA; Esquema: public; Propietario: postgres
--

ALTER SEQUENCE public.stock_thresholds_id_seq OWNED BY public.stock_thresholds.id;


--
-- ============================================================================
-- TABLA: support_tickets
-- Propósito: Módulo de Servicio al Cliente: Mesa de ayuda para registro, seguimiento y resolución de requerimientos, quejas y reclamos (PQR) de clientes.
-- ============================================================================
-- Nombre: support_tickets; Tipo: TABLA; Esquema: public; Propietario: postgres
--

CREATE TABLE public.support_tickets (
    id integer NOT NULL,
    user_id integer,
    user_name character varying(100),
    user_email character varying(150),
    subject character varying(200),
    description text,
    status character varying(30) DEFAULT 'open'::character varying,
    priority character varying(20) DEFAULT 'medium'::character varying,
    assigned_to integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone,
    resolved_at timestamp without time zone
);


ALTER TABLE public.support_tickets OWNER TO postgres;

--
-- Nombre: support_tickets_id_seq; Tipo: SECUENCIA (GENERADOR AUTOINCREMENTAL); Esquema: public; Propietario: postgres
--

CREATE SEQUENCE public.support_tickets_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.support_tickets_id_seq OWNER TO postgres;

--
-- Nombre: support_tickets_id_seq; Tipo: SECUENCIA VINCULADA A TABLA; Esquema: public; Propietario: postgres
--

ALTER SEQUENCE public.support_tickets_id_seq OWNED BY public.support_tickets.id;


--
-- ============================================================================
-- TABLA: system_config
-- Propósito: Módulo de Configuración Global: Almacena configuraciones del sistema en formato JSON clave/valor (tasas de impuestos, costos de envío, políticas comerciales).
-- ============================================================================
-- Nombre: system_config; Tipo: TABLA; Esquema: public; Propietario: postgres
--

CREATE TABLE public.system_config (
    id integer NOT NULL,
    key character varying(100) NOT NULL,
    value text
);


ALTER TABLE public.system_config OWNER TO postgres;

--
-- Nombre: system_config_id_seq; Tipo: SECUENCIA (GENERADOR AUTOINCREMENTAL); Esquema: public; Propietario: postgres
--

CREATE SEQUENCE public.system_config_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.system_config_id_seq OWNER TO postgres;

--
-- Nombre: system_config_id_seq; Tipo: SECUENCIA VINCULADA A TABLA; Esquema: public; Propietario: postgres
--

ALTER SEQUENCE public.system_config_id_seq OWNED BY public.system_config.id;


--
-- ============================================================================
-- TABLA: users
-- Propósito: Módulo de Gestión de Usuarios y Seguridad: Almacena las cuentas de usuarios con control de roles (cliente, vendedor, administrador), contraseñas cifradas en SHA-256 y comisiones.
-- ============================================================================
-- Nombre: users; Tipo: TABLA; Esquema: public; Propietario: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    email character varying(150) NOT NULL,
    password_hash character varying(255) NOT NULL,
    role character varying(20) DEFAULT 'cliente'::character varying NOT NULL,
    active boolean DEFAULT true NOT NULL,
    suspended boolean DEFAULT false NOT NULL,
    suspension_reason text,
    commission_rate numeric(5,2),
    registered_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    last_login timestamp without time zone
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Nombre: users_id_seq; Tipo: SECUENCIA (GENERADOR AUTOINCREMENTAL); Esquema: public; Propietario: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- Nombre: users_id_seq; Tipo: SECUENCIA VINCULADA A TABLA; Esquema: public; Propietario: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- ============================================================================
-- TABLA: waste_events
-- Propósito: Módulo de Control de Mermas: Registra el desperdicio y retazos de tela resultantes del corte o almacenamiento, cuantificando metros perdidos e impacto económico.
-- ============================================================================
-- Nombre: waste_events; Tipo: TABLA; Esquema: public; Propietario: postgres
--

CREATE TABLE public.waste_events (
    id integer NOT NULL,
    batch_id character varying(30),
    meters numeric(10,2),
    reason character varying(100),
    description text,
    responsible character varying(100),
    event_date date DEFAULT CURRENT_DATE,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    user_id integer
);


ALTER TABLE public.waste_events OWNER TO postgres;

--
-- Nombre: waste_events_id_seq; Tipo: SECUENCIA (GENERADOR AUTOINCREMENTAL); Esquema: public; Propietario: postgres
--

CREATE SEQUENCE public.waste_events_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.waste_events_id_seq OWNER TO postgres;

--
-- Nombre: waste_events_id_seq; Tipo: SECUENCIA VINCULADA A TABLA; Esquema: public; Propietario: postgres
--

ALTER SEQUENCE public.waste_events_id_seq OWNED BY public.waste_events.id;


--
-- ============================================================================
-- SECCIÓN 4: ASIGNACIÓN DE VALORES PREDETERMINADOS (SECUENCIAS AUTOINCREMENTALES)
-- ============================================================================
--
-- Nombre: bug_reports id; Tipo: VALOR PREDETERMINADO (DEFAULT); Esquema: public; Propietario: postgres
--

ALTER TABLE ONLY public.bug_reports ALTER COLUMN id SET DEFAULT nextval('public.bug_reports_id_seq'::regclass);


--
-- Nombre: cart_items id; Tipo: VALOR PREDETERMINADO (DEFAULT); Esquema: public; Propietario: postgres
--

ALTER TABLE ONLY public.cart_items ALTER COLUMN id SET DEFAULT nextval('public.cart_items_id_seq'::regclass);


--
-- Nombre: categories id; Tipo: VALOR PREDETERMINADO (DEFAULT); Esquema: public; Propietario: postgres
--

ALTER TABLE ONLY public.categories ALTER COLUMN id SET DEFAULT nextval('public.categories_id_seq'::regclass);


--
-- Nombre: coupon_categories id; Tipo: VALOR PREDETERMINADO (DEFAULT); Esquema: public; Propietario: postgres
--

ALTER TABLE ONLY public.coupon_categories ALTER COLUMN id SET DEFAULT nextval('public.coupon_categories_id_seq'::regclass);


--
-- Nombre: coupons id; Tipo: VALOR PREDETERMINADO (DEFAULT); Esquema: public; Propietario: postgres
--

ALTER TABLE ONLY public.coupons ALTER COLUMN id SET DEFAULT nextval('public.coupons_id_seq'::regclass);


--
-- Nombre: daily_sales id; Tipo: VALOR PREDETERMINADO (DEFAULT); Esquema: public; Propietario: postgres
--

ALTER TABLE ONLY public.daily_sales ALTER COLUMN id SET DEFAULT nextval('public.daily_sales_id_seq'::regclass);


--
-- Nombre: global_banner id; Tipo: VALOR PREDETERMINADO (DEFAULT); Esquema: public; Propietario: postgres
--

ALTER TABLE ONLY public.global_banner ALTER COLUMN id SET DEFAULT nextval('public.global_banner_id_seq'::regclass);


--
-- Nombre: order_items id; Tipo: VALOR PREDETERMINADO (DEFAULT); Esquema: public; Propietario: postgres
--

ALTER TABLE ONLY public.order_items ALTER COLUMN id SET DEFAULT nextval('public.order_items_id_seq'::regclass);


--
-- Nombre: orders id; Tipo: VALOR PREDETERMINADO (DEFAULT); Esquema: public; Propietario: postgres
--

ALTER TABLE ONLY public.orders ALTER COLUMN id SET DEFAULT nextval('public.orders_id_seq'::regclass);


--
-- Nombre: product_images id; Tipo: VALOR PREDETERMINADO (DEFAULT); Esquema: public; Propietario: postgres
--

ALTER TABLE ONLY public.product_images ALTER COLUMN id SET DEFAULT nextval('public.product_images_id_seq'::regclass);


--
-- Nombre: products id; Tipo: VALOR PREDETERMINADO (DEFAULT); Esquema: public; Propietario: postgres
--

ALTER TABLE ONLY public.products ALTER COLUMN id SET DEFAULT nextval('public.products_id_seq'::regclass);


--
-- Nombre: recent_activity id; Tipo: VALOR PREDETERMINADO (DEFAULT); Esquema: public; Propietario: postgres
--

ALTER TABLE ONLY public.recent_activity ALTER COLUMN id SET DEFAULT nextval('public.recent_activity_id_seq'::regclass);


--
-- Nombre: region_sales id; Tipo: VALOR PREDETERMINADO (DEFAULT); Esquema: public; Propietario: postgres
--

ALTER TABLE ONLY public.region_sales ALTER COLUMN id SET DEFAULT nextval('public.region_sales_id_seq'::regclass);


--
-- Nombre: stock_thresholds id; Tipo: VALOR PREDETERMINADO (DEFAULT); Esquema: public; Propietario: postgres
--

ALTER TABLE ONLY public.stock_thresholds ALTER COLUMN id SET DEFAULT nextval('public.stock_thresholds_id_seq'::regclass);


--
-- Nombre: support_tickets id; Tipo: VALOR PREDETERMINADO (DEFAULT); Esquema: public; Propietario: postgres
--

ALTER TABLE ONLY public.support_tickets ALTER COLUMN id SET DEFAULT nextval('public.support_tickets_id_seq'::regclass);


--
-- Nombre: system_config id; Tipo: VALOR PREDETERMINADO (DEFAULT); Esquema: public; Propietario: postgres
--

ALTER TABLE ONLY public.system_config ALTER COLUMN id SET DEFAULT nextval('public.system_config_id_seq'::regclass);


--
-- Nombre: users id; Tipo: VALOR PREDETERMINADO (DEFAULT); Esquema: public; Propietario: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Nombre: waste_events id; Tipo: VALOR PREDETERMINADO (DEFAULT); Esquema: public; Propietario: postgres
--

ALTER TABLE ONLY public.waste_events ALTER COLUMN id SET DEFAULT nextval('public.waste_events_id_seq'::regclass);


--
-- Datos iniciales para la tabla: bug_reports | Tipo: DATOS DE TABLA | Esquema: public | Propietario: postgres
--

COPY public.bug_reports (id, seller_id, seller_name, area, description, steps, status, priority, assigned_to, reported_at, resolved_at) FROM stdin;
1	2	Carlos Rodriguez	Dashboard Vendedor	El grafico de ventas no carga	1. Ir a Dashboard\n2. Ver seccion Ventas\n3. El grafico queda en blanco	new	medium	\N	2026-03-31 17:20:06.146677	\N
2	3	Maria Gonzalez	Gestion de Productos	No puedo subir imagenes mayores a 2MB	1. Editar producto\n2. Subir imagen de 3MB\n3. Error sin mensaje	in_progress	high	\N	2026-03-31 17:20:06.146677	\N
\.


--
-- Datos iniciales para la tabla: cart_items | Tipo: DATOS DE TABLA | Esquema: public | Propietario: postgres
--

COPY public.cart_items (id, user_id, product_id, quantity, added_at, updated_at) FROM stdin;
\.


--
-- Datos iniciales para la tabla: categories | Tipo: DATOS DE TABLA | Esquema: public | Propietario: postgres
--

COPY public.categories (id, name, description, created_at) FROM stdin;
1	Algodon	Telas de alta calidad tipo Algodon	2026-03-31 17:20:06.146677
2	Seda	Telas de alta calidad tipo Seda	2026-03-31 17:20:06.146677
3	Lino	Telas de alta calidad tipo Lino	2026-03-31 17:20:06.146677
4	Lana	Telas de alta calidad tipo Lana	2026-03-31 17:20:06.146677
5	Poliester	Telas de alta calidad tipo Poliester	2026-03-31 17:20:06.146677
\.


--
-- Datos iniciales para la tabla: coupon_categories | Tipo: DATOS DE TABLA | Esquema: public | Propietario: postgres
--

COPY public.coupon_categories (id, coupon_id, category_id) FROM stdin;
\.


--
-- Datos iniciales para la tabla: coupons | Tipo: DATOS DE TABLA | Esquema: public | Propietario: postgres
--

COPY public.coupons (id, code, discount_type, discount_value, expires_at, min_purchase, max_uses, first_time_only, usage_count, active, created_at) FROM stdin;
1	BIENVENIDO10	percentage	10.00	2026-06-29 17:20:06.146677	50000.00	100	t	0	t	2026-03-31 17:20:06.146677
2	PROMO15K	fixed	15000.00	2026-04-30 17:20:06.146677	100000.00	50	f	0	t	2026-03-31 17:20:06.146677
3	TELAS20	percentage	20.00	2026-05-30 17:20:06.146677	150000.00	30	f	0	t	2026-03-31 17:20:06.146677
\.


--
-- Datos iniciales para la tabla: daily_sales | Tipo: DATOS DE TABLA | Esquema: public | Propietario: postgres
--

COPY public.daily_sales (id, sale_date, total_sales, total_orders, created_at) FROM stdin;
1	2026-03-01	2682691.04	13	2026-03-31 17:20:06.146677
2	2026-03-02	643817.92	10	2026-03-31 17:20:06.146677
3	2026-03-03	1331235.47	44	2026-03-31 17:20:06.146677
4	2026-03-04	773973.83	27	2026-03-31 17:20:06.146677
5	2026-03-05	1606348.74	41	2026-03-31 17:20:06.146677
6	2026-03-06	2571277.28	15	2026-03-31 17:20:06.146677
7	2026-03-07	2848705.34	5	2026-03-31 17:20:06.146677
8	2026-03-08	955874.75	38	2026-03-31 17:20:06.146677
9	2026-03-09	2749718.54	35	2026-03-31 17:20:06.146677
10	2026-03-10	2894859.86	11	2026-03-31 17:20:06.146677
11	2026-03-11	2283049.73	35	2026-03-31 17:20:06.146677
12	2026-03-12	1251983.98	12	2026-03-31 17:20:06.146677
13	2026-03-13	1016653.81	38	2026-03-31 17:20:06.146677
14	2026-03-14	1322517.80	30	2026-03-31 17:20:06.146677
15	2026-03-15	2213121.05	20	2026-03-31 17:20:06.146677
16	2026-03-16	771993.51	20	2026-03-31 17:20:06.146677
17	2026-03-17	594254.72	38	2026-03-31 17:20:06.146677
18	2026-03-18	1097244.75	41	2026-03-31 17:20:06.146677
19	2026-03-19	1753062.64	38	2026-03-31 17:20:06.146677
20	2026-03-20	741963.27	8	2026-03-31 17:20:06.146677
21	2026-03-21	1941723.55	37	2026-03-31 17:20:06.146677
22	2026-03-22	1158575.38	39	2026-03-31 17:20:06.146677
23	2026-03-23	2961475.47	20	2026-03-31 17:20:06.146677
24	2026-03-24	1635286.15	26	2026-03-31 17:20:06.146677
25	2026-03-25	1580764.63	18	2026-03-31 17:20:06.146677
26	2026-03-26	2446380.93	25	2026-03-31 17:20:06.146677
27	2026-03-27	1918065.26	5	2026-03-31 17:20:06.146677
28	2026-03-28	2146782.18	27	2026-03-31 17:20:06.146677
29	2026-03-29	953094.66	34	2026-03-31 17:20:06.146677
30	2026-03-30	2865843.51	44	2026-03-31 17:20:06.146677
31	2026-03-31	1341715.98	8	2026-03-31 17:20:06.146677
\.


--
-- Datos iniciales para la tabla: global_banner | Tipo: DATOS DE TABLA | Esquema: public | Propietario: postgres
--

COPY public.global_banner (id, enabled, message, banner_type, updated_at) FROM stdin;
1	f	Envio gratis en compras superiores a $200.000	info	2026-03-31 17:20:06.146677
\.


--
-- Datos iniciales para la tabla: inventory_batches | Tipo: DATOS DE TABLA | Esquema: public | Propietario: postgres
--

COPY public.inventory_batches (id, fabric_type, supplier, initial_meters, current_meters, status, created_at, last_update) FROM stdin;
BTN-2026-01	Algodon Premium	Textiles Andinos S.A.	500.00	420.50	active	2026-03-31 17:20:06.146677	\N
BTN-2026-02	Seda Italiana	Importaciones Milan	200.00	15.00	low_stock	2026-03-31 17:20:06.146677	\N
BTN-2026-03	Lino Organico	EcoTextil Colombia	300.00	0.00	depleted	2026-03-31 17:20:06.146677	\N
BTN-2026-04	Lana Merino	Lanera del Sur	150.00	120.00	active	2026-03-31 17:20:06.146677	\N
BTN-2026-05	Dril Elastico	Drilones Industriales	400.00	380.00	active	2026-03-31 17:20:06.146677	\N
\.


--
-- Datos iniciales para la tabla: order_items | Tipo: DATOS DE TABLA | Esquema: public | Propietario: postgres
--

COPY public.order_items (id, order_id, product_id, quantity, unit_price) FROM stdin;
1	1	1	2	25000.00
2	1	2	1	85000.00
3	2	4	2	65000.00
4	3	5	1	35000.00
5	4	2	1	85000.00
6	5	6	1	72000.00
\.


--
-- Datos iniciales para la tabla: orders | Tipo: DATOS DE TABLA | Esquema: public | Propietario: postgres
--

COPY public.orders (id, client_id, seller_id, total, status, order_date, updated_at) FROM stdin;
1	5	2	75000.00	delivered	2026-03-16 17:20:06.146677	\N
2	5	3	130000.00	delivered	2026-03-21 17:20:06.146677	\N
3	6	4	35000.00	shipped	2026-03-28 17:20:06.146677	\N
4	6	2	85000.00	processing	2026-03-30 17:20:06.146677	\N
5	5	4	72000.00	pending	2026-03-31 17:20:06.146677	\N
\.


--
-- Datos iniciales para la tabla: product_images | Tipo: DATOS DE TABLA | Esquema: public | Propietario: postgres
--

COPY public.product_images (id, product_id, image_url, display_order) FROM stdin;
2	2	/uploads/product_16_1775766690228.webp	0
3	3	/uploads/product_14_1775766898975.webp	0
4	4	/uploads/product_14_1775766898975.webp	0
5	5	/uploads/product_10_1775767265179.jpg	0
6	6	/uploads/product_16_1775766690228.webp	0
7	7	/uploads/product_15_1775767332095.jpg	0
8	8	/uploads/product_12_1775767112691.jpg	0
9	1	/uploads/product_12_1775767112691.jpg	0
10	9	/uploads/product_9_1775766848979.jpg	0
11	10	/uploads/product_10_1775766963190.webp	0
12	11	/uploads/product_11_1775767027618.jpg	0
13	12	/uploads/product_15_1775767332095.jpg	0
14	13	/uploads/product_13_1777056293881.jpg	0
\.


--
-- Datos iniciales para la tabla: products | Tipo: DATOS DE TABLA | Esquema: public | Propietario: postgres
--

COPY public.products (id, name, category_id, price, seller_id, description, material, width, weight, care, stock, featured, active, created_at, updated_at, moderation_status, rejection_reason) FROM stdin;
2	Seda Italiana	2	85000.00	2	Seda pura con acabado brillante, perfecta para vestidos de gala.	Seda pura	1.40m	80g/m2	Limpieza en seco unicamente	50	t	t	2026-03-31 17:20:06.146677	\N	approved	\N
3	Lino Organico	3	45000.00	3	Lino fresco y transpirable para ropa de verano.	Lino organico	1.50m	200g/m2	No usar secadora	80	f	t	2026-03-31 17:20:06.146677	\N	approved	\N
4	Lana Merino	4	65000.00	3	Lana suave y calida, ideal para abrigos de invierno.	Lana merino	1.60m	300g/m2	Lavar a mano con agua tibia	30	t	t	2026-03-31 17:20:06.146677	\N	approved	\N
5	Dril Elastico	1	35000.00	4	Dril resistente con toque de elasticidad para pantalones.	Algodon/Lycra 95/5	1.50m	250g/m2	Lavar a maquina en ciclo suave	120	f	t	2026-03-31 17:20:06.146677	\N	approved	\N
6	Gasa de Seda	2	72000.00	4	Gasa ligera y transparente para panuelos y cortinas.	Seda/Poliester	1.40m	45g/m2	Lavar a mano	60	t	t	2026-03-31 17:20:06.146677	\N	approved	\N
7	Tela Polar	5	22000.00	2	Tela polar suave para cobijas y chaquetas.	Poliester 100%	1.50m	280g/m2	Lavar a maquina, no planchar	150	f	t	2026-03-31 17:20:06.146677	\N	approved	\N
8	Oxford Camisa	1	38000.00	3	Tela oxford clasica para camisas formales.	Algodon peinado	1.50m	130g/m2	Planchar a temperatura media	90	f	t	2026-03-31 17:20:06.146677	\N	approved	\N
1	Algodon Premium	1	25000.00	2	Tela de algodon 100% natural, ideal para camisas y blusas.	Algodon 100%	1.50m	150g/m2	Lavar en frio, no blanquear	100	t	t	2026-03-31 17:20:06.146677	2026-03-31 17:46:06.290816	approved	\N
9	Retazo Algodon	1	12000.00	2	Retazo de algodon premium, disponible para proyectos pequenos.	Algodon	1.40m	150g/m2	Lavar a maquina	3	f	t	2026-06-29 12:00:00	\N	approved	\N
10	Seda Cruda	2	95000.00	2	Seda cruda sin tenir, ultima pieza disponible.	Seda pura	1.10m	60g/m2	Limpieza en seco	8	f	t	2026-06-29 12:00:00	\N	approved	\N
11	Lino Arrugado	3	38000.00	2	Lino con textura arrugada natural. AGOTADO.	Lino	1.50m	180g/m2	Planchar en caliente	0	f	t	2026-06-29 12:00:00	\N	approved	\N
12	Lana Bebe	4	72000.00	3	Lana ultra suave para ropa de bebe. Quedan pocos metros.	Lana merino	1.30m	200g/m2	Lavar a mano	5	f	t	2026-06-29 12:00:00	\N	approved	\N
13	Algodon Estampado	1	28000.00	4	Algodon con estampado floral, edicion limitada.	Algodon	1.45m	130g/m2	Lavar a maquina	12	f	t	2026-06-29 12:00:00	\N	approved	\N
\.


--
-- Datos iniciales para la tabla: recent_activity | Tipo: DATOS DE TABLA | Esquema: public | Propietario: postgres
--

COPY public.recent_activity (id, type, user_id, user_name, action, amount, icon, created_at) FROM stdin;
1	sale	1	Anderson Moreno	Venta de Algodon Premium x50m	450000.00	ShoppingBag	2026-03-31 17:20:06.146677
2	user	5	Cliente Demo	Se registro como nuevo cliente	\N	UserPlus	2026-03-31 17:20:06.146677
3	system	0	Sistema	Alerta de stock bajo: Lana Merino	\N	AlertTriangle	2026-03-31 17:20:06.146677
4	sale	6	Laura Sanchez	Compra de Seda Italiana x3m	255000.00	ShoppingBag	2026-03-31 17:20:06.146677
5	waste	2	Carlos Rodriguez	Reporto merma por humedad en bodega	15.00	Trash2	2026-03-31 17:20:06.146677
6	order	5	Cliente Demo	Pedido #1001 entregado exitosamente	75000.00	Package	2026-03-31 17:20:06.146677
\.


--
-- Datos iniciales para la tabla: region_sales | Tipo: DATOS DE TABLA | Esquema: public | Propietario: postgres
--

COPY public.region_sales (id, department, capital, sales, orders, updated_at) FROM stdin;
1	Antioquia	Medellin	20517276.65	53	2026-03-31 17:20:06.146677
2	Cundinamarca	Bogota	43955905.83	106	2026-03-31 17:20:06.146677
3	Valle del Cauca	Cali	29667382.08	170	2026-03-31 17:20:06.146677
4	Atlantico	Barranquilla	33479140.61	213	2026-03-31 17:20:06.146677
5	Santander	Bucaramanga	33396670.43	76	2026-03-31 17:20:06.146677
6	Bolivar	Cartagena	30722913.75	76	2026-03-31 17:20:06.146677
7	Norte de Santander	Cucuta	18082225.61	81	2026-03-31 17:20:06.146677
8	Tolima	Ibague	41257892.42	36	2026-03-31 17:20:06.146677
\.


--
-- Datos iniciales para la tabla: stock_thresholds | Tipo: DATOS DE TABLA | Esquema: public | Propietario: postgres
--

COPY public.stock_thresholds (id, fabric_type, min_meters, alert_enabled) FROM stdin;
1	Algodon Premium	20.00	t
2	Seda Italiana	15.00	t
3	Lino Organico	25.00	t
4	Lana Merino	10.00	t
5	Dril Elastico	30.00	t
\.


--
-- Datos iniciales para la tabla: support_tickets | Tipo: DATOS DE TABLA | Esquema: public | Propietario: postgres
--

COPY public.support_tickets (id, user_id, user_name, user_email, subject, description, status, priority, assigned_to, created_at, updated_at, resolved_at) FROM stdin;
1	5	Cliente Demo	cliente@ddtextil.com	Producto llego danado	La tela Algodon Premium llego con manchas de humedad.	open	high	\N	2026-03-31 17:20:06.146677	\N	\N
2	6	Laura Sanchez	laura.sanchez@email.com	Demora en el envio	Mi pedido lleva 5 dias y no ha llegado.	in_progress	medium	\N	2026-03-31 17:20:06.146677	\N	\N
3	5	Cliente Demo	cliente@ddtextil.com	Consulta sobre tallas	Necesito saber el ancho exacto de la Seda Italiana.	resolved	low	\N	2026-03-31 17:20:06.146677	\N	\N
\.


--
-- Datos iniciales para la tabla: system_config | Tipo: DATOS DE TABLA | Esquema: public | Propietario: postgres
--

COPY public.system_config (id, key, value) FROM stdin;
1	system_config	{"siteName":"D&D Textil","defaultDarkMode":false,"primaryColor":"#8B5CF6","secondaryColor":"#EC4899","accentColor":"#F59E0B","taxRate":0.19,"shippingCost":15000,"freeShippingThreshold":200000,"lowStockThreshold":20,"maintenanceMode":false}
\.


--
-- Datos iniciales para la tabla: users | Tipo: DATOS DE TABLA | Esquema: public | Propietario: postgres
--

COPY public.users (id, name, email, password_hash, role, active, suspended, suspension_reason, commission_rate, registered_at, last_login) FROM stdin;
3	Maria Gonzalez	maria.gonzalez@ddtextil.com	56976bf24998ca63e35fe4f1e2469b5751d1856003e8d16fef0aafef496ed044	vendedor	t	f	\N	10.00	2026-03-31 17:20:06.146677	\N
4	Ana Martinez	ana.martinez@ddtextil.com	56976bf24998ca63e35fe4f1e2469b5751d1856003e8d16fef0aafef496ed044	vendedor	t	f	\N	7.00	2026-03-31 17:20:06.146677	\N
6	Laura Sanchez	laura.sanchez@email.com	09a31a7001e261ab1e056182a71d3cf57f582ca9a29cff5eb83be0f0549730a9	cliente	t	f	\N	\N	2026-03-31 17:20:06.146677	\N
2	Carlos Rodriguez	vendedor@ddtextil.com	56976bf24998ca63e35fe4f1e2469b5751d1856003e8d16fef0aafef496ed044	vendedor	t	f	\N	8.50	2026-03-31 17:20:06.146677	2026-03-31 17:45:01.358299
5	Cliente Demo	cliente@ddtextil.com	09a31a7001e261ab1e056182a71d3cf57f582ca9a29cff5eb83be0f0549730a9	cliente	t	f	\N	\N	2026-03-31 17:20:06.146677	2026-03-31 17:49:16.724667
1	Anderson Moreno	admin@ddtextil.com	240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9	administrador	t	f	\N	\N	2026-03-31 17:20:06.146677	2026-04-06 16:22:37.500188
\.


--
-- Datos iniciales para la tabla: waste_events | Tipo: DATOS DE TABLA | Esquema: public | Propietario: postgres
--

COPY public.waste_events (id, batch_id, meters, reason, description, responsible, event_date, created_at, user_id) FROM stdin;
1	BTN-2026-01	5.50	Humedad	Goteras en bodega B afectaron rollo principal	Anderson Moreno	2026-03-31	2026-03-31 17:20:06.146677	1
2	BTN-2026-02	2.00	Corte defectuoso	Cortes defectuosos de fabrica	Carlos Rodriguez	2026-03-31	2026-03-31 17:20:06.146677	2
3	BTN-2026-03	10.00	Decoloracion	Exposicion solar prolongada en almacen	Maria Gonzalez	2026-03-31	2026-03-31 17:20:06.146677	3
\.


--
-- Nombre: bug_reports_id_seq; Tipo: ACTUALIZACIÓN DEL VALOR DE SECUENCIA; Esquema: public; Propietario: postgres
--

SELECT pg_catalog.setval('public.bug_reports_id_seq', 2, true);


--
-- Nombre: cart_items_id_seq; Tipo: ACTUALIZACIÓN DEL VALOR DE SECUENCIA; Esquema: public; Propietario: postgres
--

SELECT pg_catalog.setval('public.cart_items_id_seq', 1, false);


--
-- Nombre: categories_id_seq; Tipo: ACTUALIZACIÓN DEL VALOR DE SECUENCIA; Esquema: public; Propietario: postgres
--

SELECT pg_catalog.setval('public.categories_id_seq', 5, true);


--
-- Nombre: coupon_categories_id_seq; Tipo: ACTUALIZACIÓN DEL VALOR DE SECUENCIA; Esquema: public; Propietario: postgres
--

SELECT pg_catalog.setval('public.coupon_categories_id_seq', 1, false);


--
-- Nombre: coupons_id_seq; Tipo: ACTUALIZACIÓN DEL VALOR DE SECUENCIA; Esquema: public; Propietario: postgres
--

SELECT pg_catalog.setval('public.coupons_id_seq', 3, true);


--
-- Nombre: daily_sales_id_seq; Tipo: ACTUALIZACIÓN DEL VALOR DE SECUENCIA; Esquema: public; Propietario: postgres
--

SELECT pg_catalog.setval('public.daily_sales_id_seq', 31, true);


--
-- Nombre: global_banner_id_seq; Tipo: ACTUALIZACIÓN DEL VALOR DE SECUENCIA; Esquema: public; Propietario: postgres
--

SELECT pg_catalog.setval('public.global_banner_id_seq', 1, true);


--
-- Nombre: order_items_id_seq; Tipo: ACTUALIZACIÓN DEL VALOR DE SECUENCIA; Esquema: public; Propietario: postgres
--

SELECT pg_catalog.setval('public.order_items_id_seq', 6, true);


--
-- Nombre: orders_id_seq; Tipo: ACTUALIZACIÓN DEL VALOR DE SECUENCIA; Esquema: public; Propietario: postgres
--

SELECT pg_catalog.setval('public.orders_id_seq', 5, true);


--
-- Nombre: product_images_id_seq; Tipo: ACTUALIZACIÓN DEL VALOR DE SECUENCIA; Esquema: public; Propietario: postgres
--

SELECT pg_catalog.setval('public.product_images_id_seq', 14, true);


--
-- Nombre: products_id_seq; Tipo: ACTUALIZACIÓN DEL VALOR DE SECUENCIA; Esquema: public; Propietario: postgres
--

SELECT pg_catalog.setval('public.products_id_seq', 13, true);


--
-- Nombre: recent_activity_id_seq; Tipo: ACTUALIZACIÓN DEL VALOR DE SECUENCIA; Esquema: public; Propietario: postgres
--

SELECT pg_catalog.setval('public.recent_activity_id_seq', 6, true);


--
-- Nombre: region_sales_id_seq; Tipo: ACTUALIZACIÓN DEL VALOR DE SECUENCIA; Esquema: public; Propietario: postgres
--

SELECT pg_catalog.setval('public.region_sales_id_seq', 8, true);


--
-- Nombre: stock_thresholds_id_seq; Tipo: ACTUALIZACIÓN DEL VALOR DE SECUENCIA; Esquema: public; Propietario: postgres
--

SELECT pg_catalog.setval('public.stock_thresholds_id_seq', 5, true);


--
-- Nombre: support_tickets_id_seq; Tipo: ACTUALIZACIÓN DEL VALOR DE SECUENCIA; Esquema: public; Propietario: postgres
--

SELECT pg_catalog.setval('public.support_tickets_id_seq', 3, true);


--
-- Nombre: system_config_id_seq; Tipo: ACTUALIZACIÓN DEL VALOR DE SECUENCIA; Esquema: public; Propietario: postgres
--

SELECT pg_catalog.setval('public.system_config_id_seq', 1, true);


--
-- Nombre: users_id_seq; Tipo: ACTUALIZACIÓN DEL VALOR DE SECUENCIA; Esquema: public; Propietario: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 6, true);


--
-- Nombre: waste_events_id_seq; Tipo: ACTUALIZACIÓN DEL VALOR DE SECUENCIA; Esquema: public; Propietario: postgres
--

SELECT pg_catalog.setval('public.waste_events_id_seq', 3, true);


--
-- ============================================================================
-- SECCIÓN 6: RESTRICCIONES DE LLAVES PRIMARIAS Y UNICIDAD (PRIMARY & UNIQUE KEYS)
-- ============================================================================
--
-- Nombre: bug_reports bug_reports_pkey; Tipo: RESTRICCIÓN (LLAVE PRIMARIA / ÚNICA); Esquema: public; Propietario: postgres
--

ALTER TABLE ONLY public.bug_reports
    ADD CONSTRAINT bug_reports_pkey PRIMARY KEY (id);


--
-- Nombre: cart_items cart_items_pkey; Tipo: RESTRICCIÓN (LLAVE PRIMARIA / ÚNICA); Esquema: public; Propietario: postgres
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_pkey PRIMARY KEY (id);


--
-- Nombre: cart_items cart_items_user_id_product_id_key; Tipo: RESTRICCIÓN (LLAVE PRIMARIA / ÚNICA); Esquema: public; Propietario: postgres
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_user_id_product_id_key UNIQUE (user_id, product_id);


--
-- Nombre: categories categories_pkey; Tipo: RESTRICCIÓN (LLAVE PRIMARIA / ÚNICA); Esquema: public; Propietario: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Nombre: coupon_categories coupon_categories_pkey; Tipo: RESTRICCIÓN (LLAVE PRIMARIA / ÚNICA); Esquema: public; Propietario: postgres
--

ALTER TABLE ONLY public.coupon_categories
    ADD CONSTRAINT coupon_categories_pkey PRIMARY KEY (id);


--
-- Nombre: coupons coupons_code_key; Tipo: RESTRICCIÓN (LLAVE PRIMARIA / ÚNICA); Esquema: public; Propietario: postgres
--

ALTER TABLE ONLY public.coupons
    ADD CONSTRAINT coupons_code_key UNIQUE (code);


--
-- Nombre: coupons coupons_pkey; Tipo: RESTRICCIÓN (LLAVE PRIMARIA / ÚNICA); Esquema: public; Propietario: postgres
--

ALTER TABLE ONLY public.coupons
    ADD CONSTRAINT coupons_pkey PRIMARY KEY (id);


--
-- Nombre: daily_sales daily_sales_pkey; Tipo: RESTRICCIÓN (LLAVE PRIMARIA / ÚNICA); Esquema: public; Propietario: postgres
--

ALTER TABLE ONLY public.daily_sales
    ADD CONSTRAINT daily_sales_pkey PRIMARY KEY (id);


--
-- Nombre: global_banner global_banner_pkey; Tipo: RESTRICCIÓN (LLAVE PRIMARIA / ÚNICA); Esquema: public; Propietario: postgres
--

ALTER TABLE ONLY public.global_banner
    ADD CONSTRAINT global_banner_pkey PRIMARY KEY (id);


--
-- Nombre: inventory_batches inventory_batches_pkey; Tipo: RESTRICCIÓN (LLAVE PRIMARIA / ÚNICA); Esquema: public; Propietario: postgres
--

ALTER TABLE ONLY public.inventory_batches
    ADD CONSTRAINT inventory_batches_pkey PRIMARY KEY (id);


--
-- Nombre: order_items order_items_pkey; Tipo: RESTRICCIÓN (LLAVE PRIMARIA / ÚNICA); Esquema: public; Propietario: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (id);


--
-- Nombre: orders orders_pkey; Tipo: RESTRICCIÓN (LLAVE PRIMARIA / ÚNICA); Esquema: public; Propietario: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- Nombre: product_images product_images_pkey; Tipo: RESTRICCIÓN (LLAVE PRIMARIA / ÚNICA); Esquema: public; Propietario: postgres
--

ALTER TABLE ONLY public.product_images
    ADD CONSTRAINT product_images_pkey PRIMARY KEY (id);


--
-- Nombre: products products_pkey; Tipo: RESTRICCIÓN (LLAVE PRIMARIA / ÚNICA); Esquema: public; Propietario: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Nombre: recent_activity recent_activity_pkey; Tipo: RESTRICCIÓN (LLAVE PRIMARIA / ÚNICA); Esquema: public; Propietario: postgres
--

ALTER TABLE ONLY public.recent_activity
    ADD CONSTRAINT recent_activity_pkey PRIMARY KEY (id);


--
-- Nombre: region_sales region_sales_pkey; Tipo: RESTRICCIÓN (LLAVE PRIMARIA / ÚNICA); Esquema: public; Propietario: postgres
--

ALTER TABLE ONLY public.region_sales
    ADD CONSTRAINT region_sales_pkey PRIMARY KEY (id);


--
-- Nombre: stock_thresholds stock_thresholds_pkey; Tipo: RESTRICCIÓN (LLAVE PRIMARIA / ÚNICA); Esquema: public; Propietario: postgres
--

ALTER TABLE ONLY public.stock_thresholds
    ADD CONSTRAINT stock_thresholds_pkey PRIMARY KEY (id);


--
-- Nombre: support_tickets support_tickets_pkey; Tipo: RESTRICCIÓN (LLAVE PRIMARIA / ÚNICA); Esquema: public; Propietario: postgres
--

ALTER TABLE ONLY public.support_tickets
    ADD CONSTRAINT support_tickets_pkey PRIMARY KEY (id);


--
-- Nombre: system_config system_config_key_key; Tipo: RESTRICCIÓN (LLAVE PRIMARIA / ÚNICA); Esquema: public; Propietario: postgres
--

ALTER TABLE ONLY public.system_config
    ADD CONSTRAINT system_config_key_key UNIQUE (key);


--
-- Nombre: system_config system_config_pkey; Tipo: RESTRICCIÓN (LLAVE PRIMARIA / ÚNICA); Esquema: public; Propietario: postgres
--

ALTER TABLE ONLY public.system_config
    ADD CONSTRAINT system_config_pkey PRIMARY KEY (id);


--
-- Nombre: users users_email_key; Tipo: RESTRICCIÓN (LLAVE PRIMARIA / ÚNICA); Esquema: public; Propietario: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Nombre: users users_pkey; Tipo: RESTRICCIÓN (LLAVE PRIMARIA / ÚNICA); Esquema: public; Propietario: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Nombre: waste_events waste_events_pkey; Tipo: RESTRICCIÓN (LLAVE PRIMARIA / ÚNICA); Esquema: public; Propietario: postgres
--

ALTER TABLE ONLY public.waste_events
    ADD CONSTRAINT waste_events_pkey PRIMARY KEY (id);


--
-- ============================================================================
-- SECCIÓN 7: ÍNDICES PARA OPTIMIZACIÓN DE RENDIMIENTO Y CONSULTAS FRECUENTES
-- ============================================================================
--
-- Nombre: idx_cart_user; Tipo: ÍNDICE (OPTIMIZACIÓN DE CONSULTAS); Esquema: public; Propietario: postgres
--

CREATE INDEX idx_cart_user ON public.cart_items USING btree (user_id);


--
-- Nombre: idx_daily_sales_date; Tipo: ÍNDICE (OPTIMIZACIÓN DE CONSULTAS); Esquema: public; Propietario: postgres
--

CREATE INDEX idx_daily_sales_date ON public.daily_sales USING btree (sale_date);


--
-- Nombre: idx_order_items_order; Tipo: ÍNDICE (OPTIMIZACIÓN DE CONSULTAS); Esquema: public; Propietario: postgres
--

CREATE INDEX idx_order_items_order ON public.order_items USING btree (order_id);


--
-- Nombre: idx_orders_client; Tipo: ÍNDICE (OPTIMIZACIÓN DE CONSULTAS); Esquema: public; Propietario: postgres
--

CREATE INDEX idx_orders_client ON public.orders USING btree (client_id);


--
-- Nombre: idx_orders_seller; Tipo: ÍNDICE (OPTIMIZACIÓN DE CONSULTAS); Esquema: public; Propietario: postgres
--

CREATE INDEX idx_orders_seller ON public.orders USING btree (seller_id);


--
-- Nombre: idx_products_active; Tipo: ÍNDICE (OPTIMIZACIÓN DE CONSULTAS); Esquema: public; Propietario: postgres
--

CREATE INDEX idx_products_active ON public.products USING btree (active);


--
-- Nombre: idx_products_category; Tipo: ÍNDICE (OPTIMIZACIÓN DE CONSULTAS); Esquema: public; Propietario: postgres
--

CREATE INDEX idx_products_category ON public.products USING btree (category_id);


--
-- Nombre: idx_products_seller; Tipo: ÍNDICE (OPTIMIZACIÓN DE CONSULTAS); Esquema: public; Propietario: postgres
--

CREATE INDEX idx_products_seller ON public.products USING btree (seller_id);


--
-- ============================================================================
-- SECCIÓN 8: RESTRICCIONES DE LLAVES FORÁNEAS (INTEGRIDAD REFERENCIAL / RELACIONES)
-- ============================================================================
--
-- Nombre: cart_items cart_items_product_id_fkey; Tipo: RESTRICCIÓN DE LLAVE FORÁNEA (RELACIÓN REFERENCIAL); Esquema: public; Propietario: postgres
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Nombre: cart_items cart_items_user_id_fkey; Tipo: RESTRICCIÓN DE LLAVE FORÁNEA (RELACIÓN REFERENCIAL); Esquema: public; Propietario: postgres
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Nombre: coupon_categories coupon_categories_category_id_fkey; Tipo: RESTRICCIÓN DE LLAVE FORÁNEA (RELACIÓN REFERENCIAL); Esquema: public; Propietario: postgres
--

ALTER TABLE ONLY public.coupon_categories
    ADD CONSTRAINT coupon_categories_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE CASCADE;


--
-- Nombre: coupon_categories coupon_categories_coupon_id_fkey; Tipo: RESTRICCIÓN DE LLAVE FORÁNEA (RELACIÓN REFERENCIAL); Esquema: public; Propietario: postgres
--

ALTER TABLE ONLY public.coupon_categories
    ADD CONSTRAINT coupon_categories_coupon_id_fkey FOREIGN KEY (coupon_id) REFERENCES public.coupons(id) ON DELETE CASCADE;


--
-- Nombre: order_items order_items_order_id_fkey; Tipo: RESTRICCIÓN DE LLAVE FORÁNEA (RELACIÓN REFERENCIAL); Esquema: public; Propietario: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- Nombre: order_items order_items_product_id_fkey; Tipo: RESTRICCIÓN DE LLAVE FORÁNEA (RELACIÓN REFERENCIAL); Esquema: public; Propietario: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE SET NULL;


--
-- Nombre: orders orders_client_id_fkey; Tipo: RESTRICCIÓN DE LLAVE FORÁNEA (RELACIÓN REFERENCIAL); Esquema: public; Propietario: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Nombre: orders orders_seller_id_fkey; Tipo: RESTRICCIÓN DE LLAVE FORÁNEA (RELACIÓN REFERENCIAL); Esquema: public; Propietario: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_seller_id_fkey FOREIGN KEY (seller_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Nombre: product_images product_images_product_id_fkey; Tipo: RESTRICCIÓN DE LLAVE FORÁNEA (RELACIÓN REFERENCIAL); Esquema: public; Propietario: postgres
--

ALTER TABLE ONLY public.product_images
    ADD CONSTRAINT product_images_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Nombre: products products_category_id_fkey; Tipo: RESTRICCIÓN DE LLAVE FORÁNEA (RELACIÓN REFERENCIAL); Esquema: public; Propietario: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE SET NULL;


--
-- Nombre: products products_seller_id_fkey; Tipo: RESTRICCIÓN DE LLAVE FORÁNEA (RELACIÓN REFERENCIAL); Esquema: public; Propietario: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_seller_id_fkey FOREIGN KEY (seller_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Nombre: waste_events waste_events_batch_id_fkey; Tipo: RESTRICCIÓN DE LLAVE FORÁNEA (RELACIÓN REFERENCIAL); Esquema: public; Propietario: postgres
--

ALTER TABLE ONLY public.waste_events
    ADD CONSTRAINT waste_events_batch_id_fkey FOREIGN KEY (batch_id) REFERENCES public.inventory_batches(id) ON DELETE CASCADE;


--
-- Nombre: SCHEMA public; Tipo: LISTA DE CONTROL DE ACCESO (PERMISOS); Esquema: -; Propietario: postgres
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- ============================================================================
-- SECCIÓN 9: TABLAS DEL MÓDULO ERP (PANEL DE CONTROL Y ANALÍTICA EMPRESARIAL)
-- ============================================================================
--

-- ============================================================================
-- TABLA: erp_sales_metrics
-- Propósito: Módulo ERP - Indicadores Financieros: Monitorea las ventas reales versus los objetivos presupuestados y el margen de ganancia porcentual.
-- ============================================================================
-- Nombre: erp_sales_metrics; Tipo: TABLA; Esquema: public; Propietario: postgres
CREATE TABLE IF NOT EXISTS public.erp_sales_metrics (
    id integer NOT NULL,
    record_date date NOT NULL,
    actual_sales numeric(15,2) DEFAULT 0.00 NOT NULL,
    target_sales numeric(15,2) DEFAULT 0.00 NOT NULL,
    profit_margin numeric(5,2) DEFAULT 0.00 NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

CREATE SEQUENCE IF NOT EXISTS public.erp_sales_metrics_id_seq
    AS integer START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
ALTER SEQUENCE public.erp_sales_metrics_id_seq OWNED BY public.erp_sales_metrics.id;
ALTER TABLE ONLY public.erp_sales_metrics ALTER COLUMN id SET DEFAULT nextval('public.erp_sales_metrics_id_seq'::regclass);
ALTER TABLE ONLY public.erp_sales_metrics ADD CONSTRAINT erp_sales_metrics_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.erp_sales_metrics ADD CONSTRAINT erp_sales_metrics_record_date_key UNIQUE (record_date);

-- ============================================================================
-- TABLA: erp_system_notifications
-- Propósito: Módulo ERP - Alertas del Sistema: Notificaciones operativas automáticas (fallos en pasarela de pagos, pedidos mayoristas B2B, retrasos de proveedores).
-- ============================================================================
-- Nombre: erp_system_notifications; Tipo: TABLA; Esquema: public; Propietario: postgres
CREATE TABLE IF NOT EXISTS public.erp_system_notifications (
    id integer NOT NULL,
    type character varying(50) NOT NULL,
    title character varying(150) NOT NULL,
    message text NOT NULL,
    is_read boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

CREATE SEQUENCE IF NOT EXISTS public.erp_system_notifications_id_seq
    AS integer START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
ALTER SEQUENCE public.erp_system_notifications_id_seq OWNED BY public.erp_system_notifications.id;
ALTER TABLE ONLY public.erp_system_notifications ALTER COLUMN id SET DEFAULT nextval('public.erp_system_notifications_id_seq'::regclass);
ALTER TABLE ONLY public.erp_system_notifications ADD CONSTRAINT erp_system_notifications_pkey PRIMARY KEY (id);

-- ============================================================================
-- TABLA: erp_fabric_inventory
-- Propósito: Módulo ERP - Inventario Físico Centralizado: Catálogo sincronizado para el ERP con código SKU, proveedor, existencia en metros, umbral mínimo y costos.
-- ============================================================================
-- Nombre: erp_fabric_inventory; Tipo: TABLA; Esquema: public; Propietario: postgres
CREATE TABLE IF NOT EXISTS public.erp_fabric_inventory (
    id integer NOT NULL,
    sku character varying(50) NOT NULL,
    fabric_name character varying(150) NOT NULL,
    category character varying(50) NOT NULL,
    supplier character varying(100) NOT NULL,
    current_meters numeric(10,2) DEFAULT 0.00 NOT NULL,
    min_threshold_meters numeric(10,2) DEFAULT 50.00 NOT NULL,
    cost_per_meter numeric(10,2) NOT NULL,
    last_restock_date date
);

CREATE SEQUENCE IF NOT EXISTS public.erp_fabric_inventory_id_seq
    AS integer START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;
ALTER SEQUENCE public.erp_fabric_inventory_id_seq OWNED BY public.erp_fabric_inventory.id;
ALTER TABLE ONLY public.erp_fabric_inventory ALTER COLUMN id SET DEFAULT nextval('public.erp_fabric_inventory_id_seq'::regclass);
ALTER TABLE ONLY public.erp_fabric_inventory ADD CONSTRAINT erp_fabric_inventory_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.erp_fabric_inventory ADD CONSTRAINT erp_fabric_inventory_sku_key UNIQUE (sku);

--
-- ============================================================================
-- SECCIÓN 10: DATOS INICIALES (SEMILLAS) PARA EL MÓDULO ERP
-- ============================================================================
--

COPY public.erp_sales_metrics (id, record_date, actual_sales, target_sales, profit_margin, created_at) FROM stdin;
1	2026-06-16	2239063.74	1201582.07	32.50	2026-06-29 12:15:00
2	2026-06-17	1235128.52	1790065.79	34.00	2026-06-29 12:15:00
3	2026-06-18	2114342.69	1439017.22	33.20	2026-06-29 12:15:00
4	2026-06-19	1850000.00	1650000.00	38.10	2026-06-29 12:15:00
5	2026-06-20	1900000.00	1700000.00	36.40	2026-06-29 12:15:00
6	2026-06-21	2400000.00	1800000.00	41.00	2026-06-29 12:15:00
7	2026-06-22	1400000.00	1850000.00	35.50	2026-06-29 12:15:00
8	2026-06-23	1750000.00	1550000.00	33.80	2026-06-29 12:15:00
9	2026-06-24	1250000.00	1500000.00	30.50	2026-06-29 12:15:00
10	2026-06-25	1800000.00	1550000.00	34.00	2026-06-29 12:15:00
11	2026-06-26	1600000.00	1600000.00	33.20	2026-06-29 12:15:00
12	2026-06-27	2100000.00	1650000.00	38.10	2026-06-29 12:15:00
13	2026-06-28	1900000.00	1700000.00	36.40	2026-06-29 12:15:00
14	2026-06-29	2400000.00	1800000.00	41.00	2026-06-29 12:15:00
\.

COPY public.erp_system_notifications (id, type, title, message, is_read, created_at) FROM stdin;
1	error	Fallo de Pasarela de Pago	3 transacciones con tarjeta declinadas por el banco emisor.	f	2026-06-29 12:15:00
2	success	Pedido Mayorista B2B	Textiles Premium SAS solicito 500m de Lino Blanco.	f	2026-06-29 12:15:00
3	warning	Retraso de Proveedor	El envio de Seda Pura desde Italia presenta 2 dias de retraso.	f	2026-06-29 12:15:00
4	info	Reporte Semanal Generado	El balance de ventas semanales esta listo para descarga.	f	2026-06-29 12:15:00
\.

COPY public.erp_fabric_inventory (id, sku, fabric_name, category, supplier, current_meters, min_threshold_meters, cost_per_meter, last_restock_date) FROM stdin;
1	ALG-001	Algodon Egipcio Blanco	Algodon	Textil Corp	1200.50	100.00	25000	2026-06-14
2	SED-042	Seda Pura Escarlata	Seda	Importaciones V&G	35.00	50.00	85000	2026-05-30
3	LIN-112	Lino Rustico Crudo	Lino	Textil Corp	450.00	80.00	42000	2026-06-19
4	TER-998	Terciopelo Azul Noche	Terciopelo	Tejidos Premium	15.00	30.00	110000	2026-05-15
5	DRL-201	Dril Elastico Natural	Dril	Drilones Industriales	380.00	50.00	38000	2026-06-24
6	LAN-055	Lana Merino Gris	Lana	Lanera del Sur	120.00	20.00	65000	2026-06-09
\.

--
-- ============================================================================
-- FIN DEL VOLCADO DE BASE DE DATOS POSTGRESQL (DUMP COMPLETADO EXITOSAMENTE)
-- ============================================================================
--

\unrestrict N0ZrrFfSENKgOisUPO7tzvkaLla9MuffG8eNBphhCJihO2oabNvhZjzFhMAyfyU

