# Modulo de Pruebas Integrales y de Rendimiento - D&D Textil

Este directorio contiene las herramientas y especificaciones de pruebas de rendimiento, carga concurrente y estres para la plataforma **D&D Textil**, disenadas para cumplir los requerimientos de evaluacion **ISO/IEC 25010** y la sustentacion tecnica **SENA ADSO**.

---

## 1. Inventario Consolidado de Suites de Pruebas

El sistema cuenta con 4 suites de pruebas unitarias y de integracion implementadas en Java puro (sin dependencias externas pesadas) y 3 herramientas de pruebas de carga:

### Suites de Backend (Java)
1. **Reglas de Negocio Textil (`PruebasReglasNegocioTextil.java`):**
   - Continuidad de corte contra lotes de tintoreria.
   - Algoritmo de mermas y reclasificacion de retazos sub-metro (< 1.0 m con 40% de descuento).
   - Tarifas escalonadas (detal, mayorista >= 15m, rollo cerrado >= 50m).
2. **Seguridad e Integridad del Sistema (`PruebasSeguridadIntegridad.java`):**
   - Hash determinista SHA-256 en UTF-8.
   - Prevencion de Inyeccion SQL (SQLi) y Path Traversal en `/uploads`.
   - Cumplimiento Habeas Data (Ley 1581 de 2012) y proteccion PCI-DSS (deteccion de PAN y CVV).
   - Extraccion segura de parametros numericos en rutas REST.
3. **Concurrencia, Wompi y DAST (`PruebasConcurrenciaYPagos.java`):**
   - Aislamiento multihilo y bloqueo pesimista ante demanda que supera el stock disponible.
   - Resistencia de Rate Limiting ante rafagas de 150 peticiones simultaneas.
   - Idempotencia de Webhooks de Wompi ante reintentos de red duplicados.
   - Manejo de transacciones bancarias fallidas (DECLINED / ERROR / VOIDED).
   - Deteccion de manipulacion criptografica (Tampering) en montos y divisas.
   - Ciclo de vida y validacion de cupones (expirados, limite de usos, compra minima).
   - Sanitizacion activa contra Cross-Site Scripting (Anti-XSS).
   - Limite de tamano de carga util (5 MB) contra ataques de denegacion de servicio.
4. **Contratos de API REST OpenAPI v3 (`PruebasContratoApi.java`):**
   - Validacion de esquemas JSON contra `documentacion/openapi_tienda_textil.yaml`.
   - Presencia de cabeceras de observabilidad (`X-Correlation-ID`) y `Content-Type: application/json; charset=UTF-8`.
   - Estandar de formato de error uniforme (RFC 7807).

---

## 2. Como Ejecutar las Suites de Pruebas en Java

Desde la carpeta del backend (`tienda digital de telas/backend-java/servidor-api`):

### Compilacion:
```bash
# Compilar todo el codigo fuente incluyendo las suites de prueba
mkdir -p bin
javac -encoding UTF-8 -cp "lib/*" -d bin src/*.java src/dominio/modelos/*.java src/dominio/repositorios/*.java src/dominio/excepciones/*.java src/aplicacion/servicios/*.java src/infraestructura/configuracion/*.java src/infraestructura/persistencia/jdbc/*.java src/infraestructura/api/*.java src/infraestructura/api/manejadores/*.java
```

### Ejecucion de Suites:
```bash
# Suite 1: Reglas de Negocio Textil
java -cp "bin;lib/*" PruebasReglasNegocioTextil

# Suite 2: Seguridad e Integridad
java -cp "bin;lib/*" PruebasSeguridadIntegridad

# Suite 3: Concurrencia, Pagos Wompi y DAST
java -cp "bin;lib/*" PruebasConcurrenciaYPagos

# Suite 4: Contratos de API OpenAPI v3
java -cp "bin;lib/*" PruebasContratoApi
```

---

## 3. Pruebas de Carga y Rendimiento

### Opcion A: Con k6 (Recomendado para CI/CD)
Si tienes instalado k6 ([k6.io](https://k6.io)):
```bash
k6 run pruebas-carga/script_k6_estres_tienda.js
```

### Opcion B: Con PowerShell (Nativo en Windows, sin herramientas externas)
```powershell
powershell -ExecutionPolicy Bypass -File pruebas-carga/simulador_carga_concurrente.ps1 -BaseUrl "http://localhost:8081" -PeticionesTotales 200 -Concurrencia 20
```

### Opcion C: Con Bash (Linux / macOS / WSL)
```bash
chmod +x pruebas-carga/simulador_carga_concurrente.sh
./pruebas-carga/simulador_carga_concurrente.sh http://localhost:8081 100 10
```


## 3. Criterios de Aceptación y Acuerdos de Nivel de Servicio (SLA — ISO/IEC 25010)

| Métrica Evaluada en k6 | Umbral Máximo Permitido | Comportamiento Esperado del Backend Java |
| :--- | :---: | :--- |
| **Latencia Percentil 95 (`http_req_duration p(95)`)** | $< 500\text{ ms}$ | Pool de hilos concurrente y HikariCP absorben ráfagas de lectura y escritura sin encolamiento crítico. |
| **Tasa de Errores Inesperados (HTTP 5xx)** | $0,0\%$ | Ninguna petición concurrente debe provocar excepciones no controladas ni fugas de conexiones JDBC. |
| **Integridad de Stock bajo Carrera (`POST /api/orders`)** | **0 sobreventas** | Las órdenes que exceden el metraje disponible del rollo reciben rechazo controlado HTTP `400` mientras el stock permanece $\ge 0,0\text{ m}$. |
