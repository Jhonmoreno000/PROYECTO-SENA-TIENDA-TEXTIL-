package infrastructure.api.handlers;

import com.sun.net.httpserver.HttpExchange;
import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import infrastructure.persistence.jdbc.SupportDAO;
import domain.models.BugReport;
import domain.models.SupportTicket;

/**
 * Controlador para el módulo de soporte al cliente.
 * Ruta base: /api/support
 * Gestiona tickets de soporte y reportes de errores (bugs).
 * Soporta GET (listar), POST (crear) y PUT (actualizar estado).
 */
public class SupportHandler extends BaseHandler {
    private final SupportDAO dao = new SupportDAO();
    private final Gson gson = new Gson();

    /**
     * Enruta la solicitud según el método HTTP.
     */
    @Override
    protected void processRequest(HttpExchange exchange) throws Exception {
        String method = exchange.getRequestMethod();
        String path = exchange.getRequestURI().getPath();

        // GET — Consulta de tickets y reportes de errores
        if ("GET".equals(method)) {
            if (path.startsWith("/api/support/tickets")) {
                // GET /api/support/tickets — Lista todos los tickets de soporte
                sendJsonResponse(exchange, 200, gson.toJson(dao.getAllTickets()));
            } else if (path.startsWith("/api/support/bugs")) {
                // GET /api/support/bugs — Lista todos los reportes de errores
                sendJsonResponse(exchange, 200, gson.toJson(dao.getAllBugs()));
            } else {
                sendJsonResponse(exchange, 404, "{}");
            }

        // POST — Creación de nuevos tickets o reportes
        } else if ("POST".equals(method)) {
            InputStream is = exchange.getRequestBody();
            String body = new String(is.readAllBytes(), StandardCharsets.UTF_8);

            if (path.startsWith("/api/support/tickets")) {
                // POST /api/support/tickets — Crea un nuevo ticket de soporte
                SupportTicket ticket = gson.fromJson(body, SupportTicket.class);
                boolean success = dao.addTicket(ticket);
                sendJsonResponse(exchange, success ? 201 : 500, success ? "{\"success\":true}" : "{\"error\":\"Error guardando ticket\"}");
            } else if (path.startsWith("/api/support/bugs")) {
                // POST /api/support/bugs — Reporta un nuevo error
                BugReport bug = gson.fromJson(body, BugReport.class);
                boolean success = dao.addBug(bug);
                sendJsonResponse(exchange, success ? 201 : 500, success ? "{\"success\":true}" : "{\"error\":\"Error guardando reporte\"}");
            } else {
                sendJsonResponse(exchange, 404, "{}");
            }

        // PUT — Actualización del estado de tickets o reportes
        } else if ("PUT".equals(method)) {
            InputStream is = exchange.getRequestBody();
            String body = new String(is.readAllBytes(), StandardCharsets.UTF_8);
            JsonObject jsonObj = JsonParser.parseString(body).getAsJsonObject();
            String status = jsonObj.get("status").getAsString();
            int id = Integer.parseInt(path.split("/")[4]);

            if (path.startsWith("/api/support/tickets")) {
                // PUT /api/support/tickets/{id} — Actualiza el estado de un ticket
                boolean success = dao.updateTicketStatus(id, status);
                sendJsonResponse(exchange, success ? 200 : 500, success ? "{\"success\":true}" : "{\"error\":\"Error actualizando ticket\"}");
            } else if (path.startsWith("/api/support/bugs")) {
                // PUT /api/support/bugs/{id} — Actualiza el estado de un reporte de error
                boolean success = dao.updateBugStatus(id, status);
                sendJsonResponse(exchange, success ? 200 : 500, success ? "{\"success\":true}" : "{\"error\":\"Error actualizando reporte\"}");
            }
        } else {
            sendJsonResponse(exchange, 405, "{\"error\":\"Method not allowed\"}");
        }
    }
}
