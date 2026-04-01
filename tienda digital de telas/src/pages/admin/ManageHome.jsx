import React, { useState, useEffect } from 'react';
import { FiLayout, FiEye, FiEyeOff } from 'react-icons/fi';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import BackButton from '../../components/dashboard/BackButton';
import { useNotification } from '../../context/NotificationContext';
import adminDashboardLinks from '../../data/adminDashboardLinks';

function ManageHome() {
    const { showNotification } = useNotification();
    const [sections, setSections] = useState([
        { id: 'hero', name: 'Hero Section', visible: true, description: 'Banner principal y CTA' },
        { id: 'carousel', name: 'Carrusel de Promociones', visible: true, description: 'Slides destacados' },
        { id: 'featured', name: 'Productos Destacados', visible: true, description: 'Grid de mejores productos' },
        { id: 'benefits', name: 'Sección de Beneficios', visible: true, description: 'Iconos de confianza' },
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

    const toggleSection = async (id) => {
        const newSections = sections.map(s =>
            s.id === id ? { ...s, visible: !s.visible } : s
        );
        setSections(newSections);
        showNotification('success', 'Visibilidad actualizada');
        
        try {
            await fetch('http://localhost:8081/api/config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key: 'home_sections_config', value: JSON.stringify(newSections) })
            });
        } catch(e) {
            console.error('Error saving config', e);
        }
    };

    return (
        <DashboardLayout title="Gestionar Página de Inicio" links={adminDashboardLinks}>
            <BackButton />
            <div className="card p-6">
                <h2 className="text-xl font-bold mb-6">Visibilidad de Secciones</h2>
                <div className="space-y-4">
                    {sections.map(section => (
                        <div key={section.id} className="flex items-center justify-between p-4 border border-gray-100 dark:border-slate-700 rounded-none hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                            <div>
                                <h3 className="font-bold text-gray-900 dark:text-white">{section.name}</h3>
                                <p className="text-sm text-gray-500">{section.description}</p>
                            </div>
                            <div>
                                <button
                                    onClick={() => toggleSection(section.id)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-none font-bold transition-all ${section.visible
                                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                        : 'bg-gray-100 text-gray-500 dark:bg-slate-700 dark:text-gray-400'
                                        }`}
                                >
                                    {section.visible ? <><FiEye /> Visible</> : <><FiEyeOff /> Oculto</>}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </DashboardLayout>
    );
}

export default ManageHome;

