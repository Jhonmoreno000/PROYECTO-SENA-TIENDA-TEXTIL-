package infrastructure.api.handlers;

import com.sun.net.httpserver.HttpExchange;
import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import infrastructure.persistence.jdbc.ConfigDAO;

/**
 * Controlador para la configuración global del sistema (pares clave-valor).
 * Ruta base: /api/config
 * Permite leer y escribir valores de configuración persistidos en la base de datos.
 * Soporta:
 * - GET /api/config → Obtiene todas las configuraciones.
 * - GET /api/config/{key} → Obtiene el valor de una clave específica.
 * - POST /api/config → Crea o actualiza un par clave-valor.
 */
public class ConfigHandler extends BaseHandler {
    private final ConfigDAO dao = new ConfigDAO();
    private final Gson gson = new Gson();

    /**
     * Enruta la solicitud según el método HTTP.
     */
    @Override
    protected void processRequest(HttpExchange exchange) throws Exception {
        String method = exchange.getRequestMethod();

        // GET — Recupera configuraciones
        if ("GET".equals(method)) {
            String path = exchange.getRequestURI().getPath();
            if (path.equals("/api/config")) {
                // GET /api/config — Devuelve todas las configuraciones como mapa clave-valor
                Map<String, String> configs = dao.getAllConfig();
                sendJsonResponse(exchange, 200, gson.toJson(configs));
            } else {
                // GET /api/config/{key} — Devuelve el valor de una clave específica
                String key = path.substring(path.lastIndexOf("/") + 1);
                String value = dao.getConfig(key);
                if (value != null) {
                    sendJsonResponse(exchange, 200, value);
                } else {
                    sendJsonResponse(exchange, 404, "{}");
                }
            }

        // POST /api/config — Crea o actualiza una configuración (key + value en el cuerpo)
        } else if ("POST".equals(method)) {
            InputStream is = exchange.getRequestBody();
            String body = new String(is.readAllBytes(), StandardCharsets.UTF_8);
            JsonObject jsonObj = JsonParser.parseString(body).getAsJsonObject();
            String key = jsonObj.get("key").getAsString();
            String value = jsonObj.get("value").getAsString();

            if (dao.setConfig(key, value)) {
                sendJsonResponse(exchange, 200, "{\"success\":true}");
            } else {
                sendJsonResponse(exchange, 500, "{\"error\":\"Error guardando config\"}");
            }
        } else {
            sendJsonResponse(exchange, 405, "{\"error\":\"Method not allowed\"}");
        }
    }
}
