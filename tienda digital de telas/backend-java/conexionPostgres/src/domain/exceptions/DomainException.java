package domain.exceptions;

/**
 * Excepción base para reglas de negocio del Dominio.
 */
public class DomainException extends RuntimeException {
    public DomainException(String message) {
        super(message);
    }
}
