package aplicacion.servicios;

import dominio.modelos.RolloTextil;
import dominio.modelos.EventoMerma;
import java.util.List;
import java.util.Objects;

/**
 * Servicio de dominio para el motor de cálculo textil, continuidad de corte y tarifas escalonadas.
 * Implementa la validación de metraje continuo frente a rollos fragmentados,
 * la reclasificación automática de retazos sub-metro y el cálculo de descuentos por volumen.
 */
public class ServicioCorteTextil {

    /** Umbral mínimo en metros para mantener un remanente como rollo comercializable estándar (`1.0`). */
    public static final double UMBRAL_RETAZO_METROS = 1.0;

    /** Fracción de descuento automático aplicado al retazo sub-metro liquidado (`0.40` = 40%). */
    public static final double DESCUENTO_RETAZO_LIQUIDADO = 0.40;

    /** Metraje mínimo para aplicar tarifa mayorista (`15.0` metros). */
    public static final double UMBRAL_MAYORISTA_METROS = 15.0;

    /** Metraje mínimo para aplicar tarifa de rollo cerrado (`50.0` metros). */
    public static final double UMBRAL_ROLLO_CERRADO_METROS = 50.0;

    /** Fracción de descuento mayorista (`0.15` = 15%). */
    public static final double DESCUENTO_MAYORISTA = 0.15;

    /** Fracción de descuento por rollo cerrado (`0.25` = 25%). */
    public static final double DESCUENTO_ROLLO_CERRADO = 0.25;

    /**
     * Construye una nueva instancia del servicio de corte textil.
     */
    public ServicioCorteTextil() {}

    /**
     * Objeto de valor que encapsula el dictamen de validación de corte continuo sobre un lote de rollos.
     */
    public static class ResultadoValidacionCorte {

        /** Indica si existe un rollo único capaz de cubrir el metraje continuo solicitado (`boolean`). */
        private final boolean esValido;

        /** Código técnico del resultado (`String`: `"CORTE_CONTINUO_OK"`, `"FRAGMENTED_STOCK"`, `"INSUFFICIENT_STOCK"`, `"SIN_STOCK"`). */
        private final String codigo;

        /** Mensaje descriptivo del resultado de la validación (`String`). */
        private final String mensaje;

        /** Rollo físico seleccionado ({@link RolloTextil}) para realizar el corte, o `null` si fue rechazado. */
        private final RolloTextil rolloAsignado;

        /** Suma total de metros disponibles en el lote evaluado (`double`). */
        private final double metrajeTotalLote;

        /**
         * Construye el resultado de validación de corte continuo.
         *
         * @param esValido `true` si el corte continuo es viable.
         * @param codigo Código clasificador del resultado (`String`).
         * @param mensaje Descripción legible para el operario o cliente (`String`).
         * @param rolloAsignado Rollo físico asignado ({@link RolloTextil}) o `null`.
         * @param metrajeTotalLote Metraje acumulado disponible en el lote (`double`).
         */
        public ResultadoValidacionCorte(boolean esValido, String codigo, String mensaje, RolloTextil rolloAsignado, double metrajeTotalLote) {
            this.esValido = esValido;
            this.codigo = codigo;
            this.mensaje = mensaje;
            this.rolloAsignado = rolloAsignado;
            this.metrajeTotalLote = metrajeTotalLote;
        }

        /**
         * Indica si el metraje solicitado puede cortarse de un único rollo continuo.
         *
         * @return `true` si es válido; `false` en caso contrario.
         */
        public boolean esValido() { return esValido; }

        /**
         * Obtiene el código de estado de la validación.
         *
         * @return Código de resultado (`String`).
         */
        public String getCodigo() { return codigo; }

        /**
         * Obtiene el mensaje explicativo de la validación.
         *
         * @return Mensaje descriptivo (`String`).
         */
        public String getMensaje() { return mensaje; }

        /**
         * Obtiene el rollo textil asignado para el corte continuo.
         *
         * @return Instancia de {@link RolloTextil} o `null`.
         */
        public RolloTextil getRolloAsignado() { return rolloAsignado; }

        /**
         * Obtiene la suma total de metros disponibles en los rollos del lote.
         *
         * @return Metraje total acumulado (`double`).
         */
        public double getMetrajeTotalLote() { return metrajeTotalLote; }
    }

    /**
     * Valida si existe al menos un rollo continuo en el lote especificado con metraje suficiente.
     *
     * @param rollos Lista de rollos físicos (`List<RolloTextil>`) asociados al producto.
     * @param metrajeSolicitado Cantidad de metros continuos requeridos (`double`).
     * @param loteTintoreria Lote de tintorería opcional (`String`) para garantizar homogeneidad cromática.
     * @return Instancia de {@link ResultadoValidacionCorte} con el rollo asignado o la causa del rechazo.
     */
    public ResultadoValidacionCorte validarMetrajeContinuo(List<RolloTextil> rollos, double metrajeSolicitado, String loteTintoreria) {
        if (metrajeSolicitado <= 0) {
            throw new IllegalArgumentException("El metraje solicitado debe ser mayor a cero.");
        }

        if (rollos == null || rollos.isEmpty()) {
            return new ResultadoValidacionCorte(false, "SIN_STOCK", "No existen rollos registrados para la tela solicitada.", null, 0.0);
        }

        double metrajeTotalLote = 0.0;
        List<RolloTextil> candidatos = new java.util.ArrayList<>();

        for (RolloTextil rollo : rollos) {
            if (!"disponible".equalsIgnoreCase(rollo.getEstado())) {
                continue;
            }
            if (loteTintoreria != null && !loteTintoreria.isBlank() && !Objects.equals(rollo.getLoteTintoreria(), loteTintoreria)) {
                continue;
            }

            metrajeTotalLote += rollo.getMetrajeRemanente();
            if (rollo.getMetrajeRemanente() >= metrajeSolicitado) {
                candidatos.add(rollo);
            }
        }

        if (!candidatos.isEmpty()) {
            // Algoritmo Best-Fit Anti-Merma:
            // Categoría 0: Coincidencia exacta (sobrante == 0) -> prioridad máxima
            // Categoría 1: Sin merma (sobrante >= UMBRAL_RETAZO_METROS) -> menor sobrante para proteger rollos maestros
            // Categoría 2: Con merma inevitable (sobrante < UMBRAL_RETAZO_METROS) -> menor merma
            candidatos.sort((r1, r2) -> {
                double s1 = r1.getMetrajeRemanente() - metrajeSolicitado;
                double s2 = r2.getMetrajeRemanente() - metrajeSolicitado;

                int cat1 = (Math.abs(s1) < 0.001) ? 0 : (s1 >= UMBRAL_RETAZO_METROS ? 1 : 2);
                int cat2 = (Math.abs(s2) < 0.001) ? 0 : (s2 >= UMBRAL_RETAZO_METROS ? 1 : 2);

                if (cat1 != cat2) {
                    return Integer.compare(cat1, cat2);
                }
                return Double.compare(s1, s2);
            });

            RolloTextil mejorRollo = candidatos.get(0);
            return new ResultadoValidacionCorte(
                true,
                "CORTE_CONTINUO_OK",
                "Metraje continuo disponible en rollo " + mejorRollo.getCodigoRollo(),
                mejorRollo,
                metrajeTotalLote
            );
        }

        if (metrajeTotalLote >= metrajeSolicitado) {
            return new ResultadoValidacionCorte(
                false,
                "FRAGMENTED_STOCK",
                "El stock total del lote (" + metrajeTotalLote + " m) es suficiente pero está fragmentado en rollos menores. Requiere división o autorización de empates.",
                null,
                metrajeTotalLote
            );
        }

        return new ResultadoValidacionCorte(
            false,
            "INSUFFICIENT_STOCK",
            "Stock insuficiente en el lote. Solicitados: " + metrajeSolicitado + " m, disponibles: " + metrajeTotalLote + " m.",
            null,
            metrajeTotalLote
        );
    }

    /**
     * Objeto de valor que contiene el estado resultante tras ejecutar un corte físico sobre un rollo textil.
     */
    public static class ResultadoProcesamientoCorte {

        /** Metraje efectivamente descontado del rollo (`double`). */
        private final double metrajeCortado;

        /** Metraje remanente en el rollo tras el corte (`double`). */
        private final double metrajeRemanente;

        /** Estado operativo final del rollo (`String`: `"disponible"`, `"retazo_liquidado"`, `"agotado"`). */
        private final String estadoFinalRollo;

        /** Indica si el remanente fue reclasificado automáticamente como retazo en liquidación (`boolean`). */
        private final boolean esRetazoLiquidado;

        /** Evento de merma generado ({@link EventoMerma}) cuando el remanente es menor a 1 metro, o `null`. */
        private final EventoMerma eventoMerma;

        /** Precio por metro con descuento de liquidación para el retazo (`double`). */
        private final double precioPorMetroRetazo;

        /**
         * Construye el resultado del procesamiento de un corte textil.
         *
         * @param metrajeCortado Metros cortados (`double`).
         * @param metrajeRemanente Metros restantes en el rollo (`double`).
         * @param estadoFinalRollo Nuevo estado del rollo (`String`).
         * @param esRetazoLiquidado `true` si el remanente quedó por debajo de 1 metro.
         * @param eventoMerma Registro de merma ({@link EventoMerma}) generado o `null`.
         * @param precioPorMetroRetazo Precio de liquidación por metro (`double`).
         */
        public ResultadoProcesamientoCorte(double metrajeCortado, double metrajeRemanente, String estadoFinalRollo, boolean esRetazoLiquidado, EventoMerma eventoMerma, double precioPorMetroRetazo) {
            this.metrajeCortado = metrajeCortado;
            this.metrajeRemanente = metrajeRemanente;
            this.estadoFinalRollo = estadoFinalRollo;
            this.esRetazoLiquidado = esRetazoLiquidado;
            this.eventoMerma = eventoMerma;
            this.precioPorMetroRetazo = precioPorMetroRetazo;
        }

        /**
         * Obtiene el metraje cortado en la operación.
         *
         * @return Metros cortados (`double`).
         */
        public double getMetrajeCortado() { return metrajeCortado; }

        /**
         * Obtiene el metraje remanente en el rollo.
         *
         * @return Metros remanentes (`double`).
         */
        public double getMetrajeRemanente() { return metrajeRemanente; }

        /**
         * Obtiene el estado final asignado al rollo.
         *
         * @return Estado del rollo (`String`).
         */
        public String getEstadoFinalRollo() { return estadoFinalRollo; }

        /**
         * Indica si el remanente fue reclasificado a retazo en liquidación.
         *
         * @return `true` si es retazo liquidado; `false` en caso contrario.
         */
        public boolean esRetazoLiquidado() { return esRetazoLiquidado; }

        /**
         * Obtiene el evento de merma asociado al retazo sub-metro, si aplica.
         *
         * @return Objeto {@link EventoMerma} o `null`.
         */
        public EventoMerma getEventoMerma() { return eventoMerma; }

        /**
         * Obtiene el precio por metro de liquidación asignado al retazo.
         *
         * @return Precio por metro con descuento (`double`).
         */
        public double getPrecioPorMetroRetazo() { return precioPorMetroRetazo; }
    }

    /**
     * Aplica el corte físico a un rollo, actualiza su remanente a 2 decimales y reclasifica retazos menores a 1 metro.
     *
     * @param rollo Entidad {@link RolloTextil} sobre la cual realizar el corte.
     * @param metrajeACortar Cantidad de metros a descontar (`double`).
     * @param precioBasePorMetro Precio comercial por metro del producto (`double`).
     * @return Objeto {@link ResultadoProcesamientoCorte} con el remanente, estado y posible evento de merma.
     */
    public ResultadoProcesamientoCorte procesarCorteYRemanente(RolloTextil rollo, double metrajeACortar, double precioBasePorMetro) {
        if (rollo == null) {
            throw new IllegalArgumentException("El rollo no puede ser nulo.");
        }
        if (metrajeACortar <= 0) {
            throw new IllegalArgumentException("El metraje a cortar debe ser mayor a cero.");
        }
        if (metrajeACortar > rollo.getMetrajeRemanente()) {
            throw new IllegalStateException("Sobrecorte no permitido: solicitado " + metrajeACortar + " m, disponible " + rollo.getMetrajeRemanente() + " m.");
        }

        double remanente = Math.round((rollo.getMetrajeRemanente() - metrajeACortar) * 100.0) / 100.0;
        rollo.setMetrajeRemanente(remanente);

        boolean esRetazo = false;
        EventoMerma eventoMerma = null;
        double precioRetazo = 0.0;
        String nuevoEstado;

        if (remanente == 0.0) {
            nuevoEstado = "agotado";
        } else if (remanente < UMBRAL_RETAZO_METROS) {
            nuevoEstado = "retazo_liquidado";
            esRetazo = true;
            precioRetazo = Math.round(precioBasePorMetro * (1.0 - DESCUENTO_RETAZO_LIQUIDADO) * 100.0) / 100.0;

            eventoMerma = new EventoMerma();
            eventoMerma.setIdProducto(rollo.getProductoId());
            eventoMerma.setIdLote(rollo.getCodigoRollo());
            eventoMerma.setMetros(remanente);
            eventoMerma.setMotivo("remanente_sub_metro");
            eventoMerma.setDescripcion("Remanente de " + remanente + " m reclasificado automáticamente a retazo con 40% de descuento");
        } else {
            nuevoEstado = "disponible";
        }

        rollo.setEstado(nuevoEstado);

        return new ResultadoProcesamientoCorte(metrajeACortar, remanente, nuevoEstado, esRetazo, eventoMerma, precioRetazo);
    }

    /**
     * Objeto de valor que representa el desglose financiero de una tarifa escalonada por volumen de compra.
     */
    public static class TarifaCalculada {

        /** Categoría de tarifa aplicada (`String`: `"DETAL"`, `"MAYORISTA"` o `"ROLLO_CERRADO"`). */
        private final String tipoTarifa;

        /** Metraje total cotizado (`double`). */
        private final double metrajeTotal;

        /** Precio unitario base por metro sin descuento (`double`). */
        private final double precioBasePorMetro;

        /** Fracción de descuento aplicada (`double`, entre `0.0` y `0.25`). */
        private final double porcentajeDescuento;

        /** Precio unitario final por metro tras descuento (`double`). */
        private final double precioUnitarioFinal;

        /** Subtotal bruto antes de descuento (`double`). */
        private final double subtotalBruto;

        /** Monto total ahorrado por el descuento de escala (`double`). */
        private final double montoDescuento;

        /** Total neto a pagar por el metraje solicitado (`double`). */
        private final double totalNeto;

        /**
         * Construye el resultado del cálculo de tarifa escalonada.
         *
         * @param tipoTarifa Nivel de tarifa (`String`).
         * @param metrajeTotal Metraje total (`double`).
         * @param precioBasePorMetro Precio base por metro (`double`).
         * @param porcentajeDescuento Fracción de descuento (`double`).
         * @param precioUnitarioFinal Precio por metro con descuento (`double`).
         * @param subtotalBruto Subtotal sin descuento (`double`).
         * @param montoDescuento Descuento total en pesos (`double`).
         * @param totalNeto Total neto final (`double`).
         */
        public TarifaCalculada(String tipoTarifa, double metrajeTotal, double precioBasePorMetro, double porcentajeDescuento, double precioUnitarioFinal, double subtotalBruto, double montoDescuento, double totalNeto) {
            this.tipoTarifa = tipoTarifa;
            this.metrajeTotal = metrajeTotal;
            this.precioBasePorMetro = precioBasePorMetro;
            this.porcentajeDescuento = porcentajeDescuento;
            this.precioUnitarioFinal = precioUnitarioFinal;
            this.subtotalBruto = subtotalBruto;
            this.montoDescuento = montoDescuento;
            this.totalNeto = totalNeto;
        }

        /**
         * Obtiene el tipo de tarifa asignado según el volumen.
         *
         * @return Nombre de la tarifa (`String`).
         */
        public String getTipoTarifa() { return tipoTarifa; }

        /**
         * Obtiene el metraje total evaluado.
         *
         * @return Metraje total (`double`).
         */
        public double getMetrajeTotal() { return metrajeTotal; }

        /**
         * Obtiene el precio base por metro sin descuento.
         *
         * @return Precio base por metro (`double`).
         */
        public double getPrecioBasePorMetro() { return precioBasePorMetro; }

        /**
         * Obtiene la fracción de descuento aplicada.
         *
         * @return Porcentaje de descuento (`double`).
         */
        public double getPorcentajeDescuento() { return porcentajeDescuento; }

        /**
         * Obtiene el precio unitario por metro con descuento aplicado.
         *
         * @return Precio unitario final (`double`).
         */
        public double getPrecioUnitarioFinal() { return precioUnitarioFinal; }

        /**
         * Obtiene el subtotal bruto antes del descuento por escala.
         *
         * @return Subtotal bruto (`double`).
         */
        public double getSubtotalBruto() { return subtotalBruto; }

        /**
         * Obtiene el valor descontado en pesos.
         *
         * @return Monto de descuento (`double`).
         */
        public double getMontoDescuento() { return montoDescuento; }

        /**
         * Obtiene el total neto a cobrar.
         *
         * @return Total neto (`double`).
         */
        public double getTotalNeto() { return totalNeto; }
    }

    /**
     * Calcula la tarifa escalonada según el volumen de compra:
     * `< 15m` Detal (0%), `15m - 49.99m` Mayorista (15%), `>= 50m` Rollo Cerrado (25%).
     *
     * @param precioBasePorMetro Precio de lista por metro (`double`).
     * @param metrajeTotal Cantidad total de metros a cotizar (`double`).
     * @return Instancia de {@link TarifaCalculada} con todos los valores redondeados a 2 decimales.
     */
    public TarifaCalculada calcularPrecioEscalonado(double precioBasePorMetro, double metrajeTotal) {
        if (precioBasePorMetro <= 0) {
            throw new IllegalArgumentException("El precio base por metro debe ser mayor a cero.");
        }
        if (metrajeTotal <= 0) {
            throw new IllegalArgumentException("El metraje total debe ser mayor a cero.");
        }

        String tipoTarifa;
        double porcentajeDescuento;

        if (metrajeTotal >= UMBRAL_ROLLO_CERRADO_METROS) {
            tipoTarifa = "ROLLO_CERRADO";
            porcentajeDescuento = DESCUENTO_ROLLO_CERRADO;
        } else if (metrajeTotal >= UMBRAL_MAYORISTA_METROS) {
            tipoTarifa = "MAYORISTA";
            porcentajeDescuento = DESCUENTO_MAYORISTA;
        } else {
            tipoTarifa = "DETAL";
            porcentajeDescuento = 0.0;
        }

        double precioUnitario = Math.round(precioBasePorMetro * (1.0 - porcentajeDescuento) * 100.0) / 100.0;
        double subtotalBruto = Math.round(precioBasePorMetro * metrajeTotal * 100.0) / 100.0;
        double totalNeto = Math.round(precioUnitario * metrajeTotal * 100.0) / 100.0;
        double montoDescuento = Math.round((subtotalBruto - totalNeto) * 100.0) / 100.0;

        return new TarifaCalculada(
            tipoTarifa,
            metrajeTotal,
            precioBasePorMetro,
            porcentajeDescuento,
            precioUnitario,
            subtotalBruto,
            montoDescuento,
            totalNeto
        );
    }
}
