'use client';

import { useState } from 'react';
import { useUnits } from '@/hooks/useUnits';
import { UnitCard } from '@/components/units/unit-card';
import { UnitFilterBar } from '@/components/units/unit-filter-bar';
import { ViewToggle } from '@/components/shared/view-toggle';
import { ClientUnitMap } from '@/components/units/client-unit-map';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { UnitForm } from '@/components/forms/unit-form';
import { Plus } from 'lucide-react';

export default function UnitsPage() {
    const { units, loading, options } = useUnits();
    const [view, setView] = useState<'list' | 'map'>('list');
    const [showAddForm, setShowAddForm] = useState(false);

    if (loading) {
        return (
            <div className="flex flex-col gap-6 h-[calc(100vh-100px)]">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">الوحدات</h1>
                        <p className="text-muted-foreground">جاري تحميل البيانات...</p>
                    </div>
                </div>
                <div className="flex items-center justify-center flex-1">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 h-[calc(100vh-100px)]">
            <div className="flex flex-col gap-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            {showAddForm ? 'إضافة وحدة جديدة' : 'الوحدات'}
                        </h1>
                        {!showAddForm && (
                            <p className="text-muted-foreground">
                                عرض {units.length} وحدة
                            </p>
                        )}
                    </div>
                    <div className="flex items-center gap-4">
                        {!showAddForm ? (
                            <>
                                <Button className="gap-2" onClick={() => setShowAddForm(true)}>
                                    <Plus className="w-4 h-4" />
                                    إضافة وحدة
                                </Button>
                                <ViewToggle view={view} setView={setView} />
                            </>
                        ) : (
                            <Button variant="outline" onClick={() => setShowAddForm(false)}>
                                إلغاء
                            </Button>
                        )}
                    </div>
                </div>

                {!showAddForm && <UnitFilterBar options={options} />}
            </div>

            <div className="flex-1 min-h-0 relative">
                {showAddForm ? (
                    <div className="bg-card border rounded-xl p-6 overflow-y-auto h-full">
                        <UnitForm onSuccess={() => setShowAddForm(false)} />
                    </div>
                ) : view === 'list' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 content-start overflow-y-auto h-full pb-20 pr-2">
                        {units.length > 0 ? (
                            units.map((unit) => (
                                <UnitCard key={unit.id} unit={unit} />
                            ))
                        ) : (
                            <div className="col-span-full flex flex-col items-center justify-center py-20 text-muted-foreground">
                                <p>لا توجد وحدات تطابق معايير البحث</p>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="h-full w-full rounded-2xl overflow-hidden border">
                        <ClientUnitMap units={units} />
                    </div>
                )}
            </div>
        </div>
    );
}
