'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
export interface ProjectPerformance {
    name: string;
    totalValue: number;
    soldValue: number;
    soldUnits: number;
    salesRate: number;
}

export interface DashboardMetrics {
    totalRevenue: number;
    inventoryValue: number; // Changed from averageDealValue or added
    salesRate: number;
    availableValue: number; // New
    availableUnits: number;
    soldUnits: number;
    reservedUnits: number;
    totalUnits: number;
}

export interface ActivityItem {
    id: string;
    type: 'sold' | 'reserved' | 'new';
    description: string;
    timestamp: string;
    amount?: number;
    projectName?: string;
}

export function useDashboard() {
    const [metrics, setMetrics] = useState<DashboardMetrics>({
        totalRevenue: 0,
        inventoryValue: 0,
        salesRate: 0,
        availableValue: 0,
        availableUnits: 0,
        soldUnits: 0,
        reservedUnits: 0,
        totalUnits: 0
    });
    const [salesFunnelData, setSalesFunnelData] = useState<any[]>([]);
    const [projectPerformance, setProjectPerformance] = useState<ProjectPerformance[]>([]);
    const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
    const [topProjects, setTopProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchDashboardData() {
            setLoading(true);

            // Fetch Units
            const { data: units, error } = await supabase
                .from('units')
                .select(`
                    id, 
                    unit_status, 
                    total_price, 
                    unit_type, 
                    project_id, 
                    created_at,
                    projects (project_name)
                `)
                .order('created_at', { ascending: false });

            if (error || !units) {
                console.error('Error fetching dashboard data:', error);
                setLoading(false);
                return;
            }

            // Normalize Data
            const normalizedUnits = units.map((u: any) => {
                const status = u.unit_status || '';
                let statusKey = 'Other';
                if (status === 'متاح' || status === 'متاحة' || status === 'Available') statusKey = 'Available';
                else if (status === 'مباع' || status === 'مباعة' || status === 'Sold') statusKey = 'Sold';
                else if (status === 'محجوز' || status === 'محجوزة' || status === 'Reserved') statusKey = 'Reserved';

                return {
                    ...u,
                    price: Number(u.total_price) || 0,
                    statusKey,
                    projectName: u.projects?.project_name || 'Unknown',
                    updated_at: u.created_at
                };
            });

            // --- 1. Basic Counts & Values ---
            const totalUnits = normalizedUnits.length;
            const availableUnits = normalizedUnits.filter((u: any) => u.statusKey === 'Available');
            const soldUnits = normalizedUnits.filter((u: any) => u.statusKey === 'Sold');
            const reservedUnits = normalizedUnits.filter((u: any) => u.statusKey === 'Reserved');

            const totalRevenue = soldUnits.reduce((sum: number, u: any) => sum + u.price, 0);
            const inventoryValue = normalizedUnits.reduce((sum: number, u: any) => sum + u.price, 0);
            const availableValue = availableUnits.reduce((sum: number, u: any) => sum + u.price, 0);

            setMetrics({
                totalRevenue,
                inventoryValue,
                salesRate: totalUnits > 0 ? (soldUnits.length / totalUnits) * 100 : 0,
                availableValue,
                availableUnits: availableUnits.length,
                soldUnits: soldUnits.length,
                reservedUnits: reservedUnits.length,
                totalUnits
            });

            // --- 2. Sales Funnel Chart ---
            setSalesFunnelData([
                { name: 'الوحدات المتاحة', value: availableUnits.length, color: '#8B5CF6' },
                { name: 'محجوز', value: reservedUnits.length, color: '#F59E0B' },
                { name: 'تم البيع', value: soldUnits.length, color: '#10B981' },
            ]);

            // --- 3. Project Performance Chart ---
            // Group by Project
            const projectGroups: Record<string, { total: number, sold: number, soldCount: number, name: string }> = {};

            normalizedUnits.forEach((u: any) => {
                const pid = u.project_id || 'unknown';
                if (!projectGroups[pid]) {
                    projectGroups[pid] = { total: 0, sold: 0, soldCount: 0, name: u.projectName };
                }
                projectGroups[pid].total += u.price;
                if (u.statusKey === 'Sold') {
                    projectGroups[pid].sold += u.price;
                    projectGroups[pid].soldCount += 1;
                }
            });

            const performanceData: ProjectPerformance[] = Object.values(projectGroups).map(g => ({
                name: g.name,
                totalValue: g.total,
                soldValue: g.sold,
                soldUnits: g.soldCount,
                salesRate: g.total > 0 ? (g.sold / g.total) * 100 : 0
            })).sort((a, b) => b.totalValue - a.totalValue); // Sort by total value desc

            setProjectPerformance(performanceData);
            setTopProjects(performanceData.slice(0, 5)); // Keep top 5 for list

            // --- 4. Recent Activity ---
            const activity: ActivityItem[] = normalizedUnits
                .slice(0, 5)
                .map((u: any) => ({
                    id: u.id,
                    type: u.statusKey === 'Sold' ? 'sold' : (u.statusKey === 'Reserved' ? 'reserved' : 'new'),
                    description: `${u.unit_type}`,
                    projectName: u.projectName,
                    timestamp: u.updated_at || new Date().toISOString(),
                    amount: u.price
                }));
            setRecentActivity(activity);

            setLoading(false);
        }

        fetchDashboardData();
    }, []);

    return { metrics, salesFunnelData, projectPerformance, recentActivity, topProjects, loading };
}
