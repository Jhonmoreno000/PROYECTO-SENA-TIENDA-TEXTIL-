package infraestructura.api.manejadores;

import com.google.gson.Gson;
import com.sun.net.httpserver.HttpExchange;
import infraestructura.persistencia.jdbc.PedidoDAO;
import aplicacion.servicios.ServicioFactura;
import dominio.modelos.Pedido;

import java.io.OutputStream;
import java.util.List;
import java.util.Map;

/**
 * Controlador para la generación y descarga de facturas electrónicas en PDF.
 * Consulta las tablas reales del esquema PostgreSQL ('pedidos', 'items_pedido', 'productos', 'usuarios').
 */
public class ManejadorFactura extends ManejadorBase {
    private final PedidoDAO pedidoDAO;
    private final ServicioFactura servicioFactura;
    private final Gson gson;

    public ManejadorFactura() {
        this.pedidoDAO = new PedidoDAO();
        this.servicioFactura = new ServicioFactura();
        this.gson = new Gson();
    }

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

    private void manejarListarFacturas(HttpExchange intercambio) throws Exception {
        List<Map<String, Object>> facturas = pedidoDAO.obtenerResumenFacturas();
        enviarRespuestaJson(intercambio, 200, gson.toJson(facturas));
    }

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
