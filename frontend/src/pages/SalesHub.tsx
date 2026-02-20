import React, { useEffect, useState } from 'react';
import { MapEngine } from '../components/map/MapEngine';
import { ProjectDrawer } from '../components/map/ProjectDrawer';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { fetchProjects, MapProject } from '../services/projects';
import { FloatingFilterBar, FilterState } from '../components/map/FloatingFilterBar';
import { useRealtimeUnits } from '../hooks/useRealtimeUnits';
import { MarketInsights } from '../components/map/MarketInsights';

const SalesHub: React.FC = () => {
    const [projects, setProjects] = useState<MapProject[]>([]);
    const [filteredProjects, setFilteredProjects] = useState<MapProject[]>([]);
    const [selectedProject, setSelectedProject] = useState<MapProject | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    // Realtime Integration
    useRealtimeUnits(setProjects);

    // Initial Load
    useEffect(() => {
        const load = async () => {
            const data = await fetchProjects();
            setProjects(data);
            setFilteredProjects(data);
            setIsLoading(false);
        };
        load();
    }, []);

    // Complex Filter Logic
    const handleFilterChange = (filters: FilterState) => {
        let result = projects;

        // 1. Search Term
        if (filters.searchTerm) {
            const term = filters.searchTerm.toLowerCase();
            result = result.filter(p =>
                p.project_name.toLowerCase().includes(term) ||
                p.district.toLowerCase().includes(term) ||
                (p.project_code && p.project_code.toLowerCase().includes(term))
            );
        }

        // 2. Dropdown Filters
        if (filters.type !== 'الكل') {
            result = result.filter(p => p.project_type === filters.type);
        }
        if (filters.status !== 'الكل') {
            result = result.filter(p => p.project_status === filters.status);
        }
        if (filters.unitType !== 'الكل') {
            result = result.filter(p => p.unit_types && p.unit_types.includes(filters.unitType));
        }
        if (filters.direction !== 'الكل') {
            result = result.filter(p => p.direction === filters.direction);
        }
        if (filters.district !== 'الكل') {
            result = result.filter(p => p.district === filters.district);
        }

        // 3. Numeric Ranges
        if (filters.minPrice !== null) {
            result = result.filter(p => p.min_available_price >= (filters.minPrice as number));
        }
        if (filters.maxPrice !== null) {
            result = result.filter(p => p.min_available_price <= (filters.maxPrice as number));
        }

        // Area
        if (filters.minArea !== null) {
            result = result.filter(p => (p.max_available_area || 0) >= (filters.minArea as number));
        }
        if (filters.maxArea !== null) {
            result = result.filter(p => (p.min_available_area || 0) <= (filters.maxArea as number));
        }

        setFilteredProjects(result);
    };

    return (
        <div className="relative h-screen w-screen overflow-hidden bg-slate-100 font-sans" dir="rtl">
            {/* Simple Navigation Header */}
            <div className="absolute top-6 right-6 z-30 flex gap-4">
                <button
                    onClick={() => navigate('/')}
                    className="w-12 h-12 bg-white/90 backdrop-blur-xl border border-white/50 rounded-full shadow-lg flex items-center justify-center text-slate-700 hover:bg-[#7434bc] hover:text-white transition-all transform hover:scale-110"
                >
                    <ArrowLeft className="w-6 h-6" />
                </button>
            </div>

            {/* Restored Advanced Filters */}
            <FloatingFilterBar
                onFilterChange={handleFilterChange}
                projects={projects}
            />

            {/* Market Insights Overlay */}
            <MarketInsights
                projects={projects}
                onSelectProject={(p) => {
                    setSelectedProject(p);
                }}
            />

            {/* Main Map Layer */}
            <div className="absolute inset-0 z-0">
                {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
                    </div>
                ) : (
                    <MapEngine
                        projects={filteredProjects}
                        selectedProject={selectedProject}
                        onMarkerClick={setSelectedProject}
                        onMapClick={() => setSelectedProject(null)}
                    />
                )}
            </div>

            {/* Project Details Drawer */}
            <ProjectDrawer
                project={selectedProject}
                onClose={() => setSelectedProject(null)}
            />
        </div>
    );
};

export default SalesHub;
