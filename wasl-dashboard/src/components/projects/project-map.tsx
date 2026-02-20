import { GoogleMap, useJsApiLoader, OverlayViewF, InfoWindowF } from '@react-google-maps/api';
import { useMemo, useCallback, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ProjectCard } from './project-card';
import { Project, Unit } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { UnitCard } from '@/components/units/unit-card';

interface ProjectMapProps {
    projects: Project[];
    unit?: Unit;
}

const containerStyle = {
    width: '100%',
    height: '100%',
    borderRadius: '1rem'
};

const defaultCenter = {
    lat: 24.7136,
    lng: 46.6753
};

const mapOptions: google.maps.MapOptions = {
    disableDefaultUI: false,
    zoomControl: true,
    streetViewControl: false,
    mapTypeControl: false,
    fullscreenControl: true,
    styles: [
        {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "off" }]
        }
    ]
};

export default function ProjectMap({ projects, unit }: ProjectMapProps) {
    const router = useRouter();
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''
    });

    const [hoveredProject, setHoveredProject] = useState<Project | null>(null);
    const [mapCenter, setMapCenter] = useState(defaultCenter);

    // Initial Center
    const initialCenter = useMemo(() => {
        if (projects.length > 0 && projects[0].location) {
            return {
                lat: projects[0].location.lat,
                lng: projects[0].location.lng
            };
        }
        return defaultCenter;
    }, [projects]);

    // Update map center only when projects change (not on hover)
    useEffect(() => {
        setMapCenter(initialCenter);
    }, [initialCenter]);

    const formatPrice = (price: number) => {
        if (price >= 1000000) return (price / 1000000).toFixed(1) + 'M';
        if (price >= 1000) return (price / 1000).toFixed(0) + 'K';
        return price.toString();
    };

    if (!isLoaded) {
        return <div className="h-full w-full bg-gray-100 animate-pulse rounded-2xl" />;
    }

    return (
        <GoogleMap
            mapContainerStyle={containerStyle}
            center={mapCenter}
            zoom={12}
            options={mapOptions}
        >
            {projects.map((project) => (
                project.location && (
                    <OverlayViewF
                        key={project.id}
                        position={{ lat: project.location.lat, lng: project.location.lng }}
                        mapPaneName="overlayMouseTarget"
                    >
                        <div
                            className="relative -translate-x-1/2 -translate-y-full cursor-pointer group z-10 hover:z-20"
                            onClick={(e) => {
                                e.stopPropagation();
                                setHoveredProject(project);
                                setMapCenter({ lat: project.location!.lat, lng: project.location!.lng });
                            }}
                        >
                            {/* Premium Marker - Pill Shape */}
                            <div className="bg-primary/90 backdrop-blur-md border border-white/20 rounded-full px-3.5 py-1.5 shadow-[0_4px_12px_rgba(0,0,0,0.25)] ring-1 ring-white/10 transform transition-all duration-300 group-hover:scale-110 group-hover:bg-primary group-hover:ring-primary/50 flex items-center justify-center min-w-[60px]">
                                <span className="text-[11px] font-black text-white tabular-nums tracking-tighter">
                                    {formatPrice(unit ? unit.price : project.priceStart)}
                                </span>
                            </div>
                            {/* Marker Tail */}
                            <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-primary/90 mx-auto -mt-[1px] group-hover:border-t-primary transition-colors duration-300" />
                        </div>
                    </OverlayViewF>
                )
            ))}

            {(hoveredProject || unit) && (
                <InfoWindowF
                    position={{
                        lat: (unit?.projectLocation?.lat || hoveredProject?.location?.lat) || 0,
                        lng: (unit?.projectLocation?.lng || hoveredProject?.location?.lng) || 0
                    }}
                    onCloseClick={() => setHoveredProject(null)}
                    options={{
                        pixelOffset: new google.maps.Size(0, -45),
                    }}
                >
                    <div className="w-[300px] bg-transparent -m-3">
                        {unit ? (
                            <UnitCard unit={unit} />
                        ) : (
                            hoveredProject && <ProjectCard project={hoveredProject} />
                        )}
                    </div>
                </InfoWindowF>
            )}
        </GoogleMap>
    );
}

