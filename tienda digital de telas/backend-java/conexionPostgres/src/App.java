import infraestructura.api.ServidorApi;

/**
 * Clase principal de la aplicación — Punto de entrada del backend Java para D&D Textil.
 * Inicia el servidor HTTP embebido en el puerto configurado (puerto 8081 por defecto).
 */
public class App {

    /**
     * Punto de entrada principal de la JVM.
     * Instancia y arranca el {@link ServidorApi} en el puerto especificado.
     *
     * @param argumentos Argumentos de la línea de comandos (opcionales).
     */
    public static void main(String[] argumentos) {
        try {
            // Define el número de puerto en el que escuchará el servidor HTTP (8081)
            int puerto = 8081;
            // Inicia el servidor de la API REST
            ServidorApi.iniciarServidor(puerto);
        } catch (Exception e) {
            System.err.println("Error al iniciar el servidor de backend: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
