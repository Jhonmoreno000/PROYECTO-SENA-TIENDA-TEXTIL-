package dominio.excepciones;

/**
 * Excepción base para reglas de negocio del Dominio.
 */
public class ExcepcionDominio extends RuntimeException {
    /**
     * Constructor que recibe el mensaje descriptivo del error de regla de negocio.
     * @param mensaje Mensaje explicativo del error.
     */
    public ExcepcionDominio(String mensaje) {
        super(mensaje);
    }
}
