package domain.repositories;

import domain.models.User;
import java.util.Optional;

/**
 * Contrato del repositorio de Usuarios (Abstracción de Base de Datos).
 */
public interface UserRepository {
    Optional<User> findByEmailAndActive(String email);
    Optional<User> findByEmailAndMatchPassword(String email, String plainHash);
    boolean save(User user, String hashedPassword);
    void updateLastLogin(int userId);
}
