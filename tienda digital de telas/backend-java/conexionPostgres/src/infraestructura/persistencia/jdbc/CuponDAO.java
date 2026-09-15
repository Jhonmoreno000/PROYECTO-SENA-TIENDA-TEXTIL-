package infraestructura.persistencia.jdbc;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Types;
import java.util.ArrayList;
import java.util.List;

import infraestructura.configuracion.Conexion;
import dominio.modelos.Cupon;

/**
 * DAO para Cupones de Descuento.
 * Opera sobre la tabla 'coupons'.
 */
public class CuponDAO {

    /**
     * Recupera todos los cupones registrados.
     */
    public List<Cupon> obtenerTodosLosCupones() {
        List<Cupon> cupones = new ArrayList<>();
        String consulta = "SELECT id, code, discount_type, discount_value, expires_at, min_purchase, max_uses, first_time_only, usage_count, active FROM coupons ORDER BY id DESC";

        try (Connection con = Conexion.obtenerConexion();
             PreparedStatement pst = con.prepareStatement(consulta);
             ResultSet rs = pst.executeQuery()) {

            while (rs.next()) {
                Cupon cupon = new Cupon();
                cupon.setId(rs.getInt("id"));
                cupon.setCodigo(rs.getString("code"));
                cupon.setTipoDescuento(rs.getString("discount_type"));
                cupon.setValorDescuento(rs.getDouble("discount_value"));
                
                if (rs.getTimestamp("expires_at") != null) {
                    cupon.setFechaExpiracion(rs.getTimestamp("expires_at").toString());
                }

                cupon.setConteoUso(rs.getInt("usage_count"));
                cupon.setActivo(rs.getBoolean("active"));

                double minP = rs.getDouble("min_purchase");
                if (!rs.wasNull()) {
                    cupon.getReglas().setCompraMinima(minP);
                }

                int maxU = rs.getInt("max_uses");
                if (!rs.wasNull()) {
                    cupon.getReglas().setUsosMaximos(maxU);
                }

                cupon.getReglas().setSoloPrimeraCompra(rs.getBoolean("first_time_only"));

                cupones.add(cupon);
            }
        } catch (SQLException e) {
            System.err.println("[ERROR] Error obteniendo cupones: " + e.getMessage());
        }
        return cupones;
    }

    /**
     * Inserta un nuevo cupón en la base de datos.
     */
    public boolean agregarCupon(Cupon cupon) {
        String consulta = "INSERT INTO coupons (code, discount_type, discount_value, expires_at, min_purchase, max_uses, first_time_only, active) VALUES (?, ?, ?, CAST(? AS TIMESTAMP), ?, ?, ?, ?)";
        try (Connection con = Conexion.obtenerConexion();
             PreparedStatement pst = con.prepareStatement(consulta)) {
            pst.setString(1, cupon.getCodigo());
            pst.setString(2, cupon.getTipoDescuento());
            pst.setDouble(3, cupon.getValorDescuento());
            
            if (cupon.getFechaExpiracion() != null && !cupon.getFechaExpiracion().isEmpty()) {
                pst.setString(4, cupon.getFechaExpiracion() + " 23:59:59");
            } else {
                pst.setNull(4, Types.TIMESTAMP);
            }

            if (cupon.getReglas().getCompraMinima() != null) {
                pst.setDouble(5, cupon.getReglas().getCompraMinima());
            } else {
                pst.setNull(5, Types.NUMERIC);
            }

            if (cupon.getReglas().getUsosMaximos() != null) {
                pst.setInt(6, cupon.getReglas().getUsosMaximos());
            } else {
                pst.setNull(6, Types.INTEGER);
            }

            pst.setBoolean(7, cupon.getReglas().isSoloPrimeraCompra());
            pst.setBoolean(8, true);

            return pst.executeUpdate() > 0;
        } catch (SQLException e) {
            System.err.println("[ERROR] Error insertando cupon: " + e.getMessage());
            return false;
        }
    }

    /**
     * Desactiva un cupón existente (soft-delete).
     */
    public boolean desactivarCupon(int id) {
        String consulta = "UPDATE coupons SET active = false WHERE id = ?";
        try (Connection con = Conexion.obtenerConexion();
             PreparedStatement pst = con.prepareStatement(consulta)) {
            pst.setInt(1, id);
            return pst.executeUpdate() > 0;
        } catch (SQLException e) {
            System.err.println("[ERROR] Error desactivando cupon: " + e.getMessage());
            return false;
        }
    }

    // Métodos alias para compatibilidad
    public List<Cupon> getAllCoupons() { return obtenerTodosLosCupones(); }
    public boolean addCoupon(Cupon coupon) { return agregarCupon(coupon); }
    public boolean deactivateCoupon(int id) { return desactivarCupon(id); }
}
