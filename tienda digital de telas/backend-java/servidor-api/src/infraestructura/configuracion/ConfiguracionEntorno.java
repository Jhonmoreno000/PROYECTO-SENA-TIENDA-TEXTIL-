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
 * Gestor centralizado de variables de configuración y entorno para D&D Textil.
 * Prioridad de resolución:
 * 1. Variables de entorno del sistema operativo / contenedor (Docker / Kubernetes / Producción).
 * 2. Archivo ".env" local ubicado en la raíz del proyecto o directorios padre (Desarrollo local).
 * 3. Valor por defecto parametrizado.
 */
public final class ConfiguracionEntorno {

    /** Mapa en memoria (`Map<String, String>`) con los pares clave-valor cargados desde el archivo `.env`. */
    private static final Map<String, String> VALORES_ARCHIVO = cargarArchivoEnv();

    /**
     * Constructor privado para evitar la instanciación de esta clase utilitaria.
     */
    private ConfiguracionEntorno() {}

    /**
     * Devuelve el primer valor no vacío entre las claves indicadas, o `null` si ninguna existe.
     *
     * @param claves Arreglo variable de claves (`String...`) a consultar en orden de prioridad.
     * @return Valor encontrado (`String`) recortado, o `null`.
     */
    public static String obtener(String... claves) {
        if (claves == null) {
            return null;
        }
        for (String clave : claves) {
            if (clave == null || clave.isBlank()) {
                continue;
            }
            String valor = System.getenv(clave);
            if (valor == null || valor.isBlank()) {
                valor = VALORES_ARCHIVO.get(clave);
            }
            if (valor != null && !valor.isBlank()) {
                return valor.trim();
            }
        }
        return null;
    }

    /**
     * Busca secuencialmente entre varias claves de entorno y retorna el primer valor definido, o `null`.
     * Evita la ambigüedad de sobrecarga con {@link #obtener(String, String)} cuando se pasan dos claves.
     *
     * @param claves Claves candidatas (`String...`) a evaluar en orden de prioridad.
     * @return Primer valor no vacío (`String`) o `null` si ninguna clave está configurada.
     */
    public static String obtenerPrimera(String... claves) {
        return obtener(claves);
    }

    /**
     * Devuelve el valor de la clave especificada o el valor por defecto si no está definida.
     *
     * @param clave Clave de entorno (`String`) a consultar.
     * @param valorPorDefecto Valor predeterminado (`String`) de respaldo.
     * @return Valor configurado o `valorPorDefecto`.
     */
    public static String obtener(String clave, String valorPorDefecto) {
        String val = obtener(new String[]{clave});
        return (val != null && !val.isBlank()) ? val : valorPorDefecto;
    }

    /**
     * Devuelve el valor numérico entero asociado a una clave, o el valor por defecto.
     *
     * @param clave Clave de entorno (`String`).
     * @param valorPorDefecto Entero (`int`) de respaldo ante ausencia o error de formato.
     * @return Entero parseado (`int`) o `valorPorDefecto`.
     */
    public static int obtenerEntero(String clave, int valorPorDefecto) {
        String val = obtener(new String[]{clave});
        if (val == null || val.isBlank()) {
            return valorPorDefecto;
        }
        try {
            return Integer.parseInt(val.trim());
        } catch (NumberFormatException e) {
            return valorPorDefecto;
        }
    }

    /**
     * Devuelve el valor booleano asociado a una clave, o el valor por defecto.
     *
     * @param clave Clave de entorno (`String`).
     * @param valorPorDefecto Booleano (`boolean`) de respaldo ante ausencia.
     * @return Booleano parseado (`boolean`) o `valorPorDefecto`.
     */
    public static boolean obtenerBooleano(String clave, boolean valorPorDefecto) {
        String val = obtener(new String[]{clave});
        if (val == null || val.isBlank()) {
            return valorPorDefecto;
        }
        return Boolean.parseBoolean(val.trim());
    }

    /**
     * Carga y analiza el archivo `.env` más cercano ignorando comentarios y comillas envolventes.
     *
     * @return Mapa (`Map<String, String>`) con las variables de entorno definidas en disco.
     */
    private static Map<String, String> cargarArchivoEnv() {
        Map<String, String> valores = new HashMap<>();
        Path[] posiblesRutas = {
            Paths.get(".env"),
            Paths.get("../.env"),
            Paths.get("../../.env"),
            Paths.get("../../../.env")
        };

        for (Path ruta : posiblesRutas) {
            if (!Files.exists(ruta)) {
                continue;
            }
            try {
                List<String> lineas = Files.readAllLines(ruta, StandardCharsets.UTF_8);
                for (String linea : lineas) {
                    String l = linea.trim();
                    if (l.isEmpty() || l.startsWith("#") || !l.contains("=")) {
                        continue;
                    }
                    int idx = l.indexOf('=');
                    String clave = l.substring(0, idx).trim();
                    String valor = l.substring(idx + 1).trim();
                    if (valor.length() >= 2 && ((valor.startsWith("\"") && valor.endsWith("\""))
                            || (valor.startsWith("'") && valor.endsWith("'")))) {
                        valor = valor.substring(1, valor.length() - 1);
                    }
                    valores.put(clave, valor);
                }
                break;
            } catch (IOException e) {
                System.err.println("[CONFIG] Advertencia: No se pudo leer el archivo .env en " + ruta + ": " + e.getMessage());
            }
        }
        return valores;
    }
}
