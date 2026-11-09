# Guion Oficial de Demostracion en Vivo para la Sustentacion SENA ADSO

**Proyecto:** Plataforma Distribuida de Comercializacion y Control Logistico Textil (D&D Textil)  
**Programa de Formacion:** Tecnologo en Analisis y Desarrollo de Software (ADSO) - SENA  
**Estandares Evaluados:** IEEE 830, ISO/IEC 25010, Clean Architecture, Domain-Driven Design (DDD), OWASP API Security Top 10, PCI-DSS v4.0, Ley 1581 de 2012  
**Version:** 2.0.0 - Documentacion Tecnica Oficial  

---

## 1. Ficha Tecnica de la Presentacion

* **Duracion Estimada:** 20 a 25 minutos (15 min de demostracion guiada + 10 min de sesion de preguntas del jurado).
* **Actores Involucrados:** Cliente Final, Operario de Corte en Bodega, Vendedor y Administrador General.
* **Entornos Evaluados:** Frontend Web React 18 (Desktop y Movil), Backend Vanilla Java 17 de alto desempeno, Base de Datos Relacional PostgreSQL 17 y Pasarela de Pagos Wompi (Bancolombia).

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
3. **Credenciales de prueba preparadas:**
   * **Administrador:** `admin@ddtextil.com` / `admin123`
   * **Vendedor:** `vendedor@ddtextil.com` / `vendedor123`
   * **Cliente:** `cliente@gmail.com` / `cliente123`

---

## 3. Escenario 1: Experiencia del Cliente y Motor Textil

**Objetivo:** Demostrar la resolucion de la problematica del comercio textil continuo, la calculadora de confeccion y el proceso de compra.

1. **Apertura y Catalogo:**
   * Acceder a la tienda publica en `http://localhost:3001`.
   * Explicar al jurado la arquitectura Glassmorphism y la organizacion del catalogo filtrable por categorias y colecciones.
2. **Calculadora de Metraje Inteligente:**
   * Ingresar a la seccion de la calculadora (`/calculator`).
   * Seleccionar un proyecto de confeccion (ej: *Cortinas para sala*).
   * Ingresar dimensiones: Ancho = 2.00 m, Alto = 2.20 m.
   * Mostrar el calculo matematico: se aplica el factor de fruncido de tela (2.0x) mas el **margen tecnico del +10%** para dobladillo y encogimiento de lavado.
   * Explicar como esta funcionalidad reduce los errores de dimensionamiento reportados tradicionalmente por los clientes.
3. **Seleccion de Tela y Checkout:**
   * Seleccionar tela de lino o algodon. Mostrar la ficha tecnica con trazabilidad de lote de tintoreria.
   * Agregar metraje al carrito. Aplicar un cupon de descuento comercial (ej: `TEXTIL10`).
   * Proceder al Checkout. Resaltar la autorizacion explicita de proteccion de datos personales segun la **Ley 1581 de 2012 (Habeas Data)**.
   * Iniciar pago con pasarela Wompi: se despliega el widget oficial en entorno sandbox utilizando tarjeta de prueba (`4242 4242 4242 4242`).

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

## 5. Escenario 3: Operaciones de Bodega y Reclasificacion de Mermas

**Objetivo:** Demostrar la gestion fisica de rollos, el algoritmo de corte y la impresion de etiquetas termicas.

1. **Panel de Bodega y Orden de Corte:**
   * Iniciar sesion con credenciales de operario de bodega o administrador.
   * Visualizar la orden de corte pendiente asignada al pedido del cliente.
2. **Ejecucion de Corte y Regla de Merma:**
   * El sistema selecciona automaticamente el rollo fisico optimo mediante el algoritmo **Best-Fit** (minimizacion de desperdicio).
   * Al ejecutar el corte, si el sobrante del rollo resulta menor a 1.00 metro lineal (ej: 0.70 m), el motor textil lo reclasifica de forma automatica e irreversible al estado **`RETAZO_LIQUIDADO`**.
   * Dicho retazo pasa a comercializarse con el **40% de descuento obligatorio** para manualidades o muestrarios, eliminando la acumulacion de retazos muertos en estanteria.
3. **Impresion de Etiqueta Termica con Codigo QR:**
   * En la seccion de inventario, solicitar la etiqueta del rollo o retazo generado (`GET /api/inventario/etiqueta?codigo=ROL-001&formato=html`).
   * Mostrar la etiqueta termica lista para impresion en formato estandar de 100x50 mm con codigo de rollo, metraje remanente, lote de tintoreria y codigo de barras/QR de trazabilidad para lectores laser de bodega.

---

## 6. Escenario 4: Panel de Administracion y Observabilidad

**Objetivo:** Demostrar la toma de decisiones basada en datos y el gobierno del sistema.

1. **Metricas y Analitica Comercial:**
   * Visualizar graficos interactivos de ventas diarias, mapas de despacho regional y proyecciones de rotacion de telas.
2. **Auditoria Transaccional Inmutable:**
   * Mostrar el registro de bitacora del sistema (`auditoria_sistema`), donde cada operacion critica (cambio de precios, cortes de rollo, registro de mermas) queda asentada con marca de tiempo ISO-8601, ID de usuario y direccion IP.
3. **Conformidad PCI-DSS v4.0:**
   * Confirmar ante el jurado que la base de datos de PostgreSQL **no almacena numeros de tarjeta (PAN), codigos CVV ni fechas de vencimiento**, cumpliendo a cabalidad el Requisito 3 del estandar financiero internacional.

---

## 7. Escenario 5: Calidad de Software y Verificacion Automatizada en Vivo

**Objetivo:** Demostrar el rigor metodologico, la cobertura de pruebas y la estabilidad del software ante pruebas de estres.

1. **Ejecucion de Suites de Pruebas del Backend Java (44 Pruebas):**
   * Abrir la terminal y ejecutar los bancos de prueba compilados:
     ```bash
     cd "tienda digital de telas/backend-java/servidor-api"
     java -cp "lib/*;bin" PruebasReglasNegocioTextil
     java -cp "lib/*;bin" PruebasSeguridadIntegridad
     java -cp "lib/*;bin" PruebasConcurrenciaYPagos
     java -cp "lib/*;bin" PruebasContratoApi
     ```
   * Enfatizar la tasa de exito del **100% (44/44 aprobadas)** cubriendo reglas textiles, criptografia SHA-256, prevencion SQLi/XSS, proteccion DoS (5 MB), multihilo y contratos OpenAPI v3.
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
| **¿Por que no usaron un framework como Spring Boot en el backend?** | Se utilizo Vanilla Java 17 con `HttpServer` nativo para lograr un consumo de memoria inferior a 60 MB de RAM, un tiempo de arranque menor a 800 ms y control total sobre el pool de 32 hilos concurrentes, cumpliendo la norma ISO/IEC 25010 en eficiencia de desempeno. |
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
   - Ejecutar `node "tienda digital de telas/ejecutar-pruebas-frontend.mjs"` y mostrar el **100 % de aprobación**.
   - Ejecutar `java -cp "bin;lib/*" pruebas.PruebasSeguridadYSesiones` en el backend para demostrar la validación de tokens HMAC-SHA256 y el aislamiento por roles.
2. **Recorrido Multi-Rol con Botones de Acceso Rápido (`/login`):**
   - Usar los tres botones de demostración (**Cliente**, **Vendedor**, **Admin**) documentados en la **Sección 2.6 del Manual de Usuario** para alternar entre los paneles sin perder tiempo digitando contraseñas en vivo.
