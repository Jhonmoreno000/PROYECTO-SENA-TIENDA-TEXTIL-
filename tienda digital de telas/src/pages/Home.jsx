import React from 'react';
import { Header, Hero, Carousel, FeaturedProducts, Benefits, Footer } from '../components';

function Home() {
    return (
        <div className="min-h-screen">
            <Header />
            <main>
                <Hero />
                <Carousel />
                <FeaturedProducts />
                <Benefits />
            </main>
            <Footer />
        </div>
    );
}

export default Home;
