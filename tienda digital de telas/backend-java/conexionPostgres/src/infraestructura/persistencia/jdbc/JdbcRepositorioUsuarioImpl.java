package infraestructura.persistencia.jdbc;

import dominio.modelos.Usuario;
import dominio.repositorios.RepositorioUsuario;
import infraestructura.configuracion.Conexion;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.Optional;

/**
 * Implementación JDBC del Repositorio de Usuarios (RepositorioUsuario).
 * Adaptador de persistencia que opera sobre la tabla 'users'.
 */
public class JdbcRepositorioUsuarioImpl implements RepositorioUsuario {

    @Override
    public Optional<Usuario> buscarPorCorreoYActivo(String correo) {
        String consulta = "SELECT id, name, email, role, active, suspended, suspension_reason, commission_rate, " +
                "registered_at, last_login, password_hash FROM users WHERE email = ? AND active = true";

        try (Connection con = Conexion.obtenerConexion();
             PreparedStatement pst = con.prepareStatement(consulta)) {
            pst.setString(1, correo);
            try (ResultSet rs = pst.executeQuery()) {
                if (rs.next()) {
                    Usuario usuario = new Usuario(
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
                    return Optional.of(usuario);
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return Optional.empty();
    }

    @Override
    public Optional<Usuario> buscarPorCorreoYValidarContrasena(String correo, String hashPlano) {
        String consulta = "SELECT id, name, email, role, active, suspended, suspension_reason, commission_rate, " +
                "registered_at, last_login, password_hash FROM users WHERE email = ? AND password_hash = ? AND active = true";

        try (Connection con = Conexion.obtenerConexion();
             PreparedStatement pst = con.prepareStatement(consulta)) {
            pst.setString(1, correo);
            pst.setString(2, hashPlano);
            try (ResultSet rs = pst.executeQuery()) {
                if (rs.next()) {
                    Usuario usuario = new Usuario(
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
                    return Optional.of(usuario);
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return Optional.empty();
    }

    @Override
    public boolean guardar(Usuario usuario, String contrasenaHasheada) {
        String consulta = "INSERT INTO users (name, email, role, active, password_hash) VALUES (?, ?, ?, ?, ?)";
        try (Connection con = Conexion.obtenerConexion();
             PreparedStatement pst = con.prepareStatement(consulta)) {
            pst.setString(1, usuario.getNombre());
            pst.setString(2, usuario.getCorreo());
            pst.setString(3, usuario.getRol() != null ? usuario.getRol() : "cliente");
            pst.setBoolean(4, true);
            pst.setString(5, contrasenaHasheada);

            return pst.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    @Override
    public void actualizarUltimoAcceso(int idUsuario) {
        String consulta = "UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?";
        try (Connection con = Conexion.obtenerConexion();
             PreparedStatement pst = con.prepareStatement(consulta)) {
            pst.setInt(1, idUsuario);
            pst.executeUpdate();
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }
}
