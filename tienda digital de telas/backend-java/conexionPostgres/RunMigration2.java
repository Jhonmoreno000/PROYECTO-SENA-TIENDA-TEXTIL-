import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.Statement;

public class RunMigration2 {
    public static void main(String[] args) {
        String url = "jdbc:postgresql://localhost:5432/tienda_digital_textiles_db";
        String user = "postgres";
        String pass = "Mp.1025889078";
        
        try (Connection conn = DriverManager.getConnection(url, user, pass);
             Statement stmt = conn.createStatement()) {
             
            System.out.println("Connected to PostgreSQL.");
            
            // Create coupons table
            String createCoupons = "CREATE TABLE IF NOT EXISTS coupons (" +
                "id SERIAL PRIMARY KEY, " +
                "code VARCHAR(50) UNIQUE NOT NULL, " +
                "discount_type VARCHAR(20) NOT NULL, " +
                "discount_value NUMERIC(10,2) NOT NULL, " +
                "expires_at TIMESTAMP, " +
                "min_purchase NUMERIC(10,2), " +
                "max_uses INT, " +
                "first_time_only BOOLEAN DEFAULT FALSE, " +
                "usage_count INT DEFAULT 0, " +
                "active BOOLEAN DEFAULT TRUE" +
                ");";
            stmt.execute(createCoupons);
            System.out.println("Coupons table created.");
            
            // Create system_config table
            String createConfig = "CREATE TABLE IF NOT EXISTS system_config (" +
                "config_key VARCHAR(100) PRIMARY KEY, " +
                "config_value TEXT" +
                ");";
            stmt.execute(createConfig);
            System.out.println("System_config table created.");
            
        } catch(Exception e) {
            e.printStackTrace();
        }
    }
}
