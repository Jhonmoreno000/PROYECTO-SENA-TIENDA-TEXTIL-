package infraestructura.seguridad;

import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import infraestructura.configuracion.ConfiguracionEntorno;
import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;
import java.util.Optional;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

/** Sesiones firmadas por el servidor, con caducidad y sin datos de contraseña. */
public final class TokenSesion {
    public static final long DURACION_SEGUNDOS = 12 * 60 * 60;
    private static final byte[] SECRETO = cargarSecreto();

    private TokenSesion() {}

    public record Identidad(int idUsuario, String rol) {
        public boolean esAdministrador() {
            return "administrador".equalsIgnoreCase(rol) || "admin".equalsIgnoreCase(rol);
        }

        public boolean esVendedor() {
            return "vendedor".equalsIgnoreCase(rol) || "seller".equalsIgnoreCase(rol);
        }
    }

    public static String emitir(int idUsuario, String rol) {
        return emitir(idUsuario, rol, SECRETO, Instant.now().getEpochSecond());
    }

    public static String emitir(int idUsuario, String rol, byte[] secreto, long ahoraSegundos) {
        JsonObject datos = new JsonObject();
        datos.addProperty("sub", idUsuario);
        datos.addProperty("rol", rol);
        datos.addProperty("exp", ahoraSegundos + DURACION_SEGUNDOS);
        String carga = Base64.getUrlEncoder().withoutPadding()
                .encodeToString(datos.toString().getBytes(StandardCharsets.UTF_8));
        return carga + "." + Base64.getUrlEncoder().withoutPadding().encodeToString(firmar(carga, secreto));
    }

    public static Optional<Identidad> verificar(String token) {
        return verificar(token, SECRETO, Instant.now().getEpochSecond());
    }

    public static Optional<Identidad> verificar(String token, byte[] secreto, long ahoraSegundos) {
        try {
            if (token == null) return Optional.empty();
            String[] partes = token.split("\\.", -1);
            if (partes.length != 2 || !partes[0].matches("[A-Za-z0-9_-]+")
                    || !partes[1].matches("[A-Za-z0-9_-]+")) return Optional.empty();
            byte[] firma = Base64.getUrlDecoder().decode(partes[1]);
            if (!MessageDigest.isEqual(firmar(partes[0], secreto), firma)) return Optional.empty();

            JsonObject datos = JsonParser.parseString(new String(Base64.getUrlDecoder().decode(partes[0]),
                    StandardCharsets.UTF_8)).getAsJsonObject();
            if (!datos.has("sub") || !datos.has("rol") || !datos.has("exp")
                    || !datos.get("sub").isJsonPrimitive() || !datos.getAsJsonPrimitive("sub").isNumber()
                    || !datos.get("rol").isJsonPrimitive() || !datos.getAsJsonPrimitive("rol").isString()
                    || !datos.get("exp").isJsonPrimitive() || !datos.getAsJsonPrimitive("exp").isNumber()) {
                return Optional.empty();
            }
            int idUsuario = datos.get("sub").getAsBigDecimal().intValueExact();
            long expiracion = datos.get("exp").getAsBigDecimal().longValueExact();
            if (expiracion <= ahoraSegundos) return Optional.empty();
            return Optional.of(new Identidad(idUsuario, datos.get("rol").getAsString()));
        } catch (RuntimeException e) {
            return Optional.empty();
        }
    }

    private static byte[] firmar(String carga, byte[] secreto) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(secreto, "HmacSHA256"));
            return mac.doFinal(carga.getBytes(StandardCharsets.UTF_8));
        } catch (GeneralSecurityException e) {
            throw new IllegalStateException("No se pudo firmar la sesión", e);
        }
    }

    private static byte[] cargarSecreto() {
        String configurado = ConfiguracionEntorno.obtener("SESSION_SECRET");
        if (configurado != null && !configurado.isBlank()) return configurado.getBytes(StandardCharsets.UTF_8);
        byte[] secreto = new byte[32];
        new SecureRandom().nextBytes(secreto);
        System.err.println("[SEGURIDAD] SESSION_SECRET no configurado: las sesiones se invalidarán al reiniciar. Configure SESSION_SECRET en producción.");
        return secreto;
    }
}
