import React from 'react';

/**
 * Elegant Minimal Loader
 * Utiliza una fuente de Google Fonts (Playfair Display) y un diseño muy limpio.
 */
function TruckLoader({ text = 'Cargando...', className = '' }) {
    const css = `
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;1,500&display=swap');
        
        @keyframes pulse-fade {
            0%, 100% { opacity: 0.2; transform: scale(0.8); }
            50% { opacity: 1; transform: scale(1); }
        }
        @keyframes spinner-ring {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    `;

    return (
        <div 
            className={`flex flex-col items-center justify-center min-h-[200px] gap-6 ${className}`}
            role="status"
            aria-label="Cargando"
        >
            <style>{css}</style>
            
            {/* Elegant Spinner */}
            <div className="relative w-12 h-12 flex items-center justify-center">
                <div 
                    className="absolute inset-0 rounded-full border-[1.5px] border-primary-100 dark:border-slate-700"
                />
                <div 
                    className="absolute inset-0 rounded-full border-[1.5px] border-primary-600 dark:border-primary-400 border-t-transparent dark:border-t-transparent"
                    style={{ animation: 'spinner-ring 1.2s cubic-bezier(0.5, 0.1, 0.4, 0.9) infinite' }}
                />
                <div 
                    className="w-2 h-2 bg-primary-600 dark:bg-primary-400 rounded-full" 
                    style={{ animation: 'pulse-fade 1.5s ease-in-out infinite' }} 
                />
            </div>

            {/* Typography */}
            {text && (
                <div 
                    style={{ fontFamily: "'Playfair Display', serif" }}
                    className="text-lg text-gray-800 dark:text-gray-200 tracking-wide italic font-medium"
                >
                    {text}
                </div>
            )}
            
            <span className="sr-only">Cargando contenido...</span>
        </div>
    );
}

export default TruckLoader;
