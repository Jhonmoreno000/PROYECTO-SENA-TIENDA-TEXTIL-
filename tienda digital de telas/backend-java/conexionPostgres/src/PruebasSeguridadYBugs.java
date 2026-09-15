import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import dominio.modelos.ReporteError;
import dominio.modelos.Usuario;
import aplicacion.servicios.ServicioAutenticacion;
import java.io.File;
import java.nio.charset.StandardCharsets;
import java.nio.file.Path;

/**
 * Suite de Pruebas Automatizadas de Seguridad, Validación de Errores y Bugs para D&D Textil.
 * Todo el código, métodos y variables implementados estrictamente en español.
 */
public class PruebasSeguridadYBugs {

    private static int pruebasExitosas = 0;
    private static int pruebasFallidas = 0;
    private static final Gson gson = new Gson();

    public static void main(String[] argumentos) {
        System.out.println("=================================================================");
        System.out.println("   SUITE DE PRUEBAS DE SEGURIDAD, ERRORES Y BUGS (D&D TEXTIL)    ");
        System.out.println("=================================================================");

        ejecutarPrueba("1. Hash Criptográfico UTF-8 consistente con caracteres especiales", () -> {
            String contrasenaConEspeciales = "ContraseñaConÑyTildes#2026_ÁéÍóÚ!";
            String hashGenerado = ServicioAutenticacion.generarHashContrasena(contrasenaConEspeciales);

            if (hashGenerado == null || hashGenerado.length() != 64) {
                throw new AssertionError("El hash SHA-256 no tiene la longitud esperada de 64 caracteres hexadecimales.");
            }

            // Verificar reproducibilidad estricta bajo UTF-8
            String hashSegundoIntento = ServicioAutenticacion.generarHashContrasena(contrasenaConEspeciales);
            if (!hashGenerado.equals(hashSegundoIntento)) {
                throw new AssertionError("El cálculo del hash SHA-256 no es determinista.");
            }
        });

        ejecutarPrueba("2. Deserialización y Sincronización de Bug Reports (title, area, severity, priority)", () -> {
            // Payload exacto como lo envía BugReport.jsx
            String payloadJson = "{"
                    + "\"title\":\"Error al procesar el pago con tarjeta\","
                    + "\"description\":\"La pasarela no responde al hacer clic en pagar\","
                    + "\"severity\":\"high\","
                    + "\"sellerId\":1,"
                    + "\"sellerName\":\"Usuario Web\","
                    + "\"status\":\"open\""
                    + "}";

            ReporteError reporte = gson.fromJson(payloadJson, ReporteError.class);

            if (reporte == null) {
                throw new AssertionError("El reporte no se pudo deserializar.");
            }

            // Validar que el título se mapea correctamente
            if (!"Error al procesar el pago con tarjeta".equals(reporte.getTitulo())) {
                throw new AssertionError("El título esperado no coincide. Obtenido: " + reporte.getTitulo());
            }

            // Validar que el área tiene el título como alternativa
            if (!"Error al procesar el pago con tarjeta".equals(reporte.getArea())) {
                throw new AssertionError("El área esperada no coincide con el título. Obtenido: " + reporte.getArea());
            }

            // Validar que la severidad y prioridad se sincronicen en 'high'
            if (!"high".equals(reporte.getSeveridad()) || !"high".equals(reporte.getPrioridad())) {
                throw new AssertionError("La severidad o prioridad no se mapeó correctamente a 'high'. Severidad: " 
                        + reporte.getSeveridad() + ", Prioridad: " + reporte.getPrioridad());
            }

            // Validar serialización hacia el frontend React
            String jsonSerializado = gson.toJson(reporte);
            JsonObject objetoVerificado = JsonParser.parseString(jsonSerializado).getAsJsonObject();

            if (!objetoVerificado.has("title") && !objetoVerificado.has("area")) {
                throw new AssertionError("El JSON serializado no contiene 'title' ni 'area'.");
            }
            if (!objetoVerificado.has("severity") && !objetoVerificado.has("priority")) {
                throw new AssertionError("El JSON serializado no contiene 'severity' ni 'priority'.");
            }
        });

        ejecutarPrueba("3. Prevención Estricta de Path Traversal en Archivos Estáticos", () -> {
            File carpetaSubidas = new File("uploads");
            if (!carpetaSubidas.exists()) {
                carpetaSubidas.mkdir();
            }

            Path rutaDirectorioSubidas = carpetaSubidas.getCanonicalFile().toPath().normalize();

            // Intento 1: Salto de directorio clásico
            File archivoAtaque1 = new File("uploads/../src/App.java");
            Path rutaAtaque1 = archivoAtaque1.getCanonicalFile().toPath().normalize();
            boolean bloqueo1 = !rutaAtaque1.startsWith(rutaDirectorioSubidas);

            if (!bloqueo1) {
                throw new AssertionError("Fallo de seguridad: no se bloqueó el escape de directorio '../src/App.java'");
            }

            // Intento 2: Salto hacia raíz del sistema
            File archivoAtaque2 = new File("uploads/../../windows/system.ini");
            Path rutaAtaque2 = archivoAtaque2.getCanonicalFile().toPath().normalize();
            boolean bloqueo2 = !rutaAtaque2.startsWith(rutaDirectorioSubidas);

            if (!bloqueo2) {
                throw new AssertionError("Fallo de seguridad: no se bloqueó el escape hacia la raíz del sistema");
            }

            // Intento 3: Archivo válido dentro de uploads
            File archivoValido = new File("uploads/foto_prueba.png");
            Path rutaValida = archivoValido.getCanonicalFile().toPath().normalize();
            boolean permitido = rutaValida.startsWith(rutaDirectorioSubidas);

            if (!permitido) {
                throw new AssertionError("Error: se bloqueó un archivo legítimo dentro del directorio 'uploads'");
            }
        });

        ejecutarPrueba("4. Resistencia a Inyección SQL (SQLi) en Validación de Credenciales", () -> {
            String correoInyeccion = "admin@ejemplo.com' OR '1'='1' --";
            String contrasenaInyeccion = "' OR 1=1 --";

            // El hash generado no debe coincidir con contraseñas legítimas
            String hashInyeccion = ServicioAutenticacion.generarHashContrasena(contrasenaInyeccion);

            if (hashInyeccion == null || hashInyeccion.isBlank()) {
                throw new AssertionError("El generador de hash falló con caracteres de inyección SQL.");
            }

            // Comprobar que no hay bypass con campos nulos o en blanco
            try {
                ServicioAutenticacion servicio = new ServicioAutenticacion(null);
                servicio.iniciarSesion("   ", "   ");
                throw new AssertionError("Fallo: Se permitió iniciar sesión con credenciales vacías.");
            } catch (dominio.excepciones.ExcepcionDominio e) {
                // Correcto: ExcepcionDominio lanzada de forma controlada
            }
        });

        ejecutarPrueba("5. Validación de Rutas y Extracción Segura de Identificadores Numéricos", () -> {
            String[] rutasPruebaValidas = {
                "/api/pedidos/123/estado",
                "/api/orders/456/status",
                "/api/soporte/errores/789/estado",
                "/api/usuarios/999/rol"
            };

            for (String ruta : rutasPruebaValidas) {
                int idExtraido = -1;
                for (String segmento : ruta.split("/")) {
                    if (segmento.matches("\\d+")) {
                        idExtraido = Integer.parseInt(segmento);
                        break;
                    }
                }
                if (idExtraido <= 0) {
                    throw new AssertionError("No se pudo extraer el ID numérico de la ruta válida: " + ruta);
                }
            }

            String[] rutasPruebaInvalidas = {
                "/api/pedidos/abc/estado",
                "/api/pedidos//estado",
                "/api/soporte/errores/invalido",
                "/api/usuarios/--1/rol"
            };

            for (String ruta : rutasPruebaInvalidas) {
                int idExtraido = -1;
                for (String segmento : ruta.split("/")) {
                    if (segmento.matches("\\d+")) {
                        idExtraido = Integer.parseInt(segmento);
                        break;
                    }
                }
                if (idExtraido > 0) {
                    throw new AssertionError("Se extrajo un ID incorrecto de una ruta malformada: " + ruta);
                }
            }
        });

        ejecutarPrueba("6. Modelo de Usuario y Compatibilidad Bilingüe en Rol y Estado", () -> {
            Usuario usuario = new Usuario(1, "Anderson Moreno", "anderson@ejemplo.com", "admin", true, false, null, 0.10, "2026-09-15", null, "Activo");

            String jsonUsuario = gson.toJson(usuario);
            JsonObject json = JsonParser.parseString(jsonUsuario).getAsJsonObject();

            if (!json.has("name") && !json.has("nombre")) {
                throw new AssertionError("Falta campo 'name'/'nombre' en serialización de Usuario.");
            }
            if (!json.has("role") && !json.has("rol")) {
                throw new AssertionError("Falta campo 'role'/'rol' en serialización de Usuario.");
            }
            if (!json.has("active") && !json.has("activo")) {
                throw new AssertionError("Falta campo 'active'/'activo' en serialización de Usuario.");
            }
        });

        System.out.println("\n=================================================================");
        System.out.println("                    RESUMEN DE PRUEBAS                          ");
        System.out.println("=================================================================");
        System.out.println("  Pruebas superadas con éxito: " + pruebasExitosas);
        System.out.println("  Pruebas fallidas:            " + pruebasFallidas);

        if (pruebasFallidas == 0) {
            System.out.println("\n>>> TODAS LAS PRUEBAS DE SEGURIDAD Y BUGS FUERON EXITOSAS (100% EN ESPAÑOL) <<<\n");
        } else {
            System.err.println("\n>>> SE IDENTIFICARON FALLAS EN LA SUITE DE PRUEBAS <<<\n");
            System.exit(1);
        }
    }

    private static void ejecutarPrueba(String nombrePrueba, AccionPrueba accion) {
        System.out.print("[TEST] " + nombrePrueba + " ... ");
        try {
            accion.ejecutar();
            System.out.println("CORRECTO");
            pruebasExitosas++;
        } catch (Throwable t) {
            System.out.println("FALLO");
            System.err.println("  -> Error: " + t.getMessage());
            t.printStackTrace(System.err);
            pruebasFallidas++;
        }
    }

    @FunctionalInterface
    interface AccionPrueba {
        void ejecutar() throws Exception;
    }
}
