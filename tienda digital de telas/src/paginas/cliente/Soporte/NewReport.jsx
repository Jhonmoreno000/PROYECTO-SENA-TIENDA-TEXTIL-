/**
 * NewReport.jsx — Formulario de "Nuevo Reporte" (Client)
 *
 * Permite a los clientes enviar un ticket de soporte sobre un pedido específico.
 */

import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

// Importación de íconos desde lucide-react
import { 
    AlertCircle,
    Camera,
    X,
    Send,
    Upload,
    Package,
    MessageSquare,
    Zap,
    HelpCircle,
    ChevronDown
} from 'lucide-react';

import LayoutPanel from '../../../componentes/layouts/LayoutPanel';
import PaginaAnimada from '../../../componentes/PaginaAnimada';
import enlacesCliente from '../../../datos/enlacesCliente';
import enlacesVendedor from '../../../datos/enlacesVendedor';
import enlacesAdmin from '../../../datos/enlacesAdmin';
import BackButton from '../../../componentes/dashboard/BackButton';
import { useMetricas } from '../../../contextos/ContextoMetricas';
import { useAutenticacion } from '../../../contextos/ContextoAutenticacion';
import { useNotificacion } from '../../../contextos/ContextoNotificacion';

const ISSUE_TYPES = [
    { value: 'stain', label: 'Manchas en la tela', priority: 'high' },
    { value: 'loose_threads', label: 'Hilos sueltos', priority: 'medium' },
    { value: 'wrong_color', label: 'Color incorrecto', priority: 'high' },
    { value: 'wrong_meters', label: 'Metraje incorrecto', priority: 'high' },
    { value: 'damaged', label: 'Tela dañada en transporte', priority: 'high' },
    { value: 'wrong_fabric', label: 'Tela equivocada', priority: 'high' },
    { value: 'quality', label: 'Calidad diferente a la esperada', priority: 'medium' },
    { value: 'delay', label: 'Retraso en la entrega / Despacho', priority: 'medium' },
    { value: 'payment', label: 'Inquietud con pago o facturación', priority: 'medium' },
    { value: 'other', label: 'Otro problema o consulta', priority: 'low' }
];

/**
 * Componente principal para la creación de nuevos reportes de soporte.
 * Maneja el estado local del formulario (fotos, descripción, tipo de problema)
 * y envía el reporte al contexto global (`ContextoMetricas`).
 * 
 * @component
 * @returns {JSX.Element} Interfaz del formulario de reporte.
 */
function NewReport() {
    const { orders, addSupportTicket } = useMetricas();
    const { user } = useAutenticacion();
    const { showNotification } = useNotificacion();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const preselectedOrderId = searchParams.get('orderId');

    const [selectedOrder, setSelectedOrder] = useState(preselectedOrderId || 'general');
    const [issueType, setIssueType] = useState('stain');
    const [description, setDescription] = useState('');
    const [photos, setPhotos] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isVendor = user?.role === 'vendedor' || user?.rol === 'vendedor';
    const isAdmin = user?.role === 'admin' || user?.rol === 'administrador';
    const panelLinks = isVendor ? enlacesVendedor : (isAdmin ? enlacesAdmin : enlacesCliente);
    const backTarget = isVendor ? '/vendedor' : (isAdmin ? '/admin' : '/cliente');

    // Pedidos disponibles del usuario o sistema
    const availableOrders = orders.filter(o =>
        String(o.clientId ?? o.idCliente) === String(user?.id) || isVendor || isAdmin
    );

    const handlePhotoUpload = (e) => {
        const files = Array.from(e.target.files);
        const newPhotos = files.map((file, idx) => ({
            id: `${Date.now()}-${idx}`,
            name: file.name,
            preview: URL.createObjectURL(file)
        }));
        setPhotos(prev => [...prev, ...newPhotos].slice(0, 5)); // Max 5 photos
    };

    const removePhoto = (photoId) => {
        setPhotos(prev => prev.filter(p => p.id !== photoId));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedOrder || !issueType || !description.trim()) {
            showNotification('warning', 'Por favor completa todos los campos obligatorios.');
            return;
        }

        setIsSubmitting(true);

        try {
            const issue = ISSUE_TYPES.find(t => t.value === issueType) || { label: 'Reporte de pedido', priority: 'medium' };
            const isGeneral = !selectedOrder || selectedOrder === 'general';
            const newTicket = {
                userId: user?.id,
                clientId: user?.id,
                customerName: user?.name || 'Cliente',
                clientName: user?.name || 'Cliente',
                customerEmail: user?.email || '',
                orderId: isGeneral ? null : parseInt(selectedOrder, 10),
                subject: isGeneral ? `[Soporte General] ${issue.label}` : `[Pedido #${selectedOrder}] ${issue.label}`,
                category: issueType,
                issueType: issueType,
                message: description,
                description: description,
                priority: issue.priority,
                status: 'open',
                photos: photos.map(p => p.preview)
            };

            await addSupportTicket(newTicket);
            showNotification('success', '¡Reporte enviado exitosamente! Te contactaremos pronto.');
            navigate('/cliente/soporte/tickets');
        } catch (err) {
            console.error('Error al enviar reporte:', err);
            showNotification('error', 'No se pudo enviar el reporte. Intenta nuevamente.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const selectedIssue = ISSUE_TYPES.find(t => t.value === issueType);

    return (
        <LayoutPanel title="Reportar un Problema" links={panelLinks}>
            <PaginaAnimada>
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <div>
                        <BackButton to={backTarget} label="Volver al Panel" />
                        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mt-4 tracking-tight flex items-center gap-3">
                            Abrir Ticket de Soporte
                            <span className="bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                                Asistencia
                            </span>
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium">
                            Cuéntanos qué pasó y te ayudaremos a resolverlo rápidamente.
                        </p>
                    </div>
                </div>

                <div className="max-w-3xl">
                    {/* ================================================================
                        ENCABEZADO INFORMATIVO
                    ================================================================ */}
                    <div className="card p-6 md:p-8 mb-8 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border border-orange-100 dark:border-orange-800/30 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <MessageSquare className="w-32 h-32 text-orange-600" />
                        </div>
                        <div className="flex items-start gap-5 relative z-10">
                            <div className="w-12 h-12 rounded-2xl bg-orange-100 dark:bg-orange-900/50 flex items-center justify-center flex-shrink-0 shadow-inner">
                                <AlertCircle className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                            </div>
                            <div>
                                <h3 className="font-extrabold text-xl text-orange-900 dark:text-orange-300 mb-2 tracking-tight">
                                    ¿Tuviste algún inconveniente?
                                </h3>
                                <p className="text-orange-800/80 dark:text-orange-200/80 font-medium leading-relaxed max-w-xl">
                                    Estamos aquí para respaldarte. Si tu tela presentó fallas, tu entrega se retrasó o tienes alguna consulta técnica, selecciona tu pedido o asunto y te responderemos en breve.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* ================================================================
                        FORMULARIO
                    ================================================================ */}
                    <form onSubmit={handleSubmit} className="card p-6 md:p-8 space-y-8">
                        
                        {/* Selección de Pedido */}
                        <div className="space-y-3">
                            <label className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                                <Package className="w-4 h-4 text-orange-500" />
                                1. Pedido o Asunto Afectado
                            </label>
                            <div className="relative">
                                <select
                                    value={selectedOrder}
                                    onChange={(e) => setSelectedOrder(e.target.value)}
                                    required
                                    className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 outline-none transition-all font-medium text-gray-900 dark:text-white appearance-none"
                                >
                                    <option value="general">Consulta general / Sin pedido específico</option>
                                    {availableOrders.map(order => (
                                        <option key={order.id} value={order.id}>
                                            Pedido #{String(order.id).padStart(4, '0')} — Estado: {order.status || 'Activo'} — {new Date(order.date).toLocaleDateString('es-CO')}
                                        </option>
                                    ))}
                                </select>
                                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none">
                                    <ChevronDown className="w-5 h-5 text-gray-400" />
                                </div>
                            </div>
                        </div>

                        {/* Tipo de Problema */}
                        <div className="space-y-3">
                            <label className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                                <HelpCircle className="w-4 h-4 text-orange-500" />
                                2. Tipo de Problema
                            </label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {ISSUE_TYPES.map(issue => (
                                    <button
                                        key={issue.value}
                                        type="button"
                                        onClick={() => setIssueType(issue.value)}
                                        className={`flex items-center justify-between p-4 rounded-xl text-left transition-all duration-300 border-2 ${
                                            issueType === issue.value
                                                ? 'bg-orange-50 border-orange-500 dark:bg-orange-900/20 dark:border-orange-500 shadow-sm'
                                                : 'bg-white border-slate-100 dark:bg-slate-800 dark:border-slate-700 hover:border-orange-300 dark:hover:border-slate-500'
                                        }`}
                                    >
                                        <span className={`font-bold ${issueType === issue.value ? 'text-orange-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                                            {issue.label}
                                        </span>
                                        <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                                            issue.priority === 'high'
                                                ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
                                                : issue.priority === 'medium'
                                                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                                    : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
                                        }`}>
                                            {issue.priority === 'high' ? 'Prioridad' : issue.priority === 'medium' ? 'Normal' : 'Menor'}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Descripción Detallada */}
                        <div className="space-y-3">
                            <label className="flex items-center justify-between text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                                <span className="flex items-center gap-2">
                                    <MessageSquare className="w-4 h-4 text-orange-500" />
                                    3. Detalles del Inconveniente
                                </span>
                                <span className="text-xs font-medium text-gray-400 normal-case">
                                    {description.length}/500 caracteres
                                </span>
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value.slice(0, 500))}
                                required
                                rows="5"
                                placeholder="Por favor, describe exactamente qué encontraste en la tela (ubicación de manchas, medidas exactas del faltante, etc.). Esto agilizará la resolución."
                                className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 outline-none transition-all font-medium resize-none text-gray-900 dark:text-white"
                            />
                        </div>

                        {/* Fotos */}
                        <div className="space-y-3">
                            <label className="flex items-center justify-between text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                                <span className="flex items-center gap-2">
                                    <Camera className="w-4 h-4 text-orange-500" />
                                    4. Evidencia Fotográfica (Opcional)
                                </span>
                                <span className="text-xs font-medium text-gray-400 normal-case">
                                    Máx. 5 fotos
                                </span>
                            </label>

                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                                {photos.map(photo => (
                                    <div key={photo.id} className="relative aspect-square group">
                                        <img
                                            src={photo.preview}
                                            alt={photo.name}
                                            className="w-full h-full object-cover rounded-xl shadow-sm border border-slate-200 dark:border-slate-700"
                                        />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                                            <button
                                                type="button"
                                                onClick={() => removePhoto(photo.id)}
                                                className="w-8 h-8 bg-rose-500 text-white rounded-full flex items-center justify-center hover:bg-rose-600 hover:scale-110 transition-all shadow-lg"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}

                                {photos.length < 5 && (
                                    <label className="aspect-square border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/10 hover:text-orange-500 transition-all text-slate-400 group bg-slate-50 dark:bg-slate-800/50">
                                        <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-700 flex items-center justify-center shadow-sm mb-2 group-hover:bg-orange-100 dark:group-hover:bg-orange-900/50 transition-colors">
                                            <Upload className="w-5 h-5" />
                                        </div>
                                        <span className="text-xs font-bold uppercase tracking-wider">Subir Foto</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            onChange={handlePhotoUpload}
                                            className="hidden"
                                        />
                                    </label>
                                )}
                            </div>
                        </div>

                        {/* Aviso de Prioridad */}
                        {selectedIssue && selectedIssue.priority === 'high' && (
                            <div className="p-4 bg-rose-50 dark:bg-rose-900/20 rounded-xl border border-rose-100 dark:border-rose-900/30 flex items-start gap-3">
                                <Zap className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
                                <p className="text-rose-800 dark:text-rose-200 text-sm font-medium leading-relaxed">
                                    <strong className="block font-bold mb-0.5 text-rose-900 dark:text-rose-100">Atención Prioritaria Activada:</strong> 
                                    Hemos clasificado este problema como urgente. Al enviar el reporte, tu caso pasará directamente a la parte superior de nuestra cola de revisión.
                                </p>
                            </div>
                        )}

                        {/* Botón de Envío */}
                        <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                            <button
                                type="submit"
                                disabled={isSubmitting || !selectedOrder || !issueType || !description.trim()}
                                className="w-full md:w-auto md:ml-auto flex items-center justify-center gap-3 px-8 py-4 bg-gray-900 text-white dark:bg-white dark:text-gray-900 rounded-xl font-bold hover:bg-gray-800 dark:hover:bg-gray-100 transition-all shadow-xl shadow-gray-900/10 dark:shadow-white/10 disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5 text-lg"
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                        Procesando...
                                    </>
                                ) : (
                                    <>
                                        Enviar Reporte a Soporte <Send className="w-5 h-5" />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </PaginaAnimada>
        </LayoutPanel>
    );
}

export default NewReport;
