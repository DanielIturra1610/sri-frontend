'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Download,
  Calendar,
  Activity,
  TrendingUp,
  TrendingDown,
  Loader2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { DataTable } from '@/components/ui/DataTable';
import { Skeleton } from '@/components/ui/Skeleton';
import { Badge, type BadgeVariant } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { StockService } from '@/services/stockService';
import type { Transaction } from '@/types';
import type { ColumnDef } from '@tanstack/react-table';
import {
  transactionTypeLabels,
  transactionTypeColors,
} from '@/lib/validations/stock';

export default function MovementsReportPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [exporting, setExporting] = useState(false);

  // Stats
  const [totalMovements, setTotalMovements] = useState(0);
  const [totalIn, setTotalIn] = useState(0);
  const [totalOut, setTotalOut] = useState(0);

  useEffect(() => {
    loadTransactions();
  }, []);

  useEffect(() => {
    filterTransactions();
  }, [transactions, startDate, endDate]);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const data = await StockService.getTransactions();

      // Sort by date descending
      data.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setTransactions(data);

      // Set default date range (last 30 days)
      const today = new Date();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(today.getDate() - 30);

      setEndDate(today.toISOString().split('T')[0]);
      setStartDate(thirtyDaysAgo.toISOString().split('T')[0]);
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterTransactions = () => {
    let filtered = [...transactions];

    // Filter by date range
    if (startDate) {
      filtered = filtered.filter(
        (t) => new Date(t.created_at) >= new Date(startDate)
      );
    }
    if (endDate) {
      const endDateTime = new Date(endDate);
      endDateTime.setHours(23, 59, 59, 999);
      filtered = filtered.filter(
        (t) => new Date(t.created_at) <= endDateTime
      );
    }

    setFilteredTransactions(filtered);
    calculateStats(filtered);
  };

  const calculateStats = (data: Transaction[]) => {
    setTotalMovements(data.length);

    const inTypes = ['purchase', 'transfer_in', 'adjustment'];
    const outTypes = ['sale', 'transfer_out'];

    const totalInQty = data
      .filter((t) => inTypes.includes(t.transaction_type))
      .reduce((sum, t) => sum + t.quantity, 0);

    const totalOutQty = data
      .filter((t) => outTypes.includes(t.transaction_type))
      .reduce((sum, t) => sum + Math.abs(t.quantity), 0);

    setTotalIn(totalInQty);
    setTotalOut(totalOutQty);
  };

  const exportToCSV = () => {
    setExporting(true);

    try {
      const headers = [
        'Fecha',
        'SKU',
        'Producto',
        'Ubicación',
        'Tipo',
        'Cantidad',
        'Stock Anterior',
        'Stock Nuevo',
        'Notas',
      ];

      const rows = filteredTransactions.map((t) => [
        new Date(t.created_at).toLocaleString('es-CL'),
        t.product_sku,
        t.product_name,
        t.location_name,
        transactionTypeLabels[t.transaction_type] || t.transaction_type,
        t.quantity,
        t.previous_quantity || '',
        t.new_quantity || '',
        t.notes || '',
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map((row) =>
          row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
        ),
        '',
        `Total Movimientos,${totalMovements}`,
        `Total Entradas,${totalIn}`,
        `Total Salidas,${totalOut}`,
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);

      link.setAttribute('href', url);
      link.setAttribute(
        'download',
        `movimientos-inventario-${new Date().toISOString().split('T')[0]}.csv`
      );
      link.style.visibility = 'hidden';

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error exporting CSV:', error);
      alert('Error al exportar el reporte');
    } finally {
      setExporting(false);
    }
  };

  const columns: ColumnDef<Transaction>[] = [
    {
      accessorKey: 'created_at',
      header: 'Fecha y Hora',
      cell: ({ row }) => (
        <div className="text-sm">
          {new Date(row.original.created_at).toLocaleString('es-CL')}
        </div>
      ),
    },
    {
      accessorKey: 'product_sku',
      header: 'Producto',
      cell: ({ row }) => (
        <div>
          <div className="font-mono text-sm">{row.original.product_sku}</div>
          <div className="text-sm">{row.original.product_name}</div>
        </div>
      ),
    },
    {
      accessorKey: 'location_name',
      header: 'Ubicación',
    },
    {
      accessorKey: 'transaction_type',
      header: 'Tipo',
      cell: ({ row }) => (
        <Badge
          variant={
            transactionTypeColors[row.original.transaction_type] as BadgeVariant
          }
        >
          {transactionTypeLabels[row.original.transaction_type] || row.original.transaction_type}
        </Badge>
      ),
    },
    {
      accessorKey: 'quantity',
      header: 'Cantidad',
      cell: ({ row }) => {
        const isPositive = ['purchase', 'transfer_in', 'adjustment'].includes(
          row.original.transaction_type
        );
        return (
          <div
            className={`flex items-center gap-1 font-medium ${
              isPositive ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {isPositive ? '+' : '-'}
            {Math.abs(row.original.quantity)}
          </div>
        );
      },
    },
    {
      id: 'stock_change',
      header: 'Cambio de Stock',
      cell: ({ row }) => {
        if (row.original.previous_quantity == null || row.original.new_quantity == null) {
          return <span className="text-gray-400">-</span>;
        }
        return (
          <div className="text-sm text-gray-600">
            {row.original.previous_quantity} → {row.original.new_quantity}
          </div>
        );
      },
    },
    {
      accessorKey: 'notes',
      header: 'Notas',
      cell: ({ row }) => (
        <div className="text-sm text-gray-600 max-w-xs truncate">
          {row.original.notes || '-'}
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Movimientos de Stock</h1>
            <p className="text-gray-600 mt-1">
              Historial de transacciones de inventario
            </p>
          </div>
        </div>
        <Button onClick={exportToCSV} disabled={exporting}>
          {exporting ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Download className="h-4 w-4 mr-2" />
          )}
          Exportar CSV
        </Button>
      </div>

      {/* Date Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros de Período</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Fecha Inicio
              </label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Fecha Fin
              </label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Movimientos
            </CardTitle>
            <Activity className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMovements}</div>
            <p className="text-xs text-gray-600 mt-1">
              En el período seleccionado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Entradas Totales
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              +{totalIn}
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Unidades ingresadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Salidas Totales
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              -{totalOut}
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Unidades salidas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Movements Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Detalle de Movimientos ({filteredTransactions.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={filteredTransactions}
            columns={columns}
            emptyMessage="No hay movimientos en el período seleccionado"
          />
        </CardContent>
      </Card>
    </div>
  );
}
