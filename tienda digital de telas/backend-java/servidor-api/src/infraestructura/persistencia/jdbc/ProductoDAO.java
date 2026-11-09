package infraestructura.persistencia.jdbc;

import java.io.File;
import java.io.FileOutputStream;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;

import dominio.modelos.Producto;
import infraestructura.configuracion.Conexion;

/**
 * Objeto de acceso a datos (DAO) para la entidad `Producto`.
 * Gestiona todas las operaciones CRUD, moderación y multimedia sobre las tablas
 * `productos`, `categorias` e `imagenes_producto` en PostgreSQL.
 */
public class ProductoDAO {

    /**
     * Recupera un producto activo por su identificador único.
     *
     * @param idProducto Identificador numérico del producto (`int`).
     * @return Instancia de `Producto` o `null` si no existe o está inactivo.
     */
    public Producto obtenerProductoPorId(int idProducto) {
        String consulta = "SELECT p.*, c.nombre AS nombre_categoria, u.nombre AS nombre_vendedor " +
                "FROM productos p " +
                "LEFT JOIN categorias c ON p.categoria_id = c.id " +
                "LEFT JOIN usuarios u ON p.vendedor_id = u.id " +
                "WHERE p.id = ? AND p.activo = true";

        try (Connection conexion = Conexion.obtenerConexion();
             PreparedStatement sentencia = conexion.prepareStatement(consulta)) {
            sentencia.setInt(1, idProducto);
            try (ResultSet resultado = sentencia.executeQuery()) {
                if (resultado.next()) {
                    return mapearProducto(conexion, resultado);
                }
            }
        } catch (SQLException e) {
            System.err.println("[ERROR] Error obteniendo producto por ID: " + e.getMessage());
            e.printStackTrace();
        }
        return null;
    }

    /**
     * Recupera todos los productos activos del catálogo.
     *
     * @return Lista de objetos `Producto` activos.
     */
    public List<Producto> obtenerTodosLosProductos() {
        List<Producto> productos = new ArrayList<>();

        String consulta = "SELECT p.*, c.nombre AS nombre_categoria, u.nombre AS nombre_vendedor " +
                "FROM productos p " +
                "LEFT JOIN categorias c ON p.categoria_id = c.id " +
                "LEFT JOIN usuarios u ON p.vendedor_id = u.id " +
                "WHERE p.activo = true " +
                "ORDER BY p.id ASC";

        try (Connection conexion = Conexion.obtenerConexion();
             PreparedStatement sentencia = conexion.prepareStatement(consulta);
             ResultSet resultado = sentencia.executeQuery()) {

            while (resultado.next()) {
                productos.add(mapearProducto(conexion, resultado));
            }
        } catch (SQLException e) {
            System.err.println("[ERROR] Error obteniendo todos los productos: " + e.getMessage());
            e.printStackTrace();
        }
        return productos;
    }

    /**
     * Recupera los productos activos pertenecientes a un vendedor específico.
     *
     * @param idVendedor Identificador único del vendedor (`int`).
     * @return Lista de productos activos del vendedor.
     */
    public List<Producto> obtenerProductosPorVendedor(int idVendedor) {
        List<Producto> productos = new ArrayList<>();

        String consulta = "SELECT p.*, c.nombre AS nombre_categoria, u.nombre AS nombre_vendedor " +
                "FROM productos p " +
                "LEFT JOIN categorias c ON p.categoria_id = c.id " +
                "LEFT JOIN usuarios u ON p.vendedor_id = u.id " +
                "WHERE p.vendedor_id = ? AND p.activo = true " +
                "ORDER BY p.id ASC";

        try (Connection conexion = Conexion.obtenerConexion();
             PreparedStatement sentencia = conexion.prepareStatement(consulta)) {
            sentencia.setInt(1, idVendedor);
            try (ResultSet resultado = sentencia.executeQuery()) {
                while (resultado.next()) {
                    productos.add(mapearProducto(conexion, resultado));
                }
            }
        } catch (SQLException e) {
            System.err.println("[ERROR] Error obteniendo productos por vendedor: " + e.getMessage());
            e.printStackTrace();
        }
        return productos;
    }

    /**
     * Obtiene las URLs de las imágenes asociadas a un producto ordenadas por visualización.
     *
     * @param conexion   Conexión JDBC activa (`Connection`).
     * @param idProducto Identificador del producto (`int`).
     * @return Lista de rutas o URLs de imagen (`List<String>`).
     */
    private List<String> obtenerImagenesProducto(Connection conexion, int idProducto) {
        List<String> imagenes = new ArrayList<>();
        String consulta = "SELECT url_imagen FROM imagenes_producto WHERE producto_id = ? ORDER BY orden_visualizacion ASC";

        try (PreparedStatement sentencia = conexion.prepareStatement(consulta)) {
            sentencia.setInt(1, idProducto);
            try (ResultSet resultado = sentencia.executeQuery()) {
                while (resultado.next()) {
                    imagenes.add(resultado.getString("url_imagen"));
                }
            }
        } catch (SQLException e) {
            System.err.println("[ERROR] Error obteniendo imágenes de producto: " + e.getMessage());
            e.printStackTrace();
        }
        return imagenes;
    }

    /**
     * Guarda una imagen codificada en Base64 en disco tras validar sus magic bytes y actualiza PostgreSQL.
     *
     * @param idProducto  Identificador del producto (`int`).
     * @param datosBase64 Cadena en formato Base64 o Data URI (`String`).
     * @return Ruta pública `/uploads/...` de la imagen guardada o `null` si el formato es inválido.
     */
    public String guardarImagenProducto(int idProducto, String datosBase64) {
        try {
            String base64 = datosBase64;
            String extension = "png";
            if (datosBase64.contains(",")) {
                String encabezado = datosBase64.substring(0, datosBase64.indexOf(','));
                base64 = datosBase64.substring(datosBase64.indexOf(',') + 1);
                if (encabezado.contains("jpeg") || encabezado.contains("jpg"))
                    extension = "jpg";
                else if (encabezado.contains("webp"))
                    extension = "webp";
                else if (encabezado.contains("gif"))
                    extension = "gif";
            }

            byte[] bytesImagen = Base64.getDecoder().decode(base64.trim());
            if (!esImagenValida(bytesImagen)) {
                System.err.println("[SEGURIDAD] Archivo rechazado: los magic bytes no corresponden a una imagen válida.");
                return null;
            }

            File carpetaSubidas = new File("uploads");
            if (!carpetaSubidas.exists())
                carpetaSubidas.mkdirs();

            String nombreArchivo = "product_" + idProducto + "_" + System.currentTimeMillis() + "." + extension;
            File archivoImagen = new File(carpetaSubidas, nombreArchivo);
            try (FileOutputStream fos = new FileOutputStream(archivoImagen)) {
                fos.write(bytesImagen);
            }

            String urlImagen = "/uploads/" + nombreArchivo;

            try (Connection conexion = Conexion.obtenerConexion()) {
                List<String> imagenesAnteriores = obtenerImagenesProducto(conexion, idProducto);

                String consultaEliminar = "DELETE FROM imagenes_producto WHERE producto_id = ?";
                try (PreparedStatement sentenciaEliminar = conexion.prepareStatement(consultaEliminar)) {
                    sentenciaEliminar.setInt(1, idProducto);
                    sentenciaEliminar.executeUpdate();
                }

                for (String urlAnterior : imagenesAnteriores) {
                    if (urlAnterior != null && urlAnterior.startsWith("/uploads/")) {
                        String nombreAnterior = urlAnterior.substring("/uploads/".length());
                        File archivoAnterior = new File(carpetaSubidas, nombreAnterior);
                        if (archivoAnterior.exists() && archivoAnterior.isFile()) {
                            archivoAnterior.delete();
                        }
                    }
                }

                String consultaInsertar = "INSERT INTO imagenes_producto (producto_id, url_imagen, orden_visualizacion) VALUES (?, ?, 0)";
                try (PreparedStatement sentenciaInsertar = conexion.prepareStatement(consultaInsertar)) {
                    sentenciaInsertar.setInt(1, idProducto);
                    sentenciaInsertar.setString(2, urlImagen);
                    sentenciaInsertar.executeUpdate();
                }
            }

            return urlImagen;
        } catch (Exception e) {
            System.err.println("[ERROR] Error guardando imagen de producto: " + e.getMessage());
            e.printStackTrace();
            return null;
        }
    }

    /**
     * Valida que los bytes decodificados correspondan a cabeceras binarias reales de PNG, JPEG, GIF o WebP.
     *
     * @param bytes Arreglo de bytes del archivo (`byte[]`).
     * @return `true` si la firma binaria es válida; `false` en caso contrario.
     */
    private boolean esImagenValida(byte[] bytes) {
        if (bytes == null || bytes.length < 12) return false;
        boolean esPng = (bytes[0] & 0xFF) == 0x89 && bytes[1] == 0x50 && bytes[2] == 0x4E && bytes[3] == 0x47;
        boolean esJpg = (bytes[0] & 0xFF) == 0xFF && (bytes[1] & 0xFF) == 0xD8 && (bytes[2] & 0xFF) == 0xFF;
        boolean esGif = bytes[0] == 'G' && bytes[1] == 'I' && bytes[2] == 'F' && bytes[3] == '8';
        boolean esWebp = bytes[0] == 'R' && bytes[1] == 'I' && bytes[2] == 'F' && bytes[3] == 'F'
                && bytes[8] == 'W' && bytes[9] == 'E' && bytes[10] == 'B' && bytes[11] == 'P';
        return esPng || esJpg || esGif || esWebp;
    }

    /**
     * Actualiza directamente el precio unitario y existencias de un producto.
     *
     * @param idProducto  Identificador del producto (`int`).
     * @param precio      Nuevo precio por metro (`double`).
     * @param existencias Nueva cantidad disponible en stock (`double`).
     * @return `true` si se actualizó el producto; `false` en caso de error.
     */
    public boolean actualizarProducto(int idProducto, double precio, double existencias) {
        String consulta = "UPDATE productos SET precio = ?, stock = ?, actualizado_en = NOW() WHERE id = ?";
        try (Connection conexion = Conexion.obtenerConexion();
             PreparedStatement sentencia = conexion.prepareStatement(consulta)) {
            sentencia.setDouble(1, precio);
            sentencia.setDouble(2, existencias);
            sentencia.setInt(3, idProducto);
            return sentencia.executeUpdate() > 0;
        } catch (SQLException e) {
            System.err.println("[ERROR] Error actualizando precio/stock de producto: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }

    /**
     * Sobrecarga de conveniencia que acepta existencias enteras delegando al método decimal.
     *
     * @param idProducto  Identificador del producto (`int`).
     * @param precio      Nuevo precio por metro (`double`).
     * @param existencias Cantidad entera en stock (`int`).
     * @return `true` si se actualizó el registro; `false` en caso contrario.
     */
    public boolean actualizarProducto(int idProducto, double precio, int existencias) {
        return actualizarProducto(idProducto, precio, (double) existencias);
    }

    /**
     * Recupera los productos activos pertenecientes a una sección promocional ('nuevas', 'exclusivas', 'ofertas').
     *
     * @param seccion Clave de la sección (`String`).
     * @return Lista de objetos `Producto` de la sección solicitada.
     */
    public List<Producto> obtenerProductosPorSeccion(String seccion) {
        List<Producto> productos = new ArrayList<>();

        String columna;
        if ("exclusivas".equals(seccion)) {
            columna = "es_exclusivo";
        } else if ("ofertas".equals(seccion)) {
            columna = "es_oferta";
        } else {
            columna = "es_nueva_coleccion";
        }

        String consulta = "SELECT p.*, c.nombre AS nombre_categoria, u.nombre AS nombre_vendedor " +
                "FROM productos p " +
                "LEFT JOIN categorias c ON p.categoria_id = c.id " +
                "LEFT JOIN usuarios u ON p.vendedor_id = u.id " +
                "WHERE p.activo = true AND p." + columna + " = true " +
                "ORDER BY p.id ASC";

        try (Connection conexion = Conexion.obtenerConexion();
             PreparedStatement sentencia = conexion.prepareStatement(consulta);
             ResultSet resultado = sentencia.executeQuery()) {

            while (resultado.next()) {
                productos.add(mapearProducto(conexion, resultado));
            }
        } catch (SQLException e) {
            System.err.println("[ERROR] Error obteniendo productos por sección: " + e.getMessage());
            e.printStackTrace();
        }
        return productos;
    }

    /**
     * Recupera los productos que se encuentran en estado pendiente de moderación administrativa.
     *
     * @return Lista de productos con `estado_moderacion = 'pending'`.
     */
    public List<Producto> obtenerProductosPendientes() {
        List<Producto> productos = new ArrayList<>();

        String consulta = "SELECT p.*, c.nombre AS nombre_categoria, u.nombre AS nombre_vendedor " +
                "FROM productos p " +
                "LEFT JOIN categorias c ON p.categoria_id = c.id " +
                "LEFT JOIN usuarios u ON p.vendedor_id = u.id " +
                "WHERE p.estado_moderacion = 'pending' " +
                "ORDER BY p.id ASC";

        try (Connection conexion = Conexion.obtenerConexion();
             PreparedStatement sentencia = conexion.prepareStatement(consulta);
             ResultSet resultado = sentencia.executeQuery()) {

            while (resultado.next()) {
                productos.add(mapearProducto(conexion, resultado));
            }
        } catch (SQLException e) {
            System.err.println("[ERROR] Error obteniendo productos pendientes: " + e.getMessage());
            e.printStackTrace();
        }
        return productos;
    }

    /**
     * Actualiza el estado de moderación y visibilidad de un producto.
     *
     * @param idProducto Identificador del producto (`int`).
     * @param estado     Nuevo estado de moderación (`approved`, `rejected`, `changes_requested`, `pending`).
     * @param motivo     Justificación o comentario de moderación (`String`).
     * @return `true` si se actualizó el registro; `false` en caso contrario.
     */
    public boolean actualizarEstadoModeracion(int idProducto, String estado, String motivo) {
        boolean activo = "approved".equalsIgnoreCase(estado) || "aprobado".equalsIgnoreCase(estado);
        String consulta = "UPDATE productos SET estado_moderacion = ?, motivo_rechazo = ?, activo = ?, actualizado_en = NOW() WHERE id = ?";
        try (Connection conexion = Conexion.obtenerConexion();
             PreparedStatement sentencia = conexion.prepareStatement(consulta)) {
            sentencia.setString(1, estado);
            sentencia.setString(2, motivo);
            sentencia.setBoolean(3, activo);
            sentencia.setInt(4, idProducto);
            return sentencia.executeUpdate() > 0;
        } catch (SQLException e) {
            System.err.println("[ERROR] Error actualizando estado de moderación: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }

    /**
     * Inserta un nuevo producto en PostgreSQL, asigna su ID autogenerado y registra sus imágenes iniciales.
     *
     * @param producto Entidad `Producto` con los datos a persistir.
     * @return `true` si el producto fue insertado exitosamente; `false` en caso contrario.
     */
    public boolean agregarProducto(Producto producto) {
        try (Connection conexion = Conexion.obtenerConexion()) {
            int idCategoria = resolverOCrearCategoria(conexion, producto.getCategoria());
            String estadoMod = (producto.getEstadoModeracion() != null && !producto.getEstadoModeracion().isBlank())
                    ? producto.getEstadoModeracion()
                    : "pending";
            int idVendedor = producto.getIdVendedor() > 0 ? producto.getIdVendedor() : 1;

            String consulta = "INSERT INTO productos (" +
                    "nombre, categoria_id, precio, vendedor_id, descripcion, material, ancho, peso, cuidados, " +
                    "stock, destacado, es_nueva_coleccion, es_exclusivo, es_oferta, activo, estado_moderacion" +
                    ") VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, true, ?)";

            int idGenerado = -1;
            try (PreparedStatement sentencia = conexion.prepareStatement(consulta, Statement.RETURN_GENERATED_KEYS)) {
                sentencia.setString(1, producto.getNombre());
                sentencia.setInt(2, idCategoria);
                sentencia.setDouble(3, producto.getPrecio());
                sentencia.setInt(4, idVendedor);
                sentencia.setString(5, producto.getDescripcion());
                sentencia.setString(6, producto.getMaterial());
                sentencia.setString(7, producto.getAncho());
                sentencia.setString(8, producto.getPeso());
                sentencia.setString(9, producto.getCuidado());
                sentencia.setDouble(10, Math.max(0.0, producto.getExistencias()));
                sentencia.setBoolean(11, producto.isDestacado());
                sentencia.setBoolean(12, producto.isEsNuevaColeccion());
                sentencia.setBoolean(13, producto.isEsExclusivo());
                sentencia.setBoolean(14, producto.isEsOferta());
                sentencia.setString(15, estadoMod);

                int filas = sentencia.executeUpdate();
                if (filas <= 0) {
                    return false;
                }
                try (ResultSet keys = sentencia.getGeneratedKeys()) {
                    if (keys.next()) {
                        idGenerado = keys.getInt(1);
                        producto.setId(String.valueOf(idGenerado));
                    }
                }
            }

            if (idGenerado > 0 && producto.getImagenes() != null && !producto.getImagenes().isEmpty()) {
                String sqlImg = "INSERT INTO imagenes_producto (producto_id, url_imagen, orden_visualizacion) VALUES (?, ?, ?)";
                try (PreparedStatement pstImg = conexion.prepareStatement(sqlImg)) {
                    int orden = 0;
                    for (String url : producto.getImagenes()) {
                        if (url != null && !url.isBlank()) {
                            pstImg.setInt(1, idGenerado);
                            pstImg.setString(2, url.trim());
                            pstImg.setInt(3, orden++);
                            pstImg.addBatch();
                        }
                    }
                    pstImg.executeBatch();
                }
            }
            return true;
        } catch (SQLException e) {
            System.err.println("[ERROR] Error agregando nuevo producto: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }

    /**
     * Actualiza un producto de forma selectiva delegando al método con control explícito de banderas.
     *
     * @param id              Identificador del producto (`int`).
     * @param actualizaciones Objeto `Producto` con los campos a modificar.
     * @param destacado       Valor opcional para la bandera `destacado` (`Boolean`).
     * @return `true` si el producto fue modificado; `false` en caso contrario.
     */
    public boolean actualizarProducto(int id, Producto actualizaciones, Boolean destacado) {
        Double stockExplicito = actualizaciones.getExistencias() >= 0 ? actualizaciones.getExistencias() : null;
        return actualizarProductoSelectivo(
                id,
                actualizaciones,
                destacado,
                actualizaciones.isEsNuevaColeccion() ? Boolean.TRUE : null,
                actualizaciones.isEsExclusivo() ? Boolean.TRUE : null,
                actualizaciones.isEsOferta() ? Boolean.TRUE : null,
                stockExplicito
        );
    }

    /**
     * Actualiza selectivamente los campos no nulos de un producto sin sobrescribir banderas omitidas.
     *
     * @param id               Identificador del producto (`int`).
     * @param actualizaciones  Objeto `Producto` con los campos de texto y precio (`Producto`).
     * @param destacado        Bandera opcional de producto destacado (`Boolean`).
     * @param esNuevaColeccion Bandera opcional de nueva colección (`Boolean`).
     * @param esExclusivo      Bandera opcional de producto exclusivo (`Boolean`).
     * @param esOferta         Bandera opcional de producto en oferta (`Boolean`).
     * @param stockExplicito   Cantidad explícita de stock si fue enviada en el payload (`Double`).
     * @return `true` si se actualizó el registro en PostgreSQL; `false` en caso contrario.
     */
    public boolean actualizarProductoSelectivo(
            int id,
            Producto actualizaciones,
            Boolean destacado,
            Boolean esNuevaColeccion,
            Boolean esExclusivo,
            Boolean esOferta,
            Double stockExplicito) {
        try (Connection conexion = Conexion.obtenerConexion()) {
            Integer idCategoria = null;
            if (actualizaciones.getCategoria() != null && !actualizaciones.getCategoria().isBlank()) {
                idCategoria = resolverOCrearCategoria(conexion, actualizaciones.getCategoria());
            }

            String consulta = "UPDATE productos SET " +
                    "nombre = COALESCE(?, nombre), " +
                    "categoria_id = COALESCE(?, categoria_id), " +
                    "precio = COALESCE(NULLIF(?, 0), precio), " +
                    "descripcion = COALESCE(?, descripcion), " +
                    "material = COALESCE(?, material), " +
                    "ancho = COALESCE(?, ancho), " +
                    "peso = COALESCE(?, peso), " +
                    "cuidados = COALESCE(?, cuidados), " +
                    "stock = COALESCE(?, stock), " +
                    "destacado = COALESCE(?, destacado), " +
                    "es_nueva_coleccion = COALESCE(?, es_nueva_coleccion), " +
                    "es_exclusivo = COALESCE(?, es_exclusivo), " +
                    "es_oferta = COALESCE(?, es_oferta), " +
                    "actualizado_en = NOW() " +
                    "WHERE id = ?";

            try (PreparedStatement sentencia = conexion.prepareStatement(consulta)) {
                sentencia.setString(1, actualizaciones.getNombre());
                sentencia.setObject(2, idCategoria);
                sentencia.setDouble(3, actualizaciones.getPrecio());
                sentencia.setString(4, actualizaciones.getDescripcion());
                sentencia.setString(5, actualizaciones.getMaterial());
                sentencia.setString(6, actualizaciones.getAncho());
                sentencia.setString(7, actualizaciones.getPeso());
                sentencia.setString(8, actualizaciones.getCuidado());
                sentencia.setObject(9, stockExplicito != null && stockExplicito >= 0 ? stockExplicito : null);
                sentencia.setObject(10, destacado);
                sentencia.setObject(11, esNuevaColeccion);
                sentencia.setObject(12, esExclusivo);
                sentencia.setObject(13, esOferta);
                sentencia.setInt(14, id);

                boolean actualizado = sentencia.executeUpdate() > 0;
                if (actualizado && actualizaciones.getImagenes() != null && !actualizaciones.getImagenes().isEmpty()) {
                    try (PreparedStatement pstDel = conexion.prepareStatement("DELETE FROM imagenes_producto WHERE producto_id = ?")) {
                        pstDel.setInt(1, id);
                        pstDel.executeUpdate();
                    }
                    try (PreparedStatement pstIns = conexion.prepareStatement("INSERT INTO imagenes_producto (producto_id, url_imagen, orden_visualizacion) VALUES (?, ?, ?)")) {
                        int orden = 0;
                        for (String url : actualizaciones.getImagenes()) {
                            if (url != null && !url.isBlank()) {
                                pstIns.setInt(1, id);
                                pstIns.setString(2, url.trim());
                                pstIns.setInt(3, orden++);
                                pstIns.addBatch();
                            }
                        }
                        pstIns.executeBatch();
                    }
                }
                return actualizado;
            }
        } catch (SQLException e) {
            System.err.println("[ERROR] Error actualizando producto selectivamente: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }

    /**
     * Sobrecarga de compatibilidad para actualizarProductoSelectivo con stock entero.
     */
    public boolean actualizarProductoSelectivo(
            int id,
            Producto actualizaciones,
            Boolean destacado,
            Boolean esNuevaColeccion,
            Boolean esExclusivo,
            Boolean esOferta,
            Integer stockExplicito) {
        return actualizarProductoSelectivo(
                id,
                actualizaciones,
                destacado,
                esNuevaColeccion,
                esExclusivo,
                esOferta,
                stockExplicito != null ? stockExplicito.doubleValue() : null
        );
    }

    /**
     * Desactiva lógicamente un producto del catálogo (`activo = false`).
     *
     * @param id Identificador del producto a desactivar (`int`).
     * @return `true` si se desactivó el producto; `false` en caso contrario.
     */
    public boolean eliminarProducto(int id) {
        String consulta = "UPDATE productos SET activo = false, actualizado_en = NOW() WHERE id = ?";
        try (Connection conexion = Conexion.obtenerConexion();
             PreparedStatement sentencia = conexion.prepareStatement(consulta)) {
            sentencia.setInt(1, id);
            return sentencia.executeUpdate() > 0;
        } catch (SQLException e) {
            System.err.println("[ERROR] Error eliminando producto (soft-delete): " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }

    /**
     * Construye una entidad `Producto` completa a partir de la fila actual del `ResultSet`.
     *
     * @param conexion  Conexión JDBC activa para consultar las imágenes (`Connection`).
     * @param resultado Conjunto de resultados posicionado (`ResultSet`).
     * @return Instancia de `Producto` poblada.
     * @throws SQLException Si ocurre un error leyendo las columnas.
     */
    private Producto mapearProducto(Connection conexion, ResultSet resultado) throws SQLException {
        Producto producto = new Producto();
        int idProducto = resultado.getInt("id");

        producto.setId(String.valueOf(idProducto));
        producto.setNombre(resultado.getString("nombre"));
        producto.setCategoria(resultado.getString("nombre_categoria") != null ? resultado.getString("nombre_categoria") : "General");
        producto.setPrecio(resultado.getDouble("precio"));
        producto.setIdVendedor(resultado.getInt("vendedor_id"));
        producto.setNombreVendedor(resultado.getString("nombre_vendedor"));
        producto.setDescripcion(resultado.getString("descripcion"));
        producto.setMaterial(resultado.getString("material"));
        producto.setAncho(resultado.getString("ancho"));
        producto.setPeso(resultado.getString("peso"));
        producto.setCuidado(resultado.getString("cuidados"));
        producto.setExistencias(resultado.getDouble("stock"));
        producto.setDestacado(resultado.getBoolean("destacado"));
        producto.setEsNuevaColeccion(resultado.getBoolean("es_nueva_coleccion"));
        producto.setEsExclusivo(resultado.getBoolean("es_exclusivo"));
        producto.setEsOferta(resultado.getBoolean("es_oferta"));
        producto.setEstadoModeracion(resultado.getString("estado_moderacion"));
        producto.setMotivoRechazo(resultado.getString("motivo_rechazo"));
        producto.setActivo(resultado.getBoolean("activo"));
        if (resultado.getTimestamp("creado_en") != null) {
            producto.setFechaCreacion(resultado.getTimestamp("creado_en").toString().split(" ")[0]);
        }
        producto.setImagenes(obtenerImagenesProducto(conexion, idProducto));
        return producto;
    }

    /**
     * Obtiene el identificador de una categoría por su nombre o la crea en PostgreSQL si no existe.
     *
     * @param conexion        Conexión JDBC activa (`Connection`).
     * @param nombreCategoria Nombre de la categoría (`String`).
     * @return Identificador numérico de la categoría (`int`).
     */
    private int resolverOCrearCategoria(Connection conexion, String nombreCategoria) {
        if (nombreCategoria != null && !nombreCategoria.isBlank()) {
            String buscarSql = "SELECT id FROM categorias WHERE LOWER(nombre) = LOWER(?) LIMIT 1";
            try (PreparedStatement pst = conexion.prepareStatement(buscarSql)) {
                pst.setString(1, nombreCategoria.trim());
                try (ResultSet rs = pst.executeQuery()) {
                    if (rs.next()) {
                        return rs.getInt("id");
                    }
                }
            } catch (SQLException ignored) {}

            String insertarSql = "INSERT INTO categorias (nombre, descripcion) VALUES (?, ?)";
            try (PreparedStatement pst = conexion.prepareStatement(insertarSql, Statement.RETURN_GENERATED_KEYS)) {
                pst.setString(1, nombreCategoria.trim());
                pst.setString(2, "Categoría " + nombreCategoria.trim());
                pst.executeUpdate();
                try (ResultSet keys = pst.getGeneratedKeys()) {
                    if (keys.next()) {
                        return keys.getInt(1);
                    }
                }
            } catch (SQLException ignored) {}
        }

        try (PreparedStatement pst = conexion.prepareStatement("SELECT id FROM categorias ORDER BY id ASC LIMIT 1");
             ResultSet rs = pst.executeQuery()) {
            if (rs.next()) {
                return rs.getInt("id");
            }
        } catch (SQLException ignored) {}
        return 1;
    }
}
