import React, { useState, useEffect } from 'react';
import { Header, Hero, Carousel, FeaturedProducts, Benefits, Footer, AnimatedPage, HomeSection } from '../components';
import { getApiUrl } from '../config';

// Apartados por defecto si el backend no responde (editables desde el admin)
const DEFAULT_SECTIONS = [
    { key: 'nuevas', title: 'Nuevas Colecciones', subtitle: 'Descubre las telas más recientes que llegan a la tienda', active: true },
    { key: 'exclusivas', title: 'Telas Exclusivas', subtitle: 'Diseños únicos seleccionados para tus proyectos especiales', active: true },
    { key: 'ofertas', title: 'Ofertas Especiales', subtitle: 'Precios especiales en telas seleccionadas por tiempo limitado', active: true },
];

// Flags de productos que alimentan cada apartado
const SECTION_FLAGS = { nuevas: 'isNewCollection', exclusivas: 'isExclusive', ofertas: 'isOffer' };

function Home() {
    const [sections, setSections] = useState([
        { id: 'hero', visible: true },
        { id: 'carousel', visible: true },
        { id: 'featured', visible: true },
        { id: 'benefits', visible: true },
    ]);
    const [homeSections, setHomeSections] = useState(DEFAULT_SECTIONS);

    useEffect(() => {
        // Carga los apartados editados por el admin desde la base de datos
        fetch(getApiUrl('/api/home-sections'))
            .then(res => res.ok ? res.json() : null)
            .then(data => { if (data && data.length > 0) setHomeSections(data); })
            .catch(() => {
                // Si el backend no responde se mantienen los apartados por defecto
            });
    }, []);

    useEffect(() => {
        // Function to load settings
        const loadConfig = () => {
            // First check local storage for immediate sync
            const localSettings = localStorage.getItem('home_sections_config');
            if (localSettings) {
                try {
                    setSections(JSON.parse(localSettings));
                } catch (e) {
                    console.error('Local Config Parse Error', e);
                }
            }
            
            // Still attempt to get from backend quietly
            fetch(getApiUrl('/api/config/home_sections_config'))
                .then(res => res.ok ? res.text() : null)
                .then(text => {
                    if (text && text !== '{}') {
                        const parsed = JSON.parse(text);
                        setSections(parsed);
                        localStorage.setItem('home_sections_config', JSON.stringify(parsed));
                    }
                })
                .catch(e => {
                    // Fail silently, local storage already applied
                });
        };

        loadConfig();

        // Listen for storage events (allows instant update across tabs if User toggles setting in Admin panel)
        const handleStorageChange = (e) => {
            if (e.key === 'home_sections_config' && e.newValue) {
                try {
                    setSections(JSON.parse(e.newValue));
                } catch (err) {}
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);

    }, []);

    const isVisible = (id) => {
        const section = sections.find(s => s.id === id);
        return section ? section.visible : true;
    };

    return (
        <div className="min-h-screen">
            <Header />
            <main>
                <AnimatedPage>
                    {isVisible('hero') && <Hero />}
                    {isVisible('carousel') && <Carousel />}
                    {homeSections.map((section, i) => (
                        <HomeSection
                            key={section.key}
                            section={section}
                            flag={SECTION_FLAGS[section.key]}
                            bgClass={i % 2 === 1 ? 'bg-white dark:bg-slate-900' : undefined}
                        />
                    ))}
                    {isVisible('featured') && <FeaturedProducts />}
                    {isVisible('benefits') && <Benefits />}
                </AnimatedPage>
            </main>
            <Footer />
        </div>
    );
}

export default Home;
