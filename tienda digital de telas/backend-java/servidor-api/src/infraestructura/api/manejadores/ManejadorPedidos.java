package infraestructura.api.manejadores;

import aplicacion.servicios.ServicioAutenticacion;
import aplicacion.servicios.ServicioNotificacionesEmail;
import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.google.gson.reflect.TypeToken;
import com.sun.net.httpserver.HttpExchange;
import dominio.modelos.Pedido;
import infraestructura.seguridad.TokenSesion;
import infraestructura.persistencia.jdbc.PedidoDAO;
import java.lang.reflect.Type;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Controlador HTTP para la gestión de pedidos (órdenes de compra).
 * Rutas base: `/api/orders` y `/api/pedidos`.
 */
public class ManejadorPedidos extends ManejadorBase {
    /** Objeto de acceso a datos de pedidos (`PedidoDAO`). */
    private final PedidoDAO pedidoDAO;
    /** Serializador JSON (`Gson`). */
    private final Gson gson;
    /** Servicio de envío de notificaciones logísticas por correo (`ServicioNotificacionesEmail`). */
    private final ServicioNotificacionesEmail servicioNotificaciones;

    /**
     * Inicializa el controlador de pedidos con su DAO y servicio de notificaciones.
     */
    public ManejadorPedidos() {
        this.pedidoDAO = new PedidoDAO();
        this.gson = new Gson();
        this.servicioNotificaciones = new ServicioNotificacionesEmail();
    }

    /**
     * Procesa las peticiones `GET`, `POST` y `PUT` para consultar, crear o actualizar el estado de pedidos.
     *
     * @param intercambio Contexto de la petición HTTP (`HttpExchange`).
     * @throws Exception Si ocurre un error durante el procesamiento.
     */
    @Override
    protected void procesarPeticion(HttpExchange intercambio) throws Exception {
        String metodo = intercambio.getRequestMethod();
        String ruta = intercambio.getRequestURI().getPath();

        if ("GET".equalsIgnoreCase(metodo)) {
            var identidad = obtenerIdentidad(intercambio);
            if (identidad.isEmpty()) {
                enviarRespuestaJson(intercambio, 401, "{\"error\":\"Autenticación requerida\"}");
                return;
            }

            if (ruta.matches("^/api/(orders|pedidos)/\\d+/?$")) {
                int idPedido = extraerIdRuta(ruta);
                if (idPedido > 0) {
                    Pedido pedido = pedidoDAO.obtenerPedidoPorId(idPedido);
                    if (pedido == null) {
                        enviarRespuestaJson(intercambio, 404, "{\"error\":\"Pedido no encontrado\"}");
                        return;
                    }

                    boolean esAdmin = identidad.get().esAdministrador();
                    boolean esClienteDuenio = (identidad.get().idUsuario() == pedido.getIdCliente());
                    boolean esVendedorPedido = (identidad.get().esVendedor() && identidad.get().idUsuario() == pedido.getIdVendedor());

                    if (!esAdmin && !esClienteDuenio && !esVendedorPedido) {
                        enviarRespuestaJson(intercambio, 403, "{\"error\":\"Acceso denegado: no autorizado para consultar este pedido\"}");
                        return;
                    }

                    enviarRespuestaJson(intercambio, 200, gson.toJson(pedido));
                    return;
                }
            }

            List<Pedido> pedidos;
            if (identidad.get().esAdministrador()) {
                pedidos = pedidoDAO.obtenerTodosLosPedidos();
            } else if (identidad.get().esVendedor()) {
                pedidos = pedidoDAO.obtenerPedidosPorVendedor(identidad.get().idUsuario());
            } else {
                pedidos = pedidoDAO.obtenerPedidosPorUsuario(identidad.get().idUsuario());
            }
            enviarRespuestaJson(intercambio, 200, gson.toJson(pedidos));

        } else if ("POST".equalsIgnoreCase(metodo)) {
            String cuerpo = new String(leerCuerpoSeguro(intercambio), StandardCharsets.UTF_8);

            if (ServicioAutenticacion.contieneDatosTarjetaSensibles(cuerpo)) {
                enviarRespuestaError(intercambio, 400, "Rechazado por seguridad PCI-DSS: no se permite enviar datos sensibles de tarjeta (PAN/CVV) al servidor.");
                return;
            }

            JsonObject json;
            try {
                json = JsonParser.parseString(cuerpo).getAsJsonObject();
            } catch (Exception e) {
                enviarRespuestaJson(intercambio, 400, "{\"error\":\"JSON inválido\"}");
                return;
            }

            int idCliente = -1;
            if (json.has("clientId") && !json.get("clientId").isJsonNull()) {
                idCliente = json.get("clientId").getAsInt();
            } else if (json.has("userId") && !json.get("userId").isJsonNull()) {
                idCliente = json.get("userId").getAsInt();
            } else if (json.has("idCliente") && !json.get("idCliente").isJsonNull()) {
                idCliente = json.get("idCliente").getAsInt();
            } else if (json.has("idUsuario") && !json.get("idUsuario").isJsonNull()) {
                idCliente = json.get("idUsuario").getAsInt();
            }
            if (idCliente <= 0) {
                enviarRespuestaJson(intercambio, 400, "{\"error\":\"El identificador del cliente es obligatorio\"}");
                return;
            }

            double total = 0.0;
            if (json.has("total") && !json.get("total").isJsonNull()) {
                total = json.get("total").getAsDouble();
            } else if (json.has("montoTotal") && !json.get("montoTotal").isJsonNull()) {
                total = json.get("montoTotal").getAsDouble();
            }

            Type tipoLista = new TypeToken<List<Map<String, Object>>>(){}.getType();
            List<Map<String, Object>> articulos = null;
            if (json.has("items")) {
                articulos = gson.fromJson(json.get("items"), tipoLista);
            } else if (json.has("articulos")) {
                articulos = gson.fromJson(json.get("articulos"), tipoLista);
            }

            Map<String, Object> metadatos = new HashMap<>();
            metadatos.put("nombreCliente", extraerCampoTexto(json, "customerName", "nombreCliente", "nombre", "clientName"));
            metadatos.put("correoCliente", extraerCampoTexto(json, "customerEmail", "correoCliente", "correo", "email", "clientEmail"));
            metadatos.put("telefonoCliente", extraerCampoTexto(json, "customerPhone", "telefonoCliente", "telefono", "phone", "clientPhone"));
            metadatos.put("direccionEnvio", extraerCampoTexto(json, "shippingAddress", "direccionEnvio", "direccion", "address"));
            metadatos.put("ciudadEnvio", extraerCampoTexto(json, "shippingCity", "ciudadEnvio", "ciudad", "city"));
            metadatos.put("departamentoEnvio", extraerCampoTexto(json, "shippingDepartment", "departamentoEnvio", "departamento", "department"));
            metadatos.put("documentoCliente", extraerCampoTexto(json, "customerDocument", "documentoCliente", "documentNumber", "documento", "cedula", "nit"));
            metadatos.put("metodoPago", extraerCampoTexto(json, "paymentMethod", "metodoPago"));
            metadatos.put("estadoPago", extraerCampoTexto(json, "paymentStatus", "estadoPago"));
            metadatos.put("codigoCupon", extraerCampoTexto(json, "couponCode", "codigoCupon"));
            metadatos.put("notas", extraerCampoTexto(json, "notes", "notas"));

            if (json.has("subtotal") && !json.get("subtotal").isJsonNull()) {
                metadatos.put("subtotal", json.get("subtotal").getAsDouble());
            }
            if (json.has("shippingCost") && !json.get("shippingCost").isJsonNull()) {
                metadatos.put("costoEnvio", json.get("shippingCost").getAsDouble());
            } else if (json.has("costoEnvio") && !json.get("costoEnvio").isJsonNull()) {
                metadatos.put("costoEnvio", json.get("costoEnvio").getAsDouble());
            }
            if (json.has("tax") && !json.get("tax").isJsonNull()) {
                metadatos.put("impuestos", json.get("tax").getAsDouble());
            } else if (json.has("impuestos") && !json.get("impuestos").isJsonNull()) {
                metadatos.put("impuestos", json.get("impuestos").getAsDouble());
            }
            if (json.has("discount") && !json.get("discount").isJsonNull()) {
                metadatos.put("descuento", json.get("discount").getAsDouble());
            } else if (json.has("descuento") && !json.get("descuento").isJsonNull()) {
                metadatos.put("descuento", json.get("descuento").getAsDouble());
            }

            int idPedido = pedidoDAO.crearPedidoConMetadatos(idCliente, total, articulos, metadatos);

            if (idPedido > 0) {
                infraestructura.api.websocket.ServidorWebSocket.transmitir("NUEVO_PEDIDO", java.util.Map.of(
                        "idPedido", idPedido,
                        "estado", "pendiente",
                        "total", total
                ));
                String respuesta = "{\"success\":true,\"orderId\":" + idPedido + ",\"idPedido\":" + idPedido + "}";
                enviarRespuestaJson(intercambio, 201, respuesta);
            } else {
                enviarRespuestaJson(intercambio, 500, "{\"error\":\"Error al crear el pedido\"}");
            }

        } else if ("PUT".equalsIgnoreCase(metodo)) {
            var identidad = obtenerIdentidad(intercambio);
            if (identidad.isEmpty()) {
                enviarRespuestaJson(intercambio, 401, "{\"error\":\"Autenticación requerida\"}");
                return;
            }
            if (!identidad.get().esAdministrador() && !identidad.get().esVendedor()) {
                enviarRespuestaJson(intercambio, 403, "{\"error\":\"Acceso denegado: solo personal logístico o administradores pueden modificar pedidos\"}");
                return;
            }

            int idPedido = extraerIdRuta(ruta);
            if (idPedido <= 0) {
                enviarRespuestaJson(intercambio, 400, "{\"error\":\"Identificador de pedido inválido en la ruta\"}");
                return;
            }

            String cuerpo = new String(leerCuerpoSeguro(intercambio), StandardCharsets.UTF_8);
            JsonObject objetoJson;
            try {
                objetoJson = JsonParser.parseString(cuerpo).getAsJsonObject();
            } catch (Exception e) {
                enviarRespuestaJson(intercambio, 400, "{\"error\":\"Cuerpo JSON inválido\"}");
                return;
            }

            String estado = extraerCampoTexto(objetoJson, "status", "estado");
            String numeroGuia = extraerCampoTexto(objetoJson, "trackingNumber", "numeroGuia");
            String notas = extraerCampoTexto(objetoJson, "notes", "notas");

            java.util.Set<String> estadosValidos = java.util.Set.of(
                    "pending", "paid", "confirmed", "cutting", "packed", "shipped", "delivered", "cancelled",
                    "pendiente", "pagado", "confirmado", "en corte", "empacado", "enviado", "entregado", "cancelado"
            );
            if (estado == null || !estadosValidos.contains(estado.trim().toLowerCase())) {
                enviarRespuestaJson(intercambio, 400, "{\"error\":\"Estado de pedido inválido o faltante\"}");
                return;
            }

            String estadoNorm = estado.trim().toLowerCase();
            boolean exito = pedidoDAO.actualizarPedido(idPedido, estadoNorm, numeroGuia, notas);

            if (exito) {
                infraestructura.api.websocket.ServidorWebSocket.transmitirPedido(idPedido, estadoNorm);
                Pedido pedidoActual = pedidoDAO.obtenerPedidoPorId(idPedido);
                if (pedidoActual != null && pedidoActual.getCorreoCliente() != null && !pedidoActual.getCorreoCliente().isBlank()) {
                    String correo = pedidoActual.getCorreoCliente();
                    String nombre = pedidoActual.getNombreCliente() != null ? pedidoActual.getNombreCliente() : "Cliente";
                    String nombreTela = !pedidoActual.getProductNames().isEmpty() ? String.join(", ", pedidoActual.getProductNames()) : "Telas del pedido";
                    double metros = pedidoActual.getTotalMeters() > 0 ? pedidoActual.getTotalMeters() : Math.max(1.0, pedidoActual.getCantidadArticulos());
                    try {
                        if ("cutting".equals(estadoNorm) || "en corte".equals(estadoNorm)) {
                            servicioNotificaciones.enviarNotificacionEnCorte(correo, nombre, idPedido, nombreTela, metros);
                        } else if ("shipped".equals(estadoNorm) || "enviado".equals(estadoNorm)) {
                            servicioNotificaciones.enviarNotificacionDespacho(
                                    correo,
                                    nombre,
                                    idPedido,
                                    "Transportadora Aliada",
                                    numeroGuia != null ? numeroGuia : (pedidoActual.getNumeroGuia() != null ? pedidoActual.getNumeroGuia() : "GUIA-" + idPedido)
                            );
                        }
                    } catch (Exception ignored) {}
                }
            }

            enviarRespuestaJson(intercambio, exito ? 200 : 500, exito ? "{\"success\":true}" : "{\"error\":\"Error actualizando estado del pedido\"}");
        } else {
            enviarRespuestaJson(intercambio, 405, "{\"error\":\"Método no permitido\"}");
        }
    }

    /**
     * Busca y retorna el primer campo de texto no vacío entre múltiples alias de claves JSON.
     *
     * @param json   Objeto JSON a inspeccionar (`JsonObject`).
     * @param claves Lista de nombres de propiedad candidatos (`String...`).
     * @return Valor de texto recortado o `null` si ninguno existe.
     */
    /**
     * Determina si una identidad autenticada tiene permiso para consultar un pedido específico.
     * Un administrador ve cualquier pedido; un vendedor solo sus líneas de productos;
     * cualquier otro rol solo los que realizó como cliente.
     *
     * @param identidad Identidad verificada en la sesión (`TokenSesion.Identidad`).
     * @param pedido    Entidad de pedido a evaluar (`Pedido`).
     * @return `true` si está autorizado; `false` en caso contrario.
     */
    public static boolean puedeVerPedido(TokenSesion.Identidad identidad, Pedido pedido) {
        if (identidad.esAdministrador()) return true;
        if (identidad.esVendedor()) return pedido.getIdVendedor() == identidad.idUsuario();
        return pedido.getIdCliente() == identidad.idUsuario();
    }

    private String extraerCampoTexto(JsonObject json, String... claves) {
        for (String clave : claves) {
            if (json.has(clave) && !json.get(clave).isJsonNull()) {
                String valor = json.get(clave).getAsString();
                if (valor != null && !valor.trim().isEmpty()) {
                    return valor.trim();
                }
            }
        }
        return null;
    }
}
