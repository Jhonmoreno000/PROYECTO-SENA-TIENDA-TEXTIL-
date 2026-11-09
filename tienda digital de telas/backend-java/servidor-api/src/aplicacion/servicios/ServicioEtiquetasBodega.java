package aplicacion.servicios;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

/**
 * Servicio de aplicación para la generación de etiquetas térmicas autoadhesivas
 * de rollos textiles y retazos liquidados para operarios de corte en bodega.
 */
public class ServicioEtiquetasBodega {

    /** Formateador de fecha y hora (`DateTimeFormatter`) impreso en el encabezado de cada etiqueta. */
    private static final DateTimeFormatter FORMATO_FECHA = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    /**
     * Construye una nueva instancia del generador de etiquetas de bodega.
     */
    public ServicioEtiquetasBodega() {}

    /**
     * Genera una etiqueta en formato SVG vectorial nativo (100mm x 50mm, escala 400x200 px) con código de barras.
     *
     * @param codigoRollo Identificador único del rollo físico (`String`).
     * @param nombreTela Nombre comercial de la tela (`String`).
     * @param loteTintoreria Código del lote de tintorería (`String`).
     * @param metraje Metraje remanente disponible en el rollo (`double`).
     * @param estado Estado operativo del rollo (`String`, ej. `"disponible"` o `"retazo_liquidado"`).
     * @param ubicacion Ubicación física en pasillo y estante de bodega (`String`).
     * @return Cadena XML (`String`) con el gráfico vectorial `<svg>`.
     */
    public String generarEtiquetaSvg(
            String codigoRollo,
            String nombreTela,
            String loteTintoreria,
            double metraje,
            String estado,
            String ubicacion
    ) {
        if (codigoRollo == null || codigoRollo.trim().isEmpty()) {
            codigoRollo = "ROL-SIN-COD";
        }
        if (nombreTela == null || nombreTela.trim().isEmpty()) {
            nombreTela = "Tela Textil General";
        }
        if (loteTintoreria == null || loteTintoreria.trim().isEmpty()) {
            loteTintoreria = "LOTE-GENERAL";
        }
        if (estado == null) {
            estado = "DISPONIBLE";
        }
        if (ubicacion == null || ubicacion.trim().isEmpty()) {
            ubicacion = "BODEGA-PASILLO-1";
        }

        boolean esRetazo = "retazo_liquidado".equalsIgnoreCase(estado) || estado.toLowerCase().contains("retazo");
        String badgeColor = esRetazo ? "#D97706" : "#2563EB";
        String badgeTexto = esRetazo ? "RETAZO LIQUIDADO (-40%)" : "ROLLO ACTIVO DISPONIBLE";
        String fechaHora = LocalDateTime.now().format(FORMATO_FECHA);

        StringBuilder svg = new StringBuilder();
        svg.append("<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 400 200\" width=\"100mm\" height=\"50mm\">\n");
        svg.append("  <style>\n");
        svg.append("    .titulo { font-family: Arial, sans-serif; font-size: 11px; font-weight: bold; fill: #1F2937; letter-spacing: 1px; }\n");
        svg.append("    .subtitulo { font-family: Arial, sans-serif; font-size: 8px; fill: #6B7280; }\n");
        svg.append("    .codigo { font-family: 'Courier New', monospace; font-size: 18px; font-weight: bold; fill: #111827; }\n");
        svg.append("    .tela { font-family: Arial, sans-serif; font-size: 12px; font-weight: bold; fill: #111827; }\n");
        svg.append("    .metraje { font-family: Arial, sans-serif; font-size: 16px; font-weight: bold; fill: #047857; }\n");
        svg.append("    .datos { font-family: Arial, sans-serif; font-size: 9px; fill: #374151; }\n");
        svg.append("    .badge { font-family: Arial, sans-serif; font-size: 8px; font-weight: bold; fill: #FFFFFF; }\n");
        svg.append("  </style>\n");

        svg.append("  <rect x=\"2\" y=\"2\" width=\"396\" height=\"196\" rx=\"6\" fill=\"#FFFFFF\" stroke=\"#D1D5DB\" stroke-width=\"2\"/>\n");

        svg.append("  <rect x=\"2\" y=\"2\" width=\"396\" height=\"24\" rx=\"4\" fill=\"#F3F4F6\"/>\n");
        svg.append("  <text x=\"12\" y=\"17\" class=\"titulo\">D&amp;D TEXTIL - CONTROL DE BODEGA</text>\n");
        svg.append("  <text x=\"388\" y=\"17\" text-anchor=\"end\" class=\"subtitulo\">").append(fechaHora).append("</text>\n");

        svg.append("  <rect x=\"12\" y=\"32\" width=\"160\" height=\"16\" rx=\"3\" fill=\"").append(badgeColor).append("\"/>\n");
        svg.append("  <text x=\"92\" y=\"43\" text-anchor=\"middle\" class=\"badge\">").append(badgeTexto).append("</text>\n");

        svg.append("  <text x=\"12\" y=\"68\" class=\"codigo\">").append(escaparXml(codigoRollo)).append("</text>\n");
        svg.append("  <text x=\"12\" y=\"88\" class=\"tela\">").append(escaparXml(nombreTela)).append("</text>\n");

        svg.append("  <text x=\"12\" y=\"110\" class=\"metraje\">").append(String.format(Locale.US, "%.2f", metraje)).append(" METROS</text>\n");

        svg.append("  <text x=\"12\" y=\"130\" class=\"datos\">LOTE TINTORERIA: <tspan font-weight=\"bold\">").append(escaparXml(loteTintoreria)).append("</tspan></text>\n");
        svg.append("  <text x=\"12\" y=\"146\" class=\"datos\">UBICACION: <tspan font-weight=\"bold\">").append(escaparXml(ubicacion)).append("</tspan></text>\n");
        svg.append("  <text x=\"12\" y=\"162\" class=\"datos\">ESTADO OPERATIVO: ").append(escaparXml(estado.toUpperCase())).append("</text>\n");

        svg.append("  <g transform=\"translate(210, 36)\">\n");
        svg.append("    <rect x=\"0\" y=\"0\" width=\"178\" height=\"120\" fill=\"#F9FAFB\" stroke=\"#E5E7EB\" rx=\"4\"/>\n");
        svg.append("    <text x=\"89\" y=\"15\" text-anchor=\"middle\" font-family=\"Arial, sans-serif\" font-size=\"8px\" fill=\"#6B7280\">TRAZABILIDAD BODEGA</text>\n");

        int seed = Math.abs(codigoRollo.hashCode());
        float posX = 15;
        for (int i = 0; i < 36; i++) {
            boolean gruesa = ((seed >> (i % 24)) & 1) == 1;
            float anchoBarra = gruesa ? 3.0f : 1.5f;
            svg.append("    <rect x=\"").append(String.format(Locale.US, "%.1f", posX))
               .append("\" y=\"24\" width=\"").append(String.format(Locale.US, "%.1f", anchoBarra))
               .append("\" height=\"70\" fill=\"#111827\"/>\n");
            posX += anchoBarra + (gruesa ? 2.0f : 1.5f);
            if (posX > 165) break;
        }
        svg.append("    <text x=\"89\" y=\"110\" text-anchor=\"middle\" font-family=\"'Courier New', monospace\" font-size=\"9px\" font-weight=\"bold\" fill=\"#111827\">")
           .append(escaparXml(codigoRollo)).append("</text>\n");
        svg.append("  </g>\n");

        svg.append("  <line x1=\"12\" y1=\"176\" x2=\"388\" y2=\"176\" stroke=\"#E5E7EB\" stroke-width=\"1\"/>\n");
        svg.append("  <text x=\"12\" y=\"190\" class=\"subtitulo\">SISTEMA INTEGRADO DE GESTION TEXTIL SENA ADSO - SCAN READY</text>\n");
        svg.append("  <text x=\"388\" y=\"190\" text-anchor=\"end\" class=\"subtitulo\">ISO/IEC 25010</text>\n");

        svg.append("</svg>");
        return svg.toString();
    }

    /**
     * Genera un documento HTML completo listo para impresión térmica directa en formato 100mm x 50mm.
     *
     * @param codigoRollo Identificador único del rollo físico (`String`).
     * @param nombreTela Nombre comercial de la tela (`String`).
     * @param loteTintoreria Código del lote de tintorería (`String`).
     * @param metraje Metraje disponible en el rollo (`double`).
     * @param estado Estado operativo del rollo (`String`).
     * @param ubicacion Ubicación física en bodega (`String`).
     * @return Documento HTML5 (`String`) con hoja de estilo `@page` e impresión automática.
     */
    public String generarEtiquetaHtml(
            String codigoRollo,
            String nombreTela,
            String loteTintoreria,
            double metraje,
            String estado,
            String ubicacion
    ) {
        String svg = generarEtiquetaSvg(codigoRollo, nombreTela, loteTintoreria, metraje, estado, ubicacion);
        return "<!DOCTYPE html>\n" +
                "<html lang=\"es\">\n" +
                "<head>\n" +
                "  <meta charset=\"UTF-8\">\n" +
                "  <title>Etiqueta de Rollo - " + escaparXml(codigoRollo) + "</title>\n" +
                "  <style>\n" +
                "    @page { size: 100mm 50mm; margin: 0; }\n" +
                "    body { margin: 0; padding: 0; display: flex; align-items: center; justify-content: center; background: #E5E7EB; }\n" +
                "    .contenedor { background: #FFFFFF; width: 100mm; height: 50mm; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }\n" +
                "    @media print {\n" +
                "      body { background: transparent; }\n" +
                "      .contenedor { box-shadow: none; }\n" +
                "      .no-imprimir { display: none; }\n" +
                "    }\n" +
                "  </style>\n" +
                "</head>\n" +
                "<body>\n" +
                "  <div class=\"contenedor\">\n" +
                svg + "\n" +
                "  </div>\n" +
                "  <script>\n" +
                "    window.onload = function() { window.print(); };\n" +
                "  </script>\n" +
                "</body>\n" +
                "</html>";
    }

    /**
     * Escapa caracteres reservados XML/HTML para prevenir inyección o ruptura del documento SVG.
     *
     * @param texto Cadena original (`String`) a sanitizar.
     * @return Cadena escapada (`String`) segura para incrustar en XML.
     */
    private String escaparXml(String texto) {
        if (texto == null) return "";
        return texto.replace("&", "&amp;")
                    .replace("<", "&lt;")
                    .replace(">", "&gt;")
                    .replace("\"", "&quot;")
                    .replace("'", "&apos;");
    }
}
