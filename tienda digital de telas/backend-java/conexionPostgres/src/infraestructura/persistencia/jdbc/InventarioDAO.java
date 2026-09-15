package infraestructura.persistencia.jdbc;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import infraestructura.configuracion.Conexion;
import dominio.modelos.*;

/**
 * DAO para el Inventario, Mermas, Umbrales y Métricas del Sistema.
 */
public class InventarioDAO {

    // --- inventory_batches ---------------------------------------------------

    public List<LoteInventario> obtenerTodosLosLotes() {
        List<LoteInventario> lista = new ArrayList<>();
        String consulta = "SELECT * FROM inventory_batches ORDER BY id";
        try (Connection con = Conexion.obtenerConexion();
             PreparedStatement pst = con.prepareStatement(consulta);
             ResultSet rs = pst.executeQuery()) {
            while (rs.next()) {
                LoteInventario b = new LoteInventario();
                b.setId(rs.getString("id"));
                b.setTipoTela(rs.getString("fabric_type"));
                b.setProveedor(rs.getString("supplier"));
                b.setMetrosIniciales(rs.getDouble("initial_meters"));
                b.setMetrosActuales(rs.getDouble("current_meters"));
                b.setEstado(rs.getString("status"));
                if (rs.getTimestamp("created_at") != null) b.setFechaCreacion(rs.getTimestamp("created_at").toString().split(" ")[0]);
                if (rs.getTimestamp("last_update") != null) b.setUltimaActualizacion(rs.getTimestamp("last_update").toString().split(" ")[0]);
                lista.add(b);
            }
        } catch (SQLException e) { 
            e.printStackTrace(); 
        }
        return lista;
    }

    public boolean agregarLote(LoteInventario b) {
        String consulta = "INSERT INTO inventory_batches (id, fabric_type, supplier, initial_meters, current_meters, status) VALUES (?, ?, ?, ?, ?, ?)";
        try (Connection con = Conexion.obtenerConexion();
             PreparedStatement pst = con.prepareStatement(consulta)) {
            pst.setString(1, b.getId());
            pst.setString(2, b.getTipoTela());
            pst.setString(3, b.getProveedor());
            pst.setDouble(4, b.getMetrosIniciales());
            pst.setDouble(5, b.getMetrosActuales());
            pst.setString(6, b.getEstado() != null ? b.getEstado() : "active");
            return pst.executeUpdate() > 0;
        } catch (SQLException e) { 
            e.printStackTrace(); 
            return false; 
        }
    }

    public boolean actualizarLote(String idLote, double metrosActuales, String estado) {
        String consulta = "UPDATE inventory_batches SET current_meters = ?, status = ?, last_update = NOW() WHERE id = ?";
        try (Connection con = Conexion.obtenerConexion();
             PreparedStatement pst = con.prepareStatement(consulta)) {
            pst.setDouble(1, metrosActuales);
            pst.setString(2, estado);
            pst.setString(3, idLote);
            return pst.executeUpdate() > 0;
        } catch (SQLException e) { 
            e.printStackTrace(); 
            return false; 
        }
    }

    // --- waste_events --------------------------------------------------------

    public List<EventoMerma> obtenerTodosLosEventosMerma() {
        List<EventoMerma> lista = new ArrayList<>();
        String consulta = "SELECT * FROM waste_events ORDER BY id DESC";
        try (Connection con = Conexion.obtenerConexion();
             PreparedStatement pst = con.prepareStatement(consulta);
             ResultSet rs = pst.executeQuery()) {
            while (rs.next()) {
                EventoMerma w = new EventoMerma();
                w.setId(rs.getInt("id"));
                w.setIdLote(rs.getString("batch_id"));
                w.setMetros(rs.getDouble("meters"));
                w.setMotivo(rs.getString("reason"));
                w.setDescripcion(rs.getString("description"));
                w.setResponsable(rs.getString("responsible"));
                if (rs.getDate("event_date") != null) w.setFechaEvento(rs.getDate("event_date").toString());
                if (rs.getTimestamp("created_at") != null) w.setFechaCreacion(rs.getTimestamp("created_at").toString().split(" ")[0]);
                w.setIdUsuario(rs.getInt("user_id"));
                lista.add(w);
            }
        } catch (SQLException e) { 
            e.printStackTrace(); 
        }
        return lista;
    }

    public boolean agregarEventoMerma(EventoMerma w) {
        String consulta = "INSERT INTO waste_events (batch_id, meters, reason, description, responsible, event_date, user_id) VALUES (?, ?, ?, ?, ?, CURRENT_DATE, ?)";
        try (Connection con = Conexion.obtenerConexion();
             PreparedStatement pst = con.prepareStatement(consulta)) {
            pst.setString(1, w.getIdLote());
            pst.setDouble(2, w.getMetros());
            pst.setString(3, w.getMotivo());
            pst.setString(4, w.getDescripcion());
            pst.setString(5, w.getResponsable());
            pst.setInt(6, w.getIdUsuario());
            return pst.executeUpdate() > 0;
        } catch (SQLException e) { 
            e.printStackTrace(); 
            return false; 
        }
    }

    // --- stock_thresholds ----------------------------------------------------

    public List<UmbralStock> obtenerTodosLosUmbrales() {
        List<UmbralStock> lista = new ArrayList<>();
        String consulta = "SELECT * FROM stock_thresholds ORDER BY id";
        try (Connection con = Conexion.obtenerConexion();
             PreparedStatement pst = con.prepareStatement(consulta);
             ResultSet rs = pst.executeQuery()) {
            while (rs.next()) {
                UmbralStock t = new UmbralStock();
                t.setId(rs.getInt("id"));
                t.setTipoTela(rs.getString("fabric_type"));
                t.setMetrosMinimos(rs.getDouble("min_meters"));
                t.setAlertaHabilitada(rs.getBoolean("alert_enabled"));
                lista.add(t);
            }
        } catch (SQLException e) { 
            e.printStackTrace(); 
        }
        return lista;
    }

    public boolean actualizarUmbral(String tipoTela, double metrosMinimos) {
        String consulta = "UPDATE stock_thresholds SET min_meters = ? WHERE fabric_type = ?";
        try (Connection con = Conexion.obtenerConexion();
             PreparedStatement pst = con.prepareStatement(consulta)) {
            pst.setDouble(1, metrosMinimos);
            pst.setString(2, tipoTela);
            return pst.executeUpdate() > 0;
        } catch (SQLException e) { 
            e.printStackTrace(); 
            return false; 
        }
    }

    // --- daily_sales ---------------------------------------------------------

    public List<VentaDiaria> obtenerVentasDiarias() {
        List<VentaDiaria> lista = new ArrayList<>();
        String consulta = "SELECT * FROM daily_sales ORDER BY sale_date DESC LIMIT 30";
        try (Connection con = Conexion.obtenerConexion();
             PreparedStatement pst = con.prepareStatement(consulta);
             ResultSet rs = pst.executeQuery()) {
            while (rs.next()) {
                VentaDiaria d = new VentaDiaria();
                d.setId(rs.getInt("id"));
                d.setFechaVenta(rs.getDate("sale_date").toString());
                d.setTotalVentas(rs.getDouble("total_sales"));
                d.setTotalPedidos(rs.getInt("total_orders"));
                lista.add(d);
            }
        } catch (SQLException e) { 
            e.printStackTrace(); 
        }
        return lista;
    }

    // --- global_banner -------------------------------------------------------

    public BannerGlobal obtenerBanner() {
        String consulta = "SELECT * FROM global_banner ORDER BY id LIMIT 1";
        try (Connection con = Conexion.obtenerConexion();
             PreparedStatement pst = con.prepareStatement(consulta);
             ResultSet rs = pst.executeQuery()) {
            if (rs.next()) {
                BannerGlobal b = new BannerGlobal();
                b.setId(rs.getInt("id"));
                b.setHabilitado(rs.getBoolean("enabled"));
                b.setMensaje(rs.getString("message"));
                b.setTipoBanner(rs.getString("banner_type"));
                if (rs.getTimestamp("updated_at") != null) b.setFechaActualizacion(rs.getTimestamp("updated_at").toString());
                return b;
            }
        } catch (SQLException e) { 
            e.printStackTrace(); 
        }
        return null;
    }

    public boolean actualizarBanner(boolean habilitado, String mensaje, String tipoBanner) {
        String consulta = "UPDATE global_banner SET enabled = ?, message = ?, banner_type = ?, updated_at = NOW() WHERE id = (SELECT id FROM global_banner ORDER BY id LIMIT 1)";
        try (Connection con = Conexion.obtenerConexion();
             PreparedStatement pst = con.prepareStatement(consulta)) {
            pst.setBoolean(1, habilitado);
            pst.setString(2, mensaje);
            pst.setString(3, tipoBanner);
            int filas = pst.executeUpdate();
            if (filas == 0) {
                String consultaInsertar = "INSERT INTO global_banner (enabled, message, banner_type) VALUES (?, ?, ?)";
                try (PreparedStatement ins = con.prepareStatement(consultaInsertar)) {
                    ins.setBoolean(1, habilitado);
                    ins.setString(2, mensaje);
                    ins.setString(3, tipoBanner);
                    return ins.executeUpdate() > 0;
                }
            }
            return true;
        } catch (SQLException e) { 
            e.printStackTrace(); 
            return false; 
        }
    }

    // --- region_sales --------------------------------------------------------

    public List<VentaRegion> obtenerVentasPorRegion() {
        List<VentaRegion> lista = new ArrayList<>();
        String consulta = "SELECT * FROM region_sales ORDER BY sales DESC";
        try (Connection con = Conexion.obtenerConexion();
             PreparedStatement pst = con.prepareStatement(consulta);
             ResultSet rs = pst.executeQuery()) {
            while (rs.next()) {
                VentaRegion r = new VentaRegion();
                r.setId(rs.getInt("id"));
                r.setDepartamento(rs.getString("department"));
                r.setVentas(rs.getDouble("sales"));
                r.setPedidos(rs.getInt("orders"));
                r.setCapital(rs.getString("capital"));
                lista.add(r);
            }
        } catch (SQLException e) { 
            e.printStackTrace(); 
        }
        return lista;
    }

    // --- recent_activity -----------------------------------------------------

    public List<ActividadReciente> obtenerActividadReciente() {
        List<ActividadReciente> lista = new ArrayList<>();
        String consulta = "SELECT * FROM recent_activity ORDER BY created_at DESC LIMIT 20";
        try (Connection con = Conexion.obtenerConexion();
             PreparedStatement pst = con.prepareStatement(consulta);
             ResultSet rs = pst.executeQuery()) {
            while (rs.next()) {
                ActividadReciente a = new ActividadReciente();
                a.setId(rs.getInt("id"));
                a.setTipo(rs.getString("type"));
                a.setIdUsuario(rs.getInt("user_id"));
                a.setNombreUsuario(rs.getString("user_name"));
                a.setAccion(rs.getString("action"));
                double monto = rs.getDouble("amount");
                if (!rs.wasNull()) a.setMonto(monto);
                if (rs.getTimestamp("created_at") != null) a.setFechaCreacion(rs.getTimestamp("created_at").toString());
                a.setIcono(rs.getString("icon"));
                lista.add(a);
            }
        } catch (SQLException e) { 
            e.printStackTrace(); 
        }
        return lista;
    }

    public boolean agregarActividad(ActividadReciente a) {
        String consulta = "INSERT INTO recent_activity (type, user_id, user_name, action, amount, icon) VALUES (?, ?, ?, ?, ?, ?)";
        try (Connection con = Conexion.obtenerConexion();
             PreparedStatement pst = con.prepareStatement(consulta)) {
            pst.setString(1, a.getTipo());
            pst.setInt(2, a.getIdUsuario());
            pst.setString(3, a.getNombreUsuario());
            pst.setString(4, a.getAccion());
            if (a.getMonto() != null) pst.setDouble(5, a.getMonto()); else pst.setNull(5, Types.NUMERIC);
            pst.setString(6, a.getIcono());
            return pst.executeUpdate() > 0;
        } catch (SQLException e) { 
            e.printStackTrace(); 
            return false; 
        }
    }

    // --- erp_sales_metrics ---------------------------------------------------

    public List<java.util.Map<String, Object>> obtenerMetricasVentasErp() {
        List<java.util.Map<String, Object>> lista = new ArrayList<>();
        String consulta = "SELECT record_date, actual_sales, target_sales, profit_margin FROM erp_sales_metrics ORDER BY record_date ASC LIMIT 30";
        try (Connection con = Conexion.obtenerConexion();
             PreparedStatement pst = con.prepareStatement(consulta);
             ResultSet rs = pst.executeQuery()) {
            while (rs.next()) {
                java.util.Map<String, Object> fila = new java.util.LinkedHashMap<>();
                fila.put("recordDate", rs.getDate("record_date").toString());
                fila.put("actualSales", rs.getDouble("actual_sales"));
                fila.put("targetSales", rs.getDouble("target_sales"));
                fila.put("profitMargin", rs.getDouble("profit_margin"));
                lista.add(fila);
            }
        } catch (SQLException e) { 
            e.printStackTrace(); 
        }
        return lista;
    }

    // --- erp_system_notifications --------------------------------------------

    public List<java.util.Map<String, Object>> obtenerNotificacionesErp() {
        List<java.util.Map<String, Object>> lista = new ArrayList<>();
        String consulta = "SELECT id, type, title, message, is_read, created_at FROM erp_system_notifications ORDER BY created_at DESC LIMIT 20";
        try (Connection con = Conexion.obtenerConexion();
             PreparedStatement pst = con.prepareStatement(consulta);
             ResultSet rs = pst.executeQuery()) {
            while (rs.next()) {
                java.util.Map<String, Object> fila = new java.util.LinkedHashMap<>();
                fila.put("id", rs.getInt("id"));
                fila.put("type", rs.getString("type"));
                fila.put("title", rs.getString("title"));
                fila.put("message", rs.getString("message"));
                fila.put("isRead", rs.getBoolean("is_read"));
                if (rs.getTimestamp("created_at") != null)
                    fila.put("createdAt", rs.getTimestamp("created_at").toString());
                lista.add(fila);
            }
        } catch (SQLException e) { 
            e.printStackTrace(); 
        }
        return lista;
    }

    // --- erp_fabric_inventory ------------------------------------------------

    public List<java.util.Map<String, Object>> obtenerInventarioTelasErp() {
        List<java.util.Map<String, Object>> lista = new ArrayList<>();
        String consulta = "SELECT id, sku, fabric_name, category, supplier, current_meters, min_threshold_meters, cost_per_meter, last_restock_date FROM erp_fabric_inventory ORDER BY fabric_name ASC";
        try (Connection con = Conexion.obtenerConexion();
             PreparedStatement pst = con.prepareStatement(consulta);
             ResultSet rs = pst.executeQuery()) {
            while (rs.next()) {
                java.util.Map<String, Object> fila = new java.util.LinkedHashMap<>();
                fila.put("id", rs.getInt("id"));
                fila.put("sku", rs.getString("sku"));
                fila.put("fabricName", rs.getString("fabric_name"));
                fila.put("category", rs.getString("category"));
                fila.put("supplier", rs.getString("supplier"));
                double actual = rs.getDouble("current_meters");
                double umbral = rs.getDouble("min_threshold_meters");
                fila.put("currentMeters", actual);
                fila.put("minThresholdMeters", umbral);
                fila.put("costPerMeter", rs.getDouble("cost_per_meter"));
                fila.put("lowStock", actual <= umbral);
                if (rs.getDate("last_restock_date") != null)
                    fila.put("lastRestockDate", rs.getDate("last_restock_date").toString());
                lista.add(fila);
            }
        } catch (SQLException e) { 
            e.printStackTrace(); 
        }
        return lista;
    }

    // Métodos alias para compatibilidad
    public List<LoteInventario> getAllBatches() { return obtenerTodosLosLotes(); }
    public boolean addBatch(LoteInventario b) { return agregarLote(b); }
    public boolean updateBatch(String batchId, double currentMeters, String status) { return actualizarLote(batchId, currentMeters, status); }
    public List<EventoMerma> getAllWasteEvents() { return obtenerTodosLosEventosMerma(); }
    public boolean addWasteEvent(EventoMerma w) { return agregarEventoMerma(w); }
    public List<UmbralStock> getAllThresholds() { return obtenerTodosLosUmbrales(); }
    public boolean updateThreshold(String fabricType, double minMeters) { return actualizarUmbral(fabricType, minMeters); }
    public List<VentaDiaria> getDailySales() { return obtenerVentasDiarias(); }
    public BannerGlobal getBanner() { return obtenerBanner(); }
    public boolean updateBanner(boolean enabled, String message, String bannerType) { return actualizarBanner(enabled, message, bannerType); }
    public List<VentaRegion> getRegionSales() { return obtenerVentasPorRegion(); }
    public List<ActividadReciente> getRecentActivity() { return obtenerActividadReciente(); }
    public boolean addActivity(ActividadReciente a) { return agregarActividad(a); }
    public List<java.util.Map<String, Object>> getErpSalesMetrics() { return obtenerMetricasVentasErp(); }
    public List<java.util.Map<String, Object>> getErpNotifications() { return obtenerNotificacionesErp(); }
    public List<java.util.Map<String, Object>> getErpFabricInventory() { return obtenerInventarioTelasErp(); }
}
