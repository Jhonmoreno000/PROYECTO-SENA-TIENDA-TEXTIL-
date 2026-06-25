/**
 * UIContext.jsx — Contexto de la Interfaz de Usuario
 * ====================================================
 * Este archivo guarda la configuración visual de la pantalla principal (Home):
 *  - Las diapositivas del carrusel de imágenes (banner de bienvenida)
 *  - Qué secciones están visibles en la página principal
 *
 * El administrador puede usar este contexto para controlar qué contenido
 * se muestra en el carrusel sin necesidad de editar el código.
 *
 * ¿Cómo se usa?
 *  const { carouselSlides, addSlide, toggleSection } = useUI();
 */

import React, { createContext, useContext, useState } from 'react';

// Creamos el contexto de UI para compartirlo con toda la app
const UIContext = createContext();

/**
 * useUI — Hook para acceder a la configuración visual de la app
 */
export function useUI() {
    const context = useContext(UIContext);
    if (!context) {
        throw new Error('useUI debe usarse dentro de un UIProvider');
    }
    return context;
}

/**
 * UIProvider — Proveedor del contexto de interfaz
 */
export function UIProvider({ children }) {
    // ── Diapositivas del carrusel de la página principal ─────────────────────
    // Cada objeto es una tarjeta grande con título, subtítulo e imagen de fondo
    const [carouselSlides, setCarouselSlides] = useState([
        {
            id: 1,
            title: 'Nueva Colección 2024',
            subtitle: 'Tendencias exclusivas en telas premium',
            image: '/images/carousel-nueva-coleccion.png',
            cta: 'Ver Más'
        },
        {
            id: 2,
            title: 'Telas Exclusivas',
            subtitle: 'Diseños únicos para proyectos especiales',
            image: '/images/carousel-telas-exclusivas.png',
            cta: 'Explorar'
        },
        {
            id: 3,
            title: 'Ofertas Especiales',
            subtitle: 'Descuentos increíbles en telas seleccionadas',
            image: '/images/carousel-ofertas-especiales.png',
            cta: 'Ver Ofertas'
        },
    ]);

    // ── Visibilidad de las secciones de la página principal ──────────────────
    // Cada propiedad controla si esa sección se muestra o se oculta
    const [homeSections, setHomeSections] = useState({
        hero: true,       // Banner principal con la imagen grande del encabezado
        carousel: true,   // Carrusel de imágenes debajo del hero
        featured: true,   // Sección de productos destacados
        benefits: true    // Sección de ventajas de la tienda (envío, calidad, etc.)
    });

    /**
     * addSlide — Agrega una nueva diapositiva al carrusel
     * Se usa desde el panel de administración para personalizar el banner.
     * @param {Object} slide - Objeto con { title, subtitle, image, cta }
     */
    const addSlide = (slide) => {
        setCarouselSlides([...carouselSlides, { ...slide, id: Date.now() }]);
    };

    /**
     * removeSlide — Elimina una diapositiva del carrusel por su ID
     * @param {number} id - ID único de la diapositiva a eliminar
     */
    const removeSlide = (id) => {
        setCarouselSlides(carouselSlides.filter(s => s.id !== id));
    };

    /**
     * updateSlide — Actualiza el contenido de una diapositiva existente
     * @param {number} id          - ID de la diapositiva a actualizar
     * @param {Object} updatedSlide - Nuevos datos de la diapositiva
     */
    const updateSlide = (id, updatedSlide) => {
        setCarouselSlides(carouselSlides.map(s => s.id === id ? updatedSlide : s));
    };

    /**
     * toggleSection — Muestra u oculta una sección de la página principal
     * Si la sección estaba visible la oculta, y si estaba oculta la muestra.
     * @param {string} sectionId - Nombre de la sección ('hero', 'carousel', 'featured', 'benefits')
     */
    const toggleSection = (sectionId) => {
        setHomeSections(prev => ({
            ...prev,
            [sectionId]: !prev[sectionId] // Invierte el valor actual (true → false, false → true)
        }));
    };

    // Datos y funciones disponibles para toda la app
    const value = {
        carouselSlides,  // Lista de diapositivas del carrusel
        addSlide,        // Agregar una diapositiva
        removeSlide,     // Eliminar una diapositiva
        updateSlide,     // Actualizar una diapositiva
        homeSections,    // Estado de visibilidad de las secciones del Home
        toggleSection    // Mostrar/ocultar una sección
    };

    return (
        <UIContext.Provider value={value}>
            {children}
        </UIContext.Provider>
    );
}
