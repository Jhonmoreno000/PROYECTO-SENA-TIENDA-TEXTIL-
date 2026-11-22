package infraestructura.persistencia.jdbc;

import java.sql.Connection;
import java.sql.SQLException;
import java.sql.Statement;

import infraestructura.configuracion.Conexion;

/**
 * Migración idempotente del esquema relacional PostgreSQL para D&D Textil.
 * Se ejecuta en el arranque del servidor y garantiza que todas las tablas y columnas
 * requeridas por pagos Wompi, inventario, soporte y usuarios existan sin pérdida de datos.
 */
public final class MigradorEsquemaPagos {

    /**
     * Constructor privado para evitar la instanciación de esta clase utilitaria.
     */
    private MigradorEsquemaPagos() {}

    /**
     * Ejecuta las sentencias DDL idempotentes (`IF NOT EXISTS`) sobre la base de datos activa.
     */
    public static void ejecutar() {
        String[] sentencias = {
            // Columnas adicionales en usuarios y direcciones
            "ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS telefono VARCHAR(50)",
            "CREATE TABLE IF NOT EXISTS direcciones_usuario (" +
            "  id SERIAL PRIMARY KEY," +
            "  usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE," +
            "  etiqueta VARCHAR(100) DEFAULT 'Casa'," +
            "  nombre_destinatario VARCHAR(150)," +
            "  telefono VARCHAR(50)," +
            "  direccion TEXT NOT NULL," +
            "  ciudad VARCHAR(100)," +
            "  departamento VARCHAR(100)," +
            "  codigo_postal VARCHAR(20)," +
            "  predeterminada BOOLEAN DEFAULT false," +
            "  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP" +
            ")",
            "CREATE INDEX IF NOT EXISTS idx_direcciones_usuario_id ON direcciones_usuario(usuario_id)",

            // Columnas adicionales en inventario y mermas
            "ALTER TABLE lotes_inventario ADD COLUMN IF NOT EXISTS metros_actuales NUMERIC(10,2)",
            "ALTER TABLE lotes_inventario ADD COLUMN IF NOT EXISTS estado VARCHAR(50) DEFAULT 'active'",
            "UPDATE lotes_inventario SET metros_actuales = metros_recibidos WHERE metros_actuales IS NULL",
            "ALTER TABLE eventos_merma ADD COLUMN IF NOT EXISTS id_lote VARCHAR(50)",
            "ALTER TABLE eventos_merma ADD COLUMN IF NOT EXISTS descripcion TEXT",
            "ALTER TABLE eventos_merma ADD COLUMN IF NOT EXISTS responsable VARCHAR(100)",
            "ALTER TABLE eventos_merma ADD COLUMN IF NOT EXISTS usuario_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL",

            // Columnas adicionales en soporte y reportes
            "ALTER TABLE tickets_soporte ADD COLUMN IF NOT EXISTS pedido_id INTEGER REFERENCES pedidos(id) ON DELETE SET NULL",
            "ALTER TABLE tickets_soporte ADD COLUMN IF NOT EXISTS categoria VARCHAR(100)",
            "ALTER TABLE reportes_errores ADD COLUMN IF NOT EXISTS correo_reportante VARCHAR(150)",
            "ALTER TABLE reportes_errores ADD COLUMN IF NOT EXISTS titulo VARCHAR(200)",
            "ALTER TABLE reportes_errores ADD COLUMN IF NOT EXISTS severidad VARCHAR(50)",
            "ALTER TABLE reportes_errores ADD COLUMN IF NOT EXISTS producto_id INTEGER REFERENCES productos(id) ON DELETE SET NULL",
            "ALTER TABLE reportes_errores ADD COLUMN IF NOT EXISTS nombre_producto VARCHAR(200)",

            // Columnas adicionales en analítica regional
            "ALTER TABLE ventas_region ADD COLUMN IF NOT EXISTS capital VARCHAR(100)",
            "ALTER TABLE ventas_region ADD COLUMN IF NOT EXISTS pedidos_totales INTEGER DEFAULT 0",

            // Columnas de pago sobre la tabla de pedidos existente
            "ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS referencia_pago VARCHAR(64)",
            "ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS monto_centavos BIGINT",
            "ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS moneda VARCHAR(3) DEFAULT 'COP'",
            "ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS wompi_transaccion_id VARCHAR(100)",
            "ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS pagado_en TIMESTAMP",
            "ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS estado_pago VARCHAR(50) DEFAULT 'pending'",
            "ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS metodo_pago VARCHAR(50)",
            "ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS codigo_cupon VARCHAR(50)",
            "ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS notas TEXT",
            "ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS documento_cliente VARCHAR(50)",
            "CREATE UNIQUE INDEX IF NOT EXISTS ux_pedidos_referencia_pago ON pedidos(referencia_pago)",

            // Bitácora de eventos recibidos de Wompi (auditoría y trazabilidad)
            "CREATE TABLE IF NOT EXISTS eventos_pago_wompi (" +
            "  id SERIAL PRIMARY KEY," +
            "  referencia_pago VARCHAR(64)," +
            "  transaccion_id VARCHAR(100)," +
            "  estado VARCHAR(30)," +
            "  origen VARCHAR(30)," +
            "  resultado VARCHAR(60)," +
            "  carga_util TEXT," +
            "  recibido_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP" +
            ")",
            "CREATE INDEX IF NOT EXISTS ix_eventos_pago_referencia ON eventos_pago_wompi(referencia_pago)",

            // 29. Tabla y trazabilidad de Auditoría de Seguridad (Audit Logging Forense)
            "CREATE TABLE IF NOT EXISTS auditoria_sistema (" +
            "  id SERIAL PRIMARY KEY," +
            "  usuario_id INTEGER," +
            "  rol VARCHAR(50)," +
            "  accion VARCHAR(100) NOT NULL," +
            "  recurso VARCHAR(100)," +
            "  ip_origen VARCHAR(45)," +
            "  detalles TEXT," +
            "  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP" +
            ")",
            "CREATE INDEX IF NOT EXISTS idx_auditoria_sistema_usuario ON auditoria_sistema(usuario_id)",
            "CREATE INDEX IF NOT EXISTS idx_auditoria_sistema_accion ON auditoria_sistema(accion)",
            "CREATE INDEX IF NOT EXISTS idx_auditoria_sistema_fecha ON auditoria_sistema(fecha_creacion)"
        };

        try (Connection con = Conexion.obtenerConexion(); Statement st = con.createStatement()) {
            for (String sql : sentencias) {
                st.execute(sql);
            }
            System.out.println("[ESQUEMA] Esquema PostgreSQL verificado y sincronizado correctamente.");
        } catch (SQLException e) {
            System.err.println("[ESQUEMA] Error sincronizando esquema PostgreSQL: " + e.getMessage());
        }
    }
}
