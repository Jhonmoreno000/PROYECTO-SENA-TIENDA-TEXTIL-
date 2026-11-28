package infraestructura.api.manejadores;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.sun.net.httpserver.HttpExchange;
import dominio.modelos.Retazo;
import infraestructura.persistencia.jdbc.RetazoDAO;
import java.nio.charset.StandardCharsets;
import java.util.List;

/**
 * Controlador REST para el modulo de Venta de Retazos (`/api/retazos` y `/api/remnants`).
 * Expone consulta publica de piezas unicas disponibles y gestion administrativa.
 */
public class ManejadorRetazos extends ManejadorBase {

    private final RetazoDAO retazoDAO = new RetazoDAO();
    private final Gson gson = new Gson();

    @Override
    protected void procesarPeticion(HttpExchange intercambio) throws Exception {
        String metodo = intercambio.getRequestMethod();
        String ruta = intercambio.getRequestURI().getPath();

        if ("GET".equalsIgnoreCase(metodo)) {
            if (ruta.matches("^/api/(retazos|remnants)/\\d+/?$")) {
                int id = extraerIdRuta(ruta);
                Retazo retazo = retazoDAO.obtenerRetazoPorId(id);
                if (retazo == null) {
                    enviarRespuestaJson(intercambio, 404, "{\"error\":\"Retazo no encontrado\"}");
                    return;
                }
                enviarRespuestaJson(intercambio, 200, gson.toJson(retazo));
                return;
            }

            String incluirTodos = obtenerParametroConsulta(intercambio, "todos");
            List<Retazo> lista = "true".equalsIgnoreCase(incluirTodos)
                    ? retazoDAO.obtenerTodosLosRetazos()
                    : retazoDAO.obtenerRetazosDisponibles();
            enviarRespuestaJson(intercambio, 200, gson.toJson(lista));

        } else if ("POST".equalsIgnoreCase(metodo)) {
            var identidad = obtenerIdentidad(intercambio);
            if (identidad.isEmpty() || (!identidad.get().esAdministrador() && !identidad.get().esVendedor())) {
                enviarRespuestaJson(intercambio, 403, "{\"error\":\"Solo administradores o vendedores pueden registrar retazos\"}");
                return;
            }

            String cuerpo = new String(leerCuerpoSeguro(intercambio), StandardCharsets.UTF_8);
            Retazo retazo;
            try {
                retazo = gson.fromJson(cuerpo, Retazo.class);
            } catch (Exception e) {
                enviarRespuestaJson(intercambio, 400, "{\"error\":\"JSON invalido\"}");
                return;
            }

            if (retazo == null || retazo.getProductoId() <= 0 || retazo.getLargoMetros() <= 0 || retazo.getLargoMetros() >= 1.0) {
                enviarRespuestaJson(intercambio, 400, "{\"error\":\"Un retazo debe pertenecer a un producto valido y tener un largo entre 0.01m y 0.99m\"}");
                return;
            }

            boolean creado = retazoDAO.crearRetazoManual(retazo);
            if (creado) {
                enviarRespuestaJson(intercambio, 201, gson.toJson(retazo));
            } else {
                enviarRespuestaJson(intercambio, 500, "{\"error\":\"No se pudo registrar el retazo\"}");
            }

        } else if ("PUT".equalsIgnoreCase(metodo)) {
            var identidad = obtenerIdentidad(intercambio);
            if (identidad.isEmpty() || (!identidad.get().esAdministrador() && !identidad.get().esVendedor())) {
                enviarRespuestaJson(intercambio, 403, "{\"error\":\"Acceso denegado\"}");
                return;
            }

            int id = extraerIdRuta(ruta);
            if (id <= 0) {
                enviarRespuestaJson(intercambio, 400, "{\"error\":\"ID de retazo invalido\"}");
                return;
            }

            String cuerpo = new String(leerCuerpoSeguro(intercambio), StandardCharsets.UTF_8);
            JsonObject json = JsonParser.parseString(cuerpo).getAsJsonObject();
            String estado = json.has("status") ? json.get("status").getAsString()
                    : (json.has("estado") ? json.get("estado").getAsString() : null);
            Double precio = json.has("price") ? json.get("price").getAsDouble()
                    : (json.has("precioLiquidacion") ? json.get("precioLiquidacion").getAsDouble() : null);

            boolean ok = retazoDAO.actualizarEstadoRetazo(id, estado, precio);
            enviarRespuestaJson(intercambio, ok ? 200 : 404, "{\"success\":" + ok + "}");
        } else {
            enviarRespuestaJson(intercambio, 405, "{\"error\":\"Metodo no permitido\"}");
        }
    }
}
