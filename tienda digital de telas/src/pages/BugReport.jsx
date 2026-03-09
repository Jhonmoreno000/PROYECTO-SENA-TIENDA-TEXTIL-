import React, { useState } from 'react';
import { FiAlertTriangle, FiSend, FiCheckCircle } from 'react-icons/fi';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useNotification } from '../context/NotificationContext';

function BugReport() {
    const { showNotification } = useNotification();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        steps: '',
        severity: 'low',
        type: 'bug'
    });
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();

        // Simulate API call
        setTimeout(() => {
            setSubmitted(true);
            showNotification('success', 'Reporte enviado correctamente');
            setFormData({
                title: '',
                description: '',
                steps: '',
                severity: 'low',
                type: 'bug'
            });
        }, 1000);
    };

    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1 section-container bg-gray-50 dark:bg-slate-900">
                <div className="max-w-2xl mx-auto">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-display font-bold mb-4">Reportar un Problema</h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            ¿Encontraste un error? Ayúdanos a mejorar reportándolo aquí.
                        </p>
                    </div>

                    <div className="card p-6 md:p-8">
                        {submitted ? (
                            <div className="text-center py-12">
                                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <FiCheckCircle className="w-8 h-8" />
                                </div>
                                <h2 className="text-2xl font-bold mb-2">¡Gracias por tu reporte!</h2>
                                <p className="text-gray-600 dark:text-gray-400 mb-6">
                                    Hemos recibido la información y nuestro equipo técnico la revisará pronto.
                                </p>
                                <button
                                    onClick={() => setSubmitted(false)}
                                    className="btn-outline"
                                >
                                    Enviar otro reporte
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block font-semibold mb-2">Título del Problema</label>
                                    <input
                                        type="text"
                                        className="input-field"
                                        placeholder="Ej: No puedo agregar productos al carrito"
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block font-semibold mb-2">Tipo</label>
                                        <select
                                            className="input-field"
                                            value={formData.type}
                                            onChange={e => setFormData({ ...formData, type: e.target.value })}
                                        >
                                            <option value="bug">Error / Bug</option>
                                            <option value="visual">Problema Visual</option>
                                            <option value="feature">Sugerencia</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block font-semibold mb-2">Severidad</label>
                                        <select
                                            className="input-field"
                                            value={formData.severity}
                                            onChange={e => setFormData({ ...formData, severity: e.target.value })}
                                        >
                                            <option value="low">Baja</option>
                                            <option value="medium">Media</option>
                                            <option value="high">Alta</option>
                                            <option value="critical">Crítica</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block font-semibold mb-2">Descripción Detallada</label>
                                    <textarea
                                        className="input-field resize-none"
                                        rows="4"
                                        placeholder="Describe qué pasó y qué esperabas que pasara..."
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        required
                                    ></textarea>
                                </div>

                                <div>
                                    <label className="block font-semibold mb-2">Pasos para Reproducir</label>
                                    <textarea
                                        className="input-field resize-none bg-gray-50 dark:bg-slate-800/50"
                                        rows="4"
                                        placeholder="1. Ir a la página X &#10;2. Hacer click en Y &#10;3. Ver el error Z"
                                        value={formData.steps}
                                        onChange={e => setFormData({ ...formData, steps: e.target.value })}
                                    ></textarea>
                                </div>

                                <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2">
                                    <FiSend /> Enviar Reporte
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}

export default BugReport;
