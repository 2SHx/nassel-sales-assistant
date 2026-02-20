'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { supabase } from '@/lib/supabase';
import { Unit, Project } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    BedDouble, Bath, Ruler, MapPin, Building2, CheckCircle2,
    ArrowRight, FileText, Video, Image as ImageIcon, Box, Compass,
    ChevronDown, Copy, HomeIcon, ArrowUpRight, Calendar, ShieldCheck, Layers
} from 'lucide-react';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Normalize direction values from DB (feminine→short form)
function normalizeDirection(dir: string | null | undefined): string {
    if (!dir) return 'شمال';
    const map: Record<string, string> = {
        'شمالية': 'شمال', 'شمال': 'شمال',
        'جنوبية': 'جنوب', 'جنوب': 'جنوب',
        'شرقية': 'شرق', 'شرق': 'شرق',
        'غربية': 'غرب', 'غرب': 'غرب',
        'شمالية شرقية': 'شمال شرق', 'شمال شرق': 'شمال شرق',
        'شمالية غربية': 'شمال غرب', 'شمال غرب': 'شمال غرب',
        'جنوبية شرقية': 'جنوب شرق', 'جنوب شرق': 'جنوب شرق',
        'جنوبية غربية': 'جنوب غرب', 'جنوب غرب': 'جنوب غرب',
    };
    return map[dir.trim()] || dir;
}

// Dynamic import for ProjectMap to avoid SSR issues
const ProjectMap = dynamic(() => import('@/components/projects/project-map'), {
    ssr: false,
    loading: () => <div className="h-full w-full flex items-center justify-center bg-gray-100 min-h-[300px] rounded-xl"><Loader2 className="h-8 w-8 animate-spin text-gray-400" /></div>
});

export default function UnitDetailsPage({ params }: { params: { id: string } }) {
    const [unit, setUnit] = useState<Unit | null>(null);
    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchUnitData() {
            setLoading(true);

            // 1. Fetch Unit
            const { data: uData, error: uError } = await supabase
                .from('units')
                .select('*')
                .eq('id', params.id)
                .single();

            if (uData) {
                // 2. Fetch Project if unit has project_id
                let projectData: Project | null = null;
                if (uData.project_id) {
                    const { data: pData } = await supabase
                        .from('projects')
                        .select('*')
                        .eq('project_id', uData.project_id)
                        .single();

                    if (pData) {
                        projectData = {
                            id: pData.project_id,
                            name: pData.project_name,
                            status: pData.project_status === 'متاح' ? 'Ready' : 'Sold Out',
                            location: {
                                lat: Number(pData.lat),
                                lng: Number(pData.lng),
                                city: pData.city,
                                district: pData.district
                            },
                            priceStart: Number(uData.total_price) || 0,
                            areaRange: { min: 0, max: 0 },
                            amenities: pData.facilities ? pData.facilities.split(',') : [],
                            unitTypes: [],
                            developer: pData.developer,
                            direction: normalizeDirection(pData.direction)
                        };
                        setProject(projectData);
                    }
                }

                // Map Parsing Logic
                const statusVal = uData.unit_status || '';
                let status: 'Available' | 'Reserved' | 'Sold' = 'Available';
                if (statusVal === 'متاح' || statusVal === 'متاحة' || statusVal === 'Available') status = 'Available';
                else if (statusVal === 'مباع' || statusVal === 'مباعة' || statusVal === 'Sold') status = 'Sold';
                else if (statusVal === 'محجوز' || statusVal === 'محجوزة' || statusVal === 'Reserved') status = 'Reserved';

                // Map Unit
                setUnit({
                    id: uData.id,
                    projectId: uData.project_id,
                    type: uData.unit_type,
                    price: Number(uData.total_price) || 0,
                    bedrooms: Number(uData.bedrooms),
                    bathrooms: Number(uData.bathrooms),
                    area: Number(uData.unit_area) || 0,
                    status: status,
                    floor: uData.floor,
                    orientation: normalizeDirection(uData.direction),

                    // Exact DB Mapping (No Mocks)
                    unitCode: uData.unit_code,
                    unitNumber: uData.unit_number_in_project, // Mapping unit_number_in_project to unitNumber generally
                    unitNumberInProject: uData.unit_number_in_project,
                    buildingNumber: uData.building_number,
                    model: uData.unit_model,
                    developer: uData.developer, // Developer is on Unit directly too
                    elevatorStatus: uData.elevator_status,
                    totalArea: uData.total_area,
                    specialArea: uData.special_area,
                    patioArea: uData.yard_area,
                    projectOpeningDate: uData.project_opening_date,
                    sortingNumber: uData.unit_number_in_sorting,

                    // Arrays / Strings
                    unitComponents: uData.unit_components,
                    features: uData.features,
                    amenities: uData.unit_components ? uData.unit_components.split(',') : (uData.features ? uData.features.split(',') : []),

                    // Media
                    unitBrochure: uData.unit_brochure,
                    projectBrochure: uData.project_brochure,

                    // Mapping Location from Project
                    projectLocation: projectData?.location,

                    // Missing in DB currently -> Undefined
                    videoUrl: undefined,
                    virtualTourUrl: undefined,
                    images: []
                });

            } else {
                console.error("Error fetching unit:", uError);
            }
            setLoading(false);
        }

        fetchUnitData();
    }, [params.id]);

    if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
    if (!unit) return <div className="flex h-screen items-center justify-center text-muted-foreground">الوحدة غير موجودة</div>;

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        alert('تم النسخ بنجاح');
    };

    const generateUnitMessage = () => {
        if (!unit || !project) return '';
        const mapLink = `https://www.google.com/maps/search/?api=1&query=${project.location.lat},${project.location.lng}`;
        return `وحدة ${unit.unitNumber || unit.id} - ${project.name}
المساحة: ${unit.area} م²
السعر: ${unit.price.toLocaleString()} ريال
الموقع: ${mapLink}`;
    };

    return (
        <div className="flex flex-col gap-6 pb-20 animate-in fade-in duration-500">
            {/* Hero Section - Consistent with Project Details */}
            <div className="relative h-[320px] rounded-3xl overflow-hidden bg-slate-100 shadow-md">
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-10" />
                {unit.images && unit.images.length > 0 ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={unit.images[0]}
                        alt={`Unit ${unit.unitNumber}`}
                        className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                    />
                ) : (
                    <div className="h-full w-full flex items-center justify-center text-slate-400 bg-slate-200">
                        <ImageIcon className="h-16 w-16 opacity-30" />
                    </div>
                )}

                {/* Back Button Overlay */}
                <div className="absolute top-6 right-6 z-20">
                    <Button asChild variant="outline" size="sm" className="bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20 hover:text-white border-0">
                        <Link href="/units" className="flex items-center gap-2">
                            <ArrowRight className="h-4 w-4" />
                            العودة للوحدات
                        </Link>
                    </Button>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-8 z-20 text-white">
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-2">
                            <Badge className={`px-3 py-1 text-sm border-0 ${unit.status === 'Available' ? 'bg-emerald-500 text-white' :
                                unit.status === 'Sold' ? 'bg-rose-500 text-white' : 'bg-amber-500 text-white'
                                }`}>
                                {unit.status === 'Available' ? 'متاح' : unit.status === 'Sold' ? 'مباع' : 'محجوز'}
                            </Badge>
                            <Badge variant="outline" className="text-white border-white/40 bg-black/20 backdrop-blur-md px-3 py-1 text-sm">
                                {unit.type}
                            </Badge>
                            {unit.model && (
                                <Badge variant="outline" className="text-white border-white/40 bg-black/20 backdrop-blur-md px-3 py-1 text-sm">
                                    نموذج {unit.model}
                                </Badge>
                            )}
                        </div>
                        <h1 className="text-5xl font-extrabold tracking-tight drop-shadow-lg flex items-center gap-3">
                            {unit.unitNumber ? `وحدة ${unit.unitNumber}` : `وحدة ${unit.unitCode || unit.id}`}
                            <span className="text-2xl font-medium text-gray-300 opacity-80">{project?.name}</span>
                        </h1>
                        <div className="flex items-center gap-4 text-gray-200 text-sm font-medium">
                            <div className="flex items-center gap-1.5 bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-full">
                                <MapPin className="h-4 w-4" />
                                {project?.location.city}، {project?.location.district}
                            </div>
                            {(unit.direction || project?.direction) && (
                                <div className="flex items-center gap-1.5 bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-full">
                                    <Compass className="h-4 w-4" />
                                    {unit.direction || project?.direction}
                                </div>
                            )}
                            <div className="flex items-center gap-1.5 bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-full">
                                <Building2 className="h-4 w-4" />
                                الدور {unit.floor || '-'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs Navigation - Unified Style */}
            <Tabs defaultValue="overview" className="w-full">
                <TabsList className="w-full justify-start h-14 bg-white border rounded-2xl p-1.5 shadow-sm mb-6 overflow-x-auto hide-scrollbar">
                    <TabsTrigger value="overview" className="flex-1 h-full rounded-xl data-[state=active]:bg-primary/10 data-[state=active]:text-primary font-bold text-base transition-all whitespace-nowrap min-w-[150px]">المعلومات الأساسية</TabsTrigger>
                    <TabsTrigger value="location" className="flex-1 h-full rounded-xl data-[state=active]:bg-primary/10 data-[state=active]:text-primary font-bold text-base transition-all whitespace-nowrap min-w-[120px]">الموقع</TabsTrigger>
                    <TabsTrigger value="additional" className="flex-1 h-full rounded-xl data-[state=active]:bg-primary/10 data-[state=active]:text-primary font-bold text-base transition-all whitespace-nowrap min-w-[150px]">معلومات إضافية</TabsTrigger>
                    <TabsTrigger value="media" className="flex-1 h-full rounded-xl data-[state=active]:bg-primary/10 data-[state=active]:text-primary font-bold text-base transition-all whitespace-nowrap min-w-[120px]">الوسائط</TabsTrigger>
                </TabsList>

                {/* TAB 1: المعلومات الأساسية */}
                <TabsContent value="overview" className="space-y-6 animate-in fade-in duration-500">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* Right Column: Main Data */}
                        <div className="lg:col-span-2 space-y-6">

                            {/* Classification */}
                            <Card className="rounded-2xl border bg-card shadow-sm overflow-hidden">
                                <CardHeader className="bg-gray-50/50 border-b px-6 py-4">
                                    <CardTitle className="flex items-center gap-2 text-xl">
                                        <Building2 className="w-5 h-5 text-primary" />
                                        التصنيف
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-8 text-sm">
                                        <InfoBlock label="المشروع" value={project?.name} />
                                        <InfoBlock label="المطور" value={project?.developer || unit.developer} />
                                        <InfoBlock label="كود الوحدة" value={unit.unitCode} />
                                        <InfoBlock label="نموذج الوحدة" value={unit.model} />
                                        <InfoBlock label="نوع الوحدة" value={unit.type} />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Internal Specs */}
                            <Card className="rounded-2xl border bg-card shadow-sm overflow-hidden">
                                <CardHeader className="bg-gray-50/50 border-b px-6 py-4">
                                    <CardTitle className="flex items-center gap-2 text-xl">
                                        <HomeIcon className="w-5 h-5 text-primary" />
                                        المواصفات الداخلية
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6 space-y-6">
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <StatBox label="الغرف" value={unit.bedrooms} icon={<BedDouble />} />
                                        <StatBox label="دورات المياه" value={unit.bathrooms} icon={<Bath />} />
                                        <StatBox label="الطابق" value={unit.floor || '-'} icon={<Layers />} />
                                        <StatBox label="المصعد" value={unit.elevatorStatus || '-'} icon={<ChevronDown />} />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-gray-100">
                                        <div>
                                            <h4 className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wider">مكونات الوحدة</h4>
                                            <p className="text-gray-900 font-medium leading-relaxed">{unit.unitComponents || 'لا توجد بيانات'}</p>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wider">المزايا</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {unit.amenities && unit.amenities.length > 0 ? unit.amenities.map((amenity, i) => (
                                                    <Badge key={i} variant="secondary" className="px-3 py-1.5 text-sm font-normal bg-slate-100 text-slate-700 border border-slate-200">
                                                        <CheckCircle2 className="h-3.5 w-3.5 ml-2 text-primary" />
                                                        {amenity}
                                                    </Badge>
                                                )) : <span className="text-muted-foreground text-sm">لا توجد مزايا محددة</span>}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                        </div>

                        {/* Left Column: Metrics & Areas */}
                        <div className="space-y-6">

                            {/* Status & Pricing - Match Unit Details Original Style */}
                            <Card className="rounded-2xl border bg-card shadow-sm overflow-hidden">
                                <CardHeader className="bg-gray-50/50 border-b px-6 py-4">
                                    <CardTitle className="flex items-center gap-2 text-xl">
                                        <CheckCircle2 className="h-5 w-5 text-primary" />
                                        البيانات المالية
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <div className="flex flex-col gap-4">
                                        <div className="flex justify-between items-end border-b border-dashed pb-4">
                                            <span className="text-muted-foreground font-medium">سعر الوحدة</span>
                                            <div className="text-4xl font-extrabold text-primary tracking-tight">
                                                {unit.price.toLocaleString()} <span className="text-lg text-muted-foreground font-medium">ر.س</span>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 pt-2">
                                            <InfoBlock label="حالة البيع" value={
                                                unit.status === 'Available' ? 'متاح للبيع' :
                                                    unit.status === 'Sold' ? 'تم البيع' : 'محجوز'
                                            } />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Areas */}
                            <Card className="rounded-2xl border bg-card shadow-sm overflow-hidden">
                                <CardHeader className="bg-gray-50/50 border-b px-6 py-4">
                                    <CardTitle className="flex items-center gap-2 text-xl">
                                        <Ruler className="h-5 w-5 text-primary" />
                                        المساحات التفصيلية
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6 space-y-4">
                                    <AreaRow label="إجمالي مساحة الوحدة" value={unit.totalArea || unit.area} isHighlight />
                                    <AreaRow label="صافي مساحة الوحدة" value={unit.area} />
                                    <AreaRow label="مساحة خاصة" value={unit.specialArea || 0} />
                                </CardContent>
                            </Card>

                        </div>
                    </div>
                </TabsContent>

                {/* TAB 2: الموقع */}
                <TabsContent value="location" className="space-y-6 animate-in fade-in duration-500">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Location Details */}
                        <div className="lg:col-span-1 space-y-6">
                            <Card className="rounded-2xl border bg-card shadow-sm h-full">
                                <CardHeader className="bg-gray-50/50 border-b px-6 py-4">
                                    <CardTitle className="flex items-center gap-2 text-xl">
                                        <MapPin className="h-5 w-5 text-primary" />
                                        بيانات الموقع
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6 space-y-6">
                                    <InfoBlock label="المدينة" value={project?.location.city} />
                                    <InfoBlock label="الحي" value={project?.location.district} />
                                    <InfoBlock label="الواجهة" value={unit.direction || project?.direction} />
                                    <InfoBlock label="الاتجاه" value={unit.direction || project?.direction} />
                                </CardContent>
                            </Card>
                        </div>
                        {/* Map */}
                        <div className="lg:col-span-2">
                            <Card className="rounded-2xl border bg-card shadow-sm overflow-hidden h-[500px]">
                                <CardContent className="p-0 h-full">
                                    <ProjectMap projects={project ? [project] : []} unit={unit} />
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>

                {/* TAB 3: معلومات إضافية */}
                <TabsContent value="additional" className="space-y-6 animate-in fade-in duration-500">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Project Links */}
                        <Card className="rounded-2xl border bg-card shadow-sm overflow-hidden">
                            <CardHeader className="bg-gray-50/50 border-b px-6 py-4">
                                <CardTitle className="flex items-center gap-2 text-xl">
                                    <Calendar className="w-5 h-5 text-primary" />
                                    تفاصيل الارتباط
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-6 mt-2">
                                <InfoBlock label="موعد افتتاح المشروع" value={unit.projectOpeningDate || project?.openingDate} />
                                <InfoBlock label="رقم العمارة" value={unit.buildingNumber} />
                                <InfoBlock label="رقم الوحدة في المشروع" value={unit.unitNumberInProject || unit.unitNumber} />
                            </CardContent>
                        </Card>

                        {/* Registration */}
                        <Card className="rounded-2xl border bg-card shadow-sm overflow-hidden">
                            <CardHeader className="bg-gray-50/50 border-b px-6 py-4">
                                <CardTitle className="flex items-center gap-2 text-xl">
                                    <ShieldCheck className="w-5 h-5 text-primary" />
                                    التسجيل والصك
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-6 mt-2">
                                <InfoBlock label="رقم الوحدة في الفرز" value={unit.sortingNumber} />
                                <InfoBlock label="مساحة الصك" value={`${unit.area} م²`} />
                            </CardContent>
                        </Card>

                        {/* Extra Areas */}
                        <Card className="rounded-2xl border bg-card shadow-sm overflow-hidden">
                            <CardHeader className="bg-gray-50/50 border-b px-6 py-4">
                                <CardTitle className="flex items-center gap-2 text-xl">
                                    <Box className="w-5 h-5 text-primary" />
                                    مساحات إضافية
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-6 mt-2">
                                <AreaRow label="مساحة الفناء" value={unit.patioArea || 0} />
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* TAB 4: الوسائط */}
                <TabsContent value="media" className="space-y-8 animate-in fade-in duration-500">

                    {/* Unit Media */}
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold px-2 flex items-center gap-2"><ImageIcon className="h-5 w-5 text-primary" />الخاصة بالوحدة</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <ActionDropdownUnified
                                icon={<ImageIcon className="h-6 w-6" />}
                                label="صور الوحدة"
                                count={unit.images?.length || 0}
                            />
                            <ActionDropdownUnified
                                icon={<Video className="h-6 w-6" />}
                                label="فيديو الوحدة"
                                link={unit.videoUrl}
                            />
                            <ActionDropdownUnified
                                icon={<Box className="h-6 w-6" />}
                                label="الجولة الافتراضية"
                                link={unit.virtualTourUrl}
                            />
                            <ActionDropdownUnified
                                icon={<FileText className="h-6 w-6" />}
                                label="بروشور الوحدة"
                                link={unit.unitBrochure}
                            />
                        </div>
                    </div>

                    {/* Project Media */}
                    <div className="space-y-4 pt-6 border-t border-gray-100">
                        <h3 className="text-xl font-bold px-2 flex items-center gap-2"><ImageIcon className="h-5 w-5 text-primary" />الخاصة بالمشروع</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <ActionDropdownUnified
                                icon={<ImageIcon className="h-6 w-6" />}
                                label="صور المشروع"
                                count={project?.images?.length || 0}
                            />
                            <ActionDropdownUnified
                                icon={<Video className="h-6 w-6" />}
                                label="فيديو المشروع"
                                link={project?.videoUrl}
                            />
                            <ActionDropdownUnified
                                icon={<FileText className="h-6 w-6" />}
                                label="بروشور المشروع"
                                link={unit.projectBrochure || project?.brochureUrl}
                            />
                        </div>
                    </div>

                </TabsContent>
            </Tabs>
        </div>
    );
}

// --- Helper Components ---

function InfoBlock({ label, value }: { label: string, value: string | number | undefined | null }) {
    return (
        <div className="flex flex-col gap-1">
            <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">{label}</span>
            <span className="font-bold text-gray-900 leading-tight break-words">{value || '-'}</span>
        </div>
    );
}

function AreaRow({ label, value, isHighlight = false }: { label: string, value: string | number | undefined | null, isHighlight?: boolean }) {
    return (
        <div className={`flex justify-between items-center py-3 border-b border-dashed border-gray-100 last:border-0 last:pb-0 ${isHighlight ? 'pt-0' : ''}`}>
            <span className={`font-medium ${isHighlight ? 'text-gray-900' : 'text-gray-600'}`}>{label}</span>
            <span className={`font-mono ${isHighlight ? 'text-xl font-extrabold text-primary' : 'text-base font-bold text-gray-800'}`}>{value} م²</span>
        </div>
    );
}

function ActionDropdownUnified({ icon, label, link, count, type }: { icon: React.ReactNode, label: string, link?: string, count?: number, type?: string }) {
    const isActive = count !== undefined ? count > 0 : !!link;
    const handleClick = () => isActive && link ? window.open(link, '_blank') : null;

    return (
        <Button
            variant="outline"
            className={`h-28 flex flex-col gap-3 transition-all group w-full ${isActive ? 'hover:bg-primary/5 hover:border-primary/30 cursor-pointer' : 'opacity-60 grayscale cursor-default'
                }`}
            onClick={handleClick}
        >
            <div className={`transition-colors ${isActive ? 'text-gray-500 group-hover:text-primary' : 'text-gray-400'}`}>
                {icon}
            </div>
            <span className="text-sm font-medium">{label}</span>
            {count !== undefined && count > 0 && (
                <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full mt-1">
                    {count}
                </span>
            )}
        </Button>
    );
}

function StatBox({ label, value, icon, className = "bg-white border text-gray-900" }: { label: string, value: string | number | undefined, icon?: React.ReactNode, className?: string }) {
    return (
        <div className={`p-4 rounded-xl border flex flex-col items-center justify-center text-center gap-2 ${className}`}>
            {icon && <div className="[&>svg]:h-5 [&>svg]:w-5 opacity-80 text-primary">{icon}</div>}
            <div className="text-2xl font-bold tabular-nums">{value}</div>
            <div className="text-xs font-medium opacity-70">{label}</div>
        </div>
    );
}
