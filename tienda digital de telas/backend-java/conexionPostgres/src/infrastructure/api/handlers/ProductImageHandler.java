package infrastructure.api.handlers;

import infrastructure.persistence.jdbc.ProductDAO;
import com.sun.net.httpserver.HttpExchange;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;

/**
 * Controlador dedicado exclusivamente a la subida de imágenes de productos.
 * Actualmente no está registrado en el servidor (comentado en ApiServer).
 * Ruta esperada: /api/products/{id}/image
 * Solo acepta método PUT con una imagen codificada en base64 en el cuerpo JSON.
 */
public class ProductImageHandler extends BaseHandler {

    /**
     * PUT /api/products/{id}/image — Guarda una imagen base64 para un producto.
     * El cuerpo JSON debe contener el campo "image" con la cadena base64.
     * Retorna la URL pública de la imagen guardada.
     */
    @Override
    protected void processRequest(HttpExchange exchange) throws Exception {
        // Solo acepta método PUT
        if (!"PUT".equals(exchange.getRequestMethod())) {
            sendJsonResponse(exchange, 405, "{\"error\":\"Method not allowed\"}");
            return;
        }

        // Extrae el ID del producto desde la ruta (/api/products/{id}/image)
        String path = exchange.getRequestURI().getPath();
        String[] parts = path.split("/");
        int productId = Integer.parseInt(parts[3]);

        // Lee el cuerpo de la solicitud y extrae la imagen base64
        InputStream is = exchange.getRequestBody();
        String body = new String(is.readAllBytes(), StandardCharsets.UTF_8);
        JsonObject json = JsonParser.parseString(body).getAsJsonObject();
        String base64Image = json.get("image").getAsString();

        // Guarda la imagen y devuelve la URL generada
        ProductDAO dao = new ProductDAO();
        String savedUrl = dao.saveProductImage(productId, base64Image);

        if (savedUrl != null) {
            sendJsonResponse(exchange, 200, "{\"url\": \"" + savedUrl + "\"}");
        } else {
            sendJsonResponse(exchange, 500, "{\"error\": \"Error saving image\"}");
        }
    }
}
