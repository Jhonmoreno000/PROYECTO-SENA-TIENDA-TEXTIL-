import React, { useState, useEffect } from 'react';
import { Header, Hero, Carousel, FeaturedProducts, Benefits, Footer, AnimatedPage } from '../components';
import { getApiUrl } from '../config';

function Home() {
    const [sections, setSections] = useState([
        { id: 'hero', visible: true },
        { id: 'carousel', visible: true },
        { id: 'featured', visible: true },
        { id: 'benefits', visible: true },
    ]);

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
                    {isVisible('featured') && <FeaturedProducts />}
                    {isVisible('benefits') && <Benefits />}
                </AnimatedPage>
            </main>
            <Footer />
        </div>
    );
}

export default Home;
