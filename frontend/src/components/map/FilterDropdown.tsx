
import React, { useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface FilterDropdownProps {
    label: string;
    options: string[];
    value: string;
    onChange: (value: string) => void;
    icon?: React.ElementType;
}

export const FilterDropdown: React.FC<FilterDropdownProps> = ({ label, options, value, onChange, icon: Icon }) => {
    const [isOpen, setIsOpen] = useState(false);
    const buttonRef = React.useRef<HTMLButtonElement>(null);
    const [coords, setCoords] = useState({ top: 0, right: 0 });

    React.useEffect(() => {
        if (isOpen && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            setCoords({
                top: rect.bottom + 8,
                right: window.innerWidth - rect.right
            });
        }
    }, [isOpen]);

    return (
        <div className="relative">
            <button
                ref={buttonRef}
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm transition-colors border ${value !== 'الكل' || isOpen ? 'bg-purple-50 border-purple-200 text-[#7434bc]' : 'hover:bg-slate-100 border-transparent text-slate-600'}`}
            >
                {Icon && <Icon className="w-4 h-4" />}
                <span>{value === 'الكل' ? label : value}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                    <div
                        style={{ top: coords.top, right: coords.right }}
                        className="fixed w-48 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 animate-in fade-in slide-in-from-top-2 z-50 max-h-60 overflow-y-auto custom-scrollbar"
                    >
                        {options.map(opt => (
                            <button
                                key={opt}
                                onClick={() => { onChange(opt); setIsOpen(false); }}
                                className="w-full text-right px-4 py-2 hover:bg-purple-50 rounded-xl cursor-pointer text-sm font-bold text-slate-700 flex justify-between items-center transition-colors"
                            >
                                <span>{opt}</span>
                                {value === opt && <Check className="w-4 h-4 text-[#7434bc]" />}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};
