import React, { useState, useRef, useEffect, useCallback } from 'react';
import gsap from 'gsap';
import { X, Shirt, Armchair, Blinds, ShoppingCart } from 'lucide-react';
import { EASES, DURATIONS, microPress, microRelease } from '../utils/animations';

const QUICK_PROJECTS = {
    shirt: {
        id: 'shirt', name: 'Camisa Verano', icon: <Shirt size={32} strokeWidth={1.5} />,
        fields: [{ id: 'size', label: 'Talla (S/M/L/XL)', type: 'text', placeholder: 'M' }],
        calculate: (inputs) => { const s = (inputs.size || 'M').toUpperCase(); return ['XL','XXL'].includes(s) ? 2.0 : 1.5; }
    },
    cushion: {
        id: 'cushion', name: 'Cojines/Muebles', icon: <Armchair size={32} strokeWidth={1.5} />,
        fields: [{ id: 'quantity', label: 'Cantidad de Cojines', type: 'number', placeholder: '4' }],
        calculate: (inputs) => (parseInt(inputs.quantity) || 1) * 0.5
    },
    curtain: {
        id: 'curtain', name: 'Cortinas', icon: <Blinds size={32} strokeWidth={1.5} />,
        fields: [
            { id: 'width', label: 'Ancho Ventana (cm)', type: 'number', placeholder: '150' },
            { id: 'height', label: 'Alto Ventana (cm)', type: 'number', placeholder: '200' }
        ],
        calculate: (inputs) => {
            const w = parseFloat(inputs.width) || 150, h = parseFloat(inputs.height) || 200;
            return Math.ceil((w * 1.5) / 150) * ((h + 30) / 100);
        }
    }
};

export default function CalculatorModal({ isOpen, onClose, onAddToCart }) {
    const [selectedProject, setSelectedProject] = useState(null);
    const [inputs, setInputs] = useState({});
    const [calculatedMeters, setCalculatedMeters] = useState(null);
    const overlayRef = useRef(null);
    const modalRef = useRef(null);

    const handleClose = useCallback(() => {
        const tl = gsap.timeline({
            onComplete: () => { setSelectedProject(null); setInputs({}); setCalculatedMeters(null); onClose(); }
        });
        if (modalRef.current) tl.to(modalRef.current, { opacity: 0, y: 40, scale: 0.95, duration: DURATIONS.fast, ease: EASES.smoothIn }, 0);
        if (overlayRef.current) tl.to(overlayRef.current, { opacity: 0, duration: DURATIONS.fast }, 0);
    }, [onClose]);

    useEffect(() => {
        if (!isOpen) return;
        if (overlayRef.current) gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: DURATIONS.normal });
        if (modalRef.current) gsap.fromTo(modalRef.current,
            { opacity: 0, y: 60, scale: 0.97 },
            { opacity: 1, y: 0, scale: 1, duration: DURATIONS.slow, ease: EASES.spring }
        );
    }, [isOpen]);

    const handleCalculate = () => {
        if (!selectedProject) return;
        const result = QUICK_PROJECTS[selectedProject].calculate(inputs);
        setCalculatedMeters(Math.ceil((result * 1.1) * 10) / 10);
    };

    const handleProjClick = (id) => {
        setSelectedProject(id);
        setInputs({});
    };

    if (!isOpen) return null;

    return (
        <>
            <div ref={overlayRef} onClick={handleClose} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]" />
            <div ref={modalRef} className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-lg bg-white dark:bg-slate-900 rounded-t-3xl shadow-2xl p-6 sm:p-8 z-[101] border border-gray-100 dark:border-white/10 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">¿Cuánta tela necesitas?</h2>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">Elige tu proyecto y nosotros hacemos la matemática por ti.</p>
                    </div>
                    <button onClick={handleClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-all duration-200 -mr-2 -mt-2">
                        <X size={20} className="text-gray-400" />
                    </button>
                </div>

                {!calculatedMeters ? (
                    <div className="space-y-6">
                        <div className="grid grid-cols-3 gap-3">
                            {Object.values(QUICK_PROJECTS).map((proj) => (
                                <button key={proj.id} onClick={() => handleProjClick(proj.id)}
                                    onMouseDown={(e) => microPress(e.currentTarget)}
                                    onMouseUp={(e) => microRelease(e.currentTarget)}
                                    className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-200 ${
                                        selectedProject === proj.id
                                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 scale-[1.02]'
                                        : 'border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-slate-800 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600'}`}>
                                    <div className="mb-2">{proj.icon}</div>
                                    <span className="text-xs font-semibold text-center leading-tight">{proj.name}</span>
                                </button>
                            ))}
                        </div>
                        {selectedProject && (
                            <div className="space-y-4">
                                <div className="h-px w-full bg-gray-100 dark:bg-white/5" />
                                {QUICK_PROJECTS[selectedProject].fields.map((field) => (
                                    <div key={field.id}>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{field.label}</label>
                                        <input type={field.type} placeholder={field.placeholder} value={inputs[field.id] || ''} onChange={(e) => setInputs({ ...inputs, [field.id]: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all dark:text-white" />
                                    </div>
                                ))}
                                <button onClick={handleCalculate}
                                    onMouseDown={(e) => microPress(e.currentTarget)}
                                    onMouseUp={(e) => microRelease(e.currentTarget)}
                                    className="w-full mt-4 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-semibold hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors">Calcular Total</button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="text-center py-6">
                        <div className="text-sm font-medium text-primary-600 dark:text-primary-400 mb-2 uppercase tracking-wide">Recomendación Segura</div>
                        <div className="text-6xl font-bold text-gray-900 dark:text-white mb-2">{calculatedMeters}<span className="text-2xl text-gray-400 ml-1">m</span></div>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">Incluye un 10% adicional de margen.</p>
                        <div className="flex gap-3">
                            <button onClick={() => setCalculatedMeters(null)}
                                onMouseDown={(e) => microPress(e.currentTarget)}
                                onMouseUp={(e) => microRelease(e.currentTarget)}
                                className="flex-1 py-3 px-4 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors">Recalcular</button>
                            <button onClick={() => { onAddToCart(calculatedMeters); handleClose(); }}
                                onMouseDown={(e) => microPress(e.currentTarget)}
                                onMouseUp={(e) => microRelease(e.currentTarget)}
                                className="flex-[2] flex items-center justify-center gap-2 py-3 px-4 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-colors shadow-lg shadow-primary-500/30">
                                <ShoppingCart size={18} /> Agregar {calculatedMeters}m
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
