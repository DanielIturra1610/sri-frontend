'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft,
  ClipboardList,
  Play,
  Camera,
  CheckCircle,
  XCircle,
  MapPin,
  Clock,
  User,
  Package,
  AlertTriangle,
} from 'lucide-react';
import { CountService } from '@/services/countService';
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  Badge,
  Skeleton,
} from '@/components/ui';
import { Progress } from '@/components/ui/Progress';
import { DataTable } from '@/components/ui/DataTable';
import { Can } from '@/components/auth';
import { PERMISSIONS } from '@/lib/constants/permissions';
import { ColumnDef } from '@tanstack/react-table';
import {
  countStatusLabels,
  countStatusColors,
  formatDiscrepancy,
  getDiscrepancyColor,
} from '@/lib/validations/count';
import type { InventoryCount, InventoryCountItem, CountSummary } from '@/types';
import toast from 'react-hot-toast';

export default function CountDetailPage() {
  const router = useRouter();
  const params = useParams();
  const countId = params.id as string;

  const [count, setCount] = useState<InventoryCount | null>(null);
  const [summary, setSummary] = useState<CountSummary | null>(null);
  const [items, setItems] = useState<InventoryCountItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load count details
  useEffect(() => {
    if (countId) {
      loadCountDetails();
    }
  }, [countId]);

  const loadCountDetails = async () => {
    try {
      setIsLoading(true);
      const [countData, summaryData, itemsData] = await Promise.all([
        CountService.getById(countId),
        CountService.getSummary(countId).catch(() => null),
        CountService.getItems(countId),
      ]);
      setCount(countData);
      setSummary(summaryData);
      setItems(itemsData);
    } catch (error: any) {
      toast.error(error.message || 'Error al cargar el conteo');
      console.error('Error loading count:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Start count
  const handleStart = async () => {
    try {
      await CountService.start(countId);
      toast.success('Sesión de conteo iniciada');
      loadCountDetails();
    } catch (error: any) {
      toast.error(error.message || 'Error al iniciar el conteo');
    }
  };

  // Cancel count
  const handleCancel = async () => {
    const reason = prompt('Ingresa el motivo de la cancelación:');
    if (!reason) return;

    try {
      await CountService.cancel(countId, { reason });
      toast.success('Sesión de conteo cancelada');
      loadCountDetails();
    } catch (error: any) {
      toast.error(error.message || 'Error al cancelar el conteo');
    }
  };

  // Items table columns
  const columns: ColumnDef<InventoryCountItem>[] = [
    {
      accessorKey: 'product',
      header: 'Producto',
      cell: ({ row }) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-white">
            {row.original.product?.name || 'Producto desconocido'}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            SKU: {row.original.product?.sku || '-'}
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'expected_quantity',
      header: 'Esperado',
      cell: ({ row }) => (
        <div className="font-semibold text-gray-900 dark:text-white">
          {row.original.expected_quantity}
        </div>
      ),
    },
    {
      accessorKey: 'counted_quantity',
      header: 'Contado',
      cell: ({ row }) => (
        <div className="font-semibold text-gray-900 dark:text-white">
          {row.original.is_counted ? row.original.counted_quantity : '-'}
        </div>
      ),
    },
    {
      accessorKey: 'discrepancy',
      header: 'Discrepancia',
      cell: ({ row }) => {
        if (!row.original.is_counted) {
          return <span className="text-gray-400">-</span>;
        }
        const disc = row.original.discrepancy || 0;
        return (
          <div className={`font-semibold ${getDiscrepancyColor(disc)}`}>
            {formatDiscrepancy(disc)}
          </div>
        );
      },
    },
    {
      accessorKey: 'is_counted',
      header: 'Estado',
      cell: ({ row }) => (
        <Badge variant={row.original.is_counted ? 'success' : 'secondary'}>
          {row.original.is_counted ? 'Contado' : 'Pendiente'}
        </Badge>
      ),
    },
    {
      accessorKey: 'counted_at',
      header: 'Fecha Conteo',
      cell: ({ row }) =>
        row.original.counted_at ? (
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {new Date(row.original.counted_at).toLocaleString('es-CL')}
          </div>
        ) : (
          <span className="text-gray-400">-</span>
        ),
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!count) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="mx-auto h-12 w-12 text-yellow-500" />
        <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
          Conteo no encontrado
        </h3>
        <p className="mt-2 text-gray-500 dark:text-gray-400">
          El conteo que buscas no existe o ha sido eliminado.
        </p>
        <Button
          variant="primary"
          className="mt-6"
          onClick={() => router.push('/counts')}
        >
          Volver a Conteos
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <ClipboardList className="h-7 w-7" />
              Detalle de Conteo
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {count.location?.name || 'Ubicación desconocida'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge
            variant={countStatusColors[count.status]}
            className="text-sm px-3 py-1"
          >
            {countStatusLabels[count.status]}
          </Badge>

          {/* Actions based on status */}
          {count.status === 'DRAFT' && (
            <Can permission={PERMISSIONS.COUNTS_EXECUTE}>
              <Button
                variant="success"
                leftIcon={<Play className="h-4 w-4" />}
                onClick={handleStart}
              >
                Iniciar Conteo
              </Button>
            </Can>
          )}

          {count.status === 'IN_PROGRESS' && (
            <>
              <Can permission={PERMISSIONS.COUNTS_EXECUTE}>
                <Button
                  variant="primary"
                  leftIcon={<Camera className="h-4 w-4" />}
                  onClick={() => router.push(`/counts/${countId}/scan`)}
                >
                  Escanear
                </Button>
              </Can>
              <Can permission={PERMISSIONS.COUNTS_COMPLETE}>
                <Button
                  variant="outline"
                  leftIcon={<CheckCircle className="h-4 w-4" />}
                  onClick={() => router.push(`/counts/${countId}/complete`)}
                >
                  Finalizar
                </Button>
              </Can>
              <Can permission={PERMISSIONS.COUNTS_CANCEL}>
                <Button
                  variant="destructive"
                  leftIcon={<XCircle className="h-4 w-4" />}
                  onClick={handleCancel}
                >
                  Cancelar
                </Button>
              </Can>
            </>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Package className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Total Productos
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {summary?.total_products || count.items_count}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Contados
                </div>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {summary?.counted_products || count.items_counted}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Pendientes
                </div>
                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {summary?.pending_products ||
                    count.items_count - count.items_counted}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Con Discrepancia
                </div>
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {summary?.with_discrepancy || 0}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Progreso del Conteo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Progreso general
              </span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {Math.round(count.progress)}%
              </span>
            </div>
            <Progress value={count.progress} className="h-3" />
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Esperado
                </div>
                <div className="font-bold text-gray-900 dark:text-white">
                  {summary?.total_expected || count.total_expected}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Contado
                </div>
                <div className="font-bold text-gray-900 dark:text-white">
                  {summary?.total_counted || count.total_counted}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Discrepancia
                </div>
                <div
                  className={`font-bold ${getDiscrepancyColor(
                    summary?.total_discrepancy || count.total_discrepancy
                  )}`}
                >
                  {formatDiscrepancy(
                    summary?.total_discrepancy || count.total_discrepancy
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Ubicación
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Nombre:
                </span>
                <span className="ml-2 font-medium text-gray-900 dark:text-white">
                  {count.location?.name || '-'}
                </span>
              </div>
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Código:
                </span>
                <span className="ml-2 font-medium text-gray-900 dark:text-white">
                  {count.location?.code || '-'}
                </span>
              </div>
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Tipo:
                </span>
                <span className="ml-2 font-medium text-gray-900 dark:text-white">
                  {count.location?.type || '-'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Información de Sesión
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Creado:
                </span>
                <span className="ml-2 font-medium text-gray-900 dark:text-white">
                  {new Date(count.created_at).toLocaleString('es-CL')}
                </span>
              </div>
              {count.started_at && (
                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Iniciado:
                  </span>
                  <span className="ml-2 font-medium text-gray-900 dark:text-white">
                    {new Date(count.started_at).toLocaleString('es-CL')}
                  </span>
                </div>
              )}
              {count.completed_at && (
                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Completado:
                  </span>
                  <span className="ml-2 font-medium text-gray-900 dark:text-white">
                    {new Date(count.completed_at).toLocaleString('es-CL')}
                  </span>
                </div>
              )}
              {count.notes && (
                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Notas:
                  </span>
                  <p className="mt-1 text-gray-900 dark:text-white">
                    {count.notes}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Items Table */}
      <Card>
        <CardHeader>
          <CardTitle>Items del Conteo</CardTitle>
          <CardDescription>
            Lista de todos los productos incluidos en esta sesión de conteo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={items}
            emptyMessage="No hay productos en este conteo"
          />
        </CardContent>
      </Card>
    </div>
  );
}
