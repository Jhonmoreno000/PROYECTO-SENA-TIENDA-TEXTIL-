/**
 * ContextoWebSocket.jsx — Canal en Vivo / Tiempo Real
 * =====================================================
 * Provee acceso reactivo al canal WebSocket de D&D Textil,
 * notificando a los componentes cuando ocurren eventos en vivo:
 * actualizaciones de stock, nuevos pedidos o alertas globales.
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import servicioWebSocket from '../servicios/servicioWebSocket';
import { useNotificacion } from './ContextoNotificacion';

const ContextoWebSocket = createContext(null);

export function useWebSocket() {
    const contexto = useContext(ContextoWebSocket);
    if (!contexto) {
        return { conectado: false, enviar: () => false, ultimoEvento: null };
    }
    return contexto;
}

export function WebSocketProvider({ children }) {
    const [conectado, setConectado] = useState(false);
    const [ultimoEvento, setUltimoEvento] = useState(null);
    const { showNotification } = useNotificacion();

    useEffect(() => {
        servicioWebSocket.conectar();
        const desuscribirEstado = servicioWebSocket.onEstadoCambiado((estado) => {
            setConectado(estado);
        });

        const desuscribirEventos = servicioWebSocket.suscribir('*', (evento) => {
            setUltimoEvento(evento);
            if (evento?.tipo === 'NOTIFICACION' && evento?.datos?.mensaje) {
                const titulo = evento.datos.titulo ? `${evento.datos.titulo}: ` : '';
                showNotification(evento.datos.tipo || 'info', `${titulo}${evento.datos.mensaje}`);
            } else if (evento?.tipo === 'NUEVO_PEDIDO') {
                showNotification('info', `Nuevo pedido recibido en plataforma (#${evento.datos?.idPedido || ''})`);
            }
        });

        return () => {
            desuscribirEstado();
            desuscribirEventos();
        };
    }, [showNotification]);

    return (
        <ContextoWebSocket.Provider
            value={{
                conectado,
                enviar: servicioWebSocket.enviar.bind(servicioWebSocket),
                ultimoEvento,
            }}
        >
            {children}
        </ContextoWebSocket.Provider>
    );
}
