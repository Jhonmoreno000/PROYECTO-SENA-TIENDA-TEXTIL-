package infraestructura.persistencia.jdbc;

import aplicacion.servicios.ServicioCorteTextil;
import dominio.excepciones.ExcepcionDominio;
import dominio.modelos.Retazo;
import dominio.modelos.RolloTextil;
import infraestructura.configuracion.Conexion;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.sql.Types;
import java.util.ArrayList;
import java.util.List;

/**
 * Objeto de acceso a datos (DAO) para la tabla `retazos` en PostgreSQL.
 * Gestiona la consulta de catalogo de retazos, creacion automatica desde rollos sub-metro,
 * reserva, venta atomica (stock unitario = 1) y liberacion por compensacion Saga.
 */
public class RetazoDAO {

    private static final String SELECT_BASE =
            "SELECT r.*, p.nombre AS nombre_producto, p.material AS material_producto, " +
            "c.nombre AS nombre_categoria, " +
            "(SELECT ip.url_imagen FROM imagenes_producto ip WHERE ip.producto_id = p.id ORDER BY ip.orden_visualizacion ASC LIMIT 1) AS url_imagen " +
            "FROM retazos r " +
            "JOIN productos p ON r.producto_id = p.id " +
            "LEFT JOIN categorias c ON p.categoria_id = c.id ";

    private static List<Retazo> obtenerRetazosSemilla() {
        List<Retazo> demo = new ArrayList<>();
        demo.add(Retazo.crearDemo(901, "RET-ROL-101", 1, "Lino Belga Natural", "Lino", "100% Lino Europeo", "/images/hero-detail-1.webp", 0.85, 1.50, 38250.0, 22950.0, 40.0, "DISPONIBLE", "LT-2026-01", "Remanente de corte limpio de rollo maestro, ideal para blusas, cojines o sastrería."));
        demo.add(Retazo.crearDemo(902, "RET-ROL-104", 2, "Seda Italiana Marfil", "Seda", "100% Seda Natural", "/images/hero-detail-2.webp", 0.70, 1.45, 52500.0, 31500.0, 40.0, "DISPONIBLE", "LT-2026-04", "Pieza única con caída fluida y brillo satinado, lista para pañoletas o forrería fina."));
        demo.add(Retazo.crearDemo(903, "RET-ROL-109", 3, "Algodón Egipcio Peinado", "Algodon", "100% Algodón Egipcio", "/images/hero-detail-3.webp", 0.65, 1.50, 24700.0, 14820.0, 40.0, "DISPONIBLE", "LT-2026-09", "Sobrante de lote verificado con tacto suave y alta densidad de hilo."));
        demo.add(Retazo.crearDemo(904, "RET-ROL-112", 4, "Terciopelo Esmeralda Premium", "Terciopelo", "Poliéster / Elastano", "/images/carousel-telas-exclusivas.webp", 0.90, 1.50, 46800.0, 28080.0, 40.0, "DISPONIBLE", "LT-2026-12", "Último tramo del rollo en tono uniforme, ideal para tapicería o accesorios."));
        return demo;
    }

    public List<Retazo> obtenerRetazosDisponibles() {
        List<Retazo> lista = new ArrayList<>();
        String sql = SELECT_BASE + "WHERE UPPER(r.estado) = 'DISPONIBLE' AND p.activo = true ORDER BY r.creado_en DESC, r.id DESC";
        try (Connection con = Conexion.obtenerConexion();
             PreparedStatement pst = con.prepareStatement(sql);
             ResultSet rs = pst.executeQuery()) {
            while (rs.next()) {
                lista.add(mapearRetazo(rs));
            }
        } catch (SQLException e) {
            System.err.println("[RETAZOS] Error listando retazos disponibles: " + e.getMessage());
        }
        if (lista.isEmpty()) {
            return obtenerRetazosSemilla();
        }
        return lista;
    }

    public List<Retazo> obtenerTodosLosRetazos() {
        List<Retazo> lista = new ArrayList<>();
        String sql = SELECT_BASE + "ORDER BY r.creado_en DESC, r.id DESC";
        try (Connection con = Conexion.obtenerConexion();
             PreparedStatement pst = con.prepareStatement(sql);
             ResultSet rs = pst.executeQuery()) {
            while (rs.next()) {
                lista.add(mapearRetazo(rs));
            }
        } catch (SQLException e) {
            System.err.println("[RETAZOS] Error listando todos los retazos: " + e.getMessage());
        }
        if (lista.isEmpty()) {
            return obtenerRetazosSemilla();
        }
        return lista;
    }

    public Retazo obtenerRetazoPorId(int id) {
        String sql = SELECT_BASE + "WHERE r.id = ?";
        try (Connection con = Conexion.obtenerConexion();
             PreparedStatement pst = con.prepareStatement(sql)) {
            pst.setInt(1, id);
            try (ResultSet rs = pst.executeQuery()) {
                if (rs.next()) {
                    return mapearRetazo(rs);
                }
            }
        } catch (SQLException e) {
            System.err.println("[RETAZOS] Error consultando retazo #" + id + ": " + e.getMessage());
        }
        for (Retazo r : obtenerRetazosSemilla()) {
            if (r.getId() == id) {
                return r;
            }
        }
        return null;
    }

    /**
     * Crea un registro en `retazos` dentro de una transaccion activa cuando un rollo queda < 1.00 m.
     */
    public int crearRetazoDesdeRollo(Connection con, RolloTextil rollo, BigDecimal largoMetros, BigDecimal precioPorMetro) throws SQLException {
        if (rollo == null || largoMetros == null || largoMetros.compareTo(BigDecimal.ZERO) <= 0
                || largoMetros.compareTo(BigDecimal.ONE) >= 0) {
            return -1;
        }

        double anchoMetros = 1.50;
        if (rollo.getProductoId() > 0) {
            try (PreparedStatement pstAncho = con.prepareStatement("SELECT ancho, precio FROM productos WHERE id = ?")) {
                pstAncho.setInt(1, rollo.getProductoId());
                try (ResultSet rs = pstAncho.executeQuery()) {
                    if (rs.next()) {
                        anchoMetros = ServicioCorteTextil.parsearAnchoMetros(rs.getString("ancho"));
                        if (precioPorMetro == null || precioPorMetro.compareTo(BigDecimal.ZERO) <= 0) {
                            precioPorMetro = rs.getBigDecimal("precio");
                        }
                    }
                }
            }
        }
        if (precioPorMetro == null || precioPorMetro.compareTo(BigDecimal.ZERO) <= 0) {
            precioPorMetro = new BigDecimal("25000.00");
        }

        BigDecimal largoRed = largoMetros.setScale(2, RoundingMode.HALF_UP);
        BigDecimal precioOriginal = precioPorMetro.multiply(largoRed).setScale(2, RoundingMode.HALF_UP);
        BigDecimal factorLiqui = BigDecimal.ONE.subtract(BigDecimal.valueOf(ServicioCorteTextil.DESCUENTO_RETAZO_LIQUIDADO));
        BigDecimal precioLiquidacion = precioOriginal.multiply(factorLiqui).setScale(2, RoundingMode.HALF_UP);
        BigDecimal descuentoPct = BigDecimal.valueOf(ServicioCorteTextil.DESCUENTO_RETAZO_LIQUIDADO * 100.0).setScale(2, RoundingMode.HALF_UP);

        String baseCodigo = (rollo.getCodigoRollo() != null && !rollo.getCodigoRollo().isBlank())
                ? rollo.getCodigoRollo()
                : ("P" + rollo.getProductoId());
        String codigoRetazo = "RET-" + baseCodigo + "-" + (System.currentTimeMillis() % 100000);

        String sql = "INSERT INTO retazos (" +
                "codigo_retazo, producto_id, rollo_id, largo_metros, ancho_metros, " +
                "precio_original, precio_liquidacion, porcentaje_descuento, estado, " +
                "lote_tintoreria, ubicacion_bodega, notas" +
                ") VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'DISPONIBLE', ?, ?, ?)";

        try (PreparedStatement pst = con.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            pst.setString(1, codigoRetazo);
            pst.setInt(2, rollo.getProductoId());
            if (rollo.getId() > 0) {
                pst.setInt(3, rollo.getId());
            } else {
                pst.setNull(3, Types.INTEGER);
            }
            pst.setBigDecimal(4, largoRed);
            pst.setBigDecimal(5, BigDecimal.valueOf(anchoMetros).setScale(2, RoundingMode.HALF_UP));
            pst.setBigDecimal(6, precioOriginal);
            pst.setBigDecimal(7, precioLiquidacion);
            pst.setBigDecimal(8, descuentoPct);
            pst.setString(9, rollo.getLoteTintoreria());
            pst.setString(10, rollo.getUbicacionBodega() != null ? rollo.getUbicacionBodega() : "Estante Retazos");
            pst.setString(11, "Remanente automatico de " + largoRed.toPlainString() + "m x "
                    + String.format(java.util.Locale.US, "%.2f", anchoMetros) + "m proveniente del rollo " + baseCodigo);
            pst.executeUpdate();
            try (ResultSet keys = pst.getGeneratedKeys()) {
                if (keys.next()) {
                    return keys.getInt(1);
                }
            }
        }
        return -1;
    }

    /**
     * Crea un retazo manualmente desde el panel administrativo o de vendedor.
     */
    public boolean crearRetazoManual(Retazo r) {
        if (r == null || r.getProductoId() <= 0 || r.getLargoMetros() <= 0 || r.getLargoMetros() >= 1.0) {
            return false;
        }
        try (Connection con = Conexion.obtenerConexion()) {
            BigDecimal precioPorMetro = BigDecimal.ZERO;
            double anchoDetectado = r.getAnchoMetros() > 0 ? r.getAnchoMetros() : 1.50;
            try (PreparedStatement pstP = con.prepareStatement("SELECT precio, ancho FROM productos WHERE id = ?")) {
                pstP.setInt(1, r.getProductoId());
                try (ResultSet rs = pstP.executeQuery()) {
                    if (rs.next()) {
                        precioPorMetro = rs.getBigDecimal("precio");
                        if (r.getAnchoMetros() <= 0) {
                            anchoDetectado = ServicioCorteTextil.parsearAnchoMetros(rs.getString("ancho"));
                        }
                    } else {
                        return false;
                    }
                }
            }

            BigDecimal largo = BigDecimal.valueOf(r.getLargoMetros()).setScale(2, RoundingMode.HALF_UP);
            BigDecimal ancho = BigDecimal.valueOf(anchoDetectado).setScale(2, RoundingMode.HALF_UP);
            BigDecimal precioOriginal = r.getPrecioOriginal() > 0
                    ? BigDecimal.valueOf(r.getPrecioOriginal()).setScale(2, RoundingMode.HALF_UP)
                    : precioPorMetro.multiply(largo).setScale(2, RoundingMode.HALF_UP);
            double pctDesc = r.getPorcentajeDescuento() > 0 ? r.getPorcentajeDescuento() : 40.0;
            BigDecimal precioLiquidacion = r.getPrecioLiquidacion() > 0
                    ? BigDecimal.valueOf(r.getPrecioLiquidacion()).setScale(2, RoundingMode.HALF_UP)
                    : precioOriginal.multiply(BigDecimal.ONE.subtract(BigDecimal.valueOf(pctDesc / 100.0))).setScale(2, RoundingMode.HALF_UP);

            String codigo = (r.getCodigoRetazo() != null && !r.getCodigoRetazo().isBlank())
                    ? r.getCodigoRetazo().trim()
                    : ("RET-MAN-" + r.getProductoId() + "-" + (System.currentTimeMillis() % 100000));

            String sql = "INSERT INTO retazos (" +
                    "codigo_retazo, producto_id, rollo_id, largo_metros, ancho_metros, " +
                    "precio_original, precio_liquidacion, porcentaje_descuento, estado, " +
                    "lote_tintoreria, ubicacion_bodega, notas" +
                    ") VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'DISPONIBLE', ?, ?, ?)";
            try (PreparedStatement pst = con.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
                pst.setString(1, codigo);
                pst.setInt(2, r.getProductoId());
                if (r.getRolloId() != null && r.getRolloId() > 0) pst.setInt(3, r.getRolloId()); else pst.setNull(3, Types.INTEGER);
                pst.setBigDecimal(4, largo);
                pst.setBigDecimal(5, ancho);
                pst.setBigDecimal(6, precioOriginal);
                pst.setBigDecimal(7, precioLiquidacion);
                pst.setBigDecimal(8, BigDecimal.valueOf(pctDesc).setScale(2, RoundingMode.HALF_UP));
                pst.setString(9, r.getLoteTintoreria());
                pst.setString(10, r.getUbicacionBodega() != null ? r.getUbicacionBodega() : "Estante Retazos");
                pst.setString(11, r.getNotas());
                if (pst.executeUpdate() > 0) {
                    try (ResultSet keys = pst.getGeneratedKeys()) {
                        if (keys.next()) r.setId(keys.getInt(1));
                    }
                    r.setCodigoRetazo(codigo);
                    return true;
                }
            }
        } catch (SQLException e) {
            System.err.println("[RETAZOS] Error creando retazo manual: " + e.getMessage());
        }
        return false;
    }

    /**
     * Marca un retazo como VENDIDO de forma atomica dentro de una transaccion con bloqueo pesimista.
     */
    public void marcarRetazoVendido(Connection con, int retazoId, int pedidoId) throws SQLException {
        String sqlLock = "SELECT id, estado, codigo_retazo FROM retazos WHERE id = ? FOR UPDATE";
        try (PreparedStatement pstLock = con.prepareStatement(sqlLock)) {
            pstLock.setInt(1, retazoId);
            try (ResultSet rs = pstLock.executeQuery()) {
                if (!rs.next()) {
                    throw new ExcepcionDominio("El retazo #" + retazoId + " no existe.");
                }
                String estadoActual = rs.getString("estado");
                if ("VENDIDO".equalsIgnoreCase(estadoActual)) {
                    throw new ExcepcionDominio("El retazo '" + rs.getString("codigo_retazo") + "' ya fue vendido.");
                }
            }
        }
        String sqlUpd = "UPDATE retazos SET estado = 'VENDIDO', pedido_id = ?, vendido_en = NOW(), actualizado_en = NOW() WHERE id = ?";
        try (PreparedStatement pstUpd = con.prepareStatement(sqlUpd)) {
            pstUpd.setInt(1, pedidoId);
            pstUpd.setInt(2, retazoId);
            pstUpd.executeUpdate();
        }
    }

    /**
     * Reserva un retazo al crear una intencion de pago Wompi para evitar doble compra concurrente.
     */
    public void reservarRetazo(Connection con, int retazoId, int pedidoId) throws SQLException {
        String sqlUpd = "UPDATE retazos SET estado = 'RESERVADO', pedido_id = ?, actualizado_en = NOW() " +
                "WHERE id = ? AND UPPER(estado) = 'DISPONIBLE'";
        try (PreparedStatement pst = con.prepareStatement(sqlUpd)) {
            pst.setInt(1, pedidoId);
            pst.setInt(2, retazoId);
            int filas = pst.executeUpdate();
            if (filas == 0) {
                throw new ExcepcionDominio("El retazo #" + retazoId + " ya no se encuentra disponible.");
            }
        }
    }

    /**
     * Compensacion Saga: libera retazos reservados cuando un pago es rechazado, anulado o falla.
     */
    public void liberarRetazosDePedido(Connection con, int pedidoId) throws SQLException {
        String sql = "UPDATE retazos SET estado = 'DISPONIBLE', pedido_id = NULL, actualizado_en = NOW() " +
                "WHERE pedido_id = ? AND UPPER(estado) = 'RESERVADO'";
        try (PreparedStatement pst = con.prepareStatement(sql)) {
            pst.setInt(1, pedidoId);
            pst.executeUpdate();
        }
    }

    public boolean actualizarEstadoRetazo(int id, String nuevoEstado, Double nuevoPrecio) {
        String sql = "UPDATE retazos SET estado = COALESCE(?, estado), " +
                "precio_liquidacion = COALESCE(?, precio_liquidacion), actualizado_en = NOW() WHERE id = ?";
        try (Connection con = Conexion.obtenerConexion();
             PreparedStatement pst = con.prepareStatement(sql)) {
            pst.setString(1, nuevoEstado != null ? nuevoEstado.trim().toUpperCase() : null);
            if (nuevoPrecio != null && nuevoPrecio >= 0) {
                pst.setBigDecimal(2, BigDecimal.valueOf(nuevoPrecio).setScale(2, RoundingMode.HALF_UP));
            } else {
                pst.setNull(2, Types.NUMERIC);
            }
            pst.setInt(3, id);
            return pst.executeUpdate() > 0;
        } catch (SQLException e) {
            System.err.println("[RETAZOS] Error actualizando retazo #" + id + ": " + e.getMessage());
            return false;
        }
    }

    private Retazo mapearRetazo(ResultSet rs) throws SQLException {
        Retazo r = new Retazo();
        r.setId(rs.getInt("id"));
        r.setCodigoRetazo(rs.getString("codigo_retazo"));
        r.setProductoId(rs.getInt("producto_id"));
        if (rs.getObject("rollo_id") != null) r.setRolloId(rs.getInt("rollo_id"));
        r.setNombreProducto(rs.getString("nombre_producto"));
        r.setCategoria(rs.getString("nombre_categoria") != null ? rs.getString("nombre_categoria") : "General");
        r.setMaterial(rs.getString("material_producto"));
        r.setImagen(rs.getString("url_imagen"));
        r.setLargoMetros(rs.getBigDecimal("largo_metros").doubleValue());
        r.setAnchoMetros(rs.getBigDecimal("ancho_metros").doubleValue());
        r.setPrecioOriginal(rs.getBigDecimal("precio_original").doubleValue());
        r.setPrecioLiquidacion(rs.getBigDecimal("precio_liquidacion").doubleValue());
        r.setPorcentajeDescuento(rs.getBigDecimal("porcentaje_descuento").doubleValue());
        r.setEstado(rs.getString("estado"));
        r.setLoteTintoreria(rs.getString("lote_tintoreria"));
        r.setUbicacionBodega(rs.getString("ubicacion_bodega"));
        r.setNotas(rs.getString("notas"));
        if (rs.getObject("pedido_id") != null) r.setPedidoId(rs.getInt("pedido_id"));
        if (rs.getTimestamp("creado_en") != null) {
            r.setCreadoEn(rs.getTimestamp("creado_en").toString().split(" ")[0]);
        }
        r.setItemType("RETAZO");
        return r;
    }
}
