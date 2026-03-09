import React from 'react';
import { TruckLoader } from '../components';

function LoaderDemo() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center p-8">
            <div className="max-w-4xl w-full space-y-12">
                <div className="text-center">
                    <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">
                        TruckLoader Demo
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Componente de carga animado con camión
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Default */}
                    <div className="card p-8 text-center">
                        <h3 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">
                            Por Defecto
                        </h3>
                        <TruckLoader />
                    </div>

                    {/* With text */}
                    <div className="card p-8 text-center">
                        <h3 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">
                            Con Texto
                        </h3>
                        <TruckLoader text="Cargando productos..." />
                    </div>

                    {/* Small size */}
                    <div className="card p-8 text-center">
                        <h3 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">
                            Tamaño Pequeño
                        </h3>
                        <TruckLoader size="small" text="Procesando..." />
                    </div>

                    {/* Large size */}
                    <div className="card p-8 text-center">
                        <h3 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">
                            Tamaño Grande
                        </h3>
                        <TruckLoader size="large" text="Cargando pedido..." />
                    </div>

                    {/* Custom colors */}
                    <div className="card p-8 text-center">
                        <h3 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">
                            Colores Personalizados
                        </h3>
                        <TruckLoader
                            truckColor="#3B82F6"
                            bodyColor="#BFDBFE"
                            text="Colores personalizados"
                        />
                    </div>

                    {/* Dark theme */}
                    <div className="card p-8 text-center bg-slate-800">
                        <h3 className="text-xl font-bold mb-6 text-white">
                            Tema Oscuro
                        </h3>
                        <TruckLoader
                            truckColor="#10B981"
                            bodyColor="#D1FAE5"
                            text="En tema oscuro"
                        />
                    </div>
                </div>

                <div className="card p-6">
                    <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">
                        Uso del Componente
                    </h3>
                    <pre className="bg-gray-100 dark:bg-slate-800 p-4 rounded-lg overflow-x-auto text-sm">
                        <code>{`import { TruckLoader } from './components';

// Uso básico
<TruckLoader />

// Con texto
<TruckLoader text="Cargando..." />

// Tamaños disponibles: small, medium, large
<TruckLoader size="large" />

// Colores personalizados
<TruckLoader 
  truckColor="#3B82F6" 
  bodyColor="#BFDBFE"
  text="Cargando productos..."
/>`}</code>
                    </pre>
                </div>
            </div>
        </div>
    );
}

export default LoaderDemo;
