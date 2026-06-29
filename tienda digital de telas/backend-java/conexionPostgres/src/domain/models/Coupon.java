package domain.models;

/**
 * Modelo que representa un cupón de descuento aplicable a pedidos.
 * Mapea a la tabla "coupons" en la base de datos PostgreSQL.
 */
public class Coupon {
    /** Identificador único del cupón (clave primaria autoincremental). */
    private int id;
    /** Código alfanumérico único que el cliente ingresa para canjear el cupón. */
    private String code;
    /** Tipo de descuento: "percentage" (porcentaje) o "fixed" (monto fijo). */
    private String discountType;
    /** Valor del descuento: porcentaje (ej: 15.0) o monto fijo en pesos. */
    private double discountValue;
    /** Fecha y hora de expiración del cupón. Después de esta fecha ya no es válido. */
    private String expiresAt;
    /** Indica si el cupón está actualmente habilitado para su uso. */
    private boolean active;
    /** Contador de cuántas veces se ha usado el cupón. */
    private int usageCount;
    /** Reglas de uso asociadas al cupón (monto mínimo, usos máximos, etc.). */
    private Rules rules;

    /**
     * Constructor vacío. Inicializa las reglas con valores por defecto.
     */
    public Coupon() {
        this.rules = new Rules();
    }

    /**
     * Clase interna que define las reglas de uso del cupón.
     * Permite configurar restricciones como monto mínimo de compra,
     * número máximo de usos y si aplica solo para primera compra.
     */
    public static class Rules {
        /** Monto mínimo de compra requerido para poder usar el cupón (nulo = sin mínimo). */
        private Double minPurchase;
        /** Número máximo de veces que se puede usar el cupón en total (nulo = sin límite). */
        private Integer maxUses;
        /** Si es true, el cupón solo aplica para la primera compra del cliente. */
        private boolean firstTimeOnly;

        /** Constructor vacío para la clase interna Rules. */
        public Rules() {}

        /** Obtiene el monto mínimo de compra requerido. */
        public Double getMinPurchase() { return minPurchase; }
        /** Asigna el monto mínimo de compra requerido. */
        public void setMinPurchase(Double minPurchase) { this.minPurchase = minPurchase; }

        /** Obtiene el número máximo de usos permitidos. */
        public Integer getMaxUses() { return maxUses; }
        /** Asigna el número máximo de usos permitidos. */
        public void setMaxUses(Integer maxUses) { this.maxUses = maxUses; }

        /** Indica si el cupón es solo para primera compra. */
        public boolean isFirstTimeOnly() { return firstTimeOnly; }
        /** Define si el cupón es solo para primera compra. */
        public void setFirstTimeOnly(boolean firstTimeOnly) { this.firstTimeOnly = firstTimeOnly; }
    }

    /** Obtiene el identificador único del cupón. */
    public int getId() { return id; }
    /** Asigna el identificador único del cupón. */
    public void setId(int id) { this.id = id; }

    /** Obtiene el código del cupón. */
    public String getCode() { return code; }
    /** Asigna el código del cupón. */
    public void setCode(String code) { this.code = code; }

    /** Obtiene el tipo de descuento ("percentage" o "fixed"). */
    public String getDiscountType() { return discountType; }
    /** Asigna el tipo de descuento del cupón. */
    public void setDiscountType(String discountType) { this.discountType = discountType; }

    /** Obtiene el valor del descuento. */
    public double getDiscountValue() { return discountValue; }
    /** Asigna el valor del descuento. */
    public void setDiscountValue(double discountValue) { this.discountValue = discountValue; }

    /** Obtiene la fecha de expiración del cupón. */
    public String getExpiresAt() { return expiresAt; }
    /** Asigna la fecha de expiración del cupón. */
    public void setExpiresAt(String expiresAt) { this.expiresAt = expiresAt; }

    /** Indica si el cupón está activo. */
    public boolean isActive() { return active; }
    /** Activa o desactiva el cupón. */
    public void setActive(boolean active) { this.active = active; }

    /** Obtiene el contador de usos del cupón. */
    public int getUsageCount() { return usageCount; }
    /** Asigna el contador de usos del cupón. */
    public void setUsageCount(int usageCount) { this.usageCount = usageCount; }

    /** Obtiene las reglas de uso del cupón. */
    public Rules getRules() { return rules; }
    /** Asigna las reglas de uso del cupón. */
    public void setRules(Rules rules) { this.rules = rules; }
}
