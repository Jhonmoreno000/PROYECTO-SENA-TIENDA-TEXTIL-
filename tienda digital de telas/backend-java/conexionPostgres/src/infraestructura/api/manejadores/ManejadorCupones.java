package infraestructura.api.manejadores;

import com.sun.net.httpserver.HttpExchange;
import com.google.gson.Gson;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.List;
import infraestructura.persistencia.jdbc.CuponDAO;
import dominio.modelos.Cupon;

/**
 * Manejador para la gestión de cupones de descuento.
 * Rutas base: /api/coupons y /api/cupones
 * Soporta:
 * - GET /api/coupons → Lista todos los cupones disponibles.
 * - POST /api/coupons → Crea un nuevo cupón.
 * - PUT /api/coupons/{id}/deactivate → Desactiva un cupón existente.
 */
public class ManejadorCupones extends ManejadorBase {
    private final CuponDAO cuponDAO = new CuponDAO();
    private final Gson gson = new Gson();

    /**
     * Enruta la solicitud según el método HTTP.
     */
    @Override
    protected void procesarPeticion(HttpExchange intercambio) throws Exception {
        String metodo = intercambio.getRequestMethod();

        // GET — Devuelve el listado completo de cupones
        if ("GET".equalsIgnoreCase(metodo)) {
            List<Cupon> cupones = cuponDAO.obtenerTodosLosCupones();
            enviarRespuestaJson(intercambio, 200, gson.toJson(cupones));

        // POST — Crea un nuevo cupón a partir del cuerpo JSON
        } else if ("POST".equalsIgnoreCase(metodo)) {
            InputStream flujoEntrada = intercambio.getRequestBody();
            String cuerpo = new String(flujoEntrada.readAllBytes(), StandardCharsets.UTF_8);
            Cupon nuevoCupon = gson.fromJson(cuerpo, Cupon.class);

            if (cuponDAO.agregarCupon(nuevoCupon)) {
                enviarRespuestaJson(intercambio, 201, "{\"success\":true}");
            } else {
                enviarRespuestaJson(intercambio, 500, "{\"error\":\"Error insertando cupón en base de datos\"}");
            }

        // PUT — Desactiva un cupón
        } else if ("PUT".equalsIgnoreCase(metodo)) {
            String ruta = intercambio.getRequestURI().getPath();
            if ((ruta.startsWith("/api/coupons/") && ruta.endsWith("/deactivate")) ||
                (ruta.startsWith("/api/cupones/") && ruta.endsWith("/desactivar"))) {
                String[] segmentos = ruta.split("/");
                int idCupon = -1;
                for (String segmento : segmentos) {
                    if (segmento.matches("\\d+")) {
                        idCupon = Integer.parseInt(segmento);
                        break;
                    }
                }

                if (idCupon <= 0) {
                    enviarRespuestaJson(intercambio, 400, "{\"error\":\"Identificador de cupón inválido\"}");
                    return;
                }

                if (cuponDAO.desactivarCupon(idCupon)) {
                    enviarRespuestaJson(intercambio, 200, "{\"success\":true}");
                } else {
                    enviarRespuestaJson(intercambio, 500, "{\"error\":\"Error actualizando estado del cupón\"}");
                }
            } else {
                enviarRespuestaJson(intercambio, 400, "{\"error\":\"Petición inválida\"}");
            }
        } else {
            enviarRespuestaJson(intercambio, 405, "{\"error\":\"Método no permitido\"}");
        }
    }
}
