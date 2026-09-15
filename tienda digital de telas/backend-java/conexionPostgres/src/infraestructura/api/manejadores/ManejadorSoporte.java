package infraestructura.api.manejadores;

import com.sun.net.httpserver.HttpExchange;
import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import infraestructura.persistencia.jdbc.SoporteDAO;
import dominio.modelos.ReporteError;
import dominio.modelos.TicketSoporte;

/**
 * Manejador para el módulo de soporte al cliente y reportes de errores.
 * Rutas base: /api/support y /api/soporte
 * Gestiona tickets de soporte y reportes de errores (bugs).
 * Soporta GET (listar), POST (crear) y PUT (actualizar estado).
 */
public class ManejadorSoporte extends ManejadorBase {
    private final SoporteDAO soporteDAO = new SoporteDAO();
    private final Gson gson = new Gson();

    /**
     * Enruta la solicitud según el método HTTP y la ruta.
     */
    @Override
    protected void procesarPeticion(HttpExchange intercambio) throws Exception {
        String metodo = intercambio.getRequestMethod();
        String ruta = intercambio.getRequestURI().getPath();

        // GET — Consulta de tickets y reportes de errores
        if ("GET".equalsIgnoreCase(metodo)) {
            if (ruta.startsWith("/api/support/tickets") || ruta.startsWith("/api/soporte/tickets")) {
                // GET lista de tickets de soporte
                enviarRespuestaJson(intercambio, 200, gson.toJson(soporteDAO.obtenerTodosLosTickets()));
            } else if (ruta.startsWith("/api/support/bugs") || ruta.startsWith("/api/soporte/errores")) {
                // GET lista de reportes de errores
                enviarRespuestaJson(intercambio, 200, gson.toJson(soporteDAO.obtenerTodosLosReportesError()));
            } else {
                enviarRespuestaJson(intercambio, 404, "{}");
            }

        // POST — Creación de nuevos tickets o reportes
        } else if ("POST".equalsIgnoreCase(metodo)) {
            InputStream flujoEntrada = intercambio.getRequestBody();
            String cuerpo = new String(flujoEntrada.readAllBytes(), StandardCharsets.UTF_8);

            if (ruta.startsWith("/api/support/tickets") || ruta.startsWith("/api/soporte/tickets")) {
                TicketSoporte ticket = gson.fromJson(cuerpo, TicketSoporte.class);
                boolean exito = soporteDAO.agregarTicket(ticket);
                enviarRespuestaJson(intercambio, exito ? 201 : 500, exito ? "{\"success\":true}" : "{\"error\":\"Error guardando ticket\"}");
            } else if (ruta.startsWith("/api/support/bugs") || ruta.startsWith("/api/soporte/errores")) {
                ReporteError reporte = gson.fromJson(cuerpo, ReporteError.class);
                boolean exito = soporteDAO.agregarReporteError(reporte);
                enviarRespuestaJson(intercambio, exito ? 201 : 500, exito ? "{\"success\":true}" : "{\"error\":\"Error guardando reporte\"}");
            } else {
                enviarRespuestaJson(intercambio, 404, "{}");
            }

        // PUT — Actualización del estado de tickets o reportes
        } else if ("PUT".equalsIgnoreCase(metodo)) {
            InputStream flujoEntrada = intercambio.getRequestBody();
            String cuerpo = new String(flujoEntrada.readAllBytes(), StandardCharsets.UTF_8);
            JsonObject objetoJson;
            try {
                objetoJson = JsonParser.parseString(cuerpo).getAsJsonObject();
            } catch (Exception e) {
                enviarRespuestaJson(intercambio, 400, "{\"error\":\"Cuerpo JSON inválido\"}");
                return;
            }
            
            String estado = "open";
            if (objetoJson.has("status") && !objetoJson.get("status").isJsonNull()) {
                estado = objetoJson.get("status").getAsString();
            } else if (objetoJson.has("estado") && !objetoJson.get("estado").isJsonNull()) {
                estado = objetoJson.get("estado").getAsString();
            }

            String[] segmentosRuta = ruta.split("/");
            int identificador = -1;
            for (String segmento : segmentosRuta) {
                if (segmento.matches("\\d+")) {
                    identificador = Integer.parseInt(segmento);
                    break;
                }
            }

            if (identificador <= 0) {
                enviarRespuestaJson(intercambio, 400, "{\"error\":\"Identificador no numérico o inválido en la ruta\"}");
                return;
            }

            if (ruta.startsWith("/api/support/tickets") || ruta.startsWith("/api/soporte/tickets")) {
                boolean exito = soporteDAO.actualizarEstadoTicket(identificador, estado);
                enviarRespuestaJson(intercambio, exito ? 200 : 500, exito ? "{\"success\":true}" : "{\"error\":\"Error actualizando ticket\"}");
            } else if (ruta.startsWith("/api/support/bugs") || ruta.startsWith("/api/soporte/errores")) {
                boolean exito = soporteDAO.actualizarEstadoReporteError(identificador, estado);
                enviarRespuestaJson(intercambio, exito ? 200 : 500, exito ? "{\"success\":true}" : "{\"error\":\"Error actualizando reporte\"}");
            } else {
                enviarRespuestaJson(intercambio, 404, "{\"error\":\"Ruta no encontrada\"}");
            }
        } else {
            enviarRespuestaJson(intercambio, 405, "{\"error\":\"Método no permitido\"}");
        }
    }
}
