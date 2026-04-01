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
import java.util.List;
import infrastructure.persistence.jdbc.CartDAO;
import domain.models.CartItem;

public class CartHandler implements HttpHandler {
    private final CartDAO cartDAO = new CartDAO();
    private final Gson gson = new Gson();

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        // CORS
        exchange.getResponseHeaders().add("Access-Control-Allow-Origin", "*");
        exchange.getResponseHeaders().add("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        exchange.getResponseHeaders().add("Access-Control-Allow-Headers", "Content-Type");

        if ("OPTIONS".equals(exchange.getRequestMethod())) {
            exchange.sendResponseHeaders(204, -1);
            return;
        }

        try {
            String path = exchange.getRequestURI().getPath();
            String method = exchange.getRequestMethod();
            exchange.getResponseHeaders().add("Content-Type", "application/json");

            if ("GET".equals(method)) {
                // GET /api/cart?userId=xx
                String query = exchange.getRequestURI().getQuery();
                if (query != null && query.contains("userId=")) {
                    int userId = Integer.parseInt(query.split("userId=")[1]);
                    List<CartItem> items = cartDAO.getCartByUser(userId);
                    String response = gson.toJson(items);
                    sendResponse(exchange, 200, response);
                } else {
                    sendResponse(exchange, 400, "{\"error\":\"Missing userId\"}");
                }
            } else if ("POST".equals(method)) {
                // POST /api/cart
                InputStream is = exchange.getRequestBody();
                String body = new String(is.readAllBytes(), StandardCharsets.UTF_8);
                JsonObject json = JsonParser.parseString(body).getAsJsonObject();
                int userId = json.get("userId").getAsInt();
                int productId = json.get("productId").getAsInt();
                int quantity = json.get("quantity").getAsInt();

                boolean success = cartDAO.addToCart(userId, productId, quantity);
                sendResponse(exchange, success ? 200 : 500, "{\"success\":" + success + "}");
            } else if ("PUT".equals(method)) {
                // PUT /api/cart/{cartItemId}
                String[] parts = path.split("/");
                int cartItemId = Integer.parseInt(parts[parts.length - 1]);
                InputStream is = exchange.getRequestBody();
                String body = new String(is.readAllBytes(), StandardCharsets.UTF_8);
                JsonObject json = JsonParser.parseString(body).getAsJsonObject();
                int quantity = json.get("quantity").getAsInt();

                boolean success = cartDAO.updateQuantity(cartItemId, quantity);
                sendResponse(exchange, success ? 200 : 500, "{\"success\":" + success + "}");
            } else if ("DELETE".equals(method)) {
                // DELETE /api/cart/{cartItemId} or /api/cart/clear/{userId}
                if (path.contains("/clear/")) {
                    String[] parts = path.split("/");
                    int userId = Integer.parseInt(parts[parts.length - 1]);
                    boolean success = cartDAO.clearCart(userId);
                    sendResponse(exchange, success ? 200 : 500, "{\"success\":" + success + "}");
                } else {
                    String[] parts = path.split("/");
                    int cartItemId = Integer.parseInt(parts[parts.length - 1]);
                    boolean success = cartDAO.removeFromCart(cartItemId);
                    sendResponse(exchange, success ? 200 : 500, "{\"success\":" + success + "}");
                }
            } else {
                sendResponse(exchange, 405, "{\"error\":\"Method not allowed\"}");
            }
        } catch (Exception e) {
            e.printStackTrace();
            sendResponse(exchange, 500, "{\"error\":\"Internal Server Error: " + e.getMessage() + "\"}");
        }
    }

    private void sendResponse(HttpExchange exchange, int statusCode, String response) throws IOException {
        byte[] bytes = response.getBytes(StandardCharsets.UTF_8);
        exchange.sendResponseHeaders(statusCode, bytes.length);
        OutputStream os = exchange.getResponseBody();
        os.write(bytes);
        os.close();
    }
}
