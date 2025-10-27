'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Download,
  TrendingUp,
  TrendingDown,
  Activity,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { DataTable } from '@/components/ui/DataTable';
import { Skeleton } from '@/components/ui/Skeleton';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { StockService } from '@/services/stockService';
import { ProductService } from '@/services/productService';
import type { Transaction, Product } from '@/types';
import type { ColumnDef } from '@tanstack/react-table';

interface RotationItem {
  productId: string;
  sku: string;
  productName: string;
  categoryName: string;
  currentStock: number;
  totalMovements: number;
  totalIn: number;
  totalOut: number;
  netChange: number;
  lastMovementDate: string | null;
  daysSinceLastMovement: number | null;
  rotationStatus: 'high' | 'medium' | 'low' | 'stale';
}

export default function RotationReportPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [rotationData, setRotationData] = useState<RotationItem[]>([]);
  const [filteredData, setFilteredData] = useState<RotationItem[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [days, setDays] = useState(30);
  const [exporting, setExporting] = useState(false);

  // Stats
  const [highRotation, setHighRotation] = useState(0);
  const [mediumRotation, setMediumRotation] = useState(0);
  const [lowRotation, setLowRotation] = useState(0);
  const [staleProducts, setStaleProducts] = useState(0);

  useEffect(() => {
    loadRotationData();
  }, [days]);

  useEffect(() => {
    filterData();
  }, [rotationData, filterStatus]);

  const loadRotationData = async () => {
    try {
      setLoading(true);

      const [transactions, productsResponse, stock] = await Promise.all([
        StockService.getTransactions(),
        ProductService.getProducts(),
        StockService.getAllStock(),
      ]);

      const products = productsResponse.data.items;

      // Filter transactions by date range
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      const recentTransactions = transactions.filter(
        (t) => new Date(t.created_at) >= cutoffDate
      );

      // Group by product
      const rotationMap = new Map<string, RotationItem>();

      products.forEach((product) => {
        const productTransactions = recentTransactions.filter(
          (t) => t.product_id === product.id
        );

        const productStock = stock.filter((s) => s.product_id === product.id);
        const currentStock = productStock.reduce(
          (sum, s) => sum + s.quantity,
          0
        );

        const totalIn = productTransactions
          .filter((t) =>
            ['purchase', 'transfer_in', 'adjustment'].includes(
              t.transaction_type
            )
          )
          .reduce((sum, t) => sum + t.quantity, 0);

        const totalOut = productTransactions
          .filter((t) =>
            ['sale', 'transfer_out'].includes(t.transaction_type)
          )
          .reduce((sum, t) => sum + Math.abs(t.quantity), 0);

        const lastTransaction = productTransactions.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )[0];

        const lastMovementDate = lastTransaction
          ? lastTransaction.created_at
          : null;

        const daysSinceLastMovement = lastMovementDate
          ? Math.floor(
              (new Date().getTime() - new Date(lastMovementDate).getTime()) /
                (1000 * 60 * 60 * 24)
            )
          : null;

        // Determine rotation status
        let rotationStatus: 'high' | 'medium' | 'low' | 'stale' = 'stale';
        const totalMovements = productTransactions.length;

        if (totalMovements === 0 || daysSinceLastMovement === null) {
          rotationStatus = 'stale';
        } else if (daysSinceLastMovement <= 7 && totalMovements >= 5) {
          rotationStatus = 'high';
        } else if (daysSinceLastMovement <= 15 && totalMovements >= 2) {
          rotationStatus = 'medium';
        } else if (daysSinceLastMovement <= 30) {
          rotationStatus = 'low';
        } else {
          rotationStatus = 'stale';
        }

        rotationMap.set(product.id, {
          productId: product.id,
          sku: product.sku,
          productName: product.name,
          categoryName: product.category_name || 'Sin categoría',
          currentStock,
          totalMovements,
          totalIn,
          totalOut,
          netChange: totalIn - totalOut,
          lastMovementDate,
          daysSinceLastMovement,
          rotationStatus,
        });
      });

      const rotationArray = Array.from(rotationMap.values());

      // Sort by total movements descending
      rotationArray.sort((a, b) => b.totalMovements - a.totalMovements);

      setRotationData(rotationArray);
      calculateStats(rotationArray);
    } catch (error) {
      console.error('Error loading rotation data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterData = () => {
    let filtered = [...rotationData];

    if (filterStatus !== 'all') {
      filtered = filtered.filter((item) => item.rotationStatus === filterStatus);
    }

    setFilteredData(filtered);
  };

  const calculateStats = (data: RotationItem[]) => {
    setHighRotation(data.filter((d) => d.rotationStatus === 'high').length);
    setMediumRotation(data.filter((d) => d.rotationStatus === 'medium').length);
    setLowRotation(data.filter((d) => d.rotationStatus === 'low').length);
    setStaleProducts(data.filter((d) => d.rotationStatus === 'stale').length);
  };

  const exportToCSV = () => {
    setExporting(true);

    try {
      const headers = [
        'SKU',
        'Producto',
        'Categoría',
        'Stock Actual',
        'Movimientos',
        'Entradas',
        'Salidas',
        'Cambio Neto',
        'Último Movimiento',
        'Días Sin Movimiento',
        'Estado Rotación',
      ];

      const statusLabels = {
        high: 'Alta',
        medium: 'Media',
        low: 'Baja',
        stale: 'Sin Movimiento',
      };

      const rows = filteredData.map((item) => [
        item.sku,
        item.productName,
        item.categoryName,
        item.currentStock,
        item.totalMovements,
        item.totalIn,
        item.totalOut,
        item.netChange,
        item.lastMovementDate
          ? new Date(item.lastMovementDate).toLocaleDateString('es-CL')
          : 'N/A',
        item.daysSinceLastMovement ?? 'N/A',
        statusLabels[item.rotationStatus],
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map((row) =>
          row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
        ),
        '',
        `Período de Análisis,${days} días`,
        `Alta Rotación,${highRotation}`,
        `Rotación Media,${mediumRotation}`,
        `Baja Rotación,${lowRotation}`,
        `Sin Movimiento,${staleProducts}`,
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);

      link.setAttribute('href', url);
      link.setAttribute(
        'download',
        `rotacion-productos-${new Date().toISOString().split('T')[0]}.csv`
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

  const getRotationBadge = (status: string) => {
    const badges = {
      high: { label: 'Alta Rotación', variant: 'success' as const },
      medium: { label: 'Rotación Media', variant: 'info' as const },
      low: { label: 'Baja Rotación', variant: 'warning' as const },
      stale: { label: 'Sin Movimiento', variant: 'danger' as const },
    };

    return badges[status as keyof typeof badges];
  };

  const columns: ColumnDef<RotationItem>[] = [
    {
      accessorKey: 'sku',
      header: 'SKU',
      cell: ({ row }) => (
        <span className="font-mono text-sm">{row.original.sku}</span>
      ),
    },
    {
      accessorKey: 'productName',
      header: 'Producto',
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.productName}</div>
          <div className="text-xs text-gray-500">{row.original.categoryName}</div>
        </div>
      ),
    },
    {
      accessorKey: 'currentStock',
      header: 'Stock Actual',
      cell: ({ row }) => (
        <div className="text-right font-medium">{row.original.currentStock}</div>
      ),
    },
    {
      accessorKey: 'totalMovements',
      header: 'Movimientos',
      cell: ({ row }) => (
        <div className="text-center">
          <Badge variant="default">{row.original.totalMovements}</Badge>
        </div>
      ),
    },
    {
      id: 'inOut',
      header: 'Entradas / Salidas',
      cell: ({ row }) => (
        <div className="text-sm">
          <div className="text-green-600">+{row.original.totalIn}</div>
          <div className="text-red-600">-{row.original.totalOut}</div>
        </div>
      ),
    },
    {
      accessorKey: 'netChange',
      header: 'Cambio Neto',
      cell: ({ row }) => (
        <div
          className={`text-right font-medium ${
            row.original.netChange > 0
              ? 'text-green-600'
              : row.original.netChange < 0
              ? 'text-red-600'
              : 'text-gray-600'
          }`}
        >
          {row.original.netChange > 0 ? '+' : ''}
          {row.original.netChange}
        </div>
      ),
    },
    {
      id: 'lastMovement',
      header: 'Último Movimiento',
      cell: ({ row }) => (
        <div className="text-sm">
          {row.original.lastMovementDate ? (
            <>
              <div>
                {new Date(row.original.lastMovementDate).toLocaleDateString('es-CL')}
              </div>
              <div className="text-xs text-gray-500">
                Hace {row.original.daysSinceLastMovement} días
              </div>
            </>
          ) : (
            <span className="text-gray-400">Sin movimientos</span>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'rotationStatus',
      header: 'Estado',
      cell: ({ row }) => {
        const badge = getRotationBadge(row.original.rotationStatus);
        return <Badge variant={badge.variant}>{badge.label}</Badge>;
      },
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Skeleton className="h-32" />
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
            <h1 className="text-3xl font-bold">Rotación de Productos</h1>
            <p className="text-gray-600 mt-1">
              Análisis de movimientos en los últimos {days} días
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

      {/* Period Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Período de Análisis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium">Últimos</label>
            <Input
              type="number"
              min="1"
              max="365"
              value={days}
              onChange={(e) => setDays(parseInt(e.target.value) || 30)}
              className="w-24"
            />
            <label className="text-sm font-medium">días</label>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card
          className={`cursor-pointer ${
            filterStatus === 'high' ? 'ring-2 ring-green-500' : ''
          }`}
          onClick={() =>
            setFilterStatus(filterStatus === 'high' ? 'all' : 'high')
          }
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alta Rotación</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {highRotation}
            </div>
            <p className="text-xs text-gray-600 mt-1">Productos activos</p>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer ${
            filterStatus === 'medium' ? 'ring-2 ring-blue-500' : ''
          }`}
          onClick={() =>
            setFilterStatus(filterStatus === 'medium' ? 'all' : 'medium')
          }
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Rotación Media
            </CardTitle>
            <Activity className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {mediumRotation}
            </div>
            <p className="text-xs text-gray-600 mt-1">Productos moderados</p>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer ${
            filterStatus === 'low' ? 'ring-2 ring-yellow-500' : ''
          }`}
          onClick={() =>
            setFilterStatus(filterStatus === 'low' ? 'all' : 'low')
          }
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Baja Rotación</CardTitle>
            <TrendingDown className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {lowRotation}
            </div>
            <p className="text-xs text-gray-600 mt-1">Productos lentos</p>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer ${
            filterStatus === 'stale' ? 'ring-2 ring-red-500' : ''
          }`}
          onClick={() =>
            setFilterStatus(filterStatus === 'stale' ? 'all' : 'stale')
          }
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Sin Movimiento
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {staleProducts}
            </div>
            <p className="text-xs text-gray-600 mt-1">Productos estancados</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter Buttons */}
      {filterStatus !== 'all' && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Filtrando por:</span>
          <Badge variant="default">
            {getRotationBadge(filterStatus).label}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFilterStatus('all')}
          >
            Limpiar filtro
          </Button>
        </div>
      )}

      {/* Rotation Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Detalle de Rotación ({filteredData.length} productos)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={filteredData}
            columns={columns}
            emptyMessage="No hay productos con el filtro seleccionado"
          />
        </CardContent>
      </Card>
    </div>
  );
}
