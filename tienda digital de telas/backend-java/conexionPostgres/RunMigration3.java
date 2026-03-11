import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.Statement;

public class RunMigration3 {
    public static void main(String[] args) {
        String url = "jdbc:postgresql://localhost:5432/tienda_digital_textiles_db";
        String user = "postgres";
        String pass = "Mp.1025889078";
        
        try (Connection conn = DriverManager.getConnection(url, user, pass);
             Statement stmt = conn.createStatement()) {
             
            System.out.println("Connected to PostgreSQL.");
            
            // Create support_tickets table
            String createTickets = "CREATE TABLE IF NOT EXISTS support_tickets (" +
                "id SERIAL PRIMARY KEY, " +
                "user_id INT, " + // the client who submitted it
                "user_name VARCHAR(100), " +
                "user_email VARCHAR(100), " +
                "subject VARCHAR(200), " +
                "description TEXT, " +
                "status VARCHAR(20), " + // open, in_progress, resolved
                "priority VARCHAR(20), " + // low, medium, high
                "assigned_to INT, " + // admin ID
                "created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, " +
                "updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, " +
                "resolved_at TIMESTAMP" +
                ");";
            stmt.execute(createTickets);
            System.out.println("Support_tickets table created.");
            
            // Create bug_reports table
            String createBugs = "CREATE TABLE IF NOT EXISTS bug_reports (" +
                "id SERIAL PRIMARY KEY, " +
                "seller_id INT, " + // or user_id
                "seller_name VARCHAR(100), " +
                "area VARCHAR(100), " +
                "description TEXT, " +
                "steps TEXT, " +
                "status VARCHAR(20), " + // new, investigating, resolved
                "priority VARCHAR(20), " + // low, medium, high
                "assigned_to INT, " +
                "reported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, " +
                "resolved_at TIMESTAMP" +
                ");";
            stmt.execute(createBugs);
            System.out.println("Bug_reports table created.");

            // Add columns to existing products table if they don't exist
            try {
                stmt.execute("ALTER TABLE products ADD COLUMN moderation_status VARCHAR(20) DEFAULT 'approved';");
                stmt.execute("ALTER TABLE products ADD COLUMN rejection_reason TEXT;");
                System.out.println("Added moderation columns to products table.");
            } catch (Exception colEx) {
                System.out.println("Moderation columns might already exist in products table.");
            }
            
        } catch(Exception e) {
            e.printStackTrace();
        }
    }
}
