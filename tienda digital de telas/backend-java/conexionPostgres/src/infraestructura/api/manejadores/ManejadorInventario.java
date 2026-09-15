package infraestructura.api.manejadores;

import com.sun.net.httpserver.HttpExchange;
import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import infraestructura.persistencia.jdbc.InventarioDAO;
import dominio.modelos.LoteInventario;
import dominio.modelos.EventoMerma;
import dominio.modelos.ActividadReciente;

/**
 * Controlador para la gestión de inventario, métricas, actividad y banners.
 */
public class ManejadorInventario extends ManejadorBase {
    private final InventarioDAO dao = new InventarioDAO();
    private final Gson gson = new Gson();

    @Override
    protected void procesarPeticion(HttpExchange intercambio) throws Exception {
        String ruta = intercambio.getRequestURI().getPath();
        String metodo = intercambio.getRequestMethod();

        if ("GET".equals(metodo)) {
            manejarGet(ruta, intercambio);
        } else if ("POST".equals(metodo)) {
            manejarPost(ruta, intercambio);
        } else if ("PUT".equals(metodo)) {
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
        JsonObject json = JsonParser.parseString(cuerpo).getAsJsonObject();

        if (ruta.contains("/batches/") || ruta.contains("/lotes/")) {
            String idLote = ruta.split("/")[ruta.split("/").length - 1];
            double metros = json.has("currentMeters") ? json.get("currentMeters").getAsDouble() : json.get("metrosActuales").getAsDouble();
            String estado = json.has("status") ? json.get("status").getAsString() : json.get("estado").getAsString();
            enviarRespuestaJson(intercambio, 200, "{\"success\":" + dao.actualizarLote(idLote, metros, estado) + "}");
        } else if (ruta.endsWith("/thresholds") || ruta.endsWith("/umbrales")) {
            String tela = json.has("fabricType") ? json.get("fabricType").getAsString() : json.get("tipoTela").getAsString();
            double metrosMinimos = json.has("minMeters") ? json.get("minMeters").getAsDouble() : json.get("metrosMinimos").getAsDouble();
            enviarRespuestaJson(intercambio, 200, "{\"success\":" + dao.actualizarUmbral(tela, metrosMinimos) + "}");
        } else if (ruta.equals("/api/banner")) {
            boolean habilitado = json.has("enabled") ? json.get("enabled").getAsBoolean() : json.get("habilitado").getAsBoolean();
            String mensaje = json.has("message") ? json.get("message").getAsString() : json.get("mensaje").getAsString();
            String tipo = json.has("bannerType") ? json.get("bannerType").getAsString() : json.get("tipoBanner").getAsString();
            enviarRespuestaJson(intercambio, 200, "{\"success\":" + dao.actualizarBanner(habilitado, mensaje, tipo) + "}");
        } else {
            enviarRespuestaJson(intercambio, 404, "{\"error\":\"Ruta no encontrada\"}");
        }
    }
}
