package dominio.modelos;

import com.google.gson.annotations.SerializedName;

/**
 * Modelo que representa un cupón de descuento aplicable a pedidos.
 * Mapea a la tabla "coupons" en PostgreSQL.
 */
public class Cupon {
    /** Identificador único del cupón. */
    @SerializedName(value = "id", alternate = {"idCupon"})
    private int id;

    /** Código del cupón. */
    @SerializedName(value = "code", alternate = {"codigo"})
    private String codigo;

    /** Tipo de descuento ("percentage" o "fixed"). */
    @SerializedName(value = "discountType", alternate = {"tipoDescuento"})
    private String tipoDescuento;

    /** Valor del descuento. */
    @SerializedName(value = "discountValue", alternate = {"valorDescuento"})
    private double valorDescuento;

    /** Fecha de expiración. */
    @SerializedName(value = "expiresAt", alternate = {"fechaExpiracion"})
    private String fechaExpiracion;

    /** Indica si está activo. */
    @SerializedName(value = "active", alternate = {"activo"})
    private boolean activo;

    /** Veces que se ha usado el cupón. */
    @SerializedName(value = "usageCount", alternate = {"conteoUso", "vecesUsado"})
    private int conteoUso;

    /** Reglas del cupón. */
    @SerializedName(value = "rules", alternate = {"reglas"})
    private Reglas reglas;

    /** Constructor vacío. */
    public Cupon() {
        this.reglas = new Reglas();
    }

    /**
     * Reglas de aplicación del cupón.
     */
    public static class Reglas {
        @SerializedName(value = "minPurchase", alternate = {"compraMinima"})
        private Double compraMinima;

        @SerializedName(value = "maxUses", alternate = {"usosMaximos"})
        private Integer usosMaximos;

        @SerializedName(value = "firstTimeOnly", alternate = {"soloPrimeraCompra"})
        private boolean soloPrimeraCompra;

        public Reglas() {}

        public Double getCompraMinima() { return compraMinima; }
        public void setCompraMinima(Double compraMinima) { this.compraMinima = compraMinima; }

        public Integer getUsosMaximos() { return usosMaximos; }
        public void setUsosMaximos(Integer usosMaximos) { this.usosMaximos = usosMaximos; }

        public boolean isSoloPrimeraCompra() { return soloPrimeraCompra; }
        public void setSoloPrimeraCompra(boolean soloPrimeraCompra) { this.soloPrimeraCompra = soloPrimeraCompra; }

        public boolean isFirstTimeOnly() { return isSoloPrimeraCompra(); }
        public void setFirstTimeOnly(boolean firstTimeOnly) { setSoloPrimeraCompra(firstTimeOnly); }
    }

    public String getCode() { return getCodigo(); }
    public void setCode(String code) { setCodigo(code); }
    public String getDiscountType() { return getTipoDescuento(); }
    public void setDiscountType(String discountType) { setTipoDescuento(discountType); }
    public double getDiscountValue() { return getValorDescuento(); }
    public void setDiscountValue(double discountValue) { setValorDescuento(discountValue); }
    public String getExpiresAt() { return getFechaExpiracion(); }
    public void setExpiresAt(String expiresAt) { setFechaExpiracion(expiresAt); }
    public int getUsageCount() { return getConteoUso(); }
    public void setUsageCount(int usageCount) { setConteoUso(usageCount); }
    public Reglas getRules() { return getReglas(); }

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getCodigo() { return codigo; }
    public void setCodigo(String codigo) { this.codigo = codigo; }

    public String getTipoDescuento() { return tipoDescuento; }
    public void setTipoDescuento(String tipoDescuento) { this.tipoDescuento = tipoDescuento; }

    public double getValorDescuento() { return valorDescuento; }
    public void setValorDescuento(double valorDescuento) { this.valorDescuento = valorDescuento; }

    public String getFechaExpiracion() { return fechaExpiracion; }
    public void setFechaExpiracion(String fechaExpiracion) { this.fechaExpiracion = fechaExpiracion; }

    public boolean isActivo() { return activo; }
    public void setActivo(boolean activo) { this.activo = activo; }

    public int getConteoUso() { return conteoUso; }
    public void setConteoUso(int conteoUso) { this.conteoUso = conteoUso; }

    public Reglas getReglas() { return reglas; }
    public void setReglas(Reglas reglas) { this.reglas = reglas; }
}
