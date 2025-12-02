'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Settings,
  Edit,
  Save,
  X,
  Package,
  AlertTriangle,
  CheckCircle,
  Loader2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { DataTable } from '@/components/ui/DataTable';
import { Skeleton } from '@/components/ui/Skeleton';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { ProductService } from '@/services/productService';
import type { Product } from '@/types';
import type { ColumnDef } from '@tanstack/react-table';

interface ThresholdEdit {
  productId: string;
  minimum_stock: number;
  maximum_stock: number;
}

export default function ThresholdsConfigPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<ThresholdEdit | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Stats
  const [configured, setConfigured] = useState(0);
  const [notConfigured, setNotConfigured] = useState(0);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await ProductService.getProducts();
      // Backend returns { data: { items: [...], total: number, ... } }
      const allProducts = response.data?.items || [];

      setProducts(allProducts);
      calculateStats(allProducts);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (productList: Product[]) => {
    const withThresholds = productList.filter(
      (p) => p.minimum_stock != null && p.maximum_stock != null
    ).length;

    setConfigured(withThresholds);
    setNotConfigured(productList.length - withThresholds);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product.id);
    setEditValues({
      productId: product.id,
      minimum_stock: product.minimum_stock || 0,
      maximum_stock: product.maximum_stock || 0,
    });
    setError(null);
  };

  const handleCancel = () => {
    setEditingProduct(null);
    setEditValues(null);
    setError(null);
  };

  const handleSave = async () => {
    if (!editValues) return;

    // Validate
    if (editValues.minimum_stock < 0) {
      setError('El stock mínimo no puede ser negativo');
      return;
    }

    if (editValues.maximum_stock < 0) {
      setError('El stock máximo no puede ser negativo');
      return;
    }

    if (editValues.minimum_stock > editValues.maximum_stock) {
      setError('El stock mínimo no puede ser mayor al stock máximo');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const product = products.find((p) => p.id === editValues.productId);
      if (!product) return;

      await ProductService.updateProduct(product.id, {
        name: product.name,
        description: product.description,
        sku: product.sku,
        barcode: product.barcode,
        category_id: product.category_id,
        brand: product.brand,
        unit_of_measure: product.unit_of_measure,
        cost_price: product.cost_price,
        sale_price: product.sale_price,
        tax_rate: product.tax_rate,
        minimum_stock: editValues.minimum_stock,
        maximum_stock: editValues.maximum_stock,
        is_active: product.is_active,
      });

      // Update local state
      setProducts((prev) =>
        prev.map((p) =>
          p.id === editValues.productId
            ? {
                ...p,
                minimum_stock: editValues.minimum_stock,
                maximum_stock: editValues.maximum_stock,
              }
            : p
        )
      );

      calculateStats(
        products.map((p) =>
          p.id === editValues.productId
            ? {
                ...p,
                minimum_stock: editValues.minimum_stock,
                maximum_stock: editValues.maximum_stock,
              }
            : p
        )
      );

      setEditingProduct(null);
      setEditValues(null);
    } catch (error) {
      console.error('Error saving thresholds:', error);
      setError('Error al guardar los umbrales. Intenta nuevamente.');
    } finally {
      setSaving(false);
    }
  };

  const getStatusBadge = (product: Product) => {
    if (product.minimum_stock == null || product.maximum_stock == null) {
      return <Badge variant="warning">Sin configurar</Badge>;
    }
    return <Badge variant="success">Configurado</Badge>;
  };

  const columns: ColumnDef<Product>[] = [
    {
      accessorKey: 'sku',
      header: 'SKU',
      cell: ({ row }) => (
        <span className="font-mono text-sm">{row.original.sku}</span>
      ),
    },
    {
      accessorKey: 'name',
      header: 'Producto',
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.name}</div>
          <div className="text-xs text-gray-500">
            {row.original.category_name || 'Sin categoría'}
          </div>
        </div>
      ),
    },
    {
      id: 'minimum_stock',
      header: 'Stock Mínimo',
      cell: ({ row }) => {
        const isEditing = editingProduct === row.original.id;

        if (isEditing) {
          return (
            <Input
              type="number"
              min="0"
              value={editValues?.minimum_stock || 0}
              onChange={(e) =>
                setEditValues((prev) =>
                  prev
                    ? { ...prev, minimum_stock: parseInt(e.target.value) || 0 }
                    : null
                )
              }
              className="w-24"
            />
          );
        }

        return (
          <div className="text-center">
            {row.original.minimum_stock != null ? (
              <span className="font-medium">{row.original.minimum_stock}</span>
            ) : (
              <span className="text-gray-400">-</span>
            )}
          </div>
        );
      },
    },
    {
      id: 'maximum_stock',
      header: 'Stock Máximo',
      cell: ({ row }) => {
        const isEditing = editingProduct === row.original.id;

        if (isEditing) {
          return (
            <Input
              type="number"
              min="0"
              value={editValues?.maximum_stock || 0}
              onChange={(e) =>
                setEditValues((prev) =>
                  prev
                    ? { ...prev, maximum_stock: parseInt(e.target.value) || 0 }
                    : null
                )
              }
              className="w-24"
            />
          );
        }

        return (
          <div className="text-center">
            {row.original.maximum_stock != null ? (
              <span className="font-medium">{row.original.maximum_stock}</span>
            ) : (
              <span className="text-gray-400">-</span>
            )}
          </div>
        );
      },
    },
    {
      id: 'status',
      header: 'Estado',
      cell: ({ row }) => getStatusBadge(row.original),
    },
    {
      id: 'actions',
      header: 'Acciones',
      cell: ({ row }) => {
        const isEditing = editingProduct === row.original.id;

        if (isEditing) {
          return (
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleCancel}
                disabled={saving}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          );
        }

        return (
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleEdit(row.original)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
        );
      },
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
        <div>
          <h1 className="text-3xl font-bold">Configuración de Umbrales</h1>
          <p className="text-gray-600 mt-2">
            Gestiona los niveles mínimos y máximos de stock por producto
          </p>
        </div>
        <Button
          onClick={() => router.push('/settings/thresholds/bulk')}
          variant="outline"
        >
          <Settings className="h-4 w-4 mr-2" />
          Configuración Masiva
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Productos Configurados
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {configured}
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Con umbrales definidos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Sin Configurar
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {notConfigured}
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Requieren configuración
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>Umbrales por Producto</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={products}
            columns={columns}
            emptyMessage="No hay productos disponibles"
          />
        </CardContent>
      </Card>

      {/* Help Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Acerca de los Umbrales
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-gray-600">
          <p>
            <strong>Stock Mínimo:</strong> Cantidad mínima que debe mantenerse
            en inventario. Las alertas se activan cuando el stock cae por
            debajo de este nivel.
          </p>
          <p>
            <strong>Stock Máximo:</strong> Cantidad máxima recomendada para
            evitar sobrestock. Útil para planificar compras y transferencias.
          </p>
          <p className="text-yellow-700 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            El stock mínimo debe ser menor o igual al stock máximo.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
