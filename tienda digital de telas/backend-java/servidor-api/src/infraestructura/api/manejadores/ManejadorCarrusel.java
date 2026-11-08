package infraestructura.api.manejadores;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.sun.net.httpserver.HttpExchange;
import dominio.modelos.DiapositivaCarrusel;
import infraestructura.persistencia.jdbc.CarruselDAO;
import java.nio.charset.StandardCharsets;
import java.util.List;

/**
 * Controlador HTTP para la gestión de las diapositivas del carrusel de la página principal.
 */
public class ManejadorCarrusel extends ManejadorBase {

    /**
     * Enruta las peticiones `GET`, `POST`, `PUT` y `DELETE` sobre `/api/carrusel` y `/api/carousel`.
     *
     * @param intercambio Contexto de la petición HTTP (`HttpExchange`).
     * @throws Exception Si ocurre un error durante el procesamiento.
     */
    @Override
    protected void procesarPeticion(HttpExchange intercambio) throws Exception {
        String metodo = intercambio.getRequestMethod();
        String ruta = intercambio.getRequestURI().getPath();
        CarruselDAO dao = new CarruselDAO();
        Gson gson = new Gson();

        if ("GET".equals(metodo)) {
            manejarGet(intercambio, dao, gson);
        } else if ("POST".equals(metodo)) {
            manejarPost(intercambio, dao);
        } else if ("PUT".equals(metodo)) {
            manejarPut(intercambio, ruta, dao);
        } else if ("DELETE".equals(metodo)) {
            manejarDelete(intercambio, ruta, dao);
        } else {
            enviarRespuestaJson(intercambio, 405, "{\"error\":\"Método no permitido\"}");
        }
    }

    /**
     * Lista las diapositivas activas o la totalidad de diapositivas si la ruta termina en `/all` o `/todos`.
     *
     * @param intercambio Contexto HTTP (`HttpExchange`).
     * @param dao         Instancia de `CarruselDAO`.
     * @param gson        Serializador JSON (`Gson`).
     * @throws Exception Si falla la respuesta HTTP.
     */
    private void manejarGet(HttpExchange intercambio, CarruselDAO dao, Gson gson) throws Exception {
        List<DiapositivaCarrusel> diapositivas;
        String ruta = intercambio.getRequestURI().getPath();
        if (ruta.endsWith("/all") || ruta.endsWith("/todos")) {
            diapositivas = dao.obtenerTodasLasDiapositivas();
        } else {
            diapositivas = dao.obtenerDiapositivasActivas();
        }
        enviarRespuestaJson(intercambio, 200, gson.toJson(diapositivas));
    }

    /**
     * Crea una nueva diapositiva en PostgreSQL y devuelve su identificador generado.
     *
     * @param intercambio Contexto HTTP (`HttpExchange`).
     * @param dao         Instancia de `CarruselDAO`.
     * @throws Exception Si falla la lectura o escritura HTTP.
     */
    private void manejarPost(HttpExchange intercambio, CarruselDAO dao) throws Exception {
        String cuerpo = new String(leerCuerpoSeguro(intercambio), StandardCharsets.UTF_8);

        JsonObject json;
        try {
            json = JsonParser.parseString(cuerpo).getAsJsonObject();
        } catch (Exception e) {
            enviarRespuestaJson(intercambio, 400, "{\"error\":\"JSON inválido\"}");
            return;
        }

        String titulo = json.has("title") && !json.get("title").isJsonNull() ? json.get("title").getAsString()
                      : (json.has("titulo") && !json.get("titulo").isJsonNull() ? json.get("titulo").getAsString() : null);

        if (titulo == null || titulo.isBlank()) {
            enviarRespuestaJson(intercambio, 400, "{\"error\":\"Falta el campo title / titulo\"}");
            return;
        }

        DiapositivaCarrusel diapositiva = new DiapositivaCarrusel();
        diapositiva.setTitulo(titulo);
        diapositiva.setSubtitulo(json.has("subtitle") && !json.get("subtitle").isJsonNull() ? json.get("subtitle").getAsString()
                               : (json.has("subtitulo") && !json.get("subtitulo").isJsonNull() ? json.get("subtitulo").getAsString() : null));
        diapositiva.setImagen(json.has("image") && !json.get("image").isJsonNull() ? json.get("image").getAsString()
                            : (json.has("imagen") && !json.get("imagen").isJsonNull() ? json.get("imagen").getAsString() : null));
        diapositiva.setTextoBoton(json.has("cta") && !json.get("cta").isJsonNull() ? json.get("cta").getAsString()
                                : (json.has("textoBoton") && !json.get("textoBoton").isJsonNull() ? json.get("textoBoton").getAsString() : null));
        diapositiva.setClaveSeccion(json.has("sectionKey") && !json.get("sectionKey").isJsonNull() ? json.get("sectionKey").getAsString()
                                  : (json.has("claveSeccion") && !json.get("claveSeccion").isJsonNull() ? json.get("claveSeccion").getAsString() : null));
        diapositiva.setActivo(!json.has("active") || json.get("active").getAsBoolean());
        diapositiva.setOrden(json.has("sortOrder") && !json.get("sortOrder").isJsonNull() ? json.get("sortOrder").getAsInt()
                           : (json.has("orden") && !json.get("orden").isJsonNull() ? json.get("orden").getAsInt() : 0));

        boolean exito = dao.agregarDiapositiva(diapositiva);
        enviarRespuestaJson(intercambio, exito ? 201 : 500,
                exito ? "{\"success\":true,\"id\":" + diapositiva.getId() + "}" : "{\"error\":\"No se pudo guardar la diapositiva\"}");
    }

    /**
     * Actualiza selectivamente los datos de una diapositiva existente por su identificador en la ruta.
     *
     * @param intercambio Contexto HTTP (`HttpExchange`).
     * @param ruta        Ruta URI solicitada (`String`).
     * @param dao         Instancia de `CarruselDAO`.
     * @throws Exception Si falla el procesamiento HTTP.
     */
    private void manejarPut(HttpExchange intercambio, String ruta, CarruselDAO dao) throws Exception {
        if (!ruta.matches("^/api/(carousel|carrusel)/\\d+$")) {
            enviarRespuestaJson(intercambio, 404, "{\"error\":\"Ruta no encontrada\"}");
            return;
        }
        int idDiapositiva = Integer.parseInt(ruta.split("/")[3]);
        String cuerpo = new String(leerCuerpoSeguro(intercambio), StandardCharsets.UTF_8);

        JsonObject json;
        try {
            json = JsonParser.parseString(cuerpo).getAsJsonObject();
        } catch (Exception e) {
            enviarRespuestaJson(intercambio, 400, "{\"error\":\"JSON inválido\"}");
            return;
        }

        DiapositivaCarrusel actualizaciones = new Gson().fromJson(json, DiapositivaCarrusel.class);
        Boolean activo = json.has("active") && !json.get("active").isJsonNull() ? json.get("active").getAsBoolean()
                       : (json.has("activo") && !json.get("activo").isJsonNull() ? json.get("activo").getAsBoolean() : null);
        boolean exito = dao.actualizarDiapositiva(idDiapositiva, actualizaciones, activo);
        enviarRespuestaJson(intercambio, exito ? 200 : 500, exito ? "{\"success\":true}" : "{\"error\":\"No se pudo actualizar\"}");
    }

    /**
     * Elimina una diapositiva del carrusel por su identificador en la ruta.
     *
     * @param intercambio Contexto HTTP (`HttpExchange`).
     * @param ruta        Ruta URI solicitada (`String`).
     * @param dao         Instancia de `CarruselDAO`.
     * @throws Exception Si falla la respuesta HTTP.
     */
    private void manejarDelete(HttpExchange intercambio, String ruta, CarruselDAO dao) throws Exception {
        if (!ruta.matches("^/api/(carousel|carrusel)/\\d+$")) {
            enviarRespuestaJson(intercambio, 404, "{\"error\":\"Ruta no encontrada\"}");
            return;
        }
        int idDiapositiva = Integer.parseInt(ruta.split("/")[3]);
        boolean exito = dao.eliminarDiapositiva(idDiapositiva);
        enviarRespuestaJson(intercambio, exito ? 200 : 500, exito ? "{\"success\":true}" : "{\"error\":\"No se pudo eliminar\"}");
    }
}
