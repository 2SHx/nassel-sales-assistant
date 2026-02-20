
import React, { useState, useEffect } from 'react';
import { ChevronDown, Maximize } from 'lucide-react';
import * as Slider from '@radix-ui/react-slider';

interface AreaFilterProps {
    minArea: number | null;
    maxArea: number | null;
    onChange: (min: number | null, max: number | null) => void;
    absoluteMin?: number;
    absoluteMax?: number;
}

export const AreaFilter: React.FC<AreaFilterProps> = ({
    minArea,
    maxArea,
    onChange,
    absoluteMin = 50,
    absoluteMax = 1000
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [localMin, setLocalMin] = useState<string>(minArea?.toString() || '');
    const [localMax, setLocalMax] = useState<string>(maxArea?.toString() || '');

    const [sliderValue, setSliderValue] = useState<[number, number]>([
        minArea || absoluteMin,
        maxArea || absoluteMax
    ]);

    useEffect(() => {
        if (!isOpen) {
            setLocalMin(minArea?.toString() || '');
            setLocalMax(maxArea?.toString() || '');
            setSliderValue([
                minArea || absoluteMin,
                maxArea || absoluteMax
            ]);
        }
    }, [minArea, maxArea, isOpen, absoluteMin, absoluteMax]);

    const handleSliderChange = (value: number[]) => {
        setSliderValue([value[0], value[1]]);
        setLocalMin(value[0].toString());
        setLocalMax(value[1].toString());
    };

    const activeMin = localMin ? parseFloat(localMin) : absoluteMin;
    const activeMax = localMax ? parseFloat(localMax) : absoluteMax;

    useEffect(() => {
        if (isOpen) {
            setSliderValue([
                Math.max(activeMin, absoluteMin),
                Math.min(activeMax, absoluteMax)
            ]);
        }
    }, [localMin, localMax, absoluteMin, absoluteMax, isOpen]);

    const applyFilter = () => {
        const min = localMin ? parseFloat(localMin) : null;
        const max = localMax ? parseFloat(localMax) : null;
        onChange(min, max);
        setIsOpen(false);
    };

    const isActive = minArea !== null || maxArea !== null;
    const label = isActive
        ? `${minArea || absoluteMin} - ${maxArea || absoluteMax} م²`
        : 'المساحة';

    const buttonRef = React.useRef<HTMLButtonElement>(null);
    const [coords, setCoords] = useState({ top: 0, right: 0 });

    useEffect(() => {
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
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm transition-colors border ${isActive ? 'bg-purple-50 border-purple-200 text-[#7434bc]' : 'hover:bg-slate-100 border-transparent text-slate-600'}`}
            >
                <Maximize className="w-4 h-4" />
                <span className="whitespace-nowrap">{label}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                    <div
                        style={{ top: coords.top, right: coords.right }}
                        className="fixed w-80 bg-white rounded-2xl shadow-xl border border-slate-100 p-6 animate-in fade-in slide-in-from-top-2 z-50"
                    >
                        <div className="space-y-6">

                            {/* Interactive Slider */}
                            <div className="relative flex items-center select-none touch-none w-full h-5 pt-4 pb-2">
                                <Slider.Root
                                    className="relative flex items-center select-none touch-none w-full h-5"
                                    value={sliderValue}
                                    max={absoluteMax}
                                    min={absoluteMin}
                                    step={10}
                                    minStepsBetweenThumbs={1}
                                    onValueChange={handleSliderChange}
                                >
                                    <Slider.Track className="bg-slate-200 relative grow rounded-full h-[3px]">
                                        <Slider.Range className="absolute bg-[#7434bc] rounded-full h-full" />
                                    </Slider.Track>
                                    <Slider.Thumb
                                        className="block w-5 h-5 bg-white border-2 border-[#7434bc] shadow-[0_2px_10px] shadow-black/10 rounded-[10px] hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-[#7434bc]/20 transition-transform hover:scale-110"
                                        aria-label="Minimum Area"
                                    />
                                    <Slider.Thumb
                                        className="block w-5 h-5 bg-white border-2 border-[#7434bc] shadow-[0_2px_10px] shadow-black/10 rounded-[10px] hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-[#7434bc]/20 transition-transform hover:scale-110"
                                        aria-label="Maximum Area"
                                    />
                                </Slider.Root>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-bold text-slate-400 mb-1 block">من (م²)</label>
                                    <input
                                        type="number"
                                        value={localMin}
                                        onChange={(e) => setLocalMin(e.target.value)}
                                        placeholder={absoluteMin.toString()}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold focus:outline-none focus:border-[#7434bc]"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-400 mb-1 block">إلى (م²)</label>
                                    <input
                                        type="number"
                                        value={localMax}
                                        onChange={(e) => setLocalMax(e.target.value)}
                                        placeholder={absoluteMax.toString()}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold focus:outline-none focus:border-[#7434bc]"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-2 pt-2 border-t border-slate-50">
                                <button
                                    onClick={() => { setLocalMin(''); setLocalMax(''); onChange(null, null); setIsOpen(false); }}
                                    className="flex-1 py-2 text-xs font-bold text-slate-500 hover:bg-slate-50 rounded-xl"
                                >
                                    إعادة تعيين
                                </button>
                                <button onClick={applyFilter} className="flex-1 py-2 bg-[#7434bc] text-white rounded-xl text-xs font-bold shadow-lg shadow-purple-900/20">
                                    تطبيق
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};
