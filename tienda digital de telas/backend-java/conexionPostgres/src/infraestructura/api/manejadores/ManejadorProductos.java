package infraestructura.api.manejadores;

import infraestructura.persistencia.jdbc.ProductoDAO;
import dominio.modelos.Producto;
import com.sun.net.httpserver.HttpExchange;
import com.google.gson.Gson;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.List;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

/**
 * Controlador para la gestión de productos (CRUD + moderación + imágenes).
 */
public class ManejadorProductos extends ManejadorBase {

    @Override
    protected void procesarPeticion(HttpExchange intercambio) throws Exception {
        String metodo = intercambio.getRequestMethod();
        String ruta = intercambio.getRequestURI().getPath();
        ProductoDAO dao = new ProductoDAO();
        Gson gson = new Gson();

        if ("GET".equals(metodo)) {
            manejarGet(intercambio, ruta, dao, gson);
        } else if ("PUT".equals(metodo)) {
            manejarPut(intercambio, ruta, dao, gson);
        } else if ("POST".equals(metodo)) {
            manejarPost(intercambio, dao, gson);
        } else if ("DELETE".equals(metodo)) {
            manejarDelete(intercambio, ruta, dao, gson);
        } else {
            enviarRespuestaJson(intercambio, 405, "{\"error\":\"Método no permitido\"}");
        }
    }

    private void manejarGet(HttpExchange intercambio, String ruta, ProductoDAO dao, Gson gson) throws Exception {
        List<Producto> productos;
        int idVendedor = obtenerParametroConsultaEntero(intercambio, "sellerId", -1);
        if (idVendedor <= 0) {
            idVendedor = obtenerParametroConsultaEntero(intercambio, "idVendedor", -1);
        }

        String seccion = obtenerParametroConsulta(intercambio, "section");
        if (seccion == null) {
            seccion = obtenerParametroConsulta(intercambio, "seccion");
        }

        if (ruta.endsWith("/pending") || ruta.endsWith("/pendientes")) {
            productos = dao.obtenerProductosPendientes();
        } else if (idVendedor > 0) {
            productos = dao.obtenerProductosPorVendedor(idVendedor);
        } else if (seccion != null && !seccion.isBlank()) {
            productos = dao.obtenerProductosPorSeccion(seccion);
        } else {
            productos = dao.obtenerTodosLosProductos();
        }
        enviarRespuestaJson(intercambio, 200, gson.toJson(productos));
    }

    private void manejarPut(HttpExchange intercambio, String ruta, ProductoDAO dao, Gson gson) throws Exception {
        if (ruta.contains("/moderate") || ruta.contains("/moderar")) {
            String[] partes = ruta.split("/");
            int idProducto = Integer.parseInt(partes[3]);
            InputStream entrada = intercambio.getRequestBody();
            String cuerpo = new String(entrada.readAllBytes(), StandardCharsets.UTF_8);
            JsonObject json = JsonParser.parseString(cuerpo).getAsJsonObject();
            String estado = json.has("status") ? json.get("status").getAsString() : json.get("estado").getAsString();
            String motivo = json.has("reason") ? json.get("reason").getAsString()
                          : (json.has("motivo") ? json.get("motivo").getAsString() : null);
            boolean exito = dao.actualizarEstadoModeracion(idProducto, estado, motivo);
            enviarRespuestaJson(intercambio, exito ? 200 : 500, exito ? "{\"success\":true}" : "{\"error\":\"Error en moderación\"}");

        } else if (ruta.matches("^/api/producto?s?/\\d+$")) {
            String[] partes = ruta.split("/");
            int idProducto = Integer.parseInt(partes[3]);
            InputStream entrada = intercambio.getRequestBody();
            String cuerpo = new String(entrada.readAllBytes(), StandardCharsets.UTF_8);
            JsonObject json = JsonParser.parseString(cuerpo).getAsJsonObject();
            Producto actualizaciones = gson.fromJson(json, Producto.class);
            Boolean destacado = json.has("featured") ? json.get("featured").getAsBoolean()
                              : (json.has("destacado") ? json.get("destacado").getAsBoolean() : null);
            boolean exito = dao.actualizarProducto(idProducto, actualizaciones, destacado);
            enviarRespuestaJson(intercambio, exito ? 200 : 500, exito ? "{\"success\":true}" : "{\"error\":\"Error al actualizar\"}");

        } else if (ruta.matches("^/api/producto?s?/\\d+/image$") || ruta.matches("^/api/producto?s?/\\d+/imagen$")) {
            String[] partes = ruta.split("/");
            int idProducto = Integer.parseInt(partes[3]);
            InputStream entrada = intercambio.getRequestBody();
            String cuerpo = new String(entrada.readAllBytes(), StandardCharsets.UTF_8);
            JsonObject json = JsonParser.parseString(cuerpo).getAsJsonObject();
            String imagenBase64 = json.has("image") ? json.get("image").getAsString() : json.get("imagen").getAsString();
            String urlGuardada = dao.guardarImagenProducto(idProducto, imagenBase64);

            if (urlGuardada != null) {
                enviarRespuestaJson(intercambio, 200, "{\"url\": \"" + urlGuardada + "\"}");
            } else {
                enviarRespuestaJson(intercambio, 500, "{\"error\":\"Error al guardar imagen\"}");
            }
        } else {
            enviarRespuestaJson(intercambio, 404, "{\"error\":\"Ruta no encontrada\"}");
        }
    }

    private void manejarPost(HttpExchange intercambio, ProductoDAO dao, Gson gson) throws Exception {
        InputStream entrada = intercambio.getRequestBody();
        String cuerpo = new String(entrada.readAllBytes(), StandardCharsets.UTF_8);
        Producto nuevoProducto = gson.fromJson(cuerpo, Producto.class);
        boolean exito = dao.agregarProducto(nuevoProducto);
        enviarRespuestaJson(intercambio, exito ? 201 : 500, exito ? "{\"success\":true}" : "{\"error\":\"Error al insertar producto\"}");
    }

    private void manejarDelete(HttpExchange intercambio, String ruta, ProductoDAO dao, Gson gson) throws Exception {
        if (ruta.matches("^/api/producto?s?/\\d+$")) {
            String[] partes = ruta.split("/");
            int idProducto = Integer.parseInt(partes[3]);
            boolean exito = dao.eliminarProducto(idProducto);
            enviarRespuestaJson(intercambio, exito ? 200 : 500, exito ? "{\"success\":true}" : "{\"error\":\"Error al eliminar producto\"}");
        } else {
            enviarRespuestaJson(intercambio, 404, "{\"error\":\"Ruta no encontrada\"}");
        }
    }
}
