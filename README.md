<div align="center">

# D&D Textil

### Ecosistema tecnológico para la industria textil

Plataforma integral para la comercialización, distribución y gestión de inventario de telas, construida con una arquitectura reactiva, un backend corporativo ligero y un modelo relacional en tiempo real.

<p>
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/TailwindCSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" />
  <img src="https://img.shields.io/badge/Java-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white" />
  <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" />
  <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" />
  <img src="https://img.shields.io/badge/ISO%2FIEC_25010-Software_Quality-green?style=for-the-badge" />
  <img src="https://img.shields.io/badge/DevSecOps-OWASP_ASVS-blueviolet?style=for-the-badge" />
  <img src="https://img.shields.io/badge/SENA-Calidad_Aprobada-39A900?style=for-the-badge" />
</p>

<p>
  <img src="https://img.shields.io/github/languages/top/Jhonmoreno000/PROYECTO-SENA-TIENDA-TEXTIL-" />
  <img src="https://img.shields.io/github/languages/count/Jhonmoreno000/PROYECTO-SENA-TIENDA-TEXTIL-" />
  <img src="https://img.shields.io/github/last-commit/Jhonmoreno000/PROYECTO-SENA-TIENDA-TEXTIL-" />
  <img src="https://img.shields.io/github/repo-size/Jhonmoreno000/PROYECTO-SENA-TIENDA-TEXTIL-" />
</p>

<br />

<p align="center">
  <img src="images/tienda-preview.png" alt="D&D Textil - Vista Principal de la Tienda" width="100%" style="border-radius: 12px; box-shadow: 0 8px 30px rgba(0,0,0,0.12);" />
</p>

</div>

---

## Visión general

Un solo ecosistema que une tienda en línea, paneles de administración y control de inventario. Los tres bloques comparten una misma base de datos y una API REST, de modo que cada cambio en catálogo, reseñas o apartados del inicio se refleja al instante en todas las interfaces.


**Lo esencial en pocas líneas**

- Tienda pública con catálogo filtrable, fichas de tela, reseñas reales guardadas en base de datos, carrito con cupones y pago en línea con **Wompi** (tarjeta, Bancolombia, Nequi y PSE).
- Inicio de sesión con correo y contraseña o con cuentas de **Google** y **Microsoft**.
- Paneles para tres roles: cliente (pedidos, soporte, calculadora de metraje), vendedor (sus telas, pedidos y alertas de stock) y administrador (usuarios, moderación, inventario, contenido, cupones, facturación y analítica).
- Despliegue completo con Docker Compose: tres contenedores listos en un solo comando.

## Arquitectura

```
┌──────────────────────────┐     ┌──────────────────────────┐
│  Frontend  React + Vite  │     │  Frontend  App Android   │
│  http://localhost:3001   │     │  WebView + Kotlin        │
└────────────┬─────────────┘     └────────────┬─────────────┘
             │  REST / JSON                    │  REST / JSON
             ▼                                ▼
┌────────────────────────────────────────────────────────────┐
│              Backend  Java (HTTPServer + JDBC)             │
│                http://localhost:8081/api/*                 │
└──────────────┬─────────────────────────────┬───────────────┘
               │  JDBC                       │  HTTPS + webhook
               ▼                             ▼
┌──────────────────────────────┐   ┌──────────────────────────┐
│ PostgreSQL 17 (Docker volume)│   │  Pasarela Wompi (sandbox)│
└──────────────────────────────┘   └──────────────────────────┘
```

| Capa | En cifras |
| :--- | :--- |
| Frontend | 50 rutas en `App.jsx` repartidas entre sitio público, proceso de compra y tres paneles por rol |
| Backend | Manejadores HTTP sobre `ManejadorBase` (CORS, límite de 120 peticiones/min por IP y logs JSON), servicios de aplicación y DAO sobre JDBC, en capas `dominio`, `aplicacion` e `infraestructura` |
| Base de datos | 25 tablas y 20 llaves foráneas en `BASE DE DATOS/01_esquema_espanol.sql`, más la tabla `eventos_pago_wompi` y las columnas de pago de `pedidos`, que el backend agrega al iniciar |

## Características

| Área | Detalle |
| :--- | :--- |
| Tienda | Catálogo con filtros por apartado, proyecto, precio y orden; fichas de tela; reseñas de 1 a 5 estrellas; carrito con cupones. |
| Pagos | Checkout con el widget de Wompi: firma de integridad SHA-256, total recalculado en el backend (IVA 19 % y envío), webhook idempotente y página de confirmación con el estado del pago. |
| Acceso | Registro con autorización de datos personales (Ley 1581 de 2012), inicio de sesión con correo o SSO de Google y Microsoft. El backend valida cada token directamente con el proveedor y usa el correo que este certifica; la cuenta SSO se crea sola la primera vez. |
| Home dinámico | Carrusel, banner global y apartados del inicio (nuevas colecciones, exclusivas, ofertas) editables desde el panel admin. |
| Cliente | Historial y rastreo de pedidos, factura en PDF, tickets de soporte, lista de deseos y calculadora de metraje por proyecto. |
| Vendedor | Edición de precio, stock e imagen de sus telas, gestión de pedidos y alertas de stock bajo. |
| Gestión | Usuarios y roles, moderación de productos, lotes de inventario, mermas, umbrales de stock, cupones, tickets, configuración de marca y analítica de ventas. |
| Roles | Cliente, vendedor y administrador con accesos diferenciados a cada panel. |
| Despliegue | Docker Compose levanta frontend, backend y base de datos con una sola orden. |

## Inicio rápido

### Requisitos

- Docker Engine v24 o superior
- Docker Compose v2 o superior

### Despliegue

```bash
# Clonar el repositorio
git clone https://github.com/Jhonmoreno000/PROYECTO-SENA-TIENDA-TEXTIL-
cd PROYECTO-SENA-TIENDA-TEXTIL-

# Configurar variables de entorno
cp .env.example .env

# Levantar los tres servicios en segundo plano
docker compose up -d
```

### Puertos

| Servicio | Acceso |
| :--- | :--- |
| Frontend de la aplicacion | http://localhost:3001 (Docker) / http://localhost:5173 (Dev) |
| Backend API (REST) | http://localhost:8081 |
| Base de Datos PostgreSQL | localhost:5432 |

### Variables de pagos y SSO

Se definen en el archivo `.env`. Sin ellas la tienda funciona, pero no se puede pagar con Wompi ni entrar con Google o Microsoft.

| Variable | Uso |
| :--- | :--- |
| `WOMPI_PUBLIC_KEY` / `WOMPI_PRIVATE_KEY` | Llaves del comercio en Wompi |
| `WOMPI_INTEGRITY_SECRET` / `WOMPI_EVENTS_SECRET` | Firma de la intención de pago y verificación del webhook |
| `WOMPI_ENV` | `sandbox` (pruebas, sin cobro real) o `production` |
| `VITE_GOOGLE_CLIENT_ID` | Client ID de Google Cloud Console. El backend también lo usa para verificar que cada token de Google fue emitido para esta aplicación |
| `VITE_AZURE_CLIENT_ID` / `VITE_AZURE_TENANT_ID` | Aplicación de Microsoft Entra ID (tenant por defecto: `common`). El backend verifica con este ID los tokens de Microsoft |

> `docker-compose.yml` trae llaves de prueba de Wompi como valor por defecto. Antes de un despliegue real, reemplázalas en el `.env` y no las subas al repositorio.

### Detener y limpiar

```bash
# Detener los contenedores
docker compose down

# Detener y eliminar los datos persistidos (reset total)
docker compose down -v
```

## Credenciales de prueba

Usuarios sembrados en la base de datos para validar los niveles de acceso del software.

| Rol | Correo electronico | Contrasena |
| :--- | :--- | :--- |
| Administrador | `admin@ddtextil.com` | `admin123` |
| Vendedor | `vendedor@ddtextil.com` | `vendedor123` |
| Vendedor | `maria.gonzalez@ddtextil.com` | `vendedor123` |
| Cliente | `cliente@gmail.com` | `cliente123` |

> **Nota:** con los datos iniciales actuales solo funciona la cuenta del administrador. Los hash de vendedor y cliente en `01_esquema_espanol.sql` no corresponden a esas contraseñas, y el botón de acceso rápido "Cliente" llena `cliente@ddtextil.com`, que no existe. Mientras se corrige, ejecuta en la base:
>
> ```sql
> UPDATE usuarios SET contrasena_hash = encode(sha256('vendedor123'), 'hex')
>  WHERE correo IN ('vendedor@ddtextil.com', 'maria.gonzalez@ddtextil.com');
> UPDATE usuarios SET contrasena_hash = encode(sha256('cliente123'), 'hex')
>  WHERE correo = 'cliente@gmail.com';
> ```

## Calidad de Software y Suite de Pruebas Automatizadas

El proyecto implementa los estandares de la norma **ISO/IEC 25010** y las directrices de aseguramiento de calidad del **SENA**. Cuenta con una suite integral de 29 pruebas automatizadas (14 de reglas de negocio textiles y 15 de seguridad y casos extremos):

```bash
# Navegar al directorio del backend
cd "tienda digital de telas/backend-java/conexionPostgres"

# Ejecutar las suites de pruebas automatizadas
java -cp "lib/*;bin" PruebasReglasNegocioTextil
java -cp "lib/*;bin" PruebasSeguridadYBugs
```

### Probes de Observabilidad (Health Checks)
* **Liveness Probe**: `GET http://localhost:8081/health/live`
* **Readiness Probe**: `GET http://localhost:8081/health/ready`
* **Reporte Global**: `GET http://localhost:8081/api/health`

## Portal Central de Documentacion Tecnica

El cuerpo documental oficial del sistema esta estructurado de forma modular en la carpeta `documentacion/`:

* **[Indice General de Documentacion](DOCUMENTACION.md)**
* 01. **[Especificacion de Requerimientos de Software (IEEE 830 y BDD)](documentacion/01-especificacion-requerimientos-ieee830.md)**
* 02. **[Arquitectura de Software, Modelo C4 y Backend Java](documentacion/02-arquitectura-software-c4-y-backend.md)**
* 03. **[Arquitectura del Frontend y Gestion de Roles de Usuario](documentacion/03-arquitectura-frontend-y-roles.md)**
* 04. **[Diseno, Estructura y Esquema de Base de Datos Relacional](documentacion/04-base-de-datos-diseno-y-esquema.md)** | **[Esquema Relacional y Arquitectura MVC](BASE%20DE%20DATOS/README.md)**
* 05. **[Politicas de Seguridad, Resiliencia y Calidad de Software](documentacion/05-politicas-seguridad-resiliencia-y-calidad.md)**
* 06. **[Manual Tecnico de Instalacion, Configuracion y Despliegue](documentacion/06-manual-tecnico-instalacion-y-despliegue.md)**
* 07. **[Motor Textil, Reglas de Negocio y Suite de Pruebas Automatizadas](documentacion/07-motor-textil-reglas-negocio-y-pruebas.md)**
* 08. **[Modelo Entidad-Relacion (DER completo de las 25 tablas)](documentacion/08-modelo-entidad-relacion.md)**
* 09. **[Mapa de Navegacion por Rol](documentacion/09-mapa-de-navegacion.md)**
* 10. **[Casos de Uso](documentacion/10-casos-de-uso.md)**
* 11. **[Diagrama de Clases del Backend](documentacion/11-diagrama-de-clases.md)**
* 12. **[Diagramas de Secuencia](documentacion/12-diagramas-de-secuencia.md)**
* 13. **[Manual de Usuario](documentacion/13-manual-de-usuario.md)**
* **[Contrato de Interfaz OpenAPI v3.0](documentacion/openapi_tienda_textil.yaml)**
* **[Matriz de Requerimientos (RF, RNF y Trazabilidad)](documentacion/Matriz_de_requerimientos_v2.xlsx)**

Version para imprimir: **[Manual de usuario (PDF)](documentacion/pdf/Manual%20de%20usuario%20-%20D%26D%20Textil.pdf)**

---

<div align="center">

<sub>Proyecto formativo SENA · D&D Textil · Calidad ISO/IEC 25010 & DevSecOps</sub>

</div>
