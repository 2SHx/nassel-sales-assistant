
import React, { useState } from 'react';
import { Search, Sliders, X } from 'lucide-react';
import { FilterDropdown } from './FilterDropdown';
import { PriceRangeFilter } from './PriceRangeFilter';
import { BedroomsFilter } from './BedroomsFilter';
import { AreaFilter } from './AreaFilter';

export interface FilterState {
    searchTerm: string;
    type: string;
    status: string;
    unitType: string;
    direction: string;
    district: string;
    minPrice: number | null;
    maxPrice: number | null;
    bedrooms: number | null;
    minArea: number | null;
    maxArea: number | null;
}

interface FloatingFilterBarProps {
    onFilterChange: (filters: FilterState) => void;
    className?: string;
    projects: import('../../services/projects').MapProject[];
}

export const FloatingFilterBar: React.FC<FloatingFilterBarProps> = ({ onFilterChange, className, projects }) => {
    const [filters, setFilters] = useState<FilterState>({
        searchTerm: '',
        type: 'الكل',
        status: 'الكل',
        unitType: 'الكل',
        direction: 'الكل',
        district: 'الكل',
        minPrice: null,
        maxPrice: null,
        bedrooms: null,
        minArea: null,
        maxArea: null,
    });

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const updateFilter = (updates: Partial<FilterState>) => {
        const newFilters = { ...filters, ...updates };
        setFilters(newFilters);
        onFilterChange(newFilters);
    };

    // Calculate Dynamic Bounds and Options from Data
    const minPrice = projects.length > 0 ? Math.min(...projects.map(p => p.min_available_price)) : 0;
    const maxPrice = projects.length > 0 ? Math.max(...projects.map(p => p.max_available_price || p.min_available_price)) : 1000000;

    const minArea = projects.length > 0 ? Math.min(...projects.map(p => p.min_available_area)) : 50;
    const maxArea = projects.length > 0 ? Math.max(...projects.map(p => p.max_available_area || p.min_available_area)) : 1000;

    // Get unique available options
    const uniqueDirections = Array.from(new Set(projects.map(p => p.direction).filter(Boolean))).sort();
    const uniqueDistricts = Array.from(new Set(projects.map(p => p.district).filter(Boolean))).sort();

    const activeFilterCount = [
        filters.type !== 'الكل',
        filters.status !== 'الكل',
        filters.unitType !== 'الكل',
        filters.direction !== 'الكل',
        filters.district !== 'الكل',
        filters.minPrice !== null || filters.maxPrice !== null,
        filters.bedrooms !== null,
        filters.minArea !== null || filters.maxArea !== null
    ].filter(Boolean).length;

    return (
        <>
            {/* Desktop / Tablet Bar */}
            <div className={`hidden lg:flex absolute top-6 left-1/2 -translate-x-1/2 w-[95%] max-w-7xl h-20 bg-white/90 backdrop-blur-xl border border-white/50 shadow-2xl hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] rounded-[2rem] px-4 items-center gap-4 transition-all z-20 ${className}`}>

                {/* Search Input */}
                <div className="w-64 relative group h-12 flex items-center bg-slate-50 rounded-xl border border-slate-100 focus-within:border-[#7434bc] focus-within:ring-2 focus-within:ring-[#7434bc]/10 transition-all">
                    <Search className="absolute right-4 w-5 h-5 text-slate-400 group-focus-within:text-[#7434bc]" />
                    <input
                        type="text"
                        placeholder="ابحث باسم المشروع..."
                        value={filters.searchTerm}
                        onChange={(e) => updateFilter({ searchTerm: e.target.value })}
                        className="w-full h-full bg-transparent border-none outline-none pr-12 pl-4 text-slate-800 font-bold placeholder:font-medium text-sm rounded-xl"
                    />
                </div>

                {/* Vertical Divider */}
                <div className="h-8 w-px bg-slate-200" />

                {/* Filters Row */}
                <div className="flex-1 flex items-center gap-2 py-2 overflow-x-auto no-scrollbar">
                    <FilterDropdown
                        label="الاتجاه"
                        options={['الكل', ...uniqueDirections]}
                        value={filters.direction}
                        onChange={(val) => updateFilter({ direction: val })}
                    />
                    <FilterDropdown
                        label="الحي"
                        options={['الكل', ...uniqueDistricts]}
                        value={filters.district}
                        onChange={(val) => updateFilter({ district: val })}
                    />
                    <FilterDropdown
                        label="نوع المشروع"
                        options={['الكل', 'سكني', 'تجاري', 'إداري']}
                        value={filters.type}
                        onChange={(val) => updateFilter({ type: val })}
                    />
                    <FilterDropdown
                        label="نوع الوحدة"
                        options={['الكل', 'فيلا', 'شقة', 'دوبلكس', 'تاون هاوس']}
                        value={filters.unitType}
                        onChange={(val) => updateFilter({ unitType: val })}
                    />
                    <FilterDropdown
                        label="الحالة"
                        options={['الكل', 'متاح', 'محدود', 'مباع']}
                        value={filters.status}
                        onChange={(val) => updateFilter({ status: val })}
                    />
                    <PriceRangeFilter
                        minPrice={filters.minPrice}
                        maxPrice={filters.maxPrice}
                        onChange={(min, max) => updateFilter({ minPrice: min, maxPrice: max })}
                        absoluteMin={minPrice}
                        absoluteMax={maxPrice}
                    />
                    <AreaFilter
                        minArea={filters.minArea}
                        maxArea={filters.maxArea}
                        onChange={(min, max) => updateFilter({ minArea: min, maxArea: max })}
                        absoluteMin={minArea}
                        absoluteMax={maxArea}
                    />
                </div>

                {/* Bedrooms (Right aligned mostly) */}
                <div className="pl-2 border-r border-slate-200 pr-4">
                    <BedroomsFilter
                        value={filters.bedrooms}
                        onChange={(val) => updateFilter({ bedrooms: val })}
                    />
                </div>
            </div>

            {/* Mobile Fab */}
            <div className="lg:hidden absolute top-4 left-4 z-20">
                <button
                    onClick={() => setIsMobileMenuOpen(true)}
                    className="h-12 px-6 bg-white/90 backdrop-blur-md rounded-full shadow-lg border border-white/50 flex items-center gap-2 text-slate-800 font-black"
                >
                    <Sliders className="w-4 h-4" />
                    <span>تصفية</span>
                    {activeFilterCount > 0 && (
                        <span className="w-5 h-5 bg-[#7434bc] text-white rounded-full text-[10px] flex items-center justify-center">{activeFilterCount}</span>
                    )}
                </button>
            </div>

            {/* Mobile Overlay */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-50 bg-white/95 backdrop-blur-xl p-6 animate-in slide-in-from-bottom-10 overflow-y-auto">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-3xl font-black text-slate-900">تصفية النتائج</h2>
                        <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 bg-slate-100 rounded-full">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="space-y-8 pb-20">
                        <div>
                            <label className="text-sm font-bold text-slate-400 mb-4 block">البحث</label>
                            <input
                                type="text"
                                value={filters.searchTerm}
                                onChange={(e) => updateFilter({ searchTerm: e.target.value })}
                                placeholder="اسم المشروع..."
                                className="w-full h-14 bg-slate-100 rounded-2xl px-4 font-bold outline-none"
                            />
                        </div>

                        <div className="space-y-4">
                            <label className="text-sm font-bold text-slate-400 block">التصنيف</label>
                            <div className="flex flex-wrap gap-2">
                                <FilterDropdown
                                    label="نوع المشروع"
                                    options={['الكل', 'سكني', 'تجاري', 'إداري']}
                                    value={filters.type}
                                    onChange={(val) => updateFilter({ type: val })}
                                />
                                <FilterDropdown
                                    label="نوع الوحدة"
                                    options={['الكل', 'فيلا', 'شقة', 'دوبلكس', 'تاون هاوس']}
                                    value={filters.unitType}
                                    onChange={(val) => updateFilter({ unitType: val })}
                                />
                                <FilterDropdown
                                    label="الحالة"
                                    options={['الكل', 'متاح', 'محدود', 'مباع']}
                                    value={filters.status}
                                    onChange={(val) => updateFilter({ status: val })}
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="text-sm font-bold text-slate-400 block">النطاق السعري و المساحة</label>
                            <div className="flex flex-col gap-4">
                                <PriceRangeFilter
                                    minPrice={filters.minPrice}
                                    maxPrice={filters.maxPrice}
                                    onChange={(min, max) => updateFilter({ minPrice: min, maxPrice: max })}
                                    absoluteMin={minPrice}
                                    absoluteMax={maxPrice}
                                />
                                <AreaFilter
                                    minArea={filters.minArea}
                                    maxArea={filters.maxArea}
                                    onChange={(min, max) => updateFilter({ minArea: min, maxArea: max })}
                                    absoluteMin={minArea}
                                    absoluteMax={maxArea}
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="text-sm font-bold text-slate-400 block">عدد الغرف</label>
                            <BedroomsFilter
                                value={filters.bedrooms}
                                onChange={(val) => updateFilter({ bedrooms: val })}
                            />
                        </div>

                        <button
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="w-full h-16 bg-[#7434bc] text-white rounded-2xl font-black text-lg shadow-xl mt-8"
                        >
                            إظهار النتائج
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};
