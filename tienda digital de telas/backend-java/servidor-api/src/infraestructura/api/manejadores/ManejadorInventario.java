package infraestructura.api.manejadores;

import aplicacion.servicios.ServicioCorteTextil;
import aplicacion.servicios.ServicioEtiquetasBodega;
import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.sun.net.httpserver.HttpExchange;
import dominio.modelos.ActividadReciente;
import dominio.modelos.EventoMerma;
import dominio.modelos.LoteInventario;
import dominio.modelos.RolloTextil;
import infraestructura.configuracion.Conexion;
import infraestructura.persistencia.jdbc.InventarioDAO;
import java.nio.charset.StandardCharsets;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.HashMap;
import java.util.Map;

/**
 * Controlador HTTP para la gestión de inventario ERP, lotes, rollos textiles, corte de tela,
 * eventos de merma, umbrales de stock, métricas de ventas, banner global y etiquetas de bodega.
 */
public class ManejadorInventario extends ManejadorBase {
    /** Objeto de acceso a datos de inventario y métricas (`InventarioDAO`). */
    private final InventarioDAO dao = new InventarioDAO();
    /** Serializador JSON (`Gson`). */
    private final Gson gson = new Gson();
    /** Servicio generador de etiquetas vectoriales SVG y HTML (`ServicioEtiquetasBodega`). */
    private final ServicioEtiquetasBodega servicioEtiquetas = new ServicioEtiquetasBodega();
    /** Servicio de dominio para validación y cálculo de corte textil (`ServicioCorteTextil`). */
    private final ServicioCorteTextil servicioCorte = new ServicioCorteTextil();

    /**
     * Enruta las peticiones `GET`, `POST` y `PUT` hacia los manejadores específicos de inventario y métricas.
     *
     * @param intercambio Contexto de la petición HTTP (`HttpExchange`).
     * @throws Exception Si ocurre un error durante el procesamiento.
     */
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

    /**
     * Procesa las consultas `GET` de lotes, rollos, mermas, umbrales, métricas, actividad, banner y etiquetas.
     *
     * @param ruta        Ruta URI solicitada (`String`).
     * @param intercambio Contexto HTTP (`HttpExchange`).
     * @throws Exception Si falla la consulta o envío de la respuesta.
     */
    private void manejarGet(String ruta, HttpExchange intercambio) throws Exception {
        if (ruta.endsWith("/batches") || ruta.endsWith("/lotes")) {
            enviarRespuestaJson(intercambio, 200, gson.toJson(dao.obtenerTodosLosLotes()));
        } else if (ruta.endsWith("/rolls") || ruta.endsWith("/rollos")) {
            enviarRespuestaJson(intercambio, 200, gson.toJson(dao.obtenerTodosLosRollos()));
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
            Map<String, String> params = new HashMap<>();
            if (query != null) {
                for (String param : query.split("&")) {
                    String[] pair = param.split("=");
                    if (pair.length > 1) {
                        params.put(pair[0], java.net.URLDecoder.decode(pair[1], StandardCharsets.UTF_8));
                    }
                }
            }

            String codigoSolicitado = params.getOrDefault("codigo", params.get("code"));
            RolloTextil rollo = dao.obtenerRolloPorCodigoOId(codigoSolicitado);
            if (rollo == null) {
                java.util.List<RolloTextil> todosLosRollos = dao.obtenerTodosLosRollos();
                if (!todosLosRollos.isEmpty()) {
                    rollo = todosLosRollos.get(0);
                }
            }

            String codigo = params.containsKey("codigo") ? params.get("codigo")
                    : (rollo != null && rollo.getCodigoRollo() != null ? rollo.getCodigoRollo() : "ROL-SIN-REGISTRO");
            String tela = params.containsKey("tela") ? params.get("tela")
                    : (rollo != null && rollo.getNombreProducto() != null ? rollo.getNombreProducto() : "Sin especificar");
            String lote = params.containsKey("lote") ? params.get("lote")
                    : (rollo != null && rollo.getLoteTintoreria() != null ? rollo.getLoteTintoreria() : "SIN-LOTE");
            double metros = rollo != null ? rollo.getMetrajeRemanente() : 0.0;
            try {
                if (params.containsKey("metros")) {
                    metros = Double.parseDouble(params.get("metros"));
                }
            } catch (Exception ignored) {}
            String estado = params.containsKey("estado") ? params.get("estado")
                    : (rollo != null && rollo.getEstado() != null ? rollo.getEstado() : "disponible");
            String ubicacion = params.containsKey("ubicacion") ? params.get("ubicacion")
                    : (rollo != null && rollo.getUbicacionBodega() != null ? rollo.getUbicacionBodega() : "Bodega Principal");

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

    /**
     * Procesa las peticiones `POST` para registrar nuevos lotes, eventos de merma, cortes de rollo y actividades.
     *
     * @param ruta        Ruta URI solicitada (`String`).
     * @param intercambio Contexto HTTP (`HttpExchange`).
     * @throws Exception Si falla el procesamiento o la persistencia.
     */
    private void manejarPost(String ruta, HttpExchange intercambio) throws Exception {
        String cuerpo = new String(leerCuerpoSeguro(intercambio), StandardCharsets.UTF_8);

        if (ruta.endsWith("/batches") || ruta.endsWith("/lotes")) {
            LoteInventario lote = gson.fromJson(cuerpo, LoteInventario.class);
            boolean exito = dao.agregarLote(lote);
            enviarRespuestaJson(intercambio, exito ? 200 : 500,
                    exito ? "{\"success\":true,\"id\":" + gson.toJson(lote.getId()) + "}" : "{\"success\":false}");
        } else if (ruta.endsWith("/waste") || ruta.endsWith("/mermas")) {
            EventoMerma merma = gson.fromJson(cuerpo, EventoMerma.class);
            boolean exito = dao.agregarEventoMerma(merma);
            enviarRespuestaJson(intercambio, exito ? 200 : 500,
                    exito ? "{\"success\":true,\"id\":" + gson.toJson(merma.getId()) + "}" : "{\"success\":false}");
        } else if (ruta.endsWith("/rolls") || ruta.endsWith("/rollos")) {
            RolloTextil rollo = gson.fromJson(cuerpo, RolloTextil.class);
            boolean exito = dao.agregarRollo(rollo);
            enviarRespuestaJson(intercambio, exito ? 200 : 500,
                    exito ? "{\"success\":true,\"id\":" + rollo.getId() + "}" : "{\"success\":false}");
        } else if (ruta.endsWith("/cut") || ruta.endsWith("/corte")) {
            JsonObject json = JsonParser.parseString(cuerpo).getAsJsonObject();
            String codigoRollo = json.has("rollCode") ? json.get("rollCode").getAsString()
                    : (json.has("codigoRollo") ? json.get("codigoRollo").getAsString() : null);
            double metrosSolicitados = json.has("meters") ? json.get("meters").getAsDouble()
                    : (json.has("metros") ? json.get("metros").getAsDouble() : 0.0);
            double precioBase = json.has("basePrice") ? json.get("basePrice").getAsDouble()
                    : (json.has("precioBase") ? json.get("precioBase").getAsDouble() : 0.0);

            RolloTextil rollo = dao.obtenerRolloPorCodigoOId(codigoRollo);
            if (rollo == null) {
                enviarRespuestaJson(intercambio, 404, "{\"error\":\"Rollo textil no encontrado\"}");
                return;
            }

            double precioUnitarioReal = precioBase;
            if (precioUnitarioReal <= 0 && rollo.getProductoId() > 0) {
                try (Connection con = Conexion.obtenerConexion();
                     PreparedStatement pstP = con.prepareStatement("SELECT precio FROM productos WHERE id = ?")) {
                    pstP.setInt(1, rollo.getProductoId());
                    try (ResultSet rsP = pstP.executeQuery()) {
                        if (rsP.next()) {
                            precioUnitarioReal = rsP.getDouble("precio");
                        }
                    }
                } catch (Exception ignored) {}
            }
            if (precioUnitarioReal <= 0) {
                precioUnitarioReal = 25000.0;
            }

            ServicioCorteTextil.ResultadoValidacionCorte validacion = servicioCorte.validarMetrajeContinuo(
                    java.util.List.of(rollo), metrosSolicitados, rollo.getLoteTintoreria());
            if (!validacion.esValido()) {
                enviarRespuestaJson(intercambio, 400, "{\"error\":" + gson.toJson(validacion.getMensaje()) + ",\"code\":" + gson.toJson(validacion.getCodigo()) + "}");
                return;
            }
            ServicioCorteTextil.ResultadoProcesamientoCorte corte = servicioCorte.procesarCorteYRemanente(
                    rollo, metrosSolicitados, precioUnitarioReal);
            double totalCalculado = servicioCorte.calcularPrecioEscalonado(precioUnitarioReal, metrosSolicitados).getTotalNeto();
            boolean actualizado = dao.actualizarRolloDespuesDeCorte(rollo, corte.getEventoMerma());

            JsonObject resp = new JsonObject();
            resp.addProperty("success", actualizado);
            resp.addProperty("rollId", rollo.getId());
            resp.addProperty("remainingMeters", corte.getMetrajeRemanente());
            resp.addProperty("status", corte.getEstadoFinalRollo());
            resp.addProperty("totalPrice", totalCalculado);
            enviarRespuestaJson(intercambio, actualizado ? 200 : 500, gson.toJson(resp));
        } else if (ruta.equals("/api/activity") || ruta.equals("/api/actividad")) {
            ActividadReciente actividad = gson.fromJson(cuerpo, ActividadReciente.class);
            enviarRespuestaJson(intercambio, 200, "{\"success\":" + dao.agregarActividad(actividad) + "}");
        } else {
            enviarRespuestaJson(intercambio, 404, "{\"error\":\"Ruta no encontrada\"}");
        }
    }

    /**
     * Procesa las peticiones `PUT` para actualizar metrajes de lotes, umbrales de alerta o el banner global.
     *
     * @param ruta        Ruta URI solicitada (`String`).
     * @param intercambio Contexto HTTP (`HttpExchange`).
     * @throws Exception Si falla la actualización.
     */
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
