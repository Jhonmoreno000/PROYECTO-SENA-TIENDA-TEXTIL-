package infraestructura.api.manejadores;

import com.sun.net.httpserver.HttpExchange;
import infraestructura.configuracion.Conexion;
import java.lang.management.ManagementFactory;
import java.sql.Connection;
import java.time.Instant;

/**
 * Controlador de Endpoints de Salud (Health Checks) para Kubernetes, Docker y Monitoreo SENA.
 * Expone:
 * - /health/live  (Liveness Probe: Proceso activo y receptivo)
 * - /health/ready (Readiness Probe: Conexión a Base de Datos PostgreSQL operativa)
 * - /api/health   (Reporte consolidado con métricas de JVM y persistencia)
 */
public class ManejadorSalud extends ManejadorBase {

    @Override
    protected void procesarPeticion(HttpExchange intercambio) throws Exception {
        if (!"GET".equalsIgnoreCase(intercambio.getRequestMethod())) {
            enviarRespuestaJson(intercambio, 405, "{\"error\":\"Método no permitido. Use GET.\"}");
            return;
        }

        String ruta = intercambio.getRequestURI().getPath();
        long tiempoUptimeMs = ManagementFactory.getRuntimeMXBean().getUptime();
        long memoriaTotalMb = Runtime.getRuntime().totalMemory() / (1024 * 1024);
        long memoriaLibreMb = Runtime.getRuntime().freeMemory() / (1024 * 1024);
        long memoriaUsadaMb = memoriaTotalMb - memoriaLibreMb;

        // --- LIVENESS PROBE: /health/live ---
        if (ruta.endsWith("/live")) {
            com.google.gson.JsonObject memObj = new com.google.gson.JsonObject();
            memObj.addProperty("used_mb", memoriaUsadaMb);
            memObj.addProperty("free_mb", memoriaLibreMb);
            memObj.addProperty("total_mb", memoriaTotalMb);

            com.google.gson.JsonObject liveObj = new com.google.gson.JsonObject();
            liveObj.addProperty("status", "UP");
            liveObj.addProperty("timestamp", Instant.now().toString());
            liveObj.addProperty("service", "ddtextil-backend");
            liveObj.addProperty("uptime_ms", tiempoUptimeMs);
            liveObj.add("jvm_memory", memObj);
            enviarRespuestaJson(intercambio, 200, liveObj.toString());
            return;
        }

        // --- READINESS PROBE: /health/ready y REPORTE CONSOLIDADO: /api/health ---
        boolean baseDatosOperativa = false;
        String detalleErrorBd = null;
        try (Connection conexion = Conexion.obtenerConexion()) {
            if (conexion != null && conexion.isValid(2)) {
                baseDatosOperativa = true;
            } else {
                detalleErrorBd = "Base de datos no disponible";
            }
        } catch (Exception ex) {
            System.err.println("[SALUD] Error de conexión a PostgreSQL: " + ex.getMessage());
            detalleErrorBd = "Base de datos no disponible";
        }

        int codigoHttp = baseDatosOperativa ? 200 : 503;
        String estadoGlobal = baseDatosOperativa ? "UP" : "DOWN";

        com.google.gson.JsonObject checkJvm = new com.google.gson.JsonObject();
        checkJvm.addProperty("name", "jvm_process");
        checkJvm.addProperty("status", "UP");
        checkJvm.addProperty("uptime_ms", tiempoUptimeMs);

        com.google.gson.JsonObject checkDb = new com.google.gson.JsonObject();
        checkDb.addProperty("name", "postgresql_database");
        checkDb.addProperty("status", baseDatosOperativa ? "UP" : "DOWN");
        if (detalleErrorBd != null) {
            checkDb.addProperty("error", detalleErrorBd);
        }

        com.google.gson.JsonArray checks = new com.google.gson.JsonArray();
        checks.add(checkJvm);
        checks.add(checkDb);

        com.google.gson.JsonObject respObj = new com.google.gson.JsonObject();
        respObj.addProperty("status", estadoGlobal);
        respObj.addProperty("timestamp", Instant.now().toString());
        respObj.addProperty("service", "ddtextil-backend");
        respObj.add("checks", checks);

        enviarRespuestaJson(intercambio, codigoHttp, respObj.toString());
    }
}
