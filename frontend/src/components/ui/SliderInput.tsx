import React from 'react';

interface SliderInputProps {
    label: string;
    icon: React.ElementType;
    value: number;
    onChange: (val: number) => void;
    min: number;
    max: number;
    step: number;
    unit: string;
    shortcuts?: number[];
}

const SliderInput: React.FC<SliderInputProps> = ({ label, icon: Icon, value, onChange, min, max, step, unit, shortcuts }) => (
    <div className="space-y-4">
        <div className="flex justify-between items-end">
            <label className="text-xs font-bold text-[#7434bc] uppercase tracking-wider flex items-center gap-1.5 mb-1">
                <Icon className="w-3.5 h-3.5" />
                {label}
            </label>
            <div className="relative group">
                <input
                    type="text"
                    value={value.toLocaleString('en-US')}
                    onChange={(e) => {
                        const cleanValue = Number(e.target.value.replace(/,/g, ''));
                        if (!isNaN(cleanValue)) onChange(cleanValue);
                    }}
                    className="w-40 h-10 pl-10 pr-4 bg-transparent border-b-2 border-slate-200 focus:border-[#7434bc] text-[#7434bc] text-xl font-black text-left outline-none transition-colors"
                    dir="ltr"
                />
                <span className="absolute right-0 top-1/2 -translate-y-1/2 text-sm text-slate-400 font-bold pointer-events-none group-focus-within:text-[#7434bc] transition-colors">
                    {unit}
                </span>
            </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-purple-100 shadow-sm relative overflow-hidden group hover:border-[#7434bc]/30 transition-colors">
            <div className="absolute inset-0 bg-[#f8e4ff]/30 opacity-0 group-hover:opacity-100 transition-opacity" />
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                className="relative z-10 w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#7434bc] hover:accent-[#9d5bd2]"
            />

            {shortcuts && (
                <div className="relative z-10 flex justify-between gap-2 mt-4">
                    {shortcuts.map(s => (
                        <button
                            key={s}
                            onClick={() => onChange(s)}
                            className={`
                            text-[10px] font-bold px-3 py-1.5 rounded-xl transition-all duration-300
                            ${value === s
                                    ? 'bg-[#7434bc] text-white shadow-lg shadow-[#7434bc]/30 scale-105'
                                    : 'bg-slate-50 text-slate-500 hover:bg-[#f8e4ff] hover:text-[#7434bc]'
                                }
                        `}
                        >
                            {s >= 1000000 ? `${(s / 1000000)}M` : s.toLocaleString('en-US')}
                        </button>
                    ))}
                </div>
            )}
        </div>
    </div>
);

export default SliderInput;
