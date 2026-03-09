import React, { createContext, useContext, useState } from 'react';

const UIContext = createContext();

export function useUI() {
    const context = useContext(UIContext);
    if (!context) {
        throw new Error('useUI must be used within a UIProvider');
    }
    return context;
}

export function UIProvider({ children }) {
    // Carousel State
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

    // Home Sections Visibility State
    const [homeSections, setHomeSections] = useState({
        hero: true,
        carousel: true,
        featured: true,
        benefits: true
    });

    const addSlide = (slide) => {
        setCarouselSlides([...carouselSlides, { ...slide, id: Date.now() }]);
    };

    const removeSlide = (id) => {
        setCarouselSlides(carouselSlides.filter(s => s.id !== id));
    };

    const updateSlide = (id, updatedSlide) => {
        setCarouselSlides(carouselSlides.map(s => s.id === id ? updatedSlide : s));
    };

    const toggleSection = (sectionId) => {
        setHomeSections(prev => ({
            ...prev,
            [sectionId]: !prev[sectionId]
        }));
    };

    const value = {
        carouselSlides,
        addSlide,
        removeSlide,
        updateSlide,
        homeSections,
        toggleSection
    };

    return (
        <UIContext.Provider value={value}>
            {children}
        </UIContext.Provider>
    );
}
