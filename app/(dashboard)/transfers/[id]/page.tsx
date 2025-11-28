'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Package, MapPin, ArrowRightLeft, Truck, CheckCircle, XCircle, User, Calendar } from 'lucide-react';
import { TransferService } from '@/services/transferService';
import { Button, Card, CardHeader, CardTitle, CardContent, Badge, Alert, Skeleton } from '@/components/ui';
import { Can } from '@/components/auth';
import { PERMISSIONS } from '@/lib/constants/permissions';
import { transferStatusLabels, transferStatusColors } from '@/lib/validations/transfer';
import type { Transfer } from '@/types';
import toast from 'react-hot-toast';

export default function TransferDetailPage() {
  const router = useRouter();
  const params = useParams();
  const transferId = params.id as string;

  const [transfer, setTransfer] = useState<Transfer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Load transfer details
  useEffect(() => {
    const loadTransfer = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await TransferService.getTransfer(transferId);
        setTransfer(data);
      } catch (error: any) {
        setError(error.message || 'Error al cargar la transferencia');
        toast.error('Error al cargar la transferencia');
        console.error('Error loading transfer:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (transferId) {
      loadTransfer();
    }
  }, [transferId]);

  // Handle status change
  const handleStartTransit = async () => {
    try {
      setIsUpdating(true);
      await TransferService.updateStatus(transferId, 'in_transit');
      toast.success('Transferencia marcada como en tránsito');
      // Reload transfer
      const updated = await TransferService.getTransfer(transferId);
      setTransfer(updated);
    } catch (error: any) {
      toast.error(error.message || 'Error al actualizar transferencia');
      console.error('Error updating transfer:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleComplete = async () => {
    if (!confirm('¿Confirmar que la transferencia se ha completado?')) {
      return;
    }

    try {
      setIsUpdating(true);
      await TransferService.completeTransfer(transferId);
      toast.success('Transferencia completada exitosamente');
      // Reload transfer
      const updated = await TransferService.getTransfer(transferId);
      setTransfer(updated);
    } catch (error: any) {
      toast.error(error.message || 'Error al completar transferencia');
      console.error('Error completing transfer:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm('¿Estás seguro de que deseas cancelar esta transferencia?')) {
      return;
    }

    try {
      setIsUpdating(true);
      await TransferService.cancelTransfer(transferId);
      toast.success('Transferencia cancelada exitosamente');
      // Reload transfer
      const updated = await TransferService.getTransfer(transferId);
      setTransfer(updated);
    } catch (error: any) {
      toast.error(error.message || 'Error al cancelar transferencia');
      console.error('Error cancelling transfer:', error);
    } finally {
      setIsUpdating(false);
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
          </div>
          <div className="space-y-6">
            <Skeleton className="h-32" />
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !transfer) {
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
          {error || 'Transferencia no encontrada'}
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
                Transferencia
              </h1>
              <Badge variant={transferStatusColors[transfer.status]}>
                {transferStatusLabels[transfer.status]}
              </Badge>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {transfer.product_sku} - {transfer.product_name}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          {/* Start Transit - Only for pending */}
          {transfer.status === 'pending' && (
            <Can permission={PERMISSIONS.PRODUCTS_UPDATE}>
              <Button
                variant="outline"
                leftIcon={<Truck className="h-4 w-4" />}
                onClick={handleStartTransit}
                isLoading={isUpdating}
              >
                Marcar En Tránsito
              </Button>
            </Can>
          )}

          {/* Complete - Only for in_transit */}
          {transfer.status === 'in_transit' && (
            <Can permission={PERMISSIONS.PRODUCTS_UPDATE}>
              <Button
                variant="primary"
                leftIcon={<CheckCircle className="h-4 w-4" />}
                onClick={handleComplete}
                isLoading={isUpdating}
              >
                Completar Transferencia
              </Button>
            </Can>
          )}

          {/* Cancel - For pending and in_transit */}
          {(transfer.status === 'pending' || transfer.status === 'in_transit') && (
            <Can permission={PERMISSIONS.PRODUCTS_DELETE}>
              <Button
                variant="danger"
                leftIcon={<XCircle className="h-4 w-4" />}
                onClick={handleCancel}
                isLoading={isUpdating}
              >
                Cancelar
              </Button>
            </Can>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Transfer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowRightLeft className="h-5 w-5" />
                Detalles de la Transferencia
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Product */}
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Producto
                </label>
                <p className="text-gray-900 dark:text-white font-medium mt-1">
                  <span className="font-mono">{transfer.product_sku}</span> - {transfer.product_name}
                </p>
              </div>

              {/* Locations */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Ubicación de Origen
                  </label>
                  <p className="text-gray-900 dark:text-white font-medium mt-1">
                    {transfer.from_location_name}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Ubicación de Destino
                  </label>
                  <p className="text-gray-900 dark:text-white font-medium mt-1">
                    {transfer.to_location_name}
                  </p>
                </div>
              </div>

              {/* Quantity */}
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Cantidad
                </label>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {transfer.quantity}
                </p>
              </div>

              {/* Reason */}
              {transfer.reason && (
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Razón
                  </label>
                  <p className="text-gray-900 dark:text-white mt-1">
                    {transfer.reason}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Status Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Línea de Tiempo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Created */}
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                    <Package className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">
                      Transferencia Creada
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {new Date(transfer.created_at).toLocaleString('es-CL')}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                      Creado por: {transfer.created_by || 'N/A'}
                    </p>
                  </div>
                </div>

                {/* In Transit */}
                {(transfer.status === 'in_transit' || transfer.status === 'completed') && (
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                      <Truck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">
                        En Tránsito
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Transferencia iniciada
                      </p>
                    </div>
                  </div>
                )}

                {/* Completed */}
                {transfer.status === 'completed' && transfer.completed_at && (
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                      <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">
                        Completada
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {new Date(transfer.completed_at).toLocaleString('es-CL')}
                      </p>
                      {transfer.completed_by && (
                        <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                          Completado por: {transfer.completed_by}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Cancelled */}
                {transfer.status === 'cancelled' && (
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
                      <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">
                        Cancelada
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Transferencia cancelada
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Card */}
          <Card>
            <CardHeader>
              <CardTitle>Estado Actual</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Estado</span>
                <Badge variant={transferStatusColors[transfer.status]}>
                  {transferStatusLabels[transfer.status]}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Creado</span>
                <span className="text-sm text-gray-900 dark:text-white">
                  {new Date(transfer.created_at).toLocaleDateString('es-CL')}
                </span>
              </div>
              {transfer.completed_at && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Completado</span>
                  <span className="text-sm text-gray-900 dark:text-white">
                    {new Date(transfer.completed_at).toLocaleDateString('es-CL')}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Next Steps */}
          {transfer.status !== 'completed' && transfer.status !== 'cancelled' && (
            <Card>
              <CardHeader>
                <CardTitle>Próximos Pasos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {transfer.status === 'pending' && (
                    <p>
                      Esta transferencia está pendiente de inicio. Puede marcarla como &quot;En Tránsito&quot; cuando se haya despachado el producto.
                    </p>
                  )}
                  {transfer.status === 'in_transit' && (
                    <p>
                      Esta transferencia está en tránsito. Puede marcarla como &quot;Completada&quot; cuando el producto llegue a la ubicación de destino.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
