import React, { useState } from 'react';
import { FiScissors, FiShoppingCart, FiInfo, FiAlertCircle } from 'react-icons/fi';
import DashboardLayout from '../../../components/layouts/DashboardLayout';
import clientDashboardLinks from '../../../data/clientDashboardLinks';
import BackButton from '../../../components/dashboard/BackButton';
import { formatCurrency } from '../../../utils/formatters';

const PROJECTS = {
    skirt_circular: {
        name: 'Falda Circular',
        icon: '👗',
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
        icon: '👗',
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
        icon: '🪟',
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
        icon: '🍽️',
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
        icon: '🛋️',
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
        icon: '👗',
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
            alert('Por favor completa todas las medidas');
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
            <BackButton to="/cliente" label="Volver a Mi Panel" />
            <div className="grid lg:grid-cols-3 gap-8">
                {/* Project Selection */}
                <div className="lg:col-span-1">
                    <div className="card p-6">
                        <h3 className="font-bold text-lg mb-4">¿Qué vas a hacer?</h3>
                        <div className="space-y-2">
                            {Object.entries(PROJECTS).map(([key, proj]) => (
                                <button
                                    key={key}
                                    onClick={() => handleProjectChange(key)}
                                    className={`w-full flex items-center gap-3 p-4 rounded-lg text-left transition-colors ${selectedProject === key
                                        ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400 ring-2 ring-primary-500'
                                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100 dark:bg-slate-800 dark:text-gray-300 dark:hover:bg-slate-700'
                                        }`}
                                >
                                    <span className="text-2xl">{proj.icon}</span>
                                    <span className="font-medium">{proj.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Calculator Form */}
                <div className="lg:col-span-2">
                    <div className="card p-6 mb-6">
                        <div className="flex items-start gap-3 mb-6">
                            <span className="text-4xl">{project.icon}</span>
                            <div>
                                <h3 className="font-bold text-xl text-gray-900 dark:text-white">
                                    {project.name}
                                </h3>
                                <p className="text-gray-500 mt-1">{project.description}</p>
                            </div>
                        </div>

                        {/* Fabric Settings */}
                        <div className="grid md:grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 dark:bg-slate-800/50 rounded-lg">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Ancho de la tela
                                </label>
                                <select
                                    value={fabricWidth}
                                    onChange={(e) => setFabricWidth(parseFloat(e.target.value))}
                                    className="w-full px-4 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700"
                                >
                                    {FABRIC_WIDTHS.map(fw => (
                                        <option key={fw.value} value={fw.value}>{fw.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Precio por metro
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                                    <input
                                        type="number"
                                        value={fabricPrice}
                                        onChange={(e) => setFabricPrice(parseFloat(e.target.value) || 0)}
                                        className="w-full pl-8 pr-4 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Measurement Fields */}
                        <h4 className="font-medium text-gray-900 dark:text-white mb-4">
                            <FiScissors className="inline w-4 h-4 mr-2" />
                            Tus medidas
                        </h4>
                        <div className="grid md:grid-cols-2 gap-4 mb-6">
                            {project.fields.map(field => {
                                const fieldInfo = fieldLabels[field];

                                if (fieldInfo.type === 'select') {
                                    return (
                                        <div key={field}>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                {fieldInfo.label}
                                            </label>
                                            <select
                                                value={measures[field] || ''}
                                                onChange={(e) => handleMeasureChange(field, e.target.value)}
                                                className="w-full px-4 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700"
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
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            {fieldInfo.label}
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                value={measures[field] || ''}
                                                onChange={(e) => handleMeasureChange(field, e.target.value)}
                                                placeholder={fieldInfo.placeholder}
                                                className="w-full px-4 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700"
                                            />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                                                {fieldInfo.unit}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <button
                            onClick={calculateFabric}
                            className="w-full py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium text-lg"
                        >
                            Calcular Metraje
                        </button>
                    </div>

                    {/* Result */}
                    {result && (
                        <div className="card p-6 bg-gradient-to-br from-primary-50 to-purple-50 dark:from-primary-900/20 dark:to-purple-900/20">
                            <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-4">
                                📐 Resultado del Cálculo
                            </h3>

                            <div className="grid md:grid-cols-3 gap-4 mb-6">
                                <div className="bg-white dark:bg-slate-800 p-4 rounded-lg text-center">
                                    <p className="text-sm text-gray-500 mb-1">Cálculo exacto</p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {result.exact}m
                                    </p>
                                </div>
                                <div className="bg-primary-600 text-white p-4 rounded-lg text-center">
                                    <p className="text-sm text-primary-200 mb-1">Recomendado</p>
                                    <p className="text-3xl font-bold">
                                        {result.recommended}m
                                    </p>
                                    <p className="text-xs text-primary-200 mt-1">+10% margen de seguridad</p>
                                </div>
                                <div className="bg-white dark:bg-slate-800 p-4 rounded-lg text-center">
                                    <p className="text-sm text-gray-500 mb-1">Costo estimado</p>
                                    <p className="text-2xl font-bold text-green-600">
                                        {formatCurrency(result.cost)}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg mb-4">
                                <FiInfo className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                <div className="text-sm text-blue-800 dark:text-blue-200">
                                    <p className="font-medium mb-1">Consejo:</p>
                                    <p>
                                        Siempre es mejor comprar un poco más de tela por si hay errores de corte o
                                        la tela encoge al lavarla. El cálculo ya incluye un 10% extra.
                                    </p>
                                </div>
                            </div>

                            <button className="w-full flex items-center justify-center gap-2 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium">
                                <FiShoppingCart className="w-5 h-5" />
                                Agregar {result.recommended}m al Carrito
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}

export default ProjectCalculator;
