'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { type ColumnDef } from '@tanstack/react-table';
import { Search, Filter, Plus, Edit, Trash2, UserX, UserCheck, Users as UsersIcon } from 'lucide-react';
import { UserService } from '@/services/userService';
import { DataTable } from '@/components/ui/DataTable';
import { Button, Input, NativeSelect as Select, Badge, Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { Can } from '@/components/auth';
import { PERMISSIONS } from '@/lib/constants/permissions';
import { getRoleDisplayName } from '@/lib/constants/permissions';
import type { User, UserRole } from '@/types';
import toast from 'react-hot-toast';

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  // Load users
  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const response = await UserService.getUsers({
        search: search || undefined,
        role: roleFilter !== 'all' ? (roleFilter as UserRole) : undefined,
        is_active: statusFilter === 'all' ? undefined : statusFilter === 'active',
        page,
        page_size: pageSize,
        sort_by: 'created_at',
        sort_order: 'desc',
      });

      setUsers(response.data.items);
      setTotalItems(response.data.total);
      setTotalPages(response.data.total_pages);
    } catch (error: any) {
      toast.error(error.message || 'Error al cargar usuarios');
      console.error('Error loading users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [search, roleFilter, statusFilter, page, pageSize]);

  // Handle delete user
  const handleDelete = async (user: User) => {
    if (!confirm(`¿Estás seguro de eliminar al usuario "${user.full_name}"?`)) {
      return;
    }

    try {
      await UserService.deleteUser(user.id);
      toast.success('Usuario eliminado exitosamente');
      loadUsers();
    } catch (error: any) {
      toast.error(error.message || 'Error al eliminar usuario');
      console.error('Error deleting user:', error);
    }
  };

  // Handle toggle user status
  const handleToggleStatus = async (user: User) => {
    try {
      if (user.is_active) {
        await UserService.deactivateUser(user.id);
        toast.success('Usuario desactivado exitosamente');
      } else {
        await UserService.activateUser(user.id);
        toast.success('Usuario activado exitosamente');
      }
      loadUsers();
    } catch (error: any) {
      toast.error(error.message || 'Error al cambiar estado del usuario');
      console.error('Error toggling user status:', error);
    }
  };

  // Table columns
  const columns: ColumnDef<User>[] = [
    {
      accessorKey: 'full_name',
      header: 'Nombre',
      cell: ({ row }) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-white">
            {row.original.full_name}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {row.original.email}
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'rut',
      header: 'RUT',
      cell: ({ row }) => (
        <span className="text-gray-700 dark:text-gray-300">
          {row.original.rut || '-'}
        </span>
      ),
    },
    {
      accessorKey: 'phone',
      header: 'Teléfono',
      cell: ({ row }) => (
        <span className="text-gray-700 dark:text-gray-300">
          {row.original.phone || '-'}
        </span>
      ),
    },
    {
      accessorKey: 'role',
      header: 'Rol',
      cell: ({ row }) => {
        const roleColors: Record<UserRole, 'default' | 'success' | 'warning' | 'info' | 'danger'> = {
          OWNER: 'info',
          ADMIN: 'success',
          MANAGER: 'warning',
          AUDITOR: 'info',
          OPERATOR: 'default',
        };
        return (
          <Badge variant={roleColors[row.original.role]} size="sm">
            {getRoleDisplayName(row.original.role)}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'is_active',
      header: 'Estado',
      cell: ({ row }) => (
        <Badge variant={row.original.is_active ? 'success' : 'danger'} size="sm">
          {row.original.is_active ? 'Activo' : 'Inactivo'}
        </Badge>
      ),
    },
    {
      accessorKey: 'created_at',
      header: 'Fecha Creación',
      cell: ({ row }) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {new Date(row.original.created_at).toLocaleDateString('es-CL')}
        </span>
      ),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-2">
          <Can permission={PERMISSIONS.USERS_UPDATE} role={['OWNER', 'ADMIN']}>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/users/${row.original.id}/edit`);
              }}
              title="Editar"
            >
              <Edit className="h-4 w-4" />
            </Button>
          </Can>
          <Can permission={PERMISSIONS.USERS_UPDATE} role={['OWNER', 'ADMIN']}>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleToggleStatus(row.original);
              }}
              title={row.original.is_active ? 'Desactivar' : 'Activar'}
            >
              {row.original.is_active ? (
                <UserX className="h-4 w-4 text-orange-600" />
              ) : (
                <UserCheck className="h-4 w-4 text-green-600" />
              )}
            </Button>
          </Can>
          <Can permission={PERMISSIONS.USERS_DELETE} role={['OWNER', 'ADMIN']}>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(row.original);
              }}
              title="Eliminar"
            >
              <Trash2 className="h-4 w-4 text-red-600" />
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
            <UsersIcon className="h-7 w-7" />
            Gestión de Usuarios
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Administra los usuarios y permisos del sistema
          </p>
        </div>
        <Can permission={PERMISSIONS.USERS_CREATE} role={['OWNER', 'ADMIN']}>
          <Button
            variant="primary"
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={() => router.push('/users/create')}
          >
            Nuevo Usuario
          </Button>
        </Can>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {totalItems}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Usuarios</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                {users.filter((u) => u.is_active).length}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Activos</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                {users.filter((u) => !u.is_active).length}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Inactivos</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {users.filter((u) => u.role === 'ADMIN' || u.role === 'OWNER').length}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Administradores</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              {showFilters ? 'Ocultar' : 'Mostrar'}
            </Button>
          </div>
        </CardHeader>
        {showFilters && (
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Buscar
                </label>
                <Input
                  placeholder="Nombre, email, RUT..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  leftIcon={<Search className="h-4 w-4" />}
                />
              </div>

              {/* Role Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Rol
                </label>
                <Select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                  <option value="all">Todos los roles</option>
                  <option value="OWNER">Propietario</option>
                  <option value="ADMIN">Administrador</option>
                  <option value="MANAGER">Gerente</option>
                  <option value="AUDITOR">Auditor</option>
                  <option value="OPERATOR">Operador</option>
                </Select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Estado
                </label>
                <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <option value="all">Todos</option>
                  <option value="active">Activos</option>
                  <option value="inactive">Inactivos</option>
                </Select>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Table */}
      <DataTable
        columns={columns}
        data={users}
        isLoading={isLoading}
        emptyMessage="No se encontraron usuarios"
      />

      {/* Pagination */}
      {!isLoading && totalPages > 1 && (
        <div className="flex items-center justify-between bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 px-6 py-4">
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Mostrando {((page - 1) * pageSize) + 1} a {Math.min(page * pageSize, totalItems)} de {totalItems} usuarios
            </span>
            <Select
              value={pageSize.toString()}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              className="w-32"
            >
              <option value="10">10 / página</option>
              <option value="25">25 / página</option>
              <option value="50">50 / página</option>
              <option value="100">100 / página</option>
            </Select>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Anterior
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (page <= 3) {
                  pageNum = i + 1;
                } else if (page >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = page - 2 + i;
                }

                return (
                  <Button
                    key={pageNum}
                    variant={page === pageNum ? 'primary' : 'ghost'}
                    size="sm"
                    onClick={() => setPage(pageNum)}
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
