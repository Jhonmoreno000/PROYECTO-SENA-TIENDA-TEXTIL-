package infrastructure.api.handlers;

import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import com.sun.net.httpserver.HttpExchange;
import infrastructure.persistence.jdbc.OrderDAO;
import domain.models.Order;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import java.io.InputStream;
import java.lang.reflect.Type;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;

/**
 * Controlador para la gestión de pedidos (órdenes de compra).
 * Ruta base: /api/orders
 * Soporta:
 * - GET /api/orders → Lista todos los pedidos.
 * - PUT /api/orders/{id}/status → Actualiza el estado de un pedido.
 */
public class OrdersHandler extends BaseHandler {
    private final OrderDAO orderDAO;
    private final Gson gson;

    /**
     * Constructor que inicializa el DAO de pedidos y el convertidor Gson.
     */
    public OrdersHandler() {
        this.orderDAO = new OrderDAO();
        this.gson = new Gson();
    }

    /**
     * Enruta la solicitud según el método HTTP.
     * GET: devuelve todos los pedidos.
     * PUT /api/orders/{id}/status: actualiza el estado de un pedido.
     */
    @Override
    protected void processRequest(HttpExchange exchange) throws Exception {
        String method = exchange.getRequestMethod();

        // GET /api/orders — Obtiene el listado completo de pedidos
        if ("GET".equalsIgnoreCase(method)) {
            List<Order> orders = orderDAO.getAllOrders();
            String jsonResponse = gson.toJson(orders);
            byte[] bytes = jsonResponse.getBytes(StandardCharsets.UTF_8);
            exchange.sendResponseHeaders(200, bytes.length);
            exchange.getResponseBody().write(bytes);

        // POST /api/orders — Crea un nuevo pedido desde el checkout
        } else if ("POST".equalsIgnoreCase(method)) {
            InputStream is = exchange.getRequestBody();
            String body = new String(is.readAllBytes(), StandardCharsets.UTF_8);
            JsonObject json = JsonParser.parseString(body).getAsJsonObject();

            int clientId = json.get("clientId").getAsInt();
            double total = json.get("total").getAsDouble();

            Type listType = new TypeToken<List<Map<String, Object>>>(){}.getType();
            List<Map<String, Object>> items = gson.fromJson(json.get("items"), listType);

            int orderId = orderDAO.createOrder(clientId, total, items);

            if (orderId > 0) {
                String resp = "{\"success\":true,\"orderId\":" + orderId + "}";
                sendJsonResponse(exchange, 201, resp);
            } else {
                sendJsonResponse(exchange, 500, "{\"error\":\"Error al crear el pedido\"}");
            }

        // PUT /api/orders/{id}/status — Cambia el estado de un pedido (ej: pendiente → enviado)
        } else if ("PUT".equalsIgnoreCase(method)) {
            String uriPath = exchange.getRequestURI().getPath();
            if (uriPath.contains("/status")) {
                int orderId = Integer.parseInt(uriPath.split("/")[3]);
                InputStream is = exchange.getRequestBody();
                String body = new String(is.readAllBytes(), StandardCharsets.UTF_8);
                JsonObject json = JsonParser.parseString(body).getAsJsonObject();
                String status = json.get("status").getAsString();
                boolean success = orderDAO.updateOrderStatus(orderId, status);
                sendJsonResponse(exchange, success ? 200 : 500, success ? "{\"success\":true}" : "{\"error\":\"Error actualizando\"}");
            } else {
                sendJsonResponse(exchange, 404, "{\"error\":\"Not found\"}");
            }
        } else {
            sendJsonResponse(exchange, 405, "{\"error\":\"Method not allowed\"}");
        }
    }
}
