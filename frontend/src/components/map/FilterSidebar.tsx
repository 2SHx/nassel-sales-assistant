
import React from 'react';
import { Search, Sliders } from 'lucide-react';
import { MapProject } from '../../services/projects';

interface FilterSidebarProps {
    projects: MapProject[];
    onFilterChange: (filters: any) => void;
    onProjectClick: (project: MapProject) => void;
    selectedProjectId?: number;
    className?: string;
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
    projects,
    onProjectClick,
    selectedProjectId,
    className
}) => {
    const [searchTerm, setSearchTerm] = React.useState('');

    const filteredProjects = projects.filter(p =>
        p.project_name.includes(searchTerm) || p.district.includes(searchTerm)
    );

    return (
        <div className={`flex flex-col h-full bg-white border-l border-slate-200 shadow-xl z-20 ${className}`}>
            {/* Header */}
            <div className="p-6 border-b border-slate-100">
                <h2 className="text-2xl font-black text-slate-800 mb-4">اكتشف المشاريع</h2>

                <div className="relative group">
                    <input
                        type="text"
                        placeholder="ابحث باسم المشروع أو الحي..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full h-12 pr-11 pl-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#7434bc] focus:ring-1 focus:ring-[#7434bc] transition-all text-sm font-bold placeholder:font-medium"
                    />
                    <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-[#7434bc] transition-colors" />
                </div>
            </div>

            {/* Filters Area (Simplified for now, can expand) */}
            <div className="p-4 border-b border-slate-100 flex gap-2 overflow-x-auto pb-4 custom-scrollbar">
                <button className="px-4 py-2 bg-slate-100 hover:bg-[#f8e4ff] hover:text-[#7434bc] rounded-lg text-xs font-bold whitespace-nowrap transition-colors flex items-center gap-2">
                    <Sliders className="w-3.5 h-3.5" />
                    تصفية متقدمة
                </button>
                <div className="h-4 w-px bg-slate-200 my-auto mx-2" />
                {['سكني', 'تجاري', 'متاح فقط'].map((f, i) => (
                    <button key={i} className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-bold whitespace-nowrap hover:border-[#7434bc] hover:text-[#7434bc] transition-colors">
                        {f}
                    </button>
                ))}
            </div>

            {/* Results List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {filteredProjects.map((project) => (
                    <div
                        key={project.project_id}
                        onClick={() => onProjectClick(project)}
                        className={`
                            p-4 rounded-2xl border cursor-pointer transition-all duration-300
                            ${selectedProjectId === project.project_id
                                ? 'bg-[#f8e4ff] border-[#7434bc] shadow-md -translate-x-1'
                                : 'bg-white border-slate-100 hover:border-purple-200 hover:bg-slate-50'
                            }
                        `}
                    >
                        <div className="flex justify-between items-start mb-2">
                            <h3 className={`font-black text-sm ${selectedProjectId === project.project_id ? 'text-[#7434bc]' : 'text-slate-800'}`}>
                                {project.project_name}
                            </h3>
                            <span className={`
                                text-[10px] font-bold px-2 py-1 rounded-full
                                ${project.project_status === 'متاح' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'}
                            `}>
                                {project.project_status}
                            </span>
                        </div>

                        <div className="flex justify-between items-end">
                            <span className="text-xs text-slate-400 font-medium">{project.district}</span>
                            <span className="text-sm font-black text-slate-800">
                                {Intl.NumberFormat('en-US', { notation: "compact" }).format(project.min_available_price)}
                                <span className="text-[10px] font-normal mr-1">ر.س</span>
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer Stats */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
                <span className="text-xs font-bold text-slate-400">
                    تم العثور على {filteredProjects.length} مشروع
                </span>
            </div>
        </div>
    );
};
