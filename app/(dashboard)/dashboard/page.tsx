'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { getRoleDisplayName } from '@/lib/constants/permissions';
import {
  Package,
  ArrowRightLeft,
  Plus,
  TrendingDown,
} from 'lucide-react';
import { DashboardService } from '@/services/dashboardService';
import { StockService } from '@/services/stockService';
import { Skeleton, Select } from '@/components/ui';
import {
  MetricsCards,
  StockTrendChart,
  CategoryDistributionChart,
  LocationStockChart,
  TopProductsChart,
  AlertsPanel,
  RecentActivity,
} from '@/components/dashboard';
import type { DashboardMetrics, DashboardCharts } from '@/services/dashboardService';
import type { Stock, Transaction } from '@/types';
import toast from 'react-hot-toast';

type PeriodType = '7d' | '30d' | '90d' | '1y';

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [charts, setCharts] = useState<DashboardCharts | null>(null);
  const [stockData, setStockData] = useState<Stock[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState<PeriodType>('30d');

  // Load dashboard data
  useEffect(() => {
    loadDashboardData();
  }, [period]);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);

      // Load all data in parallel
      const [metricsData, chartsData, stock, transactions] = await Promise.all([
        DashboardService.getMetrics(),
        DashboardService.getCharts({ period }),
        StockService.getAllStock(),
        StockService.getTransactions(),
      ]);

      setMetrics(metricsData);
      setCharts(chartsData);
      setStockData(stock);
      setRecentTransactions(transactions.slice(0, 10));
    } catch (error: any) {
      toast.error(error.message || 'Error al cargar datos del dashboard');
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePeriodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPeriod(e.target.value as PeriodType);
  };

  return (
    <div className="space-y-6">
      {/* Welcome section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Bienvenido, {user?.full_name || 'Usuario'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {user?.role && `Rol: ${getRoleDisplayName(user.role)}`}
          </p>
        </div>

        {/* Period selector */}
        <div className="w-40">
          <Select value={period} onChange={handlePeriodChange}>
            <option value="7d">Últimos 7 días</option>
            <option value="30d">Últimos 30 días</option>
            <option value="90d">Últimos 90 días</option>
            <option value="1y">Último año</option>
          </Select>
        </div>
      </div>

      {/* Metrics cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      ) : metrics ? (
        <MetricsCards metrics={metrics} />
      ) : null}

      {/* Quick actions */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Acciones Rápidas
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <button
            onClick={() => router.push('/products/create')}
            className="flex items-center justify-center px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <Package className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Nuevo Producto
            </span>
          </button>
          <button
            onClick={() => router.push('/stock/adjust')}
            className="flex items-center justify-center px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <Plus className="w-5 h-5 mr-2 text-green-600 dark:text-green-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Ajustar Stock
            </span>
          </button>
          <button
            onClick={() => router.push('/transfers/create')}
            className="flex items-center justify-center px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <ArrowRightLeft className="w-5 h-5 mr-2 text-purple-600 dark:text-purple-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Nueva Transferencia
            </span>
          </button>
          <button
            onClick={() => router.push('/alerts')}
            className="flex items-center justify-center px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <TrendingDown className="w-5 h-5 mr-2 text-yellow-600 dark:text-yellow-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Ver Alertas
            </span>
          </button>
        </div>
      </div>

      {/* Charts grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-96" />
          ))}
        </div>
      ) : charts ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <StockTrendChart data={charts.stock_trend} />
          <CategoryDistributionChart data={charts.category_distribution} />
          <LocationStockChart data={charts.location_stock} />
          <TopProductsChart data={charts.top_products} />
        </div>
      ) : null}

      {/* Recent activity and alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {isLoading ? (
          <>
            <Skeleton className="h-96" />
            <Skeleton className="h-96" />
          </>
        ) : (
          <>
            <RecentActivity transactions={recentTransactions} />
            <AlertsPanel stockData={stockData} />
          </>
        )}
      </div>
    </div>
  );
}
