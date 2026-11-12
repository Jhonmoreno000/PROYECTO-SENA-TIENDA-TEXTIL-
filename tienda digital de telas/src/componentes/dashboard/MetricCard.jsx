import React from 'react';

// Mapa de variantes de color predefinidas para la paleta premium con excelente contraste en modo oscuro
const colorVariants = {
    emerald: {
        iconBg:     'bg-emerald-100 dark:bg-emerald-500/20 dark:border dark:border-emerald-500/30',
        iconText:   'text-emerald-600 dark:text-emerald-300',
    },
    blue: {
        iconBg:     'bg-blue-100 dark:bg-blue-500/20 dark:border dark:border-blue-500/30',
        iconText:   'text-blue-600 dark:text-blue-300',
    },
    violet: {
        iconBg:     'bg-violet-100 dark:bg-violet-500/20 dark:border dark:border-violet-500/30',
        iconText:   'text-violet-600 dark:text-violet-300',
    },
    purple: {
        iconBg:     'bg-purple-100 dark:bg-purple-500/20 dark:border dark:border-purple-500/30',
        iconText:   'text-purple-600 dark:text-purple-300',
    },
    orange: {
        iconBg:     'bg-orange-100 dark:bg-orange-500/20 dark:border dark:border-orange-500/30',
        iconText:   'text-orange-600 dark:text-orange-300',
    },
    rose: {
        iconBg:     'bg-rose-100 dark:bg-rose-500/20 dark:border dark:border-rose-500/30',
        iconText:   'text-rose-600 dark:text-rose-300',
    },
    indigo: {
        iconBg:     'bg-indigo-100 dark:bg-indigo-500/20 dark:border dark:border-indigo-500/30',
        iconText:   'text-indigo-600 dark:text-indigo-300',
    },
    amber: {
        iconBg:     'bg-amber-100 dark:bg-amber-500/20 dark:border dark:border-amber-500/30',
        iconText:   'text-amber-600 dark:text-amber-300',
    },
    primary: {
        iconBg:     'bg-primary-100 dark:bg-primary-500/20 dark:border dark:border-primary-500/30',
        iconText:   'text-primary-600 dark:text-primary-300',
    },
    green: {
        iconBg:     'bg-emerald-100 dark:bg-emerald-500/20 dark:border dark:border-emerald-500/30',
        iconText:   'text-emerald-600 dark:text-emerald-300',
    },
    red: {
        iconBg:     'bg-red-100 dark:bg-red-500/20 dark:border dark:border-red-500/30',
        iconText:   'text-red-600 dark:text-red-300',
    },
    yellow: {
        iconBg:     'bg-yellow-100 dark:bg-yellow-500/20 dark:border dark:border-yellow-500/30',
        iconText:   'text-yellow-600 dark:text-yellow-300',
    },
    gray: {
        iconBg:     'bg-gray-100 dark:bg-slate-800 dark:border dark:border-slate-700',
        iconText:   'text-gray-600 dark:text-gray-300',
    },
};

function MetricCard({ label, title, value, icon: Icon, color = 'primary', trend, trendValue, subtitle }) {
    const displayLabel = label || title;

    // Si color es una clave del mapa, usar el mapa; si no, intentar parsear (legado)
    let iconBgClasses  = 'bg-primary-100 dark:bg-primary-500/20 dark:border dark:border-primary-500/30';
    let iconTextClasses = 'text-primary-600 dark:text-primary-300';

    if (colorVariants[color]) {
        iconBgClasses   = colorVariants[color].iconBg;
        iconTextClasses = colorVariants[color].iconText;
    } else if (typeof color === 'string' && color.includes(' ')) {
        // Legado: parsear de string de clases Tailwind
        const classes = color.split(' ');
        const bg  = classes.find(c => c.startsWith('bg-') && !c.startsWith('dark:'));
        const txt = classes.find(c => c.startsWith('text-') && !c.startsWith('dark:'));
        const dbg = classes.filter(c => c.startsWith('dark:bg-')).pop();
        const dtxt = classes.filter(c => c.startsWith('dark:text-')).pop();
        if (bg)   iconBgClasses   = [bg,  dbg  || ''].join(' ').trim();
        if (txt)  iconTextClasses = [txt, dtxt || ''].join(' ').trim();
    }

    // Determinar color del trendValue
    let trendColor = 'text-gray-500 dark:text-gray-400';
    let trendBg = 'bg-gray-100 dark:bg-gray-800';
    if (trendValue) {
        if (trend === 'up') {
            trendColor = trendValue.startsWith('-') ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400';
            trendBg = trendValue.startsWith('-') ? 'bg-red-50 dark:bg-red-900/30' : 'bg-emerald-50 dark:bg-emerald-900/30';
        }
        if (trend === 'down') {
            trendColor = trendValue.startsWith('-') ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400';
            trendBg = trendValue.startsWith('-') ? 'bg-emerald-50 dark:bg-emerald-900/30' : 'bg-red-50 dark:bg-red-900/30';
        }
    }

    return (
        <div className="card p-6 flex flex-col justify-between min-h-[150px] relative overflow-hidden group hover:shadow-xl hover:shadow-primary-500/5 hover:-translate-y-1 transition-all duration-300">
            {/* Decal de fondo suave que reacciona al hover */}
            <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-0 group-hover:opacity-10 transition-opacity duration-500 ${iconBgClasses.split(' ')[0]}`} />
            
            <div className="flex justify-between items-start mb-4 relative z-10">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 shadow-sm ${iconBgClasses}`}>
                    {Icon && <Icon className={`w-6 h-6 ${iconTextClasses}`} />}
                </div>
                {trendValue && (
                    <div className={`text-[11px] font-bold flex items-center gap-1 px-2.5 py-1 rounded-full ${trendColor} ${trendBg}`}>
                         {trend === 'up' ? '▲' : '▼'} {trendValue}
                    </div>
                )}
            </div>

            <div className="relative z-10 mt-auto">
                <h3 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-none mb-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                    {value}
                </h3>
                <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">
                    {displayLabel}
                </p>
                {subtitle && (
                    <p className="text-xs text-gray-400 dark:text-gray-500 truncate mt-1">
                        {subtitle}
                    </p>
                )}
            </div>
        </div>
    );
}

export default MetricCard;
