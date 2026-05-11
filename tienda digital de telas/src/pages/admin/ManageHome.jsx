import React, { useState, useEffect, useRef } from 'react';
import { Eye, EyeOff, Layout, Layers, Star, Gift, CheckCircle } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import BackButton from '../../components/dashboard/BackButton';
import { useNotification } from '../../context/NotificationContext';
import adminDashboardLinks from '../../data/adminDashboardLinks';

const glassCard = "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm rounded-2xl";

const SECTION_ICONS = {
    hero:     { icon: Layout,  color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/20' },
    carousel: { icon: Layers,  color: 'text-[#f97316]',  bg: 'bg-orange-50 dark:bg-orange-500/10 border-orange-200 dark:border-orange-500/20' },
    featured: { icon: Star,    color: 'text-amber-600 dark:text-amber-400',  bg: 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20' },
    benefits: { icon: Gift,    color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20' },
};

function ManageHome() {
    const { showNotification } = useNotification();
    const [sections, setSections] = useState([
        { id: 'hero',     name: 'Hero Section',              visible: true, description: 'Banner principal y CTA de la tienda' },
        { id: 'carousel', name: 'Carrusel de Promociones',   visible: true, description: 'Slides destacados con ofertas activas' },
        { id: 'featured', name: 'Productos Destacados',      visible: true, description: 'Grid de los mejores productos del catálogo' },
        { id: 'benefits', name: 'Sección de Beneficios',     visible: true, description: 'Iconos de confianza y propuestas de valor' },
    ]);
    
    const containerRef = useRef(null);
    const footerRef = useRef(null);

    useEffect(() => {
        const local = localStorage.getItem('home_sections_config');
        if (local) { try { setSections(JSON.parse(local)); } catch (e) {} }
        fetch('http://localhost:8081/api/config/home_sections_config')
            .then(r => r.ok ? r.text() : null)
            .then(text => {
                if (text && text !== '{}') { const p = JSON.parse(text); setSections(p); localStorage.setItem('home_sections_config', JSON.stringify(p)); }
            }).catch(() => {});
    }, []);

    useGSAP(() => {
        gsap.fromTo('.section-item', 
            { opacity: 0, y: 16 }, 
            { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: "power2.out" }
        );
        gsap.fromTo(footerRef.current, 
            { opacity: 0 }, 
            { opacity: 1, duration: 0.5, delay: 0.5 }
        );
    }, { scope: containerRef });

    const toggleSection = async (id) => {
        const updated = sections.map(s => s.id === id ? { ...s, visible: !s.visible } : s);
        setSections(updated);
        localStorage.setItem('home_sections_config', JSON.stringify(updated));
        showNotification('success', 'Visibilidad actualizada');
        try {
            await fetch('http://localhost:8081/api/config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key: 'home_sections_config', value: JSON.stringify(updated) })
            });
        } catch (e) {}
    };

    const visibleCount = sections.filter(s => s.visible).length;

    return (
        <DashboardLayout title="" links={adminDashboardLinks}>
            <div ref={containerRef} className="-m-6 p-6 min-h-screen">
                <div className="relative z-10">
                    <BackButton />
                    <div className="mb-8 mt-4">
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Gestionar Página de Inicio</h1>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 dark:text-slate-500 mt-2">
                            Controla la visibilidad de cada sección · <span className="font-black text-emerald-600 dark:text-emerald-400">{visibleCount}/{sections.length}</span> secciones activas
                        </p>
                    </div>

                    <div className="space-y-4">
                        {sections.map((section) => {
                            const meta = SECTION_ICONS[section.id] || SECTION_ICONS.hero;
                            const Icon = meta.icon;
                            return (
                                <div key={section.id} 
                                    className={`section-item ${glassCard} flex items-center gap-5 p-6 transition-all ${!section.visible ? 'opacity-50 grayscale' : 'hover:shadow-xl hover:-translate-y-0.5'}`}>
                                    {/* Icono */}
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border ${meta.bg} ${meta.color} shadow-sm`}>
                                        <Icon size={26} />
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-black text-slate-900 dark:text-white text-lg leading-none">{section.name}</h3>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500 mt-1.5 font-medium">{section.description}</p>
                                    </div>

                                    {/* Estado badge */}
                                    <div className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-widest border ${section.visible ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20' : 'bg-slate-50 dark:bg-slate-500/10 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-700'}`}>
                                        <div className={`w-1.5 h-1.5 rounded-full ${section.visible ? 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.9)]' : 'bg-slate-400'}`} />
                                        {section.visible ? 'Visible' : 'Oculto'}
                                    </div>

                                    {/* Toggle */}
                                    <button 
                                        onClick={() => toggleSection(section.id)}
                                        className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-sm transition-all border-2 shrink-0 hover:scale-105 active:scale-95 ${section.visible
                                            ? 'border-rose-200 text-rose-600 dark:text-rose-400 bg-white hover:bg-rose-600 hover:text-white hover:border-rose-600'
                                            : 'border-emerald-200 text-emerald-600 dark:text-emerald-400 bg-white hover:bg-emerald-600 hover:text-white hover:border-emerald-600'
                                        }`}>
                                        {section.visible ? <><EyeOff size={16} /> Ocultar</> : <><Eye size={16} /> Mostrar</>}
                                    </button>
                                </div>
                            );
                        })}
                    </div>

                    {/* Info footer */}
                    <div ref={footerRef} className={`${glassCard} p-5 mt-6 flex items-center gap-4 border-indigo-200 dark:border-indigo-500/20`}>
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 flex items-center justify-center shrink-0"><CheckCircle className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /></div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 dark:text-slate-500 font-medium leading-relaxed">
                            Los cambios se aplican <strong className="text-slate-900 dark:text-white">de inmediato</strong> en la tienda. Se guardan localmente en el navegador y se sincronizan con el servidor automáticamente.
                        </p>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

export default ManageHome;

