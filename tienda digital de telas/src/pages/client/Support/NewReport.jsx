import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FiAlertCircle, FiCamera, FiX, FiCheck, FiSend, FiUpload, FiPackage } from 'react-icons/fi';
import DashboardLayout from '../../../components/layouts/DashboardLayout';
import clientDashboardLinks from '../../../data/clientDashboardLinks';
import BackButton from '../../../components/dashboard/BackButton';
import { useMetrics } from '../../../context/MetricsContext';
import { useAuth } from '../../../context/AuthContext';

const ISSUE_TYPES = [
    { value: 'stain', label: '🩹 Manchas en la tela', priority: 'high' },
    { value: 'loose_threads', label: '🧵 Hilos sueltos', priority: 'medium' },
    { value: 'wrong_color', label: '🎨 Color incorrecto', priority: 'high' },
    { value: 'wrong_meters', label: '📏 Metraje incorrecto', priority: 'high' },
    { value: 'damaged', label: '📦 Tela dañada en transporte', priority: 'high' },
    { value: 'wrong_fabric', label: '❌ Tela equivocada', priority: 'high' },
    { value: 'quality', label: '⭐ Calidad diferente a la esperada', priority: 'medium' },
    { value: 'other', label: '💬 Otro problema', priority: 'low' }
];

function NewReport() {
    const { orders, addSupportTicket } = useMetrics();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const preselectedOrderId = searchParams.get('orderId');

    const [selectedOrder, setSelectedOrder] = useState(preselectedOrderId || '');
    const [issueType, setIssueType] = useState('');
    const [description, setDescription] = useState('');
    const [photos, setPhotos] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    

    // Filter delivered orders (only those can have issues reported)
    const deliveredOrders = orders.filter(o =>
        o.status === 'delivered' &&
        (o.clientId === user?.id || true) // Show all for demo
    );

    const handlePhotoUpload = (e) => {
        const files = Array.from(e.target.files);
        const newPhotos = files.map(file => ({
            id: Date.now() + Math.random(),
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
            alert('Por favor completa todos los campos requeridos');
            return;
        }

        setIsSubmitting(true);

        // Simulate API call
        setTimeout(() => {
            const issue = ISSUE_TYPES.find(t => t.value === issueType);
            const newTicket = {
                id: Date.now(),
                clientId: user?.id || 1,
                clientName: user?.name || 'Cliente',
                orderId: parseInt(selectedOrder),
                subject: issue.label,
                issueType: issueType,
                description: description,
                priority: issue.priority,
                status: 'open',
                photos: photos.map(p => p.preview),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                responses: []
            };

            // addSupportTicket(newTicket);
            console.log('New ticket:', newTicket);

            setIsSubmitting(false);
            alert('¡Reporte enviado! Te contactaremos pronto.');
            navigate('/cliente/soporte/tickets');
        }, 1500);
    };

    const selectedIssue = ISSUE_TYPES.find(t => t.value === issueType);

    return (
        <DashboardLayout title="Reportar un Problema" links={clientDashboardLinks}>
            <BackButton to="/cliente" label="Volver a Mi Panel" />
            <div className="max-w-3xl mx-auto">
                {/* Header Info */}
                <div className="card p-6 mb-6 bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-full">
                            <FiAlertCircle className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                                ¿Tuviste un problema con tu pedido?
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 mt-1">
                                Lamentamos los inconvenientes. Cuéntanos qué pasó y te ayudaremos a
                                resolverlo lo antes posible. Nuestro equipo responde en menos de 24 horas.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Report Form */}
                <form onSubmit={handleSubmit} className="card p-6">
                    {/* Order Selection */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            <FiPackage className="inline w-4 h-4 mr-2" />
                            Selecciona el pedido con el problema *
                        </label>
                        <select
                            value={selectedOrder}
                            onChange={(e) => setSelectedOrder(e.target.value)}
                            required
                            className="w-full px-4 py-3 border rounded-lg dark:bg-slate-800 dark:border-slate-700 text-lg"
                        >
                            <option value="">Selecciona un pedido...</option>
                            {deliveredOrders.map(order => (
                                <option key={order.id} value={order.id}>
                                    Pedido #{order.id} - {new Date(order.date).toLocaleDateString('es-CO')} - ${(order.total / 1000).toFixed(0)}k
                                </option>
                            ))}
                        </select>
                        {deliveredOrders.length === 0 && (
                            <p className="text-sm text-gray-500 mt-2">
                                Solo puedes reportar problemas en pedidos ya entregados
                            </p>
                        )}
                    </div>

                    {/* Issue Type */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                            ¿Qué tipo de problema tuviste? *
                        </label>
                        <div className="grid md:grid-cols-2 gap-3">
                            {ISSUE_TYPES.map(issue => (
                                <button
                                    key={issue.value}
                                    type="button"
                                    onClick={() => setIssueType(issue.value)}
                                    className={`p-4 rounded-lg text-left transition-all ${issueType === issue.value
                                            ? 'bg-primary-100 dark:bg-primary-900/30 ring-2 ring-primary-500'
                                            : 'bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700'
                                        }`}
                                >
                                    <span className="text-lg">{issue.label}</span>
                                    <span className={`ml-2 px-2 py-0.5 rounded text-xs ${issue.priority === 'high'
                                            ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                            : issue.priority === 'medium'
                                                ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                                : 'bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-gray-400'
                                        }`}>
                                        {issue.priority === 'high' ? 'Urgente' : issue.priority === 'medium' ? 'Normal' : 'Bajo'}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Description */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Describe el problema con detalle *
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                            rows="5"
                            placeholder="Cuéntanos qué pasó. Entre más detalles nos des, más rápido podremos ayudarte. Por ejemplo: 'La tela llegó con una mancha café de aproximadamente 10cm en una esquina...'"
                            className="w-full px-4 py-3 border rounded-lg dark:bg-slate-800 dark:border-slate-700"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            {description.length}/500 caracteres
                        </p>
                    </div>

                    {/* Photo Upload */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Sube fotos del problema (opcional, máx. 5)
                        </label>

                        <div className="grid grid-cols-5 gap-3 mb-3">
                            {photos.map(photo => (
                                <div key={photo.id} className="relative aspect-square">
                                    <img
                                        src={photo.preview}
                                        alt={photo.name}
                                        className="w-full h-full object-cover rounded-lg"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removePhoto(photo.id)}
                                        className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                                    >
                                        <FiX className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}

                            {photos.length < 5 && (
                                <label className="aspect-square border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors">
                                    <FiUpload className="w-6 h-6 text-gray-400" />
                                    <span className="text-xs text-gray-500 mt-1">Subir</span>
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

                        <p className="text-xs text-gray-500">
                            Las fotos ayudan a resolver tu caso más rápido
                        </p>
                    </div>

                    {/* Priority Info */}
                    {selectedIssue && selectedIssue.priority === 'high' && (
                        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                            <p className="text-red-800 dark:text-red-200 text-sm">
                                <strong>⚡ Caso prioritario:</strong> Este tipo de problema se tratará con
                                urgencia. Recibirás una respuesta en las próximas horas.
                            </p>
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isSubmitting || !selectedOrder || !issueType || !description.trim()}
                        className="w-full flex items-center justify-center gap-2 py-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Enviando reporte...
                            </>
                        ) : (
                            <>
                                <FiSend className="w-5 h-5" />
                                Enviar Reporte
                            </>
                        )}
                    </button>
                </form>
            </div>
        </DashboardLayout>
    );
}

export default NewReport;
