package infraestructura.api.websocket;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.Socket;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Base64;
import java.util.function.Consumer;

/**
 * Representa una conexión WebSocket individual cliente-servidor (RFC 6455).
 * Gestiona el handshake HTTP inicial, la lectura/desenmascaramiento de tramas (frames)
 * y el envío de tramas de texto de servidor a cliente.
 */
public class ClienteWebSocket implements Runnable {
    private static final String GUID_WEBSOCKET = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11";

    private final Socket socket;
    private final Consumer<String> alRecibirMensaje;
    private final Consumer<ClienteWebSocket> alCerrarConexion;
    private volatile boolean activo = true;
    private OutputStream salida;

    public ClienteWebSocket(Socket socket, Consumer<String> alRecibirMensaje, Consumer<ClienteWebSocket> alCerrarConexion) {
        this.socket = socket;
        this.alRecibirMensaje = alRecibirMensaje;
        this.alCerrarConexion = alCerrarConexion;
    }

    @Override
    public void run() {
        try {
            InputStream entrada = socket.getInputStream();
            this.salida = socket.getOutputStream();

            if (!realizarHandshake(entrada, salida)) {
                cerrar();
                return;
            }

            // Bucle de lectura de tramas RFC 6455
            while (activo && !socket.isClosed()) {
                int primerByte = entrada.read();
                if (primerByte == -1) {
                    break;
                }

                int opcode = primerByte & 0x0F;
                int segundoByte = entrada.read();
                if (segundoByte == -1) {
                    break;
                }

                boolean enmascarado = (segundoByte & 0x80) != 0;
                long longitudCarga = segundoByte & 0x7F;

                if (longitudCarga == 126) {
                    int b1 = entrada.read();
                    int b2 = entrada.read();
                    if (b1 == -1 || b2 == -1) break;
                    longitudCarga = ((b1 & 0xFF) << 8) | (b2 & 0xFF);
                } else if (longitudCarga == 127) {
                    long len = 0;
                    for (int i = 0; i < 8; i++) {
                        int b = entrada.read();
                        if (b == -1) break;
                        len = (len << 8) | (b & 0xFF);
                    }
                    longitudCarga = len;
                }

                byte[] mascara = new byte[4];
                if (enmascarado) {
                    int leidosMascara = 0;
                    while (leidosMascara < 4) {
                        int r = entrada.read(mascara, leidosMascara, 4 - leidosMascara);
                        if (r == -1) break;
                        leidosMascara += r;
                    }
                }

                if (longitudCarga > 10 * 1024 * 1024) { // Límite defensivo de 10 MB por trama
                    cerrar();
                    break;
                }

                byte[] carga = new byte[(int) longitudCarga];
                int totalLeido = 0;
                while (totalLeido < longitudCarga) {
                    int r = entrada.read(carga, totalLeido, (int) longitudCarga - totalLeido);
                    if (r == -1) break;
                    totalLeido += r;
                }

                if (enmascarado) {
                    for (int i = 0; i < carga.length; i++) {
                        carga[i] = (byte) (carga[i] ^ mascara[i % 4]);
                    }
                }

                // Opcode 0x8: Close Frame
                if (opcode == 0x8) {
                    cerrar();
                    break;
                }
                // Opcode 0x9: Ping -> Responder Pong (0xA)
                else if (opcode == 0x9) {
                    enviarPong(carga);
                }
                // Opcode 0x1: Texto
                else if (opcode == 0x1) {
                    String texto = new String(carga, StandardCharsets.UTF_8);
                    if (alRecibirMensaje != null) {
                        alRecibirMensaje.accept(texto);
                    }
                }
            }
        } catch (Exception e) {
            // Desconexión habitual del cliente o error de I/O
        } finally {
            cerrar();
        }
    }

    private boolean realizarHandshake(InputStream entrada, OutputStream salida) throws Exception {
        ByteArrayOutputStream bufferPeticion = new ByteArrayOutputStream();
        byte[] buffer = new byte[1024];
        int bytesLeidos;

        while ((bytesLeidos = entrada.read(buffer)) != -1) {
            bufferPeticion.write(buffer, 0, bytesLeidos);
            String texto = bufferPeticion.toString(StandardCharsets.UTF_8);
            if (texto.contains("\r\n\r\n")) {
                break;
            }
        }

        String peticionCompleta = bufferPeticion.toString(StandardCharsets.UTF_8);
        String claveSec = null;

        for (String linea : peticionCompleta.split("\r\n")) {
            if (linea.toLowerCase().startsWith("sec-websocket-key:")) {
                claveSec = linea.substring("sec-websocket-key:".length()).trim();
                break;
            }
        }

        if (claveSec == null) {
            return false;
        }

        MessageDigest digest = MessageDigest.getInstance("SHA-1");
        byte[] hash = digest.digest((claveSec + GUID_WEBSOCKET).getBytes(StandardCharsets.UTF_8));
        String respuestaAccept = Base64.getEncoder().encodeToString(hash);

        String respuestaHttp = "HTTP/1.1 101 Switching Protocols\r\n" +
                "Upgrade: websocket\r\n" +
                "Connection: Upgrade\r\n" +
                "Sec-WebSocket-Accept: " + respuestaAccept + "\r\n\r\n";

        salida.write(respuestaHttp.getBytes(StandardCharsets.UTF_8));
        salida.flush();
        return true;
    }

    public synchronized void enviarTexto(String mensaje) {
        if (!activo || socket.isClosed() || salida == null) {
            return;
        }
        try {
            byte[] carga = mensaje.getBytes(StandardCharsets.UTF_8);
            int len = carga.length;

            salida.write(0x81); // 0x81 = FIN + Opcode de texto (1)

            if (len <= 125) {
                salida.write(len);
            } else if (len <= 65535) {
                salida.write(126);
                salida.write((len >> 8) & 0xFF);
                salida.write(len & 0xFF);
            } else {
                salida.write(127);
                for (int i = 7; i >= 0; i--) {
                    salida.write((int) ((len >> (8 * i)) & 0xFF));
                }
            }

            salida.write(carga);
            salida.flush();
        } catch (Exception e) {
            cerrar();
        }
    }

    private synchronized void enviarPong(byte[] carga) {
        if (!activo || socket.isClosed() || salida == null) return;
        try {
            salida.write(0x8A); // Pong
            salida.write(carga.length & 0x7F);
            salida.write(carga);
            salida.flush();
        } catch (Exception ignored) {}
    }

    public void cerrar() {
        activo = false;
        try {
            if (!socket.isClosed()) {
                socket.close();
            }
        } catch (Exception ignored) {}
        if (alCerrarConexion != null) {
            alCerrarConexion.accept(this);
        }
    }

    public boolean estaActivo() {
        return activo && !socket.isClosed();
    }
}
