package infraestructura.api.manejadores;

import infraestructura.persistencia.jdbc.ResenasDAO;
import dominio.modelos.Resena;
import com.sun.net.httpserver.HttpExchange;
import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.List;

/**
 * Manejador para la gestión de reseñas de productos.
 * Opera sobre las rutas /api/reviews y /api/resenas.
 * Maneja GET (listar reseñas de un producto) y POST (crear una reseña).
 */
public class ManejadorResenas extends ManejadorBase {

    /**
     * Enruta la solicitud según el método HTTP al método privado correspondiente.
     */
    @Override
    protected void procesarPeticion(HttpExchange intercambio) throws Exception {
        String metodo = intercambio.getRequestMethod();
        ResenasDAO resenasDAO = new ResenasDAO();
        Gson gson = new Gson();

        if ("GET".equalsIgnoreCase(metodo)) {
            manejarGet(intercambio, resenasDAO, gson);
        } else if ("POST".equalsIgnoreCase(metodo)) {
            manejarPost(intercambio, resenasDAO, gson);
        } else {
            enviarRespuestaJson(intercambio, 405, "{\"error\":\"Método no permitido\"}");
        }
    }

    /**
     * GET /api/reviews?productId=N o /api/resenas?idProducto=N — Lista las reseñas de un producto.
     */
    private void manejarGet(HttpExchange intercambio, ResenasDAO dao, Gson gson) throws Exception {
        String parametrosConsulta = intercambio.getRequestURI().getQuery();
        if (parametrosConsulta == null || (!parametrosConsulta.contains("productId=") && !parametrosConsulta.contains("idProducto="))) {
            enviarRespuestaJson(intercambio, 400, "{\"error\":\"Falta el parámetro productId o idProducto\"}");
            return;
        }

        int idProducto;
        try {
            if (parametrosConsulta.contains("productId=")) {
                idProducto = Integer.parseInt(parametrosConsulta.split("productId=")[1].split("&")[0]);
            } else {
                idProducto = Integer.parseInt(parametrosConsulta.split("idProducto=")[1].split("&")[0]);
            }
        } catch (NumberFormatException e) {
            enviarRespuestaJson(intercambio, 400, "{\"error\":\"Identificador de producto inválido\"}");
            return;
        }

        List<Resena> resenas = dao.obtenerResenasPorProducto(idProducto);
        enviarRespuestaJson(intercambio, 200, gson.toJson(resenas));
    }

    /**
     * POST /api/reviews — Crea una nueva reseña.
     * Cuerpo esperado: { "productId": 1, "userId": 2, "rating": 5, "comment": "..." }
     */
    private void manejarPost(HttpExchange intercambio, ResenasDAO dao, Gson gson) throws Exception {
        InputStream flujoEntrada = intercambio.getRequestBody();
        String cuerpo = new String(flujoEntrada.readAllBytes(), StandardCharsets.UTF_8);

        JsonObject json;
        try {
            json = JsonParser.parseString(cuerpo).getAsJsonObject();
        } catch (Exception e) {
            enviarRespuestaJson(intercambio, 400, "{\"error\":\"JSON inválido\"}");
            return;
        }

        // Valida presencia de campos (en inglés o español)
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

        // La calificación debe estar entre 1 y 5 estrellas
        if (calificacion < 1 || calificacion > 5) {
            enviarRespuestaJson(intercambio, 400, "{\"error\":\"La calificación debe estar entre 1 y 5 estrellas\"}");
            return;
        }

        // El comentario no puede estar vacío
        if (comentario.isEmpty()) {
            enviarRespuestaJson(intercambio, 400, "{\"error\":\"El comentario no puede estar vacío\"}");
            return;
        }

        // Un mismo usuario no puede reseñar dos veces el mismo producto
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
            enviarRespuestaJson(intercambio, 201, "{\"success\":true}");
        } else {
            enviarRespuestaJson(intercambio, 500, "{\"error\":\"No se pudo guardar la reseña\"}");
        }
    }
}
