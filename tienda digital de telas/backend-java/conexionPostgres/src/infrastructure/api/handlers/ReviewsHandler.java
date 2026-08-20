package infrastructure.api.handlers;

import infrastructure.persistence.jdbc.ReviewsDAO;
import domain.models.Review;
import com.sun.net.httpserver.HttpExchange;
import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.List;

/**
 * Controlador para la gestión de reseñas de productos.
 * Opera sobre la ruta base /api/reviews.
 * Maneja GET (listar reseñas de un producto) y POST (crear una reseña).
 */
public class ReviewsHandler extends BaseHandler {

    /**
     * Enruta la solicitud según el método HTTP al método privado correspondiente.
     */
    @Override
    protected void processRequest(HttpExchange exchange) throws Exception {
        String method = exchange.getRequestMethod();
        ReviewsDAO dao = new ReviewsDAO();
        Gson gson = new Gson();

        if ("GET".equals(method)) {
            handleGet(exchange, dao, gson);
        } else if ("POST".equals(method)) {
            handlePost(exchange, dao, gson);
        } else {
            sendJsonResponse(exchange, 405, "{\"error\":\"Method not allowed\"}");
        }
    }

    /**
     * GET /api/reviews?productId=N — Lista las reseñas de un producto.
     */
    private void handleGet(HttpExchange exchange, ReviewsDAO dao, Gson gson) throws Exception {
        String queryParams = exchange.getRequestURI().getQuery();
        if (queryParams == null || !queryParams.contains("productId=")) {
            sendJsonResponse(exchange, 400, "{\"error\":\"Falta el parametro productId\"}");
            return;
        }
        int productId;
        try {
            productId = Integer.parseInt(queryParams.split("productId=")[1].split("&")[0]);
        } catch (NumberFormatException e) {
            sendJsonResponse(exchange, 400, "{\"error\":\"productId invalido\"}");
            return;
        }
        List<Review> reviews = dao.getReviewsByProduct(productId);
        sendJsonResponse(exchange, 200, gson.toJson(reviews));
    }

    /**
     * POST /api/reviews — Crea una nueva reseña.
     * Cuerpo esperado: { "productId": 1, "userId": 2, "rating": 5, "comment": "..." }
     */
    private void handlePost(HttpExchange exchange, ReviewsDAO dao, Gson gson) throws Exception {
        InputStream is = exchange.getRequestBody();
        String body = new String(is.readAllBytes(), StandardCharsets.UTF_8);

        JsonObject json;
        try {
            json = JsonParser.parseString(body).getAsJsonObject();
        } catch (Exception e) {
            sendJsonResponse(exchange, 400, "{\"error\":\"JSON invalido\"}");
            return;
        }

        // Valida que todos los campos requeridos esten presentes
        if (!json.has("productId") || !json.has("userId") || !json.has("rating") || !json.has("comment")) {
            sendJsonResponse(exchange, 400, "{\"error\":\"Faltan campos: productId, userId, rating, comment\"}");
            return;
        }

        int productId = json.get("productId").getAsInt();
        int userId = json.get("userId").getAsInt();
        int rating = json.get("rating").getAsInt();
        String comment = json.get("comment").getAsString().trim();

        // La calificacion debe estar entre 1 y 5 estrellas
        if (rating < 1 || rating > 5) {
            sendJsonResponse(exchange, 400, "{\"error\":\"La calificacion debe estar entre 1 y 5 estrellas\"}");
            return;
        }
        // El comentario no puede estar vacio
        if (comment.isEmpty()) {
            sendJsonResponse(exchange, 400, "{\"error\":\"El comentario no puede estar vacio\"}");
            return;
        }
        // Un mismo usuario no puede reseñar dos veces el mismo producto
        if (dao.userHasReviewed(productId, userId)) {
            sendJsonResponse(exchange, 409, "{\"error\":\"Ya has reseñado este producto\"}");
            return;
        }

        Review review = new Review();
        review.setProductId(productId);
        review.setUserId(userId);
        review.setRating(rating);
        review.setComment(comment);

        boolean success = dao.addReview(review);
        if (success) {
            sendJsonResponse(exchange, 201, "{\"success\":true}");
        } else {
            sendJsonResponse(exchange, 500, "{\"error\":\"No se pudo guardar la reseña\"}");
        }
    }
}