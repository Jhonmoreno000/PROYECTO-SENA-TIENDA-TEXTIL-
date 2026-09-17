/**
 * Clase delegada de compatibilidad para el poblador de base de datos.
 * Redirige la ejecución a la clase oficial en español {@link PobladorDatosPrueba}.
 */
public class MockDataSeeder {
    public static void main(String[] args) throws Exception {
        PobladorDatosPrueba.main(args);
    }
}
