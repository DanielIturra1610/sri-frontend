'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { getRoleDisplayName } from '@/lib/constants/permissions';
import {
  Package,
  Warehouse,
  AlertTriangle,
  ArrowRightLeft,
  Plus,
  XCircle,
  TrendingDown,
} from 'lucide-react';
import { ProductService } from '@/services/productService';
import { LocationService } from '@/services/locationService';
import { StockService } from '@/services/stockService';
import { Skeleton, Badge } from '@/components/ui';
import { transactionTypeLabels, transactionTypeColors } from '@/lib/validations/stock';
import type { Stock, Transaction } from '@/types';

interface DashboardStats {
  totalProducts: number;
  totalLocations: number;
  criticalAlerts: number;
  lowStockAlerts: number;
  totalAlerts: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load dashboard data
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);

      // Load all data in parallel
      const [productsResponse, locations, stock, transactions] = await Promise.all([
        ProductService.getProducts(),
        LocationService.getLocations(),
        StockService.getAllStock(),
        StockService.getTransactions(),
      ]);

      // Calculate alerts
      const criticalAlerts = stock.filter((item: Stock) => item.quantity === 0).length;
      const lowStockAlerts = stock.filter(
        (item: Stock) => item.quantity > 0 && item.minimum_stock && item.quantity < item.minimum_stock
      ).length;

      setStats({
        totalProducts: productsResponse.data.total || 0,
        totalLocations: locations.length,
        criticalAlerts,
        lowStockAlerts,
        totalAlerts: criticalAlerts + lowStockAlerts,
      });

      // Get last 5 transactions
      setRecentTransactions(transactions.slice(0, 5));
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {/* Welcome section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Bienvenido, {user?.full_name || 'Usuario'}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {user?.role && `Rol: ${getRoleDisplayName(user.role)}`}
        </p>
      </div>

      {/* Stats grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      ) : stats ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {/* Total Products */}
          <div
            className="bg-white dark:bg-gray-900 overflow-hidden rounded-lg shadow border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => router.push('/products')}
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                    <Package className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      Total Productos
                    </dt>
                    <dd className="text-2xl font-semibold text-gray-900 dark:text-white">
                      {stats.totalProducts}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* Locations */}
          <div
            className="bg-white dark:bg-gray-900 overflow-hidden rounded-lg shadow border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => router.push('/locations')}
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                    <Warehouse className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      Ubicaciones
                    </dt>
                    <dd className="text-2xl font-semibold text-gray-900 dark:text-white">
                      {stats.totalLocations}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* Critical Alerts */}
          <div
            className="bg-white dark:bg-gray-900 overflow-hidden rounded-lg shadow border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => router.push('/alerts')}
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
                    <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      Stock Crítico
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-red-600 dark:text-red-400">
                        {stats.criticalAlerts}
                      </div>
                      <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                        sin existencias
                      </span>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* Low Stock Alerts */}
          <div
            className="bg-white dark:bg-gray-900 overflow-hidden rounded-lg shadow border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => router.push('/alerts')}
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      Stock Bajo
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-yellow-600 dark:text-yellow-400">
                        {stats.lowStockAlerts}
                      </div>
                      <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                        por debajo del mínimo
                      </span>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Quick actions */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6 mb-8">
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

      {/* Recent activity */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Actividad Reciente
        </h2>
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-16" />
            ))}
          </div>
        ) : recentTransactions.length > 0 ? (
          <div className="space-y-3">
            {recentTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <Badge variant={transactionTypeColors[transaction.transaction_type]}>
                    {transactionTypeLabels[transaction.transaction_type]}
                  </Badge>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {transaction.product_name}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {transaction.location_name}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${
                    transaction.quantity > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.quantity > 0 ? '+' : ''}{transaction.quantity}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(transaction.created_at).toLocaleDateString('es-CL')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <p>No hay actividad reciente</p>
            <p className="text-sm mt-2">
              Las transacciones y movimientos de inventario aparecerán aquí
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
