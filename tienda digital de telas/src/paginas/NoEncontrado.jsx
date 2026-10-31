import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Scissors, Home, ShoppingBag, ArrowLeft, MessageCircle } from 'lucide-react';
import Encabezado from '../componentes/Encabezado';
import PieDePagina from '../componentes/PieDePagina';
import PaginaAnimada from '../componentes/PaginaAnimada';

function NoEncontrado() {
    const location = useLocation();

    return (
        <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-slate-900">
            <Encabezado />

            <PaginaAnimada className="flex-1 flex items-center justify-center px-4 py-16">
                <div className="max-w-xl w-full text-center bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-gray-100 dark:border-slate-700 p-8 md:p-12 relative overflow-hidden">
                    <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary-500/10 rounded-full blur-2xl pointer-events-none" />
                    <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-accent-500/10 rounded-full blur-2xl pointer-events-none" />

                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-600 text-white shadow-lg shadow-primary-500/25 mb-6">
                        <Scissors className="w-10 h-10 -rotate-45" />
                    </div>

                    <span className="inline-block px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-widest bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 mb-3">
                        Error 404 · Corte fuera de rollo
                    </span>

                    <h1 className="text-3xl md:text-4xl font-display font-black text-gray-900 dark:text-white mb-3">
                        ¡Hilo suelto! No encontramos esta página
                    </h1>

                    <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base mb-2 leading-relaxed">
                        La ruta <code className="px-2 py-0.5 rounded bg-gray-100 dark:bg-slate-700 text-primary-600 dark:text-primary-400 font-mono text-xs">{location.pathname}</code> no existe o fue trasladada dentro de nuestro catálogo textil.
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mb-8">
                        Explora nuestras colecciones de telas por metro o vuelve al inicio de D&amp;D Textil Medellín.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                        <Link
                            to="/"
                            className="w-full sm:w-auto btn-primary inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm"
                        >
                            <Home className="w-4 h-4" />
                            Ir al Inicio
                        </Link>
                        <Link
                            to="/catalogo"
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
                        >
                            <ShoppingBag className="w-4 h-4" />
                            Ver Catálogo de Telas
                        </Link>
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-100 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3 text-xs text-gray-500 dark:text-gray-400">
                        <button
                            type="button"
                            onClick={() => window.history.back()}
                            className="inline-flex items-center gap-1.5 font-semibold hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                        >
                            <ArrowLeft className="w-3.5 h-3.5" />
                            Regresar a la página anterior
                        </button>

                        <a
                            href="https://wa.me/573027058951?text=Hola%20D%26D%20Textil%2C%20necesito%20ayuda%20encontrando%20una%20tela"
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                        >
                            <MessageCircle className="w-3.5 h-3.5" />
                            Soporte WhatsApp: 302 705 8951
                        </a>
                    </div>
                </div>
            </PaginaAnimada>

            <PieDePagina />
        </div>
    );
}

export default NoEncontrado;

