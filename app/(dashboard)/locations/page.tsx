'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Edit, Trash2, MapPin } from 'lucide-react';
import { LocationService } from '@/services/locationService';
import { Button, Card, CardHeader, CardTitle, CardContent, Badge, Skeleton } from '@/components/ui';
import { Can } from '@/components/auth';
import { PERMISSIONS } from '@/lib/constants/permissions';
import { DataTable } from '@/components/ui/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { locationTypeLabels } from '@/lib/validations/location';
import type { Location } from '@/types';
import toast from 'react-hot-toast';

export default function LocationsPage() {
  const router = useRouter();
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load locations
  useEffect(() => {
    loadLocations();
  }, []);

  const loadLocations = async () => {
    try {
      setIsLoading(true);
      const data = await LocationService.getLocations();
      setLocations(data);
    } catch (error: any) {
      toast.error(error.message || 'Error al cargar ubicaciones');
      console.error('Error loading locations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta ubicación?')) {
      return;
    }

    try {
      await LocationService.deleteLocation(id);
      toast.success('Ubicación eliminada exitosamente');
      loadLocations(); // Reload list
    } catch (error: any) {
      toast.error(error.message || 'Error al eliminar ubicación');
      console.error('Error deleting location:', error);
    }
  };

  // Table columns
  const columns: ColumnDef<Location>[] = [
    {
      accessorKey: 'code',
      header: 'Código',
      cell: ({ row }) => (
        <div className="font-mono font-medium text-gray-900 dark:text-white">
          {row.original.code}
        </div>
      ),
    },
    {
      accessorKey: 'name',
      header: 'Nombre',
      cell: ({ row }) => (
        <div className="font-medium text-gray-900 dark:text-white">
          {row.original.name}
        </div>
      ),
    },
    {
      accessorKey: 'type',
      header: 'Tipo',
      cell: ({ row }) => (
        <Badge variant="info">
          {locationTypeLabels[row.original.type] || row.original.type}
        </Badge>
      ),
    },
    {
      accessorKey: 'description',
      header: 'Descripción',
      cell: ({ row }) => (
        <div className="text-gray-600 dark:text-gray-400 max-w-xs truncate">
          {row.original.description || '-'}
        </div>
      ),
    },
    {
      accessorKey: 'is_active',
      header: 'Estado',
      cell: ({ row }) => (
        <Badge variant={row.original.is_active ? 'success' : 'danger'}>
          {row.original.is_active ? 'Activo' : 'Inactivo'}
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
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Can permission={PERMISSIONS.PRODUCTS_UPDATE}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(`/locations/${row.original.id}/edit`)}
              leftIcon={<Edit className="h-4 w-4" />}
            >
              Editar
            </Button>
          </Can>
          <Can permission={PERMISSIONS.PRODUCTS_DELETE}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDelete(row.original.id)}
              leftIcon={<Trash2 className="h-4 w-4 text-red-600" />}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
            >
              Eliminar
            </Button>
          </Can>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <MapPin className="h-7 w-7" />
            Ubicaciones
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gestiona bodegas, tiendas y centros de distribución
          </p>
        </div>

        <Can permission={PERMISSIONS.PRODUCTS_CREATE}>
          <Button
            variant="primary"
            leftIcon={<Plus className="h-5 w-5" />}
            onClick={() => router.push('/locations/create')}
          >
            Nueva Ubicación
          </Button>
        </Can>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Ubicaciones</CardTitle>
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
              data={locations}
              isLoading={isLoading}
              emptyMessage="No se encontraron ubicaciones"
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
