'use client';

import dynamic from 'next/dynamic';
import { Project } from '@/lib/types';
import { Loader2 } from 'lucide-react';

const MapComponent = dynamic(
    () => import('./project-map'),
    {
        ssr: false,
        loading: () => <div className="h-full w-full flex items-center justify-center bg-muted"><Loader2 className="h-8 w-8 animate-spin" /></div>
    }
);

export function ClientProjectMap({ projects }: { projects: Project[] }) {
    return <MapComponent projects={projects} />;
}
