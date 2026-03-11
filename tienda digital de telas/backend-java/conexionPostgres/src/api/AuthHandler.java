package api;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;

import dao.AuthDAO;
import models.User;

public class AuthHandler implements HttpHandler {
    @Override
    public void handle(HttpExchange exchange) throws IOException {
        // CORS config
        exchange.getResponseHeaders().add("Access-Control-Allow-Origin", "http://localhost:3001");
        exchange.getResponseHeaders().add("Access-Control-Allow-Methods", "POST, OPTIONS");
        exchange.getResponseHeaders().add("Access-Control-Allow-Headers", "Content-Type,Authorization");

        if ("OPTIONS".equals(exchange.getRequestMethod())) {
            exchange.sendResponseHeaders(204, -1);
            return;
        }

        if ("POST".equals(exchange.getRequestMethod())) {
            String path = exchange.getRequestURI().getPath();
            
            try {
                InputStream is = exchange.getRequestBody();
                String body = new String(is.readAllBytes(), StandardCharsets.UTF_8);
                JsonObject jsonObj = JsonParser.parseString(body).getAsJsonObject();
                Gson gson = new Gson();
                
                AuthDAO authDAO = new AuthDAO();
                
                if (path.equals("/api/login")) {
                    String email = jsonObj.get("email").getAsString();
                    String password = jsonObj.get("password").getAsString();
                    
                    User user = authDAO.login(email, password);
                    if (user != null) {
                        if (user.isSuspended()) {
                            sendResponse(exchange, 403, "{\"error\": \"Cuenta suspendida: " + user.getSuspensionReason() + "\"}");
                        } else {
                            // Valid login
                            // For simplicity returning user data, real app would return JWT token
                            String jsonResponse = gson.toJson(user);
                            sendResponse(exchange, 200, "{\"success\": true, \"user\": " + jsonResponse + "}");
                        }
                    } else {
                        sendResponse(exchange, 401, "{\"error\": \"Credenciales incorrectas\"}");
                    }

                } else if (path.equals("/api/register")) {
                    String name = jsonObj.get("name").getAsString();
                    String email = jsonObj.get("email").getAsString();
                    String password = jsonObj.get("password").getAsString();
                    
                    User newUser = new User();
                    newUser.setName(name);
                    newUser.setEmail(email);
                    newUser.setRole("cliente"); // Default role
                    
                    boolean success = authDAO.register(newUser, password);
                    if (success) {
                        sendResponse(exchange, 201, "{\"success\": true, \"message\": \"Usuario registrado\"}");
                    } else {
                        sendResponse(exchange, 400, "{\"error\": \"Error al registrar usuario (correo ya existe)\"}");
                    }
                } else {
                    sendResponse(exchange, 404, "{\"error\": \"No encontrado\"}");
                }
            } catch (Exception e) {
                e.printStackTrace();
                sendResponse(exchange, 500, "{\"error\": \"Error interno del servidor\"}");
            }
        } else {
            sendResponse(exchange, 405, "{\"error\": \"Método no permitido\"}");
        }
    }

    private void sendResponse(HttpExchange exchange, int statusCode, String response) throws IOException {
        byte[] responseBytes = response.getBytes(StandardCharsets.UTF_8);
        exchange.getResponseHeaders().add("Content-Type", "application/json; charset=UTF-8");
        exchange.sendResponseHeaders(statusCode, responseBytes.length);
        OutputStream os = exchange.getResponseBody();
        os.write(responseBytes);
        os.close();
    }
}
