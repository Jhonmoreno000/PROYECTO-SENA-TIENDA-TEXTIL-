package infraestructura.api.manejadores;

import com.sun.net.httpserver.HttpExchange;
import com.google.gson.Gson;
import com.google.gson.JsonElement;
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
            String rutaNormalizada = (ruta.length() > 1 && ruta.endsWith("/")) ? ruta.substring(0, ruta.length() - 1) : ruta;

            if (rutaNormalizada.equals("/api/config") || rutaNormalizada.equals("/api/configuracion")) {
                Map<String, String> configuraciones = configuracionDAO.obtenerTodaLaConfiguracion();
                enviarRespuestaJson(intercambio, 200, gson.toJson(configuraciones));
            } else {
                String clave = rutaNormalizada.substring(rutaNormalizada.lastIndexOf("/") + 1);
                String valor = configuracionDAO.obtenerConfiguracion(clave);
                if (valor != null) {
                    // Si el valor ya es un JSON válido (objeto o arreglo), lo devolvemos tal cual
                    String valorTrim = valor.trim();
                    if ((valorTrim.startsWith("{") && valorTrim.endsWith("}")) ||
                        (valorTrim.startsWith("[") && valorTrim.endsWith("]"))) {
                        enviarRespuestaJson(intercambio, 200, valorTrim);
                    } else {
                        enviarRespuestaJson(intercambio, 200, gson.toJson(valor));
                    }
                } else {
                    enviarRespuestaJson(intercambio, 404, "{}");
                }
            }

        // POST — Crea o actualiza una configuración (key/value o clave/valor en el cuerpo)
        } else if ("POST".equalsIgnoreCase(metodo)) {
            InputStream flujoEntrada = intercambio.getRequestBody();
            String cuerpo = new String(flujoEntrada.readAllBytes(), StandardCharsets.UTF_8);
            JsonObject json;
            try {
                json = JsonParser.parseString(cuerpo).getAsJsonObject();
            } catch (Exception e) {
                enviarRespuestaJson(intercambio, 400, "{\"error\":\"JSON inválido\"}");
                return;
            }

            String clave = null;
            if (json.has("key") && !json.get("key").isJsonNull()) {
                clave = json.get("key").getAsString();
            } else if (json.has("clave") && !json.get("clave").isJsonNull()) {
                clave = json.get("clave").getAsString();
            }

            String valor = null;
            if (json.has("value") && !json.get("value").isJsonNull()) {
                JsonElement elem = json.get("value");
                valor = elem.isJsonPrimitive() ? elem.getAsString() : elem.toString();
            } else if (json.has("valor") && !json.get("valor").isJsonNull()) {
                JsonElement elem = json.get("valor");
                valor = elem.isJsonPrimitive() ? elem.getAsString() : elem.toString();
            }

            if (clave == null || valor == null) {
                enviarRespuestaJson(intercambio, 400, "{\"error\":\"Faltan campos requeridos: key/clave o value/valor\"}");
                return;
            }

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
