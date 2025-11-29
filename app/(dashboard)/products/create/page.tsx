'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Save } from 'lucide-react';
import { ProductService } from '@/services/productService';
import { CategoryService } from '@/services/categoryService';
import { productSchema, type ProductFormData, unitOfMeasureLabels } from '@/lib/validations/product';
import { Button, Input, Textarea, NativeSelect as Select, Checkbox, Card, CardHeader, CardTitle, CardContent, Alert } from '@/components/ui';
import type { Category } from '@/types';
import toast from 'react-hot-toast';

export default function CreateProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      is_active: true,
      unit_of_measure: 'unit',
      tax_rate: 19, // IVA Chile
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

      await ProductService.createProduct(productData);

      toast.success('Producto creado exitosamente');
      router.push('/products');
    } catch (error: any) {
      toast.error(error.message || 'Error al crear producto');
      console.error('Error creating product:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

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
            Crear Producto
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Agrega un nuevo producto al catálogo
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
              defaultChecked
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
            {isSubmitting ? 'Guardando...' : 'Crear Producto'}
          </Button>
        </div>
      </form>
    </div>
  );
}
