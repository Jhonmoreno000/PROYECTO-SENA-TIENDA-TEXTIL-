package dominio.modelos;

import com.google.gson.annotations.SerializedName;

/**
 * Modelo de dominio para reseñas directas emitidas por clientes hacia un vendedor del marketplace.
 * Mapea a la tabla `resenas_vendedor` en PostgreSQL.
 */
public class ResenaVendedor {

    @SerializedName("id")
    private int id;

    @SerializedName(value = "sellerId", alternate = {"idVendedor"})
    private int idVendedor;

    @SerializedName(value = "userId", alternate = {"idUsuario"})
    private int idUsuario;

    @SerializedName(value = "userName", alternate = {"nombreUsuario"})
    private String nombreUsuario;

    @SerializedName(value = "orderId", alternate = {"idPedido"})
    private Integer idPedido;

    @SerializedName(value = "rating", alternate = {"calificacion"})
    private int calificacion;

    @SerializedName(value = "comment", alternate = {"comentario"})
    private String comentario;

    @SerializedName(value = "createdAt", alternate = {"fechaCreacion", "creadoEn"})
    private String fechaCreacion;

    public ResenaVendedor() {}

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public int getIdVendedor() { return idVendedor; }
    public void setIdVendedor(int idVendedor) { this.idVendedor = idVendedor; }

    public int getIdUsuario() { return idUsuario; }
    public void setIdUsuario(int idUsuario) { this.idUsuario = idUsuario; }

    public String getNombreUsuario() { return nombreUsuario; }
    public void setNombreUsuario(String nombreUsuario) { this.nombreUsuario = nombreUsuario; }

    public Integer getIdPedido() { return idPedido; }
    public void setIdPedido(Integer idPedido) { this.idPedido = idPedido; }

    public int getCalificacion() { return calificacion; }
    public void setCalificacion(int calificacion) { this.calificacion = calificacion; }

    public String getComentario() { return comentario; }
    public void setComentario(String comentario) { this.comentario = comentario; }

    public String getFechaCreacion() { return fechaCreacion; }
    public void setFechaCreacion(String fechaCreacion) { this.fechaCreacion = fechaCreacion; }
}

