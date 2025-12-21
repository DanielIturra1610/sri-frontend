'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Edit, Trash2, Package, Calendar, AlertTriangle } from 'lucide-react';
import { LotService } from '@/services/lotService';
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Skeleton,
  NativeSelect,
} from '@/components/ui';
import { Can } from '@/components/auth';
import { PERMISSIONS } from '@/lib/constants/permissions';
import { DataTable } from '@/components/ui/DataTable';
import { LotStatusBadge } from '@/components/lots';
import { ColumnDef } from '@tanstack/react-table';
import type { Lot, LotStatus } from '@/types';
import toast from 'react-hot-toast';

export default function LotsPage() {
  const router = useRouter();
  const [lots, setLots] = useState<Lot[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<LotStatus | ''>('');
  const [expiringCount, setExpiringCount] = useState(0);

  useEffect(() => {
    loadLots();
    loadExpiringCount();
  }, [statusFilter]);

  const loadLots = async () => {
    try {
      setIsLoading(true);
      const filters = statusFilter ? { status: statusFilter } : undefined;
      const data = await LotService.getLots(filters);
      setLots(data.lots);
      setTotal(data.total);
    } catch (error: any) {
      toast.error(error.message || 'Error al cargar lotes');
      console.error('Error loading lots:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadExpiringCount = async () => {
    try {
      const expiringLots = await LotService.getExpiringLots(30);
      setExpiringCount(expiringLots.length);
    } catch (error) {
      console.error('Error loading expiring lots:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este lote?')) {
      return;
    }

    try {
      await LotService.deleteLot(id);
      toast.success('Lote eliminado exitosamente');
      loadLots();
    } catch (error: any) {
      toast.error(error.message || 'Error al eliminar lote');
      console.error('Error deleting lot:', error);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('es-CL');
  };

  const columns: ColumnDef<Lot>[] = [
    {
      accessorKey: 'lot_number',
      header: 'Número de Lote',
      cell: ({ row }) => (
        <div className="font-mono font-medium text-gray-900 dark:text-white">
          {row.original.lot_number}
        </div>
      ),
    },
    {
      accessorKey: 'product_name',
      header: 'Producto',
      cell: ({ row }) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-white">
            {row.original.product_name || '-'}
          </div>
          {row.original.product_sku && (
            <div className="text-xs text-gray-500 font-mono">{row.original.product_sku}</div>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'location_name',
      header: 'Ubicación',
      cell: ({ row }) => (
        <div className="text-gray-700 dark:text-gray-300">
          {row.original.location_name || '-'}
        </div>
      ),
    },
    {
      accessorKey: 'current_quantity',
      header: 'Cantidad',
      cell: ({ row }) => (
        <div className="font-medium text-gray-900 dark:text-white">
          {row.original.current_quantity}
          {row.original.is_low_stock && (
            <span className="ml-2 text-amber-500" title="Stock bajo">
              <AlertTriangle className="h-4 w-4 inline" />
            </span>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'expiry_date',
      header: 'Fecha Vencimiento',
      cell: ({ row }) => {
        const lot = row.original;
        return (
          <div className="flex flex-col">
            <span className={lot.is_expired ? 'text-red-600 font-medium' : 'text-gray-700 dark:text-gray-300'}>
              {formatDate(lot.expiry_date)}
            </span>
            {lot.days_until_expiry !== undefined && lot.days_until_expiry !== null && (
              <span className={`text-xs ${lot.days_until_expiry < 0 ? 'text-red-500' : lot.days_until_expiry <= 30 ? 'text-amber-500' : 'text-gray-500'}`}>
                {lot.days_until_expiry < 0
                  ? `Vencido hace ${Math.abs(lot.days_until_expiry)} días`
                  : lot.days_until_expiry === 0
                  ? 'Vence hoy'
                  : `${lot.days_until_expiry} días restantes`}
              </span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'status',
      header: 'Estado',
      cell: ({ row }) => <LotStatusBadge status={row.original.status} />,
    },
    {
      id: 'actions',
      header: 'Acciones',
      cell: ({ row }) => {
        const lot = row.original;

        return (
          <div className="flex gap-2">
            <Can permission={PERMISSIONS.INVENTORY_ADJUST}>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push(`/lots/${lot.id}/edit`)}
                leftIcon={<Edit className="h-4 w-4" />}
              >
                Editar
              </Button>
            </Can>

            <Can permission={PERMISSIONS.INVENTORY_ADJUST}>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(lot.id)}
                leftIcon={<Trash2 className="h-4 w-4 text-red-600" />}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
              >
                Eliminar
              </Button>
            </Can>
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
            <Package className="h-7 w-7" />
            Lotes y Trazabilidad
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gestiona los lotes de productos y su trazabilidad
          </p>
        </div>

        <Can permission={PERMISSIONS.INVENTORY_ADJUST}>
          <Button
            variant="primary"
            leftIcon={<Plus className="h-5 w-5" />}
            onClick={() => router.push('/lots/create')}
          >
            Nuevo Lote
          </Button>
        </Can>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Package className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Lotes</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                <Package className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Disponibles</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {lots.filter((l) => l.status === 'available').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-100 dark:bg-amber-900 rounded-lg">
                <Calendar className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Por Vencer (30 días)</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{expiringCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="w-48">
              <NativeSelect
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as LotStatus | '')}
              >
                <option value="">Todos los estados</option>
                <option value="available">Disponible</option>
                <option value="expired">Vencido</option>
                <option value="quarantine">Cuarentena</option>
                <option value="consumed">Consumido</option>
                <option value="recalled">Retirado</option>
              </NativeSelect>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Lotes</CardTitle>
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
              data={lots}
              isLoading={isLoading}
              emptyMessage="No se encontraron lotes"
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
