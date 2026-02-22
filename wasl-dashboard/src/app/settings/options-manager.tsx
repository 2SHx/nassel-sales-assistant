'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Loader2 } from 'lucide-react';
import { updateFormOptions } from '@/actions/settings';
import { toast } from 'sonner';

interface OptionsManagerProps {
    initialOptions: Record<string, string[]>;
}

const CATEGORY_LABELS: Record<string, string> = {
    'unit_types': 'أنواع الوحدات',
    'unit_components': 'مكونات الوحدة',
    'amenities': 'المزايا'
};

export function OptionsManager({ initialOptions }: OptionsManagerProps) {
    const [optionsMap, setOptionsMap] = useState<Record<string, string[]>>({
        'unit_types': initialOptions.unit_types || ["شقة", "فيلا", "دوبلكس", "تاون هاوس", "أخرى"],
        'unit_components': initialOptions.unit_components || ["صالة جلوس", "مجلس", "غرفة سائق", "صالة طعام", "غرفة خادمة", "بلكونة", "غرفة خدمات", "فناء خارجي", "غرفة غسيل"],
        'amenities': initialOptions.amenities || ["زاوية", "واجهة"],
    });

    const [newInputs, setNewInputs] = useState<Record<string, string>>({
        'unit_types': '',
        'unit_components': '',
        'amenities': ''
    });

    const [isPending, startTransition] = useTransition();

    const handleRemoveOption = (category: string, optionToRemove: string) => {
        setOptionsMap(prev => {
            const currentList = prev[category] || [];
            return {
                ...prev,
                [category]: currentList.filter(opt => opt !== optionToRemove)
            };
        });
    };

    const handleAddOption = (category: string) => {
        const val = newInputs[category]?.trim();
        if (!val) return;

        setOptionsMap(prev => {
            const currentList = prev[category] || [];
            if (currentList.includes(val)) return prev; // prevent duplicates
            return { ...prev, [category]: [...currentList, val] };
        });

        setNewInputs(prev => ({ ...prev, [category]: '' }));
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, category: string) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddOption(category);
        }
    };

    const handleSaveAll = () => {
        startTransition(async () => {
            let hasError = false;
            for (const [category, arr] of Object.entries(optionsMap)) {
                const res = await updateFormOptions(category, arr);
                if (!res.success) {
                    hasError = true;
                    toast.error(`حدث خطأ أثناء حفظ ${CATEGORY_LABELS[category] || category}`);
                }
            }

            if (!hasError) {
                toast.success('تم حفظ جميع الخيارات بنجاح');
            }
        });
    };

    return (
        <div className="space-y-8">
            {Object.entries(optionsMap).map(([category, options]) => (
                <div key={category} className="space-y-4 border p-4 rounded-lg bg-card">
                    <h3 className="font-semibold text-lg">{CATEGORY_LABELS[category] || category}</h3>

                    <div className="flex flex-wrap gap-2 min-h-10 p-2 border rounded-md">
                        {options.map((opt) => (
                            <Badge key={opt} variant="secondary" className="px-3 py-1 text-sm flex items-center gap-1">
                                {opt}
                                <button
                                    onClick={() => handleRemoveOption(category, opt)}
                                    className="text-muted-foreground hover:text-destructive transition-colors ml-1"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </Badge>
                        ))}
                        {options.length === 0 && (
                            <span className="text-muted-foreground text-sm flex items-center">القائمة فارغة</span>
                        )}
                    </div>

                    <div className="flex gap-2 items-center">
                        <Label className="sr-only">إضافة خيار جديد</Label>
                        <Input
                            placeholder="اكتب خياراً جديداً واضغط Enter..."
                            value={newInputs[category]}
                            onChange={(e) => setNewInputs(prev => ({ ...prev, [category]: e.target.value }))}
                            onKeyDown={(e) => handleKeyDown(e, category)}
                            className="max-w-sm"
                        />
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleAddOption(category)}
                            disabled={!newInputs[category]?.trim()}
                        >
                            <Plus className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            ))}

            <div className="flex justify-end pt-4">
                <Button onClick={handleSaveAll} disabled={isPending} className="px-8 shrink-0 min-w-32">
                    {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    حفظ التغييرات
                </Button>
            </div>
        </div>
    );
}
