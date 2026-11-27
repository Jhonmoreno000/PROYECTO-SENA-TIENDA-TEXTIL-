package infraestructura.api.manejadores;

import aplicacion.servicios.ServicioExclusividadVIP;
import aplicacion.servicios.ServicioNotificacionesEmail;
import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.sun.net.httpserver.HttpExchange;
import dominio.modelos.ActividadReciente;
import dominio.modelos.Producto;
import infraestructura.configuracion.ConfiguracionEntorno;
import infraestructura.persistencia.jdbc.InventarioDAO;
import infraestructura.persistencia.jdbc.ProductoDAO;
import infraestructura.persistencia.jdbc.TiendaVendedorDAO;
import java.nio.charset.StandardCharsets;
import java.util.List;

/**
 * Controlador HTTP para la gestión del catálogo de productos (CRUD, moderación, competencia, VIP y carga de imágenes).
 * Rutas soportadas: `/api/products` y `/api/productos`.
 */
public class ManejadorProductos extends ManejadorBase {

    /** Servicio de envío de alertas por correo electrónico (`ServicioNotificacionesEmail`). */
    private final ServicioNotificacionesEmail servicioNotificaciones = new ServicioNotificacionesEmail();
    /** Servicio de evaluación de elegibilidad VIP para telas exclusivas. */
    private final ServicioExclusividadVIP servicioVIP = new ServicioExclusividadVIP();
    /** DAO de alertas y perfiles de tienda para notificar auditorías reales al vendedor. */
    private final TiendaVendedorDAO tiendaDAO = new TiendaVendedorDAO();
    /** DAO de inventario y actividad reciente para registrar auditorías. */
    private final InventarioDAO inventarioDAO = new InventarioDAO();

    /**
     * Normaliza un estado de moderación recibido en inglés o español a su código canónico.
     */
    public static String normalizarEstadoModeracion(String estado) {
        if (estado == null) return "";
        return switch (estado.trim().toLowerCase()) {
            case "approved", "aprobado" -> "approved";
            case "changes_requested", "cambios_solicitados" -> "changes_requested";
            case "rejected", "rechazado" -> "rejected";
            case "pending", "pendiente" -> "pending";
            default -> "";
        };
    }

    /**
     * Devuelve la etiqueta localizada en español para mostrar al usuario sin exponer códigos internos.
     */
    public static String obtenerEtiquetaEstadoModeracion(String estado) {
        return switch (normalizarEstadoModeracion(estado)) {
            case "approved" -> "Aprobado";
            case "changes_requested" -> "Cambios solicitados";
            case "rejected" -> "Suspendido";
            case "pending" -> "Pendiente";
            default -> "Pendiente";
        };
    }

    /**
     * Enruta las solicitudes `GET`, `POST`, `PUT` y `DELETE` sobre el catálogo de productos.
     *
     * @param intercambio Contexto de la petición HTTP (`HttpExchange`).
     * @throws Exception Si ocurre un error durante el procesamiento.
     */
    @Override
    protected void procesarPeticion(HttpExchange intercambio) throws Exception {
        String metodo = intercambio.getRequestMethod();
        String ruta = intercambio.getRequestURI().getPath();
        ProductoDAO dao = new ProductoDAO();
        Gson gson = new Gson();

        switch (metodo) {
            case "GET" -> manejarGet(intercambio, ruta, dao, gson);
            case "PUT" -> manejarPut(intercambio, ruta, dao, gson);
            case "POST" -> manejarPost(intercambio, dao, gson);
            case "DELETE" -> manejarDelete(intercambio, ruta, dao);
            default -> enviarRespuestaJson(intercambio, 405, "{\"error\":\"Método no permitido\"}");
        }
    }

    /**
     * Procesa las consultas `GET` de producto individual, pendientes de moderación, por vendedor o por sección.
     *
     * @param intercambio Contexto HTTP (`HttpExchange`).
     * @param ruta        Ruta URI solicitada (`String`).
     * @param dao         Instancia de `ProductoDAO`.
     * @param gson        Serializador JSON (`Gson`).
     * @throws Exception Si falla la consulta o serialización.
     */
    private void manejarGet(HttpExchange intercambio, String ruta, ProductoDAO dao, Gson gson) throws Exception {
        var identidad = obtenerIdentidad(intercambio);
        boolean esStaffAdmin = identidad.isPresent() && identidad.get().esAdministrador();
        boolean esClienteVip = identidad.isPresent() && (esStaffAdmin || servicioVIP.esClienteFrecuente(identidad.get().idUsuario()));

        if (ruta.matches("^/api/(products|productos)/\\d+/(competencia|competition)/?$")) {
            int id = extraerIdRuta(ruta);
            if (id > 0) {
                List<Producto> competidores = dao.obtenerCompetenciaProducto(id, esClienteVip);
                enviarRespuestaJson(intercambio, 200, gson.toJson(competidores));
                return;
            }
        }

        if (ruta.matches("^/api/(products|productos)/\\d+/?$")) {
            int id = extraerIdRuta(ruta);
            if (id > 0) {
                Producto producto = dao.obtenerProductoPorId(id);
                if (producto != null) {
                    boolean esDuenio = identidad.isPresent() && identidad.get().idUsuario() == producto.getIdVendedor();
                    if (producto.isEsExclusivo() && !esClienteVip && !esDuenio) {
                        enviarRespuestaJson(intercambio, 403, "{\"error\":\"Tela exclusiva reservada para clientes frecuentes VIP.\"}");
                        return;
                    }
                    enviarRespuestaJson(intercambio, 200, gson.toJson(producto));
                } else {
                    enviarRespuestaJson(intercambio, 404, "{\"error\":\"Producto no encontrado\"}");
                }
                return;
            }
        }

        List<Producto> productos;
        int idVendedor = obtenerParametroConsultaEntero(intercambio, "sellerId", -1);
        if (idVendedor <= 0) {
            idVendedor = obtenerParametroConsultaEntero(intercambio, "idVendedor", -1);
        }

        String seccion = obtenerParametroConsulta(intercambio, "section");
        if (seccion == null) {
            seccion = obtenerParametroConsulta(intercambio, "seccion");
        }

        boolean esDuenioConsultando = identidad.isPresent() && idVendedor > 0 && identidad.get().idUsuario() == idVendedor;
        boolean puedeVerExclusivos = esClienteVip || esDuenioConsultando;

        int pagina = obtenerParametroConsultaEntero(intercambio, "page", -1);
        int limite = obtenerParametroConsultaEntero(intercambio, "limit", -1);

        if (ruta.endsWith("/pending") || ruta.endsWith("/pendientes")) {
            if (identidad.isEmpty() || (!identidad.get().esAdministrador() && !identidad.get().esVendedor())) {
                enviarRespuestaJson(intercambio, 403, "{\"error\":\"Acceso denegado: se requieren permisos de vendedor o administrador\"}");
                return;
            }
            productos = dao.obtenerProductosPendientes();
        } else if (pagina > 0 || limite > 0) {
            String categoria = obtenerParametroConsulta(intercambio, "categoria");
            if (categoria == null) categoria = obtenerParametroConsulta(intercambio, "category");
            String busqueda = obtenerParametroConsulta(intercambio, "busqueda");
            if (busqueda == null) busqueda = obtenerParametroConsulta(intercambio, "search");
            String orden = obtenerParametroConsulta(intercambio, "orden");
            if (orden == null) orden = obtenerParametroConsulta(intercambio, "sort");
            productos = dao.obtenerProductosPaginados(
                    pagina > 0 ? pagina : 1,
                    limite > 0 ? limite : 24,
                    categoria, busqueda, orden,
                    idVendedor > 0 ? idVendedor : null,
                    puedeVerExclusivos
            );
        } else if (idVendedor > 0) {
            productos = dao.obtenerProductosPorVendedor(idVendedor);
        } else if (seccion != null && !seccion.isBlank()) {
            productos = dao.obtenerProductosPorSeccion(seccion);
        } else {
            boolean incluirInactivos = esStaffAdmin && "true".equalsIgnoreCase(obtenerParametroConsulta(intercambio, "includeInactive"));
            productos = dao.obtenerTodosLosProductos(incluirInactivos);
        }

        if (!puedeVerExclusivos && productos != null) {
            productos = productos.stream().filter(p -> !p.isEsExclusivo()).toList();
        }
        enviarRespuestaJson(intercambio, 200, gson.toJson(productos));
    }

    /**
     * Procesa las actualizaciones `PUT` de moderación, imagen en Base64 o atributos del producto.
     *
     * @param intercambio Contexto HTTP (`HttpExchange`).
     * @param ruta        Ruta URI solicitada (`String`).
     * @param dao         Instancia de `ProductoDAO`.
     * @param gson        Serializador JSON (`Gson`).
     * @throws Exception Si ocurre un error en la actualización.
     */
    private void manejarPut(HttpExchange intercambio, String ruta, ProductoDAO dao, Gson gson) throws Exception {
        int idProducto = extraerIdRuta(ruta);
        if (idProducto <= 0) {
            enviarRespuestaJson(intercambio, 400, "{\"error\":\"ID de producto no válido en la ruta\"}");
            return;
        }

        var identidad = obtenerIdentidad(intercambio);
        if (identidad.isEmpty()) {
            enviarRespuestaJson(intercambio, 401, "{\"error\":\"Autenticación requerida\"}");
            return;
        }

        if (ruta.contains("/moderate") || ruta.contains("/moderar")) {
            if (!identidad.get().esAdministrador()) {
                enviarRespuestaJson(intercambio, 403, "{\"error\":\"Acceso denegado: solo los administradores pueden moderar productos\"}");
                return;
            }

            Producto existente = dao.obtenerProductoPorIdParaAuditoria(idProducto);
            if (existente == null) {
                enviarRespuestaJson(intercambio, 404, "{\"error\":\"Producto no encontrado\"}");
                return;
            }

            String cuerpo = new String(leerCuerpoSeguro(intercambio), StandardCharsets.UTF_8);
            JsonObject json = JsonParser.parseString(cuerpo).getAsJsonObject();
            String estadoRaw = (json.has("status") && !json.get("status").isJsonNull()) ? json.get("status").getAsString()
                          : ((json.has("estado") && !json.get("estado").isJsonNull()) ? json.get("estado").getAsString() : null);
            String estadoNorm = normalizarEstadoModeracion(estadoRaw);
            if (estadoNorm.isEmpty()) {
                enviarRespuestaJson(intercambio, 400, "{\"error\":\"Estado de moderación inválido o faltante\"}");
                return;
            }

            String motivo = json.has("reason") && !json.get("reason").isJsonNull() ? json.get("reason").getAsString().trim()
                          : (json.has("motivo") && !json.get("motivo").isJsonNull() ? json.get("motivo").getAsString().trim() : "");
            if (("changes_requested".equals(estadoNorm) || "rejected".equals(estadoNorm)) && motivo.isBlank()) {
                enviarRespuestaJson(intercambio, 400, "{\"error\":\"Debes especificar una observación real de auditoría para notificar al vendedor.\"}");
                return;
            }

            boolean exito = dao.actualizarEstadoModeracion(idProducto, estadoNorm, motivo.isBlank() ? null : motivo);
            if (!exito) {
                enviarRespuestaJson(intercambio, 500, "{\"error\":\"Error en moderación\"}");
                return;
            }

            String etiquetaEstado = obtenerEtiquetaEstadoModeracion(estadoNorm);
            String nombreAuditor = obtenerNombreUsuario(identidad.get().idUsuario());
            int alertaId = -1;
            if (existente.getIdVendedor() > 0) {
                String prefijoTitulo = switch (estadoNorm) {
                    case "changes_requested" -> "Auditoría: Cambios solicitados en ";
                    case "rejected" -> "Auditoría: Producto suspendido — ";
                    case "approved" -> "Auditoría aprobada: ";
                    default -> "Revisión administrativa: ";
                };
                String detalleMotivo = !motivo.isBlank()
                        ? " Observación de auditoría (" + nombreAuditor + "): " + motivo
                        : " Revisado por " + nombreAuditor + ". Precios e inventario permanecen intactos.";
                String mensajeAlerta = "Estado actual: " + etiquetaEstado + " en \"" + existente.getNombre() + "\"." + detalleMotivo;
                String sugerencia = ("changes_requested".equals(estadoNorm) || "rejected".equals(estadoNorm))
                        ? "revisar_auditoria" : "confirmar_lectura";
                alertaId = tiendaDAO.crearAlertaAdministrativa(
                        existente.getIdVendedor(),
                        idProducto,
                        "auditoria_admin",
                        prefijoTitulo + existente.getNombre(),
                        mensajeAlerta,
                        sugerencia
                );
            }

            ActividadReciente actividad = new ActividadReciente();
            actividad.setTipo("product_audit");
            actividad.setIdUsuario(identidad.get().idUsuario());
            actividad.setNombreUsuario(nombreAuditor);
            actividad.setAccion("Auditoría a \"" + existente.getNombre() + "\" -> " + etiquetaEstado
                    + (!motivo.isBlank() ? " (" + motivo + ")" : ""));
            inventarioDAO.agregarActividad(actividad);

            JsonObject resp = new JsonObject();
            resp.addProperty("success", true);
            resp.addProperty("productId", idProducto);
            resp.addProperty("status", estadoNorm);
            resp.addProperty("statusLabel", etiquetaEstado);
            resp.addProperty("alertSent", alertaId > 0);
            resp.addProperty("alertId", alertaId);
            resp.addProperty("sellerId", existente.getIdVendedor());
            enviarRespuestaJson(intercambio, 200, gson.toJson(resp));

        } else if (ruta.matches("^/api/(products|productos)/\\d+/image$") || ruta.matches("^/api/(products|productos)/\\d+/imagen$")) {
            Producto existente = dao.obtenerProductoPorIdParaAuditoria(idProducto);
            if (existente == null) {
                enviarRespuestaJson(intercambio, 404, "{\"error\":\"Producto no encontrado\"}");
                return;
            }
            boolean esAdmin = identidad.get().esAdministrador();
            boolean esDuenio = (identidad.get().idUsuario() == existente.getIdVendedor());
            if (!esAdmin && !esDuenio) {
                enviarRespuestaJson(intercambio, 403, "{\"error\":\"Acceso denegado: no tiene permisos para actualizar imágenes de este producto\"}");
                return;
            }

            String cuerpo = new String(leerCuerpoSeguro(intercambio), StandardCharsets.UTF_8);
            JsonObject json = JsonParser.parseString(cuerpo).getAsJsonObject();
            String imagenBase64 = null;
            if (json.has("image") && !json.get("image").isJsonNull()) {
                imagenBase64 = json.get("image").getAsString();
            } else if (json.has("imagen") && !json.get("imagen").isJsonNull()) {
                imagenBase64 = json.get("imagen").getAsString();
            }
            if (imagenBase64 == null || imagenBase64.isBlank()) {
                enviarRespuestaJson(intercambio, 400, "{\"error\":\"Falta el campo image o imagen\"}");
                return;
            }
            String urlGuardada = dao.guardarImagenProducto(idProducto, imagenBase64);

            if (urlGuardada != null) {
                enviarRespuestaJson(intercambio, 200, "{\"url\": \"" + urlGuardada + "\"}");
            } else {
                enviarRespuestaJson(intercambio, 500, "{\"error\":\"Error al guardar imagen\"}");
            }

        } else if (ruta.matches("^/api/(products|productos)/\\d+/?$")) {
            Producto existente = dao.obtenerProductoPorIdParaAuditoria(idProducto);
            if (existente == null) {
                enviarRespuestaJson(intercambio, 404, "{\"error\":\"Producto no encontrado\"}");
                return;
            }
            boolean esAdmin = identidad.get().esAdministrador();
            boolean esDuenio = (identidad.get().idUsuario() == existente.getIdVendedor());
            if (!esDuenio) {
                if (esAdmin) {
                    enviarRespuestaJson(intercambio, 403,
                            "{\"error\":\"Acceso de solo lectura: el administrador no puede modificar precios, descuentos ni inventario de un vendedor externo. Use /moderar para auditar.\"}");
                    return;
                }
                enviarRespuestaJson(intercambio, 403, "{\"error\":\"Acceso denegado: no tiene permisos para modificar este producto\"}");
                return;
            }

            String cuerpo = new String(leerCuerpoSeguro(intercambio), StandardCharsets.UTF_8);
            JsonObject json = JsonParser.parseString(cuerpo).getAsJsonObject();
            Producto actualizaciones = gson.fromJson(json, Producto.class);

            Boolean destacado = extraerBooleano(json, "featured", "destacado");
            Boolean esNueva = extraerBooleano(json, "isNewCollection", "esNuevaColeccion");
            Boolean esExclusivo = extraerBooleano(json, "isExclusive", "esExclusivo");
            Boolean esOferta = extraerBooleano(json, "isOffer", "esOferta", "isSale");
            Double descuentoExplicito = extraerDouble(json, "discountPercent", "porcentajeDescuento");
            if (descuentoExplicito != null) {
                descuentoExplicito = Math.max(0.0, Math.min(90.0, descuentoExplicito));
                if (esOferta == null) {
                    esOferta = descuentoExplicito > 0.0;
                }
            }
            Double stockExplicito = extraerDouble(json, "stock", "existencias");

            boolean exito = dao.actualizarProductoSelectivo(
                    idProducto, actualizaciones, destacado, esNueva, esExclusivo, esOferta, stockExplicito, descuentoExplicito
            );
            if (exito) {
                try {
                    if (stockExplicito != null) {
                        infraestructura.api.websocket.ServidorWebSocket.transmitirStock(idProducto, stockExplicito);
                    }
                    if (esOferta != null) {
                        infraestructura.api.websocket.ServidorWebSocket.transmitir("OFERTA_ACTUALIZADA", java.util.Map.of("idProducto", idProducto, "esOferta", esOferta));
                    }
                } catch (RuntimeException ignored) {}
            }
            if (exito && stockExplicito != null && stockExplicito <= 20.0) {
                try {
                    String correoAlerta = ConfiguracionEntorno.obtener("SMTP_FROM", "bodega@ddtextil.com");
                    String nombreVendedor = existente.getNombreVendedor() != null ? existente.getNombreVendedor() : "Responsable de Bodega";
                    String nombreTela = actualizaciones.getNombre() != null ? actualizaciones.getNombre() : existente.getNombre();
                    servicioNotificaciones.enviarAlertaStockCritico(correoAlerta, nombreVendedor, nombreTela, stockExplicito);
                } catch (RuntimeException ignored) {}
            }
            enviarRespuestaJson(intercambio, exito ? 200 : 404, exito ? "{\"success\":true}" : "{\"error\":\"Producto no encontrado\"}");

        } else {
            enviarRespuestaJson(intercambio, 404, "{\"error\":\"Ruta no encontrada\"}");
        }
    }

    /**
     * Crea un nuevo producto en PostgreSQL y retorna su identificador generado.
     *
     * @param intercambio Contexto HTTP (`HttpExchange`).
     * @param dao         Instancia de `ProductoDAO`.
     * @param gson        Serializador JSON (`Gson`).
     * @throws Exception Si falla la inserción.
     */
    private void manejarPost(HttpExchange intercambio, ProductoDAO dao, Gson gson) throws Exception {
        var identidad = obtenerIdentidad(intercambio);
        if (identidad.isEmpty()) {
            enviarRespuestaJson(intercambio, 401, "{\"error\":\"Autenticación requerida\"}");
            return;
        }
        if (!identidad.get().esAdministrador() && !identidad.get().esVendedor()) {
            enviarRespuestaJson(intercambio, 403, "{\"error\":\"Acceso denegado: solo vendedores o administradores pueden publicar productos\"}");
            return;
        }

        String cuerpo = new String(leerCuerpoSeguro(intercambio), StandardCharsets.UTF_8);
        Producto nuevoProducto = gson.fromJson(cuerpo, Producto.class);
        if (nuevoProducto == null || nuevoProducto.getNombre() == null || nuevoProducto.getNombre().isBlank()
                || nuevoProducto.getPrecio() <= 0 || nuevoProducto.getExistencias() < 0) {
            enviarRespuestaJson(intercambio, 400, "{\"error\":\"Nombre, precio mayor a cero y stock no negativo son obligatorios\"}");
            return;
        }

        if (!identidad.get().esAdministrador()) {
            nuevoProducto.setIdVendedor(identidad.get().idUsuario());
        } else if (nuevoProducto.getIdVendedor() <= 0) {
            nuevoProducto.setIdVendedor(identidad.get().idUsuario());
        }
        if (nuevoProducto.getEstadoModeracion() == null || nuevoProducto.getEstadoModeracion().isBlank()) {
            nuevoProducto.setEstadoModeracion("approved");
        }
        if (nuevoProducto.getPorcentajeDescuento() > 0) {
            nuevoProducto.setEsOferta(true);
        }

        boolean exito = dao.agregarProducto(nuevoProducto);
        if (exito) {
            infraestructura.api.websocket.ServidorWebSocket.transmitir("NUEVO_PRODUCTO", java.util.Map.of(
                    "id", nuevoProducto.getId(),
                    "nombre", nuevoProducto.getNombre(),
                    "precio", nuevoProducto.getPrecio(),
                    "stock", nuevoProducto.getExistencias()
            ));
            JsonObject resp = new JsonObject();
            resp.addProperty("success", true);
            resp.addProperty("id", nuevoProducto.getId());
            resp.add("product", gson.toJsonTree(nuevoProducto));
            enviarRespuestaJson(intercambio, 201, gson.toJson(resp));
        } else {
            enviarRespuestaJson(intercambio, 500, "{\"error\":\"Error al insertar producto\"}");
        }
    }

    /**
     * Desactiva lógicamente un producto existente por su identificador en la ruta.
     *
     * @param intercambio Contexto HTTP (`HttpExchange`).
     * @param ruta        Ruta URI solicitada (`String`).
     * @param dao         Instancia de `ProductoDAO`.
     * @throws Exception Si falla el borrado lógico.
     */
    private void manejarDelete(HttpExchange intercambio, String ruta, ProductoDAO dao) throws Exception {
        var identidad = obtenerIdentidad(intercambio);
        if (identidad.isEmpty()) {
            enviarRespuestaJson(intercambio, 401, "{\"error\":\"Autenticación requerida\"}");
            return;
        }

        int idProducto = extraerIdRuta(ruta);
        if (idProducto > 0) {
            Producto existente = dao.obtenerProductoPorId(idProducto);
            if (existente == null) {
                enviarRespuestaJson(intercambio, 404, "{\"error\":\"Producto no encontrado\"}");
                return;
            }
            boolean esAdmin = identidad.get().esAdministrador();
            boolean esDuenio = (identidad.get().idUsuario() == existente.getIdVendedor());
            if (!esAdmin && !esDuenio) {
                enviarRespuestaJson(intercambio, 403, "{\"error\":\"Acceso denegado: no tiene permisos para eliminar este producto\"}");
                return;
            }
            boolean exito = dao.eliminarProducto(idProducto);
            enviarRespuestaJson(intercambio, exito ? 200 : 404, exito ? "{\"success\":true}" : "{\"error\":\"Producto no encontrado\"}");
        } else {
            enviarRespuestaJson(intercambio, 404, "{\"error\":\"Ruta no encontrada\"}");
        }
    }

    private static Boolean extraerBooleano(JsonObject json, String... claves) {
        if (json == null) return null;
        for (String clave : claves) {
            if (json.has(clave) && !json.get(clave).isJsonNull()) {
                try {
                    return Boolean.valueOf(json.get(clave).getAsBoolean());
                } catch (UnsupportedOperationException | IllegalStateException | ClassCastException ignored) {}
            }
        }
        return null;
    }

    private static Double extraerDouble(JsonObject json, String... claves) {
        if (json == null) return null;
        for (String clave : claves) {
            if (json.has(clave) && !json.get(clave).isJsonNull()) {
                try {
                    return Double.valueOf(json.get(clave).getAsDouble());
                } catch (NumberFormatException | UnsupportedOperationException | IllegalStateException | ClassCastException ignored) {}
            }
        }
        return null;
    }
}
