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
import { NotificationProvider } from '../context/NotificationContext'; // Mensajes emergentes (Toast)
import { CartProvider }         from '../context/CartContext';          // Carrito de compras
import { AuthProvider }         from '../context/AuthContext';          // Sesión del usuario
import { ProductProvider }      from '../context/ProductContext';       // Catálogo de telas
import { UIProvider }           from '../context/UIContext';            // Configuración visual del Home
import { MetricsProvider }      from '../context/MetricsContext';       // Métricas y datos del ERP

/**
 * AppProviders — Componente que anida todos los proveedores de contexto
 * @param {React.ReactNode} children - El resto de la aplicación (App.jsx y sus rutas)
 */
export function AppProviders({ children }) {
    return (
        /* Proveedor de notificaciones: el más externo porque todos pueden necesitar mostrar mensajes */
        <NotificationProvider>
            {/* Proveedor de autenticación: necesita notificaciones para mostrar "Bienvenido" o "Error" */}
            <AuthProvider>
                {/* Proveedor de métricas: trae pedidos, usuarios y datos del ERP */}
                <MetricsProvider>
                    {/* Proveedor del carrito: guarda los productos que el cliente eligió */}
                    <CartProvider>
                        {/* Proveedor de productos: trae el catálogo de la API */}
                        <ProductProvider>
                            {/* Proveedor de UI: controla el carrusel y secciones del Home */}
                            <UIProvider>
                                {children}
                            </UIProvider>
                        </ProductProvider>
                    </CartProvider>
                </MetricsProvider>
            </AuthProvider>
        </NotificationProvider>
    );
}
