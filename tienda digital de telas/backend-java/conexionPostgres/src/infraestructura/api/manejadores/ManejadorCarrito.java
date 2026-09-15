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
            InputStream entrada = intercambio.getRequestBody();
            String cuerpo = new String(entrada.readAllBytes(), StandardCharsets.UTF_8);
            JsonObject json = JsonParser.parseString(cuerpo).getAsJsonObject();

            int idUsuario = json.has("userId") ? json.get("userId").getAsInt() : json.get("idUsuario").getAsInt();
            int idProducto = json.has("productId") ? json.get("productId").getAsInt() : json.get("idProducto").getAsInt();
            int cantidad = json.has("quantity") ? json.get("quantity").getAsInt() : json.get("cantidad").getAsInt();

            boolean exito = carritoDAO.agregarAlCarrito(idUsuario, idProducto, cantidad);
            enviarRespuestaJson(intercambio, exito ? 200 : 500, "{\"success\":" + exito + "}");

        // PUT /api/cart/{id}
        } else if ("PUT".equals(metodo)) {
            int idItem = Integer.parseInt(ruta.split("/")[ruta.split("/").length - 1]);
            InputStream entrada = intercambio.getRequestBody();
            String cuerpo = new String(entrada.readAllBytes(), StandardCharsets.UTF_8);
            JsonObject json = JsonParser.parseString(cuerpo).getAsJsonObject();
            int cantidad = json.has("quantity") ? json.get("quantity").getAsInt() : json.get("cantidad").getAsInt();

            boolean exito = carritoDAO.actualizarCantidad(idItem, cantidad);
            enviarRespuestaJson(intercambio, exito ? 200 : 500, "{\"success\":" + exito + "}");

        // DELETE
        } else if ("DELETE".equals(metodo)) {
            if (ruta.contains("/clear/") || ruta.contains("/vaciar/")) {
                int idUsuario = Integer.parseInt(ruta.split("/")[ruta.split("/").length - 1]);
                boolean exito = carritoDAO.vaciarCarrito(idUsuario);
                enviarRespuestaJson(intercambio, exito ? 200 : 500, "{\"success\":" + exito + "}");
            } else {
                int idItem = Integer.parseInt(ruta.split("/")[ruta.split("/").length - 1]);
                boolean exito = carritoDAO.eliminarDelCarrito(idItem);
                enviarRespuestaJson(intercambio, exito ? 200 : 500, "{\"success\":" + exito + "}");
            }
        } else {
            enviarRespuestaJson(intercambio, 405, "{\"error\":\"Método no permitido\"}");
        }
    }
}
