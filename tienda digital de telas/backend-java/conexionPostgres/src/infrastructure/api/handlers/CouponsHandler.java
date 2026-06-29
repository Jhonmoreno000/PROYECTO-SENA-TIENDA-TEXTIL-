package infrastructure.api.handlers;

import com.sun.net.httpserver.HttpExchange;
import com.google.gson.Gson;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.List;
import infrastructure.persistence.jdbc.CouponDAO;
import domain.models.Coupon;

/**
 * Controlador para la gestión de cupones de descuento.
 * Ruta base: /api/coupons
 * Soporta:
 * - GET /api/coupons → Lista todos los cupones disponibles.
 * - POST /api/coupons → Crea un nuevo cupón.
 * - PUT /api/coupons/{id}/deactivate → Desactiva un cupón existente.
 */
public class CouponsHandler extends BaseHandler {
    private final CouponDAO dao = new CouponDAO();
    private final Gson gson = new Gson();

    /**
     * Enruta la solicitud según el método HTTP.
     */
    @Override
    protected void processRequest(HttpExchange exchange) throws Exception {
        String method = exchange.getRequestMethod();

        // GET /api/coupons — Devuelve el listado completo de cupones
        if ("GET".equals(method)) {
            List<Coupon> coupons = dao.getAllCoupons();
            sendJsonResponse(exchange, 200, gson.toJson(coupons));

        // POST /api/coupons — Crea un nuevo cupón a partir del cuerpo JSON
        } else if ("POST".equals(method)) {
            InputStream is = exchange.getRequestBody();
            String body = new String(is.readAllBytes(), StandardCharsets.UTF_8);
            Coupon newCoupon = gson.fromJson(body, Coupon.class);

            if (dao.addCoupon(newCoupon)) {
                sendJsonResponse(exchange, 201, "{\"success\":true}");
            } else {
                sendJsonResponse(exchange, 500, "{\"error\":\"Error insertando en base de datos\"}");
            }

        // PUT /api/coupons/{id}/deactivate — Cambia el estado del cupón a inactivo
        } else if ("PUT".equals(method)) {
            String path = exchange.getRequestURI().getPath();
            if (path.startsWith("/api/coupons/") && path.endsWith("/deactivate")) {
                int id = Integer.parseInt(path.split("/")[3]);
                if (dao.deactivateCoupon(id)) {
                    sendJsonResponse(exchange, 200, "{\"success\":true}");
                } else {
                    sendJsonResponse(exchange, 500, "{\"error\":\"Error actualizando\"}");
                }
            } else {
                sendJsonResponse(exchange, 400, "{\"error\":\"Bad request\"}");
            }
        } else {
            sendJsonResponse(exchange, 405, "{\"error\":\"Method not allowed\"}");
        }
    }
}
