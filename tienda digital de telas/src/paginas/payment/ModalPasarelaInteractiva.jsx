import React, { useState, useEffect } from 'react';
import {
    ShieldCheck,
    Lock,
    CheckCircle2,
    Loader2,
    Smartphone,
    Building2,
    CreditCard,
    DollarSign,
    X,
    Copy,
    Check,
    QrCode,
    Wallet,
    Banknote,
} from 'lucide-react';
import { formatCurrency } from '../../utilidades/formateadores';

const CONFIG_PASARELAS = {
    wompi: {
        nombre: 'Wompi Bancolombia',
        subtitulo: 'Sandbox API v1 • Cifrado SHA-256',
        colorHeader: 'from-[#002a8d] via-[#1c4ed8] to-[#0ea5e9]',
        acento: 'bg-[#00c389] hover:bg-[#00a876] text-slate-950',
        prefijoTx: 'WOMPI-SBX-',
        metodosInternos: [
            { id: 'nequi_wompi', label: 'Nequi Push', desc: 'Notificación al celular', icon: Smartphone },
            { id: 'bancolombia_transfer', label: 'Botón Bancolombia', desc: 'Ahorros o Corriente', icon: Building2 },
            { id: 'pse_wompi', label: 'PSE Todos los Bancos', desc: 'Débito inmediato ACH', icon: DollarSign },
            { id: 'card_wompi', label: 'Tarjeta Crédito / Débito', desc: 'Visa, Mastercard, Amex', icon: CreditCard },
        ],
    },
    mercadopago: {
        nombre: 'Mercado Pago Checkout Pro',
        subtitulo: 'API Sandbox Developers • Compra Protegida',
        colorHeader: 'from-[#009ee3] to-[#007eb5]',
        acento: 'bg-[#009ee3] hover:bg-[#008ACA] text-white',
        prefijoTx: 'MP-COL-',
        metodosInternos: [
            { id: 'mp_wallet', label: 'Dinero en Mercado Pago', desc: 'Aprobación instantánea', icon: Wallet },
            { id: 'mp_card', label: 'Tarjeta hasta 12 cuotas', desc: 'Visa, Mastercard, Codensa', icon: CreditCard },
            { id: 'mp_pse', label: 'Transferencia PSE', desc: 'Todos los bancos en Colombia', icon: Building2 },
            { id: 'mp_efecty', label: 'Efecty sin comisión', desc: 'Con código de convenio', icon: Banknote },
        ],
    },
    epayco: {
        nombre: 'ePayco / PayU Colombia',
        subtitulo: 'Pasarela Multicaja & Efectivo Nacional',
        colorHeader: 'from-[#ff5a00] to-[#e04800]',
        acento: 'bg-[#ff5a00] hover:bg-[#e04800] text-white',
        prefijoTx: 'EPAYCO-CO-',
        metodosInternos: [
            { id: 'efecty_pin', label: 'Efecty / Baloto', desc: 'Convenio 110452 sin costo extra', icon: Banknote },
            { id: 'gana_antioquia', label: 'Gana (Antioquia) / SuRed', desc: 'Puntos físicos en Medellín', icon: Building2 },
            { id: 'epayco_pse', label: 'PSE / Daviplata', desc: 'Confirmación en línea', icon: Smartphone },
            { id: 'epayco_card', label: 'Tarjetas / SafetyPay', desc: 'Nacionales e internacionales', icon: CreditCard },
        ],
    },
};

function ModalPasarelaInteractiva({
    isOpen,
    gateway = 'wompi',
    orderInfo,
    onClose,
    onSuccess,
}) {
    const config = CONFIG_PASARELAS[gateway] || CONFIG_PASARELAS.wompi;
    const [metodoElegido, setMetodoElegido] = useState(config.metodosInternos[0].id);
    const [celularNequi, setCelularNequi] = useState(orderInfo?.customerInfo?.phone || '3027058951');
    const [bancoPse, setBancoPse] = useState('Bancolombia');
    const [etapa, setEtapa] = useState('seleccion'); // 'seleccion' | 'procesando' | 'aprobado'
    const [copiado, setCopiado] = useState(false);
    const [txId, setTxId] = useState('');

    useEffect(() => {
        if (isOpen) {
            const cfg = CONFIG_PASARELAS[gateway] || CONFIG_PASARELAS.wompi;
            setMetodoElegido(cfg.metodosInternos[0].id);
            setEtapa('seleccion');
            setTxId(`${cfg.prefijoTx}${Math.floor(100000 + Math.random() * 900000)}`);
        }
    }, [isOpen, gateway]);

    if (!isOpen || !orderInfo) return null;

    const copiarTexto = (texto) => {
        navigator.clipboard?.writeText(texto);
        setCopiado(true);
        setTimeout(() => setCopiado(false), 2000);
    };

    const confirmarPagoSandbox = () => {
        setEtapa('procesando');
        const metodoObj = config.metodosInternos.find((m) => m.id === metodoElegido);
        const etiquetaMetodo = `${config.nombre} (${metodoObj?.label || 'Online'})`;

        setTimeout(() => {
            setEtapa('aprobado');
            setTimeout(() => {
                onSuccess({
                    transactionId: txId,
                    reference: orderInfo.reference,
                    paymentMethod: etiquetaMetodo,
                    status: 'APPROVED',
                });
            }, 1100);
        }, 1400);
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/75 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-gray-200 dark:border-slate-700 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Encabezado de la pasarela */}
                <div className={`bg-gradient-to-r ${config.colorHeader} text-white px-6 py-5 flex items-center justify-between`}>
                    <div>
                        <div className="flex items-center gap-2">
                            <Lock className="w-4 h-4 text-white/90" />
                            <h3 className="text-lg font-bold tracking-tight">{config.nombre}</h3>
                        </div>
                        <p className="text-xs text-white/80 mt-0.5">{config.subtitulo}</p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={etapa !== 'seleccion'}
                        className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Resumen del comercio y monto */}
                <div className="px-6 py-4 bg-gray-50 dark:bg-slate-800/80 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                            Comercio Verificado
                        </p>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">
                            D&amp;D Textil Medellín • Ref: <span className="font-mono text-primary-600 dark:text-primary-400">{orderInfo.reference}</span>
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Total a pagar</p>
                        <p className="text-xl font-black text-gray-900 dark:text-white">
                            {formatCurrency(orderInfo.total)}
                        </p>
                    </div>
                </div>

                {/* Cuerpo del modal */}
                <div className="p-6">
                    {etapa === 'seleccion' && (
                        <div className="space-y-5">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2.5">
                                    Selecciona el medio dentro de {config.nombre}:
                                </label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                    {config.metodosInternos.map((m) => {
                                        const Icon = m.icon;
                                        const activo = metodoElegido === m.id;
                                        return (
                                            <button
                                                key={m.id}
                                                type="button"
                                                onClick={() => setMetodoElegido(m.id)}
                                                className={`flex items-start gap-3 p-3 rounded-xl border-2 text-left transition-all cursor-pointer ${
                                                    activo
                                                        ? 'border-primary-600 bg-primary-50/50 dark:bg-primary-900/20 shadow-sm'
                                                        : 'border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600'
                                                }`}
                                            >
                                                <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                                                    <Icon className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-xs font-bold text-gray-900 dark:text-white leading-snug">
                                                        {m.label}
                                                    </p>
                                                    <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                                                        {m.desc}
                                                    </p>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Campos contextuales rápidos según opción */}
                            {(metodoElegido.includes('nequi') || metodoElegido.includes('mp_wallet')) && (
                                <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 space-y-2">
                                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                                        Celular vinculado para notificación Push / OTP:
                                    </label>
                                    <input
                                        type="tel"
                                        value={celularNequi}
                                        onChange={(e) => setCelularNequi(e.target.value)}
                                        placeholder="302 705 8951"
                                        className="w-full px-3.5 py-2 rounded-lg bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-600 text-sm text-gray-900 dark:text-white outline-none focus:border-primary-500"
                                    />
                                    <p className="text-[11px] text-gray-500">
                                        Modo Sandbox activo: la aprobación se simula instantáneamente sin descontar saldo real.
                                    </p>
                                </div>
                            )}

                            {(metodoElegido.includes('pse') || metodoElegido.includes('bancolombia')) && (
                                <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 space-y-2">
                                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                                        Entidad financiera (Sandbox ACH Colombia):
                                    </label>
                                    <select
                                        value={bancoPse}
                                        onChange={(e) => setBancoPse(e.target.value)}
                                        className="w-full px-3.5 py-2 rounded-lg bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-600 text-sm text-gray-900 dark:text-white outline-none focus:border-primary-500"
                                    >
                                        <option value="Bancolombia">Bancolombia</option>
                                        <option value="Nequi">Nequi</option>
                                        <option value="Davivienda">Banco Davivienda</option>
                                        <option value="Daviplata">Daviplata</option>
                                        <option value="Banco de Bogotá">Banco de Bogotá</option>
                                        <option value="BBVA Colombia">BBVA Colombia</option>
                                        <option value="Nu Colombia">Nu Colombia</option>
                                        <option value="Lulo Bank">Lulo Bank</option>
                                    </select>
                                </div>
                            )}

                            {(metodoElegido.includes('efecty') || metodoElegido.includes('gana')) && (
                                <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 flex items-center justify-between gap-3">
                                    <div>
                                        <p className="text-xs font-bold text-amber-900 dark:text-amber-300">
                                            Convenio Efectivo #110452 • Referencia: {orderInfo.reference}
                                        </p>
                                        <p className="text-[11px] text-amber-700 dark:text-amber-400">
                                            Puedes aprobar el pago en modo prueba ahora mismo o copiar el convenio.
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => copiarTexto(`Convenio 110452 - Ref: ${orderInfo.reference}`)}
                                        className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-amber-300 text-xs font-semibold text-amber-800 dark:text-amber-300 inline-flex items-center gap-1 shrink-0 cursor-pointer"
                                    >
                                        {copiado ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                        <span>{copiado ? 'Copiado' : 'Copiar'}</span>
                                    </button>
                                </div>
                            )}

                            {/* Firma criptográfica y botón de pago */}
                            <div className="pt-2">
                                <button
                                    type="button"
                                    onClick={confirmarPagoSandbox}
                                    className={`w-full py-3.5 px-6 rounded-xl font-bold text-sm shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${config.acento}`}
                                >
                                    <ShieldCheck className="w-5 h-5" />
                                    <span>
                                        Aprobar y Pagar {formatCurrency(orderInfo.total)} ({config.nombre})
                                    </span>
                                </button>
                                <p className="text-[11px] text-center text-gray-400 mt-2.5 font-mono truncate">
                                    Firma SHA-256: {orderInfo.integritySignature?.slice(0, 36)}...
                                </p>
                            </div>
                        </div>
                    )}

                    {etapa === 'procesando' && (
                        <div className="py-10 text-center space-y-4">
                            <Loader2 className="w-12 h-12 text-primary-600 animate-spin mx-auto" />
                            <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                                Validando transacción con {config.nombre}...
                            </h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xs mx-auto">
                                Verificando firma de integridad SHA-256 y registrando el pedido #{orderInfo.reference}
                            </p>
                        </div>
                    )}

                    {etapa === 'aprobado' && (
                        <div className="py-8 text-center space-y-3">
                            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                                <CheckCircle2 className="w-10 h-10" />
                            </div>
                            <h4 className="text-xl font-bold text-gray-900 dark:text-white">
                                ¡Transacción Aprobada!
                            </h4>
                            <p className="text-xs font-mono text-gray-500">
                                ID Transacción: {txId}
                            </p>
                            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                                Redirigiendo a tu comprobante de pedido...
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ModalPasarelaInteractiva;

