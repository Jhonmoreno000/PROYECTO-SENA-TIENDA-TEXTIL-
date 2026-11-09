package dominio.repositorios;

import dominio.modelos.Usuario;
import java.util.List;
import java.util.Optional;

/**
 * Puerto de repositorio de dominio para la entidad {@link Usuario}.
 * Define las operaciones de persistencia, autenticación y administración de cuentas de usuario.
 */
public interface RepositorioUsuario {

    /**
     * Busca un usuario por su identificador único.
     *
     * @param idUsuario Identificador único del usuario (`int`).
     * @return {@link Optional} con el {@link Usuario} encontrado o vacío si no existe.
     */
    Optional<Usuario> buscarPorId(int idUsuario);

    /**
     * Busca un usuario por su correo electrónico verificando que su cuenta se encuentre activa.
     *
     * @param correo Correo electrónico del usuario (`String`).
     * @return {@link Optional} con el {@link Usuario} encontrado, o vacío si no existe o está inactivo.
     */
    Optional<Usuario> buscarPorCorreoYActivo(String correo);

    /**
     * Valida las credenciales de acceso de un usuario mediante su correo y hash SHA-256 de contraseña.
     *
     * @param correo Correo electrónico del usuario (`String`).
     * @param hashPlano Resumen SHA-256 de la contraseña (`String`).
     * @return {@link Optional} con el {@link Usuario} autenticado, o vacío si las credenciales no coinciden.
     */
    Optional<Usuario> buscarPorCorreoYValidarContrasena(String correo, String hashPlano);

    /**
     * Persiste un nuevo usuario en la base de datos junto con su contraseña cifrada.
     *
     * @param usuario Entidad {@link Usuario} con los datos de perfil.
     * @param contrasenaHasheada Hash SHA-256 de la contraseña (`String`).
     * @return `true` si el registro fue insertado exitosamente; `false` en caso de conflicto o error.
     */
    boolean guardar(Usuario usuario, String contrasenaHasheada);

    /**
     * Actualiza la marca de tiempo del último acceso exitoso del usuario.
     *
     * @param idUsuario Identificador único del usuario (`int`).
     */
    void actualizarUltimoAcceso(int idUsuario);

    /**
     * Recupera la lista completa de usuarios registrados en el sistema.
     *
     * @return Lista (`List<Usuario>`) ordenada por identificador.
     */
    List<Usuario> obtenerTodosLosUsuarios();

    /**
     * Actualiza el estado activo o inactivo de un usuario.
     *
     * @param idUsuario Identificador único del usuario (`int`).
     * @param activo Nuevo estado de activación (`boolean`).
     * @return `true` si se actualizó al menos una fila; `false` en caso contrario.
     */
    boolean actualizarEstadoUsuario(int idUsuario, boolean activo);

    /**
     * Actualiza el rol asignado a un usuario (`administrador`, `vendedor` o `cliente`).
     *
     * @param idUsuario Identificador único del usuario (`int`).
     * @param nuevoRol Nombre del rol a asignar (`String`).
     * @return `true` si el cambio fue persistido; `false` en caso contrario.
     */
    boolean actualizarRolUsuario(int idUsuario, String nuevoRol);
}
