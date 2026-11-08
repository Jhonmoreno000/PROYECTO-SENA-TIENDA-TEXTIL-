package aplicacion.servicios;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import infraestructura.configuracion.ConfiguracionWompi;

/**
 * Servicio criptográfico para la pasarela de pagos Wompi (Bancolombia).
 * Calcula firmas de integridad SHA-256 para el Checkout Widget y verifica firmas de eventos Webhook.
 */
public class ServicioCriptoWompi {

    /**
     * Constructor privado para evitar la instanciación directa de esta clase utilitaria.
     */
    private ServicioCriptoWompi() {}

    /**
     * Genera el hash de integridad SHA-256 requerido por Wompi para iniciar el Widget de pago.
     * Fórmula: `SHA256(referencia + montoCentavos + moneda + secretoIntegridad)`.
     *
     * @param referencia Referencia única del pedido (`String`, ej. `"DD-20261021-1234"`).
     * @param montoCentavos Monto total expresado en centavos (`long`, ej. `5000000L` para $50.000 COP).
     * @param moneda Código ISO de moneda (`String`, típicamente `"COP"`).
     * @return Hash SHA-256 (`String`) en formato hexadecimal en minúsculas.
     */
    public static String generarFirmaIntegridad(String referencia, long montoCentavos, String moneda) {
        String secreto = ConfiguracionWompi.secretoIntegridad();
        if (secreto == null || secreto.isBlank()) {
            System.err.println("[WOMPI ALERTA] WOMPI_INTEGRITY_SECRET no está configurado. Usando modo de desarrollo.");
            secreto = "test_integrity_dummy";
        }
        String cadena = referencia + montoCentavos + moneda + secreto;
        return sha256(cadena);
    }

    /**
     * Valida la firma criptográfica (`checksum`) del evento recibido en el Webhook de Wompi.
     *
     * @param jsonWebhook Objeto JSON raíz ({@link JsonObject}) enviado por Wompi.
     * @return `true` si el checksum calculado coincide con el recibido; `false` si es inválido.
     */
    public static boolean validarFirmaWebhook(JsonObject jsonWebhook) {
        if (jsonWebhook == null || !jsonWebhook.has("signature") || !jsonWebhook.has("timestamp")) {
            return false;
        }

        JsonObject signatureObj = jsonWebhook.getAsJsonObject("signature");
        if (!signatureObj.has("properties") || !signatureObj.has("checksum")) {
            return false;
        }

        String checksumRecibido = signatureObj.get("checksum").getAsString();
        long timestamp = jsonWebhook.get("timestamp").getAsLong();
        JsonArray properties = signatureObj.getAsJsonArray("properties");

        JsonObject dataObj = jsonWebhook.has("data") && jsonWebhook.get("data").isJsonObject()
                ? jsonWebhook.getAsJsonObject("data")
                : new JsonObject();

        StringBuilder cadenaParaHash = new StringBuilder();
        for (JsonElement propElem : properties) {
            String rutaPropiedad = propElem.getAsString();
            String valor = extraerValorPorRuta(dataObj, rutaPropiedad);
            if (valor != null) {
                cadenaParaHash.append(valor);
            }
        }

        cadenaParaHash.append(timestamp);

        String secretoEventos = ConfiguracionWompi.secretoEventos();
        if (secretoEventos == null || secretoEventos.isBlank()) {
            System.err.println("[WOMPI ALERTA] WOMPI_EVENTS_SECRET no está configurado.");
            secretoEventos = "test_events_dummy";
        }
        cadenaParaHash.append(secretoEventos);

        String checksumCalculado = sha256(cadenaParaHash.toString());
        return MessageDigest.isEqual(
                checksumCalculado.toLowerCase().getBytes(StandardCharsets.UTF_8),
                checksumRecibido.toLowerCase().getBytes(StandardCharsets.UTF_8)
        );
    }

    /**
     * Extrae recursivamente el valor en texto de una propiedad JSON usando notación de punto (ej. `"transaction.id"`).
     *
     * @param raiz Objeto JSON contenedor ({@link JsonObject}) sobre el cual navegar.
     * @param ruta Ruta de propiedades separada por puntos (`String`).
     * @return Valor de la propiedad (`String`) o cadena vacía `""` si no existe.
     */
    private static String extraerValorPorRuta(JsonObject raiz, String ruta) {
        if (raiz == null || ruta == null || ruta.isBlank()) return "";
        String[] partes = ruta.split("\\.");
        JsonObject actual = raiz;
        for (int i = 0; i < partes.length - 1; i++) {
            if (actual != null && actual.has(partes[i]) && actual.get(partes[i]).isJsonObject()) {
                actual = actual.getAsJsonObject(partes[i]);
            } else {
                return "";
            }
        }
        String claveFinal = partes[partes.length - 1];
        if (actual != null && actual.has(claveFinal) && !actual.get(claveFinal).isJsonNull()) {
            JsonElement el = actual.get(claveFinal);
            return el.isJsonPrimitive() ? el.getAsString() : el.toString();
        }
        return "";
    }

    /**
     * Calcula el resumen SHA-256 de una cadena UTF-8 y lo retorna en hexadecimal en minúsculas.
     *
     * @param entrada Cadena de entrada (`String`) a procesar.
     * @return Cadena hexadecimal (`String`) de 64 caracteres, o `""` si la entrada es nula.
     */
    public static String sha256(String entrada) {
        if (entrada == null) return "";
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(entrada.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder(64);
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("Algoritmo SHA-256 no disponible en la JVM", e);
        }
    }
}
