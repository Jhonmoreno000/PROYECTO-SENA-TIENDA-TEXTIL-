package infraestructura.api.manejadores;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import java.io.IOException;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

import dominio.excepciones.ExcepcionDominio;
import infraestructura.configuracion.ConfiguracionEntorno;

/**
 * Clase base abstracta para todos los controladores de la API REST (D&D Textil).
 * Implementa estándares de DevSecOps y Calidad ISO/IEC 25010:
 * 1. Propagación de Correlation ID (X-Correlation-ID) para trazabilidad transversal.
 * 2. Registro de Logs Estructurados en formato JSON (Observabilidad).
 * 3. Rate Limiting per IP (Mitigación de ataques de fuerza bruta y DoS).
 * 4. Cabeceras CORS estrictas con soporte para pre-flight OPTIONS 204.
 * 5. Captura centralizada de excepciones de dominio y seguridad.
 */
public abstract class ManejadorBase implements HttpHandler {

    private static final String NOMBRE_SERVICIO = "ddtextil-backend";
    private static final int MAX_PETICIONES_POR_VENTANA = 120; // 120 req/min por IP
    private static final long VENTANA_TIEMPO_MS = 60_000L; // 1 minuto
    public static final int TAMANO_MAXIMO_CUERPO_BYTES = 5 * 1024 * 1024; // 5 MB límite de carga útil (OWASP DoS)

    // Rastreador en memoria para Rate Limiting concurrente
    private static final ConcurrentHashMap<String, ContadorPeticiones> registroRateLimit = new ConcurrentHashMap<>();

    private static class ContadorPeticiones {
        long inicioVentana;
        AtomicInteger conteo;

        ContadorPeticiones(long inicio) {
            this.inicioVentana = inicio;
            this.conteo = new AtomicInteger(1);
        }
    }

    @Override
    public final void handle(HttpExchange intercambio) throws IOException {
        long tiempoInicio = System.currentTimeMillis();

        // 1. Trazabilidad: Obtener o generar X-Correlation-ID
        String correlationId = intercambio.getRequestHeaders().getFirst("X-Correlation-ID");
        if (correlationId == null || correlationId.trim().isEmpty()) {
            correlationId = UUID.randomUUID().toString();
        }
        intercambio.getResponseHeaders().set("X-Correlation-ID", correlationId);

        // 2. Configuración de CORS
        String origenPermitido = ConfiguracionEntorno.obtener("CORS_ALLOWED_ORIGIN", "*");
        intercambio.getResponseHeaders().set("Access-Control-Allow-Origin", origenPermitido);
        intercambio.getResponseHeaders().set("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE, OPTIONS");
        intercambio.getResponseHeaders().set("Access-Control-Allow-Headers", "Content-Type,Authorization,X-Correlation-ID,X-User-Id,X-User-Roles");
        intercambio.getResponseHeaders().set("Access-Control-Expose-Headers", "X-Correlation-ID");

        // Manejo de peticiones pre-flight OPTIONS
        if ("OPTIONS".equalsIgnoreCase(intercambio.getRequestMethod())) {
            intercambio.sendResponseHeaders(204, -1);
            intercambio.getResponseBody().close();
            return;
        }

        // Validación de tamaño máximo de carga útil (OWASP DoS Protection)
        String contentLengthHeader = intercambio.getRequestHeaders().getFirst("Content-Length");
        if (contentLengthHeader != null && !contentLengthHeader.isBlank()) {
            try {
                long longitudCuerpo = Long.parseLong(contentLengthHeader.trim());
                if (longitudCuerpo > TAMANO_MAXIMO_CUERPO_BYTES) {
                    registrarLogJson("WARN", "Carga útil rechazada por exceder límite de 5 MB: " + longitudCuerpo + " bytes", correlationId, intercambio, 413);
                    enviarRespuestaError(intercambio, 413, "Carga útil demasiado grande. El límite máximo admitido es de 5 MB.");
                    return;
                }
            } catch (NumberFormatException ignored) {}
        }

        // 3. Rate Limiting por IP para protección contra DoS y Fuerza Bruta
        String ipCliente = obtenerIpCliente(intercambio);
        if (haSuperadoLimitePeticiones(ipCliente)) {
            registrarLogJson("WARN", "Rate limit superado para IP: " + ipCliente, correlationId, intercambio, 429);
            enviarRespuestaError(intercambio, 429, "Demasiadas peticiones. Límite de tasa excedido. Intente más tarde.");
            return;
        }

        try {
            procesarPeticion(intercambio);
            long duracionMs = System.currentTimeMillis() - tiempoInicio;
            int codigoReal = intercambio.getResponseCode() > 0 ? intercambio.getResponseCode() : 200;
            registrarLogJson("INFO", "Petición procesada en " + duracionMs + " ms", correlationId, intercambio, codigoReal);
        } catch (ExcepcionDominio e) {
            registrarLogJson("WARN", "Error de Regla de Negocio: " + e.getMessage(), correlationId, intercambio, 400);
            enviarRespuestaError(intercambio, 400, e.getMessage());
        } catch (com.google.gson.JsonParseException e) {
            registrarLogJson("WARN", "JSON inválido en la petición: " + e.getMessage(), correlationId, intercambio, 400);
            enviarRespuestaError(intercambio, 400, "El cuerpo de la petición no contiene un JSON válido.");
        } catch (IllegalArgumentException e) {
            registrarLogJson("WARN", "Parámetros inválidos: " + e.getMessage(), correlationId, intercambio, 400);
            enviarRespuestaError(intercambio, 400, "Parámetros inválidos o formato incorrecto: " + e.getMessage());
        } catch (Exception e) {
            registrarLogJson("ERROR", "Error no controlado: " + e.getMessage(), correlationId, intercambio, 500);
            e.printStackTrace();
            enviarRespuestaError(intercambio, 500, "Error interno del servidor. Por favor contacta soporte.");
        }
    }

    /**
     * Valida el límite de peticiones por minuto para una IP.
     */
    private boolean haSuperadoLimitePeticiones(String ip) {
        long ahora = System.currentTimeMillis();
        ContadorPeticiones contador = registroRateLimit.compute(ip, (k, v) -> {
            if (v == null || (ahora - v.inicioVentana) > VENTANA_TIEMPO_MS) {
                return new ContadorPeticiones(ahora);
            }
            v.conteo.incrementAndGet();
            return v;
        });

        // Limpieza periódica para evitar fugas de memoria si hay más de 5000 IPs
        if (registroRateLimit.size() > 5000) {
            registroRateLimit.entrySet().removeIf(entry -> (ahora - entry.getValue().inicioVentana) > VENTANA_TIEMPO_MS);
        }

        return contador.conteo.get() > MAX_PETICIONES_POR_VENTANA;
    }

    /**
     * Extrae la IP de origen, considerando cabeceras de proxy inverso (X-Forwarded-For).
     */
    private String obtenerIpCliente(HttpExchange intercambio) {
        String xForwarded = intercambio.getRequestHeaders().getFirst("X-Forwarded-For");
        if (xForwarded != null && !xForwarded.isBlank()) {
            return xForwarded.split(",")[0].trim();
        }
        if (intercambio.getRemoteAddress() != null && intercambio.getRemoteAddress().getAddress() != null) {
            return intercambio.getRemoteAddress().getAddress().getHostAddress();
        }
        return "127.0.0.1";
    }

    /**
     * Emite un log estructurado en formato JSON estándar para Observabilidad / SIEM / ELK / Grafana Loki.
     */
    protected void registrarLogJson(String nivel, String mensaje, String correlationId, HttpExchange intercambio, int codigoEstado) {
        com.google.gson.JsonObject logObj = new com.google.gson.JsonObject();
        logObj.addProperty("timestamp", Instant.now().toString());
        logObj.addProperty("level", nivel);
        logObj.addProperty("service_name", NOMBRE_SERVICIO);
        logObj.addProperty("trace_id", correlationId != null ? correlationId : "N/A");
        logObj.addProperty("method", intercambio != null ? intercambio.getRequestMethod() : "N/A");
        logObj.addProperty("path", intercambio != null ? intercambio.getRequestURI().getPath() : "N/A");
        logObj.addProperty("status", codigoEstado);
        logObj.addProperty("message", mensaje != null ? mensaje : "");

        String jsonLog = logObj.toString();
        if ("ERROR".equalsIgnoreCase(nivel)) {
            System.err.println(jsonLog);
        } else {
            System.out.println(jsonLog);
        }
    }

    /**
     * Método principal que cada manejador concreto debe implementar.
     */
    protected abstract void procesarPeticion(HttpExchange intercambio) throws Exception;

    /**
     * Envía una respuesta HTTP con cuerpo JSON en UTF-8 asegurando el cierre del flujo.
     */
    protected void enviarRespuestaJson(HttpExchange intercambio, int codigoEstado, String respuestaJson) throws IOException {
        byte[] bytes = respuestaJson != null ? respuestaJson.getBytes(StandardCharsets.UTF_8) : new byte[0];
        intercambio.getResponseHeaders().set("Content-Type", "application/json; charset=UTF-8");
        intercambio.sendResponseHeaders(codigoEstado, bytes.length);

        try (OutputStream os = intercambio.getResponseBody()) {
            if (bytes.length > 0) {
                os.write(bytes);
            }
        }
    }

    /**
     * Envía una respuesta de error en JSON.
     */
    protected void enviarRespuestaError(HttpExchange intercambio, int codigoEstado, String mensaje) throws IOException {
        com.google.gson.JsonObject errorObj = new com.google.gson.JsonObject();
        errorObj.addProperty("error", mensaje != null ? mensaje : "Error");
        enviarRespuestaJson(intercambio, codigoEstado, errorObj.toString());
    }

    /**
     * Obtiene un parámetro de consulta de la URI.
     */
    protected String obtenerParametroConsulta(HttpExchange intercambio, String nombreParametro) {
        String consulta = intercambio.getRequestURI().getQuery();
        if (consulta == null || consulta.isBlank()) return null;
        for (String par : consulta.split("&")) {
            String[] claveValor = par.split("=");
            if (claveValor.length >= 1 && claveValor[0].equalsIgnoreCase(nombreParametro)) {
                return claveValor.length > 1 ? java.net.URLDecoder.decode(claveValor[1], StandardCharsets.UTF_8) : "";
            }
        }
        return null;
    }

    /**
     * Obtiene un parámetro de consulta como entero de forma segura.
     */
    protected int obtenerParametroConsultaEntero(HttpExchange intercambio, String nombreParametro, int valorPorDefecto) {
        String valor = obtenerParametroConsulta(intercambio, nombreParametro);
        if (valor == null) return valorPorDefecto;
        try {
            return Integer.parseInt(valor);
        } catch (NumberFormatException e) {
            return valorPorDefecto;
        }
    }

    /**
     * Extrae el primer segmento numérico positivo de una ruta URI.
     */
    protected int extraerIdRuta(String ruta) {
        if (ruta == null) return -1;
        for (String segmento : ruta.split("/")) {
            if (segmento.matches("\\d+")) {
                try {
                    return Integer.parseInt(segmento);
                } catch (NumberFormatException e) {
                    return -1;
                }
            }
        }
        return -1;
    }

    /**
     * Lee el cuerpo de la petición de forma segura limitando la lectura al tamaño máximo permitido.
     */
    protected byte[] leerCuerpoSeguro(HttpExchange intercambio) throws IOException {
        java.io.InputStream in = intercambio.getRequestBody();
        java.io.ByteArrayOutputStream out = new java.io.ByteArrayOutputStream();
        byte[] buffer = new byte[8192];
        int totalLeido = 0;
        int leido;
        while ((leido = in.read(buffer)) != -1) {
            totalLeido += leido;
            if (totalLeido > TAMANO_MAXIMO_CUERPO_BYTES) {
                throw new ExcepcionDominio("El cuerpo de la petición excede el tamaño máximo permitido de 5 MB.");
            }
            out.write(buffer, 0, leido);
        }
        return out.toByteArray();
    }

    /**
     * Sanitiza cadenas de entrada contra ataques de Cross-Site Scripting (XSS).
     */
    public static String sanitizarHtml(String entrada) {
        if (entrada == null) return null;
        return entrada
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#x27;")
                .replace("/", "&#x2F;");
    }
}
