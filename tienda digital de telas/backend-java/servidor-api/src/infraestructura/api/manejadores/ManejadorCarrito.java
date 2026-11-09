package infraestructura.api.manejadores;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.sun.net.httpserver.HttpExchange;
import dominio.modelos.ItemCarrito;
import infraestructura.persistencia.jdbc.CarritoDAO;
import java.nio.charset.StandardCharsets;
import java.util.List;

/**
 * Controlador HTTP para la gestión del carrito de compras persistente en PostgreSQL.
 * Soporta metrajes decimales fraccionados y operaciones de consulta, adición, edición y vaciado.
 */
public class ManejadorCarrito extends ManejadorBase {
    /** Objeto de acceso a datos del carrito (`CarritoDAO`). */
    private final CarritoDAO carritoDAO = new CarritoDAO();
    /** Serializador JSON (`Gson`). */
    private final Gson gson = new Gson();

    /**
     * Enruta y procesa las peticiones `GET`, `POST`, `PUT` y `DELETE` sobre `/api/carrito` y `/api/cart`.
     *
     * @param intercambio Contexto de la petición HTTP (`HttpExchange`).
     * @throws Exception Si ocurre un error procesando la petición.
     */
    @Override
    protected void procesarPeticion(HttpExchange intercambio) throws Exception {
        String ruta = intercambio.getRequestURI().getPath();
        String metodo = intercambio.getRequestMethod();

        if ("GET".equals(metodo)) {
            int idUsuario = obtenerParametroConsultaEntero(intercambio, "userId", -1);
            if (idUsuario <= 0) {
                idUsuario = obtenerParametroConsultaEntero(intercambio, "idUsuario", -1);
            }

            if (idUsuario > 0) {
                List<ItemCarrito> items = carritoDAO.obtenerCarritoPorUsuario(idUsuario);
                enviarRespuestaJson(intercambio, 200, gson.toJson(items));
            } else {
                enviarRespuestaJson(intercambio, 400, "{\"error\":\"Falta el parámetro userId / idUsuario válido\"}");
            }

        } else if ("POST".equals(metodo)) {
            String cuerpo = new String(leerCuerpoSeguro(intercambio), StandardCharsets.UTF_8);
            JsonObject objetoJson;
            try {
                objetoJson = JsonParser.parseString(cuerpo).getAsJsonObject();
            } catch (Exception e) {
                enviarRespuestaJson(intercambio, 400, "{\"error\":\"Cuerpo JSON inválido\"}");
                return;
            }

            int idUsuario = objetoJson.has("userId") ? objetoJson.get("userId").getAsInt()
                          : (objetoJson.has("idUsuario") ? objetoJson.get("idUsuario").getAsInt() : 0);
            int idProducto = objetoJson.has("productId") ? objetoJson.get("productId").getAsInt()
                           : (objetoJson.has("idProducto") ? objetoJson.get("idProducto").getAsInt() : 0);
            double cantidad = objetoJson.has("quantity") ? objetoJson.get("quantity").getAsDouble()
                            : (objetoJson.has("cantidad") ? objetoJson.get("cantidad").getAsDouble() : 1.0);

            if (idUsuario <= 0 || idProducto <= 0) {
                enviarRespuestaJson(intercambio, 400, "{\"error\":\"Usuario y producto son obligatorios\"}");
                return;
            }

            if (cantidad <= 0) {
                enviarRespuestaJson(intercambio, 400, "{\"error\":\"La cantidad debe ser mayor a 0\"}");
                return;
            }

            boolean exito = carritoDAO.agregarAlCarrito(idUsuario, idProducto, cantidad);
            enviarRespuestaJson(intercambio, exito ? 200 : 500, "{\"success\":" + exito + "}");

        } else if ("PUT".equals(metodo)) {
            int idItem = extraerIdRuta(ruta);

            if (idItem <= 0) {
                enviarRespuestaJson(intercambio, 400, "{\"error\":\"Identificador de ítem inválido\"}");
                return;
            }

            String cuerpo = new String(leerCuerpoSeguro(intercambio), StandardCharsets.UTF_8);
            JsonObject objetoJson;
            try {
                objetoJson = JsonParser.parseString(cuerpo).getAsJsonObject();
            } catch (Exception e) {
                enviarRespuestaJson(intercambio, 400, "{\"error\":\"Cuerpo JSON inválido\"}");
                return;
            }

            double cantidad = objetoJson.has("quantity") ? objetoJson.get("quantity").getAsDouble()
                            : (objetoJson.has("cantidad") ? objetoJson.get("cantidad").getAsDouble() : 1.0);

            if (cantidad <= 0) {
                boolean exitoEliminar = carritoDAO.eliminarDelCarrito(idItem);
                enviarRespuestaJson(intercambio, exitoEliminar ? 200 : 500, "{\"success\":" + exitoEliminar + "}");
                return;
            }

            boolean exito = carritoDAO.actualizarCantidad(idItem, cantidad);
            enviarRespuestaJson(intercambio, exito ? 200 : 500, "{\"success\":" + exito + "}");

        } else if ("DELETE".equals(metodo)) {
            int identificador = extraerIdRuta(ruta);

            if (identificador <= 0) {
                enviarRespuestaJson(intercambio, 400, "{\"error\":\"Identificador inválido en la ruta\"}");
                return;
            }

            if (ruta.contains("/clear/") || ruta.contains("/vaciar/")) {
                boolean exito = carritoDAO.vaciarCarrito(identificador);
                enviarRespuestaJson(intercambio, exito ? 200 : 500, "{\"success\":" + exito + "}");
            } else {
                boolean exito = carritoDAO.eliminarDelCarrito(identificador);
                enviarRespuestaJson(intercambio, exito ? 200 : 500, "{\"success\":" + exito + "}");
            }
        } else {
            enviarRespuestaJson(intercambio, 405, "{\"error\":\"Método no permitido\"}");
        }
    }
}
