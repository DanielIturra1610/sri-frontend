'use client';

import React from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { getRoleDisplayName } from '@/lib/constants/permissions';
import {
  Package,
  Warehouse,
  TrendingUp,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

// Temporary placeholder data
const stats = [
  {
    name: 'Total Productos',
    value: '1,234',
    change: '+12%',
    changeType: 'increase',
    icon: Package,
  },
  {
    name: 'Valor Inventario',
    value: '$45,231',
    change: '+4.5%',
    changeType: 'increase',
    icon: TrendingUp,
  },
  {
    name: 'Stock Bajo',
    value: '23',
    change: '-8%',
    changeType: 'decrease',
    icon: AlertTriangle,
  },
  {
    name: 'Ubicaciones',
    value: '8',
    change: '0%',
    changeType: 'neutral',
    icon: Warehouse,
  },
];

export default function DashboardPage() {
  const { user } = useAuth();

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
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="bg-white dark:bg-gray-900 overflow-hidden rounded-lg shadow border border-gray-200 dark:border-gray-700"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                    <stat.icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      {stat.name}
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                        {stat.value}
                      </div>
                      <div
                        className={`ml-2 flex items-baseline text-sm font-semibold ${
                          stat.changeType === 'increase'
                            ? 'text-green-600 dark:text-green-400'
                            : stat.changeType === 'decrease'
                            ? 'text-red-600 dark:text-red-400'
                            : 'text-gray-500 dark:text-gray-400'
                        }`}
                      >
                        {stat.changeType === 'increase' && (
                          <ArrowUpRight className="w-4 h-4 mr-0.5" />
                        )}
                        {stat.changeType === 'decrease' && (
                          <ArrowDownRight className="w-4 h-4 mr-0.5" />
                        )}
                        {stat.change}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Acciones Rápidas
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <button className="flex items-center justify-center px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <Package className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Nuevo Producto
            </span>
          </button>
          <button className="flex items-center justify-center px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <Warehouse className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Ajustar Stock
            </span>
          </button>
          <button className="flex items-center justify-center px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <TrendingUp className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Ver Reportes
            </span>
          </button>
        </div>
      </div>

      {/* Recent activity placeholder */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Actividad Reciente
        </h2>
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <p>No hay actividad reciente</p>
          <p className="text-sm mt-2">
            Las transacciones y movimientos de inventario aparecerán aquí
          </p>
        </div>
      </div>
    </div>
  );
}
