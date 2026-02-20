import React from 'react';
import { MapPin, TrendingUp, Sparkles } from 'lucide-react';
import { Project } from '../../types';

interface ResultCardProps {
    project: Project;
    onClick: () => void;
}

const ResultCard: React.FC<ResultCardProps> = ({ project, onClick }) => {
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
                    {(project.marketing_pitch || project.sales_script || 'لا يوجد وصف متاح لهذا المشروع حالياً.').substring(0, 80)}...
                </p>
            </div>
        </div>
    );
};

export default ResultCard;
