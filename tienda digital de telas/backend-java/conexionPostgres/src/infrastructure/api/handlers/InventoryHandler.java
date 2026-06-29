package infrastructure.api.handlers;

import com.sun.net.httpserver.HttpExchange;
import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import infrastructure.persistence.jdbc.InventoryDAO;
import domain.models.InventoryBatch;
import domain.models.WasteEvent;
import domain.models.RecentActivity;

/**
 * Controlador multi-funcional que gestiona inventario, métricas, actividad
 * reciente y banners promocionales. Opera sobre varias rutas base:
 * /api/inventory, /api/metrics, /api/activity y /api/banner.
 *
 * Soporta GET (consulta), POST (creación) y PUT (actualización) según la ruta.
 */
public class InventoryHandler extends BaseHandler {
    private final InventoryDAO dao = new InventoryDAO();
    private final Gson gson = new Gson();

    /**
     * Enruta la solicitud según el método HTTP a los métodos privados
     * handleGet, handlePost o handlePut.
     */
    @Override
    protected void processRequest(HttpExchange exchange) throws Exception {
        String path = exchange.getRequestURI().getPath();
        String method = exchange.getRequestMethod();

        if ("GET".equals(method)) {
            handleGet(path, exchange);
        } else if ("POST".equals(method)) {
            handlePost(path, exchange);
        } else if ("PUT".equals(method)) {
            handlePut(path, exchange);
        } else {
            sendJsonResponse(exchange, 405, "{\"error\":\"Method not allowed\"}");
        }
    }

    /**
     * GET — Consultas de solo lectura para inventario, métricas, actividad y banner.
     * Rutas manejadas:
     * /api/inventory/batches       → Lotes de inventario
     * /api/inventory/waste         → Eventos de merma
     * /api/inventory/thresholds    → Umbrales mínimos por tipo de tela
     * /api/metrics/sales           → Ventas diarias
     * /api/metrics/regions         → Ventas por región
     * /api/metrics/erp-sales       → Métricas de ventas desde ERP
     * /api/metrics/notifications   → Notificaciones desde ERP
     * /api/metrics/fabric-inventory → Inventario de telas desde ERP
     * /api/activity                → Actividad reciente del sistema
     * /api/banner                  → Banner promocional activo
     */
    private void handleGet(String path, HttpExchange exchange) throws Exception {
        if (path.equals("/api/inventory/batches")) {
            sendJsonResponse(exchange, 200, gson.toJson(dao.getAllBatches()));
        } else if (path.equals("/api/inventory/waste")) {
            sendJsonResponse(exchange, 200, gson.toJson(dao.getAllWasteEvents()));
        } else if (path.equals("/api/inventory/thresholds")) {
            sendJsonResponse(exchange, 200, gson.toJson(dao.getAllThresholds()));
        } else if (path.equals("/api/metrics/sales")) {
            sendJsonResponse(exchange, 200, gson.toJson(dao.getDailySales()));
        } else if (path.equals("/api/metrics/regions")) {
            sendJsonResponse(exchange, 200, gson.toJson(dao.getRegionSales()));
        } else if (path.equals("/api/metrics/erp-sales")) {
            sendJsonResponse(exchange, 200, gson.toJson(dao.getErpSalesMetrics()));
        } else if (path.equals("/api/metrics/notifications")) {
            sendJsonResponse(exchange, 200, gson.toJson(dao.getErpNotifications()));
        } else if (path.equals("/api/metrics/fabric-inventory")) {
            sendJsonResponse(exchange, 200, gson.toJson(dao.getErpFabricInventory()));
        } else if (path.equals("/api/activity")) {
            sendJsonResponse(exchange, 200, gson.toJson(dao.getRecentActivity()));
        } else if (path.equals("/api/banner")) {
            sendJsonResponse(exchange, 200, gson.toJson(dao.getBanner()));
        } else {
            sendJsonResponse(exchange, 404, "{\"error\":\"Not found\"}");
        }
    }

    /**
     * POST — Creación de nuevos registros.
     * /api/inventory/batches → Agrega un lote de inventario.
     * /api/inventory/waste   → Registra un evento de merma.
     * /api/activity          → Agrega un evento de actividad reciente.
     */
    private void handlePost(String path, HttpExchange exchange) throws Exception {
        InputStream is = exchange.getRequestBody();
        String body = new String(is.readAllBytes(), StandardCharsets.UTF_8);

        if (path.equals("/api/inventory/batches")) {
            InventoryBatch batch = gson.fromJson(body, InventoryBatch.class);
            sendJsonResponse(exchange, 200, "{\"success\":" + dao.addBatch(batch) + "}");
        } else if (path.equals("/api/inventory/waste")) {
            WasteEvent waste = gson.fromJson(body, WasteEvent.class);
            sendJsonResponse(exchange, 200, "{\"success\":" + dao.addWasteEvent(waste) + "}");
        } else if (path.equals("/api/activity")) {
            RecentActivity activity = gson.fromJson(body, RecentActivity.class);
            sendJsonResponse(exchange, 200, "{\"success\":" + dao.addActivity(activity) + "}");
        } else {
            sendJsonResponse(exchange, 404, "{\"error\":\"Not found\"}");
        }
    }

    /**
     * PUT — Actualización de registros existentes.
     * /api/inventory/batches/{id} → Actualiza metros y estado de un lote.
     * /api/inventory/thresholds   → Actualiza el umbral mínimo de una tela.
     * /api/banner                 → Actualiza el banner promocional.
     */
    private void handlePut(String path, HttpExchange exchange) throws Exception {
        InputStream is = exchange.getRequestBody();
        String body = new String(is.readAllBytes(), StandardCharsets.UTF_8);
        JsonObject json = JsonParser.parseString(body).getAsJsonObject();

        if (path.startsWith("/api/inventory/batches/")) {
            String batchId = path.split("/")[path.split("/").length - 1];
            double meters = json.get("currentMeters").getAsDouble();
            String status = json.get("status").getAsString();
            sendJsonResponse(exchange, 200, "{\"success\":" + dao.updateBatch(batchId, meters, status) + "}");
        } else if (path.equals("/api/inventory/thresholds")) {
            String fabric = json.get("fabricType").getAsString();
            double minMeters = json.get("minMeters").getAsDouble();
            sendJsonResponse(exchange, 200, "{\"success\":" + dao.updateThreshold(fabric, minMeters) + "}");
        } else if (path.equals("/api/banner")) {
            boolean enabled = json.get("enabled").getAsBoolean();
            String msg = json.get("message").getAsString();
            String type = json.get("bannerType").getAsString();
            sendJsonResponse(exchange, 200, "{\"success\":" + dao.updateBanner(enabled, msg, type) + "}");
        } else {
            sendJsonResponse(exchange, 404, "{\"error\":\"Not found\"}");
        }
    }
}
