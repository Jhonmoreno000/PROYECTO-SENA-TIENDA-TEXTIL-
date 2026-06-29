package infrastructure.api.handlers;

import com.sun.net.httpserver.HttpExchange;
import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.List;
import infrastructure.persistence.jdbc.CartDAO;
import domain.models.CartItem;

/**
 * Controlador para la gestión del carrito de compras.
 * Ruta base: /api/cart
 * Soporta operaciones CRUD completas sobre los ítems del carrito:
 * GET, POST, PUT, DELETE.
 */
public class CartHandler extends BaseHandler {
    private final CartDAO cartDAO = new CartDAO();
    private final Gson gson = new Gson();

    /**
     * Enruta la solicitud según el método HTTP.
     * GET /api/cart?userId=N → Obtiene el carrito de un usuario.
     * POST /api/cart → Agrega un producto al carrito.
     * PUT /api/cart/{id} → Actualiza la cantidad de un ítem.
     * DELETE /api/cart/{id} → Elimina un ítem del carrito.
     * DELETE /api/cart/clear/{userId} → Vacía el carrito de un usuario.
     */
    @Override
    protected void processRequest(HttpExchange exchange) throws Exception {
        String path = exchange.getRequestURI().getPath();
        String method = exchange.getRequestMethod();

        // GET /api/cart?userId=N — Obtiene todos los ítems del carrito de un usuario
        if ("GET".equals(method)) {
            String query = exchange.getRequestURI().getQuery();
            if (query != null && query.contains("userId=")) {
                int userId = Integer.parseInt(query.split("userId=")[1]);
                List<CartItem> items = cartDAO.getCartByUser(userId);
                sendJsonResponse(exchange, 200, gson.toJson(items));
            } else {
                sendJsonResponse(exchange, 400, "{\"error\":\"Missing userId\"}");
            }

        // POST /api/cart — Agrega un producto al carrito (userId, productId, quantity)
        } else if ("POST".equals(method)) {
            InputStream is = exchange.getRequestBody();
            String body = new String(is.readAllBytes(), StandardCharsets.UTF_8);
            JsonObject json = JsonParser.parseString(body).getAsJsonObject();
            int userId = json.get("userId").getAsInt();
            int productId = json.get("productId").getAsInt();
            int quantity = json.get("quantity").getAsInt();
            boolean success = cartDAO.addToCart(userId, productId, quantity);
            sendJsonResponse(exchange, success ? 200 : 500, "{\"success\":" + success + "}");

        // PUT /api/cart/{cartItemId} — Actualiza la cantidad de un ítem específico
        } else if ("PUT".equals(method)) {
            int cartItemId = Integer.parseInt(path.split("/")[path.split("/").length - 1]);
            InputStream is = exchange.getRequestBody();
            String body = new String(is.readAllBytes(), StandardCharsets.UTF_8);
            JsonObject json = JsonParser.parseString(body).getAsJsonObject();
            int quantity = json.get("quantity").getAsInt();
            boolean success = cartDAO.updateQuantity(cartItemId, quantity);
            sendJsonResponse(exchange, success ? 200 : 500, "{\"success\":" + success + "}");

        // DELETE — Puede eliminar un ítem individual o vaciar el carrito completo
        } else if ("DELETE".equals(method)) {
            if (path.contains("/clear/")) {
                // DELETE /api/cart/clear/{userId} — Vacía todo el carrito del usuario
                int userId = Integer.parseInt(path.split("/")[path.split("/").length - 1]);
                boolean success = cartDAO.clearCart(userId);
                sendJsonResponse(exchange, success ? 200 : 500, "{\"success\":" + success + "}");
            } else {
                // DELETE /api/cart/{cartItemId} — Elimina un solo ítem del carrito
                int cartItemId = Integer.parseInt(path.split("/")[path.split("/").length - 1]);
                boolean success = cartDAO.removeFromCart(cartItemId);
                sendJsonResponse(exchange, success ? 200 : 500, "{\"success\":" + success + "}");
            }
        } else {
            sendJsonResponse(exchange, 405, "{\"error\":\"Method not allowed\"}");
        }
    }
}
