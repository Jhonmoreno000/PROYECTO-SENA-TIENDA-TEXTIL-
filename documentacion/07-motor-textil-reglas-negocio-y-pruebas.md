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

Ubicada en el paquete `dominio.modelos.RolloTextil`, esta clase encapsula el estado y las transiciones validas de cada rollo fisico individual almacenado en estanteria.

### 2.1. Definicion de Atributos y Estados
```java
package dominio.modelos;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class RolloTextil {

    public enum EstadoRollo {
        DISPONIBLE,         // Metraje >= 1.0m, apto para corte continuo o venta completa
        RESERVADO,          // Metraje bloqueado en proceso de corte o pago activo
        RETAZO_LIQUIDADO,   // Metraje < 1.0m, transferido a seccion de mermas/manualidades
        AGOTADO             // Metraje = 0.0m, rollo consumido en su totalidad
    }

    private Integer id;
    private String codigoRollo;         // Identificador univoco de codigo de barras/QR
    private Integer productoId;         // Referencia al catalogo de tela
    private String loteTintoreria;      // Codigo de la partida de tintoreria
    private BigDecimal metrajeInicial;  // Metros brutos con los que llego de fabrica
    private BigDecimal metrajeActual;   // Metros disponibles en tiempo real
    private EstadoRollo estadoRollo;    // Estado operativo en bodega
    private String ubicacionBodega;     // Coordenada fisica de estanteria (ej: PAS-02-EST-04)
    private LocalDateTime creadoEn;
    
    // ... Metodos de comportamiento de negocio ...
}
```

### 2.2. Metodos Nucleares de Comportamiento
- **`cortarMetraje(BigDecimal metrosACortar)`**:
  - Valida que `metrosACortar` sea estrictamente mayor a cero.
  - Valida que `metrosACortar` no exceda `metrajeActual` (prevencion de saldos negativos).
  - Descuenta el metraje con precision de dos decimales (`RoundingMode.HALF_UP`).
  - Si el remanente resultante es exactamente `0.00`, transiciona a `EstadoRollo.AGOTADO`.
  - Si el remanente resultante es menor a `1.00` metro y mayor a `0.00`, transiciona a `EstadoRollo.RETAZO_LIQUIDADO`.
  - Retorna un objeto `ResultadoCorte` con los metros cortados, el remanente y la bandera `esMerma`.

---

## 3. Servicio de Aplicacion: `ServicioCorteTextil`

Ubicado en `aplicacion.servicios.ServicioCorteTextil`, implementa la orquestacion de corte, calculo de tarifas y algoritmos de optimizacion de inventario.

### 3.1. Validacion de Continuidad de Metraje
```java
public boolean validarContinuidadMetraje(List<RolloTextil> rollos, BigDecimal metrosRequeridos) {
    if (metrosRequeridos == null || metrosRequeridos.compareTo(BigDecimal.ZERO) <= 0) {
        throw new IllegalArgumentException("El metraje solicitado debe ser estrictamente positivo.");
    }
    // Verifica si existe al menos un rollo disponible con metraje suficiente
    return rollos.stream()
            .anyMatch(r -> r.estaDisponible() && r.getMetrajeActual().compareTo(metrosRequeridos) >= 0);
}
```

### 3.2. Algoritmo de Seleccion de Rollo Optimo (Minimizacion de Merma)
Para evitar fragmentar rollos grandes e intactos cuando existen rollos ya iniciados que satisfacen la demanda, el motor aplica una estrategia de **Mejor Ajuste (*Best Fit*)**:
1. Filtra los rollos en estado `DISPONIBLE` que pertenezcan al lote de tintoreria solicitado y posean `metrajeActual >= metrosRequeridos`.
2. Ordena los candidatos de forma ascendente segun la diferencia `(metrajeActual - metrosRequeridos)`.
3. Selecciona el rollo cuyo sobrante sea minimo, preservando los rollos de 50 o 100 metros para pedidos de volumen mayorista.

### 3.3. Motor de Liquidacion de Precios por Volumen
El calculo del valor total a facturar aplica las siguientes reglas contractuales:

| Escala de Compra | Rango de Metraje | Porcentaje de Descuento | Condicion de Aplicacion |
| :--- | :--- | :--- | :--- |
| **Venta al Detal** | $0.01\text{ m} \le \text{Metros} < 15.00\text{ m}$ | $0\%$ (Precio base regular) | Aplica para compras domesticas o confeccion individual. |
| **Venta Mayorista** | $15.00\text{ m} \le \text{Metros} < 50.00\text{ m}$ | $12\%$ de descuento sobre precio base | Aplica para talleres de confeccion y pequenas fabricas. |
| **Rollo Cerrado** | $\text{Metros} \ge 50.00\text{ m}$ | $25\%$ de descuento sobre precio base | Venta de pieza industrial completa sin costo de corte. |
| **Retazo en Liquidacion** | Remanente $< 1.00\text{ m}$ | $40\%$ de descuento obligatorio | Venta de remanente para manualidades o muestrarios. |

---

## 4. Matriz de la Suite de Pruebas Unitarias del Motor Textil

Implementada en `src/PruebasReglasNegocioTextil.java`, esta suite verifica de forma exhaustiva las 14 reglas de negocio criticas del dominio textil sin dependencias de base de datos ni red:

| ID | Nombre de la Prueba | Descripcion del Escenario Evaluado | Entrada de Datos | Resultado Esperado | Estado |
| :---: | :--- | :--- | :--- | :--- | :---: |
| **P-01** | Creacion valida de rollo | Instanciacion de rollo con codigo, lote y metraje inicial. | Codigo: `ROL-001`, Lote: `LOT-2026-A`, Metros: `50.0` | Rollo en estado `DISPONIBLE`, metraje actual `50.0`. | **EXITO** |
| **P-02** | Rechazo de metraje no positivo | Validacion de frontera para metrajes negativos o iguales a cero. | Metros: `-5.0` y `0.0` | `IllegalArgumentException` lanzada y capturada. | **EXITO** |
| **P-03** | Deteccion de merma al cortar | Corte que deja un remanente menor a 1.0 metro lineal. | Rollo de `5.0m`, corte de `4.2m` (sobran `0.8m`) | Remanente = `0.8m`, bandera `esMerma = true`. | **EXITO** |
| **P-04** | Clasificacion a `RETAZO_LIQUIDADO` | Reclasificacion sistematica de estado tras generar merma. | Rollo de `5.0m`, corte de `4.2m` | `rollo.getEstadoRollo() == RETAZO_LIQUIDADO`. | **EXITO** |
| **P-05** | Bloqueo por metraje insuficiente | Intento de cortar mas metros de los existentes en el rollo. | Rollo de `10.0m`, intento de corte de `12.5m` | `IllegalStateException` lanzada, metraje inalterado. | **EXITO** |
| **P-06** | Agotamiento exacto de rollo | Corte que consume con precision la totalidad del rollo. | Rollo de `15.0m`, corte de `15.0m` (sobran `0.0m`) | Remanente = `0.0m`, `rollo.getEstadoRollo() == AGOTADO`. | **EXITO** |
| **P-07** | Validacion de continuidad | Solicitud de metraje continuo mayor al rollo maximo disponible. | Rollos de `8.0m` y `6.0m`, solicitud de `10.0m` | Retorna `false` (impide fragmentar el pedido). | **EXITO** |
| **P-08** | Consistencia de lote de tintoreria | Rechazo de abastecimiento cruzado entre lotes quimicos distintos. | Rollo Lote A (`20m`), pedido que exige Lote B | Retorna `false` (protege la homogeneidad cromatica). | **EXITO** |
| **P-09** | Tarifa Detal (< 15 metros) | Calculo de precio sin descuento para metrajes inferiores a 15m. | Precio base: `$25,000 COP`, Metros: `5.0m` | Total: `$125,000 COP` (Descuento: `$0`). | **EXITO** |
| **P-10** | Tarifa Mayorista (>= 15 metros) | Aplicacion automatica del 12% de descuento por volumen. | Precio base: `$20,000 COP`, Metros: `20.0m` | Total: `$352,000 COP` (Descuento: `$48,000 COP`). | **EXITO** |
| **P-11** | Tarifa Rollo Cerrado (>= 50 metros)| Aplicacion automatica del 25% de descuento por rollo completo. | Precio base: `$30,000 COP`, Metros: `50.0m` | Total: `$1,125,000 COP` (Descuento: `$375,000 COP`). | **EXITO** |
| **P-12** | Descuento obligatorio de retazos | Aplicacion estricta del 40% de descuento en retazos liquidados. | Precio base: `$40,000 COP`, Retazo: `0.75m` | Total: `$18,000 COP` (Valor regular: `$30,000 COP`). | **EXITO** |
| **P-13** | Seleccion de rollo optimo (Best Fit)| Eleccion del rollo que minimiza la merma residual. | Rollos de `50m`, `12m` y `6m`; pedido de `5.5m` | Selecciona rollo de `6m` (sobrante optimo de `0.5m`). | **EXITO** |
| **P-14** | Margen tecnico de confeccion (+10%)| Calculo de calculadora con holgura para encogimiento y dobladillo. | Metraje patron: `2.0m`, factor: `1.10` | Metros recomendados: `2.20m`. | **EXITO** |

---

## 5. Matriz de la Suite de Pruebas de Seguridad y Casos Extremos

Implementada en `src/PruebasSeguridadIntegridad.java`, esta suite verifica 12 escenarios criticos de ciberseguridad, validacion de entradas maliciosas y tolerancia a fallos:

| ID | Categoria de Prueba | Escenario y Vector Evaluado | Comportamiento del Sistema y Mitigacion | Estado |
| :---: | :--- | :--- | :--- | :---: |
| **S-01** | Criptografia | Hashing SHA-256 de contrasenas con caracteres UTF-8 y tildes. | Genera hash hexadecimal determinista de 64 caracteres; no almacena texto plano. | **EXITO** |
| **S-02** | Sanitizacion Web | Prevencion de Inyeccion SQL en busquedas por categoria. | Rechaza o parametriza caracteres peligrosos (`' OR '1'='1`). | **EXITO** |
| **S-03** | Sanitizacion Web | Neutralizacion de Cross-Site Scripting (XSS) en resenas. | Limpieza de etiquetas `<script>` y payloads de manipulacion DOM. | **EXITO** |
| **S-04** | Validacion de Entrada | Bloqueo de precios negativos o con multiplicacion flotante erronea. | Valida `precio > 0` usando `BigDecimal` para evitar anomalías monetarias. | **EXITO** |
| **S-05** | Control de Acceso (RBAC)| Intento de creacion de productos por usuarios con rol `cliente`. | Interceptor HTTP retorna codigo `403 Forbidden`. | **EXITO** |
| **S-06** | Integridad Transaccional| Deteccion y bloqueo de cupones con fecha de expiracion caducada. | Valida `LocalDateTime.now().isBefore(fechaExpiracion)`. Retorna error. | **EXITO** |
| **S-07** | Integridad Transaccional| Validacion de compra minima exigida por cupones comerciales. | Si subtotal < minimo_compra, rechaza aplicacion del beneficio. | **EXITO** |
| **S-08** | Resiliencia de Red | Manejo defensivo de caidas transitorias en pool de base de datos. | HikariCP captura timeout y expone probe `/health/ready` como 503. | **EXITO** |
| **S-09** | Concurrencia | Proteccion ante condiciones de carrera en reserva de metraje. | Bloqueo pesimista `SELECT ... FOR UPDATE` impide saldo negativo. | **EXITO** |
| **S-10** | Manejo de Excepciones | Prevencion de NullPointerException ante payloads JSON incompletos. | Deserializador Gson valida nulabilidad y asigna valores predeterminados. | **EXITO** |
| **S-11** | Proteccion de Privacidad | Verificacion de cero almacenamiento de PAN y CVV (PCI-DSS). | Esquema de base de datos carece de columnas para datos bancarios. | **EXITO** |
| **S-12** | Auditoria y Trazabilidad| Inmutabilidad de los registros de auditoria administrativa. | Acciones criticas generan registros con ID de usuario y marca de tiempo. | **EXITO** |

---

## 6. Matriz de la Suite de Pruebas de Concurrencia, Pagos Wompi y Dominio Financiero

Implementada en `src/PruebasConcurrenciaYPagos.java`, esta suite verifica 11 escenarios de multihilo, pasarela de pago Wompi, validaciones de cupones y proteccion contra ataques de denegacion de servicio:

| ID | Categoria de Prueba | Escenario y Vector Evaluado | Comportamiento del Sistema y Mitigacion | Estado |
| :---: | :--- | :--- | :--- | :--- | :---: |
| **C-01** | Concurrencia Multihilo | 10 hilos simultaneos compitiendo por metraje limitado en bodega. | Sincronizacion atomica y cerrojo pesimista; nunca sobrevende metraje. | **EXITO** |
| **C-02** | Rate Limiting | Rafaga masiva de solicitudes HTTP superando el umbral permitido. | El algoritmo de ventana fija o cubeta con fugas retorna HTTP 429. | **EXITO** |
| **C-03** | Pasarela Wompi | Recepcion duplicada de webhook de confirmacion de transaccion. | Manejo idempotente: se ignora el evento repetido y no se duplica la orden. | **EXITO** |
| **C-04** | Pasarela Wompi | Notificacion de transaccion con estado DECLINED o ERROR. | La orden transiciona a CANCELADA y se liberan las reservas de stock. | **EXITO** |
| **C-05** | Seguridad Wompi | Webhook con firma criptografica HMAC SHA-256 adulterada. | Se rechaza con HTTP 401/400 al no coincidir el hash calculado con el evento. | **EXITO** |
| **C-06** | Dominio Financiero | Aplicacion de cupon con fecha de expiracion superada (expira_en). | El motor financiero rechaza el cupon y arroja excepcion de regla comercial. | **EXITO** |
| **C-07** | Dominio Financiero | Aplicacion de cupon que alcanzo el limite de usos (usos_maximos). | El validador bloquea el beneficio por agotamiento del cupo asignado. | **EXITO** |
| **C-08** | Dominio Financiero | Aplicacion de cupon con subtotal menor a compra_minima exigida. | Se impide el descuento exigiendo al cliente cumplir el monto base. | **EXITO** |
| **C-09** | Precision Financiera | Calculo del 19% de IVA y redondeo exacto de centavos en pesos COP. | Uso de BigDecimal con escala 2 y HALF_UP, eliminando errores flotantes. | **EXITO** |
| **C-10** | Sanitizacion DAST | Inyeccion de codigo HTML/JavaScript malicioso en entradas de texto. | Sanitizacion estricta con escape de caracteres especiales (<, >, &, ", '). | **EXITO** |
| **C-11** | Proteccion DoS | Recepcion de cuerpo de solicitud HTTP superior a 5 MB. | Rechazo inmediato con HTTP 413 Payload Too Large antes de memoria saturada. | **EXITO** |

---

## 7. Matriz de la Suite de Pruebas de Contrato OpenAPI v3 y Arquitectura API

Implementada en `src/PruebasContratoApi.java`, esta suite verifica 7 escenarios de conformidad con el estandar OpenAPI 3.0.3 especificado en `documentacion/openapi_tienda_textil.yaml`:

| ID | Categoria de Prueba | Escenario y Vector Evaluado | Comportamiento del Sistema y Mitigacion | Estado |
| :---: | :--- | :--- | :--- | :--- | :---: |
| **API-01** | Contrato de Esquema | Estructura JSON de Producto (id, nombre, precio_metro, stock, etc.). | Validacion de presencia de campos requeridos, tipos de dato y precision. | **EXITO** |
| **API-02** | Contrato de Esquema | Estructura JSON de Pedido y Orden de Compra (items, total, estado). | Conformidad con esquema relacional y anidamiento de lineas de corte. | **EXITO** |
| **API-03** | Contrato de Esquema | Estructura JSON de Usuario y Autenticacion (token, rol, correo). | Retorno de tokens efimeros y ausencia total de contrasenas en la respuesta. | **EXITO** |
| **API-04** | Observabilidad | Esquema y codigos HTTP de endpoints de salud (/health/live y /ready). | Retorno JSON estructurado con estado "UP" y HTTP 200 OK. | **EXITO** |
| **API-05** | Contrato de Pagos | Esquema de solicitud y respuesta de Intencion de Pago Wompi. | Montos formateados en centavos enteros sin decimales flotantes segun Wompi. | **EXITO** |
| **API-06** | Trazabilidad | Presencia obligatoria y formato de la cabecera X-Correlation-ID. | Generacion o propagacion de UUID univoco para trazabilidad distribuida. | **EXITO** |
| **API-07** | Estandar de Errores | Estructura de respuestas de error segun especificacion RFC 7807. | Formato Problem Details con campos title, status, detail, timestamp. | **EXITO** |

---

## 8. Framework de Pruebas de Carga y Rendimiento Concurrente

El proyecto incluye en el directorio `pruebas-carga/` un conjunto completo de herramientas de estres y rendimiento multi-entorno para validar la resiliencia del backend Java bajo alta demanda concurrente:

1. **Script de Carga con Grafana k6 (`pruebas-carga/script_k6_estres_tienda.js`):**
   - Disenado para pruebas de carga progresiva por etapas:
     - Etapa 1 (Calentamiento): 10 usuarios virtuales (VUs) durante 20 segundos.
     - Etapa 2 (Carga nominal): 30 VUs durante 45 segundos.
     - Etapa 3 (Pico de estres): 80 a 120 VUs durante 60 segundos.
     - Etapa 4 (Enfriamiento): Reduccion a 0 VUs durante 15 segundos.
   - Umbrales de calidad definidos (*thresholds*):
     - Tasa de error HTTP menor al 1% (`http_req_failed < 0.01`).
     - Percentil 95 de tiempo de respuesta inferior a 250 ms (`http_req_duration: ['p(95)<250']`).
     - Percentil 99 inferior a 600 ms (`http_req_duration: ['p(99)<600']`).
   - Escenarios cubiertos: Probes de salud, catalogo publico de telas, banners de inicio, consulta de inventario por rollo y configuracion publica de Wompi.

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

A continuacion se presenta la transcripcion consolidada de la ejecucion de las cinco suites de pruebas automatizadas en Java ejecutadas sobre la maquina virtual Eclipse Temurin OpenJDK 21:

```text
================================================================================
REPORTE CONSOLIDADO DE PRUEBAS DE CALIDAD Y RESILIENCIA DE SOFTWARE
Proyecto: D&D Textil - Marketplace Multi-Vendedor de Telas
Compilador: OpenJDK 64-Bit Server VM (Eclipse Temurin Java 21)
Suites Ejecutadas: 5 suites integradas (Negocio, Seguridad, Concurrencia/Pagos, Contratos, Marketplace)
================================================================================

[SUITE 1: PruebasReglasNegocioTextil]
Ejecutando verificacion de reglas de negocio textiles...
  [OK] Reglas 1-14: Ciclos de rollo, continuidad, lote tintoreria, escalas, retazos (-40%), Best-Fit y calculadora +10%.
Pruebas de Negocio: 14/14 APROBADAS (100.0%)

[SUITE 2: PruebasSeguridadIntegridad]
Ejecutando verificacion de seguridad HMAC, sesiones, integridad y RBAC...
  [OK] Seguridad 1-20: Hashing SHA-256, tokens firmados, expiracion/revocacion, aislamiento RBAC entre roles, SQLi/XSS, PCI-DSS v4.0 y auditoria.
Pruebas de Seguridad e Integridad: 20/20 APROBADAS (100.0%)

[SUITE 3: PruebasConcurrenciaYPagos]
Ejecutando verificacion de concurrencia, pasarela Wompi y dominio financiero...
  [OK] Concurrencia 1-11: Prevencion de sobreventa multihilo, Rate Limiting HTTP 429, webhook Wompi idempotente y firmado, cupones, IVA 19%, XSS y limite DoS 5 MB.
Pruebas de Concurrencia y Pagos: 11/11 APROBADAS (100.0%)

[SUITE 4: PruebasContratoApi]
Ejecutando verificacion de contratos de API OpenAPI v3 y arquitectura...
  [OK] Contratos 1-9: Esquemas OpenAPI v3, healthchecks, pagos Wompi, X-Correlation-ID, errores RFC 7807 y endpoints del marketplace/antifraude.
Pruebas de Contratos OpenAPI: 9/9 APROBADAS (100.0%)

[SUITE 5: PruebasMarketplace]
Ejecutando verificacion de Marketplace Multi-Vendedor, Comisiones, VIP y Antifraude...
  [OK] Marketplace 1-8: Comision administrativa (10%) y ganancia neta vendedor, split multi-vendedor por grupo_checkout, exclusividad VIP recurrente y bloqueo HTTP 403 antifraude en precios/inventario para admin.
Pruebas de Marketplace y Antifraude: 8/8 APROBADAS (100.0%)

================================================================================
RESUMEN GENERAL:
Total de Pruebas Automatizadas en Java: 62 (+ 46 Pruebas Frontend = 108 Total)
Pruebas Aprobadas: 62/62 Backend · 46/46 Frontend (100.0%)
Pruebas Fallidas: 0 (0.0%)
Cobertura de Pruebas: Reglas Textiles, Seguridad RBAC, Concurrencia, Pagos, OpenAPI y Marketplace Antifraude
Dictamen Tecnico: APTO PARA SUSTENTACION Y DESPLIEGUE EN PRODUCCION
================================================================================
```


---

## Anexo de Ejecución de la Suite de Seguridad y Sesiones (`PruebasSeguridadIntegridad`)

Además de las pruebas unitarias del motor de corte (`PruebasReglasNegocioTextil`) y de concurrencia (`PruebasConcurrenciaYPagos`), el backend incluye la suite consolidada `PruebasSeguridadIntegridad`:

```powershell
# Compilar y ejecutar la suite de seguridad de sesiones, integridad y autorización por rol
cd "tienda digital de telas/backend-java/servidor-api"
javac -encoding UTF-8 -cp "lib/*" -d bin (Get-ChildItem -Recurse src/*.java | ForEach-Object { $_.FullName })
java -cp "bin;lib/*" PruebasSeguridadIntegridad
```

Esta suite ejecuta **20 verificaciones deterministas** sobre emisión, expiración, detección de adulteraciones de firma HMAC-SHA256, revocación de cuentas suspendidas/inactivas, prevención SQLi/XSS y aislamiento estricto entre roles.

---

## 7. Manual de Comandos de Terminal para Pruebas y Validacion Integral (ADSO - SENA)

Para facilitar la reproduccion de las pruebas por parte de instructores y evaluadores del SENA, a continuacion se resumen los comandos exactos para terminal PowerShell (Windows) y Bash (Linux/macOS/Docker):

### 7.1. Pruebas Unitarias del Frontend (React + Vitest)
```bash
# Ingresar al directorio del frontend
cd "tienda digital de telas"

# Validacion estatica de codigo y reglas de diseno
npm run lint

# Ejecucion de pruebas unitarias automatizadas
npm test

# Verificacion de empaquetado para produccion
npm run build
```

### 7.2. Compilacion y Ejecucion de las 5 Suites del Backend (Java 21 — 62 Pruebas)
```bash
# Ingresar al directorio del servidor Java
cd "tienda digital de telas/backend-java/servidor-api"

# Compilacion limpia en Linux / macOS:
mkdir -p bin
find src -name "*.java" > sources.txt
javac -encoding UTF-8 -d bin -cp "lib/*" @sources.txt

# Compilacion limpia en Windows PowerShell:
New-Item -ItemType Directory -Force -Path bin
javac -encoding UTF-8 -d bin -cp "lib/*" (Get-ChildItem -Recurse src/*.java | ForEach-Object { $_.FullName })

# Ejecucion de las 5 suites en Windows (separador ';'):
java -cp "bin;lib/*" PruebasReglasNegocioTextil
java -cp "bin;lib/*" PruebasSeguridadIntegridad
java -cp "bin;lib/*" PruebasConcurrenciaYPagos
java -cp "bin;lib/*" PruebasContratoApi
java -cp "bin;lib/*" PruebasMarketplace

# Ejecucion de las 5 suites en Linux / Docker (separador ':'):
java -cp "bin:lib/*" PruebasReglasNegocioTextil
java -cp "bin:lib/*" PruebasSeguridadIntegridad
java -cp "bin:lib/*" PruebasConcurrenciaYPagos
java -cp "bin:lib/*" PruebasContratoApi
java -cp "bin:lib/*" PruebasMarketplace
```

### 7.3. Pruebas de Humo de Seguridad y RBAC con cURL
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

### 7.4. Verificacion del Pipeline de Integracion Continua con GitHub CLI
```bash
# Listar las ejecuciones del flujo en GitHub Actions
gh run list

# Inspeccionar el detalle de aprobacion de los 3 jobs
gh run view
```
