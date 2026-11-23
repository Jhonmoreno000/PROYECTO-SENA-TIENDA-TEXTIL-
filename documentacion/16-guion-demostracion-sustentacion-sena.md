# Guion de Demostracion en Vivo para la Sustentacion SENA ADSO

**Proyecto:** D&D Textil — Plataforma de comercializacion y gestion de inventario de telas  
**Programa de Formacion:** Tecnologo en Analisis y Desarrollo de Software (ADSO) - SENA  
**Version:** 2.1 (17/11/2026) — revisado contra el codigo de `main`

Este guion solo incluye pasos que funcionan en la version actual. Donde una pantalla promete algo que el sistema todavia no hace, se indica con **Atencion** para que el equipo lo explique antes de que el jurado lo descubra.

---

## 1. Ficha Tecnica de la Presentacion

* **Duracion estimada:** 20 a 25 minutos (15 de demostracion + 10 de preguntas).
* **Roles que se muestran:** visitante/cliente, vendedor y administrador.
* **Entorno:** frontend React 18 + Vite (puerto 3001), backend Java 21 con `HttpServer` (puertos 8081 y 8082 para WebSocket) y PostgreSQL 17. Los pagos son simulados.

---

## 2. Checklist Previo

1. **Servicios arriba** (Docker Compose o local):
   ```bash
   docker compose ps
   ```
2. **Sondas de salud del backend:**
   * `curl -s http://localhost:8081/health/live` → `{"status":"UP", ...}`
   * `curl -s http://localhost:8081/health/ready` → `{"status":"UP", ... "postgresql_database","status":"UP" ...}`
3. **Cuentas de prueba** (botones de **Acceso rapido (Demo)** en `/login`):
   * **Administrador:** `admin@ddtextil.com` / `admin123`
   * **Vendedor:** `vendedor@ddtextil.com` / `vendedor123`
   * **Cliente:** `cliente@ddtextil.com` / `cliente123`
4. **Cupones de la base:** `DESCUENTO10` (10 %) y `BIENVENIDA20` (20 %).
5. Tener abiertas dos ventanas del navegador (una normal y una privada) para mostrar cliente y administrador al mismo tiempo.

---

## 3. Escenario 1: Tienda y Compra (Cliente)

**Objetivo:** mostrar el recorrido de compra por metros y las herramientas pensadas para el comercio textil.

1. **Inicio y catalogo** (`http://localhost:3001`, `/catalogo`):
   * Franja de envio gratis desde $200.000, modo oscuro y boton de WhatsApp.
   * Apartados (Nuevas Colecciones, Telas Exclusivas, Ofertas Especiales), filtro *¿Que estas imaginando crear?*, orden y rango de precio.
2. **Ficha de la tela** (`/producto/1`):
   * Material, ancho, peso g/m², stock y cuidados.
   * **Metros por corte** y **Cantidad de cortes**: el sistema no deja pasar del stock.
   * Reseñas con estrellas (con sesion iniciada).
3. **Carrito** (`/carrito`): aplicar `DESCUENTO10` y mostrar subtotal, descuento, envio ($15.000), IVA 19 % y total.
4. **Calculadora de metraje** (entrar como cliente → **Mi Coleccion → Calculadora de Metraje**, `/cliente/coleccion/calculadora`):
   * Elegir **Cortinas**, ancho de tela **1.50 m**, ventana de 200 × 220 cm y fruncido **Doble (2x)**.
   * Resultado esperado: 3 paños de 2,50 m (220 cm + 30 cm de dobladillos) = **7,5 m**. Las demas plantillas (faldas, mantel, cojines, vestido) agregan un margen de 10 a 15 %.
5. **Checkout** (`/checkout` → `/pago`):
   * Datos de contacto y direccion de envio.
   * **Elige tu Forma de Pago** con seis opciones (Wompi, Mercado Pago, Nequi/Daviplata/Bre-B, ePayco, tarjeta, PSE/contraentrega). Llenar la tarjeta (la vista 3D se actualiza) y pulsar **Pagar de forma segura**.
   * Explicar que el backend recalcula el total con los precios de la base de datos y valida el stock (`POST /api/pagos/intencion`). El descuento del stock ocurre al aprobar el pago.

> **Atencion:** la pantalla final dice *¡Pago Aprobado y Pedido Confirmado!*, pero hoy `POST /api/pagos/confirmar` responde `400` (el filtro PCI confunde la referencia `DD-<13 digitos>-XXXX` con un numero de tarjeta), el pedido queda **Pendiente** y el stock no baja. Si el jurado revisa el historial vera ese estado. Conviene decirlo como defecto conocido y mostrar el analisis en el doc 02 («Flujo de Pago Vigente»).

---

## 4. Escenario 2: Postventa del Cliente

1. **Historial de Pedidos** (`/cliente/pedidos`): pedido recien creado, filtros y busqueda.
2. **Factura PDF:** boton **Factura** del pedido. El PDF (generado con Apache PDFBox) trae NIT 900.123.456-7, datos del cliente, metros, precio por metro, IVA 19 % y **CUFE**.
3. **Rastrear Envio** (`/cliente/pedidos/rastreo`): etapas Pago → Corte → Empaque → Envio → Entrega, guia `DDT-COL-<id>`, resumen financiero y destino.
4. **Reportar Problema** (`/cliente/soporte/nuevo`): tipo de problema, descripcion y hasta 5 fotos. El ticket aparece luego en **Gestion de Tickets** del administrador.

> **Atencion:** la factura se descarga sin sesion (`GET /api/facturas/{id}`); es un pendiente de seguridad documentado en el doc 05.

---

## 5. Escenario 3: Panel del Vendedor

1. Entrar con **Acceso rapido → Vendedor** (`/vendedor`): indicadores, grafico de ventas y tabla **Control de Inventario y Catalogo**.
2. **+ Nuevo Producto**: crear una tela y mostrar que aparece en el catalogo publico (se publica aprobada).
3. **Alertas de Stock** (`/vendedor/stock`): telas con menos de 10 m y boton **Reponer Urgente**.

> **Atencion:** **Gestion de Pedidos** del vendedor sale vacia porque los pedidos no guardan el vendedor de cada tela. Los numeros rojos del menu son fijos.

---

## 6. Escenario 4: Panel del Administrador

1. **Resumen** (`/admin`): ingresos, clientes, valor de inventario y pedidos leidos de PostgreSQL; grafico de ventas reales y centro de alertas.
2. **Usuarios** (`/admin/usuarios`): cambiar el rol con el selector y suspender una cuenta. El backend vuelve a leer el rol de la base en cada peticion protegida.
3. **Catalogo, Carrusel y Pagina Inicio:** editar un slide o ocultar una seccion y recargar la tienda en la otra ventana.
4. **Inventario:**
   * **Control de Lotes**: disponibilidad, merma acumulada y **Ajustar** metros.
   * **Calculadora de Merma** → **Registrar Merma**: el lote baja sus metros.
   * **Historial de Movimientos** con **Exportar CSV**.
5. **Soporte:** ver el ticket del escenario 2 y cambiar su estado; crear un cupon con **Crear Cupon → Activar Campaña** y usarlo en el carrito.
6. **Analitica y Facturacion:** mapa de ventas por region, proyeccion de ingresos y lista de facturas con descarga en PDF.
7. **Configuracion:** cambiar un color de marca y ver el **Live Preview**.

> **Atencion:** **+ Nuevo Textil** (catalogo) e **Ingresar Lote** (inventario) solo muestran un mensaje; no tienen formulario todavia.

---

## 7. Escenario 5: Reglas Textiles en la API

Estas reglas estan en el backend y en las pruebas, pero no tienen pantalla propia. Se muestran con `curl` o desde el codigo.

1. **Rollos y lotes de tintoreria:** `curl -s http://localhost:8081/api/inventario/rollos` → codigo de rollo, metros restantes, lote (`dyeLot`) y ubicacion.
2. **Etiqueta de bodega de 100 × 50 mm:** abrir en el navegador `http://localhost:8081/api/inventario/etiqueta?codigo=ROL-001&formato=html` (tambien `formato=svg`).
3. **Corte y retazos** (`ServicioCorteTextil`): `POST /api/inventario/corte` con `{"rollCode":"ROL-001","meters":2}` valida que el corte salga de un solo rollo y del mismo lote. Si el sobrante queda por debajo de 1,0 m se reclasifica como `RETAZO_LIQUIDADO` con 40 % de descuento. El servicio tambien tiene precios escalonados (15 % desde 15 m, 25 % por rollo cerrado de 50 m) y una variante Best-Fit que cubren las pruebas `PruebasReglasNegocioTextil`.
4. **Webhook de Wompi:** el backend tiene `POST /api/pagos/webhook` con verificacion de firma e idempotencia en `eventos_pago_wompi`, pero el frontend no abre el widget de Wompi, asi que en la demo no se usa.

---

## 8. Escenario 6: Pruebas Automatizadas

1. **Backend (59 pruebas en 5 suites).** Despues de compilar (`javac -encoding UTF-8 -cp "lib/*" -d bin ...`), desde `tienda digital de telas/backend-java/servidor-api`:
   ```bash
   java -cp "bin;lib/*" PruebasReglasNegocioTextil   # 14
   java -cp "bin;lib/*" PruebasSeguridadIntegridad   # 21
   java -cp "bin;lib/*" PruebasConcurrenciaYPagos    # 11
   java -cp "bin;lib/*" PruebasContratoApi           # 9
   java -cp "bin;lib/*" PruebasWebSocket             # 4
   ```
   En Linux o macOS se usa `bin:lib/*`. Resultado de la ejecucion del 16/11/2026: 59/59.
2. **Frontend (46 pruebas):** desde `tienda digital de telas`, `npm test`.
3. **Carga:** `powershell -ExecutionPolicy Bypass -File pruebas-carga/simulador_carga_concurrente.ps1 -TotalPeticiones 100 -Concurrencia 10` y leer el throughput, las latencias y la tasa de error que imprime el script (los valores dependen del equipo).

---

## 9. Preguntas Frecuentes del Jurado

| Pregunta | Respuesta del equipo |
| :--- | :--- |
| **¿Por que no usaron Spring Boot?** | Para entender la capa HTTP sin magia de framework: `HttpServer` de Java 21, manejadores propios, un pool de al menos 32 hilos y un pool JDBC propio (`Conexion.java`, 24 conexiones por defecto). El costo es escribir a mano el ruteo, la validacion y la seguridad. |
| **¿Como evitan vender la misma tela dos veces?** | `PedidoDAO.crearPedido` bloquea cada producto con `SELECT ... FOR UPDATE`, valida y descuenta el stock antes del `COMMIT`, y `PruebasConcurrenciaYPagos` lo prueba con varios hilos. Respuesta honesta: el checkout actual usa otro camino (`PagoWompiDAO`), que valida con `FOR SHARE` y descuenta al aprobar el pago sin volver a validar; unificarlo con `PedidoDAO` es un pendiente. |
| **¿El pago es real?** | No. Todos los medios son simulados y la confirmacion hoy falla por el filtro PCI (pedido en `pending`). El backend ya tiene el receptor de webhook con firma e idempotencia para cuando se conecte Wompi. |
| **¿Como cuidan que el corte no mezcle tonos?** | `ServicioCorteTextil` exige que el metraje salga de un solo rollo y de un mismo lote de tintoreria; los sobrantes de menos de 1 m pasan a retazo con descuento. Esta en la API y en las pruebas, sin pantalla todavia. |
| **¿Como protegen los datos personales?** | Autorizacion de Habeas Data obligatoria en el registro, contraseñas con PBKDF2 y sal, sesion firmada con HMAC por 12 horas, bloqueo de 15 minutos tras intentos fallidos y limite de 1.200 peticiones por minuto. Pendientes: guardar la fecha de autorizacion, proteger facturas e inventario con sesion. |
| **¿Que falta?** | Corregir la confirmacion de pago y la consulta de estado, asignar el vendedor a cada pedido, formularios de nuevo textil y nuevo lote, y extender el control de roles a todos los manejadores (hoy solo usuarios, productos, pedidos y cupones). |

---

## 10. Cierre

D&D Textil cubre el ciclo de una tienda de telas por metros: catalogo, carrito con cupones, checkout, factura con CUFE, rastreo, soporte, panel de vendedor y un panel administrativo con inventario por lotes, mermas, analitica y configuracion de marca. El equipo conoce y tiene documentados los defectos que siguen abiertos.

---

## Anexo: Lista de Chequeo con el Manual de Usuario

Antes de empezar, repase el [Manual de Usuario](./13-manual-de-usuario.md) ([PDF](./Manual_de_usuario_DD_Textil.pdf)):

1. Correr `npm test` y una suite del backend para tener el resultado a la vista.
2. Usar los botones de **Acceso rapido (Demo)** de la seccion 2.6 del manual para cambiar de rol sin escribir contraseñas.
3. Leer los recuadros **Aviso** del manual (secciones 3.3, 5.2, 6.3 y 6.5) para no sorprenderse en vivo.
