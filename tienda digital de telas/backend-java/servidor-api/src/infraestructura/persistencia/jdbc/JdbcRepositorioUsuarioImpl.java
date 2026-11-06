package infraestructura.persistencia.jdbc;

import dominio.modelos.Usuario;
import dominio.repositorios.RepositorioUsuario;
import infraestructura.configuracion.Conexion;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * Implementación JDBC del Repositorio de Usuarios (RepositorioUsuario).
 * Adaptador de persistencia de la arquitectura limpia que opera sobre la tabla 'usuarios'.
 */
public class JdbcRepositorioUsuarioImpl implements RepositorioUsuario {

    @Override
    public Optional<Usuario> buscarPorId(int idUsuario) {
        String consulta = "SELECT id, nombre, correo, rol, activo, suspendido, motivo_suspension, tasa_comision, " +
                "registrado_en, ultimo_acceso FROM usuarios WHERE id = ?";
        try (Connection conexion = Conexion.obtenerConexion();
             PreparedStatement sentencia = conexion.prepareStatement(consulta)) {
            sentencia.setInt(1, idUsuario);
            try (ResultSet resultado = sentencia.executeQuery()) {
                if (resultado.next()) {
                    Usuario usuario = new Usuario(
                        resultado.getInt("id"),
                        resultado.getString("nombre"),
                        resultado.getString("correo"),
                        resultado.getString("rol"),
                        resultado.getBoolean("activo"),
                        resultado.getBoolean("suspendido"),
                        resultado.getString("motivo_suspension"),
                        resultado.getBigDecimal("tasa_comision"),
                        resultado.getTimestamp("registrado_en") != null ? resultado.getTimestamp("registrado_en").toLocalDateTime() : null,
                        resultado.getTimestamp("ultimo_acceso") != null ? resultado.getTimestamp("ultimo_acceso").toLocalDateTime() : null,
                        null
                    );
                    return Optional.of(usuario);
                }
            }
        } catch (SQLException excepcion) {
            System.err.println("[ERROR] Error buscando usuario por identificador: " + excepcion.getMessage());
            excepcion.printStackTrace();
        }
        return Optional.empty();
    }

    @Override
    public Optional<Usuario> buscarPorCorreoYActivo(String correo) {
        String consulta = "SELECT id, nombre, correo, rol, activo, suspendido, motivo_suspension, tasa_comision, " +
                "registrado_en, ultimo_acceso FROM usuarios WHERE correo = ? AND activo = true";

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
                "registrado_en, ultimo_acceso FROM usuarios WHERE correo = ? AND contrasena_hash = ? AND activo = true";

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

    @Override
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

    @Override
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

    @Override
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
