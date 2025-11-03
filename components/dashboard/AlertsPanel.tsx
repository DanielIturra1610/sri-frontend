'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, Badge } from '@/components/ui';
import { AlertTriangle, XCircle, TrendingDown } from 'lucide-react';
import type { Stock } from '@/types';

interface AlertsPanelProps {
  stockData: Stock[];
}

export function AlertsPanel({ stockData }: AlertsPanelProps) {
  const router = useRouter();

  // Filter critical and low stock items
  const criticalStock = stockData.filter((item) => item.quantity === 0).slice(0, 5);
  const lowStock = stockData.filter(
    (item) => item.quantity > 0 && item.minimum_stock && item.quantity < item.minimum_stock
  ).slice(0, 5);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            Alertas de Stock
          </CardTitle>
          <button
            onClick={() => router.push('/alerts')}
            className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
          >
            Ver todas
          </button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Critical stock */}
          {criticalStock.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-red-600 dark:text-red-400 mb-2 flex items-center gap-2">
                <XCircle className="h-4 w-4" />
                Stock Crítico ({criticalStock.length})
              </h4>
              <div className="space-y-2">
                {criticalStock.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-200 dark:border-red-800"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {item.product_name}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {item.location_name}
                      </p>
                    </div>
                    <Badge variant="danger" size="sm">
                      Sin stock
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Low stock */}
          {lowStock.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-yellow-600 dark:text-yellow-400 mb-2 flex items-center gap-2">
                <TrendingDown className="h-4 w-4" />
                Stock Bajo ({lowStock.length})
              </h4>
              <div className="space-y-2">
                {lowStock.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/10 rounded-lg border border-yellow-200 dark:border-yellow-800"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {item.product_name}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {item.location_name}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-yellow-600 dark:text-yellow-400">
                        {item.quantity} / {item.minimum_stock}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">actual / mínimo</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No alerts */}
          {criticalStock.length === 0 && lowStock.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <AlertTriangle className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No hay alertas de stock</p>
              <p className="text-sm mt-1">Todos los productos tienen stock adecuado</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
