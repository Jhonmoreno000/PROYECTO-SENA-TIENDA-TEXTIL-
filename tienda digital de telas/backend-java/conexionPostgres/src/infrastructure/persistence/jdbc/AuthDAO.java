package infrastructure.persistence.jdbc;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

import infrastructure.config.Conexion;
import domain.models.User;

/**
 * DAO (Data Access Object) para Autenticacion.
 * Gestiona el registro e inicio de sesion de usuarios, incluyendo el
 * hashing de contrasenas con SHA-256. Esta clase pertenece a la capa de
 * infraestructura/persistencia del sistema D&D Textil.
 */
public class AuthDAO {

    /**
     * Genera el hash SHA-256 de una contrasena en texto plano.
     * @param password Contrasena en texto plano.
     * @return String hexadecimal de 64 caracteres con el hash.
     * @throws RuntimeException si el algoritmo SHA-256 no esta disponible.
     */
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
            // Error: El algoritmo SHA-256 no esta disponible en el JRE
            throw new RuntimeException(e);
        }
    }

    /**
     * Autentica un usuario por email y contrasena.
     * Compara el hash SHA-256 de la contrasena ingresada con el almacenado.
     * Si la autenticacion es exitosa, actualiza el campo last_login.
     * @param email    Correo electronico del usuario.
     * @param password Contrasena en texto plano.
     * @return Objeto User si la autenticacion es exitosa, null si falla.
     */
    public User login(String email, String password) {
        // Consulta el usuario activo por email, incluyendo el hash almacenado
        String query = "SELECT id, name, email, role, active, suspended, suspension_reason, commission_rate, " +
                "registered_at, last_login, password_hash FROM users WHERE email = ? AND active = true";

        try (Connection con = Conexion.getConnection();
             PreparedStatement pst = con.prepareStatement(query)) {
            pst.setString(1, email);
            try (ResultSet rs = pst.executeQuery()) {
                if (rs.next()) {
                    String storedHash = rs.getString("password_hash");
                    
                    boolean passwordMatches = storedHash != null && storedHash.equals(hashPassword(password));

                    if (passwordMatches) {
                        User user = new User();
                        user.setId(rs.getInt("id"));
                        user.setName(rs.getString("name"));
                        user.setEmail(rs.getString("email"));
                        user.setRole(rs.getString("role"));
                        user.setActive(rs.getBoolean("active"));
                        user.setSuspended(rs.getBoolean("suspended"));
                        user.setSuspensionReason(rs.getString("suspension_reason"));
                        
                        // Actualiza la fecha del ultimo inicio de sesion
                        updateLastLogin(user.getId());

                        return user;
                    }
                }
            }
        } catch (SQLException e) {
            // Error: Fallo la consulta de login (problema de BD o conexion)
            System.err.println("[ERROR] Error en login: " + e.getMessage());
        }
        return null;
    }

    /**
     * Actualiza la fecha/hora del ultimo inicio de sesion de un usuario.
     * @param userId Identificador del usuario.
     */
    private void updateLastLogin(int userId) {
        String query = "UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?";
        try (Connection con = Conexion.getConnection();
             PreparedStatement pst = con.prepareStatement(query)) {
            pst.setInt(1, userId);
            pst.executeUpdate();
        } catch (SQLException e) {
            // Error: No se pudo actualizar last_login (no critico, se registra y continua)
            System.err.println("[WARN] No se pudo actualizar last_login para usuario " + userId + ": " + e.getMessage());
        }
    }

    /**
     * Registra un nuevo usuario en el sistema.
     * @param user     Objeto User con los datos del nuevo usuario.
     * @param password Contrasena en texto plano (se hashea antes de almacenar).
     * @return true si el registro fue exitoso, false en caso de error.
     */
    public boolean register(User user, String password) {
        // Inserta un nuevo usuario con rol por defecto 'cliente' y active=true
        String query = "INSERT INTO users (name, email, role, active, password_hash) VALUES (?, ?, ?, ?, ?)";
        try (Connection con = Conexion.getConnection();
             PreparedStatement pst = con.prepareStatement(query)) {
            pst.setString(1, user.getName());
            pst.setString(2, user.getEmail());
            pst.setString(3, user.getRole() != null ? user.getRole() : "cliente");
            pst.setBoolean(4, true);
            pst.setString(5, hashPassword(password));
            
            int rowsAffected = pst.executeUpdate();
            return rowsAffected > 0;
        } catch (SQLException e) {
            // Error: No se pudo registrar el usuario (email duplicado, BD, etc.)
            System.err.println("[ERROR] Error en registro: " + e.getMessage());
            return false;
        }
    }
}
