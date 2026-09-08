package infrastructure.api.handlers;

import com.sun.net.httpserver.HttpExchange;
import java.io.File;
import java.io.FileInputStream;
import java.io.OutputStream;
import java.nio.file.Files;

/**
 * Controlador para servir archivos estáticos (imágenes, documentos, etc.)
 * desde el directorio de subidas configurado.
 * Ruta base: /uploads
 * Traduce la ruta URI a una ruta de archivo local y la envía al cliente
 * con el tipo MIME adecuado.
 */
public class StaticFileHandler extends BaseHandler {

    /**
     * Sirve cualquier archivo solicitado bajo /uploads.
     * Ej: /uploads/imagenes/producto123.jpg → busca en uploads/imagenes/producto123.jpg
     * Si el archivo no existe o es un directorio, responde con 404.
     */
    @Override
    protected void processRequest(HttpExchange exchange) throws Exception {
        // Extrae la ruta del archivo desde la URI (ej: /uploads/foto.png → uploads/foto.png)
        String uriPath = exchange.getRequestURI().getPath();
        String filePath = uriPath.substring(1);
        File file = new File(filePath);

        // Prevención de ataques de Path Traversal: asegurar que el archivo esté dentro de uploads/
        File uploadsDir = new File("uploads").getCanonicalFile();
        File canonicalFile = file.getCanonicalFile();
        if (!canonicalFile.getPath().startsWith(uploadsDir.getPath())) {
            sendJsonResponse(exchange, 403, "{\"error\":\"Acceso denegado: ruta no permitida\"}");
            return;
        }

        // Si el archivo no existe o es un directorio, devuelve 404
        if (!canonicalFile.exists() || canonicalFile.isDirectory()) {
            sendJsonResponse(exchange, 404, "{\"error\":\"Archivo no encontrado\"}");
            return;
        }

        // Determina el tipo MIME del archivo (ej: image/png, application/pdf)
        String mimeType = Files.probeContentType(canonicalFile.toPath());
        if (mimeType == null) {
            mimeType = "application/octet-stream";
        }

        // Configura la cabecera Content-Type y envía el archivo
        exchange.getResponseHeaders().set("Content-Type", mimeType);
        
        if ("HEAD".equalsIgnoreCase(exchange.getRequestMethod())) {
            exchange.sendResponseHeaders(200, -1);
            exchange.getResponseBody().close();
            return;
        }

        exchange.sendResponseHeaders(200, canonicalFile.length());

        try (OutputStream os = exchange.getResponseBody();
             FileInputStream fs = new FileInputStream(canonicalFile)) {
            byte[] buffer = new byte[8192];
            int count;
            while ((count = fs.read(buffer)) >= 0) {
                os.write(buffer, 0, count);
            }
        }
    }
}
