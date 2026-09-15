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
 * Gestiona todas las operaciones CRUD sobre la tabla 'products' y 'product_images'.
 */
public class ProductoDAO {

    /**
     * Recupera todos los productos activos del catálogo.
     * @return Lista de objetos Producto.
     */
    public List<Producto> obtenerTodosLosProductos() {
        List<Producto> productos = new ArrayList<>();

        String consulta = "SELECT p.*, c.name as category_name " +
                "FROM products p " +
                "LEFT JOIN categories c ON p.category_id = c.id " +
                "WHERE p.active = true";

        try (Connection conexion = Conexion.obtenerConexion();
             PreparedStatement sentencia = conexion.prepareStatement(consulta);
             ResultSet resultado = sentencia.executeQuery()) {

            while (resultado.next()) {
                Producto producto = new Producto();
                int idProducto = resultado.getInt("id");

                producto.setId(String.valueOf(idProducto));
                producto.setNombre(resultado.getString("name"));
                producto.setCategoria(resultado.getString("category_name"));
                producto.setPrecio(resultado.getDouble("price"));
                producto.setIdVendedor(resultado.getInt("seller_id"));
                producto.setDescripcion(resultado.getString("description"));
                producto.setMaterial(resultado.getString("material"));
                producto.setAncho(resultado.getString("width"));
                producto.setPeso(resultado.getString("weight"));
                producto.setCuidado(resultado.getString("care"));
                producto.setExistencias(resultado.getInt("stock"));
                producto.setDestacado(resultado.getBoolean("featured"));
                producto.setEsNuevaColeccion(resultado.getBoolean("is_new_collection"));
                producto.setEsExclusivo(resultado.getBoolean("is_exclusive"));
                producto.setEsOferta(resultado.getBoolean("is_offer"));
                producto.setImagenes(obtenerImagenesProducto(conexion, idProducto));

                productos.add(producto);
            }
        } catch (SQLException e) {
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

        String consulta = "SELECT p.*, c.name as category_name " +
                "FROM products p " +
                "LEFT JOIN categories c ON p.category_id = c.id " +
                "WHERE p.seller_id = ? AND p.active = true";

        try (Connection conexion = Conexion.obtenerConexion();
             PreparedStatement sentencia = conexion.prepareStatement(consulta)) {
            sentencia.setInt(1, idVendedor);
            try (ResultSet resultado = sentencia.executeQuery()) {
                while (resultado.next()) {
                    Producto producto = new Producto();
                    int idProducto = resultado.getInt("id");

                    producto.setId(String.valueOf(idProducto));
                    producto.setNombre(resultado.getString("name"));
                    producto.setCategoria(resultado.getString("category_name"));
                    producto.setPrecio(resultado.getDouble("price"));
                    producto.setIdVendedor(resultado.getInt("seller_id"));
                    producto.setDescripcion(resultado.getString("description"));
                    producto.setMaterial(resultado.getString("material"));
                    producto.setAncho(resultado.getString("width"));
                    producto.setPeso(resultado.getString("weight"));
                    producto.setCuidado(resultado.getString("care"));
                    producto.setExistencias(resultado.getInt("stock"));
                    producto.setDestacado(resultado.getBoolean("featured"));
                    producto.setEsNuevaColeccion(resultado.getBoolean("is_new_collection"));
                    producto.setEsExclusivo(resultado.getBoolean("is_exclusive"));
                    producto.setEsOferta(resultado.getBoolean("is_offer"));
                    producto.setImagenes(obtenerImagenesProducto(conexion, idProducto));

                    productos.add(producto);
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return productos;
    }

    /**
     * Obtiene las URLs de las imágenes asociadas a un producto.
     */
    private List<String> obtenerImagenesProducto(Connection conexion, int idProducto) {
        List<String> imagenes = new ArrayList<>();
        String consulta = "SELECT image_url FROM product_images WHERE product_id = ? ORDER BY display_order ASC";

        try (PreparedStatement sentencia = conexion.prepareStatement(consulta)) {
            sentencia.setInt(1, idProducto);
            try (ResultSet resultado = sentencia.executeQuery()) {
                while (resultado.next()) {
                    imagenes.add(resultado.getString("image_url"));
                }
            }
        } catch (SQLException e) {
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
                String consultaEliminar = "DELETE FROM product_images WHERE product_id = ?";
                try (PreparedStatement sentenciaEliminar = conexion.prepareStatement(consultaEliminar)) {
                    sentenciaEliminar.setInt(1, idProducto);
                    sentenciaEliminar.executeUpdate();
                }

                String consultaInsertar = "INSERT INTO product_images (product_id, image_url, display_order) VALUES (?, ?, 0)";
                try (PreparedStatement sentenciaInsertar = conexion.prepareStatement(consultaInsertar)) {
                    sentenciaInsertar.setInt(1, idProducto);
                    sentenciaInsertar.setString(2, urlImagen);
                    sentenciaInsertar.executeUpdate();
                }
            }

            return urlImagen;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    /**
     * Actualiza el precio y existencias de un producto.
     */
    public boolean actualizarProducto(int idProducto, double precio, int existencias) {
        String consulta = "UPDATE products SET price = ?, stock = ?, updated_at = NOW() WHERE id = ?";
        try (Connection conexion = Conexion.obtenerConexion();
             PreparedStatement sentencia = conexion.prepareStatement(consulta)) {
            sentencia.setDouble(1, precio);
            sentencia.setInt(2, existencias);
            sentencia.setInt(3, idProducto);
            sentencia.executeUpdate();
            return true;
        } catch (SQLException e) {
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
            columna = "is_exclusive";
        } else if ("ofertas".equals(seccion)) {
            columna = "is_offer";
        } else {
            columna = "is_new_collection";
        }

        String consulta = "SELECT p.*, c.name as category_name " +
                "FROM products p " +
                "LEFT JOIN categories c ON p.category_id = c.id " +
                "WHERE p.active = true AND p." + columna + " = true";

        try (Connection conexion = Conexion.obtenerConexion();
             PreparedStatement sentencia = conexion.prepareStatement(consulta);
             ResultSet resultado = sentencia.executeQuery()) {

            while (resultado.next()) {
                Producto producto = new Producto();
                int idProducto = resultado.getInt("id");

                producto.setId(String.valueOf(idProducto));
                producto.setNombre(resultado.getString("name"));
                producto.setCategoria(resultado.getString("category_name"));
                producto.setPrecio(resultado.getDouble("price"));
                producto.setIdVendedor(resultado.getInt("seller_id"));
                producto.setDescripcion(resultado.getString("description"));
                producto.setMaterial(resultado.getString("material"));
                producto.setAncho(resultado.getString("width"));
                producto.setPeso(resultado.getString("weight"));
                producto.setCuidado(resultado.getString("care"));
                producto.setExistencias(resultado.getInt("stock"));
                producto.setDestacado(resultado.getBoolean("featured"));
                producto.setEsNuevaColeccion(resultado.getBoolean("is_new_collection"));
                producto.setEsExclusivo(resultado.getBoolean("is_exclusive"));
                producto.setEsOferta(resultado.getBoolean("is_offer"));
                producto.setImagenes(obtenerImagenesProducto(conexion, idProducto));

                productos.add(producto);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return productos;
    }

    /**
     * Recupera los productos pendientes de moderación.
     */
    public List<Producto> obtenerProductosPendientes() {
        List<Producto> productos = new ArrayList<>();

        String consulta = "SELECT p.*, c.name as category_name " +
                "FROM products p " +
                "LEFT JOIN categories c ON p.category_id = c.id " +
                "WHERE p.moderation_status = 'pending'";

        try (Connection conexion = Conexion.obtenerConexion();
             PreparedStatement sentencia = conexion.prepareStatement(consulta);
             ResultSet resultado = sentencia.executeQuery()) {

            while (resultado.next()) {
                Producto producto = new Producto();
                int idProducto = resultado.getInt("id");

                producto.setId(String.valueOf(idProducto));
                producto.setNombre(resultado.getString("name"));
                producto.setCategoria(resultado.getString("category_name"));
                producto.setPrecio(resultado.getDouble("price"));
                producto.setIdVendedor(resultado.getInt("seller_id"));
                producto.setDescripcion(resultado.getString("description"));
                producto.setMaterial(resultado.getString("material"));
                producto.setAncho(resultado.getString("width"));
                producto.setPeso(resultado.getString("weight"));
                producto.setCuidado(resultado.getString("care"));
                producto.setExistencias(resultado.getInt("stock"));
                producto.setDestacado(resultado.getBoolean("featured"));
                producto.setEsNuevaColeccion(resultado.getBoolean("is_new_collection"));
                producto.setEsExclusivo(resultado.getBoolean("is_exclusive"));
                producto.setEsOferta(resultado.getBoolean("is_offer"));
                producto.setImagenes(obtenerImagenesProducto(conexion, idProducto));

                productos.add(producto);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return productos;
    }

    /**
     * Actualiza el estado de moderación de un producto.
     */
    public boolean actualizarEstadoModeracion(int idProducto, String estado, String motivo) {
        boolean activo = "approved".equals(estado) || "aprobado".equals(estado);
        String consulta = "UPDATE products SET moderation_status = ?, rejection_reason = ?, active = ?, updated_at = NOW() WHERE id = ?";
        try (Connection conexion = Conexion.obtenerConexion();
             PreparedStatement sentencia = conexion.prepareStatement(consulta)) {
            sentencia.setString(1, estado);
            sentencia.setString(2, motivo);
            sentencia.setBoolean(3, activo);
            sentencia.setInt(4, idProducto);
            sentencia.executeUpdate();
            return true;
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    /**
     * Agrega un nuevo producto a la base de datos.
     */
    public boolean agregarProducto(Producto producto) {
        String consulta = "INSERT INTO products (name, category_id, price, seller_id, description, material, width, weight, care, stock, featured, active, moderation_status) " +
                       "VALUES (?, (SELECT id FROM categories WHERE name = ? LIMIT 1), ?, ?, ?, ?, ?, ?, ?, ?, ?, true, 'pending')";
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
            e.printStackTrace();
            return false;
        }
    }

    /**
     * Actualiza un producto de forma selectiva (solo campos no nulos).
     */
    public boolean actualizarProducto(int id, Producto actualizaciones, Boolean destacado) {
        String consulta = "UPDATE products SET " +
                "name = COALESCE(?, name), " +
                "price = COALESCE(NULLIF(?, 0), price), " +
                "description = COALESCE(?, description), " +
                "material = COALESCE(?, material), " +
                "width = COALESCE(?, width), " +
                "weight = COALESCE(?, weight), " +
                "care = COALESCE(?, care), " +
                "stock = COALESCE(NULLIF(?, -1), stock), " +
                "featured = COALESCE(?, featured), " +
                "is_new_collection = COALESCE(?, is_new_collection), " +
                "is_exclusive = COALESCE(?, is_exclusive), " +
                "is_offer = COALESCE(?, is_offer), " +
                "updated_at = NOW() " +
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
            e.printStackTrace();
            return false;
        }
    }

    /**
     * Desactiva un producto (soft-delete).
     */
    public boolean eliminarProducto(int id) {
        String consulta = "UPDATE products SET active = false WHERE id = ?";
        try (Connection conexion = Conexion.obtenerConexion();
             PreparedStatement sentencia = conexion.prepareStatement(consulta)) {
            sentencia.setInt(1, id);
            return sentencia.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }

    // Métodos alias para compatibilidad
    public List<Producto> getAllProducts() { return obtenerTodosLosProductos(); }
    public List<Producto> getProductsBySeller(int sellerId) { return obtenerProductosPorVendedor(sellerId); }
    public List<Producto> getProductsBySection(String section) { return obtenerProductosPorSeccion(section); }
    public List<Producto> getPendingProducts() { return obtenerProductosPendientes(); }
    public boolean updateModerationStatus(int productId, String status, String reason) { return actualizarEstadoModeracion(productId, status, reason); }
    public boolean addProduct(Producto product) { return agregarProducto(product); }
    public boolean updateProduct(int id, Producto updates, Boolean featured) { return actualizarProducto(id, updates, featured); }
    public boolean updateProduct(int productId, double price, int stock) { return actualizarProducto(productId, price, stock); }
    public boolean deleteProduct(int id) { return eliminarProducto(id); }
    public String saveProductImage(int productId, String base64Data) { return guardarImagenProducto(productId, base64Data); }
}
