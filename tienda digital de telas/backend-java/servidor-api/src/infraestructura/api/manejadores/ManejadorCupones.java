package infraestructura.api.manejadores;

import com.google.gson.Gson;
import com.sun.net.httpserver.HttpExchange;
import dominio.modelos.Cupon;
import infraestructura.persistencia.jdbc.CuponDAO;
import java.nio.charset.StandardCharsets;
import java.util.List;

/**
 * Controlador HTTP para la gestión de cupones promocionales de descuento.
 * Rutas base: `/api/coupons` y `/api/cupones`.
 */
public class ManejadorCupones extends ManejadorBase {
    /** Objeto de acceso a datos para la tabla `cupones` (`CuponDAO`). */
    private final CuponDAO cuponDAO = new CuponDAO();
    /** Serializador JSON (`Gson`). */
    private final Gson gson = new Gson();

    /**
     * Enruta las solicitudes `GET`, `POST`, `PUT` y `DELETE` para listar, crear o desactivar cupones.
     *
     * @param intercambio Contexto de la petición HTTP (`HttpExchange`).
     * @throws Exception Si ocurre un error durante el procesamiento.
     */
    @Override
    protected void procesarPeticion(HttpExchange intercambio) throws Exception {
        String metodo = intercambio.getRequestMethod();

        if ("GET".equalsIgnoreCase(metodo)) {
            List<Cupon> cupones = cuponDAO.obtenerTodosLosCupones();
            enviarRespuestaJson(intercambio, 200, gson.toJson(cupones));

        } else if ("POST".equalsIgnoreCase(metodo)) {
            String cuerpo = new String(leerCuerpoSeguro(intercambio), StandardCharsets.UTF_8);
            Cupon nuevoCupon = gson.fromJson(cuerpo, Cupon.class);
            if (nuevoCupon == null || nuevoCupon.getCodigo() == null || nuevoCupon.getCodigo().isBlank()) {
                enviarRespuestaJson(intercambio, 400, "{\"error\":\"El código del cupón es obligatorio\"}");
                return;
            }
            String tipoDesc = nuevoCupon.getTipoDescuento() != null ? nuevoCupon.getTipoDescuento().trim().toLowerCase() : "percentage";
            boolean esPorcentaje = "percentage".equals(tipoDesc) || "porcentaje".equals(tipoDesc);
            boolean esFijo = "fixed".equals(tipoDesc) || "fijo".equals(tipoDesc);
            if (!esPorcentaje && !esFijo) {
                enviarRespuestaJson(intercambio, 400, "{\"error\":\"Tipo de descuento inválido\"}");
                return;
            }
            if (nuevoCupon.getValorDescuento() <= 0 || (esPorcentaje && nuevoCupon.getValorDescuento() > 100)) {
                enviarRespuestaJson(intercambio, 400, "{\"error\":\"Valor de descuento fuera de rango permitido\"}");
                return;
            }

            if (cuponDAO.agregarCupon(nuevoCupon)) {
                enviarRespuestaJson(intercambio, 201, "{\"success\":true,\"id\":" + nuevoCupon.getId() + "}");
            } else {
                enviarRespuestaJson(intercambio, 500, "{\"error\":\"Error insertando cupón en base de datos\"}");
            }

        } else if ("PUT".equalsIgnoreCase(metodo) || "DELETE".equalsIgnoreCase(metodo)) {
            String ruta = intercambio.getRequestURI().getPath();
            int idCupon = extraerIdRuta(ruta);
            if (idCupon <= 0) {
                enviarRespuestaJson(intercambio, 400, "{\"error\":\"Identificador de cupón inválido\"}");
                return;
            }

            if ("DELETE".equalsIgnoreCase(metodo)
                    || (ruta.startsWith("/api/coupons/") && ruta.endsWith("/deactivate"))
                    || (ruta.startsWith("/api/cupones/") && ruta.endsWith("/desactivar"))) {
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
