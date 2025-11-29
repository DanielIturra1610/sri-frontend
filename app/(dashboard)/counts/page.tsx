'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Eye,
  Play,
  CheckCircle,
  XCircle,
  Trash2,
  ClipboardList,
  Camera,
} from 'lucide-react';
import { CountService } from '@/services/countService';
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
  Skeleton,
} from '@/components/ui';
import { Progress } from '@/components/ui/Progress';
import { Can } from '@/components/auth';
import { PERMISSIONS } from '@/lib/constants/permissions';
import { DataTable } from '@/components/ui/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { countStatusLabels, countStatusColors } from '@/lib/validations/count';
import type { InventoryCount, CountStatus } from '@/types';
import toast from 'react-hot-toast';

export default function CountsPage() {
  const router = useRouter();
  const [counts, setCounts] = useState<InventoryCount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<CountStatus | 'all'>('all');

  // Load counts
  useEffect(() => {
    loadCounts();
  }, []);

  const loadCounts = async () => {
    try {
      setIsLoading(true);
      const data = await CountService.list();
      setCounts(data.counts);
    } catch (error: any) {
      toast.error(error.message || 'Error al cargar los conteos');
      console.error('Error loading counts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Start a count session
  const handleStart = async (id: string) => {
    try {
      await CountService.start(id);
      toast.success('Sesión de conteo iniciada');
      loadCounts();
    } catch (error: any) {
      toast.error(error.message || 'Error al iniciar el conteo');
      console.error('Error starting count:', error);
    }
  };

  // Cancel a count session
  const handleCancel = async (id: string) => {
    const reason = prompt('Ingresa el motivo de la cancelación:');
    if (!reason) return;

    try {
      await CountService.cancel(id, { reason });
      toast.success('Sesión de conteo cancelada');
      loadCounts();
    } catch (error: any) {
      toast.error(error.message || 'Error al cancelar el conteo');
      console.error('Error cancelling count:', error);
    }
  };

  // Delete a count session (only DRAFT)
  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este conteo?')) {
      return;
    }

    try {
      await CountService.delete(id);
      toast.success('Sesión de conteo eliminada');
      loadCounts();
    } catch (error: any) {
      toast.error(error.message || 'Error al eliminar el conteo');
      console.error('Error deleting count:', error);
    }
  };

  // Filter counts by status
  const filteredCounts =
    statusFilter === 'all'
      ? counts
      : counts.filter((c) => c.status === statusFilter);

  // Table columns
  const columns: ColumnDef<InventoryCount>[] = [
    {
      accessorKey: 'location',
      header: 'Ubicación',
      cell: ({ row }) => (
        <div className="font-medium text-gray-900 dark:text-white">
          {row.original.location?.name || 'Sin ubicación'}
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Estado',
      cell: ({ row }) => (
        <Badge variant={countStatusColors[row.original.status]}>
          {countStatusLabels[row.original.status] || row.original.status}
        </Badge>
      ),
    },
    {
      accessorKey: 'progress',
      header: 'Progreso',
      cell: ({ row }) => (
        <div className="w-32">
          <div className="flex items-center gap-2">
            <Progress value={row.original.progress} className="h-2" />
            <span className="text-xs text-gray-600 dark:text-gray-400 w-10">
              {Math.round(row.original.progress)}%
            </span>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {row.original.items_counted}/{row.original.items_count} items
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'total_discrepancy',
      header: 'Discrepancia',
      cell: ({ row }) => {
        const disc = row.original.total_discrepancy;
        const color =
          disc === 0
            ? 'text-green-600 dark:text-green-400'
            : disc > 0
            ? 'text-blue-600 dark:text-blue-400'
            : 'text-red-600 dark:text-red-400';
        return (
          <div className={`font-semibold ${color}`}>
            {disc > 0 ? `+${disc}` : disc}
          </div>
        );
      },
    },
    {
      accessorKey: 'created_at',
      header: 'Creado',
      cell: ({ row }) => (
        <div className="text-gray-600 dark:text-gray-400">
          {new Date(row.original.created_at).toLocaleDateString('es-CL', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })}
        </div>
      ),
    },
    {
      id: 'actions',
      header: 'Acciones',
      cell: ({ row }) => {
        const count = row.original;

        return (
          <div className="flex gap-2">
            {/* View/Continue Counting */}
            {count.status === 'IN_PROGRESS' && (
              <Can permission={PERMISSIONS.COUNTS_EXECUTE}>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => router.push(`/counts/${count.id}/scan`)}
                  leftIcon={<Camera className="h-4 w-4" />}
                >
                  Escanear
                </Button>
              </Can>
            )}

            {/* View Details */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(`/counts/${count.id}`)}
              leftIcon={<Eye className="h-4 w-4" />}
            >
              Ver
            </Button>

            {/* Start - Only for DRAFT */}
            {count.status === 'DRAFT' && (
              <Can permission={PERMISSIONS.COUNTS_EXECUTE}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleStart(count.id)}
                  leftIcon={<Play className="h-4 w-4 text-green-600" />}
                  className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950"
                >
                  Iniciar
                </Button>
              </Can>
            )}

            {/* Complete - Only for IN_PROGRESS */}
            {count.status === 'IN_PROGRESS' && (
              <Can permission={PERMISSIONS.COUNTS_COMPLETE}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push(`/counts/${count.id}/complete`)}
                  leftIcon={<CheckCircle className="h-4 w-4 text-blue-600" />}
                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950"
                >
                  Finalizar
                </Button>
              </Can>
            )}

            {/* Cancel - For DRAFT and IN_PROGRESS */}
            {(count.status === 'DRAFT' || count.status === 'IN_PROGRESS') && (
              <Can permission={PERMISSIONS.COUNTS_CANCEL}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCancel(count.id)}
                  leftIcon={<XCircle className="h-4 w-4 text-orange-600" />}
                  className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:hover:bg-orange-950"
                >
                  Cancelar
                </Button>
              </Can>
            )}

            {/* Delete - Only for DRAFT */}
            {count.status === 'DRAFT' && (
              <Can permission={PERMISSIONS.COUNTS_CREATE}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(count.id)}
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
            <ClipboardList className="h-7 w-7" />
            Conteo Físico
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gestiona sesiones de conteo físico de inventario
          </p>
        </div>

        <Can permission={PERMISSIONS.COUNTS_CREATE}>
          <Button
            variant="primary"
            leftIcon={<Plus className="h-5 w-5" />}
            onClick={() => router.push('/counts/create')}
          >
            Nueva Sesión
          </Button>
        </Can>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Total de Sesiones
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {counts.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              En Progreso
            </div>
            <div className="text-2xl font-bold text-warning">
              {counts.filter((c) => c.status === 'IN_PROGRESS').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Completadas
            </div>
            <div className="text-2xl font-bold text-success">
              {counts.filter((c) => c.status === 'COMPLETED').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Borradores
            </div>
            <div className="text-2xl font-bold text-gray-500">
              {counts.filter((c) => c.status === 'DRAFT').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Filtrar por estado:
            </span>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={statusFilter === 'all' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('all')}
              >
                Todas ({counts.length})
              </Button>
              <Button
                variant={statusFilter === 'DRAFT' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('DRAFT')}
              >
                Borradores ({counts.filter((c) => c.status === 'DRAFT').length})
              </Button>
              <Button
                variant={statusFilter === 'IN_PROGRESS' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('IN_PROGRESS')}
              >
                En Progreso (
                {counts.filter((c) => c.status === 'IN_PROGRESS').length})
              </Button>
              <Button
                variant={statusFilter === 'COMPLETED' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('COMPLETED')}
              >
                Completadas (
                {counts.filter((c) => c.status === 'COMPLETED').length})
              </Button>
              <Button
                variant={statusFilter === 'CANCELLED' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('CANCELLED')}
              >
                Canceladas (
                {counts.filter((c) => c.status === 'CANCELLED').length})
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Sesiones de Conteo
            {statusFilter !== 'all' && (
              <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
                ({filteredCounts.length} resultados)
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
              data={filteredCounts}
              isLoading={isLoading}
              emptyMessage={
                statusFilter === 'all'
                  ? 'No hay sesiones de conteo. Crea una nueva sesión para comenzar.'
                  : `No hay sesiones con estado "${countStatusLabels[statusFilter]}"`
              }
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
