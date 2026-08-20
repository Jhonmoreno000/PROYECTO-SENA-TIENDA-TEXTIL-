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
</p>

<p>
  <img src="https://img.shields.io/github/languages/top/Jhonmoreno000/PROYECTO-SENA-TIENDA-TEXTIL-" />
  <img src="https://img.shields.io/github/languages/count/Jhonmoreno000/PROYECTO-SENA-TIENDA-TEXTIL-" />
  <img src="https://img.shields.io/github/last-commit/Jhonmoreno000/PROYECTO-SENA-TIENDA-TEXTIL-" />
  <img src="https://img.shields.io/github/repo-size/Jhonmoreno000/PROYECTO-SENA-TIENDA-TEXTIL-" />
</p>

</div>

---

## Visión general

Un solo ecosistema que une tienda en línea, paneles de administración y control de inventario. Los tres bloques comparten una misma base de datos y una API REST, de modo que cada cambio en catálogo, reseñas o apartados del inicio se refleja al instante en todas las interfaces.

**Lo esencial en pocas líneas**

- Tienda pública con carrito, reseñas de clientes y apartados dinámicos (nuevas colecciones, telas exclusivas y ofertas).
- Panel administrativo para gestionar usuarios, productos, carrusel, apartados del inicio, inventario, pedidos y facturación.
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
└────────────────────────────┬───────────────────────────────┘
                             │  JDBC
                             ▼
┌────────────────────────────────────────────────────────────┐
│              PostgreSQL 17 (Docker volume)                 │
└────────────────────────────────────────────────────────────┘
```

## Características

| Área | Detalle |
| :--- | :--- |
| Tienda | Catálogo con filtros, fichas de tela, reseñas reales guardadas en base de datos, carrito y checkout. |
| Home dinámico | Carrusel y apartados del inicio (nuevas colecciones, exclusivas, ofertas) editables desde el panel admin. |
| Gestión | Productos, usuarios, inventario por lotes, alertas de stock, pedidos y facturación electrónica con PDF. |
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
| Frontend de la aplicación | http://localhost:3001 |
| Backend API (REST) | http://localhost:8081 |

### Detener y limpiar

```bash
# Detener los contenedores
docker compose down

# Detener y eliminar los datos persistidos (reset total)
docker compose down -v
```

## Credenciales de prueba

Usuarios sembrados en la base de datos para validar los niveles de acceso del software.

| Rol | Correo electrónico | Contraseña |
| :--- | :--- | :--- |
| Cliente | `cliente@ddtextil.com` | `cliente123` |
| Vendedor | `vendedor@ddtextil.com` | `vendedor123` |
| Administrador | `admin@ddtextil.com` | `admin123` |

## Documentación

La documentación técnica completa está centralizada en un único portal:

> [DOCUMENTACION.md](DOCUMENTACION.md)

---

<div align="center">

<sub>Proyecto formativo SENA · D&D Textil</sub>

</div>