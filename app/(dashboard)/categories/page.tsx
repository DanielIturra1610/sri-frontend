'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { CategoryService } from '@/services/categoryService';
import { Button, Card, CardHeader, CardTitle, CardContent, Skeleton } from '@/components/ui';
import { Can } from '@/components/auth';
import { PERMISSIONS } from '@/lib/constants/permissions';
import { DataTable } from '@/components/ui/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import type { Category } from '@/types';
import toast from 'react-hot-toast';

export default function CategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load categories
  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setIsLoading(true);
      const data = await CategoryService.getCategories();
      setCategories(data);
    } catch (error: any) {
      toast.error(error.message || 'Error al cargar categorías');
      console.error('Error loading categories:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta categoría?')) {
      return;
    }

    try {
      await CategoryService.deleteCategory(id);
      toast.success('Categoría eliminada exitosamente');
      loadCategories(); // Reload list
    } catch (error: any) {
      toast.error(error.message || 'Error al eliminar categoría');
      console.error('Error deleting category:', error);
    }
  };

  // Table columns
  const columns: ColumnDef<Category>[] = [
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
      accessorKey: 'description',
      header: 'Descripción',
      cell: ({ row }) => (
        <div className="text-gray-600 dark:text-gray-400">
          {row.original.description || '-'}
        </div>
      ),
    },
    {
      accessorKey: 'parent_name',
      header: 'Categoría Padre',
      cell: ({ row }) => (
        <div className="text-gray-600 dark:text-gray-400">
          {row.original.parent_name || '-'}
        </div>
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
              onClick={() => router.push(`/categories/${row.original.id}/edit`)}
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Categorías
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gestiona las categorías de productos
          </p>
        </div>

        <Can permission={PERMISSIONS.PRODUCTS_CREATE}>
          <Button
            variant="primary"
            leftIcon={<Plus className="h-5 w-5" />}
            onClick={() => router.push('/categories/create')}
          >
            Nueva Categoría
          </Button>
        </Can>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Categorías</CardTitle>
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
              data={categories}
              isLoading={isLoading}
              emptyMessage="No se encontraron categorías"
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
