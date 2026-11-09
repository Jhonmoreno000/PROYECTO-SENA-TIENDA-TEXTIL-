package infraestructura.api.manejadores;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.sun.net.httpserver.HttpExchange;
import dominio.modelos.Resena;
import infraestructura.persistencia.jdbc.ResenasDAO;
import java.nio.charset.StandardCharsets;
import java.util.List;

/**
 * Controlador HTTP para la gestión de reseñas y calificaciones de productos.
 * Opera sobre las rutas `/api/reviews` y `/api/resenas`.
 */
public class ManejadorResenas extends ManejadorBase {

    /**
     * Enruta las solicitudes `GET` y `POST` para listar o registrar reseñas de un producto.
     *
     * @param intercambio Contexto de la petición HTTP (`HttpExchange`).
     * @throws Exception Si ocurre un error durante el procesamiento.
     */
    @Override
    protected void procesarPeticion(HttpExchange intercambio) throws Exception {
        String metodo = intercambio.getRequestMethod();
        ResenasDAO resenasDAO = new ResenasDAO();
        Gson gson = new Gson();

        if ("GET".equalsIgnoreCase(metodo)) {
            manejarGet(intercambio, resenasDAO, gson);
        } else if ("POST".equalsIgnoreCase(metodo)) {
            manejarPost(intercambio, resenasDAO);
        } else {
            enviarRespuestaJson(intercambio, 405, "{\"error\":\"Método no permitido\"}");
        }
    }

    /**
     * Lista las reseñas asociadas a un producto específico según el parámetro `productId` o `idProducto`.
     *
     * @param intercambio Contexto HTTP (`HttpExchange`).
     * @param dao         Instancia de `ResenasDAO`.
     * @param gson        Serializador JSON (`Gson`).
     * @throws Exception Si falla la consulta o envío de respuesta.
     */
    private void manejarGet(HttpExchange intercambio, ResenasDAO dao, Gson gson) throws Exception {
        int idProducto = obtenerParametroConsultaEntero(intercambio, "productId", -1);
        if (idProducto <= 0) {
            idProducto = obtenerParametroConsultaEntero(intercambio, "idProducto", -1);
        }

        if (idProducto <= 0) {
            enviarRespuestaJson(intercambio, 400, "{\"error\":\"Falta el parámetro productId o idProducto válido\"}");
            return;
        }

        List<Resena> resenas = dao.obtenerResenasPorProducto(idProducto);
        enviarRespuestaJson(intercambio, 200, gson.toJson(resenas));
    }

    /**
     * Valida y registra una nueva reseña verificando rango de estrellas y unicidad por usuario/producto.
     *
     * @param intercambio Contexto HTTP (`HttpExchange`).
     * @param dao         Instancia de `ResenasDAO`.
     * @throws Exception Si falla la lectura o inserción.
     */
    private void manejarPost(HttpExchange intercambio, ResenasDAO dao) throws Exception {
        String cuerpo = new String(leerCuerpoSeguro(intercambio), StandardCharsets.UTF_8);

        JsonObject json;
        try {
            json = JsonParser.parseString(cuerpo).getAsJsonObject();
        } catch (Exception e) {
            enviarRespuestaJson(intercambio, 400, "{\"error\":\"JSON inválido\"}");
            return;
        }

        boolean tieneProducto = json.has("productId") || json.has("idProducto");
        boolean tieneUsuario = json.has("userId") || json.has("idUsuario");
        boolean tieneCalificacion = json.has("rating") || json.has("calificacion");
        boolean tieneComentario = json.has("comment") || json.has("comentario");

        if (!tieneProducto || !tieneUsuario || !tieneCalificacion || !tieneComentario) {
            enviarRespuestaJson(intercambio, 400, "{\"error\":\"Faltan campos: productId/idProducto, userId/idUsuario, rating/calificacion, comment/comentario\"}");
            return;
        }

        int idProducto = json.has("productId") ? json.get("productId").getAsInt() : json.get("idProducto").getAsInt();
        int idUsuario = json.has("userId") ? json.get("userId").getAsInt() : json.get("idUsuario").getAsInt();
        int calificacion = json.has("rating") ? json.get("rating").getAsInt() : json.get("calificacion").getAsInt();
        String comentario = json.has("comment") ? json.get("comment").getAsString().trim() : json.get("comentario").getAsString().trim();

        if (calificacion < 1 || calificacion > 5) {
            enviarRespuestaJson(intercambio, 400, "{\"error\":\"La calificación debe estar entre 1 y 5 estrellas\"}");
            return;
        }

        if (comentario.isEmpty()) {
            enviarRespuestaJson(intercambio, 400, "{\"error\":\"El comentario no puede estar vacío\"}");
            return;
        }

        if (dao.usuarioYaReseno(idProducto, idUsuario)) {
            enviarRespuestaJson(intercambio, 409, "{\"error\":\"Ya has reseñado este producto\"}");
            return;
        }

        Resena resena = new Resena();
        resena.setIdProducto(idProducto);
        resena.setIdUsuario(idUsuario);
        resena.setCalificacion(calificacion);
        resena.setComentario(comentario);

        boolean exito = dao.agregarResena(resena);
        if (exito) {
            enviarRespuestaJson(intercambio, 201, "{\"success\":true,\"id\":" + resena.getId() + "}");
        } else {
            enviarRespuestaJson(intercambio, 500, "{\"error\":\"No se pudo guardar la reseña\"}");
        }
    }
}
