# Motor Textil, Reglas de Negocio y Suite de Pruebas Automatizadas
**Proyecto:** Plataforma Distribuida de Comercializacion y Control Logistico Textil (D&D Textil)  
**Programa de Formacion:** Tecnologo en Analisis y Desarrollo de Software (ADSO) - SENA  
**Estandares:** Domain-Driven Design (DDD), Clean Architecture, Behavior-Driven Development (BDD), JUnit-Style Assertions  
**Version:** 2.0.0 - Documentacion Tecnica Oficial  

---

## 1. Fundamentacion del Motor de Dominio Textil

A diferencia de los sistemas de comercio electronico genericos de bienes discretos (donde los productos se comercializan por unidades enteras indivisibles), una plataforma de telas opera sobre un **bien continuo fraccionable** sujeto a restricciones fisicas e industriales particulares:

1. **Continuidad del Metraje:** Un cliente que solicita 8.5 metros de lino para confeccionar un lote de prendas no puede recibir dos retazos de 4.25 metros de rollos distintos, ya que los patrones de corte quedarian inservibles.
2. **Consistencia Cromatica por Lote de Tintoreria:** Los tejidos producidos en diferentes partidas de tintura presentan desviaciones de color (*shading* o *lot drift*). El abastecimiento de un pedido debe respetar obligatoriamente la homogeneidad de lote.
3. **Control Sistematico de Mermas y Retazos:** Cuando el corte de un rollo deja un sobrante inferior a 1.00 metro lineal, dicho remanente pierde su valor de corte continuo y debe reclasificarse de forma automatica e irreversible como un retazo en liquidacion.
4. **Tarificacion Dinamica por Escala de Volumen:** El precio por metro lineal debe ajustarse de forma automatica segun el volumen solicitado: detal, mayorista (a partir de 15 metros) y rollo cerrado (a partir de 50 metros).

---

## 2. Modelado de Dominio: Entidad `RolloTextil`

Ubicada en `dominio.modelos.RolloTextil`, representa un rollo físico de tela en bodega. Es una clase de datos (atributos con sus `get`/`set`); las reglas de corte viven en `ServicioCorteTextil`. Se guarda en la tabla `rollos_textil`.

### 2.1. Atributos y Estados

| Atributo (Java) | Tipo | Columna | Significado |
| :--- | :--- | :--- | :--- |
| `id` | `int` | `id` | Identificador del rollo |
| `productoId` | `int` | `producto_id` | Tela del catálogo a la que pertenece |
| `nombreProducto` | `String` | (consulta) | Nombre de la tela, para mostrar |
| `codigoRollo` | `String` | `codigo_rollo` | Código único de la etiqueta |
| `metrajeInicial` | `double` | `metraje_inicial` | Metros con que llegó el rollo |
| `metrajeRemanente` | `double` | `metraje_remanente` | Metros que quedan |
| `loteTintoreria` | `String` | `lote_tintoreria` | Lote de teñido |
| `estado` | `String` | `estado` | `disponible`, `retazo_liquidado` o `agotado` |
| `ubicacionBodega` | `String` | `ubicacion_bodega` | Ubicación física |

Transiciones de estado tras un corte (las aplica `procesarCorteYRemanente`):

| Remanente después del corte | Nuevo estado | Efecto adicional |
| :--- | :--- | :--- |
| `0,00 m` | `agotado` | — |
| Mayor que 0 y menor que `1,0 m` | `retazo_liquidado` | Se crea un `EventoMerma` (`remanente_sub_metro`) y el retazo se valora con 40 % de descuento |
| `1,0 m` o más | `disponible` | — |

Si se piden más metros de los que tiene el rollo, el servicio lanza `IllegalStateException` (sobrecorte).

---

## 3. Servicio de Aplicacion: `ServicioCorteTextil`

Ubicado en `aplicacion.servicios.ServicioCorteTextil`. Lo usan la suite `PruebasReglasNegocioTextil` y el endpoint `POST /api/inventario/corte` (`ManejadorInventario`), que guarda el resultado con `InventarioDAO.actualizarRolloDespuesDeCorte` en una sola transacción (rollo, merma y stock del producto). La compra del cliente todavía no pasa por este servicio y ninguna pantalla llama al endpoint.

### 3.1. Validacion de Continuidad de Metraje (`validarMetrajeContinuo`)

Recibe los rollos, los metros pedidos y el lote. Solo considera rollos en estado `disponible` del lote indicado:

| Resultado | Código | Cuándo |
| :--- | :--- | :--- |
| Válido | `CORTE_CONTINUO_OK` | Un solo rollo tiene metros suficientes (se asigna el primero que alcance) |
| No válido | `FRAGMENTED_STOCK` | El lote suma los metros, pero repartidos en varios rollos (no se venden empates) |
| No válido | `INSUFFICIENT_STOCK` | El lote no tiene metros suficientes |
| No válido | `SIN_STOCK` | No hay rollos registrados |

Si los metros pedidos son cero o negativos lanza `IllegalArgumentException`.

### 3.2. Seleccion de Rollo Optimo (`validarMetrajeContinuoBestFit`)

Variante que, entre los rollos que alcanzan, elige el que mejor conserva el inventario:

1. **Coincidencia exacta** (no sobra nada): primera opción.
2. **Sobrante de 1,0 m o más** (no genera merma): el de menor sobrante, para no empezar rollos grandes.
3. **Sobrante menor a 1,0 m** (merma inevitable): el de menor merma.

### 3.3. Motor de Liquidacion de Precios por Volumen (`calcularPrecioEscalonado`)

| Tarifa | Metros | Descuento |
| :--- | :--- | :--- |
| `DETAL` | Menos de 15 m | 0 % |
| `MAYORISTA` | De 15 m a 49,99 m | 15 % |
| `ROLLO_CERRADO` | 50 m o más | 25 % |
| Retazo liquidado (en `procesarCorteYRemanente`) | Remanente menor a 1,0 m | 40 % |

Las constantes están en la clase: `UMBRAL_MAYORISTA_METROS = 15.0`, `DESCUENTO_MAYORISTA = 0.15`, `UMBRAL_ROLLO_CERRADO_METROS = 50.0`, `DESCUENTO_ROLLO_CERRADO = 0.25`, `UMBRAL_RETAZO_METROS = 1.0` y `DESCUENTO_RETAZO_LIQUIDADO = 0.40`.

---

## 4. Matriz de la Suite de Pruebas Unitarias del Motor Textil

Implementada en `src/PruebasReglasNegocioTextil.java`: 14 pruebas sin base de datos ni red.

| ID | Prueba | Qué verifica | Estado |
| :---: | :--- | :--- | :---: |
| **P-01** | Metraje continuo en un solo rollo | Un rollo del lote alcanza: `CORTE_CONTINUO_OK` | **EXITO** |
| **P-02** | Stock fragmentado | El lote alcanza solo sumando rollos: `FRAGMENTED_STOCK` | **EXITO** |
| **P-03** | Lote de tintorería distinto | Rechaza rollos de otro lote | **EXITO** |
| **P-04** | Metraje insuficiente | `INSUFFICIENT_STOCK` | **EXITO** |
| **P-05** | Remanente comercializable | Queda 1,0 m o más: sigue `disponible` | **EXITO** |
| **P-06** | Retazo liquidado | Queda menos de 1,0 m: `retazo_liquidado` | **EXITO** |
| **P-07** | Evento de merma | Se crea `EventoMerma` con el remanente sub-metro | **EXITO** |
| **P-08** | Agotamiento total | El rollo queda en 0 m: `agotado` | **EXITO** |
| **P-09** | Sobrecorte | Pedir más de lo disponible lanza `IllegalStateException` | **EXITO** |
| **P-10** | Tarifa DETAL | Menos de 15 m, sin descuento | **EXITO** |
| **P-11** | Tarifa MAYORISTA | 15 a 49,99 m, 15 % de descuento | **EXITO** |
| **P-12** | Tarifa ROLLO CERRADO | 50 m o más, 25 % de descuento | **EXITO** |
| **P-13** | Frontera de umbrales | 14,99 m frente a 15,0 m | **EXITO** |
| **P-14** | Parámetros no positivos | Precio o metros ≤ 0 lanzan `IllegalArgumentException` | **EXITO** |

---

## 5. Matriz de la Suite de Pruebas de Seguridad e Integridad

Implementada en `src/PruebasSeguridadIntegridad.java`: 21 pruebas. En el código, los números 16 a 18 aparecen dos veces; aquí se listan en orden de ejecución.

| ID | Prueba | Qué verifica | Estado |
| :---: | :--- | :--- | :---: |
| **S-01** | Hash UTF-8 con caracteres especiales | Hash SHA-256 determinista de 64 caracteres (compatibilidad con cuentas antiguas) | **EXITO** |
| **S-02** | Reportes de fallo | Deserialización de `ReporteError` (`title`, `area`, `severity`, `priority`) | **EXITO** |
| **S-03** | Path Traversal | Bloqueo de rutas `../` fuera de `/uploads` | **EXITO** |
| **S-04** | Inyección SQL | Credenciales con `' OR 1=1 --` no autentican | **EXITO** |
| **S-05** | Identificadores en la ruta | Extracción segura de IDs numéricos | **EXITO** |
| **S-06** | Modelo de usuario | Rol y estado bilingües | **EXITO** |
| **S-07** | Correlation ID | Formato UUID v4 | **EXITO** |
| **S-08** | Sondas de salud | `/health/live` y `/health/ready` | **EXITO** |
| **S-09** | Bloqueo pesimista | `SELECT … FOR UPDATE` evita condiciones de carrera | **EXITO** |
| **S-10** | Habeas Data | Ley 1581 de 2012 | **EXITO** |
| **S-11** | PCI-DSS | Detecta y rechaza PAN y CVV | **EXITO** |
| **S-12** | Logs JSON | Trazabilidad estructurada | **EXITO** |
| **S-13** | SSO | Validación de Google y Microsoft | **EXITO** |
| **S-14** | Firma Wompi | Integridad SHA-256 y webhook | **EXITO** |
| **S-15** | Reglas financieras | Descuentos y límites de transacción | **EXITO** |
| **S-16** | Sesiones firmadas | `TokenSesion`: identidad, integridad, expiración (12 h) y entradas malformadas | **EXITO** |
| **S-17** | Autorización de pedidos | Administrador, vendedor y cliente | **EXITO** |
| **S-18** | Identidad vigente | El rol y el estado de la base de datos prevalecen sobre la sesión | **EXITO** |
| **S-19** | PBKDF2 | Hash con sal y compatibilidad con SHA-256 | **EXITO** |
| **S-20** | Best-Fit | Selección de rollo que reduce la merma | **EXITO** |
| **S-21** | Fuerza bruta | Bloqueo tras 5 intentos fallidos | **EXITO** |

---

## 6. Matriz de la Suite de Pruebas de Concurrencia, Pagos y Dominio Financiero

Implementada en `src/PruebasConcurrenciaYPagos.java`: 11 pruebas.

| ID | Prueba | Qué verifica | Estado |
| :---: | :--- | :--- | :---: |
| **C-01** | Concurrencia multihilo | Sin sobreventa de stock fraccionado | **EXITO** |
| **C-02** | Limitador de peticiones | Ráfaga concurrente contra el límite por IP | **EXITO** |
| **C-03** | Idempotencia de webhooks | Reintentos sin efecto duplicado | **EXITO** |
| **C-04** | Pagos rechazados | Estados DECLINED, ERROR y VOIDED | **EXITO** |
| **C-05** | Manipulación de monto | Detecta cambios de monto o moneda | **EXITO** |
| **C-06** | Cupón expirado | Rechazo por fecha | **EXITO** |
| **C-07** | Cupón agotado | Rechazo por límite de usos | **EXITO** |
| **C-08** | Compra mínima del cupón | Subtotal mínimo y tope | **EXITO** |
| **C-09** | IVA | 19 % con redondeo en centavos COP | **EXITO** |
| **C-10** | XSS | Sanitización de entradas | **EXITO** |
| **C-11** | DoS por tamaño | Rechazo de cuerpos de más de 5 MB | **EXITO** |

---

## 7. Matriz de las Suites de Contrato OpenAPI y Tiempo Real

`src/PruebasContratoApi.java` (9 pruebas) contrasta los modelos con `documentacion/openapi_tienda_textil.yaml`:

| ID | Prueba | Qué verifica | Estado |
| :---: | :--- | :--- | :---: |
| **API-01** | Esquema `Producto` | Campos del contrato OpenAPI | **EXITO** |
| **API-02** | Esquema `Pedido` | Pedido con sus artículos | **EXITO** |
| **API-03** | Esquema `UsuarioPerfil` | Perfil y token | **EXITO** |
| **API-04** | Sondas de salud | Contrato de `/health/live` y `/health/ready` | **EXITO** |
| **API-05** | Intención de pago | Montos en centavos | **EXITO** |
| **API-06** | Cabeceras obligatorias | Observabilidad y seguridad | **EXITO** |
| **API-07** | Errores RFC 7807 | Formato Problem Details | **EXITO** |
| **API-08** | Contratos frontend-backend | `LoteInventario`, `EventoMerma`, `VentaRegion`, `TicketSoporte` | **EXITO** |
| **API-09** | Factura PDF | Varias páginas, metraje fraccionado y etiquetas SVG | **EXITO** |

`src/PruebasWebSocket.java` (4 pruebas):

| ID | Prueba | Qué verifica | Estado |
| :---: | :--- | :--- | :---: |
| **WS-01** | Handshake RFC 6455 | Cálculo de `Sec-WebSocket-Accept` | **EXITO** |
| **WS-02** | Serialización | Modelo `MensajeWebSocket` | **EXITO** |
| **WS-03** | Evento de pedido | Carga útil de `NUEVO_PEDIDO` | **EXITO** |
| **WS-04** | Ciclo de vida | Inicio, transmisión sin clientes y detención de `ServidorWebSocket` | **EXITO** |

---

## 8. Framework de Pruebas de Carga y Rendimiento Concurrente

El proyecto incluye en el directorio `pruebas-carga/` un conjunto completo de herramientas de estres y rendimiento multi-entorno para validar la resiliencia del backend Java bajo alta demanda concurrente:

1. **Script de Carga con Grafana k6 (`pruebas-carga/script_k6_estres_tienda.js`):**
   - Disenado para pruebas de carga progresiva por etapas:
     - Etapa 1 (Rampa de subida): hasta 30 usuarios virtuales (VUs) en 20 segundos.
     - Etapa 2 (Carga sostenida): hasta 80 VUs en 40 segundos.
     - Etapa 3 (Pico de estres): hasta 120 VUs en 30 segundos.
     - Etapa 4 (Enfriamiento): bajada a 0 VUs en 20 segundos.
   - Umbrales de calidad definidos (*thresholds*):
     - Tasa de error HTTP menor al 1% (`http_req_failed < 0.01`).
     - Percentil 95 de tiempo de respuesta inferior a 250 ms (`http_req_duration: ['p(95)<250']`).
   - Escenarios cubiertos: sonda de salud, catalogo publico, carrusel, secciones del inicio, configuracion publica de pagos y umbrales de inventario.

2. **Simulador Concurrente Nativo en PowerShell (`pruebas-carga/simulador_carga_concurrente.ps1`):**
   - Ejecucion nativa en plataformas Windows sin requerir instalacion de herramientas externas.
   - Utiliza `System.Net.Http.HttpClient` y tareas asincronas de .NET (`[System.Threading.Tasks.Task]`).
   - Parametros configurables: URL base, numero de peticiones concurrentes (por defecto 100), nivel de paralelismo (por defecto 10 hilos).
   - Calculo estadistico completo: Peticiones exitosas, fallidas, tiempo total, throughput (req/seg), tiempo medio, minimo, maximo y percentiles $P_{50}$, $P_{90}$, $P_{95}$, $P_{99}$.

3. **Simulador Concurrente Nativo en Bash (`pruebas-carga/simulador_carga_concurrente.sh`):**
   - Ejecucion nativa en entornos Linux, macOS y contenedores Docker mediante `curl`.
   - Soporte para hilos concurrentes en segundo plano con barreras de sincronizacion `wait`.
   - Generacion de metricas de latencia y tasa de exito.

---

## 9. Registro Consolidado de Ejecucion y Certificacion de Calidad

Ejecución del **16/11/2026** con OpenJDK 21 sobre el commit `a0a6b34` de la rama `main`. Este es el resumen que imprime cada suite:

```text
PruebasReglasNegocioTextil   Pruebas superadas con éxito: 14   Pruebas fallidas: 0
PruebasSeguridadIntegridad   Pruebas superadas con éxito: 21   Pruebas fallidas: 0
PruebasConcurrenciaYPagos    Pruebas superadas con exito: 11   Pruebas fallidas: 0
PruebasContratoApi           Pruebas superadas con exito: 9    Pruebas fallidas: 0
PruebasWebSocket             Resultados de Pruebas WebSocket: 4 exitosas, 0 fallidas.
--------------------------------------------------------------------------------
Total backend: 59 de 59 aprobadas
Frontend (node ejecutar-pruebas-frontend.mjs): Total Pruebas: 46, Aprobadas: 46 (100%)
```

Durante la ejecución aparecen avisos que no son fallos: `SESSION_SECRET no configurado` y `WOMPI_INTEGRITY_SECRET no está configurado` (en desarrollo se usan secretos temporales).

---

## 10. Manual de Comandos de Terminal para Pruebas y Validacion Integral (ADSO - SENA)

Para facilitar la reproduccion de las pruebas por parte de instructores y evaluadores del SENA, a continuacion se resumen los comandos exactos para terminal PowerShell (Windows) y Bash (Linux/macOS/Docker):

### 10.1. Pruebas del Frontend (46 pruebas, `node ejecutar-pruebas-frontend.mjs`)
```bash
# Ingresar al directorio del frontend
cd "tienda digital de telas"

# Validacion estatica de codigo y reglas de diseno
npm run lint

# Ejecucion de las 46 pruebas automatizadas (npm test llama a node ejecutar-pruebas-frontend.mjs)
npm test

# Verificacion de empaquetado para produccion
npm run build
```

### 10.2. Compilacion y Ejecucion de las 5 Suites del Backend (Java 21)
```bash
# Ingresar al directorio del servidor Java
cd "tienda digital de telas/backend-java/servidor-api"

# Compilacion limpia en Linux / macOS:
mkdir -p bin
find src -name "*.java" > sources.txt
javac -d bin -cp "lib/*" @sources.txt

# Compilacion limpia en Windows PowerShell:
New-Item -ItemType Directory -Force -Path bin
javac -encoding UTF-8 -d bin -cp "lib/*" (Get-ChildItem -Recurse src/*.java | ForEach-Object { $_.FullName })

# Ejecucion de las 5 suites en Windows (separador ';'):
java -cp "bin;lib/*" PruebasReglasNegocioTextil
java -cp "bin;lib/*" PruebasSeguridadIntegridad
java -cp "bin;lib/*" PruebasConcurrenciaYPagos
java -cp "bin;lib/*" PruebasContratoApi
java -cp "bin;lib/*" PruebasWebSocket

# Ejecucion de las 5 suites en Linux / Docker (separador ':'):
java -cp "bin:lib/*" PruebasReglasNegocioTextil
java -cp "bin:lib/*" PruebasSeguridadIntegridad
java -cp "bin:lib/*" PruebasConcurrenciaYPagos
java -cp "bin:lib/*" PruebasContratoApi
java -cp "bin:lib/*" PruebasWebSocket
```

### 10.3. Pruebas de Humo de Seguridad y RBAC con cURL
```bash
# Validacion 1: Endpoint de usuarios protegido sin Bearer token (Retorna HTTP 401 Unauthorized)
curl -i http://localhost:8081/api/usuarios

# Validacion 2: Prevencion de fraude PCI-DSS ante envio de tarjetas de credito al backend (Retorna HTTP 400 Bad Request)
curl -i -X POST http://localhost:8081/api/pedidos \
  -H "Content-Type: application/json" \
  -d '{"pan": "4532012345678910", "cvv": "123"}'

# Validacion 3: Comprobacion de sondas de disponibilidad (Healthchecks Liveness / Readiness)
curl -i http://localhost:8081/health/live
curl -i http://localhost:8081/health/ready
```

### 10.4. Verificacion del Pipeline de Integracion Continua con GitHub CLI
```bash
# Listar las ejecuciones del flujo en GitHub Actions
gh run list

# Inspeccionar el detalle de los 3 jobs (frontend, backend con las 5 suites y Docker Compose)
gh run view
```
