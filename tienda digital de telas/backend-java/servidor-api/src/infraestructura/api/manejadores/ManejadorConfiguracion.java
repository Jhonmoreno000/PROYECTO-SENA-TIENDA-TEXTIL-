package infraestructura.api.manejadores;

import com.google.gson.Gson;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.sun.net.httpserver.HttpExchange;
import infraestructura.persistencia.jdbc.ConfiguracionDAO;
import java.nio.charset.StandardCharsets;
import java.util.Map;

/**
 * Controlador HTTP para la configuración global del sistema (pares clave-valor) en PostgreSQL.
 * Rutas soportadas: `/api/config` y `/api/configuracion`.
 */
public class ManejadorConfiguracion extends ManejadorBase {
    /** Objeto de acceso a datos de configuración (`ConfiguracionDAO`). */
    private final ConfiguracionDAO configuracionDAO = new ConfiguracionDAO();
    /** Serializador JSON (`Gson`). */
    private final Gson gson = new Gson();

    /**
     * Enruta las peticiones `GET` y `POST` para consultar o persistir pares clave-valor de configuración.
     *
     * @param intercambio Contexto de la petición HTTP (`HttpExchange`).
     * @throws Exception Si ocurre un error procesando la solicitud.
     */
    @Override
    protected void procesarPeticion(HttpExchange intercambio) throws Exception {
        String metodo = intercambio.getRequestMethod();

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
                    String valorTrim = valor.trim();
                    if ((valorTrim.startsWith("{") && valorTrim.endsWith("}")) ||
                        (valorTrim.startsWith("[") && valorTrim.endsWith("]"))) {
                        enviarRespuestaJson(intercambio, 200, valorTrim);
                    } else {
                        enviarRespuestaJson(intercambio, 200, gson.toJson(valor));
                    }
                } else {
                    enviarRespuestaJson(intercambio, 200, "{}");
                }
            }

        } else if ("POST".equalsIgnoreCase(metodo) || "PUT".equalsIgnoreCase(metodo)) {
            String cuerpo = new String(leerCuerpoSeguro(intercambio), StandardCharsets.UTF_8);
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
