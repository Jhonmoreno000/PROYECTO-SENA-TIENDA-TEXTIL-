package domain.models;

/**
 * Modelo que representa un par clave-valor de configuración global del sistema.
 * Mapea a la tabla "config" en la base de datos PostgreSQL.
 * Se usa para almacenar ajustes generales como nombre de la tienda, moneda, etc.
 */
public class ConfigItem {
    /** Clave única que identifica el parámetro de configuración (ej: "store_name", "currency"). */
    private String key;
    /** Valor asociado a la clave de configuración. */
    private String value;

    /** Constructor vacío requerido por frameworks de serialización. */
    public ConfigItem() {}

    /**
     * Constructor con los valores iniciales de configuración.
     * @param key   Clave del parámetro
     * @param value Valor del parámetro
     */
    public ConfigItem(String key, String value) {
        this.key = key;
        this.value = value;
    }

    /** Obtiene la clave de configuración. */
    public String getKey() { return key; }
    /** Asigna la clave de configuración. */
    public void setKey(String key) { this.key = key; }

    /** Obtiene el valor de configuración. */
    public String getValue() { return value; }
    /** Asigna el valor de configuración. */
    public void setValue(String value) { this.value = value; }
}
