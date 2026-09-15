package infraestructura.api.manejadores;

import infraestructura.persistencia.jdbc.ProductoDAO;
import com.sun.net.httpserver.HttpExchange;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;

/**
 * Manejador dedicado exclusivamente a la subida de imágenes de productos.
 * Ruta esperada: /api/products/{id}/image o /api/productos/{id}/imagen
 * Solo acepta método PUT con una imagen codificada en base64 en el cuerpo JSON.
 */
public class ManejadorImagenProducto extends ManejadorBase {

    /**
     * PUT /api/products/{id}/image — Guarda una imagen base64 para un producto.
     * El cuerpo JSON debe contener el campo "image" con la cadena base64.
     * Retorna la URL pública de la imagen guardada.
     */
    @Override
    protected void procesarPeticion(HttpExchange intercambio) throws Exception {
        // Solo acepta método PUT
        if (!"PUT".equalsIgnoreCase(intercambio.getRequestMethod())) {
            enviarRespuestaJson(intercambio, 405, "{\"error\":\"Método no permitido\"}");
            return;
        }

        // Extrae el ID del producto desde la ruta (/api/products/{id}/image o /api/productos/{id}/imagen)
        String ruta = intercambio.getRequestURI().getPath();
        String[] partes = ruta.split("/");
        int idProducto = Integer.parseInt(partes[3]);

        // Lee el cuerpo de la solicitud y extrae la imagen base64
        InputStream flujoEntrada = intercambio.getRequestBody();
        String cuerpo = new String(flujoEntrada.readAllBytes(), StandardCharsets.UTF_8);
        JsonObject json = JsonParser.parseString(cuerpo).getAsJsonObject();
        
        String imagenBase64 = null;
        if (json.has("image")) {
            imagenBase64 = json.get("image").getAsString();
        } else if (json.has("imagen")) {
            imagenBase64 = json.get("imagen").getAsString();
        }

        if (imagenBase64 == null) {
            enviarRespuestaJson(intercambio, 400, "{\"error\":\"Falta el campo 'image' o 'imagen'\"}");
            return;
        }

        // Guarda la imagen y devuelve la URL generada
        ProductoDAO productoDAO = new ProductoDAO();
        String urlGuardada = productoDAO.guardarImagenProducto(idProducto, imagenBase64);

        if (urlGuardada != null) {
            enviarRespuestaJson(intercambio, 200, "{\"url\": \"" + urlGuardada + "\"}");
        } else {
            enviarRespuestaJson(intercambio, 500, "{\"error\": \"Error al guardar la imagen\"}");
        }
    }
}
