import React from 'react';
import { NotificationProvider } from '../context/NotificationContext';
import { CartProvider } from '../context/CartContext';
import { AuthProvider } from '../context/AuthContext';
import { ProductProvider } from '../context/ProductContext';
import { UIProvider } from '../context/UIContext';
import { MetricsProvider } from '../context/MetricsContext';

export function AppProviders({ children }) {
    return (
        <NotificationProvider>
            <AuthProvider>
                <MetricsProvider>
                    <CartProvider>
                        <ProductProvider>
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

