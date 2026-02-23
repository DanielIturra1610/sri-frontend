'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Eye,
  Package,
  CheckCircle,
  XCircle,
  ShoppingBag,
  DollarSign,
  Clock,
  PackageCheck,
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
import { DataTable } from '@/components/ui/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import type { Purchase, PurchaseStatus, PurchaseSummary } from '@/types';
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

export default function PurchasesPage() {
  const router = useRouter();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [total, setTotal] = useState(0);
  const [summary, setSummary] = useState<PurchaseSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<PurchaseStatus | 'all'>('all');

  useEffect(() => {
    loadPurchases();
    loadSummary();
  }, []);

  const loadPurchases = async () => {
    try {
      setIsLoading(true);
      const data = await PurchaseService.getPurchases();
      setPurchases(data.purchases);
      setTotal(data.total);
    } catch (error: any) {
      toast.error(error.message || 'Error al cargar compras');
      console.error('Error loading purchases:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSummary = async () => {
    try {
      const data = await PurchaseService.getSummary();
      setSummary(data);
    } catch (error: any) {
      console.error('Error loading summary:', error);
    }
  };

  const handleOrder = async (id: string) => {
    if (!confirm('¿Confirmar que deseas marcar esta compra como pedida?')) {
      return;
    }

    try {
      await PurchaseService.orderPurchase(id);
      toast.success('Compra marcada como pedida');
      loadPurchases();
      loadSummary();
    } catch (error: any) {
      toast.error(error.message || 'Error al actualizar compra');
      console.error('Error ordering purchase:', error);
    }
  };

  const handleCancel = async (id: string) => {
    const reason = prompt('Ingresa el motivo de la cancelación:');
    if (!reason) return;

    try {
      await PurchaseService.cancelPurchase(id, { reason });
      toast.success('Compra cancelada exitosamente');
      loadPurchases();
      loadSummary();
    } catch (error: any) {
      toast.error(error.message || 'Error al cancelar compra');
      console.error('Error cancelling purchase:', error);
    }
  };

  const filteredPurchases =
    statusFilter === 'all' ? purchases : purchases.filter((p) => p.status === statusFilter);

  const columns: ColumnDef<Purchase>[] = [
    {
      accessorKey: 'purchase_number',
      header: 'N° Compra',
      cell: ({ row }) => (
        <div className="font-mono font-medium text-gray-900 dark:text-white">
          {row.original.purchase_number}
        </div>
      ),
    },
    {
      accessorKey: 'supplier',
      header: 'Proveedor',
      cell: ({ row }) => (
        <div className="text-gray-700 dark:text-gray-300">
          {row.original.supplier?.name || '-'}
        </div>
      ),
    },
    {
      accessorKey: 'location',
      header: 'Ubicación',
      cell: ({ row }) => (
        <div className="text-gray-700 dark:text-gray-300">
          {row.original.location?.name || '-'}
        </div>
      ),
    },
    {
      accessorKey: 'items',
      header: 'Items',
      cell: ({ row }) => (
        <div className="text-gray-700 dark:text-gray-300">
          {row.original.items?.length || 0} productos
        </div>
      ),
    },
    {
      accessorKey: 'total',
      header: 'Total',
      cell: ({ row }) => (
        <div className="font-semibold text-gray-900 dark:text-white">
          {formatCurrency(row.original.total)}
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Estado',
      cell: ({ row }) => (
        <Badge variant={purchaseStatusColors[row.original.status]}>
          {purchaseStatusLabels[row.original.status] || row.original.status}
        </Badge>
      ),
    },
    {
      accessorKey: 'created_at',
      header: 'Fecha',
      cell: ({ row }) => (
        <div className="text-gray-600 dark:text-gray-400">
          {new Date(row.original.created_at).toLocaleDateString('es-CL')}
        </div>
      ),
    },
    {
      id: 'actions',
      header: 'Acciones',
      cell: ({ row }) => {
        const purchase = row.original;

        return (
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(`/purchases/${purchase.id}`)}
              leftIcon={<Eye className="h-4 w-4" />}
            >
              Ver
            </Button>

            {purchase.status === 'draft' && (
              <Can permission={PERMISSIONS.PRODUCTS_UPDATE}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleOrder(purchase.id)}
                  leftIcon={<Package className="h-4 w-4 text-blue-600" />}
                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950"
                >
                  Pedir
                </Button>
              </Can>
            )}

            {(purchase.status === 'ordered' || purchase.status === 'partial') && (
              <Can permission={PERMISSIONS.PRODUCTS_UPDATE}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push(`/purchases/${purchase.id}/receive`)}
                  leftIcon={<PackageCheck className="h-4 w-4 text-green-600" />}
                  className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950"
                >
                  Recibir
                </Button>
              </Can>
            )}

            {(purchase.status === 'draft' || purchase.status === 'ordered') && (
              <Can permission={PERMISSIONS.PRODUCTS_DELETE}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCancel(purchase.id)}
                  leftIcon={<XCircle className="h-4 w-4 text-red-600" />}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                >
                  Cancelar
                </Button>
              </Can>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <ShoppingBag className="h-7 w-7" />
            Compras
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gestiona las órdenes de compra a proveedores
          </p>
        </div>

        <Can permission={PERMISSIONS.PRODUCTS_CREATE}>
          <Button
            variant="primary"
            leftIcon={<Plus className="h-5 w-5" />}
            onClick={() => router.push('/purchases/create')}
          >
            Nueva Compra
          </Button>
        </Can>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <ShoppingBag className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Compras</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {summary?.total_purchases || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Monto Total</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(summary?.total_amount || 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-lg">
                <Clock className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Pendientes</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {summary?.pending_purchases || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <CheckCircle className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Recibidas</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {summary?.received_purchases || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Filtrar por estado:
            </span>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={statusFilter === 'all' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('all')}
              >
                Todas ({purchases.length})
              </Button>
              <Button
                variant={statusFilter === 'draft' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('draft')}
              >
                Borrador ({purchases.filter((p) => p.status === 'draft').length})
              </Button>
              <Button
                variant={statusFilter === 'ordered' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('ordered')}
              >
                Pedidas ({purchases.filter((p) => p.status === 'ordered').length})
              </Button>
              <Button
                variant={statusFilter === 'partial' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('partial')}
              >
                Parciales ({purchases.filter((p) => p.status === 'partial').length})
              </Button>
              <Button
                variant={statusFilter === 'received' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('received')}
              >
                Recibidas ({purchases.filter((p) => p.status === 'received').length})
              </Button>
              <Button
                variant={statusFilter === 'cancelled' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('cancelled')}
              >
                Canceladas ({purchases.filter((p) => p.status === 'cancelled').length})
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Lista de Compras
            {statusFilter !== 'all' && (
              <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
                ({filteredPurchases.length} resultados)
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={filteredPurchases}
              isLoading={isLoading}
              emptyMessage={
                statusFilter === 'all'
                  ? 'No se encontraron compras'
                  : `No hay compras con estado "${purchaseStatusLabels[statusFilter]}"`
              }
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
