package dominio.modelos;

import com.google.gson.annotations.SerializedName;

/**
 * Modelo de dominio que representa el perfil público de tienda de un vendedor externo
 * en el Marketplace D&D Textil (estilo perfil social/tienda oficial).
 * Mapea a la tabla `perfiles_vendedor` en PostgreSQL.
 */
public class PerfilVendedor {

    @SerializedName(value = "sellerId", alternate = {"vendedorId", "id"})
    private int idVendedor;

    @SerializedName(value = "sellerName", alternate = {"nombreVendedor"})
    private String nombreVendedor;

    @SerializedName(value = "email", alternate = {"correo"})
    private String correo;

    @SerializedName(value = "phone", alternate = {"telefono"})
    private String telefono;

    @SerializedName(value = "storeName", alternate = {"nombreTienda"})
    private String nombreTienda;

    @SerializedName(value = "slug", alternate = {"slugTienda"})
    private String slugTienda;

    @SerializedName(value = "bio", alternate = {"descripcionBio", "description"})
    private String descripcionBio;

    @SerializedName(value = "avatarUrl", alternate = {"urlAvatar", "avatar"})
    private String urlAvatar;

    @SerializedName(value = "coverUrl", alternate = {"urlPortada", "cover"})
    private String urlPortada;

    @SerializedName(value = "city", alternate = {"ciudad"})
    private String ciudad;

    @SerializedName(value = "country", alternate = {"pais"})
    private String pais;

    @SerializedName(value = "specialty", alternate = {"especialidad"})
    private String especialidad;

    @SerializedName(value = "verified", alternate = {"verificado"})
    private boolean verificado = true;

    @SerializedName(value = "shippingPolicy", alternate = {"politicaEnvio"})
    private String politicaEnvio;

    @SerializedName(value = "rating", alternate = {"calificacionPromedio"})
    private double calificacionPromedio;

    @SerializedName(value = "reviewsCount", alternate = {"totalResenas"})
    private int totalResenas;

    @SerializedName(value = "totalSoldMeters", alternate = {"totalVentasMetros"})
    private double totalVentasMetros;

    @SerializedName(value = "activeProductsCount", alternate = {"productosActivos"})
    private int productosActivos;

    @SerializedName(value = "commissionRate", alternate = {"tasaComision"})
    private double tasaComision = 10.0;

    @SerializedName(value = "updatedAt", alternate = {"actualizadoEn"})
    private String actualizadoEn;

    public PerfilVendedor() {}

    public int getIdVendedor() { return idVendedor; }
    public void setIdVendedor(int idVendedor) { this.idVendedor = idVendedor; }

    public String getNombreVendedor() { return nombreVendedor; }
    public void setNombreVendedor(String nombreVendedor) { this.nombreVendedor = nombreVendedor; }

    public String getCorreo() { return correo; }
    public void setCorreo(String correo) { this.correo = correo; }

    public String getTelefono() { return telefono; }
    public void setTelefono(String telefono) { this.telefono = telefono; }

    public String getNombreTienda() { return nombreTienda; }
    public void setNombreTienda(String nombreTienda) { this.nombreTienda = nombreTienda; }

    public String getSlugTienda() { return slugTienda; }
    public void setSlugTienda(String slugTienda) { this.slugTienda = slugTienda; }

    public String getDescripcionBio() { return descripcionBio; }
    public void setDescripcionBio(String descripcionBio) { this.descripcionBio = descripcionBio; }

    public String getUrlAvatar() { return urlAvatar; }
    public void setUrlAvatar(String urlAvatar) { this.urlAvatar = urlAvatar; }

    public String getUrlPortada() { return urlPortada; }
    public void setUrlPortada(String urlPortada) { this.urlPortada = urlPortada; }

    public String getCiudad() { return ciudad; }
    public void setCiudad(String ciudad) { this.ciudad = ciudad; }

    public String getPais() { return pais; }
    public void setPais(String pais) { this.pais = pais; }

    public String getEspecialidad() { return especialidad; }
    public void setEspecialidad(String especialidad) { this.especialidad = especialidad; }

    public boolean isVerificado() { return verificado; }
    public void setVerificado(boolean verificado) { this.verificado = verificado; }

    public String getPoliticaEnvio() { return politicaEnvio; }
    public void setPoliticaEnvio(String politicaEnvio) { this.politicaEnvio = politicaEnvio; }

    public double getCalificacionPromedio() { return calificacionPromedio; }
    public void setCalificacionPromedio(double calificacionPromedio) { this.calificacionPromedio = calificacionPromedio; }

    public int getTotalResenas() { return totalResenas; }
    public void setTotalResenas(int totalResenas) { this.totalResenas = totalResenas; }

    public double getTotalVentasMetros() { return totalVentasMetros; }
    public void setTotalVentasMetros(double totalVentasMetros) { this.totalVentasMetros = totalVentasMetros; }

    public int getProductosActivos() { return productosActivos; }
    public void setProductosActivos(int productosActivos) { this.productosActivos = productosActivos; }

    public double getTasaComision() { return tasaComision; }
    public void setTasaComision(double tasaComision) { this.tasaComision = tasaComision; }

    public String getActualizadoEn() { return actualizadoEn; }
    public void setActualizadoEn(String actualizadoEn) { this.actualizadoEn = actualizadoEn; }
}

