# Arquitectura de Software, Modelo C4 y Backend Java
**Proyecto:** Plataforma Distribuida de Comercializacion y Control Logistico Textil (D&D Textil)  
**Programa de Formacion:** Tecnologo en Analisis y Desarrollo de Software (ADSO) - SENA  
**Estandares:** Clean Architecture, Domain-Driven Design (DDD), Modelo C4 (Simon Brown), Principios SOLID  
**Version:** 2.0.0 - Documentacion Tecnica Oficial  

---

## 1. Vision General del Backend

El backend de **D&D Textil** es un servicio corporativo desarrollado en **Java 17 (Vanilla Java)** de alto rendimiento, disenado especificamente para eliminar la sobrecarga de memoria y dependencias de marcos de trabajo pesados como Spring Boot o Jakarta EE. 

### Caracteristicas Fundamentales del Diseno:
1. **Servidor HTTP Embebido de Alto Rendimiento:** Utiliza `com.sun.net.httpserver.HttpServer` configurado con un **Pool de Hilos Concurrente** (`Executors.newFixedThreadPool`) con un minimo de 32 hilos y escalable segun los nucleos de procesamiento (`Runtime.getRuntime().availableProcessors() * 8`). Esto garantiza la atencion simultanea de cientos de peticiones sin congelamiento de sockets.
2. **Pool de Conexiones JDBC con HikariCP:** Administra las conexiones fisicas hacia PostgreSQL mediante la libreria de alto rendimiento **HikariCP**, asegurando tiempos de obtencion de conexion inferiores a 5 milisegundos y liberacion automatica mediante bloques `try-with-resources`.
3. **Serializacion y Deserializacion JSON Segura:** Utiliza **Google Gson** para la transformacion bidireccional entre payloads JSON y modelos POJO del dominio, con anotaciones `@SerializedName` que garantizan compatibilidad bilingue y desacoplamiento de nombres de red.
4. **Arquitectura Limpia (Clean Architecture) Hibrida:** El codigo se organiza en tres capas independientes (**Dominio**, **Aplicacion** e **Infraestructura**), aplicando estrictamente el principio de inversion de dependencias para que las reglas de negocio no dependan de la base de datos ni del transporte HTTP.

---

## 2. Estructura Exhaustiva de Capas y Paquetes

La distribucion fisica del codigo fuente en `tienda digital de telas/backend-java/servidor-api/src/` se estructura de la siguiente manera:

```text
src/
 |
 +-- dominio/
 |    +-- modelos/                    # Entidades puras y objetos de valor
 |    |    +-- RolloTextil.java       # Entidad de trazabilidad por rollo fisico y tintoreria
 |    |    +-- Producto.java          # Ficha tecnica textil (precio, gramaje, ancho, stock)
 |    |    +-- Usuario.java           # Cuenta de usuario con rol RBAC, estado y comisiones
 |    |    +-- Pedido.java            # Encabezado de pedido comercial y estados de pago
 |    |    +-- LoteInventario.java    # Lote de compra a proveedores de tejeduria
 |    |    +-- EventoMerma.java       # Registro de retazos liquidados y mermas tecnicas
 |    |    +-- Cupon.java             # Reglas de cupones de descuento (porcentaje o fijo)
 |    |    +-- ItemCarrito.java       # Items temporales vinculados al carrito de compra
 |    |    +-- Resena.java            # Calificaciones y comentarios de clientes
 |    |    +-- TicketSoporte.java     # Reclamos de garantia y devoluciones
 |    |    +-- UmbralStock.java       # Alertas minimas de metros por categoria
 |    |    +-- ReporteError.java      # Reportes de incidencias tecnicas
 |    |    +-- DiapositivaCarrusel.java # Banners del carrusel dinamico de la tienda
 |    |    +-- SeccionInicio.java     # Secciones modulares de la pagina principal
 |    |    +-- BannerGlobal.java      # Barra de anuncios superior configurable
 |    |    +-- VentaDiaria.java       # Consolidado de ventas diarias para graficos
 |    |    +-- VentaRegion.java       # Distribucion porcentual de despachos por departamento
 |    |    +-- ActividadReciente.java # Pistas de auditoria administrativa
 |    +-- repositorios/               # Interfaces abstractas de persistencia
 |    |    +-- RepositorioUsuario.java # Contrato de persistencia de usuarios
 |    +-- excepciones/                # Excepciones de negocio
 |         +-- ExcepcionDominio.java  # Excepcion controlada para violacion de reglas
 |
 +-- aplicacion/
 |    +-- servicios/                  # Casos de uso y logica de negocio
 |         +-- ServicioCorteTextil.java  # Motor de validacion continua, mermas y tarifas
 |         +-- ServicioAutenticacion.java # Hasheo SHA-256 en UTF-8 y validacion de roles
 |         +-- ServicioFactura.java       # Generador de representacion XML simulada
 |
 +-- infraestructura/
 |    +-- configuracion/
 |    |    +-- Conexion.java          # Inicializacion del Pool HikariCP y driver PostgreSQL
 |    +-- persistencia/jdbc/          # Acceso a datos relacionales (DAOs)
 |    |    +-- JdbcRepositorioUsuarioImpl.java # Implementacion del contrato RepositorioUsuario
 |    |    +-- UsuarioDAO.java        # Consultas SQL para gestion de usuarios
 |    |    +-- ProductoDAO.java       # Consultas y persistencia de telas e imagenes
 |    |    +-- PedidoDAO.java         # Transacciones atomicas con SELECT FOR UPDATE
 |    |    +-- InventarioDAO.java     # Gestion de lotes, mermas y rollos fisicos
 |    |    +-- CarritoDAO.java        # Persistencia de items de carrito por usuario
 |    |    +-- CuponDAO.java          # Validacion de codigos promocionales
 |    |    +-- SoporteDAO.java        # Administracion de tickets de reclamos
 |    |    +-- ResenasDAO.java        # Persistencia de calificaciones
 |    |    +-- CarruselDAO.java       # Gestion de diapositivas
 |    |    +-- SeccionesInicioDAO.java # Configuracion de secciones dinamicas
 |    |    +-- ConfiguracionDAO.java  # Parametros globales del sistema
 |    +-- api/
 |         +-- ServidorApi.java       # Servidor HTTP central, enrutamiento y DI manual
 |         +-- manejadores/           # Controladores de endpoints REST
 |              +-- ManejadorBase.java              # Filtros comunes: RateLimit, CORS, CorrelationId
 |              +-- ManejadorAutenticacion.java     # POST /api/login, /api/register
 |              +-- ManejadorProductos.java         # GET/POST/PUT/DELETE /api/products
 |              +-- ManejadorPedidos.java           # GET/POST /api/orders, actualizacion de estados
 |              +-- ManejadorCarrito.java           # GET/POST/DELETE /api/cart
 |              +-- ManejadorCupones.java           # GET/POST /api/cupones, validacion
 |              +-- ManejadorInventario.java        # GET/POST /api/inventory, lotes, mermas
 |              +-- ManejadorUsuarios.java          # GET/PUT /api/users, suspension, activacion
 |              +-- ManejadorSoporte.java           # GET/POST /api/support, tickets y bugs
 |              +-- ManejadorResenas.java           # GET/POST /api/reviews
 |              +-- ManejadorCarrusel.java          # GET/POST/PUT/DELETE /api/carousel
 |              +-- ManejadorSeccionesInicio.java   # GET/POST/PUT /api/home-sections
 |              +-- ManejadorConfiguracion.java     # GET/POST /api/settings
 |              +-- ManejadorArchivosEstaticos.java # GET /uploads/* con prevencion path traversal
 |              +-- ManejadorSalud.java             # GET /health/live, /health/ready
 |
 +-- App.java                         # Punto de entrada de la aplicacion
 +-- SembradorDatosPrueba.java         # Sembrador automatico de datos y contrasenas SHA-256
 +-- PruebasReglasNegocioTextil.java  # Suite de pruebas unitarias (14 pruebas)
 +-- PruebasSeguridadIntegridad.java       # Suite de pruebas de seguridad y concurrencia (12 pruebas)
```

---

## 3. Modelo C4 - Diagramas de Arquitectura

### 3.1. Nivel 1: Diagrama de Contexto del Sistema

A continuación se presenta el **Diagrama de Contexto (Nivel 1)** del Ecosistema D&D Textil, organizado formalmente con delimitación de límites, roles de usuario, plataforma central y servicios externos integrados:

```mermaid
flowchart TD
    classDef personStyle fill:#08427B,stroke:#052e56,stroke-width:2px,color:#ffffff,font-family:sans-serif;
    classDef coreSystem fill:#1168BD,stroke:#0b4884,stroke-width:2px,color:#ffffff,font-family:sans-serif;
    classDef extSystem fill:#4B5563,stroke:#374151,stroke-width:2px,color:#ffffff,font-family:sans-serif;

    subgraph Actores ["Actores del Sistema (Usuarios)"]
        direction LR
        cliente["Cliente / Confeccionista<br/><b>[Persona]</b><br/>Consulta catálogo textil, calcula metrajes,<br/>realiza compras fraccionadas y rastrea envíos."]:::personStyle
        vendedor["Asesor Comercial / Vendedor<br/><b>[Persona]</b><br/>Publica telas en catálogo, monitorea inventario<br/>y analiza comisiones y métricas."]:::personStyle
        operario["Operario de Mesa de Corte<br/><b>[Persona]</b><br/>Escanea órdenes de corte QR, ejecuta cortes<br/>físicos y registra retazos y mermas."]:::personStyle
        admin["Administrador del Sistema<br/><b>[Persona]</b><br/>Monitorea finanzas, modera catálogo,<br/>gestiona cupones y audita seguridad."]:::personStyle
    end

    subgraph Plataforma ["Plataforma Central"]
        sistemaTextil["Ecosistema D&D Textil<br/><b>[Sistema de Software]</b><br/>Plataforma web y móvil para comercialización textil,<br/>reserva concurrente de rollos físicos y gestión logística."]:::coreSystem
    end

    subgraph Externos ["Sistemas Externos"]
        direction LR
        pasarelaPagos["Pasarela de Pagos (Wompi Bancolombia / PSE)<br/><b>[Sistema Externo]</b><br/>Procesa pagos seguros con tarjeta y transferencias;<br/>notifica confirmación mediante Webhooks SHA-256."]:::extSystem
        servicioMensajeria["Servicio de Notificaciones (Twilio / SendGrid)<br/><b>[Sistema Externo]</b><br/>Transmite correos electrónicos y mensajes SMS<br/>con órdenes de corte y guías de despacho."]:::extSystem
    end

    cliente -->|"1. Navega catálogo, compra telas y radica tickets<br/>[HTTPS / JSON]"| sistemaTextil
    vendedor -->|"2. Publica telas y gestiona inventario<br/>[HTTPS / JSON]"| sistemaTextil
    operario -->|"3. Confirma cortes físicos y registra mermas<br/>[App Móvil / HTTPS]"| sistemaTextil
    admin -->|"4. Supervisa transacciones, finanzas y usuarios<br/>[HTTPS / JSON]"| sistemaTextil

    sistemaTextil -->|"5. Solicita cobros y procesa confirmaciones<br/>[HTTPS REST / Webhooks]"| pasarelaPagos
    sistemaTextil -->|"6. Envía notificaciones de corte y despacho<br/>[API REST Asíncrona]"| servicioMensajeria
```

---

### 3.2. Nivel 2: Diagrama de Contenedores

A continuación se ilustra la interacción entre los contenedores de software que conforman el ecosistema (SPA en React, App Móvil en Android/Kotlin, Backend en Java 17, Base de Datos PostgreSQL 17 y Almacenamiento Multimedia):

```mermaid
flowchart TD
    classDef actorStyle fill:#08427B,stroke:#052e56,stroke-width:2px,color:#ffffff,font-family:sans-serif;
    classDef containerStyle fill:#1168BD,stroke:#0b4884,stroke-width:2px,color:#ffffff,font-family:sans-serif;
    classDef dbStyle fill:#1e3a8a,stroke:#172554,stroke-width:2px,color:#ffffff,font-family:sans-serif;
    classDef extStyle fill:#4B5563,stroke:#374151,stroke-width:2px,color:#ffffff,font-family:sans-serif;

    subgraph Usuarios ["Capa de Usuarios"]
        direction LR
        userWeb["Clientes, Vendedores y Administradores<br/><b>[Navegadores de Escritorio / Móviles]</b>"]:::actorStyle
        userBodega["Operarios de Mesa de Corte<br/><b>[Dispositivos Móviles / Tablets en Bodega]</b>"]:::actorStyle
    end

    subgraph CapaPresentacion ["1. Capa de Presentación (Frontend & Móvil)"]
        direction LR
        frontendWeb["Single Page Application (SPA)<br/><b>[React 18 + Vite + TailwindCSS]</b><br/>Interfaz reactiva con catálogo interactivo,<br/>simulador de metraje, carrito y paneles de rol.<br/><i>Puerto 5173 / 3001</i>"]:::containerStyle
        appMovil["Aplicación Móvil Bodega<br/><b>[Android / Kotlin + WebView]</b><br/>Cliente optimizado con lector QR para mesa de corte<br/>y confirmación física de fraccionamiento."]:::containerStyle
    end

    subgraph CapaLogica ["2. Capa de Lógica de Negocio (Backend)"]
        backendApi["Backend Java Corporativo<br/><b>[Java 17 Vanilla + HttpServer]</b><br/>Servidor HTTP con pool concurrente de 32 hilos,<br/>Clean Architecture, motor de corte textil y autenticación SHA-256.<br/><i>Puerto 8081</i>"]:::containerStyle
    end

    subgraph CapaPersistencia ["3. Capa de Almacenamiento y Datos"]
        direction LR
        postgresDb[("Base de Datos Relacional<br/><b>[PostgreSQL 17]</b><br/>25 tablas normalizadas en 3FN, transacciones ACID,<br/>bloqueos pesimistas SELECT FOR UPDATE e índices B-Tree.<br/><i>Puerto 5432</i>")]:::dbStyle
        volumenUploads[("Almacenamiento Multimedia<br/><b>[Volumen Persistente Docker]</b><br/>Persistencia en disco de imágenes de telas y recibos.<br/><i>Ruta: /app/uploads</i>")]:::dbStyle
    end

    subgraph CapaIntegraciones ["4. Servicios Externos Integrados"]
        direction LR
        pasarelaWompi["Pasarela de Pagos (Wompi Bancolombia)<br/><b>[Servicio Externo]</b><br/>Cobro seguro con tarjetas/PSE y webhooks."]:::extStyle
        notificaciones["Servicio de Notificaciones<br/><b>[Servicio Externo]</b><br/>SendGrid / Twilio para correos y SMS."]:::extStyle
    end

    userWeb -->|"Interactúa vía interfaz web<br/>[HTTPS]"| frontendWeb
    userBodega -->|"Escanea códigos QR en rollos<br/>[HTTPS]"| appMovil

    frontendWeb -->|"Peticiones HTTP REST<br/>[JSON / HTTPS con CORS]"| backendApi
    appMovil -->|"Lecturas de corte y mermas<br/>[JSON / HTTPS]"| backendApi

    backendApi -->|"Consultas relacionales y reservas atómicas<br/>[JDBC / Pool HikariCP]"| postgresDb
    backendApi -->|"Lectura y escritura de fotografías<br/>[I/O Sistema de Archivos]"| volumenUploads

    backendApi -->|"Solicitudes de pago y validación de firma<br/>[HTTPS REST]"| pasarelaWompi
    backendApi -->|"Envío de guías y alertas automáticas<br/>[API REST Asíncrona]"| notificaciones
```

---

### 3.3. Nivel 3: Diagrama de Componentes (Modulo de Inventario y Corte Textil)

A continuación se detalla la arquitectura de componentes interna del Backend Java, reflejando estrictamente la separación de responsabilidades de **Clean Architecture** (Infraestructura HTTP, Casos de Uso, Entidades de Dominio, Persistencia JDBC y Base de Datos):

```mermaid
flowchart TD
    classDef httpStyle fill:#1e3a8a,stroke:#3b82f6,stroke-width:2px,color:#ffffff,font-family:sans-serif;
    classDef appStyle fill:#065f46,stroke:#10b981,stroke-width:2px,color:#ffffff,font-family:sans-serif;
    classDef domainStyle fill:#581c87,stroke:#a855f7,stroke-width:2px,color:#ffffff,font-family:sans-serif;
    classDef daoStyle fill:#7c2d12,stroke:#f97316,stroke-width:2px,color:#ffffff,font-family:sans-serif;
    classDef dbStyle fill:#0f172a,stroke:#64748b,stroke-width:2px,color:#ffffff,font-family:sans-serif;

    subgraph CapaHTTP ["1. Capa de Infraestructura HTTP (Controladores REST)"]
        direction TB
        ManejadorBase["ManejadorBase<br/>• RateLimiting (120 req/min)<br/>• Validación CORS y Encabezados<br/>• Filtro X-Correlation-ID"]:::httpStyle
        
        subgraph HandlersEspecializados ["Manejadores Especializados (Extienden ManejadorBase)"]
            direction LR
            ManejadorAuth["ManejadorAutenticacion<br/>(/api/login, /api/register)"]:::httpStyle
            ManejadorProd["ManejadorProductos<br/>(/api/products, filtros)"]:::httpStyle
            ManejadorPed["ManejadorPedidos<br/>(/api/orders, checkout)"]:::httpStyle
            ManejadorInv["ManejadorInventario<br/>(/api/inventory, rollos, mermas)"]:::httpStyle
        end
        HandlersEspecializados -.->|Heredan control| ManejadorBase
    end

    subgraph CapaAplicacion ["2. Capa de Aplicación (Servicios y Casos de Uso)"]
        direction LR
        ServicioAuth["ServicioAutenticacion<br/>• hashearContrasena()<br/>• validarCredenciales()"]:::appStyle
        ServicioCorte["ServicioCorteTextil<br/>• validarMetrajeContinuo()<br/>• procesarCorteYRemanente()<br/>• calcularTarifaEscalonada()"]:::appStyle
        ServicioWompi["ServicioCriptoWompi<br/>• generarFirmaIntegridad()<br/>• validarChecksumWebhook()"]:::appStyle
        ServicioFac["ServicioFactura<br/>• generarFacturaXmlSimulada()"]:::appStyle
    end

    subgraph CapaDominio ["3. Capa de Dominio (Entidades de Negocio Puras)"]
        direction LR
        Rollo["RolloTextil<br/>(codigo, metros, lote_tintoreria)"]:::domainStyle
        Producto["Producto<br/>(precio, ancho, peso, stock)"]:::domainStyle
        Pedido["Pedido<br/>(items, total, estado_pago)"]:::domainStyle
        Merma["EventoMerma<br/>(metros_perdidos, motivo, costo)"]:::domainStyle
    end

    subgraph CapaPersistencia ["4. Capa de Persistencia (DAOs y Pool HikariCP)"]
        direction LR
        UsuarioDAO["UsuarioDAO<br/>(Cuentas RBAC)"]:::daoStyle
        ProductoDAO["ProductoDAO<br/>(Fichas Textiles)"]:::daoStyle
        PedidoDAO["PedidoDAO<br/>(Transacciones Atómicas)"]:::daoStyle
        InventarioDAO["InventarioDAO<br/>(Rollos y Lotes)"]:::daoStyle
        PagoWompiDAO["PagoWompiDAO<br/>(Auditoría Webhooks)"]:::daoStyle
        ConexionPool[("Conexion (HikariCP)<br/>Pool de 20 conexiones")]:::daoStyle
    end

    subgraph MotorPostgres ["5. Base de Datos"]
        PostgresDB[("PostgreSQL 17<br/>Bloqueo SELECT FOR UPDATE")]:::dbStyle
    end

    %% Invocaciones entre capas
    ManejadorAuth -->|Invoca| ServicioAuth
    ManejadorProd -->|Consulta catálogo| ProductoDAO
    ManejadorPed -->|Ejecuta validación y corte| ServicioCorte
    ManejadorPed -->|Calcula firma y valida pago| ServicioWompi
    ManejadorPed -->|Genera XML| ServicioFac
    ManejadorInv -->|Aplica reglas de fraccionamiento| ServicioCorte

    ServicioCorte -->|Manipula ciclo de vida| Rollo
    ServicioCorte -->|Genera registro| Merma
    ServicioCorte -->|Actualiza metros| InventarioDAO
    ServicioAuth -->|Consulta usuarios| UsuarioDAO
    ServicioWompi -->|Registra evento con Savepoint| PagoWompiDAO

    ManejadorPed -->|Persiste orden y detalle| PedidoDAO

    UsuarioDAO --> ConexionPool
    ProductoDAO --> ConexionPool
    PedidoDAO --> ConexionPool
    InventarioDAO --> ConexionPool
    PagoWompiDAO --> ConexionPool

    ConexionPool -->|Sentencias SQL Preparadas| PostgresDB
```

---

### 3.4. Nivel 4: Diagrama de Despliegue del Sistema (Mapa de Despliegue)

A continuación se ilustra la **Topología Física y de Red del Despliegue**, detallando los nodos de hardware, contenedores Docker, puertos de comunicación, políticas de aislamiento y servicios en la nube:

```mermaid
flowchart TD
    classDef clientNode fill:#08427B,stroke:#052e56,stroke-width:2px,color:#ffffff,font-family:sans-serif;
    classDef hostNode fill:#0f172a,stroke:#334155,stroke-width:2px,color:#ffffff,font-family:sans-serif;
    classDef containerNode fill:#1168BD,stroke:#0b4884,stroke-width:2px,color:#ffffff,font-family:sans-serif;
    classDef dbNode fill:#1e3a8a,stroke:#172554,stroke-width:2px,color:#ffffff,font-family:sans-serif;
    classDef volNode fill:#d97706,stroke:#b45309,stroke-width:2px,color:#ffffff,font-family:sans-serif;
    classDef cloudNode fill:#4B5563,stroke:#374151,stroke-width:2px,color:#ffffff,font-family:sans-serif;

    subgraph DispositivosClientes ["1. Nodos de Cliente y Dispositivos de Acceso"]
        direction LR
        cliWeb["PC / Portátil Cliente<br/><b>[Navegador Web: Chrome/Firefox/Safari]</b><br/>React 18 SPA, Catálogo interactivo,<br/>simulador de metraje y Checkout."]:::clientNode
        cliMovil["Smartphone Cliente / Operario<br/><b>[Navegador Móvil / App Android]</b><br/>Android WebView + Kotlin con<br/>escaneo de códigos QR en bodega."]:::clientNode
        cliAdmin["Terminal Administrativa<br/><b>[Navegador de Gestión]</b><br/>Paneles ERP, analítica comercial,<br/>gestión de inventario y moderación."]:::clientNode
    end

    subgraph HostDocker ["2. Servidor Host de Aplicación (Docker Host / VPS / Cloud)"]
        direction TB

        subgraph RedFrontend ["RED DOCKER: frontend-net (Bridge Público - Puertos 5173 / 3001)"]
            contFrontend["Contenedor: frontend<br/><b>[Node 18 / Nginx Alpine]</b><br/>Sirve la Single Page Application (SPA React 18 / Vite).<br/><i>Puerto Expuesto al Host: 5173:5173</i>"]:::containerNode
        end

        subgraph RedBackend ["RED DOCKER: backend-net (Bridge Interno Defensivo Aislado)"]
            direction TB
            contBackend["Contenedor: backend-java<br/><b>[OpenJDK 17 Slim]</b><br/>Vanilla Java 17 HttpServer (Pool 32 Hilos Concurrentes)<br/>Clean Architecture, motor de corte textil y firma criptográfica.<br/><i>Puerto Expuesto al Host: 8081:8081</i>"]:::containerNode

            contPostgres[("Contenedor: postgres<br/><b>[PostgreSQL 17 Alpine]</b><br/>25 tablas relacionales 3FN, transacciones ACID,<br/>bloqueos pesimistas SELECT FOR UPDATE e índices B-Tree.<br/><i>Puerto Interno: 5432 (Sin exposición externa)</i>")]:::dbNode
        end

        subgraph AlmacenamientoPersistente ["Volúmenes Persistentes de Host"]
            direction LR
            volData[("postgres_data<br/>Persistencia física de base de datos<br/>/var/lib/postgresql/data")]:::volNode
            volUploads[("uploads_media<br/>Fotografías de telas y comprobantes Base64/PNG<br/>/app/uploads")]:::volNode
        end
    end

    subgraph ServiciosNube ["3. Servicios Externos e Infraestructura Cloud"]
        direction TB
        wompiCloud["Pasarela de Pagos Wompi Bancolombia<br/><b>[Servidor Externo PCI-DSS]</b><br/>Procesamiento de pagos con tarjetas y PSE.<br/>Callbacks y Webhooks firmados con SHA-256."]:::cloudNode
        ssoCloud["Proveedores de Identidad (SSO)<br/><b>[Google Cloud & Microsoft Entra ID]</b><br/>Autenticación federada OAuth 2.0 / OpenID Connect."]:::cloudNode
        notifCloud["Pasarela de Notificaciones Transaccionales<br/><b>[SendGrid Email & Twilio SMS]</b><br/>Envío de facturas por correo y alertas de despacho SMS."]:::cloudNode
    end

    %% Enlaces clientes a host
    cliWeb -->|"HTTPS (Puerto 5173 / 443)"| contFrontend
    cliMovil -->|"HTTPS (Puerto 5173 / 443)"| contFrontend
    cliAdmin -->|"HTTPS (Puerto 5173 / 443)"| contFrontend

    %% Enlace entre frontend y backend
    contFrontend -->|"HTTP REST / JSON (Puerto 8081)<br/>[frontend-net con CORS]"| contBackend
    cliMovil -->|"Lecturas QR directo a API (Puerto 8081)"| contBackend

    %% Enlace backend a persistencia
    contBackend -->|"JDBC HikariCP (Puerto 5432)<br/>[backend-net aislado]"| contPostgres
    contBackend --- volUploads
    contPostgres --- volData

    %% Enlaces a la nube
    contFrontend -->|"Autenticación SSO (OAuth 2.0)"| ssoCloud
    contBackend -->|"Intención de cobro y validación de firma"| wompiCloud
    wompiCloud -->|"Webhook POST /api/pagos/wompi/webhook"| contBackend
    contBackend -->|"Despacho de correos y SMS"| notifCloud
```

---

### 3.5. Diagrama de Comunicación del Sistema con el Cliente (Flujo Omnicanal e Interacción)

A continuación se detalla el **Flujo de Comunicación Integral entre el Cliente y el Ecosistema**, cubriendo el ciclo de vida completo: navegación en catálogo, cálculo de metrajes, autenticación SSO, pago seguro en Wompi, confirmación transaccional y seguimiento postventa:

#### 3.5.1. Canales de Comunicación y Puntos de Contacto

```mermaid
flowchart TD
    classDef clienteStyle fill:#08427B,stroke:#052e56,stroke-width:2px,color:#ffffff,font-family:sans-serif;
    classDef canalStyle fill:#0284c7,stroke:#0369a1,stroke-width:2px,color:#ffffff,font-family:sans-serif;
    classDef sistemaStyle fill:#1168BD,stroke:#0b4884,stroke-width:2px,color:#ffffff,font-family:sans-serif;
    classDef salidaStyle fill:#059669,stroke:#047857,stroke-width:2px,color:#ffffff,font-family:sans-serif;

    Cliente["Cliente / Confeccionista"]:::clienteStyle

    subgraph CanalesEntrada ["Canales de Interacción Cliente &rarr; Sistema"]
        CanalWeb["Plataforma Web SPA (React 18)<br/>Catálogo, Carrito, Simulador y Checkout"]:::canalStyle
        CanalSSO["Autenticación Federada SSO<br/>Inicio de sesión con Google / Microsoft"]:::canalStyle
        CanalWidget["Widget Wompi Seguro (iFrame)<br/>Captura de tarjetas y PSE sin intermediarios"]:::canalStyle
    end

    subgraph NucleoDAndD ["Núcleo Transaccional D&D Textil"]
        BackendJava["Backend Java 17 + PostgreSQL 17<br/>Validación continua de metraje, transacciones ACID<br/>y orquestación de pedidos"]:::sistemaStyle
    end

    subgraph CanalesSalida ["Canales de Comunicación Sistema &rarr; Cliente (Notificaciones)"]
        CanalEmail["Correo Electrónico (SendGrid / SMTP)<br/>• Confirmación de pedido y resumen de metraje<br/>• Factura comercial XML simulada"]:::salidaStyle
        CanalSMS["Mensajería Celular (Twilio SMS / WhatsApp)<br/>• Alerta de rollo en corte<br/>• Número de guía de transporte nacional"]:::salidaStyle
        CanalTracking["Portal de Rastreo en Línea (/cliente/rastreo)<br/>• Línea de tiempo interactiva en tiempo real<br/>• Estados: pending &rarr; cutting &rarr; shipped &rarr; delivered"]:::salidaStyle
        CanalSoporte["Módulo de Garantías (/cliente/soporte)<br/>• Radicación y seguimiento de tickets postventa"]:::salidaStyle
    end

    Cliente -->|"1. Navegación, selección y compra"| CanalWeb
    Cliente -->|"2. Autenticación rápida"| CanalSSO
    Cliente -->|"3. Transacción bancaria segura"| CanalWidget

    CanalWeb -->|"Peticiones HTTP REST"| BackendJava
    CanalSSO -->|"Token validado"| BackendJava
    CanalWidget -->|"Webhook firmado SHA-256"| BackendJava

    BackendJava -->|"4. Emisión de comprobantes"| CanalEmail
    BackendJava -->|"5. Alertas de despacho"| CanalSMS
    BackendJava -->|"6. Sincronización de estados"| CanalTracking
    BackendJava -->|"7. Gestión de reclamos"| CanalSoporte

    CanalEmail -.->|"Recepción en bandeja de entrada"| Cliente
    CanalSMS -.->|"Mensaje en dispositivo móvil"| Cliente
    CanalTracking -.->|"Consulta en navegador"| Cliente
    CanalSoporte -.->|"Resolución de garantías"| Cliente
```

---

#### 3.5.2. Diagrama de Secuencia de Comunicación Transaccional y Postventa

```mermaid
sequenceDiagram
    autonumber
    actor Cliente as Cliente / Confeccionista
    participant UI as SPA React 18 (Frontend Web / Móvil)
    participant Auth as Proveedor SSO / Auth (Google/Microsoft)
    participant API as Backend Java (ServidorApi / Handlers)
    participant Wompi as Pasarela Wompi Bancolombia
    participant DB as PostgreSQL 17 (Transacciones ACID)
    participant Notif as Servicio de Notificaciones (Email & SMS)

    %% FASE 1: Exploración y Cálculo
    rect rgb(240, 248, 255)
    Note over Cliente, API: FASE 1: Descubrimiento, Catálogo y Simulación de Metraje
    Cliente->>UI: Navega catálogo y abre Calculadora de Metraje
    UI->>API: GET /api/products (Filtro por fibra, ancho, gramaje)
    API-->>UI: Listado de telas disponibles y metros en stock
    UI-->>Cliente: Visualización interactiva y cálculo de tela (+10% margen técnico)
    end

    %% FASE 2: Autenticación
    rect rgb(245, 245, 250)
    Note over Cliente, Auth: FASE 2: Identificación y Autenticación Segura (SSO / Directa)
    Cliente->>UI: Clic en "Iniciar Sesión"(Google / Microsoft / Email)
    UI->>Auth: Redirección OAuth 2.0 / OpenID Connect
    Auth-->>UI: Retorno con Token de Acceso
    UI->>API: POST /api/login (Validación de credenciales / perfil SSO)
    API-->>UI: Token de sesión emitido y perfil cargado en AuthContext
    end

    %% FASE 3: Compra y Pasarela
    rect rgb(255, 250, 240)
    Note over Cliente, Wompi: FASE 3: Checkout y Transacción Bancaria con Wompi
    Cliente->>UI: Clic en "Finalizar Compra"en /checkout
    UI->>API: POST /api/pagos/intencion (Items, metros y datos de envío)
    API->>DB: Validar stock continuo y calcular total en servidor
    API-->>UI: Respuesta con Referencia, Monto en centavos y Firma SHA-256
    UI->>Wompi: Apertura del Widget oficial de Wompi (Checkout iFrame Seguro)
    Cliente->>Wompi: Ingresa medio de pago (Tarjeta de Crédito / Transferencia PSE)
    Wompi-->>Cliente: Notificación inmediata de procesamiento bancario
    end

    %% FASE 4: Confirmación y Webhook
    rect rgb(240, 255, 240)
    Note over Wompi, DB: FASE 4: Confirmación Asíncrona Webhook y Descuento de Inventario
    Wompi->>API: Webhook POST /api/pagos/wompi/webhook (Estado: APPROVED, Firma SHA-256)
    API->>API: Validar Checksum criptográfico (MessageDigest.isEqual)
    API->>DB: Iniciar Transacción con Bloqueo SELECT ... FOR UPDATE en Rollo
    API->>DB: Descontar metraje físico, actualizar pedido a 'cutting' y registrar auditoría
    API->>DB: COMMIT Transacción
    API-->>Wompi: HTTP 200 OK (Recepción confirmada)
    end

    %% FASE 5: Notificación y Postventa
    rect rgb(255, 245, 245)
    Note over API, Cliente: FASE 5: Notificaciones Multicanal y Seguimiento Postventa
    API->>Notif: Despachar Notificaciones Transaccionales
    Notif-->>Cliente: Envío de Correo Electrónico: Confirmación de Pedido y Factura XML
    Notif-->>Cliente: Envío de SMS: Notificación de orden de corte y guía de despacho
    Cliente->>UI: Ingresa a /cliente/rastreo
    UI->>API: GET /api/orders/{id}
    API-->>UI: Estado en tiempo real ('cutting' -> 'shipped' -> 'delivered')
    UI-->>Cliente: Visualización de línea de tiempo interactiva
    end
```

---

## 4. Implementacion de los Principios SOLID en el Backend

El backend implementa los cinco principios de diseno de Robert C. Martin:

### 4.1. S - Single Responsibility Principle (Principio de Responsabilidad Unica)
Cada componente posee una sola razon para cambiar:
- `ManejadorAutenticacion`: Se limita a capturar la peticion HTTP, verificar cabeceras CORS, deserializar el cuerpo JSON y enviar la respuesta HTTP correspondiente. No ejecuta hashes ni consultas SQL.
- `ServicioAutenticacion`: Contiene exclusivamente la logica de negocio (generacion de hash SHA-256 en UTF-8, verificacion de suspension de cuenta y evaluacion de roles).
- `UsuarioDAO` / `JdbcRepositorioUsuarioImpl`: Maneja de forma estricta las sentencias SQL preparadas (`SELECT`, `INSERT`, `UPDATE`), mapeando los conjuntos de resultados (`ResultSet`) a instancias de `Usuario`.

### 4.2. O - Open/Closed Principle (Principio de Abierto/Cerrado)
El despachador central `ServidorApi.java` esta estructurado para incorporar nuevas rutas de la API sin requerir la modificacion de los manejadores existentes. Nuevos metodos de calculo textil o pasarelas de pago extienden las interfaces de dominio sin alterar los flujos ya probados.

### 4.3. L - Liskov Substitution Principle (Principio de Sustitucion de Liskov)
Todos los controladores del sistema extienden de `ManejadorBase`, el cual implementa el contrato estandar `HttpHandler` de Java. Cualquier manejador concreto (`ManejadorProductos`, `ManejadorPedidos`, `ManejadorInventario`) puede ser sustituido por una version mock de pruebas sin alterar el funcionamiento del servidor.

### 4.4. I - Interface Segregation Principle (Principio de Segregacion de Interfaces)
Las interfaces del dominio (`dominio/repositorios/`) definen metodos estrictamente acotados a su entidad. `RepositorioUsuario` define unicamente operaciones sobre usuarios (`buscarPorCorreo`, `guardar`), evitando que los consumidores queden acoplados a metodos de inventario o facturacion.

### 4.5. D - Dependency Inversion Principle (Principio de Inversion de Dependencia)
Los modulos de alto nivel (casos de uso) no dependen de las clases de acceso a datos de bajo nivel; ambos dependen de abstracciones. En `ServidorApi.java` se realiza la inyeccion de dependencias desacoplando la persistencia de las reglas de negocio:

```java
// 1. Instanciacion de persistencia de bajo nivel (Detalle Tecnico)
RepositorioUsuario repositorioUsuario = new JdbcRepositorioUsuarioImpl();

// 2. Inyeccion de la abstraccion al servicio de alto nivel
ServicioAutenticacion servicioAutenticacion = new ServicioAutenticacion(repositorioUsuario);

// 3. Inyeccion del servicio al controlador HTTP final
ManejadorAutenticacion manejadorAutenticacion = new ManejadorAutenticacion(servicioAutenticacion);
```

---

## 5. Orquestacion Transaccional Saga y Eventos Asincronos

Para gestionar la consistencia en el proceso de compra de tela continua y fraccionada, el sistema implementa una máquina de estados tipo **Saga Coreografiada** con transacciones compensatorias automáticas ante fallos de pago o cancelación:

```mermaid
sequenceDiagram
    autonumber
    actor Cliente as Cliente (Navegador)
    participant Gateway as ServidorApi / ManejadorPedidos
    participant Motor as ServicioCorteTextil
    participant DB as PostgreSQL (PedidoDAO / InventarioDAO)
    participant Pasarela as Pasarela Wompi Bancolombia

    Cliente->>Gateway: POST /api/orders (Compra 6.0m Lino continuo)
    Gateway->>Motor: validarMetrajeContinuo(rollos, 6.0m, "LOT-A")
    Motor-->>Gateway: Validación Exitosa (Rollo asignado ROL-502)
    
    Gateway->>DB: Iniciar Transacción (SELECT ... FOR UPDATE en ROL-502)
    DB-->>Gateway: Bloqueo Pesimista Confirmado (Fila reservada)
    Gateway->>DB: Descontar 6.0m (Remanente pasa de 12.0m a 6.0m)
    Gateway->>DB: Crear Pedido en estado 'pending'
    
    Gateway->>Pasarela: Solicitar Sesión de Pago ($180.000 COP)
    Pasarela-->>Gateway: Sesión creada (TransactionId: TX-8874)
    Gateway-->>Cliente: Redirección / Apertura Widget Wompi
    
    alt Pago Aprobado por el Banco (Flujo Exitoso)
        Pasarela->>Gateway: Webhook POST /api/pagos/wompi/webhook (Firma SHA-256 válida)
        Gateway->>DB: Actualizar Pedido (estado='cutting', estado_pago='paid')
        Gateway->>DB: Registrar Evento Auditoría en Savepoint
        Gateway->>DB: COMMIT Transacción
        Gateway-->>Pasarela: HTTP 200 OK
        Gateway-->>Cliente: Redirección a Confirmación (Orden generada)
    else Pago Rechazado o Cancelado (Compensación Saga)
        Pasarela->>Gateway: Webhook POST /api/pagos/wompi/webhook (Estado: DECLINED)
        Gateway->>DB: Transacción Compensatoria: Reintegrar 6.0m al Rollo ROL-502
        Gateway->>DB: Actualizar Pedido (estado='cancelled', estado_pago='failed')
        Gateway->>DB: COMMIT Transacción Compensatoria
        Gateway-->>Pasarela: HTTP 200 OK
        Gateway-->>Cliente: Notificación de Pago Declinado (Metraje liberado)
    end
```

---

## 6. Catalogo General de Endpoints de la API REST

El servidor escucha por defecto en el puerto **`8081`** y expone cabeceras CORS para integracion con el cliente web y movil:

| Metodo | Ruta | Descripcion | Payload Entrada | Codigos de Respuesta |
| :---: | :--- | :--- | :--- | :---: |
| `POST` | `/api/login` | Autenticacion con hash SHA-256 en UTF-8 | `{"email":"...", "password":"..."}` | 200, 400, 403 |
| `POST` | `/api/register` | Registro de nuevos clientes | `{"name":"...", "email":"...", "password":"..."}` | 201, 400 |
| `GET` | `/api/users` | Listado administrativo de usuarios | N/A | 200, 403 |
| `PUT` | `/api/users/{id}/suspend` | Suspension disciplinaria de cuenta | `{"reason":"..."}` | 200, 400, 403 |
| `PUT` | `/api/users/{id}/activate` | Reactivacion de cuenta suspendida | N/A | 200, 400, 403 |
| `GET` | `/api/products` | Catalogo con filtros de categoria y busqueda | Query Params: `category`, `q` | 200 |
| `POST` | `/api/products` | Publicacion de nueva tela en catalogo | JSON con ficha tecnica textil | 201, 400 |
| `GET` | `/api/products/{id}` | Detalle completo de una tela | N/A | 200, 404 |
| `PUT` | `/api/products/{id}/image` | Subida de fotografia en Base64 | `{"image":"data:image/jpeg;base64,..."}` | 200, 400 |
| `GET` | `/api/orders` | Consulta de pedidos segun rol | N/A | 200 |
| `POST` | `/api/orders` | Creacion de pedido con reserva continua | JSON con datos de envio e items | 201, 400 |
| `PUT` | `/api/orders/{id}/status` | Cambio de estado (`cutting`, `shipped`) | `{"status":"cutting"}` | 200, 400 |
| `GET` | `/api/orders/{id}/invoice` | Emision de representacion XML simulada | N/A | 200, 404 |
| `GET` | `/api/cart` | Obtener items de carrito del usuario | N/A | 200 |
| `POST` | `/api/cart` | Agregar tela al carrito de compras | `{"productId":14, "quantity":6}` | 200, 400 |
| `DELETE` | `/api/cart` | Vaciar carrito o eliminar item especifico | Query Param: `productId` (opcional) | 200 |
| `POST` | `/api/cupones/validar` | Validacion de cupon con reglas de categoria | `{"codigo":"DESCUENTO20"}` | 200, 400 |
| `GET` | `/api/inventory/batches` | Consulta de lotes de recepcion de telas | N/A | 200 |
| `POST` | `/api/inventory/batches` | Registro de nuevo lote de compra | JSON con lote, metros y proveedor | 201, 400 |
| `GET` | `/api/inventory/waste` | Historial de mermas y retazos liquidados | N/A | 200 |
| `POST` | `/api/inventory/waste` | Registro manual de merma en corte | JSON con metros perdidos y motivo | 201, 400 |
| `GET` | `/health/live` | Probe de liveness (servidor vivo) | N/A | 200 |
| `GET` | `/health/ready` | Probe de readiness (conexion PostgreSQL activa) | N/A | 200, 503 |


---

## Anexo de Arquitectura Backend: Aislamiento Multi-Tenancy de Pedidos por Rol

El controlador `ManejadorPedidos` y el componente de persistencia `PedidoDAO` aplican aislamiento estricto de datos según la identidad verificada en `TokenSesion.Identidad`:

- **Rol Administrador (`esAdministrador()`):** accede al consolidado completo de órdenes (`obtenerTodosLosPedidos()`) y a cualquier pedido individual para auditoría y soporte.
- **Rol Vendedor (`esVendedor()`):** al consultar `GET /api/pedidos` o `GET /api/pedidos/{id}`, el DAO filtra las órdenes mediante `JOIN` con `articulos_pedido` y `productos` donde `p.id_vendedor = ?`, reconstruyendo el objeto `Pedido` únicamente con las líneas de tela que pertenecen a ese vendedor y recalculando su subtotal correspondiente.
- **Rol Cliente:** solo puede listar y consultar pedidos cuyo `id_cliente` coincida exactamente con el `idUsuario` autenticado en su token de sesión.

### Evolución de Plataforma a OpenJDK 21 LTS y Persistencia Directa PostgreSQL

- **Runtime Backend:** El servidor HTTP nativo (`com.sun.net.httpserver.HttpServer`) y el contenedor Docker multi-etapa operan sobre **Eclipse Temurin OpenJDK 21 LTS**, aprovechando mejoras de rendimiento en manejo de hilos y recolector de basura.
- **Sincronización Frontend-Backend sin Mocks Residuales:** Los contextos de React (`ContextoAutenticacion`, `ContextoMetricas`) y las vistas de pedidos y soporte consultan directamente los endpoints transaccionales de PostgreSQL, garantizando consistencia de datos entre sesiones y roles.
