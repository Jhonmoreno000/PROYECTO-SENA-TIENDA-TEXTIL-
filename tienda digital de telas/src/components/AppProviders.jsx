/**
 * AppProviders.jsx — Centralizador de Proveedores de la Aplicación
 * =================================================================
 * Este componente envuelve toda la app con todos los "proveedores" de datos
 * (contextos) de manera ordenada. Sin esto, ningún componente podría acceder
 * a los datos compartidos como el carrito, la sesión o los productos.
 *
 * ¿Por qué importa el orden de los proveedores?
 *  Los proveedores se anidan de afuera hacia adentro.
 *  Los más externos se inicializan primero y están disponibles para todos los demás.
 *
 * Orden actual (de afuera hacia adentro):
 *  1. NotificationProvider → debe ser el primero porque los demás lo usan para mostrar errores
 *  2. AuthProvider         → gestiona la sesión del usuario (necesita las notificaciones)
 *  3. MetricsProvider      → trae datos de pedidos y usuarios de la API
 *  4. CartProvider         → maneja el carrito de compras
 *  5. ProductProvider      → trae el catálogo de productos de la API
 *  6. UIProvider           → controla el carrusel y la visibilidad de secciones del Home
 */

import React from 'react';
import { NotificationProvider } from '../context/NotificationContext';
import { CartProvider }         from '../context/CartContext';
import { AuthProvider }         from '../context/AuthContext';
import { ProductProvider }      from '../context/ProductContext';
import { UIProvider }           from '../context/UIContext';
import { MetricsProvider }      from '../context/MetricsContext';

/**
 * AppProviders — Componente que anida todos los proveedores de contexto
 * @param {React.ReactNode} children - El resto de la aplicación (App.jsx y sus rutas)
 */
export function AppProviders({ children }) {
    return (
        <NotificationProvider>
            <AuthProvider>
                <ProductProvider>
                    <MetricsProvider>
                        <CartProvider>
                            <UIProvider>
                                {children}
                            </UIProvider>
                        </CartProvider>
                    </MetricsProvider>
                </ProductProvider>
            </AuthProvider>
        </NotificationProvider>
    );
}
