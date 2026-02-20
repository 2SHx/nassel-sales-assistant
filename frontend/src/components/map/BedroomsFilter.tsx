
import React from 'react';
import { BedDouble } from 'lucide-react';

interface BedroomsFilterProps {
    value: number | null;
    onChange: (val: number | null) => void;
}

export const BedroomsFilter: React.FC<BedroomsFilterProps> = ({ value, onChange }) => {
    const options = [1, 2, 3, 4, 5];

    return (
        <div className="flex items-center gap-2 bg-slate-50/50 p-1 rounded-full border border-slate-200/60">
            <div className="px-2 text-slate-400">
                <BedDouble className="w-4 h-4" />
            </div>
            <div className="flex gap-1">
                <button
                    onClick={() => onChange(null)}
                    className={`h-8 px-3 rounded-full text-xs font-bold transition-all ${value === null ? 'bg-white text-[#7434bc] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    الكل
                </button>
                {options.map(opt => (
                    <button
                        key={opt}
                        onClick={() => onChange(opt)}
                        className={`w-8 h-8 rounded-full text-xs font-bold transition-all flex items-center justify-center ${value === opt ? 'bg-[#7434bc] text-white shadow-md' : 'text-slate-500 hover:bg-white hover:text-slate-700'}`}
                    >
                        {opt}{opt === 5 ? '+' : ''}
                    </button>
                ))}
            </div>
        </div>
    );
};
