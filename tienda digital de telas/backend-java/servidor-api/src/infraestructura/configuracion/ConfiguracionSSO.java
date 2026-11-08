package infraestructura.configuracion;

/**
 * Identificadores de las aplicaciones registradas en Google Cloud Console y en Microsoft Entra ID.
 * El backend los utiliza para verificar que el token SSO recibido fue emitido para D&D Textil.
 */
public final class ConfiguracionSSO {

    /**
     * Constructor privado para evitar la instanciación de esta clase utilitaria.
     */
    private ConfiguracionSSO() {}

    /**
     * Obtiene el identificador de cliente OAuth 2.0 configurado para Google (`GOOGLE_CLIENT_ID` o `VITE_GOOGLE_CLIENT_ID`).
     *
     * @return Identificador de cliente (`String`) o `null` si no está configurado.
     */
    public static String clienteGoogle() {
        return ConfiguracionEntorno.obtenerPrimera("GOOGLE_CLIENT_ID", "VITE_GOOGLE_CLIENT_ID");
    }

    /**
     * Obtiene el identificador de aplicación configurado para Microsoft Entra ID (`AZURE_CLIENT_ID` o `VITE_AZURE_CLIENT_ID`).
     *
     * @return Identificador de cliente (`String`) o `null` si no está configurado.
     */
    public static String clienteMicrosoft() {
        return ConfiguracionEntorno.obtenerPrimera("AZURE_CLIENT_ID", "VITE_AZURE_CLIENT_ID");
    }
}
