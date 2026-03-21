package conexion;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class Conexion {
    // Patrón Singleton para una única conexión (opcional pero buena práctica)
    private static Connection connection = null;

    // Variables de entorno para conexión (se deben configurar antes de ejecutar)
    private static final String URL = System.getenv("DB_URL") != null 
        ? System.getenv("DB_URL") 
        : "jdbc:postgresql://localhost:5432/tienda_digital_textiles_db";
    private static final String USER = System.getenv("DB_USER") != null 
        ? System.getenv("DB_USER") 
        : "postgres";
    private static final String PASSWORD = System.getenv("DB_PASSWORD") != null 
        ? System.getenv("DB_PASSWORD") 
        : "";

    // Constructor privado
    private Conexion() {}

    public static Connection getConnection() {
        try {
            // Reconnect if connection is null, closed, OR no longer valid (stale)
            // isValid(3) sends a real check to PostgreSQL with 3-second timeout
            // This is critical because isClosed() does NOT detect connections
            // that PostgreSQL has terminated due to inactivity
            if (connection == null || connection.isClosed() || !connection.isValid(3)) {
                // Close the old stale connection if it exists
                if (connection != null) {
                    try { connection.close(); } catch (SQLException ignored) {}
                    connection = null;
                }
                Class.forName("org.postgresql.Driver");
                connection = DriverManager.getConnection(URL, USER, PASSWORD);
                System.out.println("✅ Conexión a PostgreSQL establecida con éxito.");
            }
        } catch (ClassNotFoundException e) {
            System.err.println("❌ Error: No se encontró el driver JDBC de PostgreSQL.");
            e.printStackTrace();
        } catch (SQLException e) {
            System.err.println("❌ Error de conexión a la base de datos PostgreSQL.");
            e.printStackTrace();
            // Reset connection so next call will try to reconnect
            connection = null;
        }
        return connection;
    }

    public static void disconnect() {
        if (connection != null) {
            try {
                connection.close();
                connection = null;
                System.out.println("🔌 Conexión cerrada.");
            } catch (SQLException e) {
                System.err.println("❌ Error al cerrar la conexión.");
                e.printStackTrace();
            }
        }
    }
}
