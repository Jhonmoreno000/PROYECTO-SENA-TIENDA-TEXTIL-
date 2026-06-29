package infrastructure.api.handlers;

import infrastructure.persistence.jdbc.*;
import domain.models.*;
import com.sun.net.httpserver.HttpExchange;
import com.google.gson.Gson;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.List;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

/**
 * Controlador para la gestión de productos (CRUD + moderación + imágenes).
 * Opera sobre la ruta base /api/products y sus subrutas.
 * Maneja GET (listar), POST (crear), PUT (actualizar/moderar/imagen) y DELETE (eliminar).
 */
public class ProductsHandler extends BaseHandler {

    /**
     * Enruta la solicitud según el método HTTP al método privado correspondiente.
     */
    @Override
    protected void processRequest(HttpExchange exchange) throws Exception {
        String method = exchange.getRequestMethod();
        String path = exchange.getRequestURI().getPath();
        // DAO y Gson se crean localmente para cada solicitud (sin estado compartido)
        ProductDAO dao = new ProductDAO();
        Gson gson = new Gson();

        // GET /api/products → listar productos (todos, pendientes o por vendedor)
        if ("GET".equals(method)) {
            handleGet(exchange, path, dao, gson);
        // PUT /api/products/{id} → actualizar producto, moderar o subir imagen
        } else if ("PUT".equals(method)) {
            handlePut(exchange, path, dao, gson);
        // POST /api/products → crear un nuevo producto
        } else if ("POST".equals(method)) {
            handlePost(exchange, dao, gson);
        // DELETE /api/products/{id} → eliminar un producto
        } else if ("DELETE".equals(method)) {
            handleDelete(exchange, path, dao, gson);
        } else {
            sendJsonResponse(exchange, 405, "{\"error\":\"Method not allowed\"}");
        }
    }

    /**
     * GET /api/products — Lista todos los productos.
     * GET /api/products/pending — Lista productos pendientes de moderación.
     * GET /api/products?sellerId=N — Lista productos de un vendedor específico.
     */
    private void handleGet(HttpExchange exchange, String path, ProductDAO dao, Gson gson) throws Exception {
        List<Product> products;
        String queryParams = exchange.getRequestURI().getQuery();

        // Ruta hija: productos pendientes de aprobación
        if (path.equals("/api/products/pending")) {
            products = dao.getPendingProducts();
        // Filtro por vendedor: /api/products?sellerId=123
        } else if (queryParams != null && queryParams.contains("sellerId=")) {
            int sellerId = Integer.parseInt(queryParams.split("sellerId=")[1].split("&")[0]);
            products = dao.getProductsBySeller(sellerId);
        // Listado completo de productos
        } else {
            products = dao.getAllProducts();
        }
        sendJsonResponse(exchange, 200, gson.toJson(products));
    }

    /**
     * PUT /api/products/{id}/moderate — Aprueba o rechaza un producto (moderación).
     * PUT /api/products/{id} — Actualiza los datos de un producto existente.
     * PUT /api/products/{id}/image — Guarda una imagen en base64 para un producto.
     */
    private void handlePut(HttpExchange exchange, String path, ProductDAO dao, Gson gson) throws Exception {
        // Moderación: PUT /api/products/{id}/moderate
        if (path.contains("/moderate")) {
            int productId = Integer.parseInt(path.split("/")[3]);
            InputStream is = exchange.getRequestBody();
            String body = new String(is.readAllBytes(), StandardCharsets.UTF_8);
            JsonObject json = JsonParser.parseString(body).getAsJsonObject();
            String status = json.get("status").getAsString();
            String reason = json.has("reason") ? json.get("reason").getAsString() : null;
            boolean success = dao.updateModerationStatus(productId, status, reason);
            sendJsonResponse(exchange, success ? 200 : 500, success ? "{\"success\":true}" : "{\"error\":\"Moderation failed\"}");

        // Actualización de producto: PUT /api/products/{id}
        } else if (path.matches("^/api/products/\\d+$")) {
            int productId = Integer.parseInt(path.split("/")[3]);
            InputStream is = exchange.getRequestBody();
            String body = new String(is.readAllBytes(), StandardCharsets.UTF_8);
            Product updates = gson.fromJson(body, Product.class);
            boolean success = dao.updateProduct(productId, updates);
            sendJsonResponse(exchange, success ? 200 : 500, success ? "{\"success\":true}" : "{\"error\":\"Update failed\"}");

        // Subida de imagen: PUT /api/products/{id}/image
        } else if (path.matches("^/api/products/\\d+/image$")) {
            int productId = Integer.parseInt(path.split("/")[3]);
            InputStream is = exchange.getRequestBody();
            String body = new String(is.readAllBytes(), StandardCharsets.UTF_8);
            JsonObject json = JsonParser.parseString(body).getAsJsonObject();
            String base64Image = json.get("image").getAsString();
            String savedUrl = dao.saveProductImage(productId, base64Image);

            if (savedUrl != null) {
                sendJsonResponse(exchange, 200, "{\"url\": \"" + savedUrl + "\"}");
            } else {
                sendJsonResponse(exchange, 500, "{\"error\":\"Error saving image\"}");
            }
        } else {
            sendJsonResponse(exchange, 404, "{\"error\":\"Not found\"}");
        }
    }

    /**
     * POST /api/products — Crea un nuevo producto a partir del cuerpo JSON.
     */
    private void handlePost(HttpExchange exchange, ProductDAO dao, Gson gson) throws Exception {
        InputStream is = exchange.getRequestBody();
        String body = new String(is.readAllBytes(), StandardCharsets.UTF_8);
        Product newProduct = gson.fromJson(body, Product.class);
        boolean success = dao.addProduct(newProduct);
        sendJsonResponse(exchange, success ? 201 : 500, success ? "{\"success\":true}" : "{\"error\":\"Insert failed\"}");
    }

    /**
     * DELETE /api/products/{id} — Elimina un producto por su ID.
     */
    private void handleDelete(HttpExchange exchange, String path, ProductDAO dao, Gson gson) throws Exception {
        if (path.matches("^/api/products/\\d+$")) {
            int productId = Integer.parseInt(path.split("/")[3]);
            boolean success = dao.deleteProduct(productId);
            sendJsonResponse(exchange, success ? 200 : 500, success ? "{\"success\":true}" : "{\"error\":\"Delete failed\"}");
        } else {
            sendJsonResponse(exchange, 404, "{\"error\":\"Not found\"}");
        }
    }
}
