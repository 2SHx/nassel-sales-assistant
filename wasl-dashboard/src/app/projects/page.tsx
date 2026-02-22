'use client';

import { useState } from 'react';
import { ProjectFilterBar } from '@/components/projects/filter-bar';
import { ProjectCard } from '@/components/projects/project-card';
import { ClientProjectMap } from '@/components/projects/client-map';
import { useProjects } from '@/hooks/useProjects';
import { ViewToggle } from '@/components/shared/view-toggle';

import { Button } from '@/components/ui/button';
import { ProjectForm } from '@/components/forms/project-form';
import { Plus } from 'lucide-react';

export default function ProjectsPage() {
    const { projects, loading, options } = useProjects();
    const [view, setView] = useState<'list' | 'map'>('list');
    const [showAddForm, setShowAddForm] = useState(false);

    return (
        <div className="flex flex-col gap-6 h-[calc(100vh-100px)]">
            <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold tracking-tight">
                        {showAddForm ? 'إضافة مشروع جديد' : 'المشاريع'}
                    </h1>
                    <div className="flex items-center gap-4">
                        {!showAddForm ? (
                            <>
                                <Button className="gap-2" onClick={() => setShowAddForm(true)}>
                                    <Plus className="w-4 h-4" />
                                    إضافة مشروع
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
                {!showAddForm && <ProjectFilterBar options={options} />}
            </div>

            <div className="flex-1 min-h-0 relative">
                {showAddForm ? (
                    <div className="bg-card border rounded-xl p-6 overflow-y-auto h-full">
                        <ProjectForm onSuccess={() => setShowAddForm(false)} />
                    </div>
                ) : loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                        {[1, 2, 3].map(i => <div key={i} className="h-[400px] bg-muted rounded-2xl" />)}
                    </div>
                ) : (
                    <>
                        {view === 'list' && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 content-start overflow-y-auto h-full pb-20 pr-2">
                                {projects.map((project) => (
                                    <ProjectCard key={project.id} project={project} />
                                ))}
                                {projects.length === 0 && (
                                    <div className="col-span-full text-center py-20 text-muted-foreground">
                                        لا توجد مشاريع تطابق بحثك
                                    </div>
                                )}
                            </div>
                        )}

                        {view === 'map' && (
                            <div className="h-full w-full">
                                <ClientProjectMap projects={projects} />
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
