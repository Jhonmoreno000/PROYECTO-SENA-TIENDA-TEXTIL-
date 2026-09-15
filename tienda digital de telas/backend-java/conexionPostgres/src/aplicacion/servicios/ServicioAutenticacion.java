package aplicacion.servicios;

import dominio.modelos.Usuario;
import dominio.repositorios.RepositorioUsuario;
import dominio.excepciones.ExcepcionDominio;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Optional;

/**
 * Servicio de Autenticación de la capa de aplicación.
 */
public class ServicioAutenticacion {
    private final RepositorioUsuario repositorioUsuario;

    public ServicioAutenticacion(RepositorioUsuario repositorioUsuario) {
        this.repositorioUsuario = repositorioUsuario;
    }

    /**
     * Autentica un usuario mediante su correo y contraseña.
     * @param correo Correo electrónico del usuario.
     * @param contrasena Contraseña en texto plano.
     * @return Usuario autenticado.
     */
    public Usuario iniciarSesion(String correo, String contrasena) {
        if (correo == null || correo.isBlank() || contrasena == null || contrasena.isBlank()) {
            throw new ExcepcionDominio("El correo y la contraseña son obligatorios.");
        }

        String hash = generarHashContrasena(contrasena);
        Optional<Usuario> usuarioOpt = repositorioUsuario.buscarPorCorreoYValidarContrasena(correo, hash);

        if (usuarioOpt.isEmpty()) {
            throw new ExcepcionDominio("Credenciales incorrectas.");
        }

        Usuario usuario = usuarioOpt.get();
        if (usuario.isSuspendido()) {
            throw new ExcepcionDominio("Cuenta suspendida: " + usuario.getMotivoSuspension());
        }

        repositorioUsuario.actualizarUltimoAcceso(usuario.getId());
        return usuario;
    }

    /**
     * Registra un nuevo usuario con rol de cliente.
     * @param nombre Nombre completo.
     * @param correo Correo electrónico.
     * @param contrasena Contraseña en texto plano.
     */
    public void registrarCliente(String nombre, String correo, String contrasena) {
        if (nombre == null || nombre.isBlank() || correo == null || correo.isBlank() || contrasena == null || contrasena.isBlank()) {
            throw new ExcepcionDominio("Todos los campos obligatorios deben ser completados.");
        }

        Usuario nuevoUsuario = new Usuario(0, nombre, correo, "cliente", true, false, null, null, null, null, null);
        String contrasenaCifrada = generarHashContrasena(contrasena);

        boolean guardadoExitoso = repositorioUsuario.guardar(nuevoUsuario, contrasenaCifrada);
        if (!guardadoExitoso) {
            throw new ExcepcionDominio("Error al registrar usuario. Es posible que el correo ya exista.");
        }
    }

    /**
     * Genera un hash criptográfico SHA-256 a partir de una contraseña en texto plano.
     * @param contrasena Contraseña en texto plano.
     * @return Cadena en formato hexadecimal con el hash SHA-256.
     */
    public static String generarHashContrasena(String contrasena) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            md.update(contrasena.getBytes());
            byte[] bytes = md.digest();
            StringBuilder sb = new StringBuilder();
            for (byte b : bytes) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 no disponible en la plataforma JVM", e);
        }
    }
}
