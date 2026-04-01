package infrastructure.persistence.jdbc;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Types;
import java.util.ArrayList;
import java.util.List;

import infrastructure.config.Conexion;
import domain.models.Coupon;

public class CouponDAO {

    public List<Coupon> getAllCoupons() {
        List<Coupon> coupons = new ArrayList<>();
        String query = "SELECT id, code, discount_type, discount_value, expires_at, min_purchase, max_uses, first_time_only, usage_count, active FROM coupons ORDER BY id DESC";

        try (Connection con = Conexion.getConnection();
             PreparedStatement pst = con.prepareStatement(query);
             ResultSet rs = pst.executeQuery()) {

            while (rs.next()) {
                Coupon coupon = new Coupon();
                coupon.setId(rs.getInt("id"));
                coupon.setCode(rs.getString("code"));
                coupon.setDiscountType(rs.getString("discount_type"));
                coupon.setDiscountValue(rs.getDouble("discount_value"));
                
                if (rs.getTimestamp("expires_at") != null) {
                    coupon.setExpiresAt(rs.getTimestamp("expires_at").toString());
                }

                coupon.setUsageCount(rs.getInt("usage_count"));
                coupon.setActive(rs.getBoolean("active"));

                double minP = rs.getDouble("min_purchase");
                if (!rs.wasNull()) {
                    coupon.getRules().setMinPurchase(minP);
                }

                int maxU = rs.getInt("max_uses");
                if (!rs.wasNull()) {
                    coupon.getRules().setMaxUses(maxU);
                }

                coupon.getRules().setFirstTimeOnly(rs.getBoolean("first_time_only"));

                coupons.add(coupon);
            }
        } catch (SQLException e) {
            System.err.println("âŒ Error obteniendo cupones: " + e.getMessage());
        }
        return coupons;
    }

    public boolean addCoupon(Coupon coupon) {
        String query = "INSERT INTO coupons (code, discount_type, discount_value, expires_at, min_purchase, max_uses, first_time_only, active) VALUES (?, ?, ?, CAST(? AS TIMESTAMP), ?, ?, ?, ?)";
        try (Connection con = Conexion.getConnection();
             PreparedStatement pst = con.prepareStatement(query)) {
            pst.setString(1, coupon.getCode());
            pst.setString(2, coupon.getDiscountType());
            pst.setDouble(3, coupon.getDiscountValue());
            
            // Assuming expiresAt is standard ISO or SQL date format string since it comes from an input type="date"
            if (coupon.getExpiresAt() != null && !coupon.getExpiresAt().isEmpty()) {
                pst.setString(4, coupon.getExpiresAt() + " 23:59:59");
            } else {
                pst.setNull(4, Types.TIMESTAMP);
            }

            if (coupon.getRules().getMinPurchase() != null) {
                pst.setDouble(5, coupon.getRules().getMinPurchase());
            } else {
                pst.setNull(5, Types.NUMERIC);
            }

            if (coupon.getRules().getMaxUses() != null) {
                pst.setInt(6, coupon.getRules().getMaxUses());
            } else {
                pst.setNull(6, Types.INTEGER);
            }

            pst.setBoolean(7, coupon.getRules().isFirstTimeOnly());
            pst.setBoolean(8, true);

            int rows = pst.executeUpdate();
            return rows > 0;
        } catch (SQLException e) {
            System.err.println(" Error insertando cupÃ³n: " + e.getMessage());
            return false;
        }
    }

    public boolean deactivateCoupon(int id) {
        String query = "UPDATE coupons SET active = false WHERE id = ?";
        try (Connection con = Conexion.getConnection();
             PreparedStatement pst = con.prepareStatement(query)) {
            pst.setInt(1, id);
            return pst.executeUpdate() > 0;
        } catch (SQLException e) {
            System.err.println("Error desactivando cupÃ³n: " + e.getMessage());
            return false;
        }
    }
}
