import React, { useState } from 'react';
import { FiLayers, FiImage, FiPlus, FiTrash2, FiSave, FiEdit, FiX } from 'react-icons/fi';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import BackButton from '../../components/dashboard/BackButton';
import { useNotification } from '../../context/NotificationContext';
import { useUI } from '../../context/UIContext';
import adminDashboardLinks from '../../data/adminDashboardLinks';

function ManageCarousel() {
    const { showNotification } = useNotification();
    const { carouselSlides, addSlide, removeSlide, updateSlide } = useUI();
    const [isEditing, setIsEditing] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [isAdding, setIsAdding] = useState(false);
    const [newSlide, setNewSlide] = useState({ title: '', subtitle: '', image: '' });

    const handleNewImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setNewSlide({ ...newSlide, image: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleEditImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setEditForm({ ...editForm, image: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDelete = (id) => {
        if (confirm('¿Eliminar este slide?')) {
            removeSlide(id);
            showNotification('success', 'Slide eliminado');
        }
    };

    const handleEditClick = (slide) => {
        setIsEditing(slide.id);
        setEditForm(slide);
    };

    const handleSaveEdit = () => {
        updateSlide(isEditing, editForm);
        setIsEditing(null);
        showNotification('success', 'Slide actualizado');
    };

    const handleAddSlide = () => {
        if (!newSlide.title || !newSlide.image) {
            showNotification('error', 'Título e imagen son requeridos');
            return;
        }
        addSlide(newSlide);
        setIsAdding(false);
        setNewSlide({ title: '', subtitle: '', image: '' });
        showNotification('success', 'Slide agregado');
    };

    return (
        <DashboardLayout title="Gestión del Carrusel" links={adminDashboardLinks}>
            <BackButton />
            <div className="card mb-6 p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold">Slides Activos</h2>
                    <button onClick={() => setIsAdding(!isAdding)} className="btn-primary flex items-center gap-2">
                        {isAdding ? <FiX /> : <FiPlus />} {isAdding ? 'Cancelar' : 'Agregar Slide'}
                    </button>
                </div>

                {isAdding && (
                    <div className="mb-8 p-4 bg-gray-50 dark:bg-slate-800 rounded-none border border-primary-200">
                        <h3 className="font-bold mb-3">Nuevo Slide</h3>
                        <div className="grid gap-3">
                            <input
                                placeholder="Título"
                                className="input-field"
                                value={newSlide.title}
                                onChange={e => setNewSlide({ ...newSlide, title: e.target.value })}
                            />
                            <input
                                placeholder="Subtítulo"
                                className="input-field"
                                value={newSlide.subtitle}
                                onChange={e => setNewSlide({ ...newSlide, subtitle: e.target.value })}
                            />
                            <div className="text-xs font-semibold text-gray-500 mt-2">Imagen del Slide:</div>
                            <input
                                type="file"
                                accept="image/*"
                                className="w-full text-xs file:mr-4 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                                onChange={handleNewImageUpload}
                            />
                            <button onClick={handleAddSlide} className="btn-primary w-full mt-2">Guardar Nuevo Slide</button>
                        </div>
                    </div>
                )}

                <div className="space-y-4">
                    {carouselSlides.map((slide) => (
                        <div key={slide.id} className="border border-gray-200 dark:border-slate-700 rounded-none overflow-hidden flex flex-col md:flex-row">
                            <div className="w-full md:w-48 h-32 relative group shrink-0">
                                <img src={slide.image} alt="" className="w-full h-full object-cover" />
                            </div>

                            <div className="p-4 flex-1 flex flex-col justify-center">
                                {isEditing === slide.id ? (
                                    <div className="space-y-2">
                                        <input
                                            className="input-field py-1"
                                            value={editForm.title}
                                            onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                                            placeholder="Título"
                                        />
                                        <input
                                            className="input-field py-1"
                                            value={editForm.subtitle}
                                            onChange={e => setEditForm({ ...editForm, subtitle: e.target.value })}
                                            placeholder="Subtítulo"
                                        />
                                        <div className="text-xs font-semibold text-gray-500 mt-2">Cambiar Imagen:</div>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="w-full text-xs file:mr-4 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                                            onChange={handleEditImageUpload}
                                        />
                                    </div>
                                ) : (
                                    <>
                                        <h3 className="font-bold text-lg text-gray-900 dark:text-white">{slide.title}</h3>
                                        <p className="text-gray-500">{slide.subtitle}</p>
                                    </>
                                )}
                            </div>

                            <div className="p-4 flex items-center gap-2 border-t md:border-t-0 md:border-l border-gray-100 dark:border-slate-700">
                                {isEditing === slide.id ? (
                                    <>
                                        <button onClick={handleSaveEdit} className="p-2 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-none" title="Guardar">
                                            <FiSave className="w-5 h-5" />
                                        </button>
                                        <button onClick={() => setIsEditing(null)} className="p-2 text-gray-500 hover:bg-gray-50 rounded-none" title="Cancelar">
                                            <FiX className="w-5 h-5" />
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button onClick={() => handleEditClick(slide)} className="p-2 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-none" title="Editar">
                                            <FiEdit className="w-5 h-5" />
                                        </button>
                                        <button onClick={() => handleDelete(slide.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-none" title="Eliminar">
                                            <FiTrash2 className="w-5 h-5" />
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </DashboardLayout>
    );
}

export default ManageCarousel;

