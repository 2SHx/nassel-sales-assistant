
'use client';

import { LayoutGrid, Map as MapIcon } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { cn } from "@/lib/utils";

interface ViewToggleProps {
    view: 'list' | 'map';
    setView: (view: 'list' | 'map') => void;
    className?: string;
}

export function ViewToggle({ view, setView, className }: ViewToggleProps) {
    return (
        <div className={cn("bg-muted/50 border rounded-xl p-1 shadow-sm", className)}>
            <ToggleGroup type="single" value={view} onValueChange={(val) => val && setView(val as 'list' | 'map')}>
                <ToggleGroupItem
                    value="list"
                    aria-label="List View"
                    className="data-[state=on]:bg-white data-[state=on]:text-primary data-[state=on]:shadow-sm rounded-lg transition-all"
                >
                    <LayoutGrid className="h-4 w-4 me-2" />
                    <span className="text-xs font-medium">قائمة</span>
                </ToggleGroupItem>
                <ToggleGroupItem
                    value="map"
                    aria-label="Map View"
                    className="data-[state=on]:bg-white data-[state=on]:text-primary data-[state=on]:shadow-sm rounded-lg transition-all"
                >
                    <MapIcon className="h-4 w-4 me-2" />
                    <span className="text-xs font-medium">خريطة</span>
                </ToggleGroupItem>
            </ToggleGroup>
        </div>
    );
}
