import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNotification } from './NotificationContext';
import { useLocalStorage } from '../hooks/useLocalStorage';

const AuthContext = createContext();

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe usarse dentro de un AuthProvider');
    }
    return context;
}

export function AuthProvider({ children }) {
    const [user, setUser] = useLocalStorage('authUser', null);
    const { showNotification } = useNotification();

    // Roles: 'client', 'seller', 'admin'

    const login = async (email, password) => {
        // Simulando llamada a API
        return new Promise((resolve) => {
            setTimeout(() => {
                // Mock simple de login
                if (email === 'admin@ddtextil.com' && password === 'admin123') {
                    const userData = { id: 1, name: 'Admin User', email, role: 'admin' };
                    setUser(userData);
                    showNotification('success', '¡Bienvenido Administrador!');
                    resolve({ success: true });
                } else if (email === 'vendedor@ddtextil.com' && password === 'vendedor123') {
                    const userData = { id: 2, name: 'Vendedor User', email, role: 'seller' };
                    setUser(userData);
                    showNotification('success', '¡Bienvenido al panel de ventas!');
                    resolve({ success: true });
                } else if (email === 'cliente@ddtextil.com' && password === 'cliente123') {
                    const userData = { id: 3, name: 'Cliente User', email, role: 'client' };
                    setUser(userData);
                    showNotification('success', '¡Hola de nuevo!');
                    resolve({ success: true });
                } else {
                    // Permitir cualquier otro login como cliente para pruebas
                    if (password.length >= 6) {
                        const userData = { id: Date.now(), name: email.split('@')[0], email, role: 'client' };
                        setUser(userData);
                        showNotification('success', '¡Login exitoso!');
                        resolve({ success: true });
                    } else {
                        showNotification('error', 'Credenciales inválidas');
                        resolve({ success: false, message: 'Credenciales inválidas' });
                    }
                }
            }, 800);
        });
    };

    const register = async (userData) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                // Mock registro - por defecto crea clientes
                const newUser = {
                    id: Date.now(),
                    name: userData.name,
                    email: userData.email,
                    role: 'client' // Por defecto
                };
                setUser(newUser);
                showNotification('success', '¡Registro exitoso! Bienvenido a D&D Textil');
                resolve({ success: true });
            }, 1000);
        });
    };

    const logout = () => {
        setUser(null);
        showNotification('info', 'Has cerrado sesión');
    };

    const hasRole = (roles) => {
        if (!user) return false;
        if (Array.isArray(roles)) {
            return roles.includes(user.role);
        }
        return user.role === roles;
    };

    const value = {
        user,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        hasRole
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
