import React from 'react';
import { ChevronDown } from 'lucide-react';

interface SelectFieldProps {
    label: string;
    icon: React.ElementType;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    options: { label: string; value: string }[];
    name: string;
}

const SelectField: React.FC<SelectFieldProps> = ({ label, icon: Icon, value, onChange, options, name }) => (
    <div className="space-y-2 group">
        <label className="text-xs font-bold text-[#7434bc] uppercase tracking-wider flex items-center gap-1.5 mb-1.5 ml-1">
            <Icon className="w-3.5 h-3.5" />
            {label}
        </label>
        <div className="relative">
            <select
                name={name}
                value={value}
                onChange={onChange}
                className="w-full h-14 pl-10 pr-5 appearance-none bg-purple-50/50 hover:bg-white focus:bg-white border border-transparent focus:border-[#7434bc]/20 rounded-2xl outline-none text-slate-800 font-bold cursor-pointer text-right shadow-sm focus:shadow-[0_4px_20px_-4px_rgba(116,52,188,0.15)] transition-all duration-300"
            >
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
            <ChevronDown className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-300 pointer-events-none group-focus-within:text-[#7434bc] transition-colors" />
        </div>
    </div>
);

export default SelectField;
