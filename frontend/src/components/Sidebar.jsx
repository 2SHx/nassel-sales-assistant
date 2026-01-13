import { useState } from 'react';
import { Filter, MapPin, Banknote, Search, Building, Info } from 'lucide-react';

export function Sidebar({ onSearch, loading }) {
    const [zone, setZone] = useState('شمال');
    const [budget, setBudget] = useState('');
    const [district, setDistrict] = useState('');

    const handleSearch = () => {
        if (!budget) return;
        onSearch({ zone, budget: Number(budget), district: district || undefined });
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') handleSearch();
    };

    return (
        <aside className="w-full lg:w-96 bg-white border-l border-slate-200 shadow-sm flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-slate-100">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-900 rounded-lg flex items-center justify-center">
                        <Filter className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">فلتر البحث</h2>
                        <p className="text-sm text-slate-500">ابحث عن العقار المناسب</p>
                    </div>
                </div>
            </div>

            {/* Form */}
            <div className="flex-1 p-6 space-y-6 overflow-y-auto">
                {/* Zone Select */}
                <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                        <MapPin className="w-4 h-4 text-blue-900" />
                        النطاق الجغرافي
                    </label>
                    <select
                        value={zone}
                        onChange={(e) => setZone(e.target.value)}
                        className="input-styled"
                    >
                        <option value="شمال">شمال الرياض</option>
                        <option value="جنوب">جنوب الرياض</option>
                        <option value="شرق">شرق الرياض</option>
                        <option value="غرب">غرب الرياض</option>
                    </select>
                </div>

                {/* Budget Input */}
                <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                        <Banknote className="w-4 h-4 text-emerald-600" />
                        الميزانية
                    </label>
                    <div className="relative">
                        <input
                            type="number"
                            placeholder="1,500,000"
                            value={budget}
                            onChange={(e) => setBudget(e.target.value)}
                            onKeyPress={handleKeyPress}
                            className="input-styled pl-16"
                        />
                        <div className="absolute left-0 top-0 h-12 px-4 flex items-center bg-slate-100 border-l border-slate-300 rounded-l-lg">
                            <span className="text-sm font-medium text-slate-600">ر.س</span>
                        </div>
                    </div>
                </div>

                {/* District Input */}
                <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                        <Building className="w-4 h-4 text-slate-500" />
                        الحي
                        <span className="text-xs text-slate-400 font-normal">(اختياري)</span>
                    </label>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="مثال: الرمال، الروضة..."
                            value={district}
                            onChange={(e) => setDistrict(e.target.value)}
                            onKeyPress={handleKeyPress}
                            className="input-styled pl-12"
                        />
                        <div className="absolute left-0 top-0 h-12 px-3 flex items-center pointer-events-none">
                            <Search className="w-5 h-5 text-slate-400" />
                        </div>
                    </div>
                </div>

                {/* Helper Text */}
                <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-blue-700 leading-relaxed">
                        يتم البحث عن مشاريع تصل إلى <span className="font-bold">20%</span> أعلى من ميزانيتك لتوفير خيارات استثمارية إضافية.
                    </p>
                </div>
            </div>

            {/* Footer with Button */}
            <div className="p-6 border-t border-slate-100 bg-slate-50">
                <button
                    onClick={handleSearch}
                    disabled={loading || !budget}
                    className="btn-primary flex items-center justify-center gap-3"
                >
                    {loading ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            جاري البحث...
                        </>
                    ) : (
                        <>
                            <Search className="w-5 h-5" />
                            بحث عن المشاريع
                        </>
                    )}
                </button>
            </div>
        </aside>
    );
}
