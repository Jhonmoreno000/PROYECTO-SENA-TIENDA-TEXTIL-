package infrastructure.persistence.jdbc;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

import infrastructure.config.Conexion;
import domain.models.User;

/**
 * DAO (Data Access Object) para la entidad Usuario.
 * Gestiona las operaciones de consulta sobre la tabla 'users' del sistema
 * D&D Textil. Esta clase pertenece a la capa de infraestructura/persistencia.
 */
public class UserDAO {

    /**
     * Recupera todos los usuarios registrados en el sistema, ordenados por ID
     * ascendente. Incluye datos de perfil, rol, estado y comision.
     * @return Lista de objetos User con los datos de cada usuario.
     */
    public List<User> getAllUsers() {
        List<User> users = new ArrayList<>();
        // Consulta todos los campos relevantes de usuario, excluyendo password_hash por seguridad
        String query = "SELECT id, name, email, role, active, suspended, suspension_reason, commission_rate, " +
                "registered_at, last_login FROM users ORDER BY id ASC";

        try (Connection con = Conexion.getConnection();
             PreparedStatement pst = con.prepareStatement(query);
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

                // Manejo de campo double nullable
                double commission = rs.getDouble("commission_rate");
                if (!rs.wasNull()) {
                    user.setCommissionRate(commission);
                }

                // Convierte timestamps a String para serializacion JSON
                if (rs.getTimestamp("registered_at") != null) {
                    user.setRegisteredAt(rs.getTimestamp("registered_at").toString());
                }
                if (rs.getTimestamp("last_login") != null) {
                    user.setLastLogin(rs.getTimestamp("last_login").toString());
                }

                // Deriva el estado legible para el frontend
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
            // Error: No se pudieron recuperar los usuarios (problema de BD o conexion)
            System.err.println("[ERROR] Error obteniendo usuarios: " + e.getMessage());
            e.printStackTrace();
        }

        return users;
    }
}
