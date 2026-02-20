import React from 'react';
import { Search, Map as MapIcon, List, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface GlassHeaderProps {
    onSearch: (term: string) => void;
    onFilterChange: (status: string) => void;
    activeStatus: string;
}

export const GlassHeader: React.FC<GlassHeaderProps> = ({ onSearch, onFilterChange, activeStatus }) => {
    const navigate = useNavigate();

    return (
        <div className="absolute top-4 left-0 right-0 z-20 px-4 md:px-8 flex flex-col items-center gap-4 pointer-events-none">
            {/* Top Row: Navigation & Search */}
            <div className="w-full max-w-5xl flex gap-4 pointer-events-auto">
                {/* Navigation Buttons (Map/List) */}
                <div className="bg-white/80 backdrop-blur-xl border border-white/40 p-1.5 rounded-2xl flex shadow-lg shadow-black/5">
                    <button
                        className="px-4 py-2 bg-[#7434bc] text-white rounded-xl font-bold text-sm flex items-center gap-2 shadow-md transition-all"
                    >
                        <MapIcon className="w-4 h-4" />
                        <span>الخريطة</span>
                    </button>
                    <button
                        onClick={() => navigate('/search')}
                        className="px-4 py-2 text-slate-500 hover:bg-white/50 rounded-xl font-bold text-sm flex items-center gap-2 transition-all"
                    >
                        <List className="w-4 h-4" />
                        <span>القائمة</span>
                    </button>
                </div>

                {/* Global Search Bar */}
                <div className="flex-1 bg-white/80 backdrop-blur-xl border border-white/40 rounded-2xl shadow-lg shadow-black/5 flex items-center px-4 transition-all focus-within:ring-2 focus-within:ring-[#7434bc]/20">
                    <Search className="w-5 h-5 text-slate-400 ml-3" />
                    <input
                        type="text"
                        placeholder="ابحث عن مشروع، حي، أو رقم وحدة..."
                        className="bg-transparent border-none outline-none w-full h-12 text-slate-700 font-medium placeholder:text-slate-400 text-right"
                        onChange={(e) => onSearch(e.target.value)}
                    />
                    <div className="hidden border-r pr-3 border-slate-200 md:flex items-center gap-2">
                        <kbd className="hidden md:inline-flex h-6 items-center gap-1 rounded border border-slate-200 bg-slate-50 px-2 font-mono text-[10px] font-medium text-slate-500">
                            ⌘ K
                        </kbd>
                    </div>
                </div>

                {/* Mobile Filter Toggle (Visible on small screens) */}
                <button className="md:hidden bg-white/80 backdrop-blur-xl border border-white/40 w-12 h-12 rounded-2xl flex items-center justify-center text-slate-600 shadow-lg">
                    <Filter className="w-5 h-5" />
                </button>
            </div>

            {/* Bottom Row: Quick Status Pills */}
            <div className="flex gap-2 pointer-events-auto">
                {[
                    { id: 'all', label: 'الكل', color: 'bg-white/90 text-slate-600' },
                    { id: 'Available', label: 'متاح', color: 'bg-emerald-100/90 text-emerald-700 border-emerald-200' },
                    { id: 'Reserved', label: 'محجوز', color: 'bg-amber-100/90 text-amber-700 border-amber-200' },
                    { id: 'Sold', label: 'مباع', color: 'bg-red-100/90 text-red-700 border-red-200' }
                ].map((status) => (
                    <button
                        key={status.id}
                        onClick={() => onFilterChange(status.id)}
                        className={`
                            px-4 py-1.5 rounded-full text-xs font-bold border backdrop-blur-md shadow-sm transition-all
                            ${activeStatus === status.id ? 'ring-2 ring-offset-1 ring-[#7434bc]/50 scale-105' : 'hover:scale-105'}
                            ${status.id === 'all' && activeStatus !== 'all' ? 'border-transparent' : ''}
                            ${status.id !== 'all' ? status.color : 'bg-white/80 text-slate-600 border-white/40'}
                        `}
                    >
                        {status.label}
                    </button>
                ))}
            </div>
        </div>
    );
};
