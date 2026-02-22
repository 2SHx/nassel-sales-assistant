'use client';

import { useState, useEffect } from 'react';
import { getFormSchema, getAllFormOptions } from '@/actions/settings';
import { FormSchemaField } from '@/lib/types';

export function useFormConfig(entityType: 'project' | 'unit') {
    const [schema, setSchema] = useState<FormSchemaField[]>([]);
    const [tabs, setTabs] = useState<string[]>([]);
    const [fieldTabsMap, setFieldTabsMap] = useState<Record<string, string>>({});
    const [fieldOrderMap, setFieldOrderMap] = useState<Record<string, string[]>>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchConfig() {
            setLoading(true);
            const [schemaRes, optionsRes] = await Promise.all([
                getFormSchema(entityType),
                getAllFormOptions()
            ]);

            if (schemaRes.success) {
                setSchema(schemaRes.data || []);
            }

            if (optionsRes.success) {
                const options = optionsRes.data;
                const tabsKey = entityType === 'project' ? 'project_tabs' : 'unit_tabs';
                const fieldTabsKey = entityType === 'project' ? 'project_field_tabs' : 'unit_field_tabs';
                const fieldOrderKey = entityType === 'project' ? 'project_field_order' : 'unit_field_order';

                setTabs(options[tabsKey] || (entityType === 'project'
                    ? ['basic', 'location', 'inventory', 'financial', 'media', 'units']
                    : ['basic', 'location', 'additional', 'media']));

                const fieldTabsRaw = options[fieldTabsKey]?.[0];
                if (fieldTabsRaw) {
                    try {
                        setFieldTabsMap(JSON.parse(fieldTabsRaw));
                    } catch (e) {
                        console.error('Error parsing field tabs mapping:', e);
                    }
                }

                const fieldOrderRaw = options[fieldOrderKey]?.[0];
                if (fieldOrderRaw) {
                    try {
                        setFieldOrderMap(JSON.parse(fieldOrderRaw));
                    } catch (e) {
                        console.error('Error parsing field order mapping:', e);
                    }
                }
            }
            setLoading(false);
        }

        fetchConfig();
    }, [entityType]);

    return { schema, tabs, fieldTabsMap, fieldOrderMap, loading };
}
