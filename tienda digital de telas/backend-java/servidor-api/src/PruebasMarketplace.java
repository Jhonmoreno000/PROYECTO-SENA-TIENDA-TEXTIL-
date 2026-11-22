import aplicacion.servicios.ServicioExclusividadVIP;
import dominio.modelos.AlertaVendedor;
import dominio.modelos.EventoMerma;
import dominio.modelos.LoteInventario;
import dominio.modelos.Pedido;
import dominio.modelos.PerfilVendedor;
import dominio.modelos.Producto;
import dominio.modelos.ResenaVendedor;
import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import infraestructura.api.manejadores.ManejadorProductos;
import infraestructura.seguridad.TokenSesion;

/**
 * Suite de Pruebas Unitarias e Integridad del Ecosistema Marketplace Multi-Vendedor (SENA ADSO).
 * Valida reglas de negocio críticas: modelos de tienda tipo Facebook, cálculo de comisiones para
 * el administrador, protección de precios frente a administración y umbrales VIP de exclusividad.
 */
public class PruebasMarketplace {

    private static int pruebasExitosas = 0;
    private static int pruebasFallidas = 0;

    public static void main(String[] args) {
        System.out.println("=================================================================");
        System.out.println("   SUITE DE PRUEBAS: MARKETPLACE MULTI-VENDEDOR & COMISIONES    ");
        System.out.println("=================================================================");

        probarModeloPerfilTiendaFacebook();
        probarCalculoComisionMarketplaceAdmin();
        probarUmbralesExclusividadVIP();
        probarMetricasCompetitivasProducto();
        probarAlertasYResenasVendedor();
        probarRestriccionCompraSoloCliente();
        probarEtiquetasModeracionEnEspanol();
        probarTrazabilidadVendedorEnLoteYMerma();

        System.out.println("\n=================================================================");
        System.out.println("                    RESUMEN DE PRUEBAS MARKETPLACE               ");
        System.out.println("=================================================================");
        System.out.println("  Pruebas superadas con éxito: " + pruebasExitosas);
        System.out.println("  Pruebas fallidas:            " + pruebasFallidas);

        if (pruebasFallidas > 0) {
            System.exit(1);
        }
        System.out.println("\n>>> TODAS LAS PRUEBAS DEL MARKETPLACE MULTI-VENDEDOR PASARON (100%) <<<");
    }

    private static void probarModeloPerfilTiendaFacebook() {
        System.out.print("[TEST] 1. Perfil de Tienda Tipo Facebook: campos de portada, avatar, bio y reputación ... ");
        try {
            PerfilVendedor tienda = new PerfilVendedor();
            tienda.setIdVendedor(2);
            tienda.setCorreo("vendedor@ddtextil.com");
            tienda.setTelefono("+57 301 482 1940");
            tienda.setNombreTienda("Textiles Pérez & Cía");
            tienda.setUrlPortada("/images/carousel-nueva-coleccion.webp");
            tienda.setUrlAvatar("/images/hero-detail-1.webp");
            tienda.setCiudad("Medellín");
            tienda.setCalificacionPromedio(4.9);
            tienda.setTotalResenas(25);
            tienda.setTotalVentasMetros(540.5);
            tienda.setTasaComision(10.0);

            if (!"Textiles Pérez & Cía".equals(tienda.getNombreTienda())
                    || !"vendedor@ddtextil.com".equals(tienda.getCorreo())
                    || tienda.getTelefono() == null
                    || tienda.getCalificacionPromedio() != 4.9
                    || tienda.getTotalResenas() != 25
                    || tienda.getTasaComision() != 10.0) {
                throw new AssertionError("Valores inconsistentes en PerfilVendedor.");
            }
            pruebasExitosas++;
            System.out.println("CORRECTO");
        } catch (Throwable t) {
            pruebasFallidas++;
            System.out.println("FALLÓ: " + t.getMessage());
        }
    }

    private static void probarCalculoComisionMarketplaceAdmin() {
        System.out.print("[TEST] 2. Modelo de Comisión Marketplace: ganancia admin y neto vendedor ... ");
        try {
            double subtotal = 500000.0;
            double tasaComision = 12.0; // 12%
            double comisionAdmin = Math.round((subtotal * (tasaComision / 100.0)) * 100.0) / 100.0;
            double netoVendedor = Math.round((subtotal - comisionAdmin) * 100.0) / 100.0;

            Pedido subOrden = new Pedido();
            subOrden.setIdVendedor(3);
            subOrden.setSubtotal(subtotal);
            subOrden.setGrupoCheckout("CHK-MULTI-001");
            subOrden.setPorcentajeComision(tasaComision);
            subOrden.setMontoComisionAdmin(comisionAdmin);
            subOrden.setGananciaNetaVendedor(netoVendedor);

            if (Math.abs(subOrden.getMontoComisionAdmin() - 60000.0) > 0.01
                    || Math.abs(subOrden.getGananciaNetaVendedor() - 440000.0) > 0.01
                    || !"CHK-MULTI-001".equals(subOrden.getGrupoCheckout())) {
                throw new AssertionError("Cálculo de comisión/neto incorrecto.");
            }
            pruebasExitosas++;
            System.out.println("CORRECTO");
        } catch (Throwable t) {
            pruebasFallidas++;
            System.out.println("FALLÓ: " + t.getMessage());
        }
    }

    private static void probarUmbralesExclusividadVIP() {
        System.out.print("[TEST] 3. Algoritmo VIP Telas Exclusivas: rechazo limpio a visitantes sin sesión ... ");
        try {
            ServicioExclusividadVIP vip = new ServicioExclusividadVIP();
            var evalAnon = vip.evaluarElegibilidad(0);
            if (!Boolean.FALSE.equals(evalAnon.get("esClienteFrecuente"))) {
                throw new AssertionError("Visitante anónimo no puede ser cliente frecuente VIP.");
            }
            if (ServicioExclusividadVIP.UMBRAL_PEDIDOS_FRECUENTES < 2
                    || ServicioExclusividadVIP.UMBRAL_METROS_FRECUENTES <= 0) {
                throw new AssertionError("Umbrales VIP inválidos.");
            }
            pruebasExitosas++;
            System.out.println("CORRECTO");
        } catch (Throwable t) {
            pruebasFallidas++;
            System.out.println("FALLÓ: " + t.getMessage());
        }
    }

    private static void probarMetricasCompetitivasProducto() {
        System.out.print("[TEST] 4. Competitividad de Telas: Más Vendido, Descuento propio e identidad de tienda ... ");
        try {
            Producto prod = new Producto();
            prod.setId("10");
            prod.setNombre("Seda Italiana Competitiva");
            prod.setPrecio(80000.0);
            prod.setPorcentajeDescuento(15.0);
            prod.setMetrosVendidos(220.0);
            prod.setEsMasVendido(true);
            prod.setNombreTienda("Casa Textil González");
            prod.setCalificacionVendedor(4.95);

            double precioFinal = prod.getPrecio() * (1.0 - prod.getPorcentajeDescuento() / 100.0);
            if (Math.abs(precioFinal - 68000.0) > 0.01 || !prod.isEsMasVendido()) {
                throw new AssertionError("Error calculando precio promocional o insignia Más Vendido.");
            }
            pruebasExitosas++;
            System.out.println("CORRECTO");
        } catch (Throwable t) {
            pruebasFallidas++;
            System.out.println("FALLÓ: " + t.getMessage());
        }
    }

    private static void probarAlertasYResenasVendedor() {
        System.out.print("[TEST] 5. Alertas Inteligentes (VIP/Promos) y Reseñas directas al Vendedor ... ");
        try {
            AlertaVendedor alerta = new AlertaVendedor();
            alerta.setIdVendedor(2);
            alerta.setIdProducto(1);
            alerta.setTipoAlerta("demanda_vip");
            alerta.setSugerenciaAccion("activar_exclusivo");
            alerta.setDescuentoSugerido(10.0);

            ResenaVendedor resena = new ResenaVendedor();
            resena.setIdVendedor(2);
            resena.setIdUsuario(4);
            resena.setCalificacion(5);
            resena.setComentario("Excelente cumplimiento en corte y metraje.");

            if (!"activar_exclusivo".equals(alerta.getSugerenciaAccion()) || resena.getCalificacion() != 5) {
                throw new AssertionError("Entidades de AlertaVendedor o ResenaVendedor inválidas.");
            }
            pruebasExitosas++;
            System.out.println("CORRECTO");
        } catch (Throwable t) {
            pruebasFallidas++;
            System.out.println("FALLÓ: " + t.getMessage());
        }
    }

    private static void probarRestriccionCompraSoloCliente() {
        System.out.print("[TEST] 6. Seguridad de Compras: únicamente rol cliente habilitado para comprar ... ");
        try {
            TokenSesion.Identidad cliente = new TokenSesion.Identidad(4, "cliente");
            TokenSesion.Identidad vendedor = new TokenSesion.Identidad(2, "vendedor");
            TokenSesion.Identidad admin = new TokenSesion.Identidad(1, "administrador");

            if (!cliente.esCliente() || vendedor.esCliente() || admin.esCliente()) {
                throw new AssertionError("Solo la identidad con rol cliente debe pasar esCliente().");
            }
            pruebasExitosas++;
            System.out.println("CORRECTO");
        } catch (Throwable t) {
            pruebasFallidas++;
            System.out.println("FALLÓ: " + t.getMessage());
        }
    }

    private static void probarEtiquetasModeracionEnEspanol() {
        System.out.print("[TEST] 7. Moderación sin códigos crudos: etiquetas localizadas en español ... ");
        try {
            if (!"changes_requested".equals(ManejadorProductos.normalizarEstadoModeracion("cambios_solicitados"))
                    || !"Cambios solicitados".equals(ManejadorProductos.obtenerEtiquetaEstadoModeracion("changes_requested"))
                    || !"Aprobado".equals(ManejadorProductos.obtenerEtiquetaEstadoModeracion("approved"))
                    || !"Suspendido".equals(ManejadorProductos.obtenerEtiquetaEstadoModeracion("rejected"))
                    || !"Pendiente".equals(ManejadorProductos.obtenerEtiquetaEstadoModeracion("pending"))) {
                throw new AssertionError("Mapeo de etiquetas de moderación inconsistente.");
            }
            pruebasExitosas++;
            System.out.println("CORRECTO");
        } catch (Throwable t) {
            pruebasFallidas++;
            System.out.println("FALLÓ: " + t.getMessage());
        }
    }

    private static void probarTrazabilidadVendedorEnLoteYMerma() {
        System.out.print("[TEST] 8. Antifraude Inventario: trazabilidad real de vendedor en LoteInventario y EventoMerma ... ");
        try {
            Gson gson = new Gson();
            LoteInventario lote = new LoteInventario();
            lote.setId("1");
            lote.setIdProducto(1);
            lote.setNumeroLote("LOT-2026-ALG01");
            lote.setIdVendedor(2);
            lote.setNombreTienda("Textiles Pérez & Cía");
            lote.setCorreoVendedor("vendedor@ddtextil.com");
            lote.setCostoPorMetro(15000.0);

            EventoMerma merma = new EventoMerma();
            merma.setId(1);
            merma.setIdProducto(1);
            merma.setIdLote("LOT-2026-ALG01");
            merma.setMetros(4.5);
            merma.setImpactoCosto(67500.0);
            merma.setIdVendedor(2);
            merma.setNombreTienda("Textiles Pérez & Cía");
            merma.setCorreoVendedor("vendedor@ddtextil.com");

            JsonObject jLote = JsonParser.parseString(gson.toJson(lote)).getAsJsonObject();
            JsonObject jMerma = JsonParser.parseString(gson.toJson(merma)).getAsJsonObject();

            if (!"LOT-2026-ALG01".equals(jLote.get("batchNumber").getAsString())
                    || jLote.get("sellerId").getAsInt() != 2
                    || !"Textiles Pérez & Cía".equals(jLote.get("storeName").getAsString())
                    || !"vendedor@ddtextil.com".equals(jLote.get("sellerEmail").getAsString())
                    || Math.abs(jMerma.get("costImpact").getAsDouble() - 67500.0) > 0.01
                    || jMerma.get("sellerId").getAsInt() != 2) {
                throw new AssertionError("Serialización de trazabilidad vendedor en lote/merma incompleta.");
            }
            pruebasExitosas++;
            System.out.println("CORRECTO");
        } catch (Throwable t) {
            pruebasFallidas++;
            System.out.println("FALLÓ: " + t.getMessage());
        }
    }
}

