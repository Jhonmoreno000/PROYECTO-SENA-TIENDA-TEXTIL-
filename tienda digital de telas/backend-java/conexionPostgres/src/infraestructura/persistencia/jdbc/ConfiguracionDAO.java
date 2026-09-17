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
 * Gestiona pares clave-valor sobre la tabla 'configuracion_sistema'.
 */
public class ConfiguracionDAO {

    /**
     * Recupera todas las variables de configuración en un mapa.
     */
    public Map<String, String> obtenerTodaLaConfiguracion() {
        Map<String, String> mapaConfiguracion = new HashMap<>();
        String consulta = "SELECT clave, valor FROM configuracion_sistema";

        try (Connection con = Conexion.obtenerConexion();
             PreparedStatement pst = con.prepareStatement(consulta);
             ResultSet rs = pst.executeQuery()) {

            while (rs.next()) {
                mapaConfiguracion.put(rs.getString("clave"), rs.getString("valor"));
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
        String consulta = "SELECT valor FROM configuracion_sistema WHERE clave = ?";
        try (Connection con = Conexion.obtenerConexion();
             PreparedStatement pst = con.prepareStatement(consulta)) {
            pst.setString(1, clave);
            try (ResultSet rs = pst.executeQuery()) {
                if (rs.next()) {
                    return rs.getString("valor");
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
        String consulta = "INSERT INTO configuracion_sistema (clave, valor) VALUES (?, ?) " +
                       "ON CONFLICT (clave) DO UPDATE SET valor = EXCLUDED.valor";
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
    public String getConfig(String clave) { return obtenerConfiguracion(clave); }
    public boolean setConfig(String clave, String valor) { return guardarConfiguracion(clave, valor); }
}

