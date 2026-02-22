'use client';

import { useState, useTransition, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormSchemaField } from '@/lib/types';
import { createSchemaField, deleteSchemaField, updateSchemaField, getFormOptions, updateFormOptions } from '@/actions/settings';
import { toast } from 'sonner';
import { Trash2, Plus, Loader2, Type, Hash, ToggleLeft, List, Building2, Home, Settings2, GripVertical, Lock, X, Save, BoxSelect, CheckSquare, Eye, Layout, Info, AlertCircle } from 'lucide-react';
import {
    PROJECT_SYSTEM_FIELDS,
    UNIT_SYSTEM_FIELDS,
    FieldMetadata,
    getFieldsForTab,
    PROJECT_DEFAULT_TABS_MAPPING,
    UNIT_DEFAULT_TABS_MAPPING,
    TAB_LABELS
} from '@/lib/form-utils';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SchemaBuilderProps {
    initialProjectSchema: FormSchemaField[];
    initialUnitSchema: FormSchemaField[];
    initialProjectTabs: string[];
    initialUnitTabs: string[];
    initialProjectFieldTabs: Record<string, string>;
    initialUnitFieldTabs: Record<string, string>;
}



function SortableItem({ id, children }: { id: string; children: React.ReactNode }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 'auto',
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} className={`relative group p-0.5 rounded-lg transition-all ${isDragging ? 'ring-2 ring-primary ring-offset-2' : ''}`}>
            <div
                {...attributes}
                {...listeners}
                className="absolute -right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing p-1 bg-white border rounded shadow-sm z-20 hover:bg-gray-50 transition-all"
            >
                <GripVertical className="w-3.5 h-3.5 text-gray-400" />
            </div>
            {children}
        </div>
    );
}

export function SchemaBuilder({ initialProjectSchema, initialUnitSchema, initialProjectTabs, initialUnitTabs, initialProjectFieldTabs, initialUnitFieldTabs }: SchemaBuilderProps) {
    const [projectSchema, setProjectSchema] = useState(initialProjectSchema);
    const [unitSchema, setUnitSchema] = useState(initialUnitSchema);
    const [projectTabs, setProjectTabs] = useState(initialProjectTabs);
    const [unitTabs, setUnitTabs] = useState(initialUnitTabs);
    const [projectFieldTabs, setProjectFieldTabs] = useState(initialProjectFieldTabs || {});
    const [unitFieldTabs, setUnitFieldTabs] = useState(initialUnitFieldTabs || {});
    const [isPending, startTransition] = useTransition();

    const [selectedEntity, setSelectedEntity] = useState<'project' | 'unit'>('project');
    const [isSimulationMode, setIsSimulationMode] = useState(false);
    const [activeSimulationTab, setActiveSimulationTab] = useState('basic');

    // Field Ordering State
    const [projectFieldOrder, setProjectFieldOrder] = useState<Record<string, string[]>>({});
    const [unitFieldOrder, setUnitFieldOrder] = useState<Record<string, string[]>>({});

    const currentFieldOrder = selectedEntity === 'project' ? projectFieldOrder : unitFieldOrder;
    const setCurrentFieldOrder = selectedEntity === 'project' ? setProjectFieldOrder : setUnitFieldOrder;

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    // Dynamic field list based on centralized utility
    const projectStandardFieldsMapped = PROJECT_SYSTEM_FIELDS.map(f => ({ ...f, id: `p-${f.key}`, __TAB__: projectFieldTabs[f.key] || PROJECT_DEFAULT_TABS_MAPPING[f.key] || 'basic' }));
    const unitStandardFieldsMapped = UNIT_SYSTEM_FIELDS.map(f => ({ ...f, id: `u-${f.key}`, __TAB__: unitFieldTabs[f.key] || UNIT_DEFAULT_TABS_MAPPING[f.key] || 'basic' }));

    const currentStandardFieldsList = selectedEntity === 'project' ? projectStandardFieldsMapped : unitStandardFieldsMapped;
    const currentFieldTabs = selectedEntity === 'project' ? projectFieldTabs : unitFieldTabs;

    // UI State
    const [rightPanelMode, setRightPanelMode] = useState<'IDLE' | 'ADD' | 'EDIT_CUSTOM' | 'EDIT_STANDARD_OPTIONS' | 'MANAGE_TABS'>('IDLE');

    // Selection state
    const [selectedCustomField, setSelectedCustomField] = useState<FormSchemaField | null>(null);
    const [selectedStandardField, setSelectedStandardField] = useState<any | null>(null);

    // Form inputs state for Add / Edit Custom Field
    const [customFieldData, setCustomFieldData] = useState({
        field_label: '',
        field_key: '',
        field_type: 'text' as 'text' | 'number' | 'select' | 'boolean',
        field_options: '',
        field_tab: 'basic',
    });

    const currentTabs = selectedEntity === 'project' ? projectTabs : unitTabs;

    // Form inputs state for Standard Field Options
    const [standardOptionsList, setStandardOptionsList] = useState<string[]>([]);
    const [optionsLoading, setOptionsLoading] = useState(false);

    const currentSchema = selectedEntity === 'project' ? projectSchema : unitSchema;

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const tabFields = getFieldsForTab(
            activeSimulationTab,
            selectedEntity === 'project' ? PROJECT_SYSTEM_FIELDS : UNIT_SYSTEM_FIELDS,
            currentSchema,
            currentFieldTabs,
            currentFieldOrder[activeSimulationTab],
            selectedEntity === 'project' ? 'p-' : 'u-'
        );

        const activeFieldId = active.id as string;
        const overFieldId = over.id as string;

        const fieldIds = tabFields.map(f => f._id);
        const oldIndex = fieldIds.indexOf(activeFieldId);
        const newIndex = fieldIds.indexOf(overFieldId);

        if (oldIndex !== -1 && newIndex !== -1) {
            const newOrder = arrayMove(fieldIds, oldIndex, newIndex);
            const updatedTotalOrder = { ...currentFieldOrder, [activeSimulationTab]: newOrder };
            setCurrentFieldOrder(updatedTotalOrder);

            // Persist to database
            startTransition(async () => {
                await updateFormOptions(
                    selectedEntity === 'project' ? 'project_field_order' : 'unit_field_order',
                    [JSON.stringify(updatedTotalOrder)]
                );
            });
        }
    };

    useEffect(() => {
        const fetchOrder = async () => {
            const res = await getFormOptions(selectedEntity === 'project' ? 'project_field_order' : 'unit_field_order');
            if (res.success && res.options?.[0]) {
                try {
                    const savedOrder = JSON.parse(res.options[0]);
                    setCurrentFieldOrder(savedOrder);
                } catch (e) {
                    console.error('Failed to parse field order:', e);
                }
            } else {
                // If no order exists, initialize it from current view
                const initialOrder: Record<string, string[]> = {};
                const tabsList = selectedEntity === 'project' ? projectTabs : unitTabs;
                tabsList.forEach(t => {
                    const fields = getFieldsForTab(
                        t,
                        selectedEntity === 'project' ? PROJECT_SYSTEM_FIELDS : UNIT_SYSTEM_FIELDS,
                        currentSchema,
                        currentFieldTabs,
                        undefined,
                        selectedEntity === 'project' ? 'p-' : 'u-'
                    );
                    initialOrder[t] = fields.map(f => f._id);
                });
                setCurrentFieldOrder(initialOrder);
            }
        };
        fetchOrder();
    }, [selectedEntity, currentSchema, currentFieldTabs, projectTabs, unitTabs, setCurrentFieldOrder]);

    // --- Actions ---

    const fetchStandardOptions = useCallback(async (category: string) => {
        setOptionsLoading(true);
        const res = await getFormOptions(category);
        if (res.success) {
            setStandardOptionsList(res.options);
        }
        setOptionsLoading(false);
    }, []);

    const handleSelectStandardField = (field: FieldMetadata) => {
        setSelectedCustomField(null);
        setSelectedStandardField(field);

        if (field.type === 'select' && field.category) {
            setRightPanelMode('EDIT_STANDARD_OPTIONS');
            fetchStandardOptions(field.category);
        } else {
            setRightPanelMode('IDLE'); // Not editable
        }
    };

    const handleSelectCustomField = (field: FormSchemaField) => {
        setSelectedStandardField(null);
        setSelectedCustomField(field);

        const allOptions = Array.isArray(field.field_options) ? field.field_options : [];
        const tabOption = allOptions.find(o => o.startsWith('__TAB__:'));
        const fieldTab = tabOption ? tabOption.replace('__TAB__:', '') : 'basic';
        const cleanOptions = allOptions.filter(o => !o.startsWith('__TAB__:'));

        setCustomFieldData({
            field_label: field.field_label,
            field_key: field.field_key,
            field_type: field.field_type as any,
            field_options: cleanOptions.join(', '),
            field_tab: fieldTab,
        });
        setRightPanelMode('EDIT_CUSTOM');
    };

    const handleOpenAddField = (type: string = 'text') => {
        setSelectedCustomField(null);
        setSelectedStandardField(null);
        setCustomFieldData({
            field_label: '',
            field_key: '',
            field_type: type as any,
            field_options: '',
            field_tab: 'basic',
        });
        setRightPanelMode('ADD');
    };

    const handleDelete = (id: string, entityType: 'project' | 'unit') => {
        startTransition(async () => {
            const res = await deleteSchemaField(id);
            if (res.success) {
                toast.success('تم حذف الحقل بنجاح');
                if (entityType === 'project') {
                    setProjectSchema(prev => prev.filter(f => f.id !== id));
                } else {
                    setUnitSchema(prev => prev.filter(f => f.id !== id));
                }
                setRightPanelMode('IDLE');
            } else {
                toast.error('حدث خطأ أثناء الحذف');
            }
        });
    };

    const handleSaveCustomField = () => {
        if (!customFieldData.field_label || !customFieldData.field_key) {
            toast.error('الرجاء إدخال اسم الحقل والمفتاح البرمجي');
            return;
        }

        const cleanOptionsList = customFieldData.field_type === 'select' ? customFieldData.field_options.split(',').map(s => s.trim()).filter(Boolean) : [];
        const optionsWithTab = [`__TAB__:${customFieldData.field_tab}`, ...cleanOptionsList];

        const payload = {
            entity_type: selectedEntity,
            field_label: customFieldData.field_label,
            field_key: customFieldData.field_key,
            field_type: customFieldData.field_type,
            field_options: optionsWithTab,
        };

        if (rightPanelMode === 'ADD') {
            if (!/^[a-zA-Z0-9_]+$/.test(customFieldData.field_key)) {
                toast.error('المفتاح البرمجي يجب أن يحتوي على حروف إنجليزية وأرقام وشرطة سفلية فقط');
                return;
            }
            startTransition(async () => {
                const res = await createSchemaField({ ...payload, is_required: false });
                if (res.success && res.data) {
                    toast.success('تم إضافة الحقل بنجاح');
                    if (selectedEntity === 'project') setProjectSchema(prev => [...prev, res.data]);
                    else setUnitSchema(prev => [...prev, res.data]);
                    setRightPanelMode('IDLE');
                } else {
                    toast.error('حدث خطأ أثناء الإضافة. تأكد من عدم تكرار المفتاح البرمجي.');
                }
            });
        } else if (rightPanelMode === 'EDIT_CUSTOM' && selectedCustomField) {
            startTransition(async () => {
                const res = await updateSchemaField(selectedCustomField.id, payload);
                if (res.success && res.data) {
                    toast.success('تم تحديث الحقل بنجاح');
                    if (selectedEntity === 'project') setProjectSchema(prev => prev.map(f => f.id === res.data.id ? res.data : f));
                    else setUnitSchema(prev => prev.map(f => f.id === res.data.id ? res.data : f));
                } else {
                    toast.error('حدث خطأ أثناء التحديث');
                }
            });
        }
    };

    const handleSaveStandardOptions = () => {
        if (!selectedStandardField?.category) return;
        startTransition(async () => {
            const cleanOptions = standardOptionsList.map(s => s.trim()).filter(Boolean);
            const res = await updateFormOptions(selectedStandardField.category, cleanOptions);
            if (res.success) {
                toast.success('تم تحديث الخيارات بنجاح');
            } else {
                toast.error('حدث خطأ أثناء حفظ الخيارات');
            }
        });
    };

    const handleSaveTabs = () => {
        startTransition(async () => {
            const category = selectedEntity === 'project' ? 'project_tabs' : 'unit_tabs';
            const res = await updateFormOptions(category, currentTabs);
            if (res.success) {
                toast.success('تم تحديث التبويبات بنجاح');
            } else {
                toast.error('حدث خطأ أثناء حفظ التبويبات');
            }
        });
    };

    const handleAddTab = () => {
        const newTab = `Tab_${currentTabs.length + 1}`;
        if (selectedEntity === 'project') setProjectTabs([...projectTabs, newTab]);
        else setUnitTabs([...unitTabs, newTab]);
    };

    const handleRemoveTab = (tab: string) => {
        if (currentTabs.length <= 1) {
            toast.error('يجب أن يكون هناك تبويب واحد على الأقل');
            return;
        }

        // Move all fields from this tab to 'basic'
        const newMap = { ...currentFieldTabs };
        Object.keys(newMap).forEach(k => {
            if (newMap[k] === tab) newMap[k] = 'basic';
        });

        // Remove from order
        const newOrder = { ...currentFieldOrder };
        delete newOrder[tab];

        if (selectedEntity === 'project') {
            setProjectTabs(projectTabs.filter(t => t !== tab));
            setProjectFieldTabs(newMap);
            setProjectFieldOrder(newOrder);
        } else {
            setUnitTabs(unitTabs.filter(t => t !== tab));
            setUnitFieldTabs(newMap);
            setUnitFieldOrder(newOrder);
        }

        // Persist everything
        startTransition(async () => {
            const tabsKey = selectedEntity === 'project' ? 'project_tabs' : 'unit_tabs';
            const mappingKey = selectedEntity === 'project' ? 'project_field_tabs' : 'unit_field_tabs';
            const orderKey = selectedEntity === 'project' ? 'project_field_order' : 'unit_field_order';

            await Promise.all([
                updateFormOptions(tabsKey, currentTabs.filter(t => t !== tab)),
                updateFormOptions(mappingKey, [JSON.stringify(newMap)]),
                updateFormOptions(orderKey, [JSON.stringify(newOrder)])
            ]);
            toast.success('تم حذف التبويب بنجاح');
        });
    };

    const handleRenameTab = (oldName: string, newName: string) => {
        if (!newName.trim() || oldName === newName) return;

        // Update mappings
        const newMap = { ...currentFieldTabs };
        Object.keys(newMap).forEach(k => {
            if (newMap[k] === oldName) newMap[k] = newName;
        });

        // Update order
        const newOrder = { ...currentFieldOrder };
        if (newOrder[oldName]) {
            newOrder[newName] = newOrder[oldName];
            delete newOrder[oldName];
        }

        const newTabsList = currentTabs.map(t => t === oldName ? newName : t);

        if (selectedEntity === 'project') {
            setProjectTabs(newTabsList);
            setProjectFieldTabs(newMap);
            setProjectFieldOrder(newOrder);
        } else {
            setUnitTabs(newTabsList);
            setUnitFieldTabs(newMap);
            setUnitFieldOrder(newOrder);
        }

        // Persist everything
        startTransition(async () => {
            const tabsKey = selectedEntity === 'project' ? 'project_tabs' : 'unit_tabs';
            const mappingKey = selectedEntity === 'project' ? 'project_field_tabs' : 'unit_field_tabs';
            const orderKey = selectedEntity === 'project' ? 'project_field_order' : 'unit_field_order';

            await Promise.all([
                updateFormOptions(tabsKey, newTabsList),
                updateFormOptions(mappingKey, [JSON.stringify(newMap)]),
                updateFormOptions(orderKey, [JSON.stringify(newOrder)])
            ]);
            toast.success('تم تعديل التبويب بنجاح');
        });
    };

    const handleSaveFieldTab = (fieldKey: string, newTab: string) => {
        const newMap = { ...currentFieldTabs, [fieldKey]: newTab };
        if (selectedEntity === 'project') setProjectFieldTabs(newMap);
        else setUnitFieldTabs(newMap);

        startTransition(async () => {
            const category = selectedEntity === 'project' ? 'project_field_tabs' : 'unit_field_tabs';
            const res = await updateFormOptions(category, [JSON.stringify(newMap)]);
            if (res.success) {
                toast.success('تم تحديث موقع الحقل بنجاح');
            } else {
                toast.error('حدث خطأ أثناء حفظ الموقع');
            }
        });
    };

    const getFieldIcon = (type: string) => {
        switch (type) {
            case 'text': return <Type className="w-4 h-4 text-blue-500" />;
            case 'number': return <Hash className="w-4 h-4 text-emerald-500" />;
            case 'boolean': return <ToggleLeft className="w-4 h-4 text-purple-500" />;
            case 'select': return <List className="w-4 h-4 text-amber-500" />;
            default: return <Settings2 className="w-4 h-4 text-gray-500" />;
        }
    };

    return (
        <div className="flex flex-col border rounded-xl overflow-hidden bg-white shadow-sm mt-4">

            {/* Top Bar Form Selector */}
            <div className="flex items-center gap-4 p-4 border-b bg-gray-50">
                <span className="font-bold text-sm text-gray-700">تعديل نموذج:</span>
                <div className="flex bg-gray-200/50 p-1 rounded-lg">
                    <button
                        onClick={() => { setSelectedEntity('project'); setRightPanelMode('IDLE'); setSelectedCustomField(null); setSelectedStandardField(null); }}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm transition-all ${selectedEntity === 'project' ? 'bg-white shadow-sm text-primary font-bold' : 'text-gray-600 hover:text-gray-900'}`}
                    >
                        <Building2 className="w-4 h-4" /> المشاريع
                    </button>
                    <button
                        onClick={() => { setSelectedEntity('unit'); setRightPanelMode('IDLE'); setSelectedCustomField(null); setSelectedStandardField(null); }}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm transition-all ${selectedEntity === 'unit' ? 'bg-white shadow-sm text-primary font-bold' : 'text-gray-600 hover:text-gray-900'}`}
                    >
                        <Home className="w-4 h-4" /> الوحدات
                    </button>
                </div>

                <div className="mr-auto flex items-center gap-2">
                    <Button
                        variant={isSimulationMode ? "default" : "outline"}
                        size="sm"
                        className="gap-2"
                        onClick={() => setIsSimulationMode(!isSimulationMode)}
                    >
                        <Eye className="w-4 h-4" />
                        {isSimulationMode ? "الرجوع للبناء" : "محاكاة النموذج"}
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() => setRightPanelMode('MANAGE_TABS')}
                    >
                        <Settings2 className="w-4 h-4" />
                        إدارة التبويبات
                    </Button>
                </div>
            </div>

            <div className="flex flex-col md:flex-row min-h-[600px]">

                {/* Left Panel / Field Palette (Zoho Style) */}
                <div className="w-full md:w-56 shrink-0 bg-white border-l border-gray-200 flex flex-col">
                    <div className="p-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                        <h3 className="font-bold text-xs text-gray-700">Basic Fields</h3>
                    </div>

                    <div className="grid grid-cols-2 p-2 gap-1 content-start flex-1 overflow-y-auto">
                        <button onClick={() => handleOpenAddField('text')} className="flex flex-col items-center justify-center p-3 rounded hover:bg-gray-100 transition-all text-gray-600 group border border-transparent hover:border-gray-200">
                            <Type className="w-5 h-5 mb-1.5 text-gray-500" />
                            <span className="text-[11px]">Single Line</span>
                        </button>
                        <button onClick={() => handleOpenAddField('number')} className="flex flex-col items-center justify-center p-3 rounded hover:bg-gray-100 transition-all text-gray-600 group border border-transparent hover:border-gray-200">
                            <Hash className="w-5 h-5 mb-1.5 text-gray-500" />
                            <span className="text-[11px]">Number</span>
                        </button>
                        <button onClick={() => handleOpenAddField('boolean')} className="flex flex-col items-center justify-center p-3 rounded hover:bg-gray-100 transition-all text-gray-600 group border border-transparent hover:border-gray-200">
                            <ToggleLeft className="w-5 h-5 mb-1.5 text-gray-500" />
                            <span className="text-[11px]">Boolean</span>
                        </button>
                        <button onClick={() => handleOpenAddField('select')} className="flex flex-col items-center justify-center p-3 rounded hover:bg-gray-100 transition-all text-gray-600 group border border-transparent hover:border-gray-200">
                            <List className="w-5 h-5 mb-1.5 text-gray-500" />
                            <span className="text-[11px]">Drop Down</span>
                        </button>
                    </div>
                </div>

                {/* Main Content Area (Canvas) */}
                <div className="flex-1 bg-slate-50/50 p-6 overflow-y-auto">

                    {isSimulationMode ? (
                        /* Simulation Mode View */
                        <div className="animate-in fade-in zoom-in-95 duration-300">
                            <div className="flex items-center gap-2 mb-6">
                                <Eye className="w-5 h-5 text-primary" />
                                <h2 className="text-lg font-bold">محاكاة النموذج (Preview)</h2>
                            </div>

                            <div className="bg-white rounded-xl shadow-lg border p-6 max-w-4xl mx-auto min-h-[500px]">
                                {/* Simulated Tabs */}
                                <div className="flex border-b mb-6 overflow-x-auto" dir="rtl">
                                    {currentTabs.map((tab) => (
                                        <button
                                            key={tab}
                                            onClick={() => setActiveSimulationTab(tab)}
                                            className={`px-4 py-2 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${activeSimulationTab === tab ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                                        >
                                            {TAB_LABELS[tab] || tab}
                                        </button>
                                    ))}
                                </div>

                                <DndContext
                                    sensors={sensors}
                                    collisionDetection={closestCenter}
                                    onDragEnd={handleDragEnd}
                                >
                                    <div className="p-4 bg-gray-50/30 rounded-lg min-h-[300px]">
                                        <SortableContext
                                            items={getFieldsForTab(
                                                activeSimulationTab,
                                                selectedEntity === 'project' ? PROJECT_SYSTEM_FIELDS : UNIT_SYSTEM_FIELDS,
                                                currentSchema,
                                                currentFieldTabs,
                                                currentFieldOrder[activeSimulationTab],
                                                selectedEntity === 'project' ? 'p-' : 'u-'
                                            ).map(f => f._id)}
                                            strategy={verticalListSortingStrategy}
                                        >
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {getFieldsForTab(
                                                    activeSimulationTab,
                                                    selectedEntity === 'project' ? PROJECT_SYSTEM_FIELDS : UNIT_SYSTEM_FIELDS,
                                                    currentSchema,
                                                    currentFieldTabs,
                                                    currentFieldOrder[activeSimulationTab],
                                                    selectedEntity === 'project' ? 'p-' : 'u-'
                                                ).map((field: any) => (
                                                    <SortableItem key={field._id} id={field._id}>
                                                        <div className={`group/field relative space-y-2 p-4 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-200 ${field.type === 'boolean' || field.field_type === 'boolean' ? 'flex items-center justify-between gap-4' : ''}`}>
                                                            <div className="flex items-center gap-2">
                                                                <div className={`p-1.5 rounded-lg ${field.isSystem ? 'bg-amber-50' : 'bg-blue-50'}`}>
                                                                    {field.isSystem ? <Lock className="w-3 h-3 text-amber-600" /> : getFieldIcon(field.type || field.field_type)}
                                                                </div>
                                                                <Label className="text-sm font-bold text-gray-800">
                                                                    {field.isSystem ? field.label : field.field_label}
                                                                </Label>
                                                                {field.impact && (
                                                                    <div className="group/info relative">
                                                                        <Info className="w-3.5 h-3.5 text-blue-400 cursor-help hover:text-blue-600 transition-colors" />
                                                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-2.5 bg-gray-900/95 backdrop-blur-sm text-white text-[10px] rounded-lg opacity-0 group-hover/info:opacity-100 transition-all duration-200 pointer-events-none z-50 shadow-xl border border-white/10 leading-relaxed">
                                                                            <div className="font-bold mb-1 text-blue-400">Impact Notice:</div>
                                                                            {field.impact}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>

                                                            <div className={field.type === 'boolean' || field.field_type === 'boolean' ? '' : 'mt-1'}>
                                                                {(field.type === 'text' || field.field_type === 'text' || field.type === 'number' || field.field_type === 'number') ? (
                                                                    <div className="h-10 w-full bg-gray-50/50 border border-gray-100 rounded-lg px-3 flex items-center text-gray-400 text-xs font-medium italic group-hover/field:bg-white transition-colors">
                                                                        {field.isSystem ? 'System Managed' : 'User Input...'}
                                                                    </div>
                                                                ) : (field.type === 'boolean' || field.field_type === 'boolean') ? (
                                                                    <div className="w-10 h-5 bg-gray-200 rounded-full relative shadow-inner">
                                                                        <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full shadow-sm" />
                                                                    </div>
                                                                ) : (field.type === 'select' || field.field_type === 'select') ? (
                                                                    <div className="h-10 w-full bg-gray-50/50 border border-gray-100 rounded-lg px-3 flex items-center justify-between text-gray-400 text-xs font-medium group-hover/field:bg-white transition-colors">
                                                                        <span className="truncate">اختر من القائمة...</span>
                                                                        <List className="w-3.5 h-3.5 opacity-50" />
                                                                    </div>
                                                                ) : (field.type === 'date') ? (
                                                                    <div className="h-10 w-full bg-gray-50/50 border border-gray-100 rounded-lg px-3 flex items-center text-gray-400 text-xs font-medium italic group-hover/field:bg-white transition-colors">
                                                                        YYYY-MM-DD
                                                                    </div>
                                                                ) : null}
                                                            </div>
                                                        </div>
                                                    </SortableItem>
                                                ))}
                                            </div>
                                        </SortableContext>
                                    </div>
                                </DndContext>
                            </div>
                        </div>
                    ) : (
                        /* Default Builder View */
                        <>
                            {/* Standard Fields Section */}
                            <div className="mb-6">
                                <div className="flex items-center gap-2 mb-3">
                                    <Settings2 className="w-4 h-4 text-gray-400" />
                                    <h3 className="text-xs font-bold text-gray-500 uppercase">System Fields</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border border-gray-200 bg-white rounded-md overflow-hidden shadow-sm">
                                    {currentStandardFieldsList.map((field: any, idx: number) => {
                                        const isSelected = selectedStandardField?.id === field.id;
                                        const isBorderBottom = idx < currentStandardFieldsList.length - 2;
                                        const isBorderLeft = idx % 2 === 0;

                                        return (
                                            <div
                                                key={field.id}
                                                onClick={() => handleSelectStandardField(field)}
                                                className={`flex items-center gap-3 p-3 cursor-pointer transition-all ${isBorderBottom ? 'border-b border-gray-200' : ''
                                                    } ${isBorderLeft ? 'border-l border-gray-200' : ''} ${isSelected ? 'ring-inset ring-2 ring-blue-500/50 bg-blue-50/20 z-10' : 'hover:bg-gray-50'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-2 w-1/3 text-gray-500 text-xs">
                                                    {field.type === 'select' ? <List className="w-3.5 h-3.5" /> : <Type className="w-3.5 h-3.5" />}
                                                    <span className="truncate">{field.label}</span>
                                                </div>
                                                <div className="flex-1">
                                                    <div className="h-8 w-full bg-white border border-gray-200 rounded px-2 flex items-center text-gray-400 text-[11px]">
                                                        {field.key}
                                                    </div>
                                                </div>
                                                <div className="shrink-0 pl-1 text-gray-300">
                                                    <Lock className="w-3 h-3" />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Custom Fields Section */}
                            <div>
                                <div className="flex items-center gap-2 mb-3 mt-8">
                                    <Plus className="w-4 h-4 text-gray-400" />
                                    <h3 className="text-xs font-bold text-gray-500 uppercase">Custom Fields</h3>
                                </div>

                                {currentSchema.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center text-muted-foreground border border-dashed border-gray-300 rounded-md bg-white p-8 h-32">
                                        <p className="text-xs font-medium">Drag and drop fields here</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border border-gray-200 bg-white rounded-md overflow-hidden shadow-sm">
                                        {currentSchema.map((field, idx) => {
                                            const isSelected = selectedCustomField?.id === field.id;
                                            const isBorderBottom = idx < currentSchema.length - 2;
                                            const isBorderLeft = idx % 2 === 0;

                                            return (
                                                <div
                                                    key={field.id}
                                                    onClick={() => handleSelectCustomField(field)}
                                                    className={`group flex items-center gap-3 p-3 cursor-pointer transition-all ${isBorderBottom ? 'border-b border-gray-200' : ''
                                                        } ${isBorderLeft ? 'border-l border-gray-200' : ''} ${isSelected ? 'ring-inset ring-2 ring-blue-500/50 bg-blue-50/20 z-10' : 'hover:bg-gray-50'
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-2 w-1/3 text-gray-500 text-xs">
                                                        {field.field_type === 'select' ? <List className="w-3.5 h-3.5" /> : <Type className="w-3.5 h-3.5" />}
                                                        <span className="truncate">{field.field_label}</span>
                                                    </div>

                                                    <div className="flex-1 relative">
                                                        <div className="h-8 w-full bg-white border border-gray-200 rounded px-2 flex items-center text-gray-400 text-[11px]">
                                                            {field.field_key}
                                                        </div>
                                                    </div>

                                                    <div className="shrink-0 pl-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-6 w-6 text-gray-400 hover:text-red-500 hover:bg-red-50"
                                                            onClick={(e) => { e.stopPropagation(); handleDelete(field.id, selectedEntity); }}
                                                            disabled={isPending}
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                </div>

                {/* Right Panel / Field Properties (Zoho Style) */}
                <div className="w-full md:w-[320px] shrink-0 bg-white border-r border-gray-200 flex flex-col shadow-[1px_0_10px_rgba(0,0,0,0.02)]">
                    <div className="p-4 border-b border-gray-200 bg-gray-50/50 backdrop-blur-sm flex items-center justify-between sticky top-0 z-10">
                        <h3 className="font-bold text-sm text-gray-800 tracking-tight flex items-center gap-2">
                            <Settings2 className="w-4 h-4 text-primary" />
                            <span>خصائص الحقل</span>
                        </h3>
                        {rightPanelMode !== 'IDLE' && (
                            <button
                                className="text-gray-400 hover:text-gray-900 p-1 hover:bg-white rounded-md transition-all shadow-sm border border-transparent hover:border-gray-100"
                                onClick={() => { setRightPanelMode('IDLE'); setSelectedCustomField(null); setSelectedStandardField(null); }}
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {rightPanelMode === 'IDLE' && (
                            <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 p-6">
                                <Settings2 className="w-8 h-8 mb-3 opacity-20" />
                                <p className="text-xs">Select a field to view its properties</p>
                            </div>
                        )}

                        {(rightPanelMode === 'ADD' || rightPanelMode === 'EDIT_CUSTOM') && (
                            <div className="p-4 space-y-5 animate-in fade-in slide-in-from-left-4 duration-200">
                                <div className="space-y-1.5">
                                    <Label className="text-[11px] text-gray-500 font-medium uppercase tracking-wider">Field Name</Label>
                                    <Input
                                        value={customFieldData.field_label}
                                        onChange={e => setCustomFieldData({ ...customFieldData, field_label: e.target.value })}
                                        className="h-8 text-sm border-gray-300 focus-visible:ring-1 focus-visible:ring-blue-500"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-[11px] text-gray-500 font-medium uppercase tracking-wider">Field Link Name</Label>
                                    <Input
                                        value={customFieldData.field_key}
                                        onChange={e => setCustomFieldData({ ...customFieldData, field_key: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                                        className="font-mono text-xs text-left h-8 bg-gray-50 border-gray-300 focus-visible:ring-1 focus-visible:ring-blue-500"
                                        dir="ltr"
                                        disabled={rightPanelMode === 'EDIT_CUSTOM'}
                                    />
                                    <p className="text-[10px] text-gray-400">Used as the programmatic key via API.</p>
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-[11px] text-gray-500 font-medium uppercase tracking-wider">Appearance</Label>
                                    <Select
                                        value={customFieldData.field_type}
                                        onValueChange={(val: any) => setCustomFieldData({ ...customFieldData, field_type: val })}
                                    >
                                        <SelectTrigger className="h-8 text-sm border-gray-300 focus-visible:ring-1 focus-visible:ring-blue-500">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="text">Single Line</SelectItem>
                                            <SelectItem value="number">Number</SelectItem>
                                            <SelectItem value="boolean">Boolean</SelectItem>
                                            <SelectItem value="select">Drop Down</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-[11px] text-gray-500 font-medium uppercase tracking-wider">التبويب المستهدف</Label>
                                    <Select
                                        value={customFieldData.field_tab}
                                        onValueChange={(val: any) => setCustomFieldData({ ...customFieldData, field_tab: val })}
                                    >
                                        <SelectTrigger className="h-8 text-sm border-gray-300 focus-visible:ring-1 focus-visible:ring-blue-500">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {currentTabs.map(tab => (
                                                <SelectItem key={tab} value={tab}>{TAB_LABELS[tab] || tab}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <p className="text-[10px] text-gray-400">حدد التبويب الذي سيظهر فيه هذا الحقل.</p>
                                </div>

                                {customFieldData.field_type === 'select' && (
                                    <div className="space-y-3 pt-2 border-t border-gray-100">
                                        <div className="flex justify-between items-center">
                                            <Label className="text-[11px] text-gray-500 font-medium uppercase tracking-wider">الخيارات</Label>
                                        </div>
                                        <div className="space-y-1.5 bg-gray-50/50 p-2 rounded border border-gray-100">
                                            <p className="text-xs text-blue-600 mb-2 font-medium">أضف الخيارات مفصولة بفاصلة (,):</p>
                                            <textarea
                                                value={customFieldData.field_options}
                                                onChange={e => setCustomFieldData({ ...customFieldData, field_options: e.target.value })}
                                                className="w-full text-sm min-h-[80px] p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                placeholder="الخيار 1, الخيار 2, الخيار 3..."
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="pt-4 border-t border-gray-100">
                                    <Button
                                        className="w-full h-8 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded shadow-sm"
                                        onClick={handleSaveCustomField}
                                        disabled={isPending}
                                    >
                                        {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                        {rightPanelMode === 'ADD' ? 'Add Field' : 'Save Changes'}
                                    </Button>
                                </div>
                            </div>
                        )}

                        {rightPanelMode === 'EDIT_STANDARD_OPTIONS' && selectedStandardField && (
                            <div className="p-4 space-y-5 animate-in fade-in slide-in-from-left-4 duration-200">
                                <div className="space-y-1.5 border-b border-gray-100 pb-4">
                                    <Label className="text-[11px] text-gray-500 font-medium uppercase tracking-wider">Field Name</Label>
                                    <Input value={selectedStandardField.label} readOnly className="h-8 text-sm bg-gray-50 border-gray-200 text-gray-500" />
                                </div>

                                {selectedStandardField.impact && (
                                    <div className="p-3 rounded-lg bg-amber-50 border border-amber-100 flex gap-3">
                                        <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                                        <div className="space-y-1">
                                            <p className="text-xs font-bold text-amber-900">تنبيه التأثير (Impact Alert)</p>
                                            <p className="text-[10px] text-amber-800 leading-relaxed">
                                                {selectedStandardField.impact}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-1.5 pt-2">
                                    <Label className="text-[11px] text-gray-500 font-medium uppercase tracking-wider">Target Tab</Label>
                                    <Select
                                        value={currentFieldTabs[selectedStandardField.key] || 'basic'}
                                        onValueChange={(val: any) => handleSaveFieldTab(selectedStandardField.key, val)}
                                    >
                                        <SelectTrigger className="h-8 text-sm border-gray-300 focus-visible:ring-1 focus-visible:ring-blue-500">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {currentTabs.map(tab => (
                                                <SelectItem key={tab} value={tab}>{tab}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <p className="text-[10px] text-gray-400">تغيير مكان ظهور الحقل الأساسي في النموذج.</p>
                                </div>

                                {selectedStandardField.type === 'select' && (
                                    <>
                                        {optionsLoading ? (
                                            <div className="flex items-center justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-blue-500" /></div>
                                        ) : (
                                            <div className="space-y-3 pt-2">
                                                <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                                                    <Label className="text-[11px] text-gray-500 font-medium uppercase tracking-wider">Choices</Label>
                                                    <span className="text-[9px] text-blue-600 font-medium bg-blue-50 px-1.5 py-0.5 rounded">Editable System Field</span>
                                                </div>

                                                <div className="space-y-2">
                                                    {standardOptionsList.map((opt, idx) => (
                                                        <div key={idx} className="flex gap-1.5 items-center bg-gray-50 rounded border border-gray-200 p-1">
                                                            <div className="cursor-grab text-gray-300 px-1">
                                                                <GripVertical className="w-3 h-3" />
                                                            </div>
                                                            <input
                                                                value={opt}
                                                                onChange={e => {
                                                                    const newArr = [...standardOptionsList];
                                                                    newArr[idx] = e.target.value;
                                                                    setStandardOptionsList(newArr);
                                                                }}
                                                                className="h-7 w-full text-xs bg-transparent border-none focus:outline-none focus:ring-0 px-1"
                                                            />
                                                            <button
                                                                className="text-gray-400 hover:text-red-500 p-1 rounded hover:bg-red-50 transition-colors"
                                                                onClick={() => setStandardOptionsList(standardOptionsList.filter((_, i) => i !== idx))}
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>
                                                    ))}

                                                    <button
                                                        className="w-full flex items-center justify-center gap-1 py-1.5 mt-2 text-[11px] font-medium text-blue-600 hover:bg-blue-50 rounded border border-transparent hover:border-blue-100 transition-colors"
                                                        onClick={() => setStandardOptionsList([...standardOptionsList, 'New Choice'])}
                                                    >
                                                        <Plus className="w-3 h-3" /> Add Choice
                                                    </button>
                                                </div>

                                                <div className="pt-4 border-t border-gray-100">
                                                    <Button
                                                        className="w-full h-8 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded shadow-sm"
                                                        onClick={handleSaveStandardOptions}
                                                        disabled={isPending}
                                                    >
                                                        {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                                        Save Choices
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        )}

                        {rightPanelMode === 'MANAGE_TABS' && (
                            <div className="p-5 space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
                                <div className="space-y-1">
                                    <h4 className="text-sm font-bold text-gray-800 tracking-tight">إدارة التبويبات</h4>
                                    <p className="text-[11px] text-gray-500 leading-relaxed">أضف أو احذف أو قم بتعديل تسمية تبويبات النموذج.</p>
                                </div>

                                <div className="space-y-3 bg-gray-50/50 p-3 rounded-xl border border-gray-100 shadow-inner">
                                    {currentTabs.map((tab, idx) => (
                                        <div key={idx} className="flex gap-2 items-center bg-white rounded-lg border border-gray-200 p-2 shadow-sm group hover:border-primary/30 transition-all duration-200">
                                            <div className="p-1 px-2 bg-gray-50 rounded text-[10px] font-bold text-gray-400 group-hover:text-primary transition-colors">
                                                {idx + 1}
                                            </div>
                                            <input
                                                value={tab}
                                                onChange={e => handleRenameTab(tab, e.target.value)}
                                                className="h-8 w-full text-xs bg-transparent border-none focus:outline-none focus:ring-0 px-1 font-semibold text-gray-700"
                                                placeholder="اسم التبويب..."
                                            />
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-all"
                                                onClick={() => handleRemoveTab(tab)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    ))}

                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full h-9 border-dashed border-gray-300 hover:border-primary/50 hover:bg-primary/5 text-gray-500 hover:text-primary text-[11px] font-bold transition-all mt-2"
                                        onClick={handleAddTab}
                                    >
                                        <Plus className="h-3.5 w-3.5 mr-1" />
                                        إضافة تبويب جديد
                                    </Button>
                                </div>

                                <div className="pt-4 border-t border-gray-100">
                                    <Button
                                        className="w-full h-10 text-sm bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 rounded-xl font-bold transition-all active:scale-95"
                                        onClick={handleSaveTabs}
                                        disabled={isPending}
                                    >
                                        {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                                        حفظ التعديلات
                                    </Button>
                                </div>

                                <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 flex gap-3">
                                    <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                                    <div className="space-y-1">
                                        <p className="text-[11px] font-bold text-amber-900 italic">تنبيه هام</p>
                                        <p className="text-[10px] text-amber-800/80 leading-relaxed">
                                            عند حذف تبويب، سيتم نقل جميع الحقول الموجودة فيه تلقائياً إلى التبويب الأساسي (Basic).
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
}
