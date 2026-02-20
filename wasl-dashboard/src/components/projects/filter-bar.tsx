'use client';

import { useState, useEffect } from 'react';
import {
    Search, Filter, SlidersHorizontal, MapPin, Building, Check, ChevronsUpDown, X
} from 'lucide-react';
import { FilterContainer } from '@/components/shared/filter-container';
import { useProjectFilters } from '@/store/useProjectFilters';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { MultiSelectFilter } from '@/components/projects/multi-select-filter'; // Ensure this path is correct
import { Separator } from "@/components/ui/separator";
import { cn } from '@/lib/utils';

interface ProjectFilterBarProps {
    options: {
        districts: string[];
        developers: string[];
        unitTypes: string[];
        amenities: string[];
        directions: string[];
        projectNames: { id: string, name: string }[];
    }
}

export function ProjectFilterBar({ options }: ProjectFilterBarProps) {
    const {
        searchQuery, status, priceRange,
        areaRange, bedroomsRange,
        district, direction, developer,
        unitTypes, amenities,
        setFilter, resetFilters
    } = useProjectFilters();

    // Independent open states for Popovers
    const [openDistrict, setOpenDistrict] = useState(false);
    const [openDeveloper, setOpenDeveloper] = useState(false);
    const [openProjectName, setOpenProjectName] = useState(false);
    const [openDirection, setOpenDirection] = useState(false);

    // Helper to format currency
    const formatCurrency = (val: number) => {
        if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
        if (val >= 1000) return `${(val / 1000).toFixed(0)}K`;
        return val.toString();
    };

    return (
        <FilterContainer>
            <div className="flex flex-col gap-6">
                {/* --- Row 1: Dropdowns & Basic Filters --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 items-end">

                    {/* 1. Project Name (Combobox) */}
                    <div className="space-y-2">
                        <Label className="text-xs font-medium text-muted-foreground">اسم المشروع</Label>
                        <Popover open={openProjectName} onOpenChange={setOpenProjectName}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={openProjectName}
                                    className="w-full justify-between text-right font-normal bg-background"
                                >
                                    <span className="truncate">
                                        {searchQuery || "اختر المشروع..."}
                                    </span>
                                    <ChevronsUpDown className="ms-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 z-50" align="end">
                                <Command dir="rtl">
                                    <CommandInput placeholder="ابحث عن مشروع..." className="text-right" />
                                    <CommandList>
                                        <CommandEmpty>لا توجد نتائج.</CommandEmpty>
                                        <CommandGroup>
                                            <CommandItem
                                                value="All"
                                                onSelect={() => {
                                                    setFilter('searchQuery', '');
                                                    setOpenProjectName(false);
                                                }}
                                                className="text-right flex justify-between cursor-pointer"
                                            >
                                                الكل
                                                <Check className={cn("mr-2 h-4 w-4", searchQuery === '' ? "opacity-100" : "opacity-0")} />
                                            </CommandItem>
                                            {options.projectNames.map((p) => (
                                                <CommandItem
                                                    key={p.id}
                                                    value={p.name} // Value must match label for search to work
                                                    onSelect={(currentValue) => {
                                                        // Toggle logic: if already selected, clear it
                                                        const newValue = p.name === searchQuery ? '' : p.name;
                                                        setFilter('searchQuery', newValue);
                                                        setOpenProjectName(false);
                                                    }}
                                                    className="text-right flex justify-between cursor-pointer"
                                                >
                                                    <span>{p.name}</span>
                                                    <Check className={cn("mr-2 h-4 w-4 shrink-0", searchQuery === p.name ? "opacity-100" : "opacity-0")} />
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                    </div>

                    {/* 2. Status Filter */}
                    <div className="space-y-2">
                        <Label className="text-xs font-medium text-muted-foreground">حالة المشروع</Label>
                        <Select
                            value={status || 'All'}
                            onValueChange={(val) => setFilter('status', val)}
                        >
                            <SelectTrigger className="w-full bg-background text-right" dir="rtl">
                                <SelectValue placeholder="حالة المشروع" />
                            </SelectTrigger>
                            <SelectContent className="z-50" dir="rtl">
                                <SelectItem value="All" className="cursor-pointer justify-end">الكل</SelectItem>
                                <SelectItem value="Available" className="cursor-pointer justify-end">متاح</SelectItem>
                                <SelectItem value="Sold Out" className="cursor-pointer justify-end">مباع بالكامل</SelectItem>
                                <SelectItem value="Under Construction" className="cursor-pointer justify-end">تحت الإنشاء</SelectItem>
                                <SelectItem value="Ready" className="cursor-pointer justify-end">جاهز</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* 3. District (Combobox) */}
                    <div className="space-y-2">
                        <Label className="text-xs font-medium text-muted-foreground">الحي / المنطقة</Label>
                        <Popover open={openDistrict} onOpenChange={setOpenDistrict}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={openDistrict}
                                    className="w-full justify-between text-right font-normal bg-background"
                                >
                                    <span className="truncate">{district || "اختر الحي..."}</span>
                                    <ChevronsUpDown className="ms-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 z-50" align="end">
                                <Command dir="rtl">
                                    <CommandInput placeholder="ابحث عن حي..." className="text-right" />
                                    <CommandList>
                                        <CommandEmpty>لا توجد نتائج.</CommandEmpty>
                                        <CommandGroup>
                                            <CommandItem
                                                value="All"
                                                onSelect={() => {
                                                    setFilter('district', null);
                                                    setOpenDistrict(false);
                                                }}
                                                className="text-right flex justify-between cursor-pointer"
                                            >
                                                الكل
                                                <Check className={cn("mr-2 h-4 w-4", district === null ? "opacity-100" : "opacity-0")} />
                                            </CommandItem>
                                            {options.districts.map((d) => (
                                                <CommandItem
                                                    key={d}
                                                    value={d}
                                                    onSelect={() => {
                                                        setFilter('district', d === district ? null : d)
                                                        setOpenDistrict(false)
                                                    }}
                                                    className="text-right flex justify-between cursor-pointer"
                                                >
                                                    <span>{d}</span>
                                                    <Check className={cn("mr-2 h-4 w-4 shrink-0", district === d ? "opacity-100" : "opacity-0")} />
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                    </div>

                    {/* 4. Facilities (Multi-Select) */}
                    <div className="space-y-2">
                        <Label className="text-xs font-medium text-muted-foreground">المرافق</Label>
                        <MultiSelectFilter
                            title="اختر المرافق..."
                            options={options?.amenities || []}
                            selectedValues={amenities}
                            onSelectionChange={(val) => setFilter('amenities', val)}
                            className="w-full justify-between bg-background font-normal"
                        />
                    </div>

                    {/* 5. Direction (Combobox) */}
                    <div className="space-y-2">
                        <Label className="text-xs font-medium text-muted-foreground">الإتجاه</Label>
                        <Popover open={openDirection} onOpenChange={setOpenDirection}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={openDirection}
                                    className="w-full justify-between text-right font-normal bg-background"
                                >
                                    <span className="truncate">{direction || "اختر الإتجاه..."}</span>
                                    <ChevronsUpDown className="ms-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 z-50" align="end">
                                <Command dir="rtl">
                                    <CommandInput placeholder="ابحث عن إتجاه..." className="text-right" />
                                    <CommandList>
                                        <CommandEmpty>لا توجد نتائج.</CommandEmpty>
                                        <CommandGroup>
                                            <CommandItem
                                                value="All"
                                                onSelect={() => {
                                                    setFilter('direction', null);
                                                    setOpenDirection(false);
                                                }}
                                                className="text-right flex justify-between cursor-pointer"
                                            >
                                                الكل
                                                <Check className={cn("mr-2 h-4 w-4", direction === null ? "opacity-100" : "opacity-0")} />
                                            </CommandItem>
                                            {options.directions?.map((dir) => (
                                                <CommandItem
                                                    key={dir}
                                                    value={dir}
                                                    onSelect={() => {
                                                        setFilter('direction', dir === direction ? null : dir)
                                                        setOpenDirection(false)
                                                    }}
                                                    className="text-right flex justify-between cursor-pointer"
                                                >
                                                    <span>{dir}</span>
                                                    <Check className={cn("mr-2 h-4 w-4 shrink-0", direction === dir ? "opacity-100" : "opacity-0")} />
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>

                <Separator />

                {/* --- Row 2: Sliders & Actions --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 items-end">

                    {/* Price Range Slider */}
                    <div className="space-y-2">
                        <Label className="text-xs font-medium text-muted-foreground">نطاق السعر</Label>
                        <RangeFilter
                            label="السعر"
                            value={priceRange}
                            onChange={(val) => setFilter('priceRange', val)}
                            formatDisplay={(val) => `${formatCurrency(val[0])} - ${formatCurrency(val[1])}`}
                            min={0}
                            max={10000000} // Increased to 10M
                            step={100000}
                            unit="ريال"
                        />
                    </div>

                    {/* Area Range Slider */}
                    <div className="space-y-2">
                        <Label className="text-xs font-medium text-muted-foreground">نطاق المساحة</Label>
                        <RangeFilter
                            label="المساحة"
                            value={areaRange}
                            onChange={(val) => setFilter('areaRange', val)}
                            formatDisplay={(val) => `${val[0]} - ${val[1]}`}
                            min={0}
                            max={5000}
                            step={50}
                            unit="م²"
                        />
                    </div>

                    {/* Bedroom Range Slider */}
                    <div className="space-y-2">
                        <Label className="text-xs font-medium text-muted-foreground">غرف النوم</Label>
                        <RangeFilter
                            label="غرف النوم"
                            value={bedroomsRange}
                            onChange={(val) => setFilter('bedroomsRange', val)}
                            formatDisplay={(val) => `${val[0]} - ${val[1]}`}
                            min={0}
                            max={10}
                            step={1}
                            unit="غرف"
                        />
                    </div>

                    {/* Unit Types (Multi) */}
                    <div className="space-y-2">
                        <Label className="text-xs font-medium text-muted-foreground">نوع الوحدات</Label>
                        <MultiSelectFilter
                            title="نوع الوحدات"
                            options={options?.unitTypes || []}
                            selectedValues={unitTypes}
                            onSelectionChange={(val) => setFilter('unitTypes', val)}
                            className="w-full justify-between bg-background"
                        />
                    </div>

                    {/* Action Buttons: Search & Reset */}
                    <div className="flex items-center gap-2">
                        <Button
                            className="flex-1 bg-[#8B5CF6] hover:bg-[#7c4dff] text-white"
                            onClick={() => {
                                // Logic for search click can go here if needed,
                                // currently filtering is reactive.
                                console.log("Searching...");
                            }}
                        >
                            <Search className="w-4 h-4 ml-2" />
                            بحث
                        </Button>

                        {(status !== 'All' || searchQuery || district || developer || unitTypes.length > 0) && (
                            <Button
                                variant="outline"
                                onClick={resetFilters}
                                className="gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive hover:border-destructive"
                            >
                                <X className="h-4 w-4" />
                                مسح الكل
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </FilterContainer>
    );
}

// --- Reusable Range Filter Component (Fixed State Logic) ---

interface RangeFilterProps {
    label: string;
    value: [number, number];
    onChange: (val: [number, number]) => void;
    formatDisplay: (val: [number, number]) => string;
    min?: number;
    max?: number;
    step?: number;
    unit?: string;
}

function RangeFilter({ label, value, onChange, formatDisplay, min = 0, max = 1000000, step = 1, unit }: RangeFilterProps) {
    const [open, setOpen] = useState(false);
    const [localMin, setLocalMin] = useState(value[0]);
    const [localMax, setLocalMax] = useState(value[1]);

    // FIX: Sync local state when parent global state changes (e.g. Reset button clicked)
    useEffect(() => {
        setLocalMin(value[0]);
        setLocalMax(value[1]);
    }, [value]);

    const handleApply = () => {
        onChange([localMin, localMax]);
        setOpen(false);
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-between text-right font-normal bg-background border-dashed">
                    <span className="truncate text-xs">
                        {value[0] === min && value[1] === max ? "الكل" : formatDisplay(value)}
                    </span>
                    <SlidersHorizontal className="h-3 w-3 opacity-50 ml-2" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72 p-4 z-50" align="start">
                <div className="space-y-6" dir="rtl">
                    <div className="flex items-center justify-between">
                        <h4 className="font-medium leading-none text-sm">{label} {unit && `(${unit})`}</h4>
                    </div>

                    {/* Dual Thumb Slider */}
                    <div className="px-2 pt-4 pb-2">
                        <Slider
                            min={min}
                            max={max}
                            step={step}
                            value={[localMin, localMax]}
                            onValueChange={(vals) => {
                                setLocalMin(vals[0]);
                                setLocalMax(vals[1]);
                            }}
                            className="py-2"
                        />
                    </div>

                    {/* Inputs for manual entry */}
                    <div className="flex items-center gap-2">
                        <div className="grid gap-1 flex-1">
                            <Label htmlFor={`min-${label}`} className="text-[10px] text-muted-foreground text-center">من</Label>
                            <Input
                                id={`min-${label}`}
                                type="number"
                                value={localMin}
                                onChange={(e) => setLocalMin(Number(e.target.value))}
                                className="h-8 text-center tabular-nums text-xs"
                                min={min}
                                max={localMax}
                            />
                        </div>
                        <div className="grid gap-1 flex-1">
                            <Label htmlFor={`max-${label}`} className="text-[10px] text-muted-foreground text-center">إلى</Label>
                            <Input
                                id={`max-${label}`}
                                type="number"
                                value={localMax}
                                onChange={(e) => setLocalMax(Number(e.target.value))}
                                className="h-8 text-center tabular-nums text-xs"
                                min={localMin}
                                max={max}
                            />
                        </div>
                    </div>

                    <Button size="sm" className="w-full bg-primary text-primary-foreground" onClick={handleApply}>
                        تطبيق
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    );
}