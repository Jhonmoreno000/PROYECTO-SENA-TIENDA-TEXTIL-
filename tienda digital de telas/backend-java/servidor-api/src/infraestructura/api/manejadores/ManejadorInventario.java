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
    private final aplicacion.servicios.ServicioEtiquetasBodega servicioEtiquetas = new aplicacion.servicios.ServicioEtiquetasBodega();

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
        } else if (ruta.contains("/label") || ruta.contains("/etiqueta")) {
            java.net.URI uri = intercambio.getRequestURI();
            String query = uri.getQuery();
            java.util.Map<String, String> params = new java.util.HashMap<>();
            if (query != null) {
                for (String param : query.split("&")) {
                    String[] pair = param.split("=");
                    if (pair.length > 1) {
                        params.put(pair[0], java.net.URLDecoder.decode(pair[1], StandardCharsets.UTF_8));
                    }
                }
            }
            String codigo = params.getOrDefault("codigo", "ROL-001");
            String tela = params.getOrDefault("tela", "Lino Natural Premium");
            String lote = params.getOrDefault("lote", "LOT-2026-A");
            double metros = 50.0;
            try {
                if (params.containsKey("metros")) metros = Double.parseDouble(params.get("metros"));
            } catch (Exception ignored) {}
            String estado = params.getOrDefault("estado", "disponible");
            String ubicacion = params.getOrDefault("ubicacion", "PAS-02-EST-04");

            String formato = params.getOrDefault("formato", "svg");
            if ("html".equalsIgnoreCase(formato)) {
                String html = servicioEtiquetas.generarEtiquetaHtml(codigo, tela, lote, metros, estado, ubicacion);
                byte[] bytes = html.getBytes(StandardCharsets.UTF_8);
                intercambio.getResponseHeaders().set("Content-Type", "text/html; charset=UTF-8");
                intercambio.sendResponseHeaders(200, bytes.length);
                intercambio.getResponseBody().write(bytes);
                intercambio.getResponseBody().close();
            } else {
                String svg = servicioEtiquetas.generarEtiquetaSvg(codigo, tela, lote, metros, estado, ubicacion);
                byte[] bytes = svg.getBytes(StandardCharsets.UTF_8);
                intercambio.getResponseHeaders().set("Content-Type", "image/svg+xml; charset=UTF-8");
                intercambio.sendResponseHeaders(200, bytes.length);
                intercambio.getResponseBody().write(bytes);
                intercambio.getResponseBody().close();
            }
        } else {
            enviarRespuestaJson(intercambio, 404, "{\"error\":\"Ruta no encontrada\"}");
        }
    }

    private void manejarPost(String ruta, HttpExchange intercambio) throws Exception {
        String cuerpo = new String(leerCuerpoSeguro(intercambio), StandardCharsets.UTF_8);

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
        String cuerpo = new String(leerCuerpoSeguro(intercambio), StandardCharsets.UTF_8);
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
