import infrastructure.api.ApiServer;

public class App {
    public static void main(String[] args) {
        try {
            int port = 8081;
            // Configurar entorno u otras inicializaciones aquí
            ApiServer.startServer(port);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
