'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Settings,
  Save,
  ArrowLeft,
  Calendar,
  Clock,
  Mail,
  Database,
} from 'lucide-react';
import { BackupService } from '@/services/backupService';
import { Button, Card, CardHeader, CardTitle, CardContent, Input, Select } from '@/components/ui';
import type { BackupConfig, BackupFormat } from '@/types';
import toast from 'react-hot-toast';

export default function BackupConfigPage() {
  const router = useRouter();
  const [config, setConfig] = useState<BackupConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [autoBackupEnabled, setAutoBackupEnabled] = useState(false);
  const [frequency, setFrequency] = useState<'DAILY' | 'WEEKLY' | 'MONTHLY'>('DAILY');
  const [time, setTime] = useState('02:00');
  const [day, setDay] = useState(1);
  const [retentionDays, setRetentionDays] = useState(30);
  const [backupFormat, setBackupFormat] = useState<BackupFormat>('JSON');
  const [notificationEmail, setNotificationEmail] = useState('');

  // Load configuration
  const loadConfig = async () => {
    try {
      setIsLoading(true);
      const data = await BackupService.getBackupConfig();
      setConfig(data);

      // Set form state
      setAutoBackupEnabled(data.auto_backup_enabled);
      setFrequency(data.auto_backup_frequency);
      setTime(data.auto_backup_time);
      setDay(data.auto_backup_day || 1);
      setRetentionDays(data.retention_days);
      setBackupFormat(data.backup_format);
      setNotificationEmail(data.notification_email || '');
    } catch (error: any) {
      toast.error(error.message || 'Error al cargar configuración');
      console.error('Error loading backup config:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

  // Handle save
  const handleSave = async () => {
    try {
      setIsSaving(true);
      await BackupService.updateBackupConfig({
        auto_backup_enabled: autoBackupEnabled,
        auto_backup_frequency: frequency,
        auto_backup_time: time,
        auto_backup_day: frequency !== 'DAILY' ? day : undefined,
        retention_days: retentionDays,
        backup_format: backupFormat,
        notification_email: notificationEmail || undefined,
      });

      toast.success('Configuración guardada exitosamente');
      loadConfig();
    } catch (error: any) {
      toast.error(error.message || 'Error al guardar configuración');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<ArrowLeft className="h-4 w-4" />}
            onClick={() => router.push('/backups')}
            className="mb-2"
          >
            Volver a Respaldos
          </Button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Settings className="h-7 w-7" />
            Configuración de Respaldos Automáticos
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Configura los respaldos automáticos y políticas de retención
          </p>
        </div>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="py-12 text-center text-gray-500 dark:text-gray-400">
            Cargando configuración...
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Auto Backup Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Respaldos Automáticos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Enable Auto Backup */}
                <label className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-750">
                  <input
                    type="checkbox"
                    checked={autoBackupEnabled}
                    onChange={(e) => setAutoBackupEnabled(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      Habilitar respaldos automáticos
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      El sistema creará respaldos automáticamente según la frecuencia configurada
                    </p>
                  </div>
                </label>

                {autoBackupEnabled && (
                  <>
                    {/* Frequency */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Frecuencia *
                      </label>
                      <Select value={frequency} onChange={(e) => setFrequency(e.target.value as any)}>
                        <option value="DAILY">Diario</option>
                        <option value="WEEKLY">Semanal</option>
                        <option value="MONTHLY">Mensual</option>
                      </Select>
                    </div>

                    {/* Time */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Hora de ejecución *
                      </label>
                      <Input
                        type="time"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Hora en que se ejecutará el respaldo automático
                      </p>
                    </div>

                    {/* Day (for weekly/monthly) */}
                    {frequency === 'WEEKLY' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Día de la semana *
                        </label>
                        <Select value={day} onChange={(e) => setDay(parseInt(e.target.value))}>
                          <option value="0">Domingo</option>
                          <option value="1">Lunes</option>
                          <option value="2">Martes</option>
                          <option value="3">Miércoles</option>
                          <option value="4">Jueves</option>
                          <option value="5">Viernes</option>
                          <option value="6">Sábado</option>
                        </Select>
                      </div>
                    )}

                    {frequency === 'MONTHLY' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Día del mes *
                        </label>
                        <Input
                          type="number"
                          min="1"
                          max="31"
                          value={day}
                          onChange={(e) => setDay(parseInt(e.target.value))}
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Día del mes (1-31). Si el mes no tiene ese día, se usará el último día del mes.
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Retention and Format */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Políticas de Retención y Formato
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Retention Days */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Días de retención *
                  </label>
                  <Input
                    type="number"
                    min="1"
                    max="365"
                    value={retentionDays}
                    onChange={(e) => setRetentionDays(parseInt(e.target.value))}
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Los respaldos más antiguos que esta cantidad de días serán eliminados automáticamente
                  </p>
                </div>

                {/* Backup Format */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Formato de respaldo *
                  </label>
                  <Select value={backupFormat} onChange={(e) => setBackupFormat(e.target.value as BackupFormat)}>
                    <option value="JSON">JSON - Formato de intercambio</option>
                    <option value="SQL">SQL - Base de datos</option>
                    <option value="XLSX">Excel - Hoja de cálculo</option>
                  </Select>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Formato en que se guardarán los respaldos automáticos
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Notificaciones
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email para notificaciones
                </label>
                <Input
                  type="email"
                  value={notificationEmail}
                  onChange={(e) => setNotificationEmail(e.target.value)}
                  placeholder="admin@empresa.cl"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Se enviará un email a esta dirección cuando se complete o falle un respaldo automático
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button
              onClick={handleSave}
              disabled={isSaving}
              leftIcon={<Save className="h-4 w-4" />}
            >
              {isSaving ? 'Guardando...' : 'Guardar Configuración'}
            </Button>
          </div>

          {/* Info */}
          {config && (
            <Card>
              <CardHeader>
                <CardTitle>Información</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <p>
                  Los respaldos automáticos se ejecutarán en segundo plano según la configuración establecida.
                </p>
                <p>
                  Los respaldos antiguos se eliminarán automáticamente después de {retentionDays} días para
                  liberar espacio en el servidor.
                </p>
                <p>
                  Última actualización:{' '}
                  {new Date(config.updated_at).toLocaleString('es-CL')}
                </p>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
