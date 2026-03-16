import React from 'react';
import { motion } from 'framer-motion';
import { MdLocalShipping, MdVerifiedUser, MdCreditCard, MdSupportAgent } from 'react-icons/md';

function Benefits() {
    const benefits = [
        {
            icon: MdLocalShipping,
            title: 'Envío Gratis',
            description: 'En compras superiores a $100.000',
            color: 'from-blue-500 to-cyan-500',
        },
        {
            icon: MdVerifiedUser,
            title: 'Garantía de Calidad',
            description: '100% telas auténticas y certificadas',
            color: 'from-green-500 to-emerald-500',
        },
        {
            icon: MdCreditCard,
            title: 'Pago Seguro',
            description: 'Múltiples métodos de pago disponibles',
            color: 'from-purple-500 to-pink-500',
        },
        {
            icon: MdSupportAgent,
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
                            initial={{ opacity: 0, y: 50, filter: 'blur(10px)' }}
                            whileInView={{ 
                                opacity: 1, 
                                y: 0, 
                                filter: 'blur(0px)',
                                transition: {
                                    duration: 1,
                                    delay: index * 0.15,
                                    ease: "easeOut"
                                }
                            }}
                            viewport={{ once: true, margin: "-50px" }}
                            whileHover={{ y: -10, scale: 1.05, transition: { duration: 0.3 } }}
                            className="card p-6 text-center group cursor-pointer"
                        >
                            <div className="mb-4 flex justify-center">
                                <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${benefit.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-lg`}>
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
