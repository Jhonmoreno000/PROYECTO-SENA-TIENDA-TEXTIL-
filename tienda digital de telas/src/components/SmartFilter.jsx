/**
 * SmartFilter.jsx — Selector de "Uso Sugerido" Inteligente y Moods
 *
 * Migrado de framer-motion a CSS nativo.
 */

import React from 'react';
import { Sparkles, Armchair, Shirt } from 'lucide-react';

const MOODS = [
    { id: 'Todos', label: 'Todo el Catálogo', icon: <Sparkles size={20} />, theme: 'bg-transparent', textColor: 'text-gray-900 dark:text-white', ringColor: 'ring-gray-200 dark:ring-white/10' },
    { id: 'Gala', label: 'Vestidos de Gala', icon: <Sparkles size={20} />, theme: 'bg-rose-50/50 dark:bg-rose-950/20', textColor: 'text-rose-700 dark:text-rose-300', ringColor: 'ring-rose-200 dark:ring-rose-900/50' },
    { id: 'Exterior', label: 'Muebles de Exterior', icon: <Armchair size={20} />, theme: 'bg-emerald-50/50 dark:bg-emerald-950/20', textColor: 'text-emerald-700 dark:text-emerald-300', ringColor: 'ring-emerald-200 dark:ring-emerald-900/50' },
    { id: 'Verano', label: 'Moda de Verano', icon: <Shirt size={20} />, theme: 'bg-amber-50/50 dark:bg-amber-950/20', textColor: 'text-amber-700 dark:text-amber-300', ringColor: 'ring-amber-200 dark:ring-amber-900/50' },
];

export default function SmartFilter({ activeCategory, onCategoryChange, onMoodChange }) {
    
    const handleSelect = (mood) => {
        onCategoryChange(mood.id);
        if (onMoodChange) onMoodChange(mood.theme);
    };

    return (
        <div className="mb-10">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4 text-lg">¿Qué estás imaginando crear?</h3>
            <div className="flex flex-wrap gap-4">
                {MOODS.map((mood) => {
                    const isActive = activeCategory === mood.id;
                    
                    return (
                        <button
                            key={mood.id}
                            onClick={() => handleSelect(mood)}
                            className={`relative flex items-center gap-3 px-6 py-4 rounded-2xl font-medium transition-all duration-500 overflow-hidden hover:scale-105 active:scale-95 ${
                                isActive 
                                    ? `bg-white dark:bg-slate-800 shadow-[0_8px_30px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)] ring-2 ${mood.ringColor} ${mood.textColor}` 
                                    : 'bg-gray-50 dark:bg-slate-800/50 text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-slate-800 hover:shadow-md'
                            }`}
                        >
                            {isActive && (
                                <div className={`absolute inset-0 opacity-10 ${mood.theme} rounded-2xl transition-all duration-500`} />
                            )}
                            
                            <span className="relative z-10">{mood.icon}</span>
                            <span className="relative z-10">{mood.label}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
