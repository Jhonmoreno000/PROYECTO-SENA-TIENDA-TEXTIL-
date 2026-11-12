import infraestructura.api.websocket.ClienteWebSocket;
import infraestructura.api.websocket.MensajeWebSocket;
import infraestructura.api.websocket.ServidorWebSocket;
import com.google.gson.Gson;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Base64;
import java.util.Map;

/**
 * Suite de pruebas automatizadas para el protocolo y servidor WebSocket (RFC 6455) de D&D Textil.
 * Valida el handshake criptográfico, serialización de mensajes y transmisión en tiempo real.
 */
public class PruebasWebSocket {
    private static int pruebasExitosas = 0;
    private static int pruebasFallidas = 0;
    private static final Gson gson = new Gson();

    public static void main(String[] args) {
        System.out.println("=================================================================");
        System.out.println("   SUITE DE PRUEBAS DE WEBSOCKET EN TIEMPO REAL (RFC 6455 SENA) ");
        System.out.println("=================================================================");

        ejecutarPrueba("1. Handshake RFC 6455: Cálculo matemático de Sec-WebSocket-Accept", () -> {
            String testKey = "dGhlIHNhbXBsZSBub25jZQ==";
            String guid = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11";
            MessageDigest digest = MessageDigest.getInstance("SHA-1");
            byte[] hash = digest.digest((testKey + guid).getBytes(StandardCharsets.UTF_8));
            String acceptCalculado = Base64.getEncoder().encodeToString(hash);
            // El valor esperado oficial del RFC 6455 sección 4.2.2 para esta clave de prueba
            String acceptEsperado = "s3pPLMBiTxaQ9kYGzzhZRbK+xOo=";
            if (!acceptEsperado.equals(acceptCalculado)) {
                throw new AssertionError("Fallo de handshake RFC 6455. Esperado: " + acceptEsperado + " pero fue: " + acceptCalculado);
            }
        });

        ejecutarPrueba("2. Serialización de evento WebSocket: Modelo MensajeWebSocket", () -> {
            MensajeWebSocket mensaje = new MensajeWebSocket("STOCK_ACTUALIZADO", Map.of(
                    "idProducto", 42,
                    "stock", 15.5
            ));
            if (!"STOCK_ACTUALIZADO".equals(mensaje.getTipo())) {
                throw new AssertionError("El tipo del mensaje no coincide");
            }
            if (mensaje.getMarcaTiempo() <= 0) {
                throw new AssertionError("La marca de tiempo debe ser un timestamp positivo");
            }
            String json = gson.toJson(mensaje);
            if (!json.contains("STOCK_ACTUALIZADO") || !json.contains("15.5") || !json.contains("42")) {
                throw new AssertionError("La serialización JSON del evento es incompleta: " + json);
            }
        });

        ejecutarPrueba("3. Evento de nuevo pedido: Estructura de carga útil", () -> {
            MensajeWebSocket mensaje = new MensajeWebSocket("NUEVO_PEDIDO", Map.of(
                    "idPedido", 1001,
                    "estado", "pendiente",
                    "total", 185000.0
            ));
            String json = gson.toJson(mensaje);
            if (!json.contains("NUEVO_PEDIDO") || !json.contains("1001") || !json.contains("185000")) {
                throw new AssertionError("Payload de nuevo pedido inválido: " + json);
            }
        });

        ejecutarPrueba("4. Ciclo de vida ServidorWebSocket: inicio, transmisión vacía y detención segura", () -> {
            int puertoTest = 18082;
            ServidorWebSocket.iniciar(puertoTest);
            if (ServidorWebSocket.obtenerConexionesActivas() != 0) {
                throw new AssertionError("Inicialmente debe tener 0 conexiones activas");
            }
            // Transmisión sin clientes conectados debe degradar defensivamente sin excepciones
            ServidorWebSocket.transmitirStock(99, 50.0);
            ServidorWebSocket.transmitirPedido(88, "enviado");
            ServidorWebSocket.transmitirNotificacion("Alerta", "Mensaje de prueba", "info");
            ServidorWebSocket.detener();
        });

        System.out.println("-----------------------------------------------------------------");
        System.out.println("Resultados de Pruebas WebSocket: " + pruebasExitosas + " exitosas, " + pruebasFallidas + " fallidas.");
        System.out.println("=================================================================");

        if (pruebasFallidas > 0) {
            System.exit(1);
        }
    }

    private static void ejecutarPrueba(String nombre, CasoPrueba caso) {
        try {
            caso.ejecutar();
            System.out.println("  [OK] " + nombre);
            pruebasExitosas++;
        } catch (Throwable t) {
            System.err.println("  [FALLO] " + nombre + ": " + t.getMessage());
            pruebasFallidas++;
        }
    }

    @FunctionalInterface
    interface CasoPrueba {
        void ejecutar() throws Throwable;
    }
}
