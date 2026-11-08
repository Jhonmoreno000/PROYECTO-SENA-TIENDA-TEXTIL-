package infraestructura.configuracion;

import java.lang.reflect.InvocationHandler;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.lang.reflect.Proxy;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.sql.SQLTimeoutException;
import java.util.concurrent.ArrayBlockingQueue;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Gestor de conexiones JDBC con Pool de Conexiones Bounded y Concurrente para PostgreSQL (D&D Textil).
 * Diseñado para alta concurrencia nativa en Java 21 sin dependencias externas:
 * - Capacidad máxima estricta (TAMANO_MAXIMO_POOL) para proteger PostgreSQL contra límites de conexión.
 * - Bloqueo con timeout configurable cuando el pool está exhausto (evita el thundering herd y sockets desbordados).
 * - Verificación inteligente de liveness con ventana de bypass para alto throughput sin latencia innecesaria.
 * - Proxies dinámicos con rollback automático de transacciones colgadas y reciclaje seguro en try-with-resources.
 * - Resolución jerárquica de variables de entorno (DB_URL, DB_HOST, DB_PORT, DB_NAME, POSTGRES_*).
 * - Monitoreo de métricas y cierre limpio (Graceful Shutdown) registrado en la JVM.
 */
public final class Conexion {

    /** Instancia singleton para compatibilidad retroactiva con llamadas heredadas. */
    private static final Conexion INSTANCIA = new Conexion();

    /** URL JDBC resuelta dinámicamente con soporte para 12-Factor App. */
    private static final String URL_BD = resolverUrlBd();

    /** Usuario de base de datos PostgreSQL. */
    private static final String USUARIO_BD = resolverUsuarioBd();

    /** Contraseña de base de datos PostgreSQL. */
    private static final String CONTRASENA_BD = resolverContrasenaBd();

    /** Límite estricto de conexiones físicas simultáneas permitidas contra PostgreSQL. */
    private static final int TAMANO_MAXIMO_POOL = Math.max(
        8,
        ConfiguracionEntorno.obtenerEntero("DB_POOL_SIZE", 24)
    );

    /** Número mínimo de conexiones inactivas para mantener calientes (Pre-warming). */
    private static final int MINIMO_INACTIVAS = Math.min(
        5,
        TAMANO_MAXIMO_POOL
    );

    /** Tiempo máximo de espera en milisegundos para obtener una conexión libre antes de timeout. */
    private static final long TIMEOUT_CONEXION_MS = Math.max(
        1000L,
        (long) ConfiguracionEntorno.obtenerEntero("DB_CONNECTION_TIMEOUT_MS", 30000)
    );

    /** Ventana en milisegundos durante la cual una conexión recién devuelta no requiere isValid(2). */
    private static final long VENTANA_VALIDACION_MS = 1000L;

    /** Cola bloqueante concurrente para conexiones físicas inactivas. */
    private static final BlockingQueue<EntradaConexion> POOL_CONEXIONES = new ArrayBlockingQueue<>(TAMANO_MAXIMO_POOL);

    /** Contador atómico del número total de conexiones físicas existentes (en pool + en uso). */
    private static final AtomicInteger CONEXIONES_TOTALES = new AtomicInteger(0);

    /** Bandera de control para apagado ordenado del pool. */
    private static final AtomicBoolean EN_APAGADO = new AtomicBoolean(false);

    /**
     * Envoltura interna para rastrear marcas temporales de uso y validación física.
     */
    private static final class EntradaConexion {
        final Connection conexionFisica;
        volatile long ultimoUsoTimestamp;

        EntradaConexion(Connection conexionFisica) {
            this.conexionFisica = conexionFisica;
            this.ultimoUsoTimestamp = System.currentTimeMillis();
        }
    }

    static {
        try {
            Class.forName("org.postgresql.Driver");
        } catch (ClassNotFoundException e) {
            System.err.println("[ERROR CRÍTICO] No se encontró el driver JDBC de PostgreSQL.");
            e.printStackTrace();
        }

        // Registrar gancho de apagado limpio en la JVM
        Runtime.getRuntime().addShutdownHook(new Thread(Conexion::cerrarPool, "DDTextil-PoolShutdownHook"));

        // Pre-calentar conexiones mínimas en segundo plano
        precalentarPool();
    }

    /**
     * Constructor privado para evitar la instanciación directa.
     */
    private Conexion() {}

    /**
     * Retorna la instancia singleton de {@link Conexion} para compatibilidad con código legado.
     *
     * @return Instancia única de {@link Conexion}.
     */
    public static Conexion getInstancia() {
        return INSTANCIA;
    }

    /**
     * Obtiene una conexión activa lista para ejecutar consultas SQL.
     * Si todas las conexiones están en uso, el hilo se bloquea hasta que una conexión quede libre
     * o expire el timeout configurado (30 segundos por defecto).
     *
     * @return Conexión proxy de {@link Connection} gestionada por el pool.
     * @throws SQLException Si ocurre un error de red o expira el tiempo de espera.
     */
    public static Connection obtenerConexion() throws SQLException {
        if (EN_APAGADO.get()) {
            throw new SQLException("El pool de conexiones de base de datos ha sido cerrado.");
        }

        long tiempoLimite = System.currentTimeMillis() + TIMEOUT_CONEXION_MS;

        while (System.currentTimeMillis() < tiempoLimite) {
            // 1. Intentar tomar una conexión inactiva disponible inmediatamente
            EntradaConexion entrada = POOL_CONEXIONES.poll();
            if (entrada != null) {
                if (validarYRestablecerConexion(entrada)) {
                    return envolverConexionEnProxy(entrada);
                } else {
                    descartarConexionFisica(entrada.conexionFisica);
                    continue; // Buscar o crear otra
                }
            }

            // 2. Si no hay conexiones inactivas, verificar si podemos crear una nueva físicamente
            int actuales = CONEXIONES_TOTALES.get();
            if (actuales < TAMANO_MAXIMO_POOL) {
                if (CONEXIONES_TOTALES.compareAndSet(actuales, actuales + 1)) {
                    try {
                        Connection nuevaFisica = DriverManager.getConnection(URL_BD, USUARIO_BD, CONTRASENA_BD);
                        EntradaConexion nuevaEntrada = new EntradaConexion(nuevaFisica);
                        restablecerEstadoConexion(nuevaFisica);
                        return envolverConexionEnProxy(nuevaEntrada);
                    } catch (SQLException e) {
                        CONEXIONES_TOTALES.decrementAndGet();
                        throw e;
                    }
                }
                // Si el CAS falló por contención entre hilos, reintentar ciclo
                continue;
            }

            // 3. El pool alcanzó su límite estricto: Bloquear hasta que otro hilo libere una conexión
            long tiempoRestante = tiempoLimite - System.currentTimeMillis();
            if (tiempoRestante <= 0) {
                break;
            }

            try {
                EntradaConexion entradaEsperada = POOL_CONEXIONES.poll(tiempoRestante, TimeUnit.MILLISECONDS);
                if (entradaEsperada != null) {
                    if (validarYRestablecerConexion(entradaEsperada)) {
                        return envolverConexionEnProxy(entradaEsperada);
                    } else {
                        descartarConexionFisica(entradaEsperada.conexionFisica);
                    }
                }
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                throw new SQLException("Hilo interrumpido mientras esperaba una conexión disponible en el pool.", e);
            }
        }

        throw new SQLTimeoutException("Tiempo de espera agotado (" + TIMEOUT_CONEXION_MS
                + " ms) esperando una conexión disponible en el pool. (Capacidad máxima: "
                + TAMANO_MAXIMO_POOL + ", Conexiones totales activas: " + CONEXIONES_TOTALES.get() + ")");
    }

    /**
     * Valida la salud física de la conexión aplicando bypass de validación si fue usada recientemente.
     */
    private static boolean validarYRestablecerConexion(EntradaConexion entrada) {
        try {
            Connection con = entrada.conexionFisica;
            if (con == null || con.isClosed()) {
                return false;
            }
            long ahora = System.currentTimeMillis();
            // Si la conexión estuvo inactiva por más tiempo que la ventana de bypass, validar con ping
            if (ahora - entrada.ultimoUsoTimestamp > VENTANA_VALIDACION_MS) {
                if (!con.isValid(2)) {
                    return false;
                }
            }
            restablecerEstadoConexion(con);
            return true;
        } catch (SQLException e) {
            return false;
        }
    }

    /**
     * Restablece el autoCommit y limpia advertencias sobre una conexión física antes de usarla.
     */
    private static void restablecerEstadoConexion(Connection con) throws SQLException {
        if (!con.getAutoCommit()) {
            con.setAutoCommit(true);
        }
        con.clearWarnings();
    }

    /**
     * Envuelve una conexión física en un proxy dinámico que intercepta `close()` para devolverla al pool.
     */
    private static Connection envolverConexionEnProxy(EntradaConexion entrada) {
        AtomicBoolean cerradaLogicamente = new AtomicBoolean(false);
        Connection fisica = entrada.conexionFisica;

        InvocationHandler manejador = (Object proxy, Method metodo, Object[] args) -> {
            String nombreMetodo = metodo.getName();

            if ("close".equals(nombreMetodo)) {
                if (cerradaLogicamente.compareAndSet(false, true)) {
                    entrada.ultimoUsoTimestamp = System.currentTimeMillis();
                    devolverConexionAlPool(entrada);
                }
                return null;
            }

            if ("isClosed".equals(nombreMetodo)) {
                return cerradaLogicamente.get() || fisica.isClosed();
            }

            if ("equals".equals(nombreMetodo)) {
                return proxy == (args != null && args.length > 0 ? args[0] : null);
            }

            if ("hashCode".equals(nombreMetodo)) {
                return System.identityHashCode(proxy);
            }

            if ("toString".equals(nombreMetodo)) {
                return "PooledConnectionProxy[activa=" + !cerradaLogicamente.get()
                        + ", fisica=" + fisica.toString() + "]";
            }

            if ("unwrap".equals(nombreMetodo) && args != null && args.length == 1) {
                Class<?> iface = (Class<?>) args[0];
                if (iface.isInstance(proxy)) {
                    return proxy;
                }
                return fisica.unwrap(iface);
            }

            if ("isWrapperFor".equals(nombreMetodo) && args != null && args.length == 1) {
                Class<?> iface = (Class<?>) args[0];
                return iface.isInstance(proxy) || fisica.isWrapperFor(iface);
            }

            if (cerradaLogicamente.get()) {
                throw new SQLException("Operación no permitida: La conexión ya fue cerrada y devuelta al pool.");
            }

            try {
                return metodo.invoke(fisica, args);
            } catch (InvocationTargetException e) {
                throw e.getTargetException();
            }
        };

        ClassLoader cl = Connection.class.getClassLoader() != null
                ? Connection.class.getClassLoader()
                : Conexion.class.getClassLoader();

        return (Connection) Proxy.newProxyInstance(
            cl,
            new Class<?>[]{Connection.class},
            manejador
        );
    }

    /**
     * Retorna una conexión física al pool asegurando rollback de transacciones abiertas.
     */
    private static void devolverConexionAlPool(EntradaConexion entrada) {
        if (EN_APAGADO.get()) {
            descartarConexionFisica(entrada.conexionFisica);
            return;
        }

        Connection fisica = entrada.conexionFisica;
        try {
            if (fisica == null || fisica.isClosed()) {
                CONEXIONES_TOTALES.decrementAndGet();
                return;
            }

            if (!fisica.getAutoCommit()) {
                try {
                    fisica.rollback();
                } catch (SQLException rollbackEx) {
                    descartarConexionFisica(fisica);
                    return;
                }
                fisica.setAutoCommit(true);
            }

            fisica.clearWarnings();

            if (!POOL_CONEXIONES.offer(entrada)) {
                descartarConexionFisica(fisica);
            }
        } catch (SQLException e) {
            descartarConexionFisica(fisica);
        }
    }

    /**
     * Cierra físicamente una conexión descartada y descuenta el contador de conexiones activas.
     */
    private static void descartarConexionFisica(Connection conexion) {
        CONEXIONES_TOTALES.decrementAndGet();
        cerrarSilenciosamente(conexion);
    }

    /**
     * Cierra físicamente un socket JDBC sin propagar excepciones.
     */
    private static void cerrarSilenciosamente(Connection conexion) {
        if (conexion != null) {
            try {
                conexion.close();
            } catch (SQLException ignored) {}
        }
    }

    /**
     * Pre-calienta el número mínimo de conexiones en el pool.
     */
    private static void precalentarPool() {
        try {
            for (int i = 0; i < MINIMO_INACTIVAS; i++) {
                if (CONEXIONES_TOTALES.get() < TAMANO_MAXIMO_POOL) {
                    CONEXIONES_TOTALES.incrementAndGet();
                    Connection fisica = DriverManager.getConnection(URL_BD, USUARIO_BD, CONTRASENA_BD);
                    restablecerEstadoConexion(fisica);
                    POOL_CONEXIONES.offer(new EntradaConexion(fisica));
                }
            }
        } catch (SQLException e) {
            // Si PostgreSQL no está disponible durante el arranque local/pruebas, se registra y continúa
            System.err.println("[POOL] Advertencia: No se pudieron precalentar conexiones iniciales: " + e.getMessage());
        }
    }

    /**
     * Cierra todas las conexiones del pool al apagar el servidor.
     */
    public static void cerrarPool() {
        if (EN_APAGADO.compareAndSet(false, true)) {
            System.out.println("[POOL] Cerrando conexiones activas del pool...");
            EntradaConexion entrada;
            while ((entrada = POOL_CONEXIONES.poll()) != null) {
                cerrarSilenciosamente(entrada.conexionFisica);
                CONEXIONES_TOTALES.decrementAndGet();
            }
        }
    }

    // --- Métricas de Observabilidad para ManejadorSalud ---

    public static int getConexionesActivas() {
        return Math.max(0, CONEXIONES_TOTALES.get() - POOL_CONEXIONES.size());
    }

    public static int getConexionesInactivas() {
        return POOL_CONEXIONES.size();
    }

    public static int getConexionesTotales() {
        return CONEXIONES_TOTALES.get();
    }

    public static int getCapacidadMaxima() {
        return TAMANO_MAXIMO_POOL;
    }

    // --- Resolución Jerárquica de Variables de Entorno ---

    private static String resolverUrlBd() {
        String urlDirecta = ConfiguracionEntorno.obtener("DB_URL");
        if (urlDirecta != null && !urlDirecta.isBlank()) {
            return urlDirecta.trim();
        }

        String host = ConfiguracionEntorno.obtenerPrimera("DB_HOST", "POSTGRES_HOST");
        if (host == null || host.isBlank()) {
            host = "localhost";
        }

        String puerto = ConfiguracionEntorno.obtenerPrimera("DB_PORT", "POSTGRES_PORT");
        if (puerto == null || puerto.isBlank()) {
            puerto = "5432";
        }

        String baseDatos = ConfiguracionEntorno.obtenerPrimera("DB_NAME", "POSTGRES_DB");
        if (baseDatos == null || baseDatos.isBlank()) {
            baseDatos = "tienda_digital_textiles_db";
        }

        return "jdbc:postgresql://" + host.trim() + ":" + puerto.trim() + "/" + baseDatos.trim();
    }

    private static String resolverUsuarioBd() {
        String usuario = ConfiguracionEntorno.obtenerPrimera("DB_USER", "POSTGRES_USER");
        return (usuario != null && !usuario.isBlank()) ? usuario.trim() : "postgres";
    }

    private static String resolverContrasenaBd() {
        String contrasena = ConfiguracionEntorno.obtenerPrimera("DB_PASSWORD", "POSTGRES_PASSWORD");
        return (contrasena != null) ? contrasena : "mysecretpassword";
    }
}
