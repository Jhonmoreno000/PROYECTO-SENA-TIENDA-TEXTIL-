package infrastructure.config;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

/**
 * Clase de configuracion de infraestructura para la conexion a PostgreSQL.
 * Proporciona conexiones independientes e hilos-seguros para soportar
 * alto trafico concurrente en el backend de D&D Textil.
 * 
 * Cada llamada a getConnection() retorna una conexion limpia y dedicada
 * para ser gestionada en un bloque try-with-resources en los DAOs.
 */
public class Conexion {

    // Variables de entorno para conexion con fallback a PostgreSQL local
    private static final String URL = System.getenv("DB_URL") != null 
        ? System.getenv("DB_URL") 
        : "jdbc:postgresql://localhost:5432/tienda_digital_textiles_db";
    private static final String USER = System.getenv("DB_USER") != null 
        ? System.getenv("DB_USER") 
        : "postgres";
    private static final String PASSWORD = System.getenv("DB_PASSWORD") != null 
        ? System.getenv("DB_PASSWORD") 
        : "";

    static {
        try {
            // Carga el driver JDBC de PostgreSQL una sola vez en el classloader
            Class.forName("org.postgresql.Driver");
        } catch (ClassNotFoundException e) {
            System.err.println("[ERROR CRITICO] No se encontro el driver JDBC de PostgreSQL.");
            e.printStackTrace();
        }
    }

    // Constructor privado para evitar instanciacion
    private Conexion() {}

    /**
     * Obtiene una nueva conexion independiente a la base de datos PostgreSQL.
     * Al usarse dentro de un bloque try-with-resources en el DAO, la conexion
     * se cierra automaticamente al finalizar la peticion sin afectar otros hilos.
     *
     * @return Connection activa a PostgreSQL, o null si ocurre un error de red/BD.
     */
    public static Connection getConnection() {
        try {
            return DriverManager.getConnection(URL, USER, PASSWORD);
        } catch (SQLException e) {
            System.err.println("[ERROR BD] Fallo al establecer conexion con PostgreSQL: " + e.getMessage());
            e.printStackTrace();
            return null;
        }
    }
}
