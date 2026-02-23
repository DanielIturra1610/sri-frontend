'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Edit, Trash2, Users, Building2 } from 'lucide-react';
import { SupplierService } from '@/services/supplierService';
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
  Skeleton,
} from '@/components/ui';
import { Can } from '@/components/auth';
import { PERMISSIONS } from '@/lib/constants/permissions';
import { DataTable } from '@/components/ui/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import type { Supplier } from '@/types';
import toast from 'react-hot-toast';

export default function SuppliersPage() {
  const router = useRouter();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSuppliers();
  }, []);

  const loadSuppliers = async () => {
    try {
      setIsLoading(true);
      const data = await SupplierService.getSuppliers();
      setSuppliers(data.suppliers);
      setTotal(data.total);
    } catch (error: any) {
      toast.error(error.message || 'Error al cargar proveedores');
      console.error('Error loading suppliers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este proveedor?')) {
      return;
    }

    try {
      await SupplierService.deleteSupplier(id);
      toast.success('Proveedor eliminado exitosamente');
      loadSuppliers();
    } catch (error: any) {
      toast.error(error.message || 'Error al eliminar proveedor');
      console.error('Error deleting supplier:', error);
    }
  };

  const columns: ColumnDef<Supplier>[] = [
    {
      accessorKey: 'name',
      header: 'Nombre',
      cell: ({ row }) => (
        <div className="font-medium text-gray-900 dark:text-white">{row.original.name}</div>
      ),
    },
    {
      accessorKey: 'rut',
      header: 'RUT',
      cell: ({ row }) => (
        <div className="font-mono text-gray-700 dark:text-gray-300">
          {row.original.rut || '-'}
        </div>
      ),
    },
    {
      accessorKey: 'contact_name',
      header: 'Contacto',
      cell: ({ row }) => (
        <div className="text-gray-700 dark:text-gray-300">
          {row.original.contact_name || '-'}
        </div>
      ),
    },
    {
      accessorKey: 'contact_email',
      header: 'Email',
      cell: ({ row }) => (
        <div className="text-gray-700 dark:text-gray-300">
          {row.original.contact_email || '-'}
        </div>
      ),
    },
    {
      accessorKey: 'contact_phone',
      header: 'Teléfono',
      cell: ({ row }) => (
        <div className="text-gray-700 dark:text-gray-300">
          {row.original.contact_phone || '-'}
        </div>
      ),
    },
    {
      accessorKey: 'city',
      header: 'Ciudad',
      cell: ({ row }) => (
        <div className="text-gray-700 dark:text-gray-300">{row.original.city || '-'}</div>
      ),
    },
    {
      accessorKey: 'is_active',
      header: 'Estado',
      cell: ({ row }) => (
        <Badge variant={row.original.is_active ? 'success' : 'destructive'}>
          {row.original.is_active ? 'Activo' : 'Inactivo'}
        </Badge>
      ),
    },
    {
      id: 'actions',
      header: 'Acciones',
      cell: ({ row }) => {
        const supplier = row.original;

        return (
          <div className="flex gap-2">
            <Can permission={PERMISSIONS.PRODUCTS_UPDATE}>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push(`/suppliers/${supplier.id}/edit`)}
                leftIcon={<Edit className="h-4 w-4" />}
              >
                Editar
              </Button>
            </Can>

            <Can permission={PERMISSIONS.PRODUCTS_DELETE}>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(supplier.id)}
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
            <Building2 className="h-7 w-7" />
            Proveedores
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gestiona los proveedores del sistema
          </p>
        </div>

        <Can permission={PERMISSIONS.PRODUCTS_CREATE}>
          <Button
            variant="primary"
            leftIcon={<Plus className="h-5 w-5" />}
            onClick={() => router.push('/suppliers/create')}
          >
            Nuevo Proveedor
          </Button>
        </Can>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Proveedores</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                <Building2 className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Activos</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {suppliers.filter((s) => s.is_active).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Proveedores</CardTitle>
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
              data={suppliers}
              isLoading={isLoading}
              emptyMessage="No se encontraron proveedores"
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
