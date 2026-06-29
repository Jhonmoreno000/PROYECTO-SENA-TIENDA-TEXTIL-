package infrastructure.config;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

/**
 * Clase de configuracion de infraestructura para la conexion a PostgreSQL.
 * Implementa el patron Singleton para gestionar una unica conexion a la base
 * de datos del sistema D&D Textil. Obtiene credenciales desde variables de
 * entorno con fallback a valores locales de desarrollo.
 */
public class Conexion {
    // Patron Singleton para una unica conexion (opcional pero buena practica)
    private static Connection connection = null;

    // Variables de entorno para conexion (se deben configurar antes de ejecutar)
    private static final String URL = System.getenv("DB_URL") != null 
        ? System.getenv("DB_URL") 
        : "jdbc:postgresql://localhost:5432/tienda_digital_textiles_db";
    private static final String USER = System.getenv("DB_USER") != null 
        ? System.getenv("DB_USER") 
        : "postgres";
    private static final String PASSWORD = System.getenv("DB_PASSWORD") != null 
        ? System.getenv("DB_PASSWORD") 
        : "Mp.1025889078";

    // Constructor privado para evitar instanciacion externa (Singleton)
    private Conexion() {}

    /**
     * Obtiene la conexion activa a la base de datos. Si la conexion actual es
     * nula, esta cerrada o invalida, la reemplaza por una nueva.
     * @return Connection activa a PostgreSQL, o null si ocurre un error.
     */
    public static Connection getConnection() {
        try {
            // Reconecta si la conexion es nula, esta cerrada, o ya no es valida (obsoleta)
            // isValid(3) envia una verificacion real a PostgreSQL con timeout de 3 segundos
            // Esto es critico porque isClosed() NO detecta conexiones que PostgreSQL ha terminado por inactividad
            if (connection == null || connection.isClosed() || !connection.isValid(3)) {
                // Cierra la conexion antigua obsoleta si existe
                if (connection != null) {
                    try { connection.close(); } catch (SQLException ignored) {}
                    connection = null;
                }
                Class.forName("org.postgresql.Driver");
                connection = DriverManager.getConnection(URL, USER, PASSWORD);
                System.out.println("[OK] Conexion a PostgreSQL establecida con exito.");
            }
        } catch (ClassNotFoundException e) {
            // Error: El driver JDBC de PostgreSQL no esta en el classpath
            System.err.println("[ERROR] No se encontro el driver JDBC de PostgreSQL.");
            e.printStackTrace();
        } catch (SQLException e) {
            // Error: Fallo la conexion a la base de datos (red, credenciales, servidor caido)
            System.err.println("[ERROR] Error de conexion a la base de datos PostgreSQL.");
            e.printStackTrace();
            // Reinicia la conexion para que la siguiente llamada intente reconectar
            connection = null;
        }
        return connection;
    }

    /**
     * Cierra la conexion activa a la base de datos si existe.
     */
    public static void disconnect() {
        if (connection != null) {
            try {
                connection.close();
                connection = null;
                System.out.println("[DESCONECTADO] Conexion cerrada.");
            } catch (SQLException e) {
                // Error: No se pudo cerrar la conexion correctamente
                System.err.println("[ERROR] Error al cerrar la conexion.");
                e.printStackTrace();
            }
        }
    }
}
