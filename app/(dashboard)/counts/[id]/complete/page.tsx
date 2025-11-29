'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft,
  CheckCircle,
  AlertTriangle,
  Package,
  TrendingUp,
  TrendingDown,
  Minus,
  FileText,
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
import { Textarea } from '@/components/ui/Textarea';
import { Checkbox } from '@/components/ui/Checkbox';
import { Progress } from '@/components/ui/Progress';
import { DataTable } from '@/components/ui/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import {
  formatDiscrepancy,
  getDiscrepancyColor,
} from '@/lib/validations/count';
import type { InventoryCount, CountSummary, DiscrepancyItem } from '@/types';
import toast from 'react-hot-toast';

export default function CompleteCountPage() {
  const router = useRouter();
  const params = useParams();
  const countId = params.id as string;

  const [count, setCount] = useState<InventoryCount | null>(null);
  const [summary, setSummary] = useState<CountSummary | null>(null);
  const [discrepancies, setDiscrepancies] = useState<DiscrepancyItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [applyAdjustments, setApplyAdjustments] = useState(true);
  const [notes, setNotes] = useState('');

  // Load count details
  useEffect(() => {
    if (countId) {
      loadCountDetails();
    }
  }, [countId]);

  const loadCountDetails = async () => {
    try {
      setIsLoading(true);
      const [countData, summaryData, discrepanciesData] = await Promise.all([
        CountService.getById(countId),
        CountService.getSummary(countId),
        CountService.getDiscrepancies(countId),
      ]);

      // Check if count is in progress
      if (countData.status !== 'IN_PROGRESS') {
        toast.error('Esta sesión de conteo no está en progreso');
        router.push(`/counts/${countId}`);
        return;
      }

      setCount(countData);
      setSummary(summaryData);
      setDiscrepancies(discrepanciesData);
    } catch (error: any) {
      toast.error(error.message || 'Error al cargar el conteo');
      console.error('Error loading count:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Complete count
  const handleComplete = async () => {
    if (
      discrepancies.length > 0 &&
      applyAdjustments &&
      !confirm(
        `Se aplicarán ${discrepancies.length} ajustes de inventario. ¿Deseas continuar?`
      )
    ) {
      return;
    }

    try {
      setIsSubmitting(true);
      await CountService.complete(countId, {
        apply_adjustments: applyAdjustments,
        notes: notes || undefined,
      });

      toast.success(
        applyAdjustments
          ? 'Conteo completado y ajustes aplicados'
          : 'Conteo completado sin ajustes'
      );
      router.push(`/counts/${countId}`);
    } catch (error: any) {
      toast.error(error.message || 'Error al completar el conteo');
      console.error('Error completing count:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Discrepancies table columns
  const columns: ColumnDef<DiscrepancyItem>[] = [
    {
      accessorKey: 'product_name',
      header: 'Producto',
      cell: ({ row }) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-white">
            {row.original.product_name}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            SKU: {row.original.product_sku}
          </div>
          {row.original.product_barcode && (
            <div className="text-xs text-gray-400">
              {row.original.product_barcode}
            </div>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'expected_quantity',
      header: 'Esperado',
      cell: ({ row }) => (
        <div className="font-semibold text-gray-900 dark:text-white text-center">
          {row.original.expected_quantity}
        </div>
      ),
    },
    {
      accessorKey: 'counted_quantity',
      header: 'Contado',
      cell: ({ row }) => (
        <div className="font-semibold text-gray-900 dark:text-white text-center">
          {row.original.counted_quantity}
        </div>
      ),
    },
    {
      accessorKey: 'discrepancy',
      header: 'Diferencia',
      cell: ({ row }) => {
        const disc = row.original.discrepancy;
        return (
          <div
            className={`font-bold text-center ${getDiscrepancyColor(disc)}`}
          >
            {formatDiscrepancy(disc)}
          </div>
        );
      },
    },
    {
      accessorKey: 'discrepancy_type',
      header: 'Tipo',
      cell: ({ row }) => {
        const type = row.original.discrepancy_type;
        return (
          <Badge
            variant={type === 'shortage' ? 'destructive' : 'default'}
            className="flex items-center gap-1"
          >
            {type === 'shortage' ? (
              <>
                <TrendingDown className="h-3 w-3" />
                Faltante
              </>
            ) : (
              <>
                <TrendingUp className="h-3 w-3" />
                Sobrante
              </>
            )}
          </Badge>
        );
      },
    },
  ];

  // Calculate summary stats
  const shortages = discrepancies.filter((d) => d.discrepancy_type === 'shortage');
  const surpluses = discrepancies.filter((d) => d.discrepancy_type === 'surplus');
  const totalShortage = shortages.reduce((sum, d) => sum + Math.abs(d.discrepancy), 0);
  const totalSurplus = surpluses.reduce((sum, d) => sum + d.discrepancy, 0);

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
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push(`/counts/${countId}`)}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <CheckCircle className="h-7 w-7" />
            Finalizar Conteo
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Revisa el resumen y decide si aplicar ajustes de inventario
          </p>
        </div>
      </div>

      {/* Summary Stats */}
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
              <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                <TrendingDown className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Faltantes
                </div>
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                  -{totalShortage}
                </div>
                <div className="text-xs text-gray-500">
                  {shortages.length} productos
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Sobrantes
                </div>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  +{totalSurplus}
                </div>
                <div className="text-xs text-gray-500">
                  {surpluses.length} productos
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Resumen del Conteo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Progreso del conteo
              </span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {Math.round(summary?.progress || count.progress)}%
              </span>
            </div>
            <Progress value={summary?.progress || count.progress} className="h-3" />

            {(summary?.pending_products || count.items_count - count.items_counted) >
              0 && (
              <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                <p className="text-sm text-yellow-600 dark:text-yellow-400">
                  Hay{' '}
                  {summary?.pending_products ||
                    count.items_count - count.items_counted}{' '}
                  productos sin contar. Se registrarán con cantidad 0.
                </p>
              </div>
            )}

            <div className="grid grid-cols-3 gap-4 text-center mt-4">
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Esperado Total
                </div>
                <div className="font-bold text-xl text-gray-900 dark:text-white">
                  {summary?.total_expected || count.total_expected}
                </div>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Contado Total
                </div>
                <div className="font-bold text-xl text-gray-900 dark:text-white">
                  {summary?.total_counted || count.total_counted}
                </div>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Discrepancia Neta
                </div>
                <div
                  className={`font-bold text-xl ${getDiscrepancyColor(
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

      {/* Discrepancies Table */}
      {discrepancies.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Discrepancias Detectadas
            </CardTitle>
            <CardDescription>
              Se encontraron {discrepancies.length} productos con diferencias
              entre el stock esperado y el contado
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={columns}
              data={discrepancies}
              emptyMessage="No hay discrepancias"
            />
          </CardContent>
        </Card>
      )}

      {discrepancies.length === 0 && (
        <Card className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20">
          <CardContent className="py-8 text-center">
            <CheckCircle className="mx-auto h-12 w-12 text-green-600 dark:text-green-400" />
            <h3 className="mt-4 text-lg font-medium text-green-600 dark:text-green-400">
              Sin discrepancias
            </h3>
            <p className="mt-2 text-sm text-green-600/80 dark:text-green-400/80">
              Todos los productos contados coinciden con el stock esperado
            </p>
          </CardContent>
        </Card>
      )}

      {/* Completion Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Opciones de Finalización
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Apply Adjustments Checkbox */}
          {discrepancies.length > 0 && (
            <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <Checkbox
                id="apply-adjustments"
                checked={applyAdjustments}
                onCheckedChange={(checked) =>
                  setApplyAdjustments(checked as boolean)
                }
              />
              <div>
                <label
                  htmlFor="apply-adjustments"
                  className="font-medium text-gray-900 dark:text-white cursor-pointer"
                >
                  Aplicar ajustes de inventario
                </label>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Si está marcado, el stock de los productos con discrepancias
                  será actualizado automáticamente para coincidir con el conteo
                  físico.
                </p>
                {applyAdjustments && (
                  <div className="mt-2 p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded text-sm text-yellow-700 dark:text-yellow-300">
                    <strong>Atención:</strong> Esta acción modificará el stock
                    de {discrepancies.length} productos y creará transacciones
                    de ajuste.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Notas de finalización (opcional)
            </label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Agrega notas o comentarios sobre la finalización del conteo..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          onClick={() => router.push(`/counts/${countId}/scan`)}
        >
          Volver a Escanear
        </Button>

        <div className="flex gap-4">
          <Button variant="outline" onClick={() => router.push(`/counts/${countId}`)}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            leftIcon={<CheckCircle className="h-4 w-4" />}
            isLoading={isSubmitting}
            onClick={handleComplete}
          >
            {applyAdjustments && discrepancies.length > 0
              ? 'Completar y Aplicar Ajustes'
              : 'Completar Conteo'}
          </Button>
        </div>
      </div>
    </div>
  );
}
