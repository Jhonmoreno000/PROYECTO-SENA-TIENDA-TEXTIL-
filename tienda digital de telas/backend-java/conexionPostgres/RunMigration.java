import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.Statement;

public class RunMigration {
    public static void main(String[] args) throws Exception {
        String url = "jdbc:postgresql://localhost:5432/tienda_digital_textiles_db";
        String user = "postgres";
        String pass = "Mp.1025889078";
        
        try (Connection conn = DriverManager.getConnection(url, user, pass);
             Statement stmt = conn.createStatement()) {
             
            System.out.println("Connected to PostgreSQL.");
            stmt.execute("ALTER TABLE users ADD COLUMN password_hash VARCHAR(255);");
            System.out.println("Successfully added password_hash column to users table.");
            
        } catch(Exception e) {
            System.err.println("Database migration note: " + e.getMessage());
        }
    }
}
