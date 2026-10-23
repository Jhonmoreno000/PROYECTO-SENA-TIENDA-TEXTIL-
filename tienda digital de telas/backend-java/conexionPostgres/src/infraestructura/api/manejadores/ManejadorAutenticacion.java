package infraestructura.api.manejadores;

import aplicacion.servicios.ServicioAutenticacion;
import com.sun.net.httpserver.HttpExchange;
import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import dominio.excepciones.ExcepcionDominio;
import dominio.modelos.Usuario;

import java.io.InputStream;
import java.nio.charset.StandardCharsets;

/**
 * Controlador para operaciones de autenticación de usuarios.
 * Maneja el inicio de sesión (login) y el registro (register) de clientes.
 */
public class ManejadorAutenticacion extends ManejadorBase {
    private final ServicioAutenticacion servicioAutenticacion;
    private final Gson gson;

    public ManejadorAutenticacion(ServicioAutenticacion servicioAutenticacion) {
        this.servicioAutenticacion = servicioAutenticacion;
        this.gson = new Gson();
    }

    @Override
    protected void procesarPeticion(HttpExchange intercambio) throws Exception {
        if (!"POST".equals(intercambio.getRequestMethod())) {
            enviarRespuestaJson(intercambio, 405, "{\"error\": \"Método no permitido\"}");
            return;
        }

        String ruta = intercambio.getRequestURI().getPath();
        InputStream cuerpoEntrada = intercambio.getRequestBody();
        String cuerpoTexto = new String(cuerpoEntrada.readAllBytes(), StandardCharsets.UTF_8).trim();

        if (cuerpoTexto.isEmpty()) {
            enviarRespuestaError(intercambio, 400, "El cuerpo de la petición no puede estar vacío");
            return;
        }

        JsonObject jsonObjeto;
        try {
            jsonObjeto = JsonParser.parseString(cuerpoTexto).getAsJsonObject();
        } catch (Exception e) {
            enviarRespuestaError(intercambio, 400, "Formato JSON inválido");
            return;
        }

        // --- POST /api/login o /api/autenticacion/iniciar-sesion ---
        if (ruta.endsWith("/login") || ruta.endsWith("/iniciar-sesion")) {
            String correo = extraerTexto(jsonObjeto, "email", extraerTexto(jsonObjeto, "correo", null));
            String contrasena = extraerTexto(jsonObjeto, "password", extraerTexto(jsonObjeto, "contrasena", null));

            Usuario usuario = servicioAutenticacion.iniciarSesion(correo, contrasena);
            String jsonUsuario = gson.toJson(usuario);
            enviarRespuestaJson(intercambio, 200, "{\"success\": true, \"user\": " + jsonUsuario + "}");

        // --- POST /api/register o /api/autenticacion/registro ---
        } else if (ruta.endsWith("/register") || ruta.endsWith("/registro")) {
            String nombre = extraerTexto(jsonObjeto, "name", extraerTexto(jsonObjeto, "nombre", null));
            String correo = extraerTexto(jsonObjeto, "email", extraerTexto(jsonObjeto, "correo", null));
            String contrasena = extraerTexto(jsonObjeto, "password", extraerTexto(jsonObjeto, "contrasena", null));

            boolean aceptaHabeasData = true;
            if (jsonObjeto.has("aceptaHabeasData") && !jsonObjeto.get("aceptaHabeasData").isJsonNull()) {
                aceptaHabeasData = jsonObjeto.get("aceptaHabeasData").getAsBoolean();
            } else if (jsonObjeto.has("acceptsTerms") && !jsonObjeto.get("acceptsTerms").isJsonNull()) {
                aceptaHabeasData = jsonObjeto.get("acceptsTerms").getAsBoolean();
            } else if (jsonObjeto.has("habeasData") && !jsonObjeto.get("habeasData").isJsonNull()) {
                aceptaHabeasData = jsonObjeto.get("habeasData").getAsBoolean();
            }

            servicioAutenticacion.registrarCliente(nombre, correo, contrasena, aceptaHabeasData);
            enviarRespuestaJson(intercambio, 201, "{\"success\": true, \"message\": \"Usuario registrado exitosamente con consentimiento de Habeas Data\"}");

        // --- POST /api/autenticacion/sso o /api/sso ---
        } else if (ruta.endsWith("/sso")) {
            // El correo y el nombre que envíe el navegador no se usan: la identidad sale del token,
            // que se valida directamente con Google o Microsoft.
            String proveedor = extraerTexto(jsonObjeto, "proveedor", extraerTexto(jsonObjeto, "provider", null));
            String token = extraerTexto(jsonObjeto, "token", extraerTexto(jsonObjeto, "accessToken", null));
            if (proveedor == null || token == null) {
                enviarRespuestaError(intercambio, 401, "Falta el proveedor o el token de inicio de sesión.");
                return;
            }

            Usuario usuario;
            try {
                usuario = servicioAutenticacion.autenticarConSSO(proveedor, token);
            } catch (ExcepcionDominio e) {
                enviarRespuestaError(intercambio, 401, e.getMessage());
                return;
            }
            String jsonUsuario = gson.toJson(usuario);
            enviarRespuestaJson(intercambio, 200, "{\"success\": true, \"user\": " + jsonUsuario + "}");

        } else {
            enviarRespuestaJson(intercambio, 404, "{\"error\": \"Ruta no encontrada\"}");
        }
    }

    private static String extraerTexto(JsonObject obj, String clave, String valorPorDefecto) {
        if (obj != null && obj.has(clave) && !obj.get(clave).isJsonNull()) {
            return obj.get(clave).getAsString();
        }
        return valorPorDefecto;
    }
}
