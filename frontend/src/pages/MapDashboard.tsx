
import React, { useEffect, useState } from 'react';
import { MapEngine } from '../components/map/MapEngine';
import { FloatingFilterBar } from '../components/map/FloatingFilterBar';
import { ProjectDrawer } from '../components/map/ProjectDrawer';
import { fetchProjects, MapProject } from '../services/projects';

const MapDashboard: React.FC = () => {
    const [projects, setProjects] = useState<MapProject[]>([]);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [filteredProjects, setFilteredProjects] = useState<MapProject[]>([]);
    const [selectedProject, setSelectedProject] = useState<MapProject | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Initial Load
    useEffect(() => {
        const load = async () => {
            const data = await fetchProjects();
            setProjects(data);
            setFilteredProjects(data); // Primary copy for display
            setIsLoading(false);
        };
        load();
    }, []);

    // Unified Filter Logic
    const handleFilterUpdate = (filters: import('../components/map/FloatingFilterBar').FilterState) => {
        let result = projects;

        // Search
        if (filters.searchTerm) {
            result = result.filter(p =>
                p.project_name.includes(filters.searchTerm) || p.district.includes(filters.searchTerm)
            );
        }


        // Dropdowns
        if (filters.type !== 'الكل') result = result.filter(p => p.project_type === filters.type);
        if (filters.status !== 'الكل') result = result.filter(p => p.project_status === filters.status);
        if (filters.unitType !== 'الكل') result = result.filter(p => p.unit_types.includes(filters.unitType));
        if (filters.direction !== 'الكل') result = result.filter(p => p.direction === filters.direction);
        if (filters.district !== 'الكل') result = result.filter(p => p.district === filters.district);

        // Ranges
        if (filters.minPrice) result = result.filter(p => p.min_available_price >= filters.minPrice!);

        if (filters.maxPrice) result = result.filter(p => (p.max_available_price || p.min_available_price) <= filters.maxPrice!);

        if (filters.minArea) result = result.filter(p => p.min_available_area >= filters.minArea!);
        if (filters.maxArea) result = result.filter(p => (p.max_available_area || p.min_available_area) <= filters.maxArea!);

        // Bedrooms (Simple logic: if project has range 3-5, and we want 4, it matches. If we want 5+, check max >= 5)
        if (filters.bedrooms) {
            if (filters.bedrooms === 5) {
                result = result.filter(p => (p.max_available_bedrooms || p.min_available_bedrooms) >= 5);
            } else {
                // Check intersection of ranges [min, max] and target [target, target]
                // Actually simple check: Is target within [min, max]?
                result = result.filter(p => {
                    const max = p.max_available_bedrooms || p.min_available_bedrooms;
                    return filters.bedrooms! >= p.min_available_bedrooms && filters.bedrooms! <= max;
                });
            }
        }

        setFilteredProjects(result);
    };

    return (
        <div className="relative h-screen w-screen overflow-hidden bg-slate-100 font-sans" dir="rtl">
            {/* Floating Filter Bar (HUD) */}
            <FloatingFilterBar
                onFilterChange={handleFilterUpdate}
                className="top-6"
                projects={projects}
            />

            {/* Main Map Layer */}
            <div className="absolute inset-0 z-0">
                {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
                    </div>
                ) : (
                    <MapEngine
                        projects={filteredProjects} // Pass filtered list logic later, for now passing all
                        selectedProject={selectedProject}
                        onMarkerClick={setSelectedProject}
                        onMapClick={() => setSelectedProject(null)}
                    />
                )}
            </div>

            {/* Click Background to Close Drawer */}
            {selectedProject && (
                <div
                    className="absolute inset-0 z-10 pointer-events-none"
                // We need a way to detect clicks on the map specifically to close the drawer.
                // The MapEngine handles map clicks. But if we have an overlay, we might need a transparent layer?
                // Actually, Google Maps has an onClick event. We'll use that in MapEngine.
                />
            )}

            {/* Right Panel Drawer */}
            <ProjectDrawer
                project={selectedProject}
                onClose={() => setSelectedProject(null)}
            />
        </div>
    );
};

export default MapDashboard;
