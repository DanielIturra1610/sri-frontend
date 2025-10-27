'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Package, Plus, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { StockService } from '@/services/stockService';
import { Button, Card, CardHeader, CardTitle, CardContent, Badge, Skeleton } from '@/components/ui';
import { Can } from '@/components/auth';
import { PERMISSIONS } from '@/lib/constants/permissions';
import { DataTable } from '@/components/ui/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import type { Stock } from '@/types';
import toast from 'react-hot-toast';

export default function StockPage() {
  const router = useRouter();
  const [stock, setStock] = useState<Stock[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showLowStock, setShowLowStock] = useState(false);

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
      toast.error(error.message || 'Error al cargar inventario');
      console.error('Error loading stock:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Get stock status
  const getStockStatus = (item: Stock): 'out' | 'low' | 'adequate' => {
    if (item.quantity === 0) return 'out';
    if (item.minimum_stock && item.quantity < item.minimum_stock) return 'low';
    return 'adequate';
  };

  // Filter stock if low stock filter is enabled
  const filteredStock = showLowStock
    ? stock.filter((item) => {
        const status = getStockStatus(item);
        return status === 'low' || status === 'out';
      })
    : stock;

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
      header: 'Cantidad',
      cell: ({ row }) => {
        const status = getStockStatus(row.original);
        return (
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-900 dark:text-white">
              {row.original.quantity}
            </span>
            {status === 'out' && (
              <XCircle className="h-4 w-4 text-red-600" />
            )}
            {status === 'low' && (
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
            )}
            {status === 'adequate' && (
              <CheckCircle className="h-4 w-4 text-green-600" />
            )}
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
      accessorKey: 'maximum_stock',
      header: 'Stock Máximo',
      cell: ({ row }) => (
        <div className="text-gray-600 dark:text-gray-400">
          {row.original.maximum_stock || '-'}
        </div>
      ),
    },
    {
      id: 'status',
      header: 'Estado',
      cell: ({ row }) => {
        const status = getStockStatus(row.original);
        return (
          <Badge
            variant={
              status === 'out'
                ? 'danger'
                : status === 'low'
                ? 'warning'
                : 'success'
            }
          >
            {status === 'out'
              ? 'Agotado'
              : status === 'low'
              ? 'Stock Bajo'
              : 'Adecuado'}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'last_movement_at',
      header: 'Último Movimiento',
      cell: ({ row }) => (
        <div className="text-gray-600 dark:text-gray-400">
          {row.original.last_movement_at
            ? new Date(row.original.last_movement_at).toLocaleDateString('es-CL')
            : '-'}
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
            <Package className="h-7 w-7" />
            Inventario
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Stock disponible por producto y ubicación
          </p>
        </div>

        <Can permission={PERMISSIONS.PRODUCTS_UPDATE}>
          <Button
            variant="primary"
            leftIcon={<Plus className="h-5 w-5" />}
            onClick={() => router.push('/stock/adjust')}
          >
            Ajustar Stock
          </Button>
        </Can>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <Button
              variant={showLowStock ? 'primary' : 'outline'}
              leftIcon={<AlertTriangle className="h-4 w-4" />}
              onClick={() => setShowLowStock(!showLowStock)}
            >
              {showLowStock ? 'Mostrar Todo' : 'Stock Bajo'}
            </Button>
            {showLowStock && (
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Mostrando {filteredStock.length} de {stock.length} productos
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Inventario</CardTitle>
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
              data={filteredStock}
              isLoading={isLoading}
              emptyMessage={
                showLowStock
                  ? 'No hay productos con stock bajo'
                  : 'No se encontraron productos en inventario'
              }
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
