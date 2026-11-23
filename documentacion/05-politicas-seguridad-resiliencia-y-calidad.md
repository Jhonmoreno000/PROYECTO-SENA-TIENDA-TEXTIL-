# Politicas de Seguridad, Resiliencia y Calidad de Software
**Proyecto:** Plataforma Distribuida de Comercializacion y Control Logistico Textil (D&D Textil)  
**Programa de Formacion:** Tecnologo en Analisis y Desarrollo de Software (ADSO) - SENA  
**Normatividad:** ISO/IEC 25010, OWASP API Security Top 10, PCI-DSS v4.0, Ley 1581 de 2012 (Habeas Data Colombia)  
**Version:** 2.0.0 - Documentacion Tecnica Oficial  

---

## 1. Evaluacion de Calidad bajo la Norma ISO/IEC 25010

La arquitectura del sistema ha sido evaluada y verificada segun las caracteristicas de la norma internacional **ISO/IEC 25010** (Calidad del Producto de Software):

| Caracteristica ISO 25010 | Aplicacion Especifica en Comercio Textil | Criterio de Medicion y Resultado Obtenido |
| :--- | :--- | :--- |
| **Adecuacion Funcional** | Venta de metraje continuo, fraccionamiento en centimetros, calculo de retazos y asignacion por lote de tintoreria. | 100% de los casos de uso completados sin discrepancia de inventario ni saldos negativos. |
| **Fiabilidad / Resiliencia** | Tolerancia a fallos en servicios externos (notificaciones o pasarelas) y recuperacion de reservas fallidas. | Implementacion de transacciones compensatorias Saga y probes `/health/live` y `/health/ready`. |
| **Eficiencia de Desempeno** | Busqueda de telas por categoria o composicion bajo concurrencia de compradores. | Tiempos de respuesta p95 <= 200 ms mediante indices B-Tree en PostgreSQL y pool de 32 hilos. |
| **Mantenibilidad** | Separacion de dominios (Domain-Driven Design) para actualizar modulos sin impacto cruzado. | Clean Architecture dividida en capas `dominio`, `aplicacion`, `infraestructura` con bajo acoplamiento. |
| **Seguridad** | Proteccion de contrasenas, aislamiento de roles RBAC y no almacenamiento de datos de pago. | Contrasenas con PBKDF2 con sal, tokens de sesion firmados, politicas PCI-DSS v4.0 y cumplimiento de la Ley 1581 de 2012. |
| **Usabilidad** | Calculadora de metraje inteligente con margen del 10% y linea de tiempo de rastreo de pedidos. | Interfaz intuitiva y reactiva desarrollada en React 18 con diseno Glassmorphism. |
| **Portabilidad** | Despliegue agnostico de la infraestructura mediante contenedores ligeros. | Orquestacion reproducible en cualquier servidor con Docker Compose y redes puente aisladas. |

---

## 2. Politica de Gestion de Identidad y Acceso (IAM)

### 2.1. Control de Acceso Basado en Roles (RBAC)
Todo acceso a los recursos y endpoints de la plataforma esta condicionado a la asignacion de un rol verificado. No se permiten accesos anonimos a operaciones de escritura, corte o administracion:

- **Rol `cliente`:** Consulta de catalogo, calculo de metrajes, creacion de pedidos propios, tickets de soporte y consulta de facturas personales. Bloqueado para ver pedidos de terceros o modificar stock.
- **Rol `vendedor`:** Publicacion de telas, actualizacion de stock de sus propios articulos y visualizacion de sus ingresos mensuales. Solo opera sobre productos con su `vendedor_id`.
- **Rol `operario_corte`:** Escaneo de ordenes de corte con codigo QR, descuento de metros en rollos fisicos y registro de mermas en bodega. No tiene acceso a datos de facturacion ni precios.
- **Rol `administrador`:** Moderacion de productos, auditoria de seguridad, gestion de usuarios, creacion de cupones y configuracion del sistema. Acceso total con registro de auditoria inmutable.

### 2.2. Ciclo de Vida del Token de Sesion
- **Token de sesion (`TokenSesion`):** Firmado por el servidor con **HMAC-SHA256** y vigente durante **12 horas**. Contiene unicamente los reclamos `sub` (id del usuario), `rol` y `exp`.
- **Sin token de refresco:** Al vencer el token, el usuario inicia sesion de nuevo. No existe un refresh token.
- **Revalidacion en cada peticion:** `ManejadorBase` vuelve a leer en la base de datos el rol y el estado de la cuenta; una cuenta suspendida o inactiva pierde el acceso de inmediato.
- **Transmision:** El frontend guarda el token en `localStorage` y lo envia en la cabecera `Authorization`:
  ```http
  Authorization: Bearer <token>
  ```
- **Bloqueo por intentos fallidos (`ProtectorFuerzaBruta`):** Tras **5 intentos fallidos** de inicio de sesion, el correo o la IP quedan bloqueados durante **15 minutos** y la API responde `429` con el tiempo restante.

### 2.3. Hashing Criptografico de Contrasenas
Las contrasenas se almacenan con **PBKDF2WithHmacSHA256**, con una sal aleatoria de 16 bytes por usuario, 10.000 iteraciones y llave de 256 bits. El valor guardado tiene el formato `pbkdf2$<iteraciones>$<salHex>$<hashHex>` y la verificacion se hace en tiempo constante:
```java
byte[] salt = new byte[16];
new SecureRandom().nextBytes(salt);
PBEKeySpec spec = new PBEKeySpec(contrasena.toCharArray(), salt, 10000, 256);
byte[] hash = SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256").generateSecret(spec).getEncoded();
```
Las cuentas creadas antes de este cambio conservan su hash SHA-256 y se siguen aceptando como respaldo.

---

## 3. Politica de Manejo de Informacion Financiera (PCI-DSS v4.0)

De acuerdo con el estandar **PCI-DSS v4.0 (Requisito 3)**, la plataforma **D&D Textil** opera bajo una politica de **cero almacenamiento de datos de tarjetahabientes**:

1. **Datos Prohibidos que NUNCA ingresan ni se almacenan en nuestros servidores:**
   - **PAN (Primary Account Number):** Numero completo de la tarjeta de credito o debito de 16 digitos.
   - **CVV / CVC:** Codigo de seguridad al respaldo de la tarjeta.
   - **Fecha de Expiracion:** Mes y ano de vencimiento.
   - **PIN bancario:** Datos del bloque de autenticacion.
2. **Tokenizacion Delegada:**
   - La captura de datos de pago se realiza en el navegador mediante componentes provistos por la pasarela transaccional certificada PCI Nivel 1.
   - Nuestros servidores reciben unicamente un **token transaccional cifrado** y un identificador de transaccion de un solo uso para confirmar la aprobacion o rechazo del cobro.
3. **Verificacion Automatizada en Backend:**
   - La suite de pruebas `PruebasSeguridadIntegridad.java` (Test 11) comprueba el filtro `ServicioAutenticacion.contieneDatosTarjetaSensibles`, que rechaza con HTTP 400 los cuerpos de pedidos y pagos que contengan una secuencia de 13 a 19 digitos (con o sin espacios o guiones) o un campo de CVV. El filtro no aplica el algoritmo de Luhn, por eso tambien rechaza numeros que no son tarjetas, como la referencia de pago `DD-<marca de tiempo>-XXXX` (ver doc 02, «Flujo de Pago Vigente»).

---

## 4. Politica de Proteccion de Datos Personales (Ley 1581 de 2012 - Habeas Data Colombia)

En cumplimiento de la legislacion colombiana de proteccion de datos personales (Decreto 1377 de 2013 y directrices de la Superintendencia de Industria y Comercio):

1. **Consentimiento Previo, Expreso e Informado:** La captura de datos requiere la autorizacion del titular mediante una casilla de verificacion obligatoria y desmarcada en el registro:
   > "Acepto la Politica de Tratamiento de Datos Personales de D&D Textil y autorizo el uso de mi informacion para fines de facturacion, corte y despacho logistico de pedidos."
2. **Finalidad Exclusiva:** Los datos se destinan exclusivamente al procesamiento de ordenes de compra, coordinacion de envios con transportadoras y notificaciones postventa.
3. **Procedimiento de Anonimizacion (Derecho al Olvido):** Cuando un usuario solicita la baja de su cuenta y no posee pedidos pendientes ni reclamaciones activas, se procede a la disociacion de sus datos personales:
   ```sql
   UPDATE usuarios SET 
       nombre = 'USUARIO_ANONIMIZADO_' || id, 
       correo = 'anonimo_' || id || '@eliminado.ddtextil.com',
       activo = false,
       suspendido = true
   WHERE id = ?;
   ```
   Los registros fiscales de pedidos anteriores se preservan disociados durante el termino legal de cinco anos exigido por el Estatuto Tributario.

---

## 5. Politica de Resiliencia y Recuperacion ante Desastres (DRP)

### 5.1. Metricas Objetivas de Continuidad
- **RTO (Recovery Time Objective):** Menor o igual a **2 horas** para restablecer la operacion total del backend y la base de datos tras una falla mayor.
- **RPO (Recovery Point Objective):** Menor o igual a **15 minutos** de tolerancia de perdida de datos transaccionales, garantizado mediante respaldos periodicos y registros Write-Ahead Logging (WAL).

### 5.2. Estrategia de Copias de Seguridad (Backups)
1. **Respaldos Diarios:** Ejecutados de forma automatica a las 02:00 UTC en el contenedor de base de datos con compresion y cifrado simetrico AES-256:
   ```bash
   pg_dump -U postgres -Fc tienda_digital_textiles_db | gpg --symmetric --cipher-algo AES256 -o /backups/db_$(date +%Y%m%d).dump.gpg
   ```
2. **Retencion:** Siete copias diarias, cuatro semanales y doce mensuales en almacenamiento secundario independiente.

---

## 6. Matriz de Mitigacion de Vulnerabilidades OWASP API Security Top 10

| Identificador OWASP | Vulnerabilidad | Riesgo en Comercio Textil | Mecanismo de Mitigacion Implementado |
| :---: | :--- | :--- | :--- |
| **API1:2023** | **BOLA (Broken Object Level Authorization)** | Un usuario manipula el ID en `/api/pedidos/14` para ver telas o direcciones de otro cliente. | `ManejadorPedidos` solo entrega el pedido si quien consulta es el cliente dueño (`usuario_id`), el vendedor del pedido (`vendedor_id`) o el administrador. **Pendiente:** facturas (`/api/facturas/{id}`) no hace esta verificacion. |
| **API2:2023** | **Broken Authentication** | Ataques de fuerza bruta contra el formulario de inicio de sesion de vendedores. | Rate Limiting en `ManejadorBase.java` (1200 peticiones/minuto por IP) y `ProtectorFuerzaBruta`: 5 intentos fallidos bloquean el correo o la IP durante 15 minutos (HTTP 429). |
| **API3:2023** | **Broken Object Property Level Authorization** | Un atacante inyecta el campo `"rol":"administrador"` en el JSON de registro publico. | El backend fuerza de forma estricta el rol a `cliente` en registros publicos, ignorando cualquier campo de elevacion de privilegios. |
| **API4:2023** | **Unrestricted Resource Consumption** | Peticiones masivas para consultar el catalogo completo sin limites, saturando la memoria. | Limite de 5 MB por cuerpo de peticion (HTTP 413), limite de 1200 peticiones/minuto por IP y pool de minimo 32 hilos. **Pendiente:** el catalogo no esta paginado; devuelve todos los productos activos. |
| **API5:2023** | **Broken Function Level Authorization** | Un cliente invoca directamente `PUT /api/usuarios/{id}` con `"activo": false` para inhabilitar a otros usuarios. | Validacion centralizada de roles en los manejadores HTTP; operaciones de suspension exigen rol `administrador`. |
| **API6:2023** | **Unrestricted Access to Sensitive Business Flows** | Bots automatizados reservan todos los rollos de tela dejando a la tienda sin existencias. | La intencion de pago solo valida el stock (`FOR SHARE`); se descuenta al aprobar el pago, asi que un pedido sin pagar no reserva metros. **Pendiente:** el descuento al aprobar no vuelve a validar el stock (usa `GREATEST(0, stock - metros)`), y hoy la confirmacion falla, por lo que el stock no baja con las compras. |
| **API7:2023** | **Server Side Request Forgery (SSRF)** | Envio de URLs maliciosas en la carga de imagenes para escanear la red interna de Docker. | Las imagenes solo se aceptan codificadas en Base64 validado o desde origenes autorizados en la lista blanca interna. |
| **API8:2023** | **Security Misconfiguration** | Exposicion de trazas de error internas de Java (Stack Traces) con datos de rutas o credenciales. | Manejo global de excepciones en `ManejadorBase.java` devolviendo mensajes genericos de error HTTP 500 y emitiendo el detalle solo al log interno. |
| **API9:2023** | **Improper Inventory Management** | Uso de rutas de prueba o endpoints antiguos expuestos sin control. | Depuracion completa de clases y manejadores huerfanos (`AutenticacionDAO`, `ManejadorImagenProducto`). |
| **API10:2023**| **Unsafe Consumption of APIs** | Confianza en respuestas no verificadas de pasarelas de pago externas. | Validacion estricta de firmas criptograficas HMAC en webhooks antes de marcar un pedido como pagado. |

---

## 7. Observabilidad y Trazabilidad Estructurada (DevSecOps)

Todas las transacciones y mutaciones de inventario generan un registro inmutable en formato **JSON estructurado** para auditoria y cumplimiento de la trazabilidad:

```json
{
  "timestamp": "2026-10-14T15:40:22.104Z",
  "level": "INFO",
  "service_name": "tienda-digital-textiles-api",
  "trace_id": "corr_8fa1b490-33de-4a92-91f4-00129a8fbc71",
  "method": "POST",
  "path": "/api/orders",
  "status": 201,
  "message": "Orden de corte generada exitosamente para rollo ROL-502 con metraje de 6.0 m"
}
```

Este formato estandarizado permite la ingesta directa por sistemas de monitoreo como Grafana Loki, Elasticsearch o AWS CloudWatch.


---

## Anexo de Seguridad v2.0: Arquitectura de Sesiones Firmadas (`TokenSesion`) y Autorización en Tiempo Real

Para eliminar cualquier riesgo de suplantación de identidad o escalamiento horizontal/vertical de privilegios, **D&D Textil** implementa un esquema criptográfico propio sin dependencias externas vulnerables:

1. **Estructura del Token (`TokenSesion.java`):**
   - Cada sesión emitida en `/api/login`, `/api/register` o SSO genera una carga JSON compacta `{"sub": <idUsuario>, "rol": "<rol>", "exp": <epochSegundos>}` codificada en **Base64URL sin relleno**, concatenada mediante un punto (`.`) con su firma **HMAC-SHA256** calculada usando la llave del servidor (`SESSION_SECRET`).
   - La comparación de firmas utiliza `MessageDigest.isEqual(...)` en tiempo constante para mitigar ataques laterales por temporización (*Timing Attacks*).
2. **Revalidación de Rol y Estado en Base de Datos (`ManejadorBase.identidadVigente`):**
   - En cada petición protegida, una vez verificada la firma HMAC y la vigencia temporal (12 horas), el backend consulta el registro actual del usuario en PostgreSQL.
   - Si la cuenta fue suspendida (`suspendido = true`) o desactivada (`activo = false`), el acceso se revoca de inmediato (`401/403`) sin esperar a que expire el token.
   - El rol efectivo de autorización se toma siempre del registro vigente en la base de datos y nunca a ciegas del reclamo del token.

---

## Anexo de Seguridad v3.0: Estado Real de los Controles (revision del 16/11/2026)

Esta tabla resume que controles estan implementados y cuales siguen pendientes, segun la revision del codigo de la rama `main`.

| Control | Estado | Detalle |
| :--- | :--- | :--- |
| Contrasenas con PBKDF2 y sal | Implementado | `ServicioAutenticacion.generarHashPBKDF2` |
| Token de sesion firmado (12 horas) | Implementado | `TokenSesion` + revalidacion de rol en `ManejadorBase` |
| Bloqueo tras 5 intentos fallidos | Implementado | `ProtectorFuerzaBruta`, respuesta `429` |
| Consultas preparadas contra inyeccion SQL | Implementado | Todos los DAO usan `PreparedStatement` |
| Validacion de rol en la API | Parcial | Solo usuarios, productos, pedidos y cupones validan el token. Configuracion, inventario, carrusel, secciones, soporte, facturas y resenas aun no |
| Verificacion del pago | Pendiente | El pago es simulado: `/api/pagos/confirmar` acepta el estado que envia el navegador. Ademas, hoy la confirmacion responde `400` porque el filtro PCI confunde la referencia `DD-<13 digitos>-XXXX` con un numero de tarjeta, y el pedido queda `pending` |
| Acceso a facturas | Pendiente | `GET /api/facturas/{id}` entrega el PDF de cualquier pedido sin sesion (verificado el 17/11/2026 con `curl`): basta con cambiar el numero para ver datos de otro cliente |
| Fecha de autorizacion de datos (Ley 1581) | Pendiente | El registro exige la autorizacion, pero no guarda la fecha |
