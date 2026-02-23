'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Eye,
  CheckCircle,
  XCircle,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  Receipt,
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
import { DataTable } from '@/components/ui/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import type { Sale, SaleStatus, SaleSummary } from '@/types';
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

export default function SalesPage() {
  const router = useRouter();
  const [sales, setSales] = useState<Sale[]>([]);
  const [total, setTotal] = useState(0);
  const [summary, setSummary] = useState<SaleSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<SaleStatus | 'all'>('all');

  useEffect(() => {
    loadSales();
    loadSummary();
  }, []);

  const loadSales = async () => {
    try {
      setIsLoading(true);
      const data = await SaleService.getSales();
      setSales(data.sales);
      setTotal(data.total);
    } catch (error: any) {
      toast.error(error.message || 'Error al cargar ventas');
      console.error('Error loading sales:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSummary = async () => {
    try {
      const data = await SaleService.getSummary();
      setSummary(data);
    } catch (error: any) {
      console.error('Error loading summary:', error);
    }
  };

  const handleComplete = async (id: string) => {
    if (!confirm('¿Confirmar que deseas completar esta venta?')) {
      return;
    }

    try {
      await SaleService.completeSale(id);
      toast.success('Venta completada exitosamente');
      loadSales();
      loadSummary();
    } catch (error: any) {
      toast.error(error.message || 'Error al completar venta');
      console.error('Error completing sale:', error);
    }
  };

  const handleCancel = async (id: string) => {
    const reason = prompt('Ingresa el motivo de la cancelación:');
    if (!reason) return;

    try {
      await SaleService.cancelSale(id, { reason });
      toast.success('Venta cancelada exitosamente');
      loadSales();
      loadSummary();
    } catch (error: any) {
      toast.error(error.message || 'Error al cancelar venta');
      console.error('Error cancelling sale:', error);
    }
  };

  const filteredSales =
    statusFilter === 'all' ? sales : sales.filter((s) => s.status === statusFilter);

  const columns: ColumnDef<Sale>[] = [
    {
      accessorKey: 'sale_number',
      header: 'N° Venta',
      cell: ({ row }) => (
        <div className="font-mono font-medium text-gray-900 dark:text-white">
          {row.original.sale_number}
        </div>
      ),
    },
    {
      accessorKey: 'customer_name',
      header: 'Cliente',
      cell: ({ row }) => (
        <div className="text-gray-700 dark:text-gray-300">
          {row.original.customer_name || 'Sin nombre'}
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
      accessorKey: 'payment_method',
      header: 'Método Pago',
      cell: ({ row }) => (
        <div className="text-gray-700 dark:text-gray-300">
          {paymentMethodLabels[row.original.payment_method] || row.original.payment_method}
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Estado',
      cell: ({ row }) => (
        <Badge variant={saleStatusColors[row.original.status]}>
          {saleStatusLabels[row.original.status] || row.original.status}
        </Badge>
      ),
    },
    {
      accessorKey: 'created_at',
      header: 'Fecha',
      cell: ({ row }) => (
        <div className="text-gray-600 dark:text-gray-400">
          {new Date(row.original.created_at).toLocaleDateString('es-CL', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </div>
      ),
    },
    {
      id: 'actions',
      header: 'Acciones',
      cell: ({ row }) => {
        const sale = row.original;

        return (
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(`/sales/${sale.id}`)}
              leftIcon={<Eye className="h-4 w-4" />}
            >
              Ver
            </Button>

            {sale.status === 'draft' && (
              <>
                <Can permission={PERMISSIONS.PRODUCTS_UPDATE}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleComplete(sale.id)}
                    leftIcon={<CheckCircle className="h-4 w-4 text-green-600" />}
                    className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950"
                  >
                    Completar
                  </Button>
                </Can>

                <Can permission={PERMISSIONS.PRODUCTS_DELETE}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCancel(sale.id)}
                    leftIcon={<XCircle className="h-4 w-4 text-red-600" />}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                  >
                    Cancelar
                  </Button>
                </Can>
              </>
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
            <ShoppingCart className="h-7 w-7" />
            Ventas
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gestiona las ventas y punto de venta
          </p>
        </div>

        <Can permission={PERMISSIONS.PRODUCTS_CREATE}>
          <Button
            variant="primary"
            leftIcon={<Plus className="h-5 w-5" />}
            onClick={() => router.push('/sales/create')}
          >
            Nueva Venta
          </Button>
        </Can>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Receipt className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Ventas</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {summary?.total_sales || 0}
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
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Promedio Venta</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(summary?.average_sale || 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-lg">
                <CheckCircle className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Completadas</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {summary?.completed_sales || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Filtrar por estado:
            </span>
            <div className="flex gap-2">
              <Button
                variant={statusFilter === 'all' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('all')}
              >
                Todas ({sales.length})
              </Button>
              <Button
                variant={statusFilter === 'draft' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('draft')}
              >
                Borrador ({sales.filter((s) => s.status === 'draft').length})
              </Button>
              <Button
                variant={statusFilter === 'completed' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('completed')}
              >
                Completadas ({sales.filter((s) => s.status === 'completed').length})
              </Button>
              <Button
                variant={statusFilter === 'cancelled' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('cancelled')}
              >
                Canceladas ({sales.filter((s) => s.status === 'cancelled').length})
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Lista de Ventas
            {statusFilter !== 'all' && (
              <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
                ({filteredSales.length} resultados)
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
              data={filteredSales}
              isLoading={isLoading}
              emptyMessage={
                statusFilter === 'all'
                  ? 'No se encontraron ventas'
                  : `No hay ventas con estado "${saleStatusLabels[statusFilter]}"`
              }
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
