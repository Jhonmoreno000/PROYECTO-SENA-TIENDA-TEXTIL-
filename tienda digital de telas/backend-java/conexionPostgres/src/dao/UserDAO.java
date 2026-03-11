package dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

import conexion.Conexion;
import models.User;

public class UserDAO {

    public List<User> getAllUsers() {
        List<User> users = new ArrayList<>();
        String query = "SELECT id, name, email, role, active, suspended, suspension_reason, commission_rate, " +
                "registered_at, last_login FROM users ORDER BY id ASC";

        Connection con = Conexion.getConnection();
        try (PreparedStatement pst = con.prepareStatement(query);
                ResultSet rs = pst.executeQuery()) {

            while (rs.next()) {
                User user = new User();
                user.setId(rs.getInt("id"));
                user.setName(rs.getString("name"));
                user.setEmail(rs.getString("email"));
                user.setRole(rs.getString("role"));
                user.setActive(rs.getBoolean("active"));
                user.setSuspended(rs.getBoolean("suspended"));
                user.setSuspensionReason(rs.getString("suspension_reason"));

                // Handling nullable double
                double commission = rs.getDouble("commission_rate");
                if (!rs.wasNull()) {
                    user.setCommissionRate(commission);
                }

                // Parsing timestamps to String for JSON serialization
                if (rs.getTimestamp("registered_at") != null) {
                    user.setRegisteredAt(rs.getTimestamp("registered_at").toString());
                }
                if (rs.getTimestamp("last_login") != null) {
                    user.setLastLogin(rs.getTimestamp("last_login").toString());
                }

                // Derive status for frontend
                if (user.isSuspended()) {
                    user.setStatus("Suspendido");
                } else if (!user.isActive()) {
                    user.setStatus("Inactivo");
                } else {
                    user.setStatus("Activo");
                }

                users.add(user);
            }

        } catch (SQLException e) {
            System.err.println("❌ Error obteniendo usuarios: " + e.getMessage());
            e.printStackTrace();
        }

        return users;
    }
}
