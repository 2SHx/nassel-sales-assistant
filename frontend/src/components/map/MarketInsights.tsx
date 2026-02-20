import React, { useState } from 'react';
import { Sparkles, TrendingUp, Home, DollarSign, ChevronRight, ChevronLeft } from 'lucide-react';
import { MapProject } from '../../services/projects';

interface AgentInsightsProps {
    projects: MapProject[];
    onSelectProject: (project: MapProject) => void;
}

export const MarketInsights: React.FC<AgentInsightsProps> = ({ projects, onSelectProject }) => {
    const [isOpen, setIsOpen] = useState(false);

    // Insight Generators
    const getBestForInvestors = () => {
        // High ROI logic: Low price per sqm, high potential (simulated by status or random for now if no roi field)
        // Let's use lowest price per sqm as a proxy for value
        return [...projects]
            .sort((a, b) => (a.min_available_price / a.min_available_area) - (b.min_available_price / b.min_available_area))
            .slice(0, 3);
    };

    const getFastestSelling = () => {
        // Mock logic: Projects with 'sold' units > 0
        return projects.filter(p => p.sold_units && p.sold_units > 5).slice(0, 3);
    };

    const getFamilyFriendly = () => {
        // Large areas
        return [...projects]
            .sort((a, b) => b.max_available_area - a.max_available_area)
            .slice(0, 3);
    };

    const categories = [
        { title: 'فرص استثمارية (ROI)', icon: DollarSign, data: getBestForInvestors(), color: 'bg-emerald-100 text-emerald-600' },
        { title: 'الأكثر مبيعاً', icon: TrendingUp, data: getFastestSelling(), color: 'bg-blue-100 text-blue-600' },
        { title: 'مناسب للعوائل', icon: Home, data: getFamilyFriendly(), color: 'bg-purple-100 text-purple-600' },
    ];

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="absolute top-36 left-6 z-20 bg-white shadow-xl shadow-purple-900/10 p-4 rounded-2xl flex items-center gap-2 hover:scale-105 transition-all text-slate-700 font-bold border border-white/50"
            >
                <Sparkles className="w-5 h-5 text-purple-600" />
                <span className="hidden md:inline">تحليلات السوق</span>
                <ChevronLeft className="w-4 h-4" />
            </button>
        );
    }

    return (
        <div className="absolute top-6 left-6 bottom-6 w-80 z-20 flex flex-col pointer-events-none">
            <div className="bg-white/90 backdrop-blur-xl h-full rounded-[2rem] shadow-2xl border border-white/50 pointer-events-auto flex flex-col overflow-hidden animate-in slide-in-from-left duration-300">

                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white/50">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                            <Sparkles className="w-5 h-5" />
                        </div>
                        <h3 className="font-black text-slate-800">تحليلات السوق</h3>
                    </div>
                    <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <ChevronRight className="w-5 h-5 text-slate-400" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                    {categories.map((cat, idx) => (
                        <div key={idx}>
                            <div className="flex items-center gap-2 mb-3 px-2">
                                <h4 className="font-bold text-sm text-slate-600">{cat.title}</h4>
                            </div>
                            <div className="space-y-3">
                                {cat.data.map((p, i) => (
                                    <div
                                        key={i}
                                        onClick={() => onSelectProject(p)}
                                        className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm hover:border-purple-200 hover:shadow-md transition-all cursor-pointer group"
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="font-bold text-slate-800 text-sm line-clamp-1 group-hover:text-purple-600 transition-colors">{p.project_name}</span>
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${cat.color}`}>
                                                Top {i + 1}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-xs text-slate-400">
                                            <span>{p.district || p.city}</span>
                                            <span className="font-bold text-slate-600">{Number(p.min_available_price).toLocaleString()} ر.س</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </div>
    );
};
