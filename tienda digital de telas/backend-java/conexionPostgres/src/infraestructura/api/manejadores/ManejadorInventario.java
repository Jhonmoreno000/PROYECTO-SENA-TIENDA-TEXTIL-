package infraestructura.api.manejadores;

import com.sun.net.httpserver.HttpExchange;
import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import infraestructura.persistencia.jdbc.InventarioDAO;
import dominio.modelos.ActividadReciente;
import dominio.modelos.EventoMerma;
import dominio.modelos.LoteInventario;

/**
 * Controlador para inventario, lotes, desperdicios, métricas y actividad.
 */
public class ManejadorInventario extends ManejadorBase {
    private final InventarioDAO dao = new InventarioDAO();
    private final Gson gson = new Gson();

    @Override
    protected void procesarPeticion(HttpExchange intercambio) throws Exception {
        String metodo = intercambio.getRequestMethod();
        String ruta = intercambio.getRequestURI().getPath();

        if ("GET".equalsIgnoreCase(metodo)) {
            manejarGet(ruta, intercambio);
        } else if ("POST".equalsIgnoreCase(metodo)) {
            manejarPost(ruta, intercambio);
        } else if ("PUT".equalsIgnoreCase(metodo)) {
            manejarPut(ruta, intercambio);
        } else {
            enviarRespuestaJson(intercambio, 405, "{\"error\":\"Método no permitido\"}");
        }
    }

    private void manejarGet(String ruta, HttpExchange intercambio) throws Exception {
        if (ruta.endsWith("/batches") || ruta.endsWith("/lotes")) {
            enviarRespuestaJson(intercambio, 200, gson.toJson(dao.obtenerTodosLosLotes()));
        } else if (ruta.endsWith("/waste") || ruta.endsWith("/mermas")) {
            enviarRespuestaJson(intercambio, 200, gson.toJson(dao.obtenerTodosLosEventosMerma()));
        } else if (ruta.endsWith("/thresholds") || ruta.endsWith("/umbrales")) {
            enviarRespuestaJson(intercambio, 200, gson.toJson(dao.obtenerTodosLosUmbrales()));
        } else if (ruta.endsWith("/sales") || ruta.endsWith("/ventas")) {
            enviarRespuestaJson(intercambio, 200, gson.toJson(dao.obtenerVentasDiarias()));
        } else if (ruta.endsWith("/regions") || ruta.endsWith("/regiones")) {
            enviarRespuestaJson(intercambio, 200, gson.toJson(dao.obtenerVentasPorRegion()));
        } else if (ruta.endsWith("/erp-sales") || ruta.endsWith("/ventas-erp")) {
            enviarRespuestaJson(intercambio, 200, gson.toJson(dao.obtenerMetricasVentasErp()));
        } else if (ruta.endsWith("/notifications") || ruta.endsWith("/notificaciones")) {
            enviarRespuestaJson(intercambio, 200, gson.toJson(dao.obtenerNotificacionesErp()));
        } else if (ruta.endsWith("/fabric-inventory") || ruta.endsWith("/inventario-telas")) {
            enviarRespuestaJson(intercambio, 200, gson.toJson(dao.obtenerInventarioTelasErp()));
        } else if (ruta.equals("/api/activity") || ruta.equals("/api/actividad")) {
            enviarRespuestaJson(intercambio, 200, gson.toJson(dao.obtenerActividadReciente()));
        } else if (ruta.equals("/api/banner")) {
            enviarRespuestaJson(intercambio, 200, gson.toJson(dao.obtenerBanner()));
        } else {
            enviarRespuestaJson(intercambio, 404, "{\"error\":\"Ruta no encontrada\"}");
        }
    }

    private void manejarPost(String ruta, HttpExchange intercambio) throws Exception {
        InputStream entrada = intercambio.getRequestBody();
        String cuerpo = new String(entrada.readAllBytes(), StandardCharsets.UTF_8);

        if (ruta.endsWith("/batches") || ruta.endsWith("/lotes")) {
            LoteInventario lote = gson.fromJson(cuerpo, LoteInventario.class);
            enviarRespuestaJson(intercambio, 200, "{\"success\":" + dao.agregarLote(lote) + "}");
        } else if (ruta.endsWith("/waste") || ruta.endsWith("/mermas")) {
            EventoMerma merma = gson.fromJson(cuerpo, EventoMerma.class);
            enviarRespuestaJson(intercambio, 200, "{\"success\":" + dao.agregarEventoMerma(merma) + "}");
        } else if (ruta.equals("/api/activity") || ruta.equals("/api/actividad")) {
            ActividadReciente actividad = gson.fromJson(cuerpo, ActividadReciente.class);
            enviarRespuestaJson(intercambio, 200, "{\"success\":" + dao.agregarActividad(actividad) + "}");
        } else {
            enviarRespuestaJson(intercambio, 404, "{\"error\":\"Ruta no encontrada\"}");
        }
    }

    private void manejarPut(String ruta, HttpExchange intercambio) throws Exception {
        InputStream entrada = intercambio.getRequestBody();
        String cuerpo = new String(entrada.readAllBytes(), StandardCharsets.UTF_8);
        JsonObject json;
        try {
            json = JsonParser.parseString(cuerpo).getAsJsonObject();
        } catch (Exception e) {
            enviarRespuestaJson(intercambio, 400, "{\"error\":\"JSON inválido\"}");
            return;
        }

        if (ruta.contains("/batches/") || ruta.contains("/lotes/")) {
            String[] partes = ruta.split("/");
            String idLote = partes[partes.length - 1];
            double metros = json.has("currentMeters") ? json.get("currentMeters").getAsDouble()
                          : (json.has("metrosActuales") ? json.get("metrosActuales").getAsDouble() : 0.0);
            String estado = json.has("status") ? json.get("status").getAsString()
                          : (json.has("estado") ? json.get("estado").getAsString() : "active");
            enviarRespuestaJson(intercambio, 200, "{\"success\":" + dao.actualizarLote(idLote, metros, estado) + "}");

        } else if (ruta.endsWith("/thresholds") || ruta.endsWith("/umbrales")) {
            String tela = json.has("fabricType") ? json.get("fabricType").getAsString()
                        : (json.has("tipoTela") ? json.get("tipoTela").getAsString() : "");
            double metrosMinimos = json.has("minMeters") ? json.get("minMeters").getAsDouble()
                                 : (json.has("metrosMinimos") ? json.get("metrosMinimos").getAsDouble() : 20.0);
            enviarRespuestaJson(intercambio, 200, "{\"success\":" + dao.actualizarUmbral(tela, metrosMinimos) + "}");

        } else if (ruta.equals("/api/banner")) {
            boolean habilitado = json.has("enabled") ? json.get("enabled").getAsBoolean()
                               : (json.has("habilitado") ? json.get("habilitado").getAsBoolean()
                               : (json.has("activo") ? json.get("activo").getAsBoolean() : false));
            String mensaje = json.has("message") ? json.get("message").getAsString()
                           : (json.has("mensaje") ? json.get("mensaje").getAsString() : "");
            String tipo = json.has("bannerType") ? json.get("bannerType").getAsString()
                        : (json.has("tipoBanner") ? json.get("tipoBanner").getAsString() : "info");
            enviarRespuestaJson(intercambio, 200, "{\"success\":" + dao.actualizarBanner(habilitado, mensaje, tipo) + "}");
        } else {
            enviarRespuestaJson(intercambio, 404, "{\"error\":\"Ruta no encontrada\"}");
        }
    }
}
