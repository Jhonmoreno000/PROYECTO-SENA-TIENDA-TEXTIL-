package infraestructura.api.manejadores;

import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.sun.net.httpserver.HttpExchange;

import aplicacion.servicios.ServicioAutenticacion;
import aplicacion.servicios.ServicioCriptoWompi;
import aplicacion.servicios.ServicioNotificacionesEmail;
import dominio.modelos.TransaccionWompi;
import infraestructura.configuracion.ConfiguracionWompi;
import infraestructura.persistencia.jdbc.PagoWompiDAO;
import infraestructura.persistencia.jdbc.PagoWompiDAO.ResultadoIntencionPago;

/**
 * Controlador REST para el flujo de pagos seguros con Wompi (Bancolombia).
 * Soporta creación de intención de pago con firma SHA-256, confirmación de pago,
 * recepción de Webhooks firmados y consulta de estado por referencia.
 */
public class ManejadorPagosWompi extends ManejadorBase {

    /** Objeto de acceso a datos de pagos y pedidos Wompi (`PagoWompiDAO`). */
    private final PagoWompiDAO pagoWompiDAO;
    /** Serializador JSON (`Gson`). */
    private final Gson gson;
    /** Servicio de envío de notificaciones transaccionales por correo (`ServicioNotificacionesEmail`). */
    private final ServicioNotificacionesEmail servicioNotificaciones;

    /**
     * Inicializa el manejador de pagos Wompi con su DAO y servicio de notificaciones.
     */
    public ManejadorPagosWompi() {
        this.pagoWompiDAO = new PagoWompiDAO();
        this.gson = new Gson();
        this.servicioNotificaciones = new ServicioNotificacionesEmail();
    }

    /**
     * Enruta las peticiones `GET` y `POST` sobre `/api/pagos/*` y `/api/payments/*`.
     *
     * @param intercambio Contexto de la petición HTTP (`HttpExchange`).
     * @throws Exception Si ocurre un error durante el procesamiento.
     */
    @Override
    protected void procesarPeticion(HttpExchange intercambio) throws Exception {
        String metodo = intercambio.getRequestMethod();
        String ruta = intercambio.getRequestURI().getPath();

        if ("GET".equalsIgnoreCase(metodo) && (ruta.endsWith("/config") || ruta.endsWith("/configuracion"))) {
            JsonObject config = new JsonObject();
            config.addProperty("configured", ConfiguracionWompi.estaConfigurada());
            config.addProperty("publicKey", ConfiguracionWompi.llavePublica() != null ? ConfiguracionWompi.llavePublica() : "");
            config.addProperty("currency", ConfiguracionWompi.MONEDA);
            config.addProperty("environment", ConfiguracionWompi.esProduccion() ? "production" : "sandbox");
            enviarRespuestaJson(intercambio, 200, gson.toJson(config));
            return;
        }

        if ("GET".equalsIgnoreCase(metodo) && (ruta.contains("/estado") || ruta.contains("/status"))) {
            String referencia = obtenerParametroConsulta(intercambio, "reference");
            if (referencia == null || referencia.isBlank()) {
                referencia = obtenerParametroConsulta(intercambio, "referencia");
            }
            if (referencia == null || referencia.isBlank()) {
                enviarRespuestaError(intercambio, 400, "Parámetro 'reference' o 'referencia' requerido.");
                return;
            }

            Map<String, Object> pedido = pagoWompiDAO.consultarPedidoPorReferencia(referencia);
            if (pedido == null) {
                enviarRespuestaError(intercambio, 404, "No se encontró ningún pedido con la referencia: " + referencia);
                return;
            }

            enviarRespuestaJson(intercambio, 200, gson.toJson(pedido));
            return;
        }

        if ("POST".equalsIgnoreCase(metodo) && (ruta.endsWith("/intencion") || ruta.endsWith("/intent"))) {
            manejarIntencionPago(intercambio);
            return;
        }

        if ("POST".equalsIgnoreCase(metodo) && (ruta.endsWith("/confirmar") || ruta.endsWith("/confirm"))) {
            manejarConfirmarPago(intercambio);
            return;
        }

        if ("POST".equalsIgnoreCase(metodo) && (ruta.endsWith("/webhook") || ruta.endsWith("/wompi-webhook"))) {
            manejarWebhook(intercambio);
            return;
        }

        enviarRespuestaError(intercambio, 404, "Endpoint de pagos no encontrado: " + ruta);
    }

    /**
     * Genera la orden en estado pendiente y la firma criptográfica SHA-256 de integridad antes de abrir Wompi Widget.
     *
     * @param intercambio Contexto HTTP (`HttpExchange`).
     * @throws Exception Si ocurre un error validando precios o persistiendo el pedido.
     */
    private void manejarIntencionPago(HttpExchange intercambio) throws Exception {
        String cuerpo = new String(leerCuerpoSeguro(intercambio), StandardCharsets.UTF_8);

        if (ServicioAutenticacion.contieneDatosTarjetaSensibles(cuerpo)) {
            enviarRespuestaError(intercambio, 400, "Rechazado por seguridad PCI-DSS: no se permite enviar datos sensibles de tarjeta (PAN/CVV) al servidor.");
            return;
        }

        JsonObject json;
        try {
            json = JsonParser.parseString(cuerpo).getAsJsonObject();
        } catch (Exception e) {
            enviarRespuestaError(intercambio, 400, "Cuerpo JSON inválido.");
            return;
        }

        int userId = -1;
        if (json.has("userId") && !json.get("userId").isJsonNull()) {
            userId = json.get("userId").getAsInt();
        } else if (json.has("idUsuario") && !json.get("idUsuario").isJsonNull()) {
            userId = json.get("idUsuario").getAsInt();
        }
        if (userId <= 0) {
            enviarRespuestaError(intercambio, 400, "El identificador del usuario es obligatorio.");
            return;
        }

        JsonObject customer = json.has("customerInfo") && json.get("customerInfo").isJsonObject()
                ? json.getAsJsonObject("customerInfo")
                : (json.has("cliente") && json.get("cliente").isJsonObject() ? json.getAsJsonObject("cliente") : new JsonObject());

        String fullName = extraerTexto(customer, "fullName", extraerTexto(customer, "nombre", null));
        String email = extraerTexto(customer, "email", extraerTexto(customer, "correo", null));
        String phone = extraerTexto(customer, "phone", extraerTexto(customer, "telefono", null));
        String address = extraerTexto(customer, "address", extraerTexto(customer, "direccion", null));
        String city = extraerTexto(customer, "city", extraerTexto(customer, "ciudad", null));
        String state = extraerTexto(customer, "state", extraerTexto(customer, "departamento", null));
        String notes = extraerTexto(customer, "notes", extraerTexto(customer, "notas", ""));

        String couponCode = json.has("couponCode") && !json.get("couponCode").isJsonNull()
                ? json.get("couponCode").getAsString()
                : (json.has("codigoCupon") && !json.get("codigoCupon").isJsonNull() ? json.get("codigoCupon").getAsString() : null);

        JsonArray itemsArray = null;
        if (json.has("items") && json.get("items").isJsonArray()) {
            itemsArray = json.getAsJsonArray("items");
        } else if (json.has("articulos") && json.get("articulos").isJsonArray()) {
            itemsArray = json.getAsJsonArray("articulos");
        }

        if (itemsArray == null || itemsArray.size() == 0) {
            enviarRespuestaError(intercambio, 400, "Debe enviar al menos un producto en la lista de items.");
            return;
        }

        List<Map<String, Object>> listaArticulos = new ArrayList<>();
        for (JsonElement el : itemsArray) {
            if (el.isJsonObject()) {
                JsonObject itemObj = el.getAsJsonObject();
                int prodId = itemObj.has("productId") ? itemObj.get("productId").getAsInt()
                        : (itemObj.has("id") ? itemObj.get("id").getAsInt() : itemObj.get("idProducto").getAsInt());
                double cant = itemObj.has("quantity") ? itemObj.get("quantity").getAsDouble()
                        : (itemObj.has("cantidad") ? itemObj.get("cantidad").getAsDouble() : 1.0);

                listaArticulos.add(Map.of("productId", prodId, "quantity", cant));
            }
        }

        ResultadoIntencionPago res = pagoWompiDAO.crearIntencionPago(
                userId, fullName, email, phone, address, city, state, notes, couponCode, listaArticulos
        );

        JsonObject respuesta = new JsonObject();
        respuesta.addProperty("success", true);
        respuesta.addProperty("orderId", res.idPedido);
        respuesta.addProperty("reference", res.referencia);
        respuesta.addProperty("amountInCents", res.montoEnCentavos);
        respuesta.addProperty("currency", res.moneda);
        respuesta.addProperty("integritySignature", res.firmaIntegridad);
        respuesta.addProperty("publicKey", res.llavePublica != null ? res.llavePublica : "");
        respuesta.addProperty("subtotal", res.subtotal);
        respuesta.addProperty("discount", res.descuento);
        respuesta.addProperty("shipping", res.envio);
        respuesta.addProperty("tax", res.iva);
        respuesta.addProperty("total", res.total);

        JsonObject clienteRes = new JsonObject();
        clienteRes.addProperty("fullName", res.nombreCliente);
        clienteRes.addProperty("email", res.correoCliente);
        clienteRes.addProperty("phone", res.telefonoCliente);
        respuesta.add("customerInfo", clienteRes);

        enviarRespuestaJson(intercambio, 201, gson.toJson(respuesta));
    }

    /**
     * Procesa la confirmación directa de un pago por su referencia actualizando el estado e inventario en PostgreSQL.
     *
     * @param intercambio Contexto HTTP (`HttpExchange`).
     * @throws Exception Si ocurre un error procesando la confirmación.
     */
    private void manejarConfirmarPago(HttpExchange intercambio) throws Exception {
        String cuerpo = new String(leerCuerpoSeguro(intercambio), StandardCharsets.UTF_8);

        if (ServicioAutenticacion.contieneDatosTarjetaSensibles(cuerpo)) {
            enviarRespuestaError(intercambio, 400, "Rechazado por seguridad PCI-DSS: no se permite enviar datos sensibles de tarjeta (PAN/CVV) al servidor.");
            return;
        }

        JsonObject json;
        try {
            json = JsonParser.parseString(cuerpo).getAsJsonObject();
        } catch (Exception e) {
            enviarRespuestaError(intercambio, 400, "Cuerpo JSON inválido.");
            return;
        }

        String referencia = extraerTexto(json, "reference", extraerTexto(json, "referencia", null));
        String transaccionId = extraerTexto(json, "transactionId", extraerTexto(json, "wompiTransactionId", extraerTexto(json, "transaccionId", null)));
        String metodoPago = extraerTexto(json, "paymentMethod", extraerTexto(json, "metodoPago", "WOMPI"));
        String estadoPago = extraerTexto(json, "status", extraerTexto(json, "estado", "APPROVED"));

        if (referencia == null || referencia.isBlank()) {
            enviarRespuestaError(intercambio, 400, "La referencia de pago es obligatoria.");
            return;
        }

        boolean procesado = pagoWompiDAO.confirmarPagoPorReferencia(referencia, transaccionId, metodoPago, estadoPago);
        if (!procesado) {
            enviarRespuestaError(intercambio, 404, "No se pudo confirmar el pedido con referencia: " + referencia);
            return;
        }

        Map<String, Object> pedido = pagoWompiDAO.consultarPedidoPorReferencia(referencia);
        if (pedido != null && "APPROVED".equalsIgnoreCase(estadoPago)) {
            try {
                @SuppressWarnings("unchecked")
                Map<String, Object> customerInfo = (Map<String, Object>) pedido.get("customerInfo");
                String correo = customerInfo != null && customerInfo.get("email") != null ? String.valueOf(customerInfo.get("email")) : null;
                String nombre = customerInfo != null && customerInfo.get("fullName") != null ? String.valueOf(customerInfo.get("fullName")) : "Cliente";
                double total = pedido.get("total") instanceof Number ? ((Number) pedido.get("total")).doubleValue() : 0.0;
                if (correo != null && !correo.isBlank()) {
                    servicioNotificaciones.enviarNotificacionPagoAprobado(correo, nombre, referencia, total);
                }
            } catch (Exception ignored) {}
        }

        JsonObject respuesta = new JsonObject();
        respuesta.addProperty("success", true);
        respuesta.addProperty("reference", referencia);
        respuesta.addProperty("status", estadoPago.toUpperCase());
        if (pedido != null && pedido.get("id") instanceof Number) {
            respuesta.addProperty("orderId", ((Number) pedido.get("id")).intValue());
        }
        enviarRespuestaJson(intercambio, 200, gson.toJson(respuesta));
    }

    /**
     * Recibe el evento Webhook de Wompi, valida su firma criptográfica y actualiza el pedido de forma idempotente.
     *
     * @param intercambio Contexto HTTP (`HttpExchange`).
     * @throws Exception Si ocurre un error en la lectura o respuesta del Webhook.
     */
    private void manejarWebhook(HttpExchange intercambio) throws Exception {
        String payloadRaw = new String(leerCuerpoSeguro(intercambio), StandardCharsets.UTF_8);

        JsonObject json;
        try {
            json = JsonParser.parseString(payloadRaw).getAsJsonObject();
        } catch (Exception e) {
            enviarRespuestaError(intercambio, 400, "Payload JSON de webhook inválido.");
            return;
        }

        String secretoEventos = ConfiguracionWompi.secretoEventos();
        if (secretoEventos != null && !secretoEventos.isBlank()) {
            boolean firmaValida = ServicioCriptoWompi.validarFirmaWebhook(json);
            if (!firmaValida) {
                System.err.println("[WOMPI SEGURIDAD] Rechazado webhook con firma apócrifa o inválida.");
                enviarRespuestaError(intercambio, 401, "Firma criptográfica inválida.");
                return;
            }
        } else if (ConfiguracionWompi.esProduccion()) {
            System.err.println("[WOMPI SEGURIDAD] Rechazado webhook en producción porque WOMPI_EVENTS_SECRET no está configurado.");
            enviarRespuestaError(intercambio, 401, "Configuración de firma de eventos requerida en producción.");
            return;
        } else {
            System.out.println("[WOMPI AVISO] Webhook recibido en sandbox sin validación estricta porque WOMPI_EVENTS_SECRET no está definido.");
        }

        if (!json.has("data") || !json.get("data").isJsonObject()) {
            enviarRespuestaJson(intercambio, 200, "{\"received\": true, \"ignored\": \"no data field\"}");
            return;
        }

        JsonObject dataObj = json.getAsJsonObject("data");
        if (!dataObj.has("transaction") || !dataObj.get("transaction").isJsonObject()) {
            enviarRespuestaJson(intercambio, 200, "{\"received\": true, \"ignored\": \"no transaction object\"}");
            return;
        }

        JsonObject txObj = dataObj.getAsJsonObject("transaction");
        String txId = extraerTexto(txObj, "id", "");
        String referencia = extraerTexto(txObj, "reference", "");
        String estado = extraerTexto(txObj, "status", "PENDING");
        long montoCentavos = txObj.has("amount_in_cents") ? txObj.get("amount_in_cents").getAsLong() : 0L;
        String moneda = extraerTexto(txObj, "currency", "COP");
        String metodoPago = extraerTexto(txObj, "payment_method_type", "WOMPI");

        TransaccionWompi tx = new TransaccionWompi(txId, referencia, estado, montoCentavos, moneda, metodoPago);

        boolean exito = pagoWompiDAO.procesarTransaccionWompi(tx, payloadRaw);

        if (exito && "APPROVED".equalsIgnoreCase(estado)) {
            String correoCliente = extraerTexto(txObj, "customer_email", null);
            String nombreCliente = "Cliente D&D Textil";
            Map<String, Object> pedidoBd = pagoWompiDAO.consultarPedidoPorReferencia(referencia);
            if (pedidoBd != null && pedidoBd.get("customerInfo") instanceof Map) {
                @SuppressWarnings("unchecked")
                Map<String, Object> info = (Map<String, Object>) pedidoBd.get("customerInfo");
                if (correoCliente == null || correoCliente.isBlank()) {
                    correoCliente = info.get("email") != null ? String.valueOf(info.get("email")) : null;
                }
                if (info.get("fullName") != null) {
                    nombreCliente = String.valueOf(info.get("fullName"));
                }
            }
            if (correoCliente != null && !correoCliente.isBlank()) {
                double montoCop = montoCentavos / 100.0;
                try {
                    servicioNotificaciones.enviarNotificacionPagoAprobado(correoCliente, nombreCliente, referencia, montoCop);
                } catch (Exception e) {
                    System.err.println("[NOTIFICACIONES] Error al despachar correo de pago: " + e.getMessage());
                }
            }
        }

        enviarRespuestaJson(intercambio, 200, "{\"received\": true, \"status\": \"PROCESSED\"}");
    }

    /**
     * Extrae una propiedad de texto de un objeto JSON o devuelve el valor por defecto.
     *
     * @param obj          Objeto JSON (`JsonObject`).
     * @param clave        Clave buscada (`String`).
     * @param valorDefecto Valor por defecto si la clave no existe (`String`).
     * @return Cadena extraída o `valorDefecto`.
     */
    private static String extraerTexto(JsonObject obj, String clave, String valorDefecto) {
        if (obj != null && obj.has(clave) && !obj.get(clave).isJsonNull()) {
            return obj.get(clave).getAsString();
        }
        return valorDefecto;
    }
}
