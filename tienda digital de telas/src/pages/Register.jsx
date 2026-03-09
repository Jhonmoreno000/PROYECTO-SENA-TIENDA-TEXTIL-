import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiUser, FiArrowRight } from 'react-icons/fi';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';

function Register() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            alert("Las contraseñas no coinciden");
            return;
        }

        setIsLoading(true);
        const result = await register({ name: formData.name, email: formData.email, password: formData.password });
        setIsLoading(false);

        if (result.success) {
            navigate('/');
        }
    };

    return (
        <div className="min-h-screen flex flex-col">
            <Header />

            <main className="flex-1 flex items-center justify-center p-4 bg-gray-50 dark:bg-slate-900">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="card max-w-md w-full p-8"
                >
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-display font-bold mb-2">Crear Cuenta</h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Únete a D&D Textil y empieza a comprar
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block font-semibold mb-2">Nombre Completo</label>
                            <div className="relative">
                                <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="input-field pl-10"
                                    placeholder="Tu Nombre"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block font-semibold mb-2">Correo Electrónico</label>
                            <div className="relative">
                                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="input-field pl-10"
                                    placeholder="ejemplo@correo.com"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block font-semibold mb-2">Contraseña</label>
                            <div className="relative">
                                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="input-field pl-10"
                                    placeholder="******"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block font-semibold mb-2">Confirmar Contraseña</label>
                            <div className="relative">
                                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className="input-field pl-10"
                                    placeholder="******"
                                    required
                                />
                            </div>
                        </div>

                        <motion.button
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={isLoading}
                            className="btn-primary w-full flex items-center justify-center gap-2 mt-6 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Registrando...' : 'Registrarse'}
                            {!isLoading && <FiArrowRight />}
                        </motion.button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-gray-100 dark:border-slate-800 text-center">
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                            ¿Ya tienes una cuenta?
                        </p>
                        <Link to="/login" className="text-primary-600 font-bold hover:underline">
                            Iniciar Sesión
                        </Link>
                    </div>
                </motion.div>
            </main>

            <Footer />
        </div>
    );
}

export default Register;
