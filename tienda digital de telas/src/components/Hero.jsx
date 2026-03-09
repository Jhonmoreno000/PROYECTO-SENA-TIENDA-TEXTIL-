import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowRight } from 'react-icons/fi';

function Hero() {
    return (
        <section className="relative min-h-[600px] md:min-h-[700px] flex items-center overflow-hidden bg-gradient-to-br from-orange-50 via-white to-orange-100 dark:from-gray-900 dark:via-black dark:to-gray-900">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10 dark:opacity-5">
                <div className="absolute inset-0" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }}></div>
            </div>

            <div className="section-container relative z-10">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    {/* Content */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-center md:text-left"
                    >
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.8 }}
                            className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-6 leading-tight"
                        >
                            Telas de{' '}
                            <span className="text-gradient">
                                Calidad alta gama
                            </span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4, duration: 0.8 }}
                            className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-xl"
                        >
                            Descubre nuestra exclusiva colección de telas importadas y nacionales.
                            Calidad excepcional para tus proyectos de moda y decoración.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6, duration: 0.8 }}
                            className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start"
                        >
                            <Link to="/catalogo" className="btn-primary inline-flex items-center justify-center gap-2 group">
                                Explorar Catálogo
                                <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link to="/nosotros" className="btn-outline inline-flex items-center justify-center">
                                Conocer Más
                            </Link>
                        </motion.div>

                        {/* Stats */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.8, duration: 0.8 }}
                            className="grid grid-cols-3 gap-6 mt-12 max-w-md mx-auto md:mx-0"
                        >
                            <div className="text-center md:text-left">
                                <div className="text-3xl font-bold text-primary-600 dark:text-primary-400">500+</div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">Productos</div>
                            </div>
                            <div className="text-center md:text-left">
                                <div className="text-3xl font-bold text-primary-600 dark:text-primary-400">100%</div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">Calidad</div>
                            </div>
                            <div className="text-center md:text-left">
                                <div className="text-3xl font-bold text-primary-600 dark:text-primary-400">24/7</div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">Soporte</div>
                            </div>
                        </motion.div>
                    </motion.div>

                    {/* Image */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4, duration: 0.8 }}
                        className="relative hidden md:block"
                    >
                        <div className="relative z-10">
                            <img
                                src="/images/hero-telas-premium.png"
                                alt="Telas de calidad premium - Algodón, Seda, Lino y Terciopelo"
                                className="rounded-2xl shadow-2xl w-full h-[500px] object-cover"
                            />
                            {/* Floating Badge */}
                            <motion.div
                                animate={{ y: [0, -10, 0] }}
                                transition={{ duration: 3, repeat: Infinity }}
                                className="absolute -bottom-6 -left-6 bg-white dark:bg-slate-800 rounded-xl shadow-xl p-6 glass"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-primary-400 rounded-full flex items-center justify-center">
                                        <span className="text-white text-xl">✓</span>
                                    </div>
                                    <div>
                                        <div className="font-bold text-gray-900 dark:text-white">Envío Gratis</div>
                                        <div className="text-sm text-gray-600 dark:text-gray-400">En compras +$100.000</div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>

                        {/* Decorative Elements */}
                        <div className="absolute -top-4 -right-4 w-72 h-72 bg-primary-200 dark:bg-primary-900 rounded-full blur-3xl opacity-30"></div>
                        <div className="absolute -bottom-4 -left-4 w-72 h-72 bg-accent-200 dark:bg-accent-900 rounded-full blur-3xl opacity-30"></div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}

export default Hero;
