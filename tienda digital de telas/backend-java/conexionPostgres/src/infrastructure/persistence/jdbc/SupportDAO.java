package infrastructure.persistence.jdbc;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Types;
import java.util.ArrayList;
import java.util.List;

import infrastructure.config.Conexion;
import domain.models.BugReport;
import domain.models.SupportTicket;

public class SupportDAO {

    public List<SupportTicket> getAllTickets() {
        List<SupportTicket> list = new ArrayList<>();
        String query = "SELECT * FROM support_tickets ORDER BY id DESC";

        try (Connection con = Conexion.getConnection();
             PreparedStatement pst = con.prepareStatement(query);
             ResultSet rs = pst.executeQuery()) {

            while (rs.next()) {
                SupportTicket t = new SupportTicket();
                t.setId(rs.getInt("id"));
                t.setClientId((Integer) rs.getObject("user_id"));
                t.setClientName(rs.getString("user_name"));
                t.setClientEmail(rs.getString("user_email"));
                t.setSubject(rs.getString("subject"));
                t.setDescription(rs.getString("description"));
                t.setStatus(rs.getString("status"));
                t.setPriority(rs.getString("priority"));
                t.setAssignedTo((Integer) rs.getObject("assigned_to"));
                
                if (rs.getTimestamp("created_at") != null) t.setCreatedAt(rs.getTimestamp("created_at").toString());
                if (rs.getTimestamp("updated_at") != null) t.setUpdatedAt(rs.getTimestamp("updated_at").toString());
                if (rs.getTimestamp("resolved_at") != null) t.setResolvedAt(rs.getTimestamp("resolved_at").toString());

                list.add(t);
            }
        } catch (SQLException e) { e.printStackTrace(); }
        return list;
    }

    public boolean addTicket(SupportTicket t) {
        String query = "INSERT INTO support_tickets (user_id, user_name, user_email, subject, description, status, priority, assigned_to) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        try (Connection con = Conexion.getConnection();
             PreparedStatement pst = con.prepareStatement(query)) {
            if (t.getClientId() != null) pst.setInt(1, t.getClientId()); else pst.setNull(1, Types.INTEGER);
            pst.setString(2, t.getClientName());
            pst.setString(3, t.getClientEmail());
            pst.setString(4, t.getSubject());
            pst.setString(5, t.getDescription());
            pst.setString(6, t.getStatus() != null ? t.getStatus() : "open");
            pst.setString(7, t.getPriority());
            if (t.getAssignedTo() != null) pst.setInt(8, t.getAssignedTo()); else pst.setNull(8, Types.INTEGER);

            return pst.executeUpdate() > 0;
        } catch (SQLException e) { e.printStackTrace(); return false; }
    }

    public boolean updateTicketStatus(int ticketId, String status) {
        String query = "UPDATE support_tickets SET status = ?, updated_at = CURRENT_TIMESTAMP " +
                       (status.equals("resolved") ? ", resolved_at = CURRENT_TIMESTAMP " : "") +
                       "WHERE id = ?";
        try (Connection con = Conexion.getConnection();
             PreparedStatement pst = con.prepareStatement(query)) {
            pst.setString(1, status);
            pst.setInt(2, ticketId);
            return pst.executeUpdate() > 0;
        } catch (SQLException e) { e.printStackTrace(); return false; }
    }

    public List<BugReport> getAllBugs() {
        List<BugReport> list = new ArrayList<>();
        String query = "SELECT * FROM bug_reports ORDER BY id DESC";

        try (Connection con = Conexion.getConnection();
             PreparedStatement pst = con.prepareStatement(query);
             ResultSet rs = pst.executeQuery()) {

            while (rs.next()) {
                BugReport b = new BugReport();
                b.setId(rs.getInt("id"));
                b.setSellerId((Integer) rs.getObject("seller_id"));
                b.setSellerName(rs.getString("seller_name"));
                b.setArea(rs.getString("area"));
                b.setDescription(rs.getString("description"));
                b.setSteps(rs.getString("steps"));
                b.setStatus(rs.getString("status"));
                b.setPriority(rs.getString("priority"));
                b.setAssignedTo((Integer) rs.getObject("assigned_to"));

                if (rs.getTimestamp("reported_at") != null) b.setReportedAt(rs.getTimestamp("reported_at").toString());
                if (rs.getTimestamp("resolved_at") != null) b.setResolvedAt(rs.getTimestamp("resolved_at").toString());

                list.add(b);
            }
        } catch (SQLException e) { e.printStackTrace(); }
        return list;
    }

    public boolean addBug(BugReport b) {
        String query = "INSERT INTO bug_reports (seller_id, seller_name, area, description, steps, status, priority, assigned_to) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        try (Connection con = Conexion.getConnection();
             PreparedStatement pst = con.prepareStatement(query)) {
            if (b.getSellerId() != null) pst.setInt(1, b.getSellerId()); else pst.setNull(1, Types.INTEGER);
            pst.setString(2, b.getSellerName());
            pst.setString(3, b.getArea());
            pst.setString(4, b.getDescription());
            pst.setString(5, b.getSteps());
            pst.setString(6, b.getStatus() != null ? b.getStatus() : "new");
            pst.setString(7, b.getPriority());
            if (b.getAssignedTo() != null) pst.setInt(8, b.getAssignedTo()); else pst.setNull(8, Types.INTEGER);

            return pst.executeUpdate() > 0;
        } catch (SQLException e) { e.printStackTrace(); return false; }
    }

    public boolean updateBugStatus(int bugId, String status) {
        String query = "UPDATE bug_reports SET status = ? " +
                       (status.equals("resolved") ? ", resolved_at = CURRENT_TIMESTAMP " : "") +
                       "WHERE id = ?";
        try (Connection con = Conexion.getConnection();
             PreparedStatement pst = con.prepareStatement(query)) {
            pst.setString(1, status);
            pst.setInt(2, bugId);
            return pst.executeUpdate() > 0;
        } catch (SQLException e) { e.printStackTrace(); return false; }
    }
}
