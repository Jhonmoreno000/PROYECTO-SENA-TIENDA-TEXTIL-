package infraestructura.seguridad;

import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Gestor de protección contra ataques de fuerza bruta y denegación de servicio en autenticación.
 * Registra los intentos fallidos de inicio de sesión por identificador (correo o dirección IP).
 * Aplica una política de bloqueo preventivo temporal (Account Lockout Policy):
 * tras 5 intentos fallidos consecutivos dentro de una ventana de 15 minutos,
 * el acceso queda suspendido temporalmente.
 */
public final class ProtectorFuerzaBruta {

    public static final int MAX_INTENTOS_FALLIDOS = 5;
    public static final long VENTANA_BLOQUEO_MS = 15 * 60 * 1000L; // 15 minutos

    private static final ConcurrentHashMap<String, RegistroFuerzaBruta> registros = new ConcurrentHashMap<>();

    private ProtectorFuerzaBruta() {}

    private static class RegistroFuerzaBruta {
        final AtomicInteger intentos = new AtomicInteger(0);
        volatile long bloqueadoHasta = 0L;
        volatile long ultimoIntento = System.currentTimeMillis();

        RegistroFuerzaBruta() {}
    }

    /**
     * Evalúa si un identificador (correo o IP) está actualmente bloqueado por intentos fallidos.
     *
     * @param identificador Correo electrónico o dirección IP.
     * @return true si el identificador se encuentra en periodo de bloqueo activo; false en caso contrario.
     */
    public static boolean estaBloqueado(String identificador) {
        if (identificador == null || identificador.isBlank()) {
            return false;
        }
        String clave = normalizarClave(identificador);
        RegistroFuerzaBruta registro = registros.get(clave);
        if (registro == null) {
            return false;
        }

        long ahora = System.currentTimeMillis();
        if (registro.bloqueadoHasta > ahora) {
            return true;
        }

        // Si expiró el tiempo de bloqueo, se restablece el registro
        if (registro.bloqueadoHasta > 0 && ahora >= registro.bloqueadoHasta) {
            registros.remove(clave);
            return false;
        }

        return false;
    }

    /**
     * Obtiene los segundos restantes de bloqueo para un identificador.
     *
     * @param identificador Correo electrónico o dirección IP.
     * @return Segundos restantes de bloqueo (mínimo 0).
     */
    public static long obtenerSegundosRestantesBloqueo(String identificador) {
        if (identificador == null || identificador.isBlank()) {
            return 0L;
        }
        RegistroFuerzaBruta registro = registros.get(normalizarClave(identificador));
        if (registro == null) {
            return 0L;
        }
        long ahora = System.currentTimeMillis();
        if (registro.bloqueadoHasta > ahora) {
            return (registro.bloqueadoHasta - ahora) / 1000L;
        }
        return 0L;
    }

    /**
     * Registra un intento de autenticación fallido. Si se alcanza el umbral, activa el bloqueo.
     *
     * @param identificador Correo electrónico o dirección IP.
     */
    public static void registrarFallo(String identificador) {
        if (identificador == null || identificador.isBlank()) {
            return;
        }
        String clave = normalizarClave(identificador);
        long ahora = System.currentTimeMillis();

        RegistroFuerzaBruta registro = registros.computeIfAbsent(clave, k -> new RegistroFuerzaBruta());
        registro.ultimoIntento = ahora;
        int fallosActuales = registro.intentos.incrementAndGet();

        if (fallosActuales >= MAX_INTENTOS_FALLIDOS) {
            registro.bloqueadoHasta = ahora + VENTANA_BLOQUEO_MS;
        }

        // Limpieza defensiva si el mapa crece
        if (registros.size() > 5000) {
            registros.entrySet().removeIf(e -> ahora - e.getValue().ultimoIntento > VENTANA_BLOQUEO_MS && e.getValue().bloqueadoHasta <= ahora);
        }
    }

    /**
     * Registra una autenticación exitosa, eliminando cualquier historial de intentos fallidos.
     *
     * @param identificador Correo electrónico o dirección IP.
     */
    public static void registrarExito(String identificador) {
        if (identificador == null || identificador.isBlank()) {
            return;
        }
        registros.remove(normalizarClave(identificador));
    }

    /**
     * Reinicia todos los registros en memoria (útil para pruebas unitarias).
     */
    public static void reiniciar() {
        registros.clear();
    }

    private static String normalizarClave(String identificador) {
        return identificador.trim().toLowerCase();
    }
}
