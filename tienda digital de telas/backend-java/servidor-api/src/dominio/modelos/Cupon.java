package dominio.modelos;

import com.google.gson.annotations.SerializedName;

/**
 * Modelo de dominio que representa un cupón de descuento aplicable a pedidos.
 * Mapea a la tabla `cupones` en PostgreSQL.
 */
public class Cupon {

    /** Identificador único del cupón (`int`). */
    @SerializedName(value = "id", alternate = {"idCupon"})
    private int id;

    /** Código alfanumérico único del cupón (`String`, ej. `"DESCUENTO10"`). */
    @SerializedName(value = "code", alternate = {"codigo"})
    private String codigo;

    /** Modalidad del descuento (`String`: `"percentage"` o `"fixed"`). */
    @SerializedName(value = "discountType", alternate = {"tipoDescuento"})
    private String tipoDescuento;

    /** Valor numérico del descuento según su tipo (`double`). */
    @SerializedName(value = "discountValue", alternate = {"valorDescuento"})
    private double valorDescuento;

    /** Fecha límite de validez del cupón (`String`). */
    @SerializedName(value = "expiresAt", alternate = {"fechaExpiracion", "expiraEn"})
    private String fechaExpiracion;

    /** Indica si el cupón se encuentra habilitado para uso (`boolean`). */
    @SerializedName(value = "active", alternate = {"activo"})
    private boolean activo;

    /** Cantidad acumulada de veces que se ha redimido el cupón (`int`). */
    @SerializedName(value = "usageCount", alternate = {"conteoUso", "vecesUsado", "conteoUsos"})
    private int conteoUso;

    /** Conjunto de restricciones comerciales asociadas al cupón ({@link Reglas}). */
    @SerializedName(value = "rules", alternate = {"reglas"})
    private Reglas reglas;

    /**
     * Constructor vacío que inicializa una instancia de {@link Reglas} por defecto.
     */
    public Cupon() {
        this.reglas = new Reglas();
    }

    /**
     * Objeto anidado que encapsula las condiciones comerciales para redimir un cupón.
     */
    public static class Reglas {

        /** Monto mínimo de compra requerido en pesos (`Double`). */
        @SerializedName(value = "minPurchase", alternate = {"compraMinima"})
        private Double compraMinima;

        /** Límite máximo de redenciones permitidas (`Integer`). */
        @SerializedName(value = "maxUses", alternate = {"usosMaximos"})
        private Integer usosMaximos;

        /** Indica si el cupón aplica únicamente para la primera compra del cliente (`boolean`). */
        @SerializedName(value = "firstTimeOnly", alternate = {"soloPrimeraCompra", "soloPrimeraVez"})
        private boolean soloPrimeraCompra;

        /**
         * Constructor vacío para las reglas del cupón.
         */
        public Reglas() {}

        /**
         * Obtiene el monto mínimo de compra requerido.
         *
         * @return Compra mínima (`Double`) o `null`.
         */
        public Double getCompraMinima() { return compraMinima; }

        /**
         * Establece el monto mínimo de compra requerido.
         *
         * @param compraMinima Compra mínima (`Double`) o `null`.
         */
        public void setCompraMinima(Double compraMinima) { this.compraMinima = compraMinima; }

        /**
         * Obtiene el número máximo de usos permitidos.
         *
         * @return Límite de usos (`Integer`) o `null`.
         */
        public Integer getUsosMaximos() { return usosMaximos; }

        /**
         * Establece el número máximo de usos permitidos.
         *
         * @param usosMaximos Límite de usos (`Integer`) o `null`.
         */
        public void setUsosMaximos(Integer usosMaximos) { this.usosMaximos = usosMaximos; }

        /**
         * Indica si el cupón está restringido a la primera compra.
         *
         * @return `true` si es exclusivo para primera compra; `false` en caso contrario.
         */
        public boolean isSoloPrimeraCompra() { return soloPrimeraCompra; }

        /**
         * Establece si el cupón está restringido a la primera compra.
         *
         * @param soloPrimeraCompra `true` para restringir a primera compra.
         */
        public void setSoloPrimeraCompra(boolean soloPrimeraCompra) { this.soloPrimeraCompra = soloPrimeraCompra; }
    }

    /**
     * Obtiene el identificador único del cupón.
     *
     * @return Identificador numérico (`int`).
     */
    public int getId() { return id; }

    /**
     * Establece el identificador único del cupón.
     *
     * @param id Identificador numérico (`int`).
     */
    public void setId(int id) { this.id = id; }

    /**
     * Obtiene el código promocional del cupón.
     *
     * @return Código del cupón (`String`).
     */
    public String getCodigo() { return codigo; }

    /**
     * Establece el código promocional del cupón.
     *
     * @param codigo Código del cupón (`String`).
     */
    public void setCodigo(String codigo) { this.codigo = codigo; }

    /**
     * Obtiene el tipo de descuento (`percentage` o `fixed`).
     *
     * @return Tipo de descuento (`String`).
     */
    public String getTipoDescuento() { return tipoDescuento; }

    /**
     * Establece el tipo de descuento (`percentage` o `fixed`).
     *
     * @param tipoDescuento Tipo de descuento (`String`).
     */
    public void setTipoDescuento(String tipoDescuento) { this.tipoDescuento = tipoDescuento; }

    /**
     * Obtiene el valor numérico del descuento.
     *
     * @return Valor del descuento (`double`).
     */
    public double getValorDescuento() { return valorDescuento; }

    /**
     * Establece el valor numérico del descuento.
     *
     * @param valorDescuento Valor del descuento (`double`).
     */
    public void setValorDescuento(double valorDescuento) { this.valorDescuento = valorDescuento; }

    /**
     * Obtiene la fecha de expiración del cupón.
     *
     * @return Fecha de expiración (`String`).
     */
    public String getFechaExpiracion() { return fechaExpiracion; }

    /**
     * Establece la fecha de expiración del cupón.
     *
     * @param fechaExpiracion Fecha de expiración (`String`).
     */
    public void setFechaExpiracion(String fechaExpiracion) { this.fechaExpiracion = fechaExpiracion; }

    /**
     * Indica si el cupón está activo.
     *
     * @return `true` si está activo; `false` en caso contrario.
     */
    public boolean isActivo() { return activo; }

    /**
     * Establece si el cupón está activo.
     *
     * @param activo Estado activo (`boolean`).
     */
    public void setActivo(boolean activo) { this.activo = activo; }

    /**
     * Obtiene la cantidad de veces que se ha utilizado el cupón.
     *
     * @return Conteo de usos (`int`).
     */
    public int getConteoUso() { return conteoUso; }

    /**
     * Establece la cantidad de veces que se ha utilizado el cupón.
     *
     * @param conteoUso Conteo de usos (`int`).
     */
    public void setConteoUso(int conteoUso) { this.conteoUso = conteoUso; }

    /**
     * Obtiene el objeto de reglas comerciales del cupón, inicializándolo si es nulo.
     *
     * @return Instancia de {@link Reglas}.
     */
    public Reglas getReglas() {
        if (this.reglas == null) {
            this.reglas = new Reglas();
        }
        return reglas;
    }

    /**
     * Establece el objeto de reglas comerciales del cupón.
     *
     * @param reglas Instancia de {@link Reglas}.
     */
    public void setReglas(Reglas reglas) { this.reglas = reglas; }
}
