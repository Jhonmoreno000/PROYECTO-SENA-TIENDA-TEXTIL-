package dominio.modelos;

import com.google.gson.annotations.SerializedName;

/**
 * Modelo de dominio para alertas inteligentes dirigidas a vendedores del marketplace
 * (oportunidades de clientes frecuentes VIP, sugerencias de descuento competitivo, métricas de rotación).
 * Mapea a la tabla `alertas_vendedor` en PostgreSQL.
 */
public class AlertaVendedor {

    @SerializedName("id")
    private int id;

    @SerializedName(value = "sellerId", alternate = {"idVendedor"})
    private int idVendedor;

    @SerializedName(value = "productId", alternate = {"idProducto"})
    private Integer idProducto;

    @SerializedName(value = "productName", alternate = {"nombreProducto"})
    private String nombreProducto;

    @SerializedName(value = "alertType", alternate = {"tipoAlerta"})
    private String tipoAlerta;

    @SerializedName(value = "title", alternate = {"titulo"})
    private String titulo;

    @SerializedName(value = "message", alternate = {"mensaje"})
    private String mensaje;

    @SerializedName(value = "suggestedAction", alternate = {"sugerenciaAccion"})
    private String sugerenciaAccion;

    @SerializedName(value = "suggestedDiscount", alternate = {"descuentoSugerido"})
    private double descuentoSugerido;

    @SerializedName(value = "isRead", alternate = {"leida"})
    private boolean leida;

    @SerializedName(value = "applied", alternate = {"aplicada"})
    private boolean aplicada;

    @SerializedName(value = "createdAt", alternate = {"creadoEn"})
    private String fechaCreacion;

    public AlertaVendedor() {}

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public int getIdVendedor() { return idVendedor; }
    public void setIdVendedor(int idVendedor) { this.idVendedor = idVendedor; }

    public Integer getIdProducto() { return idProducto; }
    public void setIdProducto(Integer idProducto) { this.idProducto = idProducto; }

    public String getNombreProducto() { return nombreProducto; }
    public void setNombreProducto(String nombreProducto) { this.nombreProducto = nombreProducto; }

    public String getTipoAlerta() { return tipoAlerta; }
    public void setTipoAlerta(String tipoAlerta) { this.tipoAlerta = tipoAlerta; }

    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }

    public String getMensaje() { return mensaje; }
    public void setMensaje(String mensaje) { this.mensaje = mensaje; }

    public String getSugerenciaAccion() { return sugerenciaAccion; }
    public void setSugerenciaAccion(String sugerenciaAccion) { this.sugerenciaAccion = sugerenciaAccion; }

    public double getDescuentoSugerido() { return descuentoSugerido; }
    public void setDescuentoSugerido(double descuentoSugerido) { this.descuentoSugerido = descuentoSugerido; }

    public boolean isLeida() { return leida; }
    public void setLeida(boolean leida) { this.leida = leida; }

    public boolean isAplicada() { return aplicada; }
    public void setAplicada(boolean aplicada) { this.aplicada = aplicada; }

    public String getFechaCreacion() { return fechaCreacion; }
    public void setFechaCreacion(String fechaCreacion) { this.fechaCreacion = fechaCreacion; }
}

