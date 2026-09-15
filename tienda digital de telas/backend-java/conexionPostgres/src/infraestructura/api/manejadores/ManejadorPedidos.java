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
 * Rutas base: /api/orders y /api/pedidos
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
            JsonObject json;
            try {
                json = JsonParser.parseString(cuerpo).getAsJsonObject();
            } catch (Exception e) {
                enviarRespuestaJson(intercambio, 400, "{\"error\":\"JSON inválido\"}");
                return;
            }

            int idCliente = 1;
            if (json.has("clientId") && !json.get("clientId").isJsonNull()) {
                idCliente = json.get("clientId").getAsInt();
            } else if (json.has("userId") && !json.get("userId").isJsonNull()) {
                idCliente = json.get("userId").getAsInt();
            } else if (json.has("idCliente") && !json.get("idCliente").isJsonNull()) {
                idCliente = json.get("idCliente").getAsInt();
            } else if (json.has("idUsuario") && !json.get("idUsuario").isJsonNull()) {
                idCliente = json.get("idUsuario").getAsInt();
            }

            double total = 0.0;
            if (json.has("total") && !json.get("total").isJsonNull()) {
                total = json.get("total").getAsDouble();
            } else if (json.has("montoTotal") && !json.get("montoTotal").isJsonNull()) {
                total = json.get("montoTotal").getAsDouble();
            }

            Type tipoLista = new TypeToken<List<Map<String, Object>>>(){}.getType();
            List<Map<String, Object>> articulos = null;
            if (json.has("items")) {
                articulos = gson.fromJson(json.get("items"), tipoLista);
            } else if (json.has("articulos")) {
                articulos = gson.fromJson(json.get("articulos"), tipoLista);
            }

            int idPedido = pedidoDAO.crearPedido(idCliente, total, articulos);

            if (idPedido > 0) {
                String respuesta = "{\"success\":true,\"orderId\":" + idPedido + ",\"idPedido\":" + idPedido + "}";
                enviarRespuestaJson(intercambio, 201, respuesta);
            } else {
                enviarRespuestaJson(intercambio, 500, "{\"error\":\"Error al crear el pedido\"}");
            }

        // PUT /api/orders/{id}/status o /api/pedidos/{id}/estado
        } else if ("PUT".equalsIgnoreCase(metodo)) {
            String ruta = intercambio.getRequestURI().getPath();
            if (ruta.contains("/status") || ruta.contains("/estado")) {
                String[] segmentos = ruta.split("/");
                int idPedido = -1;
                for (String segmento : segmentos) {
                    if (segmento.matches("\\d+")) {
                        idPedido = Integer.parseInt(segmento);
                        break;
                    }
                }

                if (idPedido <= 0) {
                    enviarRespuestaJson(intercambio, 400, "{\"error\":\"Identificador de pedido inválido en la ruta\"}");
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

                String estado = objetoJson.has("status") ? objetoJson.get("status").getAsString() 
                              : (objetoJson.has("estado") ? objetoJson.get("estado").getAsString() : "pending");
                boolean exito = pedidoDAO.actualizarEstadoPedido(idPedido, estado);
                enviarRespuestaJson(intercambio, exito ? 200 : 500, exito ? "{\"success\":true}" : "{\"error\":\"Error actualizando estado del pedido\"}");
            } else {
                enviarRespuestaJson(intercambio, 404, "{\"error\":\"Ruta no encontrada\"}");
            }
        } else {
            enviarRespuestaJson(intercambio, 405, "{\"error\":\"Método no permitido\"}");
        }
    }
}
