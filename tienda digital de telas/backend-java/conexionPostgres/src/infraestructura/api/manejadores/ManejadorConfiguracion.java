package infraestructura.api.manejadores;

import com.sun.net.httpserver.HttpExchange;
import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import infraestructura.persistencia.jdbc.ConfiguracionDAO;

/**
 * Manejador para la configuración global del sistema (pares clave-valor).
 * Rutas base: /api/config y /api/configuracion
 * Permite leer y escribir valores de configuración persistidos en la base de datos.
 * Soporta:
 * - GET /api/config → Obtiene todas las configuraciones.
 * - GET /api/config/{key} → Obtiene el valor de una clave específica.
 * - POST /api/config → Crea o actualiza un par clave-valor.
 */
public class ManejadorConfiguracion extends ManejadorBase {
    private final ConfiguracionDAO configuracionDAO = new ConfiguracionDAO();
    private final Gson gson = new Gson();

    /**
     * Enruta la solicitud según el método HTTP.
     */
    @Override
    protected void procesarPeticion(HttpExchange intercambio) throws Exception {
        String metodo = intercambio.getRequestMethod();

        // GET — Recupera configuraciones
        if ("GET".equalsIgnoreCase(metodo)) {
            String ruta = intercambio.getRequestURI().getPath();
            if (ruta.equals("/api/config") || ruta.equals("/api/configuracion")) {
                Map<String, String> configuraciones = configuracionDAO.obtenerTodaLaConfiguracion();
                enviarRespuestaJson(intercambio, 200, gson.toJson(configuraciones));
            } else {
                String clave = ruta.substring(ruta.lastIndexOf("/") + 1);
                String valor = configuracionDAO.obtenerConfiguracion(clave);
                if (valor != null) {
                    enviarRespuestaJson(intercambio, 200, valor);
                } else {
                    enviarRespuestaJson(intercambio, 404, "{}");
                }
            }

        // POST — Crea o actualiza una configuración (key/value o clave/valor en el cuerpo)
        } else if ("POST".equalsIgnoreCase(metodo)) {
            InputStream flujoEntrada = intercambio.getRequestBody();
            String cuerpo = new String(flujoEntrada.readAllBytes(), StandardCharsets.UTF_8);
            JsonObject json = JsonParser.parseString(cuerpo).getAsJsonObject();
            
            String clave = json.has("key") ? json.get("key").getAsString() : json.get("clave").getAsString();
            String valor = json.has("value") ? json.get("value").getAsString() : json.get("valor").getAsString();

            if (configuracionDAO.guardarConfiguracion(clave, valor)) {
                enviarRespuestaJson(intercambio, 200, "{\"success\":true}");
            } else {
                enviarRespuestaJson(intercambio, 500, "{\"error\":\"Error guardando configuración\"}");
            }
        } else {
            enviarRespuestaJson(intercambio, 405, "{\"error\":\"Método no permitido\"}");
        }
    }
}
