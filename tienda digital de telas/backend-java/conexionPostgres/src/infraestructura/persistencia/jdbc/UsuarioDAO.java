package infraestructura.persistencia.jdbc;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

import infraestructura.configuracion.Conexion;
import dominio.modelos.Usuario;

/**
 * DAO (Data Access Object) para la entidad Usuario.
 * Gestiona las operaciones de consulta sobre la tabla 'users'.
 */
public class UsuarioDAO {

    /**
     * Recupera todos los usuarios registrados en el sistema ordenados por ID ascendente.
     * @return Lista de objetos Usuario.
     */
    public List<Usuario> obtenerTodosLosUsuarios() {
        List<Usuario> usuarios = new ArrayList<>();
        String consulta = "SELECT id, name, email, role, active, suspended, suspension_reason, commission_rate, " +
                "registered_at, last_login FROM users ORDER BY id ASC";

        try (Connection conexion = Conexion.obtenerConexion();
             PreparedStatement sentencia = conexion.prepareStatement(consulta);
             ResultSet resultado = sentencia.executeQuery()) {

            while (resultado.next()) {
                Usuario usuario = new Usuario();
                usuario.setId(resultado.getInt("id"));
                usuario.setNombre(resultado.getString("name"));
                usuario.setCorreo(resultado.getString("email"));
                usuario.setRol(resultado.getString("role"));
                usuario.setActivo(resultado.getBoolean("active"));
                usuario.setSuspendido(resultado.getBoolean("suspended"));
                usuario.setMotivoSuspension(resultado.getString("suspension_reason"));

                double comision = resultado.getDouble("commission_rate");
                if (!resultado.wasNull()) {
                    usuario.setPorcentajeComision(comision);
                }

                if (resultado.getTimestamp("registered_at") != null) {
                    usuario.setFechaRegistro(resultado.getTimestamp("registered_at").toString());
                }
                if (resultado.getTimestamp("last_login") != null) {
                    usuario.setUltimoAcceso(resultado.getTimestamp("last_login").toString());
                }

                if (usuario.isSuspendido()) {
                    usuario.setEstado("Suspendido");
                } else if (!usuario.isActivo()) {
                    usuario.setEstado("Inactivo");
                } else {
                    usuario.setEstado("Activo");
                }

                usuarios.add(usuario);
            }

        } catch (SQLException e) {
            System.err.println("[ERROR] Error obteniendo usuarios: " + e.getMessage());
            e.printStackTrace();
        }

        return usuarios;
    }

    public List<Usuario> getAllUsers() {
        return obtenerTodosLosUsuarios();
    }
}
