package infrastructure.api.handlers;

import com.google.gson.Gson;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import infrastructure.persistence.jdbc.UserDAO;
import domain.models.User;
import java.io.IOException;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.util.List;

public class UsersHandler implements HttpHandler {
    private final UserDAO userDAO;
    private final Gson gson;

    public UsersHandler() {
        this.userDAO = new UserDAO();
        this.gson = new Gson();
    }

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        // Habilitar CORS
        exchange.getResponseHeaders().add("Access-Control-Allow-Origin", "*");
        exchange.getResponseHeaders().add("Access-Control-Allow-Methods", "GET, OPTIONS");
        exchange.getResponseHeaders().add("Access-Control-Allow-Headers", "Content-Type,Authorization");
        exchange.getResponseHeaders().add("Content-Type", "application/json; charset=UTF-8");

        if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
            exchange.sendResponseHeaders(204, -1);
            return;
        }

        if ("GET".equalsIgnoreCase(exchange.getRequestMethod())) {
            try {
                List<User> users = userDAO.getAllUsers();
                String jsonResponse = gson.toJson(users);

                byte[] bytes = jsonResponse.getBytes(StandardCharsets.UTF_8);
                exchange.sendResponseHeaders(200, bytes.length);

                try (OutputStream os = exchange.getResponseBody()) {
                    os.write(bytes);
                }
            } catch (Exception e) {
                e.printStackTrace();
                String errorMsg = "{\"error\": \"Error interno del servidor\"}";
                byte[] errorBytes = errorMsg.getBytes(StandardCharsets.UTF_8);
                exchange.sendResponseHeaders(500, errorBytes.length);
                try (OutputStream os = exchange.getResponseBody()) {
                    os.write(errorBytes);
                }
            }
        } else {
            exchange.sendResponseHeaders(405, -1); // Method Not Allowed
        }
    }
}
