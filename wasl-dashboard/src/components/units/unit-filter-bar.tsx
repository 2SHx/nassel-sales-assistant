'use client';

import { ScrollArea } from "@/components/ui/scroll-area";

import { useState, useEffect } from 'react';
import {
    Search, Filter, SlidersHorizontal, MapPin, Building, Check, ChevronsUpDown, X
} from 'lucide-react';
import { FilterContainer } from '@/components/shared/filter-container';
import { useUnitFilters } from '@/store/useUnitFilters';
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
import { MultiSelectFilter } from '@/components/projects/multi-select-filter';
import { Separator } from "@/components/ui/separator";
import { cn } from '@/lib/utils';

interface UnitFilterBarProps {
    options: {
        projectNames: { id: string, name: string }[];
        unitTypes: string[];
        amenities: string[];
        directions: string[];
    }
}

// ... (previous imports)

export function UnitFilterBar({ options }: UnitFilterBarProps) {
    const {
        searchQuery, projectId, status, priceRange,
        areaRange, unitTypes, amenities,
        bedroomsRange, direction,
        setFilter, resetFilters
    } = useUnitFilters();

    const [openProjectSearch, setOpenProjectSearch] = useState(false);
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
                        <Label className="text-xs font-medium text-muted-foreground">المشروع</Label>
                        <Popover open={openProjectSearch} onOpenChange={setOpenProjectSearch}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={openProjectSearch}
                                    className="w-full justify-between text-right font-normal bg-background"
                                >
                                    <span className="truncate">
                                        {projectId
                                            ? options.projectNames.find((p) => p.id === projectId)?.name
                                            : "اختر مشروع..."}
                                    </span>
                                    <ChevronsUpDown className="ms-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 z-50" align="start">
                                <Command dir="rtl">
                                    <CommandInput placeholder="ابحث عن مشروع..." className="text-right" />
                                    <CommandList>
                                        <CommandEmpty>لا توجد نتائج.</CommandEmpty>
                                        <ScrollArea className="h-64" dir="rtl">
                                            <CommandGroup>
                                                <CommandItem
                                                    value="All"
                                                    onSelect={() => {
                                                        setFilter('projectId', null);
                                                        setOpenProjectSearch(false);
                                                    }}
                                                    className="flex items-center gap-2 cursor-pointer text-right"
                                                >
                                                    <Check className={cn("h-4 w-4", projectId === null ? "opacity-100" : "opacity-0")} />
                                                    الكل
                                                </CommandItem>
                                                {options.projectNames.map((project) => (
                                                    <CommandItem
                                                        key={project.id}
                                                        value={project.name}
                                                        keywords={[project.name]}
                                                        onSelect={() => {
                                                            setFilter('projectId', project.id === projectId ? null : project.id)
                                                            setOpenProjectSearch(false)
                                                        }}
                                                        className="flex items-center gap-2 cursor-pointer text-right"
                                                    >
                                                        <Check className={cn("h-4 w-4", projectId === project.id ? "opacity-100" : "opacity-0")} />
                                                        <span>{project.name}</span>
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </ScrollArea>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                    </div>

                    {/* 2. Status Filter */}
                    <div className="space-y-2">
                        <Label className="text-xs font-medium text-muted-foreground">حالة الوحدة</Label>
                        <Select
                            value={status || 'All'}
                            onValueChange={(val) => setFilter('status', val)}
                        >
                            <SelectTrigger className="w-full bg-background text-right" dir="rtl">
                                <SelectValue placeholder="حالة الوحدة" />
                            </SelectTrigger>
                            <SelectContent className="z-50" dir="rtl">
                                <SelectItem value="All" className="cursor-pointer justify-end">الكل</SelectItem>
                                <SelectItem value="Available" className="cursor-pointer justify-end">متاح</SelectItem>
                                <SelectItem value="Reserved" className="cursor-pointer justify-end">محجوز</SelectItem>
                                <SelectItem value="Sold" className="cursor-pointer justify-end">مباع</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* 3. Direction (Combobox) */}
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
                            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 z-50" align="start">
                                <Command dir="rtl">
                                    <CommandInput placeholder="ابحث عن إتجاه..." className="text-right" />
                                    <CommandList>
                                        <CommandEmpty>لا توجد نتائج.</CommandEmpty>
                                        <ScrollArea className="h-48" dir="rtl">
                                            <CommandGroup>
                                                <CommandItem
                                                    value="All"
                                                    onSelect={() => {
                                                        setFilter('direction', null);
                                                        setOpenDirection(false);
                                                    }}
                                                    className="flex items-center gap-2 cursor-pointer text-right"
                                                >
                                                    <Check className={cn("h-4 w-4", direction === null ? "opacity-100" : "opacity-0")} />
                                                    الكل
                                                </CommandItem>
                                                {options.directions?.map((dir) => (
                                                    <CommandItem
                                                        key={dir}
                                                        value={dir}
                                                        onSelect={() => {
                                                            setFilter('direction', dir === direction ? null : dir)
                                                            setOpenDirection(false)
                                                        }}
                                                        className="flex items-center gap-2 cursor-pointer text-right"
                                                    >
                                                        <Check className={cn("h-4 w-4", direction === dir ? "opacity-100" : "opacity-0")} />
                                                        <span>{dir}</span>
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </ScrollArea>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                    </div>

                    {/* 4. Unit Types (Multi) */}
                    <div className="space-y-2">
                        <Label className="text-xs font-medium text-muted-foreground">نوع الوحدة</Label>
                        <MultiSelectFilter
                            title="نوع الوحدات"
                            options={options?.unitTypes || []}
                            selectedValues={unitTypes}
                            onSelectionChange={(val) => setFilter('unitTypes', val)}
                            className="w-full justify-between bg-background"
                        />
                    </div>

                    {/* 5. Amenities (Multi) */}
                    <div className="space-y-2">
                        <Label className="text-xs font-medium text-muted-foreground">مكونات الوحدة</Label>
                        <MultiSelectFilter
                            title="مكونات الوحدة"
                            options={options?.amenities || []}
                            selectedValues={amenities}
                            onSelectionChange={(val) => setFilter('amenities', val)}
                            className="w-full justify-between bg-background"
                        />
                    </div>

                </div>

                <Separator />

                {/* --- Row 2: Sliders & Actions --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 items-end">

                    {/* Price Range */}
                    <div className="space-y-2">
                        <Label className="text-xs font-medium text-muted-foreground">نطاق السعر</Label>
                        <RangeFilter
                            label="السعر"
                            value={priceRange}
                            onChange={(val) => setFilter('priceRange', val)}
                            formatDisplay={(val) => `${formatCurrency(val[0])} - ${formatCurrency(val[1])}`}
                            min={0}
                            max={10000000}
                            step={50000}
                            unit="ريال"
                        />
                    </div>

                    {/* Area Range */}
                    <div className="space-y-2">
                        <Label className="text-xs font-medium text-muted-foreground">نطاق المساحة</Label>
                        <RangeFilter
                            label="المساحة"
                            value={areaRange}
                            onChange={(val) => setFilter('areaRange', val)}
                            formatDisplay={(val) => `${val[0]} - ${val[1]}`}
                            min={0}
                            max={1000}
                            step={10}
                            unit="م²"
                        />
                    </div>

                    {/* Bedroom Range */}
                    <div className="space-y-2">
                        <Label className="text-xs font-medium text-muted-foreground">نطاق غرف النوم</Label>
                        <RangeFilter
                            label="غرف النوم"
                            value={bedroomsRange || [0, 10]}
                            onChange={(val) => setFilter('bedroomsRange', val)}
                            formatDisplay={(val) => `${val[0]} - ${val[1]}`}
                            min={0}
                            max={10}
                            step={1}
                            unit="غرف"
                        />
                    </div>

                    {/* Placeholder for alignment (optional) */}
                    <div className="hidden xl:block"></div>

                    {/* Action Buttons: Search & Reset */}
                    <div className="flex items-center gap-2">
                        <Button
                            className="flex-1 bg-[#8B5CF6] hover:bg-[#7c4dff] text-white"
                            onClick={() => {
                                // Logic for search click can go here if needed
                                console.log("Searching...");
                            }}
                        >
                            <Search className="w-4 h-4 ml-2" />
                            بحث
                        </Button>

                        {(status !== 'All' || projectId || unitTypes.length > 0 || amenities.length > 0 || direction) && (
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
