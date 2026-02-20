import { Copy, Check, MapPin, Building2, TrendingUp, Banknote } from 'lucide-react';
import { useState } from 'react';

export function ProjectCard({ project, index }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(project.sales_script);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const getScoreClass = (score) => {
        if (score >= 70) return 'score-high';
        if (score >= 50) return 'score-medium';
        return 'score-low';
    };

    const getScoreLabel = (score) => {
        if (score >= 70) return 'تطابق عالي';
        if (score >= 50) return 'تطابق جيد';
        return 'تطابق';
    };

    return (
        <div
            className="card p-6 flex flex-col gap-4 animate-fade-in"
            style={{ animationDelay: `${index * 80}ms` }}
        >
            {/* Header */}
            <div className="flex justify-between items-start gap-4">
                <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-slate-900 truncate">
                        {project.project_name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1 text-sm text-slate-500">
                        <MapPin className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{project.district} - {project.zone}</span>
                    </div>
                </div>

                {/* Score Badge */}
                <div className={`score-badge ${getScoreClass(project.match_score)} flex-shrink-0`}>
                    <TrendingUp className="w-4 h-4" />
                    <span>{project.match_score}%</span>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 rounded-lg p-3">
                    <span className="text-xs text-slate-500 block mb-1">الحالة</span>
                    <span className={`text-sm font-semibold ${project.status?.includes('جاهز') || project.status?.includes('متاح')
                            ? 'text-emerald-600'
                            : 'text-slate-700'
                        }`}>
                        {project.status || 'غير محدد'}
                    </span>
                </div>
                <div className="bg-slate-50 rounded-lg p-3">
                    <span className="text-xs text-slate-500 block mb-1">يبدأ من</span>
                    <div className="flex items-baseline gap-1">
                        <span className="text-sm font-bold text-slate-900">
                            {Number(project.min_price_available).toLocaleString('ar-SA')}
                        </span>
                        <span className="text-xs text-slate-500">ر.س</span>
                    </div>
                </div>
            </div>

            {/* Sales Script */}
            <div className="mt-auto">
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                            <Banknote className="w-3.5 h-3.5" />
                            نص المبيعات
                        </span>
                        <button
                            onClick={handleCopy}
                            className="flex items-center gap-1.5 text-xs text-blue-700 hover:text-blue-900 bg-white px-2.5 py-1.5 rounded-md border border-blue-200 hover:border-blue-300 transition-colors"
                        >
                            {copied ? (
                                <>
                                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                                    <span className="text-emerald-600">تم النسخ</span>
                                </>
                            ) : (
                                <>
                                    <Copy className="w-3.5 h-3.5" />
                                    نسخ
                                </>
                            )}
                        </button>
                    </div>
                    <p className="text-sm text-blue-800 leading-relaxed" dir="ltr">
                        "{project.sales_script}"
                    </p>
                </div>
            </div>
        </div>
    );
}
