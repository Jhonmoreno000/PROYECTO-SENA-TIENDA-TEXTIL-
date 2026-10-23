package infraestructura.configuracion;

/**
 * Identificadores de las aplicaciones registradas en Google Cloud Console y en Microsoft Entra ID.
 *
 * El backend los usa para comprobar que el token SSO recibido fue emitido para D&D Textil
 * y no para otra aplicación. Se aceptan los mismos nombres que usa el frontend (VITE_*)
 * para que basten las variables ya definidas en el archivo .env.
 */
public final class ConfiguracionSSO {

    private ConfiguracionSSO() {}

    public static String clienteGoogle() {
        return ConfiguracionEntorno.obtener("GOOGLE_CLIENT_ID", "VITE_GOOGLE_CLIENT_ID");
    }

    public static String clienteMicrosoft() {
        return ConfiguracionEntorno.obtener("AZURE_CLIENT_ID", "VITE_AZURE_CLIENT_ID");
    }
}
