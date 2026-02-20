import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Unit } from '@/lib/types';
import { BedDouble, Bath, Ruler, Compass, Eye, ArrowUpRight } from 'lucide-react';

export function UnitCard({ unit }: { unit: Unit }) {
    return (
        <Link href={`/units/${unit.id}`} className="block group">
            <Card className="relative rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col h-full overflow-hidden">
                {/* Card Content */}
                <div className="p-5 flex flex-col h-full gap-4">
                    {/* Header: Type + Project + Status */}
                    <div className="flex justify-between items-start gap-3">
                        <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-bold text-lg text-gray-900 leading-tight shrink-0 group-hover:text-primary transition-colors duration-200">
                                    {unit.type}
                                </h3>
                                <span className="text-xs text-gray-400 font-mono tracking-wider pt-0.5 shrink-0">#{unit.unitNumber || unit.id}</span>
                            </div>
                            {unit.projectName && (
                                <div>
                                    <Badge variant="outline" className="text-[10px] px-2 py-0.5 min-h-[20px] h-auto font-normal text-gray-500 bg-gray-50 border-gray-200 whitespace-normal leading-relaxed text-right inline-block">
                                        {unit.projectName}
                                    </Badge>
                                </div>
                            )}
                        </div>
                        <Badge
                            className={`shrink-0 text-[10px] font-semibold px-2.5 py-1 rounded-full border-0 ${unit.status === 'Available'
                                ? 'bg-emerald-50 text-emerald-600'
                                : unit.status === 'Sold'
                                    ? 'bg-red-50 text-red-500'
                                    : 'bg-gray-100 text-gray-500'
                                }`}
                        >
                            {unit.status === 'Available' ? 'متاح' : unit.status === 'Sold' ? 'مباع' : unit.status}
                        </Badge>
                    </div>

                    {/* Stats Row - Strict Alignment with ProjectCard */}
                    <div className="grid grid-cols-2 gap-3 py-3 border-t border-gray-100">
                        {/* Left Col: Price */}
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-medium text-gray-400 tracking-wide">السعر</span>
                            <div className="flex items-baseline gap-1.5">
                                <span className="text-xl font-bold text-primary tabular-nums tracking-tight">
                                    {unit.price.toLocaleString()}
                                </span>
                                <span className="text-[10px] font-medium text-gray-400">ر.س</span>
                            </div>
                        </div>

                        {/* Right Col: Area */}
                        <div className="flex flex-col gap-1 items-end">
                            <span className="text-[10px] font-medium text-gray-400 tracking-wide">المساحة</span>
                            <div className="flex items-center gap-1">
                                <Ruler className="h-3 w-3 text-gray-400" />
                                <span className="text-sm font-semibold text-gray-700 tabular-nums">
                                    {unit.area}
                                </span>
                                <span className="text-[10px] text-gray-400">م²</span>
                            </div>
                        </div>
                    </div>

                    {/* Spec Tags - Replacing Project "Unit Types" Tags */}
                    <div className="flex flex-wrap gap-1.5 mt-auto">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-gray-50 text-[10px] font-medium text-gray-600 border border-gray-100">
                            <BedDouble className="h-3 w-3 text-gray-400" />
                            {unit.bedrooms} غرف
                        </span>
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-gray-50 text-[10px] font-medium text-gray-600 border border-gray-100">
                            <Bath className="h-3 w-3 text-gray-400" />
                            {unit.bathrooms} حمام
                        </span>
                        {(unit.direction || unit.orientation) && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-gray-50 text-[10px] font-medium text-gray-600 border border-gray-100">
                                <Compass className="h-3 w-3 text-gray-400" />
                                {unit.direction || unit.orientation}
                            </span>
                        )}
                    </div>
                </div>

                {/* Button Footer - Consistent */}
                <div className="mt-auto border-t border-gray-100 px-5 py-3 bg-gray-50/50">
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
