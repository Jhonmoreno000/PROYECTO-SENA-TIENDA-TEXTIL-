package infraestructura.persistencia.jdbc;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.HashMap;
import java.util.Map;

import infraestructura.configuracion.Conexion;

/**
 * DAO para la Configuración del Sistema.
 * Gestiona pares clave-valor sobre la tabla 'system_config'.
 */
public class ConfiguracionDAO {

    /**
     * Recupera todas las variables de configuración en un mapa.
     */
    public Map<String, String> obtenerTodaLaConfiguracion() {
        Map<String, String> mapaConfiguracion = new HashMap<>();
        String consulta = "SELECT key, value FROM system_config";

        try (Connection con = Conexion.obtenerConexion();
             PreparedStatement pst = con.prepareStatement(consulta);
             ResultSet rs = pst.executeQuery()) {

            while (rs.next()) {
                mapaConfiguracion.put(rs.getString("key"), rs.getString("value"));
            }
        } catch (SQLException e) {
            System.err.println("[ERROR] Error obteniendo configuracion: " + e.getMessage());
        }
        return mapaConfiguracion;
    }

    /**
     * Recupera el valor de un parámetro por su clave.
     */
    public String obtenerConfiguracion(String clave) {
        String consulta = "SELECT value FROM system_config WHERE key = ?";
        try (Connection con = Conexion.obtenerConexion();
             PreparedStatement pst = con.prepareStatement(consulta)) {
            pst.setString(1, clave);
            try (ResultSet rs = pst.executeQuery()) {
                if (rs.next()) {
                    return rs.getString("value");
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return null;
    }

    /**
     * Guarda o actualiza un parámetro de configuración (UPSERT).
     */
    public boolean guardarConfiguracion(String clave, String valor) {
        String consulta = "INSERT INTO system_config (key, value) VALUES (?, ?) " +
                       "ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value";
        try (Connection con = Conexion.obtenerConexion();
             PreparedStatement pst = con.prepareStatement(consulta)) {
            pst.setString(1, clave);
            pst.setString(2, valor);
            return pst.executeUpdate() > 0;
        } catch (SQLException e) {
            System.err.println("[ERROR] Error guardando config: " + e.getMessage());
            return false;
        }
    }

    // Métodos alias para compatibilidad
    public Map<String, String> getAllConfig() { return obtenerTodaLaConfiguracion(); }
    public String getConfig(String key) { return obtenerConfiguracion(key); }
    public boolean setConfig(String key, String value) { return guardarConfiguracion(key, value); }
}
