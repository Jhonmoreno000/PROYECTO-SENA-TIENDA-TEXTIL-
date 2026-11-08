package infraestructura.persistencia.jdbc;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.HashMap;
import java.util.Map;

import infraestructura.configuracion.Conexion;

/**
 * DAO para la configuración global del sistema.
 * Gestiona pares clave-valor sobre la tabla `configuracion_sistema` en PostgreSQL.
 */
public class ConfiguracionDAO {

    /**
     * Construye una nueva instancia del DAO de configuración.
     */
    public ConfiguracionDAO() {}

    /**
     * Recupera todas las variables de configuración almacenadas en un mapa clave-valor.
     *
     * @return Mapa (`Map<String, String>`) con las claves y valores registrados.
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
     * Recupera el valor de un parámetro de configuración por su clave única.
     *
     * @param clave Nombre de la clave de configuración (`String`).
     * @return Valor asociado (`String`) o `null` si no existe.
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
     * Inserta o actualiza un parámetro de configuración mediante operación `UPSERT`.
     *
     * @param clave Clave única del parámetro (`String`).
     * @param valor Valor serializado a almacenar (`String`).
     * @return `true` si la operación afectó filas; `false` en caso de error.
     */
    public boolean guardarConfiguracion(String clave, String valor) {
        String consulta = "INSERT INTO configuracion_sistema (clave, valor, actualizado_en) VALUES (?, ?, NOW()) " +
                       "ON CONFLICT (clave) DO UPDATE SET valor = EXCLUDED.valor, actualizado_en = NOW()";
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
}
