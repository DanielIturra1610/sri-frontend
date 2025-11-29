'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Settings,
  Building2,
  Globe,
  Bell,
  Shield,
  Package,
  Save,
  Upload,
} from 'lucide-react';
import { SettingsService } from '@/services/settingsService';
import { Button, Card, CardHeader, CardTitle, CardContent, Input, NativeSelect as Select } from '@/components/ui';
import { cn } from '@/lib/utils/cn';
import {
  companySettingsSchema,
  generalSettingsSchema,
  notificationSettingsSchema,
  securitySettingsSchema,
  inventorySettingsSchema,
  type CompanySettingsFormData,
  type GeneralSettingsFormData,
  type NotificationSettingsFormData,
  type SecuritySettingsFormData,
  type InventorySettingsFormData,
} from '@/lib/validations/settings';
import type { SystemSettings } from '@/types';
import toast from 'react-hot-toast';

type TabId = 'company' | 'general' | 'notifications' | 'security' | 'inventory';

interface Tab {
  id: TabId;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
}

const tabs: Tab[] = [
  { id: 'company', name: 'Empresa', icon: Building2 },
  { id: 'general', name: 'General', icon: Globe },
  { id: 'notifications', name: 'Notificaciones', icon: Bell },
  { id: 'security', name: 'Seguridad', icon: Shield },
  { id: 'inventory', name: 'Inventario', icon: Package },
];

export default function SystemSettingsPage() {
  const [activeTab, setActiveTab] = useState<TabId>('company');
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Load settings
  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const data = await SettingsService.getSettings();
      setSettings(data);
    } catch (error: any) {
      toast.error(error.message || 'Error al cargar configuración');
      console.error('Error loading settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Settings className="h-7 w-7" />
          Configuración del Sistema
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Gestiona las configuraciones generales del sistema
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap',
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                )}
              >
                <Icon className="h-5 w-5" />
                {tab.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {isLoading ? (
        <Card>
          <CardContent className="py-12 text-center text-gray-500 dark:text-gray-400">
            Cargando configuración...
          </CardContent>
        </Card>
      ) : settings ? (
        <>
          {activeTab === 'company' && (
            <CompanySettingsTab settings={settings} onSave={loadSettings} setIsSaving={setIsSaving} />
          )}
          {activeTab === 'general' && (
            <GeneralSettingsTab settings={settings} onSave={loadSettings} setIsSaving={setIsSaving} />
          )}
          {activeTab === 'notifications' && (
            <NotificationSettingsTab settings={settings} onSave={loadSettings} setIsSaving={setIsSaving} />
          )}
          {activeTab === 'security' && (
            <SecuritySettingsTab settings={settings} onSave={loadSettings} setIsSaving={setIsSaving} />
          )}
          {activeTab === 'inventory' && (
            <InventorySettingsTab settings={settings} onSave={loadSettings} setIsSaving={setIsSaving} />
          )}
        </>
      ) : null}
    </div>
  );
}

// Company Settings Tab
function CompanySettingsTab({
  settings,
  onSave,
  setIsSaving,
}: {
  settings: SystemSettings;
  onSave: () => void;
  setIsSaving: (saving: boolean) => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CompanySettingsFormData>({
    resolver: zodResolver(companySettingsSchema),
    defaultValues: {
      company_name: settings.company_name,
      company_rut: settings.company_rut,
      company_email: settings.company_email || '',
      company_phone: settings.company_phone || '',
      company_address: settings.company_address || '',
      company_city: settings.company_city || '',
      company_country: settings.company_country || '',
    },
  });

  const onSubmit = async (data: CompanySettingsFormData) => {
    try {
      setIsSaving(true);
      await SettingsService.updateCompanySettings(data);
      toast.success('Configuración de empresa actualizada');
      onSave();
    } catch (error: any) {
      toast.error(error.message || 'Error al guardar configuración');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Información de la Empresa
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nombre de la Empresa *
              </label>
              <Input {...register('company_name')} error={errors.company_name?.message} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                RUT *
              </label>
              <Input
                {...register('company_rut')}
                placeholder="12345678-9"
                error={errors.company_rut?.message}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>
              <Input
                {...register('company_email')}
                type="email"
                placeholder="contacto@empresa.cl"
                error={errors.company_email?.message}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Teléfono
              </label>
              <Input
                {...register('company_phone')}
                placeholder="+56 9 1234 5678"
                error={errors.company_phone?.message}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Dirección
              </label>
              <Input {...register('company_address')} error={errors.company_address?.message} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Ciudad
              </label>
              <Input {...register('company_city')} error={errors.company_city?.message} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                País
              </label>
              <Input {...register('company_country')} error={errors.company_country?.message} />
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit" leftIcon={<Save className="h-4 w-4" />}>
              Guardar Cambios
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

// General Settings Tab
function GeneralSettingsTab({
  settings,
  onSave,
  setIsSaving,
}: {
  settings: SystemSettings;
  onSave: () => void;
  setIsSaving: (saving: boolean) => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<GeneralSettingsFormData>({
    resolver: zodResolver(generalSettingsSchema),
    defaultValues: {
      timezone: settings.timezone,
      date_format: settings.date_format,
      currency: settings.currency,
      language: settings.language,
    },
  });

  const onSubmit = async (data: GeneralSettingsFormData) => {
    try {
      setIsSaving(true);
      await SettingsService.updateGeneralSettings(data);
      toast.success('Configuración general actualizada');
      onSave();
    } catch (error: any) {
      toast.error(error.message || 'Error al guardar configuración');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          Configuración General
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Zona Horaria *
              </label>
              <Select {...register('timezone')} error={errors.timezone?.message}>
                <option value="America/Santiago">Santiago (UTC-3)</option>
                <option value="America/New_York">Nueva York (UTC-5)</option>
                <option value="Europe/Madrid">Madrid (UTC+1)</option>
                <option value="Asia/Tokyo">Tokyo (UTC+9)</option>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Formato de Fecha *
              </label>
              <Select {...register('date_format')} error={errors.date_format?.message}>
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Moneda *
              </label>
              <Select {...register('currency')} error={errors.currency?.message}>
                <option value="CLP">Peso Chileno (CLP)</option>
                <option value="USD">Dólar (USD)</option>
                <option value="EUR">Euro (EUR)</option>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Idioma *
              </label>
              <Select {...register('language')} error={errors.language?.message}>
                <option value="es">Español</option>
                <option value="en">English</option>
              </Select>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit" leftIcon={<Save className="h-4 w-4" />}>
              Guardar Cambios
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

// Notification Settings Tab
function NotificationSettingsTab({
  settings,
  onSave,
  setIsSaving,
}: {
  settings: SystemSettings;
  onSave: () => void;
  setIsSaving: (saving: boolean) => void;
}) {
  const {
    register,
    handleSubmit,
  } = useForm<NotificationSettingsFormData>({
    resolver: zodResolver(notificationSettingsSchema),
    defaultValues: {
      email_notifications_enabled: settings.email_notifications_enabled,
      low_stock_notifications: settings.low_stock_notifications,
      transfer_notifications: settings.transfer_notifications,
      system_notifications: settings.system_notifications,
    },
  });

  const onSubmit = async (data: NotificationSettingsFormData) => {
    try {
      setIsSaving(true);
      await SettingsService.updateNotificationSettings(data);
      toast.success('Configuración de notificaciones actualizada');
      onSave();
    } catch (error: any) {
      toast.error(error.message || 'Error al guardar configuración');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Configuración de Notificaciones
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-4">
            <label className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-750">
              <input
                type="checkbox"
                {...register('email_notifications_enabled')}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  Habilitar notificaciones por email
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Recibir notificaciones importantes por correo electrónico
                </p>
              </div>
            </label>

            <label className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-750">
              <input
                type="checkbox"
                {...register('low_stock_notifications')}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  Alertas de stock bajo
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Notificar cuando productos estén por debajo del stock mínimo
                </p>
              </div>
            </label>

            <label className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-750">
              <input
                type="checkbox"
                {...register('transfer_notifications')}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  Notificaciones de transferencias
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Notificar sobre transferencias pendientes y completadas
                </p>
              </div>
            </label>

            <label className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-750">
              <input
                type="checkbox"
                {...register('system_notifications')}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  Notificaciones del sistema
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Recibir actualizaciones y mensajes del sistema
                </p>
              </div>
            </label>
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit" leftIcon={<Save className="h-4 w-4" />}>
              Guardar Cambios
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

// Security Settings Tab
function SecuritySettingsTab({
  settings,
  onSave,
  setIsSaving,
}: {
  settings: SystemSettings;
  onSave: () => void;
  setIsSaving: (saving: boolean) => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SecuritySettingsFormData>({
    resolver: zodResolver(securitySettingsSchema),
    defaultValues: {
      session_timeout_minutes: settings.session_timeout_minutes,
      password_expiry_days: settings.password_expiry_days,
      require_strong_password: settings.require_strong_password,
      enable_two_factor: settings.enable_two_factor,
    },
  });

  const onSubmit = async (data: SecuritySettingsFormData) => {
    try {
      setIsSaving(true);
      await SettingsService.updateSecuritySettings(data);
      toast.success('Configuración de seguridad actualizada');
      onSave();
    } catch (error: any) {
      toast.error(error.message || 'Error al guardar configuración');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Configuración de Seguridad
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tiempo de espera de sesión (minutos) *
              </label>
              <Input
                type="number"
                {...register('session_timeout_minutes', { valueAsNumber: true })}
                error={errors.session_timeout_minutes?.message}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Entre 5 y 1440 minutos (24 horas)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Expiración de contraseña (días) *
              </label>
              <Input
                type="number"
                {...register('password_expiry_days', { valueAsNumber: true })}
                error={errors.password_expiry_days?.message}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                0 para nunca expirar, máximo 365 días
              </p>
            </div>
          </div>

          <div className="space-y-4 pt-4">
            <label className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-750">
              <input
                type="checkbox"
                {...register('require_strong_password')}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  Requerir contraseñas fuertes
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Mínimo 8 caracteres con mayúsculas, minúsculas y números
                </p>
              </div>
            </label>

            <label className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-750">
              <input
                type="checkbox"
                {...register('enable_two_factor')}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  Habilitar autenticación de dos factores
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Agregar una capa adicional de seguridad con 2FA
                </p>
              </div>
            </label>
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit" leftIcon={<Save className="h-4 w-4" />}>
              Guardar Cambios
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

// Inventory Settings Tab
function InventorySettingsTab({
  settings,
  onSave,
  setIsSaving,
}: {
  settings: SystemSettings;
  onSave: () => void;
  setIsSaving: (saving: boolean) => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<InventorySettingsFormData>({
    resolver: zodResolver(inventorySettingsSchema),
    defaultValues: {
      auto_calculate_reorder_point: settings.auto_calculate_reorder_point,
      default_stock_unit: settings.default_stock_unit,
      allow_negative_stock: settings.allow_negative_stock,
      require_approval_for_adjustments: settings.require_approval_for_adjustments,
    },
  });

  const onSubmit = async (data: InventorySettingsFormData) => {
    try {
      setIsSaving(true);
      await SettingsService.updateInventorySettings(data);
      toast.success('Configuración de inventario actualizada');
      onSave();
    } catch (error: any) {
      toast.error(error.message || 'Error al guardar configuración');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Configuración de Inventario
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Unidad de stock por defecto *
            </label>
            <Select {...register('default_stock_unit')} error={errors.default_stock_unit?.message}>
              <option value="UN">Unidades (UN)</option>
              <option value="KG">Kilogramos (KG)</option>
              <option value="LT">Litros (LT)</option>
              <option value="MT">Metros (MT)</option>
              <option value="M2">Metros cuadrados (M2)</option>
              <option value="M3">Metros cúbicos (M3)</option>
            </Select>
          </div>

          <div className="space-y-4 pt-4">
            <label className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-750">
              <input
                type="checkbox"
                {...register('auto_calculate_reorder_point')}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  Calcular automáticamente punto de reorden
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Calcular basándose en el historial de ventas y consumo
                </p>
              </div>
            </label>

            <label className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-750">
              <input
                type="checkbox"
                {...register('allow_negative_stock')}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  Permitir stock negativo
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Permitir que el stock quede en negativo durante salidas
                </p>
              </div>
            </label>

            <label className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-750">
              <input
                type="checkbox"
                {...register('require_approval_for_adjustments')}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  Requerir aprobación para ajustes
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Los ajustes de stock deben ser aprobados por un supervisor
                </p>
              </div>
            </label>
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit" leftIcon={<Save className="h-4 w-4" />}>
              Guardar Cambios
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
