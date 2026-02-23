'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft,
  ShoppingCart,
  CheckCircle,
  XCircle,
  MapPin,
  Calendar,
  FileText,
  User,
  CreditCard,
} from 'lucide-react';
import { SaleService } from '@/services/saleService';
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
  Skeleton,
} from '@/components/ui';
import { Can } from '@/components/auth';
import { PERMISSIONS } from '@/lib/constants/permissions';
import type { Sale, SaleStatus } from '@/types';
import toast from 'react-hot-toast';

const saleStatusLabels: Record<SaleStatus, string> = {
  draft: 'Borrador',
  completed: 'Completada',
  cancelled: 'Cancelada',
  refunded: 'Reembolsada',
};

const saleStatusColors: Record<SaleStatus, 'default' | 'success' | 'destructive' | 'warning'> = {
  draft: 'default',
  completed: 'success',
  cancelled: 'destructive',
  refunded: 'warning',
};

const paymentMethodLabels: Record<string, string> = {
  cash: 'Efectivo',
  card: 'Tarjeta',
  transfer: 'Transferencia',
  mixed: 'Mixto',
  other: 'Otro',
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
  }).format(value);
};

export default function SaleDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [sale, setSale] = useState<Sale | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadSale();
    }
  }, [id]);

  const loadSale = async () => {
    try {
      setIsLoading(true);
      const data = await SaleService.getSale(id);
      setSale(data);
    } catch (error: any) {
      toast.error(error.message || 'Error al cargar venta');
      console.error('Error loading sale:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = async () => {
    if (!confirm('¿Confirmar que deseas completar esta venta?')) {
      return;
    }

    try {
      await SaleService.completeSale(id);
      toast.success('Venta completada exitosamente');
      loadSale();
    } catch (error: any) {
      toast.error(error.message || 'Error al completar venta');
    }
  };

  const handleCancel = async () => {
    const reason = prompt('Ingresa el motivo de la cancelación:');
    if (!reason) return;

    try {
      await SaleService.cancelSale(id, { reason });
      toast.success('Venta cancelada');
      loadSale();
    } catch (error: any) {
      toast.error(error.message || 'Error al cancelar venta');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!sale) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">Venta no encontrada</p>
        <Button variant="outline" onClick={() => router.push('/sales')} className="mt-4">
          Volver a Ventas
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.push('/sales')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <ShoppingCart className="h-7 w-7" />
              {sale.sale_number}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={saleStatusColors[sale.status]}>
                {saleStatusLabels[sale.status]}
              </Badge>
              <span className="text-gray-600 dark:text-gray-400">
                {new Date(sale.created_at).toLocaleDateString('es-CL')}
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          {sale.status === 'draft' && (
            <>
              <Can permission={PERMISSIONS.PRODUCTS_UPDATE}>
                <Button
                  variant="primary"
                  onClick={handleComplete}
                  leftIcon={<CheckCircle className="h-4 w-4" />}
                >
                  Completar Venta
                </Button>
              </Can>

              <Can permission={PERMISSIONS.PRODUCTS_DELETE}>
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  leftIcon={<XCircle className="h-4 w-4 text-red-600" />}
                  className="text-red-600 hover:text-red-700"
                >
                  Cancelar
                </Button>
              </Can>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Items */}
          <Card>
            <CardHeader>
              <CardTitle>Productos ({sale.items?.length || 0})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                        Producto
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                        Precio Unit.
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                        Cantidad
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                        Descuento
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sale.items?.map((item) => (
                      <tr
                        key={item.id}
                        className="border-b border-gray-100 dark:border-gray-800"
                      >
                        <td className="py-3 px-4">
                          <div className="font-medium text-gray-900 dark:text-white">
                            {item.product_name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {item.product_sku}
                          </div>
                        </td>
                        <td className="text-right py-3 px-4 text-gray-700 dark:text-gray-300">
                          {formatCurrency(item.unit_price)}
                        </td>
                        <td className="text-right py-3 px-4 text-gray-700 dark:text-gray-300">
                          {item.quantity}
                        </td>
                        <td className="text-right py-3 px-4">
                          {item.discount_percent > 0 ? (
                            <span className="text-orange-600">-{item.discount_percent}%</span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">
                          {formatCurrency(item.total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          {sale.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Notas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 dark:text-gray-300">{sale.notes}</p>
              </CardContent>
            </Card>
          )}

          {/* Cancel Reason */}
          {sale.cancel_reason && (
            <Card className="border-red-200 dark:border-red-900">
              <CardHeader>
                <CardTitle className="text-red-600">Motivo de Cancelación</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 dark:text-gray-300">{sale.cancel_reason}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Cliente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="font-medium text-gray-900 dark:text-white">
                  {sale.customer_name || 'Sin nombre'}
                </p>
                {sale.customer_rut && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    RUT: {sale.customer_rut}
                  </p>
                )}
                {sale.customer_email && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {sale.customer_email}
                  </p>
                )}
                {sale.customer_phone && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {sale.customer_phone}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Location */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Ubicación
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-medium text-gray-900 dark:text-white">
                {sale.location_name || '-'}
              </p>
            </CardContent>
          </Card>

          {/* Payment Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Método de Pago
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="font-medium text-gray-900 dark:text-white">
                {paymentMethodLabels[sale.payment_method] || sale.payment_method}
              </p>
              {sale.payment_reference && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Ref: {sale.payment_reference}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Dates */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Fechas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Creado</p>
                <p className="text-gray-900 dark:text-white">
                  {new Date(sale.created_at).toLocaleString('es-CL')}
                </p>
              </div>
              {sale.completed_at && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Completado</p>
                  <p className="text-gray-900 dark:text-white">
                    {new Date(sale.completed_at).toLocaleString('es-CL')}
                  </p>
                </div>
              )}
              {sale.cancelled_at && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Cancelado</p>
                  <p className="text-gray-900 dark:text-white">
                    {new Date(sale.cancelled_at).toLocaleString('es-CL')}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Totals */}
          <Card>
            <CardHeader>
              <CardTitle>Totales</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                <span className="text-gray-900 dark:text-white">
                  {formatCurrency(sale.subtotal)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">IVA</span>
                <span className="text-gray-900 dark:text-white">
                  {formatCurrency(sale.tax_amount)}
                </span>
              </div>
              {sale.discount_amount > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Descuento</span>
                  <span className="text-red-600">-{formatCurrency(sale.discount_amount)}</span>
                </div>
              )}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                <div className="flex justify-between text-lg font-bold">
                  <span className="text-gray-900 dark:text-white">Total</span>
                  <span className="text-gray-900 dark:text-white">
                    {formatCurrency(sale.total)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
