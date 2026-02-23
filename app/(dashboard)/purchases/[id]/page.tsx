'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft,
  ShoppingBag,
  Package,
  PackageCheck,
  XCircle,
  Building2,
  MapPin,
  Calendar,
  FileText,
} from 'lucide-react';
import { PurchaseService } from '@/services/purchaseService';
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
import type { Purchase, PurchaseStatus } from '@/types';
import toast from 'react-hot-toast';

const purchaseStatusLabels: Record<PurchaseStatus, string> = {
  draft: 'Borrador',
  ordered: 'Pedido',
  partial: 'Parcial',
  received: 'Recibido',
  cancelled: 'Cancelado',
};

const purchaseStatusColors: Record<PurchaseStatus, 'default' | 'success' | 'destructive' | 'warning'> = {
  draft: 'default',
  ordered: 'warning',
  partial: 'warning',
  received: 'success',
  cancelled: 'destructive',
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
  }).format(value);
};

export default function PurchaseDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [purchase, setPurchase] = useState<Purchase | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadPurchase();
    }
  }, [id]);

  const loadPurchase = async () => {
    try {
      setIsLoading(true);
      const data = await PurchaseService.getPurchase(id);
      setPurchase(data);
    } catch (error: any) {
      toast.error(error.message || 'Error al cargar compra');
      console.error('Error loading purchase:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOrder = async () => {
    if (!confirm('¿Confirmar que deseas marcar esta compra como pedida?')) {
      return;
    }

    try {
      await PurchaseService.orderPurchase(id);
      toast.success('Compra marcada como pedida');
      loadPurchase();
    } catch (error: any) {
      toast.error(error.message || 'Error al actualizar compra');
    }
  };

  const handleCancel = async () => {
    const reason = prompt('Ingresa el motivo de la cancelación:');
    if (!reason) return;

    try {
      await PurchaseService.cancelPurchase(id, { reason });
      toast.success('Compra cancelada');
      loadPurchase();
    } catch (error: any) {
      toast.error(error.message || 'Error al cancelar compra');
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

  if (!purchase) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">Compra no encontrada</p>
        <Button variant="outline" onClick={() => router.push('/purchases')} className="mt-4">
          Volver a Compras
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.push('/purchases')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <ShoppingBag className="h-7 w-7" />
              {purchase.purchase_number}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={purchaseStatusColors[purchase.status]}>
                {purchaseStatusLabels[purchase.status]}
              </Badge>
              <span className="text-gray-600 dark:text-gray-400">
                {new Date(purchase.created_at).toLocaleDateString('es-CL')}
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          {purchase.status === 'draft' && (
            <Can permission={PERMISSIONS.PRODUCTS_UPDATE}>
              <Button
                variant="outline"
                onClick={handleOrder}
                leftIcon={<Package className="h-4 w-4" />}
              >
                Marcar como Pedido
              </Button>
            </Can>
          )}

          {(purchase.status === 'ordered' || purchase.status === 'partial') && (
            <Can permission={PERMISSIONS.PRODUCTS_UPDATE}>
              <Button
                variant="primary"
                onClick={() => router.push(`/purchases/${id}/receive`)}
                leftIcon={<PackageCheck className="h-4 w-4" />}
              >
                Recibir Mercadería
              </Button>
            </Can>
          )}

          {(purchase.status === 'draft' || purchase.status === 'ordered') && (
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
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Items */}
          <Card>
            <CardHeader>
              <CardTitle>Productos ({purchase.items?.length || 0})</CardTitle>
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
                        Costo Unit.
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                        Cantidad
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                        Recibido
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {purchase.items?.map((item) => (
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
                          {formatCurrency(item.unit_cost)}
                        </td>
                        <td className="text-right py-3 px-4 text-gray-700 dark:text-gray-300">
                          {item.quantity}
                        </td>
                        <td className="text-right py-3 px-4">
                          <span
                            className={
                              item.received_quantity >= item.quantity
                                ? 'text-green-600'
                                : item.received_quantity > 0
                                ? 'text-orange-600'
                                : 'text-gray-500'
                            }
                          >
                            {item.received_quantity} / {item.quantity}
                          </span>
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
          {purchase.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Notas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 dark:text-gray-300">{purchase.notes}</p>
              </CardContent>
            </Card>
          )}

          {/* Cancel Reason */}
          {purchase.cancel_reason && (
            <Card className="border-red-200 dark:border-red-900">
              <CardHeader>
                <CardTitle className="text-red-600">Motivo de Cancelación</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 dark:text-gray-300">{purchase.cancel_reason}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Supplier Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Proveedor
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="font-medium text-gray-900 dark:text-white">
                  {purchase.supplier?.name || '-'}
                </p>
                {purchase.supplier?.rut && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    RUT: {purchase.supplier.rut}
                  </p>
                )}
                {purchase.supplier?.contact_email && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {purchase.supplier.contact_email}
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
                Ubicación de Destino
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-medium text-gray-900 dark:text-white">
                {purchase.location?.name || '-'}
              </p>
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
                  {new Date(purchase.created_at).toLocaleString('es-CL')}
                </p>
              </div>
              {purchase.ordered_at && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Pedido</p>
                  <p className="text-gray-900 dark:text-white">
                    {new Date(purchase.ordered_at).toLocaleString('es-CL')}
                  </p>
                </div>
              )}
              {purchase.received_at && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Recibido</p>
                  <p className="text-gray-900 dark:text-white">
                    {new Date(purchase.received_at).toLocaleString('es-CL')}
                  </p>
                </div>
              )}
              {purchase.expected_date && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Fecha Esperada</p>
                  <p className="text-gray-900 dark:text-white">
                    {new Date(purchase.expected_date).toLocaleDateString('es-CL')}
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
                  {formatCurrency(purchase.subtotal)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">IVA</span>
                <span className="text-gray-900 dark:text-white">
                  {formatCurrency(purchase.tax_amount)}
                </span>
              </div>
              {purchase.discount_amount > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Descuento</span>
                  <span className="text-red-600">-{formatCurrency(purchase.discount_amount)}</span>
                </div>
              )}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                <div className="flex justify-between text-lg font-bold">
                  <span className="text-gray-900 dark:text-white">Total</span>
                  <span className="text-gray-900 dark:text-white">
                    {formatCurrency(purchase.total)}
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
