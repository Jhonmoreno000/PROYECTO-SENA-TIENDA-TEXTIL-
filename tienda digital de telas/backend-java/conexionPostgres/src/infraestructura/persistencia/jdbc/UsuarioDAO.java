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
 * Gestiona las operaciones de consulta sobre la tabla 'usuarios'.
 */
public class UsuarioDAO {

    /**
     * Recupera todos los usuarios registrados en el sistema ordenados por ID ascendente.
     * @return Lista de objetos Usuario.
     */
    public List<Usuario> obtenerTodosLosUsuarios() {
        List<Usuario> usuarios = new ArrayList<>();
        String consulta = "SELECT id, nombre, correo, rol, activo, suspendido, motivo_suspension, tasa_comision, " +
                "registrado_en, ultimo_acceso FROM usuarios ORDER BY id ASC";

        try (Connection conexion = Conexion.obtenerConexion();
             PreparedStatement sentencia = conexion.prepareStatement(consulta);
             ResultSet resultado = sentencia.executeQuery()) {

            while (resultado.next()) {
                Usuario usuario = new Usuario();
                usuario.setId(resultado.getInt("id"));
                usuario.setNombre(resultado.getString("nombre"));
                usuario.setCorreo(resultado.getString("correo"));
                usuario.setRol(resultado.getString("rol"));
                usuario.setActivo(resultado.getBoolean("activo"));
                usuario.setSuspendido(resultado.getBoolean("suspendido"));
                usuario.setMotivoSuspension(resultado.getString("motivo_suspension"));

                double comision = resultado.getDouble("tasa_comision");
                if (!resultado.wasNull()) {
                    usuario.setPorcentajeComision(comision);
                }

                if (resultado.getTimestamp("registrado_en") != null) {
                    usuario.setFechaRegistro(resultado.getTimestamp("registrado_en").toString());
                }
                if (resultado.getTimestamp("ultimo_acceso") != null) {
                    usuario.setUltimoAcceso(resultado.getTimestamp("ultimo_acceso").toString());
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

    /**
     * Actualiza el estado de activación de un usuario en el sistema.
     * @param idUsuario Identificador del usuario.
     * @param activo Estado activo deseado.
     * @return true si se actualizó exitosamente, false en caso contrario.
     */
    public boolean actualizarEstadoUsuario(int idUsuario, boolean activo) {
        String consulta = "UPDATE usuarios SET activo = ? WHERE id = ?";
        try (Connection conexion = Conexion.obtenerConexion();
             PreparedStatement sentencia = conexion.prepareStatement(consulta)) {
            sentencia.setBoolean(1, activo);
            sentencia.setInt(2, idUsuario);
            return sentencia.executeUpdate() > 0;
        } catch (SQLException excepcion) {
            System.err.println("[ERROR] Error actualizando estado de usuario: " + excepcion.getMessage());
            excepcion.printStackTrace();
            return false;
        }
    }

    /**
     * Actualiza el rol asignado a un usuario.
     * @param idUsuario Identificador del usuario.
     * @param nuevoRol Nombre del nuevo rol (ej: administrador, vendedor, cliente).
     * @return true si se actualizó exitosamente, false en caso contrario.
     */
    public boolean actualizarRolUsuario(int idUsuario, String nuevoRol) {
        String consulta = "UPDATE usuarios SET rol = ? WHERE id = ?";
        try (Connection conexion = Conexion.obtenerConexion();
             PreparedStatement sentencia = conexion.prepareStatement(consulta)) {
            sentencia.setString(1, nuevoRol);
            sentencia.setInt(2, idUsuario);
            return sentencia.executeUpdate() > 0;
        } catch (SQLException excepcion) {
            System.err.println("[ERROR] Error actualizando rol de usuario: " + excepcion.getMessage());
            excepcion.printStackTrace();
            return false;
        }
    }
}
