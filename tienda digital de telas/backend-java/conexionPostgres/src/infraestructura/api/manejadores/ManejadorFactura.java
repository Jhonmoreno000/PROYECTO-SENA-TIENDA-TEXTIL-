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
                String[] partes = ruta.split("/");
                int idPedido = Integer.parseInt(partes[partes.length - 1]);
                manejarDescargarFactura(intercambio, idPedido);
            }
        } else {
            enviarRespuestaJson(intercambio, 405, "{\"error\":\"Método no permitido\"}");
        }
    }

    private void manejarListarFacturas(HttpExchange intercambio) throws Exception {
        List<Map<String, Object>> facturas = new ArrayList<>();
        String consulta = "SELECT o.id, o.client_id, o.total, o.status, o.order_date, " +
                "u.name AS client_name, u.email AS client_email " +
                "FROM orders o " +
                "LEFT JOIN users u ON o.client_id = u.id " +
                "ORDER BY o.id DESC";

        try (Connection con = Conexion.obtenerConexion();
             PreparedStatement pst = con.prepareStatement(consulta);
             ResultSet rs = pst.executeQuery()) {
            while (rs.next()) {
                Map<String, Object> fac = new HashMap<>();
                fac.put("orderId", rs.getInt("id"));
                fac.put("clientId", rs.getInt("client_id"));
                fac.put("clientName", rs.getString("client_name"));
                fac.put("clientEmail", rs.getString("client_email"));
                fac.put("total", rs.getDouble("total"));
                fac.put("status", rs.getString("status"));
                fac.put("date", rs.getString("order_date"));
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

        String nombreCliente = "";
        String correoCliente = "";
        String telefonoCliente = "";
        String direccionCliente = "";
        String documentoCliente = "";

        String consultaUsuario = "SELECT name, email FROM users WHERE id = ?";
        try (Connection con = Conexion.obtenerConexion();
             PreparedStatement pst = con.prepareStatement(consultaUsuario)) {
            pst.setInt(1, pedido.getIdCliente());
            try (ResultSet rs = pst.executeQuery()) {
                if (rs.next()) {
                    nombreCliente = rs.getString("name") != null ? rs.getString("name") : "";
                    correoCliente = rs.getString("email") != null ? rs.getString("email") : "";
                }
            }
        }

        List<Map<String, Object>> articulos = new ArrayList<>();
        String consultaArticulos = "SELECT oi.product_id, oi.quantity, oi.unit_price, p.name " +
                "FROM order_items oi " +
                "LEFT JOIN products p ON oi.product_id = p.id " +
                "WHERE oi.order_id = ?";
        try (Connection con = Conexion.obtenerConexion();
             PreparedStatement pst = con.prepareStatement(consultaArticulos)) {
            pst.setInt(1, idPedido);
            try (ResultSet rs = pst.executeQuery()) {
                while (rs.next()) {
                    Map<String, Object> item = new HashMap<>();
                    item.put("productId", rs.getInt("product_id"));
                    item.put("quantity", rs.getInt("quantity"));
                    item.put("unitPrice", rs.getDouble("unit_price"));
                    item.put("name", rs.getString("name") != null ? rs.getString("name") : "Producto");
                    articulos.add(item);
                }
            }
        }

        double subtotal = 0;
        for (Map<String, Object> item : articulos) {
            int cantidad = ((Number) item.get("quantity")).intValue();
            double precio = ((Number) item.get("unitPrice")).doubleValue();
            subtotal += cantidad * precio;
        }
        double impuestos = subtotal * 0.19;
        double total = pedido.getTotal();

        byte[] pdfBytes = servicioFactura.generarFactura(
                idPedido, nombreCliente, correoCliente, telefonoCliente,
                direccionCliente, documentoCliente, articulos,
                subtotal, 0, 0, impuestos, total, "N/A"
        );

        intercambio.getResponseHeaders().add("Content-Type", "application/pdf");
        intercambio.getResponseHeaders().add("Content-Disposition",
                "attachment; filename=\"FAC-" + String.format("%06d", idPedido) + ".pdf\"");
        intercambio.sendResponseHeaders(200, pdfBytes.length);
        OutputStream os = intercambio.getResponseBody();
        os.write(pdfBytes);
        os.close();
    }
}
