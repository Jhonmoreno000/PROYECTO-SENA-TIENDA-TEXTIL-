package application.services;

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

public class InvoiceService {

    private static final float MARGIN = 50;
    private static final float PAGE_WIDTH = PDRectangle.A4.getWidth();
    private static final float PAGE_HEIGHT = PDRectangle.A4.getHeight();
    private static final NumberFormat COP = NumberFormat.getCurrencyInstance(new Locale("es", "CO"));

    public byte[] generateInvoice(
            int orderId,
            String clientName,
            String clientEmail,
            String clientPhone,
            String clientAddress,
            String clientDoc,
            List<Map<String, Object>> items,
            double subtotal,
            double discount,
            double shipping,
            double tax,
            double total,
            String paymentMethod
    ) throws Exception {
        try (PDDocument doc = new PDDocument()) {
            PDPage page = new PDPage(PDRectangle.A4);
            doc.addPage(page);

            PDPageContentStream cs = new PDPageContentStream(doc, page);

            drawWatermark(cs);

            float y = PAGE_HEIGHT - MARGIN;

            y = drawHeader(cs, y, orderId);

            y = drawCustomerInfo(cs, y, clientName, clientEmail, clientPhone, clientAddress, clientDoc);

            y = drawItemsTable(doc, cs, y, items);

            y = drawTotals(cs, y, subtotal, discount, shipping, tax, total, paymentMethod);

            drawFooter(cs, y);

            cs.close();

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            doc.save(baos);
            return baos.toByteArray();
        }
    }

    protected static float[] rgb(int r, int g, int b) {
        return new float[]{r / 255f, g / 255f, b / 255f};
    }

    private float drawHeader(PDPageContentStream cs, float y, int orderId) throws Exception {
        float leftX = MARGIN;

        cs.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD), 22);
        cs.beginText();
        cs.newLineAtOffset(leftX, y - 5);
        cs.showText("D&D TEXTIL");
        cs.endText();

        cs.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA), 9);
        cs.beginText();
        cs.newLineAtOffset(leftX, y - 22);
        cs.showText("NIT 900.123.456-7");
        cs.newLineAtOffset(0, -12);
        cs.showText("Calle 50 # 20-30, Bogota D.C.");
        cs.newLineAtOffset(0, -12);
        cs.showText("Tel: (601) 555-0199 | info@ddtextil.com");
        cs.endText();

        cs.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD), 14);
        cs.beginText();
        cs.newLineAtOffset(PAGE_WIDTH - MARGIN - 180, y - 5);
        cs.showText("FACTURA ELECTRONICA");
        cs.endText();

        cs.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA), 9);
        cs.beginText();
        cs.newLineAtOffset(PAGE_WIDTH - MARGIN - 180, y - 22);
        cs.showText("No. FAC-" + String.format("%06d", orderId));
        cs.newLineAtOffset(0, -12);
        cs.showText("Fecha: " + LocalDate.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")));
        cs.newLineAtOffset(0, -12);
        cs.showText("CUFE: " + UUID.randomUUID().toString().replace("-", "").substring(0, 32).toUpperCase());
        cs.endText();

        cs.setLineWidth(1f);
        cs.moveTo(leftX, y - 48);
        cs.lineTo(PAGE_WIDTH - MARGIN, y - 48);
        cs.stroke();

        return y - 65;
    }

    private float drawCustomerInfo(PDPageContentStream cs, float y,
                                    String name, String email, String phone, String address, String doc) throws Exception {
        float leftX = MARGIN;

        cs.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD), 11);
        cs.beginText();
        cs.newLineAtOffset(leftX, y);
        cs.showText("DATOS DEL CLIENTE");
        cs.endText();

        y -= 18;
        cs.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA), 9);
        cs.beginText();
        cs.newLineAtOffset(leftX, y);
        cs.showText("Cliente: " + (name != null ? name : "N/A"));
        cs.newLineAtOffset(0, -12);
        cs.showText("NIT/CC: " + (doc != null ? doc : "N/A"));
        cs.newLineAtOffset(0, -12);
        cs.showText("Direccion: " + (address != null ? address : "N/A"));
        cs.newLineAtOffset(0, -12);
        cs.showText("Email: " + (email != null ? email : "N/A"));
        cs.newLineAtOffset(0, -12);
        cs.showText("Telefono: " + (phone != null ? phone : "N/A"));
        cs.endText();

        y -= 65;

        float[] gray = rgb(200, 200, 200);
        cs.setStrokingColor(gray[0], gray[1], gray[2]);
        cs.setLineWidth(0.5f);
        cs.moveTo(leftX, y);
        cs.lineTo(PAGE_WIDTH - MARGIN, y);
        cs.stroke();
        cs.setStrokingColor(0f, 0f, 0f);

        return y - 15;
    }

    private float drawItemsTable(PDDocument doc, PDPageContentStream cs, float y, List<Map<String, Object>> items) throws Exception {
        float leftX = MARGIN;
        float tableWidth = PAGE_WIDTH - 2 * MARGIN;
        float[] colWidths = {30, 250, 60, 80, 100};
        float[] colStarts = new float[colWidths.length];
        colStarts[0] = leftX;
        for (int i = 1; i < colWidths.length; i++) {
            colStarts[i] = colStarts[i-1] + colWidths[i-1];
        }

        cs.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD), 9);
        float[] headerBg = rgb(60, 60, 60);
        cs.setNonStrokingColor(headerBg[0], headerBg[1], headerBg[2]);
        cs.addRect(leftX, y - 18, tableWidth, 18);
        cs.fill();
        cs.setNonStrokingColor(1f, 1f, 1f);

        String[] headers = {"#", "Producto", "Cant.", "Precio Unit.", "Total"};
        for (int i = 0; i < headers.length; i++) {
            cs.beginText();
            cs.newLineAtOffset(colStarts[i] + 4, y - 13);
            cs.showText(headers[i]);
            cs.endText();
        }
        cs.setNonStrokingColor(0f, 0f, 0f);

        y -= 22;

        cs.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA), 9);
        int row = 1;
        for (Map<String, Object> item : items) {
            String name = (String) item.getOrDefault("name", "Producto");
            int qty = ((Number) item.getOrDefault("quantity", 1)).intValue();
            double unitPrice = ((Number) item.getOrDefault("unitPrice", 0)).doubleValue();
            double itemTotal = qty * unitPrice;

            if (y < 80) {
                cs.close();
                PDPage newPage = new PDPage(PDRectangle.A4);
                doc.addPage(newPage);
                cs = new PDPageContentStream(doc, newPage);
                drawWatermark(cs);
                cs.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA), 9);
                y = PAGE_HEIGHT - MARGIN - 20;
            }

            if (row % 2 == 0) {
                float[] rowBg = rgb(245, 245, 245);
                cs.setNonStrokingColor(rowBg[0], rowBg[1], rowBg[2]);
                cs.addRect(leftX, y - 14, tableWidth, 14);
                cs.fill();
                cs.setNonStrokingColor(0f, 0f, 0f);
            }

            cs.beginText();
            cs.newLineAtOffset(colStarts[0] + 4, y - 4);
            cs.showText(String.valueOf(row));
            cs.endText();

            cs.beginText();
            cs.newLineAtOffset(colStarts[1] + 4, y - 4);
            String displayName = name.length() > 40 ? name.substring(0, 40) + "..." : name;
            cs.showText(displayName);
            cs.endText();

            cs.beginText();
            cs.newLineAtOffset(colStarts[2] + 4, y - 4);
            cs.showText(String.valueOf(qty));
            cs.endText();

            cs.beginText();
            cs.newLineAtOffset(colStarts[3] + 4, y - 4);
            cs.showText(COP.format(unitPrice));
            cs.endText();

            cs.beginText();
            cs.newLineAtOffset(colStarts[4] + 4, y - 4);
            cs.showText(COP.format(itemTotal));
            cs.endText();

            y -= 16;
            row++;
        }

        return y - 8;
    }

    private float drawTotals(PDPageContentStream cs, float y,
                              double subtotal, double discount, double shipping, double tax, double total,
                              String paymentMethod) throws Exception {
        float rightX = PAGE_WIDTH - MARGIN;
        float labelX = rightX - 200;
        float valueX = rightX - 80;

        cs.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA), 9);
        cs.beginText();
        cs.newLineAtOffset(labelX, y);
        cs.showText("Subtotal:");
        cs.endText();
        cs.beginText();
        cs.newLineAtOffset(valueX, y);
        cs.showText(COP.format(subtotal));
        cs.endText();
        y -= 14;

        if (discount > 0) {
            cs.beginText();
            cs.newLineAtOffset(labelX, y);
            cs.showText("Descuento:");
            cs.endText();
            cs.beginText();
            cs.newLineAtOffset(valueX, y);
            cs.showText("-" + COP.format(discount));
            cs.endText();
            y -= 14;
        }

        if (shipping > 0) {
            cs.beginText();
            cs.newLineAtOffset(labelX, y);
            cs.showText("Envio:");
            cs.endText();
            cs.beginText();
            cs.newLineAtOffset(valueX, y);
            cs.showText(COP.format(shipping));
            cs.endText();
            y -= 14;
        }

        cs.beginText();
        cs.newLineAtOffset(labelX, y);
        cs.showText("IVA 19%:");
        cs.endText();
        cs.beginText();
        cs.newLineAtOffset(valueX, y);
        cs.showText(COP.format(tax));
        cs.endText();
        y -= 14;

        cs.setLineWidth(0.5f);
        cs.moveTo(labelX, y + 4);
        cs.lineTo(rightX, y + 4);
        cs.stroke();
        y -= 6;

        cs.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD), 11);
        cs.beginText();
        cs.newLineAtOffset(labelX, y);
        cs.showText("TOTAL:");
        cs.endText();
        cs.beginText();
        cs.newLineAtOffset(valueX, y);
        cs.showText(COP.format(total));
        cs.endText();
        y -= 18;

        cs.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA), 8);
        cs.beginText();
        cs.newLineAtOffset(labelX, y);
        cs.showText("Metodo de pago: " + (paymentMethod != null ? paymentMethod : "N/A"));
        cs.endText();
        y -= 12;
        cs.beginText();
        cs.newLineAtOffset(labelX, y);
        cs.showText("Son: " + numberToWords(total) + " pesos M/CTC.");
        cs.endText();

        return y - 20;
    }

    private void drawFooter(PDPageContentStream cs, float y) throws Exception {
        float leftX = MARGIN;

        y = 80;
        float[] gray = rgb(200, 200, 200);
        cs.setStrokingColor(gray[0], gray[1], gray[2]);
        cs.setLineWidth(0.5f);
        cs.moveTo(leftX, y);
        cs.lineTo(PAGE_WIDTH - MARGIN, y);
        cs.stroke();
        cs.setStrokingColor(0f, 0f, 0f);

        cs.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA), 7);
        cs.setNonStrokingColor(120f / 255f, 120f / 255f, 120f / 255f);
        cs.beginText();
        cs.newLineAtOffset(leftX, y - 12);
        cs.showText("D&D Textil - NIT 900.123.456-7 - Calle 50 # 20-30, Bogota D.C.");
        cs.newLineAtOffset(0, -10);
        cs.showText("Esta factura se asimila en todos sus efectos a una letra de cambio (Art. 774 C.Co.).");
        cs.newLineAtOffset(0, -10);
        cs.showText("Generado electronicamente el " + LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")));
        cs.endText();
        cs.setNonStrokingColor(0f, 0f, 0f);
    }

    private void drawWatermark(PDPageContentStream cs) throws Exception {
        cs.saveGraphicsState();
        float[] wm = rgb(215, 215, 215);
        cs.setNonStrokingColor(wm[0], wm[1], wm[2]);

        float centerX = PAGE_WIDTH / 2;
        float centerY = PAGE_HEIGHT / 2;

        cs.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD), 32);
        cs.beginText();
        cs.newLineAtOffset(centerX - 155, centerY + 15);
        cs.showText("FACTURA ELECTRONICA");
        cs.endText();

        cs.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD), 18);
        cs.beginText();
        cs.newLineAtOffset(centerX - 140, centerY - 18);
        cs.showText("D&D Textil - NIT 900.123.456-7");
        cs.endText();

        cs.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA), 10);
        cs.beginText();
        cs.newLineAtOffset(centerX - 90, centerY - 42);
        cs.showText("Documento equivalente a factura");
        cs.endText();

        cs.restoreGraphicsState();
    }

    private String numberToWords(double amount) {
        long wholePart = (long) amount;
        int cents = (int) Math.round((amount - wholePart) * 100);
        String result = NumberToWordsConverter.convert(wholePart);
        if (cents > 0) {
            result += " con " + cents + "/100";
        }
        return result;
    }

    private static class NumberToWordsConverter {
        private static final String[] UNITS = {"", "UN", "DOS", "TRES", "CUATRO", "CINCO", "SEIS", "SIETE", "OCHO", "NUEVE", "DIEZ",
                "ONCE", "DOCE", "TRECE", "CATORCE", "QUINCE", "DIECISEIS", "DIECISIETE", "DIECIOCHO", "DIECINUEVE", "VEINTE"};
        private static final String[] TENS = {"", "", "VEINTI", "TREINTA", "CUARENTA", "CINCUENTA", "SESENTA", "SETENTA", "OCHENTA", "NOVENTA"};
        private static final String[] HUNDREDS = {"", "CIENTO", "DOSCIENTOS", "TRESCIENTOS", "CUATROCIENTOS", "QUINIENTOS",
                "SEISCIENTOS", "SETECIENTOS", "OCHOCIENTOS", "NOVECIENTOS"};

        static String convert(long n) {
            if (n == 0) return "CERO";
            if (n == 1) return "UN";
            return convertGroup(n).trim();
        }

        private static String convertGroup(long n) {
            if (n >= 1000000000) {
                long billions = n / 1000000000;
                long remainder = n % 1000000000;
                String prefix = billions == 1 ? "MIL MILLONES" : convertGroup(billions) + " MIL MILLONES";
                return remainder > 0 ? prefix + " " + convertGroup(remainder) : prefix;
            }
            if (n >= 1000000) {
                long millions = n / 1000000;
                long remainder = n % 1000000;
                String prefix = millions == 1 ? "UN MILLON" : convertGroup(millions) + " MILLONES";
                return remainder > 0 ? prefix + " " + convertGroup(remainder) : prefix;
            }
            if (n >= 1000) {
                long thousands = n / 1000;
                long remainder = n % 1000;
                String prefix = thousands == 1 ? "MIL" : convertGroup(thousands) + " MIL";
                return remainder > 0 ? prefix + " " + convertGroup(remainder) : prefix;
            }
            if (n >= 100) {
                long hundreds = n / 100;
                long remainder = n % 100;
                String prefix = hundreds == 1 && remainder == 0 ? "CIEN" : HUNDREDS[(int) hundreds];
                return remainder > 0 ? prefix + " " + convertGroup(remainder) : prefix;
            }
            if (n >= 30) {
                int tens = (int) (n / 10);
                int units = (int) (n % 10);
                return units > 0 ? TENS[tens] + " Y " + UNITS[units] : TENS[tens];
            }
            return UNITS[(int) n];
        }
    }
}
