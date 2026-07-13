import React, { useState, useEffect } from 'react';
import { FileText, Download, Search, Calendar, DollarSign, User, RefreshCw } from 'lucide-react';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import AnimatedPage from '../../components/AnimatedPage';
import adminDashboardLinks from '../../data/adminDashboardLinks';
import { getApiUrl } from '../../config';
import { formatCurrency } from '../../utils/formatters';

function AdminInvoices() {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchInvoices = async () => {
        setLoading(true);
        try {
            const res = await fetch(getApiUrl('/api/invoices'));
            const data = await res.json();
            setInvoices(data);
        } catch (err) {
            console.error('Error fetching invoices:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInvoices();
    }, []);

    const handleDownload = async (orderId) => {
        try {
            const res = await fetch(getApiUrl(`/api/invoices/${orderId}`));
            if (!res.ok) {
                alert('Error al descargar la factura');
                return;
            }
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `FAC-${String(orderId).padStart(6, '0')}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Error downloading invoice:', err);
            alert('Error al descargar la factura');
        }
    };

    const filtered = invoices.filter(inv =>
        searchTerm === '' ||
        inv.orderId.toString().includes(searchTerm) ||
        (inv.clientName && inv.clientName.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <DashboardLayout title="Facturación Electrónica" links={adminDashboardLinks}>
            <AnimatedPage>
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <div>
                        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                            Facturas Electrónicas
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium">
                            Declaración DIAN — Descarga y administra facturas electrónicas.
                        </p>
                    </div>
                    <button
                        onClick={fetchInvoices}
                        className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-colors"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Actualizar
                    </button>
                </div>

                <div className="card p-4 mb-8">
                    <div className="relative">
                        <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Buscar por # de pedido o cliente..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 outline-none transition-all font-medium"
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="card p-16 text-center">
                        <RefreshCw className="w-10 h-10 text-gray-400 mx-auto mb-4 animate-spin" />
                        <p className="text-gray-500 font-medium">Cargando facturas...</p>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="card p-16 text-center flex flex-col items-center border-dashed border-2">
                        <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-6">
                            <FileText className="w-10 h-10 text-slate-300 dark:text-slate-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                            No hay facturas disponibles
                        </h3>
                        <p className="text-gray-500 font-medium">
                            {searchTerm
                                ? 'Intenta ajustando los filtros de búsqueda.'
                                : 'Aún no se han generado facturas electrónicas.'}
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto rounded-2xl border border-gray-200 dark:border-slate-700">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-100 dark:bg-slate-800 text-left">
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Factura</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Cliente</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Fecha</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Estado</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Total</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Acción</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                                {filtered.map((inv) => (
                                    <tr key={inv.orderId} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                                                    <FileText className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900 dark:text-white">
                                                        FAC-{String(inv.orderId).padStart(6, '0')}
                                                    </p>
                                                    <p className="text-xs text-gray-500"># Pedido: {inv.orderId}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <User className="w-4 h-4 text-gray-400" />
                                                <span className="font-medium text-gray-700 dark:text-gray-300">
                                                    {inv.clientName || 'N/A'}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-0.5">{inv.clientEmail || ''}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                                                <Calendar className="w-4 h-4" />
                                                <span className="font-medium">
                                                    {inv.date ? new Date(inv.date).toLocaleDateString('es-CO') : 'N/A'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider ${
                                                inv.status === 'delivered' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400' :
                                                inv.status === 'cancelled' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400' :
                                                'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400'
                                            }`}>
                                                {inv.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <DollarSign className="w-4 h-4 text-gray-400" />
                                                <span className="font-bold text-gray-900 dark:text-white">
                                                    {formatCurrency(inv.total)}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => handleDownload(inv.orderId)}
                                                className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-colors text-sm"
                                            >
                                                <Download className="w-4 h-4" />
                                                PDF
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </AnimatedPage>
        </DashboardLayout>
    );
}

export default AdminInvoices;
