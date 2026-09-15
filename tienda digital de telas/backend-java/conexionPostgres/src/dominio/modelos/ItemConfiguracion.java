package dominio.modelos;

import com.google.gson.annotations.SerializedName;

/**
 * Modelo que representa un parámetro de configuración del sistema (clave-valor).
 * Mapea a la tabla "config" en PostgreSQL.
 */
public class ItemConfiguracion {
    /** Clave única del parámetro de configuración. */
    @SerializedName(value = "key", alternate = {"clave"})
    private String clave;

    /** Valor del parámetro. */
    @SerializedName(value = "value", alternate = {"valor"})
    private String valor;

    /** Constructor vacío. */
    public ItemConfiguracion() {}

    public ItemConfiguracion(String clave, String valor) {
        this.clave = clave;
        this.valor = valor;
    }

    public String getClave() { return clave; }
    public void setClave(String clave) { this.clave = clave; }

    public String getValor() { return valor; }
    public void setValor(String valor) { this.valor = valor; }
}
