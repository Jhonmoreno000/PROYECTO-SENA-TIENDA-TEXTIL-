import infrastructure.api.ApiServer;

/**
 * Clase principal de la aplicación — Punto de entrada del backend Java para D&D Textil.
 * Inicia el servidor HTTP embebido en el puerto configurado (puerto 8081 por defecto).
 */
public class App {

    /**
     * Punto de entrada principal de la JVM.
     * Instancia y arranca el {@link ApiServer} en el puerto especificado.
     *
     * @param args Argumentos de la línea de comandos (opcionales).
     */
    public static void main(String[] args) {
        // Bloque try-catch para capturar cualquier excepción durante el arranque del servidor
        try {
            // Define el número de puerto en el que escuchará el servidor HTTP (8081)
            int port = 8081;
            // Llama al método estático startServer de ApiServer pasándole el puerto configurado
            ApiServer.startServer(port);
        // Captura cualquier excepción de tipo Exception que ocurra dentro del bloque try
        } catch (Exception e) {
            // Imprime el rastro completo de la pila de la excepción en la salida estándar de error
            e.printStackTrace();
        }
    }
}
