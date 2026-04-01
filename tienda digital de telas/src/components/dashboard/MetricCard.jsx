import React from 'react';

// Mapa de variantes de color predefinidas para evitar parseo frágil de strings Tailwind
const colorVariants = {
    emerald: {
        iconBg:     'bg-emerald-100 dark:bg-emerald-900/40',
        iconText:   'text-emerald-600 dark:text-emerald-400',
    },
    blue: {
        iconBg:     'bg-blue-100 dark:bg-blue-900/40',
        iconText:   'text-blue-600 dark:text-blue-400',
    },
    purple: {
        iconBg:     'bg-purple-100 dark:bg-purple-900/40',
        iconText:   'text-purple-600 dark:text-purple-400',
    },
    orange: {
        iconBg:     'bg-orange-100 dark:bg-orange-900/40',
        iconText:   'text-orange-600 dark:text-orange-400',
    },
    rose: {
        iconBg:     'bg-rose-100 dark:bg-rose-900/40',
        iconText:   'text-rose-600 dark:text-rose-400',
    },
    indigo: {
        iconBg:     'bg-indigo-100 dark:bg-indigo-900/40',
        iconText:   'text-indigo-600 dark:text-indigo-400',
    },
    amber: {
        iconBg:     'bg-amber-100 dark:bg-amber-900/40',
        iconText:   'text-amber-600 dark:text-amber-400',
    },
    primary: {
        iconBg:     'bg-primary-100 dark:bg-primary-900/40',
        iconText:   'text-primary-600 dark:text-primary-400',
    },
    green: {
        iconBg:     'bg-green-100 dark:bg-green-900/40',
        iconText:   'text-green-600 dark:text-green-400',
    },
    red: {
        iconBg:     'bg-red-100 dark:bg-red-900/40',
        iconText:   'text-red-600 dark:text-red-400',
    },
    yellow: {
        iconBg:     'bg-yellow-100 dark:bg-yellow-900/40',
        iconText:   'text-yellow-600 dark:text-yellow-400',
    },
    gray: {
        iconBg:     'bg-gray-100 dark:bg-slate-800',
        iconText:   'text-gray-600 dark:text-gray-400',
    },
};

function MetricCard({ label, title, value, icon: Icon, color = 'primary', trend, trendValue, subtitle }) {
    const displayLabel = label || title;

    // Si color es una clave del mapa, usar el mapa; si no, intentar parsear (legado)
    let iconBgClasses  = 'bg-primary-100 dark:bg-primary-900/40';
    let iconTextClasses = 'text-primary-600 dark:text-primary-400';

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
    let trendColor = 'text-gray-500';
    if (trendValue) {
        if (trend === 'up')   trendColor = trendValue.startsWith('-') ? 'text-red-500' : 'text-green-600';
        if (trend === 'down') trendColor = trendValue.startsWith('-') ? 'text-green-600' : 'text-red-500';
    }

    return (
        <div className="card p-5 group flex flex-col justify-between min-h-[140px] transition-all duration-300">
            <div className="flex justify-between items-start mb-4">
                <div className={`w-12 h-12 rounded-2xl ${iconBgClasses} flex items-center justify-center transition-transform group-hover:scale-110 duration-300`}>
                    {Icon && <Icon className={`w-6 h-6 ${iconTextClasses}`} />}
                </div>
                {trendValue && (
                    <div className={`px-2.5 py-1 rounded-full text-[10px] font-black tracking-wider uppercase flex items-center gap-1 ${trendColor} bg-white dark:bg-slate-900 shadow-sm border border-gray-50 dark:border-slate-800`}>
                         {trend === 'up' ? '▲' : '▼'} {trendValue}
                    </div>
                )}
            </div>

            <div>
                <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5 opacity-80">
                    {displayLabel}
                </p>
                <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight leading-none mb-1">
                    {value}
                </h3>
                {subtitle && (
                    <p className="text-[11px] font-bold text-gray-400 dark:text-gray-500 truncate mt-1">
                        {subtitle}
                    </p>
                )}
            </div>
        </div>
    );
}

export default MetricCard;
