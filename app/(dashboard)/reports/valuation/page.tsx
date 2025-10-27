'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Download,
  DollarSign,
  Package,
  TrendingUp,
  Loader2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { DataTable } from '@/components/ui/DataTable';
import { Skeleton } from '@/components/ui/Skeleton';
import { Badge } from '@/components/ui/Badge';
import { StockService } from '@/services/stockService';
import { ProductService } from '@/services/productService';
import type { Stock, Product } from '@/types';
import type { ColumnDef } from '@tanstack/react-table';

interface ValuationItem {
  productId: string;
  sku: string;
  productName: string;
  categoryName: string;
  totalQuantity: number;
  unitPrice: number;
  totalValue: number;
  locations: {
    locationName: string;
    quantity: number;
    value: number;
  }[];
}

export default function ValuationReportPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [valuationData, setValuationData] = useState<ValuationItem[]>([]);
  const [totalInventoryValue, setTotalInventoryValue] = useState(0);
  const [totalProducts, setTotalProducts] = useState(0);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    loadValuationData();
  }, []);

  const loadValuationData = async () => {
    try {
      setLoading(true);

      // Load stock and products in parallel
      const [stock, productsResponse] = await Promise.all([
        StockService.getAllStock(),
        ProductService.getProducts(),
      ]);

      const products = productsResponse.data.items;

      // Group stock by product
      const valuationMap = new Map<string, ValuationItem>();

      stock.forEach((stockItem) => {
        const product = products.find((p) => p.id === stockItem.product_id);
        if (!product) return;

        const key = stockItem.product_id;
        const existing = valuationMap.get(key);

        const locationValue = stockItem.quantity * (product.sale_price || 0);

        if (existing) {
          existing.totalQuantity += stockItem.quantity;
          existing.totalValue += locationValue;
          existing.locations.push({
            locationName: stockItem.location_name,
            quantity: stockItem.quantity,
            value: locationValue,
          });
        } else {
          valuationMap.set(key, {
            productId: product.id,
            sku: product.sku,
            productName: product.name,
            categoryName: product.category_name || 'Sin categoría',
            totalQuantity: stockItem.quantity,
            unitPrice: product.sale_price || 0,
            totalValue: locationValue,
            locations: [
              {
                locationName: stockItem.location_name,
                quantity: stockItem.quantity,
                value: locationValue,
              },
            ],
          });
        }
      });

      const valuationArray = Array.from(valuationMap.values());

      // Sort by total value descending
      valuationArray.sort((a, b) => b.totalValue - a.totalValue);

      setValuationData(valuationArray);
      setTotalProducts(valuationArray.length);
      setTotalInventoryValue(
        valuationArray.reduce((sum, item) => sum + item.totalValue, 0)
      );
    } catch (error) {
      console.error('Error loading valuation data:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    setExporting(true);

    try {
      // Create CSV content
      const headers = [
        'SKU',
        'Producto',
        'Categoría',
        'Cantidad Total',
        'Precio Unitario',
        'Valor Total',
      ];

      const rows = valuationData.map((item) => [
        item.sku,
        item.productName,
        item.categoryName,
        item.totalQuantity,
        item.unitPrice.toFixed(2),
        item.totalValue.toFixed(2),
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map((row) => row.join(',')),
        '',
        `Total Productos,${totalProducts}`,
        `Valor Total Inventario,${totalInventoryValue.toFixed(2)}`,
      ].join('\n');

      // Create download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);

      link.setAttribute('href', url);
      link.setAttribute('download', `valorizacion-inventario-${new Date().toISOString().split('T')[0]}.csv`);
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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
    }).format(value);
  };

  const columns: ColumnDef<ValuationItem>[] = [
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
      accessorKey: 'totalQuantity',
      header: 'Cantidad Total',
      cell: ({ row }) => (
        <div className="text-right">
          <div className="font-medium">{row.original.totalQuantity}</div>
          <div className="text-xs text-gray-500">
            {row.original.locations.length} ubicación(es)
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'unitPrice',
      header: 'Precio Unitario',
      cell: ({ row }) => (
        <div className="text-right font-medium">
          {formatCurrency(row.original.unitPrice)}
        </div>
      ),
    },
    {
      accessorKey: 'totalValue',
      header: 'Valor Total',
      cell: ({ row }) => (
        <div className="text-right">
          <Badge variant="default" className="font-mono">
            {formatCurrency(row.original.totalValue)}
          </Badge>
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
            <h1 className="text-3xl font-bold">Valorización de Inventario</h1>
            <p className="text-gray-600 mt-1">
              Reporte generado el {new Date().toLocaleDateString('es-CL')}
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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Valor Total Inventario
            </CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totalInventoryValue)}
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Valorización total del stock
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Productos
            </CardTitle>
            <Package className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
            <p className="text-xs text-gray-600 mt-1">
              Productos con stock
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Valor Promedio
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(
                totalProducts > 0 ? totalInventoryValue / totalProducts : 0
              )}
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Por producto
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Valuation Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detalle de Valorización por Producto</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={valuationData}
            columns={columns}
            emptyMessage="No hay datos de valorización disponibles"
          />
        </CardContent>
      </Card>
    </div>
  );
}
