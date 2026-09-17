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

    // --- lotes_inventario ---------------------------------------------------

    public List<LoteInventario> obtenerTodosLosLotes() {
        List<LoteInventario> lista = new ArrayList<>();
        String consulta = "SELECT * FROM lotes_inventario ORDER BY id";
        try (Connection con = Conexion.obtenerConexion();
             PreparedStatement pst = con.prepareStatement(consulta);
             ResultSet rs = pst.executeQuery()) {
            while (rs.next()) {
                LoteInventario b = new LoteInventario();
                b.setId(rs.getString("id"));
                b.setTipoTela(rs.getString("tipo_tela"));
                b.setProveedor(rs.getString("proveedor"));
                b.setMetrosIniciales(rs.getDouble("initial_meters"));
                b.setMetrosActuales(rs.getDouble("metros_actuales"));
                b.setEstado(rs.getString("status"));
                if (rs.getTimestamp("creado_en") != null) b.setFechaCreacion(rs.getTimestamp("creado_en").toString().split(" ")[0]);
                if (rs.getTimestamp("last_update") != null) b.setUltimaActualizacion(rs.getTimestamp("last_update").toString().split(" ")[0]);
                lista.add(b);
            }
        } catch (SQLException e) { 
            e.printStackTrace(); 
        }
        return lista;
    }

    public boolean agregarLote(LoteInventario b) {
        String consulta = "INSERT INTO lotes_inventario (id, tipo_tela, proveedor, initial_meters, metros_actuales, status) VALUES (?, ?, ?, ?, ?, ?)";
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
        String consulta = "UPDATE lotes_inventario SET metros_actuales = ?, status = ?, last_update = NOW() WHERE id = ?";
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

    // --- eventos_merma --------------------------------------------------------

    public List<EventoMerma> obtenerTodosLosEventosMerma() {
        List<EventoMerma> lista = new ArrayList<>();
        String consulta = "SELECT * FROM eventos_merma ORDER BY id DESC";
        try (Connection con = Conexion.obtenerConexion();
             PreparedStatement pst = con.prepareStatement(consulta);
             ResultSet rs = pst.executeQuery()) {
            while (rs.next()) {
                EventoMerma w = new EventoMerma();
                w.setId(rs.getInt("id"));
                w.setIdLote(rs.getString("batch_id"));
                w.setMetros(rs.getDouble("meters"));
                w.setMotivo(rs.getString("motivo"));
                w.setDescripcion(rs.getString("descripcion"));
                w.setResponsable(rs.getString("responsible"));
                if (rs.getDate("event_date") != null) w.setFechaEvento(rs.getDate("event_date").toString());
                if (rs.getTimestamp("creado_en") != null) w.setFechaCreacion(rs.getTimestamp("creado_en").toString().split(" ")[0]);
                w.setIdUsuario(rs.getInt("usuario_id"));
                lista.add(w);
            }
        } catch (SQLException e) { 
            e.printStackTrace(); 
        }
        return lista;
    }

    public boolean agregarEventoMerma(EventoMerma w) {
        String consulta = "INSERT INTO eventos_merma (batch_id, meters, motivo, descripcion, responsible, event_date, usuario_id) VALUES (?, ?, ?, ?, ?, CURRENT_DATE, ?)";
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

    // --- umbrales_stock ----------------------------------------------------

    public List<UmbralStock> obtenerTodosLosUmbrales() {
        List<UmbralStock> lista = new ArrayList<>();
        String consulta = "SELECT * FROM umbrales_stock ORDER BY id";
        try (Connection con = Conexion.obtenerConexion();
             PreparedStatement pst = con.prepareStatement(consulta);
             ResultSet rs = pst.executeQuery()) {
            while (rs.next()) {
                UmbralStock t = new UmbralStock();
                t.setId(rs.getInt("id"));
                t.setTipoTela(rs.getString("tipo_tela"));
                t.setMetrosMinimos(rs.getDouble("metros_minimos"));
                t.setAlertaHabilitada(rs.getBoolean("alert_enabled"));
                lista.add(t);
            }
        } catch (SQLException e) { 
            e.printStackTrace(); 
        }
        return lista;
    }

    public boolean actualizarUmbral(String tipoTela, double metrosMinimos) {
        String consulta = "UPDATE umbrales_stock SET metros_minimos = ? WHERE tipo_tela = ?";
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

    // --- ventas_diarias ---------------------------------------------------------

    public List<VentaDiaria> obtenerVentasDiarias() {
        List<VentaDiaria> lista = new ArrayList<>();
        String consulta = "SELECT * FROM ventas_diarias ORDER BY fecha_venta DESC LIMIT 30";
        try (Connection con = Conexion.obtenerConexion();
             PreparedStatement pst = con.prepareStatement(consulta);
             ResultSet rs = pst.executeQuery()) {
            while (rs.next()) {
                VentaDiaria d = new VentaDiaria();
                d.setId(rs.getInt("id"));
                d.setFechaVenta(rs.getDate("fecha_venta").toString());
                d.setTotalVentas(rs.getDouble("total_sales"));
                d.setTotalPedidos(rs.getInt("total_orders"));
                lista.add(d);
            }
        } catch (SQLException e) { 
            e.printStackTrace(); 
        }
        return lista;
    }

    // --- banner_global -------------------------------------------------------

    public BannerGlobal obtenerBanner() {
        String consulta = "SELECT * FROM banner_global ORDER BY id LIMIT 1";
        try (Connection con = Conexion.obtenerConexion();
             PreparedStatement pst = con.prepareStatement(consulta);
             ResultSet rs = pst.executeQuery()) {
            if (rs.next()) {
                BannerGlobal b = new BannerGlobal();
                b.setId(rs.getInt("id"));
                b.setHabilitado(rs.getBoolean("activo"));
                b.setMensaje(rs.getString("mensaje"));
                b.setTipoBanner(rs.getString("tipo_banner"));
                if (rs.getTimestamp("actualizado_en") != null) b.setFechaActualizacion(rs.getTimestamp("actualizado_en").toString());
                return b;
            }
        } catch (SQLException e) { 
            e.printStackTrace(); 
        }
        return null;
    }

    public boolean actualizarBanner(boolean habilitado, String mensaje, String tipoBanner) {
        String consulta = "UPDATE banner_global SET activo = ?, mensaje = ?, tipo_banner = ?, actualizado_en = NOW() WHERE id = (SELECT id FROM banner_global ORDER BY id LIMIT 1)";
        try (Connection con = Conexion.obtenerConexion();
             PreparedStatement pst = con.prepareStatement(consulta)) {
            pst.setBoolean(1, habilitado);
            pst.setString(2, mensaje);
            pst.setString(3, tipoBanner);
            int filas = pst.executeUpdate();
            if (filas == 0) {
                String consultaInsertar = "INSERT INTO banner_global (activo, mensaje, tipo_banner) VALUES (?, ?, ?)";
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

    // --- ventas_region --------------------------------------------------------

    public List<VentaRegion> obtenerVentasPorRegion() {
        List<VentaRegion> lista = new ArrayList<>();
        String consulta = "SELECT * FROM ventas_region ORDER BY ventas_totales DESC";
        try (Connection con = Conexion.obtenerConexion();
             PreparedStatement pst = con.prepareStatement(consulta);
             ResultSet rs = pst.executeQuery()) {
            while (rs.next()) {
                VentaRegion r = new VentaRegion();
                r.setId(rs.getInt("id"));
                r.setDepartamento(rs.getString("department"));
                r.setVentas(rs.getDouble("ventas_totales"));
                r.setPedidos(rs.getInt("orders"));
                r.setCapital(rs.getString("capital"));
                lista.add(r);
            }
        } catch (SQLException e) { 
            e.printStackTrace(); 
        }
        return lista;
    }

    // --- actividad_reciente -----------------------------------------------------

    public List<ActividadReciente> obtenerActividadReciente() {
        List<ActividadReciente> lista = new ArrayList<>();
        String consulta = "SELECT * FROM actividad_reciente ORDER BY creado_en DESC LIMIT 20";
        try (Connection con = Conexion.obtenerConexion();
             PreparedStatement pst = con.prepareStatement(consulta);
             ResultSet rs = pst.executeQuery()) {
            while (rs.next()) {
                ActividadReciente a = new ActividadReciente();
                a.setId(rs.getInt("id"));
                a.setTipo(rs.getString("type"));
                a.setIdUsuario(rs.getInt("usuario_id"));
                a.setNombreUsuario(rs.getString("nombre_usuario"));
                a.setAccion(rs.getString("accion"));
                double monto = rs.getDouble("monto");
                if (!rs.wasNull()) a.setMonto(monto);
                if (rs.getTimestamp("creado_en") != null) a.setFechaCreacion(rs.getTimestamp("creado_en").toString());
                a.setIcono(rs.getString("icono"));
                lista.add(a);
            }
        } catch (SQLException e) { 
            e.printStackTrace(); 
        }
        return lista;
    }

    public boolean agregarActividad(ActividadReciente a) {
        String consulta = "INSERT INTO actividad_reciente (type, usuario_id, nombre_usuario, accion, monto, icono) VALUES (?, ?, ?, ?, ?, ?)";
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

    // --- metricas_ventas_erp ---------------------------------------------------

    public List<java.util.Map<String, Object>> obtenerMetricasVentasErp() {
        List<java.util.Map<String, Object>> lista = new ArrayList<>();
        String consulta = "SELECT fecha_registro, ventas_reales, ventas_objetivo, margen_ganancia FROM metricas_ventas_erp ORDER BY fecha_registro ASC LIMIT 30";
        try (Connection con = Conexion.obtenerConexion();
             PreparedStatement pst = con.prepareStatement(consulta);
             ResultSet rs = pst.executeQuery()) {
            while (rs.next()) {
                java.util.Map<String, Object> fila = new java.util.LinkedHashMap<>();
                fila.put("recordDate", rs.getDate("fecha_registro").toString());
                fila.put("actualSales", rs.getDouble("ventas_reales"));
                fila.put("targetSales", rs.getDouble("ventas_objetivo"));
                fila.put("profitMargin", rs.getDouble("margen_ganancia"));
                lista.add(fila);
            }
        } catch (SQLException e) { 
            e.printStackTrace(); 
        }
        return lista;
    }

    // --- notificaciones_sistema_erp --------------------------------------------

    public List<java.util.Map<String, Object>> obtenerNotificacionesErp() {
        List<java.util.Map<String, Object>> lista = new ArrayList<>();
        String consulta = "SELECT id, type, titulo, mensaje, leido, creado_en FROM notificaciones_sistema_erp ORDER BY creado_en DESC LIMIT 20";
        try (Connection con = Conexion.obtenerConexion();
             PreparedStatement pst = con.prepareStatement(consulta);
             ResultSet rs = pst.executeQuery()) {
            while (rs.next()) {
                java.util.Map<String, Object> fila = new java.util.LinkedHashMap<>();
                fila.put("id", rs.getInt("id"));
                fila.put("type", rs.getString("type"));
                fila.put("titulo", rs.getString("titulo"));
                fila.put("mensaje", rs.getString("mensaje"));
                fila.put("isRead", rs.getBoolean("leido"));
                if (rs.getTimestamp("creado_en") != null)
                    fila.put("createdAt", rs.getTimestamp("creado_en").toString());
                lista.add(fila);
            }
        } catch (SQLException e) { 
            e.printStackTrace(); 
        }
        return lista;
    }

    // --- inventario_telas_erp ------------------------------------------------

    public List<java.util.Map<String, Object>> obtenerInventarioTelasErp() {
        List<java.util.Map<String, Object>> lista = new ArrayList<>();
        String consulta = "SELECT id, sku, nombre_tela, categoria, proveedor, metros_actuales, metros_minimos, costo_por_metro, fecha_ultima_reposicion FROM inventario_telas_erp ORDER BY nombre_tela ASC";
        try (Connection con = Conexion.obtenerConexion();
             PreparedStatement pst = con.prepareStatement(consulta);
             ResultSet rs = pst.executeQuery()) {
            while (rs.next()) {
                java.util.Map<String, Object> fila = new java.util.LinkedHashMap<>();
                fila.put("id", rs.getInt("id"));
                fila.put("sku", rs.getString("sku"));
                fila.put("fabricName", rs.getString("nombre_tela"));
                fila.put("categoria", rs.getString("categoria"));
                fila.put("proveedor", rs.getString("proveedor"));
                double actual = rs.getDouble("metros_actuales");
                double umbral = rs.getDouble("metros_minimos");
                fila.put("currentMeters", actual);
                fila.put("minThresholdMeters", umbral);
                fila.put("costPerMeter", rs.getDouble("costo_por_metro"));
                fila.put("lowStock", actual <= umbral);
                if (rs.getDate("fecha_ultima_reposicion") != null)
                    fila.put("lastRestockDate", rs.getDate("fecha_ultima_reposicion").toString());
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
    public boolean updateBanner(boolean activo, String mensaje, String bannerType) { return actualizarBanner(activo, mensaje, bannerType); }
    public List<VentaRegion> getRegionSales() { return obtenerVentasPorRegion(); }
    public List<ActividadReciente> getRecentActivity() { return obtenerActividadReciente(); }
    public boolean addActivity(ActividadReciente a) { return agregarActividad(a); }
    public List<java.util.Map<String, Object>> getErpSalesMetrics() { return obtenerMetricasVentasErp(); }
    public List<java.util.Map<String, Object>> getErpNotifications() { return obtenerNotificacionesErp(); }
    public List<java.util.Map<String, Object>> getErpFabricInventory() { return obtenerInventarioTelasErp(); }
}

