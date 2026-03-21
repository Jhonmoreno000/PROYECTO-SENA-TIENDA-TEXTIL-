# D&D Textil — Tienda Digital de Telas

Plataforma web de venta de telas con backend Java (API REST) y frontend React (Vite).

---

## Requisitos Previos

- **Java JDK 17+** — [https://adoptium.net](https://adoptium.net)
- **Node.js 18+** — [https://nodejs.org](https://nodejs.org)
- **PostgreSQL 14+** — [https://www.postgresql.org/download/](https://www.postgresql.org/download/)

Verifica que están instalados:

```bash
java -version
node -v
npm -v
psql --version
```

---

## 1. Base de Datos

### 1.1. Crear la base de datos

Abre una terminal y ejecuta:

```bash
psql -U postgres
```

Dentro de psql:

```sql
CREATE DATABASE tienda_digital_textiles_db;
\q
```

### 1.2. Restaurar el esquema y datos

El archivo SQL se encuentra en la carpeta `BASE DE DATOS/` en la raíz del repositorio.

```bash
psql -U postgres -d tienda_digital_textiles_db -f "BASE DE DATOS/TIENDA DIGITAL TEXTIL.sql"
```

> **Nota:** Si te pide contraseña, ingresa la contraseña de tu usuario `postgres` de PostgreSQL.

### 1.3. Verificar que se crearon las tablas

```bash
psql -U postgres -d tienda_digital_textiles_db -c "\dt"
```

Deberías ver las tablas: `users`, `products`, `categories`, `orders`, `order_items`, `product_images`, `coupons`, `coupon_categories`, `coupon_usage`, `support_tickets`, `bug_reports`, `cart_items`, `daily_sales`, `global_banner`, `inventory_batches`, `system_config`, entre otras.

---

## 2. Backend (Java API REST)

### 2.1. Configurar variables de entorno

El backend necesita la contraseña de PostgreSQL como variable de entorno. **No se almacena en el código fuente.**

**PowerShell (Windows):**

```powershell
$env:DB_PASSWORD = "TU_CONTRASEÑA_DE_POSTGRES"
```

**CMD (Windows):**

```cmd
set DB_PASSWORD=TU_CONTRASEÑA_DE_POSTGRES
```

**Linux/Mac:**

```bash
export DB_PASSWORD="TU_CONTRASEÑA_DE_POSTGRES"
```

Variables opcionales (tienen valores por defecto):

| Variable      | Valor por defecto                                         |
|---------------|-----------------------------------------------------------|
| `DB_URL`      | `jdbc:postgresql://localhost:5432/tienda_digital_textiles_db` |
| `DB_USER`     | `postgres`                                                |
| `DB_PASSWORD` | *(vacío — debes configurarla)*                            |

### 2.2. Compilar el backend

Desde la carpeta del proyecto frontend (`tienda digital de telas/`):

```bash
javac -encoding UTF-8 -cp "backend-java/conexionPostgres/lib/*" -d "backend-java/conexionPostgres/bin" backend-java/conexionPostgres/src/App.java backend-java/conexionPostgres/src/conexion/*.java backend-java/conexionPostgres/src/api/*.java backend-java/conexionPostgres/src/dao/*.java backend-java/conexionPostgres/src/models/*.java
```

### 2.3. Ejecutar el backend

```bash
java -cp "backend-java/conexionPostgres/bin;backend-java/conexionPostgres/lib/*" App
```

> **En Linux/Mac**, usa `:` en lugar de `;` como separador del classpath:
> ```bash
> java -cp "backend-java/conexionPostgres/bin:backend-java/conexionPostgres/lib/*" App
> ```

Deberías ver:

```
Iniciando aplicación Backend...
 Conexión a PostgreSQL establecida con éxito.
¡Conecta a la base de datos tienda_digital_textiles_db perfectamente!
 Servidor API escuchando en el puerto 8081
```

El backend queda escuchando en `http://localhost:8081`.

---

## 3. Frontend (React + Vite)

### 3.1. Instalar dependencias

Desde la carpeta del proyecto frontend (`tienda digital de telas/`):

```bash
npm install
```

### 3.2. Ejecutar en modo desarrollo

```bash
npm run dev
```

Deberías ver:

```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:3001/
```

Abre `http://localhost:3001` en tu navegador.

### 3.3. Build de producción (opcional)

```bash
npm run build
npm run preview
```

---

## Orden de Ejecución

Siempre ejecuta en este orden:

1. **PostgreSQL** — asegúrate de que el servicio esté corriendo
2. **Backend Java** — configura `DB_PASSWORD` y ejecuta el servidor
3. **Frontend React** — ejecuta `npm run dev`

---

## Estructura del Proyecto

```
tienda digital de telas/
├── BASE DE DATOS/
│   └── TIENDA DIGITAL TEXTIL.sql    ← Script SQL completo
├── tienda digital de telas/          ← Proyecto principal
│   ├── backend-java/
│   │   └── conexionPostgres/
│   │       ├── lib/                  ← JARs (PostgreSQL driver, Gson)
│   │       ├── bin/                  ← Clases compiladas
│   │       ├── uploads/              ← Imágenes subidas
│   │       └── src/
│   │           ├── App.java          ← Punto de entrada del backend
│   │           ├── conexion/         ← Conexión a PostgreSQL
│   │           ├── api/              ← Handlers HTTP (REST endpoints)
│   │           ├── dao/              ← Acceso a datos (queries SQL)
│   │           └── models/           ← Modelos de datos (POJOs)
│   ├── src/
│   │   ├── App.jsx                   ← Rutas principales
│   │   ├── components/               ← Componentes React
│   │   ├── context/                  ← Contextos (Auth, Cart, Metrics)
│   │   ├── pages/                    ← Páginas de la aplicación
│   │   └── data/                     ← Datos de navegación
│   ├── package.json
│   └── vite.config.js
└── README.md
```

---

## Endpoints de la API

| Método | Ruta                                  | Descripción                    |
|--------|---------------------------------------|--------------------------------|
| POST   | `/api/login`                          | Iniciar sesión                 |
| POST   | `/api/register`                       | Registrar usuario              |
| GET    | `/api/products`                       | Listar productos activos       |
| GET    | `/api/products?sellerId=X`            | Productos de un vendedor       |
| GET    | `/api/products/pending`               | Productos pendientes de aprobación |
| POST   | `/api/products`                       | Agregar producto               |
| PUT    | `/api/products/{id}`                  | Actualizar producto            |
| DELETE | `/api/products/{id}`                  | Eliminar producto (soft delete)|
| PUT    | `/api/products/{id}/image`            | Subir imagen (Base64)          |
| PUT    | `/api/products/{id}/moderate`         | Aprobar/rechazar producto      |
| GET    | `/api/users`                          | Listar usuarios                |
| GET    | `/api/orders`                         | Listar pedidos                 |
| PUT    | `/api/orders/{id}/status`             | Actualizar estado de pedido    |
| GET    | `/api/coupons`                        | Listar cupones                 |
| POST   | `/api/coupons`                        | Crear cupón                    |
| PUT    | `/api/coupons/{id}/deactivate`        | Desactivar cupón               |
| GET    | `/api/config`                         | Obtener configuración          |
| POST   | `/api/config`                         | Guardar configuración          |
| GET    | `/api/support/tickets`                | Listar tickets de soporte      |
| POST   | `/api/support/tickets`                | Crear ticket                   |
| PUT    | `/api/support/tickets/{id}/status`    | Actualizar estado de ticket    |
| GET    | `/api/support/bugs`                   | Listar reportes de fallos      |
| POST   | `/api/support/bugs`                   | Crear reporte de fallo         |
| PUT    | `/api/support/bugs/{id}/status`       | Actualizar estado de reporte   |
