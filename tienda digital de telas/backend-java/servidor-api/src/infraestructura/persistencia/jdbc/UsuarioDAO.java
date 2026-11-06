package infraestructura.persistencia.jdbc;

import java.util.List;
import java.util.Optional;
import dominio.modelos.Usuario;
import dominio.repositorios.RepositorioUsuario;

/**
 * DAO para la entidad Usuario.
 * Actúa como adaptador delegando las operaciones al Repositorio de Usuarios unificado
 * (JdbcRepositorioUsuarioImpl), eliminando duplicación de lógica y manteniendo
 * compatibilidad hacia atrás con controladores existentes.
 */
public class UsuarioDAO {

    private final RepositorioUsuario repositorioUsuario;

    public UsuarioDAO() {
        this(new JdbcRepositorioUsuarioImpl());
    }

    public UsuarioDAO(RepositorioUsuario repositorioUsuario) {
        this.repositorioUsuario = repositorioUsuario;
    }

    /**
     * Busca un usuario por su identificador con su rol y estado actuales.
     */
    public Optional<Usuario> buscarPorId(int idUsuario) {
        return repositorioUsuario.buscarPorId(idUsuario);
    }

    /**
     * Recupera todos los usuarios registrados en el sistema ordenados por ID ascendente.
     * @return Lista de objetos Usuario.
     */
    public List<Usuario> obtenerTodosLosUsuarios() {
        return repositorioUsuario.obtenerTodosLosUsuarios();
    }

    /**
     * Actualiza el estado de activación de un usuario en el sistema.
     * @param idUsuario Identificador del usuario.
     * @param activo Estado activo deseado.
     * @return true si se actualizó exitosamente, false en caso contrario.
     */
    public boolean actualizarEstadoUsuario(int idUsuario, boolean activo) {
        return repositorioUsuario.actualizarEstadoUsuario(idUsuario, activo);
    }

    /**
     * Actualiza el rol asignado a un usuario.
     * @param idUsuario Identificador del usuario.
     * @param nuevoRol Nombre del nuevo rol (ej: administrador, vendedor, cliente).
     * @return true si se actualizó exitosamente, false en caso contrario.
     */
    public boolean actualizarRolUsuario(int idUsuario, String nuevoRol) {
        return repositorioUsuario.actualizarRolUsuario(idUsuario, nuevoRol);
    }
}
