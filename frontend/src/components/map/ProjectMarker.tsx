
import React from 'react';
import { AdvancedMarker } from '@vis.gl/react-google-maps';
import { MapProject } from '../../services/projects';

interface ProjectMarkerProps {
    project: MapProject;
    onClick: (project: MapProject) => void;
    isSelected?: boolean;
}

export const ProjectMarker: React.FC<ProjectMarkerProps> = ({ project, onClick, isSelected }) => {
    // Determine color based on status
    const getStatusColor = (status: string) => {
        if (status === 'متاح') return 'bg-emerald-500 text-white border-emerald-600';
        if (status === 'محدود') return 'bg-orange-500 text-white border-orange-600';
        return 'bg-slate-500 text-white border-slate-600';
    };

    const colorClass = getStatusColor(project.project_status);
    const priceLabel = Intl.NumberFormat('en-US', {
        notation: "compact",
        maximumFractionDigits: 1
    }).format(project.min_available_price);

    return (
        <AdvancedMarker
            position={{ lat: project.lat, lng: project.lng }}
            onClick={() => onClick(project)}
            zIndex={isSelected ? 100 : 1}
        >
            <div
                className={`
                    group relative
                    px-3 py-1.5 rounded-full font-bold text-xs shadow-md border-2 
                    transition-all duration-300 cursor-pointer flex items-center gap-1
                    ${colorClass}
                    ${isSelected ? 'scale-125 ring-4 ring-white/50 z-50' : 'hover:scale-110'}
                `}
            >
                <span className="whitespace-nowrap">{priceLabel}</span>
                {isSelected && (
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-current" />
                )}

                {/* Hover Card */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 hidden group-hover:block z-50 w-48 bg-white rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-2">
                    <div className="h-24 bg-slate-200 relative">
                        {project.images_url ? (
                            <img src={project.images_url.split(',')[0]} alt={project.project_name} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400 bg-slate-100">No Image</div>
                        )}
                        <div className="absolute top-2 right-2 bg-black/50 text-white text-[10px] px-2 py-0.5 rounded-full backdrop-blur-md">
                            {project.available_units} وحدة
                        </div>
                    </div>
                    <div className="p-3 text-right">
                        <h4 className="font-bold text-slate-800 text-sm truncate text-black">{project.project_name}</h4>
                        <p className="text-[10px] text-slate-500">{project.district}</p>
                    </div>
                    {/* Arrow */}
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-white rotate-45 transform" />
                </div>
            </div>
        </AdvancedMarker>
    );
};
