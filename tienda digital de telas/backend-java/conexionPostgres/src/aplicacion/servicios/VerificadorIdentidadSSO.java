package aplicacion.servicios;

/**
 * Puerto de la capa de aplicación para comprobar, ante el proveedor (Google o Microsoft),
 * que un token de acceso SSO es auténtico y fue emitido para esta aplicación.
 *
 * El servicio de autenticación depende de esta abstracción y no de los detalles HTTP
 * de cada proveedor (principio de inversión de dependencias).
 */
public interface VerificadorIdentidadSSO {

    /**
     * Valida el token con el proveedor y devuelve la identidad que el proveedor certifica.
     * @param proveedor "google" o "microsoft".
     * @param tokenAcceso Token de acceso entregado por el proveedor al navegador.
     * @return Correo y nombre verificados por el proveedor.
     * @throws dominio.excepciones.ExcepcionDominio si el token no es válido.
     */
    IdentidadSSO verificar(String proveedor, String tokenAcceso);

    /** Identidad certificada por el proveedor SSO. */
    record IdentidadSSO(String correo, String nombre) {}
}
