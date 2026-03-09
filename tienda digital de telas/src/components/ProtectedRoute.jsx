import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function ProtectedRoute({ children, roles }) {
    const { user, isAuthenticated, hasRole } = useAuth();
    const location = useLocation();

    if (!isAuthenticated) {
        // Redirigir al login guardando la ubicación intentada
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (roles && !hasRole(roles)) {
        // Si no tiene el rol necesario, redirigir a unauthorized o home
        // Por simplicidad, mandamos al home
        return <Navigate to="/" replace />;
    }

    return children;
}

export default ProtectedRoute;
