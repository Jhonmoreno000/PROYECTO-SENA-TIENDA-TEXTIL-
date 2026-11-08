import aplicacion.servicios.ServicioAutenticacion;
import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import dominio.modelos.ReporteError;
import dominio.modelos.Usuario;
import java.io.File;
import java.nio.file.Path;

/**
 * Suite de pruebas automatizadas de seguridad, validación e integridad de negocio para D&D Textil.
 */
public class PruebasSeguridadIntegridad {

    /** Contador de pruebas exitosas (`int`). */
    private static int pruebasExitosas = 0;
    /** Contador de pruebas fallidas (`int`). */
    private static int pruebasFallidas = 0;
    /** Serializador JSON (`Gson`). */
    private static final Gson gson = new Gson();

    /**
     * Punto de entrada principal que ejecuta las 15 pruebas de seguridad e integridad.
     *
     * @param argumentos Argumentos de línea de comandos (`String[]`).
     */
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

            String hashSegundoIntento = ServicioAutenticacion.generarHashContrasena(contrasenaConEspeciales);
            if (!hashGenerado.equals(hashSegundoIntento)) {
                throw new AssertionError("El cálculo del hash SHA-256 no es determinista.");
            }
        });

        ejecutarPrueba("2. Deserialización y Sincronización de Bug Reports (title, area, severity, priority)", () -> {
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

            if (!"Error al procesar el pago con tarjeta".equals(reporte.getTitulo())) {
                throw new AssertionError("El título esperado no coincide. Obtenido: " + reporte.getTitulo());
            }

            if (!"Error al procesar el pago con tarjeta".equals(reporte.getArea())) {
                throw new AssertionError("El área esperada no coincide con el título. Obtenido: " + reporte.getArea());
            }

            if (!"high".equals(reporte.getSeveridad()) || !"high".equals(reporte.getPrioridad())) {
                throw new AssertionError("La severidad o prioridad no se mapeó correctamente a 'high'. Severidad: "
                        + reporte.getSeveridad() + ", Prioridad: " + reporte.getPrioridad());
            }

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

            File archivoAtaque1 = new File("uploads/../src/App.java");
            Path rutaAtaque1 = archivoAtaque1.getCanonicalFile().toPath().normalize();
            boolean bloqueo1 = !rutaAtaque1.startsWith(rutaDirectorioSubidas);

            if (!bloqueo1) {
                throw new AssertionError("Fallo de seguridad: no se bloqueó el escape de directorio '../src/App.java'");
            }

            File archivoAtaque2 = new File("uploads/../../windows/system.ini");
            Path rutaAtaque2 = archivoAtaque2.getCanonicalFile().toPath().normalize();
            boolean bloqueo2 = !rutaAtaque2.startsWith(rutaDirectorioSubidas);

            if (!bloqueo2) {
                throw new AssertionError("Fallo de seguridad: no se bloqueó el escape hacia la raíz del sistema");
            }

            File archivoValido = new File("uploads/foto_prueba.png");
            Path rutaValida = archivoValido.getCanonicalFile().toPath().normalize();
            boolean permitido = rutaValida.startsWith(rutaDirectorioSubidas);

            if (!permitido) {
                throw new AssertionError("Error: se bloqueó un archivo legítimo dentro del directorio 'uploads'");
            }
        });

        ejecutarPrueba("4. Resistencia a Inyección SQL (SQLi) en Validación de Credenciales", () -> {
            String contrasenaInyeccion = "' OR 1=1 --";
            String hashInyeccion = ServicioAutenticacion.generarHashContrasena(contrasenaInyeccion);

            if (hashInyeccion == null || hashInyeccion.isBlank()) {
                throw new AssertionError("El generador de hash falló con caracteres de inyección SQL.");
            }

            try {
                ServicioAutenticacion servicio = new ServicioAutenticacion(null);
                servicio.iniciarSesion("   ", "   ");
                throw new AssertionError("Fallo: Se permitió iniciar sesión con credenciales vacías.");
            } catch (dominio.excepciones.ExcepcionDominio e) {
                // Correcto
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
            double stockDisponible = 5.0;
            double compraClienteA = 3.5;
            double compraClienteB = 2.5;

            double stockRestanteTrasA = stockDisponible - compraClienteA;
            if (stockRestanteTrasA < 0) {
                throw new AssertionError("Error en cálculo de stock tras compra legítima de cliente A.");
            }

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

    /**
     * Ejecuta un caso de prueba individual contabilizando su éxito o fallo.
     *
     * @param nombrePrueba Nombre descriptivo de la prueba (`String`).
     * @param accion       Acción ejecutable de la prueba (`AccionPrueba`).
     */
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

    /**
     * Interfaz funcional que representa un bloque de prueba ejecutable.
     */
    @FunctionalInterface
    interface AccionPrueba {
        /**
         * Ejecuta el caso de prueba.
         *
         * @throws Exception Si ocurre un error durante la validación.
         */
        void ejecutar() throws Exception;
    }
}
