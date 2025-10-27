'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  FolderTree,
  Package,
  Save,
  AlertTriangle,
  Loader2,
  CheckCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Alert } from '@/components/ui/Alert';
import { ProductService } from '@/services/productService';
import { CategoryService } from '@/services/categoryService';
import type { Product, Category } from '@/types';

export default function BulkThresholdsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [minimumStock, setMinimumStock] = useState<number>(10);
  const [maximumStock, setMaximumStock] = useState<number>(100);
  const [affectedProducts, setAffectedProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (selectedCategoryId) {
      loadAffectedProducts();
    } else {
      setAffectedProducts([]);
    }
  }, [selectedCategoryId]);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await CategoryService.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAffectedProducts = async () => {
    try {
      const response = await ProductService.getProducts({
        category_id: selectedCategoryId,
      });
      setAffectedProducts(response.data.items);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const handleSave = async () => {
    setError(null);
    setSuccess(false);

    // Validation
    if (!selectedCategoryId) {
      setError('Debes seleccionar una categoría');
      return;
    }

    if (minimumStock < 0) {
      setError('El stock mínimo no puede ser negativo');
      return;
    }

    if (maximumStock < 0) {
      setError('El stock máximo no puede ser negativo');
      return;
    }

    if (minimumStock > maximumStock) {
      setError('El stock mínimo no puede ser mayor al stock máximo');
      return;
    }

    if (affectedProducts.length === 0) {
      setError('No hay productos en la categoría seleccionada');
      return;
    }

    try {
      setSaving(true);

      // Update all products in the category
      const updatePromises = affectedProducts.map((product) =>
        ProductService.updateProduct(product.id, {
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
          minimum_stock: minimumStock,
          maximum_stock: maximumStock,
          is_active: product.is_active,
        })
      );

      await Promise.all(updatePromises);

      setSuccess(true);

      // Reload affected products to show updated values
      await loadAffectedProducts();
    } catch (error) {
      console.error('Error saving bulk thresholds:', error);
      setError(
        'Error al guardar los umbrales masivamente. Algunos productos pueden no haberse actualizado.'
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">
            Configuración Masiva de Umbrales
          </h1>
          <p className="text-gray-600 mt-2">
            Aplica umbrales a todos los productos de una categoría
          </p>
        </div>
      </div>

      {/* Success Alert */}
      {success && (
        <Alert variant="success">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            <div>
              <strong>¡Actualización exitosa!</strong>
              <p className="text-sm mt-1">
                Se actualizaron {affectedProducts.length} producto(s) de la
                categoría seleccionada.
              </p>
            </div>
          </div>
        </Alert>
      )}

      {/* Error Alert */}
      {error && (
        <Alert variant="danger">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        </Alert>
      )}

      {/* Configuration Form */}
      <Card>
        <CardHeader>
          <CardTitle>Configuración</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Category Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">
              <FolderTree className="inline h-4 w-4 mr-2" />
              Categoría
            </label>
            <Select
              value={selectedCategoryId}
              onChange={(e) => setSelectedCategoryId(e.target.value)}
            >
              <option value="">Selecciona una categoría</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </Select>
            <p className="text-xs text-gray-500 mt-1">
              Los umbrales se aplicarán a todos los productos de esta categoría
            </p>
          </div>

          {/* Threshold Values */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Stock Mínimo
              </label>
              <Input
                type="number"
                min="0"
                value={minimumStock}
                onChange={(e) => setMinimumStock(parseInt(e.target.value) || 0)}
              />
              <p className="text-xs text-gray-500 mt-1">
                Nivel de alerta cuando el stock cae por debajo de este valor
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Stock Máximo
              </label>
              <Input
                type="number"
                min="0"
                value={maximumStock}
                onChange={(e) => setMaximumStock(parseInt(e.target.value) || 0)}
              />
              <p className="text-xs text-gray-500 mt-1">
                Nivel máximo recomendado para evitar sobrestock
              </p>
            </div>
          </div>

          {/* Affected Products Info */}
          {selectedCategoryId && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Package className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-900">
                    Productos afectados
                  </p>
                  <p className="text-sm text-blue-700 mt-1">
                    Se actualizarán <strong>{affectedProducts.length}</strong>{' '}
                    producto(s) con los umbrales configurados.
                  </p>
                  {affectedProducts.length > 0 && (
                    <ul className="mt-2 text-xs text-blue-600 space-y-1">
                      {affectedProducts.slice(0, 5).map((product) => (
                        <li key={product.id}>
                          • {product.sku} - {product.name}
                        </li>
                      ))}
                      {affectedProducts.length > 5 && (
                        <li className="font-medium">
                          ... y {affectedProducts.length - 5} más
                        </li>
                      )}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Button onClick={handleSave} disabled={saving || !selectedCategoryId}>
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Aplicar Umbrales
                </>
              )}
            </Button>
            <Button variant="outline" onClick={() => router.back()}>
              Cancelar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Help Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            Importante
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-gray-600">
          <p>
            • Esta acción <strong>sobrescribirá</strong> los umbrales actuales
            de todos los productos en la categoría seleccionada.
          </p>
          <p>
            • Los productos que ya tengan umbrales configurados serán
            actualizados con los nuevos valores.
          </p>
          <p>
            • Si necesitas configuraciones específicas por producto, usa la
            página de configuración individual.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
