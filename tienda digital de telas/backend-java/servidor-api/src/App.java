import infraestructura.api.ServidorApi;
import infraestructura.configuracion.ConfiguracionEntorno;

/**
 * Clase principal de la aplicación - Punto de entrada del backend Java para D&D Textil.
 * Inicia el servidor HTTP embebido en el puerto configurado dinámicamente mediante
 * variables de entorno (PORT o BACKEND_PORT, con puerto 8081 por defecto).
 */
public class App {

    /**
     * Punto de entrada principal de la JVM.
     * Lee la configuración del entorno y arranca el {@link ServidorApi}.
     *
     * @param argumentos Argumentos de la línea de comandos (opcionales).
     */
    public static void main(String[] argumentos) {
        try {
            int puerto = ConfiguracionEntorno.obtenerEntero("PORT", ConfiguracionEntorno.obtenerEntero("BACKEND_PORT", 8081));
            ServidorApi.iniciarServidor(puerto);
        } catch (Exception e) {
            System.err.println("Error al iniciar el servidor de backend: " + e.getMessage());
            e.printStackTrace();
            System.exit(1);
        }
    }
}
