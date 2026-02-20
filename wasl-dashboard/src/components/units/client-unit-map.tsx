
'use client';

import dynamic from 'next/dynamic';
import { Unit } from '@/lib/types';
import { Loader2 } from 'lucide-react';

// Using the same strategy as ProjectMap to avoid SSR issues with Leaflet
const MapComponent = dynamic(
    () => import('./unit-map'),
    {
        ssr: false,
        loading: () => <div className="h-full w-full flex items-center justify-center bg-muted min-h-[400px] rounded-2xl"><Loader2 className="h-8 w-8 animate-spin" /></div>
    }
);

export function ClientUnitMap({ units }: { units: Unit[] }) {
    return <MapComponent units={units} />;
}
