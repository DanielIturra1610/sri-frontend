'use client';

import React, { useState, useEffect } from 'react';
import { Download, Filter, X, FileText, Calendar, Package, MapPin, User } from 'lucide-react';
import { TransactionService } from '@/services/transactionService';
import { ProductService } from '@/services/productService';
import { LocationService } from '@/services/locationService';
import { Button, Card, CardHeader, CardTitle, CardContent, Badge, Skeleton, Input, NativeSelect as Select } from '@/components/ui';
import { DataTable } from '@/components/ui/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { transactionTypeLabels, transactionTypeColors } from '@/lib/validations/stock';
import type { Transaction, TransactionType, TransactionFilters, Product, Location } from '@/types';
import toast from 'react-hot-toast';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Filters state
  const [filters, setFilters] = useState<TransactionFilters>({
    transaction_type: undefined,
    product_id: undefined,
    location_id: undefined,
    date_from: undefined,
    date_to: undefined,
  });

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  // Load transactions when filters change
  useEffect(() => {
    loadTransactions();
  }, [filters]);

  const loadInitialData = async () => {
    try {
      const [productsResponse, locationsData] = await Promise.all([
        ProductService.getProducts({ page_size: 1000 }), // Get all products for filter
        LocationService.getLocations(), // Get all locations for filter
      ]);
      // Backend returns { items: [...], total: number, page: number, ... }
      setProducts(productsResponse.items || []);
      setLocations(locationsData || []);
    } catch (error: any) {
      console.error('Error loading initial data:', error);
    }
  };

  const loadTransactions = async () => {
    try {
      setIsLoading(true);
      const data = await TransactionService.getTransactions(filters);
      setTransactions(data);
    } catch (error: any) {
      toast.error(error.message || 'Error al cargar transacciones');
      console.error('Error loading transactions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const blob = await TransactionService.exportToExcel(filters);

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `transacciones_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Reporte exportado exitosamente');
    } catch (error: any) {
      toast.error(error.message || 'Error al exportar reporte');
      console.error('Error exporting:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleFilterChange = (key: keyof TransactionFilters, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value || undefined,
    }));
  };

  const clearFilters = () => {
    setFilters({
      transaction_type: undefined,
      product_id: undefined,
      location_id: undefined,
      date_from: undefined,
      date_to: undefined,
    });
  };

  const hasActiveFilters = Object.values(filters).some((value) => value !== undefined);

  // Table columns
  const columns: ColumnDef<Transaction>[] = [
    {
      accessorKey: 'created_at',
      header: 'Fecha',
      cell: ({ row }) => (
        <div className="text-gray-900 dark:text-white">
          <div className="font-medium">
            {new Date(row.original.created_at).toLocaleDateString('es-CL')}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {new Date(row.original.created_at).toLocaleTimeString('es-CL', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'transaction_type',
      header: 'Tipo',
      cell: ({ row }) => (
        <Badge variant={transactionTypeColors[row.original.transaction_type]}>
          {transactionTypeLabels[row.original.transaction_type] || row.original.transaction_type}
        </Badge>
      ),
    },
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
        <div className="text-gray-900 dark:text-white">
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
        const isPositive =
          row.original.transaction_type === 'purchase' ||
          row.original.transaction_type === 'transfer_in' ||
          (row.original.transaction_type === 'adjustment' && row.original.quantity > 0);

        return (
          <div
            className={`font-semibold ${
              isPositive
                ? 'text-green-600 dark:text-green-400'
                : 'text-red-600 dark:text-red-400'
            }`}
          >
            {isPositive ? '+' : '-'}
            {Math.abs(row.original.quantity)}
          </div>
        );
      },
    },
    {
      accessorKey: 'previous_quantity',
      header: 'Stock Anterior',
      cell: ({ row }) => (
        <div className="text-gray-600 dark:text-gray-400">
          {row.original.previous_quantity}
        </div>
      ),
    },
    {
      accessorKey: 'new_quantity',
      header: 'Stock Nuevo',
      cell: ({ row }) => (
        <div className="font-semibold text-gray-900 dark:text-white">
          {row.original.new_quantity}
        </div>
      ),
    },
    {
      accessorKey: 'created_by',
      header: 'Usuario',
      cell: ({ row }) => (
        <div className="text-gray-700 dark:text-gray-300 text-sm">
          {row.original.created_by}
        </div>
      ),
    },
    {
      accessorKey: 'notes',
      header: 'Notas',
      cell: ({ row }) => (
        <div className="text-gray-600 dark:text-gray-400 text-sm max-w-xs truncate">
          {row.original.notes || '-'}
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
            <FileText className="h-7 w-7" />
            Historial de Transacciones
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Auditoría completa de movimientos de inventario
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant={showFilters ? 'primary' : 'outline'}
            leftIcon={<Filter className="h-4 w-4" />}
            onClick={() => setShowFilters(!showFilters)}
          >
            Filtros
            {hasActiveFilters && (
              <Badge variant="danger" className="ml-2">
                {Object.values(filters).filter((v) => v !== undefined).length}
              </Badge>
            )}
          </Button>
          <Button
            variant="outline"
            leftIcon={<Download className="h-4 w-4" />}
            onClick={handleExport}
            isLoading={isExporting}
          >
            Exportar Excel
          </Button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filtros
              </CardTitle>
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={<X className="h-4 w-4" />}
                  onClick={clearFilters}
                >
                  Limpiar Filtros
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Transaction Type Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tipo de Transacción
                </label>
                <Select
                  value={filters.transaction_type || ''}
                  onChange={(e) =>
                    handleFilterChange(
                      'transaction_type',
                      e.target.value as TransactionType
                    )
                  }
                >
                  <option value="">Todos los tipos</option>
                  <option value="purchase">Compra</option>
                  <option value="sale">Venta</option>
                  <option value="adjustment">Ajuste Manual</option>
                  <option value="transfer_in">Transferencia Entrada</option>
                  <option value="transfer_out">Transferencia Salida</option>
                  <option value="count">Conteo Físico</option>
                </Select>
              </div>

              {/* Product Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Producto
                </label>
                <Select
                  value={filters.product_id || ''}
                  onChange={(e) => handleFilterChange('product_id', e.target.value)}
                >
                  <option value="">Todos los productos</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.sku} - {product.name}
                    </option>
                  ))}
                </Select>
              </div>

              {/* Location Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Ubicación
                </label>
                <Select
                  value={filters.location_id || ''}
                  onChange={(e) => handleFilterChange('location_id', e.target.value)}
                >
                  <option value="">Todas las ubicaciones</option>
                  {locations.map((location) => (
                    <option key={location.id} value={location.id}>
                      {location.name}
                    </option>
                  ))}
                </Select>
              </div>

              {/* Date From Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Fecha Desde
                </label>
                <Input
                  type="date"
                  value={filters.date_from || ''}
                  onChange={(e) => handleFilterChange('date_from', e.target.value)}
                />
              </div>

              {/* Date To Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Fecha Hasta
                </label>
                <Input
                  type="date"
                  value={filters.date_to || ''}
                  onChange={(e) => handleFilterChange('date_to', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Transacciones</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {transactions.length}
                </p>
              </div>
              <FileText className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Compras</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {transactions.filter((t) => t.transaction_type === 'purchase').length}
                </p>
              </div>
              <Package className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Ventas</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {transactions.filter((t) => t.transaction_type === 'sale').length}
                </p>
              </div>
              <Package className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Ajustes</p>
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {transactions.filter((t) => t.transaction_type === 'adjustment').length}
                </p>
              </div>
              <FileText className="h-8 w-8 text-orange-600 dark:text-orange-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Transacciones
            {hasActiveFilters && (
              <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
                ({transactions.length} resultados)
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
              data={transactions}
              isLoading={isLoading}
              emptyMessage="No se encontraron transacciones"
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
