'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Building2, Home, Settings, PieChart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

export function Sidebar() {
    const pathname = usePathname();

    const routes = [
        {
            label: 'لوحة المعلومات',
            icon: LayoutDashboard,
            href: '/dashboard',
            active: pathname === '/dashboard' || pathname === '/',
        },
        {
            label: 'المشاريع',
            icon: Building2,
            href: '/projects',
            active: pathname.startsWith('/projects'),
        },
        {
            label: 'الوحدات',
            icon: Home,
            href: '/units',
            active: pathname.startsWith('/units'),
        },
    ];

    return (
        <div className="hidden border-l bg-gray-100/40 lg:block dark:bg-gray-800/40 w-[280px] min-h-screen fixed right-0 top-0 bottom-0 z-50">
            <div className="flex h-full max-h-screen flex-col gap-2">
                <div className="flex h-[60px] items-center border-b px-6">
                    <Link className="flex items-center gap-2 font-bold" href="/">
                        <span className="text-xl text-primary font-bold">وصـل</span>
                    </Link>
                </div>
                <ScrollArea className="flex-1 px-3 py-4">
                    <nav className="grid items-start gap-2">
                        {routes.map((route) => (
                            <Button
                                key={route.href}
                                variant={route.active ? 'secondary' : 'ghost'}
                                className={cn(
                                    'justify-start gap-3 font-medium text-base h-12',
                                    route.active && 'bg-primary/10 text-primary hover:bg-primary/20'
                                )}
                                asChild
                            >
                                <Link href={route.href}>
                                    <route.icon className="h-5 w-5 ms-2" />
                                    {route.label}
                                </Link>
                            </Button>
                        ))}
                    </nav>
                </ScrollArea>
                <div className="mt-auto p-4 border-t">
                    <div className="flex items-center gap-3 px-2">
                        <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">A</div>
                        <div className="flex flex-col text-start">
                            <span className="text-sm font-medium">المسؤول</span>
                            <span className="text-xs text-muted-foreground">admin@wasl.sa</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
