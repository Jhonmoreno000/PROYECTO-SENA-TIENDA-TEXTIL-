import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Encabezado from '../componentes/Encabezado';
import PieDePagina from '../componentes/PieDePagina';
import PaginaAnimada from '../componentes/PaginaAnimada';
import PerfilTiendaFacebook from '../componentes/PerfilTiendaFacebook';

export default function PerfilTiendaPublico() {
    const { id } = useParams();

    return (
        <div className="min-h-screen flex flex-col">
            <Encabezado />
            <PaginaAnimada className="flex-1">
                <main className="section-container !pt-8">
                    <div className="mb-6 flex items-center justify-between">
                        <Link
                            to="/tiendas"
                            className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-primary-600 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" /> Volver a Tiendas Proveedoras
                        </Link>
                    </div>
                    <PerfilTiendaFacebook sellerId={id} allowInlineEdit={true} />
                </main>
            </PaginaAnimada>
            <PieDePagina />
        </div>
    );
}

