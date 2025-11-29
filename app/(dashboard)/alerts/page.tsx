'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, XCircle, Package, TrendingDown, Plus, ArrowRightLeft } from 'lucide-react';
import { StockService } from '@/services/stockService';
import { Button, Card, CardHeader, CardTitle, CardContent, Badge, Skeleton } from '@/components/ui';
import { Can } from '@/components/auth';
import { PERMISSIONS } from '@/lib/constants/permissions';
import { DataTable } from '@/components/ui/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import type { Stock } from '@/types';
import toast from 'react-hot-toast';

type AlertLevel = 'critical' | 'low' | 'all';

interface AlertSummary {
  critical: number; // Stock = 0
  low: number;      // 0 < Stock < minimum_stock
  total: number;
}

export default function AlertsPage() {
  const router = useRouter();
  const [stock, setStock] = useState<Stock[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [alertFilter, setAlertFilter] = useState<AlertLevel>('all');

  // Load stock
  useEffect(() => {
    loadStock();
  }, []);

  const loadStock = async () => {
    try {
      setIsLoading(true);
      const data = await StockService.getAllStock();
      setStock(data);
    } catch (error: any) {
      toast.error(error.message || 'Error al cargar alertas');
      console.error('Error loading stock:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Get alert level for stock item
  const getAlertLevel = (item: Stock): 'critical' | 'low' | 'ok' => {
    if (item.quantity === 0) return 'critical';
    if (item.minimum_stock && item.quantity < item.minimum_stock) return 'low';
    return 'ok';
  };

  // Filter stock items with alerts
  const alertItems = stock.filter((item) => {
    const level = getAlertLevel(item);
    return level === 'critical' || level === 'low';
  });

  // Calculate summary
  const summary: AlertSummary = {
    critical: stock.filter((item) => getAlertLevel(item) === 'critical').length,
    low: stock.filter((item) => getAlertLevel(item) === 'low').length,
    total: alertItems.length,
  };

  // Apply filter
  const filteredAlerts = alertFilter === 'all'
    ? alertItems
    : alertItems.filter((item) => getAlertLevel(item) === alertFilter);

  // Table columns
  const columns: ColumnDef<Stock>[] = [
    {
      accessorKey: 'product_sku',
      header: 'SKU',
      cell: ({ row }) => (
        <div className="font-mono font-medium text-gray-900 dark:text-white">
          {row.original.product_sku}
        </div>
      ),
    },
    {
      accessorKey: 'product_name',
      header: 'Producto',
      cell: ({ row }) => (
        <div className="font-medium text-gray-900 dark:text-white">
          {row.original.product_name}
        </div>
      ),
    },
    {
      accessorKey: 'location_name',
      header: 'Ubicación',
      cell: ({ row }) => (
        <div className="text-gray-700 dark:text-gray-300">
          {row.original.location_name}
        </div>
      ),
    },
    {
      accessorKey: 'quantity',
      header: 'Stock Actual',
      cell: ({ row }) => {
        const level = getAlertLevel(row.original);
        return (
          <div className="flex items-center gap-2">
            <span className={`font-semibold ${
              level === 'critical' ? 'text-red-600' : 'text-yellow-600'
            }`}>
              {row.original.quantity}
            </span>
            {level === 'critical' && <XCircle className="h-4 w-4 text-red-600" />}
            {level === 'low' && <AlertTriangle className="h-4 w-4 text-yellow-600" />}
          </div>
        );
      },
    },
    {
      accessorKey: 'minimum_stock',
      header: 'Stock Mínimo',
      cell: ({ row }) => (
        <div className="text-gray-600 dark:text-gray-400">
          {row.original.minimum_stock || '-'}
        </div>
      ),
    },
    {
      id: 'deficit',
      header: 'Déficit',
      cell: ({ row }) => {
        const deficit = (row.original.minimum_stock || 0) - row.original.quantity;
        return deficit > 0 ? (
          <div className="font-semibold text-red-600">
            -{deficit}
          </div>
        ) : (
          <div className="text-gray-400">-</div>
        );
      },
    },
    {
      id: 'alert_level',
      header: 'Nivel de Alerta',
      cell: ({ row }) => {
        const level = getAlertLevel(row.original);
        return (
          <Badge variant={level === 'critical' ? 'destructive' : 'warning'}>
            {level === 'critical' ? 'Crítico' : 'Stock Bajo'}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'last_movement_at',
      header: 'Último Movimiento',
      cell: ({ row }) => (
        <div className="text-gray-600 dark:text-gray-400 text-sm">
          {row.original.last_movement_at
            ? new Date(row.original.last_movement_at).toLocaleDateString('es-CL')
            : 'Sin movimientos'}
        </div>
      ),
    },
    {
      id: 'actions',
      header: 'Acciones',
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Can permission={PERMISSIONS.PRODUCTS_UPDATE}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(`/stock/adjust?product=${row.original.product_id}&location=${row.original.location_id}`)}
              leftIcon={<Plus className="h-4 w-4 text-green-600" />}
              className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950"
            >
              Ajustar
            </Button>
          </Can>
          <Can permission={PERMISSIONS.PRODUCTS_CREATE}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(`/transfers/create?product=${row.original.product_id}`)}
              leftIcon={<ArrowRightLeft className="h-4 w-4 text-blue-600" />}
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950"
            >
              Transferir
            </Button>
          </Can>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <AlertTriangle className="h-7 w-7 text-yellow-600" />
            Alertas de Stock
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Productos con stock bajo o agotado
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total de Alertas
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {summary.total}
                </p>
              </div>
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <AlertTriangle className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Stock Crítico
                </p>
                <p className="text-3xl font-bold text-red-600 dark:text-red-400 mt-2">
                  {summary.critical}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  Sin existencias
                </p>
              </div>
              <div className="p-3 bg-red-100 dark:bg-red-900 rounded-lg">
                <XCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Stock Bajo
                </p>
                <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mt-2">
                  {summary.low}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  Por debajo del mínimo
                </p>
              </div>
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <TrendingDown className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
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
              Filtrar por nivel:
            </span>
            <div className="flex gap-2">
              <Button
                variant={alertFilter === 'all' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setAlertFilter('all')}
              >
                Todas ({summary.total})
              </Button>
              <Button
                variant={alertFilter === 'critical' ? 'danger' : 'outline'}
                size="sm"
                onClick={() => setAlertFilter('critical')}
              >
                Críticas ({summary.critical})
              </Button>
              <Button
                variant={alertFilter === 'low' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setAlertFilter('low')}
              >
                Stock Bajo ({summary.low})
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alerts Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Lista de Alertas
            {alertFilter !== 'all' && (
              <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
                ({filteredAlerts.length} resultados)
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
              data={filteredAlerts}
              isLoading={isLoading}
              emptyMessage={
                alertFilter === 'all'
                  ? '¡Excelente! No hay productos con alertas de stock'
                  : `No hay productos con nivel de alerta "${alertFilter === 'critical' ? 'crítico' : 'stock bajo'}"`
              }
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
