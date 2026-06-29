package infrastructure.api.handlers;

import com.google.gson.Gson;
import com.sun.net.httpserver.HttpExchange;
import infrastructure.persistence.jdbc.UserDAO;
import domain.models.User;
import java.nio.charset.StandardCharsets;
import java.util.List;

/**
 * Controlador para la gestión de usuarios del sistema.
 * Actualmente solo soporta consulta GET de todos los usuarios registrados.
 * Ruta base: /api/users
 */
public class UsersHandler extends BaseHandler {
    private final UserDAO userDAO;
    private final Gson gson;

    /**
     * Constructor que inicializa el DAO de usuarios y el convertidor Gson.
     */
    public UsersHandler() {
        this.userDAO = new UserDAO();
        this.gson = new Gson();
    }

    /**
     * Procesa las solicitudes entrantes.
     * GET /api/users — Devuelve la lista completa de usuarios en formato JSON.
     */
    @Override
    protected void processRequest(HttpExchange exchange) throws Exception {
        // Solo acepta método GET
        if ("GET".equalsIgnoreCase(exchange.getRequestMethod())) {
            // Obtiene todos los usuarios desde la base de datos
            List<User> users = userDAO.getAllUsers();
            // Convierte la lista a JSON
            String jsonResponse = gson.toJson(users);
            // Construye manualmente la respuesta (byte a byte) con codificación UTF-8
            byte[] bytes = jsonResponse.getBytes(StandardCharsets.UTF_8);
            exchange.getResponseHeaders().add("Content-Type", "application/json; charset=UTF-8");
            exchange.sendResponseHeaders(200, bytes.length);
            exchange.getResponseBody().write(bytes);
        } else {
            // Método HTTP no soportado
            sendJsonResponse(exchange, 405, "{\"error\":\"Method not allowed\"}");
        }
    }
}
