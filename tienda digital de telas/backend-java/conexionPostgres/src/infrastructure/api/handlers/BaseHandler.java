package infrastructure.api.handlers;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import java.io.IOException;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;

import domain.exceptions.DomainException;

/**
 * Clase base abstracta para todos los handlers (controladores) de la API.
 * Implementa HttpHandler y proporciona:
 * - Configuración global de CORS (Access-Control) para todos los endpoints.
 * - Manejo automático de solicitudes preflight (OPTIONS).
 * - Captura centralizada de excepciones de negocio (DomainException → 400)
 *   y errores inesperados (Exception → 500).
 * - Métodos auxiliares para enviar respuestas JSON y errores.
 *
 * Las subclases solo deben implementar {@link #processRequest(HttpExchange)}
 * con la lógica específica de su recurso.
 */
public abstract class BaseHandler implements HttpHandler {

    /**
     * Punto de entrada principal para todas las solicitudes HTTP entrantes.
     * Aplica cabeceras CORS, maneja OPTIONS, captura errores y delega
     * a {@link #processRequest(HttpExchange)}.
     */
    @Override
    public final void handle(HttpExchange exchange) throws IOException {
        // Agrega cabeceras CORS para permitir peticiones desde cualquier origen
        exchange.getResponseHeaders().add("Access-Control-Allow-Origin", "*");
        exchange.getResponseHeaders().add("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE, OPTIONS");
        exchange.getResponseHeaders().add("Access-Control-Allow-Headers", "Content-Type,Authorization");

        // Si es una solicitud preflight (OPTIONS), responde con 204 (sin contenido)
        if ("OPTIONS".equals(exchange.getRequestMethod())) {
            exchange.sendResponseHeaders(204, -1);
            return;
        }

        try {
            // Delega el procesamiento específico a la subclase concreta
            processRequest(exchange);
        } catch (DomainException e) {
            // Error de negocio controlado (ej: credenciales inválidas, producto agotado)
            System.err.println("Error de Negocio: " + e.getMessage());
            sendErrorResponse(exchange, 400, e.getMessage());
        } catch (Exception e) {
            // Error interno no esperado (ej: NullPointerException, fallo de BD)
            e.printStackTrace();
            sendErrorResponse(exchange, 500, "Error interno del servidor. Por favor contacta soporte.");
        }
    }

    /**
     * Método abstracto que cada handler concreto debe implementar.
     * Reemplaza al antiguo 'handle' para evitar reescribir la lógica
     * de CORS y try-catch en cada subclase.
     *
     * @param exchange Intercambio HTTP con la solicitud y respuesta.
     * @throws Exception Si ocurre cualquier error durante el procesamiento.
     */
    protected abstract void processRequest(HttpExchange exchange) throws Exception;

    /**
     * Envía una respuesta HTTP con cuerpo en formato JSON.
     * Configura el Content-Type como application/json con codificación UTF-8.
     *
     * @param exchange   Intercambio HTTP.
     * @param statusCode Código de estado HTTP (200, 201, 400, 500, etc.).
     * @param jsonResponse Cadena JSON con el cuerpo de la respuesta.
     * @throws IOException Si falla la escritura de la respuesta.
     */
    protected void sendJsonResponse(HttpExchange exchange, int statusCode, String jsonResponse) throws IOException {
        byte[] bytes = jsonResponse != null ? jsonResponse.getBytes(StandardCharsets.UTF_8) : new byte[0];
        exchange.getResponseHeaders().add("Content-Type", "application/json; charset=UTF-8");
        exchange.sendResponseHeaders(statusCode, bytes.length);
        
        OutputStream os = exchange.getResponseBody();
        if (bytes.length > 0) os.write(bytes);
        os.close();
    }

    /**
     * Envía una respuesta de error en formato JSON.
     * Escapa comillas dobles en el mensaje para evitar JSON inválido.
     *
     * @param exchange   Intercambio HTTP.
     * @param statusCode Código de estado HTTP del error.
     * @param message    Mensaje descriptivo del error.
     * @throws IOException Si falla la escritura de la respuesta.
     */
    private void sendErrorResponse(HttpExchange exchange, int statusCode, String message) throws IOException {
        String safeMessage = message.replace("\"", "\\\"");
        String json = "{\"error\": \"" + safeMessage + "\"}";
        sendJsonResponse(exchange, statusCode, json);
    }
}
