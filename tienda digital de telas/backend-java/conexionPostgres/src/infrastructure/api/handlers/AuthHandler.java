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
 * Controlador para operaciones de autenticación de usuarios.
 * Maneja el inicio de sesión (login) y el registro (register) de nuevos clientes.
 * Delega toda la lógica de negocio al servicio {@link AuthService}
 * siguiendo la arquitectura Clean Architecture (capa de aplicación).
 */
public class AuthHandler extends BaseHandler {
    private final AuthService authService;
    private final Gson gson;

    /**
     * Constructor con inyección de dependencias.
     *
     * @param authService Servicio de autenticación inyectado desde la capa de aplicación.
     */
    public AuthHandler(AuthService authService) {
        this.authService = authService;
        this.gson = new Gson();
    }

    /**
     * Procesa las solicitudes HTTP entrantes.
     * Solo acepta método POST.
     * Rutas manejadas:
     * - POST /api/login  → Inicia sesión con email y contraseña.
     * - POST /api/register → Registra un nuevo cliente.
     */
    @Override
    protected void processRequest(HttpExchange exchange) throws Exception {
        // Verifica que el método sea POST; si no, responde con 405 Method Not Allowed
        if (!"POST".equals(exchange.getRequestMethod())) {
            sendJsonResponse(exchange, 405, "{\"error\": \"Método no permitido\"}");
            return;
        }

        // Obtiene la ruta solicitada para determinar la acción
        String path = exchange.getRequestURI().getPath();
        // Lee el cuerpo de la solicitud como texto UTF-8
        InputStream is = exchange.getRequestBody();
        String body = new String(is.readAllBytes(), StandardCharsets.UTF_8);
        // Parsea el cuerpo JSON a un objeto manipulable
        JsonObject jsonObj = JsonParser.parseString(body).getAsJsonObject();

        // --- POST /api/login: Inicio de sesión ---
        if (path.equals("/api/login")) {
            // Extrae credenciales del JSON (campos opcionales → null si no existen)
            String email = jsonObj.has("email") ? jsonObj.get("email").getAsString() : null;
            String password = jsonObj.has("password") ? jsonObj.get("password").getAsString() : null;

            // La capa de presentación invoca a la capa de aplicación para validar credenciales
            User user = authService.login(email, password);
            
            // Si no hay excepción, las credenciales son correctas: devuelve el usuario
            String jsonResponse = gson.toJson(user);
            sendJsonResponse(exchange, 200, "{\"success\": true, \"user\": " + jsonResponse + "}");

        // --- POST /api/register: Registro de nuevo cliente ---
        } else if (path.equals("/api/register")) {
            // Extrae datos del formulario de registro desde el JSON
            String name = jsonObj.has("name") ? jsonObj.get("name").getAsString() : null;
            String email = jsonObj.has("email") ? jsonObj.get("email").getAsString() : null;
            String password = jsonObj.has("password") ? jsonObj.get("password").getAsString() : null;

            // Registra al cliente a través del servicio de aplicación
            authService.registerClient(name, email, password);
            
            // Si el servicio no lanza excepción, el registro fue exitoso
            sendJsonResponse(exchange, 201, "{\"success\": true, \"message\": \"Usuario registrado\"}");

        } else {
            // Ruta no reconocida dentro de este handler
            sendJsonResponse(exchange, 404, "{\"error\": \"Ruta no encontrada\"}");
        }
    }
}
