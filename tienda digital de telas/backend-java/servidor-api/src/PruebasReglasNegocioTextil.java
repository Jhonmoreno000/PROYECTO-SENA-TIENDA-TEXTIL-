import aplicacion.servicios.ServicioCorteTextil;
import aplicacion.servicios.ServicioCorteTextil.ResultadoProcesamientoCorte;
import aplicacion.servicios.ServicioCorteTextil.ResultadoValidacionCorte;
import aplicacion.servicios.ServicioCorteTextil.TarifaCalculada;
import dominio.modelos.EventoMerma;
import dominio.modelos.RolloTextil;
import java.util.ArrayList;
import java.util.List;

/**
 * Suite de pruebas unitarias para las reglas de negocio textil de D&D Textil.
 * Verifica validación de metraje continuo vs rollos fragmentados, reclasificación de retazos
 * sub-metro y cálculo de tarifas escalonadas por volumen.
 */
public class PruebasReglasNegocioTextil {

    /** Contador de casos de prueba exitosos (`int`). */
    private static int pruebasExitosas = 0;
    /** Contador de casos de prueba fallidos (`int`). */
    private static int pruebasFallidas = 0;
    /** Instancia del motor de reglas textiles bajo prueba (`ServicioCorteTextil`). */
    private static final ServicioCorteTextil motorTextil = new ServicioCorteTextil();

    /**
     * Punto de entrada principal que ejecuta las 14 pruebas de reglas de negocio textil.
     *
     * @param args Argumentos de línea de comandos (`String[]`).
     */
    public static void main(String[] args) {
        System.out.println("=================================================================");
        System.out.println("   SUITE DE PRUEBAS UNITARIAS: MOTOR TEXTIL Y CORTE (SENA ADSO)  ");
        System.out.println("=================================================================");

        ejecutarPrueba("1. Metraje continuo exitoso en un solo rollo del lote solicitado", () -> {
            List<RolloTextil> bodega = new ArrayList<>();
            bodega.add(new RolloTextil(1, 101, "ROL-501", 20.0, 15.0, "LOT-2026-A", "disponible"));
            bodega.add(new RolloTextil(2, 101, "ROL-502", 10.0, 8.0, "LOT-2026-A", "disponible"));

            ResultadoValidacionCorte resultado = motorTextil.validarMetrajeContinuo(bodega, 6.0, "LOT-2026-A");

            if (!resultado.esValido()) {
                throw new AssertionError("La validación debió ser exitosa. Mensaje: " + resultado.getMensaje());
            }
            if (resultado.getRolloAsignado() == null || !"ROL-501".equals(resultado.getRolloAsignado().getCodigoRollo())) {
                throw new AssertionError("El rollo asignado debió ser ROL-501.");
            }
            if (!"CORTE_CONTINUO_OK".equals(resultado.getCodigo())) {
                throw new AssertionError("Código inesperado: " + resultado.getCodigo());
            }
        });

        ejecutarPrueba("2. Rechazo estricto cuando el stock está fragmentado entre varios rollos (anti-empates)", () -> {
            List<RolloTextil> bodega = new ArrayList<>();
            bodega.add(new RolloTextil(1, 101, "ROL-101", 10.0, 4.0, "LOT-2026-A", "disponible"));
            bodega.add(new RolloTextil(2, 101, "ROL-102", 10.0, 4.0, "LOT-2026-A", "disponible"));

            ResultadoValidacionCorte resultado = motorTextil.validarMetrajeContinuo(bodega, 6.0, "LOT-2026-A");

            if (resultado.esValido()) {
                throw new AssertionError("La validación debió fallar por fragmentación del stock.");
            }
            if (!"FRAGMENTED_STOCK".equals(resultado.getCodigo())) {
                throw new AssertionError("Se esperaba código FRAGMENTED_STOCK pero se obtuvo: " + resultado.getCodigo());
            }
            if (resultado.getRolloAsignado() != null) {
                throw new AssertionError("No debió asignarse ningún rollo cuando el stock está fragmentado.");
            }
        });

        ejecutarPrueba("3. Rechazo de metraje continuo por inconsistencia de lote de tintorería (Lot Drift)", () -> {
            List<RolloTextil> bodega = new ArrayList<>();
            bodega.add(new RolloTextil(1, 101, "ROL-201", 20.0, 10.0, "LOT-2026-B", "disponible"));

            ResultadoValidacionCorte resultado = motorTextil.validarMetrajeContinuo(bodega, 6.0, "LOT-2026-A");

            if (resultado.esValido()) {
                throw new AssertionError("No se debe asignar un rollo con lote de tintorería distinto.");
            }
            if (!"INSUFFICIENT_STOCK".equals(resultado.getCodigo())) {
                throw new AssertionError("Se esperaba INSUFFICIENT_STOCK para el lote A pero se obtuvo: " + resultado.getCodigo());
            }
        });

        ejecutarPrueba("4. Rechazo cuando el metraje total en bodega es insuficiente", () -> {
            List<RolloTextil> bodega = new ArrayList<>();
            bodega.add(new RolloTextil(1, 101, "ROL-301", 5.0, 2.0, "LOT-2026-A", "disponible"));

            ResultadoValidacionCorte resultado = motorTextil.validarMetrajeContinuo(bodega, 10.0, "LOT-2026-A");

            if (resultado.esValido() || !"INSUFFICIENT_STOCK".equals(resultado.getCodigo())) {
                throw new AssertionError("Debió fallar con INSUFFICIENT_STOCK.");
            }
        });

        ejecutarPrueba("5. Corte normal con remanente comercializable (>= 1.0 m) mantiene estado disponible", () -> {
            RolloTextil rollo = new RolloTextil(1, 101, "ROL-90", 20.0, 15.0, "LOT-2026-A", "disponible");

            ResultadoProcesamientoCorte corte = motorTextil.procesarCorteYRemanente(rollo, 10.0, 30000.0);

            if (corte.getMetrajeRemanente() != 5.0) {
                throw new AssertionError("El remanente debió ser 5.0 m, pero fue: " + corte.getMetrajeRemanente());
            }
            if (!"disponible".equals(corte.getEstadoFinalRollo())) {
                throw new AssertionError("El estado debió ser 'disponible'.");
            }
            if (corte.esRetazoLiquidado() || corte.getEventoMerma() != null) {
                throw new AssertionError("No debió generarse evento de merma con remanente >= 1m.");
            }
        });

        ejecutarPrueba("6. Reclasificación automática a retazo liquidado cuando el remanente es < 1.0 m", () -> {
            RolloTextil rollo = new RolloTextil(2, 101, "ROL-88", 20.0, 4.5, "LOT-2026-A", "disponible");

            ResultadoProcesamientoCorte corte = motorTextil.procesarCorteYRemanente(rollo, 3.8, 30000.0);

            if (corte.getMetrajeRemanente() != 0.7) {
                throw new AssertionError("El remanente esperado es 0.7 m. Obtenido: " + corte.getMetrajeRemanente());
            }
            if (!corte.esRetazoLiquidado()) {
                throw new AssertionError("Debió clasificarse como retazo liquidado.");
            }
            if (!"retazo_liquidado".equals(corte.getEstadoFinalRollo())) {
                throw new AssertionError("El estado final debió ser 'retazo_liquidado'.");
            }
            if (corte.getPrecioPorMetroRetazo() != 18000.0) {
                throw new AssertionError("Precio de retazo esperado $18.000. Obtenido: " + corte.getPrecioPorMetroRetazo());
            }
        });

        ejecutarPrueba("7. Generación de EventoMerma detallado tras corte con remanente sub-metro", () -> {
            RolloTextil rollo = new RolloTextil(3, 101, "ROL-77", 10.0, 3.2, "LOT-2026-A", "disponible");

            ResultadoProcesamientoCorte corte = motorTextil.procesarCorteYRemanente(rollo, 2.5, 25000.0);

            EventoMerma merma = corte.getEventoMerma();
            if (merma == null) {
                throw new AssertionError("Debió generarse un EventoMerma.");
            }
            if (!"remanente_sub_metro".equals(merma.getMotivo())) {
                throw new AssertionError("El motivo debió ser 'remanente_sub_metro'.");
            }
            if (merma.getMetros() != 0.7) {
                throw new AssertionError("Los metros de la merma deben ser 0.7 m.");
            }
        });

        ejecutarPrueba("8. Agotamiento total del rollo cuando el corte consume el 100% de los metros", () -> {
            RolloTextil rollo = new RolloTextil(4, 101, "ROL-66", 10.0, 6.0, "LOT-2026-A", "disponible");

            ResultadoProcesamientoCorte corte = motorTextil.procesarCorteYRemanente(rollo, 6.0, 30000.0);

            if (corte.getMetrajeRemanente() != 0.0) {
                throw new AssertionError("El remanente debió ser exactamente 0.0.");
            }
            if (!"agotado".equals(corte.getEstadoFinalRollo())) {
                throw new AssertionError("El estado debió ser 'agotado'.");
            }
        });

        ejecutarPrueba("9. Prevención estricta de sobrecorte (solicitar más de lo disponible en el rollo)", () -> {
            RolloTextil rollo = new RolloTextil(5, 101, "ROL-55", 10.0, 5.0, "LOT-2026-A", "disponible");

            try {
                motorTextil.procesarCorteYRemanente(rollo, 5.5, 30000.0);
                throw new AssertionError("Debió lanzarse IllegalStateException por sobrecorte.");
            } catch (IllegalStateException e) {
                // Excepción esperada
            }
        });

        ejecutarPrueba("10. Tarifa escalonada al DETAL (< 15 metros, 0% descuento)", () -> {
            TarifaCalculada tarifa = motorTextil.calcularPrecioEscalonado(30000.0, 8.0);

            if (!"DETAL".equals(tarifa.getTipoTarifa())) {
                throw new AssertionError("Tipo de tarifa esperado 'DETAL'. Obtenido: " + tarifa.getTipoTarifa());
            }
            if (tarifa.getPorcentajeDescuento() != 0.0) {
                throw new AssertionError("El descuento al detal debe ser 0%.");
            }
            if (tarifa.getTotalNeto() != 240000.0) {
                throw new AssertionError("Total neto esperado $240.000. Obtenido: " + tarifa.getTotalNeto());
            }
        });

        ejecutarPrueba("11. Tarifa escalonada MAYORISTA (15.0 a 49.99 metros, 15% descuento)", () -> {
            TarifaCalculada tarifa = motorTextil.calcularPrecioEscalonado(30000.0, 20.0);

            if (!"MAYORISTA".equals(tarifa.getTipoTarifa())) {
                throw new AssertionError("Tipo de tarifa esperado 'MAYORISTA'.");
            }
            if (tarifa.getPorcentajeDescuento() != 0.15) {
                throw new AssertionError("El porcentaje debió ser 0.15 (15%).");
            }
            if (tarifa.getPrecioUnitarioFinal() != 25500.0) {
                throw new AssertionError("Precio unitario esperado $25.500. Obtenido: " + tarifa.getPrecioUnitarioFinal());
            }
            if (tarifa.getTotalNeto() != 510000.0) {
                throw new AssertionError("Total neto esperado $510.000. Obtenido: " + tarifa.getTotalNeto());
            }
            if (tarifa.getMontoDescuento() != 90000.0) {
                throw new AssertionError("Descuento esperado $90.000. Obtenido: " + tarifa.getMontoDescuento());
            }
        });

        ejecutarPrueba("12. Tarifa escalonada ROLLO CERRADO (>= 50 metros, 25% descuento)", () -> {
            TarifaCalculada tarifa = motorTextil.calcularPrecioEscalonado(30000.0, 60.0);

            if (!"ROLLO_CERRADO".equals(tarifa.getTipoTarifa())) {
                throw new AssertionError("Tipo de tarifa esperado 'ROLLO_CERRADO'.");
            }
            if (tarifa.getPorcentajeDescuento() != 0.25) {
                throw new AssertionError("El porcentaje debió ser 0.25 (25%).");
            }
            if (tarifa.getPrecioUnitarioFinal() != 22500.0) {
                throw new AssertionError("Precio unitario esperado $22.500. Obtenido: " + tarifa.getPrecioUnitarioFinal());
            }
            if (tarifa.getTotalNeto() != 1350000.0) {
                throw new AssertionError("Total neto esperado $1.350.000. Obtenido: " + tarifa.getTotalNeto());
            }
        });

        ejecutarPrueba("13. Validación en frontera de umbrales escalonados (14.99 m vs 15.0 m)", () -> {
            TarifaCalculada limiteDetal = motorTextil.calcularPrecioEscalonado(20000.0, 14.99);
            TarifaCalculada inicioMayorista = motorTextil.calcularPrecioEscalonado(20000.0, 15.0);

            if (!"DETAL".equals(limiteDetal.getTipoTarifa())) {
                throw new AssertionError("14.99 m debe liquidarse como DETAL.");
            }
            if (!"MAYORISTA".equals(inicioMayorista.getTipoTarifa())) {
                throw new AssertionError("15.0 m exactos debe liquidarse como MAYORISTA.");
            }
        });

        ejecutarPrueba("14. Rechazo de parámetros no positivos en cálculo de tarifas", () -> {
            try {
                motorTextil.calcularPrecioEscalonado(-500.0, 10.0);
                throw new AssertionError("Debió rechazar precio negativo.");
            } catch (IllegalArgumentException e) {
                // Correcto
            }

            try {
                motorTextil.calcularPrecioEscalonado(30000.0, 0.0);
                throw new AssertionError("Debió rechazar metraje cero.");
            } catch (IllegalArgumentException e) {
                // Correcto
            }
        });

        System.out.println("\n=================================================================");
        System.out.println("                    RESUMEN DE PRUEBAS UNITARIAS                ");
        System.out.println("=================================================================");
        System.out.println("  Pruebas superadas con éxito: " + pruebasExitosas);
        System.out.println("  Pruebas fallidas:            " + pruebasFallidas);

        if (pruebasFallidas == 0) {
            System.out.println("\n>>> TODAS LAS PRUEBAS DE REGLAS DE NEGOCIO TEXTIL PASARON (100%) <<<");
        } else {
            System.err.println("\n>>> EXISTEN PRUEBAS FALLIDAS. REVISAR IMPLEMENTACIÓN <<<");
            System.exit(1);
        }
    }

    /**
     * Ejecuta un caso de prueba individual contabilizando su éxito o fallo.
     *
     * @param nombre Nombre descriptivo del caso de prueba (`String`).
     * @param accion Bloque ejecutable de la prueba (`AccionPrueba`).
     */
    private static void ejecutarPrueba(String nombre, AccionPrueba accion) {
        System.out.print("[TEST] " + nombre + " ... ");
        try {
            accion.ejecutar();
            pruebasExitosas++;
            System.out.println("CORRECTO");
        } catch (Throwable e) {
            pruebasFallidas++;
            System.out.println("FALLÓ: " + e.getMessage());
        }
    }

    /**
     * Interfaz funcional que representa una acción de prueba que puede lanzar cualquier excepción o aserción.
     */
    @FunctionalInterface
    interface AccionPrueba {
        /**
         * Ejecuta las validaciones del caso de prueba.
         *
         * @throws Throwable Si ocurre un error o falla una aserción.
         */
        void ejecutar() throws Throwable;
    }
}
