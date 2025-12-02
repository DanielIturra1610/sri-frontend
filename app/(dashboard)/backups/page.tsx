'use client';

import React, { useState, useEffect } from 'react';
import {
  Database,
  Plus,
  Download,
  Trash2,
  RefreshCw,
  Calendar,
  HardDrive,
  AlertTriangle,
  CheckCircle,
  Clock,
  RotateCcw,
  Filter,
  Settings as SettingsIcon,
} from 'lucide-react';
import { BackupService } from '@/services/backupService';
import { Button, Card, CardHeader, CardTitle, CardContent, NativeSelect as Select, Input, Badge } from '@/components/ui';
import { cn } from '@/lib/utils/cn';
import type { Backup, BackupType, BackupStatus, BackupFormat, CreateBackupDTO } from '@/types';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function BackupsPage() {
  const router = useRouter();
  const [backups, setBackups] = useState<Backup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState<Backup | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Filters
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const pageSize = 10;

  // Load backups
  const loadBackups = async () => {
    try {
      setIsLoading(true);
      const backupsData = await BackupService.getBackups({
        backup_type: typeFilter as BackupType | undefined,
        status: statusFilter as BackupStatus | undefined,
        page,
        page_size: pageSize,
        sort_by: 'created_at',
        sort_order: 'desc',
      });

      const filteredBackups = Array.isArray(backupsData) ? backupsData : [];
      setBackups(filteredBackups);
      setTotalItems(filteredBackups.length);
      setTotalPages(Math.ceil(filteredBackups.length / pageSize) || 1);
    } catch (error: any) {
      toast.error(error.message || 'Error al cargar respaldos');
      console.error('Error loading backups:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBackups();
  }, [typeFilter, statusFilter, page]);

  // Handle download
  const handleDownload = async (backup: Backup) => {
    try {
      const filename = `${backup.name}.${backup.format.toLowerCase()}`;
      await BackupService.downloadBackup(backup.id, filename);
      toast.success('Descarga iniciada');
    } catch (error: any) {
      toast.error(error.message || 'Error al descargar respaldo');
    }
  };

  // Handle delete
  const handleDelete = async (backup: Backup) => {
    if (!confirm(`¿Estás seguro de eliminar el respaldo "${backup.name}"?`)) {
      return;
    }

    try {
      await BackupService.deleteBackup(backup.id);
      toast.success('Respaldo eliminado');
      loadBackups();
    } catch (error: any) {
      toast.error(error.message || 'Error al eliminar respaldo');
    }
  };

  // Get status config
  const getStatusConfig = (status: BackupStatus) => {
    const configs: Record<BackupStatus, { label: string; variant: any; icon: React.ReactNode }> = {
      PENDING: {
        label: 'Pendiente',
        variant: 'secondary',
        icon: <Clock className="h-4 w-4" />,
      },
      IN_PROGRESS: {
        label: 'En Progreso',
        variant: 'info',
        icon: <RefreshCw className="h-4 w-4 animate-spin" />,
      },
      COMPLETED: {
        label: 'Completado',
        variant: 'success',
        icon: <CheckCircle className="h-4 w-4" />,
      },
      FAILED: {
        label: 'Fallido',
        variant: 'danger',
        icon: <AlertTriangle className="h-4 w-4" />,
      },
    };
    return configs[status];
  };

  // Get type label
  const getTypeLabel = (type: BackupType) => {
    const labels: Record<BackupType, string> = {
      FULL: 'Completo',
      PARTIAL: 'Parcial',
      MANUAL: 'Manual',
      AUTOMATIC: 'Automático',
    };
    return labels[type];
  };

  // Format date
  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('es-CL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Database className="h-7 w-7" />
            Respaldo y Restauración
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gestiona los respaldos de tus datos
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<SettingsIcon className="h-4 w-4" />}
            onClick={() => router.push('/backups/config')}
          >
            Configuración
          </Button>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<RefreshCw className="h-4 w-4" />}
            onClick={loadBackups}
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
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={() => setShowCreateModal(true)}
          >
            Nuevo Respaldo
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{totalItems}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Respaldos</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                {backups.filter((b) => b.status === 'COMPLETED').length}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Completados</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {backups.filter((b) => b.status === 'IN_PROGRESS').length}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">En Progreso</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                {backups.filter((b) => b.status === 'FAILED').length}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Fallidos</p>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tipo
                </label>
                <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                  <option value="">Todos los tipos</option>
                  <option value="FULL">Completo</option>
                  <option value="PARTIAL">Parcial</option>
                  <option value="MANUAL">Manual</option>
                  <option value="AUTOMATIC">Automático</option>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Estado
                </label>
                <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <option value="">Todos los estados</option>
                  <option value="PENDING">Pendiente</option>
                  <option value="IN_PROGRESS">En Progreso</option>
                  <option value="COMPLETED">Completado</option>
                  <option value="FAILED">Fallido</option>
                </Select>
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setTypeFilter('');
                  setStatusFilter('');
                }}
              >
                Limpiar Filtros
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Backups List */}
      <Card>
        <CardHeader>
          <CardTitle>Historial de Respaldos ({totalItems})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              Cargando respaldos...
            </div>
          ) : backups.length > 0 ? (
            <div className="space-y-3">
              {backups.map((backup) => {
                const statusConfig = getStatusConfig(backup.status);
                return (
                  <div
                    key={backup.id}
                    className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {backup.name}
                          </h3>
                          <Badge variant={statusConfig.variant} size="sm">
                            <div className="flex items-center gap-1">
                              {statusConfig.icon}
                              {statusConfig.label}
                            </div>
                          </Badge>
                          <Badge variant="default" size="sm">
                            {getTypeLabel(backup.backup_type)}
                          </Badge>
                          <Badge variant="default" size="sm">
                            {backup.format}
                          </Badge>
                        </div>

                        {backup.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            {backup.description}
                          </p>
                        )}

                        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(backup.created_at)}
                          </div>
                          <div className="flex items-center gap-1">
                            <HardDrive className="h-3 w-3" />
                            {BackupService.formatFileSize(backup.size_bytes)}
                          </div>
                          <div>Por: {backup.created_by_name}</div>
                        </div>

                        {backup.error_message && (
                          <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-sm text-red-800 dark:text-red-200">
                            Error: {backup.error_message}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 ml-4">
                        {backup.status === 'COMPLETED' && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDownload(backup)}
                              title="Descargar"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedBackup(backup);
                                setShowRestoreModal(true);
                              }}
                              title="Restaurar"
                            >
                              <RotateCcw className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(backup)}
                          title="Eliminar"
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <Database className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">No hay respaldos</p>
              <p className="text-sm">Crea tu primer respaldo para proteger tus datos</p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-700 dark:text-gray-300">
                Página {page} de {totalPages}
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
        </CardContent>
      </Card>

      {/* Create Backup Modal */}
      {showCreateModal && (
        <CreateBackupModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            loadBackups();
          }}
        />
      )}

      {/* Restore Backup Modal */}
      {showRestoreModal && selectedBackup && (
        <RestoreBackupModal
          backup={selectedBackup}
          onClose={() => {
            setShowRestoreModal(false);
            setSelectedBackup(null);
          }}
          onSuccess={() => {
            setShowRestoreModal(false);
            setSelectedBackup(null);
            loadBackups();
          }}
        />
      )}
    </div>
  );
}

// Create Backup Modal
function CreateBackupModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [backupType, setBackupType] = useState<BackupType>('FULL');
  const [format, setFormat] = useState<BackupFormat>('JSON');
  const [isCreating, setIsCreating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('El nombre es requerido');
      return;
    }

    try {
      setIsCreating(true);
      const data: CreateBackupDTO = {
        name: name.trim(),
        description: description.trim() || undefined,
        backup_type: backupType,
        format,
      };

      await BackupService.createBackup(data);
      toast.success('Respaldo creado exitosamente');
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || 'Error al crear respaldo');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-lg w-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Crear Nuevo Respaldo
            </CardTitle>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              ✕
            </button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nombre del Respaldo *
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ej: Respaldo mensual enero 2025"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Descripción
              </label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descripción opcional"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tipo de Respaldo *
              </label>
              <Select value={backupType} onChange={(e) => setBackupType(e.target.value as BackupType)}>
                <option value="FULL">Completo - Todos los datos</option>
                <option value="PARTIAL">Parcial - Solo tablas seleccionadas</option>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Formato *
              </label>
              <Select value={format} onChange={(e) => setFormat(e.target.value as BackupFormat)}>
                <option value="JSON">JSON - Formato de intercambio</option>
                <option value="SQL">SQL - Base de datos</option>
                <option value="XLSX">Excel - Hoja de cálculo</option>
              </Select>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isCreating}>
                {isCreating ? 'Creando...' : 'Crear Respaldo'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

// Restore Backup Modal
function RestoreBackupModal({
  backup,
  onClose,
  onSuccess,
}: {
  backup: Backup;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [confirm, setConfirm] = useState('');
  const [isRestoring, setIsRestoring] = useState(false);

  const handleRestore = async () => {
    if (confirm !== 'RESTAURAR') {
      toast.error('Debes escribir RESTAURAR para confirmar');
      return;
    }

    try {
      setIsRestoring(true);
      await BackupService.restoreBackup({
        backup_id: backup.id,
        confirm: true,
      });
      toast.success('Restauración completada exitosamente');
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || 'Error al restaurar respaldo');
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-lg w-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              Restaurar Respaldo
            </CardTitle>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              ✕
            </button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                <strong>Advertencia:</strong> Esta acción reemplazará todos los datos actuales con los datos
                del respaldo. Esta acción no se puede deshacer.
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                Respaldo a restaurar:
              </p>
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                <p className="font-medium text-gray-900 dark:text-white">{backup.name}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Creado: {new Date(backup.created_at).toLocaleString('es-CL')}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Tamaño: {BackupService.formatFileSize(backup.size_bytes)}
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Escribe <strong>RESTAURAR</strong> para confirmar *
              </label>
              <Input
                value={confirm}
                onChange={(e) => setConfirm(e.target.value.toUpperCase())}
                placeholder="RESTAURAR"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button
                variant="primary"
                onClick={handleRestore}
                disabled={isRestoring || confirm !== 'RESTAURAR'}
              >
                {isRestoring ? 'Restaurando...' : 'Restaurar Ahora'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
