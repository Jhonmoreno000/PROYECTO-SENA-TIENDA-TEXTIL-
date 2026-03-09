
# Backend - D&D Textil

Este directorio contiene la estructura y documentación para el backend de la aplicación, preparado para ser implementado con **Java Spring Boot**.

## Arquitectura Propuesta

Se recomienda una **Arquitectura Hexagonal (Puertos y Adaptadores)** para desacoplar la lógica de negocio de los detalles de infraestructura.

### Estructura de Directorios Sugerida

```
src/main/java/com/ddtextil/
├── application/           # Casos de uso
│   ├── ports/            # Interfaces (Puertos de entrada/salida)
│   └── services/         # Implementación de servicios
├── domain/               # Entidades y Lógica de Negocio pura
│   ├── model/
│   └── service/
├── infrastructure/       # Adaptadores
│   ├── config/           # Configuración de Spring
│   ├── persistence/      # Repositorio (JPA/Hibernate)
│   └── rest/            # Controladores REST (Adaptador de entrada)
└── DdTextilApplication.java
```

## Tecnologías

- **Java 17+**
- **Spring Boot 3.x**
- **Spring Security** (JWT Authentication)
- **PostgreSQL** (Base de datos relacional)
- **Maven** o **Gradle**

##  API Endpoints (Draft)

Los endpoints están definidos en `api-definition.yaml` siguiendo la especificación 

### Auth
- `POST /api/auth/login`
- `POST /api/auth/register`

### Productos
- `GET /api/products` (Público)
- `GET /api/products/{id}` (Público)
- `POST /api/products` (Admin/Seller)
- `PUT /api/products/{id}` (Admin/Seller)

### Pedidos
- `POST /api/orders` (Cliente)
- `GET /api/orders/my-orders` (Cliente)
- `GET /api/orders` (Admin)

##  Seguridad

El sistema utilizará autenticación basada en tokens **JWT (JSON Web Tokens)**.
- El frontend enviará el token en el header `Authorization: Bearer <token>`.
- Roles: `ROLE_CLIENT`, `ROLE_SELLER`, `ROLE_ADMIN`.

##  Base de Datos (Esquema Preliminar)

**Users**
- id (UUID)
- email (unique)
- password_hash
- role
- full_name

**Products**
- id (UUID)
- name
- price
- stock
- category_id
- seller_id (FK)

**Orders**
- id (UUID)
- user_id (FK)
- total_amount
- status (PENDING, PAID, SHIPPED, DELIVERED)
- created_at
