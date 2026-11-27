package infraestructura.persistencia.jdbc;

import java.io.File;
import java.io.FileOutputStream;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.sql.Types;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;

import dominio.modelos.AlertaVendedor;
import dominio.modelos.PerfilVendedor;
import dominio.modelos.ResenaVendedor;
import infraestructura.configuracion.Conexion;

/**
 * DAO para gestionar los perfiles públicos de tiendas de vendedores (`perfiles_vendedor`),
 * sus reseñas (`resenas_vendedor`) y alertas inteligentes de oportunidad (`alertas_vendedor`).
 */
public class TiendaVendedorDAO {

    public TiendaVendedorDAO() {}

    /**
     * Lista todas las tiendas de vendedores activos ordenadas por calificación real y ventas.
     */
    public List<PerfilVendedor> listarTiendas() {
        return listarTiendas(false);
    }

    /**
     * Lista todas las tiendas de vendedores activos con conteo real de telas visibles según acceso VIP.
     */
    public List<PerfilVendedor> listarTiendas(boolean incluirExclusivos) {
        List<PerfilVendedor> tiendas = new ArrayList<>();
        String filtroExclusivo = incluirExclusivos ? "" : " AND COALESCE(p.es_exclusivo, false) = false";
        String sql = "SELECT u.id AS vendedor_id, u.nombre AS nombre_vendedor, u.correo AS correo_vendedor, u.telefono AS telefono_vendedor, " +
                "COALESCE(u.tasa_comision, 10.00) AS tasa_comision, " +
                "pv.nombre_tienda, pv.slug_tienda, pv.descripcion_bio, pv.url_avatar, pv.url_portada, " +
                "pv.ciudad, pv.pais, pv.especialidad, COALESCE(pv.verificado, true) AS verificado, pv.politica_envio, " +
                "COALESCE((SELECT ROUND(AVG(rv.calificacion)::numeric, 2) FROM resenas_vendedor rv WHERE rv.vendedor_id = u.id), 0) AS calificacion_promedio, " +
                "(SELECT COUNT(*) FROM resenas_vendedor rv WHERE rv.vendedor_id = u.id) AS total_resenas, " +
                "COALESCE((SELECT SUM(COALESCE(p.metros_vendidos, 0)) FROM productos p WHERE p.vendedor_id = u.id AND p.activo = true), 0) AS total_ventas_metros, " +
                "pv.actualizado_en, " +
                "(SELECT COUNT(*) FROM productos p WHERE p.vendedor_id = u.id AND p.activo = true" + filtroExclusivo + ") AS productos_activos " +
                "FROM usuarios u " +
                "LEFT JOIN perfiles_vendedor pv ON pv.vendedor_id = u.id " +
                "WHERE u.rol = 'vendedor' AND u.activo = true AND COALESCE(u.suspendido, false) = false " +
                "ORDER BY calificacion_promedio DESC, total_ventas_metros DESC, u.id ASC";

        try (Connection con = Conexion.obtenerConexion();
             PreparedStatement pst = con.prepareStatement(sql);
             ResultSet rs = pst.executeQuery()) {
            while (rs.next()) {
                tiendas.add(mapearPerfil(rs));
            }
        } catch (SQLException e) {
            System.err.println("[TIENDAS] Error listando tiendas: " + e.getMessage());
        }
        return tiendas;
    }

    /**
     * Obtiene el perfil completo de tienda de un vendedor específico.
     */
    public PerfilVendedor obtenerPerfilTienda(int idVendedor) {
        return obtenerPerfilTienda(idVendedor, true);
    }

    /**
     * Obtiene el perfil completo de tienda de un vendedor específico con conteo real de productos visibles.
     */
    public PerfilVendedor obtenerPerfilTienda(int idVendedor, boolean incluirExclusivos) {
        String filtroExclusivo = incluirExclusivos ? "" : " AND COALESCE(p.es_exclusivo, false) = false";
        String sql = "SELECT u.id AS vendedor_id, u.nombre AS nombre_vendedor, u.correo AS correo_vendedor, u.telefono AS telefono_vendedor, " +
                "COALESCE(u.tasa_comision, 10.00) AS tasa_comision, " +
                "pv.nombre_tienda, pv.slug_tienda, pv.descripcion_bio, pv.url_avatar, pv.url_portada, " +
                "pv.ciudad, pv.pais, pv.especialidad, COALESCE(pv.verificado, true) AS verificado, pv.politica_envio, " +
                "COALESCE((SELECT ROUND(AVG(rv.calificacion)::numeric, 2) FROM resenas_vendedor rv WHERE rv.vendedor_id = u.id), 0) AS calificacion_promedio, " +
                "(SELECT COUNT(*) FROM resenas_vendedor rv WHERE rv.vendedor_id = u.id) AS total_resenas, " +
                "COALESCE((SELECT SUM(COALESCE(p.metros_vendidos, 0)) FROM productos p WHERE p.vendedor_id = u.id AND p.activo = true), 0) AS total_ventas_metros, " +
                "pv.actualizado_en, " +
                "(SELECT COUNT(*) FROM productos p WHERE p.vendedor_id = u.id AND p.activo = true" + filtroExclusivo + ") AS productos_activos " +
                "FROM usuarios u " +
                "LEFT JOIN perfiles_vendedor pv ON pv.vendedor_id = u.id " +
                "WHERE u.id = ? AND u.rol = 'vendedor'";

        try (Connection con = Conexion.obtenerConexion();
             PreparedStatement pst = con.prepareStatement(sql)) {
            pst.setInt(1, idVendedor);
            try (ResultSet rs = pst.executeQuery()) {
                if (rs.next()) {
                    return mapearPerfil(rs);
                }
            }
        } catch (SQLException e) {
            System.err.println("[TIENDAS] Error obteniendo perfil de tienda: " + e.getMessage());
        }
        return null;
    }

    /**
     * Crea o actualiza el perfil público estilo Facebook del vendedor autenticado.
     */
    public boolean actualizarPerfilTienda(int idVendedor, PerfilVendedor datos) {
        if (datos == null || idVendedor <= 0) return false;

        String urlAvatar = procesarImagenOUrl(datos.getUrlAvatar(), "avatar_" + idVendedor);
        String urlPortada = procesarImagenOUrl(datos.getUrlPortada(), "cover_" + idVendedor);

        String nombreTienda = (datos.getNombreTienda() != null && !datos.getNombreTienda().isBlank())
                ? datos.getNombreTienda().trim()
                : "Tienda Textil #" + idVendedor;

        String slugBase = nombreTienda.toLowerCase().replaceAll("[^a-z0-9]+", "-").replaceAll("(^-|-$)", "");
        if (slugBase.isBlank()) slugBase = "tienda";
        String slugFinal = slugBase + "-" + idVendedor;

        String sql = "INSERT INTO perfiles_vendedor (" +
                "vendedor_id, nombre_tienda, slug_tienda, descripcion_bio, url_avatar, url_portada, ciudad, pais, especialidad, politica_envio, actualizado_en" +
                ") VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW()) " +
                "ON CONFLICT (vendedor_id) DO UPDATE SET " +
                "nombre_tienda = COALESCE(NULLIF(EXCLUDED.nombre_tienda, ''), perfiles_vendedor.nombre_tienda), " +
                "slug_tienda = COALESCE(NULLIF(EXCLUDED.slug_tienda, ''), perfiles_vendedor.slug_tienda), " +
                "descripcion_bio = COALESCE(EXCLUDED.descripcion_bio, perfiles_vendedor.descripcion_bio), " +
                "url_avatar = COALESCE(NULLIF(EXCLUDED.url_avatar, ''), perfiles_vendedor.url_avatar), " +
                "url_portada = COALESCE(NULLIF(EXCLUDED.url_portada, ''), perfiles_vendedor.url_portada), " +
                "ciudad = COALESCE(NULLIF(EXCLUDED.ciudad, ''), perfiles_vendedor.ciudad), " +
                "pais = COALESCE(NULLIF(EXCLUDED.pais, ''), perfiles_vendedor.pais), " +
                "especialidad = COALESCE(NULLIF(EXCLUDED.especialidad, ''), perfiles_vendedor.especialidad), " +
                "politica_envio = COALESCE(NULLIF(EXCLUDED.politica_envio, ''), perfiles_vendedor.politica_envio), " +
                "actualizado_en = NOW()";

        try (Connection con = Conexion.obtenerConexion();
             PreparedStatement pst = con.prepareStatement(sql)) {
            pst.setInt(1, idVendedor);
            pst.setString(2, nombreTienda);
            pst.setString(3, slugFinal);
            pst.setString(4, datos.getDescripcionBio());
            pst.setString(5, urlAvatar);
            pst.setString(6, urlPortada);
            pst.setString(7, datos.getCiudad());
            pst.setString(8, datos.getPais());
            pst.setString(9, datos.getEspecialidad());
            pst.setString(10, datos.getPoliticaEnvio());
            return pst.executeUpdate() > 0;
        } catch (SQLException e) {
            System.err.println("[TIENDAS] Error actualizando perfil de tienda: " + e.getMessage());
            return false;
        }
    }

    /**
     * Lista las reseñas directas emitidas hacia un vendedor.
     */
    public List<ResenaVendedor> obtenerResenasVendedor(int idVendedor) {
        List<ResenaVendedor> lista = new ArrayList<>();
        String sql = "SELECT rv.*, u.nombre AS nombre_usuario " +
                "FROM resenas_vendedor rv " +
                "JOIN usuarios u ON u.id = rv.usuario_id " +
                "WHERE rv.vendedor_id = ? " +
                "ORDER BY rv.creado_en DESC, rv.id DESC";
        try (Connection con = Conexion.obtenerConexion();
             PreparedStatement pst = con.prepareStatement(sql)) {
            pst.setInt(1, idVendedor);
            try (ResultSet rs = pst.executeQuery()) {
                while (rs.next()) {
                    ResenaVendedor r = new ResenaVendedor();
                    r.setId(rs.getInt("id"));
                    r.setIdVendedor(rs.getInt("vendedor_id"));
                    r.setIdUsuario(rs.getInt("usuario_id"));
                    r.setNombreUsuario(rs.getString("nombre_usuario"));
                    int idPed = rs.getInt("pedido_id");
                    r.setIdPedido(rs.wasNull() ? null : idPed);
                    r.setCalificacion(rs.getInt("calificacion"));
                    r.setComentario(rs.getString("comentario"));
                    r.setFechaCreacion(rs.getTimestamp("creado_en") != null ? rs.getTimestamp("creado_en").toString() : null);
                    lista.add(r);
                }
            }
        } catch (SQLException e) {
            System.err.println("[TIENDAS] Error listando reseñas de vendedor: " + e.getMessage());
        }
        return lista;
    }

    /**
     * Registra o actualiza la reseña hacia un vendedor y recalcula su calificación promedio.
     */
    public boolean guardarResenaVendedor(ResenaVendedor resena) {
        String sqlUpsert = "INSERT INTO resenas_vendedor (vendedor_id, usuario_id, pedido_id, calificacion, comentario) " +
                "VALUES (?, ?, ?, ?, ?) " +
                "ON CONFLICT (vendedor_id, usuario_id) DO UPDATE SET " +
                "calificacion = EXCLUDED.calificacion, comentario = EXCLUDED.comentario, creado_en = NOW()";
        String sqlRecalc = "UPDATE perfiles_vendedor SET " +
                "calificacion_promedio = COALESCE((SELECT ROUND(AVG(calificacion)::numeric, 2) FROM resenas_vendedor WHERE vendedor_id = ?), 0), " +
                "total_resenas = COALESCE((SELECT COUNT(*) FROM resenas_vendedor WHERE vendedor_id = ?), 0) " +
                "WHERE vendedor_id = ?";

        try (Connection con = Conexion.obtenerConexion()) {
            con.setAutoCommit(false);
            try {
                try (PreparedStatement pst = con.prepareStatement(sqlUpsert)) {
                    pst.setInt(1, resena.getIdVendedor());
                    pst.setInt(2, resena.getIdUsuario());
                    if (resena.getIdPedido() != null && resena.getIdPedido() > 0) {
                        pst.setInt(3, resena.getIdPedido());
                    } else {
                        pst.setNull(3, java.sql.Types.INTEGER);
                    }
                    pst.setInt(4, Math.max(1, Math.min(5, resena.getCalificacion())));
                    pst.setString(5, resena.getComentario());
                    pst.executeUpdate();
                }

                // Garantizar existencia de fila en perfiles_vendedor antes de recalcular
                try (PreparedStatement pstEnsure = con.prepareStatement(
                        "INSERT INTO perfiles_vendedor (vendedor_id, nombre_tienda) " +
                        "SELECT id, 'Tienda ' || nombre FROM usuarios WHERE id = ? ON CONFLICT (vendedor_id) DO NOTHING")) {
                    pstEnsure.setInt(1, resena.getIdVendedor());
                    pstEnsure.executeUpdate();
                }

                try (PreparedStatement pstRecalc = con.prepareStatement(sqlRecalc)) {
                    pstRecalc.setInt(1, resena.getIdVendedor());
                    pstRecalc.setInt(2, resena.getIdVendedor());
                    pstRecalc.setInt(3, resena.getIdVendedor());
                    pstRecalc.executeUpdate();
                }

                con.commit();
                return true;
            } catch (SQLException e) {
                con.rollback();
                throw e;
            }
        } catch (SQLException e) {
            System.err.println("[TIENDAS] Error guardando reseña de vendedor: " + e.getMessage());
            return false;
        }
    }

    /**
     * Genera alertas dinámicas de mercado (competencia + clientes frecuentes VIP) y devuelve las alertas del vendedor.
     */
    public List<AlertaVendedor> obtenerYGenerarAlertasVendedor(int idVendedor) {
        generarAlertasDinamicas(idVendedor);
        List<AlertaVendedor> alertas = new ArrayList<>();
        String sql = "SELECT a.*, p.nombre AS nombre_producto " +
                "FROM alertas_vendedor a " +
                "LEFT JOIN productos p ON p.id = a.producto_id " +
                "WHERE a.vendedor_id = ? " +
                "ORDER BY a.aplicada ASC, " +
                "CASE WHEN a.tipo_alerta IN ('auditoria_admin', 'stock_bajo', 'reporte_mermas') THEN 0 ELSE 1 END ASC, " +
                "a.leida ASC, a.creado_en DESC LIMIT 40";

        try (Connection con = Conexion.obtenerConexion();
             PreparedStatement pst = con.prepareStatement(sql)) {
            pst.setInt(1, idVendedor);
            try (ResultSet rs = pst.executeQuery()) {
                while (rs.next()) {
                    AlertaVendedor a = new AlertaVendedor();
                    a.setId(rs.getInt("id"));
                    a.setIdVendedor(rs.getInt("vendedor_id"));
                    int idProd = rs.getInt("producto_id");
                    a.setIdProducto(rs.wasNull() ? null : idProd);
                    a.setNombreProducto(rs.getString("nombre_producto"));
                    a.setTipoAlerta(rs.getString("tipo_alerta"));
                    a.setTitulo(rs.getString("titulo"));
                    a.setMensaje(rs.getString("mensaje"));
                    a.setSugerenciaAccion(rs.getString("sugerencia_accion"));
                    a.setDescuentoSugerido(rs.getDouble("descuento_sugerido"));
                    a.setLeida(rs.getBoolean("leida"));
                    a.setAplicada(rs.getBoolean("aplicada"));
                    a.setFechaCreacion(rs.getTimestamp("creado_en") != null ? rs.getTimestamp("creado_en").toString() : null);
                    alertas.add(a);
                }
            }
        } catch (SQLException e) {
            System.err.println("[ALERTAS] Error consultando alertas de vendedor: " + e.getMessage());
        }
        return alertas;
    }

    /**
     * Marca una alerta como leída/aplicada para el vendedor propietario.
     */
    public boolean marcarAlertaAplicada(int idAlerta, int idVendedor, boolean aplicada) {
        String sql = "UPDATE alertas_vendedor SET leida = true, aplicada = ? WHERE id = ? AND vendedor_id = ?";
        try (Connection con = Conexion.obtenerConexion();
             PreparedStatement pst = con.prepareStatement(sql)) {
            pst.setBoolean(1, aplicada);
            pst.setInt(2, idAlerta);
            pst.setInt(3, idVendedor);
            return pst.executeUpdate() > 0;
        } catch (SQLException e) {
            System.err.println("[ALERTAS] Error actualizando alerta: " + e.getMessage());
            return false;
        }
    }

    /**
     * Inserta una alerta oficial administrativa (auditoría, stock bajo o reporte de mermas) en `alertas_vendedor`.
     *
     * @return Identificador generado de la alerta, o `-1` si ocurrió un error.
     */
    public int crearAlertaAdministrativa(
            int idVendedor,
            Integer idProducto,
            String tipoAlerta,
            String titulo,
            String mensaje,
            String sugerenciaAccion
    ) {
        if (idVendedor <= 0 || tipoAlerta == null || tipoAlerta.isBlank()
                || titulo == null || titulo.isBlank() || mensaje == null || mensaje.isBlank()) {
            return -1;
        }
        String sql = "INSERT INTO alertas_vendedor " +
                "(vendedor_id, producto_id, tipo_alerta, titulo, mensaje, sugerencia_accion, descuento_sugerido, leida, aplicada) " +
                "VALUES (?, ?, ?, ?, ?, ?, 0.00, false, false)";
        try (Connection con = Conexion.obtenerConexion();
             PreparedStatement pst = con.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            pst.setInt(1, idVendedor);
            if (idProducto != null && idProducto > 0) {
                pst.setInt(2, idProducto);
            } else {
                pst.setNull(2, Types.INTEGER);
            }
            pst.setString(3, tipoAlerta.trim());
            pst.setString(4, titulo.trim());
            pst.setString(5, mensaje.trim());
            pst.setString(6, (sugerenciaAccion != null && !sugerenciaAccion.isBlank()) ? sugerenciaAccion.trim() : null);
            int filas = pst.executeUpdate();
            if (filas > 0) {
                try (ResultSet rs = pst.getGeneratedKeys()) {
                    if (rs.next()) {
                        return rs.getInt(1);
                    }
                }
            }
        } catch (SQLException e) {
            System.err.println("[ALERTAS] Error creando alerta administrativa: " + e.getMessage());
        }
        return -1;
    }

    /**
     * Analiza oportunidades de clientes frecuentes VIP y competencia de precios para alertar al vendedor.
     */
    private void generarAlertasDinamicas(int idVendedor) {
        if (idVendedor <= 0) return;

        // 1. Sugerir activar Tela Exclusiva cuando el vendedor tiene telas bien valoradas sin exclusividad activa
        String sqlSugVip = "INSERT INTO alertas_vendedor (vendedor_id, producto_id, tipo_alerta, titulo, mensaje, sugerencia_accion, descuento_sugerido) " +
                "SELECT ?, p.id, 'demanda_vip', " +
                "'Activa Exclusividad VIP en ' || p.nombre, " +
                "'Tienes clientes recurrentes listos para colecciones privadas. Activa el modo Tela Exclusiva en este producto para atraer compradores frecuentes de alto ticket.', " +
                "'activar_exclusivo', 0.00 " +
                "FROM productos p " +
                "WHERE p.vendedor_id = ? AND p.activo = true AND p.es_exclusivo = false " +
                "AND NOT EXISTS (SELECT 1 FROM alertas_vendedor a WHERE a.vendedor_id = ? AND a.producto_id = p.id AND a.tipo_alerta = 'demanda_vip' AND a.aplicada = false) " +
                "ORDER BY p.metros_vendidos DESC, p.calificacion_promedio DESC LIMIT 1";

        // 2. Detectar si un competidor tiene un precio menor en la misma categoría -> sugerir promoción
        String sqlCompetencia = "INSERT INTO alertas_vendedor (vendedor_id, producto_id, tipo_alerta, titulo, mensaje, sugerencia_accion, descuento_sugerido) " +
                "SELECT ?, p.id, 'competencia_precio', " +
                "'Alerta de competencia en ' || p.nombre, " +
                "'Otro proveedor ofrece la misma categoría textil a un precio inferior. Activa un descuento del 15% para liderar el comparador de precios.', " +
                "'activar_descuento', 15.00 " +
                "FROM productos p " +
                "WHERE p.vendedor_id = ? AND p.activo = true AND COALESCE(p.porcentaje_descuento, 0) = 0 " +
                "AND EXISTS (SELECT 1 FROM productos p2 WHERE p2.categoria_id = p.categoria_id AND p2.vendedor_id <> p.vendedor_id AND p2.activo = true AND (p2.precio * (1 - COALESCE(p2.porcentaje_descuento, 0)/100.0)) < p.precio) " +
                "AND NOT EXISTS (SELECT 1 FROM alertas_vendedor a WHERE a.vendedor_id = ? AND a.producto_id = p.id AND a.tipo_alerta = 'competencia_precio' AND a.aplicada = false) " +
                "ORDER BY p.precio DESC LIMIT 1";

        try (Connection con = Conexion.obtenerConexion()) {
            try (PreparedStatement pstVip = con.prepareStatement(sqlSugVip)) {
                pstVip.setInt(1, idVendedor);
                pstVip.setInt(2, idVendedor);
                pstVip.setInt(3, idVendedor);
                pstVip.executeUpdate();
            }
            try (PreparedStatement pstComp = con.prepareStatement(sqlCompetencia)) {
                pstComp.setInt(1, idVendedor);
                pstComp.setInt(2, idVendedor);
                pstComp.setInt(3, idVendedor);
                pstComp.executeUpdate();
            }
        } catch (SQLException e) {
            System.err.println("[ALERTAS] Error generando alertas dinámicas: " + e.getMessage());
        }
    }

    private PerfilVendedor mapearPerfil(ResultSet rs) throws SQLException {
        PerfilVendedor p = new PerfilVendedor();
        int idVendedor = rs.getInt("vendedor_id");
        p.setIdVendedor(idVendedor);
        p.setNombreVendedor(rs.getString("nombre_vendedor"));
        p.setCorreo(rs.getString("correo_vendedor"));
        p.setTelefono(rs.getString("telefono_vendedor"));
        String nombreTienda = rs.getString("nombre_tienda");
        p.setNombreTienda((nombreTienda != null && !nombreTienda.isBlank()) ? nombreTienda : ("Tienda " + rs.getString("nombre_vendedor")));
        p.setSlugTienda(rs.getString("slug_tienda"));
        String bio = rs.getString("descripcion_bio");
        p.setDescripcionBio(bio != null ? bio : "Proveedor certificado en D&D Textil Marketplace.");
        String avatar = rs.getString("url_avatar");
        p.setUrlAvatar((avatar != null && !avatar.isBlank()) ? avatar : "/images/hero-detail-1.webp");
        String portada = rs.getString("url_portada");
        p.setUrlPortada((portada != null && !portada.isBlank()) ? portada : "/images/carousel-nueva-coleccion.webp");
        p.setCiudad(rs.getString("ciudad") != null ? rs.getString("ciudad") : "Bogotá");
        p.setPais(rs.getString("pais") != null ? rs.getString("pais") : "Colombia");
        p.setEspecialidad(rs.getString("especialidad") != null ? rs.getString("especialidad") : "Textiles Premium");
        p.setVerificado(rs.getBoolean("verificado"));
        p.setPoliticaEnvio(rs.getString("politica_envio") != null ? rs.getString("politica_envio") : "Despacho nacional garantizado en 24-48h.");
        p.setCalificacionPromedio(rs.getDouble("calificacion_promedio"));
        p.setTotalResenas(rs.getInt("total_resenas"));
        p.setTotalVentasMetros(rs.getDouble("total_ventas_metros"));
        p.setProductosActivos(rs.getInt("productos_activos"));
        p.setTasaComision(rs.getDouble("tasa_comision"));
        if (rs.getTimestamp("actualizado_en") != null) {
            p.setActualizadoEn(rs.getTimestamp("actualizado_en").toString());
        }
        return p;
    }

    private String procesarImagenOUrl(String entrada, String prefijoArchivo) {
        if (entrada == null || entrada.isBlank()) return null;
        String valor = entrada.trim();
        if (!valor.startsWith("data:image/")) {
            return valor;
        }
        try {
            String encabezado = valor.substring(0, valor.indexOf(','));
            String base64 = valor.substring(valor.indexOf(',') + 1);
            String extension = "png";
            if (encabezado.contains("jpeg") || encabezado.contains("jpg")) extension = "jpg";
            else if (encabezado.contains("webp")) extension = "webp";

            byte[] bytes = Base64.getDecoder().decode(base64.trim());
            if (!esImagenValida(bytes)) return null;

            File dir = new File("uploads");
            if (!dir.exists()) dir.mkdirs();

            String nombre = prefijoArchivo + "_" + System.currentTimeMillis() + "." + extension;
            File destino = new File(dir, nombre);
            try (FileOutputStream fos = new FileOutputStream(destino)) {
                fos.write(bytes);
            }
            return "/uploads/" + nombre;
        } catch (Exception e) {
            System.err.println("[TIENDAS] Error guardando imagen de tienda: " + e.getMessage());
            return null;
        }
    }

    private boolean esImagenValida(byte[] bytes) {
        if (bytes == null || bytes.length < 12) return false;
        boolean esPng = (bytes[0] & 0xFF) == 0x89 && bytes[1] == 0x50 && bytes[2] == 0x4E && bytes[3] == 0x47;
        boolean esJpg = (bytes[0] & 0xFF) == 0xFF && (bytes[1] & 0xFF) == 0xD8 && (bytes[2] & 0xFF) == 0xFF;
        boolean esGif = bytes[0] == 'G' && bytes[1] == 'I' && bytes[2] == 'F' && bytes[3] == '8';
        boolean esWebp = bytes[0] == 'R' && bytes[1] == 'I' && bytes[2] == 'F' && bytes[3] == 'F'
                && bytes[8] == 'W' && bytes[9] == 'E' && bytes[10] == 'B' && bytes[11] == 'P';
        return esPng || esJpg || esGif || esWebp;
    }
}

