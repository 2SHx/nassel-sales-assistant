import React from 'react';
import { X, TrendingUp, MapPin, Building2, Sparkles, Maximize } from 'lucide-react';
import { Project } from '../../types';

interface ProjectModalProps {
    project: Project;
    onClose: () => void;
}

const ProjectModal: React.FC<ProjectModalProps> = ({ project, onClose }) => {
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

export default ProjectModal;
