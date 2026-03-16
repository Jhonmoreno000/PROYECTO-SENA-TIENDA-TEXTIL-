import java.sql.*;

public class FixUsersTable {
    public static void main(String[] args) {
        String url = "jdbc:postgresql://localhost:5432/tienda_digital_textiles_db";
        String user = "postgres";
        String pass = "Mp.1025889078";
        
        try (Connection conn = DriverManager.getConnection(url, user, pass);
             Statement stmt = conn.createStatement()) {
             
            System.out.println("Connected to PostgreSQL.");
            
            String[] queries = {
                "ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'cliente';",
                "ALTER TABLE users ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT TRUE;",
                "ALTER TABLE users ADD COLUMN IF NOT EXISTS suspended BOOLEAN DEFAULT FALSE;",
                "ALTER TABLE users ADD COLUMN IF NOT EXISTS suspension_reason TEXT;",
                "ALTER TABLE users ADD COLUMN IF NOT EXISTS commission_rate NUMERIC(10,2) DEFAULT 0.00;",
                "ALTER TABLE users ADD COLUMN IF NOT EXISTS registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;",
                "ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMP;",
                "ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);"
            };
            
            for (String q : queries) {
                try {
                    stmt.execute(q);
                    System.out.println("Executed: " + q);
                } catch (SQLException e) {
                    System.out.println("Note: " + e.getMessage());
                }
            }
            
            System.out.println("Users table schema updated successfully.");
            
        } catch(Exception e) {
            e.printStackTrace();
        }
    }
}
