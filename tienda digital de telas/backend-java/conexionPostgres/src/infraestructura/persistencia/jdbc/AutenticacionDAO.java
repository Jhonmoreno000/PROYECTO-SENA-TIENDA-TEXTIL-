package infraestructura.persistencia.jdbc;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

import infraestructura.configuracion.Conexion;
import dominio.modelos.Usuario;

/**
 * DAO para Autenticación de Usuarios.
 * Gestiona el inicio de sesión y registro directo sobre la tabla 'users'.
 */
public class AutenticacionDAO {

    /**
     * Genera el hash criptográfico SHA-256 de una contraseña usando codificación UTF-8.
     */
    private String generarHashContrasena(String contrasena) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            digest.update(contrasena.getBytes(java.nio.charset.StandardCharsets.UTF_8));
            byte[] bytes = digest.digest();
            StringBuilder constructorCadena = new StringBuilder();
            for (byte b : bytes) {
                constructorCadena.append(String.format("%02x", b));
            }
            return constructorCadena.toString();
        } catch (NoSuchAlgorithmException excepcion) {
            throw new RuntimeException("Algoritmo SHA-256 no disponible", excepcion);
        }
    }

    /**
     * Autentica un usuario por su correo y contraseña.
     */
    public Usuario iniciarSesion(String correo, String contrasena) {
        String consulta = "SELECT id, name, email, role, active, suspended, suspension_reason, commission_rate, " +
                "registered_at, last_login, password_hash FROM users WHERE email = ? AND active = true";

        try (Connection con = Conexion.obtenerConexion();
             PreparedStatement pst = con.prepareStatement(consulta)) {
            pst.setString(1, correo);
            try (ResultSet rs = pst.executeQuery()) {
                if (rs.next()) {
                    String hashAlmacenado = rs.getString("password_hash");
                    boolean coincide = hashAlmacenado != null && hashAlmacenado.equals(generarHashContrasena(contrasena));

                    if (coincide) {
                        Usuario usuario = new Usuario();
                        usuario.setId(rs.getInt("id"));
                        usuario.setNombre(rs.getString("name"));
                        usuario.setCorreo(rs.getString("email"));
                        usuario.setRol(rs.getString("role"));
                        usuario.setActivo(rs.getBoolean("active"));
                        usuario.setSuspendido(rs.getBoolean("suspended"));
                        usuario.setMotivoSuspension(rs.getString("suspension_reason"));
                        
                        actualizarUltimoAcceso(usuario.getId());

                        return usuario;
                    }
                }
            }
        } catch (SQLException e) {
            System.err.println("[ERROR] Error en login: " + e.getMessage());
        }
        return null;
    }

    private void actualizarUltimoAcceso(int idUsuario) {
        String consulta = "UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?";
        try (Connection con = Conexion.obtenerConexion();
             PreparedStatement pst = con.prepareStatement(consulta)) {
            pst.setInt(1, idUsuario);
            pst.executeUpdate();
        } catch (SQLException e) {
            System.err.println("[WARN] No se pudo actualizar last_login para usuario " + idUsuario + ": " + e.getMessage());
        }
    }

    /**
     * Registra un nuevo usuario en el sistema.
     */
    public boolean registrar(Usuario usuario, String contrasena) {
        String consulta = "INSERT INTO users (name, email, role, active, password_hash) VALUES (?, ?, ?, ?, ?)";
        try (Connection con = Conexion.obtenerConexion();
             PreparedStatement pst = con.prepareStatement(consulta)) {
            pst.setString(1, usuario.getNombre());
            pst.setString(2, usuario.getCorreo());
            pst.setString(3, usuario.getRol() != null ? usuario.getRol() : "cliente");
            pst.setBoolean(4, true);
            pst.setString(5, generarHashContrasena(contrasena));
            
            return pst.executeUpdate() > 0;
        } catch (SQLException e) {
            System.err.println("[ERROR] Error en registro: " + e.getMessage());
            return false;
        }
    }

    // Métodos alias para compatibilidad
    public Usuario login(String email, String password) { return iniciarSesion(email, password); }
    public boolean register(Usuario user, String password) { return registrar(user, password); }
}
