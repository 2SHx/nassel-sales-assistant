"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { projectPayloadSchema, type ProjectPayload } from "@/lib/validations/project";
import { createProjectAction, updateProjectAction } from "@/actions/projects";
import { toast } from "sonner";
import { Loader2, Box, Edit2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";

import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { UnitForm } from '@/components/forms/unit-form';
import { Badge } from '@/components/ui/badge';
import { useFormConfig } from "@/hooks/useFormConfig";
import { getFieldsForTab, PROJECT_SYSTEM_FIELDS, TAB_LABELS } from "@/lib/form-utils";

interface ProjectFormProps {
    initialData?: ProjectPayload & { id: string };
    rawUnits?: any[];
    onSuccess?: () => void;
}

// Helper to map DB unit to UnitPayload for the UnitForm
function mapUnitDataToPayload(uData: any, projectId: string) {
    const statusVal = uData.unit_status || '';
    let status: 'Available' | 'Reserved' | 'Sold' = 'Available';
    if (statusVal === 'متاح' || statusVal === 'متاحة' || statusVal === 'Available' || statusVal === 'تحت الإنشاء') status = 'Available';
    else if (statusVal === 'مباع' || statusVal === 'مباعة' || statusVal === 'Sold' || statusVal === 'غير متاحة') status = 'Sold';
    else if (statusVal === 'محجوز' || statusVal === 'محجوزة' || statusVal === 'Reserved') status = 'Reserved';

    return {
        id: uData.id,
        projectId: projectId,
        unitCode: uData.unit_code || '',
        unitModel: uData.unit_model || '',
        developer: uData.developer || '',
        status: status,
        type: uData.unit_type || 'Other',
        floor: uData.floor?.toString() || '',
        elevatorStatus: uData.elevator_status || '',
        netArea: Number(uData.unit_area) || 0,
        privateArea: Number(uData.special_area) || 0,
        totalArea: Number(uData.total_area) || Number(uData.unit_area) || 0,
        price: Number(uData.total_price) || 0,
        bedrooms: Number(uData.bedrooms) || 0,
        bathrooms: Number(uData.bathrooms) || 0,
        components: uData.unit_components ? uData.unit_components.split(',') : (uData.features ? uData.features.split(',') : []),
        amenities: uData.unit_components ? uData.unit_components.split(',') : (uData.features ? uData.features.split(',') : []),
        photos: [],
        videoUrl: '',
        virtualTourUrl: '',
        brochureUrl: uData.unit_brochure || '',
        city: '',
        district: '',
        direction: uData.direction || '',
        facade: '',
        projectOpeningDate: uData.project_opening_date || '',
        unitNumber: uData.unit_number_in_project?.toString() || uData.unit_number?.toString() || '',
        buildingNumber: uData.building_number?.toString() || '',
        farzNumber: uData.unit_number_in_sorting?.toString() || '',
        patioArea: Number(uData.yard_area) || 0,
        titleDeedArea: Number(uData.unit_area) || 0
    };
}

export function ProjectForm({ initialData, rawUnits, onSuccess }: ProjectFormProps) {
    const [isPending, startTransition] = useTransition();
    const { schema: customSchema, tabs, fieldTabsMap, fieldOrderMap, loading: configLoading } = useFormConfig('project');

    const form = useForm<ProjectPayload>({
        resolver: zodResolver(projectPayloadSchema) as any,
        defaultValues: initialData || {
            name: "",
            projectCode: "",
            developer: "",
            projectNumber: "",
            projectStatus: "متاح",
            projectType: "",
            unitTypes: "",
            openingDate: "",
            city: "",
            district: "",
            direction: "",
            country: "",
            locationUrl: "",
            amenities: [],
            mapCoordinates: { lat: undefined, lng: undefined },
            marketingPitch: "",
            manychat: "",
            totalUnits: 0,
            availableUnits: 0,
            underConstructionUnits: 0,
            reservedUnits: 0,
            soldUnits: 0,
            avgUnitPrice: 0,
            avgAvailableUnitPrice: 0,
            totalProjectValue: 0,
            soldPercentage: 0,
            totalUnderConstructionValue: 0,
            totalAvailableValue: 0,
            totalReservedValue: 0,
            totalSoldValue: 0,
            minPrice: 0, minAvailablePrice: 0, maxPrice: 0, maxAvailablePrice: 0,
            minArea: 0, minAvailableArea: 0, maxArea: 0, maxAvailableArea: 0,
            minBedrooms: 0, minAvailableBedrooms: 0, maxBedrooms: 0, maxAvailableBedrooms: 0,
            minBathrooms: 0, minAvailableBathrooms: 0, maxBathrooms: 0, maxAvailableBathrooms: 0,
            priceRange: "", availablePriceRange: "", areaRange: "", availableAreaRange: "",
            bedroomsRange: "", availableBedroomsRange: "", bathroomsRange: "", availableBathroomsRange: "",
            brochureUrl: "",
            videoUrl: "",
            photos: [],
            customFields: {}
        },
    });

    function onSubmit(data: ProjectPayload) {
        startTransition(async () => {
            if (initialData?.id) {
                const result = await updateProjectAction(initialData.id, data);
                if (result.success) {
                    toast.success(result.message);
                    onSuccess?.();
                } else {
                    toast.error("حدث خطأ");
                }
            } else {
                const result = await createProjectAction(data);
                if (result.success) {
                    toast.success(result.message);
                    form.reset();
                    onSuccess?.();
                } else {
                    toast.error("حدث خطأ");
                }
            }
        });
    }

    const renderField = (field: any, isSystem: boolean) => {
        const name = isSystem ? field.key : `customFields.${field.field_key}`;
        const label = isSystem ? field.label : field.field_label;
        const type = isSystem ? field.type : field.field_type;

        return (
            <FormField
                key={name}
                control={form.control}
                name={name as any}
                render={({ field: formField }) => (
                    <FormItem className={type === 'boolean' ? 'flex flex-row items-center justify-between rounded-lg border p-4' : ''}>
                        {type !== 'boolean' && <FormLabel>{label}</FormLabel>}
                        <div className={type === 'boolean' ? 'space-y-0.5' : ''}>
                            {type === 'boolean' && <FormLabel className="text-base">{label}</FormLabel>}
                        </div>
                        <FormControl>
                            {type === 'text' ? (
                                <Input placeholder={label} {...formField} value={formField.value || ''} />
                            ) : type === 'number' ? (
                                <Input type="number" placeholder={label} {...formField} value={formField.value ?? ''} onChange={e => formField.onChange(e.target.value ? Number(e.target.value) : undefined)} />
                            ) : type === 'date' ? (
                                <Input type="date" {...formField} value={formField.value || ''} />
                            ) : type === 'select' ? (
                                <Select onValueChange={formField.onChange} value={formField.value || ""}>
                                    <SelectTrigger>
                                        <SelectValue placeholder={`اختر ${label}`} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {(isSystem ? (field.options || []) : (field.field_options || [])).map((opt: string) => (
                                            <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            ) : type === 'boolean' ? (
                                <Switch checked={!!formField.value} onCheckedChange={formField.onChange} />
                            ) : (
                                <Input placeholder={label} {...formField} value={formField.value || ''} />
                            )}
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        );
    };

    if (configLoading) {
        return (
            <div className="flex items-center justify-center p-20">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <span className="mr-3 text-lg font-medium">جاري تحميل إعدادات النموذج...</span>
            </div>
        );
    }

    return (
        <Card className="w-full" dir="rtl">
            <CardContent className="pt-6">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <Tabs defaultValue={tabs[0] || 'أساسي'} className="w-full" dir="rtl">
                            <TabsList className="flex flex-wrap h-auto gap-2 bg-transparent justify-start mb-8">
                                {tabs.map(tab => (
                                    <TabsTrigger
                                        key={tab}
                                        value={tab}
                                        className="data-[state=active]:bg-primary data-[state=active]:text-white border border-gray-200 rounded-full px-5 py-2 transition-all"
                                    >
                                        {TAB_LABELS[tab] || tab}
                                    </TabsTrigger>
                                ))}
                            </TabsList>

                            {tabs.map(tab => {
                                const fields = getFieldsForTab(tab, PROJECT_SYSTEM_FIELDS, customSchema, fieldTabsMap, fieldOrderMap[tab], 'p-');
                                return (
                                    <TabsContent key={tab} value={tab} className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {fields.map((f: any) => renderField(f, f.isSystem))}
                                        </div>

                                        {tab === 'units' && initialData && (
                                            <div className="mt-8 space-y-4">
                                                <div className="flex justify-between items-center mb-4">
                                                    <h3 className="font-bold text-lg">وحدات المشروع</h3>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-2 pb-2">
                                                    {rawUnits?.map((u) => {
                                                        const unitStatus = u.unit_status || 'Available';
                                                        return (
                                                            <div key={u.id} className="flex flex-col gap-3 p-4 border rounded-xl bg-slate-50 shadow-sm border-gray-200">
                                                                <div className="flex justify-between items-start">
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="h-10 w-10 bg-white border border-gray-200 rounded-lg flex items-center justify-center text-primary font-bold">
                                                                            {u.unit_number_in_project || <Box className="w-4 h-4" />}
                                                                        </div>
                                                                        <div className="flex flex-col">
                                                                            <span className="font-bold text-sm">{u.unit_type}</span>
                                                                            <span className="text-xs text-muted-foreground">{u.total_price} SAR</span>
                                                                        </div>
                                                                    </div>
                                                                    <Badge variant="outline">{unitStatus}</Badge>
                                                                </div>
                                                                <div className="flex justify-end pt-2 border-t">
                                                                    <Dialog>
                                                                        <DialogTrigger asChild>
                                                                            <Button size="sm" variant="outline" className="h-7 text-xs">
                                                                                <Edit2 className="w-3 h-3 ml-1" />
                                                                                تعديل سريع
                                                                            </Button>
                                                                        </DialogTrigger>
                                                                        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" dir="rtl">
                                                                            <UnitForm
                                                                                initialData={mapUnitDataToPayload(u, initialData.id)}
                                                                                projectId={initialData.id}
                                                                                onSuccess={() => window.location.reload()}
                                                                            />
                                                                        </DialogContent>
                                                                    </Dialog>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                    </TabsContent>
                                );
                            })}
                        </Tabs>

                        <div className="flex justify-end gap-4 pt-6 border-t">
                            <Button type="submit" size="lg" disabled={isPending}>
                                {isPending && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                                {initialData ? 'تحديث المشروع' : 'حفظ المشروع'}
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
