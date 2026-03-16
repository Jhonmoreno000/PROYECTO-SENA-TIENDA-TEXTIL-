import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MdMail, MdPhone, MdLocationOn, MdAccessTime, MdSend } from 'react-icons/md';
import Header from '../components/Header';
import Footer from '../components/Footer';
import AnimatedPage from '../components/AnimatedPage';

function Contact() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
    });

    const [submitted, setSubmitted] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Simular envío
        setSubmitted(true);
        setTimeout(() => {
            setSubmitted(false);
            setFormData({
                name: '',
                email: '',
                phone: '',
                subject: '',
                message: '',
            });
        }, 3000);
    };

    const contactInfo = [
        {
            icon: MdLocationOn,
            title: 'Dirección',
            info: 'Calle 123 #45-67',
            info2: 'Bogotá, Colombia',
            color: 'from-blue-500 to-cyan-500',
        },
        {
            icon: MdPhone,
            title: 'Teléfono',
            info: '+57 (1) 234 5678',
            info2: '+57 300 123 4567',
            color: 'from-green-500 to-emerald-500',
        },
        {
            icon: MdMail,
            title: 'Email',
            info: 'info@ddtextil.com',
            info2: 'ventas@ddtextil.com',
            color: 'from-purple-500 to-pink-500',
        },
        {
            icon: MdAccessTime,
            title: 'Horario',
            info: 'Lun - Vie: 8:00 AM - 6:00 PM',
            info2: 'Sáb: 9:00 AM - 2:00 PM',
            color: 'from-orange-500 to-red-500',
        },
    ];

    return (
        <div className="min-h-screen flex flex-col">
            <Header />

            <AnimatedPage className="flex-1">
                {/* Hero Section */}
                <section className="bg-gradient-to-r from-primary-600 to-accent-600 text-white py-20">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center"
                        >
                            <h1 className="text-4xl md:text-5xl font-display font-bold mb-6">
                                Contáctanos
                            </h1>
                            <p className="text-xl text-white/90 max-w-3xl mx-auto">
                                ¿Tienes alguna pregunta? Estamos aquí para ayudarte. Contáctanos y te responderemos lo antes posible.
                            </p>
                        </motion.div>
                    </div>
                </section>

                {/* Contact Info Cards */}
                <section className="py-16 bg-white dark:bg-slate-900">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {contactInfo.map((item, index) => {
                                const Icon = item.icon;
                                return (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: 30 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        whileHover={{ y: -5, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.4, delay: index * 0.1 }}
                                        className="card p-6 text-center shadow-sm border border-gray-100 dark:border-slate-700 transition-all"
                                    >
                                        <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br ${item.color} mb-4`}>
                                            <Icon className="w-8 h-8 text-white" />
                                        </div>
                                        <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                                        <p className="text-gray-600 dark:text-gray-400 text-sm">{item.info}</p>
                                        <p className="text-gray-600 dark:text-gray-400 text-sm">{item.info2}</p>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* Contact Form & Map */}
                <section className="section-container">
                    <div className="grid lg:grid-cols-2 gap-12">
                        {/* Form */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            <h2 className="text-3xl font-display font-bold mb-6">
                                Envíanos un Mensaje
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400 mb-8">
                                Completa el formulario y nos pondremos en contacto contigo en menos de 24 horas.
                            </p>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label htmlFor="name" className="block font-semibold mb-2">
                                        Nombre Completo *
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        className="input-field"
                                        placeholder="Juan Pérez"
                                    />
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="email" className="block font-semibold mb-2">
                                            Email *
                                        </label>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                            className="input-field"
                                            placeholder="juan@ejemplo.com"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="phone" className="block font-semibold mb-2">
                                            Teléfono
                                        </label>
                                        <input
                                            type="tel"
                                            id="phone"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            className="input-field"
                                            placeholder="300 123 4567"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="subject" className="block font-semibold mb-2">
                                        Asunto *
                                    </label>
                                    <input
                                        type="text"
                                        id="subject"
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleChange}
                                        required
                                        className="input-field"
                                        placeholder="¿En qué podemos ayudarte?"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="message" className="block font-semibold mb-2">
                                        Mensaje *
                                    </label>
                                    <textarea
                                        id="message"
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        required
                                        rows="5"
                                        className="input-field resize-none"
                                        placeholder="Escribe tu mensaje aquí..."
                                    ></textarea>
                                </div>

                                <motion.button
                                    whileTap={{ scale: 0.98 }}
                                    type="submit"
                                    className="btn-primary w-full flex items-center justify-center gap-2"
                                >
                                    <MdSend />
                                    Enviar Mensaje
                                </motion.button>

                                {submitted && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 p-4 rounded-lg text-center font-semibold"
                                    >
                                        ✓ ¡Mensaje enviado exitosamente! Te contactaremos pronto.
                                    </motion.div>
                                )}
                            </form>
                        </motion.div>

                        {/* Map & Additional Info */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="space-y-8"
                        >
                            {/* Map Placeholder */}
                            <div className="card overflow-hidden h-80">
                                <iframe
                                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3976.8157763162384!2d-74.07209668573468!3d4.624335596641934!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e3f9a3b7f7f7f7f%3A0x7f7f7f7f7f7f7f7f!2sBogot%C3%A1%2C%20Colombia!5e0!3m2!1ses!2sco!4v1234567890123!5m2!1ses!2sco"
                                    width="100%"
                                    height="100%"
                                    style={{ border: 0 }}
                                    allowFullScreen=""
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                    title="Ubicación D&D Textil"
                                ></iframe>
                            </div>

                            {/* FAQ */}
                            <div className="card p-8">
                                <h3 className="text-2xl font-bold mb-6">Preguntas Frecuentes</h3>
                                <div className="space-y-4">
                                    <div>
                                        <h4 className="font-bold mb-2">¿Hacen envíos a toda Colombia?</h4>
                                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                                            Sí, realizamos envíos a todo el territorio nacional. Envío gratis en compras superiores a $100.000.
                                        </p>
                                    </div>
                                    <div>
                                        <h4 className="font-bold mb-2">¿Puedo visitar la tienda física?</h4>
                                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                                            ¡Por supuesto! Estamos ubicados en Bogotá. Te recomendamos agendar una cita para una atención personalizada.
                                        </p>
                                    </div>
                                    <div>
                                        <h4 className="font-bold mb-2">¿Ofrecen muestras de telas?</h4>
                                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                                            Sí, ofrecemos muestras de hasta 10x10 cm por un costo mínimo. Contáctanos para más información.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* Social Media */}
                <section className="bg-gray-50 dark:bg-slate-800 py-16">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <h2 className="text-3xl font-display font-bold mb-6">
                            Síguenos en Redes Sociales
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-8">
                            Mantente al día con nuestras últimas novedades, promociones y tendencias
                        </p>
                        <div className="flex justify-center gap-4">
                            {['Facebook', 'Instagram', 'Twitter', 'Pinterest'].map((social) => (
                                <motion.a
                                    key={social}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    href="#"
                                    className="w-14 h-14 rounded-full bg-gradient-to-br from-primary-600 to-accent-600 flex items-center justify-center text-white font-bold shadow-lg hover:shadow-xl transition-shadow"
                                >
                                    {social[0]}
                                </motion.a>
                            ))}
                        </div>
                    </div>
                </section>
            </AnimatedPage>

            <Footer />
        </div>
    );
}

export default Contact;
