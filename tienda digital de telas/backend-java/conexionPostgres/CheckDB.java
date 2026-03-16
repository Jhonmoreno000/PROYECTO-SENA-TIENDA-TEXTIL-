import java.sql.*;

public class CheckDB {
    public static void main(String[] args) {
        String url = "jdbc:postgresql://localhost:5432/tienda_digital_textiles_db";
        String user = "postgres";
        String pass = "Mp.1025889078";
        
        try (Connection conn = DriverManager.getConnection(url, user, pass)) {
            System.out.println("--- Database Diagnostics ---");
            
            // Check counts
            checkCount(conn, "products");
            checkCount(conn, "categories");
            checkCount(conn, "users");
            
            // Check active products
            try (Statement stmt = conn.createStatement();
                 ResultSet rs = stmt.executeQuery("SELECT COUNT(*) FROM products WHERE active = true")) {
                if (rs.next()) {
                    System.out.println("Active products count: " + rs.getInt(1));
                }
            }
            
            // Check some product samples
            System.out.println("\nSample Products:");
            try (Statement stmt = conn.createStatement();
                 ResultSet rs = stmt.executeQuery("SELECT id, name, active, moderation_status FROM products LIMIT 5")) {
                while (rs.next()) {
                    System.out.println("- ID: " + rs.getInt("id") + ", Name: " + rs.getString("name") + ", Active: " + rs.getBoolean("active") + ", Status: " + rs.getString("moderation_status"));
                }
            }

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
    
    private static void checkCount(Connection conn, String table) {
        try (Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery("SELECT COUNT(*) FROM " + table)) {
            if (rs.next()) {
                System.out.println("Table " + table + " count: " + rs.getInt(1));
            }
        } catch (SQLException e) {
            System.out.println("Table " + table + " error: " + e.getMessage());
        }
    }
}
