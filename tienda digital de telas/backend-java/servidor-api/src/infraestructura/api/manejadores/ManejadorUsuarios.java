package infraestructura.api.manejadores;

import com.google.gson.Gson;
import com.sun.net.httpserver.HttpExchange;
import infraestructura.persistencia.jdbc.UsuarioDAO;
import dominio.modelos.Usuario;
import java.util.List;

/**
 * Manejador para la gestión y consulta de usuarios del sistema.
 * Rutas base: /api/users y /api/usuarios.
 * Soporta consulta GET de todos los usuarios registrados.
 */
public class ManejadorUsuarios extends ManejadorBase {
    private final UsuarioDAO usuarioDAO;
    private final Gson gson;

    /**
     * Constructor que inicializa el DAO de usuarios y el convertidor Gson.
     */
    public ManejadorUsuarios() {
        this.usuarioDAO = new UsuarioDAO();
        this.gson = new Gson();
    }

    /**
     * Procesa las solicitudes entrantes.
     * GET /api/users o /api/usuarios — Devuelve la lista completa de usuarios en formato JSON.
     */
    @Override
    protected void procesarPeticion(HttpExchange intercambio) throws Exception {
        String metodo = intercambio.getRequestMethod();
        String ruta = intercambio.getRequestURI().getPath();

        if ("GET".equalsIgnoreCase(metodo)) {
            List<Usuario> usuarios = usuarioDAO.obtenerTodosLosUsuarios();
            enviarRespuestaJson(intercambio, 200, gson.toJson(usuarios));
        } else if ("PUT".equalsIgnoreCase(metodo)) {
            var identidad = obtenerIdentidad(intercambio);
            if (identidad.isEmpty()) {
                enviarRespuestaJson(intercambio, 401, "{\"error\":\"Autenticación requerida\"}");
                return;
            }
            if (!identidad.get().esAdministrador()) {
                enviarRespuestaJson(intercambio, 403, "{\"error\":\"Se requieren permisos de administrador\"}");
                return;
            }
            int idUsuario = extraerIdRuta(ruta);

            if (idUsuario <= 0) {
                enviarRespuestaJson(intercambio, 400, "{\"error\":\"Identificador de usuario inválido en la ruta\"}");
                return;
            }

            String cuerpo = new String(leerCuerpoSeguro(intercambio), java.nio.charset.StandardCharsets.UTF_8);
            com.google.gson.JsonObject objetoJson;
            try {
                objetoJson = com.google.gson.JsonParser.parseString(cuerpo).getAsJsonObject();
            } catch (Exception e) {
                enviarRespuestaJson(intercambio, 400, "{\"error\":\"Cuerpo JSON inválido\"}");
                return;
            }

            boolean exito = false;
            if (ruta.contains("/rol") || ruta.contains("/role") || objetoJson.has("role") || objetoJson.has("rol")) {
                String nuevoRol = (objetoJson.has("role") && !objetoJson.get("role").isJsonNull()) ? objetoJson.get("role").getAsString()
                                : ((objetoJson.has("rol") && !objetoJson.get("rol").isJsonNull()) ? objetoJson.get("rol").getAsString() : null);
                if (nuevoRol == null || !java.util.Set.of("cliente", "vendedor", "administrador").contains(nuevoRol.trim().toLowerCase())) {
                    enviarRespuestaJson(intercambio, 400, "{\"error\":\"Rol inválido. Valores permitidos: cliente, vendedor, administrador\"}");
                    return;
                }
                exito = usuarioDAO.actualizarRolUsuario(idUsuario, nuevoRol.trim().toLowerCase());
            } else if (ruta.contains("/estado") || ruta.contains("/status") || objetoJson.has("active") || objetoJson.has("activo")) {
                boolean nuevoEstado = objetoJson.has("active") ? objetoJson.get("active").getAsBoolean()
                                    : (objetoJson.has("activo") ? objetoJson.get("activo").getAsBoolean() : true);
                exito = usuarioDAO.actualizarEstadoUsuario(idUsuario, nuevoEstado);
            }

            if (exito) {
                enviarRespuestaJson(intercambio, 200, "{\"success\":true}");
            } else {
                enviarRespuestaJson(intercambio, 500, "{\"error\":\"No se pudo actualizar el usuario\"}");
            }
        } else {
            enviarRespuestaJson(intercambio, 405, "{\"error\":\"Método no permitido\"}");
        }
    }
}
