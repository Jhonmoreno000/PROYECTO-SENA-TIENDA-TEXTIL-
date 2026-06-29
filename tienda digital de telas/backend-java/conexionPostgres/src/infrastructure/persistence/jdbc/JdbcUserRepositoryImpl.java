package infrastructure.persistence.jdbc;

import domain.models.User;
import domain.repositories.UserRepository;
import infrastructure.config.Conexion;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.Optional;

/**
 * Implementacion JDBC del Repositorio de Usuarios (UserRepository).
 * Esta clase es el adaptador de infraestructura para el puerto definido
 * en la capa de dominio (Clean Architecture). Proporciona operaciones
 * de busqueda, guardado y actualizacion sobre la tabla 'users'.
 */
public class JdbcUserRepositoryImpl implements UserRepository {

    /**
     * Busca un usuario activo por su correo electronico.
     * @param email Correo electronico del usuario a buscar.
     * @return Optional con el User si existe y esta activo, Optional.empty() si no.
     */
    @Override
    public Optional<User> findByEmailAndActive(String email) {
        // Consulta el usuario activo incluyendo todos los campos relevantes
        String query = "SELECT id, name, email, role, active, suspended, suspension_reason, commission_rate, " +
                "registered_at, last_login, password_hash FROM users WHERE email = ? AND active = true";

        try (Connection con = Conexion.getConnection();
             PreparedStatement pst = con.prepareStatement(query)) {
            pst.setString(1, email);
            try (ResultSet rs = pst.executeQuery()) {
                if (rs.next()) {
                    User user = new User(
                        rs.getInt("id"),
                        rs.getString("name"),
                        rs.getString("email"),
                        rs.getString("role"),
                        rs.getBoolean("active"),
                        rs.getBoolean("suspended"),
                        rs.getString("suspension_reason"),
                        rs.getDouble("commission_rate"),
                        rs.getString("registered_at"),
                        rs.getString("last_login"),
                        null // Status se deriva posteriormente
                    );
                    
                    // Nota tecnica: En Clean Architecture el DAO no deberia hacer Hashes ni validacion de hashes
                    // pero dado que el hash viaja junto al registro, debemos pasar el Hash al Domain si quisieramos
                    // que el servicio lo valide en memoria. Como lo hace la base actual, lo simplificamos a la capa DB
                    // ya que no hay una entidad Password aislada en tu Domain.
                    return Optional.of(user);
                }
            }
        } catch (SQLException e) {
            // Error: No se pudo buscar el usuario por email
            e.printStackTrace();
        }
        return Optional.empty();
    }
    
    /**
     * Busca un usuario activo por email y verifica que el hash de contrasena
     * coincida. Metodo de compatibilidad con la validacion de contrasena del
     * antiguo AuthDAO.
     * @param email     Correo electronico del usuario.
     * @param plainHash Hash SHA-256 de la contrasena en texto plano.
     * @return Optional con el User si coincide, Optional.empty() si no.
     */
    public Optional<User> findByEmailAndMatchPassword(String email, String plainHash) {
         // Consulta que verifica tanto el email como el hash en la misma sentencia SQL
         String query = "SELECT id, name, email, role, active, suspended, suspension_reason, commission_rate, " +
                "registered_at, last_login, password_hash FROM users WHERE email = ? AND password_hash = ? AND active = true";

        try (Connection con = Conexion.getConnection();
             PreparedStatement pst = con.prepareStatement(query)) {
            pst.setString(1, email);
            pst.setString(2, plainHash);
            try (ResultSet rs = pst.executeQuery()) {
                if (rs.next()) {
                    User user = new User(
                        rs.getInt("id"),
                        rs.getString("name"),
                        rs.getString("email"),
                        rs.getString("role"),
                        rs.getBoolean("active"),
                        rs.getBoolean("suspended"),
                        rs.getString("suspension_reason"),
                        rs.getDouble("commission_rate"),
                        rs.getString("registered_at"),
                        rs.getString("last_login"),
                        null 
                    );
                    return Optional.of(user);
                }
            }
        } catch (SQLException e) {
            // Error: No se pudo realizar la busqueda con validacion de hash
            e.printStackTrace();
        }
        return Optional.empty();
    }

    /**
     * Guarda un nuevo usuario en la base de datos.
     * @param user          Objeto User con los datos del nuevo usuario.
     * @param hashedPassword Hash SHA-256 de la contrasena (ya procesada).
     * @return true si el guardado fue exitoso, false en caso de error.
     */
    @Override
    public boolean save(User user, String hashedPassword) {
        // Inserta un nuevo usuario con rol por defecto 'cliente' y active=true
        String query = "INSERT INTO users (name, email, role, active, password_hash) VALUES (?, ?, ?, ?, ?)";
        try (Connection con = Conexion.getConnection();
             PreparedStatement pst = con.prepareStatement(query)) {
            pst.setString(1, user.getName());
            pst.setString(2, user.getEmail());
            pst.setString(3, user.getRole() != null ? user.getRole() : "cliente");
            pst.setBoolean(4, true);
            pst.setString(5, hashedPassword);

            return pst.executeUpdate() > 0;
        } catch (SQLException e) {
            // Error: No se pudo insertar el nuevo usuario (email duplicado, BD caida)
            e.printStackTrace();
            return false;
        }
    }

    /**
     * Actualiza la fecha/hora del ultimo inicio de sesion de un usuario.
     * @param userId Identificador del usuario.
     */
    @Override
    public void updateLastLogin(int userId) {
        String query = "UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?";
        try (Connection con = Conexion.getConnection();
             PreparedStatement pst = con.prepareStatement(query)) {
            pst.setInt(1, userId);
            pst.executeUpdate();
        } catch (SQLException e) {
            // Error: No se pudo actualizar la fecha de ultimo inicio de sesion
            e.printStackTrace();
        }
    }
}
