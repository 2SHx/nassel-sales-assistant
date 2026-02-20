import Link from 'next/link';
import { MapPin, Ruler, ArrowUpRight, Compass, Eye } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Project } from '@/lib/types';

interface ProjectCardProps {
    project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
    const isAvailable = project.status === 'Available';

    return (
        <Link href={`/projects/${project.id}`} className="block group">
            <Card className="relative rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col h-full overflow-hidden">
                {/* Card Content */}
                <div className="p-5 flex flex-col h-full gap-4">
                    {/* Header: Name + Status */}
                    <div className="flex justify-between items-start gap-3">
                        <div className="flex flex-col gap-1 flex-1 min-w-0">
                            <h3 className="font-bold text-lg text-gray-900 leading-tight line-clamp-1 group-hover:text-primary transition-colors duration-200">
                                {project.name}
                            </h3>
                            <div className="flex items-center gap-2 flex-wrap text-xs text-gray-500">
                                <span className="flex items-center gap-1">
                                    <MapPin className="h-3.5 w-3.5 text-primary/70" />
                                    {project.location.district} - {project.location.city}
                                </span>
                                {project.direction && (
                                    <span className="flex items-center gap-1">
                                        <Compass className="h-3.5 w-3.5 text-primary/70" />
                                        {project.direction}
                                    </span>
                                )}
                            </div>
                        </div>
                        <Badge
                            className={`shrink-0 text-[10px] font-semibold px-2.5 py-1 rounded-full border-0 ${isAvailable
                                ? 'bg-emerald-50 text-emerald-600'
                                : 'bg-gray-100 text-gray-500'
                                }`}
                        >
                            {isAvailable ? 'متاح' : 'مباع'}
                        </Badge>
                    </div>

                    {/* Stats Rows - Horizontal Layout (Original Design) */}
                    <div className="flex flex-col gap-3 py-2">
                        {/* Price Row */}
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-medium text-gray-400">يبدأ من</span>
                            <div className="flex items-baseline gap-1" dir="ltr">
                                <span className="text-[10px] font-medium text-gray-400">
                                    {project.priceStart >= 1000000 ? 'مليون' : 'ألف'} ر.س
                                </span>
                                <span className="text-lg font-bold text-primary tabular-nums">
                                    {project.priceStart >= 1000000
                                        ? (project.priceStart / 1000000).toFixed(2)
                                        : (project.priceStart / 1000).toFixed(0)}
                                </span>
                            </div>
                        </div>

                        {/* Area Row */}
                        <div className="flex items-center justify-between border-t border-gray-50 pt-3">
                            <span className="text-[10px] font-medium text-gray-400">المساحات</span>
                            <div className="flex items-center gap-1" dir="ltr">
                                <span className="text-[10px] text-gray-400">م²</span>
                                <span className="text-sm font-semibold text-gray-700 tabular-nums">
                                    {project.areaRange.min} - {project.areaRange.max}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Unit Type Tags */}
                    <div className="flex flex-wrap gap-1.5 mt-auto pt-2">
                        {project.unitTypes.slice(0, 3).map((type) => (
                            <span
                                key={type}
                                className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-gray-50 text-[10px] font-medium text-gray-600 border border-gray-100"
                            >
                                {type}
                            </span>
                        ))}
                        {project.unitTypes.length > 3 && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-gray-50 text-[10px] font-medium text-gray-400">
                                +{project.unitTypes.length - 3}
                            </span>
                        )}
                    </div>
                </div>

                {/* Button Footer - Streamlined */}
                <div className="mt-auto border-t border-gray-100 px-5 py-3">
                    <div className="flex items-center justify-center gap-2 text-primary font-semibold text-sm group-hover:gap-3 transition-all duration-200">
                        <Eye className="h-4 w-4" />
                        <span>عرض التفاصيل</span>
                        <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </div>
                </div>
            </Card>
        </Link>
    );
}
