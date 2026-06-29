// Declara el paquete al que pertenece esta clase, dentro de la capa de aplicación (servicios)
package application.services;

// Importa la clase User del dominio para representar el modelo de usuario autenticado
import domain.models.User;
// Importa la interfaz UserRepository del dominio para acceder a los datos persistentes de usuarios
import domain.repositories.UserRepository;
// Importa la excepción DomainException para lanzar errores relacionados con reglas de negocio del dominio
import domain.exceptions.DomainException;

// Importa MessageDigest del paquete de seguridad para generar hashes SHA-256 de contraseñas
import java.security.MessageDigest;
// Importa NoSuchAlgorithmException para capturar la ausencia del algoritmo criptográfico en la JVM
import java.security.NoSuchAlgorithmException;
// Importa Optional para manejar valores que pueden estar presentes o ausentes sin usar null
import java.util.Optional;

/**
 * Servicio de Autenticación refactorizado.
 */
public class AuthService {
    // Referencia inmutable al repositorio de usuarios, inyectada por constructor (principio de inversión de dependencias)
    private final UserRepository userRepository;

    // Constructor público que recibe una implementación concreta de UserRepository para desacoplar la capa de datos
    public AuthService(UserRepository userRepository) {
        // Asigna la referencia del repositorio recibido al campo privado de la clase
        this.userRepository = userRepository;
    }

    // Método público que autentica un usuario mediante correo electrónico y contraseña, retornando el objeto User
    public User login(String email, String password) {
        // Verifica si el correo o la contraseña son nulos, están vacíos o contienen solo espacios en blanco
        if (email == null || email.isBlank() || password == null || password.isBlank()) {
            // Lanza una excepción de dominio indicando que ambos campos son obligatorios para iniciar sesión
            throw new DomainException("El correo y contraseña son obligatorios");
        }

        // Calcula el hash SHA-256 de la contraseña proporcionada por el usuario
        String hash = hashPassword(password);
        // Busca en el repositorio un usuario cuyo correo coincida y cuya contraseña haga match con el hash calculado
        Optional<User> userOpt = userRepository.findByEmailAndMatchPassword(email, hash);
        
        // Verifica si el Optional está vacío, lo que significa que no se encontró un usuario con esas credenciales
        if (userOpt.isEmpty()) {
            // Lanza una excepción de dominio indicando que las credenciales proporcionadas son incorrectas
            throw new DomainException("Credenciales incorrectas");
        }

        // Extrae el objeto User del Optional, que en este punto sabemos que está presente
        User user = userOpt.get();
        // Verifica si el usuario tiene su cuenta suspendida mediante el método isSuspended del modelo
        if (user.isSuspended()) {
            // Lanza una excepción de dominio con el motivo específico de la suspensión de la cuenta
            throw new DomainException("Cuenta suspendida: " + user.getSuspensionReason());
        }

        // Actualiza la fecha y hora del último inicio de sesión del usuario en la base de datos
        userRepository.updateLastLogin(user.getId());
        // Retorna el objeto User completamente autenticado y verificado
        return user;
    }

    // Método público que registra un nuevo usuario con rol de cliente en el sistema
    public void registerClient(String name, String email, String password) {
        // Valida que el nombre, correo y contraseña no sean nulos, vacíos o contengan solo espacios en blanco
        if (name == null || name.isBlank() || email == null || email.isBlank() || password == null || password.isBlank()) {
            // Lanza una excepción de dominio si algún campo obligatorio no está correctamente diligenciado
            throw new DomainException("Todos los campos obligatorios deben ser completados.");
        }

        // Crea una nueva instancia de User con los datos proporcionados y valores predeterminados para el resto de campos
        User newUser = new User(0, name, email, "cliente", true, false, null, null, null, null, null);
        // Calcula el hash SHA-256 de la contraseña proporcionada para almacenarla de forma segura
        String hashedPass = hashPassword(password);
        
        // Intenta guardar el nuevo usuario en el repositorio y captura el resultado booleano de la operación
        boolean success = userRepository.save(newUser, hashedPass);
        // Verifica si la operación de guardado falló (retornó false)
        if (!success) {
            // Lanza una excepción de dominio indicando que el registro falló, posiblemente por correo duplicado
            throw new DomainException("Error al registrar usuario. Es posible que el correo ya exista.");
        }
    }

    // Método privado que genera un hash SHA-256 a partir de una contraseña en texto plano
    private String hashPassword(String password) {
        try {
            // Obtiene una instancia del algoritmo MessageDigest para SHA-256
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            // Convierte la contraseña en bytes y los pasa al digestor para iniciar el proceso de hash
            md.update(password.getBytes());
            // Calcula el hash y obtiene el arreglo de bytes resultante (32 bytes para SHA-256)
            byte[] digest = md.digest();
            // Crea un StringBuilder para construir eficientemente la representación hexadecimal del hash
            StringBuilder sb = new StringBuilder();
            // Recorre cada byte del digest para convertirlo a su representación hexadecimal de dos caracteres
            for (byte b : digest) {
                // Agrega el byte formateado como cadena hexadecimal de dos dígitos al StringBuilder
                sb.append(String.format("%02x", b));
            }
            // Retorna la cadena hexadecimal completa que representa el hash SHA-256 de la contraseña
            return sb.toString();
        // Captura la excepción si el algoritmo SHA-256 no está disponible en el entorno de ejecución
        } catch (NoSuchAlgorithmException e) {
            // Lanza una RuntimeException indicando un error interno del sistema criptográfico
            throw new RuntimeException("Error interno de sistema criptográfico", e);
        }
    }
}
