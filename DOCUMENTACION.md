# Indice General de Documentacion Tecnica - D&D Textil
**Proyecto:** Plataforma Distribuida de Comercializacion y Control Logistico Textil (D&D Textil)  
**Programa de Formacion:** Tecnologo en Analisis y Desarrollo de Software (ADSO) - SENA  
**Estandares Aplicados:** IEEE 830, ISO/IEC 25010, Modelo C4 (Simon Brown), BDD (Gherkin), Clean Architecture, Domain-Driven Design (DDD), OWASP API Security, PCI-DSS v4.0, Ley 1581 de 2012 (Habeas Data)  
**Version:** 2.0.0 - Documentacion Tecnica Oficial  

---

## Presentacion del Proyecto

La plataforma **D&D Textil** es un ecosistema tecnologico disenado para la comercializacion, control logistico y administracion de inventario continuo y fraccionado de tejidos textiles. El sistema aborda las ineficiencias del sector tradicional (errores de medicion en mesa, acumulacion de mermas y retazos no comerciales, desviaciones de color por lotes de tintoreria y sobreventas por falta de control por rollo fisico).

El cuerpo documental oficial del proyecto se encuentra centralizado en el directorio `documentacion/`, organizado en modulos tecnicos exhaustivos sin abreviaciones ni ambiguedades:

---

## Indice de Modulos Documentales (`documentacion/`)

### 1. [01. Especificacion de Requerimientos de Software (IEEE 830 y BDD)](documentacion/01-especificacion-requerimientos-ieee830.md)
*   **Fase de Investigacion y Fundamentacion:** Caracterizacion del problema en el sector textil tradicional colombiano, impacto economico de la digitalizacion, reduccion de mermas en un 18% y justificacion operativa.
*   **Objetivos del Proyecto:** Objetivo general y cinco objetivos especificos orientados a arquitectura limpia, motor textil, transaccionalidad concurrente, aseguramiento de calidad y despliegue reproducible.
*   **Alcance y Delimitacion:** Detalle de los seis modulos en alcance y limites operativos de la version inicial.
*   **Matriz de Requerimientos Funcionales (RF-01 a RF-07):** Especificacion segun IEEE 830 con identificador, rol, prioridad y criterios de aceptacion (catalogo granular, inventario por rollos, calculo de corte continuo, escala de precios, checkout y pagos, gestion de corte en bodega y administracion de mermas).
*   **Requerimientos No Funcionales (RNF-01 a RNF-05):** Alineados con la norma ISO/IEC 25010 (Eficiencia de desempeno, Fiabilidad, Mantenibilidad, Seguridad y Usabilidad).
*   **Escenarios BDD (Behavior-Driven Development):** Especificaciones formales en sintaxis Gherkin (Dado-Cuando-Entonces) para validacion de corte continuo, clasificacion automatica de retazos liquidados y consistencia cromatica por lote de tintoreria.
*   **Matriz de Trazabilidad de Requerimientos:** Cruce bidireccional entre requerimientos de negocio, casos de uso tecnicos y componentes de software.

### 2. [02. Arquitectura de Software, Modelo C4 y Backend Java](documentacion/02-arquitectura-software-c4-y-backend.md)
*   **Vision General del Backend:** Diseno en Vanilla Java 17 de alto desempeno, servidor HTTP nativo con pool de 32 hilos concurrentes, pool de conexiones HikariCP y Google Gson.
*   **Estructura Exhaustiva de Capas y Paquetes:** Distribucion Clean Architecture en capas `dominio`, `aplicacion` e `infraestructura` con correspondencia exacta de clases en idioma espanol.
*   **Principios SOLID con Ejemplos de Codigo:** Demostracion de SRP, OCP, LSP, ISP y DIP en el contexto textil.
*   **Diagramas de Arquitectura bajo el Modelo C4 y Despliegue:**
    *   Nivel 1: Diagrama de Contexto del Sistema (Mermaid estructurado sin solapamientos, con actores, límites y servicios externos).
    *   Nivel 2: Diagrama de Contenedores (Mermaid con capas ordenadas de cliente web, app móvil, backend Java, persistencia y pasarela Wompi).
    *   Nivel 3: Diagrama de Componentes del Backend (Mermaid con capas Clean Architecture desacopladas y dependencias descendentes).
    *   Nivel 4: Diagrama de Despliegue del Sistema (Mapa de Despliegue de nodos clientes, host Docker, redes aisladas, volúmenes y nube).
    *   Flujo Omnicanal de Comunicación: Diagramas de canales y secuencia de interacción completa entre el Sistema y el Cliente (Catálogo, Checkout, Wompi, Facturación, SMS, Email y Rastreo).
*   **Orquestacion Transaccional (Patron Saga Coreografiado):** Diagrama de secuencia Mermaid para reserva de metraje, procesamiento en pasarela Wompi y compensacion de inventario ante fallos.
*   **Catalogo Completo de Endpoints REST:** Definicion de metodos, rutas, codigos de estado HTTP y politicas de autorizacion RBAC.

### 3. [03. Arquitectura del Frontend y Gestion de Roles de Usuario](documentacion/03-arquitectura-frontend-y-roles.md)
*   **Arquitectura de la Interfaz:** Single Page Application (SPA) con React 18, Vite 5, TailwindCSS 3 (diseno Glassmorphism) y Context API.
*   **Arbol de Directorios:** Organizacion de `assets/`, `components/`, `context/`, `pages/`, `panels/` (Cliente, Vendedor y Administrador) y `utils/`.
*   **Matriz de Roles y Permisos (RBAC):** Politicas de acceso para Cliente, Vendedor, Operario de Corte y Administrador.
*   **Mapa de Navegacion:** Diagrama Mermaid de flujo de navegación entre rutas públicas y paneles protegidos por `ProtectedRoute`.
*   **Calculadora de Metraje Inteligente:** Modelado matematico y formulas para cortinas, vestidos, faldas circulares, manteles y tapiceria con margen tecnico de confeccion del +10%.
*   **Cliente Movil Hibrido (Android Wrapper):** Arquitectura en Kotlin con `WebViewAssetLoader`, ciclo de vida e integracion con el backend.

### 4. [04. Diseno, Estructura y Esquema de Base de Datos Relacional](documentacion/04-base-de-datos-diseno-y-esquema.md) y [README de Base de Datos](BASE%20DE%20DATOS/README.md)
*   **Diseno Arquitectonico:** PostgreSQL 17 en codificacion UTF-8, normalizacion en Tercera Forma Normal (3FN), precision decimal en moneda (`NUMERIC(12,2)`) y metrajes (`NUMERIC(10,2)`).
*   **Modelo Relacional Formal:** Notacion relacional estricta para las 25 tablas con claves primarias (`PK`), claves foraneas (`FK`), restricciones de unicidad (`UK`) y de integridad referencial.
*   **Diagrama Entidad-Relacion (DER):** Modelado conceptual completo en sintaxis Mermaid integrando auditoría Wompi.
*   **Arquitectura Modelo-Vista-Controlador (MVC):** Desacoplamiento y mapeo integral del Modelo (PostgreSQL 17 + DAOs JDBC + Clases de Dominio Java), Vista (SPA React 18 + Tailwind CSS) y Controlador (Handlers HTTP nativos de Java 17).
*   **Vistas de Base de Datos (SQL Views):** Definicion de vistas para catalogo consolidado, alertas de stock critico y resumen de comisiones de vendedores.
*   **Ciclo de Vida Transaccional MVC:** Diagrama de secuencia Mermaid para el flujo de compra y descuento de inventario con bloqueo pesimista (`SELECT ... FOR UPDATE`).
*   **Diccionario de Datos Exhaustivo:** Especificacion columna por columna de las tablas de la base de datos (tipos de datos, restricciones PK, FK, UK, nulabilidad y descripcion del proposito comercial).
*   **Estrategia de Indexacion B-Tree:** Indices para busqueda de catalogo, ordenamiento de inventario por menor remanente y trazabilidad de ordenes de corte.
*   **Transaccionalidad y Bloqueo Pesimista:** Aplicacion de `SELECT ... FOR UPDATE` para evitar condiciones de carrera en reservas simultaneas de rollos.

### 5. [05. Politicas de Seguridad, Resiliencia y Calidad de Software](documentacion/05-politicas-seguridad-resiliencia-y-calidad.md)
*   **Evaluacion ISO/IEC 25010:** Tabla de cumplimiento y criterios de medicion (Adecuacion Funcional, Fiabilidad, Eficiencia, Mantenibilidad, Seguridad, Usabilidad y Portabilidad).
*   **Gestion de Identidad y Acceso (IAM):** Autenticacion mediante tokens efimeros (15 minutos), cookies seguras (`HttpOnly; Secure; SameSite=Strict`) y hashing SHA-256 en UTF-8.
*   **Politica Financiera PCI-DSS v4.0:** Cumplimiento del Requisito 3 mediante politica de cero almacenamiento de datos de tarjeta (PAN y CVV).
*   **Proteccion de Datos Personales (Ley 1581 de 2012):** Politica de Habeas Data, consentimiento previo y procedimiento de anonimizacion/derecho al olvido.
*   **Plan de Recuperacion ante Desastres (DRP):** Objetivos RTO <= 2 horas y RPO <= 15 minutos, respaldos fisicos diarios `pg_dump` y procedimiento de contingencia.
*   **Matriz de Mitigacion OWASP API Security Top 10:** Estrategias implementadas contra Broken Object Level Authorization, Broken Authentication, Broken Object Property Level Authorization, Unrestricted Resource Consumption, Broken Function Level Authorization, etc.
*   **Observabilidad y Auditoria:** Formato de logs estructurados en JSON, correlacion mediante UUID y trazabilidad inmutable.

### 6. [06. Manual Tecnico de Instalacion, Configuracion y Despliegue](documentacion/06-manual-tecnico-instalacion-y-despliegue.md)
*   **Requisitos de Infraestructura:** Parametros minimos y recomendados de hardware (CPU, RAM, SSD) y software (Java 17, Node.js 18+, PostgreSQL 17, Docker Engine 24+).
*   **Topologia de Redes Docker Compose:** Diagrama Mermaid de arquitectura de redes y aislamiento entre red publica `frontend-net` y red interna aislada `backend-net`.
*   **Especificacion de Variables de Entorno (`.env`):** Configuracion completa de conexiones, secretos y puertos.
*   **Despliegue Automatizado con Docker Compose:** Procedimiento paso a paso para construccion, inicio, verificacion de estado y bitacoras.
*   **Procedimiento de Instalacion Manual (Entorno Nativo):** Instrucciones para Linux y Windows (PowerShell) para compilar y ejecutar backend y frontend de forma local.
*   **Probes de Salud:** Verificacion de endpoints `/health/live` y `/health/ready`.
*   **Guia de Solucion de Problemas (Troubleshooting):** Resolucion de conflictos de puerto, caidas de conexion JDBC y cabeceras CORS.

### 7. [07. Motor Textil, Reglas de Negocio y Suite de Pruebas Automatizadas](documentacion/07-motor-textil-reglas-negocio-y-pruebas.md)
*   **Fundamentacion de Dominio:** Peculiaridades del corte de telas (continuidad de pieza, consistencia cromatica por lote, reclasificacion de mermas y tarifas por volumen).
*   **Entidad RolloTextil:** Estados del ciclo de vida (`DISPONIBLE`, `RESERVADO`, `RETAZO_LIQUIDADO`, `AGOTADO`) y metodos de corte.
*   **Servicio de Corte Textil:** Algoritmo Best Fit para seleccion de rollo con menor desperdicio y formula de liquidacion con descuentos (12% mayorista, 25% rollo cerrado, 40% retazos).
*   **Matriz de Pruebas de Reglas de Negocio:** Detalle de los 14 casos de prueba unitarios ejecutados en `PruebasReglasNegocioTextil.java` (100% aprobados).
*   **Matriz de Pruebas de Seguridad y Casos Extremos:** Detalle de los 12 casos de prueba ejecutados en `PruebasSeguridadYBugs.java` (100% aprobados).
*   **Certificacion de Resultados:** Registro oficial de ejecucion de las 26 pruebas automatizadas.

### 8. [08. Modelo Entidad-Relacion](documentacion/08-modelo-entidad-relacion.md)
*   **DER completo y simplificado:** Las 25 tablas del esquema `01_esquema_espanol.sql` con sus 20 llaves foraneas, cardinalidades y diccionario resumido.

### 9. [09. Mapa de Navegacion](documentacion/09-mapa-de-navegacion.md)
*   **Rutas por rol:** Las 50 rutas de `App.jsx` agrupadas en sitio publico, proceso de compra y paneles de cliente, vendedor y administrador, con su proteccion por `ProtectedRoute`.

### 10. [10. Casos de Uso](documentacion/10-casos-de-uso.md)
*   **Diagramas y especificaciones:** Actores, diagramas de casos de uso de la tienda y de la gestion, y fichas con flujo principal, alternos y postcondiciones.

### 11. [11. Diagrama de Clases](documentacion/11-diagrama-de-clases.md)
*   **Backend Java:** Clases de dominio y vista por capas (`dominio`, `aplicacion`, `infraestructura`) generadas desde el codigo fuente.

### 12. [12. Diagramas de Secuencia](documentacion/12-diagramas-de-secuencia.md)
*   **Flujos clave:** Inicio de sesion, registro, compra con bloqueo de stock, factura en PDF y motor de corte textil.

### 13. [13. Manual de Usuario](documentacion/13-manual-de-usuario.md)
*   **Guia por rol con capturas:** Cliente, vendedor y administrador, paso a paso. Version en [PDF](documentacion/pdf/Manual%20de%20usuario%20-%20D%26D%20Textil.pdf).

### 14. [Contrato de Interfaz OpenAPI v3.0](documentacion/openapi_tienda_textil.yaml)
*   Especificacion Swagger / OpenAPI v3.0 completa y estandarizada de todos los endpoints de la API REST, con esquemas de peticion, esquemas de respuesta y codigos de error HTTP.

### 15. [Matriz de Requerimientos](documentacion/Matriz_de_requerimientos_v2.xlsx)
*   Requerimientos funcionales y no funcionales (ISO/IEC 25010) y matriz de trazabilidad hacia casos de uso y clases de diseno.

---

## Certificacion de Conformidad Tecnica

La presente documentacion tecnica satisface la totalidad de los criterios de evaluacion tecnica para proyectos de software del Servicio Nacional de Aprendizaje (SENA) en el programa **ADSO**, garantizando rigor metodologico, coherencia arquitectonica e inmutabilidad operativa.
