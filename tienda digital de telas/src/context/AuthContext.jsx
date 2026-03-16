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
        try {
            const response = await fetch('http://localhost:8081/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            
            // Guard against non-JSON responses (e.g. backend returning HTML error pages)
            let data;
            try {
                data = await response.json();
            } catch (jsonError) {
                console.error('Response was not valid JSON:', jsonError);
                showNotification('error', 'El servidor respondió con un formato inesperado');
                return { success: false, message: 'Respuesta inválida del servidor' };
            }
            
            if (response.ok && data.success) {
                // Normalize roles for frontend app logic
                let normalizedRole = data.user.role;
                if (normalizedRole === 'administrador' || normalizedRole === 'admin') normalizedRole = 'admin';
                else if (normalizedRole === 'vendedor') normalizedRole = 'seller';
                else if (normalizedRole === 'cliente') normalizedRole = 'client';
                
                const loggedInUser = { ...data.user, role: normalizedRole };
                
                // Keep password_hash out of local storage
                delete loggedInUser.password_hash;
                
                setUser(loggedInUser);
                showNotification('success', `¡Bienvenido ${loggedInUser.name}!`);
                return { success: true };
            } else {
                showNotification('error', data.error || 'Credenciales inválidas');
                return { success: false, message: data.error };
            }
        } catch (error) {
            console.error('Login error:', error);
            // Distinguish between network errors (backend down) and other errors
            const msg = error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')
                ? 'No se puede conectar con el servidor. Verifica que el backend esté corriendo.'
                : 'Error al conectar con el servidor';
            showNotification('error', msg);
            return { success: false, message: msg };
        }
    };

    const register = async (userData) => {
        try {
            const response = await fetch('http://localhost:8081/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: userData.name,
                    email: userData.email,
                    password: userData.password
                })
            });
            
            let data;
            try {
                data = await response.json();
            } catch (jsonError) {
                console.error('Register response was not valid JSON:', jsonError);
                showNotification('error', 'El servidor respondió con un formato inesperado');
                return { success: false, message: 'Respuesta inválida del servidor' };
            }
            
            if (response.ok && data.success) {
                // Auto login after complete
                return await login(userData.email, userData.password);
            } else {
                showNotification('error', data.error || 'No se pudo crear la cuenta');
                return { success: false, message: data.error };
            }
        } catch (error) {
            console.error('Register error:', error);
            const msg = error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')
                ? 'No se puede conectar con el servidor. Verifica que el backend esté corriendo.'
                : 'Error al conectar con el servidor';
            showNotification('error', msg);
            return { success: false, message: msg };
        }
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
