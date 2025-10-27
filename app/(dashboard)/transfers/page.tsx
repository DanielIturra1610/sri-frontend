'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Eye, Truck, CheckCircle, XCircle, Trash2, ArrowRightLeft } from 'lucide-react';
import { TransferService } from '@/services/transferService';
import { Button, Card, CardHeader, CardTitle, CardContent, Badge, Skeleton } from '@/components/ui';
import { Can } from '@/components/auth';
import { PERMISSIONS } from '@/lib/constants/permissions';
import { DataTable } from '@/components/ui/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { transferStatusLabels, transferStatusColors } from '@/lib/validations/transfer';
import type { Transfer, TransferStatus } from '@/types';
import toast from 'react-hot-toast';

export default function TransfersPage() {
  const router = useRouter();
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<TransferStatus | 'all'>('all');

  // Load transfers
  useEffect(() => {
    loadTransfers();
  }, []);

  const loadTransfers = async () => {
    try {
      setIsLoading(true);
      const data = await TransferService.getTransfers();
      setTransfers(data);
    } catch (error: any) {
      toast.error(error.message || 'Error al cargar transferencias');
      console.error('Error loading transfers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle status change
  const handleStartTransit = async (id: string) => {
    try {
      await TransferService.updateStatus(id, 'in_transit');
      toast.success('Transferencia marcada como en tránsito');
      loadTransfers();
    } catch (error: any) {
      toast.error(error.message || 'Error al actualizar transferencia');
      console.error('Error updating transfer:', error);
    }
  };

  const handleComplete = async (id: string) => {
    if (!confirm('¿Confirmar que la transferencia se ha completado?')) {
      return;
    }

    try {
      await TransferService.completeTransfer(id);
      toast.success('Transferencia completada exitosamente');
      loadTransfers();
    } catch (error: any) {
      toast.error(error.message || 'Error al completar transferencia');
      console.error('Error completing transfer:', error);
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas cancelar esta transferencia?')) {
      return;
    }

    try {
      await TransferService.cancelTransfer(id);
      toast.success('Transferencia cancelada exitosamente');
      loadTransfers();
    } catch (error: any) {
      toast.error(error.message || 'Error al cancelar transferencia');
      console.error('Error cancelling transfer:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta transferencia?')) {
      return;
    }

    try {
      await TransferService.deleteTransfer(id);
      toast.success('Transferencia eliminada exitosamente');
      loadTransfers();
    } catch (error: any) {
      toast.error(error.message || 'Error al eliminar transferencia');
      console.error('Error deleting transfer:', error);
    }
  };

  // Filter transfers by status
  const filteredTransfers = statusFilter === 'all'
    ? transfers
    : transfers.filter((t) => t.status === statusFilter);

  // Table columns
  const columns: ColumnDef<Transfer>[] = [
    {
      accessorKey: 'product_sku',
      header: 'SKU',
      cell: ({ row }) => (
        <div className="font-mono font-medium text-gray-900 dark:text-white">
          {row.original.product_sku}
        </div>
      ),
    },
    {
      accessorKey: 'product_name',
      header: 'Producto',
      cell: ({ row }) => (
        <div className="font-medium text-gray-900 dark:text-white">
          {row.original.product_name}
        </div>
      ),
    },
    {
      accessorKey: 'from_location_name',
      header: 'Origen',
      cell: ({ row }) => (
        <div className="text-gray-700 dark:text-gray-300">
          {row.original.from_location_name}
        </div>
      ),
    },
    {
      accessorKey: 'to_location_name',
      header: 'Destino',
      cell: ({ row }) => (
        <div className="text-gray-700 dark:text-gray-300">
          {row.original.to_location_name}
        </div>
      ),
    },
    {
      accessorKey: 'quantity',
      header: 'Cantidad',
      cell: ({ row }) => (
        <div className="font-semibold text-gray-900 dark:text-white">
          {row.original.quantity}
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Estado',
      cell: ({ row }) => (
        <Badge variant={transferStatusColors[row.original.status]}>
          {transferStatusLabels[row.original.status] || row.original.status}
        </Badge>
      ),
    },
    {
      accessorKey: 'created_at',
      header: 'Fecha de Creación',
      cell: ({ row }) => (
        <div className="text-gray-600 dark:text-gray-400">
          {new Date(row.original.created_at).toLocaleDateString('es-CL')}
        </div>
      ),
    },
    {
      id: 'actions',
      header: 'Acciones',
      cell: ({ row }) => {
        const transfer = row.original;

        return (
          <div className="flex gap-2">
            {/* View Details */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(`/transfers/${transfer.id}`)}
              leftIcon={<Eye className="h-4 w-4" />}
            >
              Ver
            </Button>

            {/* Start Transit - Only for pending */}
            {transfer.status === 'pending' && (
              <Can permission={PERMISSIONS.PRODUCTS_UPDATE}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleStartTransit(transfer.id)}
                  leftIcon={<Truck className="h-4 w-4 text-blue-600" />}
                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950"
                >
                  En Tránsito
                </Button>
              </Can>
            )}

            {/* Complete - Only for in_transit */}
            {transfer.status === 'in_transit' && (
              <Can permission={PERMISSIONS.PRODUCTS_UPDATE}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleComplete(transfer.id)}
                  leftIcon={<CheckCircle className="h-4 w-4 text-green-600" />}
                  className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950"
                >
                  Completar
                </Button>
              </Can>
            )}

            {/* Cancel - For pending and in_transit */}
            {(transfer.status === 'pending' || transfer.status === 'in_transit') && (
              <Can permission={PERMISSIONS.PRODUCTS_DELETE}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCancel(transfer.id)}
                  leftIcon={<XCircle className="h-4 w-4 text-orange-600" />}
                  className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:hover:bg-orange-950"
                >
                  Cancelar
                </Button>
              </Can>
            )}

            {/* Delete - Only for pending */}
            {transfer.status === 'pending' && (
              <Can permission={PERMISSIONS.PRODUCTS_DELETE}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(transfer.id)}
                  leftIcon={<Trash2 className="h-4 w-4 text-red-600" />}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                >
                  Eliminar
                </Button>
              </Can>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <ArrowRightLeft className="h-7 w-7" />
            Transferencias
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gestiona transferencias de stock entre ubicaciones
          </p>
        </div>

        <Can permission={PERMISSIONS.PRODUCTS_CREATE}>
          <Button
            variant="primary"
            leftIcon={<Plus className="h-5 w-5" />}
            onClick={() => router.push('/transfers/create')}
          >
            Nueva Transferencia
          </Button>
        </Can>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Filtrar por estado:
            </span>
            <div className="flex gap-2">
              <Button
                variant={statusFilter === 'all' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('all')}
              >
                Todas ({transfers.length})
              </Button>
              <Button
                variant={statusFilter === 'pending' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('pending')}
              >
                Pendientes ({transfers.filter((t) => t.status === 'pending').length})
              </Button>
              <Button
                variant={statusFilter === 'in_transit' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('in_transit')}
              >
                En Tránsito ({transfers.filter((t) => t.status === 'in_transit').length})
              </Button>
              <Button
                variant={statusFilter === 'completed' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('completed')}
              >
                Completadas ({transfers.filter((t) => t.status === 'completed').length})
              </Button>
              <Button
                variant={statusFilter === 'cancelled' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('cancelled')}
              >
                Canceladas ({transfers.filter((t) => t.status === 'cancelled').length})
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Lista de Transferencias
            {statusFilter !== 'all' && (
              <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
                ({filteredTransfers.length} resultados)
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={filteredTransfers}
              isLoading={isLoading}
              emptyMessage={
                statusFilter === 'all'
                  ? 'No se encontraron transferencias'
                  : `No hay transferencias con estado "${transferStatusLabels[statusFilter]}"`
              }
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
