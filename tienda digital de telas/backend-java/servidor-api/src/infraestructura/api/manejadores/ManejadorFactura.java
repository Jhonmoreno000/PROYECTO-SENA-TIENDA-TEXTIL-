package infraestructura.api.manejadores;

import aplicacion.servicios.ServicioFactura;
import com.google.gson.Gson;
import com.sun.net.httpserver.HttpExchange;
import dominio.modelos.Pedido;
import infraestructura.persistencia.jdbc.PedidoDAO;

import java.io.OutputStream;
import java.util.List;
import java.util.Map;

/**
 * Controlador HTTP para el listado y descarga de facturas electrónicas en formato PDF.
 * Consulta los datos reales del pedido y sus líneas desde PostgreSQL (`pedidos` e `items_pedido`).
 */
public class ManejadorFactura extends ManejadorBase {
    /** Objeto de acceso a datos de pedidos (`PedidoDAO`). */
    private final PedidoDAO pedidoDAO;
    /** Servicio generador de documentos PDF (`ServicioFactura`). */
    private final ServicioFactura servicioFactura;
    /** Serializador JSON (`Gson`). */
    private final Gson gson;

    /**
     * Inicializa el manejador de facturación con sus dependencias de persistencia y generación PDF.
     */
    public ManejadorFactura() {
        this.pedidoDAO = new PedidoDAO();
        this.servicioFactura = new ServicioFactura();
        this.gson = new Gson();
    }

    /**
     * Enruta las peticiones `GET` para listar el resumen de facturas o descargar el PDF de un pedido específico.
     *
     * @param intercambio Contexto de la petición HTTP (`HttpExchange`).
     * @throws Exception Si ocurre un error durante la consulta o generación del PDF.
     */
    @Override
    protected void procesarPeticion(HttpExchange intercambio) throws Exception {
        String metodo = intercambio.getRequestMethod();
        String ruta = intercambio.getRequestURI().getPath();

        if ("GET".equalsIgnoreCase(metodo)) {
            if (ruta.equals("/api/invoices") || ruta.equals("/api/facturas")) {
                manejarListarFacturas(intercambio);
            } else {
                int idPedido = extraerIdRuta(ruta);
                if (idPedido <= 0) {
                    enviarRespuestaJson(intercambio, 400, "{\"error\":\"ID de pedido inválido en la ruta\"}");
                    return;
                }
                manejarDescargarFactura(intercambio, idPedido);
            }
        } else {
            enviarRespuestaJson(intercambio, 405, "{\"error\":\"Método no permitido\"}");
        }
    }

    /**
     * Envía en formato JSON el listado resumido de todas las facturas registradas.
     *
     * @param intercambio Contexto HTTP (`HttpExchange`).
     * @throws Exception Si falla la serialización o envío.
     */
    private void manejarListarFacturas(HttpExchange intercambio) throws Exception {
        List<Map<String, Object>> facturas = pedidoDAO.obtenerResumenFacturas();
        enviarRespuestaJson(intercambio, 200, gson.toJson(facturas));
    }

    /**
     * Genera y transmite el archivo binario PDF de la factura asociada a un pedido.
     *
     * @param intercambio Contexto HTTP (`HttpExchange`).
     * @param idPedido    Identificador numérico del pedido (`int`).
     * @throws Exception Si falla la generación del documento PDF o la escritura en el socket.
     */
    private void manejarDescargarFactura(HttpExchange intercambio, int idPedido) throws Exception {
        Pedido pedido = pedidoDAO.obtenerPedidoPorId(idPedido);
        if (pedido == null) {
            enviarRespuestaJson(intercambio, 404, "{\"error\":\"Pedido no encontrado\"}");
            return;
        }

        Map<String, Object> cabecera = pedidoDAO.obtenerCabeceraFactura(idPedido);
        String nombreCliente = "Cliente D&D Textil";
        String correoCliente = "";
        String telefonoCliente = "";
        String direccionCliente = "";
        String documentoCliente = "";
        String metodoPago = "N/A";
        double subtotalGuardado = 0.0;
        double descuentoGuardado = 0.0;
        double envioGuardado = 0.0;
        double impuestoGuardado = 0.0;

        if (cabecera != null) {
            String nom = (String) cabecera.get("nombreCliente");
            if (nom != null && !nom.isBlank()) nombreCliente = nom;
            if (cabecera.get("correoCliente") != null) correoCliente = (String) cabecera.get("correoCliente");
            if (cabecera.get("telefonoCliente") != null) telefonoCliente = (String) cabecera.get("telefonoCliente");
            if (cabecera.get("direccionEnvio") != null) direccionCliente = (String) cabecera.get("direccionEnvio");
            if (cabecera.get("documentoCliente") != null && !((String) cabecera.get("documentoCliente")).isBlank()) {
                documentoCliente = (String) cabecera.get("documentoCliente");
            }
            if (cabecera.get("metodoPago") != null) metodoPago = (String) cabecera.get("metodoPago");
            subtotalGuardado = ((Number) cabecera.getOrDefault("subtotal", 0.0)).doubleValue();
            descuentoGuardado = ((Number) cabecera.getOrDefault("descuento", 0.0)).doubleValue();
            envioGuardado = ((Number) cabecera.getOrDefault("envio", 0.0)).doubleValue();
            impuestoGuardado = ((Number) cabecera.getOrDefault("impuesto", 0.0)).doubleValue();
        }

        List<Map<String, Object>> articulos = pedidoDAO.obtenerArticulosFactura(idPedido);

        double subtotalCalculado = 0;
        for (Map<String, Object> item : articulos) {
            double cantidad = ((Number) item.get("quantity")).doubleValue();
            double precio = ((Number) item.get("unitPrice")).doubleValue();
            subtotalCalculado += cantidad * precio;
        }
        double subtotal = subtotalGuardado > 0 ? subtotalGuardado : subtotalCalculado;
        double descuento = descuentoGuardado;
        double envio = envioGuardado;
        double impuestos = impuestoGuardado > 0 ? impuestoGuardado : Math.max(0.0, subtotal - descuento) * 0.19;
        double total = pedido.getTotal();

        byte[] pdfBytes = servicioFactura.generarFactura(
                idPedido, nombreCliente, correoCliente, telefonoCliente,
                direccionCliente, documentoCliente, articulos,
                subtotal, descuento, envio, impuestos, total, metodoPago
        );

        intercambio.getResponseHeaders().set("Content-Type", "application/pdf");
        intercambio.getResponseHeaders().set("Content-Disposition",
                "attachment; filename=\"FAC-" + String.format("%06d", idPedido) + ".pdf\"");
        intercambio.sendResponseHeaders(200, pdfBytes.length);

        try (OutputStream os = intercambio.getResponseBody()) {
            os.write(pdfBytes);
        }
    }
}
