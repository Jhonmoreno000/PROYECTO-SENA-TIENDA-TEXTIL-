package infrastructure.persistence.jdbc;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import infrastructure.config.Conexion;
import domain.models.*;

/**
 * DAO for tables: inventory_batches, waste_events, stock_thresholds,
 * daily_sales, global_banner, region_sales, recent_activity
 */
public class InventoryDAO {

    // â”€â”€â”€ inventory_batches â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    public List<InventoryBatch> getAllBatches() {
        List<InventoryBatch> list = new ArrayList<>();
        String query = "SELECT * FROM inventory_batches ORDER BY id";
        try (Connection con = Conexion.getConnection();
             PreparedStatement pst = con.prepareStatement(query);
             ResultSet rs = pst.executeQuery()) {
            while (rs.next()) {
                InventoryBatch b = new InventoryBatch();
                b.setId(rs.getString("id"));
                b.setFabricType(rs.getString("fabric_type"));
                b.setSupplier(rs.getString("supplier"));
                b.setInitialMeters(rs.getDouble("initial_meters"));
                b.setCurrentMeters(rs.getDouble("current_meters"));
                b.setStatus(rs.getString("status"));
                if (rs.getTimestamp("created_at") != null) b.setCreatedAt(rs.getTimestamp("created_at").toString().split(" ")[0]);
                if (rs.getTimestamp("last_update") != null) b.setLastUpdate(rs.getTimestamp("last_update").toString().split(" ")[0]);
                list.add(b);
            }
        } catch (SQLException e) { e.printStackTrace(); }
        return list;
    }

    public boolean addBatch(InventoryBatch b) {
        String query = "INSERT INTO inventory_batches (id, fabric_type, supplier, initial_meters, current_meters, status) VALUES (?, ?, ?, ?, ?, ?)";
        try (Connection con = Conexion.getConnection();
             PreparedStatement pst = con.prepareStatement(query)) {
            pst.setString(1, b.getId());
            pst.setString(2, b.getFabricType());
            pst.setString(3, b.getSupplier());
            pst.setDouble(4, b.getInitialMeters());
            pst.setDouble(5, b.getCurrentMeters());
            pst.setString(6, b.getStatus() != null ? b.getStatus() : "active");
            return pst.executeUpdate() > 0;
        } catch (SQLException e) { e.printStackTrace(); return false; }
    }

    public boolean updateBatch(String batchId, double currentMeters, String status) {
        String query = "UPDATE inventory_batches SET current_meters = ?, status = ?, last_update = NOW() WHERE id = ?";
        try (Connection con = Conexion.getConnection();
             PreparedStatement pst = con.prepareStatement(query)) {
            pst.setDouble(1, currentMeters);
            pst.setString(2, status);
            pst.setString(3, batchId);
            return pst.executeUpdate() > 0;
        } catch (SQLException e) { e.printStackTrace(); return false; }
    }

    // â”€â”€â”€ waste_events â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    public List<WasteEvent> getAllWasteEvents() {
        List<WasteEvent> list = new ArrayList<>();
        String query = "SELECT * FROM waste_events ORDER BY id DESC";
        try (Connection con = Conexion.getConnection();
             PreparedStatement pst = con.prepareStatement(query);
             ResultSet rs = pst.executeQuery()) {
            while (rs.next()) {
                WasteEvent w = new WasteEvent();
                w.setId(rs.getInt("id"));
                w.setBatchId(rs.getString("batch_id"));
                w.setMeters(rs.getDouble("meters"));
                w.setReason(rs.getString("reason"));
                w.setDescription(rs.getString("description"));
                w.setResponsible(rs.getString("responsible"));
                if (rs.getDate("event_date") != null) w.setEventDate(rs.getDate("event_date").toString());
                if (rs.getTimestamp("created_at") != null) w.setCreatedAt(rs.getTimestamp("created_at").toString().split(" ")[0]);
                w.setUserId(rs.getInt("user_id"));
                list.add(w);
            }
        } catch (SQLException e) { e.printStackTrace(); }
        return list;
    }

    public boolean addWasteEvent(WasteEvent w) {
        String query = "INSERT INTO waste_events (batch_id, meters, reason, description, responsible, event_date, user_id) VALUES (?, ?, ?, ?, ?, CURRENT_DATE, ?)";
        try (Connection con = Conexion.getConnection();
             PreparedStatement pst = con.prepareStatement(query)) {
            pst.setString(1, w.getBatchId());
            pst.setDouble(2, w.getMeters());
            pst.setString(3, w.getReason());
            pst.setString(4, w.getDescription());
            pst.setString(5, w.getResponsible());
            pst.setInt(6, w.getUserId());
            return pst.executeUpdate() > 0;
        } catch (SQLException e) { e.printStackTrace(); return false; }
    }

    // â”€â”€â”€ stock_thresholds â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    public List<StockThreshold> getAllThresholds() {
        List<StockThreshold> list = new ArrayList<>();
        String query = "SELECT * FROM stock_thresholds ORDER BY id";
        try (Connection con = Conexion.getConnection();
             PreparedStatement pst = con.prepareStatement(query);
             ResultSet rs = pst.executeQuery()) {
            while (rs.next()) {
                StockThreshold t = new StockThreshold();
                t.setId(rs.getInt("id"));
                t.setFabricType(rs.getString("fabric_type"));
                t.setMinMeters(rs.getDouble("min_meters"));
                t.setAlertEnabled(rs.getBoolean("alert_enabled"));
                list.add(t);
            }
        } catch (SQLException e) { e.printStackTrace(); }
        return list;
    }

    public boolean updateThreshold(String fabricType, double minMeters) {
        String query = "UPDATE stock_thresholds SET min_meters = ? WHERE fabric_type = ?";
        try (Connection con = Conexion.getConnection();
             PreparedStatement pst = con.prepareStatement(query)) {
            pst.setDouble(1, minMeters);
            pst.setString(2, fabricType);
            return pst.executeUpdate() > 0;
        } catch (SQLException e) { e.printStackTrace(); return false; }
    }

    // â”€â”€â”€ daily_sales â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    public List<DailySale> getDailySales() {
        List<DailySale> list = new ArrayList<>();
        String query = "SELECT * FROM daily_sales ORDER BY sale_date DESC LIMIT 30";
        try (Connection con = Conexion.getConnection();
             PreparedStatement pst = con.prepareStatement(query);
             ResultSet rs = pst.executeQuery()) {
            while (rs.next()) {
                DailySale d = new DailySale();
                d.setId(rs.getInt("id"));
                d.setSaleDate(rs.getDate("sale_date").toString());
                d.setTotalSales(rs.getDouble("total_sales"));
                d.setTotalOrders(rs.getInt("total_orders"));
                list.add(d);
            }
        } catch (SQLException e) { e.printStackTrace(); }
        return list;
    }

    // â”€â”€â”€ global_banner â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    public GlobalBanner getBanner() {
        String query = "SELECT * FROM global_banner ORDER BY id LIMIT 1";
        try (Connection con = Conexion.getConnection();
             PreparedStatement pst = con.prepareStatement(query);
             ResultSet rs = pst.executeQuery()) {
            if (rs.next()) {
                GlobalBanner b = new GlobalBanner();
                b.setId(rs.getInt("id"));
                b.setEnabled(rs.getBoolean("enabled"));
                b.setMessage(rs.getString("message"));
                b.setBannerType(rs.getString("banner_type"));
                if (rs.getTimestamp("updated_at") != null) b.setUpdatedAt(rs.getTimestamp("updated_at").toString());
                return b;
            }
        } catch (SQLException e) { e.printStackTrace(); }
        return null;
    }

    public boolean updateBanner(boolean enabled, String message, String bannerType) {
        // Upsert: update if exists, insert if not
        String query = "UPDATE global_banner SET enabled = ?, message = ?, banner_type = ?, updated_at = NOW() WHERE id = (SELECT id FROM global_banner ORDER BY id LIMIT 1)";
        try (Connection con = Conexion.getConnection();
             PreparedStatement pst = con.prepareStatement(query)) {
            pst.setBoolean(1, enabled);
            pst.setString(2, message);
            pst.setString(3, bannerType);
            int rows = pst.executeUpdate();
            if (rows == 0) {
                // No banner exists yet, insert one
                String insertQuery = "INSERT INTO global_banner (enabled, message, banner_type) VALUES (?, ?, ?)";
                try (PreparedStatement ins = con.prepareStatement(insertQuery)) {
                    ins.setBoolean(1, enabled);
                    ins.setString(2, message);
                    ins.setString(3, bannerType);
                    return ins.executeUpdate() > 0;
                }
            }
            return true;
        } catch (SQLException e) { e.printStackTrace(); return false; }
    }

    // â”€â”€â”€ region_sales â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    public List<RegionSale> getRegionSales() {
        List<RegionSale> list = new ArrayList<>();
        String query = "SELECT * FROM region_sales ORDER BY sales DESC";
        try (Connection con = Conexion.getConnection();
             PreparedStatement pst = con.prepareStatement(query);
             ResultSet rs = pst.executeQuery()) {
            while (rs.next()) {
                RegionSale r = new RegionSale();
                r.setId(rs.getInt("id"));
                r.setDepartment(rs.getString("department"));
                r.setSales(rs.getDouble("sales"));
                r.setOrders(rs.getInt("orders"));
                r.setCapital(rs.getString("capital"));
                list.add(r);
            }
        } catch (SQLException e) { e.printStackTrace(); }
        return list;
    }

    // â”€â”€â”€ recent_activity â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    public List<RecentActivity> getRecentActivity() {
        List<RecentActivity> list = new ArrayList<>();
        String query = "SELECT * FROM recent_activity ORDER BY created_at DESC LIMIT 20";
        try (Connection con = Conexion.getConnection();
             PreparedStatement pst = con.prepareStatement(query);
             ResultSet rs = pst.executeQuery()) {
            while (rs.next()) {
                RecentActivity a = new RecentActivity();
                a.setId(rs.getInt("id"));
                a.setType(rs.getString("type"));
                a.setUserId(rs.getInt("user_id"));
                a.setUserName(rs.getString("user_name"));
                a.setAction(rs.getString("action"));
                double amount = rs.getDouble("amount");
                if (!rs.wasNull()) a.setAmount(amount);
                if (rs.getTimestamp("created_at") != null) a.setCreatedAt(rs.getTimestamp("created_at").toString());
                a.setIcon(rs.getString("icon"));
                list.add(a);
            }
        } catch (SQLException e) { e.printStackTrace(); }
        return list;
    }

    public boolean addActivity(RecentActivity a) {
        String query = "INSERT INTO recent_activity (type, user_id, user_name, action, amount, icon) VALUES (?, ?, ?, ?, ?, ?)";
        try (Connection con = Conexion.getConnection();
             PreparedStatement pst = con.prepareStatement(query)) {
            pst.setString(1, a.getType());
            pst.setInt(2, a.getUserId());
            pst.setString(3, a.getUserName());
            pst.setString(4, a.getAction());
            if (a.getAmount() != null) pst.setDouble(5, a.getAmount()); else pst.setNull(5, Types.NUMERIC);
            pst.setString(6, a.getIcon());
            return pst.executeUpdate() > 0;
        } catch (SQLException e) { e.printStackTrace(); return false; }
    }

    // ── erp_sales_metrics ─────────────────────────────────────────────────────
    /**
     * Retorna las metricas de ventas ERP (ventas reales vs objetivo) de los
     * ultimos 30 dias, ordenadas cronologicamente ascendente.
     * @return Lista de mapas con campos: recordDate, actualSales, targetSales, profitMargin
     */
    public List<java.util.Map<String, Object>> getErpSalesMetrics() {
        List<java.util.Map<String, Object>> list = new ArrayList<>();
        String query = "SELECT record_date, actual_sales, target_sales, profit_margin FROM erp_sales_metrics ORDER BY record_date ASC LIMIT 30";
        try (Connection con = Conexion.getConnection();
             PreparedStatement pst = con.prepareStatement(query);
             ResultSet rs = pst.executeQuery()) {
            while (rs.next()) {
                java.util.Map<String, Object> row = new java.util.LinkedHashMap<>();
                row.put("recordDate", rs.getDate("record_date").toString());
                row.put("actualSales", rs.getDouble("actual_sales"));
                row.put("targetSales", rs.getDouble("target_sales"));
                row.put("profitMargin", rs.getDouble("profit_margin"));
                list.add(row);
            }
        } catch (SQLException e) { e.printStackTrace(); }
        return list;
    }

    // ── erp_system_notifications ──────────────────────────────────────────────
    /**
     * Retorna las notificaciones del sistema ERP, las mas recientes primero.
     * @return Lista de mapas con campos: id, type, title, message, isRead, createdAt
     */
    public List<java.util.Map<String, Object>> getErpNotifications() {
        List<java.util.Map<String, Object>> list = new ArrayList<>();
        String query = "SELECT id, type, title, message, is_read, created_at FROM erp_system_notifications ORDER BY created_at DESC LIMIT 20";
        try (Connection con = Conexion.getConnection();
             PreparedStatement pst = con.prepareStatement(query);
             ResultSet rs = pst.executeQuery()) {
            while (rs.next()) {
                java.util.Map<String, Object> row = new java.util.LinkedHashMap<>();
                row.put("id", rs.getInt("id"));
                row.put("type", rs.getString("type"));
                row.put("title", rs.getString("title"));
                row.put("message", rs.getString("message"));
                row.put("isRead", rs.getBoolean("is_read"));
                if (rs.getTimestamp("created_at") != null)
                    row.put("createdAt", rs.getTimestamp("created_at").toString());
                list.add(row);
            }
        } catch (SQLException e) { e.printStackTrace(); }
        return list;
    }

    // ── erp_fabric_inventory ──────────────────────────────────────────────────
    /**
     * Retorna el inventario de telas ERP con alertas de stock bajo.
     * @return Lista de mapas con campos: id, sku, fabricName, category, supplier,
     *         currentMeters, minThresholdMeters, costPerMeter, lowStock
     */
    public List<java.util.Map<String, Object>> getErpFabricInventory() {
        List<java.util.Map<String, Object>> list = new ArrayList<>();
        String query = "SELECT id, sku, fabric_name, category, supplier, current_meters, min_threshold_meters, cost_per_meter, last_restock_date FROM erp_fabric_inventory ORDER BY fabric_name ASC";
        try (Connection con = Conexion.getConnection();
             PreparedStatement pst = con.prepareStatement(query);
             ResultSet rs = pst.executeQuery()) {
            while (rs.next()) {
                java.util.Map<String, Object> row = new java.util.LinkedHashMap<>();
                row.put("id", rs.getInt("id"));
                row.put("sku", rs.getString("sku"));
                row.put("fabricName", rs.getString("fabric_name"));
                row.put("category", rs.getString("category"));
                row.put("supplier", rs.getString("supplier"));
                double current = rs.getDouble("current_meters");
                double threshold = rs.getDouble("min_threshold_meters");
                row.put("currentMeters", current);
                row.put("minThresholdMeters", threshold);
                row.put("costPerMeter", rs.getDouble("cost_per_meter"));
                row.put("lowStock", current <= threshold);
                if (rs.getDate("last_restock_date") != null)
                    row.put("lastRestockDate", rs.getDate("last_restock_date").toString());
                list.add(row);
            }
        } catch (SQLException e) { e.printStackTrace(); }
        return list;
    }
}
