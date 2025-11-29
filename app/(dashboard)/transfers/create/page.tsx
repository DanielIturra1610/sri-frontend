'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRightLeft, ArrowLeft, AlertTriangle } from 'lucide-react';
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
import { TransferService } from '@/services/transferService';
import { ProductService } from '@/services/productService';
import { LocationService } from '@/services/locationService';
import { StockService } from '@/services/stockService';
import {
  transferSchema,
  type TransferFormData,
} from '@/lib/validations/transfer';
import type { Product, Location } from '@/types';
import toast from 'react-hot-toast';

export default function CreateTransferPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [availableStock, setAvailableStock] = useState<number | null>(null);

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
    setError,
  } = useForm<TransferFormData>({
    resolver: zodResolver(transferSchema),
    defaultValues: {
      product_id: '',
      from_location_id: '',
      to_location_id: '',
      quantity: 1,
      reason: '',
    },
  });

  // Watch selected product and origin location to show available stock
  const selectedProductId = watch('product_id');
  const selectedFromLocationId = watch('from_location_id');
  const selectedToLocationId = watch('to_location_id');
  const selectedQuantity = watch('quantity');

  useEffect(() => {
    if (selectedProductId && selectedFromLocationId) {
      loadAvailableStock(selectedProductId, selectedFromLocationId);
    } else {
      setAvailableStock(null);
    }
  }, [selectedProductId, selectedFromLocationId]);

  const loadAvailableStock = async (productId: string, locationId: string) => {
    try {
      const stockItems = await StockService.getStockByProduct(productId);
      const stockItem = stockItems.find((item) => item.location_id === locationId);
      setAvailableStock(stockItem?.quantity ?? 0);
    } catch (error) {
      console.error('Error loading available stock:', error);
      setAvailableStock(null);
    }
  };

  // Submit handler
  const onSubmit = async (data: TransferFormData) => {
    // Validate stock availability
    if (availableStock !== null && data.quantity > availableStock) {
      setError('quantity', {
        type: 'manual',
        message: `Stock insuficiente. Disponible: ${availableStock}`,
      });
      return;
    }

    try {
      setIsSubmitting(true);
      await TransferService.createTransfer(data);
      toast.success('Transferencia creada exitosamente');
      router.push('/transfers');
    } catch (error: any) {
      toast.error(error.message || 'Error al crear transferencia');
      console.error('Error creating transfer:', error);
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
            onClick={() => router.push('/transfers')}
          >
            Volver
          </Button>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <ArrowRightLeft className="h-7 w-7" />
          Nueva Transferencia
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Transferir stock entre ubicaciones
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Transfer Details */}
        <Card>
          <CardHeader>
            <CardTitle>Detalles de la Transferencia</CardTitle>
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

            {/* From Location Select */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Ubicación de Origen <span className="text-red-500">*</span>
              </label>
              <Controller
                name="from_location_id"
                control={control}
                render={({ field }) => (
                  <Select {...field} error={errors.from_location_id?.message}>
                    <option value="">Seleccione ubicación de origen</option>
                    {locations.map((location) => (
                      <option key={location.id} value={location.id}>
                        {location.code} - {location.name}
                      </option>
                    ))}
                  </Select>
                )}
              />
              {errors.from_location_id && (
                <p className="mt-1 text-sm text-red-600">{errors.from_location_id.message}</p>
              )}
            </div>

            {/* To Location Select */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Ubicación de Destino <span className="text-red-500">*</span>
              </label>
              <Controller
                name="to_location_id"
                control={control}
                render={({ field }) => (
                  <Select {...field} error={errors.to_location_id?.message}>
                    <option value="">Seleccione ubicación de destino</option>
                    {locations
                      .filter((loc) => loc.id !== selectedFromLocationId)
                      .map((location) => (
                        <option key={location.id} value={location.id}>
                          {location.code} - {location.name}
                        </option>
                      ))}
                  </Select>
                )}
              />
              {errors.to_location_id && (
                <p className="mt-1 text-sm text-red-600">{errors.to_location_id.message}</p>
              )}
            </div>

            {/* Available Stock Alert */}
            {availableStock !== null && (
              <Alert
                variant={availableStock === 0 ? 'danger' : availableStock < (selectedQuantity || 0) ? 'warning' : 'info'}
              >
                <div className="flex items-center gap-2">
                  {availableStock === 0 ? (
                    <>
                      <AlertTriangle className="h-4 w-4" />
                      <span>
                        <strong>Sin stock disponible</strong> en la ubicación de origen
                      </span>
                    </>
                  ) : availableStock < (selectedQuantity || 0) ? (
                    <>
                      <AlertTriangle className="h-4 w-4" />
                      <span>
                        Stock disponible: <strong>{availableStock}</strong> unidades
                        <br />
                        <span className="text-sm">Stock insuficiente para la cantidad solicitada</span>
                      </span>
                    </>
                  ) : (
                    <>
                      <ArrowRightLeft className="h-4 w-4" />
                      <span>
                        Stock disponible: <strong>{availableStock}</strong> unidades
                      </span>
                    </>
                  )}
                </div>
              </Alert>
            )}

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
                Ingrese la cantidad a transferir en números enteros positivos
              </p>
            </div>

            {/* Reason */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Razón
              </label>
              <Textarea
                {...register('reason')}
                rows={3}
                placeholder="Motivo de la transferencia..."
                error={errors.reason?.message}
              />
              {errors.reason && (
                <p className="mt-1 text-sm text-red-600">{errors.reason.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Sticky Footer Actions */}
        <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 flex justify-end gap-3 -mx-6 -mb-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/transfers')}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
            disabled={availableStock === 0}
          >
            Crear Transferencia
          </Button>
        </div>
      </form>
    </div>
  );
}
