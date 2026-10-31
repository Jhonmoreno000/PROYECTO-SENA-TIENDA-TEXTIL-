import React, { useState, useEffect } from 'react';
import { ArrowLeft, Loader2 } from 'lucide-react';

// Correos internos que NUNCA deben aparecer pre-cargados ni usarse como cuenta personal del visitante
const CORREOS_EXCLUIDOS = [
    'daviidvp228@gmail.com',
    'dydtextil222medellin@gmail.com',
    'admin@ddtextil.com',
    'vendedor@ddtextil.com',
    'info@ddtextil.com',
    'ventas@ddtextil.com',
];

function obtenerClaveStorage(proveedor) {
    return proveedor === 'microsoft'
        ? 'ddtextil_microsoft_visitor_accounts'
        : 'ddtextil_google_visitor_accounts';
}

function obtenerCuentasVisitanteGuardadas(proveedor) {
    try {
        const raw = localStorage.getItem(obtenerClaveStorage(proveedor));
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return [];
        return parsed.filter(
            (acc) =>
                acc &&
                acc.email &&
                !CORREOS_EXCLUIDOS.includes(String(acc.email).trim().toLowerCase())
        );
    } catch {
        return [];
    }
}

function guardarCuentaVisitante(proveedor, cuenta) {
    try {
        const emailLimpio = String(cuenta.email || '').trim().toLowerCase();
        if (!emailLimpio || CORREOS_EXCLUIDOS.includes(emailLimpio)) return;
        const actuales = obtenerCuentasVisitanteGuardadas(proveedor).filter(
            (a) => String(a.email).trim().toLowerCase() !== emailLimpio
        );
        const nuevas = [{ email: emailLimpio, name: cuenta.name }, ...actuales].slice(0, 3);
        localStorage.setItem(obtenerClaveStorage(proveedor), JSON.stringify(nuevas));
    } catch {
        // Ignorar errores de almacenamiento local
    }
}

function ModalSSOCorreo({ isOpen, proveedor = 'google', onClose, onSuccess }) {
    const [vista, setVista] = useState('selector'); // 'selector' | 'formulario'
    const [email, setEmail] = useState('');
    const [nombre, setNombre] = useState('');
    const [error, setError] = useState('');
    const [cargando, setCargando] = useState(false);
    const [cuentasVisitante, setCuentasVisitante] = useState([]);

    const esGoogle = proveedor !== 'microsoft';
    const nombreProveedor = esGoogle ? 'Google' : 'Microsoft';

    useEffect(() => {
        if (isOpen) {
            setVista('selector');
            setEmail('');
            setNombre('');
            setError('');
            setCargando(false);
            setCuentasVisitante(obtenerCuentasVisitanteGuardadas(proveedor));
        }
    }, [isOpen, proveedor]);

    if (!isOpen) return null;

    const manejarSeleccionCuenta = async (cuenta) => {
        setError('');
        setCargando(true);
        try {
            await onSuccess({
                proveedor: esGoogle ? 'google' : 'microsoft',
                email: cuenta.email,
                nombre: cuenta.name,
                token: `${esGoogle ? 'google' : 'ms'}-oauth-token-${Date.now()}`,
            });
        } catch (err) {
            setError(err.message || `No se pudo completar el registro con ${nombreProveedor}.`);
            setCargando(false);
        }
    };

    const manejarEnvioFormulario = async (e) => {
        e.preventDefault();
        setError('');

        const correoLimpio = email.trim().toLowerCase();
        const nombreLimpio =
            nombre.trim() ||
            correoLimpio
                .split('@')[0]
                .replace(/[._-]+/g, ' ')
                .replace(/\b\w/g, (l) => l.toUpperCase());

        if (!correoLimpio || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correoLimpio)) {
            setError('Ingresa una dirección de correo electrónico válida.');
            return;
        }

        if (CORREOS_EXCLUIDOS.includes(correoLimpio)) {
            setError(
                'Por favor ingresa el correo de un nuevo usuario/cliente para registrarse (no uses el correo administrativo de la tienda ni el personal del propietario).'
            );
            return;
        }

        setCargando(true);
        try {
            guardarCuentaVisitante(proveedor, { email: correoLimpio, name: nombreLimpio });
            await onSuccess({
                proveedor: esGoogle ? 'google' : 'microsoft',
                email: correoLimpio,
                nombre: nombreLimpio,
                token: `${esGoogle ? 'google' : 'ms'}-oauth-token-${Date.now()}`,
            });
        } catch (err) {
            setError(err.message || `No se pudo completar el acceso con ${nombreProveedor}.`);
            setCargando(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#1e1f20] text-[#e3e3e3] px-4 py-6 select-none overflow-y-auto"
            style={{ fontFamily: "'Google Sans', 'Segoe UI', Roboto, Arial, sans-serif" }}
        >
            <div className="w-full max-w-[860px] flex flex-col">
                {/* Tarjeta Principal Oscura */}
                <div className="w-full bg-[#0e0e0e] rounded-[28px] border border-[#2c2c2c] shadow-[0_12px_40px_rgba(0,0,0,0.65)] overflow-hidden">
                    {/* Barra superior: Acceder con Google / Acceder con Microsoft */}
                    <div className="flex items-center justify-between px-7 py-4 border-b border-[#2b2b2b]">
                        <div className="flex items-center gap-3">
                            {esGoogle ? (
                                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                                    <path
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                        fill="#4285F4"
                                    />
                                    <path
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                        fill="#34A853"
                                    />
                                    <path
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                        fill="#FBBC05"
                                    />
                                    <path
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                        fill="#EA4335"
                                    />
                                </svg>
                            ) : (
                                <svg className="w-5 h-5 shrink-0" viewBox="0 0 23 23">
                                    <path fill="#f35325" d="M1 1h10v10H1z" />
                                    <path fill="#81bc06" d="M12 1h10v10H12z" />
                                    <path fill="#05a6f0" d="M1 12h10v10H1z" />
                                    <path fill="#ffba08" d="M12 12h10v10H12z" />
                                </svg>
                            )}
                            <span className="text-[14px] font-normal text-[#e3e3e3] tracking-normal">
                                Acceder con {nombreProveedor}
                            </span>
                        </div>

                        <button
                            type="button"
                            onClick={onClose}
                            className="text-xs text-[#9aa0a6] hover:text-white px-2.5 py-1 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                        >
                            Volver a D&amp;D Textil
                        </button>
                    </div>

                    {/* Contenido en 2 columnas como en la pantalla de selección de cuenta */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-8 sm:px-12 py-10 md:py-12 min-h-[370px]">
                        {/* Columna Izquierda: Ícono de la app + Elige una cuenta + Ir a D&D Textil */}
                        <div className="flex flex-col justify-start">
                            {/* Ícono de la marca */}
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-md mb-6 border border-orange-400/30">
                                <span className="text-white font-black text-lg tracking-tighter">
                                    D&amp;D
                                </span>
                            </div>

                            <h1 className="text-[32px] sm:text-[36px] font-normal text-[#e3e3e3] leading-[1.2] mb-3">
                                {vista === 'selector'
                                    ? 'Elige una cuenta'
                                    : `Registrarse con ${nombreProveedor}`}
                            </h1>

                            <p className="text-[16px] text-[#e3e3e3] font-normal">
                                Ir a{' '}
                                <span className="text-[#8ab4f8] font-medium hover:underline cursor-pointer">
                                    D&amp;D Textil
                                </span>
                            </p>
                        </div>

                        {/* Columna Derecha: Lista de opciones ("Usar otra cuenta") o Formulario de registro */}
                        <div className="flex flex-col justify-center">
                            {vista === 'selector' ? (
                                <div className="w-full">
                                    {/* Cuentas de visitantes registradas previamente (sin cuentas del dueño ni de la tienda) */}
                                    {cuentasVisitante.map((cuenta) => {
                                        const inicial = (cuenta.name || cuenta.email || 'U')
                                            .charAt(0)
                                            .toUpperCase();
                                        return (
                                            <button
                                                key={cuenta.email}
                                                type="button"
                                                disabled={cargando}
                                                onClick={() => manejarSeleccionCuenta(cuenta)}
                                                className="w-full flex items-center gap-3.5 py-3.5 px-2 border-b border-[#3c4043] hover:bg-[#1f1f1f] transition-colors text-left cursor-pointer rounded-t-lg"
                                            >
                                                <div
                                                    className={`w-8 h-8 rounded-full ${
                                                        esGoogle ? 'bg-[#c53929]' : 'bg-[#0078d4]'
                                                    } text-white flex items-center justify-center text-sm font-medium shrink-0`}
                                                >
                                                    {inicial}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-[14px] font-medium text-[#e3e3e3] truncate">
                                                        {cuenta.name}
                                                    </p>
                                                    <p className="text-[12px] text-[#9aa0a6] truncate">
                                                        {cuenta.email}
                                                    </p>
                                                </div>
                                            </button>
                                        );
                                    })}

                                    {/* Opción principal: Usar otra cuenta (para registrarse con cualquier cuenta) */}
                                    <button
                                        type="button"
                                        disabled={cargando}
                                        onClick={() => {
                                            setError('');
                                            setVista('formulario');
                                        }}
                                        className="w-full flex items-center gap-3.5 py-4 px-2 border-b border-[#3c4043] hover:bg-[#1f1f1f] transition-colors text-left cursor-pointer"
                                    >
                                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-[#e3e3e3] shrink-0">
                                            <svg
                                                className="w-5 h-5"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="1.8"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            >
                                                <circle cx="12" cy="12" r="10" />
                                                <circle cx="12" cy="10" r="3" />
                                                <path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662" />
                                            </svg>
                                        </div>
                                        <span className="text-[14px] font-medium text-[#e3e3e3]">
                                            Usar otra cuenta
                                        </span>
                                    </button>

                                    {error && (
                                        <p className="mt-3 text-xs text-[#f28b82]">{error}</p>
                                    )}

                                    {/* Texto legal inferior */}
                                    <p className="mt-8 text-[14px] leading-[1.45] text-[#9aa0a6]">
                                        Antes de usar D&amp;D Textil, revisa su{' '}
                                        <a
                                            href="/contacto"
                                            onClick={(e) => e.preventDefault()}
                                            className="text-[#8ab4f8] hover:underline font-medium"
                                        >
                                            Política de Privacidad
                                        </a>{' '}
                                        y{' '}
                                        <a
                                            href="/contacto"
                                            onClick={(e) => e.preventDefault()}
                                            className="text-[#8ab4f8] hover:underline font-medium"
                                        >
                                            Condiciones del Servicio
                                        </a>
                                        .
                                    </p>
                                </div>
                            ) : (
                                <form onSubmit={manejarEnvioFormulario} className="w-full space-y-4">
                                    <div>
                                        <label className="block text-xs text-[#9aa0a6] mb-1.5">
                                            Nombre completo (para tu registro en D&amp;D Textil)
                                        </label>
                                        <input
                                            type="text"
                                            value={nombre}
                                            onChange={(e) => setNombre(e.target.value)}
                                            placeholder="Ej. Camila Restrepo"
                                            autoFocus
                                            className="w-full px-3.5 py-3 rounded-lg bg-transparent border border-[#5f6368] focus:border-[#8ab4f8] text-[#e3e3e3] text-sm outline-none transition-colors"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs text-[#9aa0a6] mb-1.5">
                                            Correo electrónico de {nombreProveedor}
                                        </label>
                                        <input
                                            type="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder={
                                                esGoogle
                                                    ? 'tucorreo@gmail.com'
                                                    : 'tucorreo@outlook.com'
                                            }
                                            className="w-full px-3.5 py-3 rounded-lg bg-transparent border border-[#5f6368] focus:border-[#8ab4f8] text-[#e3e3e3] text-sm outline-none transition-colors"
                                        />
                                    </div>

                                    {error && (
                                        <p className="text-xs text-[#f28b82] leading-relaxed">
                                            {error}
                                        </p>
                                    )}

                                    <div className="flex items-center justify-between pt-3">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setError('');
                                                setVista('selector');
                                            }}
                                            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#8ab4f8] hover:bg-[#8ab4f8]/10 px-3 py-2 rounded-full transition-colors cursor-pointer"
                                        >
                                            <ArrowLeft className="w-4 h-4" />
                                            Atrás
                                        </button>

                                        <button
                                            type="submit"
                                            disabled={cargando}
                                            className="inline-flex items-center gap-2 bg-[#8ab4f8] hover:bg-[#aecbfa] text-[#202124] font-medium text-sm px-6 py-2.5 rounded-full transition-colors disabled:opacity-60 cursor-pointer"
                                        >
                                            {cargando ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                    <span>Registrando...</span>
                                                </>
                                            ) : (
                                                <span>Continuar</span>
                                            )}
                                        </button>
                                    </div>

                                    <p className="pt-3 text-[12px] leading-[1.45] text-[#9aa0a6]">
                                        Antes de usar D&amp;D Textil, revisa su{' '}
                                        <span className="text-[#8ab4f8]">Política de Privacidad</span>{' '}
                                        y{' '}
                                        <span className="text-[#8ab4f8]">
                                            Condiciones del Servicio
                                        </span>
                                        .
                                    </p>
                                </form>
                            )}
                        </div>
                    </div>
                </div>

                {/* Pie de página externo */}
                <div className="flex flex-wrap items-center justify-between gap-4 px-2 pt-4 text-[12px] text-[#e3e3e3]">
                    <div className="flex items-center gap-2 cursor-pointer hover:text-white">
                        <span>Español (Latinoamérica)</span>
                        <span className="text-[10px]">▼</span>
                    </div>
                    <div className="flex items-center gap-6 text-[#e3e3e3]">
                        <button
                            type="button"
                            onClick={onClose}
                            className="hover:underline cursor-pointer"
                        >
                            Ayuda
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="hover:underline cursor-pointer"
                        >
                            Privacidad
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="hover:underline cursor-pointer"
                        >
                            Condiciones
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ModalSSOCorreo;
