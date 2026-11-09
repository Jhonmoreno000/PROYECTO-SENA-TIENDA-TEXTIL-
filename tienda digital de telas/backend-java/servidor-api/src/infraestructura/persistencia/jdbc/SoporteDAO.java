package infraestructura.persistencia.jdbc;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.sql.Types;
import java.util.ArrayList;
import java.util.List;

import infraestructura.configuracion.Conexion;
import dominio.modelos.ReporteError;
import dominio.modelos.TicketSoporte;

/**
 * DAO para el módulo de soporte al cliente y reportes de errores o novedades.
 * Opera sobre las tablas `tickets_soporte` y `reportes_errores` en PostgreSQL.
 */
public class SoporteDAO {

    /**
     * Construye una nueva instancia del DAO de soporte.
     */
    public SoporteDAO() {}

    /**
     * Recupera todos los tickets de soporte uniendo información del usuario solicitante.
     *
     * @return Lista (`List<TicketSoporte>`) ordenada del más reciente al más antiguo.
     */
    public List<TicketSoporte> obtenerTodosLosTickets() {
        List<TicketSoporte> lista = new ArrayList<>();
        String consulta = "SELECT t.*, u.nombre AS u_nombre, u.correo AS u_correo " +
                          "FROM tickets_soporte t " +
                          "LEFT JOIN usuarios u ON t.usuario_id = u.id " +
                          "ORDER BY t.id DESC";

        try (Connection con = Conexion.obtenerConexion();
             PreparedStatement pst = con.prepareStatement(consulta);
             ResultSet rs = pst.executeQuery()) {

            while (rs.next()) {
                TicketSoporte t = new TicketSoporte();
                t.setId(rs.getInt("id"));
                t.setIdCliente((Integer) rs.getObject("usuario_id"));
                t.setIdPedido((Integer) rs.getObject("pedido_id"));
                String nombre = rs.getString("nombre_usuario");
                if (nombre == null || nombre.isBlank()) {
                    nombre = rs.getString("u_nombre");
                }
                String correo = rs.getString("correo_usuario");
                if (correo == null || correo.isBlank()) {
                    correo = rs.getString("u_correo");
                }
                t.setNombreCliente(nombre);
                t.setCorreoCliente(correo);
                t.setCategoria(rs.getString("categoria"));
                t.setAsunto(rs.getString("asunto"));
                t.setDescripcion(rs.getString("descripcion"));
                t.setEstado(rs.getString("estado"));
                t.setPrioridad(rs.getString("prioridad"));
                t.setAsignadoA((Integer) rs.getObject("asignado_a"));

                if (rs.getTimestamp("creado_en") != null) {
                    t.setFechaCreacion(rs.getTimestamp("creado_en").toString());
                }
                if (rs.getTimestamp("actualizado_en") != null) {
                    t.setFechaModificacion(rs.getTimestamp("actualizado_en").toString());
                }
                if (rs.getTimestamp("resuelto_en") != null) {
                    t.setFechaResolucion(rs.getTimestamp("resuelto_en").toString());
                }

                lista.add(t);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return lista;
    }

    /**
     * Inserta un nuevo ticket de soporte en la base de datos y asigna el identificador generado.
     *
     * @param t Entidad {@link TicketSoporte} a registrar.
     * @return `true` si fue insertado exitosamente; `false` en caso de error.
     */
    public boolean agregarTicket(TicketSoporte t) {
        String consulta = "INSERT INTO tickets_soporte (usuario_id, pedido_id, nombre_usuario, correo_usuario, categoria, asunto, descripcion, estado, prioridad, asignado_a) " +
                          "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        try (Connection con = Conexion.obtenerConexion()) {
            String nombreCliente = t.getNombreCliente();
            String correoCliente = t.getCorreoCliente();

            if (t.getIdCliente() != null && t.getIdCliente() > 0 && (nombreCliente == null || correoCliente == null)) {
                try (PreparedStatement pstU = con.prepareStatement("SELECT nombre, correo FROM usuarios WHERE id = ?")) {
                    pstU.setInt(1, t.getIdCliente());
                    try (ResultSet rsU = pstU.executeQuery()) {
                        if (rsU.next()) {
                            if (nombreCliente == null || nombreCliente.isBlank()) nombreCliente = rsU.getString("nombre");
                            if (correoCliente == null || correoCliente.isBlank()) correoCliente = rsU.getString("correo");
                        }
                    }
                }
            }

            try (PreparedStatement pst = con.prepareStatement(consulta, Statement.RETURN_GENERATED_KEYS)) {
                if (t.getIdCliente() != null && t.getIdCliente() > 0) pst.setInt(1, t.getIdCliente()); else pst.setNull(1, Types.INTEGER);
                if (t.getIdPedido() != null && t.getIdPedido() > 0) pst.setInt(2, t.getIdPedido()); else pst.setNull(2, Types.INTEGER);
                pst.setString(3, nombreCliente);
                pst.setString(4, correoCliente);
                pst.setString(5, t.getCategoria() != null ? t.getCategoria() : "general");
                pst.setString(6, t.getAsunto() != null ? t.getAsunto() : "Consulta de soporte");
                pst.setString(7, t.getDescripcion() != null ? t.getDescripcion() : "");
                pst.setString(8, t.getEstado() != null ? t.getEstado() : "open");
                pst.setString(9, t.getPrioridad() != null ? t.getPrioridad() : "medium");
                if (t.getAsignadoA() != null && t.getAsignadoA() > 0) pst.setInt(10, t.getAsignadoA()); else pst.setNull(10, Types.INTEGER);

                int filas = pst.executeUpdate();
                if (filas > 0) {
                    try (ResultSet rs = pst.getGeneratedKeys()) {
                        if (rs.next()) {
                            t.setId(rs.getInt(1));
                        }
                    }
                    return true;
                }
                return false;
            }
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    /**
     * Actualiza el estado de un ticket de soporte.
     *
     * @param idTicket Identificador del ticket (`int`).
     * @param estado Nuevo estado (`String`).
     * @return `true` si se actualizó el ticket; `false` en caso contrario.
     */
    public boolean actualizarEstadoTicket(int idTicket, String estado) {
        return actualizarTicket(idTicket, estado, null, null);
    }

    /**
     * Actualiza estado, prioridad y agente asignado de un ticket de soporte de forma selectiva.
     *
     * @param idTicket Identificador del ticket (`int`).
     * @param estado Nuevo estado (`String`) o `null` para mantener el actual.
     * @param prioridad Nueva prioridad (`String`) o `null` para mantener la actual.
     * @param asignadoA Identificador del usuario asignado (`Integer`) o `null`.
     * @return `true` si se actualizó el registro; `false` en caso de error.
     */
    public boolean actualizarTicket(int idTicket, String estado, String prioridad, Integer asignadoA) {
        boolean resuelto = "resolved".equalsIgnoreCase(estado) || "resuelto".equalsIgnoreCase(estado) || "closed".equalsIgnoreCase(estado);
        String consulta = "UPDATE tickets_soporte SET " +
                          "estado = COALESCE(?, estado), " +
                          "prioridad = COALESCE(?, prioridad), " +
                          "asignado_a = COALESCE(?, asignado_a), " +
                          "actualizado_en = CURRENT_TIMESTAMP" +
                          (resuelto ? ", resuelto_en = CURRENT_TIMESTAMP " : " ") +
                          "WHERE id = ?";
        try (Connection con = Conexion.obtenerConexion();
             PreparedStatement pst = con.prepareStatement(consulta)) {
            pst.setString(1, estado);
            pst.setString(2, prioridad);
            if (asignadoA != null && asignadoA > 0) pst.setInt(3, asignadoA); else pst.setNull(3, Types.INTEGER);
            pst.setInt(4, idTicket);
            return pst.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    /**
     * Recupera todos los reportes de errores o novedades registrados en la plataforma.
     *
     * @return Lista (`List<ReporteError>`) ordenada por identificador descendente.
     */
    public List<ReporteError> obtenerTodosLosReportesError() {
        List<ReporteError> lista = new ArrayList<>();
        String consulta = "SELECT r.*, u.nombre AS u_nombre, u.correo AS u_correo, p.nombre AS p_nombre " +
                          "FROM reportes_errores r " +
                          "LEFT JOIN usuarios u ON r.vendedor_id = u.id " +
                          "LEFT JOIN productos p ON r.producto_id = p.id " +
                          "ORDER BY r.id DESC";

        try (Connection con = Conexion.obtenerConexion();
             PreparedStatement pst = con.prepareStatement(consulta);
             ResultSet rs = pst.executeQuery()) {

            while (rs.next()) {
                ReporteError reporte = new ReporteError();
                reporte.setId(rs.getInt("id"));
                reporte.setIdVendedor((Integer) rs.getObject("vendedor_id"));
                String nombreVendedor = rs.getString("nombre_vendedor");
                if (nombreVendedor == null || nombreVendedor.isBlank()) {
                    nombreVendedor = rs.getString("u_nombre");
                }
                reporte.setNombreVendedor(nombreVendedor);
                String correo = rs.getString("correo_reportante");
                if (correo == null || correo.isBlank()) {
                    correo = rs.getString("u_correo");
                }
                reporte.setCorreo(correo);
                reporte.setIdProducto((Integer) rs.getObject("producto_id"));
                String nombreProd = rs.getString("nombre_producto");
                if (nombreProd == null || nombreProd.isBlank()) {
                    nombreProd = rs.getString("p_nombre");
                }
                reporte.setNombreProducto(nombreProd);
                String areaReporte = rs.getString("area");
                String tituloReporte = rs.getString("titulo");
                reporte.setArea(areaReporte != null ? areaReporte : tituloReporte);
                reporte.setTitulo(tituloReporte != null ? tituloReporte : areaReporte);
                reporte.setDescripcion(rs.getString("descripcion"));
                reporte.setPasos(rs.getString("pasos"));
                reporte.setEstado(rs.getString("estado"));
                String prioridadReporte = rs.getString("prioridad");
                String severidadReporte = rs.getString("severidad");
                reporte.setPrioridad(prioridadReporte != null ? prioridadReporte : severidadReporte);
                reporte.setSeveridad(severidadReporte != null ? severidadReporte : prioridadReporte);
                reporte.setAsignadoA((Integer) rs.getObject("asignado_a"));

                if (rs.getTimestamp("reportado_en") != null) {
                    reporte.setFechaReporte(rs.getTimestamp("reportado_en").toString());
                }
                if (rs.getTimestamp("resuelto_en") != null) {
                    reporte.setFechaResolucion(rs.getTimestamp("resuelto_en").toString());
                }

                lista.add(reporte);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return lista;
    }

    /**
     * Inserta un nuevo reporte de error o novedad en la base de datos y asigna su identificador generado.
     *
     * @param reporte Entidad {@link ReporteError} a almacenar.
     * @return `true` si se insertó correctamente; `false` en caso de error.
     */
    public boolean agregarReporteError(ReporteError reporte) {
        String consulta = "INSERT INTO reportes_errores (vendedor_id, nombre_vendedor, correo_reportante, titulo, area, severidad, producto_id, nombre_producto, descripcion, pasos, estado, prioridad, asignado_a) " +
                          "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        try (Connection con = Conexion.obtenerConexion();
             PreparedStatement pst = con.prepareStatement(consulta, Statement.RETURN_GENERATED_KEYS)) {
            if (reporte.getIdVendedor() != null && reporte.getIdVendedor() > 0) pst.setInt(1, reporte.getIdVendedor()); else pst.setNull(1, Types.INTEGER);
            pst.setString(2, reporte.getNombreVendedor() != null ? reporte.getNombreVendedor() : "Usuario");
            pst.setString(3, reporte.getCorreo());
            String tituloFinal = reporte.getTitulo() != null ? reporte.getTitulo() : (reporte.getArea() != null ? reporte.getArea() : "General");
            String areaFinal = reporte.getArea() != null ? reporte.getArea() : tituloFinal;
            String severidadFinal = reporte.getSeveridad() != null ? reporte.getSeveridad() : "medium";
            String prioridadFinal = reporte.getPrioridad() != null ? reporte.getPrioridad() : severidadFinal;

            pst.setString(4, tituloFinal);
            pst.setString(5, areaFinal);
            pst.setString(6, severidadFinal);
            if (reporte.getIdProducto() != null && reporte.getIdProducto() > 0) pst.setInt(7, reporte.getIdProducto()); else pst.setNull(7, Types.INTEGER);
            pst.setString(8, reporte.getNombreProducto());
            pst.setString(9, reporte.getDescripcion() != null ? reporte.getDescripcion() : "");
            pst.setString(10, reporte.getPasos() != null ? reporte.getPasos() : "");
            pst.setString(11, reporte.getEstado() != null ? reporte.getEstado() : "open");
            pst.setString(12, prioridadFinal);
            if (reporte.getAsignadoA() != null && reporte.getAsignadoA() > 0) pst.setInt(13, reporte.getAsignadoA()); else pst.setNull(13, Types.INTEGER);

            int filas = pst.executeUpdate();
            if (filas > 0) {
                try (ResultSet rs = pst.getGeneratedKeys()) {
                    if (rs.next()) {
                        reporte.setId(rs.getInt(1));
                    }
                }
                return true;
            }
            return false;
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    /**
     * Actualiza el estado de un reporte de error.
     *
     * @param idReporte Identificador del reporte (`int`).
     * @param estado Nuevo estado (`String`).
     * @return `true` si se actualizó el reporte; `false` en caso contrario.
     */
    public boolean actualizarEstadoReporteError(int idReporte, String estado) {
        return actualizarReporteError(idReporte, estado, null, null);
    }

    /**
     * Actualiza estado, prioridad y técnico asignado de un reporte de error de forma selectiva.
     *
     * @param idReporte Identificador del reporte (`int`).
     * @param estado Nuevo estado (`String`) o `null`.
     * @param prioridad Nueva prioridad (`String`) o `null`.
     * @param asignadoA Identificador del responsable asignado (`Integer`) o `null`.
     * @return `true` si se actualizó el registro; `false` en caso de error.
     */
    public boolean actualizarReporteError(int idReporte, String estado, String prioridad, Integer asignadoA) {
        boolean resuelto = "resolved".equalsIgnoreCase(estado) || "resuelto".equalsIgnoreCase(estado)
                || "fixed".equalsIgnoreCase(estado) || "closed".equalsIgnoreCase(estado);
        String consulta = "UPDATE reportes_errores SET " +
                          "estado = COALESCE(?, estado), " +
                          "prioridad = COALESCE(?, prioridad), " +
                          "severidad = COALESCE(?, severidad), " +
                          "asignado_a = COALESCE(?, asignado_a)" +
                          (resuelto ? ", resuelto_en = CURRENT_TIMESTAMP " : " ") +
                          "WHERE id = ?";
        try (Connection con = Conexion.obtenerConexion();
             PreparedStatement pst = con.prepareStatement(consulta)) {
            pst.setString(1, estado);
            pst.setString(2, prioridad);
            pst.setString(3, prioridad);
            if (asignadoA != null && asignadoA > 0) pst.setInt(4, asignadoA); else pst.setNull(4, Types.INTEGER);
            pst.setInt(5, idReporte);
            return pst.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }
}
