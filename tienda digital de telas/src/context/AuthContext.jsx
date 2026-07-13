/**
 * AuthContext.jsx — Contexto de Autenticación
 * =============================================
 * Este archivo maneja todo lo relacionado con el inicio y cierre de sesión.
 * Guarda la información del usuario que está conectado y la comparte con
 * toda la aplicación para que cualquier pantalla pueda saber si hay una
 * sesión activa y qué rol tiene el usuario (cliente, vendedor o admin).
 *
 * ¿Cómo funciona?
 *  1. Cuando el usuario escribe su correo y contraseña, llamamos a la API
 *     del backend Java (POST /api/login) para verificar que son correctos.
 *  2. Si el login es exitoso, guardamos los datos del usuario en localStorage
 *     (la memoria del navegador) para que no se pierdan al recargar la página.
 *  3. Los datos del usuario están disponibles en toda la app a través del hook
 *     useAuth(), que devuelve: { user, isAuthenticated, login, register, logout, hasRole }
 *
 * Roles del sistema:
 *  - 'client'  → cliente que compra telas
 *  - 'seller'  → vendedor que publica productos
 *  - 'admin'   → administrador del sistema
 */

import React, { createContext, useContext, useState } from 'react';
import { useNotification } from './NotificationContext'; // Para mostrar mensajes de éxito o error
import { useLocalStorage } from '../hooks/useLocalStorage';
import { getApiUrl } from '../config';
import LogoutLoader from '../components/common/LogoutLoader'; // Animación de carga al cerrar sesión

// Creamos el contexto que va a compartir los datos de sesión con toda la app
const AuthContext = createContext();

/**
 * useAuth — Hook para usar el contexto de autenticación
 * Cualquier componente que necesite saber si hay sesión activa usa este hook.
 * Ejemplo: const { user, logout } = useAuth();
 */
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe usarse dentro de un AuthProvider');
    }
    return context;
}

/**
 * AuthProvider — Proveedor del contexto
 * Envuelve toda la aplicación para que los datos de sesión estén disponibles globalmente.
 */
export function AuthProvider({ children }) {
    // 'user' se guarda en localStorage para no perderlo al recargar la página
    const [user, setUser] = useLocalStorage('authUser', null);
    // Estado para mostrar la animación de carga mientras se cierra la sesión
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    // Función para mostrar mensajes tipo toast (ej: "¡Bienvenido!")
    const { showNotification } = useNotification();

    /**
     * login — Inicia sesión enviando correo y contraseña al backend
     * El backend verifica las credenciales contra la base de datos PostgreSQL
     * y devuelve los datos del usuario si son correctas.
     */
    const login = async (email, password) => {
        try {
            const response = await fetch(getApiUrl('/api/login'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            // Protección: el backend a veces devuelve HTML en lugar de JSON si hay un error grave
            let data;
            try {
                data = await response.json();
            } catch (jsonError) {
                console.error('La respuesta del servidor no es JSON válido:', jsonError);
                showNotification('error', 'El servidor respondió con un formato inesperado');
                return { success: false, message: 'Respuesta inválida del servidor' };
            }

            if (response.ok && data.success) {
                // Normalizamos los roles que vienen del backend en español a los que usa el frontend
                // Ejemplo: 'administrador' → 'admin', 'vendedor' → 'seller', 'cliente' → 'client'
                let normalizedRole = data.user.role;
                if (normalizedRole === 'administrador' || normalizedRole === 'admin') normalizedRole = 'admin';
                else if (normalizedRole === 'vendedor') normalizedRole = 'seller';
                else if (normalizedRole === 'cliente') normalizedRole = 'client';

                const loggedInUser = { ...data.user, role: normalizedRole };

                // Por seguridad, nunca guardamos el hash de la contraseña en el navegador
                delete loggedInUser.password_hash;

                setUser(loggedInUser);
                showNotification('success', `¡Bienvenido ${loggedInUser.name}!`);
                return { success: true };
            } else {
                showNotification('error', data.error || 'Credenciales inválidas');
                return { success: false, message: data.error };
            }
        } catch (error) {
            console.error('Error al iniciar sesión:', error);
            // Si el error es de red (backend apagado), mostramos un mensaje específico
            const msg = error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')
                ? 'No se puede conectar con el servidor. Verifica que el backend esté corriendo.'
                : 'Error al conectar con el servidor';
            showNotification('error', msg);
            return { success: false, message: msg };
        }
    };

    /**
     * register — Registra un nuevo usuario en la base de datos
     * Después del registro exitoso, inicia sesión automáticamente.
     */
    const register = async (userData) => {
        try {
            const response = await fetch(getApiUrl('/api/register'), {
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
                console.error('La respuesta de registro no es JSON válido:', jsonError);
                showNotification('error', 'El servidor respondió con un formato inesperado');
                return { success: false, message: 'Respuesta inválida del servidor' };
            }

            if (response.ok && data.success) {
                // Si el registro fue exitoso, iniciamos sesión automáticamente
                return await login(userData.email, userData.password);
            } else {
                showNotification('error', data.error || 'No se pudo crear la cuenta');
                return { success: false, message: data.error };
            }
        } catch (error) {
            console.error('Error al registrar usuario:', error);
            const msg = error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')
                ? 'No se puede conectar con el servidor. Verifica que el backend esté corriendo.'
                : 'Error al conectar con el servidor';
            showNotification('error', msg);
            return { success: false, message: msg };
        }
    };

    /**
     * logout — Cierra la sesión del usuario
     * Muestra una animación de 2.5 segundos antes de limpiar los datos de sesión.
     */
    const logout = () => {
        setIsLoggingOut(true);
        setTimeout(() => {
            setUser(null);           // Borramos el usuario del estado y del localStorage
            setIsLoggingOut(false);  // Ocultamos la animación de logout
            showNotification('info', 'Has cerrado sesión');
        }, 2500); // Esperamos 2.5 segundos para que se vea la animación
    };

    /**
     * hasRole — Verifica si el usuario tiene uno de los roles especificados
     * Ejemplo: hasRole('admin') → true si el usuario es administrador
     * Ejemplo: hasRole(['admin', 'seller']) → true si es admin O vendedor
     */
    const hasRole = (roles) => {
        if (!user) return false;
        if (Array.isArray(roles)) {
            return roles.includes(user.role);
        }
        return user.role === roles;
    };

    // Todos los datos y funciones que estarán disponibles en la app
    const value = {
        user,                        // Objeto con los datos del usuario conectado (o null)
        isAuthenticated: !!user,     // true si hay sesión activa, false si no
        login,                       // Función para iniciar sesión
        register,                    // Función para crear una cuenta
        logout,                      // Función para cerrar sesión
        hasRole                      // Función para verificar permisos
    };

    return (
        <AuthContext.Provider value={value}>
            {/* LogoutLoader muestra una pantalla de carga animada al cerrar sesión */}
            <LogoutLoader isLoggingOut={isLoggingOut}>
                {children}
            </LogoutLoader>
        </AuthContext.Provider>
    );
}
