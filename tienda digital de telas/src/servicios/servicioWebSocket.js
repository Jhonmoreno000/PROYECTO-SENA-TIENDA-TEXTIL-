/**
 * servicioWebSocket.js — Cliente WebSocket en Tiempo Real para D&D Textil
 * ========================================================================
 * Conecta el frontend con el servidor WebSocket del backend (puerto 8082 por defecto)
 * para recibir eventos en vivo de cambios en stock de telas, nuevos pedidos,
 * actualizaciones de ofertas y notificaciones del sistema.
 */

class ServicioWebSocket {
    constructor() {
        this.socket = null;
        this.suscriptores = new Map();
        this.reintentoTimeout = null;
        this.intentos = 0;
        this.conectado = false;
        this.oyentesEstado = new Set();
    }

    /**
     * Resuelve la URL del WebSocket según el entorno de ejecución.
     */
    obtenerUrl() {
        if (import.meta.env.VITE_WS_URL) {
            return import.meta.env.VITE_WS_URL;
        }
        const esHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
        const protocolo = esHttps ? 'wss:' : 'ws:';
        const host = (typeof window !== 'undefined' && window.location.hostname) ? window.location.hostname : 'localhost';
        return `${protocolo}//${host}:8082`;
    }

    /**
     * Inicia la conexión WebSocket con reconexión automática defensiva.
     */
    conectar() {
        if (typeof window === 'undefined') return;
        if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
            return;
        }

        try {
            const url = this.obtenerUrl();
            this.socket = new WebSocket(url);

            this.socket.onopen = () => {
                this.conectado = true;
                this.intentos = 0;
                this.notificarCambioEstado(true);
            };

            this.socket.onmessage = (evento) => {
                try {
                    const datos = JSON.parse(evento.data);
                    const tipo = datos.tipo;
                    if (this.suscriptores.has(tipo)) {
                        this.suscriptores.get(tipo).forEach((cb) => {
                            try {
                                cb(datos.datos, datos.marcaTiempo);
                            } catch (err) {
                                console.warn('[WebSocket] Error en callback de suscriptor:', err);
                            }
                        });
                    }
                    // Oyentes comodín para todos los eventos
                    if (this.suscriptores.has('*')) {
                        this.suscriptores.get('*').forEach((cb) => cb(datos));
                    }
                } catch {
                    // Mensaje de texto plano o ping
                }
            };

            this.socket.onerror = () => {
                // Silencioso para no ensuciar la consola si el backend aún no ha levantado el socket
            };

            this.socket.onclose = () => {
                this.conectado = false;
                this.notificarCambioEstado(false);
                this.programarReconexion();
            };
        } catch {
            this.conectado = false;
            this.programarReconexion();
        }
    }

    programarReconexion() {
        if (this.reintentoTimeout) return;
        // Estrategia de reconexión con backoff exponencial suave (entre 2 y 15 segundos)
        const espera = Math.min(15000, 2000 * Math.pow(1.5, Math.min(this.intentos, 5)));
        this.intentos++;
        this.reintentoTimeout = setTimeout(() => {
            this.reintentoTimeout = null;
            this.conectar();
        }, espera);
    }

    /**
     * Suscribe un callback a un tipo específico de evento.
     * @param {string} tipo - Ej: "STOCK_ACTUALIZADO", "NUEVO_PEDIDO", "OFERTA_ACTUALIZADA", o "*"
     * @param {function} callback
     * @returns {function} Función para desuscribirse limpiamente
     */
    suscribir(tipo, callback) {
        if (!this.suscriptores.has(tipo)) {
            this.suscriptores.set(tipo, new Set());
        }
        this.suscriptores.get(tipo).add(callback);

        return () => {
            const set = this.suscriptores.get(tipo);
            if (set) {
                set.delete(callback);
                if (set.size === 0) {
                    this.suscriptores.delete(tipo);
                }
            }
        };
    }

    /**
     * Registra un observador del estado de conexión (conectado / desconectado).
     */
    onEstadoCambiado(callback) {
        this.oyentesEstado.add(callback);
        callback(this.conectado);
        return () => this.oyentesEstado.delete(callback);
    }

    notificarCambioEstado(estaConectado) {
        this.oyentesEstado.forEach((cb) => {
            try {
                cb(estaConectado);
            } catch (err) {
                console.warn('[WebSocket] Error al notificar estado:', err);
            }
        });
    }

    /**
     * Envía un mensaje al backend mediante WebSocket si la conexión está abierta.
     */
    enviar(tipo, datos = {}) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify({ tipo, datos }));
            return true;
        }
        return false;
    }

    desconectar() {
        if (this.reintentoTimeout) {
            clearTimeout(this.reintentoTimeout);
            this.reintentoTimeout = null;
        }
        if (this.socket) {
            try {
                this.socket.close();
            } catch {
                // socket ya cerrado
            }
            this.socket = null;
        }
        this.conectado = false;
        this.notificarCambioEstado(false);
    }
}

export const servicioWebSocket = new ServicioWebSocket();
export default servicioWebSocket;
