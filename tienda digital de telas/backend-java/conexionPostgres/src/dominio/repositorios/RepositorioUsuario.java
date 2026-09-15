package dominio.repositorios;

import dominio.modelos.Usuario;
import java.util.Optional;

/**
 * Contrato del repositorio de Usuarios (Abstracción de Base de Datos).
 */
public interface RepositorioUsuario {
    /**
     * Busca un usuario activo por su correo electrónico.
     * @param correo Correo electrónico a buscar.
     * @return Optional con el usuario si existe y está activo.
     */
    Optional<Usuario> buscarPorCorreoYActivo(String correo);

    /**
     * Busca un usuario por correo y valida que su hash coincida.
     * @param correo Correo electrónico del usuario.
     * @param hashPlano Hash de la contraseña ingresada.
     * @return Optional con el usuario si las credenciales son válidas.
     */
    Optional<Usuario> buscarPorCorreoYValidarContrasena(String correo, String hashPlano);

    /**
     * Guarda un nuevo usuario con su contraseña cifrada.
     * @param usuario Instancia del usuario a guardar.
     * @param contrasenaHasheada Hash SHA-256 de la contraseña.
     * @return true si se guardó exitosamente.
     */
    boolean guardar(Usuario usuario, String contrasenaHasheada);

    /**
     * Actualiza la fecha y hora del último inicio de sesión del usuario.
     * @param idUsuario Identificador del usuario.
     */
    void actualizarUltimoAcceso(int idUsuario);
}
