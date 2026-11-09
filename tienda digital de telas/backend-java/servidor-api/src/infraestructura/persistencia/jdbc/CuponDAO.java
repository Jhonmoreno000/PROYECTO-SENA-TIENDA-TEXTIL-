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
import dominio.modelos.Cupon;

/**
 * DAO para cupones promocionales de descuento.
 * Opera sobre la tabla `cupones` en PostgreSQL.
 */
public class CuponDAO {

    /**
     * Construye una nueva instancia del DAO de cupones.
     */
    public CuponDAO() {}

    /**
     * Recupera todos los cupones registrados en el sistema ordenados del más reciente al más antiguo.
     *
     * @return Lista (`List<Cupon>`) de cupones comerciales.
     */
    public List<Cupon> obtenerTodosLosCupones() {
        List<Cupon> cupones = new ArrayList<>();
        String consulta = "SELECT id, codigo, tipo_descuento, valor_descuento, expira_en, compra_minima, usos_maximos, solo_primera_vez, conteo_usos, activo FROM cupones ORDER BY id DESC";

        try (Connection con = Conexion.obtenerConexion();
             PreparedStatement pst = con.prepareStatement(consulta);
             ResultSet rs = pst.executeQuery()) {

            while (rs.next()) {
                Cupon cupon = new Cupon();
                cupon.setId(rs.getInt("id"));
                cupon.setCodigo(rs.getString("codigo"));
                cupon.setTipoDescuento(rs.getString("tipo_descuento"));
                cupon.setValorDescuento(rs.getDouble("valor_descuento"));

                if (rs.getTimestamp("expira_en") != null) {
                    cupon.setFechaExpiracion(rs.getTimestamp("expira_en").toString());
                }

                cupon.setConteoUso(rs.getInt("conteo_usos"));
                cupon.setActivo(rs.getBoolean("activo"));

                double minP = rs.getDouble("compra_minima");
                if (!rs.wasNull()) {
                    cupon.getReglas().setCompraMinima(minP);
                }

                int maxU = rs.getInt("usos_maximos");
                if (!rs.wasNull()) {
                    cupon.getReglas().setUsosMaximos(maxU);
                }

                cupon.getReglas().setSoloPrimeraCompra(rs.getBoolean("solo_primera_vez"));

                cupones.add(cupon);
            }
        } catch (SQLException e) {
            System.err.println("[ERROR] Error obteniendo cupones: " + e.getMessage());
        }
        return cupones;
    }

    /**
     * Inserta un nuevo cupón en la base de datos y asigna el identificador generado al objeto {@link Cupon}.
     *
     * @param cupon Entidad {@link Cupon} a registrar.
     * @return `true` si el cupón fue insertado exitosamente; `false` en caso de error.
     */
    public boolean agregarCupon(Cupon cupon) {
        if (cupon == null || cupon.getCodigo() == null || cupon.getCodigo().isBlank()) {
            return false;
        }
        String consulta = "INSERT INTO cupones (codigo, tipo_descuento, valor_descuento, expira_en, compra_minima, usos_maximos, solo_primera_vez, activo) " +
                "VALUES (?, ?, ?, CAST(? AS TIMESTAMP), ?, ?, ?, ?)";
        try (Connection con = Conexion.obtenerConexion();
             PreparedStatement pst = con.prepareStatement(consulta, Statement.RETURN_GENERATED_KEYS)) {
            pst.setString(1, cupon.getCodigo().trim().toUpperCase());
            pst.setString(2, cupon.getTipoDescuento() != null ? cupon.getTipoDescuento() : "percentage");
            pst.setDouble(3, cupon.getValorDescuento());

            String exp = cupon.getFechaExpiracion();
            if (exp != null && !exp.isBlank()) {
                String fechaNormalizada = exp.trim().replace('T', ' ');
                if (fechaNormalizada.length() == 10) {
                    fechaNormalizada += " 23:59:59";
                }
                pst.setString(4, fechaNormalizada);
            } else {
                pst.setNull(4, Types.VARCHAR);
            }

            Cupon.Reglas reglas = cupon.getReglas();
            if (reglas != null && reglas.getCompraMinima() != null) {
                pst.setDouble(5, reglas.getCompraMinima());
            } else {
                pst.setNull(5, Types.NUMERIC);
            }

            if (reglas != null && reglas.getUsosMaximos() != null) {
                pst.setInt(6, reglas.getUsosMaximos());
            } else {
                pst.setNull(6, Types.INTEGER);
            }

            pst.setBoolean(7, reglas != null && reglas.isSoloPrimeraCompra());
            pst.setBoolean(8, true);

            int filas = pst.executeUpdate();
            if (filas > 0) {
                try (ResultSet rs = pst.getGeneratedKeys()) {
                    if (rs.next()) {
                        cupon.setId(rs.getInt(1));
                    }
                }
                return true;
            }
            return false;
        } catch (SQLException e) {
            System.err.println("[ERROR] Error insertando cupon: " + e.getMessage());
            return false;
        }
    }

    /**
     * Desactiva un cupón existente mediante borrado lógico (`activo = false`).
     *
     * @param id Identificador numérico del cupón (`int`).
     * @return `true` si se actualizó el registro; `false` en caso contrario.
     */
    public boolean desactivarCupon(int id) {
        String consulta = "UPDATE cupones SET activo = false WHERE id = ?";
        try (Connection con = Conexion.obtenerConexion();
             PreparedStatement pst = con.prepareStatement(consulta)) {
            pst.setInt(1, id);
            return pst.executeUpdate() > 0;
        } catch (SQLException e) {
            System.err.println("[ERROR] Error desactivando cupon: " + e.getMessage());
            return false;
        }
    }
}
