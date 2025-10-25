'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Edit, Trash2, Package, DollarSign, Tag, Box } from 'lucide-react';
import { ProductService } from '@/lib/services/product.service';
import { Button, Card, CardHeader, CardTitle, CardContent, Badge, Alert, Skeleton } from '@/components/ui';
import { Can } from '@/components/auth';
import { PERMISSIONS } from '@/lib/constants/permissions';
import { unitOfMeasureLabels } from '@/lib/validations/product';
import type { Product } from '@/types';
import toast from 'react-hot-toast';

export default function ProductDetailPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load product details
  useEffect(() => {
    const loadProduct = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await ProductService.getProduct(productId);
        setProduct(data);
      } catch (error: any) {
        setError(error.message || 'Error al cargar el producto');
        toast.error('Error al cargar el producto');
        console.error('Error loading product:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (productId) {
      loadProduct();
    }
  }, [productId]);

  // Handle delete
  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de que deseas eliminar este producto?')) {
      return;
    }

    try {
      await ProductService.deleteProduct(productId);
      toast.success('Producto eliminado exitosamente');
      router.push('/products');
    } catch (error: any) {
      toast.error(error.message || 'Error al eliminar el producto');
      console.error('Error deleting product:', error);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-20" />
          <Skeleton className="h-8 w-64" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-64" />
            <Skeleton className="h-48" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-32" />
            <Skeleton className="h-48" />
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !product) {
    return (
      <div className="space-y-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          leftIcon={<ArrowLeft className="h-4 w-4" />}
        >
          Volver
        </Button>
        <Alert variant="danger" title="Error">
          {error || 'Producto no encontrado'}
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            leftIcon={<ArrowLeft className="h-4 w-4" />}
          >
            Volver
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {product.name}
              </h1>
              <Badge variant={product.is_active ? 'success' : 'danger'}>
                {product.is_active ? 'Activo' : 'Inactivo'}
              </Badge>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              SKU: {product.sku}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Can permission={PERMISSIONS.PRODUCTS_UPDATE}>
            <Button
              variant="outline"
              leftIcon={<Edit className="h-4 w-4" />}
              onClick={() => router.push(`/products/${productId}/edit`)}
            >
              Editar
            </Button>
          </Can>
          <Can permission={PERMISSIONS.PRODUCTS_DELETE}>
            <Button
              variant="danger"
              leftIcon={<Trash2 className="h-4 w-4" />}
              onClick={handleDelete}
            >
              Eliminar
            </Button>
          </Can>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Información del Producto
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    SKU
                  </label>
                  <p className="text-gray-900 dark:text-white font-medium">
                    {product.sku}
                  </p>
                </div>

                {product.barcode && (
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Código de Barras
                    </label>
                    <p className="text-gray-900 dark:text-white font-medium">
                      {product.barcode}
                    </p>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Categoría
                  </label>
                  <p className="text-gray-900 dark:text-white">
                    {product.category_name || 'Sin categoría'}
                  </p>
                </div>

                {product.brand && (
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Marca
                    </label>
                    <p className="text-gray-900 dark:text-white">
                      {product.brand}
                    </p>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Unidad de Medida
                  </label>
                  <p className="text-gray-900 dark:text-white">
                    {unitOfMeasureLabels[product.unit_of_measure] || product.unit_of_measure}
                  </p>
                </div>
              </div>

              {product.description && (
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Descripción
                  </label>
                  <p className="text-gray-900 dark:text-white mt-1">
                    {product.description}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Precios
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Precio de Costo
                  </label>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    ${product.cost_price.toLocaleString('es-CL')}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Precio de Venta
                  </label>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    ${product.sale_price.toLocaleString('es-CL')}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Margen
                  </label>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {(((product.sale_price - product.cost_price) / product.cost_price) * 100).toFixed(1)}%
                  </p>
                </div>
              </div>

              {product.tax_rate && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Tasa de Impuesto
                  </label>
                  <p className="text-gray-900 dark:text-white">
                    {product.tax_rate}%
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Stock Levels */}
          {(product.minimum_stock || product.maximum_stock) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Box className="h-5 w-5" />
                  Niveles de Stock
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {product.minimum_stock !== undefined && (
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Stock Mínimo
                      </label>
                      <p className="text-xl font-semibold text-gray-900 dark:text-white">
                        {product.minimum_stock}
                      </p>
                    </div>
                  )}

                  {product.maximum_stock !== undefined && (
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Stock Máximo
                      </label>
                      <p className="text-xl font-semibold text-gray-900 dark:text-white">
                        {product.maximum_stock}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5" />
                Estadísticas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Estado</span>
                <Badge variant={product.is_active ? 'success' : 'danger'}>
                  {product.is_active ? 'Activo' : 'Inactivo'}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Creado</span>
                <span className="text-sm text-gray-900 dark:text-white">
                  {new Date(product.created_at).toLocaleDateString('es-CL')}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Actualizado</span>
                <span className="text-sm text-gray-900 dark:text-white">
                  {new Date(product.updated_at).toLocaleDateString('es-CL')}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Stock by Location - Placeholder */}
          <Card>
            <CardHeader>
              <CardTitle>Stock por Ubicación</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                <p className="text-sm">Disponible en próxima versión</p>
                <p className="text-xs mt-2">
                  Aquí se mostrará el stock disponible en cada ubicación
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Transaction History - Placeholder */}
          <Card>
            <CardHeader>
              <CardTitle>Historial de Transacciones</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                <p className="text-sm">Disponible en próxima versión</p>
                <p className="text-xs mt-2">
                  Aquí se mostrará el historial de movimientos de inventario
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
