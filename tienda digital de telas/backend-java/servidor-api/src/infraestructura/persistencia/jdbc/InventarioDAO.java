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
        String consulta = "SELECT l.id, l.numero_lote, l.metros_recibidos, l.costo_por_metro, l.proveedor, " +
                          "l.fecha_recepcion, l.notas, l.creado_en, p.nombre as producto_nombre, p.categoria as producto_categoria " +
                          "FROM lotes_inventario l " +
                          "LEFT JOIN productos p ON l.producto_id = p.id " +
                          "ORDER BY l.id ASC";
        try (Connection con = Conexion.obtenerConexion();
             PreparedStatement pst = con.prepareStatement(consulta);
             ResultSet rs = pst.executeQuery()) {
            while (rs.next()) {
                LoteInventario b = new LoteInventario();
                b.setId(String.valueOf(rs.getInt("id")));
                String cat = rs.getString("producto_categoria");
                String nom = rs.getString("producto_nombre");
                b.setTipoTela(cat != null && !cat.isBlank() ? cat : (nom != null ? nom : "Tela General"));
                b.setProveedor(rs.getString("proveedor") != null ? rs.getString("proveedor") : "Proveedor Nacional");
                double metros = rs.getDouble("metros_recibidos");
                b.setMetrosIniciales(metros);
                b.setMetrosActuales(metros);
                b.setEstado("active");
                if (rs.getTimestamp("creado_en") != null) b.setFechaCreacion(rs.getTimestamp("creado_en").toString().split(" ")[0]);
                if (rs.getDate("fecha_recepcion") != null) b.setUltimaActualizacion(rs.getDate("fecha_recepcion").toString());
                lista.add(b);
            }
        } catch (SQLException e) { 
            e.printStackTrace(); 
        }
        return lista;
    }

    public boolean agregarLote(LoteInventario b) {
        String consulta = "INSERT INTO lotes_inventario (numero_lote, metros_recibidos, costo_por_metro, proveedor, notas) VALUES (?, ?, ?, ?, ?)";
        try (Connection con = Conexion.obtenerConexion();
             PreparedStatement pst = con.prepareStatement(consulta)) {
            pst.setString(1, b.getId() != null ? b.getId() : "LOTE-" + System.currentTimeMillis());
            double metros = b.getMetrosIniciales() > 0 ? b.getMetrosIniciales() : b.getMetrosActuales();
            pst.setDouble(2, metros > 0 ? metros : 50.0);
            pst.setDouble(3, 18000.0);
            pst.setString(4, b.getProveedor() != null ? b.getProveedor() : "Proveedor");
            pst.setString(5, b.getTipoTela());
            return pst.executeUpdate() > 0;
        } catch (SQLException e) { 
            e.printStackTrace(); 
            return false; 
        }
    }

    public boolean actualizarLote(String idLote, double metrosActuales, String estado) {
        String consulta = "UPDATE lotes_inventario SET metros_recibidos = ? WHERE id = ? OR numero_lote = ?";
        try (Connection con = Conexion.obtenerConexion();
             PreparedStatement pst = con.prepareStatement(consulta)) {
            pst.setDouble(1, metrosActuales);
            int idNum = 0;
            try { idNum = Integer.parseInt(idLote); } catch (NumberFormatException ignored) {}
            pst.setInt(2, idNum);
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
                w.setIdLote(String.valueOf(rs.getInt("producto_id")));
                w.setMetros(rs.getDouble("metros_perdidos"));
                w.setMotivo(rs.getString("motivo"));
                w.setDescripcion("Merma registrada por " + rs.getString("motivo") + " (Costo: $" + rs.getDouble("impacto_costo") + ")");
                w.setResponsable("Supervisor Almacén");
                String fecha = rs.getTimestamp("creado_en") != null ? rs.getTimestamp("creado_en").toString().split(" ")[0] : "";
                w.setFechaCreacion(fecha);
                w.setFechaEvento(fecha);
                w.setIdUsuario(1);
                lista.add(w);
            }
        } catch (SQLException e) { 
            e.printStackTrace(); 
        }
        return lista;
    }

    public boolean agregarEventoMerma(EventoMerma w) {
        String consulta = "INSERT INTO eventos_merma (metros_perdidos, motivo, impacto_costo) VALUES (?, ?, ?)";
        try (Connection con = Conexion.obtenerConexion();
             PreparedStatement pst = con.prepareStatement(consulta)) {
            pst.setDouble(1, w.getMetros());
            pst.setString(2, w.getMotivo() != null ? w.getMotivo() : "Desperdicio");
            pst.setDouble(3, w.getMetros() * 20000.0);
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
                t.setAlertaHabilitada(rs.getBoolean("alerta_activa"));
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
                d.setTotalVentas(rs.getDouble("ventas_totales"));
                d.setTotalPedidos(rs.getInt("pedidos_totales"));
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
                r.setDepartamento(rs.getString("region"));
                r.setVentas(rs.getDouble("ventas_totales"));
                r.setPedidos((int) Math.round(rs.getDouble("porcentaje") * 10));
                r.setCapital(rs.getString("region"));
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
                a.setTipo(rs.getString("tipo"));
                a.setIdUsuario(rs.getInt("usuario_id"));
                a.setNombreUsuario(rs.getString("nombre_usuario"));
                a.setAccion(rs.getString("accion"));
                if (rs.getTimestamp("creado_en") != null) a.setFechaCreacion(rs.getTimestamp("creado_en").toString());
                a.setIcono("Activity");
                lista.add(a);
            }
        } catch (SQLException e) { 
            e.printStackTrace(); 
        }
        return lista;
    }

    public boolean agregarActividad(ActividadReciente a) {
        String consulta = "INSERT INTO actividad_reciente (tipo, usuario_id, nombre_usuario, accion) VALUES (?, ?, ?, ?)";
        try (Connection con = Conexion.obtenerConexion();
             PreparedStatement pst = con.prepareStatement(consulta)) {
            pst.setString(1, a.getTipo() != null ? a.getTipo() : "sistema");
            if (a.getIdUsuario() > 0) pst.setInt(2, a.getIdUsuario()); else pst.setNull(2, Types.INTEGER);
            pst.setString(3, a.getNombreUsuario());
            pst.setString(4, a.getAccion());
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
        String consulta = "SELECT id, tipo, titulo, mensaje, leido, creado_en FROM notificaciones_sistema_erp ORDER BY creado_en DESC LIMIT 20";
        try (Connection con = Conexion.obtenerConexion();
             PreparedStatement pst = con.prepareStatement(consulta);
             ResultSet rs = pst.executeQuery()) {
            while (rs.next()) {
                java.util.Map<String, Object> fila = new java.util.LinkedHashMap<>();
                fila.put("id", rs.getInt("id"));
                fila.put("type", rs.getString("tipo"));
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

