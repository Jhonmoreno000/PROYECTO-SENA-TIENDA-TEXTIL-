package infraestructura.api.websocket;

import com.google.gson.Gson;
import java.io.IOException;
import java.net.ServerSocket;
import java.net.Socket;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

/**
 * Servidor WebSocket en tiempo real para D&D Textil (RFC 6455).
 * Permite la sincronización en vivo de inventario textil, nuevos pedidos,
 * cambios de ofertas y notificaciones del sistema sin requerir recargas de página.
 */
public class ServidorWebSocket {
    private static final Gson gson = new Gson();
    private static final List<ClienteWebSocket> clientes = new CopyOnWriteArrayList<>();
    private static ServerSocket serverSocket;
    private static ExecutorService poolConexiones;
    private static volatile boolean enEjecucion = false;
    private static int puertoActivo = 8082;

    /**
     * Inicia el servidor WebSocket en un hilo en segundo plano.
     *
     * @param puerto Puerto TCP en el que escuchará el socket (por defecto 8082).
     */
    public static synchronized void iniciar(int puerto) {
        if (enEjecucion) {
            return;
        }
        puertoActivo = puerto;
        enEjecucion = true;
        poolConexiones = Executors.newCachedThreadPool();

        Thread hiloServidor = new Thread(() -> {
            try {
                serverSocket = new ServerSocket(puertoActivo);
                System.out.println("Servidor WebSocket (En Vivo / Tiempo Real) activo en ws://localhost:" + puertoActivo);

                while (enEjecucion && !serverSocket.isClosed()) {
                    try {
                        Socket socket = serverSocket.accept();
                        ClienteWebSocket cliente = new ClienteWebSocket(
                                socket,
                                ServidorWebSocket::procesarMensajeEntrante,
                                clientes::remove
                        );
                        clientes.add(cliente);
                        poolConexiones.execute(cliente);

                        // Enviar confirmación de bienvenida en tiempo real
                        cliente.enviarTexto(gson.toJson(new MensajeWebSocket("CONECTADO", Map.of(
                                "mensaje", "Conexión en vivo con D&D Textil activa",
                                "puerto", puertoActivo
                        ))));
                    } catch (IOException e) {
                        if (!enEjecucion) break;
                    }
                }
            } catch (Exception e) {
                if (enEjecucion) {
                    System.err.println("Aviso WebSocket: no se pudo enlazar el puerto " + puertoActivo + " (" + e.getMessage() + ")");
                }
            } finally {
                detener();
            }
        }, "ServidorWebSocket-Listener");

        hiloServidor.setDaemon(true);
        hiloServidor.start();
    }

    /**
     * Procesa mensajes enviados por clientes conectados (por ejemplo, suscripciones o pings).
     */
    private static void procesarMensajeEntrante(String mensaje) {
        // Por seguridad, se puede procesar pings o suscripciones a canales específicos
        if ("ping".equalsIgnoreCase(mensaje.trim())) {
            transmitir("PONG", Map.of("hora", System.currentTimeMillis()));
        }
    }

    /**
     * Emite un evento en tiempo real a todos los navegadores y clientes conectados.
     *
     * @param tipo  Nombre del evento (ej: "STOCK_ACTUALIZADO", "NUEVO_PEDIDO").
     * @param datos Contenido o carga útil del evento.
     */
    public static void transmitir(String tipo, Object datos) {
        if (!enEjecucion || clientes.isEmpty()) {
            return;
        }
        String json = gson.toJson(new MensajeWebSocket(tipo, datos));
        for (ClienteWebSocket cliente : clientes) {
            if (cliente.estaActivo()) {
                cliente.enviarTexto(json);
            } else {
                clientes.remove(cliente);
            }
        }
    }

    /**
     * Transmite una actualización de inventario textil.
     */
    public static void transmitirStock(int idProducto, Double stock) {
        transmitir("STOCK_ACTUALIZADO", Map.of(
                "idProducto", idProducto,
                "stock", stock != null ? stock : 0.0
        ));
    }

    /**
     * Transmite una actualización de pedido a clientes y panel logístico.
     */
    public static void transmitirPedido(int idPedido, String estado) {
        transmitir("PEDIDO_ACTUALIZADO", Map.of(
                "idPedido", idPedido,
                "estado", estado
        ));
    }

    /**
     * Transmite una alerta global o notificación en tiempo real.
     */
    public static void transmitirNotificacion(String titulo, String mensaje, String tipoAlerta) {
        transmitir("NOTIFICACION", Map.of(
                "titulo", titulo,
                "mensaje", mensaje,
                "tipo", tipoAlerta != null ? tipoAlerta : "info"
        ));
    }

    /**
     * Retorna el número de clientes conectados actualmente.
     */
    public static int obtenerConexionesActivas() {
        return clientes.size();
    }

    public static List<ClienteWebSocket> obtenerClientes() {
        return Collections.unmodifiableList(clientes);
    }

    /**
     * Detiene el servidor y cierra todas las conexiones abiertas.
     */
    public static synchronized void detener() {
        enEjecucion = false;
        for (ClienteWebSocket cliente : clientes) {
            cliente.cerrar();
        }
        clientes.clear();
        try {
            if (serverSocket != null && !serverSocket.isClosed()) {
                serverSocket.close();
            }
        } catch (Exception ignored) {}
        if (poolConexiones != null) {
            poolConexiones.shutdownNow();
        }
    }
}
