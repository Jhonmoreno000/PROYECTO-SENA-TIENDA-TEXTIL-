package infrastructure.api.handlers;

import application.services.AuthService;
import com.sun.net.httpserver.HttpExchange;
import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import domain.models.User;

import java.io.InputStream;
import java.nio.charset.StandardCharsets;

/**
 * Controlador para operaciones de Autenticación.
 * Delega toda la lógica de negocio al Servicio correspondiente.
 */
public class AuthHandler extends BaseHandler {
    private final AuthService authService;
    private final Gson gson;

    // Inyección de dependencias a través del constructor
    public AuthHandler(AuthService authService) {
        this.authService = authService;
        this.gson = new Gson();
    }

    @Override
    protected void processRequest(HttpExchange exchange) throws Exception {
        if (!"POST".equals(exchange.getRequestMethod())) {
            sendJsonResponse(exchange, 405, "{\"error\": \"Método no permitido\"}");
            return;
        }

        String path = exchange.getRequestURI().getPath();
        InputStream is = exchange.getRequestBody();
        String body = new String(is.readAllBytes(), StandardCharsets.UTF_8);
        JsonObject jsonObj = JsonParser.parseString(body).getAsJsonObject();

        if (path.equals("/api/login")) {
            String email = jsonObj.has("email") ? jsonObj.get("email").getAsString() : null;
            String password = jsonObj.has("password") ? jsonObj.get("password").getAsString() : null;

            // La Capa de Presentación (Controller) invoca a la Capa de Aplicación (Service)
            User user = authService.login(email, password);
            
            String jsonResponse = gson.toJson(user);
            sendJsonResponse(exchange, 200, "{\"success\": true, \"user\": " + jsonResponse + "}");

        } else if (path.equals("/api/register")) {
            String name = jsonObj.has("name") ? jsonObj.get("name").getAsString() : null;
            String email = jsonObj.has("email") ? jsonObj.get("email").getAsString() : null;
            String password = jsonObj.has("password") ? jsonObj.get("password").getAsString() : null;

            authService.registerClient(name, email, password);
            
            // Si el servicio no lanza excepción, fue exitoso
            sendJsonResponse(exchange, 201, "{\"success\": true, \"message\": \"Usuario registrado\"}");

        } else {
            sendJsonResponse(exchange, 404, "{\"error\": \"Ruta no encontrada\"}");
        }
    }
}
