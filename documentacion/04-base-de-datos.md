# Diseño y Estructura de la Base de Datos

Esta sección describe el modelo de datos relacional implementado en PostgreSQL y los algoritmos matemáticos que operan sobre la base de datos para la calculadora de metraje.

---

## 1. Diseño General de la Base de Datos

El sistema utiliza **PostgreSQL** para la persistencia transaccional, garantizando la integridad de datos bajo los principios **ACID** (Atomicidad, Consistencia, Aislamiento y Durabilidad).

El motor de base de datos prohíbe la existencia de registros huérfanos (por ejemplo, artículos en un carrito que apunten a un producto eliminado) mediante el uso estricto de claves foráneas (`Foreign Keys`) con políticas de cascada o restricción.

---

## 2. Tablas Principales

### 2.1 Tabla de Usuarios (`users`)
Gestiona el acceso, la información de perfil y la separación lógica de roles de la plataforma. Las contraseñas se almacenan procesadas bajo hash criptográfico SHA-256 desde el backend.

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'vendedor', 'cliente')),
    active BOOLEAN DEFAULT TRUE,
    suspended BOOLEAN DEFAULT FALSE,
    last_login TIMESTAMP,
    commission_rate DECIMAL(5,2) DEFAULT 0.00
);
```

### 2.2 Tabla de Categorías (`categories`)
Define la jerarquía taxonómica de los productos para optimizar búsquedas y filtrados.

```sql
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT
);
```

### 2.3 Tabla de Productos (`products`)
Almacena la información de catálogo de las telas. Mantiene una relación con el vendedor que oferta el producto.

```sql
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category_id INTEGER REFERENCES categories(id) ON DELETE RESTRICT,
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    stock DECIMAL(10,2) NOT NULL CHECK (stock >= 0),
    description TEXT,
    features JSONB,
    colors JSONB,
    seller_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    images JSONB
);
```

---

## 3. Tablas Secundarias e Inteligencia de Negocio

La base de datos cuenta con tablas adicionales para soportar flujos avanzados del negocio:

*   **`cart_items`**: Persistencia temporal de productos seleccionados por el cliente antes del pago.
*   **`orders`** y **`order_items`**: Modelado transaccional clásico cabecera-detalle (One-to-Many). Almacena facturas históricas y el desglose de telas compradas por transacción.
*   **`inventory_batches`**: Registra la entrada de nuevos rollos de tela provenientes de proveedores externos.
*   **`waste_events`**: Registra pérdidas de tela (mermas) debido a daños físicos, recortes fallidos o piezas inutilizables del inventario.
*   **`coupons`** y **`coupon_categories`**: Estructura de cupones de descuento porcentuales o de valor fijo con límites de expiración y uso único.
*   **`daily_sales`** y **`region_sales`**: Tablas agregadas de analíticas. Evitan la ejecución repetitiva de consultas sumatorias costosas (`SUM` sobre millones de registros) sirviendo resúmenes comerciales listos para graficar en el frontend.
*   **`recent_activity`**: Registro continuo de logs de seguridad para auditoría interna del administrador.
*   **`support_tickets`** y **`bug_reports`**: Módulos de soporte técnico al cliente y reportes de errores en la plataforma.

---

## 4. Conexión y Resiliencia JDBC

El backend de Java interactúa con la base de datos PostgreSQL utilizando una única clase de conexión optimizada bajo el patrón **Singleton** (`Conexion.java`).

Para prevenir bloqueos o caídas del servidor por conexiones inactivas o procesos "zombie" terminados por el motor de base de datos, el Singleton implementa la función `.isValid(timeout)` en JDBC. Si se detecta que la comunicación física se ha roto, el sistema descarta la conexión dañada y reconstruye el canal de forma transparente en milisegundos sin interrumpir la operación del cliente.

---

## 5. Algoritmos de la Calculadora de Metraje

La calculadora de metraje utiliza la geometría de confección textil para guiar al cliente en su compra, añadiendo por defecto un **10% extra** de seguridad para evitar mermas durante el corte.

Los algoritmos aplicados en el frontend son:

### 5.1 Falda Circular
Calcula la cantidad de tela en función del radio y el largo deseado de la falda:
$$\text{Radio de Cintura} = \frac{\text{Medida de Cintura}}{2 \times \pi}$$
$$\text{Radio Total} = \text{Radio de Cintura} + \text{Largo de Falda} + \text{Margen de Costura (2cm)}$$
$$\text{Tela Requerida} = (\text{Radio Total} \times 2) \times 1.10$$

### 5.2 Cortinas
Estima el metraje considerando la anchura de la ventana y el factor de pliegue o fruncido seleccionado:
$$\text{Ancho Total Cortina} = \text{Ancho de Ventana} \times \text{Factor de Fruncido (1.5, 2.0 o 3.0)}$$
$$\text{Número de Paños} = \text{Ceil}\left(\frac{\text{Ancho Total Cortina}}{\text{Ancho del Rollo de Tela}}\right)$$
$$\text{Largo por Paño} = \text{Alto de Ventana} + \text{Dobladillo Superior (10cm)} + \text{Dobladillo Inferior (20cm)}$$
$$\text{Tela Requerida} = (\text{Número de Paños} \times \text{Largo por Paño}) \times 1.10$$

### 5.3 Manteles
Calcula el tamaño del mantel según las dimensiones de la mesa y la caída o vuelo lateral deseado:
$$\text{Ancho Mantel} = \text{Ancho Mesa} + (\text{Caída Lateral} \times 2) + \text{Dobladillo (4cm)}$$
$$\text{Largo Mantel} = \text{Largo Mesa} + (\text{Caída Lateral} \times 2) + \text{Dobladillo (4cm)}$$
$$\text{Tela Requerida} = \text{Largo Mantel} \times 1.10 \quad (\text{si el Ancho Mantel es menor al ancho de la tela})$$
