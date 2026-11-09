package dominio.excepciones;

/**
 * Excepción base para reglas de negocio del Dominio.
 */
public class ExcepcionDominio extends RuntimeException {

    /** Identificador de versión para serialización estándar de la excepción (`long`). */
    private static final long serialVersionUID = 1L;
    /**
     * Constructor que recibe el mensaje descriptivo del error de regla de negocio.
     * @param mensaje Mensaje explicativo del error.
     */
    public ExcepcionDominio(String mensaje) {
        super(mensaje);
    }
}
