import React, { useState } from 'react';
import { Activity, ArrowUpRight, ChevronLeft, ChevronRight, CheckCircle2, AlertCircle } from 'lucide-react';

export const ActivitySidebar: React.FC = () => {
    const [isOpen, setIsOpen] = useState(true);

    const activities = [
        { id: 1, title: 'تم بيع وحدة A-102', project: 'درة الصفاء', time: 'منذ 5 دقائق', type: 'sale' },
        { id: 2, title: 'حجز جديد: فيلا الشاطئ', project: 'منتجع النورس', time: 'منذ 25 دقيقة', type: 'reservation' },
        { id: 3, title: 'تحديث حالة 3 وحدات', project: 'أبراج العليا', time: 'منذ ساعة', type: 'update' },
        { id: 4, title: 'عميل جديد مهتم', project: 'حي الرائد', time: 'منذ ساعتين', type: 'lead' },
    ];

    const getIcon = (type: string) => {
        switch (type) {
            case 'sale': return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
            case 'reservation': return <Activity className="w-4 h-4 text-amber-500" />;
            case 'lead': return <ArrowUpRight className="w-4 h-4 text-blue-500" />;
            default: return <AlertCircle className="w-4 h-4 text-slate-400" />;
        }
    };

    return (
        <div
            className={`
                absolute top-24 left-4 z-10 transition-all duration-500 ease-in-out
                ${isOpen ? 'w-80' : 'w-12'}
            `}
        >
            <div className="bg-white/80 backdrop-blur-xl border border-white/50 shadow-2xl rounded-[2rem] overflow-hidden flex flex-col max-h-[calc(100vh-8rem)]">
                {/* Header / Toggle */}
                <div
                    className="p-4 border-b border-white/20 flex items-center justify-between cursor-pointer hover:bg-white/40 transition-colors"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    {isOpen && (
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <h3 className="font-bold text-slate-800 text-sm">بصيرة (Live Updates)</h3>
                        </div>
                    )}
                    <button className="p-1 rounded-full bg-white/50 text-slate-600 hover:text-[#7434bc]">
                        {isOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </button>
                </div>

                {/* Content */}
                {isOpen && (
                    <div className="p-4 space-y-4 overflow-y-auto hide-scrollbar">
                        {activities.map((activity) => (
                            <div key={activity.id} className="group flex gap-3 items-start p-3 rounded-2xl hover:bg-white/60 transition-colors cursor-pointer border border-transparent hover:border-white/50">
                                <div className="mt-0.5 bg-white p-2 rounded-xl shadow-sm border border-slate-100 group-hover:scale-110 transition-transform">
                                    {getIcon(activity.type)}
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-800 leading-tight mb-1">{activity.title}</p>
                                    <p className="text-[10px] text-slate-500 font-medium mb-1">{activity.project}</p>
                                    <p className="text-[10px] text-slate-400">{activity.time}</p>
                                </div>
                            </div>
                        ))}

                        {/* Fake "Live" Indicator at bottom */}
                        <div className="pt-2 text-center">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-[10px] font-bold text-emerald-600 border border-emerald-100">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                </span>
                                متصل بالشبكة
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
