import React, { useState, useRef } from 'react';
import { Check, X, Eye, Filter, Package, Clock } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import DashboardLayout from '../../../components/layouts/DashboardLayout';
import BackButton from '../../../components/dashboard/BackButton';
import { useMetrics } from '../../../context/MetricsContext';
import { useProducts } from '../../../context/ProductContext';
import adminDashboardLinks from '../../../data/adminDashboardLinks';

const glassCard = "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm rounded-2xl";
const glassInput = "bg-slate-50 dark:bg-slate-900  border border-slate-200 dark:border-slate-700 focus:border-[#f97316] rounded-xl text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#f97316]/20 transition-all placeholder-slate-400";

function ApprovalQueue() {
    const { pendingProducts, approveProduct, rejectProduct } = useMetrics();
    const { refreshProducts } = useProducts();
    const [filterSeller, setFilterSeller] = useState('all');
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [rejectReason, setRejectReason] = useState('');
    const [showRejectModal, setShowRejectModal] = useState(null);
    
    const containerRef = useRef(null);
    const previewModalRef = useRef(null);
    const rejectModalRef = useRef(null);

    const pending = pendingProducts.filter(p => p.status === 'pending');
    const filteredProducts = filterSeller === 'all' ? pending : pending.filter(p => p.sellerName === filterSeller);
    const sellers = [...new Set(pendingProducts.map(p => p.sellerName))];

    const handleApprove = (productId) => { approveProduct(productId); refreshProducts(); };
    
    const closePreview = () => {
        gsap.to(previewModalRef.current, { 
            opacity: 0, scale: 0.9, duration: 0.3, 
            onComplete: () => setSelectedProduct(null) 
        });
    };

    const closeReject = () => {
        gsap.to(rejectModalRef.current, { 
            opacity: 0, scale: 0.9, duration: 0.3, 
            onComplete: () => { setShowRejectModal(null); setRejectReason(''); } 
        });
    };

    const handleReject = (productId) => {
        if (rejectReason.trim()) { 
            rejectProduct(productId, rejectReason); 
            closeReject();
        }
    };

    useGSAP(() => {
        if (filteredProducts.length > 0) {
            gsap.fromTo('.approval-card',
                { opacity: 0, y: 30, scale: 0.95 },
                { 
                    opacity: 1, y: 0, scale: 1, 
                    duration: 0.6, stagger: 0.08, 
                    ease: "power3.out" 
                }
            );
        }
    }, { scope: containerRef, dependencies: [filteredProducts.length] });

    useGSAP(() => {
        if (selectedProduct) {
            gsap.fromTo(previewModalRef.current,
                { opacity: 0, scale: 0.9, y: 20 },
                { opacity: 1, scale: 1, y: 0, duration: 0.4, ease: "back.out(1.2)" }
            );
        }
    }, { dependencies: [selectedProduct] });

    useGSAP(() => {
        if (showRejectModal) {
            gsap.fromTo(rejectModalRef.current,
                { opacity: 0, scale: 0.9, y: 20 },
                { opacity: 1, scale: 1, y: 0, duration: 0.4, ease: "back.out(1.2)" }
            );
        }
    }, { dependencies: [showRejectModal] });

    return (
        <DashboardLayout title="" links={adminDashboardLinks}>
            <div ref={containerRef} className="-m-6 p-6 min-h-screen">
                <div className="relative z-10">
                    <BackButton />
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mt-4 gap-4 mb-8">
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Cola de Aprobación</h1>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 dark:text-slate-500 mt-2">
                                Revisa y aprueba productos pendientes de los vendedores.
                                {pending.length > 0 && <span className="ml-2 font-black text-amber-600 dark:text-amber-400">{pending.length} pendiente{pending.length !== 1 ? 's' : ''}</span>}
                            </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                            <Filter size={16} className="text-slate-400 dark:text-slate-500" />
                            <select value={filterSeller} onChange={e => setFilterSeller(e.target.value)} className={`px-4 py-2.5 text-sm font-bold cursor-pointer ${glassInput}`}>
                                <option value="all">Todos los vendedores ({pending.length})</option>
                                {sellers.map(s => <option key={s} value={s}>{s} ({pendingProducts.filter(p => p.sellerName === s && p.status === 'pending').length})</option>)}
                            </select>
                        </div>
                    </div>

                    {filteredProducts.length === 0 ? (
                        <div className={`${glassCard} flex flex-col items-center justify-center py-32 px-4 text-center`}>
                            <div className="w-24 h-24 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 flex items-center justify-center mb-6 shadow-inner"><Check className="w-12 h-12 text-emerald-500" /></div>
                            <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">¡Todo al día!</h3>
                            <p className="text-slate-500 dark:text-slate-400 dark:text-slate-500 max-w-sm">No hay productos pendientes de aprobación.</p>
                        </div>
                    ) : (
                        <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
                            {filteredProducts.map(product => (
                                <div key={product.id} className={`approval-card ${glassCard} flex flex-col overflow-hidden group hover:-translate-y-1.5 transition-all duration-300`}>
                                    {/* Image */}
                                    <div className="relative overflow-hidden" style={{ height: '220px' }}>
                                        <img src={product.images?.[0] || '/placeholder.png'} alt={product.name} className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent" />
                                        <div className="absolute top-4 right-4">
                                            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/90  text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg">
                                                <Clock size={10} /> Pendiente
                                            </span>
                                        </div>
                                        <div className="absolute bottom-4 left-4">
                                            <p className="text-white font-black text-xl drop-shadow-lg">${(product.price / 1000).toFixed(0)}k<span className="text-xs font-normal opacity-80"> /m</span></p>
                                        </div>
                                    </div>

                                    {/* Info */}
                                    <div className="p-6 flex-1 flex flex-col">
                                        <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-1 group-hover:text-[#f97316] transition-colors">{product.name}</h3>
                                        <p className="text-[10px] font-bold text-[#f97316] bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20 px-2.5 py-1 rounded-xl mb-3 uppercase tracking-widest w-fit">{product.category}</p>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500 mb-5 line-clamp-2 leading-relaxed">{product.description}</p>

                                        <div className="flex items-center gap-3 mb-6 p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700">
                                            <div className="w-9 h-9 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-black text-sm shadow-sm">
                                                {product.sellerName?.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-900 dark:text-white">{product.sellerName}</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 dark:text-slate-500">Enviado: {new Date(product.submittedAt).toLocaleDateString('es-CO')}</p>
                                            </div>
                                        </div>

                                        <div className="mt-auto grid grid-cols-3 gap-2">
                                            <button onClick={() => setSelectedProduct(product)} className="flex items-center justify-center gap-1.5 py-3 bg-white border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:bg-slate-500/10 text-xs font-bold rounded-xl transition-all shadow-sm">
                                                <Eye size={14} /> Ver
                                            </button>
                                            <button onClick={() => handleApprove(product.id)} className="flex items-center justify-center gap-1.5 py-3 bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-black rounded-xl transition-all shadow-[0_4px_12px_rgba(16,185,129,0.3)] hover:scale-105 active:scale-95">
                                                <Check size={14} /> Aprobar
                                            </button>
                                            <button onClick={() => setShowRejectModal(product.id)} className="flex items-center justify-center gap-1.5 py-3 bg-rose-600 text-white hover:bg-rose-700 text-xs font-black rounded-xl transition-all shadow-[0_4px_12px_rgba(244,63,94,0.3)] hover:scale-105 active:scale-95">
                                                <X size={14} /> Rechazar
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Preview Modal */}
            {selectedProduct && (
                <div className="fixed inset-0 bg-slate-900/60  z-50 flex items-center justify-center p-4">
                    <div ref={previewModalRef} className="bg-white dark:bg-slate-800 backdrop-blur-3xl rounded-[2rem] shadow-2xl w-full max-w-2xl overflow-hidden border border-white max-h-[90vh] overflow-y-auto">
                        <div className="p-8">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-2xl font-black text-slate-900 dark:text-white">Vista Previa</h3>
                                <button onClick={closePreview} className="p-3 bg-white hover:bg-slate-50 dark:bg-slate-500/10 text-slate-400 dark:text-slate-500 hover:text-rose-500 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm transition-all"><X size={20} /></button>
                            </div>
                            <img src={selectedProduct.images[0]} alt={selectedProduct.name} className="w-full aspect-square object-cover rounded-2xl mb-6 shadow-lg" />
                            <h4 className="text-xl font-black text-slate-900 dark:text-white mb-1">{selectedProduct.name}</h4>
                            <p className="text-2xl font-black text-[#f97316] mb-4">${selectedProduct.price.toLocaleString('es-CO')}<span className="text-sm font-normal text-slate-400 dark:text-slate-500"> /m</span></p>
                            <p className="text-slate-600 dark:text-slate-400 dark:text-slate-500 mb-6 leading-relaxed">{selectedProduct.description}</p>
                            <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 mb-8">
                                <div className="w-10 h-10 rounded-full bg-[#f97316] flex items-center justify-center text-white font-black">{selectedProduct.sellerName?.charAt(0)}</div>
                                <div><p className="font-bold text-slate-900 dark:text-white">Vendedor: {selectedProduct.sellerName}</p><p className="text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500">Categoría: {selectedProduct.category}</p></div>
                            </div>
                            <div className="flex gap-4">
                                <button onClick={() => { handleApprove(selectedProduct.id); closePreview(); }} className="flex-1 px-6 py-4 bg-emerald-600 text-white rounded-2xl hover:bg-emerald-700 font-black transition-all shadow-[0_4px_15px_rgba(16,185,129,0.3)] flex items-center justify-center gap-2">
                                    <Check size={18} /> Aprobar Producto
                                </button>
                                <button onClick={() => { setShowRejectModal(selectedProduct.id); closePreview(); }} className="flex-1 px-6 py-4 bg-rose-600 text-white rounded-2xl hover:bg-rose-700 font-black transition-all shadow-[0_4px_15px_rgba(244,63,94,0.3)] flex items-center justify-center gap-2">
                                    <X size={18} /> Rechazar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Reject Modal */}
            {showRejectModal && (
                <div className="fixed inset-0 bg-slate-900/60  z-50 flex items-center justify-center p-4">
                    <div ref={rejectModalRef} className="bg-white dark:bg-slate-800 backdrop-blur-3xl rounded-[2rem] shadow-2xl w-full max-w-md border border-white p-8">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-14 h-14 rounded-full bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 flex items-center justify-center shadow-inner"><Package className="w-7 h-7 text-rose-500" /></div>
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white">Rechazar Producto</h3>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 dark:text-slate-500 mb-6 leading-relaxed">Especifica la razón del rechazo para que el vendedor pueda corregir el producto.</p>
                        <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="Ej: Las fotos no muestran claramente el producto..." className={`w-full px-4 py-3 mb-6 resize-none ${glassInput}`} rows="3" />
                        <div className="flex gap-4">
                            <button onClick={closeReject} className="flex-1 px-4 py-4 bg-white border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-2xl hover:bg-slate-50 dark:bg-slate-500/10 font-bold transition-all shadow-sm">Cancelar</button>
                            <button onClick={() => handleReject(showRejectModal)} disabled={!rejectReason.trim()} className="flex-1 px-4 py-4 bg-rose-600 text-white rounded-2xl hover:bg-rose-700 font-black transition-all disabled:opacity-30 shadow-[0_0_20px_rgba(239,68,68,0.3)] flex items-center justify-center gap-2">
                                <Check size={18} /> Confirmar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}

export default ApprovalQueue;

