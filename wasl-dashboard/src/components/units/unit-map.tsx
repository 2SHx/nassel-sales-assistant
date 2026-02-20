import { GoogleMap, useJsApiLoader, OverlayViewF, InfoWindowF } from '@react-google-maps/api';
import { useMemo, useCallback, useState, useEffect } from 'react';
import { Unit } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Ruler, ChevronRight } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { ProjectCard } from '../projects/project-card';
import { UnitCard } from './unit-card'; // Use the shared UnitCard
import { Project } from '@/lib/types';

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

interface ProjectGroup {
    projectId: string;
    projectName: string;
    location: { lat: number; lng: number };
    units: Unit[];
    priceRange: { min: number; max: number };
    areaRange: { min: number; max: number };
    bounds: { north: number; south: number; east: number; west: number }; // Added bounds
}

export default function UnitMap({ units }: { units: Unit[] }) {
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''
    });

    const [map, setMap] = useState<google.maps.Map | null>(null);
    const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
    const [hoveredUnit, setHoveredUnit] = useState<Unit | null>(null); // New hover state
    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
    const [hoveredGroup, setHoveredGroup] = useState<ProjectGroup | null>(null);
    const [mapCenter, setMapCenter] = useState(defaultCenter);

    const onLoad = useCallback(function callback(map: google.maps.Map) {
        setMap(map);
    }, []);

    const onUnmount = useCallback(function callback(map: google.maps.Map) {
        setMap(null);
    }, []);

    // Transform group to Project type for ProjectCard
    const groupToProject = (group: ProjectGroup): Project => {
        const firstUnit = group.units[0];
        return {
            id: group.projectId,
            name: group.projectName,
            status: firstUnit.projectStatus === 'Available' ? 'Available' : 'Sold Out',
            location: {
                lat: group.location.lat,
                lng: group.location.lng,
                city: firstUnit.projectLocation?.city || 'الرياض',
                district: firstUnit.projectLocation?.district || 'الصفا'
            },
            priceStart: group.priceRange.min,
            areaRange: {
                min: group.areaRange.min,
                max: group.areaRange.max
            },
            amenities: firstUnit.amenities || [],
            unitTypes: Array.from(new Set(group.units.map(u => u.type))),
            developer: firstUnit.developer || 'واصل'
        };
    };

    // Group units by project
    const projectGroups = useMemo(() => {
        const groups: Record<string, ProjectGroup> = {};

        units.forEach(unit => {
            if (!unit.projectId || !unit.projectLocation) return;

            if (!groups[unit.projectId]) {
                groups[unit.projectId] = {
                    projectId: unit.projectId,
                    projectName: unit.projectName || 'مشروع غير مسمى',
                    location: unit.projectLocation,
                    units: [],
                    priceRange: { min: Infinity, max: -Infinity },
                    areaRange: { min: Infinity, max: -Infinity },
                    bounds: {
                        north: -90, south: 90, east: -180, west: 180
                    }
                };
            }

            const g = groups[unit.projectId];
            g.units.push(unit);
            g.priceRange.min = Math.min(g.priceRange.min, unit.price);
            g.priceRange.max = Math.max(g.priceRange.max, unit.price);
            g.areaRange.min = Math.min(g.areaRange.min, unit.area);
            g.areaRange.max = Math.max(g.areaRange.max, unit.area);

            // This relies on Project Location for cluster center, 
            // but we can assume units are somewhat near the project center
            // or if we had individual unit lat/lng we would expand bounds with that.
            // Since we rely on randomized offset in the view, we can just box the project location 
            // or if we have distinct unit locations in the future.

            // For now, since units share project location + offset, the bounds are just the project location (+ offset approx).
            // Let's just use the project location as a base.

        });

        return Object.values(groups);
    }, [units]);

    // Current view data
    const currentGroup = useMemo(() =>
        projectGroups.find(g => g.projectId === selectedProjectId),
        [projectGroups, selectedProjectId]);

    const formatShortPrice = (price: number) => {
        if (price >= 1000000) return (price / 1000000).toFixed(1) + 'M';
        if (price >= 1000) return (price / 1000).toFixed(0) + 'K';
        return price.toString();
    };

    // Initial Center logic (only on load or project group changes)
    useEffect(() => {
        if (projectGroups.length > 0 && !selectedProjectId) {
            // Optional: Fit bounds of all projects
        }
    }, [projectGroups.length, selectedProjectId]);

    if (!isLoaded) {
        return <div className="h-full w-full bg-gray-100 animate-pulse rounded-2xl" />;
    }

    // Determine which unit to show details for (Clicked takes precedence over Hovered)
    const activeUnit = selectedUnit || hoveredUnit;

    return (
        <div className="relative w-full h-full">
            {/* Overlay Controls */}
            {selectedProjectId && (
                <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="shadow-md border bg-white hover:bg-gray-50 text-right justify-start font-bold"
                        onClick={() => {
                            setSelectedProjectId(null);
                            setSelectedUnit(null);
                            setHoveredUnit(null);
                            map?.setZoom(11); // Reset zoom
                            setMapCenter(defaultCenter);
                        }}
                    >
                        <ArrowRight className="ml-2 h-4 w-4" />
                        العودة لجميع المشاريع
                    </Button>
                </div>
            )}

            <GoogleMap
                mapContainerStyle={containerStyle}
                center={mapCenter}
                zoom={11}
                onLoad={onLoad}
                onUnmount={onUnmount}
                options={mapOptions}
                onClick={() => {
                    // Clicking map background clears selection
                    setSelectedUnit(null);
                }}
            >
                {/* Project Clusters View */}
                {!selectedProjectId && projectGroups.map((group) => (
                    <OverlayViewF
                        key={group.projectId}
                        position={group.location}
                        mapPaneName="overlayMouseTarget"
                    >
                        <div
                            className="relative -translate-x-1/2 -translate-y-full cursor-pointer group z-10 hover:z-20"
                            onMouseEnter={() => setHoveredGroup(group)}
                            onMouseLeave={() => setHoveredGroup(null)}
                            onClick={() => {
                                setSelectedProjectId(group.projectId);
                                setMapCenter(group.location);
                                map?.setZoom(15); // Zoom in to see units
                            }}
                        >
                            {/* Premium Cluster Marker */}
                            <div className="bg-primary backdrop-blur-md border border-white/20 rounded-full px-4 py-2 shadow-[0_8px_24px_rgba(0,0,0,0.25)] ring-1 ring-white/10 transform transition-all duration-300 group-hover:scale-110 group-hover:bg-primary/90 group-hover:ring-primary/50 flex items-center justify-center min-w-[100px]">
                                <span className="text-[11px] font-black text-white tabular-nums text-center tracking-tighter">
                                    {formatShortPrice(group.priceRange.min)} - {formatShortPrice(group.priceRange.max)}
                                </span>
                            </div>
                            <div className="w-0 h-0 border-l-[7px] border-l-transparent border-r-[7px] border-r-transparent border-t-[9px] border-t-primary mx-auto -mt-[1px] group-hover:border-t-primary/90 transition-colors duration-300" />
                        </div>
                    </OverlayViewF>
                ))}

                {/* Individual Units View (Drill-down) */}
                {selectedProjectId && currentGroup && currentGroup.units.map((unit, idx) => {
                    // Simulate unit spread since we don't have unique unit lat/lng
                    const unitLat = currentGroup.location.lat + (Math.sin(idx * 1.5) * 0.0002);
                    const unitLng = currentGroup.location.lng + (Math.cos(idx * 1.5) * 0.0002);

                    return (
                        <OverlayViewF
                            key={unit.id}
                            position={{ lat: unitLat, lng: unitLng }}
                            mapPaneName="overlayMouseTarget"
                        >
                            <div
                                className={`
                                    relative -translate-x-1/2 -translate-y-full cursor-pointer group transition-all duration-300
                                    ${activeUnit?.id === unit.id ? 'z-50 scale-110' : 'z-10 hover:z-20 hover:scale-105'}
                                `}
                                onClick={(e) => {
                                    e.stopPropagation(); // Prevent map click
                                    setSelectedUnit(unit);
                                }}
                                onMouseEnter={() => setHoveredUnit(unit)}
                                onMouseLeave={() => setHoveredUnit(null)}
                            >
                                <div className={`
                                    border border-white/20 rounded-full px-3 py-1.5 shadow-[0_4px_12px_rgba(0,0,0,0.15)] ring-1 ring-white/10 flex items-center justify-center min-w-[70px] backdrop-blur-md transition-all duration-300
                                    ${activeUnit?.id === unit.id
                                        ? 'bg-primary border-primary text-white ring-primary/50 scale-110'
                                        : 'bg-primary/80 text-white hover:bg-primary hover:scale-105'}
                                `}>
                                    <span className="text-[11px] font-black tabular-nums tracking-tighter">
                                        {formatShortPrice(unit.price)}
                                    </span>
                                </div>
                                <div className={`
                                    w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[7px] mx-auto -mt-[1px] transition-colors duration-300
                                    ${activeUnit?.id === unit.id ? 'border-t-primary' : 'border-t-primary/80 group-hover:border-t-primary'}
                                `} />
                            </div>
                        </OverlayViewF>
                    );
                })}

                {/* InfoWindow for Project Cluster Hover */}
                {hoveredGroup && (
                    <InfoWindowF
                        position={hoveredGroup.location}
                        onCloseClick={() => setHoveredGroup(null)}
                        options={{
                            pixelOffset: new google.maps.Size(0, -50),
                        }}
                    >
                        <div className="w-[300px] overflow-hidden -m-2 rounded-[1.5rem] bg-transparent border-0 shadow-none">
                            <ProjectCard project={groupToProject(hoveredGroup)} />
                        </div>
                    </InfoWindowF>
                )}

                {/* InfoWindow for Unit Hover/Click - EXACTLY like Unit Card */}
                {activeUnit && (
                    <InfoWindowF
                        position={{
                            lat: (activeUnit.projectLocation?.lat || defaultCenter.lat) + (Math.sin(currentGroup?.units.findIndex(u => u.id === activeUnit.id)! * 1.5) * 0.0002) + 0.0001,
                            lng: (activeUnit.projectLocation?.lng || defaultCenter.lng) + (Math.cos(currentGroup?.units.findIndex(u => u.id === activeUnit.id)! * 1.5) * 0.0002) + 0.0001
                        }}
                        onCloseClick={() => {
                            setSelectedUnit(null);
                            setHoveredUnit(null);
                        }}
                        options={{
                            pixelOffset: new google.maps.Size(0, -45),
                            disableAutoPan: true // Prevent map moving for hover state
                        }}
                    >
                        <div className="w-[300px] bg-transparent -m-3">
                            <UnitCard unit={activeUnit} />
                        </div>
                    </InfoWindowF>
                )}
            </GoogleMap>
        </div >
    );
}
