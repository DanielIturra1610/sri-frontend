'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Package, ArrowLeft } from 'lucide-react';
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Input,
  Textarea,
  NativeSelect as Select,
  Alert,
  Skeleton,
} from '@/components/ui';
import { StockService } from '@/services/stockService';
import { ProductService } from '@/services/productService';
import { LocationService } from '@/services/locationService';
import {
  stockAdjustmentSchema,
  type StockAdjustmentFormData,
  transactionTypeLabels,
} from '@/lib/validations/stock';
import type { Product, Location } from '@/types';
import toast from 'react-hot-toast';

export default function StockAdjustPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);

  // Load products and locations
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoadingData(true);
      const [productsResponse, locationsData] = await Promise.all([
        ProductService.getProducts(),
        LocationService.getLocations(),
      ]);
      setProducts(productsResponse.data.items || []);
      setLocations(locationsData.filter((loc) => loc.is_active));
    } catch (error: any) {
      toast.error(error.message || 'Error al cargar datos');
      console.error('Error loading data:', error);
    } finally {
      setIsLoadingData(false);
    }
  };

  // Form setup
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<StockAdjustmentFormData>({
    resolver: zodResolver(stockAdjustmentSchema),
    defaultValues: {
      product_id: '',
      location_id: '',
      transaction_type: 'adjustment',
      quantity: 1,
      notes: '',
    },
  });

  // Watch selected product and location to show current stock
  const selectedProductId = watch('product_id');
  const selectedLocationId = watch('location_id');
  const [currentStock, setCurrentStock] = useState<number | null>(null);

  useEffect(() => {
    if (selectedProductId && selectedLocationId) {
      loadCurrentStock(selectedProductId, selectedLocationId);
    } else {
      setCurrentStock(null);
    }
  }, [selectedProductId, selectedLocationId]);

  const loadCurrentStock = async (productId: string, locationId: string) => {
    try {
      const stockItems = await StockService.getStockByProduct(productId);
      const stockItem = stockItems.find((item) => item.location_id === locationId);
      setCurrentStock(stockItem?.quantity ?? 0);
    } catch (error) {
      console.error('Error loading current stock:', error);
      setCurrentStock(null);
    }
  };

  // Submit handler
  const onSubmit = async (data: StockAdjustmentFormData) => {
    try {
      setIsSubmitting(true);
      await StockService.createTransaction(data);
      toast.success('Ajuste de stock realizado exitosamente');
      router.push('/stock');
    } catch (error: any) {
      toast.error(error.message || 'Error al ajustar stock');
      console.error('Error adjusting stock:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingData) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<ArrowLeft className="h-4 w-4" />}
            onClick={() => router.push('/stock')}
          >
            Volver
          </Button>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Package className="h-7 w-7" />
          Ajustar Stock
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Registrar movimiento de inventario
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Transaction Details */}
        <Card>
          <CardHeader>
            <CardTitle>Detalles del Movimiento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Product Select */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Producto <span className="text-red-500">*</span>
              </label>
              <Controller
                name="product_id"
                control={control}
                render={({ field }) => (
                  <Select {...field} error={errors.product_id?.message}>
                    <option value="">Seleccione un producto</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.sku} - {product.name}
                      </option>
                    ))}
                  </Select>
                )}
              />
              {errors.product_id && (
                <p className="mt-1 text-sm text-red-600">{errors.product_id.message}</p>
              )}
            </div>

            {/* Location Select */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Ubicación <span className="text-red-500">*</span>
              </label>
              <Controller
                name="location_id"
                control={control}
                render={({ field }) => (
                  <Select {...field} error={errors.location_id?.message}>
                    <option value="">Seleccione una ubicación</option>
                    {locations.map((location) => (
                      <option key={location.id} value={location.id}>
                        {location.code} - {location.name}
                      </option>
                    ))}
                  </Select>
                )}
              />
              {errors.location_id && (
                <p className="mt-1 text-sm text-red-600">{errors.location_id.message}</p>
              )}
            </div>

            {/* Current Stock Alert */}
            {currentStock !== null && (
              <Alert variant="info">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  <span>
                    Stock actual: <strong>{currentStock}</strong> unidades
                  </span>
                </div>
              </Alert>
            )}

            {/* Transaction Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tipo de Movimiento <span className="text-red-500">*</span>
              </label>
              <Controller
                name="transaction_type"
                control={control}
                render={({ field }) => (
                  <Select {...field} error={errors.transaction_type?.message}>
                    {Object.entries(transactionTypeLabels).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </Select>
                )}
              />
              {errors.transaction_type && (
                <p className="mt-1 text-sm text-red-600">{errors.transaction_type.message}</p>
              )}
              <p className="mt-1 text-sm text-gray-500">
                Seleccione el tipo de movimiento que desea registrar
              </p>
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Cantidad <span className="text-red-500">*</span>
              </label>
              <Controller
                name="quantity"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    type="number"
                    min="1"
                    step="1"
                    onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 0)}
                    error={errors.quantity?.message}
                  />
                )}
              />
              {errors.quantity && (
                <p className="mt-1 text-sm text-red-600">{errors.quantity.message}</p>
              )}
              <p className="mt-1 text-sm text-gray-500">
                Ingrese la cantidad en números enteros positivos
              </p>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Notas
              </label>
              <Textarea
                {...register('notes')}
                rows={3}
                placeholder="Información adicional sobre este movimiento..."
                error={errors.notes?.message}
              />
              {errors.notes && (
                <p className="mt-1 text-sm text-red-600">{errors.notes.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Sticky Footer Actions */}
        <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 flex justify-end gap-3 -mx-6 -mb-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/stock')}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            Registrar Movimiento
          </Button>
        </div>
      </form>
    </div>
  );
}
