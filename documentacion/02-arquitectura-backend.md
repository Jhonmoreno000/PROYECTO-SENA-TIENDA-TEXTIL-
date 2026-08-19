# Arquitectura del Backend (Java)

Esta sección describe la arquitectura técnica, la organización del código y el diseño de la API del servidor backend.

---

## 1. Diseño Arquitectónico

El backend de **D&D Textil** está desarrollado bajo el estándar **Java 17 (Vanilla Java)** sin utilizar frameworks pesados como Spring Boot. Esto garantiza:
*   **Arranque instantáneo** y consumo de memoria RAM extremadamente bajo.
*   **Transparencia absoluta** en el flujo de ejecución (sin magia ni configuraciones implícitas).
*   **Independencia de dependencias externas** complejas.

El proyecto está diseñado bajo los conceptos de **Clean Architecture** (Arquitectura Limpia) y sigue un patrón de diseño desacoplado en capas lógicas bien definidas.

---

## 2. Estructura de Capas (Directorios)

El código fuente del backend (`backend-java/conexionPostgres/src/`) se divide en tres capas fundamentales:

```text
src/
 ├── domain/                  # Capa de Dominio (Entidades Centrales)
 │    ├── models/               # Modelos POJO (Product, User, Order, etc.)
 │    └── repositories/         # Interfaces abstractas de persistencia de datos.
 ├── application/             # Capa de Aplicación (Casos de Uso)
 │    └── services/             # Lógica de negocio (AuthService, validaciones, encriptación)
 ├── infrastructure/          # Capa de Infraestructura (Adaptadores externos)
 │    ├── api/
 │    │    ├── handlers/          # Controladores HTTP (AuthHandler, ProductsHandler)
 │    │    └── ApiServer.java     # Inicialización del servidor HTTP nativo y enrutador.
 │    ├── persistence/jdbc/     # Implementación concreta de repositorios usando JDBC.
 │    └── config/
 │         └── Conexion.java      # Singleton de conexión a PostgreSQL.
 └── App.java                 # Clase de arranque (main).
```

### 2.1 Dominio (`domain`)
Contiene las entidades centrales de la aplicación (`models`) como objetos Java planos (POJO) independientes de la base de datos o de la red. También expone las interfaces (`repositories`) que definen el contrato que cualquier motor de base de datos debe cumplir.

### 2.2 Aplicación (`application`)
Implementa las reglas de negocio de la plataforma. Por ejemplo, `AuthService` gestiona la autenticación, hashea contraseñas usando SHA-256 e implementa reglas de seguridad e inicio de sesión de manera abstracta.

### 2.3 Infraestructura (`infrastructure`)
*   **Servidor HTTP nativo**: Configura `com.sun.net.httpserver.HttpServer` en `ApiServer.java`, manejando cabeceras de red, CORS (incluyendo respuestas pre-flight `OPTIONS` con código `204 No Content` para navegadores modernos) y enrutando los URIs a los controladores correspondientes.
*   **Controladores (`handlers`)**: Reciben el `HttpExchange` (la petición web), leen los streams de entrada, usan **Gson** para deserializar los JSON a objetos POJO, delegan al servicio correspondiente y devuelven una respuesta JSON con el código de estado HTTP adecuado (200, 400, 401, 500, etc.).
*   **Persistencia JDBC**: Implementaciones físicas de bases de datos utilizando sentencias SQL preparadas (`PreparedStatement`) para evitar inyecciones SQL.

---

## 3. Implementación de Principios SOLID

El diseño del backend aplica estrictamente los principios de diseño orientado a objetos:

*   **S - Single Responsibility (Responsabilidad Única)**: Cada clase tiene un único propósito. Por ejemplo, `ProductsHandler` procesa HTTP, `ProductService` realiza las validaciones comerciales de stock y `JdbcProductRepositoryImpl` maneja exclusivamente consultas SQL.
*   **O - Open/Closed (Abierto/Cerrado)**: El servidor HTTP permite agregar nuevas rutas de red sin necesidad de modificar el código interno de los handlers preexistentes.
*   **L - Liskov Substitution (Sustitución de Liskov)**: Todos los controladores del backend implementan la interfaz estándar de Java `HttpHandler`, de forma que pueden ser intercambiados por mocks para pruebas unitarias sin alterar la estabilidad del servidor.
*   **I - Interface Segregation (Segregación de Interfaces)**: Las interfaces en `repositories` están segregadas por módulo (`UserRepository`, `ProductRepository`, etc.). El código que requiere manipular usuarios no está forzado a depender de métodos de facturación o mermas de inventario.
*   **D - Dependency Inversion (Inversión de Dependencias)**: Los módulos de alto nivel (servicios) no dependen de detalles de bajo nivel (base de datos concreta). Dependen de abstracciones (interfaces de repositorios). La inyección de dependencias se realiza en el arranque en `ApiServer.java`:
    ```java
    UserRepository userRepository = new JdbcUserRepositoryImpl();
    AuthService authService = new AuthService(userRepository);
    AuthHandler authHandler = new AuthHandler(authService);
    ```

---

## 4. Catálogo de Endpoints de la API

La API REST del backend responde en el puerto `8081` (o según se configure por Docker) y cuenta con los siguientes endpoints principales:

| Método | Ruta | Descripción | Rol Mínimo |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/login` | Autenticación de usuario. Devuelve información del usuario. | Público |
| **POST** | `/api/register` | Registro de nuevos clientes. | Público |
| **GET** | `/api/products` | Lista las telas activas del catálogo. | Público |
| **GET** | `/api/products?sellerId=X` | Lista las telas publicadas por un vendedor en específico. | Vendedor |
| **GET** | `/api/products/pending` | Lista productos a la espera de aprobación administrativa. | Administrador |
| **POST** | `/api/products` | Creación de una nueva tela en el catálogo. | Vendedor |
| **PUT** | `/api/products/{id}` | Edición de la información de una tela. | Vendedor / Admin |
| **DELETE** | `/api/products/{id}` | Borrado lógico de un producto (soft delete). | Vendedor / Admin |
| **PUT** | `/api/products/{id}/image` | Subida de imágenes a través de formato Base64. | Vendedor |
| **PUT** | `/api/products/{id}/moderate` | Aprobación o rechazo comercial de un producto. | Administrador |
| **GET** | `/api/users` | Listado general de usuarios registrados. | Administrador |
| **GET** | `/api/orders` | Consulta de facturas y pedidos. | Cliente / Admin |
| **PUT** | `/api/orders/{id}/status` | Modificación del estado del envío del pedido. | Admin / Vendedor |
| **GET** | `/api/coupons` | Listado de cupones promocionales. | Cliente / Admin |
| **POST** | `/api/coupons` | Creación de un nuevo cupón con validación de expiración. | Administrador |
| **PUT** | `/api/coupons/{id}/deactivate`| Desactivación manual de cupones. | Administrador |
| **GET** | `/api/support/tickets` | Consulta de reclamos y soporte técnico. | Cliente / Admin |
| **POST** | `/api/support/tickets` | Apertura de un nuevo ticket de soporte. | Cliente |
| **PUT** | `/api/support/tickets/{id}/status`| Cambio de estado y asignación de prioridad de un ticket.| Administrador |
