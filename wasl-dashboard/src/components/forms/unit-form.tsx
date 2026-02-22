"use client";

import { useTransition, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { unitPayloadSchema, type UnitPayload } from "@/lib/validations/unit";
import { createUnitAction, updateUnitAction } from "@/actions/units";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
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
import { useFormConfig } from "@/hooks/useFormConfig";
import { getFieldsForTab, UNIT_SYSTEM_FIELDS, TAB_LABELS } from "@/lib/form-utils";
import { getAllFormOptions } from "@/actions/settings";

interface UnitFormProps {
    initialData?: UnitPayload & { id: string };
    projectId?: string;
    onSuccess?: () => void;
}

export function UnitForm({ initialData, projectId, onSuccess }: UnitFormProps) {
    const [isPending, startTransition] = useTransition();
    const { schema: customSchema, tabs, fieldTabsMap, fieldOrderMap, loading: configLoading } = useFormConfig('unit');
    const [dynamicOptions, setDynamicOptions] = useState<Record<string, string[]>>({});

    useEffect(() => {
        async function fetchOptions() {
            const res = await getAllFormOptions();
            if (res.success) {
                setDynamicOptions(res.data);
            }
        }
        fetchOptions();
    }, []);

    const form = useForm<UnitPayload>({
        resolver: zodResolver(unitPayloadSchema) as any,
        defaultValues: initialData || {
            projectId: projectId || "",
            projectCode: "",
            projectName: "",
            projectNumber: "",
            unitCode: "",
            unitTypeCode: "",
            unitModel: "",
            developer: "",
            status: "Available",
            type: "Apartment",
            floor: "",
            elevatorStatus: "",
            components: [],
            amenities: [],
            photos: [],
            videoUrl: "",
            virtualTourUrl: "",
            brochureUrl: "",
            projectBrochure: "",
            country: "",
            city: "",
            district: "",
            location: "",
            direction: "",
            facade: "",
            projectOpeningDate: "",
            unitNumber: "",
            buildingNumber: "",
            farzNumber: "",
            customFields: {}
        },
    });

    function onSubmit(data: UnitPayload) {
        startTransition(async () => {
            if (initialData?.id) {
                const result = await updateUnitAction(initialData.id, data);
                if (result.success) {
                    toast.success(result.message);
                    onSuccess?.();
                } else {
                    toast.error("حدث خطأ");
                }
            } else {
                const result = await createUnitAction(data);
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
                                        {(isSystem && field.category ? (dynamicOptions[field.category] || []) : (field.field_options || [])).map((opt: string) => (
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
                            <TabsList className="flex flex-wrap h-auto gap-2 bg-transparent justify-start mb-8 p-1">
                                {tabs.map(tab => (
                                    <TabsTrigger
                                        key={tab}
                                        value={tab}
                                        className="data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-primary/20 border border-gray-200 rounded-full px-6 py-2.5 transition-all font-bold text-xs tracking-wide hover:bg-gray-50 data-[state=active]:hover:bg-primary"
                                    >
                                        {TAB_LABELS[tab] || tab}
                                    </TabsTrigger>
                                ))}
                            </TabsList>

                            {tabs.map(tab => {
                                const fields = getFieldsForTab(tab, UNIT_SYSTEM_FIELDS, customSchema, fieldTabsMap, fieldOrderMap[tab], 'u-');
                                return (
                                    <TabsContent key={tab} value={tab} className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-400 outline-none">
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {fields.map((f: any) => renderField(f, f.isSystem))}
                                        </div>
                                    </TabsContent>
                                );
                            })}
                        </Tabs>

                        <div className="flex justify-end gap-4 pt-8 border-t border-gray-100">
                            <Button
                                type="submit"
                                size="lg"
                                disabled={isPending}
                                className="px-8 font-bold shadow-lg shadow-primary/20 hover:shadow-xl transition-all active:scale-95"
                            >
                                {isPending && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                                {initialData ? 'تحديث بيانات الوحدة' : 'حفظ الوحدة الجديدة'}
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
