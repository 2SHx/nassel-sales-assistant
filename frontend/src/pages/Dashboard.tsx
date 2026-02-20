import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Users, Target, PieChart, ArrowUpRight, ArrowDownRight, DollarSign, Activity, Map } from 'lucide-react';

const Dashboard: React.FC = () => {
    const navigate = useNavigate();

    // Strategic KPIs
    const kpis = [
        { label: 'إجمالي العوائد', value: '42.5M', unit: 'ر.س', change: '+12.5%', isPositive: true, icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { label: 'معدل التحويل', value: '18.2%', unit: '', change: '+2.1%', isPositive: true, icon: Activity, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'متوسط قيمة الصفقة', value: '1.2M', unit: 'ر.س', change: '-1.5%', isPositive: false, icon: PieChart, color: 'text-purple-600', bg: 'bg-purple-50' },
        { label: 'سرعة البيع', value: '14', unit: 'يوم', change: '-3 أيام', isPositive: true, icon: TrendingUp, color: 'text-orange-600', bg: 'bg-orange-50' },
    ];

    // Sales Funnel Data
    const funnel = [
        { stage: 'العملاء المحتملين (Leads)', count: 1240, color: 'bg-blue-500' },
        { stage: 'مؤهل (Qualified)', count: 850, color: 'bg-purple-500' },
        { stage: 'تفاوض (Negotiation)', count: 120, color: 'bg-orange-500' },
        { stage: 'تم البيع (Closed)', count: 45, color: 'bg-emerald-500' },
    ];

    // Inventory Health
    const inventory = [
        { label: 'سكني (فلل)', percentage: 85, color: 'bg-emerald-500' },
        { label: 'سكني (شقق)', percentage: 62, color: 'bg-blue-500' },
        { label: 'تجاري', percentage: 40, color: 'bg-amber-500' },
    ];

    return (
        <div className="min-h-screen bg-[#f8fafc] font-sans text-right" dir="rtl">
            <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-10">

                {/* Header & Actions */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 mb-2">نظرة عامة استراتيجية</h1>
                        <p className="text-slate-500 font-medium">متابعة الأداء العام وصحة المخزون</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => navigate('/map')}
                            className="flex items-center gap-2 px-6 py-3 bg-[#2d1b4e] text-white rounded-xl font-bold shadow-lg shadow-purple-900/20 hover:scale-105 transition-transform"
                        >
                            <Map className="w-5 h-5" />
                            <span>خريطة المبيعات</span>
                        </button>
                        <button
                            onClick={() => navigate('/search')}
                            className="flex items-center gap-2 px-6 py-3 bg-white text-slate-700 border border-slate-200 rounded-xl font-bold shadow-sm hover:bg-slate-50 hover:border-purple-200 hover:text-purple-700 transition-all"
                        >
                            <Target className="w-5 h-5" />
                            <span>قائمة المشاريع</span>
                        </button>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {kpis.map((kpi, idx) => (
                        <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100/50 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-4">
                                <div className={`p-3 rounded-xl ${kpi.bg} ${kpi.color}`}>
                                    <kpi.icon className="w-6 h-6" />
                                </div>
                                <span className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg ${kpi.isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                                    {kpi.change}
                                    {kpi.isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                </span>
                            </div>
                            <h3 className="text-slate-400 font-bold text-xs mb-1">{kpi.label}</h3>
                            <div className="flex items-baseline gap-1">
                                <span className="text-3xl font-black text-slate-800">{kpi.value}</span>
                                <span className="text-xs font-bold text-slate-400">{kpi.unit}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Sales Funnel */}
                    <div className="lg:col-span-2 bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-xl font-black text-slate-800">قمع المبيعات (Sales Funnel)</h3>
                            <button className="text-slate-400 hover:text-[#7434bc] transition-colors"><Activity className="w-5 h-5" /></button>
                        </div>
                        <div className="space-y-6">
                            {funnel.map((stage, idx) => (
                                <div key={idx} className="relative">
                                    <div className="flex justify-between items-end mb-2 relative z-10">
                                        <span className="font-bold text-slate-700">{stage.stage}</span>
                                        <span className="font-black text-slate-900">{stage.count}</span>
                                    </div>
                                    <div className="h-4 bg-slate-50 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full ${stage.color} opacity-80`}
                                            style={{ width: `${(stage.count / 1240) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Inventory Health */}
                    <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 flex flex-col justify-between">
                        <div>
                            <h3 className="text-xl font-black text-slate-800 mb-8">صحة المخزون</h3>
                            <div className="space-y-8">
                                {inventory.map((item, idx) => (
                                    <div key={idx}>
                                        <div className="flex justify-between text-sm font-bold text-slate-500 mb-2">
                                            <span>{item.label}</span>
                                            <span>{item.percentage}% مباع</span>
                                        </div>
                                        <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full ${item.color}`}
                                                style={{ width: `${item.percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="mt-8 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                            <div className="flex items-center gap-3 mb-2">
                                <Target className="w-5 h-5 text-slate-400" />
                                <h4 className="font-bold text-slate-700">تنبيه المخزون</h4>
                            </div>
                            <p className="text-xs text-slate-500 leading-relaxed font-medium">
                                مخزون "الفلل السكنية" يوشك على النفاذ في مشروع "الرابية". يوصى بزيادة الأسعار أو فتح مرحلة جديدة.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
