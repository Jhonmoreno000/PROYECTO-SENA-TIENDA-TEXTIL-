package infraestructura.api.manejadores;

import aplicacion.servicios.ServicioExclusividadVIP;
import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.sun.net.httpserver.HttpExchange;
import dominio.modelos.AlertaVendedor;
import dominio.modelos.PerfilVendedor;
import dominio.modelos.Producto;
import dominio.modelos.ResenaVendedor;
import infraestructura.persistencia.jdbc.ProductoDAO;
import infraestructura.persistencia.jdbc.TiendaVendedorDAO;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Controlador HTTP para el ecosistema Marketplace Multi-Vendedor:
 * - Perfiles públicos de tienda tipo Facebook (`/api/tiendas`, `/api/stores`)
 * - Edición del perfil de tienda por el vendedor (`/api/tiendas/mi-perfil`)
 * - Reseñas hacia vendedores (`/api/tiendas/{id}/resenas`)
 * - Alertas inteligentes de oportunidad para vendedores (`/api/vendedor/alertas`)
 * - Elegibilidad VIP de clientes frecuentes (`/api/clientes/elegibilidad-vip`)
 */
public class ManejadorTiendas extends ManejadorBase {

    private final TiendaVendedorDAO tiendaDAO = new TiendaVendedorDAO();
    private final ProductoDAO productoDAO = new ProductoDAO();
    private final ServicioExclusividadVIP servicioVIP = new ServicioExclusividadVIP();
    private final Gson gson = new Gson();

    @Override
    protected void procesarPeticion(HttpExchange intercambio) throws Exception {
        String metodo = intercambio.getRequestMethod();
        String ruta = intercambio.getRequestURI().getPath();
        String rutaNorm = (ruta.length() > 1 && ruta.endsWith("/")) ? ruta.substring(0, ruta.length() - 1) : ruta;

        // 1. Elegibilidad VIP de clientes frecuentes
        if (rutaNorm.equals("/api/clientes/elegibilidad-vip") || rutaNorm.equals("/api/clients/vip-eligibility")) {
            var identidad = obtenerIdentidad(intercambio);
            if (identidad.isEmpty()) {
                Map<String, Object> anon = servicioVIP.evaluarElegibilidad(0);
                enviarRespuestaJson(intercambio, 200, gson.toJson(anon));
                return;
            }
            Map<String, Object> eval = servicioVIP.evaluarElegibilidad(identidad.get().idUsuario());
            enviarRespuestaJson(intercambio, 200, gson.toJson(eval));
            return;
        }

        // 2. Alertas inteligentes de oportunidad para el vendedor
        if (rutaNorm.startsWith("/api/vendedor/alertas") || rutaNorm.startsWith("/api/seller/alerts")) {
            manejarAlertasVendedor(intercambio, metodo, rutaNorm);
            return;
        }

        // 3. Reseñas hacia un vendedor específico: /api/tiendas/{id}/resenas
        if (rutaNorm.matches("^/api/(tiendas|stores)/\\d+/(resenas|reviews)$")) {
            int idVendedor = extraerIdTienda(rutaNorm);
            manejarResenasTienda(intercambio, metodo, idVendedor);
            return;
        }

        // 4. Edición de perfil propio de tienda: PUT /api/tiendas/mi-perfil
        if (rutaNorm.equals("/api/tiendas/mi-perfil") || rutaNorm.equals("/api/stores/my-profile") || rutaNorm.equals("/api/tiendas/perfil")) {
            manejarPerfilPropio(intercambio, metodo);
            return;
        }

        // 5. Consulta de tienda específica: GET /api/tiendas/{id}
        if (rutaNorm.matches("^/api/(tiendas|stores)/\\d+$") && "GET".equalsIgnoreCase(metodo)) {
            int idVendedor = extraerIdTienda(rutaNorm);
            var identidad = obtenerIdentidad(intercambio);
            boolean puedeVerExclusivos = identidad.isPresent() && (
                    identidad.get().esAdministrador()
                    || identidad.get().idUsuario() == idVendedor
                    || servicioVIP.esClienteFrecuente(identidad.get().idUsuario())
            );
            PerfilVendedor perfil = tiendaDAO.obtenerPerfilTienda(idVendedor, puedeVerExclusivos);
            if (perfil == null) {
                enviarRespuestaJson(intercambio, 404, "{\"error\":\"Tienda no encontrada\"}");
                return;
            }

            List<Producto> productos = productoDAO.obtenerProductosPorVendedor(idVendedor);
            if (!puedeVerExclusivos) {
                productos = productos.stream().filter(p -> !p.isEsExclusivo()).toList();
            }
            List<ResenaVendedor> resenas = tiendaDAO.obtenerResenasVendedor(idVendedor);

            Map<String, Object> respuesta = new HashMap<>();
            respuesta.put("store", perfil);
            respuesta.put("tienda", perfil);
            respuesta.put("products", productos);
            respuesta.put("productos", productos);
            respuesta.put("reviews", resenas);
            respuesta.put("resenas", resenas);
            respuesta.put("vipUnlocked", puedeVerExclusivos);
            enviarRespuestaJson(intercambio, 200, gson.toJson(respuesta));
            return;
        }

        // 6. Listado público de todas las tiendas del marketplace: GET /api/tiendas
        if ((rutaNorm.equals("/api/tiendas") || rutaNorm.equals("/api/stores")) && "GET".equalsIgnoreCase(metodo)) {
            var identidad = obtenerIdentidad(intercambio);
            boolean incluirExclusivos = identidad.isPresent() && (
                    identidad.get().esAdministrador()
                    || servicioVIP.esClienteFrecuente(identidad.get().idUsuario())
            );
            List<PerfilVendedor> tiendas = tiendaDAO.listarTiendas(incluirExclusivos);
            enviarRespuestaJson(intercambio, 200, gson.toJson(tiendas));
            return;
        }

        enviarRespuestaJson(intercambio, 404, "{\"error\":\"Ruta de marketplace no encontrada\"}");
    }

    private void manejarPerfilPropio(HttpExchange intercambio, String metodo) throws Exception {
        var identidad = obtenerIdentidad(intercambio);
        if (identidad.isEmpty()) {
            enviarRespuestaJson(intercambio, 401, "{\"error\":\"Autenticación requerida\"}");
            return;
        }
        int idUsuario = identidad.get().idUsuario();
        if ("GET".equalsIgnoreCase(metodo)) {
            PerfilVendedor perfil = tiendaDAO.obtenerPerfilTienda(idUsuario);
            if (perfil == null) {
                enviarRespuestaJson(intercambio, 404, "{\"error\":\"Perfil de tienda no encontrado\"}");
                return;
            }
            enviarRespuestaJson(intercambio, 200, gson.toJson(perfil));
            return;
        }
        if ("PUT".equalsIgnoreCase(metodo) || "POST".equalsIgnoreCase(metodo)) {
            if (!identidad.get().esVendedor() && !identidad.get().esAdministrador()) {
                enviarRespuestaJson(intercambio, 403, "{\"error\":\"Solo cuentas de vendedor pueden editar su perfil de tienda\"}");
                return;
            }
            String cuerpo = new String(leerCuerpoSeguro(intercambio), StandardCharsets.UTF_8);
            PerfilVendedor datos = gson.fromJson(cuerpo, PerfilVendedor.class);
            boolean ok = tiendaDAO.actualizarPerfilTienda(idUsuario, datos);
            if (ok) {
                PerfilVendedor actualizado = tiendaDAO.obtenerPerfilTienda(idUsuario);
                enviarRespuestaJson(intercambio, 200, gson.toJson(actualizado));
            } else {
                enviarRespuestaJson(intercambio, 500, "{\"error\":\"Error actualizando perfil de tienda\"}");
            }
            return;
        }
        enviarRespuestaJson(intercambio, 405, "{\"error\":\"Método no permitido\"}");
    }

    private void manejarResenasTienda(HttpExchange intercambio, String metodo, int idVendedor) throws Exception {
        if ("GET".equalsIgnoreCase(metodo)) {
            List<ResenaVendedor> resenas = tiendaDAO.obtenerResenasVendedor(idVendedor);
            enviarRespuestaJson(intercambio, 200, gson.toJson(resenas));
            return;
        }
        if ("POST".equalsIgnoreCase(metodo)) {
            var identidad = obtenerIdentidad(intercambio);
            if (identidad.isEmpty()) {
                enviarRespuestaJson(intercambio, 401, "{\"error\":\"Inicia sesión como cliente para calificar a este proveedor\"}");
                return;
            }
            if (!identidad.get().esCliente()) {
                enviarRespuestaJson(intercambio, 403, "{\"error\":\"Solo las cuentas con rol Cliente pueden calificar a los proveedores.\"}");
                return;
            }
            int idAutor = identidad.get().idUsuario();
            if (idAutor == idVendedor) {
                enviarRespuestaJson(intercambio, 400, "{\"error\":\"No puedes calificar tu propia tienda\"}");
                return;
            }
            String cuerpo = new String(leerCuerpoSeguro(intercambio), StandardCharsets.UTF_8);
            ResenaVendedor resena = gson.fromJson(cuerpo, ResenaVendedor.class);
            if (resena == null || resena.getCalificacion() < 1 || resena.getCalificacion() > 5
                    || resena.getComentario() == null || resena.getComentario().isBlank()) {
                enviarRespuestaJson(intercambio, 400, "{\"error\":\"Calificación (1-5) y comentario son obligatorios\"}");
                return;
            }
            resena.setIdVendedor(idVendedor);
            resena.setIdUsuario(idAutor);
            boolean ok = tiendaDAO.guardarResenaVendedor(resena);
            if (ok) {
                enviarRespuestaJson(intercambio, 201, "{\"success\":true}");
            } else {
                enviarRespuestaJson(intercambio, 500, "{\"error\":\"Error registrando reseña del vendedor\"}");
            }
            return;
        }
        enviarRespuestaJson(intercambio, 405, "{\"error\":\"Método no permitido\"}");
    }

    private void manejarAlertasVendedor(HttpExchange intercambio, String metodo, String rutaNorm) throws Exception {
        var identidad = obtenerIdentidad(intercambio);
        if (identidad.isEmpty()) {
            enviarRespuestaJson(intercambio, 401, "{\"error\":\"Autenticación requerida\"}");
            return;
        }
        if (!identidad.get().esVendedor() && !identidad.get().esAdministrador()) {
            enviarRespuestaJson(intercambio, 403, "{\"error\":\"Acceso restringido a vendedores\"}");
            return;
        }
        int idVendedor = identidad.get().idUsuario();

        if ("GET".equalsIgnoreCase(metodo)) {
            int vendedorQuery = obtenerParametroConsultaEntero(intercambio, "sellerId", -1);
            int targetId = (identidad.get().esAdministrador() && vendedorQuery > 0) ? vendedorQuery : idVendedor;
            List<AlertaVendedor> alertas = tiendaDAO.obtenerYGenerarAlertasVendedor(targetId);
            enviarRespuestaJson(intercambio, 200, gson.toJson(alertas));
            return;
        }

        if ("PUT".equalsIgnoreCase(metodo)) {
            int idAlerta = extraerIdRuta(rutaNorm);
            if (idAlerta <= 0) {
                enviarRespuestaJson(intercambio, 400, "{\"error\":\"ID de alerta inválido\"}");
                return;
            }
            String cuerpo = new String(leerCuerpoSeguro(intercambio), StandardCharsets.UTF_8);
            boolean aplicada = true;
            if (!cuerpo.isBlank()) {
                try {
                    JsonObject json = JsonParser.parseString(cuerpo).getAsJsonObject();
                    if (json.has("applied") && !json.get("applied").isJsonNull()) {
                        aplicada = json.get("applied").getAsBoolean();
                    } else if (json.has("aplicada") && !json.get("aplicada").isJsonNull()) {
                        aplicada = json.get("aplicada").getAsBoolean();
                    }
                } catch (RuntimeException ignored) {}
            }
            boolean ok = tiendaDAO.marcarAlertaAplicada(idAlerta, idVendedor, aplicada);
            enviarRespuestaJson(intercambio, ok ? 200 : 404, ok ? "{\"success\":true}" : "{\"error\":\"Alerta no encontrada\"}");
            return;
        }
        enviarRespuestaJson(intercambio, 405, "{\"error\":\"Método no permitido\"}");
    }

    private int extraerIdTienda(String ruta) {
        for (String segmento : ruta.split("/")) {
            if (segmento.matches("^\\d+$")) {
                return Integer.parseInt(segmento);
            }
        }
        return -1;
    }
}

