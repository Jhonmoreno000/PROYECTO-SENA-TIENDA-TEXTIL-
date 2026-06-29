// Declara el paquete al que pertenece esta clase, dentro de la capa de dominio (excepciones)
package domain.exceptions;

/**
 * Excepción base para reglas de negocio del Dominio.
 */
// Define la clase pública DomainException que extiende RuntimeException para errores de reglas de negocio
public class DomainException extends RuntimeException {
    // Constructor público que recibe un mensaje descriptivo del error de dominio ocurrido
    public DomainException(String message) {
        // Pasa el mensaje recibido al constructor de la clase padre RuntimeException
        super(message);
    }
}
