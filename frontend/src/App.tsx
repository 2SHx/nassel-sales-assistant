import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Search, MapPin, Home, DollarSign, Maximize, TrendingUp, Sparkles, X, ChevronDown, Building2, ArrowLeft } from 'lucide-react';

// --- Types ---
interface Project {
    project_id: number;
    project_name: string;
    direction: 'شمال' | 'جنوب' | 'شرق' | 'غرب';
    district: string;
    min_available_price: number;
    max_available_price?: number;
    min_available_area: number;
    max_available_area?: number;
    max_available_bedrooms: number;
    min_available_bedrooms: number;
    project_status: string;
    match_score: number;
    sales_script: string;
    marketing_pitch: string;
    unit_types: string;
    facilities: string;
    location_url: string;
    brochure_url: string;
    available_units: number;
    project_type: string;

    // Extended fields
    project_code?: string;
    owner?: string;
    project_number?: number;
    opening_date?: string;
    videos_url?: string;
    images_url?: string;
    total_units?: number;
    sold_units?: number;
    reserved_units?: number;
    sales_percentage?: number;
    min_price?: number;
    max_price?: number;
    avg_unit_value?: number;
    min_area?: number;
    max_area?: number;
}

interface SearchFilters {
    unitType: string;
    direction: string;
    region: string;
    district: string;
    maxPrice: number;
    minArea: number;
}

// --- Enhanced Components ---

// 1. Premium Combobox
const Combobox: React.FC<{
    label: string;
    icon: React.ElementType;
    value: string;
    onChange: (val: string) => void;
    options: string[];
    placeholder?: string;
}> = ({ label, icon: Icon, value, onChange, options, placeholder }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const wrapperRef = useRef<HTMLDivElement>(null);
    const filtered = options.filter(opt => opt.includes(query));

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) setIsOpen(false);
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="space-y-2 relative group" ref={wrapperRef}>
            <label className="text-xs font-bold text-[#7434bc] uppercase tracking-wider flex items-center gap-1.5 mb-1.5 ml-1">
                <Icon className="w-3.5 h-3.5" />
                {label}
            </label>
            <div className="relative">
                <input
                    type="text"
                    value={isOpen ? query : value}
                    onChange={(e) => { setQuery(e.target.value); setIsOpen(true); onChange(e.target.value); }}
                    onFocus={() => { setQuery(value); setIsOpen(true); }}
                    placeholder={placeholder}
                    className="w-full h-14 pl-10 pr-5 bg-purple-50/50 hover:bg-white focus:bg-white border border-transparent focus:border-[#7434bc]/20 rounded-2xl outline-none text-slate-800 font-bold placeholder:text-slate-400 text-right shadow-sm focus:shadow-[0_4px_20px_-4px_rgba(116,52,188,0.15)] transition-all duration-300"
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-300 pointer-events-none group-focus-within:text-[#7434bc] transition-colors" />

                {isOpen && filtered.length > 0 && (
                    <div className="absolute top-full mt-2 w-full bg-white rounded-2xl shadow-[0_10px_40px_-10px_rgba(116,52,188,0.2)] border border-purple-50 max-h-60 overflow-y-auto z-50 animate-in fade-in slide-in-from-top-2 p-2">
                        {filtered.map((opt, idx) => (
                            <div
                                key={idx}
                                className="px-4 py-3 hover:bg-purple-50 rounded-xl cursor-pointer text-right text-slate-700 font-bold text-sm transition-colors"
                                onClick={() => { onChange(opt); setQuery(opt); setIsOpen(false); }}
                            >
                                {opt}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

// 2. Premium Select Field
const SelectField: React.FC<{
    label: string;
    icon: React.ElementType;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    options: { label: string; value: string }[];
    name: string;
}> = ({ label, icon: Icon, value, onChange, options, name }) => (
    <div className="space-y-2 group">
        <label className="text-xs font-bold text-[#7434bc] uppercase tracking-wider flex items-center gap-1.5 mb-1.5 ml-1">
            <Icon className="w-3.5 h-3.5" />
            {label}
        </label>
        <div className="relative">
            <select
                name={name}
                value={value}
                onChange={onChange}
                className="w-full h-14 pl-10 pr-5 appearance-none bg-purple-50/50 hover:bg-white focus:bg-white border border-transparent focus:border-[#7434bc]/20 rounded-2xl outline-none text-slate-800 font-bold cursor-pointer text-right shadow-sm focus:shadow-[0_4px_20px_-4px_rgba(116,52,188,0.15)] transition-all duration-300"
            >
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
            <ChevronDown className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-300 pointer-events-none group-focus-within:text-[#7434bc] transition-colors" />
        </div>
    </div>
);

// 3. Premium Slider Input
const SliderInput: React.FC<{
    label: string;
    icon: React.ElementType;
    value: number;
    onChange: (val: number) => void;
    min: number;
    max: number;
    step: number;
    unit: string;
    shortcuts?: number[];
}> = ({ label, icon: Icon, value, onChange, min, max, step, unit, shortcuts }) => (
    <div className="space-y-4">
        <div className="flex justify-between items-end">
            <label className="text-xs font-bold text-[#7434bc] uppercase tracking-wider flex items-center gap-1.5 mb-1">
                <Icon className="w-3.5 h-3.5" />
                {label}
            </label>
            <div className="relative group">
                <input
                    type="text"
                    value={value.toLocaleString('en-US')}
                    onChange={(e) => {
                        const cleanValue = Number(e.target.value.replace(/,/g, ''));
                        if (!isNaN(cleanValue)) onChange(cleanValue);
                    }}
                    className="w-40 h-10 pl-10 pr-4 bg-transparent border-b-2 border-slate-200 focus:border-[#7434bc] text-[#7434bc] text-xl font-black text-left outline-none transition-colors"
                    dir="ltr"
                />
                <span className="absolute right-0 top-1/2 -translate-y-1/2 text-sm text-slate-400 font-bold pointer-events-none group-focus-within:text-[#7434bc] transition-colors">
                    {unit}
                </span>
            </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-purple-100 shadow-sm relative overflow-hidden group hover:border-[#7434bc]/30 transition-colors">
            <div className="absolute inset-0 bg-[#f8e4ff]/30 opacity-0 group-hover:opacity-100 transition-opacity" />
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                className="relative z-10 w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#7434bc] hover:accent-[#9d5bd2]"
            />

            {shortcuts && (
                <div className="relative z-10 flex justify-between gap-2 mt-4">
                    {shortcuts.map(s => (
                        <button
                            key={s}
                            onClick={() => onChange(s)}
                            className={`
                            text-[10px] font-bold px-3 py-1.5 rounded-xl transition-all duration-300
                            ${value === s
                                    ? 'bg-[#7434bc] text-white shadow-lg shadow-[#7434bc]/30 scale-105'
                                    : 'bg-slate-50 text-slate-500 hover:bg-[#f8e4ff] hover:text-[#7434bc]'
                                }
                        `}
                        >
                            {s >= 1000000 ? `${(s / 1000000)}M` : s.toLocaleString('en-US')}
                        </button>
                    ))}
                </div>
            )}
        </div>
    </div>
);

// 4. Immersive Project Modal
const ProjectModal: React.FC<{ project: Project; onClose: () => void }> = ({ project, onClose }) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8">
            <div className="absolute inset-0 bg-[#2d1b4e]/60 backdrop-blur-md transition-opacity" onClick={onClose} />
            <div className="relative w-full max-w-5xl bg-[#fafafa] rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500 max-h-[90vh] overflow-y-auto border border-white/20">

                {/* Hero Headers */}
                <div className="h-72 bg-[url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2670&auto=format&fit=crop')] bg-cover bg-center relative group">
                    <div className="absolute inset-0 bg-gradient-to-t from-[#2d1b4e] via-[#7434bc]/80 to-transparent mix-blend-multiply opacity-90" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                    <button onClick={onClose} className="absolute top-8 right-8 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md transition-all border border-white/10 hover:scale-110 active:scale-95">
                        <X className="w-6 h-6" />
                    </button>

                    <div className="absolute bottom-0 w-full p-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <div className="flex flex-wrap gap-2 mb-4">
                                <span className="bg-emerald-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg shadow-emerald-500/20 flex items-center gap-1.5">
                                    <TrendingUp className="w-3.5 h-3.5" />
                                    تطابق {project.match_score}%
                                </span>
                                <span className="bg-white/20 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold border border-white/20">
                                    {project.project_status || 'متاح'}
                                </span>
                                {project.sales_percentage && (
                                    <span className="bg-blue-500/80 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1.5">
                                        تم بيع {project.sales_percentage}%
                                    </span>
                                )}
                            </div>
                            <h2 className="text-5xl font-black text-white tracking-tight mb-2 shadow-sm">{project.project_name}</h2>
                            <div className="flex items-center gap-4 text-purple-200 font-medium text-lg">
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-5 h-5" />
                                    {project.district}، {project.direction}
                                </div>
                                {project.owner && (
                                    <div className="flex items-center gap-2 border-r-2 border-purple-400/30 pr-4 mr-4">
                                        <Building2 className="w-5 h-5 text-purple-300" />
                                        المطور: {project.owner}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-8 md:p-12 space-y-12 bg-[#fafafa]">

                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                        {[
                            { label: 'نطاق الأسعار', val: <span>{Number(project.min_available_price).toLocaleString('en-US')} <span className="text-xs opacity-60 font-normal">ر.س</span></span> },
                            { label: 'المساحات', val: <span>{Number(project.min_available_area).toLocaleString('en-US')} <span className="text-xs opacity-60 font-normal">م²</span></span> },
                            { label: 'نوع الوحدات', val: project.unit_types.split(',')[0] },
                            { label: 'الوحدات المتاحة', val: `${project.available_units} / ${project.total_units || '?'}` }
                        ].map((stat, i) => (
                            <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.05)] text-center group hover:-translate-y-1 transition-transform duration-300">
                                <span className="block text-purple-400 text-xs font-bold uppercase tracking-wider mb-2">{stat.label}</span>
                                <span className="block text-slate-900 text-xl font-black group-hover:text-[#7434bc] transition-colors">{stat.val}</span>
                            </div>
                        ))}
                    </div>

                    {/* Content Grid */}
                    <div className="grid md:grid-cols-3 gap-10">

                        {/* Right Column: Details & Tables */}
                        <div className="md:col-span-2 space-y-10">

                            {/* Why this project? */}
                            <div className="bg-gradient-to-br from-white to-[#f8e4ff]/30 p-8 rounded-[2.5rem] border border-white shadow-xl shadow-purple-900/5 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-[#7434bc]/5 rounded-bl-[100px] -z-0" />
                                <div className="relative z-10">
                                    <h3 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-3">
                                        <div className="p-2.5 bg-[#7434bc] rounded-2xl shadow-lg shadow-[#7434bc]/30">
                                            <Sparkles className="w-5 h-5 text-white" />
                                        </div>
                                        لماذا هذا المشروع؟
                                    </h3>
                                    <p className="text-slate-600 leading-9 text-lg font-medium text-justify">
                                        {project.sales_script}
                                    </p>
                                </div>
                            </div>

                            {/* Detailed Info Table */}
                            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                                <table className="w-full text-right">
                                    <tbody className="divide-y divide-slate-50">
                                        {[
                                            { label: 'المالك / المطور', val: project.owner },
                                            { label: 'كود المشروع', val: project.project_code },
                                            { label: 'تاريخ الافتتاح', val: project.opening_date },
                                            { label: 'الحي', val: project.district },
                                            { label: 'حالة المشروع', val: project.project_status },
                                            { label: 'غرف النوم', val: project.min_available_bedrooms === project.max_available_bedrooms ? `${project.min_available_bedrooms}` : `من ${project.min_available_bedrooms} إلى ${project.max_available_bedrooms}` },
                                            { label: 'إجمالي الوحدات', val: project.total_units },
                                            { label: 'تم بيع', val: `${project.sold_units || 0} وحدة` },
                                            { label: 'نسبة البيع', val: project.sales_percentage ? `${project.sales_percentage}%` : '-' },
                                        ].map((row, i) => row.val && (
                                            <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="px-8 py-5 font-bold text-slate-400 text-sm w-1/3">{row.label}</td>
                                                <td className="px-8 py-5 font-bold text-slate-800 text-base">{row.val}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Left Column: Actions, Media & Amenities */}
                        <div className="space-y-6">

                            {/* Media Links (Images/Videos) */}
                            {(project.videos_url || project.images_url) && (
                                <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-transparent" />
                                    <h3 className="text-lg font-black mb-6 relative z-10">معرض الوسائط</h3>
                                    <div className="space-y-3 relative z-10">
                                        {project.videos_url && (
                                            <a href={project.videos_url} target="_blank" rel="noreferrer" className="w-full h-14 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-2xl flex items-center px-4 gap-3 transition-colors border border-white/5">
                                                <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center text-red-500">
                                                    <div className="w-0 h-0 border-t-[5px] border-t-transparent border-l-[8px] border-l-current border-b-[5px] border-b-transparent ml-1" />
                                                </div>
                                                <span className="font-bold text-sm">شاهد الفيديوهات</span>
                                            </a>
                                        )}
                                        {project.images_url && (
                                            <a href={project.images_url} target="_blank" rel="noreferrer" className="w-full h-14 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-2xl flex items-center px-4 gap-3 transition-colors border border-white/5">
                                                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                                                    <Maximize className="w-4 h-4" />
                                                </div>
                                                <span className="font-bold text-sm">صور المشروع</span>
                                            </a>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Buttons */}
                            <div className="sticky top-8 space-y-4">
                                {project.brochure_url && (
                                    <a href={project.brochure_url} target="_blank" rel="noreferrer" className="w-full h-16 bg-[#7434bc] hover:bg-[#5d2a96] text-white rounded-2xl font-bold flex items-center justify-center gap-3 transition-all shadow-xl shadow-[#7434bc]/20 hover:-translate-y-1">
                                        <Building2 className="w-5 h-5" />
                                        تحميل البروشور
                                    </a>
                                )}
                                {project.location_url && (
                                    <a href={project.location_url} target="_blank" rel="noreferrer" className="w-full h-16 bg-white text-[#7434bc] border-2 border-[#7434bc]/20 hover:border-[#7434bc] rounded-2xl font-bold flex items-center justify-center gap-3 transition-all hover:shadow-[0_4px_20px_-4px_rgba(116,52,188,0.2)] hover:-translate-y-1">
                                        <MapPin className="w-5 h-5" />
                                        عرض على الخريطة
                                    </a>
                                )}
                            </div>

                            {/* Amenities Bubbles */}
                            {project.facilities && (
                                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm mt-6">
                                    <h3 className="text-lg font-black text-slate-800 mb-6">المرافق</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {project.facilities.split(',').map((amenity, i) => (
                                            <span key={i} className="px-4 py-2 bg-slate-50 text-slate-600 rounded-xl font-bold text-xs border border-slate-100">
                                                {amenity.trim()}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

// 5. Enhanced Result Card
const ResultCard: React.FC<{ project: Project; onClick: () => void }> = ({ project, onClick }) => {
    const getScoreColor = (score: number) => {
        if (score >= 90) return { bg: 'bg-emerald-500', text: 'text-emerald-50' };
        if (score >= 75) return { bg: 'bg-green-500', text: 'text-green-50' };
        if (score >= 60) return { bg: 'bg-yellow-500', text: 'text-white' };
        return { bg: 'bg-orange-500', text: 'text-white' };
    };

    const colors = getScoreColor(project.match_score);

    return (
        <div
            onClick={onClick}
            className="group relative bg-white rounded-[2rem] p-6 shadow-sm hover:shadow-[0_20px_40px_-15px_rgba(116,52,188,0.2)] transition-all duration-300 transform hover:-translate-y-2 border border-slate-100 overflow-hidden cursor-pointer"
        >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-50 to-transparent rounded-bl-[100px] -z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="flex justify-between items-start mb-6 relative z-10">
                <div>
                    <h3 className="text-xl font-black text-slate-900 group-hover:text-[#7434bc] transition-colors leading-tight mb-2">{project.project_name}</h3>
                    <p className="text-xs text-slate-400 font-bold flex items-center gap-1.5 uppercase tracking-wide">
                        <MapPin className="w-3.5 h-3.5" />
                        {project.district} • {project.direction}
                    </p>
                </div>
                <div className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 shadow-md ${colors.bg} ${colors.text}`}>
                    <TrendingUp className="w-3.5 h-3.5" />
                    {project.match_score}%
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6 relative z-10">
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 group-hover:border-[#7434bc]/10 transition-colors">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">يبدأ من</span>
                    <span className="text-sm font-black text-slate-800">{Number(project.min_available_price).toLocaleString('en-US')} <span className="text-[10px] font-normal">ر.س</span></span>
                </div>
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 group-hover:border-[#7434bc]/10 transition-colors">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">المساحة</span>
                    <span className="text-sm font-black text-slate-800">{Number(project.min_available_area).toLocaleString('en-US')} <span className="text-[10px] font-normal">م²</span></span>
                </div>
            </div>

            <div className="relative py-4 px-5 bg-[#f8e4ff]/40 rounded-2xl border border-[#f8e4ff] mt-auto">
                <Sparkles className="absolute top-3 left-3 w-4 h-4 text-[#7434bc] opacity-50" />
                <p className="text-xs text-slate-600 leading-relaxed font-bold line-clamp-2">
                    {project.marketing_pitch ? project.marketing_pitch.substring(0, 80) + '...' : project.sales_script.substring(0, 80) + '...'}
                </p>
            </div>
        </div>
    );
};

// --- Main App ---

// API URL - uses environment variable in production, localhost in development
const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

const App: React.FC = () => {
    const [filters, setFilters] = useState<SearchFilters>({
        unitType: '', direction: 'شمال', region: 'الرياض', district: '', maxPrice: 1500000, minArea: 200
    });

    const [districts, setDistricts] = useState<string[]>([]);
    const [hasSearched, setHasSearched] = useState(false);
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<Project[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);

    // Ref for results scrolling
    const resultsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchDistricts = async () => {
            try {
                const res = await axios.get(`${API_URL}/districts?direction=${filters.direction}&city=${filters.region}`);
                setDistricts(res.data);
            } catch (e) { console.error("Failed to fetch districts", e); }
        };
        fetchDistricts();
    }, [filters.direction, filters.region]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSearch = async () => {
        setLoading(true); setHasSearched(true); setError(null);
        try {
            const payload = { ...filters, budget: Number(filters.maxPrice), unit_type: filters.unitType || undefined, district: filters.district || undefined, min_area: Number(filters.minArea) || undefined, city: filters.region };
            const response = await axios.post(`${API_URL}/search`, payload);
            setResults(response.data);

            // Auto-scroll to results
            setTimeout(() => {
                resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 300);

        } catch (err) { setError("تعذر الاتصال بالخادم."); } finally { setLoading(false); }
    };

    return (
        <div className="min-h-screen bg-[#fafafa] relative overflow-x-hidden font-sans text-right selection:bg-[#7434bc]/20" dir="rtl">

            {/* Dynamic Background */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] bg-[#f8e4ff] rounded-full blur-[120px] opacity-60 mix-blend-multiply animate-blob" />
                <div className="absolute top-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-purple-100 rounded-full blur-[100px] opacity-60 mix-blend-multiply animate-blob animation-delay-2000" />
            </div>

            {selectedProject && <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} />}

            <div className="min-h-screen flex flex-col items-center justify-center p-6 md:p-12 relative z-10">

                <div className={`
          w-full max-w-4xl transition-all duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)]
          ${hasSearched && results.length > 0 ? 'translate-y-0' : 'translate-y-[8vh]'}
        `}>

                    {/* Header */}
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center justify-center w-28 h-28 bg-white/50 rounded-[2rem] shadow-2xl shadow-[#7434bc]/10 mb-6 p-2 border border-white/50 ring-4 ring-white/20">
                            <img src="/logo.png" alt="نَصِل" className="w-full h-full object-contain drop-shadow-sm opacity-90 hover:opacity-100 transition-opacity" />
                        </div>
                        <h1 className="text-6xl font-black tracking-tighter mb-4 bg-clip-text text-transparent bg-gradient-to-r from-[#7434bc] to-[#a066de] pb-2">نَصِل</h1>
                        <p className="text-slate-500 text-xl font-medium tracking-wide">بحث فوري. بيانات حية. نتائج تفهمك.</p>
                    </div>

                    {/* Search Glass Card (SMALLER: max-w-4xl, p-8) */}
                    <div className="bg-white/60 backdrop-blur-2xl border border-white/60 shadow-[0_20px_50px_-12px_rgba(116,52,188,0.15)] rounded-[3rem] p-8 md:p-10 mb-16 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#7434bc] via-[#a066de] to-[#7434bc]" />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8 mb-10">
                            <SelectField name="region" label="المدينة" icon={MapPin} value={filters.region} onChange={handleInputChange} options={[{ label: 'الرياض', value: 'الرياض' }, { label: 'جدة', value: 'جدة' }]} />
                            <SelectField name="unitType" label="نوع الوحدة" icon={Home} value={filters.unitType} onChange={handleInputChange} options={[{ label: 'الكل', value: '' }, { label: 'شقة', value: 'شقة' }, { label: 'فيلا', value: 'فيلا' }, { label: 'دور', value: 'دور' }]} />
                            <SelectField name="direction" label="الاتجاه" icon={MapPin} value={filters.direction} onChange={handleInputChange} options={[{ label: 'شمال', value: 'شمال' }, { label: 'جنوب', value: 'جنوب' }, { label: 'شرق', value: 'شرق' }, { label: 'غرب', value: 'غرب' }]} />
                            <Combobox label="الحي المفضل" icon={Search} value={filters.district} onChange={(val) => setFilters(prev => ({ ...prev, district: val }))} options={districts} placeholder="ابحث عن حي..." />

                            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-10 pt-6 border-t border-purple-50">
                                <SliderInput label="أقصى ميزانية" icon={DollarSign} value={filters.maxPrice} onChange={(val) => setFilters(prev => ({ ...prev, maxPrice: val }))} min={500000} max={5000000} step={50000} unit="ر.س" shortcuts={[800000, 1200000, 1500000, 2500000]} />
                                <SliderInput label="أقل مساحة" icon={Maximize} value={filters.minArea} onChange={(val) => setFilters(prev => ({ ...prev, minArea: val }))} min={100} max={1000} step={10} unit="م²" shortcuts={[150, 200, 250, 350]} />
                            </div>
                        </div>

                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 font-bold text-center animate-in fade-in slide-in-from-top-2">
                                {error}
                            </div>
                        )}

                        <button
                            onClick={handleSearch}
                            disabled={loading}
                            className="w-full h-20 bg-gradient-to-r from-[#7434bc] to-[#924cd6] hover:brightness-110 active:scale-[0.99] transition-all duration-300 rounded-[2rem] text-white text-2xl font-black shadow-xl shadow-[#7434bc]/30 flex items-center justify-center gap-4 disabled:opacity-70 disabled:grayscale group"
                        >
                            {loading ? (
                                <>
                                    <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                                    جاري تهيئة النتائج...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-7 h-7 group-hover:rotate-12 transition-transform" />
                                    ابحث عن عقارك
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {hasSearched && results.length > 0 && (
                    <div ref={resultsRef} className="w-full max-w-7xl animate-in fade-in slide-in-from-bottom-12 duration-1000 fill-mode-forwards pb-24 scroll-mt-6">
                        <div className="flex justify-between items-end mb-8 px-6">
                            <div>
                                <h2 className="text-3xl font-black text-[#2d1b4e] mb-1">ترشيحات نَصِل</h2>
                                <p className="text-slate-500 font-medium">وجدنا لك {results.length} مشروع مطابق لمعاييرك</p>
                            </div>
                            <button onClick={() => { setHasSearched(false); setResults([]) }} className="px-6 py-3 bg-white hover:bg-slate-50 text-slate-400 hover:text-red-500 rounded-2xl text-sm font-bold transition-colors flex items-center gap-2 shadow-sm border border-slate-100">
                                <ArrowLeft className="w-4 h-4" />
                                بحث جديد
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {results.map((project, idx) => (
                                <div key={idx} style={{ animationDelay: `${idx * 150}ms` }} className="animate-in fade-in slide-in-from-bottom-8 fill-mode-forwards">
                                    <ResultCard project={project} onClick={() => setSelectedProject(project)} />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default App;
