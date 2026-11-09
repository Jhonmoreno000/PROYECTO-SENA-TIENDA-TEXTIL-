package aplicacion.servicios;

import dominio.modelos.Usuario;
import dominio.repositorios.RepositorioUsuario;
import dominio.excepciones.ExcepcionDominio;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Optional;
import java.util.UUID;

/**
 * Servicio de autenticación y seguridad de cuentas de la capa de aplicación.
 * Gestiona el inicio de sesión tradicional, el registro con consentimiento de Habeas Data,
 * la federación de identidad SSO (Google/Microsoft) y la validación preventiva PCI-DSS.
 */
public class ServicioAutenticacion {

    /** Puerto de persistencia (`RepositorioUsuario`) para consulta y registro de usuarios. */
    private final RepositorioUsuario repositorioUsuario;

    /** Verificador criptográfico/HTTP (`VerificadorIdentidadSSO`) de tokens OAuth2 externos. */
    private final VerificadorIdentidadSSO verificadorSSO;

    /**
     * Construye el servicio de autenticación sin proveedor SSO externo.
     *
     * @param repositorioUsuario Repositorio de dominio ({@link RepositorioUsuario}) para acceso a usuarios.
     */
    public ServicioAutenticacion(RepositorioUsuario repositorioUsuario) {
        this(repositorioUsuario, null);
    }

    /**
     * Construye el servicio de autenticación inyectando el repositorio de usuarios y el verificador SSO.
     *
     * @param repositorioUsuario Repositorio de dominio ({@link RepositorioUsuario}) para acceso a usuarios.
     * @param verificadorSSO Implementación de {@link VerificadorIdentidadSSO} para validar tokens OAuth2.
     */
    public ServicioAutenticacion(RepositorioUsuario repositorioUsuario, VerificadorIdentidadSSO verificadorSSO) {
        this.repositorioUsuario = repositorioUsuario;
        this.verificadorSSO = verificadorSSO;
    }

    /**
     * Autentica un usuario mediante su correo electrónico y contraseña en texto plano.
     *
     * @param correo Correo electrónico del usuario (`String`).
     * @param contrasena Contraseña en texto plano (`String`).
     * @return Instancia de {@link Usuario} autenticada y activa.
     * @throws ExcepcionDominio Si faltan credenciales, son inválidas o la cuenta está suspendida.
     */
    public Usuario iniciarSesion(String correo, String contrasena) {
        if (correo == null || correo.isBlank() || contrasena == null || contrasena.isBlank()) {
            throw new ExcepcionDominio("El correo y la contraseña son obligatorios.");
        }

        correo = correo.trim().toLowerCase();
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
     * Registra un nuevo usuario con rol `cliente` verificando el consentimiento de Habeas Data (Ley 1581 de 2012).
     *
     * @param nombre Nombre completo del cliente (`String`).
     * @param correo Correo electrónico único (`String`).
     * @param contrasena Contraseña en texto plano (`String`, mínimo 8 caracteres).
     * @param aceptaHabeasData Indicador booleano (`boolean`) de aceptación de política de tratamiento de datos.
     * @throws ExcepcionDominio Si no acepta Habeas Data, los datos son inválidos o el correo ya existe.
     */
    public void registrarCliente(String nombre, String correo, String contrasena, boolean aceptaHabeasData) {
        if (!aceptaHabeasData) {
            throw new ExcepcionDominio("Es obligatorio aceptar expresamente la Política de Tratamiento de Datos Personales (Ley 1581 de 2012 - Habeas Data).");
        }

        if (nombre == null || nombre.isBlank() || correo == null || correo.isBlank() || contrasena == null || contrasena.isBlank()) {
            throw new ExcepcionDominio("Todos los campos obligatorios deben ser completados.");
        }

        correo = correo.trim().toLowerCase();
        if (!correo.matches("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$")) {
            throw new ExcepcionDominio("El formato del correo electrónico no es válido.");
        }
        if (contrasena.length() < 8) {
            throw new ExcepcionDominio("La contraseña debe tener al menos 8 caracteres.");
        }

        Usuario nuevoUsuario = new Usuario(0, nombre.trim(), correo, "cliente", true, false, null, null, null, null, null);
        String contrasenaCifrada = generarHashContrasena(contrasena);

        boolean guardadoExitoso = repositorioUsuario.guardar(nuevoUsuario, contrasenaCifrada);
        if (!guardadoExitoso) {
            throw new ExcepcionDominio("Error al registrar usuario. Es posible que el correo ya exista.");
        }
    }

    /**
     * Inicia sesión con Google o Microsoft validando previamente el token con el proveedor oficial.
     *
     * @param proveedor Identificador del proveedor (`String`: `"google"` o `"microsoft"`).
     * @param tokenAcceso Token de acceso OAuth2 (`String`) emitido por el proveedor.
     * @return Objeto {@link Usuario} autenticado o registrado automáticamente.
     * @throws ExcepcionDominio Si el verificador SSO no está disponible o el token es inválido.
     */
    public Usuario autenticarConSSO(String proveedor, String tokenAcceso) {
        if (verificadorSSO == null) {
            throw new ExcepcionDominio("El inicio de sesión con Google o Microsoft no está disponible en este servidor.");
        }
        VerificadorIdentidadSSO.IdentidadSSO identidad = verificadorSSO.verificar(proveedor, tokenAcceso);
        return autenticarOAutoRegistrarSSO(identidad.correo(), identidad.nombre());
    }

    /**
     * Autentica o auto-registra un usuario cuyo correo electrónico ya fue verificado por un proveedor SSO.
     *
     * @param correo Correo electrónico verificado (`String`).
     * @param nombre Nombre visible devuelto por el proveedor (`String`).
     * @return Instancia de {@link Usuario} autenticada.
     * @throws ExcepcionDominio Si el correo es nulo, la cuenta está suspendida o falla el registro.
     */
    public Usuario autenticarOAutoRegistrarSSO(String correo, String nombre) {
        if (correo == null || correo.isBlank()) {
            throw new ExcepcionDominio("El correo electrónico del proveedor SSO es obligatorio.");
        }

        correo = correo.trim().toLowerCase();
        Optional<Usuario> usuarioOpt = repositorioUsuario.buscarPorCorreoYActivo(correo);
        if (usuarioOpt.isPresent()) {
            Usuario usuario = usuarioOpt.get();
            if (usuario.isSuspendido()) {
                throw new ExcepcionDominio("Cuenta suspendida: " + usuario.getMotivoSuspension());
            }
            repositorioUsuario.actualizarUltimoAcceso(usuario.getId());
            return usuario;
        }

        String nombreFinal = (nombre != null && !nombre.isBlank()) ? nombre : correo.split("@")[0];
        Usuario nuevoUsuario = new Usuario(0, nombreFinal, correo, "cliente", true, false, null, null, null, null, null);
        String contrasenaSeguraSSO = generarHashContrasena("oauth-sso-" + UUID.randomUUID());

        boolean creado = repositorioUsuario.guardar(nuevoUsuario, contrasenaSeguraSSO);
        if (!creado) {
            throw new ExcepcionDominio("No fue posible crear la cuenta para el usuario de SSO.");
        }

        return repositorioUsuario.buscarPorCorreoYActivo(correo)
            .orElseThrow(() -> new ExcepcionDominio("Error al recuperar el usuario de SSO recién registrado."));
    }

    /**
     * Regla de seguridad PCI-DSS que detecta si una cadena contiene números de tarjeta (PAN) o códigos CVV/CVC.
     *
     * @param texto Cadena de texto o carga útil JSON (`String`) a inspeccionar.
     * @return `true` si se detectan patrones de PAN o CVV; `false` si el contenido es seguro.
     */
    public static boolean contieneDatosTarjetaSensibles(String texto) {
        if (texto == null || texto.isBlank()) return false;
        boolean contienePAN = texto.matches(".*\\b(?:\\d[ -]*?){13,19}\\b.*");
        boolean contieneCVV = texto.toLowerCase().matches(".*(?:cvv|cvc|codigo_seguridad)[\\s:=]+[0-9]{3,4}.*");
        return contienePAN || contieneCVV;
    }

    /**
     * Genera un resumen criptográfico SHA-256 en formato hexadecimal a partir de una contraseña UTF-8.
     *
     * @param contrasena Contraseña en texto plano (`String`).
     * @return Hash SHA-256 (`String`) en minúsculas.
     */
    public static String generarHashContrasena(String contrasena) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            digest.update(contrasena.getBytes(StandardCharsets.UTF_8));
            byte[] bytes = digest.digest();
            StringBuilder constructorCadena = new StringBuilder();
            for (byte b : bytes) {
                constructorCadena.append(String.format("%02x", b));
            }
            return constructorCadena.toString();
        } catch (NoSuchAlgorithmException excepcion) {
            throw new RuntimeException("SHA-256 no disponible en la plataforma JVM", excepcion);
        }
    }
}
