package infrastructure.api.handlers;

import com.google.gson.Gson;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import infrastructure.persistence.jdbc.OrderDAO;
import domain.models.Order;
import java.io.IOException;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.util.List;

public class OrdersHandler implements HttpHandler {
    private final OrderDAO orderDAO;
    private final Gson gson;

    public OrdersHandler() {
        this.orderDAO = new OrderDAO();
        this.gson = new Gson();
    }

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        exchange.getResponseHeaders().add("Access-Control-Allow-Origin", "*");
        exchange.getResponseHeaders().add("Access-Control-Allow-Methods", "GET, PUT, OPTIONS");
        exchange.getResponseHeaders().add("Access-Control-Allow-Headers", "Content-Type,Authorization");
        exchange.getResponseHeaders().add("Content-Type", "application/json; charset=UTF-8");

        if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
            exchange.sendResponseHeaders(204, -1);
            return;
        }

        if ("GET".equalsIgnoreCase(exchange.getRequestMethod())) {
            try {
                List<Order> orders = orderDAO.getAllOrders();
                String jsonResponse = gson.toJson(orders);

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
        } else if ("PUT".equalsIgnoreCase(exchange.getRequestMethod())) {
            try {
                String uriPath = exchange.getRequestURI().getPath();
                if (uriPath.contains("/status")) {
                    // /api/orders/{id}/status
                    String[] parts = uriPath.split("/");
                    int orderId = Integer.parseInt(parts[3]);

                    InputStream is = exchange.getRequestBody();
                    String body = new String(is.readAllBytes(), StandardCharsets.UTF_8);
                    JsonObject json = JsonParser.parseString(body).getAsJsonObject();
                    String status = json.get("status").getAsString();

                    boolean success = orderDAO.updateOrderStatus(orderId, status);
                    String resp = success ? "{\"success\":true}" : "{\"error\":\"Error actualizando\"}";
                    
                    byte[] bytes = resp.getBytes(StandardCharsets.UTF_8);
                    exchange.sendResponseHeaders(success ? 200 : 500, bytes.length);
                    try (OutputStream os = exchange.getResponseBody()) {
                        os.write(bytes);
                    }
                } else {
                    exchange.sendResponseHeaders(404, -1);
                }
            } catch (Exception e) {
                e.printStackTrace();
                String error = "{\"error\": \"Error\"}";
                exchange.sendResponseHeaders(500, error.getBytes().length);
                OutputStream os = exchange.getResponseBody();
                os.write(error.getBytes());
                os.close();
            }
        } else {
            exchange.sendResponseHeaders(405, -1);
        }
    }
}
