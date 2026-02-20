'use client';

import { List, Map } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Button } from '@/components/ui/button';

interface ViewToggleProps {
    view: 'list' | 'map';
    setView: (view: 'list' | 'map') => void;
}

export function ViewToggle({ view, setView }: ViewToggleProps) {
    return (
        <div className="flex bg-muted p-1 rounded-lg">
            <Button
                variant={view === 'list' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setView('list')}
                className="gap-2"
            >
                <List className="h-4 w-4" />
                قائمة
            </Button>
            <Button
                variant={view === 'map' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setView('map')}
                className="gap-2"
            >
                <Map className="h-4 w-4" />
                خريطة
            </Button>
        </div>
    );
}
