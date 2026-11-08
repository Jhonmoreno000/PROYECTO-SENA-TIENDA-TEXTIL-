package infraestructura.api.manejadores;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.sun.net.httpserver.HttpExchange;
import dominio.modelos.ReporteError;
import dominio.modelos.TicketSoporte;
import infraestructura.persistencia.jdbc.SoporteDAO;
import java.nio.charset.StandardCharsets;

/**
 * Controlador HTTP para el módulo de soporte al cliente y reportes de errores técnicos.
 * Rutas base: `/api/support` y `/api/soporte`.
 */
public class ManejadorSoporte extends ManejadorBase {
    /** Objeto de acceso a datos para tickets y reportes (`SoporteDAO`). */
    private final SoporteDAO soporteDAO = new SoporteDAO();
    /** Serializador JSON (`Gson`). */
    private final Gson gson = new Gson();

    /**
     * Enruta las solicitudes `GET`, `POST` y `PUT` para consultar, crear o actualizar tickets y reportes de error.
     *
     * @param intercambio Contexto de la petición HTTP (`HttpExchange`).
     * @throws Exception Si ocurre un error durante el procesamiento.
     */
    @Override
    protected void procesarPeticion(HttpExchange intercambio) throws Exception {
        String metodo = intercambio.getRequestMethod();
        String ruta = intercambio.getRequestURI().getPath();

        if ("GET".equalsIgnoreCase(metodo)) {
            if (esRutaTickets(ruta)) {
                enviarRespuestaJson(intercambio, 200, gson.toJson(soporteDAO.obtenerTodosLosTickets()));
            } else if (esRutaReportes(ruta)) {
                enviarRespuestaJson(intercambio, 200, gson.toJson(soporteDAO.obtenerTodosLosReportesError()));
            } else {
                enviarRespuestaJson(intercambio, 404, "{}");
            }

        } else if ("POST".equalsIgnoreCase(metodo)) {
            String cuerpo = new String(leerCuerpoSeguro(intercambio), StandardCharsets.UTF_8);

            if (esRutaTickets(ruta)) {
                TicketSoporte ticket = gson.fromJson(cuerpo, TicketSoporte.class);
                boolean exito = soporteDAO.agregarTicket(ticket);
                enviarRespuestaJson(intercambio, exito ? 201 : 500,
                        exito ? "{\"success\":true,\"id\":" + gson.toJson(ticket.getId()) + "}" : "{\"error\":\"Error guardando ticket\"}");
            } else if (esRutaReportes(ruta)) {
                ReporteError reporte = gson.fromJson(cuerpo, ReporteError.class);
                boolean exito = soporteDAO.agregarReporteError(reporte);
                enviarRespuestaJson(intercambio, exito ? 201 : 500,
                        exito ? "{\"success\":true,\"id\":" + gson.toJson(reporte.getId()) + "}" : "{\"error\":\"Error guardando reporte\"}");
            } else {
                enviarRespuestaJson(intercambio, 404, "{}");
            }

        } else if ("PUT".equalsIgnoreCase(metodo)) {
            String cuerpo = new String(leerCuerpoSeguro(intercambio), StandardCharsets.UTF_8);
            JsonObject objetoJson;
            try {
                objetoJson = JsonParser.parseString(cuerpo).getAsJsonObject();
            } catch (Exception e) {
                enviarRespuestaJson(intercambio, 400, "{\"error\":\"Cuerpo JSON inválido\"}");
                return;
            }

            String estado = null;
            if (objetoJson.has("status") && !objetoJson.get("status").isJsonNull()) {
                estado = objetoJson.get("status").getAsString();
            } else if (objetoJson.has("estado") && !objetoJson.get("estado").isJsonNull()) {
                estado = objetoJson.get("estado").getAsString();
            }

            Integer asignadoA = null;
            if (objetoJson.has("assignedTo") && !objetoJson.get("assignedTo").isJsonNull()) {
                try { asignadoA = objetoJson.get("assignedTo").getAsInt(); } catch (Exception ignored) {}
            } else if (objetoJson.has("asignadoA") && !objetoJson.get("asignadoA").isJsonNull()) {
                try { asignadoA = objetoJson.get("asignadoA").getAsInt(); } catch (Exception ignored) {}
            }

            String prioridad = null;
            if (objetoJson.has("priority") && !objetoJson.get("priority").isJsonNull()) {
                prioridad = objetoJson.get("priority").getAsString();
            } else if (objetoJson.has("prioridad") && !objetoJson.get("prioridad").isJsonNull()) {
                prioridad = objetoJson.get("prioridad").getAsString();
            }

            int identificador = extraerIdRuta(ruta);

            if (identificador <= 0) {
                enviarRespuestaJson(intercambio, 400, "{\"error\":\"Identificador no numérico o inválido en la ruta\"}");
                return;
            }

            if (esRutaTickets(ruta)) {
                boolean exito = soporteDAO.actualizarTicket(identificador, estado, prioridad, asignadoA);
                enviarRespuestaJson(intercambio, exito ? 200 : 500, exito ? "{\"success\":true}" : "{\"error\":\"Error actualizando ticket\"}");
            } else if (esRutaReportes(ruta)) {
                boolean exito = soporteDAO.actualizarReporteError(identificador, estado, prioridad, asignadoA);
                enviarRespuestaJson(intercambio, exito ? 200 : 500, exito ? "{\"success\":true}" : "{\"error\":\"Error actualizando reporte\"}");
            } else {
                enviarRespuestaJson(intercambio, 404, "{\"error\":\"Ruta no encontrada\"}");
            }
        } else {
            enviarRespuestaJson(intercambio, 405, "{\"error\":\"Método no permitido\"}");
        }
    }

    /**
     * Evalúa si la ruta corresponde al subrecurso de tickets de soporte.
     *
     * @param ruta Ruta URI (`String`).
     * @return `true` si corresponde a tickets; `false` en caso contrario.
     */
    private boolean esRutaTickets(String ruta) {
        return ruta.startsWith("/api/support/tickets") || ruta.startsWith("/api/soporte/tickets");
    }

    /**
     * Evalúa si la ruta corresponde al subrecurso de reportes de error (`bugs`, `errores` o `reportes`).
     *
     * @param ruta Ruta URI (`String`).
     * @return `true` si corresponde a reportes de error; `false` en caso contrario.
     */
    private boolean esRutaReportes(String ruta) {
        return ruta.startsWith("/api/support/bugs")
                || ruta.startsWith("/api/support/reports")
                || ruta.startsWith("/api/soporte/errores")
                || ruta.startsWith("/api/soporte/reportes");
    }
}
