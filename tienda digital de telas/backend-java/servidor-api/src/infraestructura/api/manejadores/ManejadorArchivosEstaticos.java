package infraestructura.api.manejadores;

import com.sun.net.httpserver.HttpExchange;
import java.io.File;
import java.io.FileInputStream;
import java.io.OutputStream;
import java.nio.file.Files;

/**
 * Controlador para servir archivos estáticos (imágenes de productos, facturas, recursos)
 * almacenados en el directorio local `uploads` con protección contra ataques de Path Traversal.
 */
public class ManejadorArchivosEstaticos extends ManejadorBase {

    /**
     * Resuelve de forma segura la ruta solicitada bajo `/uploads` y transmite el archivo binario con su tipo MIME.
     *
     * @param intercambio Contexto de la petición HTTP (`HttpExchange`).
     * @throws Exception Si ocurre un error de entrada/salida al leer o transmitir el archivo.
     */
    @Override
    protected void procesarPeticion(HttpExchange intercambio) throws Exception {
        String rutaUri = intercambio.getRequestURI().getPath();
        String rutaArchivo = rutaUri.startsWith("/") ? rutaUri.substring(1) : rutaUri;
        File archivo = new File(rutaArchivo);

        File directorioSubidas = new File("uploads").getCanonicalFile();
        File archivoCanonico = archivo.getCanonicalFile();
        java.nio.file.Path rutaDirectorioSubidas = directorioSubidas.toPath().normalize();
        java.nio.file.Path rutaArchivoCanonico = archivoCanonico.toPath().normalize();
        if (!rutaArchivoCanonico.startsWith(rutaDirectorioSubidas)) {
            enviarRespuestaJson(intercambio, 403, "{\"error\":\"Acceso denegado: ruta no permitida\"}");
            return;
        }

        if (!archivoCanonico.exists() || archivoCanonico.isDirectory()) {
            enviarRespuestaJson(intercambio, 404, "{\"error\":\"Archivo no encontrado\"}");
            return;
        }

        String tipoMime = Files.probeContentType(archivoCanonico.toPath());
        if (tipoMime == null) {
            tipoMime = "application/octet-stream";
        }

        intercambio.getResponseHeaders().set("Content-Type", tipoMime);

        if ("HEAD".equalsIgnoreCase(intercambio.getRequestMethod())) {
            intercambio.sendResponseHeaders(200, -1);
            intercambio.getResponseBody().close();
            return;
        }

        intercambio.sendResponseHeaders(200, archivoCanonico.length());

        try (OutputStream flujoSalida = intercambio.getResponseBody();
             FileInputStream flujoArchivo = new FileInputStream(archivoCanonico)) {
            byte[] bufer = new byte[8192];
            int bytesLeidos;
            while ((bytesLeidos = flujoArchivo.read(bufer)) >= 0) {
                flujoSalida.write(bufer, 0, bytesLeidos);
            }
        }
    }
}
