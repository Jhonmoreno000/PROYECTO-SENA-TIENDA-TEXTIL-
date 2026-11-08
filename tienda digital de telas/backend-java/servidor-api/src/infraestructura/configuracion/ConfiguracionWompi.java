package infraestructura.configuracion;

/**
 * Configuración centralizada de la pasarela de pagos Wompi (Bancolombia).
 * Resuelve credenciales públicas, privadas y secretos de firma desde variables de entorno o `.env`.
 */
public final class ConfiguracionWompi {

    /** Código ISO-4217 de la moneda oficial de cobro (`String`, valor `"COP"`). */
    public static final String MONEDA = "COP";

    /**
     * Constructor privado para evitar la instanciación de esta clase utilitaria.
     */
    private ConfiguracionWompi() {}

    /**
     * Obtiene la llave pública del comercio en Wompi (`WOMPI_PUBLIC_KEY`).
     *
     * @return Llave pública (`String`) o `null` si no está configurada.
     */
    public static String llavePublica() {
        return ConfiguracionEntorno.obtener(new String[]{"WOMPI_PUBLIC_KEY"});
    }

    /**
     * Obtiene la llave privada del comercio en Wompi (`WOMPI_PRIVATE_KEY`).
     *
     * @return Llave privada (`String`) o `null` si no está configurada.
     */
    public static String llavePrivada() {
        return ConfiguracionEntorno.obtener(new String[]{"WOMPI_PRIVATE_KEY"});
    }

    /**
     * Obtiene el secreto de integridad para firmar transacciones Wompi (`WOMPI_INTEGRITY_SECRET`).
     *
     * @return Secreto de integridad (`String`) o `null` si no está configurado.
     */
    public static String secretoIntegridad() {
        return ConfiguracionEntorno.obtener(new String[]{"WOMPI_INTEGRITY_SECRET"});
    }

    /**
     * Obtiene el secreto de eventos para verificar webhooks de Wompi (`WOMPI_EVENTS_SECRET`).
     *
     * @return Secreto de eventos (`String`) o `null` si no está configurado.
     */
    public static String secretoEventos() {
        return ConfiguracionEntorno.obtener(new String[]{"WOMPI_EVENTS_SECRET"});
    }

    /**
     * Indica si la pasarela está configurada en modo producción (`WOMPI_ENV=production`).
     *
     * @return `true` si el entorno es producción; `false` si es sandbox.
     */
    public static boolean esProduccion() {
        String entorno = ConfiguracionEntorno.obtener("WOMPI_ENV", "sandbox");
        return "production".equalsIgnoreCase(entorno);
    }

    /**
     * Obtiene la URL base de la API REST de Wompi según el entorno activo.
     *
     * @return URL base (`String`) de producción o sandbox.
     */
    public static String urlApi() {
        return esProduccion() ? "https://production.wompi.co/v1" : "https://sandbox.wompi.co/v1";
    }

    /**
     * Verifica si las credenciales mínimas para procesar pagos con Wompi están configuradas.
     *
     * @return `true` si existen llave pública, secreto de integridad y secreto de eventos.
     */
    public static boolean estaConfigurada() {
        return noVacio(llavePublica()) && noVacio(secretoIntegridad()) && noVacio(secretoEventos());
    }

    /**
     * Comprueba que una cadena no sea nula ni esté en blanco.
     *
     * @param s Cadena (`String`) a evaluar.
     * @return `true` si contiene caracteres útiles; `false` en caso contrario.
     */
    private static boolean noVacio(String s) {
        return s != null && !s.isBlank();
    }
}
