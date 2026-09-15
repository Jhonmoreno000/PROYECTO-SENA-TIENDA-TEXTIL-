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
        if ("GET".equalsIgnoreCase(intercambio.getRequestMethod())) {
            List<Usuario> usuarios = usuarioDAO.obtenerTodosLosUsuarios();
            enviarRespuestaJson(intercambio, 200, gson.toJson(usuarios));
        } else {
            enviarRespuestaJson(intercambio, 405, "{\"error\":\"Método no permitido\"}");
        }
    }
}
