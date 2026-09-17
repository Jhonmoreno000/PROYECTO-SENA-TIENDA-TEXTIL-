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
 * Adaptador de persistencia que opera sobre la tabla 'usuarios'.
 */
public class JdbcRepositorioUsuarioImpl implements RepositorioUsuario {

    @Override
    public Optional<Usuario> buscarPorCorreoYActivo(String correo) {
        String consulta = "SELECT id, nombre, correo, rol, activo, suspendido, motivo_suspension, tasa_comision, " +
                "registrado_en, ultimo_acceso, contrasena_hash FROM usuarios WHERE correo = ? AND activo = true";

        try (Connection con = Conexion.obtenerConexion();
             PreparedStatement pst = con.prepareStatement(consulta)) {
            pst.setString(1, correo);
            try (ResultSet rs = pst.executeQuery()) {
                if (rs.next()) {
                    Usuario usuario = new Usuario(
                        rs.getInt("id"),
                        rs.getString("nombre"),
                        rs.getString("correo"),
                        rs.getString("rol"),
                        rs.getBoolean("activo"),
                        rs.getBoolean("suspendido"),
                        rs.getString("motivo_suspension"),
                        rs.getDouble("tasa_comision"),
                        rs.getString("registrado_en"),
                        rs.getString("ultimo_acceso"),
                        null
                    );
                    return Optional.of(usuario);
                }
            }
        } catch (SQLException e) {
            System.err.println("[ERROR] Error buscando usuario por correo: " + e.getMessage());
            e.printStackTrace();
        }
        return Optional.empty();
    }

    @Override
    public Optional<Usuario> buscarPorCorreoYValidarContrasena(String correo, String hashPlano) {
        String consulta = "SELECT id, nombre, correo, rol, activo, suspendido, motivo_suspension, tasa_comision, " +
                "registrado_en, ultimo_acceso, contrasena_hash FROM usuarios WHERE correo = ? AND contrasena_hash = ? AND activo = true";

        try (Connection con = Conexion.obtenerConexion();
             PreparedStatement pst = con.prepareStatement(consulta)) {
            pst.setString(1, correo);
            pst.setString(2, hashPlano);
            try (ResultSet rs = pst.executeQuery()) {
                if (rs.next()) {
                    Usuario usuario = new Usuario(
                        rs.getInt("id"),
                        rs.getString("nombre"),
                        rs.getString("correo"),
                        rs.getString("rol"),
                        rs.getBoolean("activo"),
                        rs.getBoolean("suspendido"),
                        rs.getString("motivo_suspension"),
                        rs.getDouble("tasa_comision"),
                        rs.getString("registrado_en"),
                        rs.getString("ultimo_acceso"),
                        null
                    );
                    return Optional.of(usuario);
                }
            }
        } catch (SQLException e) {
            System.err.println("[ERROR] Error validando credenciales de usuario: " + e.getMessage());
            e.printStackTrace();
        }
        return Optional.empty();
    }

    @Override
    public boolean guardar(Usuario usuario, String contrasenaHasheada) {
        String consulta = "INSERT INTO usuarios (nombre, correo, rol, activo, contrasena_hash) VALUES (?, ?, ?, ?, ?)";
        try (Connection con = Conexion.obtenerConexion();
             PreparedStatement pst = con.prepareStatement(consulta)) {
            pst.setString(1, usuario.getNombre());
            pst.setString(2, usuario.getCorreo());
            pst.setString(3, usuario.getRol() != null ? usuario.getRol() : "cliente");
            pst.setBoolean(4, true);
            pst.setString(5, contrasenaHasheada);

            return pst.executeUpdate() > 0;
        } catch (SQLException e) {
            System.err.println("[ERROR] Error guardando usuario: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }

    @Override
    public void actualizarUltimoAcceso(int idUsuario) {
        String consulta = "UPDATE usuarios SET ultimo_acceso = CURRENT_TIMESTAMP WHERE id = ?";
        try (Connection con = Conexion.obtenerConexion();
             PreparedStatement pst = con.prepareStatement(consulta)) {
            pst.setInt(1, idUsuario);
            pst.executeUpdate();
        } catch (SQLException e) {
            System.err.println("[ERROR] Error actualizando último acceso: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
