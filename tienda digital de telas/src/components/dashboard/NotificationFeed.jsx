import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { AlertCircle, CheckCircle2, AlertTriangle, Info, Bell } from 'lucide-react';

gsap.registerPlugin(useGSAP);

export default function NotificationFeed({ notifications = [] }) {
    const containerRef = useRef(null);
    
    const typeConfig = {
        error: { icon: AlertCircle, color: "text-rose-500", bg: "bg-rose-50 dark:bg-rose-500/10" },
        success: { icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-500/10" },
        warning: { icon: AlertTriangle, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-500/10" },
        info: { icon: Info, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-500/10" }
    };

    useGSAP(() => {
        if (notifications.length > 0) {
            gsap.fromTo('.notif-item', 
                { opacity: 0, x: 20 }, 
                { opacity: 1, x: 0, duration: 0.5, stagger: 0.1, ease: "power2.out" }
            );
        }
    }, { scope: containerRef, dependencies: [notifications.length] });

    return (
        <div ref={containerRef} className="card p-0 overflow-hidden flex flex-col h-full bg-white dark:bg-slate-900 shadow-sm border border-gray-100 dark:border-slate-800">
            <div className="p-5 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-gray-50/50 dark:bg-slate-800/30">
                <div className="flex items-center gap-2">
                    <Bell className="w-5 h-5 text-gray-500" />
                    <h3 className="font-semibold text-gray-900 dark:text-white">Centro de Alertas</h3>
                </div>
                {notifications.filter(n => !n.isRead).length > 0 && (
                    <span className="px-2.5 py-0.5 bg-rose-500 text-white text-xs font-bold rounded-full">
                        {notifications.filter(n => !n.isRead).length} Nuevas
                    </span>
                )}
            </div>
            
            <div className="flex-1 overflow-y-auto p-2 max-h-[400px] custom-scrollbar">
                {notifications.length > 0 ? (
                    notifications.map((notif) => {
                        const config = typeConfig[notif.type] || typeConfig.info;
                        const Icon = config.icon;
                        
                        return (
                            <div 
                                key={notif.id}
                                className="notif-item p-3 mb-2 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors flex gap-3 cursor-pointer group"
                            >
                                <div className={`mt-0.5 shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${config.bg} ${config.color}`}>
                                    <Icon size={16} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start mb-1">
                                        <p className={`text-sm font-semibold truncate pr-2 ${notif.isRead ? 'text-gray-600 dark:text-gray-400' : 'text-gray-900 dark:text-white'}`}>
                                            {notif.title}
                                        </p>
                                        <span className="text-[10px] text-gray-400 whitespace-nowrap">{notif.time}</span>
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                                        {notif.message}
                                    </p>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="flex flex-col items-center justify-center h-full py-10 text-gray-400">
                        <CheckCircle2 size={48} strokeWidth={1} className="mb-3 opacity-50" />
                        <p className="text-sm">No hay alertas pendientes</p>
                    </div>
                )}
            </div>
        </div>
    );
}
