# Guion Oficial de Demostracion en Vivo para la Sustentacion SENA ADSO

**Proyecto:** Plataforma Distribuida de Comercializacion y Control Logistico Textil (D&D Textil)  
**Programa de Formacion:** Tecnologo en Analisis y Desarrollo de Software (ADSO) - SENA  
**Estandares Evaluados:** IEEE 830, ISO/IEC 25010, Clean Architecture, Domain-Driven Design (DDD), OWASP API Security Top 10, PCI-DSS v4.0, Ley 1581 de 2012  
**Version:** 3.0.0 - Documentacion Tecnica Oficial (Marketplace Multi-Vendedor)  

---

## 1. Ficha Tecnica de la Presentacion

* **Duracion Estimada:** 20 a 25 minutos (15 min de demostracion guiada + 10 min de sesion de preguntas del jurado).
* **Actores Involucrados:** Visitante (exploracion sin compra), Cliente Final (comprador exclusivo), Vendedores / Proveedores Externos (4 tiendas reales en BD) y Administrador General (auditoria y comisiones).
* **Entornos Evaluados:** Frontend Web React 18 + Vite (58 rutas, diseno Glassmorphism 60-30-10), Backend Vanilla Java 21 de alto desempeno, Base de Datos Relacional PostgreSQL 17 (31 tablas, 31 FKs) y Pasarela de Pagos Wompi (Bancolombia).

---

## 2. Checklist Previo al Inicio de la Sustentacion

Antes de dar inicio a la presentacion formal ante los instructores y jurados:

1. **Verificar estado de los servicios (Docker Compose o local):**
   ```bash
   docker compose ps
   ```
2. **Comprobar probes de observabilidad del Backend Java:**
   * Liveness Probe: `curl -s http://localhost:8081/health/live` -> `{"status":"UP"}`
   * Readiness Probe: `curl -s http://localhost:8081/health/ready` -> `{"status":"UP","database":"CONNECTED"}`
3. **Credenciales reales verificadas en PostgreSQL (`SembradorDatosPrueba`):**
   * **Administrador:** `admin@ddtextil.com` / `admin123`
   * **Vendedor 1 (Medellin - Textiles Perez & Cia):** `vendedor@ddtextil.com` / `vendedor123`
   * **Vendedor 2 (Bogota - Casa Textil Gonzalez):** `maria.gonzalez@ddtextil.com` / `vendedor123`
   * **Vendedor 3 (Cali - Hilos del Valle Textil):** `andres.restrepo@hilosdelvalle.com` / `vendedor123`
   * **Vendedor 4 (Barranquilla - Telas & Seda del Caribe):** `valentina.castro@telasdelcaribe.com` / `vendedor123`
   * **Cliente Principal (con historial VIP):** `cliente@gmail.com` / `cliente123`

---

## 3. Escenario 1: Experiencia del Cliente, Tiendas y Motor Textil

**Objetivo:** Demostrar la experiencia Marketplace multi-vendedor, la restriccion de compra exclusiva para clientes registrados, la calculadora de confeccion y la division de carrito con comision administrativa.

1. **Directorio de Tiendas y Perfil Tipo Red Social:**
   * Acceder a `http://localhost:3001/tiendas` y navegar al perfil publico de cualquier proveedor (`/tienda/:id`).
   * Mostrar la portada, avatar, biografia comercial, ciudad, calificacion promedio y resenas reales almacenadas en `perfiles_vendedor` y `resenas_vendedor`.
   * Explicar el control de acceso: un visitante, vendedor o administrador no puede ejecutar compras ni publicar resenas; solo usuarios autenticados con rol `cliente`.
2. **Calculadora de Metraje Inteligente y Telas VIP:**
   * Iniciar sesion con `cliente@gmail.com` (`/login`) y abrir `/cliente/coleccion/calculadora`.
   * Seleccionar un proyecto de confeccion (ej: *Cortinas para sala*), ingresar Ancho = 2.00 m, Alto = 2.20 m y mostrar el factor de fruncido mas el **margen tecnico del +10%**.
   * Mostrar como los clientes con recurrencia desbloquean telas exclusivas VIP mediante `GET /api/clientes/elegibilidad-vip`.
3. **Comparador de Competencia y Checkout Multi-Vendedor con Comision:**
   * En `/producto/:id`, mostrar la comparativa entre vendedores reales (`GET /api/productos/{id}/competencia`).
   * Agregar telas de dos tiendas distintas al carrito y confirmar el checkout (`/checkout` -> `/pago`).
   * Explicar al jurado como el sistema realiza un solo pago unificado en Wompi mientras en backend divide la compra en sub-pedidos independientes compartiendo `grupo_checkout`, liquidando el **10 % de comision (`monto_comision_admin`)** y el **90 % neto para cada vendedor (`ganancia_neta_vendedor`)**.

---

## 4. Escenario 2: Backend Transaccional, Webhook Wompi y Facturacion

**Objetivo:** Demostrar el desacoplamiento arquitectonico, la resiliencia transaccional y el cumplimiento fiscal.

1. **Recepcion e Idempotencia del Webhook Wompi:**
   * Explicar que la confirmacion de la transaccion no depende del navegador del usuario sino de una llamada directa servidor-a-servidor via webhook (`POST /api/pagos/webhook`).
   * Mostrar en codigo o logs la verificacion de la **firma criptografica HMAC SHA-256** del evento para neutralizar ataques de manipulacion de datos.
   * Destacar la tabla `eventos_pago_wompi` que garantiza la **idempotencia**: ante reintentos de red de la pasarela, el pago se procesa exactamente una sola vez sin duplicar ordenes.
2. **Bloqueo Pesimista de Inventario:**
   * Mostrar como el backend utiliza `SELECT ... FOR UPDATE` a nivel de base de datos para reservar el metraje fisico de forma atomica, impidiendo condiciones de carrera o sobreventas en concurrencia.
3. **Descarga de Factura Electronica en PDF:**
   * Desde el panel de cliente, hacer clic en "Descargar Factura PDF" del pedido recien generado (`GET /api/pedidos/{id}/factura.pdf`).
   * Abrir el documento PDF generado dinamicamente en memoria con Apache PDFBox:
     * Identificacion fiscal formal de D&D Textil (NIT 900.123.456-7).
     * Desglose exacto de metraje cortado, precio por metro e **IVA del 19%**.
     * Codigo Unico de Factura Electronica (**CUFE**) y codigo QR de validacion DIAN.

---

## 5. Escenario 3: Gestion del Vendedor, Mi Tienda, Alertas VIP y Mermas

**Objetivo:** Demostrar la autogestion de perfiles comerciales tipo red social, la recepcion de alertas reales y el fraccionamiento fisico de rollos.

1. **Perfil Social de Tienda y Bandeja de Alertas Real:**
   * Iniciar sesion con `vendedor@ddtextil.com` (Textiles Perez & Cia).
   * Abrir **Mi Tienda** (`/vendedor/mi-tienda`), editar en vivo la portada, biografia y politicas, y pulsar *"Ver mi perfil publico"* (`/tienda/:id`).
   * Abrir **Alertas y Oportunidades** (`/vendedor/alertas`) para mostrar las notificaciones reales almacenadas en `alertas_vendedor` (sugerencias VIP de `ServicioExclusividadVIP`, solicitudes de auditoria, alertas de stock bajo y reportes de merma).
2. **Ejecucion de Corte y Regla de Merma:**
   * El sistema selecciona automaticamente el rollo fisico optimo mediante el algoritmo **Best-Fit** (minimizacion de desperdicio).
   * Al ejecutar el corte por parte del vendedor propietario, si el sobrante del rollo resulta menor a 1.00 metro lineal (ej: 0.70 m), el motor textil lo reclasifica de forma automatica e irreversible al estado **`RETAZO_LIQUIDADO`**.
   * Dicho retazo pasa a comercializarse con el **40% de descuento obligatorio** para manualidades o muestrarios, eliminando la acumulacion de retazos muertos en estanteria.
3. **Impresion de Etiqueta Termica con Codigo QR:**
   * En la seccion de inventario, solicitar la etiqueta del rollo o retazo generado (`GET /api/inventario/etiqueta?codigo=ROL-001&formato=html`).
   * Mostrar la etiqueta termica lista para impresion en formato estandar de 100x50 mm con codigo de rollo, metraje remanente, lote de tintoreria y codigo de barras/QR de trazabilidad para bodega.

---

## 6. Escenario 4: Panel de Administracion, Auditoria Antifraude y Observabilidad

**Objetivo:** Demostrar el control antifraude sobre precios e inventarios, la moderacion con alertas reales y la toma de decisiones sin datos ficticios.

1. **Control Antifraude y Auditoria de Inventario (Solo Lectura):**
   * Iniciar sesion con `admin@ddtextil.com`.
   * Mostrar que en **Auditoria de Lotes** (`/admin/inventario/lotes`), **Auditoria de Mermas** (`/admin/inventario/merma`) y **Catalogo**, el administrador no puede alterar precios, stock, rollos ni mermas (`HTTP 403` si intenta mutar datos del vendedor).
   * En su lugar, puede marcar un producto con `changes_requested` (`PUT /api/productos/{id}/moderar`), despachar alertas de stock bajo (`/api/inventario/notificar-stock`) y enviar reportes de mermas (`/api/inventario/enviar-reporte-mermas`) directamente al vendedor.
2. **Metricas, Comisiones y Analitica Comercial (Cero Hardcoding):**
   * Visualizar graficos alimentados 100 % desde PostgreSQL: ingresos por comisiones administrativas (10 %), ventas por tienda, mapas de despacho regional y proyecciones de rotacion de telas.
   * Mostrar el registro inmutable de actividad (`actividad_reciente`) y las alertas notificadas.
3. **Conformidad PCI-DSS v4.0:**
   * Confirmar ante el jurado que la base de datos de PostgreSQL **no almacena numeros de tarjeta (PAN), codigos CVV ni fechas de vencimiento**, cumpliendo a cabalidad el Requisito 3 del estandar financiero internacional.

---

## 7. Escenario 5: Calidad de Software y Verificacion Automatizada en Vivo

**Objetivo:** Demostrar el rigor metodologico, la cobertura de pruebas y la estabilidad del software ante pruebas de estres.

1. **Ejecucion de Suites de Pruebas del Backend Java (62 Pruebas en 5 Suites):**
   * Abrir la terminal y ejecutar los bancos de prueba compilados (con Eclipse Temurin Java 21):
     ```bash
     cd "tienda digital de telas/backend-java/servidor-api"
     java -cp "lib/*;bin" PruebasReglasNegocioTextil
     java -cp "lib/*;bin" PruebasSeguridadIntegridad
     java -cp "lib/*;bin" PruebasConcurrenciaYPagos
     java -cp "lib/*;bin" PruebasContratoApi
     java -cp "lib/*;bin" PruebasMarketplace
     ```
   * Enfatizar la tasa de exito del **100% (62/62 Backend + 46/46 Frontend = 108 pruebas totales aprobadas)** cubriendo reglas textiles, criptografia SHA-256, RBAC, prevencion SQLi/XSS, proteccion DoS (5 MB), multihilo, contratos OpenAPI v3 y controles Marketplace/Antifraude.
2. **Ejecucion de Pruebas del Frontend (Node.js):**
   * En el directorio del frontend, ejecutar:
     ```bash
     cd "tienda digital de telas"
     npm test
     ```
   * Mostrar la aprobacion del 100% en formateadores de moneda colombiana, motor matematico de la calculadora textil y validaciones de checkout.
3. **Demostracion de Prueba de Carga Concurrente:**
   * Ejecutar el simulador de concurrencia nativo:
     ```powershell
     powershell -ExecutionPolicy Bypass -File pruebas-carga/simulador_carga_concurrente.ps1 -TotalPeticiones 100 -Concurrencia 10
     ```
   * Mostrar al jurado las metricas obtenidas:
     * Throughput: Peticiones por segundo procesadas por el servidor nativo.
     * Latencia: Percentiles $P_{50} < 50\text{ ms}$ y $P_{95} < 250\text{ ms}$.
     * Tasa de error HTTP: 0%.

---

## 8. Banco de Preguntas Frecuentes del Jurado SENA y Respuestas Tecnicas

| Pregunta Tipica del Jurado | Justificacion Tecnica del Proyecto |
| :--- | :--- |
| **¿Por que no usaron un framework como Spring Boot en el backend?** | Se utilizo Vanilla Java 21 con `HttpServer` nativo para lograr un consumo de memoria inferior a 60 MB de RAM, un tiempo de arranque menor a 800 ms y control total sobre el pool concurrente escalable (min. 32 hilos), cumpliendo la norma ISO/IEC 25010 en eficiencia de desempeno. |
| **¿Como evitan que dos clientes compren la misma tela al mismo tiempo?** | Mediante transacciones ACID en PostgreSQL con nivel de aislamiento y bloqueo pesimista `SELECT ... FOR UPDATE` sobre la fila del rollo especifico, impidiendo lecturas sucias y saldos negativos. |
| **¿Que pasa si se cae el servidor durante un pago en Wompi?** | Se implemento el patron Saga Coreografiado con webhooks asincronos e idempotencia en base de datos. Cuando Wompi reintente la notificacion, el sistema la reconoce y concilia la orden sin duplicar cobros ni perder inventario. |
| **¿Como garantizan que el corte de tela no arruine las prendas del cliente?** | El motor de negocio valida la **continuidad estricta de metraje** en un unico rollo fisico y la **consistencia de lote de tintoreria** (*dye lot*), impidiendo abastecer un pedido con retazos de rollos distintos con posibles variaciones de color. |
| **¿Como protegen la privacidad de los datos personales?** | Toda la plataforma cumple la **Ley 1581 de 2012 (Habeas Data)** mediante consentimiento informado en el registro, tokens efimeros de 15 minutos, hashing unidireccional SHA-256 de credenciales y cookies seguras `HttpOnly; SameSite=Strict`. |

---

## 9. Conclusion de la Sustentacion

Concluir destacando que **D&D Textil** no es un e-commerce generico adaptado, sino una solucion industrial especializada para el sector textil confeccionista que integra diseno de software de alta ingenieria, rigor matematico en inventario continuo y estandares internacionales de ciberseguridad y calidad.


---

## Anexo: Lista de Chequeo Rápida con el Manual de Usuario Oficial

Antes de iniciar la sustentación ante el jurado evaluador del SENA, verifique los siguientes puntos apoyándose en el [Manual de Usuario Oficial](./13-manual-de-usuario.md) ([versión PDF](./Manual_de_usuario_DD_Textil.pdf)):

1. **Verificación de Suites de Prueba en Consola (< 15 segundos):**
   - Ejecutar `node "tienda digital de telas/ejecutar-pruebas-frontend.mjs"` y mostrar **46/46 pruebas aprobadas (100 %)**.
   - Ejecutar `java -cp "bin;lib/*" PruebasSeguridadIntegridad` y `java -cp "bin;lib/*" PruebasMarketplace` en el backend para demostrar el aislamiento por roles, tokens HMAC-SHA256, comisiones y controles antifraude (62/62 backend).
2. **Recorrido Multi-Rol con Botones de Acceso Rápido (`/login`):**
   - Usar los tres botones de demostración (**Cliente**, **Vendedor**, **Admin**) documentados en la **Sección 2.6 del Manual de Usuario** para alternar entre los paneles sin perder tiempo digitando contraseñas en vivo.
