package infraestructura.api.manejadores;

import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import com.sun.net.httpserver.HttpExchange;
import infraestructura.persistencia.jdbc.PedidoDAO;
import dominio.modelos.Pedido;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import java.io.InputStream;
import java.lang.reflect.Type;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;

/**
 * Controlador para la gestión de pedidos (órdenes de compra).
 */
public class ManejadorPedidos extends ManejadorBase {
    private final PedidoDAO pedidoDAO;
    private final Gson gson;

    public ManejadorPedidos() {
        this.pedidoDAO = new PedidoDAO();
        this.gson = new Gson();
    }

    @Override
    protected void procesarPeticion(HttpExchange intercambio) throws Exception {
        String metodo = intercambio.getRequestMethod();

        // GET /api/orders o /api/pedidos
        if ("GET".equalsIgnoreCase(metodo)) {
            List<Pedido> pedidos = pedidoDAO.obtenerTodosLosPedidos();
            enviarRespuestaJson(intercambio, 200, gson.toJson(pedidos));

        // POST /api/orders o /api/pedidos
        } else if ("POST".equalsIgnoreCase(metodo)) {
            InputStream entrada = intercambio.getRequestBody();
            String cuerpo = new String(entrada.readAllBytes(), StandardCharsets.UTF_8);
            JsonObject json = JsonParser.parseString(cuerpo).getAsJsonObject();

            int idCliente = json.has("clientId") ? json.get("clientId").getAsInt() : json.get("idCliente").getAsInt();
            double total = json.has("total") ? json.get("total").getAsDouble() : json.get("montoTotal").getAsDouble();

            Type tipoLista = new TypeToken<List<Map<String, Object>>>(){}.getType();
            List<Map<String, Object>> articulos = gson.fromJson(json.has("items") ? json.get("items") : json.get("articulos"), tipoLista);

            int idPedido = pedidoDAO.crearPedido(idCliente, total, articulos);

            if (idPedido > 0) {
                String respuesta = "{\"success\":true,\"orderId\":" + idPedido + "}";
                enviarRespuestaJson(intercambio, 201, respuesta);
            } else {
                enviarRespuestaJson(intercambio, 500, "{\"error\":\"Error al crear el pedido\"}");
            }

        // PUT /api/orders/{id}/status o /api/pedidos/{id}/estado
        } else if ("PUT".equalsIgnoreCase(metodo)) {
            String ruta = intercambio.getRequestURI().getPath();
            if (ruta.contains("/status") || ruta.contains("/estado")) {
                int idPedido = Integer.parseInt(ruta.split("/")[3]);
                InputStream entrada = intercambio.getRequestBody();
                String cuerpo = new String(entrada.readAllBytes(), StandardCharsets.UTF_8);
                JsonObject json = JsonParser.parseString(cuerpo).getAsJsonObject();
                String estado = json.has("status") ? json.get("status").getAsString() : json.get("estado").getAsString();
                boolean exito = pedidoDAO.actualizarEstadoPedido(idPedido, estado);
                enviarRespuestaJson(intercambio, exito ? 200 : 500, exito ? "{\"success\":true}" : "{\"error\":\"Error actualizando\"}");
            } else {
                enviarRespuestaJson(intercambio, 404, "{\"error\":\"Ruta no encontrada\"}");
            }
        } else {
            enviarRespuestaJson(intercambio, 405, "{\"error\":\"Método no permitido\"}");
        }
    }
}
