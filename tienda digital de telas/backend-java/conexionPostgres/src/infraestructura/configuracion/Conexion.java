package infraestructura.configuracion;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

/**
 * Clase de configuración para la conexión a PostgreSQL.
 * Proporciona conexiones independientes e hilos-seguros para soportar
 * alto tráfico concurrente en el backend de D&D Textil.
 */
public class Conexion {

    /** URL de la base de datos con soporte a variables de entorno. */
    private static final String URL_BD = System.getenv("DB_URL") != null 
        ? System.getenv("DB_URL") 
        : "jdbc:postgresql://localhost:5432/tienda_digital_textiles_db";

    /** Usuario de la base de datos. */
    private static final String USUARIO_BD = System.getenv("DB_USER") != null 
        ? System.getenv("DB_USER") 
        : "postgres";

    /** Contraseña de la base de datos. */
    private static final String CONTRASENA_BD = System.getenv("DB_PASSWORD") != null 
        ? System.getenv("DB_PASSWORD") 
        : "";

    static {
        try {
            Class.forName("org.postgresql.Driver");
        } catch (ClassNotFoundException e) {
            System.err.println("[ERROR CRITICO] No se encontro el driver JDBC de PostgreSQL.");
            e.printStackTrace();
        }
    }

    private Conexion() {}

    /**
     * Obtiene una nueva conexión a la base de datos PostgreSQL.
     * @return Conexión activa a PostgreSQL, o null si falla.
     */
    public static Connection obtenerConexion() {
        try {
            return DriverManager.getConnection(URL_BD, USUARIO_BD, CONTRASENA_BD);
        } catch (SQLException e) {
            System.err.println("[ERROR BD] Fallo al conectar con PostgreSQL: " + e.getMessage());
            e.printStackTrace();
            return null;
        }
    }

    /**
     * Alias en inglés para compatibilidad.
     */
    public static Connection getConnection() {
        return obtenerConexion();
    }
}
