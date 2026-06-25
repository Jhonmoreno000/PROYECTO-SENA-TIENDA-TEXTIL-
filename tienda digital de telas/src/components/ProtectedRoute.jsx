/**
 * ProtectedRoute.jsx — Guardián de Rutas Privadas
 * =================================================
 * Este componente protege las páginas que solo pueden ver usuarios autenticados.
 * Si alguien intenta entrar a una página protegida sin haber iniciado sesión,
 * lo redirige automáticamente a la pantalla de Login.
 *
 * También puede restringir el acceso por rol:
 *  - roles="admin"              → solo administradores
 *  - roles={['seller', 'admin']}→ vendedores o administradores
 *
 * ¿Cómo se usa?
 *  <ProtectedRoute roles="admin">
 *    <AdminDashboard />
 *  </ProtectedRoute>
 */

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * @param {React.ReactNode}     children - El componente que se quiere proteger
 * @param {string|string[]}     roles    - Rol o roles que pueden acceder (opcional)
 */
function ProtectedRoute({ children, roles }) {
    const { user, isAuthenticated } = useAuth();
    const location = useLocation();

    // Si el usuario no ha iniciado sesión, lo enviamos al Login
    // Guardamos la URL que intentó visitar para redirigirlo de vuelta después
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Normalizamos roles siempre a un array para que la comparación sea consistente
    // Ejemplo: "admin" → ["admin"], ["seller","admin"] → ["seller","admin"]
    if (roles) {
        const rolesArray = Array.isArray(roles) ? roles : [roles];
        const userRole = user?.role;
        if (!rolesArray.includes(userRole)) {
            // El usuario está autenticado pero no tiene el rol necesario → lo mandamos al inicio
            return <Navigate to="/" replace />;
        }
    }

    // Si pasa ambas verificaciones, mostramos el contenido protegido
    return children;
}

export default ProtectedRoute;

