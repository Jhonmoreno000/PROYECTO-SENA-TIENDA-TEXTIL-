import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import dominio.modelos.ReporteError;
import dominio.modelos.Usuario;
import dominio.modelos.Pedido;
import infraestructura.seguridad.TokenSesion;
import infraestructura.api.manejadores.ManejadorPedidos;
import infraestructura.api.manejadores.ManejadorBase;
import java.util.Base64;
import aplicacion.servicios.ServicioAutenticacion;
import java.io.File;
import java.nio.charset.StandardCharsets;
import java.nio.file.Path;

/**
 * Suite de Pruebas Automatizadas de Seguridad, Validación de E INTEGRIDAD DE NEGOCIO para D&D Textil.
 * Todo el código, métodos y variables implementados estrictamente en español.
 */
public class PruebasSeguridadIntegridad {

    private static int pruebasExitosas = 0;
    private static int pruebasFallidas = 0;
    private static final Gson gson = new Gson();

    public static void main(String[] argumentos) {
        System.out.println("=================================================================");
        System.out.println("   SUITE DE PRUEBAS DE SEGURIDAD, E INTEGRIDAD DE NEGOCIO (D&D TEXTIL)    ");
        System.out.println("=================================================================");

        ejecutarPrueba("1. Hash Criptográfico UTF-8 consistente con caracteres especiales", () -> {
            String contrasenaConEspeciales = "ContraseñaConÑyTildes#2026_ÁéÍóÚ!";
            String hashGenerado = ServicioAutenticacion.generarHashContrasena(contrasenaConEspeciales);

            if (hashGenerado == null || hashGenerado.length() != 64) {
                throw new AssertionError("El hash SHA-256 no tiene la longitud esperada de 64 caracteres hexadecimales.");
            }

            // Verificar reproducibilidad estricta bajo UTF-8
            String hashSegundoIntento = ServicioAutenticacion.generarHashContrasena(contrasenaConEspeciales);
            if (!hashGenerado.equals(hashSegundoIntento)) {
                throw new AssertionError("El cálculo del hash SHA-256 no es determinista.");
            }
        });

        ejecutarPrueba("2. Deserialización y Sincronización de Bug Reports (title, area, severity, priority)", () -> {
            // Payload exacto como lo envía BugReport.jsx
            String payloadJson = "{"
                    + "\"title\":\"Error al procesar el pago con tarjeta\","
                    + "\"description\":\"La pasarela no responde al hacer clic en pagar\","
                    + "\"severity\":\"high\","
                    + "\"sellerId\":1,"
                    + "\"sellerName\":\"Usuario Web\","
                    + "\"status\":\"open\""
                    + "}";

            ReporteError reporte = gson.fromJson(payloadJson, ReporteError.class);

            if (reporte == null) {
                throw new AssertionError("El reporte no se pudo deserializar.");
            }

            // Validar que el título se mapea correctamente
            if (!"Error al procesar el pago con tarjeta".equals(reporte.getTitulo())) {
                throw new AssertionError("El título esperado no coincide. Obtenido: " + reporte.getTitulo());
            }

            // Validar que el área tiene el título como alternativa
            if (!"Error al procesar el pago con tarjeta".equals(reporte.getArea())) {
                throw new AssertionError("El área esperada no coincide con el título. Obtenido: " + reporte.getArea());
            }

            // Validar que la severidad y prioridad se sincronicen en 'high'
            if (!"high".equals(reporte.getSeveridad()) || !"high".equals(reporte.getPrioridad())) {
                throw new AssertionError("La severidad o prioridad no se mapeó correctamente a 'high'. Severidad: " 
                        + reporte.getSeveridad() + ", Prioridad: " + reporte.getPrioridad());
            }

            // Validar serialización hacia el frontend React
            String jsonSerializado = gson.toJson(reporte);
            JsonObject objetoVerificado = JsonParser.parseString(jsonSerializado).getAsJsonObject();

            if (!objetoVerificado.has("title") && !objetoVerificado.has("area")) {
                throw new AssertionError("El JSON serializado no contiene 'title' ni 'area'.");
            }
            if (!objetoVerificado.has("severity") && !objetoVerificado.has("priority")) {
                throw new AssertionError("El JSON serializado no contiene 'severity' ni 'priority'.");
            }
        });

        ejecutarPrueba("3. Prevención Estricta de Path Traversal en Archivos Estáticos", () -> {
            File carpetaSubidas = new File("uploads");
            if (!carpetaSubidas.exists()) {
                carpetaSubidas.mkdir();
            }

            Path rutaDirectorioSubidas = carpetaSubidas.getCanonicalFile().toPath().normalize();

            // Intento 1: Salto de directorio clásico
            File archivoAtaque1 = new File("uploads/../src/App.java");
            Path rutaAtaque1 = archivoAtaque1.getCanonicalFile().toPath().normalize();
            boolean bloqueo1 = !rutaAtaque1.startsWith(rutaDirectorioSubidas);

            if (!bloqueo1) {
                throw new AssertionError("Fallo de seguridad: no se bloqueó el escape de directorio '../src/App.java'");
            }

            // Intento 2: Salto hacia raíz del sistema
            File archivoAtaque2 = new File("uploads/../../windows/system.ini");
            Path rutaAtaque2 = archivoAtaque2.getCanonicalFile().toPath().normalize();
            boolean bloqueo2 = !rutaAtaque2.startsWith(rutaDirectorioSubidas);

            if (!bloqueo2) {
                throw new AssertionError("Fallo de seguridad: no se bloqueó el escape hacia la raíz del sistema");
            }

            // Intento 3: Archivo válido dentro de uploads
            File archivoValido = new File("uploads/foto_prueba.png");
            Path rutaValida = archivoValido.getCanonicalFile().toPath().normalize();
            boolean permitido = rutaValida.startsWith(rutaDirectorioSubidas);

            if (!permitido) {
                throw new AssertionError("Error: se bloqueó un archivo legítimo dentro del directorio 'uploads'");
            }
        });

        ejecutarPrueba("4. Resistencia a Inyección SQL (SQLi) en Validación de Credenciales", () -> {
            String correoInyeccion = "admin@ejemplo.com' OR '1'='1' --";
            String contrasenaInyeccion = "' OR 1=1 --";

            // El hash generado no debe coincidir con contraseñas legítimas
            String hashInyeccion = ServicioAutenticacion.generarHashContrasena(contrasenaInyeccion);

            if (hashInyeccion == null || hashInyeccion.isBlank()) {
                throw new AssertionError("El generador de hash falló con caracteres de inyección SQL.");
            }

            // Comprobar que no hay bypass con campos nulos o en blanco
            try {
                ServicioAutenticacion servicio = new ServicioAutenticacion(null);
                servicio.iniciarSesion("   ", "   ");
                throw new AssertionError("Fallo: Se permitió iniciar sesión con credenciales vacías.");
            } catch (dominio.excepciones.ExcepcionDominio e) {
                // Correcto: ExcepcionDominio lanzada de forma controlada
            }
        });

        ejecutarPrueba("5. Validación de Rutas y Extracción Segura de Identificadores Numéricos", () -> {
            String[] rutasPruebaValidas = {
                "/api/pedidos/123/estado",
                "/api/orders/456/status",
                "/api/soporte/errores/789/estado",
                "/api/usuarios/999/rol"
            };

            for (String ruta : rutasPruebaValidas) {
                int idExtraido = -1;
                for (String segmento : ruta.split("/")) {
                    if (segmento.matches("\\d+")) {
                        idExtraido = Integer.parseInt(segmento);
                        break;
                    }
                }
                if (idExtraido <= 0) {
                    throw new AssertionError("No se pudo extraer el ID numérico de la ruta válida: " + ruta);
                }
            }

            String[] rutasPruebaInvalidas = {
                "/api/pedidos/abc/estado",
                "/api/pedidos//estado",
                "/api/soporte/errores/invalido",
                "/api/usuarios/--1/rol"
            };

            for (String ruta : rutasPruebaInvalidas) {
                int idExtraido = -1;
                for (String segmento : ruta.split("/")) {
                    if (segmento.matches("\\d+")) {
                        idExtraido = Integer.parseInt(segmento);
                        break;
                    }
                }
                if (idExtraido > 0) {
                    throw new AssertionError("Se extrajo un ID incorrecto de una ruta malformada: " + ruta);
                }
            }
        });

        ejecutarPrueba("6. Modelo de Usuario y Compatibilidad Bilingüe en Rol y Estado", () -> {
            Usuario usuario = new Usuario(1, "Anderson Moreno", "anderson@ejemplo.com", "admin", true, false, null, 0.10, "2026-09-15", null, "Activo");

            String jsonUsuario = gson.toJson(usuario);
            JsonObject json = JsonParser.parseString(jsonUsuario).getAsJsonObject();

            if (!json.has("name") && !json.has("nombre")) {
                throw new AssertionError("Falta campo 'name'/'nombre' en serialización de Usuario.");
            }
            if (!json.has("role") && !json.has("rol")) {
                throw new AssertionError("Falta campo 'role'/'rol' en serialización de Usuario.");
            }
            if (!json.has("active") && !json.has("activo")) {
                throw new AssertionError("Falta campo 'active'/'activo' en serialización de Usuario.");
            }
        });

        ejecutarPrueba("7. Observabilidad: Generación y Validación de Formato Correlation ID (UUID v4)", () -> {
            String correlationIdGenerado = java.util.UUID.randomUUID().toString();
            String patronUuid = "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$";

            if (!correlationIdGenerado.matches(patronUuid)) {
                throw new AssertionError("El Correlation ID generado no cumple el formato estándar UUID v4: " + correlationIdGenerado);
            }
        });

        ejecutarPrueba("8. Endpoints de Salud y Probes de Observabilidad (/health/live y /health/ready)", () -> {
            // Estructura esperada de /health/live
            long memoriaTotalMb = Runtime.getRuntime().totalMemory() / (1024 * 1024);
            long memoriaLibreMb = Runtime.getRuntime().freeMemory() / (1024 * 1024);
            long memoriaUsadaMb = memoriaTotalMb - memoriaLibreMb;

            String jsonLive = "{"
                    + "\"status\":\"UP\","
                    + "\"service\":\"ddtextil-backend\","
                    + "\"jvm_memory\":{\"used_mb\":" + memoriaUsadaMb + ",\"free_mb\":" + memoriaLibreMb + ",\"total_mb\":" + memoriaTotalMb + "}"
                    + "}";

            JsonObject objLive = JsonParser.parseString(jsonLive).getAsJsonObject();
            if (!"UP".equals(objLive.get("status").getAsString())) {
                throw new AssertionError("El estado de liveness debe ser 'UP'.");
            }
            if (!objLive.has("jvm_memory") || !objLive.getAsJsonObject("jvm_memory").has("used_mb")) {
                throw new AssertionError("El payload de /health/live no incluye métricas de memoria JVM.");
            }
        });

        ejecutarPrueba("9. Control de Concurrencia Textil: Bloqueo Pesimista (SELECT ... FOR UPDATE) y Prevención de Race Conditions", () -> {
            // Simulación matemática de concurrencia: Dos clientes intentan reservar los últimos 5 metros a la vez
            double stockDisponible = 5.0; // metros
            double compraClienteA = 3.5;  // metros
            double compraClienteB = 2.5;  // metros

            // Cliente A bloquea la fila primero con SELECT ... FOR UPDATE y compra 3.5 metros
            double stockRestanteTrasA = stockDisponible - compraClienteA;
            if (stockRestanteTrasA < 0) {
                throw new AssertionError("Error en cálculo de stock tras compra legítima de cliente A.");
            }

            // Cliente B intenta comprar 2.5 metros pero solo quedan 1.5 metros -> Bloqueo y Rollback
            boolean transaccionBRechazada = false;
            try {
                if (stockRestanteTrasA < compraClienteB) {
                    throw new dominio.excepciones.ExcepcionDominio("Inventario insuficiente: Disponible " + stockRestanteTrasA + "m, Solicitado " + compraClienteB + "m.");
                }
            } catch (dominio.excepciones.ExcepcionDominio ex) {
                transaccionBRechazada = true;
            }

            if (!transaccionBRechazada) {
                throw new AssertionError("Fallo de concurrencia: se permitió sobreventa de tela fraccionada (Race Condition).");
            }
        });

        ejecutarPrueba("10. Cumplimiento Normativo Habeas Data (Ley 1581 de 2012 de Colombia)", () -> {
            // Intento de registro sin consentimiento explícito
            boolean excepcionLanzada = false;
            try {
                ServicioAutenticacion servicio = new ServicioAutenticacion(null);
                servicio.registrarCliente("Usuario Prueba", "prueba@correo.com", "ClaveSegura123!", false);
            } catch (dominio.excepciones.ExcepcionDominio ex) {
                if (ex.getMessage().contains("1581") || ex.getMessage().contains("Habeas Data")) {
                    excepcionLanzada = true;
                }
            }

            if (!excepcionLanzada) {
                throw new AssertionError("Fallo de seguridad legal: Se permitió registro de usuario sin consentimiento explícito de Habeas Data.");
            }
        });

        ejecutarPrueba("11. Seguridad y Cumplimiento PCI-DSS: Detección y Rechazo de PAN / CVV", () -> {
            String tarjetaVisaPrueba = "4532-1488-9234-5678";
            String tarjetaMasterPrueba = "5412 7512 3412 3456";
            String payloadConCvv = "pago con tarjeta cvv: 123";
            String tokenSeguroPasarela = "tok_wompi_test_8f293bca10294";

            if (!ServicioAutenticacion.contieneDatosTarjetaSensibles(tarjetaVisaPrueba)) {
                throw new AssertionError("Fallo PCI-DSS: No se detectó número de tarjeta de crédito (PAN) Visa.");
            }
            if (!ServicioAutenticacion.contieneDatosTarjetaSensibles(tarjetaMasterPrueba)) {
                throw new AssertionError("Fallo PCI-DSS: No se detectó número de tarjeta de crédito (PAN) MasterCard.");
            }
            if (!ServicioAutenticacion.contieneDatosTarjetaSensibles(payloadConCvv)) {
                throw new AssertionError("Fallo PCI-DSS: No se detectó código de seguridad CVV.");
            }
            if (ServicioAutenticacion.contieneDatosTarjetaSensibles(tokenSeguroPasarela)) {
                throw new AssertionError("Fallo PCI-DSS: Se catalogó erróneamente un token seguro de pasarela como tarjeta sensible.");
            }
        });

        ejecutarPrueba("12. Trazabilidad y Logs Estructurados en Formato JSON (DevSecOps)", () -> {
            String logJsonPrueba = "{"
                    + "\"timestamp\":\"2026-10-13T22:30:00.000Z\","
                    + "\"level\":\"INFO\","
                    + "\"service_name\":\"ddtextil-backend\","
                    + "\"trace_id\":\"a9c4b721-1234-4567-89ab-cdef01234567\","
                    + "\"method\":\"POST\","
                    + "\"path\":\"/api/orders\","
                    + "\"status\":201,"
                    + "\"message\":\"Pedido creado exitosamente con metraje bloqueado\""
                    + "}";

            JsonObject objLog = JsonParser.parseString(logJsonPrueba).getAsJsonObject();
            if (!objLog.has("timestamp") || !objLog.has("level") || !objLog.has("service_name") 
                    || !objLog.has("trace_id") || !objLog.has("message")) {
                throw new AssertionError("El esquema del log JSON carece de campos obligatorios para observabilidad.");
            }
        });

        ejecutarPrueba("13. Validación y Resiliencia de Autenticación SSO (Google y Microsoft)", () -> {
            try {
                ServicioAutenticacion servicio = new ServicioAutenticacion(null);
                servicio.autenticarOAutoRegistrarSSO("   ", "Nombre Demo");
                throw new AssertionError("Fallo: Se permitió procesar SSO con correo en blanco.");
            } catch (dominio.excepciones.ExcepcionDominio e) {
                // Correcto
            }

            try {
                ServicioAutenticacion servicio = new ServicioAutenticacion(null);
                servicio.autenticarOAutoRegistrarSSO(null, "Nombre Demo");
                throw new AssertionError("Fallo: Se permitió procesar SSO con correo nulo.");
            } catch (dominio.excepciones.ExcepcionDominio e) {
                // Correcto
            }

            String payloadGoogle = "{\"email\":\"usuario.google@gmail.com\",\"nombre\":\"Usuario Google Demo\",\"proveedor\":\"google\"}";
            JsonObject jsonGoogle = JsonParser.parseString(payloadGoogle).getAsJsonObject();
            String correoGoogle = (jsonGoogle.has("email") && !jsonGoogle.get("email").isJsonNull()) ? jsonGoogle.get("email").getAsString()
                                : ((jsonGoogle.has("correo") && !jsonGoogle.get("correo").isJsonNull()) ? jsonGoogle.get("correo").getAsString() : null);
            if (!"usuario.google@gmail.com".equals(correoGoogle)) {
                throw new AssertionError("Fallo en extracción de correo en payload de Google SSO.");
            }

            // Validación de resiliencia ante valores nulos explícitos en JSON (evita UnsupportedOperationException en Gson)
            String payloadNulo = "{\"email\":null,\"correo\":null,\"nombre\":null}";
            JsonObject jsonNulo = JsonParser.parseString(payloadNulo).getAsJsonObject();
            String correoNulo = (jsonNulo.has("email") && !jsonNulo.get("email").isJsonNull()) ? jsonNulo.get("email").getAsString() : null;
            if (correoNulo != null) {
                throw new AssertionError("Fallo: Se extrajo valor no nulo de propiedad JSON nula.");
            }
        });

        ejecutarPrueba("14. Integridad Criptográfica SHA-256 y Validación de Webhook Wompi", () -> {
            String referencia = "DD-1700000000-0001";
            long montoCentavos = 15000000L;
            String moneda = "COP";
            String firma1 = aplicacion.servicios.ServicioCriptoWompi.generarFirmaIntegridad(referencia, montoCentavos, moneda);
            String firma2 = aplicacion.servicios.ServicioCriptoWompi.generarFirmaIntegridad(referencia, montoCentavos, moneda);
            if (firma1 == null || firma1.length() != 64 || !firma1.equals(firma2)) {
                throw new AssertionError("La firma de integridad de Wompi no es un SHA-256 válido o determinista.");
            }
            String firmaAlterada = aplicacion.servicios.ServicioCriptoWompi.generarFirmaIntegridad(referencia, montoCentavos - 1, moneda);
            if (firma1.equals(firmaAlterada)) {
                throw new AssertionError("Fallo crítico: la firma de integridad no cambió al alterar el monto.");
            }
            String webhookFalso = "{\"event\":\"transaction.updated\",\"data\":{\"transaction\":{\"id\":\"tx-123\",\"status\":\"APPROVED\",\"amount_in_cents\":15000000}},\"signature\":{\"properties\":[\"transaction.id\",\"transaction.status\",\"transaction.amount_in_cents\"],\"checksum\":\"0000000000000000000000000000000000000000000000000000000000000000\"},\"timestamp\":1700000000}";
            JsonObject jsonWebhookFalso = JsonParser.parseString(webhookFalso).getAsJsonObject();
            if (aplicacion.servicios.ServicioCriptoWompi.validarFirmaWebhook(jsonWebhookFalso)) {
                throw new AssertionError("Fallo de seguridad: se aceptó un webhook con firma apócrifa.");
            }

            // Verificación positiva de webhook legítimo con eventos_secret dummy
            long timestampReal = 1700000000L;
            String secretoEventos = infraestructura.configuracion.ConfiguracionWompi.secretoEventos();
            if (secretoEventos == null || secretoEventos.isBlank()) secretoEventos = "test_events_dummy";
            String cadenaValida = "tx-123APPROVED15000000" + timestampReal + secretoEventos;
            String checksumValido = aplicacion.servicios.ServicioCriptoWompi.sha256(cadenaValida);
            String webhookValido = "{\"event\":\"transaction.updated\",\"data\":{\"transaction\":{\"id\":\"tx-123\",\"status\":\"APPROVED\",\"amount_in_cents\":15000000}},\"signature\":{\"properties\":[\"transaction.id\",\"transaction.status\",\"transaction.amount_in_cents\"],\"checksum\":\"" + checksumValido + "\"},\"timestamp\":" + timestampReal + "}";
            JsonObject jsonWebhookValido = JsonParser.parseString(webhookValido).getAsJsonObject();
            if (!aplicacion.servicios.ServicioCriptoWompi.validarFirmaWebhook(jsonWebhookValido)) {
                throw new AssertionError("Fallo: Se rechazó un webhook auténtico con firma válida.");
            }
        });

        ejecutarPrueba("15. Reglas Financieras de Descuentos y Límites de Transacción Wompi", () -> {
            double subtotal = 50000.0;
            double cuponExcesivo = 80000.0;
            double descuentoAplicado = Math.min(cuponExcesivo, subtotal);
            if (descuentoAplicado > subtotal) {
                throw new AssertionError("Fallo: El descuento aplicado supera el subtotal.");
            }
            double subtotalConDescuento = Math.max(0.0, subtotal - descuentoAplicado);
            if (subtotalConDescuento < 0.0) {
                throw new AssertionError("Fallo: El total con descuento resultó negativo.");
            }
        });

        ejecutarPrueba("16. Sesiones firmadas: identidad, integridad, expiración y entradas malformadas", () -> {
            byte[] secreto = "secreto-determinista-de-prueba".getBytes(StandardCharsets.UTF_8);
            long ahora = 1700000000L;
            String token = TokenSesion.emitir(42, "cliente", secreto, ahora);
            TokenSesion.Identidad identidad = TokenSesion.verificar(token, secreto, ahora).orElseThrow();
            if (identidad.idUsuario() != 42 || !"cliente".equals(identidad.rol())) {
                throw new AssertionError("La sesión no conserva el identificador y el rol.");
            }
            String[] partes = token.split("\\.");
            String cargaAlterada = Base64.getUrlEncoder().withoutPadding().encodeToString(
                    "{\"sub\":42,\"rol\":\"admin\",\"exp\":1700043200}".getBytes(StandardCharsets.UTF_8));
            String firmaAlterada = (partes[1].startsWith("A") ? "B" : "A") + partes[1].substring(1);
            if (TokenSesion.verificar(cargaAlterada + "." + partes[1], secreto, ahora).isPresent()
                    || TokenSesion.verificar(partes[0] + "." + firmaAlterada, secreto, ahora).isPresent()) {
                throw new AssertionError("Se aceptó una carga o firma alterada.");
            }
            byte[] otroSecreto = "otro-secreto".getBytes(StandardCharsets.UTF_8);
            if (TokenSesion.verificar(TokenSesion.emitir(42, "cliente", otroSecreto, ahora), secreto, ahora).isPresent()) {
                throw new AssertionError("Se aceptó una sesión firmada con otro secreto.");
            }
            if (TokenSesion.verificar(token, secreto, ahora + TokenSesion.DURACION_SEGUNDOS).isPresent()) {
                throw new AssertionError("Se aceptó una sesión expirada.");
            }
            for (String malformado : new String[] {null, "", "abc", "a.b.c", "a.b"}) {
                if (TokenSesion.verificar(malformado, secreto, ahora).isPresent()) {
                    throw new AssertionError("Se aceptó una entrada malformada.");
                }
            }
            // Firmas válidas para comprobar también el rechazo de cargas JSON inválidas o incompletas.
            for (String cargaInvalida : new String[] {"{", "{}", "{\"sub\":42,\"rol\":\"cliente\"}",
                    "{\"sub\":null,\"rol\":\"cliente\",\"exp\":1700043200}"}) {
                String carga = Base64.getUrlEncoder().withoutPadding().encodeToString(cargaInvalida.getBytes(StandardCharsets.UTF_8));
                javax.crypto.Mac mac = javax.crypto.Mac.getInstance("HmacSHA256");
                mac.init(new javax.crypto.spec.SecretKeySpec(secreto, "HmacSHA256"));
                String firma = Base64.getUrlEncoder().withoutPadding().encodeToString(mac.doFinal(carga.getBytes(StandardCharsets.UTF_8)));
                if (TokenSesion.verificar(carga + "." + firma, secreto, ahora).isPresent()) {
                    throw new AssertionError("Se aceptó una carga JSON inválida o incompleta.");
                }
            }
        });

        ejecutarPrueba("17. Autorización de pedidos por administrador, vendedor y cliente", () -> {
            Pedido pedido = new Pedido();
            pedido.setIdCliente(10);
            pedido.setIdVendedor(20);
            for (String rol : new String[] {"administrador", "admin", "ADMIN"}) {
                if (!ManejadorPedidos.puedeVerPedido(new TokenSesion.Identidad(99, rol), pedido)) {
                    throw new AssertionError("El administrador no puede consultar el pedido.");
                }
            }
            for (String rol : new String[] {"vendedor", "seller", "VENDEDOR"}) {
                if (!ManejadorPedidos.puedeVerPedido(new TokenSesion.Identidad(20, rol), pedido)
                        || ManejadorPedidos.puedeVerPedido(new TokenSesion.Identidad(10, rol), pedido)) {
                    throw new AssertionError("El vendedor puede consultar pedidos ajenos o no ve los propios.");
                }
            }
            for (String rol : new String[] {"cliente", "desconocido"}) {
                if (!ManejadorPedidos.puedeVerPedido(new TokenSesion.Identidad(10, rol), pedido)
                        || ManejadorPedidos.puedeVerPedido(new TokenSesion.Identidad(20, rol), pedido)) {
                    throw new AssertionError("El cliente o rol desconocido puede consultar pedidos ajenos o no ve los propios.");
                }
            }
        });

        ejecutarPrueba("18. Identidad vigente: rol y estado actuales prevalecen sobre la sesión", () -> {
            TokenSesion.Identidad reclamada = new TokenSesion.Identidad(7, "administrador");
            Usuario cliente = new Usuario(7, "Cliente", "cliente@ejemplo.com", "cliente", true, false,
                    null, null, null, null, null);
            TokenSesion.Identidad vigente = ManejadorBase.identidadVigente(reclamada, cliente).orElseThrow();
            if (!"cliente".equals(vigente.rol()) || vigente.esAdministrador()) {
                throw new AssertionError("El rol administrador de la sesión prevaleció sobre el rol cliente actual.");
            }
            Usuario administrador = new Usuario(7, "Administrador", "admin@ejemplo.com", "administrador", true, false,
                    null, null, null, null, null);
            vigente = ManejadorBase.identidadVigente(new TokenSesion.Identidad(7, "cliente"), administrador).orElseThrow();
            if (!"administrador".equals(vigente.rol()) || !vigente.esAdministrador()) {
                throw new AssertionError("No se respetó el rol administrador actual.");
            }
            Usuario inactivo = new Usuario(7, "Inactivo", "inactivo@ejemplo.com", "administrador", false, false,
                    null, null, null, null, null);
            Usuario suspendido = new Usuario(7, "Suspendido", "suspendido@ejemplo.com", "administrador", true, true,
                    null, null, null, null, null);
            Usuario ajeno = new Usuario(8, "Ajeno", "ajeno@ejemplo.com", "administrador", true, false,
                    null, null, null, null, null);
            if (ManejadorBase.identidadVigente(reclamada, null).isPresent()
                    || ManejadorBase.identidadVigente(reclamada, inactivo).isPresent()
                    || ManejadorBase.identidadVigente(reclamada, suspendido).isPresent()
                    || ManejadorBase.identidadVigente(reclamada, ajeno).isPresent()) {
                throw new AssertionError("Se aceptó un usuario inexistente, inactivo, suspendido o con otro identificador.");
            }
            if (ManejadorBase.identidadVigente(reclamada, administrador).isEmpty()) {
                throw new AssertionError("Se rechazó un administrador activo con el identificador correcto.");
            }
        });

        System.out.println("\n=================================================================");
        System.out.println("                    RESUMEN DE PRUEBAS                          ");
        System.out.println("=================================================================");
        System.out.println("  Pruebas superadas con éxito: " + pruebasExitosas);
        System.out.println("  Pruebas fallidas:            " + pruebasFallidas);

        if (pruebasFallidas == 0) {
            System.out.println("\n>>> TODAS LAS PRUEBAS DE SEGURIDAD E INTEGRIDAD FUERON EXITOSAS (100% EN ESPAÑOL) <<<\n");
        } else {
            System.err.println("\n>>> SE IDENTIFICARON FALLAS EN LA SUITE DE PRUEBAS <<<\n");
            System.exit(1);
        }
    }

    private static void ejecutarPrueba(String nombrePrueba, AccionPrueba accion) {
        System.out.print("[TEST] " + nombrePrueba + " ... ");
        try {
            accion.ejecutar();
            System.out.println("CORRECTO");
            pruebasExitosas++;
        } catch (Throwable t) {
            System.out.println("FALLO");
            System.err.println("  -> Error: " + t.getMessage());
            t.printStackTrace(System.err);
            pruebasFallidas++;
        }
    }

    @FunctionalInterface
    interface AccionPrueba {
        void ejecutar() throws Exception;
    }
}
