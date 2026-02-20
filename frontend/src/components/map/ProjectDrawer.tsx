import React, { useState, useEffect, useMemo } from 'react';
import {
    X, Home, DollarSign, MapPin, FileText, Image as ImageIcon,
    Loader2, ChevronDown, ChevronUp, Bed, Bath, Maximize,
    Building2, Layers, Video, ExternalLink, Compass, Tag,
    BarChart3, TrendingUp, Ruler, SlidersHorizontal
} from 'lucide-react';
import { MapProject } from '../../services/projects';
import { fetchUnitsByProject } from '../../services/units';
import { Unit } from '../../types';

// ─── Types ──────────────────────────────────────────────────────
interface ProjectDrawerProps {
    project: MapProject | null;
    onClose: () => void;
}

type TabKey = 'overview' | 'units' | 'media';
type UnitFilter = 'الكل' | 'متاحة' | 'مباعة' | 'محجوزة';

// ─── Helper Components ──────────────────────────────────────────

const StatCard: React.FC<{ label: string; value: string | number; icon: React.ReactNode; accent?: boolean }> = ({ label, value, icon, accent }) => (
    <div className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-2xl transition-all ${accent ? 'bg-purple-50 border border-purple-100' : 'bg-slate-50 border border-slate-100'}`}>
        <div className={`${accent ? 'text-[#7434bc]' : 'text-slate-400'}`}>{icon}</div>
        <span className={`text-[15px] font-black ${accent ? 'text-[#7434bc]' : 'text-slate-800'}`}>{value}</span>
        <span className="text-[10px] text-slate-400 font-bold">{label}</span>
    </div>
);

const InfoRow: React.FC<{ label: string; value: string | number | undefined; icon?: React.ReactNode }> = ({ label, value, icon }) => (
    <div className="flex justify-between items-center py-2.5 border-b border-slate-100/80 last:border-0">
        <div className="flex items-center gap-2">
            {icon && <span className="text-slate-300">{icon}</span>}
            <span className="text-xs font-medium text-slate-500">{label}</span>
        </div>
        <span className="text-sm font-bold text-slate-800">{value || '—'}</span>
    </div>
);

const FilterChip: React.FC<{ label: string; count: number; active: boolean; onClick: () => void; color?: string }> = ({ label, count, active, onClick, color }) => (
    <button
        onClick={onClick}
        className={`
            px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-200
            flex items-center gap-1.5
            ${active
                ? `${color || 'bg-[#7434bc]'} text-white shadow-sm`
                : 'bg-white text-slate-500 border border-slate-200 hover:border-slate-300 hover:bg-slate-50'
            }
        `}
    >
        {label}
        <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${active ? 'bg-white/20' : 'bg-slate-100 text-slate-400'}`}>
            {count}
        </span>
    </button>
);

// ─── Unit Card ──────────────────────────────────────────────────

const UnitCard: React.FC<{ unit: Unit; index: number }> = ({ unit, index }) => {
    const [expanded, setExpanded] = useState(false);

    const statusConfig: Record<string, { bg: string; text: string; dot: string }> = {
        'متاحة': { bg: 'bg-emerald-50', text: 'text-emerald-600', dot: 'bg-emerald-400' },
        'متاح': { bg: 'bg-emerald-50', text: 'text-emerald-600', dot: 'bg-emerald-400' },
        'محجوزة': { bg: 'bg-amber-50', text: 'text-amber-600', dot: 'bg-amber-400' },
        'محجوز': { bg: 'bg-amber-50', text: 'text-amber-600', dot: 'bg-amber-400' },
        'مباعة': { bg: 'bg-red-50', text: 'text-red-500', dot: 'bg-red-400' },
        'مباع': { bg: 'bg-red-50', text: 'text-red-500', dot: 'bg-red-400' },
    };
    const status = statusConfig[unit.unit_status] || { bg: 'bg-slate-50', text: 'text-slate-500', dot: 'bg-slate-400' };

    const components = unit.unit_components ? unit.unit_components.split(',').map(c => c.trim()).filter(Boolean) : [];

    return (
        <div
            className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-purple-200/60 transition-all duration-300 overflow-hidden group"
            style={{ animationDelay: `${index * 50}ms` }}
        >
            {/* Card Header */}
            <div className="p-4">
                <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 bg-gradient-to-br from-purple-500 to-purple-700 text-white rounded-xl flex items-center justify-center font-black text-sm shadow-sm shadow-purple-200">
                            {unit.unit_number_in_project || index + 1}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-800 text-sm">{unit.unit_type}</span>
                                {unit.unit_model && (
                                    <span className="px-1.5 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-mono rounded">
                                        {unit.unit_model}
                                    </span>
                                )}
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">{unit.unit_code}</span>
                        </div>
                    </div>
                    <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${status.bg} ${status.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`}></span>
                        {unit.unit_status}
                    </span>
                </div>

                {/* Key Specs Row */}
                <div className="flex items-center gap-3 text-xs text-slate-500 bg-slate-50 rounded-xl p-2.5">
                    {unit.bedrooms > 0 && (
                        <div className="flex items-center gap-1">
                            <Bed className="w-3.5 h-3.5 text-slate-400" />
                            <span className="font-bold text-slate-700">{unit.bedrooms}</span>
                            <span className="text-slate-400">غرف</span>
                        </div>
                    )}
                    {unit.bedrooms > 0 && unit.bathrooms > 0 && <span className="text-slate-200">|</span>}
                    {unit.bathrooms > 0 && (
                        <div className="flex items-center gap-1">
                            <Bath className="w-3.5 h-3.5 text-slate-400" />
                            <span className="font-bold text-slate-700">{unit.bathrooms}</span>
                        </div>
                    )}
                    {(unit.bedrooms > 0 || unit.bathrooms > 0) && unit.unit_area > 0 && <span className="text-slate-200">|</span>}
                    {unit.unit_area > 0 && (
                        <div className="flex items-center gap-1">
                            <Maximize className="w-3.5 h-3.5 text-slate-400" />
                            <span className="font-bold text-slate-700" dir="ltr">{unit.unit_area}</span>
                            <span className="text-slate-400">م²</span>
                        </div>
                    )}
                    {unit.floor > 0 && (
                        <>
                            <span className="text-slate-200">|</span>
                            <div className="flex items-center gap-1">
                                <Layers className="w-3.5 h-3.5 text-slate-400" />
                                <span className="text-slate-400">طابق</span>
                                <span className="font-bold text-slate-700">{unit.floor}</span>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Price + Expand Row */}
            <div className="border-t border-slate-50 px-4 py-3 flex justify-between items-center">
                <div>
                    <span className="text-[10px] text-slate-400 font-medium">السعر</span>
                    <div className="font-black text-[#7434bc] text-lg leading-tight">
                        {unit.total_price ? Number(unit.total_price).toLocaleString() : 'اتصل بنا'}
                        {unit.total_price ? <span className="text-[10px] text-slate-400 mr-1 font-medium">ر.س</span> : null}
                    </div>
                </div>
                <button
                    onClick={() => setExpanded(!expanded)}
                    className="flex items-center gap-1 text-xs text-slate-400 hover:text-[#7434bc] transition-colors font-bold"
                >
                    {expanded ? 'إخفاء' : 'التفاصيل'}
                    {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
            </div>

            {/* Expanded Details */}
            {expanded && (
                <div className="border-t border-slate-100 bg-slate-50/50 p-4 space-y-3 animate-fade-in-up">
                    {/* Detailed Specs Grid */}
                    <div className="grid grid-cols-2 gap-2">
                        {unit.unit_area > 0 && (
                            <div className="bg-white rounded-xl p-2.5 border border-slate-100">
                                <span className="text-[10px] text-slate-400 block">المساحة</span>
                                <span className="text-sm font-bold text-slate-800" dir="ltr">{unit.unit_area} م²</span>
                            </div>
                        )}
                        {unit.private_area > 0 && (
                            <div className="bg-white rounded-xl p-2.5 border border-slate-100">
                                <span className="text-[10px] text-slate-400 block">مساحة خاصة</span>
                                <span className="text-sm font-bold text-slate-800" dir="ltr">{unit.private_area} م²</span>
                            </div>
                        )}
                        {unit.yard_area && Number(unit.yard_area) > 0 && (
                            <div className="bg-white rounded-xl p-2.5 border border-slate-100">
                                <span className="text-[10px] text-slate-400 block">مساحة الفناء</span>
                                <span className="text-sm font-bold text-slate-800" dir="ltr">{unit.yard_area} م²</span>
                            </div>
                        )}
                        {unit.elevator_status && (
                            <div className="bg-white rounded-xl p-2.5 border border-slate-100">
                                <span className="text-[10px] text-slate-400 block">المصعد</span>
                                <span className="text-sm font-bold text-slate-800">{unit.elevator_status}</span>
                            </div>
                        )}
                        {unit.building_number && (
                            <div className="bg-white rounded-xl p-2.5 border border-slate-100">
                                <span className="text-[10px] text-slate-400 block">رقم المبنى</span>
                                <span className="text-sm font-bold text-slate-800">{unit.building_number}</span>
                            </div>
                        )}
                        {unit.facade && (
                            <div className="bg-white rounded-xl p-2.5 border border-slate-100">
                                <span className="text-[10px] text-slate-400 block">الواجهة</span>
                                <span className="text-sm font-bold text-slate-800">{unit.facade}</span>
                            </div>
                        )}
                    </div>

                    {/* Components */}
                    {components.length > 0 && (
                        <div>
                            <span className="text-[10px] text-slate-400 font-bold mb-2 block">مكونات الوحدة</span>
                            <div className="flex flex-wrap gap-1.5">
                                {components.map((c, i) => (
                                    <span key={i} className="px-2 py-1 bg-white border border-slate-100 text-slate-600 text-[10px] rounded-lg font-medium">
                                        {c}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Features */}
                    {unit.features && (
                        <div>
                            <span className="text-[10px] text-slate-400 font-bold mb-2 block">المميزات</span>
                            <p className="text-xs text-slate-600 leading-relaxed">{unit.features}</p>
                        </div>
                    )}

                    {/* Unit Brochure */}
                    {unit.unit_brochure_url && (
                        <a
                            href={unit.unit_brochure_url}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center justify-center gap-2 py-2.5 bg-white hover:bg-purple-50 border border-slate-200 hover:border-purple-200 text-slate-600 hover:text-[#7434bc] rounded-xl text-xs font-bold transition-all"
                        >
                            <FileText className="w-4 h-4" />
                            بروشور الوحدة
                            <ExternalLink className="w-3 h-3" />
                        </a>
                    )}
                </div>
            )}
        </div>
    );
};

// ─── Main Drawer ────────────────────────────────────────────────

export const ProjectDrawer: React.FC<ProjectDrawerProps> = ({ project, onClose }) => {
    const [units, setUnits] = useState<Unit[]>([]);
    const [loadingUnits, setLoadingUnits] = useState(false);
    const [activeTab, setActiveTab] = useState<TabKey>('overview');
    const [unitFilter, setUnitFilter] = useState<UnitFilter>('الكل');

    useEffect(() => {
        if (!project) return;
        setActiveTab('overview');
        setUnitFilter('الكل');

        const loadUnits = async () => {
            setLoadingUnits(true);
            try {
                const data = await fetchUnitsByProject(project.project_id);
                setUnits(data);
            } catch (err) {
                console.error("Failed to load units", err);
            } finally {
                setLoadingUnits(false);
            }
        };
        loadUnits();
    }, [project]);

    // ── Derived data ──
    const unitCounts = useMemo(() => {
        const available = units.filter(u => u.unit_status === 'متاحة' || u.unit_status === 'متاح').length;
        const sold = units.filter(u => u.unit_status === 'مباعة' || u.unit_status === 'مباع').length;
        const reserved = units.filter(u => u.unit_status === 'محجوزة' || u.unit_status === 'محجوز').length;
        return { all: units.length, available, sold, reserved };
    }, [units]);

    const filteredUnits = useMemo(() => {
        if (unitFilter === 'الكل') return units;
        return units.filter(u => {
            if (unitFilter === 'متاحة') return u.unit_status === 'متاحة' || u.unit_status === 'متاح';
            if (unitFilter === 'مباعة') return u.unit_status === 'مباعة' || u.unit_status === 'مباع';
            if (unitFilter === 'محجوزة') return u.unit_status === 'محجوزة' || u.unit_status === 'محجوز';
            return true;
        });
    }, [units, unitFilter]);

    // ── Formatters ──
    const fmt = (val: number | undefined | null) => {
        if (!val || val === 0) return '—';
        return Number(val).toLocaleString();
    };

    const fmtPrice = (val: number | undefined | null) => {
        if (!val || val === 0) return '—';
        if (val >= 1000000) return (val / 1000000).toFixed(1) + 'M';
        return (val / 1000).toFixed(0) + 'K';
    };

    const salesPercentage = useMemo(() => {
        if (unitCounts.all === 0) return 0;
        return Math.round((unitCounts.sold / unitCounts.all) * 100);
    }, [unitCounts]);

    if (!project) return null;

    // ── Tabs config ──
    const tabs: { key: TabKey; label: string; icon: React.ReactNode }[] = [
        { key: 'overview', label: 'نظرة عامة', icon: <BarChart3 className="w-4 h-4" /> },
        { key: 'units', label: `الوحدات`, icon: <Home className="w-4 h-4" /> },
        { key: 'media', label: 'الوسائط', icon: <ImageIcon className="w-4 h-4" /> },
    ];

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30 transition-opacity duration-300"
                onClick={onClose}
            />

            {/* Drawer Panel */}
            <div
                className="fixed inset-y-0 left-0 w-full md:w-[480px] bg-[#f8fafc] shadow-2xl z-40 overflow-hidden flex flex-col drawer-slide-in"
                dir="rtl"
            >
                {/* ── Hero Header ── */}
                <div className="relative h-52 flex-shrink-0">
                    <img
                        src={project.project_image || "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&auto=format&fit=crop&q=60"}
                        alt={project.project_name}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />

                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2.5 bg-white/15 hover:bg-white/25 rounded-xl text-white backdrop-blur-md transition-all z-10 border border-white/10"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    {/* Header Content */}
                    <div className="absolute bottom-0 right-0 left-0 p-5">
                        <div className="flex items-center gap-2 mb-2">
                            {project.developer && (
                                <span className="px-2.5 py-0.5 bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 text-[10px] font-bold rounded-full backdrop-blur-sm">
                                    {project.developer}
                                </span>
                            )}
                            <span className={`px-2.5 py-0.5 border text-[10px] font-bold rounded-full backdrop-blur-sm ${project.project_status === 'متاح' ? 'bg-emerald-500/20 border-emerald-400/30 text-emerald-200'
                                : project.project_status === 'مباعة' ? 'bg-red-500/20 border-red-400/30 text-red-200'
                                    : 'bg-white/15 border-white/20 text-white/80'
                                }`}>
                                {project.project_status}
                            </span>
                            {project.project_type && (
                                <span className="px-2.5 py-0.5 bg-white/10 border border-white/15 text-white/70 text-[10px] font-bold rounded-full backdrop-blur-sm">
                                    {project.project_type}
                                </span>
                            )}
                        </div>
                        <h2 className="text-2xl font-black text-white mb-1 leading-tight">{project.project_name}</h2>
                        <div className="flex items-center gap-1.5 text-slate-300 text-xs">
                            <MapPin className="w-3.5 h-3.5" />
                            <span>{[project.district, project.city].filter(Boolean).join('، ')}</span>
                        </div>
                    </div>
                </div>

                {/* ── Quick Stats ── */}
                <div className="bg-white px-4 py-3 shadow-sm border-b border-slate-100 flex-shrink-0 -mt-3 rounded-t-3xl relative z-10">
                    <div className="grid grid-cols-4 gap-2">
                        <StatCard
                            label="يبدأ من"
                            value={fmtPrice(project.min_available_price || project.min_price)}
                            icon={<DollarSign className="w-4 h-4" />}
                            accent
                        />
                        <StatCard
                            label="الوحدات"
                            value={loadingUnits ? '...' : unitCounts.all}
                            icon={<Home className="w-4 h-4" />}
                        />
                        <StatCard
                            label="المساحة"
                            value={project.min_available_area > 0 ? `${fmt(project.min_available_area)}` : '—'}
                            icon={<Maximize className="w-4 h-4" />}
                        />
                        <StatCard
                            label="الغرف"
                            value={project.min_available_bedrooms > 0 ? `${project.min_available_bedrooms}-${project.max_available_bedrooms}` : '—'}
                            icon={<Bed className="w-4 h-4" />}
                        />
                    </div>
                </div>

                {/* ── Tab Navigation ── */}
                <div className="bg-white border-b border-slate-100 flex-shrink-0 px-4">
                    <div className="flex gap-1">
                        {tabs.map(tab => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`
                                    flex items-center gap-1.5 px-4 py-3 text-xs font-bold rounded-t-xl transition-all relative
                                    ${activeTab === tab.key
                                        ? 'text-[#7434bc] bg-purple-50/50'
                                        : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                                    }
                                `}
                            >
                                {tab.icon}
                                {tab.label}
                                {tab.key === 'units' && !loadingUnits && (
                                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${activeTab === 'units' ? 'bg-[#7434bc]/10 text-[#7434bc]' : 'bg-slate-100 text-slate-400'
                                        }`}>
                                        {unitCounts.all}
                                    </span>
                                )}
                                {activeTab === tab.key && (
                                    <span className="absolute bottom-0 left-2 right-2 h-[2px] bg-[#7434bc] rounded-full" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ── Tab Content ── */}
                <div className="flex-1 overflow-y-auto">
                    <div className="p-4">
                        {/* ─────── OVERVIEW TAB ─────── */}
                        {activeTab === 'overview' && (
                            <div className="space-y-4 animate-fade-in-up">
                                {/* Marketing Pitch */}
                                {project.marketing_pitch && (
                                    <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
                                        <div className="flex items-center gap-2 mb-3">
                                            <FileText className="w-4 h-4 text-[#7434bc]" />
                                            <h3 className="font-bold text-slate-800 text-sm">نبذة عن المشروع</h3>
                                        </div>
                                        <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                                            {project.marketing_pitch}
                                        </p>
                                    </div>
                                )}

                                {/* Project Specs Grid */}
                                <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
                                    <div className="flex items-center gap-2 mb-3">
                                        <SlidersHorizontal className="w-4 h-4 text-[#7434bc]" />
                                        <h3 className="font-bold text-slate-800 text-sm">تفاصيل المشروع</h3>
                                    </div>
                                    <div className="space-y-0">
                                        <InfoRow label="المطور العقاري" value={project.developer} icon={<Building2 className="w-3.5 h-3.5" />} />
                                        <InfoRow label="كود المشروع" value={project.project_code} icon={<Tag className="w-3.5 h-3.5" />} />
                                        <InfoRow label="نوع الوحدات" value={project.unit_types || 'سكني'} icon={<Home className="w-3.5 h-3.5" />} />
                                        <InfoRow label="الاتجاه" value={project.direction} icon={<Compass className="w-3.5 h-3.5" />} />
                                        <InfoRow label="عدد الغرف" value={project.min_available_bedrooms > 0 ? `${project.min_available_bedrooms} - ${project.max_available_bedrooms}` : undefined} icon={<Bed className="w-3.5 h-3.5" />} />
                                        <InfoRow
                                            label="مساحات البناء"
                                            value={project.min_available_area > 0 ? `${fmt(project.min_available_area)} - ${fmt(project.max_available_area)} م²` : undefined}
                                            icon={<Ruler className="w-3.5 h-3.5" />}
                                        />
                                    </div>
                                </div>

                                {/* Facilities */}
                                {project.facilities && (
                                    <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
                                        <div className="flex items-center gap-2 mb-3">
                                            <Layers className="w-4 h-4 text-[#7434bc]" />
                                            <h3 className="font-bold text-slate-800 text-sm">المميزات والمرافق</h3>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {project.facilities.split(',').map((f: string, i: number) => (
                                                <span key={i} className="px-3 py-1.5 bg-purple-50 border border-purple-100 text-purple-700 text-[11px] rounded-lg font-medium">
                                                    {f.trim()}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Sales Progress + Financial */}
                                <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
                                    <div className="flex items-center gap-2 mb-3">
                                        <TrendingUp className="w-4 h-4 text-[#7434bc]" />
                                        <h3 className="font-bold text-slate-800 text-sm">البيانات المالية</h3>
                                    </div>

                                    {/* Sales Progress Bar */}
                                    {unitCounts.all > 0 && (
                                        <div className="mb-4">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-xs text-slate-500 font-medium">نسبة البيع</span>
                                                <span className="text-sm font-black text-[#7434bc]">{salesPercentage}%</span>
                                            </div>
                                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-l from-[#7434bc] to-purple-400 rounded-full transition-all duration-1000 ease-out"
                                                    style={{ width: `${salesPercentage}%` }}
                                                />
                                            </div>
                                            <div className="flex justify-between mt-2 text-[10px] text-slate-400">
                                                <div className="flex items-center gap-1">
                                                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                                                    متاحة {unitCounts.available}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                                                    محجوزة {unitCounts.reserved}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <span className="w-2 h-2 rounded-full bg-red-400"></span>
                                                    مباعة {unitCounts.sold}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Price Range */}
                                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs font-bold text-slate-500">نطاق الأسعار</span>
                                            <span className="text-sm font-black text-slate-800" dir="ltr">
                                                {fmt(project.min_available_price || project.min_price)} — {fmt(project.max_available_price || project.max_price)}
                                                <span className="text-[10px] text-slate-400 mr-1">ر.س</span>
                                            </span>
                                        </div>
                                        {project.avg_available_unit_price > 0 && (
                                            <div className="flex justify-between items-center mt-2.5 pt-2.5 border-t border-slate-200/60">
                                                <span className="text-xs font-medium text-slate-500">متوسط السعر</span>
                                                <span className="text-sm font-bold text-slate-700" dir="ltr">
                                                    {fmt(project.avg_available_unit_price)}
                                                    <span className="text-[10px] text-slate-400 mr-1">ر.س</span>
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ─────── UNITS TAB ─────── */}
                        {activeTab === 'units' && (
                            <div className="space-y-4 animate-fade-in-up">
                                {/* Filter Chips */}
                                <div className="flex flex-wrap gap-2">
                                    <FilterChip
                                        label="الكل"
                                        count={unitCounts.all}
                                        active={unitFilter === 'الكل'}
                                        onClick={() => setUnitFilter('الكل')}
                                    />
                                    <FilterChip
                                        label="متاحة"
                                        count={unitCounts.available}
                                        active={unitFilter === 'متاحة'}
                                        onClick={() => setUnitFilter('متاحة')}
                                        color="bg-emerald-500"
                                    />
                                    <FilterChip
                                        label="محجوزة"
                                        count={unitCounts.reserved}
                                        active={unitFilter === 'محجوزة'}
                                        onClick={() => setUnitFilter('محجوزة')}
                                        color="bg-amber-500"
                                    />
                                    <FilterChip
                                        label="مباعة"
                                        count={unitCounts.sold}
                                        active={unitFilter === 'مباعة'}
                                        onClick={() => setUnitFilter('مباعة')}
                                        color="bg-red-500"
                                    />
                                </div>

                                {/* Units List */}
                                {loadingUnits ? (
                                    <div className="flex flex-col items-center justify-center py-16 gap-3">
                                        <Loader2 className="w-8 h-8 animate-spin text-[#7434bc]" />
                                        <span className="text-sm text-slate-400 font-medium">جاري تحميل الوحدات...</span>
                                    </div>
                                ) : filteredUnits.length > 0 ? (
                                    <div className="space-y-3">
                                        {filteredUnits.map((unit, idx) => (
                                            <UnitCard key={unit.unit_code || idx} unit={unit} index={idx} />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-200">
                                        <Home className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                                        <span className="text-slate-400 text-sm block">
                                            {units.length === 0
                                                ? 'لا توجد بيانات وحدات متوفرة لهذا المشروع'
                                                : 'لا توجد وحدات تطابق الفلتر المحدد'
                                            }
                                        </span>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ─────── MEDIA TAB ─────── */}
                        {activeTab === 'media' && (
                            <div className="space-y-3 animate-fade-in-up">
                                {project.location_url && (
                                    <a
                                        href={project.location_url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-purple-200 transition-all group"
                                    >
                                        <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                                            <MapPin className="w-6 h-6" />
                                        </div>
                                        <div className="flex-1">
                                            <span className="font-bold text-slate-800 text-sm block">الموقع على الخريطة</span>
                                            <span className="text-[11px] text-slate-400">فتح في خرائط جوجل</span>
                                        </div>
                                        <ExternalLink className="w-4 h-4 text-slate-300 group-hover:text-[#7434bc] transition-colors" />
                                    </a>
                                )}

                                {project.brochure_url && (
                                    <a
                                        href={project.brochure_url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-purple-200 transition-all group"
                                    >
                                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                                            <FileText className="w-6 h-6" />
                                        </div>
                                        <div className="flex-1">
                                            <span className="font-bold text-slate-800 text-sm block">البروشور</span>
                                            <span className="text-[11px] text-slate-400">تحميل ملف المشروع</span>
                                        </div>
                                        <ExternalLink className="w-4 h-4 text-slate-300 group-hover:text-[#7434bc] transition-colors" />
                                    </a>
                                )}

                                {project.videos_url && (
                                    <a
                                        href={project.videos_url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-purple-200 transition-all group"
                                    >
                                        <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center group-hover:bg-purple-100 transition-colors">
                                            <Video className="w-6 h-6" />
                                        </div>
                                        <div className="flex-1">
                                            <span className="font-bold text-slate-800 text-sm block">الفيديوهات</span>
                                            <span className="text-[11px] text-slate-400">مشاهدة فيديوهات المشروع</span>
                                        </div>
                                        <ExternalLink className="w-4 h-4 text-slate-300 group-hover:text-[#7434bc] transition-colors" />
                                    </a>
                                )}

                                {project.images_url && (
                                    <a
                                        href={project.images_url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-purple-200 transition-all group"
                                    >
                                        <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center group-hover:bg-rose-100 transition-colors">
                                            <ImageIcon className="w-6 h-6" />
                                        </div>
                                        <div className="flex-1">
                                            <span className="font-bold text-slate-800 text-sm block">الصور</span>
                                            <span className="text-[11px] text-slate-400">عرض صور المشروع</span>
                                        </div>
                                        <ExternalLink className="w-4 h-4 text-slate-300 group-hover:text-[#7434bc] transition-colors" />
                                    </a>
                                )}

                                {/* No media fallback */}
                                {!project.location_url && !project.brochure_url && !project.videos_url && !project.images_url && (
                                    <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-200">
                                        <ImageIcon className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                                        <span className="text-slate-400 text-sm">لا توجد وسائط متاحة لهذا المشروع</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};
