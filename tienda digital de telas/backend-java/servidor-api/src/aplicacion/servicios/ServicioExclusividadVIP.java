package aplicacion.servicios;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.HashMap;
import java.util.Map;

import infraestructura.configuracion.Conexion;

/**
 * Servicio de aplicación encargado de evaluar el algoritmo de elegibilidad VIP / Cliente Frecuente
 * para desbloquear el catálogo de "Telas Exclusivas" en el marketplace.
 */
public class ServicioExclusividadVIP {

    public static final int UMBRAL_PEDIDOS_FRECUENTES = 3;
    public static final double UMBRAL_METROS_FRECUENTES = 50.0;

    public ServicioExclusividadVIP() {}

    /**
     * Evalúa si un usuario cumple los criterios de Cliente Frecuente (VIP).
     * Regla: >= 3 pedidos pagados/completados O >= 50 metros acumulados comprados.
     *
     * @param idUsuario Identificador del usuario autenticado (`int`).
     * @return Mapa con la evaluación completa (`esClienteFrecuente`, `comprasCompletadas`, `metrosAcumulados`, etc.).
     */
    public Map<String, Object> evaluarElegibilidad(int idUsuario) {
        Map<String, Object> resultado = new HashMap<>();
        resultado.put("esClienteFrecuente", false);
        resultado.put("isFrequentCustomer", false);
        resultado.put("nivelVip", "Estándar");
        resultado.put("comprasCompletadas", 0);
        resultado.put("metrosAcumulados", 0.0);
        resultado.put("umbralPedidos", UMBRAL_PEDIDOS_FRECUENTES);
        resultado.put("umbralMetros", UMBRAL_METROS_FRECUENTES);
        resultado.put("faltantePedidos", UMBRAL_PEDIDOS_FRECUENTES);
        resultado.put("faltanteMetros", UMBRAL_METROS_FRECUENTES);

        if (idUsuario <= 0) {
            return resultado;
        }

        String sql = "SELECT " +
                "COUNT(DISTINCT o.id) AS total_pedidos, " +
                "COALESCE(SUM(ip.cantidad), 0) AS total_metros " +
                "FROM pedidos o " +
                "LEFT JOIN items_pedido ip ON ip.pedido_id = o.id " +
                "WHERE o.usuario_id = ? " +
                "AND LOWER(COALESCE(o.estado, '')) NOT IN ('cancelled', 'cancelado', 'failed') " +
                "AND (UPPER(COALESCE(o.estado_pago, '')) IN ('APPROVED', 'PAID', 'PAGADO') " +
                "     OR LOWER(COALESCE(o.estado, '')) IN ('paid', 'confirmed', 'cutting', 'packed', 'shipped', 'delivered', 'pagado', 'confirmado', 'en corte', 'empacado', 'enviado', 'entregado'))";

        try (Connection con = Conexion.obtenerConexion();
             PreparedStatement pst = con.prepareStatement(sql)) {
            pst.setInt(1, idUsuario);
            try (ResultSet rs = pst.executeQuery()) {
                if (rs.next()) {
                    int pedidos = rs.getInt("total_pedidos");
                    double metros = rs.getDouble("total_metros");
                    boolean esVip = (pedidos >= UMBRAL_PEDIDOS_FRECUENTES) || (metros >= UMBRAL_METROS_FRECUENTES);

                    String nivel = "Estándar";
                    if (pedidos >= 8 || metros >= 150.0) {
                        nivel = "VIP Diamante";
                    } else if (esVip) {
                        nivel = "VIP Frecuente";
                    }

                    resultado.put("esClienteFrecuente", esVip);
                    resultado.put("isFrequentCustomer", esVip);
                    resultado.put("nivelVip", nivel);
                    resultado.put("comprasCompletadas", pedidos);
                    resultado.put("metrosAcumulados", Math.round(metros * 100.0) / 100.0);
                    resultado.put("faltantePedidos", Math.max(0, UMBRAL_PEDIDOS_FRECUENTES - pedidos));
                    resultado.put("faltanteMetros", Math.max(0.0, Math.round((UMBRAL_METROS_FRECUENTES - metros) * 100.0) / 100.0));
                }
            }
        } catch (SQLException e) {
            System.err.println("[VIP] Error evaluando elegibilidad VIP: " + e.getMessage());
        }

        return resultado;
    }

    /**
     * Atajo booleano para validación de acceso a productos exclusivos.
     */
    public boolean esClienteFrecuente(int idUsuario) {
        Object val = evaluarElegibilidad(idUsuario).get("esClienteFrecuente");
        return Boolean.TRUE.equals(val);
    }
}

