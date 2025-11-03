'use client';

import React, { useState, useEffect } from 'react';
import {
  Shield,
  Filter,
  Download,
  Search,
  Calendar,
  User,
  FileText,
  Eye,
  RefreshCw,
} from 'lucide-react';
import { AuditLogService } from '@/services/auditLogService';
import { UserService } from '@/services/userService';
import { Button, Card, CardHeader, CardTitle, CardContent, Select, Input, Badge } from '@/components/ui';
import { cn } from '@/lib/utils/cn';
import type { AuditLog, AuditAction, AuditEntityType, User as UserType } from '@/types';
import toast from 'react-hot-toast';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [userFilter, setUserFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [entityTypeFilter, setEntityTypeFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const pageSize = 20;

  // Load audit logs
  const loadAuditLogs = async () => {
    try {
      setIsLoading(true);
      const response = await AuditLogService.getAuditLogs({
        search: search || undefined,
        user_id: userFilter || undefined,
        action: actionFilter as AuditAction | undefined,
        entity_type: entityTypeFilter as AuditEntityType | undefined,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
        page,
        page_size: pageSize,
        sort_by: 'created_at',
        sort_order: 'desc',
      });

      setLogs(response.items);
      setTotalItems(response.total);
      setTotalPages(response.total_pages);
    } catch (error: any) {
      toast.error(error.message || 'Error al cargar logs de auditoría');
      console.error('Error loading audit logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load users for filter
  const loadUsers = async () => {
    try {
      const response = await UserService.getUsers();
      setUsers(response.items);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    loadAuditLogs();
  }, [search, userFilter, actionFilter, entityTypeFilter, dateFrom, dateTo, page]);

  // Handle export
  const handleExport = async (format: 'csv' | 'xlsx') => {
    try {
      setIsExporting(true);
      const blob = await AuditLogService.exportAuditLogs({
        format,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
        user_id: userFilter || undefined,
        action: actionFilter || undefined,
        entity_type: entityTypeFilter || undefined,
      });

      AuditLogService.downloadExport(blob, format);
      toast.success(`Logs exportados a ${format.toUpperCase()}`);
    } catch (error: any) {
      toast.error(error.message || 'Error al exportar logs');
    } finally {
      setIsExporting(false);
    }
  };

  // Clear filters
  const handleClearFilters = () => {
    setSearch('');
    setUserFilter('');
    setActionFilter('');
    setEntityTypeFilter('');
    setDateFrom('');
    setDateTo('');
    setPage(1);
  };

  // Get action label and color
  const getActionConfig = (action: AuditAction) => {
    const configs: Record<AuditAction, { label: string; variant: any }> = {
      CREATE: { label: 'Crear', variant: 'success' },
      UPDATE: { label: 'Actualizar', variant: 'info' },
      DELETE: { label: 'Eliminar', variant: 'danger' },
      LOGIN: { label: 'Inicio Sesión', variant: 'success' },
      LOGOUT: { label: 'Cierre Sesión', variant: 'secondary' },
      FAILED_LOGIN: { label: 'Login Fallido', variant: 'danger' },
      PASSWORD_CHANGE: { label: 'Cambio Contraseña', variant: 'warning' },
      STOCK_ADJUSTMENT: { label: 'Ajuste Stock', variant: 'info' },
      TRANSFER_CREATE: { label: 'Crear Transferencia', variant: 'info' },
      TRANSFER_COMPLETE: { label: 'Completar Transferencia', variant: 'success' },
      TRANSFER_CANCEL: { label: 'Cancelar Transferencia', variant: 'warning' },
      IMPORT: { label: 'Importar', variant: 'info' },
      EXPORT: { label: 'Exportar', variant: 'secondary' },
      VIEW: { label: 'Ver', variant: 'secondary' },
    };
    return configs[action] || { label: action, variant: 'secondary' };
  };

  // Get entity type label
  const getEntityTypeLabel = (entityType: AuditEntityType) => {
    const labels: Record<AuditEntityType, string> = {
      USER: 'Usuario',
      PRODUCT: 'Producto',
      CATEGORY: 'Categoría',
      LOCATION: 'Ubicación',
      STOCK: 'Stock',
      TRANSFER: 'Transferencia',
      TRANSACTION: 'Transacción',
      NOTIFICATION: 'Notificación',
      SETTINGS: 'Configuración',
      AUTH: 'Autenticación',
      SYSTEM: 'Sistema',
    };
    return labels[entityType] || entityType;
  };

  // Format date to local
  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('es-CL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Shield className="h-7 w-7" />
            Logs de Auditoría
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Registro completo de todas las acciones del sistema
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Download className="h-4 w-4" />}
            onClick={() => handleExport('csv')}
            disabled={isExporting}
          >
            CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Download className="h-4 w-4" />}
            onClick={() => handleExport('xlsx')}
            disabled={isExporting}
          >
            Excel
          </Button>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<RefreshCw className="h-4 w-4" />}
            onClick={loadAuditLogs}
          >
            Actualizar
          </Button>
          <Button
            variant={showFilters ? 'primary' : 'outline'}
            size="sm"
            leftIcon={<Filter className="h-4 w-4" />}
            onClick={() => setShowFilters(!showFilters)}
          >
            Filtros
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{totalItems}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total de Logs</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {logs.filter((l) => l.action === 'LOGIN').length}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Inicios de Sesión</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                {logs.filter((l) => l.action === 'CREATE').length}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Creaciones</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                {logs.filter((l) => l.action === 'DELETE').length}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Eliminaciones</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Buscar
                </label>
                <Input
                  leftIcon={<Search className="h-4 w-4" />}
                  placeholder="Buscar en descripción..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              {/* User Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Usuario
                </label>
                <Select value={userFilter} onChange={(e) => setUserFilter(e.target.value)}>
                  <option value="">Todos los usuarios</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.full_name}
                    </option>
                  ))}
                </Select>
              </div>

              {/* Action Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Acción
                </label>
                <Select value={actionFilter} onChange={(e) => setActionFilter(e.target.value)}>
                  <option value="">Todas las acciones</option>
                  <option value="CREATE">Crear</option>
                  <option value="UPDATE">Actualizar</option>
                  <option value="DELETE">Eliminar</option>
                  <option value="LOGIN">Inicio Sesión</option>
                  <option value="LOGOUT">Cierre Sesión</option>
                  <option value="FAILED_LOGIN">Login Fallido</option>
                  <option value="PASSWORD_CHANGE">Cambio Contraseña</option>
                  <option value="STOCK_ADJUSTMENT">Ajuste Stock</option>
                  <option value="TRANSFER_CREATE">Crear Transferencia</option>
                  <option value="TRANSFER_COMPLETE">Completar Transferencia</option>
                  <option value="TRANSFER_CANCEL">Cancelar Transferencia</option>
                  <option value="IMPORT">Importar</option>
                  <option value="EXPORT">Exportar</option>
                  <option value="VIEW">Ver</option>
                </Select>
              </div>

              {/* Entity Type Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tipo de Entidad
                </label>
                <Select
                  value={entityTypeFilter}
                  onChange={(e) => setEntityTypeFilter(e.target.value)}
                >
                  <option value="">Todos los tipos</option>
                  <option value="USER">Usuario</option>
                  <option value="PRODUCT">Producto</option>
                  <option value="CATEGORY">Categoría</option>
                  <option value="LOCATION">Ubicación</option>
                  <option value="STOCK">Stock</option>
                  <option value="TRANSFER">Transferencia</option>
                  <option value="TRANSACTION">Transacción</option>
                  <option value="NOTIFICATION">Notificación</option>
                  <option value="SETTINGS">Configuración</option>
                  <option value="AUTH">Autenticación</option>
                  <option value="SYSTEM">Sistema</option>
                </Select>
              </div>

              {/* Date From */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Fecha Desde
                </label>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
              </div>

              {/* Date To */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Fecha Hasta
                </label>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <Button variant="outline" size="sm" onClick={handleClearFilters}>
                Limpiar Filtros
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Audit Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Registros de Auditoría ({totalItems})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              Cargando logs de auditoría...
            </div>
          ) : logs.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Fecha/Hora
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Usuario
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Acción
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Entidad
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Descripción
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      IP
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                  {logs.map((log) => {
                    const actionConfig = getActionConfig(log.action);
                    return (
                      <tr
                        key={log.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {formatDate(log.created_at)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {log.user_name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {log.user_email}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <Badge variant={actionConfig.variant} size="sm">
                            {actionConfig.label}
                          </Badge>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div>
                            <p className="text-sm text-gray-900 dark:text-white">
                              {getEntityTypeLabel(log.entity_type)}
                            </p>
                            {log.entity_name && (
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {log.entity_name}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-900 dark:text-white max-w-md truncate">
                          {log.description}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {log.ip_address || '-'}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedLog(log)}
                            title="Ver detalles"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 px-4">
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    Página {page} de {totalPages} ({totalItems} registros)
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
          ) : (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <Shield className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">No hay logs de auditoría</p>
              <p className="text-sm">
                Los registros de auditoría aparecerán aquí
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Detalle de Log de Auditoría
                </CardTitle>
                <button
                  onClick={() => setSelectedLog(null)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  ✕
                </button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    ID
                  </label>
                  <p className="text-sm text-gray-900 dark:text-white font-mono">
                    {selectedLog.id}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Fecha y Hora
                  </label>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {formatDate(selectedLog.created_at)}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Usuario
                  </label>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {selectedLog.user_name} ({selectedLog.user_email})
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Acción
                  </label>
                  <div className="mt-1">
                    <Badge variant={getActionConfig(selectedLog.action).variant}>
                      {getActionConfig(selectedLog.action).label}
                    </Badge>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Tipo de Entidad
                  </label>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {getEntityTypeLabel(selectedLog.entity_type)}
                  </p>
                </div>

                {selectedLog.entity_id && (
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      ID de Entidad
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white font-mono">
                      {selectedLog.entity_id}
                    </p>
                  </div>
                )}

                {selectedLog.entity_name && (
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Nombre de Entidad
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {selectedLog.entity_name}
                    </p>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Descripción
                  </label>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {selectedLog.description}
                  </p>
                </div>

                {selectedLog.ip_address && (
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Dirección IP
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white font-mono">
                      {selectedLog.ip_address}
                    </p>
                  </div>
                )}

                {selectedLog.user_agent && (
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      User Agent
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white break-all">
                      {selectedLog.user_agent}
                    </p>
                  </div>
                )}

                {selectedLog.metadata && Object.keys(selectedLog.metadata).length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Metadata
                    </label>
                    <pre className="mt-1 text-xs bg-gray-100 dark:bg-gray-800 p-3 rounded-lg overflow-x-auto">
                      {JSON.stringify(selectedLog.metadata, null, 2)}
                    </pre>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end">
                <Button variant="outline" onClick={() => setSelectedLog(null)}>
                  Cerrar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
