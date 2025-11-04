'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Shield, Info, Check, X, ChevronDown, ChevronUp } from 'lucide-react';
import { Button, Card, CardHeader, CardTitle, CardContent, Badge, Alert } from '@/components/ui';
import {
  ROLES,
  PERMISSIONS,
  ROLE_PERMISSIONS,
  ROLE_HIERARCHY,
  getRoleDisplayName,
  getRoleDescription,
  type Role
} from '@/lib/constants/permissions';

interface PermissionGroup {
  name: string;
  description: string;
  permissions: string[];
}

export default function PermissionsPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<Role | 'all'>('all');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['Productos']));

  // Group permissions by feature area
  const permissionGroups: PermissionGroup[] = [
    {
      name: 'Productos',
      description: 'Gestión del catálogo de productos',
      permissions: [
        PERMISSIONS.PRODUCTS_VIEW,
        PERMISSIONS.PRODUCTS_CREATE,
        PERMISSIONS.PRODUCTS_UPDATE,
        PERMISSIONS.PRODUCTS_DELETE,
      ],
    },
    {
      name: 'Categorías',
      description: 'Administración de categorías de productos',
      permissions: [
        PERMISSIONS.CATEGORIES_VIEW,
        PERMISSIONS.CATEGORIES_MANAGE,
      ],
    },
    {
      name: 'Inventario',
      description: 'Gestión de stock y ajustes de inventario',
      permissions: [
        PERMISSIONS.INVENTORY_VIEW,
        PERMISSIONS.INVENTORY_ADJUST,
      ],
    },
    {
      name: 'Ubicaciones',
      description: 'Administración de bodegas y ubicaciones',
      permissions: [
        PERMISSIONS.LOCATIONS_VIEW,
        PERMISSIONS.LOCATIONS_MANAGE,
      ],
    },
    {
      name: 'Transferencias',
      description: 'Movimientos de stock entre ubicaciones',
      permissions: [
        PERMISSIONS.TRANSFERS_VIEW,
        PERMISSIONS.TRANSFERS_CREATE,
        PERMISSIONS.TRANSFERS_COMPLETE,
        PERMISSIONS.TRANSFERS_CANCEL,
      ],
    },
    {
      name: 'Transacciones',
      description: 'Historial de movimientos de inventario',
      permissions: [
        PERMISSIONS.TRANSACTIONS_VIEW,
        PERMISSIONS.TRANSACTIONS_EXPORT,
      ],
    },
    {
      name: 'Importación',
      description: 'Carga masiva de datos',
      permissions: [
        PERMISSIONS.IMPORT_PRODUCTS,
        PERMISSIONS.IMPORT_STOCK,
      ],
    },
    {
      name: 'Reportes',
      description: 'Generación y exportación de reportes',
      permissions: [
        PERMISSIONS.REPORTS_VIEW,
        PERMISSIONS.REPORTS_EXPORT,
      ],
    },
    {
      name: 'Usuarios',
      description: 'Gestión de usuarios del sistema',
      permissions: [
        PERMISSIONS.USERS_VIEW,
        PERMISSIONS.USERS_CREATE,
        PERMISSIONS.USERS_UPDATE,
        PERMISSIONS.USERS_DELETE,
      ],
    },
    {
      name: 'Configuración',
      description: 'Configuración del sistema',
      permissions: [
        PERMISSIONS.SETTINGS_VIEW,
        PERMISSIONS.SETTINGS_UPDATE,
      ],
    },
  ];

  // Get roles sorted by hierarchy
  const roles = Object.values(ROLES).sort((a, b) =>
    ROLE_HIERARCHY[b as Role] - ROLE_HIERARCHY[a as Role]
  ) as Role[];

  // Check if a role has a specific permission
  const roleHasPermission = (role: Role, permission: string): boolean => {
    const rolePerms = ROLE_PERMISSIONS[role];
    return rolePerms.includes('*') || rolePerms.includes(permission);
  };

  // Get permission label
  const getPermissionLabel = (permission: string): string => {
    const parts = permission.split('.');
    const action = parts[parts.length - 1];
    const labels: Record<string, string> = {
      view: 'Ver',
      create: 'Crear',
      update: 'Editar',
      delete: 'Eliminar',
      manage: 'Administrar',
      adjust: 'Ajustar',
      complete: 'Completar',
      cancel: 'Cancelar',
      export: 'Exportar',
      products: 'Productos',
      stock: 'Stock',
    };
    return labels[action] || action;
  };

  // Toggle group expansion
  const toggleGroup = (groupName: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupName)) {
      newExpanded.delete(groupName);
    } else {
      newExpanded.add(groupName);
    }
    setExpandedGroups(newExpanded);
  };

  // Get role badge variant
  const getRoleBadgeVariant = (role: Role): 'default' | 'success' | 'warning' | 'info' | 'danger' => {
    const variants: Record<Role, 'default' | 'success' | 'warning' | 'info' | 'danger'> = {
      OWNER: 'danger',
      ADMIN: 'success',
      MANAGER: 'warning',
      AUDITOR: 'info',
      OPERATOR: 'default',
    };
    return variants[role];
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Shield className="h-7 w-7" />
            Permisos y Roles
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Visualiza los permisos de cada rol del sistema
          </p>
        </div>
      </div>

      {/* Info Alert */}
      <Alert variant="info" title="Información Importante">
        Los permisos están predefinidos por rol y no son modificables. Esta página es solo
        informativa para entender qué puede hacer cada rol en el sistema.
      </Alert>

      {/* Role Hierarchy */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Jerarquía de Roles
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {roles.map((role) => (
              <div
                key={role}
                className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                  selectedRole === role
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
                onClick={() => setSelectedRole(selectedRole === role ? 'all' : role)}
              >
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {ROLE_HIERARCHY[role]}
                  </div>
                  <div>
                    <Badge variant={getRoleBadgeVariant(role)} size="sm">
                      {getRoleDisplayName(role)}
                    </Badge>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                      {getRoleDescription(role)}
                    </p>
                  </div>
                  {role === 'OWNER' && (
                    <Badge variant="warning" size="sm">
                      Todos los permisos
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>

          {selectedRole !== 'all' && (
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm text-blue-900 dark:text-blue-100">
                <strong>Filtrado:</strong> Mostrando solo permisos del rol{' '}
                <strong>{getRoleDisplayName(selectedRole as Role)}</strong>
              </p>
              <button
                onClick={() => setSelectedRole('all')}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline mt-2"
              >
                Mostrar todos los roles
              </button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Permission Matrix */}
      <Card>
        <CardHeader>
          <CardTitle>Matriz de Permisos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {permissionGroups.map((group) => (
            <div
              key={group.name}
              className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
            >
              {/* Group Header */}
              <button
                onClick={() => toggleGroup(group.name)}
                className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors"
              >
                <div className="text-left">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {group.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {group.description}
                  </p>
                </div>
                {expandedGroups.has(group.name) ? (
                  <ChevronUp className="h-5 w-5 text-gray-500" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-500" />
                )}
              </button>

              {/* Permissions Table */}
              {expandedGroups.has(group.name) && (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-100 dark:bg-gray-800">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Permiso
                        </th>
                        {roles
                          .filter((role) => selectedRole === 'all' || selectedRole === role)
                          .map((role) => (
                            <th
                              key={role}
                              className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                            >
                              {getRoleDisplayName(role)}
                            </th>
                          ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                      {group.permissions.map((permission) => (
                        <tr key={permission}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {getPermissionLabel(permission)}
                          </td>
                          {roles
                            .filter((role) => selectedRole === 'all' || selectedRole === role)
                            .map((role) => {
                              const hasPermission = roleHasPermission(role, permission);
                              return (
                                <td
                                  key={role}
                                  className="px-6 py-4 whitespace-nowrap text-center"
                                >
                                  {hasPermission ? (
                                    <Check className="h-5 w-5 text-green-600 dark:text-green-400 mx-auto" />
                                  ) : (
                                    <X className="h-5 w-5 text-red-600 dark:text-red-400 mx-auto" />
                                  )}
                                </td>
                              );
                            })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Legend */}
      <Card>
        <CardHeader>
          <CardTitle>Leyenda</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                El rol tiene este permiso
              </span>
            </div>
            <div className="flex items-center gap-3">
              <X className="h-5 w-5 text-red-600 dark:text-red-400" />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                El rol NO tiene este permiso
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
