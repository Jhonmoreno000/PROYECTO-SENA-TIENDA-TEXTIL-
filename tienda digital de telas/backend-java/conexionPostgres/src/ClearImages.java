import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.Statement;

public class ClearImages {
    public static void main(String[] args) {
        String url = "jdbc:postgresql://localhost:5432/tienda_digital_textiles_db";
        String user = "postgres";
        String password = "Mp.1025889078";

        try {
            Class.forName("org.postgresql.Driver");
            try (Connection conn = DriverManager.getConnection(url, user, password);
                    Statement stmt = conn.createStatement()) {
                System.out.println("Borrando product_images...");
                int deleted = stmt.executeUpdate("DELETE FROM product_images;");
                System.out.println("Se eliminaron " + deleted + " imágenes.");
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
