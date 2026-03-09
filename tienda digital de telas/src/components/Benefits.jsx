import React from 'react';
import { motion } from 'framer-motion';
import { FiTruck, FiShield, FiCreditCard, FiHeadphones } from 'react-icons/fi';

function Benefits() {
    const benefits = [
        {
            icon: FiTruck,
            title: 'Envío Gratis',
            description: 'En compras superiores a $100.000',
            color: 'from-blue-500 to-cyan-500',
        },
        {
            icon: FiShield,
            title: 'Garantía de Calidad',
            description: '100% telas auténticas y certificadas',
            color: 'from-green-500 to-emerald-500',
        },
        {
            icon: FiCreditCard,
            title: 'Pago Seguro',
            description: 'Múltiples métodos de pago disponibles',
            color: 'from-purple-500 to-pink-500',
        },
        {
            icon: FiHeadphones,
            title: 'Soporte 24/7',
            description: 'Atención personalizada cuando la necesites',
            color: 'from-orange-500 to-red-500',
        },
    ];

    return (
        <section className="section-container">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                {benefits.map((benefit, index) => {
                    const Icon = benefit.icon;
                    return (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ y: -5 }}
                            className="card p-6 text-center group cursor-pointer"
                        >
                            <div className="mb-4 flex justify-center">
                                <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${benefit.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                                    <Icon className="w-8 h-8 text-white" />
                                </div>
                            </div>
                            <h3 className="text-xl font-bold mb-2">{benefit.title}</h3>
                            <p className="text-gray-600 dark:text-gray-400">{benefit.description}</p>
                        </motion.div>
                    );
                })}
            </div>
        </section>
    );
}

export default Benefits;
