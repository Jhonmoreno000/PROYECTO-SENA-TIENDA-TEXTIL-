package infrastructure.api.handlers;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.util.Map;

import infrastructure.persistence.jdbc.ConfigDAO;

public class ConfigHandler implements HttpHandler {
    @Override
    public void handle(HttpExchange exchange) throws IOException {
        exchange.getResponseHeaders().add("Access-Control-Allow-Origin", "*");
        exchange.getResponseHeaders().add("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        exchange.getResponseHeaders().add("Access-Control-Allow-Headers", "Content-Type,Authorization");

        if ("OPTIONS".equals(exchange.getRequestMethod())) {
            exchange.sendResponseHeaders(204, -1);
            return;
        }

        ConfigDAO dao = new ConfigDAO();
        Gson gson = new Gson();

        try {
            if ("GET".equals(exchange.getRequestMethod())) {
                String path = exchange.getRequestURI().getPath();
                if (path.equals("/api/config")) {
                    Map<String, String> configs = dao.getAllConfig();
                    sendResponse(exchange, 200, gson.toJson(configs));
                } else {
                    // example: /api/config/system_config
                    String key = path.substring(path.lastIndexOf("/") + 1);
                    String value = dao.getConfig(key);
                    if (value != null) {
                        sendResponse(exchange, 200, value); // Return the raw JSON string value stored in DB
                    } else {
                        sendResponse(exchange, 404, "{}");
                    }
                }
            } else if ("POST".equals(exchange.getRequestMethod())) {
                InputStream is = exchange.getRequestBody();
                String body = new String(is.readAllBytes(), StandardCharsets.UTF_8);
                
                // Expecting JSON {"key": "home_sections_config", "value": "[...json array...]"}
                JsonObject jsonObj = JsonParser.parseString(body).getAsJsonObject();
                String key = jsonObj.get("key").getAsString();
                String value = jsonObj.get("value").getAsString(); // Storing as serialized string
                
                if (dao.setConfig(key, value)) {
                    sendResponse(exchange, 200, "{\"success\":true}");
                } else {
                    sendResponse(exchange, 500, "{\"error\":\"Error guardando config\"}");
                }
            } else {
                sendResponse(exchange, 405, "{\"error\":\"Method not allowed\"}");
            }
        } catch (Exception e) {
            e.printStackTrace();
            sendResponse(exchange, 500, "{\"error\":\"Server error\"}");
        }
    }

    private void sendResponse(HttpExchange exchange, int statusCode, String response) throws IOException {
        byte[] responseBytes;
        if (response != null) {
            responseBytes = response.getBytes(StandardCharsets.UTF_8);
        } else {
            responseBytes = new byte[0];
        }
        exchange.getResponseHeaders().add("Content-Type", "application/json; charset=UTF-8");
        exchange.sendResponseHeaders(statusCode, responseBytes.length);
        OutputStream os = exchange.getResponseBody();
        if (responseBytes.length > 0) os.write(responseBytes);
        os.close();
    }
}
