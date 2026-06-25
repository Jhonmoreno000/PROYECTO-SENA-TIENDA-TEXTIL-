/**
 * main.jsx — Punto de entrada de la aplicación
 * ==============================================
 * Este es el primer archivo que se ejecuta cuando alguien abre la tienda.
 * Su única función es "montar" (arrancar) la aplicación de React dentro
 * del elemento <div id="root"> que está en el archivo index.html.
 *
 * React.StrictMode es un modo especial de desarrollo que ayuda a detectar
 * errores comunes antes de que lleguen a producción (no afecta el rendimiento).
 */

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'       // Componente raíz que contiene toda la app
import './index.css'              // Estilos globales (fuentes, colores, utilidades CSS)

// Buscamos el elemento con id="root" en el HTML y arrancamos React dentro de él
ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
)
