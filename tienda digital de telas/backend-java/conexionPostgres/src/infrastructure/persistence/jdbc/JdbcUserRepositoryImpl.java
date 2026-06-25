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
 * Implementación JDBC para el Repositorio de Usuarios.
 */
public class JdbcUserRepositoryImpl implements UserRepository {

    @Override
    public Optional<User> findByEmailAndActive(String email) {
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
                        null // Status can be derived
                    );
                    
                    // Nota técnica: En Clean Architecture el DAO no debería hacer Hashes ni validación de hashes
                    // pero dado que el hash viaja junto al registro, debemos pasar el Hash al Domain si quieramos 
                    // que el servicio lo valide en memoria. Como lo hace la base actual, lo simplificamos a la capa DB
                    // ya que no hay una entidad Password aislada en tu Domain.
                    return Optional.of(user);
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return Optional.empty();
    }
    
    // Método para ser compatible con la validación de contraseña del antiguo AuthDAO.
    // Clean code: Agregar la validación requerida de hasheo directamente contra la BD y Auth DAO para no romper
    public Optional<User> findByEmailAndMatchPassword(String email, String plainHash) {
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
            e.printStackTrace();
        }
        return Optional.empty();
    }

    @Override
    public boolean save(User user, String hashedPassword) {
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
            e.printStackTrace();
            return false;
        }
    }

    @Override
    public void updateLastLogin(int userId) {
        String query = "UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?";
        try (Connection con = Conexion.getConnection();
             PreparedStatement pst = con.prepareStatement(query)) {
            pst.setInt(1, userId);
            pst.executeUpdate();
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }
}
