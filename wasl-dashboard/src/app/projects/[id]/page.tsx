'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { supabase } from '@/lib/supabase';
import { Project, Unit } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    MapPin, FileText, Video, Image as ImageIcon, CheckCircle2, Ruler,
    BedDouble, Bath, ChevronDown, Copy, Compass, ArrowUpRight, TrendingUp
} from 'lucide-react';
import { Loader2 } from 'lucide-react';
import { ClientUnitMap } from '@/components/units/client-unit-map';
import { UnitCard } from '@/components/units/unit-card';
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

export default function ProjectDetailsPage({ params }: { params: { id: string } }) {
    const [project, setProject] = useState<Project | null>(null);
    const [units, setUnits] = useState<Unit[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            // Fetch Project
            const { data: pData } = await supabase.from('projects').select('*').eq('project_id', params.id).single();

            if (pData) {
                const mappedProject: Project = {
                    id: pData.project_id,
                    name: pData.project_name,
                    status: pData.project_status === 'متاح' ? 'Ready' : 'Sold Out',
                    location: {
                        lat: Number(pData.lat),
                        lng: Number(pData.lng),
                        city: pData.city,
                        district: pData.district
                    },
                    priceStart: Number(pData.min_available_price || pData.min_price),
                    areaRange: {
                        min: Number(pData.min_available_area || pData.min_area),
                        max: Number(pData.max_available_area || pData.max_area)
                    },
                    amenities: pData.facilities ? pData.facilities.split(',') : [],
                    unitTypes: pData.unit_types ? pData.unit_types.split('-') : [],
                    images: pData.images || [],
                    developer: pData.developer,
                    description: pData.marketing_pitch,
                    direction: normalizeDirection(pData.direction),
                    videoUrl: pData.video_url || null,
                    brochureUrl: pData.brochure_url || null
                };
                setProject(mappedProject);

                // Fetch Units
                const { data: uData } = await supabase
                    .from('units')
                    .select('*')
                    .eq('project_id', params.id);

                if (uData) {
                    const mappedUnits = uData.map((u: any) => ({
                        id: u.id,
                        unitNumber: u.unit_number,
                        projectId: u.project_id,
                        projectName: mappedProject.name,
                        type: u.unit_type,
                        price: Number(u.total_price) || 0,
                        bedrooms: Number(u.bedrooms) || 0,
                        bathrooms: Number(u.bathrooms) || 0,
                        area: Number(u.unit_area) || 0,
                        status: (function (s): 'Available' | 'Reserved' | 'Sold' {
                            if (s === 'متاح' || s === 'متاحة' || s === 'Available' || s === 'تحت الإنشاء') return 'Available';
                            if (s === 'مباع' || s === 'مباعة' || s === 'Sold' || s === 'غير متاحة') return 'Sold';
                            if (s === 'محجوز' || s === 'محجوزة' || s === 'Reserved') return 'Reserved';
                            return 'Available';
                        })(u.unit_status),
                        floor: u.floor ? Number(u.floor) : undefined,
                        direction: normalizeDirection(u.direction || 'شمال')
                    }));
                    setUnits(mappedUnits);

                    // Recalculate Project Area values from Units if project data is missing or 0
                    const areas = mappedUnits.map((u: any) => u.area).filter((a: number) => a > 0);
                    if (areas.length > 0 && (mappedProject.areaRange.min === 0 || mappedProject.areaRange.max === 0)) {
                        mappedProject.areaRange = {
                            min: Math.min(...areas),
                            max: Math.max(...areas)
                        };
                        setProject(mappedProject); // Update project with new range
                    }
                }
            }
            setLoading(false);
        }
        fetchData();
    }, [params.id]);

    if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
    if (!project) return <div className="flex h-screen items-center justify-center text-muted-foreground">المشروع غير موجود</div>;

    // --- Statistics and Analysis ---
    const availableUnits = units.filter(u => u.status === 'Available');

    // Areas
    const unitAreas = units.map(u => u.area).filter(a => a > 0);
    const availableAreas = availableUnits.map(u => u.area).filter(a => a > 0);
    const minArea = unitAreas.length ? Math.min(...unitAreas) : 0;
    const maxArea = unitAreas.length ? Math.max(...unitAreas) : 0;
    const minAvailArea = availableAreas.length ? Math.min(...availableAreas) : 0;
    const maxAvailArea = availableAreas.length ? Math.max(...availableAreas) : 0;

    // Beds
    const unitBeds = units.map(u => u.bedrooms).filter(b => b > 0);
    const availableBeds = availableUnits.map(u => u.bedrooms).filter(b => b > 0);
    const minBeds = unitBeds.length ? Math.min(...unitBeds) : 0;
    const maxBeds = unitBeds.length ? Math.max(...unitBeds) : 0;
    const minAvailBeds = availableBeds.length ? Math.min(...availableBeds) : 0;
    const maxAvailBeds = availableBeds.length ? Math.max(...availableBeds) : 0;

    // Baths
    const unitBaths = units.map(u => u.bathrooms).filter(b => b > 0);
    const availableBaths = availableUnits.map(u => u.bathrooms).filter(b => b > 0);
    const minBaths = unitBaths.length ? Math.min(...unitBaths) : 0;
    const maxBaths = unitBaths.length ? Math.max(...unitBaths) : 0;
    const minAvailBaths = availableBaths.length ? Math.min(...availableBaths) : 0;
    const maxAvailBaths = availableBaths.length ? Math.max(...availableBaths) : 0;

    // Prices
    const unitPrices = units.map(u => u.price).filter(p => p > 0);
    const availablePrices = availableUnits.map(u => u.price).filter(p => p > 0);
    const minPrice = unitPrices.length ? Math.min(...unitPrices) : 0;
    const maxPrice = unitPrices.length ? Math.max(...unitPrices) : 0;
    const minAvailPrice = availablePrices.length ? Math.min(...availablePrices) : 0;
    const maxAvailPrice = availablePrices.length ? Math.max(...availablePrices) : 0;

    // Values
    const totalValue = units.reduce((sum, u) => sum + u.price, 0);
    const totalAvailableValue = availableUnits.reduce((sum, u) => sum + u.price, 0);
    const totalSoldValue = units.filter(u => u.status === 'Sold').reduce((sum, u) => sum + u.price, 0);
    const totalReservedValue = units.filter(u => u.status === 'Reserved').reduce((sum, u) => sum + u.price, 0);

    const stats = {
        totalUnits: units.length,
        availableUnits: availableUnits.length,
        soldUnits: units.filter(u => u.status === 'Sold').length,
        reservedUnits: units.filter(u => u.status === 'Reserved').length,

        minArea, maxArea, minAvailArea, maxAvailArea,
        minBeds, maxBeds, minAvailBeds, maxAvailBeds,
        minBaths, maxBaths, minAvailBaths, maxAvailBaths,
        minPrice, maxPrice, minAvailPrice, maxAvailPrice,

        totalValue,
        totalAvailableValue,
        totalSoldValue,
        totalReservedValue,
        avgValue: units.length ? totalValue / units.length : 0,
        avgAvailableValue: availableUnits.length ? totalAvailableValue / availableUnits.length : 0
    };

    const salesPercentage = totalValue ? ((totalSoldValue / totalValue) * 100).toFixed(1) : 0;

    const generateProjectMessage = () => {
        if (!project) return '';
        const mapLink = `https://www.google.com/maps/search/?api=1&query=${project.location.lat},${project.location.lng}`;

        return `${project.name} - ${project.location.district}، ${project.location.city}
المساحات: ${minAvailArea}م² - ${maxAvailArea}م²
الدور: متنوعة
غرف النوم: ${minAvailBeds} - ${maxAvailBeds}
الموقع: ${mapLink}
الفيديوهات: ${project.videoUrl || 'غير متوفر'}
البروشور: ${project.brochureUrl || 'غير متوفر'}
الأسعار: تبدأ من ${formatCurrency(minAvailPrice)} ريال`;
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        // You might want to add a toast here
        alert('تم النسخ بنجاح');
    };

    const handleAction = (type: 'map' | 'brochure' | 'video' | 'photos', action: 'open' | 'copy') => {
        let link = '';
        switch (type) {
            case 'map':
                link = `https://www.google.com/maps/search/?api=1&query=${project.location.lat},${project.location.lng}`;
                break;
            case 'brochure':
                link = project.brochureUrl || '#';
                break;
            case 'video':
                link = project.videoUrl || '#';
                break;
            case 'photos':
                link = project.images?.[0] || '#'; // For now just the first image or a gallery link
                break;
        }

        if (action === 'open') {
            if (link && link !== '#') window.open(link, '_blank');
            else alert('الرابط غير متوفر');
        } else {
            copyToClipboard(link);
        }
    };

    return (
        <div className="flex flex-col gap-6 pb-20 animate-in fade-in duration-500">
            {/* Hero Section */}
            <div className="relative h-[320px] rounded-3xl overflow-hidden bg-slate-100 shadow-md">
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-10" />
                {project.images && project.images.length > 0 ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={project.images[0]}
                        alt={project.name}
                        className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                    />
                ) : (
                    <div className="h-full w-full flex items-center justify-center text-slate-400 bg-slate-200">
                        <ImageIcon className="h-16 w-16 opacity-30" />
                    </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 p-8 z-20 text-white">
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-2">
                            <Badge className="bg-primary hover:bg-primary/90 text-white border-0 px-3 py-1 text-sm">
                                {project.status === 'Available' || project.status === 'Ready' ? 'متاح' : project.status}
                            </Badge>
                            <Badge variant="outline" className="text-white border-white/40 bg-black/20 backdrop-blur-md px-3 py-1 text-sm">
                                {project.developer}
                            </Badge>
                        </div>
                        <h1 className="text-5xl font-extrabold tracking-tight drop-shadow-lg">{project.name}</h1>
                        <div className="flex items-center gap-4 text-gray-200 text-sm font-medium">
                            <div className="flex items-center gap-1.5 bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-full">
                                <MapPin className="h-4 w-4" />
                                {project.location.city}، {project.location.district}
                            </div>
                            <div className="flex items-center gap-1.5 bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-full">
                                <Compass className="h-4 w-4" />
                                {project.direction}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs Navigation */}
            <Tabs defaultValue="overview" className="w-full">
                <TabsList className="w-full justify-start h-14 bg-white border rounded-2xl p-1.5 shadow-sm mb-6">
                    <TabsTrigger value="overview" className="flex-1 h-full rounded-xl data-[state=active]:bg-primary/10 data-[state=active]:text-primary font-bold text-base transition-all">بيانات المشروع</TabsTrigger>
                    <TabsTrigger value="units-summary" className="flex-1 h-full rounded-xl data-[state=active]:bg-primary/10 data-[state=active]:text-primary font-bold text-base transition-all">ملخص الوحدات</TabsTrigger>
                    <TabsTrigger value="financials" className="flex-1 h-full rounded-xl data-[state=active]:bg-primary/10 data-[state=active]:text-primary font-bold text-base transition-all">البيانات المالية</TabsTrigger>
                    <TabsTrigger value="list" className="flex-1 h-full rounded-xl data-[state=active]:bg-primary/10 data-[state=active]:text-primary font-bold text-base transition-all">قائمة الوحدات</TabsTrigger>
                </TabsList>

                {/* TAB 1: Project Data */}
                <TabsContent value="overview" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Right Column (Main Info) */}
                        <div className="lg:col-span-2 space-y-6">
                            <Card className="rounded-2xl border bg-card shadow-sm overflow-hidden">
                                <CardHeader className="bg-gray-50/50 border-b px-6 py-4">
                                    <CardTitle className="flex items-center gap-2 text-xl">
                                        <FileText className="h-5 w-5 text-primary" />
                                        تفاصيل المشروع
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6 grid gap-6">
                                    <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm">
                                        <InfoRow label="اسم المشروع" value={project.name} />
                                        <InfoRow label="أنواع الوحدات" value={project.unitTypes.join('، ')} />
                                        <InfoRow label="الموقع" value={`${project.location.city}، ${project.location.district}`} />
                                        <InfoRow label="الإتجاه" value={project.direction || '-'} />
                                        <InfoRow label="الأسعار المتاحة" value={`${formatCurrency(minAvailPrice)} - ${formatCurrency(maxAvailPrice)} ر.س`} />
                                        <InfoRow label="المساحات المتاحة" value={`${minAvailArea} - ${maxAvailArea} م²`} />
                                    </div>

                                    <div className="space-y-2">
                                        <h3 className="font-semibold text-base mb-2">المرافق والخدمات</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {project.amenities.map(a => (
                                                <Badge key={a} variant="secondary" className="px-3 py-1.5 text-sm font-normal bg-slate-100 text-slate-700 border border-slate-200">
                                                    <CheckCircle2 className="h-3.5 w-3.5 ml-2 text-primary" />
                                                    {a}
                                                </Badge>
                                            ))}
                                            {project.amenities.length === 0 && <span className="text-muted-foreground text-sm">لا توجد مرافق مسجلة</span>}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Map Section */}
                            <Card className="rounded-2xl border bg-card shadow-sm overflow-hidden min-h-[400px]">
                                <CardHeader className="bg-gray-50/50 border-b px-6 py-4">
                                    <CardTitle className="flex items-center gap-2 text-xl">
                                        <MapPin className="h-5 w-5 text-primary" />
                                        الموقع على الخريطة
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-0 h-[400px]">
                                    <ProjectMap
                                        projects={[project]}
                                    />
                                </CardContent>
                            </Card>
                        </div>

                        {/* Left Column (Actions & Highlights) */}
                        <div className="space-y-6">
                            <Card className="rounded-2xl border bg-card shadow-sm">
                                <CardHeader className="bg-gray-50/50 border-b px-6 py-4 flex flex-row items-center justify-between">
                                    <CardTitle className="text-lg">إجراءات سريعة</CardTitle>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                <ChevronDown className="h-4 w-4" />
                                                <span className="sr-only">المزيد</span>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => copyToClipboard(generateProjectMessage())} className="gap-2 cursor-pointer">
                                                <Copy className="h-4 w-4" />
                                                <span>نسخ رسالة المشروع</span>
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </CardHeader>
                                <CardContent className="p-4 grid grid-cols-2 gap-3">
                                    <ActionDropdown
                                        icon={<MapPin />}
                                        label="موقع المشروع"
                                        onOpen={() => handleAction('map', 'open')}
                                        onCopy={() => handleAction('map', 'copy')}
                                    />
                                    <ActionDropdown
                                        icon={<FileText />}
                                        label="البروشور"
                                        onOpen={() => handleAction('brochure', 'open')}
                                        onCopy={() => handleAction('brochure', 'copy')}
                                    />
                                    <ActionDropdown
                                        icon={<Video />}
                                        label="الفيديو"
                                        onOpen={() => handleAction('video', 'open')}
                                        onCopy={() => handleAction('video', 'copy')}
                                    />
                                    <ActionDropdown
                                        icon={<ImageIcon />}
                                        label="الصور"
                                        onOpen={() => handleAction('photos', 'open')}
                                        onCopy={() => handleAction('photos', 'copy')}
                                    />
                                </CardContent>
                            </Card>

                            <Card className="rounded-2xl border bg-card shadow-sm bg-gradient-to-br from-primary/5 to-transparent border-primary/20">
                                <CardContent className="p-6 space-y-4">
                                    <h3 className="font-bold text-lg text-primary">المعالم القريبة</h3>
                                    <ul className="space-y-2 text-sm">

                                        <li className="flex items-center gap-2"><div className="h-1.5 w-1.5 rounded-full bg-primary" /> بجوار حديقة عامة</li>
                                        <li className="flex items-center gap-2"><div className="h-1.5 w-1.5 rounded-full bg-primary" /> منطقة خدمات متكاملة</li>
                                    </ul>
                                </CardContent>
                            </Card>

                            <Card className="rounded-2xl border bg-card shadow-sm">
                                <CardContent className="p-6 space-y-4">
                                    <h3 className="font-bold text-lg">الضمانات</h3>
                                    <div className="grid grid-cols-1 gap-3">
                                        <div className="p-3 bg-gray-50 rounded-lg border text-sm">
                                            <span className="font-bold block">10 سنوات</span>
                                            <span className="text-muted-foreground">على الهيكل الإنشائي</span>
                                        </div>
                                        <div className="p-3 bg-gray-50 rounded-lg border text-sm">
                                            <span className="font-bold block">2 سنة</span>
                                            <span className="text-muted-foreground">سباكة وكهرباء</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>

                {/* TAB 2: Units Summary */}
                <TabsContent value="units-summary" className="space-y-6">
                    {/* Status Overview */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <StatBox label="إجمالي الوحدات" value={units.length} icon={<HomeIcon />} />
                        <StatBox label="متاح" value={availableUnits.length} className="bg-emerald-50 text-emerald-700 border-emerald-200" icon={<CheckCircle2 />} />
                        <StatBox label="تحت الإنشاء" value={0} className="bg-blue-50 text-blue-700 border-blue-200" />
                        <StatBox label="محجوز" value={units.filter(u => u.status === 'Reserved').length} className="bg-orange-50 text-orange-700 border-orange-200" />
                        <StatBox label="مباع" value={units.filter(u => u.status === 'Sold').length} className="bg-red-50 text-red-700 border-red-200" />
                    </div>

                    {/* Detailed Analysis Tables */}
                    <Card className="rounded-2xl border bg-card shadow-sm">
                        <CardHeader className="bg-gray-50/50 border-b px-6 py-4"><CardTitle>تحليل المساحات</CardTitle></CardHeader>
                        <CardContent className="p-0">
                            <AnalysisTable
                                rows={[
                                    { label: 'المساحة الأدنى', total: `${minArea} م²`, available: `${minAvailArea} م²` },
                                    { label: 'المساحة الأقصى', total: `${maxArea} م²`, available: `${maxAvailArea} م²` },
                                    { label: 'نطاق المساحة', total: `${minArea} - ${maxArea}`, available: `${minAvailArea} - ${maxAvailArea}` },
                                ]}
                            />
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="rounded-2xl border bg-card shadow-sm">
                            <CardHeader className="bg-gray-50/50 border-b px-6 py-4"><CardTitle>تحليل غرف النوم</CardTitle></CardHeader>
                            <CardContent className="p-0">
                                <AnalysisTable
                                    rows={[
                                        { label: 'الحد الأدنى', total: minBeds, available: minAvailBeds },
                                        { label: 'الحد الأقصى', total: maxBeds, available: maxAvailBeds },
                                        { label: 'النطاق', total: `${minBeds} - ${maxBeds}`, available: `${minAvailBeds} - ${maxAvailBeds}` },
                                    ]}
                                />
                            </CardContent>
                        </Card>
                        <Card className="rounded-2xl border bg-card shadow-sm">
                            <CardHeader className="bg-gray-50/50 border-b px-6 py-4"><CardTitle>تحليل دورات المياه</CardTitle></CardHeader>
                            <CardContent className="p-0">
                                <AnalysisTable
                                    rows={[
                                        { label: 'الحد الأدنى', total: minBaths, available: minAvailBaths },
                                        { label: 'الحد الأقصى', total: maxBaths, available: maxAvailBaths },
                                        { label: 'النطاق', total: `${minBaths} - ${maxBaths}`, available: `${minAvailBaths} - ${maxAvailBaths}` },
                                    ]}
                                />
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* TAB 3: Financials (Apple-Style RTL) */}
                <TabsContent value="financials" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

                    {/* Section 1: Portfolio Health (Hero Cards) */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Total Value */}
                        <Card className="rounded-3xl border-0 shadow-xl bg-gradient-to-br from-slate-900 to-slate-800 text-white overflow-hidden relative">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
                            <CardContent className="p-8 flex flex-col items-start justify-between h-full relative z-10">
                                <div className="space-y-1">
                                    <h3 className="text-slate-400 text-sm font-medium tracking-wide">إجمالي قيمة المشروع</h3>
                                    <div className="flex items-baseline gap-1.5 flex-row-reverse justify-end w-full">
                                        <span className="text-xl font-medium text-slate-400">ر.س</span>
                                        <span className="text-4xl lg:text-5xl font-bold tracking-tight">
                                            {formatCurrency(totalValue)}
                                        </span>
                                    </div>
                                </div>
                                <div className="w-full mt-6 pt-6 border-t border-white/10 flex items-center justify-between text-sm">
                                    <span className="text-slate-400">عدد الوحدات: {stats.totalUnits}</span>
                                    <span className="text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full text-xs border border-emerald-400/20">نشط</span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Sales Performance */}
                        <Card className="rounded-3xl border shadow-sm bg-white overflow-hidden">
                            <CardContent className="p-8 h-full flex flex-col justify-between">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-slate-500 text-sm font-medium">أداء المبيعات</h3>
                                    <div className="h-8 w-8 rounded-full bg-emerald-50 flex items-center justify-center">
                                        <ArrowUpRight className="h-4 w-4 text-emerald-600" />
                                    </div>
                                </div>
                                <div className="flex items-end gap-4 mt-2">
                                    <div className="flex flex-col">
                                        <span className="text-4xl font-bold text-slate-900">{salesPercentage}%</span>
                                        <span className="text-xs text-slate-400 mt-1">نسبة المباع من القيمة</span>
                                    </div>
                                    <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden mb-2">
                                        <div
                                            className="h-full bg-emerald-500 rounded-full transition-all duration-1000 ease-out"
                                            style={{ width: `${salesPercentage}%` }}
                                        />
                                    </div>
                                </div>
                                <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                                    <div className="bg-slate-50 rounded-xl p-3">
                                        <span className="block text-slate-400 text-xs mb-1">المباع</span>
                                        <span className="font-semibold text-slate-900">{formatCurrency(totalSoldValue)} ر.س</span>
                                    </div>
                                    <div className="bg-slate-50 rounded-xl p-3">
                                        <span className="block text-slate-400 text-xs mb-1">المحجوز</span>
                                        <span className="font-semibold text-slate-900">{formatCurrency(totalReservedValue)} ر.س</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Inventory Status */}
                        <Card className="rounded-3xl border shadow-sm bg-white overflow-hidden">
                            <CardContent className="p-8 h-full">
                                <h3 className="text-slate-500 text-sm font-medium mb-6">حالة المخزون</h3>
                                <div className="space-y-5">
                                    <InventoryRow label="متاح" count={stats.availableUnits} color="bg-emerald-500" total={stats.totalUnits} />
                                    <InventoryRow label="مباع" count={stats.soldUnits} color="bg-slate-900" total={stats.totalUnits} />
                                    <InventoryRow label="محجوز" count={stats.reservedUnits} color="bg-amber-500" total={stats.totalUnits} />
                                    <InventoryRow label="تحت الإنشاء" count={0} color="bg-blue-500" total={stats.totalUnits} />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Section 2: Detailed Breakdown Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Unit Prices Grid */}
                        <Card className="rounded-3xl border shadow-sm bg-white overflow-hidden flex flex-col">
                            <CardHeader className="bg-transparent border-b-0 px-8 pt-8 pb-4">
                                <CardTitle className="text-xl text-slate-800 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                                        <TrendingUp className="w-5 h-5 text-indigo-600" />
                                    </div>
                                    تحليل الأسعار
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-8 pt-4 space-y-8 flex-1 flex flex-col">
                                {/* Price Summary row */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 flex flex-col justify-center">
                                        <span className="text-slate-500 text-xs font-medium mb-1">يبدأ من</span>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-2xl font-bold text-slate-900">{formatCurrency(minPrice)}</span>
                                            <span className="text-xs text-slate-500 font-medium">ر.س</span>
                                        </div>
                                    </div>
                                    <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 flex flex-col justify-center">
                                        <span className="text-slate-500 text-xs font-medium mb-1">يصل إلى</span>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-2xl font-bold text-slate-900">{formatCurrency(maxPrice)}</span>
                                            <span className="text-xs text-slate-500 font-medium">ر.س</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Range Visualization */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between text-sm font-medium">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 bg-emerald-500 rounded-sm" />
                                            <span className="text-slate-700">النطاق المتاح حالياً</span>
                                        </div>
                                        <span className="text-slate-600 text-sm font-mono bg-slate-100 px-2 py-0.5 rounded-md" dir="ltr">
                                            {formatCurrency(minAvailPrice)} - {formatCurrency(maxAvailPrice)}
                                        </span>
                                    </div>
                                    <div className="h-6 bg-slate-100 rounded-full relative overflow-hidden shadow-inner flex items-center px-1">
                                        {/* Available Range Bar */}
                                        <div
                                            className="absolute h-4 bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full shadow-sm transition-all duration-1000 ease-out z-10"
                                            style={{
                                                right: `${((minAvailPrice - minPrice) / (maxPrice - minPrice || 1)) * 100}%`,
                                                left: `${100 - ((maxAvailPrice - minPrice) / (maxPrice - minPrice || 1)) * 100}%`
                                            }}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mt-auto pt-6 border-t border-slate-100">
                                    <StatHighlight
                                        label="متوسط سعر الوحدة (الكل)"
                                        value={formatCurrency(stats.avgValue)}
                                        sub="ر.س"
                                    />
                                    <StatHighlight
                                        label="متوسط سعر المتاح"
                                        value={formatCurrency(stats.avgAvailableValue)}
                                        sub="ر.س"
                                        accent
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Breakdown Table (Clean) */}
                        <Card className="rounded-3xl border shadow-sm bg-white overflow-hidden">
                            <CardHeader className="bg-gray-50/30 border-b px-8 py-5">
                                <CardTitle className="text-lg text-slate-800">توزيع القيم حسب الحالة</CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="divide-y divide-gray-50">
                                    <StatusRow label="المتاح" value={totalAvailableValue} count={stats.availableUnits} color="bg-emerald-500" />
                                    <StatusRow label="المباع" value={totalSoldValue} count={stats.soldUnits} color="bg-slate-900" />
                                    <StatusRow label="المحجوز" value={totalReservedValue} count={stats.reservedUnits} color="bg-amber-500" />
                                    <StatusRow label="تحت الإنشاء" value={0} count={0} color="bg-blue-500" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="list">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {units.map((unit) => (
                            <UnitCard key={unit.id} unit={unit} />
                        ))}
                    </div>
                    {units.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground bg-white border rounded-2xl border-dashed">
                            <p className="text-lg font-medium">لا توجد وحدات مسجلة لهذا المشروع</p>
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}

// --- Helper Components ---

function InfoRow({ label, value }: { label: string, value: string }) {
    return (
        <div className="flex flex-col gap-1">
            <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">{label}</span>
            <span className="font-bold text-gray-900 leading-tight">{value}</span>
        </div>
    );
}

function ActionButton({ icon, label }: { icon: React.ReactNode, label: string }) {
    return (
        <Button variant="outline" className="h-24 flex flex-col gap-3 hover:bg-primary/5 hover:border-primary/30 transition-all group">
            <div className="text-gray-500 group-hover:text-primary transition-colors [&>svg]:h-6 [&>svg]:w-6">
                {icon}
            </div>
            <span className="text-xs font-medium">{label}</span>
        </Button>
    );
}

function StatBox({ label, value, icon, className = "bg-white border text-gray-900" }: any) {
    return (
        <div className={`p-4 rounded-xl border flex flex-col items-center justify-center text-center gap-2 ${className}`}>
            {icon && <div className="[&>svg]:h-5 [&>svg]:w-5 opacity-80">{icon}</div>}
            <div className="text-2xl font-bold">{value}</div>
            <div className="text-xs font-medium opacity-70">{label}</div>
        </div>
    );
}

function StatCard({ label, value, sub, highlight }: any) {
    return (
        <Card className={`rounded-2xl border shadow-sm ${highlight ? 'bg-primary text-primary-foreground' : 'bg-white'}`}>
            <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                <div className={`text-sm font-medium mb-1 ${highlight ? 'text-white/80' : 'text-muted-foreground'}`}>{label}</div>
                <div className="text-4xl font-extrabold tracking-tight mb-1">{value}</div>
                {sub && <div className={`text-xs ${highlight ? 'text-white/60' : 'text-muted-foreground'}`}>{sub}</div>}
            </CardContent>
        </Card>
    );
}

function AnalysisTable({ rows }: { rows: { label: string, total: any, available: any }[] }) {
    return (
        <table className="w-full text-right text-sm">
            <thead className="bg-muted/30 text-xs text-muted-foreground uppercase border-b">
                <tr>
                    <th className="px-6 py-3 font-medium">المعيار</th>
                    <th className="px-6 py-3 font-medium">الكل</th>
                    <th className="px-6 py-3 font-medium text-emerald-700">المتاح فقط</th>
                </tr>
            </thead>
            <tbody className="divide-y">
                {rows.map((row, i) => (
                    <tr key={i} className="hover:bg-muted/5">
                        <td className="px-6 py-4 font-medium">{row.label}</td>
                        <td className="px-6 py-4 font-mono">{row.total}</td>
                        <td className="px-6 py-4 font-mono font-medium text-emerald-700 bg-emerald-50/30">{row.available}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

function TableSimple({ rows }: { rows: [string, string][] }) {
    return (
        <table className="w-full text-right text-sm">
            <tbody className="divide-y">
                {rows.map(([label, value], i) => (
                    <tr key={i} className="hover:bg-muted/5">
                        <td className="px-6 py-4 font-medium text-muted-foreground">{label}</td>
                        <td className="px-6 py-4 font-bold font-mono">{value}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

function HomeIcon() {
    return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>;
}

function formatCurrency(num: number) {
    if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
}

function ActionDropdown({ icon, label, onOpen, onCopy }: { icon: React.ReactNode, label: string, onOpen: () => void, onCopy: () => void }) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-24 flex flex-col gap-3 hover:bg-primary/5 hover:border-primary/30 transition-all group w-full">
                    <div className="text-gray-500 group-hover:text-primary transition-colors [&>svg]:h-6 [&>svg]:w-6">
                        {icon}
                    </div>
                    <span className="text-xs font-medium">{label}</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={onOpen} className="gap-2 cursor-pointer">
                    <ArrowUpRight className="h-4 w-4" />
                    <span>فتح الرابط</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onCopy} className="gap-2 cursor-pointer">
                    <Copy className="h-4 w-4" />
                    <span>نسخ الرابط</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

function InventoryRow({ label, count, color, total }: { label: string, count: number, color: string, total: number }) {
    const percentage = total ? Math.round((count / total) * 100) : 0;
    return (
        <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5 min-w-[100px]">
                <div className={`w-2.5 h-2.5 rounded-full ${color}`} />
                <span className="text-slate-700 font-medium text-sm">{label}</span>
            </div>
            <div className="flex-1 h-2 bg-slate-50 rounded-full overflow-hidden">
                <div className={`h-full ${color} opacity-80`} style={{ width: `${percentage}%` }} />
            </div>
            <div className="flex items-center gap-2 min-w-[60px] justify-end">
                <span className="font-bold text-slate-900">{count}</span>
                <span className="text-xs text-slate-400">({percentage}%)</span>
            </div>
        </div>
    );
}

function StatHighlight({ label, value, sub, accent }: { label: string, value: string, sub: string, accent?: boolean }) {
    return (
        <div className={`p-4 rounded-2xl border ${accent ? 'bg-emerald-50/50 border-emerald-100' : 'bg-slate-50 border-slate-100'}`}>
            <div className="text-xs text-slate-500 mb-1">{label}</div>
            <div className={`text-xl font-bold ${accent ? 'text-emerald-700' : 'text-slate-900'}`}>
                {value} <span className="text-xs font-normal text-slate-400">{sub}</span>
            </div>
        </div>
    );
}

function StatusRow({ label, value, count, color }: { label: string, value: number, count: number, color: string }) {
    return (
        <div className="flex items-center justify-between px-8 py-5 bg-white hover:bg-slate-50/80 transition-colors">
            <div className="flex items-center gap-3">
                <span className={`w-2 h-8 rounded-full ${color}`} />
                <div className="flex flex-col">
                    <span className="font-bold text-slate-900">{label}</span>
                    <span className="text-xs text-slate-400 font-medium">{count} وحدة</span>
                </div>
            </div>
            <div className="text-left" dir="ltr">
                <span className="text-lg font-bold text-slate-900 block">{formatCurrency(value)}</span>
                <span className="text-xs text-slate-400">SAR</span>
            </div>
        </div>
    );
}
