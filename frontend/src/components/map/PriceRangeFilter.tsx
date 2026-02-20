import React, { useState, useEffect } from 'react';
import { ChevronDown, DollarSign } from 'lucide-react';
import * as Slider from '@radix-ui/react-slider';

interface PriceRangeFilterProps {
    minPrice: number | null;
    maxPrice: number | null;
    onChange: (min: number | null, max: number | null) => void;
    absoluteMin?: number;
    absoluteMax?: number;
}

export const PriceRangeFilter: React.FC<PriceRangeFilterProps> = ({
    minPrice,
    maxPrice,
    onChange,
    absoluteMin = 0,
    absoluteMax = 10000000
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [localMin, setLocalMin] = useState<string>(minPrice ? minPrice.toString() : '');
    const [localMax, setLocalMax] = useState<string>(maxPrice ? maxPrice.toString() : '');

    // Slider state (always numbers)
    const [sliderValue, setSliderValue] = useState<[number, number]>([
        minPrice || absoluteMin,
        maxPrice || absoluteMax
    ]);

    useEffect(() => {
        if (!isOpen) {
            setLocalMin(minPrice ? minPrice.toString() : '');
            setLocalMax(maxPrice ? maxPrice.toString() : '');
            setSliderValue([
                minPrice || absoluteMin,
                maxPrice || absoluteMax
            ]);
        }
    }, [minPrice, maxPrice, isOpen, absoluteMin, absoluteMax]);

    const handleSliderChange = (value: number[]) => {
        setSliderValue([value[0], value[1]]);
        setLocalMin(value[0].toString());
        setLocalMax(value[1].toString());
    };

    const activeMin = localMin ? parseFloat(localMin) : absoluteMin;
    const activeMax = localMax ? parseFloat(localMax) : absoluteMax;

    // Sync slider when inputs change manually
    useEffect(() => {
        if (isOpen) {
            setSliderValue([
                Math.max(activeMin, absoluteMin),
                Math.min(activeMax, absoluteMax)
            ]);
        }
    }, [localMin, localMax, absoluteMin, absoluteMax]);

    const applyFilter = () => {
        const min = localMin ? parseFloat(localMin) : null;
        const max = localMax ? parseFloat(localMax) : null;
        onChange(min, max);
        setIsOpen(false);
    };

    const isActive = minPrice !== null || maxPrice !== null;

    // Format huge numbers
    const formatPrice = (p: number) => {
        if (p >= 1000000) return (p / 1000000).toFixed(1) + 'M';
        if (p >= 1000) return (p / 1000).toFixed(0) + 'K';
        return p;
    };

    const label = isActive
        ? `${minPrice ? formatPrice(minPrice) : formatPrice(absoluteMin)} - ${maxPrice ? formatPrice(maxPrice) : formatPrice(absoluteMax)}`
        : 'النطاق السعري';

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
                <DollarSign className="w-4 h-4" />
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
                                    step={10000}
                                    minStepsBetweenThumbs={1}
                                    onValueChange={handleSliderChange}
                                >
                                    <Slider.Track className="bg-slate-200 relative grow rounded-full h-[3px]">
                                        <Slider.Range className="absolute bg-[#7434bc] rounded-full h-full" />
                                    </Slider.Track>
                                    <Slider.Thumb
                                        className="block w-5 h-5 bg-white border-2 border-[#7434bc] shadow-[0_2px_10px] shadow-black/10 rounded-[10px] hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-[#7434bc]/20 transition-transform hover:scale-110"
                                        aria-label="Minimum Price"
                                    />
                                    <Slider.Thumb
                                        className="block w-5 h-5 bg-white border-2 border-[#7434bc] shadow-[0_2px_10px] shadow-black/10 rounded-[10px] hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-[#7434bc]/20 transition-transform hover:scale-110"
                                        aria-label="Maximum Price"
                                    />
                                </Slider.Root>
                            </div>

                            {/* Manual Inputs */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-bold text-slate-400 mb-1 block">من (ر.س)</label>
                                    <input
                                        type="number"
                                        value={localMin}
                                        onChange={(e) => setLocalMin(e.target.value)}
                                        placeholder={absoluteMin.toString()}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold focus:outline-none focus:border-[#7434bc]"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-400 mb-1 block">إلى (ر.س)</label>
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
                                <button onClick={() => { setLocalMin(''); setLocalMax(''); onChange(null, null); setIsOpen(false); }} className="flex-1 py-2 text-xs font-bold text-slate-500 hover:bg-slate-50 rounded-xl">
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
