import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Sparkles, MapPin, Home, DollarSign, Maximize, Search } from 'lucide-react';
import { Project, SearchFilters } from '../types';
import Combobox from '../components/ui/Combobox';
import SelectField from '../components/ui/SelectField';
import SliderInput from '../components/ui/SliderInput';
import ProjectModal from '../components/ui/ProjectModal';
import ResultCard from '../components/ui/ResultCard';
import { fetchProjects, MapProject } from '../services/projects';

const SearchProjects: React.FC = () => {
    const [filters, setFilters] = useState<SearchFilters>({
        unitType: '', direction: '', region: 'الرياض', district: '', maxPrice: 5000000, minArea: 0
    });

    const [allProjects, setAllProjects] = useState<MapProject[]>([]);
    const [districts, setDistricts] = useState<string[]>([]);
    const [hasSearched, setHasSearched] = useState(false);
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<Project[]>([]);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [error, setError] = useState<string | null>(null);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);

    // Ref for results scrolling
    const resultsRef = useRef<HTMLDivElement>(null);

    // Initial Data Load
    useEffect(() => {
        const load = async () => {
            const data = await fetchProjects();
            setAllProjects(data);
        };
        load();
    }, []);

    // Derived Districts based on filters
    useEffect(() => {
        if (allProjects.length === 0) return;

        const uniqueDistricts = Array.from(new Set(
            allProjects
                .filter(p => !filters.region || p.city === filters.region)
                .filter(p => !filters.direction || p.direction === filters.direction)
                .map(p => p.district)
                .filter(Boolean)
        )).sort();

        setDistricts(uniqueDistricts);
    }, [allProjects, filters.direction, filters.region]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSearch = async () => {
        setLoading(true); setHasSearched(true); setError(null);

        // Simulate network delay for UX
        await new Promise(resolve => setTimeout(resolve, 600));

        let filtered = allProjects;

        // Region/City
        if (filters.region) {
            filtered = filtered.filter(p => p.city === filters.region);
        }

        // Direction
        if (filters.direction) {
            filtered = filtered.filter(p => p.direction === filters.direction);
        }

        // Unit Type
        if (filters.unitType) {
            filtered = filtered.filter(p => p.unit_types.includes(filters.unitType));
        }

        // District
        if (filters.district) {
            filtered = filtered.filter(p => p.district === filters.district);
        }

        // Max Price
        if (filters.maxPrice) {
            filtered = filtered.filter(p => ((p.min_available_price ?? p.min_price) || 0) <= filters.maxPrice);
        }

        // Min Area
        if (filters.minArea) {
            filtered = filtered.filter(p => ((p.max_available_area ?? p.max_area) || 0) >= filters.minArea);
        }

        setResults(filtered);
        setLoading(false);

        // Auto-scroll to results
        setTimeout(() => {
            resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
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
                            <img src="/logo.png" alt="وصل" className="w-full h-full object-contain drop-shadow-sm opacity-90 hover:opacity-100 transition-opacity" />
                        </div>
                        <h1 className="text-6xl font-black tracking-tighter mb-4 bg-clip-text text-transparent bg-gradient-to-r from-[#7434bc] to-[#a066de] pb-2">وصل</h1>
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
                                <h2 className="text-3xl font-black text-[#2d1b4e] mb-1">ترشيحات وصل</h2>
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

export default SearchProjects;
