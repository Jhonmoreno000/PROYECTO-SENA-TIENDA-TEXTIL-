package infrastructure.persistence.jdbc;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.HashMap;
import java.util.Map;

import infrastructure.config.Conexion;

public class ConfigDAO {

    public Map<String, String> getAllConfig() {
        Map<String, String> configMap = new HashMap<>();
        String query = "SELECT key, value FROM system_config";

        try (Connection con = Conexion.getConnection();
             PreparedStatement pst = con.prepareStatement(query);
             ResultSet rs = pst.executeQuery()) {

            while (rs.next()) {
                configMap.put(rs.getString("key"), rs.getString("value"));
            }
        } catch (SQLException e) {
            System.err.println(" Error obteniendo configuracion: " + e.getMessage());
        }
        return configMap;
    }
    
    public String getConfig(String key) {
        String query = "SELECT value FROM system_config WHERE key = ?";
        try (Connection con = Conexion.getConnection();
             PreparedStatement pst = con.prepareStatement(query)) {
            pst.setString(1, key);
            try (ResultSet rs = pst.executeQuery()) {
                if (rs.next()) {
                    return rs.getString("value");
                }
            }
        } catch (SQLException e) {}
        return null;
    }

    public boolean setConfig(String key, String value) {
        // Upsert logic for PostgreSQL
        String query = "INSERT INTO system_config (key, value) VALUES (?, ?) " +
                       "ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value";
        try (Connection con = Conexion.getConnection();
             PreparedStatement pst = con.prepareStatement(query)) {
            pst.setString(1, key);
            pst.setString(2, value);
            return pst.executeUpdate() > 0;
        } catch (SQLException e) {
            System.err.println(" Error guardando config: " + e.getMessage());
            return false;
        }
    }
}
