// Importa la clase ApiServer desde el paquete infrastructure.api, que contiene la lógica del servidor HTTP
import infrastructure.api.ApiServer;

// Clase principal de la aplicación — punto de entrada del sistema backend de D&D Textil
public class App {
    // Método principal que inicia la ejecución del programa; recibe argumentos de línea de comandos
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
