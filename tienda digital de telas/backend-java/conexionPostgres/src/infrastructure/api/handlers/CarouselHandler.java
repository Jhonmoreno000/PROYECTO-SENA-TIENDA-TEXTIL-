package infrastructure.api.handlers;

import infrastructure.persistence.jdbc.CarouselDAO;
import domain.models.CarouselSlide;
import com.sun.net.httpserver.HttpExchange;
import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.List;

/**
 * Controlador para la gestión de los slides del carrusel del Home.
 * Opera sobre la ruta base /api/carousel.
 * Maneja GET (listar), POST (crear), PUT (actualizar) y DELETE (eliminar).
 * Los slides representan los apartados de la tienda (Nuevas Colecciones,
 * Telas Exclusivas, Ofertas Especiales) y los administra el panel de admin.
 */
public class CarouselHandler extends BaseHandler {

    /**
     * Enruta la solicitud según el método HTTP al método privado correspondiente.
     */
    @Override
    protected void processRequest(HttpExchange exchange) throws Exception {
        String method = exchange.getRequestMethod();
        String path = exchange.getRequestURI().getPath();
        CarouselDAO dao = new CarouselDAO();
        Gson gson = new Gson();

        if ("GET".equals(method)) {
            handleGet(exchange, dao, gson);
        } else if ("POST".equals(method)) {
            handlePost(exchange, dao);
        } else if ("PUT".equals(method)) {
            handlePut(exchange, path, dao);
        } else if ("DELETE".equals(method)) {
            handleDelete(exchange, path, dao);
        } else {
            sendJsonResponse(exchange, 405, "{\"error\":\"Method not allowed\"}");
        }
    }

    /**
     * GET /api/carousel — Lista los slides activos del carrusel.
     * GET /api/carousel/all — Lista todos los slides (para la administración).
     */
    private void handleGet(HttpExchange exchange, CarouselDAO dao, Gson gson) throws Exception {
        List<CarouselSlide> slides;
        String path = exchange.getRequestURI().getPath();
        if (path.equals("/api/carousel/all")) {
            slides = dao.getAllSlides();
        } else {
            slides = dao.getActiveSlides();
        }
        sendJsonResponse(exchange, 200, gson.toJson(slides));
    }

    /**
     * POST /api/carousel — Crea un nuevo slide.
     * Cuerpo esperado: { "title", "subtitle", "image", "cta", "sectionKey", "active", "sortOrder" }
     */
    private void handlePost(HttpExchange exchange, CarouselDAO dao) throws Exception {
        InputStream is = exchange.getRequestBody();
        String body = new String(is.readAllBytes(), StandardCharsets.UTF_8);

        JsonObject json;
        try {
            json = JsonParser.parseString(body).getAsJsonObject();
        } catch (Exception e) {
            sendJsonResponse(exchange, 400, "{\"error\":\"JSON invalido\"}");
            return;
        }

        if (!json.has("title")) {
            sendJsonResponse(exchange, 400, "{\"error\":\"Falta el campo title\"}");
            return;
        }

        CarouselSlide slide = new CarouselSlide();
        slide.setTitle(json.get("title").getAsString());
        slide.setSubtitle(json.has("subtitle") ? json.get("subtitle").getAsString() : null);
        slide.setImage(json.has("image") ? json.get("image").getAsString() : null);
        slide.setCta(json.has("cta") ? json.get("cta").getAsString() : null);
        slide.setSectionKey(json.has("sectionKey") ? json.get("sectionKey").getAsString() : null);
        slide.setActive(!json.has("active") || json.get("active").getAsBoolean());
        slide.setSortOrder(json.has("sortOrder") ? json.get("sortOrder").getAsInt() : 0);

        boolean success = dao.addSlide(slide);
        sendJsonResponse(exchange, success ? 201 : 500, success ? "{\"success\":true}" : "{\"error\":\"No se pudo guardar el slide\"}");
    }

    /**
     * PUT /api/carousel/{id} — Actualiza un slide existente.
     * Solo modifica los campos presentes en el cuerpo JSON (los booleanos
     * como "active" solo se aplican si vienen explícitamente).
     */
    private void handlePut(HttpExchange exchange, String path, CarouselDAO dao) throws Exception {
        if (!path.matches("^/api/carousel/\\d+$")) {
            sendJsonResponse(exchange, 404, "{\"error\":\"Not found\"}");
            return;
        }
        int slideId = Integer.parseInt(path.split("/")[3]);
        InputStream is = exchange.getRequestBody();
        String body = new String(is.readAllBytes(), StandardCharsets.UTF_8);

        JsonObject json;
        try {
            json = JsonParser.parseString(body).getAsJsonObject();
        } catch (Exception e) {
            sendJsonResponse(exchange, 400, "{\"error\":\"JSON invalido\"}");
            return;
        }

        CarouselSlide updates = new Gson().fromJson(json, CarouselSlide.class);
        // "active" solo se toca si viene explícito (null = no cambiar)
        Boolean active = json.has("active") ? json.get("active").getAsBoolean() : null;
        boolean success = dao.updateSlide(slideId, updates, active);
        sendJsonResponse(exchange, success ? 200 : 500, success ? "{\"success\":true}" : "{\"error\":\"No se pudo actualizar el slide\"}");
    }

    /**
     * DELETE /api/carousel/{id} — Elimina un slide del carrusel.
     */
    private void handleDelete(HttpExchange exchange, String path, CarouselDAO dao) throws Exception {
        if (!path.matches("^/api/carousel/\\d+$")) {
            sendJsonResponse(exchange, 404, "{\"error\":\"Not found\"}");
            return;
        }
        int slideId = Integer.parseInt(path.split("/")[3]);
        boolean success = dao.deleteSlide(slideId);
        sendJsonResponse(exchange, success ? 200 : 500, success ? "{\"success\":true}" : "{\"error\":\"No se pudo eliminar el slide\"}");
    }
}