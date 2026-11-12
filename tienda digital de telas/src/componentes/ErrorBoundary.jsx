import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

/**
 * ErrorBoundary — Componente que captura errores de renderizado en React
 * y evita que la aplicación quede con la pantalla completamente en blanco.
 */
export class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('ErrorBoundary capturó una excepción no controlada:', error, errorInfo);
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: null });
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-slate-900 p-6 text-center">
                    <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 max-w-md w-full shadow-2xl border border-gray-100 dark:border-slate-700 flex flex-col items-center">
                        <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-4">
                            <AlertTriangle className="w-8 h-8" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                            Sección no disponible temporalmente
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">
                            Ocurrió un inconveniente al renderizar esta vista. Puedes recargar o regresar a la tienda principal.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 w-full">
                            <button
                                onClick={this.handleRetry}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-all shadow-md active:scale-95"
                            >
                                <RefreshCw className="w-4 h-4" /> Reintentar
                            </button>
                            <a
                                href="/"
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-800 dark:text-gray-200 font-semibold rounded-xl transition-all active:scale-95"
                            >
                                <Home className="w-4 h-4" /> Inicio
                            </a>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
