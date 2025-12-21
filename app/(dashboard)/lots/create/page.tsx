'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Package } from 'lucide-react';
import { LotService } from '@/services/lotService';
import { ProductService } from '@/services/productService';
import { LocationService } from '@/services/locationService';
import { SupplierService } from '@/services/supplierService';
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Input,
  Textarea,
  NativeSelect as Select,
  Skeleton,
} from '@/components/ui';
import type { Product, Location, Supplier, CreateLotDTO } from '@/types';
import toast from 'react-hot-toast';

export default function CreateLotPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  const [formData, setFormData] = useState<CreateLotDTO>({
    product_id: '',
    location_id: '',
    lot_number: '',
    batch_code: '',
    manufacture_date: '',
    expiry_date: '',
    received_date: new Date().toISOString().split('T')[0],
    supplier_id: '',
    initial_quantity: 0,
    unit_cost: undefined,
    notes: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoadingData(true);
      const [productsResponse, locationsData, suppliersData] = await Promise.all([
        ProductService.getProducts(),
        LocationService.getLocations(),
        SupplierService.getSuppliers(),
      ]);
      setProducts(productsResponse.data.items || []);
      setLocations(locationsData.filter((loc) => loc.is_active));
      setSuppliers(suppliersData.suppliers.filter((s) => s.is_active));
    } catch (error: any) {
      toast.error(error.message || 'Error al cargar datos');
      console.error('Error loading data:', error);
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === 'number'
          ? value === ''
            ? undefined
            : parseFloat(value)
          : value || undefined,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.product_id) {
      toast.error('Seleccione un producto');
      return;
    }
    if (!formData.location_id) {
      toast.error('Seleccione una ubicación');
      return;
    }
    if (!formData.lot_number.trim()) {
      toast.error('Ingrese el número de lote');
      return;
    }
    if (formData.initial_quantity <= 0) {
      toast.error('La cantidad inicial debe ser mayor a 0');
      return;
    }

    try {
      setIsSubmitting(true);
      await LotService.createLot({
        ...formData,
        supplier_id: formData.supplier_id || undefined,
      });
      toast.success('Lote creado exitosamente');
      router.push('/lots');
    } catch (error: any) {
      toast.error(error.message || 'Error al crear lote');
      console.error('Error creating lot:', error);
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
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.push('/lots')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Package className="h-7 w-7" />
            Nuevo Lote
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Registra un nuevo lote de producto
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Información del Lote</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Product and Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Producto <span className="text-red-500">*</span>
                </label>
                <Select
                  name="product_id"
                  value={formData.product_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">Seleccione un producto</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.sku} - {product.name}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Ubicación <span className="text-red-500">*</span>
                </label>
                <Select
                  name="location_id"
                  value={formData.location_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">Seleccione una ubicación</option>
                  {locations.map((location) => (
                    <option key={location.id} value={location.id}>
                      {location.code} - {location.name}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            {/* Lot Number and Batch Code */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Número de Lote"
                name="lot_number"
                value={formData.lot_number}
                onChange={handleChange}
                placeholder="Ej: LOT-2024-001"
                required
              />
              <Input
                label="Código de Batch"
                name="batch_code"
                value={formData.batch_code || ''}
                onChange={handleChange}
                placeholder="Código de batch opcional"
              />
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Input
                label="Fecha de Fabricación"
                name="manufacture_date"
                type="date"
                value={formData.manufacture_date || ''}
                onChange={handleChange}
              />
              <Input
                label="Fecha de Vencimiento"
                name="expiry_date"
                type="date"
                value={formData.expiry_date || ''}
                onChange={handleChange}
              />
              <Input
                label="Fecha de Recepción"
                name="received_date"
                type="date"
                value={formData.received_date || ''}
                onChange={handleChange}
              />
            </div>

            {/* Supplier */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Proveedor
              </label>
              <Select
                name="supplier_id"
                value={formData.supplier_id || ''}
                onChange={handleChange}
              >
                <option value="">Sin proveedor</option>
                {suppliers.map((supplier) => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </option>
                ))}
              </Select>
            </div>

            {/* Quantity and Cost */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Cantidad Inicial"
                name="initial_quantity"
                type="number"
                min="1"
                value={formData.initial_quantity}
                onChange={handleChange}
                required
              />
              <Input
                label="Costo Unitario"
                name="unit_cost"
                type="number"
                step="0.01"
                min="0"
                value={formData.unit_cost || ''}
                onChange={handleChange}
                placeholder="Opcional"
              />
            </div>

            {/* Notes */}
            <Textarea
              label="Notas"
              name="notes"
              value={formData.notes || ''}
              onChange={handleChange}
              placeholder="Notas adicionales sobre el lote..."
              rows={3}
            />

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/lots')}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" variant="primary" isLoading={isSubmitting}>
                Crear Lote
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
