package infraestructura.api.manejadores;

import infraestructura.persistencia.jdbc.SeccionesInicioDAO;
import dominio.modelos.SeccionInicio;
import com.sun.net.httpserver.HttpExchange;
import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.List;

/**
 * Controlador para la gestión de las secciones del inicio.
 */
public class ManejadorSeccionesInicio extends ManejadorBase {

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

    private void manejarPut(HttpExchange intercambio, String ruta, SeccionesInicioDAO dao) throws Exception {
        if (!ruta.matches("^/api/(home-sections|secciones-inicio)/[a-zA-Z0-9_-]+$")) {
            enviarRespuestaJson(intercambio, 404, "{\"error\":\"Ruta no encontrada\"}");
            return;
        }
        String clave = ruta.split("/")[3];
        InputStream entrada = intercambio.getRequestBody();
        String cuerpo = new String(entrada.readAllBytes(), StandardCharsets.UTF_8);

        JsonObject json;
        try {
            json = JsonParser.parseString(cuerpo).getAsJsonObject();
        } catch (Exception e) {
            enviarRespuestaJson(intercambio, 400, "{\"error\":\"JSON inválido\"}");
            return;
        }

        SeccionInicio actualizaciones = new Gson().fromJson(json, SeccionInicio.class);
        Boolean activa = json.has("active") ? json.get("active").getAsBoolean()
                       : (json.has("activa") ? json.get("activa").getAsBoolean() : null);
        boolean exito = dao.actualizarSeccion(clave, actualizaciones, activa);
        enviarRespuestaJson(intercambio, exito ? 200 : 500, exito ? "{\"success\":true}" : "{\"error\":\"No se pudo actualizar la sección\"}");
    }
}
