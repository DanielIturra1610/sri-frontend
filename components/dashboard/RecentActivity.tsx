'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, Badge } from '@/components/ui';
import { Activity, Clock } from 'lucide-react';
import { transactionTypeLabels, transactionTypeColors } from '@/lib/validations/stock';
import type { Transaction } from '@/types';

interface RecentActivityProps {
  transactions: Transaction[];
}

export function RecentActivity({ transactions }: RecentActivityProps) {
  const router = useRouter();

  // Format date to relative time
  const formatRelativeTime = (date: string) => {
    const now = new Date();
    const transactionDate = new Date(date);
    const diffInMinutes = Math.floor((now.getTime() - transactionDate.getTime()) / 60000);

    if (diffInMinutes < 1) return 'Ahora mismo';
    if (diffInMinutes < 60) return `Hace ${diffInMinutes} minuto${diffInMinutes > 1 ? 's' : ''}`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `Hace ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `Hace ${diffInDays} día${diffInDays > 1 ? 's' : ''}`;

    return transactionDate.toLocaleDateString('es-CL', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Actividad Reciente
          </CardTitle>
          <button
            onClick={() => router.push('/transactions')}
            className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
          >
            Ver historial completo
          </button>
        </div>
      </CardHeader>
      <CardContent>
        {transactions.length > 0 ? (
          <div className="space-y-3">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <Badge variant={transactionTypeColors[transaction.transaction_type]} size="sm">
                    {transactionTypeLabels[transaction.transaction_type]}
                  </Badge>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white truncate">
                      {transaction.product_name}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                      {transaction.location_name}
                    </p>
                  </div>
                </div>
                <div className="text-right ml-4 flex-shrink-0">
                  <p
                    className={`font-semibold ${
                      transaction.quantity > 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {transaction.quantity > 0 ? '+' : ''}
                    {transaction.quantity}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatRelativeTime(transaction.created_at)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <Activity className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">No hay actividad reciente</p>
            <p className="text-sm">
              Las transacciones y movimientos de inventario aparecerán aquí
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
