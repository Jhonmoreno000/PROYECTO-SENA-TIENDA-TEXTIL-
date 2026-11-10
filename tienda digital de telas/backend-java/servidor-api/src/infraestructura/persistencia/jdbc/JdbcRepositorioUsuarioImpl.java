package infraestructura.persistencia.jdbc;

import aplicacion.servicios.ServicioAutenticacion;
import dominio.modelos.Usuario;
import dominio.repositorios.RepositorioUsuario;
import infraestructura.configuracion.Conexion;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.sql.Types;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Implementación JDBC del repositorio de usuarios ({@link RepositorioUsuario}).
 * Gestiona la persistencia de cuentas en `usuarios` y libretas de direcciones en `direcciones_usuario`.
 */
public class JdbcRepositorioUsuarioImpl implements RepositorioUsuario {

    /**
     * Construye una nueva instancia del repositorio JDBC de usuarios.
     */
    public JdbcRepositorioUsuarioImpl() {}

    /**
     * Busca un usuario por su identificador único en la tabla `usuarios`.
     *
     * @param idUsuario Identificador único del usuario (`int`).
     * @return {@link Optional} con el {@link Usuario} si existe.
     */
    @Override
    public Optional<Usuario> buscarPorId(int idUsuario) {
        String consulta = "SELECT id, nombre, correo, telefono, rol, activo, suspendido, motivo_suspension, tasa_comision, " +
                "registrado_en, ultimo_acceso FROM usuarios WHERE id = ?";
        try (Connection con = Conexion.obtenerConexion();
             PreparedStatement pst = con.prepareStatement(consulta)) {
            pst.setInt(1, idUsuario);
            try (ResultSet rs = pst.executeQuery()) {
                if (rs.next()) {
                    return Optional.of(mapearUsuario(rs));
                }
            }
        } catch (SQLException e) {
            System.err.println("[ERROR] Error buscando usuario por identificador: " + e.getMessage());
            e.printStackTrace();
        }
        return Optional.empty();
    }

    /**
     * Busca un usuario activo por su dirección de correo electrónico.
     *
     * @param correo Correo electrónico del usuario (`String`).
     * @return {@link Optional} con el {@link Usuario} si existe y está activo.
     */
    @Override
    public Optional<Usuario> buscarPorCorreoYActivo(String correo) {
        String consulta = "SELECT id, nombre, correo, telefono, rol, activo, suspendido, motivo_suspension, tasa_comision, " +
                "registrado_en, ultimo_acceso FROM usuarios WHERE correo = ? AND activo = true";

        try (Connection con = Conexion.obtenerConexion();
             PreparedStatement pst = con.prepareStatement(consulta)) {
            pst.setString(1, correo);
            try (ResultSet rs = pst.executeQuery()) {
                if (rs.next()) {
                    return Optional.of(mapearUsuario(rs));
                }
            }
        } catch (SQLException e) {
            System.err.println("[ERROR] Error buscando usuario por correo: " + e.getMessage());
            e.printStackTrace();
        }
        return Optional.empty();
    }

    /**
     * Busca un usuario activo validando su correo electrónico y hash SHA-256 de contraseña.
     *
     * @param correo Correo electrónico del usuario (`String`).
     * @param hashPlano Hash SHA-256 de la contraseña (`String`).
     * @return {@link Optional} con el {@link Usuario} autenticado o vacío si no coincide.
     */
    @Override
    public Optional<Usuario> buscarPorCorreoYValidarContrasena(String correo, String contrasenaOCredencial) {
        String consulta = "SELECT id, nombre, correo, telefono, rol, activo, suspendido, motivo_suspension, tasa_comision, " +
                "registrado_en, ultimo_acceso, contrasena_hash FROM usuarios WHERE correo = ? AND activo = true";

        try (Connection con = Conexion.obtenerConexion();
             PreparedStatement pst = con.prepareStatement(consulta)) {
            pst.setString(1, correo);
            try (ResultSet rs = pst.executeQuery()) {
                if (rs.next()) {
                    String hashAlmacenado = rs.getString("contrasena_hash");
                    if (ServicioAutenticacion.verificarContrasena(contrasenaOCredencial, hashAlmacenado)
                            || (hashAlmacenado != null && hashAlmacenado.equalsIgnoreCase(contrasenaOCredencial))) {
                        // Migración transparente a PBKDF2 con sal si la cuenta aún tenía hash antiguo SHA-256
                        if (!ServicioAutenticacion.esHashPBKDF2(hashAlmacenado) && !contrasenaOCredencial.equals(hashAlmacenado)) {
                            actualizarHashContrasena(rs.getInt("id"), ServicioAutenticacion.generarHashPBKDF2(contrasenaOCredencial));
                        }
                        return Optional.of(mapearUsuario(rs));
                    }
                }
            }
        } catch (SQLException e) {
            System.err.println("[ERROR] Error validando credenciales de usuario: " + e.getMessage());
            e.printStackTrace();
        }
        return Optional.empty();
    }

    /**
     * Actualiza el hash de contraseña de un usuario directamente en la base de datos.
     *
     * @param idUsuario Identificador del usuario (`int`).
     * @param nuevoHash Hash de la contraseña (`String`).
     * @return `true` si se actualizó; `false` en caso contrario.
     */
    public boolean actualizarHashContrasena(int idUsuario, String nuevoHash) {
        String sql = "UPDATE usuarios SET contrasena_hash = ? WHERE id = ?";
        try (Connection con = Conexion.obtenerConexion();
             PreparedStatement pst = con.prepareStatement(sql)) {
            pst.setString(1, nuevoHash);
            pst.setInt(2, idUsuario);
            return pst.executeUpdate() > 0;
        } catch (SQLException e) {
            System.err.println("[ERROR] Error actualizando hash de contraseña: " + e.getMessage());
            return false;
        }
    }

    /**
     * Persiste un nuevo usuario en la tabla `usuarios`.
     *
     * @param usuario Entidad {@link Usuario} con los datos del perfil.
     * @param contrasenaHasheada Hash SHA-256 de la contraseña (`String`).
     * @return `true` si el registro fue insertado; `false` en caso de error.
     */
    @Override
    public boolean guardar(Usuario usuario, String contrasenaHasheada) {
        String consulta = "INSERT INTO usuarios (nombre, correo, telefono, rol, activo, tasa_comision, contrasena_hash) VALUES (?, ?, ?, ?, ?, ?, ?)";
        try (Connection con = Conexion.obtenerConexion();
             PreparedStatement pst = con.prepareStatement(consulta, Statement.RETURN_GENERATED_KEYS)) {
            pst.setString(1, usuario.getNombre());
            pst.setString(2, usuario.getCorreo());
            pst.setString(3, usuario.getTelefono());
            pst.setString(4, usuario.getRol() != null ? usuario.getRol() : "cliente");
            pst.setBoolean(5, true);
            if (usuario.getPorcentajeComision() != null) {
                pst.setDouble(6, usuario.getPorcentajeComision());
            } else {
                pst.setNull(6, Types.NUMERIC);
            }
            pst.setString(7, contrasenaHasheada);

            int filas = pst.executeUpdate();
            if (filas > 0) {
                try (ResultSet rs = pst.getGeneratedKeys()) {
                    if (rs.next()) {
                        usuario.setId(rs.getInt(1));
                    }
                }
                return true;
            }
            return false;
        } catch (SQLException e) {
            System.err.println("[ERROR] Error guardando usuario: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }

    /**
     * Actualiza la marca de tiempo de último inicio de sesión del usuario.
     *
     * @param idUsuario Identificador único del usuario (`int`).
     */
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

    /**
     * Recupera todos los usuarios registrados ordenados por identificador ascendente.
     *
     * @return Lista (`List<Usuario>`) de usuarios.
     */
    @Override
    public List<Usuario> obtenerTodosLosUsuarios() {
        List<Usuario> usuarios = new ArrayList<>();
        String consulta = "SELECT id, nombre, correo, telefono, rol, activo, suspendido, motivo_suspension, tasa_comision, " +
                "registrado_en, ultimo_acceso FROM usuarios ORDER BY id ASC";

        try (Connection conexion = Conexion.obtenerConexion();
             PreparedStatement sentencia = conexion.prepareStatement(consulta);
             ResultSet resultado = sentencia.executeQuery()) {

            while (resultado.next()) {
                usuarios.add(mapearUsuario(resultado));
            }
        } catch (SQLException e) {
            System.err.println("[ERROR] Error obteniendo usuarios: " + e.getMessage());
            e.printStackTrace();
        }

        return usuarios;
    }

    /**
     * Actualiza el estado activo o inactivo de un usuario.
     *
     * @param idUsuario Identificador del usuario (`int`).
     * @param activo Nuevo estado activo (`boolean`).
     * @return `true` si se actualizó el registro; `false` en caso contrario.
     */
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

    /**
     * Actualiza el rol de un usuario en la plataforma.
     *
     * @param idUsuario Identificador del usuario (`int`).
     * @param nuevoRol Nombre del nuevo rol (`String`).
     * @return `true` si se actualizó el registro; `false` en caso contrario.
     */
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

    /**
     * Actualiza de forma selectiva cualquiera de los atributos de perfil, seguridad o estado de un usuario.
     *
     * @param idUsuario Identificador del usuario (`int`).
     * @param nombre Nuevo nombre (`String`) o `null`.
     * @param correo Nuevo correo (`String`) o `null`.
     * @param telefono Nuevo teléfono (`String`) o `null`.
     * @param rol Nuevo rol (`String`) o `null`.
     * @param activo Nuevo estado activo (`Boolean`) o `null`.
     * @param suspendido Nuevo estado de suspensión (`Boolean`) o `null`.
     * @param motivoSuspension Motivo de suspensión (`String`) o `null`.
     * @param porcentajeComision Nueva tasa de comisión (`Double`) o `null`.
     * @param contrasenaHash Nuevo hash SHA-256 de contraseña (`String`) o `null`.
     * @return `true` si se actualizó el usuario; `false` en caso de error.
     */
    public boolean actualizarUsuarioCompleto(
            int idUsuario,
            String nombre,
            String correo,
            String telefono,
            String rol,
            Boolean activo,
            Boolean suspendido,
            String motivoSuspension,
            Double porcentajeComision,
            String contrasenaHash
    ) {
        String consulta = "UPDATE usuarios SET " +
                "nombre = COALESCE(?, nombre), " +
                "correo = COALESCE(?, correo), " +
                "telefono = COALESCE(?, telefono), " +
                "rol = COALESCE(?, rol), " +
                "activo = COALESCE(?, activo), " +
                "suspendido = COALESCE(?, suspendido), " +
                "motivo_suspension = CASE WHEN ? IS NOT NULL THEN ? ELSE motivo_suspension END, " +
                "tasa_comision = COALESCE(?, tasa_comision), " +
                "contrasena_hash = COALESCE(?, contrasena_hash) " +
                "WHERE id = ?";
        try (Connection con = Conexion.obtenerConexion();
             PreparedStatement pst = con.prepareStatement(consulta)) {
            pst.setString(1, (nombre != null && !nombre.isBlank()) ? nombre.trim() : null);
            pst.setString(2, (correo != null && !correo.isBlank()) ? correo.trim().toLowerCase() : null);
            pst.setString(3, telefono);
            pst.setString(4, (rol != null && !rol.isBlank()) ? rol.trim() : null);
            pst.setObject(5, activo);
            pst.setObject(6, suspendido);
            pst.setString(7, motivoSuspension);
            pst.setString(8, motivoSuspension);
            if (porcentajeComision != null) pst.setDouble(9, porcentajeComision); else pst.setNull(9, Types.NUMERIC);
            pst.setString(10, (contrasenaHash != null && !contrasenaHash.isBlank()) ? contrasenaHash : null);
            pst.setInt(11, idUsuario);
            return pst.executeUpdate() > 0;
        } catch (SQLException e) {
            System.err.println("[ERROR] Error actualizando usuario completo: " + e.getMessage());
            return false;
        }
    }

    /**
     * Desactiva o elimina un usuario por su identificador.
     *
     * @param idUsuario Identificador del usuario (`int`).
     * @return `true` si la cuenta fue desactivada o eliminada; `false` en caso contrario.
     */
    public boolean eliminarUsuario(int idUsuario) {
        String consulta = "UPDATE usuarios SET activo = false WHERE id = ?";
        try (Connection con = Conexion.obtenerConexion();
             PreparedStatement pst = con.prepareStatement(consulta)) {
            pst.setInt(1, idUsuario);
            return pst.executeUpdate() > 0;
        } catch (SQLException e) {
            System.err.println("[ERROR] Error desactivando usuario: " + e.getMessage());
            return false;
        }
    }

    /**
     * Recupera la libreta de direcciones de envío registradas para un usuario.
     *
     * @param idUsuario Identificador del usuario (`int`).
     * @return Lista de mapas (`List<Map<String, Object>>`) con las direcciones guardadas.
     */
    public List<Map<String, Object>> obtenerDireccionesUsuario(int idUsuario) {
        List<Map<String, Object>> lista = new ArrayList<>();
        String sql = "SELECT * FROM direcciones_usuario WHERE usuario_id = ? ORDER BY predeterminada DESC, id ASC";
        try (Connection con = Conexion.obtenerConexion();
             PreparedStatement pst = con.prepareStatement(sql)) {
            pst.setInt(1, idUsuario);
            try (ResultSet rs = pst.executeQuery()) {
                while (rs.next()) {
                    Map<String, Object> dir = new LinkedHashMap<>();
                    dir.put("id", rs.getInt("id"));
                    dir.put("userId", rs.getInt("usuario_id"));
                    dir.put("label", rs.getString("etiqueta"));
                    dir.put("recipientName", rs.getString("nombre_destinatario"));
                    dir.put("phone", rs.getString("telefono"));
                    dir.put("address", rs.getString("direccion"));
                    dir.put("city", rs.getString("ciudad"));
                    dir.put("department", rs.getString("departamento"));
                    dir.put("postalCode", rs.getString("codigo_postal"));
                    dir.put("isDefault", rs.getBoolean("predeterminada"));
                    lista.add(dir);
                }
            }
        } catch (SQLException e) {
            System.err.println("[ERROR] Error obteniendo direcciones de usuario: " + e.getMessage());
        }
        return lista;
    }

    /**
     * Agrega una nueva dirección de envío para un usuario en la tabla `direcciones_usuario`.
     *
     * @param idUsuario Identificador del usuario (`int`).
     * @param datos Mapa (`Map<String, Object>`) con los campos de la dirección.
     * @return Identificador numérico generado (`int`) o `-1` en caso de error.
     */
    public int agregarDireccionUsuario(int idUsuario, Map<String, Object> datos) {
        String sql = "INSERT INTO direcciones_usuario (usuario_id, etiqueta, nombre_destinatario, telefono, direccion, ciudad, departamento, codigo_postal, predeterminada) " +
                     "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
        try (Connection con = Conexion.obtenerConexion();
             PreparedStatement pst = con.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            boolean predeterminada = Boolean.parseBoolean(String.valueOf(datos.getOrDefault("isDefault", datos.getOrDefault("predeterminada", false))));
            if (predeterminada) {
                try (PreparedStatement pstReset = con.prepareStatement("UPDATE direcciones_usuario SET predeterminada = false WHERE usuario_id = ?")) {
                    pstReset.setInt(1, idUsuario);
                    pstReset.executeUpdate();
                }
            }
            pst.setInt(1, idUsuario);
            pst.setString(2, String.valueOf(datos.getOrDefault("label", datos.getOrDefault("etiqueta", "Casa"))));
            pst.setString(3, (String) datos.getOrDefault("recipientName", datos.get("nombreDestinatario")));
            pst.setString(4, (String) datos.getOrDefault("phone", datos.get("telefono")));
            pst.setString(5, String.valueOf(datos.getOrDefault("address", datos.getOrDefault("direccion", ""))));
            pst.setString(6, (String) datos.getOrDefault("city", datos.get("ciudad")));
            pst.setString(7, (String) datos.getOrDefault("department", datos.get("departamento")));
            pst.setString(8, (String) datos.getOrDefault("postalCode", datos.get("codigoPostal")));
            pst.setBoolean(9, predeterminada);
            if (pst.executeUpdate() > 0) {
                try (ResultSet rs = pst.getGeneratedKeys()) {
                    if (rs.next()) return rs.getInt(1);
                }
            }
        } catch (SQLException e) {
            System.err.println("[ERROR] Error agregando dirección: " + e.getMessage());
        }
        return -1;
    }

    /**
     * Actualiza una dirección de envío existente de un usuario.
     *
     * @param idUsuario Identificador del usuario propietario (`int`).
     * @param idDireccion Identificador de la dirección (`int`).
     * @param datos Mapa (`Map<String, Object>`) con los datos actualizados.
     * @return `true` si se actualizó el registro; `false` en caso contrario.
     */
    public boolean actualizarDireccionUsuario(int idUsuario, int idDireccion, Map<String, Object> datos) {
        String sql = "UPDATE direcciones_usuario SET " +
                     "etiqueta = COALESCE(?, etiqueta), " +
                     "nombre_destinatario = COALESCE(?, nombre_destinatario), " +
                     "telefono = COALESCE(?, telefono), " +
                     "direccion = COALESCE(?, direccion), " +
                     "ciudad = COALESCE(?, ciudad), " +
                     "departamento = COALESCE(?, departamento), " +
                     "codigo_postal = COALESCE(?, codigo_postal), " +
                     "predeterminada = COALESCE(?, predeterminada) " +
                     "WHERE id = ? AND usuario_id = ?";
        try (Connection con = Conexion.obtenerConexion();
             PreparedStatement pst = con.prepareStatement(sql)) {
            Boolean predeterminada = datos.containsKey("isDefault") || datos.containsKey("predeterminada")
                    ? Boolean.parseBoolean(String.valueOf(datos.getOrDefault("isDefault", datos.get("predeterminada"))))
                    : null;
            if (Boolean.TRUE.equals(predeterminada)) {
                try (PreparedStatement pstReset = con.prepareStatement("UPDATE direcciones_usuario SET predeterminada = false WHERE usuario_id = ?")) {
                    pstReset.setInt(1, idUsuario);
                    pstReset.executeUpdate();
                }
            }
            pst.setString(1, (String) datos.getOrDefault("label", datos.get("etiqueta")));
            pst.setString(2, (String) datos.getOrDefault("recipientName", datos.get("nombreDestinatario")));
            pst.setString(3, (String) datos.getOrDefault("phone", datos.get("telefono")));
            pst.setString(4, (String) datos.getOrDefault("address", datos.get("direccion")));
            pst.setString(5, (String) datos.getOrDefault("city", datos.get("ciudad")));
            pst.setString(6, (String) datos.getOrDefault("department", datos.get("departamento")));
            pst.setString(7, (String) datos.getOrDefault("postalCode", datos.get("codigoPostal")));
            pst.setObject(8, predeterminada);
            pst.setInt(9, idDireccion);
            pst.setInt(10, idUsuario);
            return pst.executeUpdate() > 0;
        } catch (SQLException e) {
            System.err.println("[ERROR] Error actualizando dirección: " + e.getMessage());
            return false;
        }
    }

    /**
     * Elimina una dirección de envío de la libreta del usuario.
     *
     * @param idUsuario Identificador del usuario (`int`).
     * @param idDireccion Identificador de la dirección (`int`).
     * @return `true` si se eliminó el registro; `false` en caso contrario.
     */
    public boolean eliminarDireccionUsuario(int idUsuario, int idDireccion) {
        String sql = "DELETE FROM direcciones_usuario WHERE id = ? AND usuario_id = ?";
        try (Connection con = Conexion.obtenerConexion();
             PreparedStatement pst = con.prepareStatement(sql)) {
            pst.setInt(1, idDireccion);
            pst.setInt(2, idUsuario);
            return pst.executeUpdate() > 0;
        } catch (SQLException e) {
            System.err.println("[ERROR] Error eliminando dirección: " + e.getMessage());
            return false;
        }
    }

    /**
     * Convierte una fila del {@link ResultSet} en un objeto {@link Usuario} respetando valores nulos en `tasa_comision`.
     *
     * @param rs Conjunto de resultados posicionado en la fila actual ({@link ResultSet}).
     * @return Instancia mapeada de {@link Usuario}.
     * @throws SQLException Si ocurre un error leyendo las columnas.
     */
    private Usuario mapearUsuario(ResultSet rs) throws SQLException {
        Double comision = rs.getObject("tasa_comision") != null ? rs.getDouble("tasa_comision") : null;
        String fechaReg = rs.getTimestamp("registrado_en") != null ? rs.getTimestamp("registrado_en").toString() : null;
        String ultAcceso = rs.getTimestamp("ultimo_acceso") != null ? rs.getTimestamp("ultimo_acceso").toString() : null;
        boolean activo = rs.getBoolean("activo");
        boolean suspendido = rs.getBoolean("suspendido");
        String estado = suspendido ? "Suspendido" : (!activo ? "Inactivo" : "Activo");

        Usuario u = new Usuario(
            rs.getInt("id"),
            rs.getString("nombre"),
            rs.getString("correo"),
            rs.getString("rol"),
            activo,
            suspendido,
            rs.getString("motivo_suspension"),
            comision,
            fechaReg,
            ultAcceso,
            estado
        );
        u.setTelefono(rs.getString("telefono"));
        return u;
    }
}
