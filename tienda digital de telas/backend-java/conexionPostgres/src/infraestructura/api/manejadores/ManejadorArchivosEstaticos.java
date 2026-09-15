package infraestructura.api.manejadores;

import com.sun.net.httpserver.HttpExchange;
import java.io.File;
import java.io.FileInputStream;
import java.io.OutputStream;
import java.nio.file.Files;

/**
 * Manejador para servir archivos estáticos (imágenes, documentos, facturas, etc.)
 * desde el directorio de subidas configurado.
 * Ruta base: /uploads
 * Traduce la ruta URI a una ruta de archivo local y la envía al cliente con el tipo MIME adecuado.
 */
public class ManejadorArchivosEstaticos extends ManejadorBase {

    /**
     * Sirve cualquier archivo solicitado bajo /uploads.
     * Ej: /uploads/imagenes/producto123.jpg → busca en uploads/imagenes/producto123.jpg
     * Si el archivo no existe o es un directorio, responde con 404.
     */
    @Override
    protected void procesarPeticion(HttpExchange intercambio) throws Exception {
        // Extrae la ruta del archivo desde la URI (ej: /uploads/foto.png → uploads/foto.png)
        String rutaUri = intercambio.getRequestURI().getPath();
        String rutaArchivo = rutaUri.startsWith("/") ? rutaUri.substring(1) : rutaUri;
        File archivo = new File(rutaArchivo);

        // Prevención de ataques de Path Traversal: asegurar que el archivo esté dentro de uploads/
        File directorioSubidas = new File("uploads").getCanonicalFile();
        File archivoCanonico = archivo.getCanonicalFile();
        if (!archivoCanonico.getPath().startsWith(directorioSubidas.getPath())) {
            enviarRespuestaJson(intercambio, 403, "{\"error\":\"Acceso denegado: ruta no permitida\"}");
            return;
        }

        // Si el archivo no existe o es un directorio, devuelve 404
        if (!archivoCanonico.exists() || archivoCanonico.isDirectory()) {
            enviarRespuestaJson(intercambio, 404, "{\"error\":\"Archivo no encontrado\"}");
            return;
        }

        // Determina el tipo MIME del archivo (ej: image/png, application/pdf)
        String tipoMime = Files.probeContentType(archivoCanonico.toPath());
        if (tipoMime == null) {
            tipoMime = "application/octet-stream";
        }

        // Configura la cabecera Content-Type y envía el archivo
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
