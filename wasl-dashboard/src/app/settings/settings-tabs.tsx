'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FormSchemaField } from '@/lib/types';
import { OptionsManager } from './options-manager';
import { SchemaBuilder } from './schema-builder';

interface SettingsTabsProps {
    initialOptions: Record<string, string[]>;
    projectSchema: FormSchemaField[];
    unitSchema: FormSchemaField[];
}

export function SettingsTabs({ initialOptions, projectSchema, unitSchema }: SettingsTabsProps) {
    return (
        <Tabs defaultValue="options" className="w-full" dir="rtl">
            <TabsList className="mb-6">
                <TabsTrigger value="options">قوائم الخيارات المستدلة</TabsTrigger>
                <TabsTrigger value="fields">الحقول المخصصة الإضافية</TabsTrigger>
            </TabsList>

            <TabsContent value="options">
                <Card>
                    <CardHeader>
                        <CardTitle>القوائم المنسدلة للنماذج</CardTitle>
                        <CardDescription>
                            إدارة الخيارات المتاحة في القوائم المنسدلة مثل مكونات الوحدة والمزايا.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <OptionsManager initialOptions={initialOptions} />
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="fields">
                <Card>
                    <CardHeader>
                        <CardTitle>بناء النماذج الديناميكية</CardTitle>
                        <CardDescription>
                            إضافة حقول بيانات جديدة كلياً (نصوص، أرقام، قوائم) إلى نماذج المشاريع والوحدات.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <SchemaBuilder
                            initialProjectSchema={projectSchema}
                            initialUnitSchema={unitSchema}
                        />
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    );
}
