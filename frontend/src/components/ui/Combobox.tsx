import React, { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';

interface ComboboxProps {
    label: string;
    icon: React.ElementType;
    value: string;
    onChange: (val: string) => void;
    options: string[];
    placeholder?: string;
}

const Combobox: React.FC<ComboboxProps> = ({ label, icon: Icon, value, onChange, options, placeholder }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const wrapperRef = useRef<HTMLDivElement>(null);
    const filtered = options.filter(opt => opt.includes(query));

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) setIsOpen(false);
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="space-y-2 relative group" ref={wrapperRef}>
            <label className="text-xs font-bold text-[#7434bc] uppercase tracking-wider flex items-center gap-1.5 mb-1.5 ml-1">
                <Icon className="w-3.5 h-3.5" />
                {label}
            </label>
            <div className="relative">
                <input
                    type="text"
                    value={isOpen ? query : value}
                    onChange={(e) => { setQuery(e.target.value); setIsOpen(true); onChange(e.target.value); }}
                    onFocus={() => { setQuery(value); setIsOpen(true); }}
                    placeholder={placeholder}
                    className="w-full h-14 pl-10 pr-5 bg-purple-50/50 hover:bg-white focus:bg-white border border-transparent focus:border-[#7434bc]/20 rounded-2xl outline-none text-slate-800 font-bold placeholder:text-slate-400 text-right shadow-sm focus:shadow-[0_4px_20px_-4px_rgba(116,52,188,0.15)] transition-all duration-300"
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-300 pointer-events-none group-focus-within:text-[#7434bc] transition-colors" />

                {isOpen && filtered.length > 0 && (
                    <div className="absolute top-full mt-2 w-full bg-white rounded-2xl shadow-[0_10px_40px_-10px_rgba(116,52,188,0.2)] border border-purple-50 max-h-60 overflow-y-auto z-50 animate-in fade-in slide-in-from-top-2 p-2">
                        {filtered.map((opt, idx) => (
                            <div
                                key={idx}
                                className="px-4 py-3 hover:bg-purple-50 rounded-xl cursor-pointer text-right text-slate-700 font-bold text-sm transition-colors"
                                onClick={() => { onChange(opt); setIsOpen(false); }}
                            >
                                {opt}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Combobox;
