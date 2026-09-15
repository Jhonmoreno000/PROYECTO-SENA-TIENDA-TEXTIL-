package infraestructura.api.manejadores;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import java.io.IOException;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;

import dominio.excepciones.ExcepcionDominio;

/**
 * Clase base abstracta para todos los controladores de la API.
 * Configura CORS global, captura centralizada de excepciones y métodos utilitarios.
 */
public abstract class ManejadorBase implements HttpHandler {

    @Override
    public final void handle(HttpExchange intercambio) throws IOException {
        intercambio.getResponseHeaders().add("Access-Control-Allow-Origin", "*");
        intercambio.getResponseHeaders().add("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE, OPTIONS");
        intercambio.getResponseHeaders().add("Access-Control-Allow-Headers", "Content-Type,Authorization");

        if ("OPTIONS".equalsIgnoreCase(intercambio.getRequestMethod())) {
            intercambio.sendResponseHeaders(204, -1);
            intercambio.getResponseBody().close();
            return;
        }

        try {
            procesarPeticion(intercambio);
        } catch (ExcepcionDominio e) {
            System.err.println("Error de Regla de Negocio: " + e.getMessage());
            enviarRespuestaError(intercambio, 400, e.getMessage());
        } catch (IllegalArgumentException e) {
            System.err.println("Error en formato o parámetros de la petición: " + e.getMessage());
            enviarRespuestaError(intercambio, 400, "Parámetros inválidos o formato incorrecto: " + e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            enviarRespuestaError(intercambio, 500, "Error interno del servidor. Por favor contacta soporte.");
        }
    }

    /**
     * Método principal que cada manejador concreto debe implementar.
     */
    protected abstract void procesarPeticion(HttpExchange intercambio) throws Exception;

    // Alias para compatibilidad
    protected void processRequest(HttpExchange exchange) throws Exception {
        procesarPeticion(exchange);
    }

    /**
     * Envía una respuesta HTTP con cuerpo JSON en UTF-8.
     */
    protected void enviarRespuestaJson(HttpExchange intercambio, int codigoEstado, String respuestaJson) throws IOException {
        byte[] bytes = respuestaJson != null ? respuestaJson.getBytes(StandardCharsets.UTF_8) : new byte[0];
        intercambio.getResponseHeaders().add("Content-Type", "application/json; charset=UTF-8");
        intercambio.sendResponseHeaders(codigoEstado, bytes.length);
        
        OutputStream os = intercambio.getResponseBody();
        if (bytes.length > 0) os.write(bytes);
        os.close();
    }

    /** Alias para compatibilidad */
    protected void sendJsonResponse(HttpExchange exchange, int statusCode, String jsonResponse) throws IOException {
        enviarRespuestaJson(exchange, statusCode, jsonResponse);
    }

    /**
     * Envía una respuesta de error en JSON.
     */
    protected void enviarRespuestaError(HttpExchange intercambio, int codigoEstado, String mensaje) throws IOException {
        String mensajeSeguro = mensaje.replace("\"", "\\\"");
        String json = "{\"error\": \"" + mensajeSeguro + "\"}";
        enviarRespuestaJson(intercambio, codigoEstado, json);
    }

    protected void sendErrorResponse(HttpExchange exchange, int statusCode, String message) throws IOException {
        enviarRespuestaError(exchange, statusCode, message);
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

    protected String getQueryParam(HttpExchange exchange, String paramName) {
        return obtenerParametroConsulta(exchange, paramName);
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

    protected int getQueryParamInt(HttpExchange exchange, String paramName, int defaultValue) {
        return obtenerParametroConsultaEntero(exchange, paramName, defaultValue);
    }
}
