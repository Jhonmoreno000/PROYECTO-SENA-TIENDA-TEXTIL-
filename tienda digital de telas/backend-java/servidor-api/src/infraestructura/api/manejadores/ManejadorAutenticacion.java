package infraestructura.api.manejadores;

import aplicacion.servicios.ServicioAutenticacion;
import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.sun.net.httpserver.HttpExchange;
import dominio.excepciones.ExcepcionDominio;
import dominio.modelos.Usuario;
import infraestructura.seguridad.TokenSesion;
import infraestructura.seguridad.ProtectorFuerzaBruta;

import java.nio.charset.StandardCharsets;

/**
 * Controlador HTTP para las operaciones de autenticación, registro con Habeas Data e inicio de sesión SSO.
 */
public class ManejadorAutenticacion extends ManejadorBase {
    /** Servicio de aplicación encargado de las reglas de negocio de autenticación (`ServicioAutenticacion`). */
    private final ServicioAutenticacion servicioAutenticacion;
    /** Serializador JSON de objetos de dominio (`Gson`). */
    private final Gson gson;

    /**
     * Construye el manejador de autenticación inyectando el servicio de aplicación correspondiente.
     *
     * @param servicioAutenticacion Instancia de `ServicioAutenticacion`.
     */
    public ManejadorAutenticacion(ServicioAutenticacion servicioAutenticacion) {
        this.servicioAutenticacion = servicioAutenticacion;
        this.gson = new Gson();
    }

    /**
     * Procesa las peticiones `POST` dirigidas a `/login`, `/iniciar-sesion`, `/register`, `/registro` y `/sso`.
     *
     * @param intercambio Contexto de la petición HTTP (`HttpExchange`).
     * @throws Exception Si ocurre un error durante el procesamiento de la solicitud.
     */
    @Override
    protected void procesarPeticion(HttpExchange intercambio) throws Exception {
        if (!"POST".equals(intercambio.getRequestMethod())) {
            enviarRespuestaJson(intercambio, 405, "{\"error\": \"Método no permitido\"}");
            return;
        }

        String ruta = intercambio.getRequestURI().getPath();
        String cuerpoTexto = new String(leerCuerpoSeguro(intercambio), StandardCharsets.UTF_8).trim();

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

        if (ruta.endsWith("/login") || ruta.endsWith("/iniciar-sesion")) {
            String correo = extraerTexto(jsonObjeto, "email", extraerTexto(jsonObjeto, "correo", null));
            String contrasena = extraerTexto(jsonObjeto, "password", extraerTexto(jsonObjeto, "contrasena", null));
            String ipCliente = obtenerIpCliente(intercambio);

            // Verificación de bloqueo preventivo por fuerza bruta (Account Lockout Policy)
            if (ProtectorFuerzaBruta.estaBloqueado(correo) || ProtectorFuerzaBruta.estaBloqueado(ipCliente)) {
                long segundosRestantes = Math.max(
                    ProtectorFuerzaBruta.obtenerSegundosRestantesBloqueo(correo),
                    ProtectorFuerzaBruta.obtenerSegundosRestantesBloqueo(ipCliente)
                );
                long minutosRestantes = Math.max(1, (segundosRestantes + 59) / 60);
                enviarRespuestaJson(intercambio, 429,
                    "{\"error\": \"Demasiados intentos fallidos. Por motivos de seguridad, la cuenta o IP ha sido bloqueada temporalmente. Intente de nuevo en " + minutosRestantes + " minutos.\", \"bloqueado\": true, \"segundosRestantes\": " + segundosRestantes + "}");
                return;
            }

            try {
                Usuario usuario = servicioAutenticacion.iniciarSesion(correo, contrasena);
                ProtectorFuerzaBruta.registrarExito(correo);
                ProtectorFuerzaBruta.registrarExito(ipCliente);

                String jsonUsuario = gson.toJson(usuario);
                String tokenSesion = TokenSesion.emitir(usuario.getId(), usuario.getRol());
                enviarRespuestaJson(intercambio, 200, "{\"success\": true, \"token\": " + gson.toJson(tokenSesion) + ", \"user\": " + jsonUsuario + "}");
            } catch (ExcepcionDominio e) {
                ProtectorFuerzaBruta.registrarFallo(correo);
                ProtectorFuerzaBruta.registrarFallo(ipCliente);
                throw e;
            }

        } else if (ruta.endsWith("/register") || ruta.endsWith("/registro")) {
            String nombre = extraerTexto(jsonObjeto, "name", extraerTexto(jsonObjeto, "nombre", null));
            String correo = extraerTexto(jsonObjeto, "email", extraerTexto(jsonObjeto, "correo", null));
            String contrasena = extraerTexto(jsonObjeto, "password", extraerTexto(jsonObjeto, "contrasena", null));

            boolean aceptaHabeasData = false;
            if (jsonObjeto.has("aceptaHabeasData") && !jsonObjeto.get("aceptaHabeasData").isJsonNull()) {
                aceptaHabeasData = jsonObjeto.get("aceptaHabeasData").getAsBoolean();
            } else if (jsonObjeto.has("acceptsTerms") && !jsonObjeto.get("acceptsTerms").isJsonNull()) {
                aceptaHabeasData = jsonObjeto.get("acceptsTerms").getAsBoolean();
            } else if (jsonObjeto.has("habeasData") && !jsonObjeto.get("habeasData").isJsonNull()) {
                aceptaHabeasData = jsonObjeto.get("habeasData").getAsBoolean();
            }

            servicioAutenticacion.registrarCliente(nombre, correo, contrasena, aceptaHabeasData);
            enviarRespuestaJson(intercambio, 201, "{\"success\": true, \"message\": \"Usuario registrado exitosamente con consentimiento de Habeas Data\"}");

        } else if (ruta.endsWith("/sso")) {
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
            String tokenSesion = TokenSesion.emitir(usuario.getId(), usuario.getRol());
            enviarRespuestaJson(intercambio, 200, "{\"success\": true, \"token\": " + gson.toJson(tokenSesion) + ", \"user\": " + jsonUsuario + "}");

        } else {
            enviarRespuestaJson(intercambio, 404, "{\"error\": \"Ruta no encontrada\"}");
        }
    }

    /**
     * Extrae una propiedad de texto de un objeto JSON o devuelve el valor por defecto si no existe.
     *
     * @param obj             Objeto JSON de entrada (`JsonObject`).
     * @param clave           Nombre de la propiedad (`String`).
     * @param valorPorDefecto Valor de respaldo (`String`).
     * @return Valor de texto extraído o `valorPorDefecto`.
     */
    private static String extraerTexto(JsonObject obj, String clave, String valorPorDefecto) {
        if (obj != null && obj.has(clave) && !obj.get(clave).isJsonNull()) {
            return obj.get(clave).getAsString();
        }
        return valorPorDefecto;
    }
}
