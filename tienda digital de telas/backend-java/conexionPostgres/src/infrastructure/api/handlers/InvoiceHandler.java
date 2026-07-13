package infrastructure.api.handlers;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.sun.net.httpserver.HttpExchange;
import infrastructure.persistence.jdbc.OrderDAO;
import application.services.InvoiceService;
import domain.models.Order;

import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import infrastructure.config.Conexion;

public class InvoiceHandler extends BaseHandler {
    private final OrderDAO orderDAO;
    private final InvoiceService invoiceService;
    private final Gson gson;

    public InvoiceHandler() {
        this.orderDAO = new OrderDAO();
        this.invoiceService = new InvoiceService();
        this.gson = new Gson();
    }

    @Override
    protected void processRequest(HttpExchange exchange) throws Exception {
        String method = exchange.getRequestMethod();
        String path = exchange.getRequestURI().getPath();

        if ("GET".equalsIgnoreCase(method)) {
            if (path.equals("/api/invoices")) {
                handleListInvoices(exchange);
            } else {
                String[] parts = path.split("/");
                int orderId = Integer.parseInt(parts[parts.length - 1]);
                handleDownloadInvoice(exchange, orderId);
            }
        } else {
            sendJsonResponse(exchange, 405, "{\"error\":\"Method not allowed\"}");
        }
    }

    private void handleListInvoices(HttpExchange exchange) throws Exception {
        List<Map<String, Object>> invoices = new ArrayList<>();
        String query = "SELECT o.id, o.client_id, o.total, o.status, o.order_date, " +
                "u.name AS client_name, u.email AS client_email " +
                "FROM orders o " +
                "LEFT JOIN users u ON o.client_id = u.id " +
                "ORDER BY o.id DESC";

        try (Connection con = Conexion.getConnection();
             PreparedStatement pst = con.prepareStatement(query);
             ResultSet rs = pst.executeQuery()) {
            while (rs.next()) {
                Map<String, Object> inv = new HashMap<>();
                inv.put("orderId", rs.getInt("id"));
                inv.put("clientId", rs.getInt("client_id"));
                inv.put("clientName", rs.getString("client_name"));
                inv.put("clientEmail", rs.getString("client_email"));
                inv.put("total", rs.getDouble("total"));
                inv.put("status", rs.getString("status"));
                inv.put("date", rs.getString("order_date"));
                invoices.add(inv);
            }
        }

        String json = gson.toJson(invoices);
        sendJsonResponse(exchange, 200, json);
    }

    private void handleDownloadInvoice(HttpExchange exchange, int orderId) throws Exception {
        Order order = orderDAO.getOrderById(orderId);
        if (order == null) {
            sendJsonResponse(exchange, 404, "{\"error\":\"Pedido no encontrado\"}");
            return;
        }

        String clientName = "";
        String clientEmail = "";
        String clientPhone = "";
        String clientAddress = "";
        String clientDoc = "";

        String userQuery = "SELECT name, email FROM users WHERE id = ?";
        try (Connection con = Conexion.getConnection();
             PreparedStatement pst = con.prepareStatement(userQuery)) {
            pst.setInt(1, order.getClientId());
            try (ResultSet rs = pst.executeQuery()) {
                if (rs.next()) {
                    clientName = rs.getString("name") != null ? rs.getString("name") : "";
                    clientEmail = rs.getString("email") != null ? rs.getString("email") : "";
                }
            }
        }

        List<Map<String, Object>> items = new ArrayList<>();
        String itemQuery = "SELECT oi.product_id, oi.quantity, oi.unit_price, p.name " +
                "FROM order_items oi " +
                "LEFT JOIN products p ON oi.product_id = p.id " +
                "WHERE oi.order_id = ?";
        try (Connection con = Conexion.getConnection();
             PreparedStatement pst = con.prepareStatement(itemQuery)) {
            pst.setInt(1, orderId);
            try (ResultSet rs = pst.executeQuery()) {
                while (rs.next()) {
                    Map<String, Object> item = new HashMap<>();
                    item.put("productId", rs.getInt("product_id"));
                    item.put("quantity", rs.getInt("quantity"));
                    item.put("unitPrice", rs.getDouble("unit_price"));
                    item.put("name", rs.getString("name") != null ? rs.getString("name") : "Producto");
                    items.add(item);
                }
            }
        }

        double subtotal = 0;
        for (Map<String, Object> item : items) {
            int qty = ((Number) item.get("quantity")).intValue();
            double price = ((Number) item.get("unitPrice")).doubleValue();
            subtotal += qty * price;
        }
        double tax = subtotal * 0.19;
        double total = order.getTotal();

        byte[] pdfBytes = invoiceService.generateInvoice(
                orderId, clientName, clientEmail, clientPhone,
                clientAddress, clientDoc, items,
                subtotal, 0, 0, tax, total, "N/A"
        );

        exchange.getResponseHeaders().add("Content-Type", "application/pdf");
        exchange.getResponseHeaders().add("Content-Disposition",
                "attachment; filename=\"FAC-" + String.format("%06d", orderId) + ".pdf\"");
        exchange.sendResponseHeaders(200, pdfBytes.length);
        OutputStream os = exchange.getResponseBody();
        os.write(pdfBytes);
        os.close();
    }
}
