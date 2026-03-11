package api;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.google.gson.Gson;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.util.List;

import dao.CouponDAO;
import models.Coupon;

public class CouponsHandler implements HttpHandler {
    @Override
    public void handle(HttpExchange exchange) throws IOException {
        exchange.getResponseHeaders().add("Access-Control-Allow-Origin", "http://localhost:3001");
        exchange.getResponseHeaders().add("Access-Control-Allow-Methods", "GET, POST, PUT, OPTIONS");
        exchange.getResponseHeaders().add("Access-Control-Allow-Headers", "Content-Type,Authorization");

        if ("OPTIONS".equals(exchange.getRequestMethod())) {
            exchange.sendResponseHeaders(204, -1);
            return;
        }

        CouponDAO dao = new CouponDAO();
        Gson gson = new Gson();

        try {
            if ("GET".equals(exchange.getRequestMethod())) {
                List<Coupon> coupons = dao.getAllCoupons();
                sendResponse(exchange, 200, gson.toJson(coupons));
                
            } else if ("POST".equals(exchange.getRequestMethod())) {
                InputStream is = exchange.getRequestBody();
                String body = new String(is.readAllBytes(), StandardCharsets.UTF_8);
                Coupon newCoupon = gson.fromJson(body, Coupon.class);
                
                if (dao.addCoupon(newCoupon)) {
                    sendResponse(exchange, 201, "{\"success\":true}");
                } else {
                    sendResponse(exchange, 500, "{\"error\":\"Error insertando en base de datos\"}");
                }
            } else if ("PUT".equals(exchange.getRequestMethod())) {
                // Determine if it's deactivated based on URL
                String path = exchange.getRequestURI().getPath();
                if (path.startsWith("/api/coupons/") && path.endsWith("/deactivate")) {
                    String[] parts = path.split("/");
                    int id = Integer.parseInt(parts[3]);
                    if (dao.deactivateCoupon(id)) {
                        sendResponse(exchange, 200, "{\"success\":true}");
                    } else {
                        sendResponse(exchange, 500, "{\"error\":\"Error actualizando\"}");
                    }
                } else {
                    sendResponse(exchange, 400, "{\"error\":\"Bad request\"}");
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
        os.write(responseBytes);
        os.close();
    }
}
