'use client';

import { Receipt } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
  type PaymentHistory,
  type PaymentStatus,
  formatCurrency,
  getPaymentStatusLabel,
} from '@/types/billing';

interface InvoiceHistoryProps {
  invoices: PaymentHistory[];
}

const statusColors: Record<PaymentStatus, 'success' | 'warning' | 'destructive' | 'muted'> = {
  succeeded: 'success',
  pending: 'warning',
  failed: 'destructive',
  refunded: 'muted',
  canceled: 'muted',
};

export function InvoiceHistory({ invoices }: InvoiceHistoryProps) {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-CL', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Receipt className="h-5 w-5" />
          Historial de Pagos
        </CardTitle>
      </CardHeader>
      <CardContent>
        {invoices.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                    Fecha
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                    Descripción
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                    Monto
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                    Estado
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                    Referencia
                  </th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => (
                  <tr
                    key={invoice.id}
                    className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  >
                    <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">
                      {formatDate(invoice.created_at)}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                      {invoice.description || 'Pago de suscripción'}
                    </td>
                    <td className="py-3 px-4 text-sm font-medium text-gray-900 dark:text-white">
                      {formatCurrency(invoice.amount, invoice.currency)}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={statusColors[invoice.status]} size="sm">
                        {getPaymentStatusLabel(invoice.status)}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {invoice.flow_order_id ? (
                        <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                          #{invoice.flow_order_id}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <Receipt className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No hay facturas disponibles</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
