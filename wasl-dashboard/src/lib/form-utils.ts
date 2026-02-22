import { FormSchemaField } from './types';

export interface FieldMetadata {
    key: string;
    label: string;
    type: 'text' | 'number' | 'select' | 'boolean' | 'date' | 'gallery';
    impact?: string;
    category?: string; // For selects
    options?: string[]; // For select
}

export const PROJECT_SYSTEM_FIELDS: FieldMetadata[] = [
    { key: 'name', label: 'اسم المشروع', type: 'text', impact: 'يظهر في باقات المشاريع وعناوين الصفحات' },
    { key: 'projectNumber', label: 'كود المشروع', type: 'text', impact: 'رقم مرجعي أساسي للوحدات' },
    { key: 'developer', label: 'المطور', type: 'text', impact: 'يظهر في تفاصيل المشروع' },
    { key: 'projectStatus', label: 'حالة المشروع', type: 'text' },
    { key: 'projectType', label: 'نوع المشروع', type: 'text' },
    { key: 'city', label: 'المدينة', type: 'text', impact: 'أساسي للفلاتر والبحث' },
    { key: 'district', label: 'الحي', type: 'text', impact: 'أساسي للفلاتر والبحث' },
    { key: 'unitTypes', label: 'أنواع الوحدات', type: 'text', impact: 'يظهر في بطاقات المشاريع' },
    { key: 'openingDate', label: 'موعد الافتتاح', type: 'date' },
    { key: 'totalUnits', label: 'إجمالي الوحدات', type: 'number', impact: 'يستخدم في حساب الإحصائيات' },
    { key: 'availableUnits', label: 'المتاحة', type: 'number' },
    { key: 'priceRange', label: 'نطاق السعر', type: 'text' },
    { key: 'areaRange', label: 'نطاق المساحة', type: 'text' },
    { key: 'totalProjectValue', label: 'إجمالي قيمة المشروع', type: 'number', impact: 'يظهر في داشبورد المالية' },
    { key: 'locationUrl', label: 'موقع المشروع (Maps)', type: 'text' },
    { key: 'brochureUrl', label: 'رابط البروشور', type: 'text' },
    { key: 'videoUrl', label: 'رابط الفيديو', type: 'text' },
];

export const PROJECT_DEFAULT_TABS_MAPPING: Record<string, string> = {
    name: 'basic',
    projectNumber: 'basic',
    developer: 'basic',
    projectStatus: 'basic',
    projectType: 'basic',
    city: 'location',
    district: 'location',
    locationUrl: 'location',
    unitTypes: 'inventory',
    totalUnits: 'inventory',
    availableUnits: 'inventory',
    openingDate: 'inventory',
    priceRange: 'financial',
    areaRange: 'financial',
    totalProjectValue: 'financial',
    brochureUrl: 'media',
    videoUrl: 'media'
};

export const TAB_LABELS: Record<string, string> = {
    'basic': 'أساسي',
    'location': 'الموقع',
    'inventory': 'المخزون',
    'financial': 'المالية',
    'media': 'الوسائط',
    'units': 'الوحدات',
    'details': 'المساحات',
    'additional': 'إضافي'
};

export const UNIT_SYSTEM_FIELDS: FieldMetadata[] = [
    { key: 'unitCode', label: 'كود الوحدة', type: 'text', impact: 'يظهر في بطاقات الوحدات وعرض الخريطة' },
    { key: 'unitModel', label: 'نموذج الوحدة', type: 'text' },
    { key: 'developer', label: 'المطور', type: 'text' },
    { key: 'status', label: 'حالة الوحدة', type: 'select', category: 'unit_statuses', impact: 'يؤثر على توافر الوحدة في الخريطة' },
    { key: 'type', label: 'نوع الوحدة', type: 'select', category: 'unit_types', impact: 'يستخدم في الفلاتر والبحث' },
    { key: 'floor', label: 'رقم الطابق', type: 'select', category: 'floors' },
    { key: 'elevatorStatus', label: 'حالة المصعد', type: 'select', category: 'elevator_statuses' },
    { key: 'netArea', label: 'المساحة الصافية', type: 'number', impact: 'يظهر في بطاقات الوحدات' },
    { key: 'privateArea', label: 'المساحة الخاصة', type: 'number' },
    { key: 'totalArea', label: 'المساحة الإجمالية', type: 'number' },
    { key: 'price', label: 'سعر الوحدة', type: 'number', impact: 'يظهر في بطاقات الوحدات وعرض الخريطة' },
    { key: 'bedrooms', label: 'غرف النوم', type: 'number', impact: 'يظهر في بطاقات الوحدات' },
    { key: 'bathrooms', label: 'دورات المياه', type: 'number', impact: 'يظهر في بطاقات الوحدات' },
    { key: 'unitNumber', label: 'رقم الوحدة', type: 'text' },
    { key: 'buildingNumber', label: 'رقم المبنى', type: 'text' },
    { key: 'farzNumber', label: 'رقم الفرز', type: 'text' },
    { key: 'patioArea', label: 'مساحة الفناء', type: 'number' },
    { key: 'titleDeedArea', label: 'مساحة الصك', type: 'number' },
    { key: 'direction', label: 'الاتجاه', type: 'text' },
    { key: 'facade', label: 'الواجهة', type: 'select', category: 'facades' },
    { key: 'videoUrl', label: 'رابط الفيديو', type: 'text' },
    { key: 'virtualTourUrl', label: 'رابط جولة افتراضية', type: 'text' },
    { key: 'brochureUrl', label: 'رابط البروشور', type: 'text' },
];

export const UNIT_DEFAULT_TABS_MAPPING: Record<string, string> = {
    unitCode: 'basic',
    unitModel: 'basic',
    developer: 'basic',
    status: 'basic',
    type: 'basic',
    direction: 'location',
    facade: 'location',
    floor: 'location',
    elevatorStatus: 'location',
    netArea: 'details',
    privateArea: 'details',
    totalArea: 'details',
    price: 'details',
    bedrooms: 'details',
    bathrooms: 'details',
    unitNumber: 'details',
    buildingNumber: 'details',
    farzNumber: 'details',
    patioArea: 'details',
    titleDeedArea: 'details',
    videoUrl: 'media',
    virtualTourUrl: 'media',
    brochureUrl: 'media'
};

export function getFieldsForTab(
    tabName: string,
    systemFields: FieldMetadata[],
    customFields: FormSchemaField[],
    fieldTabsMap: Record<string, string>,
    tabFieldOrder?: string[], // ['p-name', 'f43...', ...]
    entityPrefix: string = 'p-'
) {
    const defaultMapping = entityPrefix === 'p-' ? PROJECT_DEFAULT_TABS_MAPPING : UNIT_DEFAULT_TABS_MAPPING;

    const combinedSystem = systemFields.filter(f => {
        const fieldTab = fieldTabsMap[f.key] || defaultMapping[f.key] || 'basic';
        return fieldTab === tabName;
    }).map(f => ({ ...f, _id: `${entityPrefix}${f.key}`, isSystem: true }));

    const combinedCustom = customFields.filter(f => {
        const hasTabOpt = Array.isArray(f.field_options) && f.field_options.find(o => o.startsWith('__TAB__:'));
        const fieldTab = hasTabOpt ? hasTabOpt.replace('__TAB__:', '') : 'basic';
        return fieldTab === tabName;
    }).map(f => ({ ...f, _id: f.id, isSystem: false }));

    const allFields = [...combinedSystem, ...combinedCustom];

    if (tabFieldOrder && tabFieldOrder.length > 0) {
        return allFields.sort((a, b) => {
            const indexA = tabFieldOrder.indexOf(a._id);
            const indexB = tabFieldOrder.indexOf(b._id);
            if (indexA !== -1 && indexB !== -1) return indexA - indexB;
            if (indexA !== -1) return -1;
            if (indexB !== -1) return 1;
            return 0; // maintain default
        });
    }

    return allFields;
}
