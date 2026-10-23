package infraestructura.configuracion;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Lectura de variables de configuración: primero las variables de entorno del sistema
 * (Docker / producción) y, si no existen, el archivo ".env" del proyecto (desarrollo local).
 */
public final class ConfiguracionEntorno {

    private static final Map<String, String> VALORES_ARCHIVO = cargarArchivoEnv();

    private ConfiguracionEntorno() {}

    /** Devuelve el primer valor no vacío entre las claves indicadas, o null. */
    public static String obtener(String... claves) {
        for (String clave : claves) {
            String valor = System.getenv(clave);
            if (valor == null || valor.isBlank()) valor = VALORES_ARCHIVO.get(clave);
            if (valor != null && !valor.isBlank()) return valor.trim();
        }
        return null;
    }

    private static Map<String, String> cargarArchivoEnv() {
        Map<String, String> valores = new HashMap<>();
        Path[] posiblesRutas = { Paths.get(".env"), Paths.get("../.env"), Paths.get("../../.env"), Paths.get("../../../.env") };
        for (Path ruta : posiblesRutas) {
            if (!Files.exists(ruta)) continue;
            try {
                List<String> lineas = Files.readAllLines(ruta, StandardCharsets.UTF_8);
                for (String linea : lineas) {
                    String l = linea.trim();
                    if (l.isEmpty() || l.startsWith("#") || !l.contains("=")) continue;
                    int idx = l.indexOf('=');
                    String valor = l.substring(idx + 1).trim();
                    if (valor.length() >= 2 && ((valor.startsWith("\"") && valor.endsWith("\""))
                            || (valor.startsWith("'") && valor.endsWith("'")))) {
                        valor = valor.substring(1, valor.length() - 1);
                    }
                    valores.put(l.substring(0, idx).trim(), valor);
                }
            } catch (IOException e) {
                System.err.println("[CONFIG] No se pudo leer el archivo .env: " + e.getMessage());
            }
            break;
        }
        return valores;
    }
}
