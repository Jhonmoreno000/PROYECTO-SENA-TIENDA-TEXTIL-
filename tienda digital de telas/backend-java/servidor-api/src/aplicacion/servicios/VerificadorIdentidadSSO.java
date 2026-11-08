package aplicacion.servicios;

/**
 * Puerto de la capa de aplicación para comprobar, ante el proveedor OAuth2 (Google o Microsoft),
 * que un token de acceso SSO es auténtico y fue emitido para esta aplicación.
 */
public interface VerificadorIdentidadSSO {

    /**
     * Valida el token con el proveedor externo y devuelve la identidad certificada.
     *
     * @param proveedor Nombre del proveedor (`String`: `"google"` o `"microsoft"`).
     * @param tokenAcceso Token de acceso OAuth2 (`String`) recibido desde el cliente.
     * @return Registro {@link IdentidadSSO} con el correo y nombre verificados.
     * @throws dominio.excepciones.ExcepcionDominio Si el token no es válido o expiró.
     */
    IdentidadSSO verificar(String proveedor, String tokenAcceso);

    /**
     * Registro inmutable con la identidad certificada por el proveedor SSO.
     *
     * @param correo Dirección de correo electrónico verificada (`String`).
     * @param nombre Nombre completo del titular (`String`).
     */
    record IdentidadSSO(String correo, String nombre) {}
}
