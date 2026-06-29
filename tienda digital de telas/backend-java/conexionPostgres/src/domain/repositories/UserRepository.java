// Declara el paquete al que pertenece esta interfaz, dentro de la capa de dominio (repositorios)
package domain.repositories;

// Importa la clase User del dominio que representa el modelo de datos del usuario
import domain.models.User;
// Importa Optional del paquete java.util para manejar resultados de búsqueda que pueden estar vacíos
import java.util.Optional;

/**
 * Contrato del repositorio de Usuarios (Abstracción de Base de Datos).
 */
// Define la interfaz pública UserRepository que actúa como contrato para el acceso a datos de usuarios
public interface UserRepository {
    // Método que busca un usuario por su correo electrónico y verifica que esté activo, retornando un Optional
    Optional<User> findByEmailAndActive(String email);
    // Método que busca un usuario por correo y verifica que el hash de contraseña coincida, retornando un Optional
    Optional<User> findByEmailAndMatchPassword(String email, String plainHash);
    // Método que guarda un nuevo usuario con su contraseña hasheada, retornando true si la operación fue exitosa
    boolean save(User user, String hashedPassword);
    // Método que actualiza la fecha y hora del último inicio de sesión de un usuario identificado por su ID
    void updateLastLogin(int userId);
}
