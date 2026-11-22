package infraestructura.api.websocket;

/**
 * Modelo de datos para mensajes y eventos transmitidos en tiempo real
 * a través del canal WebSocket en D&D Textil.
 */
public class MensajeWebSocket {
    private final String tipo;
    private final long marcaTiempo;
    private final Object datos;

    public MensajeWebSocket(String tipo, Object datos) {
        this.tipo = tipo;
        this.marcaTiempo = System.currentTimeMillis();
        this.datos = datos;
    }

    public String getTipo() {
        return tipo;
    }

    public long getMarcaTiempo() {
        return marcaTiempo;
    }

    public Object getDatos() {
        return datos;
    }
}
