package infrastructure.api.handlers;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import infrastructure.persistence.jdbc.InventoryDAO;
import domain.models.InventoryBatch;
import domain.models.WasteEvent;
import domain.models.RecentActivity;

public class InventoryHandler implements HttpHandler {
    private final InventoryDAO dao = new InventoryDAO();
    private final Gson gson = new Gson();

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        exchange.getResponseHeaders().add("Access-Control-Allow-Origin", "*");
        exchange.getResponseHeaders().add("Access-Control-Allow-Methods", "GET, POST, PUT, OPTIONS");
        exchange.getResponseHeaders().add("Access-Control-Allow-Headers", "Content-Type");

        if ("OPTIONS".equals(exchange.getRequestMethod())) {
            exchange.sendResponseHeaders(204, -1);
            return;
        }

        try {
            String path = exchange.getRequestURI().getPath();
            String method = exchange.getRequestMethod();
            exchange.getResponseHeaders().add("Content-Type", "application/json");

            if ("GET".equals(method)) {
                if (path.equals("/api/inventory/batches")) {
                    sendResponse(exchange, 200, gson.toJson(dao.getAllBatches()));
                } else if (path.equals("/api/inventory/waste")) {
                    sendResponse(exchange, 200, gson.toJson(dao.getAllWasteEvents()));
                } else if (path.equals("/api/inventory/thresholds")) {
                    sendResponse(exchange, 200, gson.toJson(dao.getAllThresholds()));
                } else if (path.equals("/api/metrics/sales")) {
                    sendResponse(exchange, 200, gson.toJson(dao.getDailySales()));
                } else if (path.equals("/api/metrics/regions")) {
                    sendResponse(exchange, 200, gson.toJson(dao.getRegionSales()));
                } else if (path.equals("/api/activity")) {
                    sendResponse(exchange, 200, gson.toJson(dao.getRecentActivity()));
                } else if (path.equals("/api/banner")) {
                    sendResponse(exchange, 200, gson.toJson(dao.getBanner()));
                } else {
                    sendResponse(exchange, 404, "{\"error\":\"Not found\"}");
                }
            } else if ("POST".equals(method)) {
                InputStream is = exchange.getRequestBody();
                String body = new String(is.readAllBytes(), StandardCharsets.UTF_8);

                if (path.equals("/api/inventory/batches")) {
                    InventoryBatch b = gson.fromJson(body, InventoryBatch.class);
                    boolean s = dao.addBatch(b);
                    sendResponse(exchange, s ? 200 : 500, "{\"success\":" + s + "}");
                } else if (path.equals("/api/inventory/waste")) {
                    WasteEvent w = gson.fromJson(body, WasteEvent.class);
                    boolean s = dao.addWasteEvent(w);
                    sendResponse(exchange, s ? 200 : 500, "{\"success\":" + s + "}");
                } else if (path.equals("/api/activity")) {
                    RecentActivity a = gson.fromJson(body, RecentActivity.class);
                    boolean s = dao.addActivity(a);
                    sendResponse(exchange, s ? 200 : 500, "{\"success\":" + s + "}");
                } else {
                    sendResponse(exchange, 404, "{\"error\":\"Not found\"}");
                }
            } else if ("PUT".equals(method)) {
                InputStream is = exchange.getRequestBody();
                String body = new String(is.readAllBytes(), StandardCharsets.UTF_8);
                JsonObject json = JsonParser.parseString(body).getAsJsonObject();

                if (path.startsWith("/api/inventory/batches/")) {
                    String[] parts = path.split("/");
                    String batchId = parts[parts.length - 1];
                    double meters = json.get("currentMeters").getAsDouble();
                    String status = json.get("status").getAsString();
                    boolean s = dao.updateBatch(batchId, meters, status);
                    sendResponse(exchange, s ? 200 : 500, "{\"success\":" + s + "}");
                } else if (path.equals("/api/inventory/thresholds")) {
                    String fabric = json.get("fabricType").getAsString();
                    double min = json.get("minMeters").getAsDouble();
                    boolean s = dao.updateThreshold(fabric, min);
                    sendResponse(exchange, s ? 200 : 500, "{\"success\":" + s + "}");
                } else if (path.equals("/api/banner")) {
                    boolean en = json.get("enabled").getAsBoolean();
                    String msg = json.get("message").getAsString();
                    String type = json.get("bannerType").getAsString();
                    boolean s = dao.updateBanner(en, msg, type);
                    sendResponse(exchange, s ? 200 : 500, "{\"success\":" + s + "}");
                } else {
                    sendResponse(exchange, 404, "{\"error\":\"Not found\"}");
                }
            } else {
                sendResponse(exchange, 405, "{\"error\":\"Method not allowed\"}");
            }
        } catch (Exception e) {
            e.printStackTrace();
            sendResponse(exchange, 500, "{\"error\":\"Error: " + e.getMessage() + "\"}");
        }
    }

    private void sendResponse(HttpExchange exchange, int statusCode, String response) throws IOException {
        byte[] bytes = response.getBytes(StandardCharsets.UTF_8);
        exchange.sendResponseHeaders(statusCode, bytes.length);
        OutputStream os = exchange.getResponseBody();
        os.write(bytes);
        os.close();
    }
}
