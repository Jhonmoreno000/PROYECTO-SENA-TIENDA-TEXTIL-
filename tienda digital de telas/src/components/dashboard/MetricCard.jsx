import React from 'react';
import { motion } from 'framer-motion';

function MetricCard({ label, value, icon: Icon, color, trend, trendValue, subtitle }) {
    const getTrendColor = () => {
        if (!trend) return '';
        return trend === 'up' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';
    };

    const getTrendIcon = () => {
        if (!trend) return null;
        return trend === 'up' ? '↑' : '↓';
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                    <p className="text-gray-500 dark:text-gray-400 text-sm font-bold uppercase mb-2 line-clamp-2">
                        {label}
                    </p>
                    <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1 truncate" title={value}>
                        {value}
                    </h3>
                    {subtitle && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            {subtitle}
                        </p>
                    )}
                    {trend && trendValue && (
                        <div className={`flex flex-wrap items-center gap-1 mt-2 text-sm font-medium ${getTrendColor()}`}>
                            <span>{getTrendIcon()}</span>
                            <span>{trendValue}</span>
                            <span className="text-gray-400 text-xs whitespace-nowrap">vs mes anterior</span>
                        </div>
                    )}
                </div>
                {Icon && (
                    <div className={`p-4 rounded-full flex-shrink-0 ${color || 'bg-primary-100 text-primary-600'}`}>
                        <Icon className="w-8 h-8" />
                    </div>
                )}
            </div>
        </motion.div>
    );
}

export default MetricCard;
