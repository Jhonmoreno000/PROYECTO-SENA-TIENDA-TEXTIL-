import React, { useState, useEffect } from 'react';
import { Header, Hero, Carousel, FeaturedProducts, Benefits, Footer, AnimatedPage } from '../components';

function Home() {
    const [sections, setSections] = useState([
        { id: 'hero', visible: true },
        { id: 'carousel', visible: true },
        { id: 'featured', visible: true },
        { id: 'benefits', visible: true },
    ]);

    useEffect(() => {
        fetch('http://localhost:8081/api/config/home_sections_config')
            .then(res => res.ok ? res.text() : null)
            .then(text => {
                if (text && text !== '{}') {
                    setSections(JSON.parse(text));
                }
            })
            .catch(console.error);
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
