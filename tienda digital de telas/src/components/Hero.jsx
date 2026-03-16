import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MdArrowForward } from 'react-icons/md';
import Counter from './Counter';


function Hero() {
    const [hoveredIndex, setHoveredIndex] = useState(0);
    const heroImages = [
        "/images/hero-telas-premium.png",
        "/images/hero-detail-1.png",
        "/images/hero-detail-2.png",
        "/images/hero-detail-3.png"
    ];

    return (
        <section className="relative min-h-[700px] lg:min-h-[850px] flex items-center overflow-hidden bg-gradient-to-br from-orange-50 via-white to-orange-100 dark:from-gray-900 dark:via-black dark:to-gray-900 pt-24 lg:pt-0">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10 dark:opacity-5">
                <div className="absolute inset-0" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }}></div>
            </div>

            <div className="section-container relative z-10 w-full">
                <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
                    {/* Content */}
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        className="text-center lg:text-left order-2 lg:order-1"
                    >
                        <motion.h1
                            className="text-4xl sm:text-5xl lg:text-7xl font-display font-bold mb-8 leading-tight flex flex-wrap justify-center lg:justify-start"
                        >
                            {"Telas de ".split("").map((char, i) => (
                                <motion.span
                                    key={i}
                                    variants={{
                                        hidden: { opacity: 0, y: 20, filter: 'blur(10px)', scale: 0.8 },
                                        visible: { 
                                            opacity: 1, 
                                            y: 0, 
                                            filter: 'blur(0px)', 
                                            scale: 1,
                                            transition: { duration: 0.8, delay: i * 0.03, ease: [0.2, 0, 0.2, 1] }
                                        }
                                    }}
                                    className="inline-block"
                                >
                                    {char === " " ? "\u00A0" : char}
                                </motion.span>
                            ))}
                            <motion.span 
                                className="text-gradient inline-block ml-0 lg:ml-4"
                                initial={{ opacity: 0, filter: 'blur(10px)' }}
                                animate={{ opacity: 1, filter: 'blur(0px)' }}
                                transition={{ duration: 1.5, delay: 0.5 }}
                            >
                                {"Calidad alta gama".split("").map((char, i) => (
                                    <motion.span
                                        key={i}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ duration: 0.1, delay: 0.6 + (i * 0.05) }}
                                    >
                                        {char === " " ? "\u00A0" : char}
                                    </motion.span>
                                ))}
                            </motion.span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, filter: 'blur(8px)' }}
                            animate={{ opacity: 1, filter: 'blur(0px)' }}
                            transition={{ duration: 1.5, delay: 1, ease: "easeInOut" }}
                            className="text-lg sm:text-xl lg:text-2xl text-gray-600 dark:text-gray-300 mb-10 max-w-2xl mx-auto lg:mx-0"
                        >
                            Descubre nuestra exclusiva colección de telas importadas y nacionales.
                            Calidad excepcional para tus proyectos de moda y decoración.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1, delay: 1.5 }}
                            className="flex flex-col sm:flex-row gap-6 justify-center lg:justify-start"
                        >
                            <Link to="/catalogo" className="btn-primary py-4 px-8 text-lg inline-flex items-center justify-center gap-2 group">
                                Explorar Catálogo
                                <MdArrowForward className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link to="/nosotros" className="btn-outline py-4 px-8 text-lg inline-flex items-center justify-center">
                                Conocer Más
                            </Link>
                        </motion.div>

                        {/* Stats */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 1, delay: 2 }}
                            className="grid grid-cols-3 gap-8 mt-16 max-w-md mx-auto lg:mx-0"
                        >
                            <div className="text-center lg:text-left">
                                <div className="text-3xl lg:text-4xl font-bold text-primary-600 dark:text-primary-400">
                                    <Counter value={500} suffix="+" delay={2.2} />
                                </div>
                                <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Productos
                                </div>
                            </div>
                            <div className="text-center lg:text-left">
                                <div className="text-3xl lg:text-4xl font-bold text-primary-600 dark:text-primary-400">
                                    <Counter value={100} suffix="%" delay={2.4} />
                                </div>
                                <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Calidad</div>
                            </div>
                            <div className="text-center lg:text-left">
                                <div className="text-3xl lg:text-4xl font-bold text-primary-600 dark:text-primary-400">
                                    <Counter value={24} suffix="/7" delay={2.6} />
                                </div>
                                <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Soporte</div>
                            </div>
                        </motion.div>
                    </motion.div>

                    {/* Image */}
                    <motion.div
                        initial={{ opacity: 0, scale: 1.1, filter: 'blur(20px)', y: 50 }}
                        animate={{ opacity: 1, scale: 1, filter: 'blur(0px)', y: 0 }}
                        transition={{ duration: 1.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                        className="relative order-1 lg:order-2 w-full"
                    >
                        <div 
                            className="relative z-10 aspect-square sm:aspect-video lg:aspect-auto lg:h-[600px] rounded-[2rem] overflow-hidden shadow-2xl ring-1 ring-white/20 group"
                            onMouseMove={(e) => {
                                const rect = e.currentTarget.getBoundingClientRect();
                                const x = e.clientX - rect.left;
                                const width = rect.width;
                                const index = Math.min(heroImages.length - 1, Math.floor((x / width) * heroImages.length));
                                if (index !== hoveredIndex) setHoveredIndex(index);
                            }}
                            onMouseLeave={() => setHoveredIndex(0)}
                        >
                            <AnimatePresence mode="wait">
                                <motion.img
                                    key={hoveredIndex}
                                    initial={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
                                    animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                                    exit={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
                                    transition={{ duration: 0.6, ease: "easeInOut" }}
                                    src={heroImages[hoveredIndex]}
                                    alt="Telas de calidad premium"
                                    className="w-full h-full object-cover"
                                />
                            </AnimatePresence>

                            {/* Floating Badge */}
                            <motion.div
                                animate={{ y: [0, -10, 0] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute bottom-6 left-6 right-6 sm:right-auto bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-white/20 z-20"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-primary-400 rounded-full flex items-center justify-center shadow-lg">
                                        <span className="text-white text-xl font-bold">✓</span>
                                    </div>
                                    <div>
                                        <div className="font-bold text-gray-900 dark:text-white">Envío Gratis</div>
                                        <div className="text-sm text-gray-600 dark:text-gray-400">En compras + COP 100.000</div>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Indicators */}
                            <div className="absolute top-6 left-1/2 -translate-x-1/2 flex gap-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                                {heroImages.map((_, i) => (
                                    <div 
                                        key={i} 
                                        className={`h-1.5 w-10 rounded-full transition-all ${i === hoveredIndex ? 'bg-white shadow-lg' : 'bg-white/40'}`} 
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Decorative Background Effects */}
                        <motion.div 
                            animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
                            transition={{ duration: 10, repeat: Infinity }}
                            className="absolute -top-20 -right-20 w-80 h-80 bg-primary-400 rounded-full blur-[100px] -z-10"
                        />
                        <motion.div 
                            animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.1, 0.2] }}
                            transition={{ duration: 12, repeat: Infinity }}
                            className="absolute -bottom-20 -left-20 w-80 h-80 bg-accent-400 rounded-full blur-[100px] -z-10"
                        />
                    </motion.div>
                </div>
            </div>
        </section>
    );
}

export default Hero;
