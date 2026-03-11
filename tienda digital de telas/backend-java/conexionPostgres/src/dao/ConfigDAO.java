package dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.HashMap;
import java.util.Map;

import conexion.Conexion;

public class ConfigDAO {

    public Map<String, String> getAllConfig() {
        Map<String, String> configMap = new HashMap<>();
        String query = "SELECT config_key, config_value FROM system_config";

        Connection con = Conexion.getConnection();
        try (PreparedStatement pst = con.prepareStatement(query);
             ResultSet rs = pst.executeQuery()) {

            while (rs.next()) {
                configMap.put(rs.getString("config_key"), rs.getString("config_value"));
            }
        } catch (SQLException e) {
            System.err.println("❌ Error obteniendo configuracion: " + e.getMessage());
        }
        return configMap;
    }
    
    public String getConfig(String key) {
        String query = "SELECT config_value FROM system_config WHERE config_key = ?";
        Connection con = Conexion.getConnection();
        try (PreparedStatement pst = con.prepareStatement(query)) {
            pst.setString(1, key);
            try (ResultSet rs = pst.executeQuery()) {
                if (rs.next()) {
                    return rs.getString("config_value");
                }
            }
        } catch (SQLException e) {}
        return null;
    }

    public boolean setConfig(String key, String value) {
        // Upsert logic for PostgreSQL
        String query = "INSERT INTO system_config (config_key, config_value) VALUES (?, ?) " +
                       "ON CONFLICT (config_key) DO UPDATE SET config_value = EXCLUDED.config_value";
        Connection con = Conexion.getConnection();
        try (PreparedStatement pst = con.prepareStatement(query)) {
            pst.setString(1, key);
            pst.setString(2, value);
            return pst.executeUpdate() > 0;
        } catch (SQLException e) {
            System.err.println("❌ Error guardando config: " + e.getMessage());
            return false;
        }
    }
}
