package infraestructura.api.manejadores;

import com.google.gson.Gson;
import com.sun.net.httpserver.HttpExchange;
import infraestructura.persistencia.jdbc.PedidoDAO;
import aplicacion.servicios.ServicioFactura;
import dominio.modelos.Pedido;
import infraestructura.configuracion.Conexion;

import java.io.OutputStream;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.HashMap;
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
        List<Map<String, Object>> facturas = new ArrayList<>();
        String consulta = "SELECT p.id, p.usuario_id, p.monto_total, p.estado, p.creado_en, " +
                "p.nombre_cliente, p.correo_cliente " +
                "FROM pedidos p " +
                "ORDER BY p.id DESC";

        try (Connection con = Conexion.obtenerConexion();
             PreparedStatement pst = con.prepareStatement(consulta);
             ResultSet rs = pst.executeQuery()) {
            while (rs.next()) {
                Map<String, Object> fac = new HashMap<>();
                fac.put("orderId", rs.getInt("id"));
                fac.put("clientId", rs.getInt("usuario_id"));
                fac.put("clientName", rs.getString("nombre_cliente"));
                fac.put("clientEmail", rs.getString("correo_cliente"));
                fac.put("total", rs.getDouble("monto_total"));
                fac.put("status", rs.getString("estado"));
                if (rs.getTimestamp("creado_en") != null) {
                    fac.put("date", rs.getTimestamp("creado_en").toString());
                } else {
                    fac.put("date", "");
                }
                facturas.add(fac);
            }
        }

        enviarRespuestaJson(intercambio, 200, gson.toJson(facturas));
    }

    private void manejarDescargarFactura(HttpExchange intercambio, int idPedido) throws Exception {
        Pedido pedido = pedidoDAO.obtenerPedidoPorId(idPedido);
        if (pedido == null) {
            enviarRespuestaJson(intercambio, 404, "{\"error\":\"Pedido no encontrado\"}");
            return;
        }

        String nombreCliente = "Cliente D&D Textil";
        String correoCliente = "";
        String telefonoCliente = "";
        String direccionCliente = "";
        String documentoCliente = "";
        String metodoPago = "N/A";

        String consultaPedido = "SELECT nombre_cliente, correo_cliente, telefono_cliente, direccion_envio, metodo_pago " +
                "FROM pedidos WHERE id = ?";
        try (Connection con = Conexion.obtenerConexion();
             PreparedStatement pst = con.prepareStatement(consultaPedido)) {
            pst.setInt(1, idPedido);
            try (ResultSet rs = pst.executeQuery()) {
                if (rs.next()) {
                    if (rs.getString("nombre_cliente") != null && !rs.getString("nombre_cliente").isBlank()) {
                        nombreCliente = rs.getString("nombre_cliente");
                    }
                    if (rs.getString("correo_cliente") != null) {
                        correoCliente = rs.getString("correo_cliente");
                    }
                    if (rs.getString("telefono_cliente") != null) {
                        telefonoCliente = rs.getString("telefono_cliente");
                    }
                    if (rs.getString("direccion_envio") != null) {
                        direccionCliente = rs.getString("direccion_envio");
                    }
                    if (rs.getString("metodo_pago") != null) {
                        metodoPago = rs.getString("metodo_pago");
                    }
                }
            }
        }

        List<Map<String, Object>> articulos = new ArrayList<>();
        String consultaArticulos = "SELECT ip.producto_id, ip.cantidad, ip.precio_por_metro, ip.subtotal, pr.nombre " +
                "FROM items_pedido ip " +
                "LEFT JOIN productos pr ON ip.producto_id = pr.id " +
                "WHERE ip.pedido_id = ?";
        try (Connection con = Conexion.obtenerConexion();
             PreparedStatement pst = con.prepareStatement(consultaArticulos)) {
            pst.setInt(1, idPedido);
            try (ResultSet rs = pst.executeQuery()) {
                while (rs.next()) {
                    Map<String, Object> item = new HashMap<>();
                    item.put("productId", rs.getInt("producto_id"));
                    item.put("quantity", rs.getDouble("cantidad"));
                    item.put("unitPrice", rs.getDouble("precio_por_metro"));
                    item.put("name", rs.getString("nombre") != null ? rs.getString("nombre") : "Tela Textil");
                    articulos.add(item);
                }
            }
        }

        double subtotal = 0;
        for (Map<String, Object> item : articulos) {
            double cantidad = ((Number) item.get("quantity")).doubleValue();
            double precio = ((Number) item.get("unitPrice")).doubleValue();
            subtotal += cantidad * precio;
        }
        double impuestos = subtotal * 0.19;
        double total = pedido.getTotal();

        byte[] pdfBytes = servicioFactura.generarFactura(
                idPedido, nombreCliente, correoCliente, telefonoCliente,
                direccionCliente, documentoCliente, articulos,
                subtotal, 0, 0, impuestos, total, metodoPago
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
