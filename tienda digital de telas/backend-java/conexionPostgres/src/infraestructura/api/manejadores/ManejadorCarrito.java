package infraestructura.api.manejadores;

import com.sun.net.httpserver.HttpExchange;
import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.List;
import infraestructura.persistencia.jdbc.CarritoDAO;
import dominio.modelos.ItemCarrito;

/**
 * Controlador para la gestión del carrito de compras.
 * Soporta operaciones sobre los ítems del carrito.
 */
public class ManejadorCarrito extends ManejadorBase {
    private final CarritoDAO carritoDAO = new CarritoDAO();
    private final Gson gson = new Gson();

    @Override
    protected void procesarPeticion(HttpExchange intercambio) throws Exception {
        String ruta = intercambio.getRequestURI().getPath();
        String metodo = intercambio.getRequestMethod();

        // GET /api/cart?userId=N o ?idUsuario=N
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

        // POST /api/cart o /api/carrito
        } else if ("POST".equals(metodo)) {
            InputStream flujoEntrada = intercambio.getRequestBody();
            String cuerpo = new String(flujoEntrada.readAllBytes(), StandardCharsets.UTF_8);
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
            int cantidad = objetoJson.has("quantity") ? objetoJson.get("quantity").getAsInt() 
                         : (objetoJson.has("cantidad") ? objetoJson.get("cantidad").getAsInt() : 1);

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

        // PUT /api/cart/{id} o /api/carrito/{id}
        } else if ("PUT".equals(metodo)) {
            String[] segmentos = ruta.split("/");
            int idItem = -1;
            for (String segmento : segmentos) {
                if (segmento.matches("\\d+")) {
                    idItem = Integer.parseInt(segmento);
                    break;
                }
            }

            if (idItem <= 0) {
                enviarRespuestaJson(intercambio, 400, "{\"error\":\"Identificador de ítem inválido\"}");
                return;
            }

            InputStream flujoEntrada = intercambio.getRequestBody();
            String cuerpo = new String(flujoEntrada.readAllBytes(), StandardCharsets.UTF_8);
            JsonObject objetoJson;
            try {
                objetoJson = JsonParser.parseString(cuerpo).getAsJsonObject();
            } catch (Exception e) {
                enviarRespuestaJson(intercambio, 400, "{\"error\":\"Cuerpo JSON inválido\"}");
                return;
            }

            int cantidad = objetoJson.has("quantity") ? objetoJson.get("quantity").getAsInt() 
                         : (objetoJson.has("cantidad") ? objetoJson.get("cantidad").getAsInt() : 1);

            // Si la cantidad es menor o igual a cero, se elimina el producto del carrito
            if (cantidad <= 0) {
                boolean exitoEliminar = carritoDAO.eliminarDelCarrito(idItem);
                enviarRespuestaJson(intercambio, exitoEliminar ? 200 : 500, "{\"success\":" + exitoEliminar + "}");
                return;
            }

            boolean exito = carritoDAO.actualizarCantidad(idItem, cantidad);
            enviarRespuestaJson(intercambio, exito ? 200 : 500, "{\"success\":" + exito + "}");

        // DELETE /api/cart/{id} o /api/carrito/vaciar/{idUsuario}
        } else if ("DELETE".equals(metodo)) {
            String[] segmentos = ruta.split("/");
            int identificador = -1;
            for (String segmento : segmentos) {
                if (segmento.matches("\\d+")) {
                    identificador = Integer.parseInt(segmento);
                    break;
                }
            }

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
