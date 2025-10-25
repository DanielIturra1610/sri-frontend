'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Save } from 'lucide-react';
import { ProductService } from '@/lib/services/product.service';
import { CategoryService } from '@/lib/services/category.service';
import { productSchema, type ProductFormData, unitOfMeasureLabels } from '@/lib/validations/product';
import { Button, Input, Textarea, Select, Checkbox, Card, CardHeader, CardTitle, CardContent, Alert, Skeleton } from '@/components/ui';
import type { Category } from '@/types';
import toast from 'react-hot-toast';

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const [categories, setCategories] = useState<Category[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      is_active: true,
      unit_of_measure: 'unit',
      tax_rate: 19,
    },
  });

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await CategoryService.getCategories();
        setCategories(data);
      } catch (error) {
        console.error('Error loading categories:', error);
        toast.error('Error al cargar categorías');
      }
    };

    loadCategories();
  }, []);

  // Load product data
  useEffect(() => {
    const loadProduct = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const product = await ProductService.getProduct(productId);

        // Pre-populate form with existing data
        reset({
          sku: product.sku,
          barcode: product.barcode || '',
          name: product.name,
          description: product.description || '',
          category_id: product.category_id || '',
          brand: product.brand || '',
          unit_of_measure: product.unit_of_measure,
          cost_price: product.cost_price,
          sale_price: product.sale_price,
          tax_rate: product.tax_rate || 19,
          minimum_stock: product.minimum_stock || undefined,
          maximum_stock: product.maximum_stock || undefined,
          is_active: product.is_active,
        });
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
  }, [productId, reset]);

  // Handle form submission
  const onSubmit = async (data: ProductFormData) => {
    try {
      setIsSubmitting(true);

      // Convert empty strings to undefined
      const productData = {
        ...data,
        barcode: data.barcode || undefined,
        description: data.description || undefined,
        category_id: data.category_id || undefined,
        brand: data.brand || undefined,
        tax_rate: data.tax_rate || undefined,
        minimum_stock: data.minimum_stock || undefined,
        maximum_stock: data.maximum_stock || undefined,
      };

      await ProductService.updateProduct(productId, productData);

      toast.success('Producto actualizado exitosamente');
      router.push(`/products/${productId}`);
    } catch (error: any) {
      toast.error(error.message || 'Error al actualizar producto');
      console.error('Error updating product:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-20" />
          <Skeleton className="h-8 w-64" />
        </div>
        <Skeleton className="h-96" />
        <Skeleton className="h-64" />
        <Skeleton className="h-48" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          leftIcon={<ArrowLeft className="h-4 w-4" />}
        >
          Volver
        </Button>
        <Alert variant="danger" title="Error">
          {error}
        </Alert>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Editar Producto
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Modifica la información del producto
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Información Básica</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="SKU"
                placeholder="Ej: PROD-001"
                error={errors.sku?.message}
                {...register('sku')}
              />
              <Input
                label="Código de Barras"
                placeholder="Ej: 7891234567890"
                error={errors.barcode?.message}
                {...register('barcode')}
              />
            </div>

            <Input
              label="Nombre del Producto"
              placeholder="Ej: Laptop HP Pavilion 15"
              error={errors.name?.message}
              {...register('name')}
            />

            <Textarea
              label="Descripción"
              placeholder="Descripción detallada del producto..."
              rows={4}
              error={errors.description?.message}
              {...register('description')}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Categoría"
                error={errors.category_id?.message}
                {...register('category_id')}
              >
                <option value="">Sin categoría</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </Select>

              <Input
                label="Marca"
                placeholder="Ej: HP"
                error={errors.brand?.message}
                {...register('brand')}
              />
            </div>

            <Select
              label="Unidad de Medida"
              error={errors.unit_of_measure?.message}
              {...register('unit_of_measure')}
            >
              {Object.entries(unitOfMeasureLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </CardContent>
        </Card>

        {/* Pricing */}
        <Card>
          <CardHeader>
            <CardTitle>Precios</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Precio de Costo"
                type="number"
                step="0.01"
                placeholder="0.00"
                error={errors.cost_price?.message}
                {...register('cost_price', { valueAsNumber: true })}
              />

              <Input
                label="Precio de Venta"
                type="number"
                step="0.01"
                placeholder="0.00"
                error={errors.sale_price?.message}
                {...register('sale_price', { valueAsNumber: true })}
              />

              <Input
                label="Tasa de Impuesto (%)"
                type="number"
                step="0.01"
                placeholder="19"
                helperText="IVA en Chile es 19%"
                error={errors.tax_rate?.message}
                {...register('tax_rate', {
                  setValueAs: (v) => v === '' ? undefined : parseFloat(v)
                })}
              />
            </div>

            {watch('cost_price') && watch('sale_price') && (
              <Alert variant="info" title="Margen de Ganancia">
                El margen de ganancia es: {' '}
                <strong>
                  {(((watch('sale_price') - watch('cost_price')) / watch('cost_price')) * 100).toFixed(2)}%
                </strong>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Stock Levels */}
        <Card>
          <CardHeader>
            <CardTitle>Niveles de Stock</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="info">
              Define los niveles mínimo y máximo de stock para recibir alertas cuando el inventario esté bajo o exceda el límite.
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Stock Mínimo"
                type="number"
                placeholder="0"
                helperText="Alerta cuando el stock esté por debajo de este valor"
                error={errors.minimum_stock?.message}
                {...register('minimum_stock', {
                  setValueAs: (v) => v === '' ? undefined : parseInt(v)
                })}
              />

              <Input
                label="Stock Máximo"
                type="number"
                placeholder="0"
                helperText="Alerta cuando el stock exceda este valor"
                error={errors.maximum_stock?.message}
                {...register('maximum_stock', {
                  setValueAs: (v) => v === '' ? undefined : parseInt(v)
                })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Status */}
        <Card>
          <CardHeader>
            <CardTitle>Estado</CardTitle>
          </CardHeader>
          <CardContent>
            <Checkbox
              label="Producto activo"
              {...register('is_active')}
            />
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Los productos inactivos no aparecerán en búsquedas y reportes
            </p>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 sticky bottom-0 bg-gray-50 dark:bg-gray-950 py-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
            leftIcon={<Save className="h-4 w-4" />}
          >
            {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </div>
      </form>
    </div>
  );
}
