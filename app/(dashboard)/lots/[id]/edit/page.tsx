'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Package, Minus, Plus } from 'lucide-react';
import { LotService } from '@/services/lotService';
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
import { LotStatusBadge } from '@/components/lots';
import type { Lot, Supplier, UpdateLotDTO, LotStatus } from '@/types';
import toast from 'react-hot-toast';

export default function EditLotPage() {
  const router = useRouter();
  const params = useParams();
  const lotId = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lot, setLot] = useState<Lot | null>(null);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [adjustQuantity, setAdjustQuantity] = useState(0);
  const [adjustReason, setAdjustReason] = useState('');

  const [formData, setFormData] = useState<UpdateLotDTO>({
    lot_number: '',
    batch_code: '',
    manufacture_date: '',
    expiry_date: '',
    received_date: '',
    supplier_id: '',
    unit_cost: undefined,
    status: undefined,
    notes: '',
  });

  useEffect(() => {
    if (lotId) {
      loadData();
    }
  }, [lotId]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [lotData, suppliersData] = await Promise.all([
        LotService.getLot(lotId),
        SupplierService.getSuppliers(),
      ]);
      setLot(lotData);
      setSuppliers(suppliersData.suppliers.filter((s) => s.is_active));

      setFormData({
        lot_number: lotData.lot_number,
        batch_code: lotData.batch_code || '',
        manufacture_date: lotData.manufacture_date || '',
        expiry_date: lotData.expiry_date || '',
        received_date: lotData.received_date || '',
        supplier_id: lotData.supplier_id || '',
        unit_cost: lotData.unit_cost,
        status: lotData.status,
        notes: lotData.notes || '',
      });
    } catch (error: any) {
      toast.error(error.message || 'Error al cargar lote');
      console.error('Error loading lot:', error);
      router.push('/lots');
    } finally {
      setIsLoading(false);
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

    if (!formData.lot_number?.trim()) {
      toast.error('El número de lote es requerido');
      return;
    }

    try {
      setIsSubmitting(true);
      await LotService.updateLot(lotId, {
        ...formData,
        supplier_id: formData.supplier_id || undefined,
      });
      toast.success('Lote actualizado exitosamente');
      router.push('/lots');
    } catch (error: any) {
      toast.error(error.message || 'Error al actualizar lote');
      console.error('Error updating lot:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAdjustQuantity = async () => {
    if (adjustQuantity === 0) {
      toast.error('Ingrese una cantidad a ajustar');
      return;
    }
    if (!adjustReason.trim()) {
      toast.error('Ingrese el motivo del ajuste');
      return;
    }

    try {
      setIsSubmitting(true);
      await LotService.adjustQuantity(lotId, {
        quantity_change: adjustQuantity,
        reason: adjustReason,
      });
      toast.success('Cantidad ajustada exitosamente');
      setShowAdjustModal(false);
      setAdjustQuantity(0);
      setAdjustReason('');
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Error al ajustar cantidad');
      console.error('Error adjusting quantity:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!lot) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.push('/lots')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Package className="h-7 w-7" />
            Editar Lote
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {lot.lot_number} - {lot.product_name}
          </p>
        </div>
        <LotStatusBadge status={lot.status} size="lg" />
      </div>

      {/* Current Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>Información Actual</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-500">Producto</p>
              <p className="font-medium">{lot.product_name}</p>
              <p className="text-xs text-gray-400">{lot.product_sku}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Ubicación</p>
              <p className="font-medium">{lot.location_name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Cantidad Inicial</p>
              <p className="font-medium">{lot.initial_quantity}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Cantidad Actual</p>
              <p className="font-medium text-lg">{lot.current_quantity}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Adjust Quantity Card */}
      <Card>
        <CardHeader>
          <CardTitle>Ajustar Cantidad</CardTitle>
        </CardHeader>
        <CardContent>
          {showAdjustModal ? (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAdjustQuantity((prev) => prev - 1)}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Input
                  type="number"
                  value={adjustQuantity}
                  onChange={(e) => setAdjustQuantity(parseInt(e.target.value) || 0)}
                  className="w-24 text-center"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAdjustQuantity((prev) => prev + 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
                <span className="text-gray-500">
                  Nueva cantidad: {lot.current_quantity + adjustQuantity}
                </span>
              </div>
              <Textarea
                label="Motivo del ajuste"
                value={adjustReason}
                onChange={(e) => setAdjustReason(e.target.value)}
                placeholder="Ingrese el motivo del ajuste..."
                rows={2}
              />
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAdjustModal(false);
                    setAdjustQuantity(0);
                    setAdjustReason('');
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  variant="primary"
                  onClick={handleAdjustQuantity}
                  isLoading={isSubmitting}
                  disabled={adjustQuantity === 0 || !adjustReason.trim()}
                >
                  Aplicar Ajuste
                </Button>
              </div>
            </div>
          ) : (
            <Button variant="outline" onClick={() => setShowAdjustModal(true)}>
              Ajustar Cantidad
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Edit Form */}
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Editar Información del Lote</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Lot Number and Batch Code */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Número de Lote"
                name="lot_number"
                value={formData.lot_number || ''}
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

            {/* Supplier and Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Estado
                </label>
                <Select
                  name="status"
                  value={formData.status || ''}
                  onChange={handleChange}
                >
                  <option value="available">Disponible</option>
                  <option value="expired">Vencido</option>
                  <option value="quarantine">Cuarentena</option>
                  <option value="consumed">Consumido</option>
                  <option value="recalled">Retirado</option>
                </Select>
              </div>
            </div>

            {/* Cost */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                Guardar Cambios
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
