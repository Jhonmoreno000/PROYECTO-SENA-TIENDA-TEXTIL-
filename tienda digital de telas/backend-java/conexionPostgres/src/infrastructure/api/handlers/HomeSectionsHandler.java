package infrastructure.api.handlers;

import infrastructure.persistence.jdbc.HomeSectionsDAO;
import domain.models.HomeSection;
import com.sun.net.httpserver.HttpExchange;
import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.List;

/**
 * Controlador para la gestión de los apartados del inicio.
 * Opera sobre la ruta base /api/home-sections.
 * Maneja GET (listar) y PUT (actualizar título, subtítulo, visibilidad).
 * Los apartados (Nuevas Colecciones, Telas Exclusivas, Ofertas Especiales)
 * se muestran en el Home y en el Catálogo, y los administra el panel admin.
 */
public class HomeSectionsHandler extends BaseHandler {

    /**
     * Enruta la solicitud según el método HTTP al método privado correspondiente.
     */
    @Override
    protected void processRequest(HttpExchange exchange) throws Exception {
        String method = exchange.getRequestMethod();
        String path = exchange.getRequestURI().getPath();
        HomeSectionsDAO dao = new HomeSectionsDAO();
        Gson gson = new Gson();

        if ("GET".equals(method)) {
            handleGet(exchange, dao, gson);
        } else if ("PUT".equals(method)) {
            handlePut(exchange, path, dao);
        } else {
            sendJsonResponse(exchange, 405, "{\"error\":\"Method not allowed\"}");
        }
    }

    /**
     * GET /api/home-sections — Lista todos los apartados.
     * GET /api/home-sections/active — Lista solo los apartados activos.
     */
    private void handleGet(HttpExchange exchange, HomeSectionsDAO dao, Gson gson) throws Exception {
        List<HomeSection> sections;
        String path = exchange.getRequestURI().getPath();
        if (path.equals("/api/home-sections/active")) {
            sections = dao.getActiveSections();
        } else {
            sections = dao.getAllSections();
        }
        sendJsonResponse(exchange, 200, gson.toJson(sections));
    }

    /**
     * PUT /api/home-sections/{key} — Actualiza un apartado existente.
     * Solo modifica los campos presentes en el cuerpo JSON (los booleanos
     * como "active" solo se aplican si vienen explícitamente).
     */
    private void handlePut(HttpExchange exchange, String path, HomeSectionsDAO dao) throws Exception {
        if (!path.matches("^/api/home-sections/[a-z]+$")) {
            sendJsonResponse(exchange, 404, "{\"error\":\"Not found\"}");
            return;
        }
        String key = path.split("/")[3];
        InputStream is = exchange.getRequestBody();
        String body = new String(is.readAllBytes(), StandardCharsets.UTF_8);

        JsonObject json;
        try {
            json = JsonParser.parseString(body).getAsJsonObject();
        } catch (Exception e) {
            sendJsonResponse(exchange, 400, "{\"error\":\"JSON invalido\"}");
            return;
        }

        HomeSection updates = new Gson().fromJson(json, HomeSection.class);
        // "active" solo se toca si viene explícito (null = no cambiar)
        Boolean active = json.has("active") ? json.get("active").getAsBoolean() : null;
        boolean success = dao.updateSection(key, updates, active);
        sendJsonResponse(exchange, success ? 200 : 500, success ? "{\"success\":true}" : "{\"error\":\"No se pudo actualizar el apartado\"}");
    }
}