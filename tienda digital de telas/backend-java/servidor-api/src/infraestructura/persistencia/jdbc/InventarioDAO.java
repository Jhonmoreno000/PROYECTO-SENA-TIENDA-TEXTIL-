package infraestructura.persistencia.jdbc;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.sql.Types;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import infraestructura.configuracion.Conexion;
import dominio.modelos.ActividadReciente;
import dominio.modelos.BannerGlobal;
import dominio.modelos.EventoMerma;
import dominio.modelos.LoteInventario;
import dominio.modelos.RolloTextil;
import dominio.modelos.UmbralStock;
import dominio.modelos.VentaDiaria;
import dominio.modelos.VentaRegion;

/**
 * DAO para el inventario de lotes, rollos textiles físicos, eventos de merma,
 * umbrales de alerta, banner global y métricas analíticas ERP en PostgreSQL.
 */
public class InventarioDAO {

    /**
     * Construye una nueva instancia del DAO de inventario y analítica.
     */
    public InventarioDAO() {}

    /**
     * Recupera todos los lotes de inventario registrados uniendo información de producto y categoría.
     *
     * @return Lista (`List<LoteInventario>`) ordenada por identificador ascendente.
     */
    public List<LoteInventario> obtenerTodosLosLotes() {
        List<LoteInventario> lista = new ArrayList<>();
        String consulta = "SELECT l.id, l.producto_id, l.numero_lote, l.metros_recibidos, l.metros_actuales, " +
                          "l.costo_por_metro, l.proveedor, l.estado, l.fecha_recepcion, l.notas, l.creado_en, " +
                          "p.nombre as producto_nombre, c.nombre as producto_categoria " +
                          "FROM lotes_inventario l " +
                          "LEFT JOIN productos p ON l.producto_id = p.id " +
                          "LEFT JOIN categorias c ON p.categoria_id = c.id " +
                          "ORDER BY l.id ASC";
        try (Connection con = Conexion.obtenerConexion();
             PreparedStatement pst = con.prepareStatement(consulta);
             ResultSet rs = pst.executeQuery()) {
            while (rs.next()) {
                LoteInventario b = new LoteInventario();
                b.setId(String.valueOf(rs.getInt("id")));
                if (rs.getObject("producto_id") != null) {
                    b.setIdProducto(rs.getInt("producto_id"));
                }
                b.setNumeroLote(rs.getString("numero_lote"));
                String nom = rs.getString("producto_nombre");
                String cat = rs.getString("producto_categoria");
                String notas = rs.getString("notas");
                String tipoTela = (nom != null && !nom.isBlank()) ? nom
                        : ((cat != null && !cat.isBlank()) ? cat : (notas != null && !notas.isBlank() ? notas : ""));
                b.setTipoTela(tipoTela);
                b.setProveedor(rs.getString("proveedor") != null ? rs.getString("proveedor") : "");
                double metrosRecibidos = rs.getDouble("metros_recibidos");
                double metrosActuales = rs.getObject("metros_actuales") != null
                        ? rs.getDouble("metros_actuales")
                        : metrosRecibidos;
                b.setMetrosIniciales(metrosRecibidos);
                b.setMetrosActuales(metrosActuales);
                b.setCostoPorMetro(rs.getDouble("costo_por_metro"));
                b.setNotas(notas);
                String estado = rs.getString("estado");
                b.setEstado(estado != null && !estado.isBlank() ? estado : "active");
                if (rs.getTimestamp("creado_en") != null) {
                    b.setFechaCreacion(rs.getTimestamp("creado_en").toString().split(" ")[0]);
                }
                if (rs.getDate("fecha_recepcion") != null) {
                    b.setUltimaActualizacion(rs.getDate("fecha_recepcion").toString());
                }
                lista.add(b);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return lista;
    }

    /**
     * Registra un nuevo lote de inventario vinculándolo con el producto correspondiente y su costo real.
     *
     * @param b Entidad {@link LoteInventario} con los datos del lote recibido.
     * @return `true` si el lote fue insertado exitosamente; `false` en caso de error.
     */
    public boolean agregarLote(LoteInventario b) {
        String consulta = "INSERT INTO lotes_inventario (producto_id, numero_lote, metros_recibidos, metros_actuales, costo_por_metro, proveedor, estado, notas) " +
                          "VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        try (Connection con = Conexion.obtenerConexion()) {
            Integer idProducto = b.getIdProducto();
            Double costoUnitario = b.getCostoPorMetro();

            if ((idProducto == null || idProducto <= 0) && b.getTipoTela() != null && !b.getTipoTela().isBlank()) {
                String sqlBuscarProd = "SELECT id, precio FROM productos WHERE LOWER(nombre) LIKE LOWER(?) ORDER BY id ASC LIMIT 1";
                try (PreparedStatement pstProd = con.prepareStatement(sqlBuscarProd)) {
                    pstProd.setString(1, "%" + b.getTipoTela().trim() + "%");
                    try (ResultSet rsProd = pstProd.executeQuery()) {
                        if (rsProd.next()) {
                            idProducto = rsProd.getInt("id");
                        }
                    }
                }
            }

            if ((costoUnitario == null || costoUnitario <= 0) && idProducto != null && idProducto > 0) {
                // 1. Intentar obtener el costo del último lote registrado para este producto
                String sqlCostoLote = "SELECT costo_por_metro FROM lotes_inventario WHERE producto_id = ? AND costo_por_metro > 0 ORDER BY id DESC LIMIT 1";
                try (PreparedStatement pstC = con.prepareStatement(sqlCostoLote)) {
                    pstC.setInt(1, idProducto);
                    try (ResultSet rsC = pstC.executeQuery()) {
                        if (rsC.next()) {
                            costoUnitario = rsC.getDouble("costo_por_metro");
                        }
                    }
                }
                // 2. Si no hay lotes previos, consultar inventario_telas_erp
                if (costoUnitario == null || costoUnitario <= 0) {
                    String sqlErp = "SELECT it.costo_por_metro FROM inventario_telas_erp it JOIN productos p ON LOWER(it.nombre_tela) = LOWER(p.nombre) WHERE p.id = ? LIMIT 1";
                    try (PreparedStatement pstE = con.prepareStatement(sqlErp)) {
                        pstE.setInt(1, idProducto);
                        try (ResultSet rsE = pstE.executeQuery()) {
                            if (rsE.next()) {
                                costoUnitario = rsE.getDouble("costo_por_metro");
                            }
                        }
                    }
                }
            }
            if (costoUnitario == null || costoUnitario <= 0) {
                costoUnitario = 0.0;
            }

            double metrosIniciales = b.getMetrosIniciales() > 0 ? b.getMetrosIniciales() : b.getMetrosActuales();
            if (metrosIniciales <= 0) {
                metrosIniciales = 1.0;
            }
            double metrosActuales = b.getMetrosActuales() > 0 ? b.getMetrosActuales() : metrosIniciales;
            String numeroLote = (b.getNumeroLote() != null && !b.getNumeroLote().isBlank())
                    ? b.getNumeroLote()
                    : ((b.getId() != null && !b.getId().isBlank()) ? b.getId() : "LOTE-" + System.currentTimeMillis());

            try (PreparedStatement pst = con.prepareStatement(consulta, Statement.RETURN_GENERATED_KEYS)) {
                if (idProducto != null && idProducto > 0) {
                    pst.setInt(1, idProducto);
                } else {
                    pst.setNull(1, Types.INTEGER);
                }
                pst.setString(2, numeroLote);
                pst.setDouble(3, metrosIniciales);
                pst.setDouble(4, metrosActuales);
                pst.setDouble(5, costoUnitario);
                pst.setString(6, b.getProveedor() != null && !b.getProveedor().isBlank() ? b.getProveedor() : null);
                pst.setString(7, b.getEstado() != null && !b.getEstado().isBlank() ? b.getEstado() : "active");
                pst.setString(8, b.getNotas() != null ? b.getNotas() : b.getTipoTela());

                int filas = pst.executeUpdate();
                if (filas > 0) {
                    try (ResultSet rs = pst.getGeneratedKeys()) {
                        if (rs.next()) {
                            b.setId(String.valueOf(rs.getInt(1)));
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
     * Actualiza el metraje disponible y el estado operativo de un lote existente.
     *
     * @param idLote Identificador numérico o número de lote (`String`).
     * @param metrosActuales Nuevo metraje disponible (`double`).
     * @param estado Nuevo estado del lote (`String`).
     * @return `true` si se actualizó al menos un lote; `false` en caso contrario.
     */
    public boolean actualizarLote(String idLote, double metrosActuales, String estado) {
        String consulta = "UPDATE lotes_inventario SET metros_actuales = ?, estado = ? WHERE id = ? OR numero_lote = ?";
        try (Connection con = Conexion.obtenerConexion();
             PreparedStatement pst = con.prepareStatement(consulta)) {
            pst.setDouble(1, metrosActuales);
            pst.setString(2, estado != null && !estado.isBlank() ? estado : "active");
            int idNum = -1;
            try { idNum = Integer.parseInt(idLote); } catch (NumberFormatException ignored) {}
            pst.setInt(3, idNum);
            pst.setString(4, idLote);
            return pst.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    /**
     * Recupera todos los rollos físicos registrados en la tabla `rollos_textil`.
     *
     * @return Lista (`List<RolloTextil>`) de rollos físicos con el nombre del producto.
     */
    public List<RolloTextil> obtenerTodosLosRollos() {
        List<RolloTextil> rollos = new ArrayList<>();
        String sql = "SELECT r.*, p.nombre AS nombre_producto " +
                     "FROM rollos_textil r " +
                     "LEFT JOIN productos p ON r.producto_id = p.id " +
                     "ORDER BY r.id ASC";
        try (Connection con = Conexion.obtenerConexion();
             PreparedStatement pst = con.prepareStatement(sql);
             ResultSet rs = pst.executeQuery()) {
            while (rs.next()) {
                rollos.add(mapearRollo(rs));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return rollos;
    }

    /**
     * Recupera los rollos físicos asociados a un producto específico.
     *
     * @param idProducto Identificador único del producto (`int`).
     * @return Lista (`List<RolloTextil>`) de rollos del producto.
     */
    public List<RolloTextil> obtenerRollosPorProducto(int idProducto) {
        List<RolloTextil> rollos = new ArrayList<>();
        String sql = "SELECT r.*, p.nombre AS nombre_producto " +
                     "FROM rollos_textil r " +
                     "LEFT JOIN productos p ON r.producto_id = p.id " +
                     "WHERE r.producto_id = ? " +
                     "ORDER BY r.metraje_remanente DESC, r.id ASC";
        try (Connection con = Conexion.obtenerConexion();
             PreparedStatement pst = con.prepareStatement(sql)) {
            pst.setInt(1, idProducto);
            try (ResultSet rs = pst.executeQuery()) {
                while (rs.next()) {
                    rollos.add(mapearRollo(rs));
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return rollos;
    }

    /**
     * Busca un rollo textil en la base de datos por su código (`ROL-001`) o por su identificador numérico.
     *
     * @param codigoOId Código alfanumérico o ID del rollo (`String`).
     * @return Instancia de {@link RolloTextil} encontrada, o el primer rollo disponible si no se especifica.
     */
    public RolloTextil obtenerRolloPorCodigoOId(String codigoOId) {
        String sqlEspecifico = "SELECT r.*, p.nombre AS nombre_producto " +
                               "FROM rollos_textil r " +
                               "LEFT JOIN productos p ON r.producto_id = p.id " +
                               "WHERE UPPER(r.codigo_rollo) = UPPER(?) OR r.id = ? " +
                               "LIMIT 1";
        String sqlPrimero = "SELECT r.*, p.nombre AS nombre_producto " +
                            "FROM rollos_textil r " +
                            "LEFT JOIN productos p ON r.producto_id = p.id " +
                            "ORDER BY r.id ASC LIMIT 1";
        try (Connection con = Conexion.obtenerConexion()) {
            if (codigoOId != null && !codigoOId.isBlank()) {
                int idNum = -1;
                try { idNum = Integer.parseInt(codigoOId.trim()); } catch (NumberFormatException ignored) {}
                try (PreparedStatement pst = con.prepareStatement(sqlEspecifico)) {
                    pst.setString(1, codigoOId.trim());
                    pst.setInt(2, idNum);
                    try (ResultSet rs = pst.executeQuery()) {
                        if (rs.next()) {
                            return mapearRollo(rs);
                        }
                    }
                }
            }
            try (PreparedStatement pst = con.prepareStatement(sqlPrimero);
                 ResultSet rs = pst.executeQuery()) {
                if (rs.next()) {
                    return mapearRollo(rs);
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return null;
    }

    /**
     * Persiste el resultado de un corte sobre un rollo textil y registra el evento de merma si se generó retazo.
     *
     * @param rollo Rollo textil actualizado ({@link RolloTextil}).
     * @param mermaOpcional Evento de merma por retazo sub-metro ({@link EventoMerma}) o `null`.
     * @return `true` si la actualización transaccional fue exitosa; `false` en caso de error.
     */
    public boolean actualizarRolloDespuesDeCorte(RolloTextil rollo, EventoMerma mermaOpcional) {
        if (rollo == null) return false;
        String sqlRollo = "UPDATE rollos_textil SET metraje_remanente = ?, estado = ?, actualizado_en = NOW() WHERE id = ?";
        try (Connection con = Conexion.obtenerConexion()) {
            con.setAutoCommit(false);
            try {
                try (PreparedStatement pst = con.prepareStatement(sqlRollo)) {
                    pst.setDouble(1, rollo.getMetrajeRemanente());
                    pst.setString(2, rollo.getEstado());
                    pst.setInt(3, rollo.getId());
                    pst.executeUpdate();
                }
                if (mermaOpcional != null) {
                    mermaOpcional.setIdProducto(rollo.getProductoId());
                    agregarEventoMermaEnConexion(con, mermaOpcional);
                }
                // Sincronizar productos.stock con SUM(metraje_remanente) de rollos disponibles
                String sqlSyncStock = "UPDATE productos SET stock = (SELECT COALESCE(SUM(metraje_remanente), 0) FROM rollos_textil WHERE producto_id = ? AND estado = 'disponible'), actualizado_en = NOW() WHERE id = ?";
                try (PreparedStatement pstStock = con.prepareStatement(sqlSyncStock)) {
                    pstStock.setInt(1, rollo.getProductoId());
                    pstStock.setInt(2, rollo.getProductoId());
                    pstStock.executeUpdate();
                }
                con.commit();
                return true;
            } catch (SQLException e) {
                con.rollback();
                e.printStackTrace();
                return false;
            }
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    /**
     * Registra un nuevo rollo textil físico en `rollos_textil` y sincroniza el stock del producto en PostgreSQL.
     *
     * @param rollo Entidad {@link RolloTextil} con los datos del rollo ingresado.
     * @return `true` si se insertó y sincronizó correctamente; `false` en caso contrario.
     */
    public boolean agregarRollo(RolloTextil rollo) {
        if (rollo == null || rollo.getProductoId() <= 0) return false;
        String sql = "INSERT INTO rollos_textil (producto_id, codigo_rollo, metraje_inicial, metraje_remanente, lote_tintoreria, estado, ubicacion_bodega) " +
                     "VALUES (?, ?, ?, ?, ?, ?, ?)";
        try (Connection con = Conexion.obtenerConexion()) {
            con.setAutoCommit(false);
            try {
                int idGenerado = -1;
                try (PreparedStatement pst = con.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
                    pst.setInt(1, rollo.getProductoId());
                    pst.setString(2, rollo.getCodigoRollo() != null && !rollo.getCodigoRollo().isBlank()
                            ? rollo.getCodigoRollo()
                            : "ROL-" + System.currentTimeMillis());
                    double inicial = rollo.getMetrajeInicial() > 0 ? rollo.getMetrajeInicial() : rollo.getMetrajeRemanente();
                    double remanente = rollo.getMetrajeRemanente() > 0 ? rollo.getMetrajeRemanente() : inicial;
                    pst.setDouble(3, inicial);
                    pst.setDouble(4, remanente);
                    pst.setString(5, rollo.getLoteTintoreria() != null ? rollo.getLoteTintoreria() : "SIN-LOTE");
                    pst.setString(6, rollo.getEstado() != null ? rollo.getEstado() : "disponible");
                    pst.setString(7, rollo.getUbicacionBodega() != null ? rollo.getUbicacionBodega() : "Bodega Central");
                    pst.executeUpdate();
                    try (ResultSet rs = pst.getGeneratedKeys()) {
                        if (rs.next()) {
                            idGenerado = rs.getInt(1);
                            rollo.setId(idGenerado);
                        }
                    }
                }
                // Sincronizar productos.stock
                String sqlSync = "UPDATE productos SET stock = (SELECT COALESCE(SUM(metraje_remanente), 0) FROM rollos_textil WHERE producto_id = ? AND estado = 'disponible'), actualizado_en = NOW() WHERE id = ?";
                try (PreparedStatement pstSync = con.prepareStatement(sqlSync)) {
                    pstSync.setInt(1, rollo.getProductoId());
                    pstSync.setInt(2, rollo.getProductoId());
                    pstSync.executeUpdate();
                }
                con.commit();
                return idGenerado > 0;
            } catch (SQLException e) {
                con.rollback();
                e.printStackTrace();
                return false;
            }
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    /**
     * Convierte una fila del {@link ResultSet} en un objeto {@link RolloTextil}.
     *
     * @param rs Conjunto de resultados posicionado en la fila actual ({@link ResultSet}).
     * @return Objeto {@link RolloTextil} poblado.
     * @throws SQLException Si ocurre un error leyendo las columnas.
     */
    private RolloTextil mapearRollo(ResultSet rs) throws SQLException {
        RolloTextil r = new RolloTextil();
        r.setId(rs.getInt("id"));
        r.setProductoId(rs.getInt("producto_id"));
        r.setNombreProducto(rs.getString("nombre_producto"));
        r.setCodigoRollo(rs.getString("codigo_rollo"));
        r.setMetrajeInicial(rs.getDouble("metraje_inicial"));
        r.setMetrajeRemanente(rs.getDouble("metraje_remanente"));
        r.setLoteTintoreria(rs.getString("lote_tintoreria"));
        r.setEstado(rs.getString("estado"));
        r.setUbicacionBodega(rs.getString("ubicacion_bodega"));
        return r;
    }

    /**
     * Recupera todos los eventos de merma registrados con los datos reales de lote y responsable.
     *
     * @return Lista (`List<EventoMerma>`) ordenada del evento más reciente al más antiguo.
     */
    public List<EventoMerma> obtenerTodosLosEventosMerma() {
        List<EventoMerma> lista = new ArrayList<>();
        String consulta = "SELECT e.*, u.nombre AS usuario_nombre " +
                          "FROM eventos_merma e " +
                          "LEFT JOIN usuarios u ON e.usuario_id = u.id " +
                          "ORDER BY e.id DESC";
        try (Connection con = Conexion.obtenerConexion();
             PreparedStatement pst = con.prepareStatement(consulta);
             ResultSet rs = pst.executeQuery()) {
            while (rs.next()) {
                EventoMerma w = new EventoMerma();
                w.setId(rs.getInt("id"));
                if (rs.getObject("producto_id") != null) {
                    w.setIdProducto(rs.getInt("producto_id"));
                }
                String lote = rs.getString("id_lote");
                if (lote == null || lote.isBlank()) {
                    lote = rs.getObject("producto_id") != null ? String.valueOf(rs.getInt("producto_id")) : "";
                }
                w.setIdLote(lote);
                w.setMetros(rs.getDouble("metros_perdidos"));
                w.setMotivo(rs.getString("motivo"));
                double impacto = rs.getDouble("impacto_costo");
                w.setImpactoCosto(impacto);
                String desc = rs.getString("descripcion");
                w.setDescripcion(desc != null && !desc.isBlank()
                        ? desc
                        : "Merma registrada por " + rs.getString("motivo") + " (Costo: $" + Math.round(impacto) + ")");
                String resp = rs.getString("responsable");
                if (resp == null || resp.isBlank()) {
                    resp = rs.getString("usuario_nombre");
                }
                w.setResponsable(resp != null && !resp.isBlank() ? resp : "");
                String fecha = rs.getTimestamp("creado_en") != null ? rs.getTimestamp("creado_en").toString().split(" ")[0] : "";
                w.setFechaCreacion(fecha);
                w.setFechaEvento(fecha);
                w.setIdUsuario(rs.getObject("usuario_id") != null ? rs.getInt("usuario_id") : 0);
                lista.add(w);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return lista;
    }

    /**
     * Registra un nuevo evento de merma calculando su impacto económico real desde el lote o producto en PostgreSQL.
     *
     * @param w Entidad {@link EventoMerma} a registrar.
     * @return `true` si se registró exitosamente; `false` en caso de error.
     */
    public boolean agregarEventoMerma(EventoMerma w) {
        try (Connection con = Conexion.obtenerConexion()) {
            con.setAutoCommit(false);
            try {
                boolean ok = agregarEventoMermaEnConexion(con, w);
                con.commit();
                return ok;
            } catch (SQLException e) {
                con.rollback();
                e.printStackTrace();
                return false;
            }
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    /**
     * Inserta un evento de merma usando una conexión activa y descuenta el metraje del lote correspondiente.
     *
     * @param con Conexión JDBC activa ({@link Connection}).
     * @param w Entidad {@link EventoMerma} a insertar.
     * @return `true` si se insertó el registro.
     * @throws SQLException Si ocurre un error SQL durante el proceso.
     */
    private boolean agregarEventoMermaEnConexion(Connection con, EventoMerma w) throws SQLException {
        Integer idProducto = w.getIdProducto();
        Double costoMetro = null;
        String idLote = w.getIdLote();

        if (idLote != null && !idLote.isBlank()) {
            int idLoteNum = -1;
            try { idLoteNum = Integer.parseInt(idLote.trim()); } catch (NumberFormatException ignored) {}
            String sqlBuscarLote = "SELECT id, producto_id, costo_por_metro, metros_actuales FROM lotes_inventario " +
                    "WHERE id = ? OR numero_lote = ? OR numero_lote = (SELECT lote_tintoreria FROM rollos_textil WHERE codigo_rollo = ? OR CAST(id AS VARCHAR) = ?) LIMIT 1";
            try (PreparedStatement pstLote = con.prepareStatement(sqlBuscarLote)) {
                pstLote.setInt(1, idLoteNum);
                pstLote.setString(2, idLote.trim());
                pstLote.setString(3, idLote.trim());
                pstLote.setString(4, idLote.trim());
                try (ResultSet rs = pstLote.executeQuery()) {
                    if (rs.next()) {
                        int loteDbId = rs.getInt("id");
                        if (idProducto == null && rs.getObject("producto_id") != null) {
                            idProducto = rs.getInt("producto_id");
                        }
                        costoMetro = rs.getDouble("costo_por_metro");
                        double restantes = Math.max(0.0, rs.getDouble("metros_actuales") - w.getMetros());
                        String nuevoEstado = restantes <= 0 ? "depleted" : (restantes < 20 ? "low" : "active");
                        try (PreparedStatement pstUpd = con.prepareStatement("UPDATE lotes_inventario SET metros_actuales = ?, estado = ? WHERE id = ?")) {
                            pstUpd.setDouble(1, restantes);
                            pstUpd.setString(2, nuevoEstado);
                            pstUpd.setInt(3, loteDbId);
                            pstUpd.executeUpdate();
                        }
                    }
                }
            }
        }

        if ((costoMetro == null || costoMetro <= 0) && idProducto != null && idProducto > 0) {
            String sqlCosto = "SELECT costo_por_metro FROM lotes_inventario WHERE producto_id = ? AND costo_por_metro > 0 ORDER BY id DESC LIMIT 1";
            try (PreparedStatement pstC = con.prepareStatement(sqlCosto)) {
                pstC.setInt(1, idProducto);
                try (ResultSet rsC = pstC.executeQuery()) {
                    if (rsC.next()) costoMetro = rsC.getDouble("costo_por_metro");
                }
            }
            if (costoMetro == null || costoMetro <= 0) {
                String sqlErp = "SELECT it.costo_por_metro FROM inventario_telas_erp it JOIN productos p ON LOWER(it.nombre_tela) = LOWER(p.nombre) WHERE p.id = ? LIMIT 1";
                try (PreparedStatement pstE = con.prepareStatement(sqlErp)) {
                    pstE.setInt(1, idProducto);
                    try (ResultSet rsE = pstE.executeQuery()) {
                        if (rsE.next()) costoMetro = rsE.getDouble("costo_por_metro");
                    }
                }
            }
        }

        double costoEfectivo = (costoMetro != null && costoMetro > 0) ? costoMetro : 0.0;
        double impactoCosto = (w.getImpactoCosto() != null && w.getImpactoCosto() > 0)
                ? w.getImpactoCosto()
                : Math.round(w.getMetros() * costoEfectivo * 100.0) / 100.0;

        String consulta = "INSERT INTO eventos_merma (producto_id, id_lote, metros_perdidos, motivo, descripcion, impacto_costo, responsable, usuario_id) " +
                          "VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        try (PreparedStatement pst = con.prepareStatement(consulta, Statement.RETURN_GENERATED_KEYS)) {
            if (idProducto != null && idProducto > 0) pst.setInt(1, idProducto); else pst.setNull(1, Types.INTEGER);
            pst.setString(2, idLote);
            pst.setDouble(3, w.getMetros());
            pst.setString(4, w.getMotivo() != null ? w.getMotivo() : "Desperdicio");
            pst.setString(5, w.getDescripcion());
            pst.setDouble(6, impactoCosto);
            pst.setString(7, w.getResponsable());
            if (w.getIdUsuario() > 0) pst.setInt(8, w.getIdUsuario()); else pst.setNull(8, Types.INTEGER);

            int filas = pst.executeUpdate();
            if (filas > 0) {
                try (ResultSet rs = pst.getGeneratedKeys()) {
                    if (rs.next()) {
                        w.setId(rs.getInt(1));
                    }
                }
                return true;
            }
            return false;
        }
    }

    /**
     * Recupera todos los umbrales de alerta de stock configurados.
     *
     * @return Lista (`List<UmbralStock>`) ordenada por identificador.
     */
    public List<UmbralStock> obtenerTodosLosUmbrales() {
        List<UmbralStock> lista = new ArrayList<>();
        String consulta = "SELECT * FROM umbrales_stock ORDER BY id";
        try (Connection con = Conexion.obtenerConexion();
             PreparedStatement pst = con.prepareStatement(consulta);
             ResultSet rs = pst.executeQuery()) {
            while (rs.next()) {
                UmbralStock t = new UmbralStock();
                t.setId(rs.getInt("id"));
                t.setTipoTela(rs.getString("tipo_tela"));
                t.setMetrosMinimos(rs.getDouble("metros_minimos"));
                t.setAlertaHabilitada(rs.getBoolean("alerta_activa"));
                lista.add(t);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return lista;
    }

    /**
     * Actualiza o inserta el metraje mínimo de alerta para un tipo de tela.
     *
     * @param tipoTela Nombre o categoría de la tela (`String`).
     * @param metrosMinimos Cantidad mínima en metros (`double`).
     * @return `true` si se actualizó o insertó el umbral; `false` en caso de error.
     */
    public boolean actualizarUmbral(String tipoTela, double metrosMinimos) {
        String consulta = "INSERT INTO umbrales_stock (tipo_tela, metros_minimos, alerta_activa) VALUES (?, ?, true) " +
                          "ON CONFLICT (tipo_tela) DO UPDATE SET metros_minimos = EXCLUDED.metros_minimos";
        try (Connection con = Conexion.obtenerConexion();
             PreparedStatement pst = con.prepareStatement(consulta)) {
            pst.setString(1, tipoTela);
            pst.setDouble(2, metrosMinimos);
            return pst.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    /**
     * Recupera el historial de ventas diarias de los últimos 30 días.
     *
     * @return Lista (`List<VentaDiaria>`) ordenada por fecha descendente.
     */
    public List<VentaDiaria> obtenerVentasDiarias() {
        List<VentaDiaria> lista = new ArrayList<>();
        String consulta = "SELECT * FROM ventas_diarias ORDER BY fecha_venta DESC LIMIT 30";
        try (Connection con = Conexion.obtenerConexion();
             PreparedStatement pst = con.prepareStatement(consulta);
             ResultSet rs = pst.executeQuery()) {
            while (rs.next()) {
                VentaDiaria d = new VentaDiaria();
                d.setId(rs.getInt("id"));
                if (rs.getDate("fecha_venta") != null) {
                    d.setFechaVenta(rs.getDate("fecha_venta").toString());
                }
                d.setTotalVentas(rs.getDouble("ventas_totales"));
                d.setTotalPedidos(rs.getInt("pedidos_totales"));
                if (rs.getTimestamp("creado_en") != null) {
                    d.setFechaCreacion(rs.getTimestamp("creado_en").toString());
                }
                lista.add(d);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return lista;
    }

    /**
     * Recupera la configuración del banner global informativo.
     *
     * @return Instancia de {@link BannerGlobal} o `null` si no existe.
     */
    public BannerGlobal obtenerBanner() {
        String consulta = "SELECT * FROM banner_global ORDER BY id LIMIT 1";
        try (Connection con = Conexion.obtenerConexion();
             PreparedStatement pst = con.prepareStatement(consulta);
             ResultSet rs = pst.executeQuery()) {
            if (rs.next()) {
                BannerGlobal b = new BannerGlobal();
                b.setId(rs.getInt("id"));
                b.setHabilitado(rs.getBoolean("activo"));
                b.setMensaje(rs.getString("mensaje"));
                b.setTipoBanner(rs.getString("tipo_banner"));
                if (rs.getTimestamp("actualizado_en") != null) {
                    b.setFechaActualizacion(rs.getTimestamp("actualizado_en").toString());
                }
                return b;
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return null;
    }

    /**
     * Actualiza o crea el registro del banner global de la tienda.
     *
     * @param habilitado Indica si el banner debe mostrarse (`boolean`).
     * @param mensaje Texto del banner (`String`).
     * @param tipoBanner Estilo visual (`String`).
     * @return `true` si se guardó correctamente; `false` en caso de error.
     */
    public boolean actualizarBanner(boolean habilitado, String mensaje, String tipoBanner) {
        String consulta = "UPDATE banner_global SET activo = ?, mensaje = ?, tipo_banner = ?, actualizado_en = NOW() WHERE id = (SELECT id FROM banner_global ORDER BY id LIMIT 1)";
        try (Connection con = Conexion.obtenerConexion();
             PreparedStatement pst = con.prepareStatement(consulta)) {
            pst.setBoolean(1, habilitado);
            pst.setString(2, mensaje != null ? mensaje : "");
            pst.setString(3, tipoBanner != null ? tipoBanner : "info");
            int filas = pst.executeUpdate();
            if (filas == 0) {
                String consultaInsertar = "INSERT INTO banner_global (activo, mensaje, tipo_banner) VALUES (?, ?, ?)";
                try (PreparedStatement ins = con.prepareStatement(consultaInsertar)) {
                    ins.setBoolean(1, habilitado);
                    ins.setString(2, mensaje != null ? mensaje : "");
                    ins.setString(3, tipoBanner != null ? tipoBanner : "info");
                    return ins.executeUpdate() > 0;
                }
            }
            return true;
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    /**
     * Recupera el consolidado de ventas por región leyendo los totales reales desde `ventas_region` y `pedidos`.
     *
     * @return Lista (`List<VentaRegion>`) ordenada por monto de ventas descendente.
     */
    public List<VentaRegion> obtenerVentasPorRegion() {
        List<VentaRegion> lista = new ArrayList<>();
        String consulta = "SELECT vr.id, vr.region, vr.capital, vr.ventas_totales, vr.pedidos_totales, vr.porcentaje, " +
                          "(SELECT COUNT(*) FROM pedidos p WHERE LOWER(p.departamento_envio) = LOWER(vr.region) OR LOWER(p.ciudad_envio) = LOWER(vr.region)) AS conteo_pedidos_reales " +
                          "FROM ventas_region vr ORDER BY vr.ventas_totales DESC";
        try (Connection con = Conexion.obtenerConexion();
             PreparedStatement pst = con.prepareStatement(consulta);
             ResultSet rs = pst.executeQuery()) {
            while (rs.next()) {
                VentaRegion r = new VentaRegion();
                r.setId(rs.getInt("id"));
                String region = rs.getString("region");
                String capital = rs.getString("capital");
                r.setDepartamento(region);
                r.setCapital(capital != null && !capital.isBlank() ? capital : region);
                r.setVentas(rs.getDouble("ventas_totales"));
                r.setPorcentaje(rs.getDouble("porcentaje"));
                int pedidosTabla = rs.getInt("pedidos_totales");
                int pedidosReales = rs.getInt("conteo_pedidos_reales");
                r.setPedidos(pedidosTabla > 0 ? pedidosTabla + pedidosReales : pedidosReales);
                lista.add(r);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return lista;
    }

    /**
     * Recupera los 20 eventos más recientes registrados en la bitácora de actividad.
     *
     * @return Lista (`List<ActividadReciente>`) ordenada por fecha descendente.
     */
    public List<ActividadReciente> obtenerActividadReciente() {
        List<ActividadReciente> lista = new ArrayList<>();
        String consulta = "SELECT * FROM actividad_reciente ORDER BY creado_en DESC LIMIT 20";
        try (Connection con = Conexion.obtenerConexion();
             PreparedStatement pst = con.prepareStatement(consulta);
             ResultSet rs = pst.executeQuery()) {
            while (rs.next()) {
                ActividadReciente a = new ActividadReciente();
                a.setId(rs.getInt("id"));
                a.setTipo(rs.getString("tipo"));
                a.setIdUsuario(rs.getInt("usuario_id"));
                a.setNombreUsuario(rs.getString("nombre_usuario"));
                a.setAccion(rs.getString("accion"));
                if (rs.getTimestamp("creado_en") != null) {
                    a.setFechaCreacion(rs.getTimestamp("creado_en").toString());
                }
                a.setIcono("Activity");
                lista.add(a);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return lista;
    }

    /**
     * Registra un nuevo evento en la tabla `actividad_reciente`.
     *
     * @param a Entidad {@link ActividadReciente} a insertar.
     * @return `true` si se insertó correctamente; `false` en caso de error.
     */
    public boolean agregarActividad(ActividadReciente a) {
        String consulta = "INSERT INTO actividad_reciente (tipo, usuario_id, nombre_usuario, accion) VALUES (?, ?, ?, ?)";
        try (Connection con = Conexion.obtenerConexion();
             PreparedStatement pst = con.prepareStatement(consulta)) {
            pst.setString(1, a.getTipo() != null ? a.getTipo() : "sistema");
            if (a.getIdUsuario() > 0) pst.setInt(2, a.getIdUsuario()); else pst.setNull(2, Types.INTEGER);
            pst.setString(3, a.getNombreUsuario());
            pst.setString(4, a.getAccion());
            return pst.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    /**
     * Recupera las métricas históricas de ventas reales vs objetivo del módulo ERP.
     *
     * @return Lista (`List<Map<String, Object>>`) de registros diarios ERP.
     */
    public List<Map<String, Object>> obtenerMetricasVentasErp() {
        List<Map<String, Object>> lista = new ArrayList<>();
        String consulta = "SELECT fecha_registro, ventas_reales, ventas_objetivo, margen_ganancia FROM metricas_ventas_erp ORDER BY fecha_registro ASC LIMIT 30";
        try (Connection con = Conexion.obtenerConexion();
             PreparedStatement pst = con.prepareStatement(consulta);
             ResultSet rs = pst.executeQuery()) {
            while (rs.next()) {
                Map<String, Object> fila = new LinkedHashMap<>();
                fila.put("recordDate", rs.getDate("fecha_registro").toString());
                fila.put("actualSales", rs.getDouble("ventas_reales"));
                fila.put("targetSales", rs.getDouble("ventas_objetivo"));
                fila.put("profitMargin", rs.getDouble("margen_ganancia"));
                lista.add(fila);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return lista;
    }

    /**
     * Recupera las notificaciones operativas del sistema ERP.
     *
     * @return Lista (`List<Map<String, Object>>`) de notificaciones recientes.
     */
    public List<Map<String, Object>> obtenerNotificacionesErp() {
        List<Map<String, Object>> lista = new ArrayList<>();
        String consulta = "SELECT id, tipo, titulo, mensaje, leido, creado_en FROM notificaciones_sistema_erp ORDER BY creado_en DESC LIMIT 20";
        try (Connection con = Conexion.obtenerConexion();
             PreparedStatement pst = con.prepareStatement(consulta);
             ResultSet rs = pst.executeQuery()) {
            while (rs.next()) {
                Map<String, Object> fila = new LinkedHashMap<>();
                fila.put("id", rs.getInt("id"));
                fila.put("type", rs.getString("tipo"));
                fila.put("titulo", rs.getString("titulo"));
                fila.put("mensaje", rs.getString("mensaje"));
                fila.put("isRead", rs.getBoolean("leido"));
                if (rs.getTimestamp("creado_en") != null) {
                    fila.put("createdAt", rs.getTimestamp("creado_en").toString());
                }
                lista.add(fila);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return lista;
    }

    /**
     * Recupera el inventario consolidado de telas del módulo ERP.
     *
     * @return Lista (`List<Map<String, Object>>`) de referencias textiles ERP.
     */
    public List<Map<String, Object>> obtenerInventarioTelasErp() {
        List<Map<String, Object>> lista = new ArrayList<>();
        String consulta = "SELECT id, sku, nombre_tela, categoria, proveedor, metros_actuales, metros_minimos, costo_por_metro, fecha_ultima_reposicion FROM inventario_telas_erp ORDER BY nombre_tela ASC";
        try (Connection con = Conexion.obtenerConexion();
             PreparedStatement pst = con.prepareStatement(consulta);
             ResultSet rs = pst.executeQuery()) {
            while (rs.next()) {
                Map<String, Object> fila = new LinkedHashMap<>();
                fila.put("id", rs.getInt("id"));
                fila.put("sku", rs.getString("sku"));
                fila.put("fabricName", rs.getString("nombre_tela"));
                fila.put("categoria", rs.getString("categoria"));
                fila.put("proveedor", rs.getString("proveedor"));
                double actual = rs.getDouble("metros_actuales");
                double umbral = rs.getDouble("metros_minimos");
                fila.put("currentMeters", actual);
                fila.put("minThresholdMeters", umbral);
                fila.put("costPerMeter", rs.getDouble("costo_por_metro"));
                fila.put("lowStock", actual <= umbral);
                if (rs.getDate("fecha_ultima_reposicion") != null) {
                    fila.put("lastRestockDate", rs.getDate("fecha_ultima_reposicion").toString());
                }
                lista.add(fila);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return lista;
    }
}
