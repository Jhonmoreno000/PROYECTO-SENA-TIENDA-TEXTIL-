package dominio.repositorios;

import dominio.modelos.Usuario;
import java.util.List;
import java.util.Optional;

/**
 * Puerto de Repositorio de Dominio para la entidad Usuario (Arquitectura Limpia / DDD).
 * Define las operaciones abstractas de persistencia y consulta para los usuarios del sistema.
 */
public interface RepositorioUsuario {

    /**
     * Busca un usuario por su identificador.
     */
    Optional<Usuario> buscarPorId(int idUsuario);

    /**
     * Busca un usuario por su correo electrónico verificando que se encuentre activo.
     */
    Optional<Usuario> buscarPorCorreoYActivo(String correo);

    /**
     * Valida las credenciales de acceso de un usuario mediante su correo y hash de contraseña.
     */
    Optional<Usuario> buscarPorCorreoYValidarContrasena(String correo, String hashPlano);

    /**
     * Persiste un nuevo usuario en la base de datos con su contraseña encriptada.
     */
    boolean guardar(Usuario usuario, String contrasenaHasheada);

    /**
     * Actualiza la fecha y hora del último acceso exitoso del usuario.
     */
    void actualizarUltimoAcceso(int idUsuario);

    /**
     * Recupera la totalidad de los usuarios registrados en el sistema.
     */
    List<Usuario> obtenerTodosLosUsuarios();

    /**
     * Actualiza el estado activo/inactivo de un usuario.
     */
    boolean actualizarEstadoUsuario(int idUsuario, boolean activo);

    /**
     * Actualiza el rol asignado a un usuario (administrador, vendedor, cliente).
     */
    boolean actualizarRolUsuario(int idUsuario, String nuevoRol);
}
