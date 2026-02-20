
'use client';

import { Search, SlidersHorizontal, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FilterContainer } from '@/components/shared/filter-container';
import { Input } from '@/components/ui/input';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from '@/components/ui/badge';

interface UnitsFilterBarProps {
    filters: any;
    setFilter: (key: string, value: any) => void;
    resetFilters: () => void;
    projects: { id: string, name: string }[];
    unitTypes: string[];
}



export function UnitsFilterBar({ filters, setFilter, resetFilters, projects, unitTypes }: UnitsFilterBarProps) {
    return (
        <FilterContainer>
            <div className="flex flex-col md:flex-row gap-4 items-center">
                {/* Search */}
                <div className="relative flex-1 w-full md:w-auto">
                    <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="بحث برقم الوحدة أو الكود..."
                        className="pr-9"
                        value={filters.searchQuery}
                        onChange={(e) => setFilter('searchQuery', e.target.value)}
                    />
                </div>

                {/* Project Filter */}
                <Select
                    value={filters.projectId || "All"}
                    onValueChange={(val) => setFilter('projectId', val === "All" ? null : val)}
                >
                    <SelectTrigger className="w-full md:w-[200px]">
                        <SelectValue placeholder="المشروع" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="All">كل المشاريع</SelectItem>
                        {projects.map(p => (
                            <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {/* Type Filter */}
                <Select
                    value={filters.type || "All"}
                    onValueChange={(val) => setFilter('type', val === "All" ? null : val)}
                >
                    <SelectTrigger className="w-full md:w-[160px]">
                        <SelectValue placeholder="نوع الوحدة" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="All">الكل</SelectItem>
                        {unitTypes.map(t => (
                            <SelectItem key={t} value={t}>{t}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {/* Status Filter */}
                <Select
                    value={filters.status || "All"}
                    onValueChange={(val) => setFilter('status', val === "All" ? null : val)}
                >
                    <SelectTrigger className="w-full md:w-[150px]">
                        <SelectValue placeholder="الحالة" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="All">الكل</SelectItem>
                        <SelectItem value="Available">متاح</SelectItem>
                        <SelectItem value="Reserved">محجوز</SelectItem>
                        <SelectItem value="Sold">مباع</SelectItem>
                    </SelectContent>
                </Select>

                {/* Advanced Filters Trigger (Price, Area, etc.) */}
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline" size="icon" className="shrink-0">
                            <SlidersHorizontal className="h-4 w-4" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 p-4 space-y-6">
                        <div className="space-y-4">
                            <h4 className="font-medium leading-none">نطاق السعر</h4>
                            <div className="flex justify-between text-sm text-muted-foreground">
                                <span>{(filters.priceRange[0]).toLocaleString()}</span>
                                <span>{(filters.priceRange[1]).toLocaleString()}</span>
                            </div>
                            <Slider
                                min={0}
                                max={5000000}
                                step={50000}
                                value={filters.priceRange}
                                onValueChange={(val) => setFilter('priceRange', val)}
                            />
                        </div>

                        <div className="space-y-4">
                            <h4 className="font-medium leading-none">المساحة (م²)</h4>
                            <div className="flex justify-between text-sm text-muted-foreground">
                                <span>{filters.areaRange[0]}</span>
                                <span>{filters.areaRange[1]}</span>
                            </div>
                            <Slider
                                min={0}
                                max={1000}
                                step={10}
                                value={filters.areaRange}
                                onValueChange={(val) => setFilter('areaRange', val)}
                            />
                        </div>

                        <div className="space-y-2">
                            <h4 className="font-medium leading-none mb-3">غرف النوم</h4>
                            <div className="flex flex-wrap gap-2">
                                {[1, 2, 3, 4, 5].map(num => (
                                    <Badge
                                        key={num}
                                        variant={filters.bedrooms === num ? "default" : "outline"}
                                        className="cursor-pointer px-3 py-1"
                                        onClick={() => setFilter('bedrooms', filters.bedrooms === num ? null : num)}
                                    >
                                        {num}+
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    </PopoverContent>
                </Popover>

                {/* Reset Button */}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={resetFilters}
                    className="text-muted-foreground hover:text-destructive shrink-0"
                    title="إعادة تعيين"
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>

            {/* Active Filters Badges (Optional refinement) */}
            <div className="flex flex-wrap gap-2">
                {(filters.projectId && filters.projectId !== 'All') && (
                    <Badge variant="secondary" className="gap-1">
                        المشروع: {projects.find(p => p.id.toString() === filters.projectId)?.name}
                        <X className="h-3 w-3 cursor-pointer" onClick={() => setFilter('projectId', null)} />
                    </Badge>
                )}
                {filters.bedrooms && (
                    <Badge variant="secondary" className="gap-1">
                        غرف: {filters.bedrooms}+
                        <X className="h-3 w-3 cursor-pointer" onClick={() => setFilter('bedrooms', null)} />
                    </Badge>
                )}
            </div>
        </FilterContainer>
    );
}
