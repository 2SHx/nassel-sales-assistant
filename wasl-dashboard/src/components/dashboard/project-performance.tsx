'use client';

import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

interface ProjectPerformanceProps {
    data: {
        name: string;
        totalValue: number;
        soldValue: number;
        salesRate: number;
    }[];
}

export function ProjectPerformanceChart({ data }: ProjectPerformanceProps) {
    if (!data || data.length === 0) {
        return <div className="h-[300px] w-full flex items-center justify-center text-muted-foreground">لا توجد بيانات</div>;
    }

    // Prepare data for Recharts (limit to top 8 projects for readability)
    const chartData = data.slice(0, 8);

    const formatCurrency = (value: number) => {
        if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
        if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
        return value.toString();
    };

    return (
        <div className="h-[350px] w-full" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={chartData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis
                        dataKey="name"
                        tick={{ fontSize: 11, fill: '#6B7280' }}
                        interval={0}
                        angle={-15}
                        textAnchor="end"
                        height={60}
                    />
                    <YAxis
                        tickFormatter={formatCurrency}
                        tick={{ fontSize: 11, fill: '#6B7280' }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <Tooltip
                        cursor={{ fill: '#F3F4F6' }}
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        formatter={(value: any) => [`${Number(value).toLocaleString()} ر.س`, '']}
                        labelStyle={{ textAlign: 'right', fontWeight: 'bold', marginBottom: '8px' }}
                    />
                    <Legend wrapperStyle={{ paddingTop: '10px' }} />
                    <Bar
                        dataKey="totalValue"
                        name="إجمالي القيمة"
                        fill="#E5E7EB"
                        radius={[4, 4, 0, 0]}
                        barSize={20}
                    />
                    <Bar
                        dataKey="soldValue"
                        name="المبيعات المحققة"
                        fill="#10B981"
                        radius={[4, 4, 0, 0]}
                        barSize={20}
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
