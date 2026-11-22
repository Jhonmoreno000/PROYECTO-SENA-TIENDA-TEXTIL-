# Índice General de Documentación Técnica — D&D Textil Marketplace
**Proyecto:** Plataforma Marketplace Textil Multi-Vendedor y Control Logístico (**D&D Textil**)  
**Programa de Formación:** Tecnólogo en Análisis y Desarrollo de Software (ADSO) — SENA  
**Estándares Aplicados:** IEEE 830, ISO/IEC 25010, Modelo C4 (Simon Brown), BDD (Gherkin), Clean Architecture, Domain-Driven Design (DDD), OWASP API Security, PCI-DSS v4.0, Ley 1581 de 2012 (Habeas Data)  
**Versión:** 3.0.0 — Documentación Técnica Oficial (Marketplace Multi-Vendedor & Gobernanza Antifraude)  

---

## Presentación del Proyecto

La plataforma **D&D Textil** es un ecosistema **Marketplace Multi-Vendedor B2B/B2C** y sistema de control logístico diseñado para la industria textil. Conecta múltiples casas proveedoras textiles externas verificadas con clientes minoristas y talleres de confección, resolviendo problemas históricos del sector (cortes fragmentados, desviaciones de lote de tintorería, mermas sin control, opacidad de precios entre distribuidores y fraude operativo sobre precios o inventarios).

El cuerpo documental oficial está centralizado en `documentacion/` y sincronizado con la arquitectura actual: **React 18 + Vite 5 (58 rutas)**, **Backend Java 21 (18 manejadores HTTP + WebSockets puerto 8082, `ProtectorFuerzaBruta`, 8 servicios, 15 DAOs/migradores, 22 modelos)** y **PostgreSQL 17 (32 tablas, 31 llaves foráneas)**.

---

## Índice de Módulos Documentales (`documentacion/` y Raíz)

### 0. [Modelo de Negocio y Estrategia Marketplace](MODELO_DE_NEGOCIO.md)
*   **Modelo Comisión + Venta:** Operación multi-vendedor inspirada en Mercado Libre / Falabella / Éxito con tasa de comisión (`tasa_comision`) para el administrador, división automática de carritos en sub-pedidos (`grupo_checkout`), ganancia neta por proveedor, escalas mayoristas y exclusividad VIP para clientes frecuentes.
*   **Gobernanza Antifraude:** Protección de precios e inventarios de vendedores externos, auditoría real con notificaciones obligatorias, alertas de stock bajo y envío de reportes reales de mermas.

### 1. [01. Especificación de Requerimientos de Software (IEEE 830 y BDD)](documentacion/01-especificacion-requerimientos-ieee830.md)
*   **Requerimientos Funcionales (RF-01 a RF-12):** Cubre RBAC y sesiones, catálogo técnico granular, inventario continuo por rollos y lotes, retazos liquidados, pagos Wompi con compensación Saga, marketplace multi-vendedor con perfiles tipo Facebook, división de comisiones, exclusividad VIP, restricción de compra a clientes autenticados y auditoría antifraude de lotes/mermas/stock.
*   **Requerimientos No Funcionales (RNF-01 a RNF-05) y BDD (Gherkin):** Criterios medibles de rendimiento, concurrencia `FOR UPDATE`, seguridad y escalabilidad.

### 2. [02. Arquitectura de Software, Modelo C4 y Backend Java 21](documentacion/02-arquitectura-software-c4-y-backend.md)
*   **Backend en Java 21 nativo:** Servidor HTTP con pool concurrente de hilos, JDBC + HikariCP, Google Gson y arquitectura por capas (`dominio`, `aplicacion`, `infraestructura`).
*   **Inventario completo de componentes:** 22 modelos, 8 servicios (`ServicioCorteTextil`, `ServicioExclusividadVIP`, `ServicioAutenticacion`, `ServicioFactura`, etc.), 15 DAOs/migradores y 18 manejadores HTTP (incluyendo `ManejadorTiendas`, protección de precios en `ManejadorProductos` y control antifraude en `ManejadorInventario`).
*   **Catálogo completo de endpoints REST** y orquestación Saga/Wompi.

### 3. [03. Arquitectura del Frontend y Gestión de Roles de Usuario](documentacion/03-arquitectura-frontend-y-roles.md)
*   **Frontend React 18 + Vite 5 + TailwindCSS 3:** Sistema de diseño Glassmorphism bajo **psicología del color 60-30-10** accesible (WCAG), **58 rutas**, directorio de proveedores, perfil tipo Facebook, comparador competitivo y paneles sin datos hardcodeados.
*   **Matriz RBAC Real:** Visitante (navegación sin compra), Cliente (checkout exclusivo y VIP), Vendedor (gestión autónoma de tienda, precios, stock y alertas) y Administrador (auditoría de solo lectura y notificaciones).

### 4. [04. Diseño, Estructura y Esquema de Base de Datos Relacional](documentacion/04-base-de-datos-diseno-y-esquema.md) y [README de Base de Datos](BASE%20DE%20DATOS/README.md)
*   **PostgreSQL 17 (3FN):** **32 tablas y 31 llaves foráneas** definidas en `BASE DE DATOS/01_esquema_espanol.sql` + migrador idempotente `MigradorEsquemaMarketplace`, incorporando `perfiles_vendedor`, `resenas_vendedor`, `alertas_vendedor`, `auditoria_sistema`, `rollos_textil`, `eventos_pago_wompi` y `direcciones_usuario`.
*   **Semillas Reales (`02_datos_iniciales.sql`):** 4 tiendas proveedoras reales, lotes con costos reales, eventos de merma reales y reseñas verificadas.

### 5. [05. Políticas de Seguridad, Resiliencia y Calidad de Software](documentacion/05-politicas-seguridad-resiliencia-y-calidad.md)
*   **Estándar ISO/IEC 25010, PCI-DSS v4.0 y Ley 1581 de 2012:** Tokens `HmacSHA256` verificados contra estado vivo en BD, contraseñas con hashing seguro/PBKDF2, cero almacenamiento de PAN/CVV, cabeceras de seguridad y mitigación OWASP API Security Top 10.

### 6. [06. Manual Técnico de Instalación, Configuración y Despliegue](documentacion/06-manual-tecnico-instalacion-y-despliegue.md)
*   **Infraestructura Docker Compose:** Topología `db` (`postgres:17`), `backend` (`eclipse-temurin:21-jre`) y `frontend` (`nginx:alpine`), variables `.env`, compilación manual Java 21 / Node 20 y healthchecks.

### 7. [07. Motor Textil, Reglas de Negocio y Suite de Pruebas Automatizadas](documentacion/07-motor-textil-reglas-negocio-y-pruebas.md)
*   **Dominio Textil y 6 Suites Java 21 (67 pruebas):** `PruebasReglasNegocioTextil` (14), `PruebasSeguridadIntegridad` (21), `PruebasConcurrenciaYPagos` (11), `PruebasContratoApi` (9), `PruebasMarketplace` (8) y `PruebasWebSocket` (4), junto a `ejecutar-pruebas-frontend.mjs` (**46 pruebas**).

### 8. [08. Modelo Entidad-Relación (32 tablas)](documentacion/08-modelo-entidad-relacion.md)
*   **DER actualizado:** Esquema completo de las 32 tablas y 31 llaves foráneas incluyendo todo el ecosistema marketplace, comisiones, auditoría y pagos Wompi.

### 9. [09. Mapa de Navegación por Rol (58 rutas)](documentacion/09-mapa-de-navegacion.md)
*   **Navegación completa:** Flujos de tienda pública, directorio `/tiendas`, `/tienda/:id`, checkout exclusivo para cliente y vistas protegidas de Cliente, Vendedor (`/vendedor/mi-tienda`, `/vendedor/alertas`) y Administrador.

### 10. [10. Casos de Uso](documentacion/10-casos-de-uso.md)
*   Diagramas y fichas de casos de uso actualizados para tienda, marketplace multi-vendedor, comisiones, alertas VIP y control antifraude.

### 11. [11. Diagrama de Clases](documentacion/11-diagrama-de-clases.md)
*   Vista por capas del backend Java 21 (`dominio`, `aplicacion`, `infraestructura`).

### 12. [12. Diagramas de Secuencia](documentacion/12-diagramas-de-secuencia.md)
*   Flujos de autenticación, compra multi-vendedor con Wompi y división de comisiones, moderación con alerta al vendedor y motor de corte.

### 13. [13. Manual de Usuario Oficial (Markdown + PDF)](documentacion/13-manual-de-usuario.md)
*   Guía operativa por rol (**Visitante**, **Cliente**, **Vendedor** y **Administrador**), cubriendo registro obligatorio para comprar, exploración de tiendas tipo Facebook, comparador de vendedores, alertas VIP/auditoría/mermas y auditoría de lotes/stock en solo lectura. Disponible en **[PDF Oficial](documentacion/Manual_de_usuario_DD_Textil.pdf)**.

### 14. [14. Plan Maestro y Reporte de Pruebas ISO/IEC 25010](documentacion/14-plan-y-reporte-de-pruebas-iso25010.md)
*   Dictamen QA oficial con **113 pruebas automatizadas (67 backend en 6 suites + 46 frontend, 100 % aprobadas)** y verificación E2E antifraude.

### 15. [15. Glosario Técnico y Catálogo Maestro Textil](documentacion/15-glosario-tecnico-y-catalogo-maestro-textil.md)
*   Terminología industrial textil, propiedades de las telas sembradas y fórmulas de confección.

### 16. [16. Guion de Demostración para Sustentación SENA ADSO](documentacion/16-guion-demostracion-sustentacion-sena.md)
*   Guion práctico de sustentación de la plataforma multi-vendedor, comisiones, VIP, auditoría con alerta al vendedor y ejecución de las 113 pruebas automatizadas.

### 17. [Contrato de Interfaz OpenAPI v3.0](documentacion/openapi_tienda_textil.yaml)
*   Especificación OpenAPI 3.0.3 de endpoints y esquemas incluyendo `/api/tiendas`, `/api/vendedor/alertas`, `/api/clientes/elegibilidad-vip`, `/api/productos/{id}/competencia`, `/api/productos/{id}/moderar`, `/api/inventario/notificar-stock` y `/api/inventario/enviar-reporte-mermas`.

### 18. [Matriz de Requerimientos](documentacion/Matriz_de_requerimientos_v2.xlsx) y [Pruebas de Carga](pruebas-carga/README.md)
*   Matriz de trazabilidad de requerimientos y suite de carga k6 / PowerShell / Bash.

---

## Certificación de Conformidad Técnica

Esta documentación refleja exactamente la arquitectura, base de datos, reglas de negocio y controles de seguridad implementados en el código fuente del proyecto **D&D Textil** (**113 casos de prueba automatizados: 67 backend + 46 frontend**).
