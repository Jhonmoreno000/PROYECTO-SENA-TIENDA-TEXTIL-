package infraestructura.api.manejadores;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import java.io.IOException;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;
import dominio.modelos.Usuario;
import dominio.repositorios.RepositorioUsuario;
import infraestructura.persistencia.jdbc.JdbcRepositorioUsuarioImpl;
import infraestructura.seguridad.TokenSesion;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

import dominio.excepciones.ExcepcionDominio;
import infraestructura.configuracion.ConfiguracionEntorno;

/**
 * Clase base abstracta para todos los controladores HTTP de la API REST (D&D Textil).
 * Implementa trazabilidad transversal (`X-Correlation-ID`), logs estructurados en JSON,
 * limitación de tasa por dirección IP, cabeceras CORS y manejo centralizado de errores.
 */
public abstract class ManejadorBase implements HttpHandler {

    /** Nombre identificador del microservicio en los registros de auditoría (`String`). */
    private static final String NOMBRE_SERVICIO = "ddtextil-backend";
    private static final RepositorioUsuario USUARIOS = new JdbcRepositorioUsuarioImpl();
    /** Número máximo de peticiones permitidas por IP dentro de una ventana de tiempo (`int`). */
    private static final int MAX_PETICIONES_POR_VENTANA = 1200;
    /** Duración de la ventana de control de tasa en milisegundos (`long`). */
    private static final long VENTANA_TIEMPO_MS = 60_000L;
    /** Tamaño máximo permitido para el cuerpo de una petición HTTP en bytes (`int`, 5 MB). */
    public static final int TAMANO_MAXIMO_CUERPO_BYTES = 5 * 1024 * 1024;

    /** Registro concurrente en memoria de contadores de peticiones por dirección IP (`ConcurrentHashMap`). */
    private static final ConcurrentHashMap<String, ContadorPeticiones> registroRateLimit = new ConcurrentHashMap<>();

    /**
     * Estructura interna que contabiliza las peticiones recibidas desde una IP en la ventana activa.
     */
    private static class ContadorPeticiones {
        /** Marca de tiempo de inicio de la ventana en milisegundos (`long`). */
        long inicioVentana;
        /** Contador atómico de peticiones dentro de la ventana (`AtomicInteger`). */
        AtomicInteger conteo;

        /**
         * Inicializa el contador para una nueva ventana de tiempo.
         *
         * @param inicio Marca de tiempo inicial en milisegundos (`long`).
         */
        ContadorPeticiones(long inicio) {
            this.inicioVentana = inicio;
            this.conteo = new AtomicInteger(1);
        }
    }

    /**
     * Intercepta toda petición HTTP entrante aplicando trazabilidad, CORS, límite de carga,
     * control de tasa y captura estandarizada de excepciones antes de delegar al controlador concreto.
     *
     * @param intercambio Contexto de la petición y respuesta HTTP (`HttpExchange`).
     * @throws IOException Si ocurre un error de entrada/salida en el socket HTTP.
     */
    @Override
    public final void handle(HttpExchange intercambio) throws IOException {
        long tiempoInicio = System.currentTimeMillis();

        String correlationId = intercambio.getRequestHeaders().getFirst("X-Correlation-ID");
        if (correlationId == null || correlationId.trim().isEmpty()) {
            correlationId = UUID.randomUUID().toString();
        }
        intercambio.getResponseHeaders().set("X-Correlation-ID", correlationId);

        String origenPermitido = ConfiguracionEntorno.obtener("CORS_ALLOWED_ORIGIN", "*");
        intercambio.getResponseHeaders().set("Access-Control-Allow-Origin", origenPermitido);
        intercambio.getResponseHeaders().set("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE, OPTIONS");
        intercambio.getResponseHeaders().set("Access-Control-Allow-Headers", "Content-Type,Authorization,X-Correlation-ID,X-User-Id,X-User-Roles");
        intercambio.getResponseHeaders().set("Access-Control-Expose-Headers", "X-Correlation-ID");

        if ("OPTIONS".equalsIgnoreCase(intercambio.getRequestMethod())) {
            intercambio.sendResponseHeaders(204, -1);
            intercambio.getResponseBody().close();
            return;
        }

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
     * Evalúa si una dirección IP ha superado el umbral máximo de peticiones por minuto.
     *
     * @param ip Dirección IP del cliente (`String`).
     * @return `true` si excedió el límite permitido; `false` en caso contrario.
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

        if (registroRateLimit.size() > 5000) {
            registroRateLimit.entrySet().removeIf(entry -> (ahora - entry.getValue().inicioVentana) > VENTANA_TIEMPO_MS);
        }

        return contador.conteo.get() > MAX_PETICIONES_POR_VENTANA;
    }

    /**
     * Extrae la dirección IP del cliente verificando si proviene de un proxy inverso local confiable.
     *
     * @param intercambio Contexto de la petición HTTP (`HttpExchange`).
     * @return Dirección IP del cliente (`String`).
     */
    private String obtenerIpCliente(HttpExchange intercambio) {
        String ipRemota = "127.0.0.1";
        boolean esProxyConfiable = false;
        if (intercambio.getRemoteAddress() != null && intercambio.getRemoteAddress().getAddress() != null) {
            java.net.InetAddress addr = intercambio.getRemoteAddress().getAddress();
            ipRemota = addr.getHostAddress();
            esProxyConfiable = addr.isLoopbackAddress() || addr.isSiteLocalAddress();
        }
        if (esProxyConfiable) {
            String xRealIp = intercambio.getRequestHeaders().getFirst("X-Real-IP");
            if (xRealIp != null && !xRealIp.isBlank()) {
                return xRealIp.trim();
            }
        }
        return ipRemota;
    }

    /**
     * Emite una línea de registro estructurado en formato JSON hacia la salida estándar o de error.
     *
     * @param nivel         Nivel de severidad (`INFO`, `WARN`, `ERROR`).
     * @param mensaje       Descripción del evento (`String`).
     * @param correlationId Identificador de correlación de la traza (`String`).
     * @param intercambio   Contexto HTTP asociado (`HttpExchange`).
     * @param codigoEstado  Código de estado HTTP devuelto (`int`).
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
     * Método plantilla que cada manejador concreto debe implementar para procesar la petición HTTP.
     *
     * @param intercambio Contexto de la petición HTTP (`HttpExchange`).
     * @throws Exception Si ocurre un error durante el procesamiento.
     */
    protected abstract void procesarPeticion(HttpExchange intercambio) throws Exception;

    /**
     * Verifica la sesión Bearer y relee el rol y estado activo/suspendido de la base de datos en cada llamada.
     *
     * @param intercambio Contexto de la petición HTTP (`HttpExchange`).
     * @return {@link Optional} con la identidad verificada o vacío si no es válida.
     */
    protected Optional<TokenSesion.Identidad> obtenerIdentidad(HttpExchange intercambio) {
        String autorizacion = intercambio.getRequestHeaders().getFirst("Authorization");
        if (autorizacion == null) return Optional.empty();
        String[] partes = autorizacion.trim().split("\\s+", 2);
        if (partes.length != 2 || !"Bearer".equalsIgnoreCase(partes[0])) return Optional.empty();
        return TokenSesion.verificar(partes[1]).flatMap(reclamada ->
                identidadVigente(reclamada, USUARIOS.buscarPorId(reclamada.idUsuario()).orElse(null)));
    }

    /**
     * Valida que el registro actual del usuario en la base de datos siga activo, no esté suspendido
     * y coincida con el sujeto del token, reconstruyendo la {@link TokenSesion.Identidad} con el rol
     * vigente en base de datos sin confiar ciegamente en el rol reclamado cuando se emitió el token.
     *
     * @param reclamada Identidad extraída tras verificar la firma HMAC-SHA256 del token.
     * @param actual    Entidad {@link Usuario} recién consultada en PostgreSQL.
     * @return {@link Optional} con la identidad vigente, o vacío si la cuenta fue suspendida/inactivada.
     */
    public static Optional<TokenSesion.Identidad> identidadVigente(TokenSesion.Identidad reclamada, Usuario actual) {
        if (actual == null || !actual.isActivo() || actual.isSuspendido()
                || actual.getId() != reclamada.idUsuario()) {
            return Optional.empty();
        }
        return Optional.of(new TokenSesion.Identidad(actual.getId(), actual.getRol()));
    }

    /**
     * Envía una respuesta HTTP con cuerpo en formato JSON codificado en UTF-8.
     *
     * @param intercambio   Contexto de la petición HTTP (`HttpExchange`).
     * @param codigoEstado  Código de estado HTTP (`int`).
     * @param respuestaJson Cadena JSON a escribir en el cuerpo de respuesta (`String`).
     * @throws IOException Si falla la escritura en el flujo de salida.
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
     * Envía una respuesta de error estandarizada en formato JSON (`{"error": "..."}`).
     *
     * @param intercambio  Contexto de la petición HTTP (`HttpExchange`).
     * @param codigoEstado Código de estado HTTP de error (`int`).
     * @param mensaje      Mensaje descriptivo del error (`String`).
     * @throws IOException Si falla la escritura de la respuesta.
     */
    protected void enviarRespuestaError(HttpExchange intercambio, int codigoEstado, String mensaje) throws IOException {
        com.google.gson.JsonObject errorObj = new com.google.gson.JsonObject();
        errorObj.addProperty("error", mensaje != null ? mensaje : "Error");
        enviarRespuestaJson(intercambio, codigoEstado, errorObj.toString());
    }

    /**
     * Obtiene el valor decodificado de un parámetro de consulta (`query string`) de la URI.
     *
     * @param intercambio     Contexto de la petición HTTP (`HttpExchange`).
     * @param nombreParametro Nombre de la clave buscada (`String`).
     * @return Valor del parámetro o `null` si no está presente.
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
     * Obtiene un parámetro de consulta convertido de forma segura a número entero.
     *
     * @param intercambio     Contexto de la petición HTTP (`HttpExchange`).
     * @param nombreParametro Nombre del parámetro (`String`).
     * @param valorPorDefecto Valor de respaldo si el parámetro no existe o no es numérico (`int`).
     * @return Valor entero del parámetro (`int`).
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
     * Extrae el primer segmento numérico positivo presente en una ruta URI.
     *
     * @param ruta Ruta de la petición (`String`).
     * @return Identificador numérico extraído o `-1` si no contiene ninguno.
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
     * Lee el cuerpo de la petición HTTP verificando que no supere el límite máximo de 5 MB.
     *
     * @param intercambio Contexto de la petición HTTP (`HttpExchange`).
     * @return Arreglo de bytes con el contenido leído (`byte[]`).
     * @throws IOException Si ocurre un error leyendo el flujo de entrada.
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
     * Escapa caracteres especiales HTML en una cadena de texto para prevenir ataques XSS.
     *
     * @param entrada Cadena de texto original (`String`).
     * @return Cadena sanitizada con entidades HTML (`String`).
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
