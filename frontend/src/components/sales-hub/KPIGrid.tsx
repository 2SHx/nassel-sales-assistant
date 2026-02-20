import React from 'react';
import { TrendingUp, Activity, PieChart, Target } from 'lucide-react';

export const KPIGrid: React.FC = () => {
    // Mock Data - In real app, this would come from a context or prop
    const stats = [
        {
            id: 1,
            label: 'إجمالي المبيعات',
            value: '42.5M',
            suffix: 'SAR',
            icon: TrendingUp,
            color: 'text-emerald-500',
            bg: 'bg-emerald-500/10',
            change: '+12%'
        },
        {
            id: 2,
            label: 'سرعة البيع',
            value: '14',
            suffix: 'يوم',
            icon: Activity,
            color: 'text-blue-500',
            bg: 'bg-blue-500/10',
            change: '-2'
        },
        {
            id: 3,
            label: 'إشغال المخزون',
            value: '68',
            suffix: '%',
            icon: PieChart,
            color: 'text-purple-500',
            bg: 'bg-purple-500/10',
            change: '+5%'
        },
        {
            id: 4,
            label: 'تحقيق الهدف',
            value: '85',
            suffix: '%',
            icon: Target,
            color: 'text-amber-500',
            bg: 'bg-amber-500/10',
            change: 'Q1'
        }
    ];

    return (
        <div className="absolute top-24 left-0 right-0 z-10 px-4 md:px-8 flex items-center justify-center pointer-events-none">
            <div className="flex gap-4 overflow-x-auto pb-2 max-w-5xl w-full pointer-events-auto hide-scrollbar">
                {stats.map((stat) => (
                    <div
                        key={stat.id}
                        className="bg-white/80 backdrop-blur-md border border-white/50 rounded-2xl p-3 flex items-center gap-3 shadow-lg shadow-black/5 min-w-[160px] flex-1 transition-transform hover:-translate-y-1"
                    >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color}`}>
                            <stat.icon className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-[10px] text-slate-500 font-bold">{stat.label}</p>
                            <div className="flex items-baseline gap-1">
                                <span className="text-lg font-black text-slate-800">{stat.value}</span>
                                <span className="text-[10px] text-slate-400 font-bold">{stat.suffix}</span>
                            </div>
                        </div>
                        <div className="mr-auto self-end">
                            <span className={`text-[10px] font-bold ${stat.change.includes('+') ? 'text-emerald-500' : 'text-slate-400'}`}>
                                {stat.change}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
