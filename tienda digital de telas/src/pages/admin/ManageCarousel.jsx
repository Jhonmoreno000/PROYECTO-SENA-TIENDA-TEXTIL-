import React, { useState, useRef } from 'react';
import { Layers, Plus, Trash2, Save, Edit2, X, Image } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import BackButton from '../../components/dashboard/BackButton';
import { useNotification } from '../../context/NotificationContext';
import { useUI } from '../../context/UIContext';
import adminDashboardLinks from '../../data/adminDashboardLinks';

const glassCard = "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm rounded-2xl";
const glassInput = "bg-slate-50 dark:bg-slate-900  border border-slate-200 dark:border-slate-700 focus:border-[#f97316] rounded-xl text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#f97316]/20 transition-all placeholder-slate-400 w-full px-4 py-3 text-sm";

function ManageCarousel() {
    const { showNotification } = useNotification();
    const { carouselSlides, addSlide, removeSlide, updateSlide } = useUI();
    const [isEditing, setIsEditing] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [isAdding, setIsAdding] = useState(false);
    const [newSlide, setNewSlide] = useState({ title: '', subtitle: '', image: '' });
    
    const formRef = useRef(null);
    const containerRef = useRef(null);

    const handleNewImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) { const r = new FileReader(); r.onloadend = () => setNewSlide(p => ({ ...p, image: r.result })); r.readAsDataURL(file); }
    };
    const handleEditImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) { const r = new FileReader(); r.onloadend = () => setEditForm(p => ({ ...p, image: r.result })); r.readAsDataURL(file); }
    };
    const handleDelete = (id) => { if (confirm('¿Eliminar este slide?')) { removeSlide(id); showNotification('success', 'Slide eliminado'); } };
    const handleEditClick = (slide) => { setIsEditing(slide.id); setEditForm(slide); };
    const handleSaveEdit = () => { updateSlide(isEditing, editForm); setIsEditing(null); showNotification('success', 'Slide actualizado'); };
    const handleAddSlide = () => {
        if (!newSlide.title || !newSlide.image) { showNotification('error', 'Título e imagen son requeridos'); return; }
        addSlide(newSlide); setIsAdding(false); setNewSlide({ title: '', subtitle: '', image: '' }); showNotification('success', 'Slide agregado');
    };

    useGSAP(() => {
        if (isAdding) {
            gsap.fromTo(formRef.current, 
                { height: 0, opacity: 0 },
                { height: 'auto', opacity: 1, duration: 0.4, ease: "power2.out" }
            );
        } else {
            gsap.to(formRef.current, { height: 0, opacity: 0, duration: 0.3, ease: "power2.in" });
        }
    }, { scope: containerRef, dependencies: [isAdding] });

    return (
        <DashboardLayout title="" links={adminDashboardLinks}>
            <div ref={containerRef} className="-m-6 p-6 min-h-screen">
                <div className="relative z-10">
                    <BackButton />
                    <div className="mb-8 mt-4 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Gestión del Carrusel</h1>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 dark:text-slate-500 mt-2">Administra los slides del carrusel principal de la tienda.</p>
                        </div>
                        <button 
                            onClick={() => setIsAdding(!isAdding)}
                            className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-black transition-all shadow-lg hover:scale-105 active:scale-95 ${isAdding ? 'bg-slate-700 text-white' : 'bg-[#ea580c] text-white shadow-[0_4px_15px_rgba(234,88,12,0.3)]'}`}>
                            {isAdding ? <><X size={16} /> Cancelar</> : <><Plus size={16} /> Agregar Slide</>}
                        </button>
                    </div>

                    {/* Formulario nuevo slide */}
                    <div ref={formRef} className="overflow-hidden mb-6 h-0 opacity-0">
                        <div className={`${glassCard} p-6`}>
                            <h3 className="font-black text-slate-900 dark:text-white text-lg mb-5 flex items-center gap-2"><Layers size={18} className="text-[#f97316]" /> Nuevo Slide</h3>
                            <div className="grid sm:grid-cols-2 gap-4">
                                <input placeholder="Título del slide" className={glassInput} value={newSlide.title} onChange={e => setNewSlide(p => ({ ...p, title: e.target.value }))} />
                                <input placeholder="Subtítulo (opcional)" className={glassInput} value={newSlide.subtitle} onChange={e => setNewSlide(p => ({ ...p, subtitle: e.target.value }))} />
                            </div>
                            <div className="mt-4 mb-5">
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2"><Image size={13} /> Imagen del slide</label>
                                <input type="file" accept="image/*" onChange={handleNewImageUpload} className="w-full text-sm file:mr-4 file:py-2.5 file:px-5 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-orange-50 dark:bg-orange-500/10 file:text-[#ea580c] hover:file:bg-orange-100 transition-all cursor-pointer" />
                                {newSlide.image && <img src={newSlide.image} alt="preview" className="mt-4 h-32 w-full object-cover rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm" />}
                            </div>
                            <button onClick={handleAddSlide} className="w-full py-3.5 bg-[#ea580c] text-white rounded-2xl font-black text-sm shadow-[0_4px_15px_rgba(234,88,12,0.3)] hover:bg-[#c2410c] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                                <Save size={16} /> Guardar Slide
                            </button>
                        </div>
                    </div>

                    {/* Lista de slides */}
                    <div className={`${glassCard} overflow-hidden`}>
                        <div className="p-6 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                            <h2 className="font-black text-slate-900 dark:text-white text-xl">Slides Activos <span className="ml-2 text-sm font-bold text-slate-400 dark:text-slate-500">({carouselSlides.length})</span></h2>
                        </div>
                        <div className="divide-y divide-slate-200 dark:divide-slate-700">
                            {carouselSlides.map((slide) => (
                                <div key={slide.id} className="flex flex-col md:flex-row items-stretch group hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                                    {/* Imagen */}
                                    <div className="w-full md:w-52 h-36 relative overflow-hidden shrink-0">
                                        <img src={slide.image} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                        <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent" />
                                    </div>
                                    {/* Info / Form */}
                                    <div className="p-5 flex-1 flex flex-col justify-center">
                                        {isEditing === slide.id ? (
                                            <div className="space-y-3">
                                                <input className={glassInput} value={editForm.title} onChange={e => setEditForm(p => ({ ...p, title: e.target.value }))} placeholder="Título" />
                                                <input className={glassInput} value={editForm.subtitle} onChange={e => setEditForm(p => ({ ...p, subtitle: e.target.value }))} placeholder="Subtítulo" />
                                                <div>
                                                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 block">Cambiar Imagen:</label>
                                                    <input type="file" accept="image/*" onChange={handleEditImageUpload} className="w-full text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-slate-100 file:text-slate-700 dark:text-slate-300 hover:file:bg-slate-200 cursor-pointer" />
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <h3 className="font-black text-lg text-slate-900 dark:text-white group-hover:text-[#f97316] transition-colors">{slide.title}</h3>
                                                <p className="text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500 mt-1">{slide.subtitle}</p>
                                            </>
                                        )}
                                    </div>
                                    {/* Acciones */}
                                    <div className="flex md:flex-col items-center justify-end gap-2 p-4 border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-700/60 shrink-0">
                                        {isEditing === slide.id ? (
                                            <>
                                                <button onClick={handleSaveEdit} className="p-2.5 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:bg-emerald-500/10 rounded-xl transition-all border border-emerald-200 dark:border-emerald-500/20 hover:scale-110 active:scale-90" title="Guardar"><Save size={18} /></button>
                                                <button onClick={() => setIsEditing(null)} className="p-2.5 text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:bg-slate-500/10 rounded-xl transition-all border border-slate-200 dark:border-slate-700 hover:scale-110 active:scale-90" title="Cancelar"><X size={18} /></button>
                                            </>
                                        ) : (
                                            <>
                                                <button onClick={() => handleEditClick(slide)} className="p-2.5 text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:bg-indigo-500/10 rounded-xl transition-all border border-slate-200 dark:border-slate-700 hover:scale-110 active:scale-90" title="Editar"><Edit2 size={18} /></button>
                                                <button onClick={() => handleDelete(slide.id)} className="p-2.5 text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:bg-rose-500/10 rounded-xl transition-all border border-slate-200 dark:border-slate-700 hover:scale-110 active:scale-90" title="Eliminar"><Trash2 size={18} /></button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {carouselSlides.length === 0 && (
                                <div className="flex flex-col items-center justify-center py-24 text-center">
                                    <div className="w-20 h-20 bg-slate-50 dark:bg-slate-500/10 rounded-full flex items-center justify-center mb-4 border border-slate-200 dark:border-slate-700 shadow-inner"><Layers className="w-10 h-10 text-slate-300" /></div>
                                    <p className="font-bold text-slate-900 dark:text-white text-xl mb-2">Sin slides activos</p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500">Agrega el primer slide con el botón de arriba.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

export default ManageCarousel;

