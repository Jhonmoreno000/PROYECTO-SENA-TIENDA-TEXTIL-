package application.services;

import domain.models.User;
import domain.repositories.UserRepository;
import domain.exceptions.DomainException;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Optional;

/**
 * Servicio de Autenticación refactorizado.
 */
public class AuthService {
    private final UserRepository userRepository;

    public AuthService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User login(String email, String password) {
        if (email == null || email.isBlank() || password == null || password.isBlank()) {
            throw new DomainException("El correo y contraseña son obligatorios");
        }

        String hash = hashPassword(password);
        Optional<User> userOpt = userRepository.findByEmailAndMatchPassword(email, hash);
        
        if (userOpt.isEmpty()) {
            throw new DomainException("Credenciales incorrectas");
        }

        User user = userOpt.get();
        if (user.isSuspended()) {
            throw new DomainException("Cuenta suspendida: " + user.getSuspensionReason());
        }

        userRepository.updateLastLogin(user.getId());
        return user;
    }

    public void registerClient(String name, String email, String password) {
        if (name == null || name.isBlank() || email == null || email.isBlank() || password == null || password.isBlank()) {
            throw new DomainException("Todos los campos obligatorios deben ser completados.");
        }

        User newUser = new User(0, name, email, "cliente", true, false, null, null, null, null, null);
        String hashedPass = hashPassword(password);
        
        boolean success = userRepository.save(newUser, hashedPass);
        if (!success) {
            throw new DomainException("Error al registrar usuario. Es posible que el correo ya exista.");
        }
    }

    private String hashPassword(String password) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            md.update(password.getBytes());
            byte[] digest = md.digest();
            StringBuilder sb = new StringBuilder();
            for (byte b : digest) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("Error interno de sistema criptográfico", e);
        }
    }
}
