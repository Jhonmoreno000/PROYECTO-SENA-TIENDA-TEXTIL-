import React from 'react';
import { Link } from 'react-router-dom';
import Encabezado from '../componentes/Encabezado';
import PieDePagina from '../componentes/PieDePagina';

function NoEncontrado() {
    return (
        <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-slate-950">
            <Encabezado />
            <main className="flex-1 flex items-center justify-center px-6 py-20">
                <div className="max-w-lg text-center">
                    <p className="text-6xl font-display font-black text-primary-600 dark:text-primary-400 mb-4">
                        404
                    </p>
                    <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-3">
                        Página no encontrada
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 mb-8">
                        La ruta que buscas no existe o fue trasladada. Explora nuestro catálogo de telas o regresa al inicio.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/" className="btn-primary">
                            Volver al Inicio
                        </Link>
                        <Link to="/catalogo" className="btn-outline">
                            Ver Catálogo
                        </Link>
                    </div>
                </div>
            </main>
            <PieDePagina />
        </div>
    );
}

export default NoEncontrado;
