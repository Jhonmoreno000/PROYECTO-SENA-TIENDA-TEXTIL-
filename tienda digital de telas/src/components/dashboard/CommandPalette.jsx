import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiArrowRight, FiCommand, FiCornerDownLeft } from 'react-icons/fi';

export default function CommandPalette({ isOpen, onClose, links = [] }) {
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef(null);
    const navigate = useNavigate();

    // Flatten links for searching
    const allLinks = React.useMemo(() => {
        const flat = [];
        links.forEach(item => {
            if (item.path) flat.push({ ...item, group: 'General' });
            if (item.children) {
                item.children.forEach(child => flat.push({ ...child, group: item.label }));
            }
        });
        return flat;
    }, [links]);

    const filteredLinks = React.useMemo(() => {
        if (!query) return allLinks.slice(0, 5); // Show top 5 when empty
        return allLinks.filter(link =>
            link.label.toLowerCase().includes(query.toLowerCase()) ||
            link.group.toLowerCase().includes(query.toLowerCase())
        );
    }, [query, allLinks]);

    useEffect(() => {
        if (isOpen) {
            setQuery('');
            setSelectedIndex(0);
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!isOpen) return;

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex(prev => (prev < filteredLinks.length - 1 ? prev + 1 : prev));
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex(prev => (prev > 0 ? prev - 1 : prev));
            } else if (e.key === 'Enter') {
                e.preventDefault();
                const selected = filteredLinks[selectedIndex];
                if (selected) {
                    navigate(selected.path);
                    onClose();
                }
            } else if (e.key === 'Escape') {
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, filteredLinks, selectedIndex, navigate, onClose]);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-start justify-center pt-20 sm:pt-32 px-4 shadow-2xl">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
                        onClick={onClose}
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -20 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-800 overflow-hidden"
                    >
                        <div className="flex items-center px-4 py-4 border-b border-gray-100 dark:border-slate-800">
                            <FiSearch className="w-5 h-5 text-gray-400 mr-3" />
                            <input
                                ref={inputRef}
                                type="text"
                                className="flex-1 bg-transparent border-0 outline-none text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-lg sm:text-base focus:ring-0"
                                placeholder="Buscar herramientas, ajustes o páginas..."
                                value={query}
                                onChange={(e) => {
                                    setQuery(e.target.value);
                                    setSelectedIndex(0);
                                }}
                            />
                            <div className="hidden sm:flex items-center gap-1.5 ml-4">
                                <kbd className="hidden sm:inline-flex px-2 py-1 items-center gap-1 font-sans text-xs font-semibold text-gray-500 bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-md">
                                    ESC
                                </kbd>
                            </div>
                        </div>

                        <div className="max-h-[60vh] overflow-y-auto overscroll-contain py-2 px-2 scrollbar-hide">
                            {filteredLinks.length === 0 ? (
                                <div className="py-12 px-6 text-center text-gray-500 dark:text-gray-400 text-sm">
                                    No encontramos resultados para "{query}"
                                </div>
                            ) : (
                                <div className="space-y-1">
                                    {filteredLinks.map((link, idx) => {
                                        const Icon = link.icon || FiArrowRight;
                                        const isSelected = idx === selectedIndex;

                                        return (
                                            <button
                                                key={`${link.path}-${idx}`}
                                                className={`w-full flex items-center justify-between px-4 py-3 text-left rounded-xl transition-colors duration-150 ${isSelected
                                                    ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
                                                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800/50'
                                                    }`}
                                                onClick={() => {
                                                    navigate(link.path);
                                                    onClose();
                                                }}
                                                onMouseEnter={() => setSelectedIndex(idx)}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-2 rounded-lg ${isSelected ? 'bg-primary-100 dark:bg-primary-900/50' : 'bg-gray-100 dark:bg-slate-800'}`}>
                                                        <Icon className={`w-4 h-4 ${isSelected ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400'}`} />
                                                    </div>
                                                    <div>
                                                        <span className="block font-medium">{link.label}</span>
                                                        <span className={`text-xs ${isSelected ? 'text-primary-600/70 dark:text-primary-400/70' : 'text-gray-500'}`}>{link.group}</span>
                                                    </div>
                                                </div>
                                                {isSelected && (
                                                    <FiCornerDownLeft className="w-4 h-4 text-primary-500" />
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        <div className="px-4 py-3 bg-gray-50 dark:bg-slate-800/50 border-t border-gray-100 dark:border-slate-800 flex items-center justify-end text-xs text-gray-500 dark:text-gray-400 gap-4">
                            <span className="flex items-center gap-1.5">
                                <span className="flex items-center gap-1">↑ ↓</span> para navegar
                            </span>
                            <span className="flex items-center gap-1.5">
                                <span className="inline-flex items-center justify-center p-1 rounded bg-gray-200 dark:bg-slate-700 font-mono leading-none text-[10px] w-5 h-5">↵</span> para seleccionar
                            </span>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
