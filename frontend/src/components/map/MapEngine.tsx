
import React, { useEffect } from 'react';
import { APIProvider, Map, useMap } from '@vis.gl/react-google-maps';
import { MapProject } from '../../services/projects';
import { ProjectMarker } from './ProjectMarker';

interface MapEngineProps {
    projects: MapProject[];
    selectedProject: MapProject | null;
    onMarkerClick: (project: MapProject) => void;
    onMapClick?: () => void;
}

// Separate component to use the useMap hook
const MapController: React.FC<{ selectedProject: MapProject | null }> = ({ selectedProject }) => {
    const map = useMap();

    useEffect(() => {
        if (!map || !selectedProject) return;

        const { lat, lng } = selectedProject;
        const targetPos = { lat, lng };

        // Always Fly-to and Zoom
        map.panTo(targetPos);

        // Zoom after delay
        const timeoutId = setTimeout(() => {
            map.setZoom(16);
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [map, selectedProject]);

    return null;
};

export const MapEngine: React.FC<MapEngineProps> = ({ projects, selectedProject, onMarkerClick, onMapClick }) => {
    // Fallback to hardcoded key if env var is missing during build (Common issue in Cloud Run source deploys)
    const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyDVBmwGTGKG-SvzkTaoYOVqNEv_l6zHhe4';

    return (
        <APIProvider apiKey={API_KEY}>
            <div className="w-full h-full relative bg-slate-100">
                <Map
                    defaultCenter={{ lat: 24.7136, lng: 46.6753 }}
                    defaultZoom={11}
                    mapId="DEMO_MAP_ID"
                    gestureHandling={'greedy'}
                    disableDefaultUI={true}
                    className="w-full h-full"
                    onClick={() => onMapClick && onMapClick()}
                >
                    {projects.map(project => (
                        <ProjectMarker
                            key={project.project_id}
                            project={project}
                            isSelected={selectedProject?.project_id === project.project_id}
                            onClick={onMarkerClick}
                        />
                    ))}

                    <MapController selectedProject={selectedProject} />
                </Map>

                {!API_KEY && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-[9999] text-white p-6 text-center backdrop-blur-sm">
                        <div>
                            <h3 className="text-xl font-bold mb-2">Google Maps API Key Missing</h3>
                            <p className="text-sm opacity-80">Please add VITE_GOOGLE_MAPS_API_KEY to your .env file to enable the map.</p>
                        </div>
                    </div>
                )}
            </div>
        </APIProvider>
    );
};
