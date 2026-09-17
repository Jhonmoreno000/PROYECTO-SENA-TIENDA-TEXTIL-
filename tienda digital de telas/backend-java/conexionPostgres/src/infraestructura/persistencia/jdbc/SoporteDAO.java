package infraestructura.persistencia.jdbc;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Types;
import java.util.ArrayList;
import java.util.List;

import infraestructura.configuracion.Conexion;
import dominio.modelos.ReporteError;
import dominio.modelos.TicketSoporte;

/**
 * DAO para el módulo de Soporte y Reportes de Errores.
 * Opera sobre las tablas 'tickets_soporte' y 'reportes_errores'.
 */
public class SoporteDAO {

    public List<TicketSoporte> obtenerTodosLosTickets() {
        List<TicketSoporte> lista = new ArrayList<>();
        String consulta = "SELECT * FROM tickets_soporte ORDER BY id DESC";

        try (Connection con = Conexion.obtenerConexion();
             PreparedStatement pst = con.prepareStatement(consulta);
             ResultSet rs = pst.executeQuery()) {

            while (rs.next()) {
                TicketSoporte t = new TicketSoporte();
                t.setId(rs.getInt("id"));
                t.setIdCliente((Integer) rs.getObject("usuario_id"));
                t.setNombreCliente(rs.getString("nombre_usuario"));
                t.setCorreoCliente(rs.getString("user_email"));
                t.setAsunto(rs.getString("asunto"));
                t.setDescripcion(rs.getString("descripcion"));
                t.setEstado(rs.getString("status"));
                t.setPrioridad(rs.getString("prioridad"));
                t.setAsignadoA((Integer) rs.getObject("asignado_a"));
                
                if (rs.getTimestamp("creado_en") != null) t.setFechaCreacion(rs.getTimestamp("creado_en").toString());
                if (rs.getTimestamp("actualizado_en") != null) t.setFechaModificacion(rs.getTimestamp("actualizado_en").toString());
                if (rs.getTimestamp("resuelto_en") != null) t.setFechaResolucion(rs.getTimestamp("resuelto_en").toString());

                lista.add(t);
            }
        } catch (SQLException e) { 
            e.printStackTrace(); 
        }
        return lista;
    }

    public boolean agregarTicket(TicketSoporte t) {
        String consulta = "INSERT INTO tickets_soporte (usuario_id, nombre_usuario, user_email, asunto, descripcion, status, prioridad, asignado_a) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        try (Connection con = Conexion.obtenerConexion();
             PreparedStatement pst = con.prepareStatement(consulta)) {
            if (t.getIdCliente() != null) pst.setInt(1, t.getIdCliente()); else pst.setNull(1, Types.INTEGER);
            pst.setString(2, t.getNombreCliente());
            pst.setString(3, t.getCorreoCliente());
            pst.setString(4, t.getAsunto());
            pst.setString(5, t.getDescripcion());
            pst.setString(6, t.getEstado() != null ? t.getEstado() : "open");
            pst.setString(7, t.getPrioridad());
            if (t.getAsignadoA() != null) pst.setInt(8, t.getAsignadoA()); else pst.setNull(8, Types.INTEGER);

            return pst.executeUpdate() > 0;
        } catch (SQLException e) { 
            e.printStackTrace(); 
            return false; 
        }
    }

    public boolean actualizarEstadoTicket(int idTicket, String estado) {
        String consulta = "UPDATE tickets_soporte SET status = ?, actualizado_en = CURRENT_TIMESTAMP " +
                       (estado.equals("resolved") || estado.equals("resuelto") ? ", resuelto_en = CURRENT_TIMESTAMP " : "") +
                       "WHERE id = ?";
        try (Connection con = Conexion.obtenerConexion();
             PreparedStatement pst = con.prepareStatement(consulta)) {
            pst.setString(1, estado);
            pst.setInt(2, idTicket);
            return pst.executeUpdate() > 0;
        } catch (SQLException e) { 
            e.printStackTrace(); 
            return false; 
        }
    }

    public List<ReporteError> obtenerTodosLosReportesError() {
        List<ReporteError> lista = new ArrayList<>();
        String consulta = "SELECT * FROM reportes_errores ORDER BY id DESC";

        try (Connection con = Conexion.obtenerConexion();
             PreparedStatement pst = con.prepareStatement(consulta);
             ResultSet rs = pst.executeQuery()) {

            while (rs.next()) {
                ReporteError reporte = new ReporteError();
                reporte.setId(rs.getInt("id"));
                reporte.setIdVendedor((Integer) rs.getObject("seller_id"));
                reporte.setNombreVendedor(rs.getString("seller_name"));
                String areaReporte = rs.getString("area");
                reporte.setArea(areaReporte);
                reporte.setTitulo(areaReporte);
                reporte.setDescripcion(rs.getString("descripcion"));
                reporte.setPasos(rs.getString("pasos"));
                reporte.setEstado(rs.getString("status"));
                String prioridadReporte = rs.getString("prioridad");
                reporte.setPrioridad(prioridadReporte);
                reporte.setSeveridad(prioridadReporte);
                reporte.setAsignadoA((Integer) rs.getObject("asignado_a"));

                if (rs.getTimestamp("reportado_en") != null) reporte.setFechaReporte(rs.getTimestamp("reportado_en").toString());
                if (rs.getTimestamp("resuelto_en") != null) reporte.setFechaResolucion(rs.getTimestamp("resuelto_en").toString());

                lista.add(reporte);
            }
        } catch (SQLException e) { 
            e.printStackTrace(); 
        }
        return lista;
    }

    public boolean agregarReporteError(ReporteError reporte) {
        String consulta = "INSERT INTO reportes_errores (seller_id, seller_name, area, descripcion, pasos, status, prioridad, asignado_a) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        try (Connection con = Conexion.obtenerConexion();
             PreparedStatement pst = con.prepareStatement(consulta)) {
            if (reporte.getIdVendedor() != null) pst.setInt(1, reporte.getIdVendedor()); else pst.setNull(1, Types.INTEGER);
            pst.setString(2, reporte.getNombreVendedor() != null ? reporte.getNombreVendedor() : "Usuario");
            String areaFinal = reporte.getArea() != null ? reporte.getArea() : (reporte.getTitulo() != null ? reporte.getTitulo() : "General");
            pst.setString(3, areaFinal);
            pst.setString(4, reporte.getDescripcion() != null ? reporte.getDescripcion() : "");
            pst.setString(5, reporte.getPasos() != null ? reporte.getPasos() : "");
            pst.setString(6, reporte.getEstado() != null ? reporte.getEstado() : "open");
            String prioridadFinal = reporte.getPrioridad() != null ? reporte.getPrioridad() : (reporte.getSeveridad() != null ? reporte.getSeveridad() : "low");
            pst.setString(7, prioridadFinal);
            if (reporte.getAsignadoA() != null) pst.setInt(8, reporte.getAsignadoA()); else pst.setNull(8, Types.INTEGER);

            return pst.executeUpdate() > 0;
        } catch (SQLException e) { 
            e.printStackTrace(); 
            return false; 
        }
    }

    public boolean actualizarEstadoReporteError(int idReporte, String estado) {
        String consulta = "UPDATE reportes_errores SET status = ? " +
                       (estado.equals("resolved") || estado.equals("resuelto") ? ", resuelto_en = CURRENT_TIMESTAMP " : "") +
                       "WHERE id = ?";
        try (Connection con = Conexion.obtenerConexion();
             PreparedStatement pst = con.prepareStatement(consulta)) {
            pst.setString(1, estado);
            pst.setInt(2, idReporte);
            return pst.executeUpdate() > 0;
        } catch (SQLException e) { 
            e.printStackTrace(); 
            return false; 
        }
    }

    // Métodos alias para compatibilidad
    public List<TicketSoporte> getAllTickets() { return obtenerTodosLosTickets(); }
    public boolean addTicket(TicketSoporte t) { return agregarTicket(t); }
    public boolean updateTicketStatus(int ticketId, String status) { return actualizarEstadoTicket(ticketId, status); }
    public List<ReporteError> getAllBugs() { return obtenerTodosLosReportesError(); }
    public boolean addBug(ReporteError b) { return agregarReporteError(b); }
    public boolean updateBugStatus(int bugId, String status) { return actualizarEstadoReporteError(bugId, status); }
}

