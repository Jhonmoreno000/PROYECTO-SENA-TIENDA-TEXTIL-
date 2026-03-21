package dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

import conexion.Conexion;
import models.User;

public class AuthDAO {

    // Helper to hash password
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
            throw new RuntimeException(e);
        }
    }

    public User login(String email, String password) {
        String query = "SELECT id, name, email, role, active, suspended, suspension_reason, commission_rate, " +
                "registered_at, last_login, password_hash FROM users WHERE email = ? AND active = true";

        Connection con = Conexion.getConnection();
        try (PreparedStatement pst = con.prepareStatement(query)) {
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
                        
                        // update last_login
                        updateLastLogin(user.getId());

                        return user;
                    }
                }
            }
        } catch (SQLException e) {
            System.err.println("❌ Error en login: " + e.getMessage());
        }
        return null;
    }

    private void updateLastLogin(int userId) {
        String query = "UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?";
        Connection con = Conexion.getConnection();
        try (PreparedStatement pst = con.prepareStatement(query)) {
            pst.setInt(1, userId);
            pst.executeUpdate();
        } catch (SQLException e) {
            System.err.println("⚠️ No se pudo actualizar last_login para usuario " + userId + ": " + e.getMessage());
        }
    }

    public boolean register(User user, String password) {
        String query = "INSERT INTO users (name, email, role, active, password_hash) VALUES (?, ?, ?, ?, ?)";
        Connection con = Conexion.getConnection();
        try (PreparedStatement pst = con.prepareStatement(query)) {
            pst.setString(1, user.getName());
            pst.setString(2, user.getEmail());
            pst.setString(3, user.getRole() != null ? user.getRole() : "cliente");
            pst.setBoolean(4, true);
            pst.setString(5, hashPassword(password));
            
            int rowsAffected = pst.executeUpdate();
            return rowsAffected > 0;
        } catch (SQLException e) {
            System.err.println("❌ Error en registro: " + e.getMessage());
            return false;
        }
    }
}
