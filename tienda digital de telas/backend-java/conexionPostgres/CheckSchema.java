import java.sql.*;

public class CheckSchema {
    public static void main(String[] args) {
        String url = "jdbc:postgresql://localhost:5432/tienda_digital_textiles_db";
        String user = "postgres";
        String pass = "Mp.1025889078";
        
        try (Connection conn = DriverManager.getConnection(url, user, pass);
             Statement stmt = conn.createStatement()) {
             
            System.out.println("Checking columns for 'users' table:");
            ResultSet rs = stmt.executeQuery("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'users'");
            while (rs.next()) {
                System.out.println(rs.getString("column_name") + " (" + rs.getString("data_type") + ")");
            }
            
        } catch(Exception e) {
            e.printStackTrace();
        }
    }
}
