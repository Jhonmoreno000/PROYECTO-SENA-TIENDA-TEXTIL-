import React from 'react';
import LayoutPanel from '../../componentes/layouts/LayoutPanel';
import enlacesVendedor from '../../datos/enlacesVendedor';
import BackButton from '../../componentes/dashboard/BackButton';
import PerfilTiendaFacebook from '../../componentes/PerfilTiendaFacebook';
import { useAutenticacion } from '../../contextos/ContextoAutenticacion';

/**
 * Vista dentro del Dashboard del Vendedor donde ve y edita su mismo perfil tipo Facebook
 * (foto de portada, foto de perfil, bio, políticas y catálogo publicado).
 */
export default function MiTiendaVendedor() {
    const { user } = useAutenticacion();
    const isElevated = user?.role === 'admin' || user?.rol === 'administrador' || user?.role === 'administrador';
    const targetSellerId = (user?.id && !isElevated) ? user.id : (user?.id || 2);

    return (
        <LayoutPanel title="Mi Perfil de Tienda (Vista Social)" links={enlacesVendedor}>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <BackButton to="/vendedor" label="Volver al Resumen" />
                </div>
                <PerfilTiendaFacebook sellerId={targetSellerId} allowInlineEdit={true} />
            </div>
        </LayoutPanel>
    );
}

