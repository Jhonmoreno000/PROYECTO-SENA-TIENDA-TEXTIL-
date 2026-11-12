package infraestructura.api.manejadores;

import aplicacion.servicios.ServicioAutenticacion;
import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.sun.net.httpserver.HttpExchange;
import dominio.modelos.Usuario;
import dominio.repositorios.RepositorioUsuario;
import infraestructura.persistencia.jdbc.JdbcRepositorioUsuarioImpl;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Controlador HTTP para la gestión administrativa, perfil, comisiones y libreta de direcciones de usuarios.
 * Rutas base: `/api/users` y `/api/usuarios`.
 */
public class ManejadorUsuarios extends ManejadorBase {
    /** Repositorio de dominio para operaciones sobre usuarios (`RepositorioUsuario`). */
    private final RepositorioUsuario repositorioUsuario;
    /** Implementación JDBC para operaciones extendidas de perfil y direcciones (`JdbcRepositorioUsuarioImpl`). */
    private final JdbcRepositorioUsuarioImpl usuarioJdbc;
    /** Serializador JSON (`Gson`). */
    private final Gson gson;

    /**
     * Constructor por defecto que inicializa el repositorio JDBC de usuarios.
     */
    public ManejadorUsuarios() {
        this(new JdbcRepositorioUsuarioImpl());
    }

    /**
     * Constructor con inyección de dependencias para el repositorio de usuarios.
     *
     * @param repositorioUsuario Repositorio de usuarios desacoplado (`RepositorioUsuario`).
     */
    public ManejadorUsuarios(RepositorioUsuario repositorioUsuario) {
        this.repositorioUsuario = repositorioUsuario;
        this.usuarioJdbc = (repositorioUsuario instanceof JdbcRepositorioUsuarioImpl)
                ? (JdbcRepositorioUsuarioImpl) repositorioUsuario
                : new JdbcRepositorioUsuarioImpl();
        this.gson = new Gson();
    }

    /**
     * Enruta las solicitudes `GET`, `POST`, `PUT` y `DELETE` sobre usuarios y sus direcciones de envío.
     *
     * @param intercambio Contexto de la petición HTTP (`HttpExchange`).
     * @throws Exception Si ocurre un error durante el procesamiento.
     */
    @Override
    protected void procesarPeticion(HttpExchange intercambio) throws Exception {
        String metodo = intercambio.getRequestMethod();
        String ruta = intercambio.getRequestURI().getPath();

        if (ruta.contains("/direcciones") || ruta.contains("/addresses")) {
            manejarDirecciones(intercambio, metodo, ruta);
            return;
        }

        if ("GET".equalsIgnoreCase(metodo)) {
            var identidad = obtenerIdentidad(intercambio);
            if (ruta.matches("^/api/(users|usuarios)/\\d+/?$")) {
                int idUsuario = extraerIdRuta(ruta);
                if (identidad.isEmpty()) {
                    enviarRespuestaJson(intercambio, 401, "{\"error\":\"Autenticación requerida\"}");
                    return;
                }
                if (!identidad.get().esAdministrador() && identidad.get().idUsuario() != idUsuario) {
                    enviarRespuestaJson(intercambio, 403, "{\"error\":\"Acceso denegado: no autorizado para consultar este perfil\"}");
                    return;
                }
                for (Usuario u : repositorioUsuario.obtenerTodosLosUsuarios()) {
                    if (u.getId() == idUsuario) {
                        enviarRespuestaJson(intercambio, 200, gson.toJson(u));
                        return;
                    }
                }
                enviarRespuestaJson(intercambio, 404, "{\"error\":\"Usuario no encontrado\"}");
                return;
            }

            if (identidad.isEmpty()) {
                enviarRespuestaJson(intercambio, 401, "{\"error\":\"Autenticación requerida\"}");
                return;
            }
            if (!identidad.get().esAdministrador()) {
                enviarRespuestaJson(intercambio, 403, "{\"error\":\"Se requieren permisos de administrador\"}");
                return;
            }
            List<Usuario> usuarios = repositorioUsuario.obtenerTodosLosUsuarios();
            enviarRespuestaJson(intercambio, 200, gson.toJson(usuarios));

        } else if ("PUT".equalsIgnoreCase(metodo)) {
            var identidad = obtenerIdentidad(intercambio);
            if (identidad.isEmpty()) {
                enviarRespuestaJson(intercambio, 401, "{\"error\":\"Autenticación requerida\"}");
                return;
            }
            int idUsuario = extraerIdRuta(ruta);

            if (idUsuario <= 0) {
                enviarRespuestaJson(intercambio, 400, "{\"error\":\"Identificador de usuario inválido en la ruta\"}");
                return;
            }

            boolean esAdmin = identidad.get().esAdministrador();
            boolean esPropioUsuario = (identidad.get().idUsuario() == idUsuario);

            if (!esAdmin && !esPropioUsuario) {
                enviarRespuestaJson(intercambio, 403, "{\"error\":\"Acceso denegado: no autorizado para modificar este perfil\"}");
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

            boolean exito = false;

            if (esAdmin) {
                if (ruta.contains("/rol") || ruta.contains("/role") || objetoJson.has("role") || objetoJson.has("rol")) {
                    String nuevoRol = extraerTexto(objetoJson, "role", extraerTexto(objetoJson, "rol", null));
                    if (nuevoRol == null || !java.util.Set.of("cliente", "vendedor", "administrador").contains(nuevoRol.trim().toLowerCase())) {
                        enviarRespuestaJson(intercambio, 400, "{\"error\":\"Rol inválido. Valores permitidos: cliente, vendedor, administrador\"}");
                        return;
                    }
                    exito = repositorioUsuario.actualizarRolUsuario(idUsuario, nuevoRol.trim().toLowerCase());
                }

                if (ruta.contains("/estado") || ruta.contains("/status") || objetoJson.has("active") || objetoJson.has("activo")) {
                    boolean nuevoEstado = objetoJson.has("active") && !objetoJson.get("active").isJsonNull()
                            ? objetoJson.get("active").getAsBoolean()
                            : (objetoJson.has("activo") && !objetoJson.get("activo").isJsonNull() ? objetoJson.get("activo").getAsBoolean() : true);
                    exito = repositorioUsuario.actualizarEstadoUsuario(idUsuario, nuevoEstado) || exito;
                }
            } else {
                if (ruta.contains("/rol") || ruta.contains("/role") || objetoJson.has("role") || objetoJson.has("rol")
                        || objetoJson.has("suspended") || objetoJson.has("suspendido")
                        || objetoJson.has("commissionRate") || objetoJson.has("tasaComision")) {
                    enviarRespuestaJson(intercambio, 403, "{\"error\":\"Permisos insuficientes para modificar roles o estado del sistema\"}");
                    return;
                }
            }

            Boolean suspendido = null;
            String motivoSuspension = null;
            Double comision = null;

            if (esAdmin) {
                if (objetoJson.has("suspended") && !objetoJson.get("suspended").isJsonNull()) {
                    suspendido = objetoJson.get("suspended").getAsBoolean();
                } else if (objetoJson.has("suspendido") && !objetoJson.get("suspendido").isJsonNull()) {
                    suspendido = objetoJson.get("suspendido").getAsBoolean();
                }
                motivoSuspension = extraerTexto(objetoJson, "suspensionReason", extraerTexto(objetoJson, "motivoSuspension", null));

                if (objetoJson.has("commissionRate") && !objetoJson.get("commissionRate").isJsonNull()) {
                    comision = objetoJson.get("commissionRate").getAsDouble();
                } else if (objetoJson.has("tasaComision") && !objetoJson.get("tasaComision").isJsonNull()) {
                    comision = objetoJson.get("tasaComision").getAsDouble();
                } else if (objetoJson.has("porcentajeComision") && !objetoJson.get("porcentajeComision").isJsonNull()) {
                    comision = objetoJson.get("porcentajeComision").getAsDouble();
                }
            }

            String nombre = extraerTexto(objetoJson, "name", extraerTexto(objetoJson, "nombre", null));
            String correo = extraerTexto(objetoJson, "email", extraerTexto(objetoJson, "correo", null));
            String telefono = extraerTexto(objetoJson, "phone", extraerTexto(objetoJson, "telefono", null));
            String nuevaContrasena = extraerTexto(objetoJson, "password", extraerTexto(objetoJson, "contrasena", null));
            String hashContrasena = null;
            if (nuevaContrasena != null && !nuevaContrasena.isBlank()) {
                hashContrasena = ServicioAutenticacion.generarHashPBKDF2(nuevaContrasena.trim());
            }

            if (nombre != null || correo != null || telefono != null || suspendido != null
                    || motivoSuspension != null || comision != null || hashContrasena != null) {
                exito = usuarioJdbc.actualizarUsuarioCompleto(
                        idUsuario, nombre, correo, telefono, null, null,
                        suspendido, motivoSuspension, comision, hashContrasena
                ) || exito;
            }

            if (exito) {
                enviarRespuestaJson(intercambio, 200, "{\"success\":true}");
            } else {
                enviarRespuestaJson(intercambio, 500, "{\"error\":\"No se pudo actualizar el usuario\"}");
            }

        } else if ("DELETE".equalsIgnoreCase(metodo)) {
            var identidad = obtenerIdentidad(intercambio);
            if (identidad.isEmpty()) {
                enviarRespuestaJson(intercambio, 401, "{\"error\":\"Autenticación requerida\"}");
                return;
            }
            if (!identidad.get().esAdministrador()) {
                enviarRespuestaJson(intercambio, 403, "{\"error\":\"Se requieren permisos de administrador\"}");
                return;
            }
            int idUsuario = extraerIdRuta(ruta);
            if (idUsuario <= 0) {
                enviarRespuestaJson(intercambio, 400, "{\"error\":\"Identificador de usuario inválido en la ruta\"}");
                return;
            }
            boolean exito = usuarioJdbc.eliminarUsuario(idUsuario);
            enviarRespuestaJson(intercambio, exito ? 200 : 404, exito ? "{\"success\":true}" : "{\"error\":\"Usuario no encontrado\"}");

        } else {
            enviarRespuestaJson(intercambio, 405, "{\"error\":\"Método no permitido\"}");
        }
    }

    /**
     * Gestiona las operaciones CRUD sobre la libreta de direcciones de un usuario (`/api/usuarios/{id}/direcciones`).
     *
     * @param intercambio Contexto HTTP (`HttpExchange`).
     * @param metodo      Método HTTP de la petición (`String`).
     * @param ruta        Ruta URI solicitada (`String`).
     * @throws Exception Si ocurre un error en la persistencia o serialización.
     */
    private void manejarDirecciones(HttpExchange intercambio, String metodo, String ruta) throws Exception {
        int[] ids = extraerIdsRuta(ruta);
        int idUsuario = ids[0];
        int idDireccion = ids[1];

        if (idUsuario <= 0) {
            enviarRespuestaJson(intercambio, 400, "{\"error\":\"Identificador de usuario inválido\"}");
            return;
        }

        var identidad = obtenerIdentidad(intercambio);
        if (identidad.isEmpty()) {
            enviarRespuestaJson(intercambio, 401, "{\"error\":\"Autenticación requerida\"}");
            return;
        }
        if (!identidad.get().esAdministrador() && identidad.get().idUsuario() != idUsuario) {
            enviarRespuestaJson(intercambio, 403, "{\"error\":\"Acceso denegado: no autorizado para gestionar las direcciones de este usuario\"}");
            return;
        }

        if ("GET".equalsIgnoreCase(metodo)) {
            List<Map<String, Object>> direcciones = usuarioJdbc.obtenerDireccionesUsuario(idUsuario);
            enviarRespuestaJson(intercambio, 200, gson.toJson(direcciones));

        } else if ("POST".equalsIgnoreCase(metodo)) {
            String cuerpo = new String(leerCuerpoSeguro(intercambio), StandardCharsets.UTF_8);
            JsonObject json = JsonParser.parseString(cuerpo).getAsJsonObject();
            String direccion = extraerTexto(json, "address", extraerTexto(json, "direccion", ""));
            if (direccion == null || direccion.isBlank()) {
                enviarRespuestaJson(intercambio, 400, "{\"error\":\"La dirección es obligatoria\"}");
                return;
            }

            Map<String, Object> datos = new HashMap<>();
            datos.put("label", extraerTexto(json, "label", extraerTexto(json, "etiqueta", "Casa")));
            datos.put("recipientName", extraerTexto(json, "recipientName", extraerTexto(json, "nombreDestinatario", null)));
            datos.put("phone", extraerTexto(json, "phone", extraerTexto(json, "telefono", null)));
            datos.put("address", direccion);
            datos.put("city", extraerTexto(json, "city", extraerTexto(json, "ciudad", "")));
            datos.put("department", extraerTexto(json, "department", extraerTexto(json, "departamento", "")));
            datos.put("postalCode", extraerTexto(json, "postalCode", extraerTexto(json, "codigoPostal", "")));
            boolean predeterminada = (json.has("isDefault") && !json.get("isDefault").isJsonNull() && json.get("isDefault").getAsBoolean())
                    || (json.has("predeterminada") && !json.get("predeterminada").isJsonNull() && json.get("predeterminada").getAsBoolean());
            datos.put("isDefault", predeterminada);

            int nuevoId = usuarioJdbc.agregarDireccionUsuario(idUsuario, datos);
            if (nuevoId > 0) {
                datos.put("id", nuevoId);
                datos.put("userId", idUsuario);
                enviarRespuestaJson(intercambio, 201, gson.toJson(datos));
            } else {
                enviarRespuestaJson(intercambio, 500, "{\"error\":\"No se pudo guardar la dirección\"}");
            }

        } else if ("PUT".equalsIgnoreCase(metodo)) {
            if (idDireccion <= 0) {
                enviarRespuestaJson(intercambio, 400, "{\"error\":\"Identificador de dirección inválido\"}");
                return;
            }
            String cuerpo = new String(leerCuerpoSeguro(intercambio), StandardCharsets.UTF_8);
            JsonObject json = JsonParser.parseString(cuerpo).getAsJsonObject();
            Map<String, Object> datos = new HashMap<>();
            if (json.has("label") || json.has("etiqueta")) {
                datos.put("label", extraerTexto(json, "label", extraerTexto(json, "etiqueta", null)));
            }
            if (json.has("recipientName") || json.has("nombreDestinatario")) {
                datos.put("recipientName", extraerTexto(json, "recipientName", extraerTexto(json, "nombreDestinatario", null)));
            }
            if (json.has("phone") || json.has("telefono")) {
                datos.put("phone", extraerTexto(json, "phone", extraerTexto(json, "telefono", null)));
            }
            if (json.has("address") || json.has("direccion")) {
                datos.put("address", extraerTexto(json, "address", extraerTexto(json, "direccion", null)));
            }
            if (json.has("city") || json.has("ciudad")) {
                datos.put("city", extraerTexto(json, "city", extraerTexto(json, "ciudad", null)));
            }
            if (json.has("department") || json.has("departamento")) {
                datos.put("department", extraerTexto(json, "department", extraerTexto(json, "departamento", null)));
            }
            if (json.has("postalCode") || json.has("codigoPostal")) {
                datos.put("postalCode", extraerTexto(json, "postalCode", extraerTexto(json, "codigoPostal", null)));
            }
            if (json.has("isDefault") && !json.get("isDefault").isJsonNull()) {
                datos.put("isDefault", json.get("isDefault").getAsBoolean());
            } else if (json.has("predeterminada") && !json.get("predeterminada").isJsonNull()) {
                datos.put("isDefault", json.get("predeterminada").getAsBoolean());
            }

            boolean exito = usuarioJdbc.actualizarDireccionUsuario(idUsuario, idDireccion, datos);
            enviarRespuestaJson(intercambio, exito ? 200 : 404, exito ? "{\"success\":true}" : "{\"error\":\"Dirección no encontrada\"}");

        } else if ("DELETE".equalsIgnoreCase(metodo)) {
            if (idDireccion <= 0) {
                enviarRespuestaJson(intercambio, 400, "{\"error\":\"Identificador de dirección inválido\"}");
                return;
            }
            boolean exito = usuarioJdbc.eliminarDireccionUsuario(idUsuario, idDireccion);
            enviarRespuestaJson(intercambio, exito ? 200 : 404, exito ? "{\"success\":true}" : "{\"error\":\"Dirección no encontrada\"}");
        } else {
            enviarRespuestaJson(intercambio, 405, "{\"error\":\"Método no permitido\"}");
        }
    }

    /**
     * Extrae hasta dos identificadores numéricos presentes en los segmentos de una ruta URI.
     *
     * @param ruta Ruta URI a analizar (`String`).
     * @return Arreglo de dos enteros `[primerId, segundoId]`.
     */
    private int[] extraerIdsRuta(String ruta) {
        int[] resultado = new int[]{-1, -1};
        if (ruta == null) return resultado;
        int indice = 0;
        for (String segmento : ruta.split("/")) {
            if (segmento.matches("\\d+") && indice < 2) {
                try {
                    resultado[indice++] = Integer.parseInt(segmento);
                } catch (NumberFormatException ignored) {}
            }
        }
        return resultado;
    }

    /**
     * Extrae una propiedad de texto de un objeto JSON o devuelve el valor por defecto.
     *
     * @param obj          Objeto JSON (`JsonObject`).
     * @param clave        Clave buscada (`String`).
     * @param valorDefecto Valor de respaldo (`String`).
     * @return Cadena extraída o `valorDefecto`.
     */
    private String extraerTexto(JsonObject obj, String clave, String valorDefecto) {
        if (obj != null && obj.has(clave) && !obj.get(clave).isJsonNull()) {
            return obj.get(clave).getAsString();
        }
        return valorDefecto;
    }
}
