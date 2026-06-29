package infrastructure.persistence.jdbc;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.HashMap;
import java.util.Map;

import infrastructure.config.Conexion;

/**
 * DAO (Data Access Object) para la Configuracion del Sistema.
 * Gestiona las operaciones CRUD sobre la tabla 'system_config' que almacena
 * pares clave-valor para la configuracion global del sistema D&D Textil.
 */
public class ConfigDAO {

    /**
     * Recupera todas las configuraciones del sistema como un mapa clave-valor.
     * @return Map donde las claves son los nombres de configuracion y los valores
     *         son sus respectivos contenidos.
     */
    public Map<String, String> getAllConfig() {
        Map<String, String> configMap = new HashMap<>();
        // Consulta todas las filas de la tabla system_config
        String query = "SELECT key, value FROM system_config";

        try (Connection con = Conexion.getConnection();
             PreparedStatement pst = con.prepareStatement(query);
             ResultSet rs = pst.executeQuery()) {

            while (rs.next()) {
                configMap.put(rs.getString("key"), rs.getString("value"));
            }
        } catch (SQLException e) {
            // Error: No se pudo recuperar la configuracion del sistema
            System.err.println("[ERROR] Error obteniendo configuracion: " + e.getMessage());
        }
        return configMap;
    }
    
    /**
     * Recupera el valor de una configuracion especifica por su clave.
     * @param key Nombre de la configuracion a consultar.
     * @return Valor asociado a la clave, o null si no existe.
     */
    public String getConfig(String key) {
        // Consulta filtrada por clave
        String query = "SELECT value FROM system_config WHERE key = ?";
        try (Connection con = Conexion.getConnection();
             PreparedStatement pst = con.prepareStatement(query)) {
            pst.setString(1, key);
            try (ResultSet rs = pst.executeQuery()) {
                if (rs.next()) {
                    return rs.getString("value");
                }
            }
        } catch (SQLException e) {
            // Error silencioso: si la clave no existe, retorna null
        }
        return null;
    }

    /**
     * Establece o actualiza el valor de una configuracion.
     * Utiliza UPSERT (INSERT ... ON CONFLICT DO UPDATE) para crear la
     * configuracion si no existe o actualizarla si ya existe.
     * @param key   Nombre de la configuracion.
     * @param value Valor a asignar.
     * @return true si la operacion fue exitosa, false en caso de error.
     */
    public boolean setConfig(String key, String value) {
        // Logica UPSERT para PostgreSQL
        String query = "INSERT INTO system_config (key, value) VALUES (?, ?) " +
                       "ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value";
        try (Connection con = Conexion.getConnection();
             PreparedStatement pst = con.prepareStatement(query)) {
            pst.setString(1, key);
            pst.setString(2, value);
            return pst.executeUpdate() > 0;
        } catch (SQLException e) {
            // Error: No se pudo guardar la configuracion
            System.err.println("[ERROR] Error guardando config: " + e.getMessage());
            return false;
        }
    }
}
