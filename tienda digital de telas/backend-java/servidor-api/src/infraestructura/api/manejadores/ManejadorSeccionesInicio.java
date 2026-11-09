package infraestructura.api.manejadores;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.sun.net.httpserver.HttpExchange;
import dominio.modelos.SeccionInicio;
import infraestructura.persistencia.jdbc.SeccionesInicioDAO;
import java.nio.charset.StandardCharsets;
import java.util.List;

/**
 * Controlador HTTP para la gestión de las secciones promocionales de la página de inicio.
 * Rutas soportadas: `/api/home-sections` y `/api/secciones-inicio`.
 */
public class ManejadorSeccionesInicio extends ManejadorBase {

    /**
     * Enruta las solicitudes `GET` y `PUT` para consultar o modificar secciones de la portada.
     *
     * @param intercambio Contexto de la petición HTTP (`HttpExchange`).
     * @throws Exception Si ocurre un error durante el procesamiento.
     */
    @Override
    protected void procesarPeticion(HttpExchange intercambio) throws Exception {
        String metodo = intercambio.getRequestMethod();
        String ruta = intercambio.getRequestURI().getPath();
        SeccionesInicioDAO dao = new SeccionesInicioDAO();
        Gson gson = new Gson();

        if ("GET".equals(metodo)) {
            manejarGet(intercambio, dao, gson);
        } else if ("PUT".equals(metodo)) {
            manejarPut(intercambio, ruta, dao);
        } else {
            enviarRespuestaJson(intercambio, 405, "{\"error\":\"Método no permitido\"}");
        }
    }

    /**
     * Lista las secciones activas o la totalidad de secciones configuradas en PostgreSQL.
     *
     * @param intercambio Contexto HTTP (`HttpExchange`).
     * @param dao         Instancia de `SeccionesInicioDAO`.
     * @param gson        Serializador JSON (`Gson`).
     * @throws Exception Si falla el envío de la respuesta.
     */
    private void manejarGet(HttpExchange intercambio, SeccionesInicioDAO dao, Gson gson) throws Exception {
        List<SeccionInicio> secciones;
        String ruta = intercambio.getRequestURI().getPath();
        if (ruta.endsWith("/active") || ruta.endsWith("/activas")) {
            secciones = dao.obtenerSeccionesActivas();
        } else {
            secciones = dao.obtenerTodasLasSecciones();
        }
        enviarRespuestaJson(intercambio, 200, gson.toJson(secciones));
    }

    /**
     * Actualiza selectivamente los atributos de una sección de inicio identificada por su clave en la ruta.
     *
     * @param intercambio Contexto HTTP (`HttpExchange`).
     * @param ruta        Ruta URI solicitada (`String`).
     * @param dao         Instancia de `SeccionesInicioDAO`.
     * @throws Exception Si ocurre un error procesando la actualización.
     */
    private void manejarPut(HttpExchange intercambio, String ruta, SeccionesInicioDAO dao) throws Exception {
        if (!ruta.matches("^/api/(home-sections|secciones-inicio)/[a-zA-Z0-9_-]+$")) {
            enviarRespuestaJson(intercambio, 404, "{\"error\":\"Ruta no encontrada\"}");
            return;
        }
        String clave = ruta.split("/")[3];
        String cuerpo = new String(leerCuerpoSeguro(intercambio), StandardCharsets.UTF_8);

        JsonObject json;
        try {
            json = JsonParser.parseString(cuerpo).getAsJsonObject();
        } catch (Exception e) {
            enviarRespuestaJson(intercambio, 400, "{\"error\":\"JSON inválido\"}");
            return;
        }

        SeccionInicio actualizaciones = new Gson().fromJson(json, SeccionInicio.class);
        Boolean activa = json.has("active") && !json.get("active").isJsonNull() ? json.get("active").getAsBoolean()
                       : (json.has("activa") && !json.get("activa").isJsonNull() ? json.get("activa").getAsBoolean() : null);
        boolean exito = dao.actualizarSeccion(clave, actualizaciones, activa);
        enviarRespuestaJson(intercambio, exito ? 200 : 500, exito ? "{\"success\":true}" : "{\"error\":\"No se pudo actualizar la sección\"}");
    }
}
