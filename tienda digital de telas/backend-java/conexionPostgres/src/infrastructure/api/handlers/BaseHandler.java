package infrastructure.api.handlers;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import java.io.IOException;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;

import domain.exceptions.DomainException;

/**
 * Envoltorio Global para los endpoints (Global Error Handler & Middleware CORS).
 */
public abstract class BaseHandler implements HttpHandler {

    @Override
    public final void handle(HttpExchange exchange) throws IOException {
        // Configuraciones globales de CORS
        exchange.getResponseHeaders().add("Access-Control-Allow-Origin", "*");
        exchange.getResponseHeaders().add("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE, OPTIONS");
        exchange.getResponseHeaders().add("Access-Control-Allow-Headers", "Content-Type,Authorization");

        // Cortar la ejecución si es solicitud Pre-flight
        if ("OPTIONS".equals(exchange.getRequestMethod())) {
            exchange.sendResponseHeaders(204, -1);
            return;
        }

        try {
            // Delega el flujo del endpoint a las subclases
            processRequest(exchange);
        } catch (DomainException e) {
            // Manejador centralizado para errores de negocio (Ej: Credenciales incorrectas)
            System.err.println("Error de Negocio: " + e.getMessage());
            sendErrorResponse(exchange, 400, e.getMessage());
        } catch (Exception e) {
            // Captura cualquier otro error incontrolado (Ej: NullPointer, Base de datos)
            e.printStackTrace();
            sendErrorResponse(exchange, 500, "Error interno del servidor. Por favor contacta soporte.");
        }
    }

    /**
     * Reemplaza el antiguo 'handle' para evitar re-escribir lógica de CORS o Try-Catches
     */
    protected abstract void processRequest(HttpExchange exchange) throws Exception;

    protected void sendJsonResponse(HttpExchange exchange, int statusCode, String jsonResponse) throws IOException {
        byte[] bytes = jsonResponse != null ? jsonResponse.getBytes(StandardCharsets.UTF_8) : new byte[0];
        exchange.getResponseHeaders().add("Content-Type", "application/json; charset=UTF-8");
        exchange.sendResponseHeaders(statusCode, bytes.length);
        
        OutputStream os = exchange.getResponseBody();
        if (bytes.length > 0) os.write(bytes);
        os.close();
    }

    private void sendErrorResponse(HttpExchange exchange, int statusCode, String message) throws IOException {
        String safeMessage = message.replace("\"", "\\\"");
        String json = "{\"error\": \"" + safeMessage + "\"}";
        sendJsonResponse(exchange, statusCode, json);
    }
}
