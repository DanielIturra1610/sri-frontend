'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { Warehouse } from 'lucide-react';
import type { LocationStockData } from '@/services/dashboardService';

interface LocationStockChartProps {
  data: LocationStockData[];
}

export function LocationStockChart({ data }: LocationStockChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Warehouse className="h-5 w-5" />
          Stock por Ubicación
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-300 dark:stroke-gray-700" />
            <XAxis
              dataKey="location"
              className="text-xs"
              stroke="currentColor"
            />
            <YAxis className="text-xs" stroke="currentColor" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: '0.5rem',
              }}
            />
            <Legend />
            <Bar
              dataKey="total_stock"
              name="Total Stock"
              fill="#3b82f6"
              radius={[8, 8, 0, 0]}
            />
            <Bar
              dataKey="products"
              name="Productos"
              fill="#10b981"
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
