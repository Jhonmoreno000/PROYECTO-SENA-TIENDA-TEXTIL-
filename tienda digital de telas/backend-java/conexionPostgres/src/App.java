import java.sql.Connection;
import conexion.Conexion;
import api.ApiServer;

public class App {
    public static void main(String[] args) throws Exception {
        System.out.println("Iniciando aplicación Backend...");
        
        // 1. Probar la conexión a base de datos al inicio
        Connection conn = Conexion.getConnection();
        if (conn != null) {
            System.out.println("¡Conecta a la base de datos " + conn.getCatalog() + " perfectamente!");
            
            // 2. Iniciar el servidor web nativo de la API
            ApiServer.startServer(8081);
        } else {
            System.err.println("❌ No se pudo conectar a la base de datos. El servidor no iniciará.");
        }
    }
}
