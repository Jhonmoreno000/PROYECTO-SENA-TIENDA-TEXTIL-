import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.DatabaseMetaData;

public class ListTables {
    public static void main(String[] args) {
        String url = "jdbc:postgresql://localhost:5432/tienda_digital_textiles_db";
        String user = "postgres";
        String pass = "Mp.1025889078";
        
        try (Connection conn = DriverManager.getConnection(url, user, pass)) {
            DatabaseMetaData dbmd = conn.getMetaData();
            String[] types = {"TABLE"};
            ResultSet rs = dbmd.getTables(null, null, "%", types);
            System.out.println("Tables in database:");
            while (rs.next()) {
                System.out.println("- " + rs.getString("TABLE_NAME"));
            }
        } catch(Exception e) {
            e.printStackTrace();
        }
    }
}
