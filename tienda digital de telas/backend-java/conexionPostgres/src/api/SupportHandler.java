package api;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;

import dao.SupportDAO;
import models.BugReport;
import models.SupportTicket;

public class SupportHandler implements HttpHandler {
    @Override
    public void handle(HttpExchange exchange) throws IOException {
        exchange.getResponseHeaders().add("Access-Control-Allow-Origin", "http://localhost:3001");
        exchange.getResponseHeaders().add("Access-Control-Allow-Methods", "GET, POST, PUT, OPTIONS");
        exchange.getResponseHeaders().add("Access-Control-Allow-Headers", "Content-Type,Authorization");

        if ("OPTIONS".equals(exchange.getRequestMethod())) {
            exchange.sendResponseHeaders(204, -1);
            return;
        }

        SupportDAO dao = new SupportDAO();
        Gson gson = new Gson();
        String path = exchange.getRequestURI().getPath();

        try {
            if ("GET".equals(exchange.getRequestMethod())) {
                if (path.startsWith("/api/support/tickets")) {
                    sendResponse(exchange, 200, gson.toJson(dao.getAllTickets()));
                } else if (path.startsWith("/api/support/bugs")) {
                    sendResponse(exchange, 200, gson.toJson(dao.getAllBugs()));
                } else {
                    sendResponse(exchange, 404, "{}");
                }
            } else if ("POST".equals(exchange.getRequestMethod())) {
                InputStream is = exchange.getRequestBody();
                String body = new String(is.readAllBytes(), StandardCharsets.UTF_8);
                
                if (path.startsWith("/api/support/tickets")) {
                    SupportTicket ticket = gson.fromJson(body, SupportTicket.class);
                    if (dao.addTicket(ticket)) sendResponse(exchange, 201, "{\"success\":true}");
                    else sendResponse(exchange, 500, "{\"error\":\"Error guardando ticket\"}");
                } else if (path.startsWith("/api/support/bugs")) {
                    BugReport bug = gson.fromJson(body, BugReport.class);
                    if (dao.addBug(bug)) sendResponse(exchange, 201, "{\"success\":true}");
                    else sendResponse(exchange, 500, "{\"error\":\"Error guardando reporte\"}");
                } else {
                    sendResponse(exchange, 404, "{}");
                }
            } else if ("PUT".equals(exchange.getRequestMethod())) {
                // e.g. /api/support/tickets/1/status
                InputStream is = exchange.getRequestBody();
                String body = new String(is.readAllBytes(), StandardCharsets.UTF_8);
                JsonObject jsonObj = JsonParser.parseString(body).getAsJsonObject();
                String status = jsonObj.get("status").getAsString();
                
                String[] parts = path.split("/");
                int id = Integer.parseInt(parts[4]);

                if (path.startsWith("/api/support/tickets")) {
                    if (dao.updateTicketStatus(id, status)) sendResponse(exchange, 200, "{\"success\":true}");
                    else sendResponse(exchange, 500, "{\"error\":\"Error actualizando ticket\"}");
                } else if (path.startsWith("/api/support/bugs")) {
                    if (dao.updateBugStatus(id, status)) sendResponse(exchange, 200, "{\"success\":true}");
                    else sendResponse(exchange, 500, "{\"error\":\"Error actualizando reporte\"}");
                }
            } else {
                sendResponse(exchange, 405, "{\"error\":\"Method not allowed\"}");
            }
        } catch (Exception e) {
            e.printStackTrace();
            sendResponse(exchange, 500, "{\"error\":\"Server error\"}");
        }
    }

    private void sendResponse(HttpExchange exchange, int statusCode, String response) throws IOException {
        byte[] responseBytes = response.getBytes(StandardCharsets.UTF_8);
        exchange.getResponseHeaders().add("Content-Type", "application/json; charset=UTF-8");
        exchange.sendResponseHeaders(statusCode, responseBytes.length);
        OutputStream os = exchange.getResponseBody();
        if (responseBytes.length > 0) os.write(responseBytes);
        os.close();
    }
}
