import { getAllFormOptions, getFormSchema } from '@/actions/settings';
import { SchemaBuilder } from './schema-builder';
import { FormSchemaField } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
    // 1. Fetch schema definitions (custom fields)
    const [projectSchemaRes, unitSchemaRes, allOptionsRes] = await Promise.all([
        getFormSchema('project'),
        getFormSchema('unit'),
        getAllFormOptions(),
    ]);

    const projectSchema = (projectSchemaRes.success ? projectSchemaRes.data : []) as FormSchemaField[];
    const unitSchema = (unitSchemaRes.success ? unitSchemaRes.data : []) as FormSchemaField[];
    const allOptions = allOptionsRes.success ? allOptionsRes.data : {};

    const projectTabs = allOptions.project_tabs || ['basic', 'location', 'inventory', 'financial', 'media', 'units'];
    const unitTabs = allOptions.unit_tabs || ['basic', 'location', 'details', 'media'];

    const projectFieldTabsRaw = allOptions.project_field_tabs?.[0];
    const unitFieldTabsRaw = allOptions.unit_field_tabs?.[0];

    const projectFieldTabs = projectFieldTabsRaw ? JSON.parse(projectFieldTabsRaw) : {};
    const unitFieldTabs = unitFieldTabsRaw ? JSON.parse(unitFieldTabsRaw) : {};

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)]">
            <div className="flex-1 overflow-hidden">
                <SchemaBuilder
                    initialProjectSchema={projectSchema}
                    initialUnitSchema={unitSchema}
                    initialProjectTabs={projectTabs}
                    initialUnitTabs={unitTabs}
                    initialProjectFieldTabs={projectFieldTabs}
                    initialUnitFieldTabs={unitFieldTabs}
                />
            </div>
        </div>
    );
}
