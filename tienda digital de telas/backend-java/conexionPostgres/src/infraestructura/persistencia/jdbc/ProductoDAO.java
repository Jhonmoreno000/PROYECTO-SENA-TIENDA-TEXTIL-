package infraestructura.persistencia.jdbc;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import java.io.File;
import java.io.FileOutputStream;
import java.util.Base64;

import infraestructura.configuracion.Conexion;
import dominio.modelos.Producto;

/**
 * DAO (Data Access Object) para la entidad Producto.
 * Gestiona todas las operaciones CRUD sobre la tabla 'productos' e 'imagenes_producto'.
 */
public class ProductoDAO {

    /**
     * Recupera todos los productos activos del catálogo.
     * @return Lista de objetos Producto.
     */
    public List<Producto> obtenerTodosLosProductos() {
        List<Producto> productos = new ArrayList<>();

        String consulta = "SELECT p.*, c.nombre as nombre_categoria " +
                "FROM productos p " +
                "LEFT JOIN categorias c ON p.categoria_id = c.id " +
                "WHERE p.activo = true";

        try (Connection conexion = Conexion.obtenerConexion();
             PreparedStatement sentencia = conexion.prepareStatement(consulta);
             ResultSet resultado = sentencia.executeQuery()) {

            while (resultado.next()) {
                Producto producto = new Producto();
                int idProducto = resultado.getInt("id");

                producto.setId(String.valueOf(idProducto));
                producto.setNombre(resultado.getString("nombre"));
                producto.setCategoria(resultado.getString("nombre_categoria"));
                producto.setPrecio(resultado.getDouble("precio"));
                producto.setIdVendedor(resultado.getInt("vendedor_id"));
                producto.setDescripcion(resultado.getString("descripcion"));
                producto.setMaterial(resultado.getString("material"));
                producto.setAncho(resultado.getString("ancho"));
                producto.setPeso(resultado.getString("peso"));
                producto.setCuidado(resultado.getString("cuidados"));
                producto.setExistencias(resultado.getInt("stock"));
                producto.setDestacado(resultado.getBoolean("destacado"));
                producto.setEsNuevaColeccion(resultado.getBoolean("es_nueva_coleccion"));
                producto.setEsExclusivo(resultado.getBoolean("es_exclusivo"));
                producto.setEsOferta(resultado.getBoolean("es_oferta"));
                producto.setImagenes(obtenerImagenesProducto(conexion, idProducto));

                productos.add(producto);
            }
        } catch (SQLException e) {
            System.err.println("[ERROR] Error obteniendo todos los productos: " + e.getMessage());
            e.printStackTrace();
        }
        return productos;
    }

    /**
     * Recupera los productos activos de un vendedor específico.
     * @param idVendedor Identificador único del vendedor.
     * @return Lista de productos activos del vendedor.
     */
    public List<Producto> obtenerProductosPorVendedor(int idVendedor) {
        List<Producto> productos = new ArrayList<>();

        String consulta = "SELECT p.*, c.nombre as nombre_categoria " +
                "FROM productos p " +
                "LEFT JOIN categorias c ON p.categoria_id = c.id " +
                "WHERE p.vendedor_id = ? AND p.activo = true";

        try (Connection conexion = Conexion.obtenerConexion();
             PreparedStatement sentencia = conexion.prepareStatement(consulta)) {
            sentencia.setInt(1, idVendedor);
            try (ResultSet resultado = sentencia.executeQuery()) {
                while (resultado.next()) {
                    Producto producto = new Producto();
                    int idProducto = resultado.getInt("id");

                    producto.setId(String.valueOf(idProducto));
                    producto.setNombre(resultado.getString("nombre"));
                    producto.setCategoria(resultado.getString("nombre_categoria"));
                    producto.setPrecio(resultado.getDouble("precio"));
                    producto.setIdVendedor(resultado.getInt("vendedor_id"));
                    producto.setDescripcion(resultado.getString("descripcion"));
                    producto.setMaterial(resultado.getString("material"));
                    producto.setAncho(resultado.getString("ancho"));
                    producto.setPeso(resultado.getString("peso"));
                    producto.setCuidado(resultado.getString("cuidados"));
                    producto.setExistencias(resultado.getInt("stock"));
                    producto.setDestacado(resultado.getBoolean("destacado"));
                    producto.setEsNuevaColeccion(resultado.getBoolean("es_nueva_coleccion"));
                    producto.setEsExclusivo(resultado.getBoolean("es_exclusivo"));
                    producto.setEsOferta(resultado.getBoolean("es_oferta"));
                    producto.setImagenes(obtenerImagenesProducto(conexion, idProducto));

                    productos.add(producto);
                }
            }
        } catch (SQLException e) {
            System.err.println("[ERROR] Error obteniendo productos por vendedor: " + e.getMessage());
            e.printStackTrace();
        }
        return productos;
    }

    /**
     * Obtiene las URLs de las imágenes asociadas a un producto.
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
     * Guarda una imagen en formato Base64 en disco y en la base de datos.
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

            File carpetaSubidas = new File("uploads");
            if (!carpetaSubidas.exists())
                carpetaSubidas.mkdir();

            String nombreArchivo = "product_" + idProducto + "_" + System.currentTimeMillis() + "." + extension;
            File archivoImagen = new File(carpetaSubidas, nombreArchivo);
            byte[] bytesImagen = Base64.getDecoder().decode(base64);
            try (FileOutputStream fos = new FileOutputStream(archivoImagen)) {
                fos.write(bytesImagen);
            }

            String urlImagen = "/uploads/" + nombreArchivo;

            try (Connection conexion = Conexion.obtenerConexion()) {
                String consultaEliminar = "DELETE FROM imagenes_producto WHERE producto_id = ?";
                try (PreparedStatement sentenciaEliminar = conexion.prepareStatement(consultaEliminar)) {
                    sentenciaEliminar.setInt(1, idProducto);
                    sentenciaEliminar.executeUpdate();
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
     * Actualiza el precio y existencias de un producto.
     */
    public boolean actualizarProducto(int idProducto, double precio, int existencias) {
        String consulta = "UPDATE productos SET precio = ?, stock = ?, actualizado_en = NOW() WHERE id = ?";
        try (Connection conexion = Conexion.obtenerConexion();
             PreparedStatement sentencia = conexion.prepareStatement(consulta)) {
            sentencia.setDouble(1, precio);
            sentencia.setInt(2, existencias);
            sentencia.setInt(3, idProducto);
            sentencia.executeUpdate();
            return true;
        } catch (SQLException e) {
            System.err.println("[ERROR] Error actualizando precio/stock de producto: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }

    /**
     * Recupera productos activos por sección ('nuevas', 'exclusivas', 'ofertas').
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

        String consulta = "SELECT p.*, c.nombre as nombre_categoria " +
                "FROM productos p " +
                "LEFT JOIN categorias c ON p.categoria_id = c.id " +
                "WHERE p.activo = true AND p." + columna + " = true";

        try (Connection conexion = Conexion.obtenerConexion();
             PreparedStatement sentencia = conexion.prepareStatement(consulta);
             ResultSet resultado = sentencia.executeQuery()) {

            while (resultado.next()) {
                Producto producto = new Producto();
                int idProducto = resultado.getInt("id");

                producto.setId(String.valueOf(idProducto));
                producto.setNombre(resultado.getString("nombre"));
                producto.setCategoria(resultado.getString("nombre_categoria"));
                producto.setPrecio(resultado.getDouble("precio"));
                producto.setIdVendedor(resultado.getInt("vendedor_id"));
                producto.setDescripcion(resultado.getString("descripcion"));
                producto.setMaterial(resultado.getString("material"));
                producto.setAncho(resultado.getString("ancho"));
                producto.setPeso(resultado.getString("peso"));
                producto.setCuidado(resultado.getString("cuidados"));
                producto.setExistencias(resultado.getInt("stock"));
                producto.setDestacado(resultado.getBoolean("destacado"));
                producto.setEsNuevaColeccion(resultado.getBoolean("es_nueva_coleccion"));
                producto.setEsExclusivo(resultado.getBoolean("es_exclusivo"));
                producto.setEsOferta(resultado.getBoolean("es_oferta"));
                producto.setImagenes(obtenerImagenesProducto(conexion, idProducto));

                productos.add(producto);
            }
        } catch (SQLException e) {
            System.err.println("[ERROR] Error obteniendo productos por sección: " + e.getMessage());
            e.printStackTrace();
        }
        return productos;
    }

    /**
     * Recupera los productos pendientes de moderación.
     */
    public List<Producto> obtenerProductosPendientes() {
        List<Producto> productos = new ArrayList<>();

        String consulta = "SELECT p.*, c.nombre as nombre_categoria " +
                "FROM productos p " +
                "LEFT JOIN categorias c ON p.categoria_id = c.id " +
                "WHERE p.estado_moderacion = 'pending'";

        try (Connection conexion = Conexion.obtenerConexion();
             PreparedStatement sentencia = conexion.prepareStatement(consulta);
             ResultSet resultado = sentencia.executeQuery()) {

            while (resultado.next()) {
                Producto producto = new Producto();
                int idProducto = resultado.getInt("id");

                producto.setId(String.valueOf(idProducto));
                producto.setNombre(resultado.getString("nombre"));
                producto.setCategoria(resultado.getString("nombre_categoria"));
                producto.setPrecio(resultado.getDouble("precio"));
                producto.setIdVendedor(resultado.getInt("vendedor_id"));
                producto.setDescripcion(resultado.getString("descripcion"));
                producto.setMaterial(resultado.getString("material"));
                producto.setAncho(resultado.getString("ancho"));
                producto.setPeso(resultado.getString("peso"));
                producto.setCuidado(resultado.getString("cuidados"));
                producto.setExistencias(resultado.getInt("stock"));
                producto.setDestacado(resultado.getBoolean("destacado"));
                producto.setEsNuevaColeccion(resultado.getBoolean("es_nueva_coleccion"));
                producto.setEsExclusivo(resultado.getBoolean("es_exclusivo"));
                producto.setEsOferta(resultado.getBoolean("es_oferta"));
                producto.setImagenes(obtenerImagenesProducto(conexion, idProducto));

                productos.add(producto);
            }
        } catch (SQLException e) {
            System.err.println("[ERROR] Error obteniendo productos pendientes: " + e.getMessage());
            e.printStackTrace();
        }
        return productos;
    }

    /**
     * Actualiza el estado de moderación de un producto.
     */
    public boolean actualizarEstadoModeracion(int idProducto, String estado, String motivo) {
        boolean activo = "approved".equals(estado) || "aprobado".equals(estado);
        String consulta = "UPDATE productos SET estado_moderacion = ?, motivo_rechazo = ?, activo = ?, actualizado_en = NOW() WHERE id = ?";
        try (Connection conexion = Conexion.obtenerConexion();
             PreparedStatement sentencia = conexion.prepareStatement(consulta)) {
            sentencia.setString(1, estado);
            sentencia.setString(2, motivo);
            sentencia.setBoolean(3, activo);
            sentencia.setInt(4, idProducto);
            sentencia.executeUpdate();
            return true;
        } catch (SQLException e) {
            System.err.println("[ERROR] Error actualizando estado de moderación: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }

    /**
     * Agrega un nuevo producto a la base de datos.
     */
    public boolean agregarProducto(Producto producto) {
        String consulta = "INSERT INTO productos (nombre, categoria_id, precio, vendedor_id, descripcion, material, ancho, peso, cuidados, stock, destacado, activo, estado_moderacion) " +
                       "VALUES (?, (SELECT id FROM categorias WHERE nombre = ? LIMIT 1), ?, ?, ?, ?, ?, ?, ?, ?, ?, true, 'pending')";
        try (Connection conexion = Conexion.obtenerConexion();
             PreparedStatement sentencia = conexion.prepareStatement(consulta)) {
            sentencia.setString(1, producto.getNombre());
            sentencia.setString(2, producto.getCategoria());
            sentencia.setDouble(3, producto.getPrecio());
            sentencia.setInt(4, producto.getIdVendedor());
            sentencia.setString(5, producto.getDescripcion());
            sentencia.setString(6, producto.getMaterial());
            sentencia.setString(7, producto.getAncho());
            sentencia.setString(8, producto.getPeso());
            sentencia.setString(9, producto.getCuidado());
            sentencia.setInt(10, producto.getExistencias());
            sentencia.setBoolean(11, producto.isDestacado());
            return sentencia.executeUpdate() > 0;
        } catch (SQLException e) {
            System.err.println("[ERROR] Error agregando nuevo producto: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }

    /**
     * Actualiza un producto de forma selectiva (solo campos no nulos).
     */
    public boolean actualizarProducto(int id, Producto actualizaciones, Boolean destacado) {
        String consulta = "UPDATE productos SET " +
                "nombre = COALESCE(?, nombre), " +
                "precio = COALESCE(NULLIF(?, 0), precio), " +
                "descripcion = COALESCE(?, descripcion), " +
                "material = COALESCE(?, material), " +
                "ancho = COALESCE(?, ancho), " +
                "peso = COALESCE(?, peso), " +
                "cuidados = COALESCE(?, cuidados), " +
                "stock = COALESCE(NULLIF(?, -1), stock), " +
                "destacado = COALESCE(?, destacado), " +
                "es_nueva_coleccion = COALESCE(?, es_nueva_coleccion), " +
                "es_exclusivo = COALESCE(?, es_exclusivo), " +
                "es_oferta = COALESCE(?, es_oferta), " +
                "actualizado_en = NOW() " +
                "WHERE id = ?";
        try (Connection conexion = Conexion.obtenerConexion();
             PreparedStatement sentencia = conexion.prepareStatement(consulta)) {
            sentencia.setString(1, actualizaciones.getNombre());
            sentencia.setDouble(2, actualizaciones.getPrecio());
            sentencia.setString(3, actualizaciones.getDescripcion());
            sentencia.setString(4, actualizaciones.getMaterial());
            sentencia.setString(5, actualizaciones.getAncho());
            sentencia.setString(6, actualizaciones.getPeso());
            sentencia.setString(7, actualizaciones.getCuidado());
            sentencia.setInt(8, actualizaciones.getExistencias() > 0 ? actualizaciones.getExistencias() : -1);
            sentencia.setObject(9, destacado);
            sentencia.setObject(10, actualizaciones.isEsNuevaColeccion());
            sentencia.setObject(11, actualizaciones.isEsExclusivo());
            sentencia.setObject(12, actualizaciones.isEsOferta());
            sentencia.setInt(13, id);
            return sentencia.executeUpdate() > 0;
        } catch (SQLException e) {
            System.err.println("[ERROR] Error actualizando producto selectivamente: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }

    /**
     * Desactiva un producto (soft-delete).
     */
    public boolean eliminarProducto(int id) {
        String consulta = "UPDATE productos SET activo = false WHERE id = ?";
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
}
