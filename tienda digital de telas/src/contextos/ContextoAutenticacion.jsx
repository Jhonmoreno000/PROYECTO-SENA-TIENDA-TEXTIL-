/**
 * ContextoAutenticacion.jsx — Contexto de Autenticación
 * =============================================
 * Este archivo maneja todo lo relacionado con el inicio y cierre de sesión.
 * Guarda la información del usuario que está conectado y la comparte con
 * toda la aplicación para que cualquier pantalla pueda saber si hay una
 * sesión activa y qué rol tiene el usuario (cliente, vendedor o admin).
 *
 * ¿Cómo funciona?
 *  1. Cuando el usuario escribe su correo y contraseña, llamamos a la API
 *     del backend Java (POST /api/iniciar-sesion) para verificar que son correctos.
 *  2. Si el login es exitoso, guardamos los datos del usuario en localStorage
 *     (la memoria del navegador) para que no se pierdan al recargar la página.
 *  3. Los datos del usuario están disponibles en toda la app a través del hook
 *     useAutenticacion(), que devuelve: { user, isAuthenticated, login, register, logout, hasRole }
 *
 * Roles del sistema:
 *  - 'cliente'  → cliente que compra telas
 *  - 'vendedor'  → vendedor que publica productos
 *  - 'admin'   → administrador del sistema
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useNotificacion } from './ContextoNotificacion'; // Para mostrar mensajes de éxito o error
import { useLocalStorage } from '../hooks/useLocalStorage';
import { expiracionDeToken, sesionVigente } from '../utilidades/sesion';
import { getApiUrl, RUTAS_API } from '../config';
import LogoutLoader from '../componentes/common/LogoutLoader'; // Animación de carga al cerrar sesión

// Creamos el contexto que va a compartir los datos de sesión con toda la app
const ContextoAutenticacion = createContext();
const MENSAJE_SESION_EXPIRADA = 'Tu sesión expiró. Inicia sesión de nuevo.';

/**
 * useAutenticacion — Hook para usar el contexto de autenticación
 * Cualquier componente que necesite saber si hay sesión activa usa este hook.
 * Ejemplo: const { user, logout } = useAutenticacion();
 */
export function useAutenticacion() {
    const contextos = useContext(ContextoAutenticacion);
    if (!contextos) {
        throw new Error('useAutenticacion debe usarse dentro de un AuthProvider');
    }
    return contextos;
}

/**
 * AuthProvider — Proveedor del contexto
 * Envuelve toda la aplicación para que los datos de sesión estén disponibles globalmente.
 */
export function AuthProvider({ children }) {
    // 'user' se guarda en localStorage para no perderlo al recargar la página
    const [usuarioGuardado, setUser] = useLocalStorage('authUser', null);
    const user = sesionVigente(usuarioGuardado) ? usuarioGuardado : null;
    const tokenActualRef = useRef();
    tokenActualRef.current = user?.token;
    // Estado para mostrar la animación de carga mientras se cierra la sesión
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    // Función para mostrar mensajes tipo toast (ej: "¡Bienvenido!")
    const { showNotification } = useNotificacion();

    const invalidarSesion = useCallback((tokenRechazado) => {
        if (tokenRechazado && tokenRechazado !== tokenActualRef.current) return;
        try {
            window.localStorage.removeItem('authUser');
            window.localStorage.removeItem('token');
            window.localStorage.removeItem('erp_pinned_items');
        } catch {}
        setUser(null);
        showNotification('info', MENSAJE_SESION_EXPIRADA);
    }, [setUser, showNotification]);

    useEffect(() => {
        if (usuarioGuardado && !user) {
            invalidarSesion();
            return;
        }
        if (user?.token) {
            const ms = expiracionDeToken(user.token) - Date.now();
            const temporizador = setTimeout(() => invalidarSesion(user.token), Math.min(ms, 2147483647));
            return () => clearTimeout(temporizador);
        }
    }, [usuarioGuardado, user, invalidarSesion]);

    /**
     * login — Inicia sesión enviando correo y contraseña al backend
     * El backend verifica las credenciales contra la base de datos PostgreSQL
     * y devuelve los datos del usuario si son correctas.
     */
    const login = async (email, password) => {
        try {
            const rutaLogin = RUTAS_API?.login || '/api/iniciar-sesion';
            const response = await fetch(getApiUrl(rutaLogin), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, correo: email, password, contrasena: password })
            });

            let datos;
            try {
                datos = await response.json();
            } catch (jsonError) {
                console.error('La respuesta del servidor no es JSON válido:', jsonError);
                showNotification('error', 'El servidor respondió con un formato inesperado');
                return { success: false, message: 'Respuesta inválida del servidor' };
            }

            if (response.ok && datos.success) {
                const rawUser = datos.user || datos.usuario || {};
                let normalizedRole = rawUser.role || rawUser.rol || 'cliente';
                if (normalizedRole === 'administrador' || normalizedRole === 'admin') normalizedRole = 'admin';
                else if (normalizedRole === 'vendedor' || normalizedRole === 'vendedor') normalizedRole = 'vendedor';
                else if (normalizedRole === 'cliente' || normalizedRole === 'cliente') normalizedRole = 'cliente';

                const nombreUsuario = rawUser.name || rawUser.nombre || 'Usuario';
                const loggedInUser = {
                    ...rawUser,
                    token: datos.token,
                    name: nombreUsuario,
                    nombre: nombreUsuario,
                    email: rawUser.email || rawUser.correo,
                    correo: rawUser.email || rawUser.correo,
                    phone: rawUser.phone || rawUser.telefono || '',
                    telefono: rawUser.telefono || rawUser.phone || '',
                    role: normalizedRole,
                    rol: normalizedRole
                };

                delete loggedInUser.password_hash;
                delete loggedInUser.contrasena_hash;

                try {
                    window.localStorage.setItem('authUser', JSON.stringify(loggedInUser));
                    if (datos.token) {
                        window.localStorage.setItem('token', datos.token);
                    }
                    window.localStorage.removeItem('erp_pinned_items');
                } catch (e) {
                    console.error('Error escribiendo authUser a localStorage:', e);
                }

                setUser(loggedInUser);
                showNotification('success', `¡Bienvenido ${loggedInUser.name}!`);
                return { success: true, user: loggedInUser };
            } else {
                showNotification('error', datos.error || 'Credenciales inválidas');
                return { success: false, message: datos.error };
            }
        } catch (error) {
            console.error('Error al iniciar sesión:', error);
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
            const rutaRegistro = RUTAS_API?.registro || '/api/registro';
            const response = await fetch(getApiUrl(rutaRegistro), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: userData.name || userData.nombre,
                    nombre: userData.name || userData.nombre,
                    email: userData.email || userData.correo,
                    correo: userData.email || userData.correo,
                    password: userData.password || userData.contrasena,
                    contrasena: userData.password || userData.contrasena,
                    aceptaHabeasData: Boolean(userData.aceptaHabeasData)
                })
            });

            let datos;
            try {
                datos = await response.json();
            } catch (jsonError) {
                console.error('La respuesta de registro no es JSON válido:', jsonError);
                showNotification('error', 'El servidor respondió con un formato inesperado');
                return { success: false, message: 'Respuesta inválida del servidor' };
            }

            if (response.ok && datos.success) {
                return await login(userData.email || userData.correo, userData.password || userData.contrasena);
            } else {
                showNotification('error', datos.error || 'No se pudo crear la cuenta');
                return { success: false, message: datos.error };
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
     * loginConSSO — Inicia sesión o auto-registra usuario proveniente de Google o Microsoft
     */
    const loginConSSO = async (ssoData) => {
        try {
            const rutaSSO = RUTAS_API?.sso || '/api/autenticacion/sso';
            const response = await fetch(getApiUrl(rutaSSO), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(ssoData)
            });

            let datos;
            try {
                datos = await response.json();
            } catch (jsonError) {
                console.error('La respuesta del servidor no es JSON válido:', jsonError);
                showNotification('error', 'El servidor respondió con un formato inesperado');
                return { success: false, message: 'Respuesta inválida del servidor' };
            }

            if (response.ok && datos.success) {
                const rawUser = datos.user || datos.usuario || {};
                let normalizedRole = rawUser.role || rawUser.rol || 'cliente';
                if (normalizedRole === 'administrador' || normalizedRole === 'admin') normalizedRole = 'admin';
                else if (normalizedRole === 'vendedor') normalizedRole = 'vendedor';
                else normalizedRole = 'cliente';

                const nombreUsuario = rawUser.name || rawUser.nombre || ssoData.nombre || 'Usuario';
                const loggedInUser = {
                    ...rawUser,
                    name: nombreUsuario,
                    nombre: nombreUsuario,
                    email: rawUser.email || rawUser.correo || ssoData.email,
                    correo: rawUser.email || rawUser.correo || ssoData.email,
                    role: normalizedRole,
                    rol: normalizedRole
                };

                delete loggedInUser.password_hash;
                delete loggedInUser.contrasena_hash;

                try {
                    window.localStorage.setItem('authUser', JSON.stringify(loggedInUser));
                } catch (e) {
                    console.error('Error guardando en localStorage:', e);
                }

                setUser(loggedInUser);
                showNotification('success', `¡Bienvenido ${loggedInUser.name}!`);
                return { success: true, user: loggedInUser };
            } else {
                showNotification('error', datos.error || 'Error al autenticar con SSO');
                return { success: false, message: datos.error };
            }
        } catch (error) {
            console.error('Error al iniciar sesión con SSO:', error);
            const isNetworkError = error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError');

            // Si estamos en desarrollo o el backend local no responde, permitir sesión de desarrollo
            if (isNetworkError || import.meta.env.DEV) {
                const nombreUsuario = ssoData.nombre || ssoData.name || ('Usuario ' + (ssoData.proveedor || 'SSO'));
                const loggedInUser = {
                    id: 9999,
                    sesionLocal: true,
                    name: nombreUsuario,
                    nombre: nombreUsuario,
                    email: ssoData.email || ssoData.correo || 'usuario.sso@ddtextil.com',
                    correo: ssoData.email || ssoData.correo || 'usuario.sso@ddtextil.com',
                    role: 'cliente',
                    rol: 'cliente',
                    proveedor: ssoData.proveedor
                };

                try {
                    window.localStorage.setItem('authUser', JSON.stringify(loggedInUser));
                } catch (e) {
                    console.error('Error guardando en localStorage:', e);
                }

                setUser(loggedInUser);
                showNotification('success', `¡Bienvenido ${loggedInUser.name}! (Conectado con ${ssoData.proveedor || 'SSO'})`);
                return { success: true, user: loggedInUser };
            }

            const msg = isNetworkError
                ? 'No se puede conectar con el servidor. Verifica que el backend esté corriendo.'
                : 'Error al conectar con el servidor';
            showNotification('error', msg);
            return { success: false, message: msg };
        }
    };

    /**
     * logout — Cierra la sesión del usuario
     * Limpia datos de autenticación y previene residuos entre roles (admin/vendedor/cliente).
     */
    const logout = () => {
        setIsLoggingOut(true);
        setTimeout(() => {
            setUser(null);           // Borramos el usuario del estado y del localStorage
            try {
                window.localStorage.removeItem('authUser');
                window.localStorage.removeItem('token');
                window.localStorage.removeItem('cart');
                window.localStorage.removeItem('applied_coupon');
                window.localStorage.removeItem('erp_pinned_items');
                window.dispatchEvent(new Event('auth-logout'));
            } catch (e) {
                console.error('Error limpiando datos de sesión en logout:', e);
            }
            setIsLoggingOut(false);
            showNotification('info', 'Has cerrado sesión exitosamente');

            // Si se cerró sesión desde una vista privada, redirigir a /login limpiamente
            const pathActual = window.location.pathname;
            if (pathActual.startsWith('/admin') || pathActual.startsWith('/vendedor') || pathActual.startsWith('/cliente')) {
                window.location.href = '/login';
            }
        }, 1000);
    };

    /**
     * hasRole — Verifica si el usuario tiene uno de los roles especificados
     * Ejemplo: hasRole('admin') → true si el usuario es administrador
     * Ejemplo: hasRole(['admin', 'vendedor']) → true si es admin O vendedor
     */
    const hasRole = (roles) => {
        if (!user) return false;
        if (Array.isArray(roles)) {
            return roles.includes(user.role);
        }
        return user.role === roles;
    };

    const updateUser = (updates) => {
        setUser(prev => prev ? { ...prev, ...updates } : prev);
    };

    // Todos los datos y funciones que estarán disponibles en la app
    const value = {
        user,                        // Objeto con los datos del usuario conectado (o null)
        setUser,
        updateUser,
        isAuthenticated: !!user,     // true si hay sesión activa, false si no
        login,                       // Función para iniciar sesión
        loginConSSO,                 // Función para iniciar sesión mediante SSO (Google / Microsoft)
        register,                    // Función para crear una cuenta
        logout,                      // Función para cerrar sesión
        invalidarSesion,
        hasRole                      // Función para verificar permisos
    };

    return (
        <ContextoAutenticacion.Provider value={value}>
            {/* LogoutLoader muestra una pantalla de carga animada al cerrar sesión */}
            <LogoutLoader isLoggingOut={isLoggingOut}>
                {children}
            </LogoutLoader>
        </ContextoAutenticacion.Provider>
    );
}
