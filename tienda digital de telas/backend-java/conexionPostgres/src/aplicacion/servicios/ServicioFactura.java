package aplicacion.servicios;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;

import java.io.ByteArrayOutputStream;
import java.text.NumberFormat;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;

/**
 * Servicio de Aplicación para la generación de Facturas Electrónicas en formato PDF.
 * Construye dinámicamente un documento PDF con marca de agua, datos fiscales de D&D Textil,
 * tabla de ítems de compra, cálculo de IVA 19% y valor en letras.
 */
public class ServicioFactura {

    /** Margen exterior de las páginas PDF en puntos. */
    private static final float MARGEN = 50;
    /** Ancho total de la página formato A4. */
    private static final float ANCHO_PAGINA = PDRectangle.A4.getWidth();
    /** Alto total de la página formato A4. */
    private static final float ALTO_PAGINA = PDRectangle.A4.getHeight();
    /** Formateador de moneda en pesos colombianos (COP). */
    private static final NumberFormat COP = NumberFormat.getCurrencyInstance(new Locale("es", "CO"));

    /**
     * Genera el documento PDF de la factura electrónica.
     */
    public byte[] generarFactura(
            int idPedido,
            String nombreCliente,
            String correoCliente,
            String telefonoCliente,
            String direccionCliente,
            String documentoCliente,
            List<Map<String, Object>> articulos,
            double subtotal,
            double descuento,
            double envio,
            double impuestos,
            double total,
            String metodoPago
    ) throws Exception {
        try (PDDocument documento = new PDDocument()) {
            PDPage pagina = new PDPage(PDRectangle.A4);
            documento.addPage(pagina);

            PDPageContentStream flujoContenido = new PDPageContentStream(documento, pagina);

            dibujarMarcaAgua(flujoContenido);

            float y = ALTO_PAGINA - MARGEN;

            y = dibujarEncabezado(flujoContenido, y, idPedido);
            y = dibujarDatosCliente(flujoContenido, y, nombreCliente, correoCliente, telefonoCliente, direccionCliente, documentoCliente);
            y = dibujarTablaArticulos(documento, flujoContenido, y, articulos);
            y = dibujarTotales(flujoContenido, y, subtotal, descuento, envio, impuestos, total, metodoPago);

            dibujarPiePagina(flujoContenido, y);

            flujoContenido.close();

            ByteArrayOutputStream salida = new ByteArrayOutputStream();
            documento.save(salida);
            return salida.toByteArray();
        }
    }

    protected static float[] rgb(int r, int g, int b) {
        return new float[]{r / 255f, g / 255f, b / 255f};
    }

    private float dibujarEncabezado(PDPageContentStream cs, float y, int idPedido) throws Exception {
        float margenIzquierdo = MARGEN;

        cs.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD), 22);
        cs.beginText();
        cs.newLineAtOffset(margenIzquierdo, y - 5);
        cs.showText("D&D TEXTIL");
        cs.endText();

        cs.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA), 9);
        cs.beginText();
        cs.newLineAtOffset(margenIzquierdo, y - 22);
        cs.showText("NIT 900.123.456-7");
        cs.newLineAtOffset(0, -12);
        cs.showText("Calle 50 # 20-30, Bogota D.C.");
        cs.newLineAtOffset(0, -12);
        cs.showText("Tel: (601) 555-0199 | info@ddtextil.com");
        cs.endText();

        cs.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD), 14);
        cs.beginText();
        cs.newLineAtOffset(ANCHO_PAGINA - MARGEN - 180, y - 5);
        cs.showText("FACTURA ELECTRONICA");
        cs.endText();

        cs.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA), 9);
        cs.beginText();
        cs.newLineAtOffset(ANCHO_PAGINA - MARGEN - 180, y - 22);
        cs.showText("No. FAC-" + String.format("%06d", idPedido));
        cs.newLineAtOffset(0, -12);
        cs.showText("Fecha: " + LocalDate.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")));
        cs.newLineAtOffset(0, -12);
        cs.showText("CUFE: " + UUID.randomUUID().toString().replace("-", "").substring(0, 32).toUpperCase());
        cs.endText();

        cs.setLineWidth(1f);
        cs.moveTo(margenIzquierdo, y - 48);
        cs.lineTo(ANCHO_PAGINA - MARGEN, y - 48);
        cs.stroke();

        return y - 65;
    }

    private float dibujarDatosCliente(PDPageContentStream cs, float y,
                                      String nombre, String correo, String telefono, String direccion, String documento) throws Exception {
        float margenIzquierdo = MARGEN;

        cs.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD), 11);
        cs.beginText();
        cs.newLineAtOffset(margenIzquierdo, y);
        cs.showText("DATOS DEL CLIENTE");
        cs.endText();

        y -= 18;
        cs.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA), 9);
        cs.beginText();
        cs.newLineAtOffset(margenIzquierdo, y);
        cs.showText("Cliente: " + (nombre != null ? nombre : "N/A"));
        cs.newLineAtOffset(0, -12);
        cs.showText("NIT/CC: " + (documento != null ? documento : "N/A"));
        cs.newLineAtOffset(0, -12);
        cs.showText("Direccion: " + (direccion != null ? direccion : "N/A"));
        cs.newLineAtOffset(0, -12);
        cs.showText("Email: " + (correo != null ? correo : "N/A"));
        cs.newLineAtOffset(0, -12);
        cs.showText("Telefono: " + (telefono != null ? telefono : "N/A"));
        cs.endText();

        y -= 65;

        float[] gris = rgb(200, 200, 200);
        cs.setStrokingColor(gris[0], gris[1], gris[2]);
        cs.setLineWidth(0.5f);
        cs.moveTo(margenIzquierdo, y);
        cs.lineTo(ANCHO_PAGINA - MARGEN, y);
        cs.stroke();
        cs.setStrokingColor(0f, 0f, 0f);

        return y - 15;
    }

    private float dibujarTablaArticulos(PDDocument doc, PDPageContentStream cs, float y, List<Map<String, Object>> articulos) throws Exception {
        float margenIzquierdo = MARGEN;
        float anchoTabla = ANCHO_PAGINA - 2 * MARGEN;
        float[] anchosColumnas = {30, 250, 60, 80, 100};
        float[] inicioColumnas = new float[anchosColumnas.length];
        inicioColumnas[0] = margenIzquierdo;
        for (int i = 1; i < anchosColumnas.length; i++) {
            inicioColumnas[i] = inicioColumnas[i-1] + anchosColumnas[i-1];
        }

        cs.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD), 9);
        float[] fondoEncabezado = rgb(60, 60, 60);
        cs.setNonStrokingColor(fondoEncabezado[0], fondoEncabezado[1], fondoEncabezado[2]);
        cs.addRect(margenIzquierdo, y - 18, anchoTabla, 18);
        cs.fill();
        cs.setNonStrokingColor(1f, 1f, 1f);

        String[] encabezados = {"#", "Producto", "Cant.", "Precio Unit.", "Total"};
        for (int i = 0; i < encabezados.length; i++) {
            cs.beginText();
            cs.newLineAtOffset(inicioColumnas[i] + 4, y - 13);
            cs.showText(encabezados[i]);
            cs.endText();
        }
        cs.setNonStrokingColor(0f, 0f, 0f);

        y -= 22;

        cs.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA), 9);
        int fila = 1;
        for (Map<String, Object> articulo : articulos) {
            String nombre = (String) articulo.getOrDefault("name", articulo.getOrDefault("nombre", "Producto"));
            int cantidad = ((Number) articulo.getOrDefault("quantity", articulo.getOrDefault("cantidad", 1))).intValue();
            double precioUnitario = ((Number) articulo.getOrDefault("unitPrice", articulo.getOrDefault("precioUnitario", 0))).doubleValue();
            double totalArticulo = cantidad * precioUnitario;

            if (y < 80) {
                cs.close();
                PDPage nuevaPagina = new PDPage(PDRectangle.A4);
                doc.addPage(nuevaPagina);
                cs = new PDPageContentStream(doc, nuevaPagina);
                dibujarMarcaAgua(cs);
                cs.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA), 9);
                y = ALTO_PAGINA - MARGEN - 20;
            }

            if (fila % 2 == 0) {
                float[] fondoFila = rgb(245, 245, 245);
                cs.setNonStrokingColor(fondoFila[0], fondoFila[1], fondoFila[2]);
                cs.addRect(margenIzquierdo, y - 14, anchoTabla, 14);
                cs.fill();
                cs.setNonStrokingColor(0f, 0f, 0f);
            }

            cs.beginText();
            cs.newLineAtOffset(inicioColumnas[0] + 4, y - 4);
            cs.showText(String.valueOf(fila));
            cs.endText();

            cs.beginText();
            cs.newLineAtOffset(inicioColumnas[1] + 4, y - 4);
            String nombreVisual = nombre.length() > 40 ? nombre.substring(0, 40) + "..." : nombre;
            cs.showText(nombreVisual);
            cs.endText();

            cs.beginText();
            cs.newLineAtOffset(inicioColumnas[2] + 4, y - 4);
            cs.showText(String.valueOf(cantidad));
            cs.endText();

            cs.beginText();
            cs.newLineAtOffset(inicioColumnas[3] + 4, y - 4);
            cs.showText(COP.format(precioUnitario));
            cs.endText();

            cs.beginText();
            cs.newLineAtOffset(inicioColumnas[4] + 4, y - 4);
            cs.showText(COP.format(totalArticulo));
            cs.endText();

            y -= 16;
            fila++;
        }

        return y - 8;
    }

    private float dibujarTotales(PDPageContentStream cs, float y,
                                 double subtotal, double descuento, double envio, double impuesto, double total,
                                 String metodoPago) throws Exception {
        float margenDerecho = ANCHO_PAGINA - MARGEN;
        float xEtiqueta = margenDerecho - 200;
        float xValor = margenDerecho - 80;

        cs.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA), 9);
        cs.beginText();
        cs.newLineAtOffset(xEtiqueta, y);
        cs.showText("Subtotal:");
        cs.endText();
        cs.beginText();
        cs.newLineAtOffset(xValor, y);
        cs.showText(COP.format(subtotal));
        cs.endText();
        y -= 14;

        if (descuento > 0) {
            cs.beginText();
            cs.newLineAtOffset(xEtiqueta, y);
            cs.showText("Descuento:");
            cs.endText();
            cs.beginText();
            cs.newLineAtOffset(xValor, y);
            cs.showText("-" + COP.format(descuento));
            cs.endText();
            y -= 14;
        }

        if (envio > 0) {
            cs.beginText();
            cs.newLineAtOffset(xEtiqueta, y);
            cs.showText("Envio:");
            cs.endText();
            cs.beginText();
            cs.newLineAtOffset(xValor, y);
            cs.showText(COP.format(envio));
            cs.endText();
            y -= 14;
        }

        cs.beginText();
        cs.newLineAtOffset(xEtiqueta, y);
        cs.showText("IVA 19%:");
        cs.endText();
        cs.beginText();
        cs.newLineAtOffset(xValor, y);
        cs.showText(COP.format(impuesto));
        cs.endText();
        y -= 14;

        cs.setLineWidth(0.5f);
        cs.moveTo(xEtiqueta, y + 4);
        cs.lineTo(margenDerecho, y + 4);
        cs.stroke();
        y -= 6;

        cs.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD), 11);
        cs.beginText();
        cs.newLineAtOffset(xEtiqueta, y);
        cs.showText("TOTAL:");
        cs.endText();
        cs.beginText();
        cs.newLineAtOffset(xValor, y);
        cs.showText(COP.format(total));
        cs.endText();
        y -= 18;

        cs.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA), 8);
        cs.beginText();
        cs.newLineAtOffset(xEtiqueta, y);
        cs.showText("Metodo de pago: " + (metodoPago != null ? metodoPago : "N/A"));
        cs.endText();
        y -= 12;
        cs.beginText();
        cs.newLineAtOffset(xEtiqueta, y);
        cs.showText("Son: " + numeroAPalabras(total) + " pesos M/CTC.");
        cs.endText();

        return y - 20;
    }

    private void dibujarPiePagina(PDPageContentStream cs, float y) throws Exception {
        float margenIzquierdo = MARGEN;

        y = 80;
        float[] gris = rgb(200, 200, 200);
        cs.setStrokingColor(gris[0], gris[1], gris[2]);
        cs.setLineWidth(0.5f);
        cs.moveTo(margenIzquierdo, y);
        cs.lineTo(ANCHO_PAGINA - MARGEN, y);
        cs.stroke();
        cs.setStrokingColor(0f, 0f, 0f);

        cs.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA), 7);
        cs.setNonStrokingColor(120f / 255f, 120f / 255f, 120f / 255f);
        cs.beginText();
        cs.newLineAtOffset(margenIzquierdo, y - 12);
        cs.showText("D&D Textil - NIT 900.123.456-7 - Calle 50 # 20-30, Bogota D.C.");
        cs.newLineAtOffset(0, -10);
        cs.showText("Esta factura se asimila en todos sus efectos a una letra de cambio (Art. 774 C.Co.).");
        cs.newLineAtOffset(0, -10);
        cs.showText("Generado electronicamente el " + LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")));
        cs.endText();
        cs.setNonStrokingColor(0f, 0f, 0f);
    }

    private void dibujarMarcaAgua(PDPageContentStream cs) throws Exception {
        cs.saveGraphicsState();
        float[] colorMarca = rgb(215, 215, 215);
        cs.setNonStrokingColor(colorMarca[0], colorMarca[1], colorMarca[2]);

        float centroX = ANCHO_PAGINA / 2;
        float centroY = ALTO_PAGINA / 2;

        cs.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD), 32);
        cs.beginText();
        cs.newLineAtOffset(centroX - 155, centroY + 15);
        cs.showText("FACTURA ELECTRONICA");
        cs.endText();

        cs.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD), 18);
        cs.beginText();
        cs.newLineAtOffset(centroX - 140, centroY - 18);
        cs.showText("D&D Textil - NIT 900.123.456-7");
        cs.endText();

        cs.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA), 10);
        cs.beginText();
        cs.newLineAtOffset(centroX - 90, centroY - 42);
        cs.showText("Documento equivalente a factura");
        cs.endText();

        cs.restoreGraphicsState();
    }

    private String numeroAPalabras(double monto) {
        long parteEntera = (long) monto;
        int centavos = (int) Math.round((monto - parteEntera) * 100);
        String resultado = ConvertidorNumeroAPalabras.convertir(parteEntera);
        if (centavos > 0) {
            resultado += " con " + centavos + "/100";
        }
        return resultado;
    }

    private static class ConvertidorNumeroAPalabras {
        private static final String[] UNIDADES = {"", "UN", "DOS", "TRES", "CUATRO", "CINCO", "SEIS", "SIETE", "OCHO", "NUEVE", "DIEZ",
                "ONCE", "DOCE", "TRECE", "CATORCE", "QUINCE", "DIECISEIS", "DIECISIETE", "DIECIOCHO", "DIECINUEVE", "VEINTE"};
        private static final String[] DECENAS = {"", "", "VEINTI", "TREINTA", "CUARENTA", "CINCUENTA", "SESENTA", "SETENTA", "OCHENTA", "NOVENTA"};
        private static final String[] CENTENAS = {"", "CIENTO", "DOSCIENTOS", "TRESCIENTOS", "CUATROCIENTOS", "QUINIENTOS",
                "SEISCIENTOS", "SETECIENTOS", "OCHOCIENTOS", "NOVECIENTOS"};

        static String convertir(long n) {
            if (n == 0) return "CERO";
            if (n == 1) return "UN";
            return convertirGrupo(n).trim();
        }

        private static String convertirGrupo(long n) {
            if (n >= 1000000000) {
                long milesDeMillones = n / 1000000000;
                long resto = n % 1000000000;
                String prefijo = milesDeMillones == 1 ? "MIL MILLONES" : convertirGrupo(milesDeMillones) + " MIL MILLONES";
                return resto > 0 ? prefijo + " " + convertirGrupo(resto) : prefijo;
            }
            if (n >= 1000000) {
                long millones = n / 1000000;
                long resto = n % 1000000;
                String prefijo = millones == 1 ? "UN MILLON" : convertirGrupo(millones) + " MILLONES";
                return resto > 0 ? prefijo + " " + convertirGrupo(resto) : prefijo;
            }
            if (n >= 1000) {
                long miles = n / 1000;
                long resto = n % 1000;
                String prefijo = miles == 1 ? "MIL" : convertirGrupo(miles) + " MIL";
                return resto > 0 ? prefijo + " " + convertirGrupo(resto) : prefijo;
            }
            if (n >= 100) {
                long centenas = n / 100;
                long resto = n % 100;
                String prefijo = centenas == 1 && resto == 0 ? "CIEN" : CENTENAS[(int) centenas];
                return resto > 0 ? prefijo + " " + convertirGrupo(resto) : prefijo;
            }
            if (n >= 30) {
                int decenas = (int) (n / 10);
                int unidades = (int) (n % 10);
                return unidades > 0 ? DECENAS[decenas] + " Y " + UNIDADES[unidades] : DECENAS[decenas];
            }
            return UNIDADES[(int) n];
        }
    }
}
