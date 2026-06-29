import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Scissors,
    Info,
    Shirt,
    Layout,
    Square,
    Box,
    Calculator,
    ArrowRight,
    CircleDashed,
    ArrowDownToLine,
} from 'lucide-react';

import DashboardLayout from '../../../components/layouts/DashboardLayout';
import AnimatedPage from '../../../components/AnimatedPage';
import clientDashboardLinks from '../../../data/clientDashboardLinks';
import BackButton from '../../../components/dashboard/BackButton';
import { formatCurrency } from '../../../utils/formatters';

const PROJECTS = {
    skirt_circular: {
        name: 'Falda Circular',
        icon: <CircleDashed className="w-6 h-6" />,
        fields: ['waist', 'length'],
        calculate: (measures, fabricWidth) => {
            const radius = measures.waist / (2 * Math.PI);
            const totalRadius = radius + measures.length;
            const diameter = totalRadius * 2;
            const panels = Math.ceil(diameter / (fabricWidth * 100));
            return panels * (diameter / 100) * 1.1; // 10% extra
        },
        description: 'Una falda circular requiere tela suficiente para cortar un círculo completo.'
    },
    skirt_straight: {
        name: 'Falda Recta',
        icon: <ArrowDownToLine className="w-6 h-6" />,
        fields: ['waist', 'hip', 'length'],
        calculate: (measures, fabricWidth) => {
            const widthNeeded = (measures.hip + 10) / 100; // hip + ease
            const panels = Math.ceil(widthNeeded / fabricWidth);
            return panels * (measures.length / 100) * 1.15;
        },
        description: 'Para una falda recta se necesita menos tela que una circular.'
    },
    curtains: {
        name: 'Cortinas',
        icon: <Layout className="w-6 h-6" />,
        fields: ['windowWidth', 'windowHeight', 'fullness'],
        calculate: (measures, fabricWidth) => {
            const fullnessMultiplier = measures.fullness === 'double' ? 2 : measures.fullness === 'triple' ? 3 : 1.5;
            const totalWidth = (measures.windowWidth / 100) * fullnessMultiplier;
            const panels = Math.ceil(totalWidth / fabricWidth);
            const heightWithHem = (measures.windowHeight + 30) / 100; // 30cm extra for hems
            return panels * heightWithHem;
        },
        description: 'Las cortinas necesitan fruncido para caer con buen drapeado.'
    },
    tablecloth: {
        name: 'Mantel',
        icon: <Square className="w-6 h-6" />,
        fields: ['tableLength', 'tableWidth', 'overhang'],
        calculate: (measures, fabricWidth) => {
            const totalLength = (measures.tableLength + (measures.overhang * 2)) / 100;
            const totalWidth = (measures.tableWidth + (measures.overhang * 2)) / 100;
            if (totalWidth <= fabricWidth) {
                return totalLength * 1.1;
            }
            return totalLength * Math.ceil(totalWidth / fabricWidth) * 1.1;
        },
        description: 'Incluye la caída del mantel a los lados de la mesa.'
    },
    cushion: {
        name: 'Cojines',
        icon: <Box className="w-6 h-6" />,
        fields: ['cushionSize', 'quantity'],
        calculate: (measures, fabricWidth) => {
            const sizeWithSeam = (measures.cushionSize + 3) / 100; // 3cm seam allowance
            const piecesPerWidth = Math.floor(fabricWidth / sizeWithSeam);
            const rowsNeeded = Math.ceil((measures.quantity * 2) / piecesPerWidth);
            return rowsNeeded * sizeWithSeam * 1.1;
        },
        description: 'Cada cojín necesita 2 piezas de tela (frente y reverso).'
    },
    dress_simple: {
        name: 'Vestido Sencillo',
        icon: <Shirt className="w-6 h-6" />,
        fields: ['bust', 'dressLength'],
        calculate: (measures, fabricWidth) => {
            const bodyWidth = (measures.bust + 20) / 100; // ease
            const panels = Math.ceil(bodyWidth / fabricWidth);
            return panels * (measures.dressLength / 100) * 1.25;
        },
        description: 'Un vestido sencillo sin mucho vuelo o detalles complicados.'
    }
};

const FABRIC_WIDTHS = [
    { value: 1.10, label: '1.10m (Algodón común)' },
    { value: 1.40, label: '1.40m (Telas decorativas)' },
    { value: 1.50, label: '1.50m (Estándar)' },
    { value: 2.80, label: '2.80m (Cortinas/Sábanas)' },
    { value: 3.00, label: '3.00m (Extra ancho)' },
];

function ProjectCalculator() {
    const [selectedProject, setSelectedProject] = useState('skirt_circular');
    const [fabricWidth, setFabricWidth] = useState(1.50);
    const [fabricPrice, setFabricPrice] = useState(45000);
    const [measures, setMeasures] = useState({});
    const [result, setResult] = useState(null);

    const project = PROJECTS[selectedProject];

    const fieldLabels = {
        waist: { label: 'Cintura', unit: 'cm', placeholder: '70' },
        hip: { label: 'Cadera', unit: 'cm', placeholder: '100' },
        length: { label: 'Largo deseado', unit: 'cm', placeholder: '60' },
        windowWidth: { label: 'Ancho ventana', unit: 'cm', placeholder: '150' },
        windowHeight: { label: 'Alto ventana', unit: 'cm', placeholder: '200' },
        fullness: {
            label: 'Tipo de fruncido', type: 'select', options: [
                { value: 'simple', label: 'Simple (1.5x)' },
                { value: 'double', label: 'Doble (2x)' },
                { value: 'triple', label: 'Triple (3x)' }
            ]
        },
        tableLength: { label: 'Largo mesa', unit: 'cm', placeholder: '180' },
        tableWidth: { label: 'Ancho mesa', unit: 'cm', placeholder: '90' },
        overhang: { label: 'Caída deseada', unit: 'cm', placeholder: '30' },
        cushionSize: { label: 'Tamaño cojín', unit: 'cm', placeholder: '45' },
        quantity: { label: 'Cantidad de cojines', unit: 'uds', placeholder: '4' },
        bust: { label: 'Contorno busto', unit: 'cm', placeholder: '90' },
        dressLength: { label: 'Largo vestido', unit: 'cm', placeholder: '100' }
    };

    const handleMeasureChange = (field, value) => {
        setMeasures(prev => ({ ...prev, [field]: parseFloat(value) || 0 }));
    };

    const calculateFabric = () => {
        const allFieldsFilled = project.fields.every(f => measures[f]);
        if (!allFieldsFilled) {
            alert('Por favor completa todas las medidas obligatorias.');
            return;
        }

        const meters = project.calculate(measures, fabricWidth);
        const recommended = Math.ceil(meters * 10) / 10; // Round up to nearest 0.1m
        const cost = recommended * fabricPrice;

        setResult({
            exact: meters.toFixed(2),
            recommended,
            cost,
            fabricWidth
        });
    };

    const handleProjectChange = (projectKey) => {
        setSelectedProject(projectKey);
        setMeasures({});
        setResult(null);
    };

    return (
        <DashboardLayout title="Calculadora de Metraje" links={clientDashboardLinks}>
            <AnimatedPage>
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <div>
                        <BackButton to="/cliente" label="Volver a Mi Panel" />
                        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mt-4 tracking-tight flex items-center gap-3">
                            Calculadora de Proyectos
                            <span className="bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                                Herramienta
                            </span>
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium">
                            Calcula exactamente cuánta tela necesitas para evitar desperdicios.
                        </p>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* ================================================================
                        SELECCIÓN DE PROYECTO
                    ================================================================ */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="card p-6 border-t-4 border-violet-500">
                            <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                                <Calculator className="w-5 h-5 text-violet-500" />
                                ¿Qué vas a hacer?
                            </h3>
                            <div className="space-y-3">
                                {Object.entries(PROJECTS).map(([key, proj]) => (
                                    <button
                                        key={key}
                                        onClick={() => handleProjectChange(key)}
                                        className={`w-full flex items-center gap-4 p-4 rounded-xl text-left transition-all duration-300 ${
                                            selectedProject === key
                                                ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/30 -translate-y-1'
                                                : 'bg-slate-50 text-gray-700 hover:bg-violet-50 dark:bg-slate-800/50 dark:text-gray-300 dark:hover:bg-slate-800'
                                        }`}
                                    >
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                            selectedProject === key
                                                ? 'bg-white/20'
                                                : 'bg-white dark:bg-slate-700 shadow-sm text-violet-500'
                                        }`}>
                                            {proj.icon}
                                        </div>
                                        <span className="font-bold">{proj.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* ================================================================
                        FORMULARIO DE CÁLCULO
                    ================================================================ */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="card p-6 md:p-8">
                            <div className="mb-8 pb-6 border-b border-gray-100 dark:border-slate-800">
                                <h3 className="font-black text-2xl text-gray-900 dark:text-white tracking-tight">
                                    {project.name}
                                </h3>
                                <p className="text-gray-500 font-medium mt-1 leading-relaxed">
                                    {project.description}
                                </p>
                            </div>

                            {/* Configuraciones Base de Tela */}
                            <div className="grid md:grid-cols-2 gap-6 mb-8 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                        Ancho de la tela
                                    </label>
                                    <select
                                        value={fabricWidth}
                                        onChange={(e) => setFabricWidth(parseFloat(e.target.value))}
                                        className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 outline-none transition-all font-medium"
                                    >
                                        {FABRIC_WIDTHS.map(fw => (
                                            <option key={fw.value} value={fw.value}>{fw.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                        Precio por metro (opcional)
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                                        <input
                                            type="number"
                                            value={fabricPrice}
                                            onChange={(e) => setFabricPrice(parseFloat(e.target.value) || 0)}
                                            className="w-full pl-8 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 outline-none transition-all font-medium"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Campos de Medidas */}
                            <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <Scissors className="w-5 h-5 text-violet-500" />
                                Ingresa tus medidas
                            </h4>
                            <div className="grid md:grid-cols-2 gap-6 mb-8">
                                {project.fields.map(field => {
                                    const fieldInfo = fieldLabels[field];

                                    if (fieldInfo.type === 'select') {
                                        return (
                                            <div key={field}>
                                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                                    {fieldInfo.label}
                                                </label>
                                                <select
                                                    value={measures[field] || ''}
                                                    onChange={(e) => handleMeasureChange(field, e.target.value)}
                                                    className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 outline-none transition-all font-medium"
                                                >
                                                    <option value="">Seleccionar...</option>
                                                    {fieldInfo.options.map(opt => (
                                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        );
                                    }

                                    return (
                                        <div key={field}>
                                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                                {fieldInfo.label}
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    value={measures[field] || ''}
                                                    onChange={(e) => handleMeasureChange(field, e.target.value)}
                                                    placeholder={fieldInfo.placeholder}
                                                    className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 outline-none transition-all font-medium"
                                                />
                                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-bold">
                                                    {fieldInfo.unit}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <button
                                onClick={calculateFabric}
                                className="w-full py-4 bg-violet-600 text-white rounded-xl hover:bg-violet-700 transition-all font-extrabold text-lg shadow-lg shadow-violet-500/30 hover:shadow-xl hover:-translate-y-0.5"
                            >
                                Calcular Metraje
                            </button>
                        </div>

                        {/* ================================================================
                            RESULTADO DEL CÁLCULO
                        ================================================================ */}
                        {result && (
                            <div className="card overflow-hidden bg-gradient-to-br from-violet-50 to-fuchsia-50 dark:from-violet-900/20 dark:to-fuchsia-900/20 border border-violet-100 dark:border-violet-800/30">
                                <div className="p-6 md:p-8">
                                    <h3 className="font-extrabold text-xl text-violet-900 dark:text-violet-300 mb-6 flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-violet-200 dark:bg-violet-800/50 flex items-center justify-center">
                                            <Scissors className="w-4 h-4" />
                                        </div>
                                        Resultado del Cálculo
                                    </h3>

                                    <div className="grid md:grid-cols-3 gap-4 mb-8">
                                        <div className="bg-white/60 dark:bg-slate-800/60 p-5 rounded-2xl text-center border border-white dark:border-slate-700">
                                            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Cálculo exacto</p>
                                            <p className="text-3xl font-black text-gray-900 dark:text-white">
                                                {result.exact} <span className="text-lg">m</span>
                                            </p>
                                        </div>
                                        
                                        <div className="bg-violet-600 text-white p-5 rounded-2xl text-center shadow-lg shadow-violet-500/30 transform md:-translate-y-2">
                                            <p className="text-sm font-bold text-violet-200 uppercase tracking-wider mb-2">Recomendado</p>
                                            <p className="text-4xl font-black">
                                                {result.recommended} <span className="text-xl">m</span>
                                            </p>
                                            <p className="text-[10px] font-bold text-violet-200 mt-2 bg-violet-700/50 py-1 px-2 rounded-full inline-block">
                                                +10% margen de seguridad
                                            </p>
                                        </div>

                                        <div className="bg-white/60 dark:bg-slate-800/60 p-5 rounded-2xl text-center border border-white dark:border-slate-700">
                                            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Costo estimado</p>
                                            <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
                                                {formatCurrency(result.cost)}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4 p-5 bg-white/50 dark:bg-slate-800/50 rounded-xl mb-6 border border-violet-100 dark:border-violet-900/30">
                                        <div className="w-10 h-10 rounded-full bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center flex-shrink-0">
                                            <Info className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                                        </div>
                                        <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed font-medium">
                                            <p className="font-bold text-violet-800 dark:text-violet-300 mb-1">Consejo experto:</p>
                                            <p>
                                                Siempre es mejor comprar un poco más de tela por si hay errores de corte o
                                                la tela encoge al lavarla. El cálculo recomendado ya incluye un margen de seguridad adaptado al proyecto.
                                            </p>
                                        </div>
                                    </div>

                                    <Link 
                                        to="/catalogo"
                                        className="w-full flex items-center justify-center gap-2 py-4 bg-gray-900 text-white dark:bg-white dark:text-gray-900 rounded-xl hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors font-black text-lg shadow-xl shadow-gray-900/10 dark:shadow-white/10"
                                    >
                                        Explorar Catálogo y Comprar <ArrowRight className="w-5 h-5" />
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </AnimatedPage>
        </DashboardLayout>
    );
}

export default ProjectCalculator;
