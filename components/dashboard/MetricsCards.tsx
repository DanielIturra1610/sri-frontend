'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  Package,
  Warehouse,
  Layers,
  Users,
  AlertTriangle,
  XCircle,
  TrendingDown,
  ArrowRightLeft,
  Bell,
  DollarSign,
  Activity,
  TrendingUp,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui';
import type { DashboardMetrics } from '@/services/dashboardService';

interface MetricsCardsProps {
  metrics: DashboardMetrics;
}

export function MetricsCards({ metrics }: MetricsCardsProps) {
  const router = useRouter();

  const metricsConfig = [
    {
      title: 'Total Productos',
      value: metrics.total_products,
      icon: Package,
      color: 'blue',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20',
      textColor: 'text-blue-600 dark:text-blue-400',
      link: '/products',
    },
    {
      title: 'Ubicaciones',
      value: metrics.total_locations,
      icon: Warehouse,
      color: 'green',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
      textColor: 'text-green-600 dark:text-green-400',
      link: '/locations',
    },
    {
      title: 'Categorías',
      value: metrics.total_categories,
      icon: Layers,
      color: 'purple',
      bgColor: 'bg-purple-100 dark:bg-purple-900/20',
      textColor: 'text-purple-600 dark:text-purple-400',
      link: '/categories',
    },
    {
      title: 'Usuarios',
      value: metrics.total_users,
      icon: Users,
      color: 'indigo',
      bgColor: 'bg-indigo-100 dark:bg-indigo-900/20',
      textColor: 'text-indigo-600 dark:text-indigo-400',
      link: '/users',
    },
    {
      title: 'Stock Crítico',
      value: metrics.critical_stock,
      icon: XCircle,
      color: 'red',
      bgColor: 'bg-red-100 dark:bg-red-900/20',
      textColor: 'text-red-600 dark:text-red-400',
      link: '/alerts',
      subtitle: 'sin existencias',
    },
    {
      title: 'Stock Bajo',
      value: metrics.low_stock,
      icon: AlertTriangle,
      color: 'yellow',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/20',
      textColor: 'text-yellow-600 dark:text-yellow-400',
      link: '/alerts',
      subtitle: 'por debajo del mínimo',
    },
    {
      title: 'Transferencias Pendientes',
      value: metrics.pending_transfers,
      icon: ArrowRightLeft,
      color: 'orange',
      bgColor: 'bg-orange-100 dark:bg-orange-900/20',
      textColor: 'text-orange-600 dark:text-orange-400',
      link: '/transfers',
    },
    {
      title: 'Notificaciones',
      value: metrics.unread_notifications,
      icon: Bell,
      color: 'pink',
      bgColor: 'bg-pink-100 dark:bg-pink-900/20',
      textColor: 'text-pink-600 dark:text-pink-400',
      link: '/notifications',
      subtitle: 'sin leer',
    },
  ];

  const summaryMetrics = [
    {
      title: 'Valor Total Inventario',
      value: `$${metrics.total_stock_value.toLocaleString('es-CL')}`,
      icon: DollarSign,
      color: 'emerald',
      bgColor: 'bg-emerald-100 dark:bg-emerald-900/20',
      textColor: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      title: 'Movimientos Hoy',
      value: metrics.stock_movements_today,
      icon: Activity,
      color: 'cyan',
      bgColor: 'bg-cyan-100 dark:bg-cyan-900/20',
      textColor: 'text-cyan-600 dark:text-cyan-400',
    },
    {
      title: 'Movimientos Esta Semana',
      value: metrics.stock_movements_week,
      icon: TrendingUp,
      color: 'teal',
      bgColor: 'bg-teal-100 dark:bg-teal-900/20',
      textColor: 'text-teal-600 dark:text-teal-400',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Main metrics grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metricsConfig.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card
              key={metric.title}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => metric.link && router.push(metric.link)}
            >
              <CardContent className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className={`w-12 h-12 ${metric.bgColor} rounded-lg flex items-center justify-center`}>
                      <Icon className={`w-6 h-6 ${metric.textColor}`} />
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                        {metric.title}
                      </dt>
                      <dd className="flex items-baseline">
                        <div className={`text-2xl font-semibold ${metric.subtitle ? metric.textColor : 'text-gray-900 dark:text-white'}`}>
                          {metric.value}
                        </div>
                        {metric.subtitle && (
                          <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                            {metric.subtitle}
                          </span>
                        )}
                      </dd>
                    </dl>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Summary metrics */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {summaryMetrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.title}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      {metric.title}
                    </p>
                    <p className={`text-3xl font-bold mt-2 ${metric.textColor}`}>
                      {metric.value}
                    </p>
                  </div>
                  <div className={`w-14 h-14 ${metric.bgColor} rounded-full flex items-center justify-center`}>
                    <Icon className={`w-7 h-7 ${metric.textColor}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
