# Arquitectura del Proyecto y Principios SOLID

Este documento detalla la infraestructura de carpetas, archivos y cómo se han implementado los principios **SOLID** y el patrón de **Clean Architecture** (Arquitectura Limpia) en el desarrollo de la Tienda Digital de Telas (D&D Textil).

---

## 1. Infraestructura de Carpetas y Archivos

El proyecto está dividido en dos grandes bloques: **Frontend (React)** y **Backend (Java HTTP Server)**.

### Estructura Global
```text
PROYECTO-SENA-TIENDA-TEXTIL
 ┣ backend-java/
 ┃ ┗ conexionPostgres/
 ┃   ┣ lib/                 # Dependencias (.jar como PostgreSQL JDBC y Gson)
 ┃   ┣ src/                 # Código fuente Java (Arquitectura Limpia)
 ┃   ┣ schema_complete.sql  # Script DDL de la Base de Datos PostgreSQL
 ┃   ┗ build.py             # Script de automatización de compilación
 ┣ src/                     # Código fuente Frontend (React + Vite)
 ┃   ┣ components/          # Componentes visuales reutilizables (Cards, Modals)
 ┃   ┣ context/             # Estado global (AuthContext)
 ┃   ┣ pages/               # Vistas principales (Admin Dashboard, Catálogo)
 ┃   ┣ services/            # Servicios de consumo de API interactuando con Java
 ┃   ┗ App.jsx              # Enrutador principal del Frontend
 ┣ CREDENCIALES.md          # Documentación de credenciales de prueba
 ┗ package.json             # Manifiesto de dependencias npm
```

### Anatomía del Backend (Clean Architecture)
El backend en Java ha sido rigurosamente estructurado separando las responsabilidades en capas concretas:

```text
src/
 ┣ domain/                  # Capa 1: Entidades Centrales
 ┃  ┣ models/               # Clases planas (Product, User, Order, Coupon, etc.)
 ┃  ┗ repositories/         # Interfaces (contratos) que definen qué operaciones de DB existen.
 ┣ application/             # Capa 2: Casos de Uso y Lógica de Negocio
 ┃  ┗ services/             # Lógica de aplicación (AuthService), validaciones, encriptación.
 ┣ infrastructure/          # Capa 3: Adaptadores hacia el mundo exterior (HTTP, BD)
 ┃  ┣ api/
 ┃  ┃  ┣ handlers/          # Controladores HTTP (AuthHandler, ProductsHandler)
 ┃  ┃  ┗ ApiServer.java     # Configuración del servidor y enrutamiento principal.
 ┃  ┣ persistence/jdbc/     # DAOs y Repositorios concretos (JdbcUserRepositoryImpl)
 ┃  ┗ config/
 ┃     ┗ Conexion.java      # Singleton de conexión a la Base de Datos.
 ┣ App.java                 # Punto de entrada (main) de la aplicación.
 ┗ MockDataSeeder.java      # Utilidad para poblar la BD con datos iniciales reales.
```

---

## 2. Implementación de los Principios SOLID (Backend)

Durante la reestructuración del backend, se aplicaron rigurosamente los 5 principios de diseño orientado a objetos definidos por Robert C. Martin:

### S - Single Responsibility Principle (Principio de Responsabilidad Única)
*Una clase debe tener una, y solo una, razón para cambiar.*
- **Implementación:** Antes, las clases hacían rutas HTTP, lógica y base de datos simultáneamente. Ahora:
  - `AuthHandler`: **Solo** intercepta la petición HTTP (Request), verifica los headers (CORS), extrae el JSON y arma la respuesta HTTP (Response).
  - `AuthService`: **Solo** contiene lógica de negocio pura (hashear contraseñas con SHA-256, verificar prohibiciones, verificar roles de usuarios).
  - `UserDAO` / `JdbcUserRepositoryImpl`: **Solo** ejecutan queries SQL (`SELECT`, `INSERT`) y mapean la base de datos a objetos Java.

### O - Open/Closed Principle (Principio de Abierto/Cerrado)
*El software debe estar abierto para extensión, pero cerrado para modificación.*
- **Implementación:** El servidor (`ApiServer.java`) está diseñado para agregar nuevas rutas sin tocar el código de los manejadores existentes. Si el día de mañana agregamos un flujo de recuperar con Google (Google Oauth), no destruiremos `AuthService`. En lugar de eso, crearíamos nuevas entidades extendiendo nuestras interfaces de inicio de sesión sin necesidad de reescribir la autenticación que ya validamos y aprobamos.

### L - Liskov Substitution Principle (Principio de Sustitución de Liskov)
*Las clases derivadas deben poder sustituir a sus clases base.*
- **Implementación:** El diseño base de Java Sun HTTP (`HttpHandler`) permite polimorfismo riguroso. Cualquier `Handler` implementado (por ejemplo, `ProductsHandler` o `UsersHandler`) cumple a la perfección el contrato de `handle(HttpExchange exchange)`. Puedes agrupar, enviar a métodos genéricos, o sustituir un controlador por un mock de testing de `HttpHandler` sin que el programa note la diferencia ni provoque fallos.

### I - Interface Segregation Principle (Principio de Segregación de Interfaces)
*Ningún cliente debe verse obligado a depender de métodos que no utiliza.*
- **Implementación:** En un sistema de e-commerce grande, los DAOs pueden tener cientos de métodos. Al usar carpetas como `domain/repositories/`, segregamos las responsabilidades. `UserRepository` expone métodos estrictamente relevantes para usuarios (`findByEmail`, `save`). Un controlador de autenticación accede a `UserRepository` libre del peso del código y métodos de facturación, carritos e inventario con los que nunca va a interactuar.

### D - Dependency Inversion Principle (Principio de Inversión de Dependencia)
*Los módulos de alto nivel no deben depender de módulos de bajo nivel. Ambos deben depender de abstracciones.*
- **Implementación:** Es el pilar fundamental que hemos completado para lograr una arquitectura robusta, enfocado en el archivo `ApiServer.java` y los servicios:
  1. La lógica principal (`AuthService`) **NUNCA** llama a la base de datos PostgreSQL de forma directa.
  2. El servicio depende únicamente de una **Interfaz Abstrácta** llamada `UserRepository`.
  3. En `ApiServer.java`, realizamos la inyección total de dependencias desde "fuera" hacia "adentro":

```java
// 1. Instanciamos la conexión a PostgreSQL (Detalle de Bajo Nivel)
UserRepository userRepository = new JdbcUserRepositoryImpl(); 

// 2. Inyectamos la Interfaz al Servicio de Alto Nivel
// El AuthService recibe el objeto, a él no le importa si es PostgreSQL, MySQL o Mongo.
AuthService authService = new AuthService(userRepository); 

// 3. Inyectamos el servicio al Controlador HTTP final
AuthHandler authHandler = new AuthHandler(authService);
```
- **Resultado:** Si necesitas cambiar tu base de datos actual en PostgreSQL a MongoDB o Firebase, la clase `AuthService` permanece intocable y no colapsará. Simplemente programas un nuevo `MongoUserRepositoryImpl` y lo enchufas en la inyección de dependencias.
