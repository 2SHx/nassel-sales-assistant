'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import dynamic from 'next/dynamic';

const SalesFunnelChart = dynamic(() => import('@/components/dashboard/sales-funnel').then(mod => mod.SalesFunnelChart), { ssr: false });
const ProjectPerformanceChart = dynamic(() => import('@/components/dashboard/project-performance').then(mod => mod.ProjectPerformanceChart), { ssr: false });
import { useDashboard } from "@/hooks/useDashboard";
import { DollarSign, Percent, TrendingUp, Building2, Loader2, Filter } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export default function DashboardPage() {
    const { metrics, salesFunnelData, projectPerformance, recentActivity, topProjects, loading } = useDashboard();
    const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

    const sortedProjectPerformance = useMemo(() => {
        return [...projectPerformance].sort((a, b) => {
            return sortOrder === 'desc'
                ? b.soldValue - a.soldValue
                : a.soldValue - b.soldValue;
        });
    }, [projectPerformance, sortOrder]);

    const sortedTopProjects = useMemo(() => {
        return [...topProjects].sort((a, b) => {
            return sortOrder === 'desc'
                ? b.soldValue - a.soldValue
                : a.soldValue - b.soldValue;
        });
    }, [topProjects, sortOrder]);

    if (loading) {
        return <div className="flex h-[calc(100vh-100px)] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
    }

    const kpiData = [
        {
            title: "إجمالي المبيعات",
            value: `${(metrics.totalRevenue / 1000000).toFixed(2)}M`,
            sub: "ريال سعودي",
            icon: DollarSign,
            color: "text-emerald-500",
            bg: "bg-emerald-50"
        },
        {
            title: "القيمة السوقية للمخزون",
            value: `${(metrics.inventoryValue / 1000000).toFixed(2)}M`,
            sub: "إجمالي قيمة الوحدات",
            icon: Building2,
            color: "text-blue-500",
            bg: "bg-blue-50"
        },
        {
            title: "نسبة المبيعات",
            value: `${metrics.salesRate.toFixed(1)}%`,
            sub: `${metrics.soldUnits} من ${metrics.totalUnits} وحدة`,
            icon: TrendingUp,
            color: "text-indigo-500",
            bg: "bg-indigo-50"
        },
        {
            title: "قيمة المتاح للبيع",
            value: `${(metrics.availableValue / 1000000).toFixed(2)}M`,
            sub: `${metrics.availableUnits} وحدة متاحة`,
            icon: Percent,
            color: "text-orange-500",
            bg: "bg-orange-50"
        }
    ];

    return (
        <div className="flex flex-col gap-8 pb-10 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">أداء المبيعات</h1>
                    <p className="text-muted-foreground mt-1 text-sm">نظرة شاملة على أداء المشاريع وحركة المبيعات.</p>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {kpiData.map((kpi, i) => (
                    <Card key={i} className="border-none shadow-md hover:shadow-lg transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                {kpi.title}
                            </CardTitle>
                            <div className={`p-2 rounded-full ${kpi.bg}`}>
                                <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-gray-900">{kpi.value}</div>
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                {kpi.sub}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>


            <div className="flex items-center justify-end">
                <Select value={sortOrder} onValueChange={(val: 'asc' | 'desc') => setSortOrder(val)}>
                    <SelectTrigger className="w-[180px] bg-white shadow-sm">
                        <Filter className="h-4 w-4 me-2 text-muted-foreground" />
                        <SelectValue placeholder="ترتيب حسب" />
                    </SelectTrigger>
                    <SelectContent align="end">
                        <SelectItem value="desc">الأكثر مبيعاً</SelectItem>
                        <SelectItem value="asc">الأقل مبيعاً</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="grid gap-6 md:grid-cols-7">
                {/* Project Performance Chart */}
                <Card className="md:col-span-4 border-none shadow-md">
                    <CardHeader>
                        <CardTitle className="text-lg">أداء المشاريع (القيمة الإجمالية vs المبيعات)</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-0">
                        <ProjectPerformanceChart data={sortedProjectPerformance} />
                    </CardContent>
                </Card>

                {/* Sales Funnel */}
                <Card className="md:col-span-3 border-none shadow-md">
                    <CardHeader>
                        <CardTitle className="text-lg">تحليل حالة الوحدات</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <SalesFunnelChart data={salesFunnelData} />
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-7">
                {/* Top Projects List */}
                <Card className="md:col-span-4 border-none shadow-md">
                    <CardHeader>
                        <CardTitle className="text-lg">
                            {sortOrder === 'desc' ? 'أعلى المشاريع مبيعاً' : 'أقل المشاريع مبيعاً'}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-right">
                                <thead className="bg-muted/50 text-xs text-muted-foreground uppercase">
                                    <tr>
                                        <th className="px-6 py-3 font-medium">المشروع</th>
                                        <th className="px-6 py-3 font-medium">المبيعات</th>
                                        <th className="px-6 py-3 font-medium">عدد المباع</th>
                                        <th className="px-6 py-3 font-medium">نسبة الإنجاز</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {sortedProjectPerformance.slice(0, 5).map((p: any, i) => (
                                        <tr key={i} className="hover:bg-muted/5">
                                            <td className="px-6 py-4 font-bold text-gray-900">{p.name}</td>
                                            <td className="px-6 py-4 font-mono text-emerald-600 font-medium">
                                                {(p.soldValue / 1000000).toFixed(2)}M
                                            </td>
                                            <td className="px-6 py-4">{p.soldUnits}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-mono text-xs">{p.salesRate.toFixed(1)}%</span>
                                                    <div className="h-1.5 w-16 bg-gray-100 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-emerald-500 rounded-full"
                                                            style={{ width: `${p.salesRate}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <div className="p-4 text-xs text-muted-foreground text-center">
                                * يتم ترتيب المشاريع بناءً على القيمة الإجمالية للمبيعات
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card className="md:col-span-3 border-none shadow-md">
                    <CardHeader>
                        <CardTitle className="text-lg">آخر التحديثات</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <RecentActivity activities={recentActivity} />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
