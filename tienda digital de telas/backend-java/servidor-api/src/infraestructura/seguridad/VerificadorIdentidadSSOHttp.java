package infraestructura.seguridad;

import java.net.ProxySelector;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Base64;
import java.util.Locale;

import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

import aplicacion.servicios.VerificadorIdentidadSSO;
import dominio.excepciones.ExcepcionDominio;
import infraestructura.configuracion.ConfiguracionSSO;

/**
 * Verifica los tokens de acceso de Google y Microsoft consultando directamente a cada proveedor OAuth 2.0.
 * Confirma vigencia, audiencia (`aud` / `appid`) y correo verificado antes de autorizar el acceso.
 */
public class VerificadorIdentidadSSOHttp implements VerificadorIdentidadSSO {

    /** Endpoint oficial de Google OAuth2 para validar e inspeccionar tokens de acceso (`String`). */
    private static final String GOOGLE_TOKENINFO = "https://oauth2.googleapis.com/tokeninfo?access_token=";

    /** Endpoint oficial de Google OpenID Connect para obtener el perfil del usuario autenticado (`String`). */
    private static final String GOOGLE_USERINFO = "https://www.googleapis.com/oauth2/v3/userinfo";

    /** Endpoint oficial de Microsoft Graph para consultar el perfil de la cuenta autenticada (`String`). */
    private static final String MICROSOFT_GRAPH_ME = "https://graph.microsoft.com/v1.0/me";

    /** Cliente HTTP reutilizable (`HttpClient`) con timeout de conexión de 10 segundos. */
    private final HttpClient http;

    /**
     * Inicializa el verificador HTTP de identidad SSO con el selector de proxy del sistema.
     */
    public VerificadorIdentidadSSOHttp() {
        this.http = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .proxy(ProxySelector.getDefault())
                .build();
    }

    /**
     * Verifica la validez del token OAuth2 ante el proveedor indicado (`google` o `microsoft`).
     *
     * @param proveedor Nombre del proveedor SSO (`String`: `"google"` o `"microsoft"`).
     * @param tokenAcceso Token de acceso OAuth2 (`String`) emitido por el proveedor.
     * @return Objeto {@link IdentidadSSO} con el correo verificado y el nombre del titular.
     * @throws ExcepcionDominio Si el token falta, expiró, no pertenece a la aplicación o el proveedor no es válido.
     */
    @Override
    public IdentidadSSO verificar(String proveedor, String tokenAcceso) {
        if (tokenAcceso == null || tokenAcceso.isBlank()) {
            throw new ExcepcionDominio("Falta el token del proveedor de inicio de sesión.");
        }
        String p = proveedor == null ? "" : proveedor.trim().toLowerCase(Locale.ROOT);
        return switch (p) {
            case "google" -> verificarGoogle(tokenAcceso.trim());
            case "microsoft" -> verificarMicrosoft(tokenAcceso.trim());
            default -> throw new ExcepcionDominio("Proveedor de inicio de sesión no soportado.");
        };
    }

    /**
     * Verifica un token de acceso de Google contra `tokeninfo` y `userinfo`.
     *
     * @param token Token OAuth2 (`String`) emitido por Google.
     * @return Identidad verificada ({@link IdentidadSSO}) con correo y nombre.
     */
    private IdentidadSSO verificarGoogle(String token) {
        String clientId = ConfiguracionSSO.clienteGoogle();
        if (clientId == null) {
            throw new ExcepcionDominio("El inicio de sesión con Google no está configurado en el servidor (GOOGLE_CLIENT_ID).");
        }
        JsonObject info = obtenerJson(GOOGLE_TOKENINFO + URLEncoder.encode(token, StandardCharsets.UTF_8), null);
        if (info == null) {
            throw new ExcepcionDominio("El token de Google no es válido o ya expiró.");
        }
        String aud = texto(info, "aud");
        String azp = texto(info, "azp");
        if (!clientId.equals(aud) && !clientId.equals(azp)) {
            throw new ExcepcionDominio("El token de Google no fue emitido para esta aplicación.");
        }
        long expiraEn = info.has("expires_in") ? info.get("expires_in").getAsLong() : 0;
        if (expiraEn <= 0) {
            throw new ExcepcionDominio("El token de Google ya expiró.");
        }
        String correo = texto(info, "email");
        if (correo == null || !"true".equalsIgnoreCase(texto(info, "email_verified"))) {
            throw new ExcepcionDominio("Google no confirma un correo verificado para esta cuenta.");
        }
        String nombre = null;
        JsonObject perfil = obtenerJson(GOOGLE_USERINFO, token);
        if (perfil != null) {
            nombre = texto(perfil, "name");
        }
        return new IdentidadSSO(correo.toLowerCase(Locale.ROOT), nombre);
    }

    /**
     * Verifica un token de acceso de Microsoft validando sus reclamos JWT y consultando Microsoft Graph `/me`.
     *
     * @param token Token OAuth2 (`String`) emitido por Microsoft Entra ID.
     * @return Identidad verificada ({@link IdentidadSSO}) con correo y nombre para mostrar.
     */
    private IdentidadSSO verificarMicrosoft(String token) {
        String clientId = ConfiguracionSSO.clienteMicrosoft();
        if (clientId == null) {
            throw new ExcepcionDominio("El inicio de sesión con Microsoft no está configurado en el servidor (AZURE_CLIENT_ID).");
        }
        JsonObject reclamos = leerReclamosJwt(token);
        if (reclamos != null) {
            String appId = texto(reclamos, "appid");
            if (appId == null) {
                appId = texto(reclamos, "azp");
            }
            if (!clientId.equals(appId)) {
                throw new ExcepcionDominio("El token de Microsoft no fue emitido para esta aplicación.");
            }
            if (reclamos.has("exp") && reclamos.get("exp").getAsLong() * 1000 < System.currentTimeMillis()) {
                throw new ExcepcionDominio("El token de Microsoft ya expiró.");
            }
        }
        JsonObject yo = obtenerJson(MICROSOFT_GRAPH_ME, token);
        if (yo == null) {
            throw new ExcepcionDominio("El token de Microsoft no es válido o ya expiró.");
        }
        String correo = texto(yo, "mail");
        if (correo == null) {
            correo = texto(yo, "userPrincipalName");
        }
        if (correo == null || !correo.contains("@")) {
            throw new ExcepcionDominio("Microsoft no devolvió un correo para esta cuenta.");
        }
        return new IdentidadSSO(correo.toLowerCase(Locale.ROOT), texto(yo, "displayName"));
    }

    /**
     * Ejecuta una petición HTTP `GET` al proveedor de identidad y devuelve el cuerpo JSON si responde HTTP 200.
     *
     * @param url Dirección URL completa (`String`) del recurso a consultar.
     * @param tokenBearer Token Bearer opcional (`String`) para la cabecera `Authorization`.
     * @return Objeto {@link JsonObject} de respuesta o `null` si el código de estado no es 200.
     */
    private JsonObject obtenerJson(String url, String tokenBearer) {
        try {
            HttpRequest.Builder req = HttpRequest.newBuilder(URI.create(url))
                    .timeout(Duration.ofSeconds(10))
                    .header("Accept", "application/json")
                    .GET();
            if (tokenBearer != null) {
                req.header("Authorization", "Bearer " + tokenBearer);
            }
            HttpResponse<String> res = http.send(req.build(), HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));
            if (res.statusCode() != 200) {
                return null;
            }
            return JsonParser.parseString(res.body()).getAsJsonObject();
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new ExcepcionDominio("No fue posible contactar al proveedor de inicio de sesión.");
        } catch (Exception e) {
            System.err.println("[SSO] Error consultando " + URI.create(url).getHost() + ": " + e.getMessage());
            throw new ExcepcionDominio("No fue posible contactar al proveedor de inicio de sesión.");
        }
    }

    /**
     * Decodifica el segmento de carga útil (`payload`) de un token en formato JWT sin validar firma criptográfica.
     *
     * @param token Cadena del token (`String`) con formato `header.payload.signature`.
     * @return Objeto {@link JsonObject} con los reclamos del JWT, o `null` si no tiene formato JWT.
     */
    private static JsonObject leerReclamosJwt(String token) {
        String[] partes = token.split("\\.");
        if (partes.length != 3) {
            return null;
        }
        try {
            byte[] json = Base64.getUrlDecoder().decode(partes[1]);
            return JsonParser.parseString(new String(json, StandardCharsets.UTF_8)).getAsJsonObject();
        } catch (Exception e) {
            return null;
        }
    }

    /**
     * Extrae de forma segura una propiedad de texto desde un {@link JsonObject}.
     *
     * @param obj Objeto JSON (`JsonObject`) de origen.
     * @param clave Nombre de la propiedad (`String`) a leer.
     * @return Valor de texto (`String`) recortado, o `null` si no existe o está en blanco.
     */
    private static String texto(JsonObject obj, String clave) {
        if (obj == null || !obj.has(clave) || obj.get(clave).isJsonNull()) {
            return null;
        }
        String v = obj.get(clave).getAsString();
        return v.isBlank() ? null : v.trim();
    }
}
