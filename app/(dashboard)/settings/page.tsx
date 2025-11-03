'use client';

import { useRouter } from 'next/navigation';
import { Settings, Sliders, Bell, Shield, Database } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface SettingCard {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
  color: string;
  available: boolean;
}

export default function SettingsPage() {
  const router = useRouter();

  const settings: SettingCard[] = [
    {
      id: 'system',
      title: 'Configuración del Sistema',
      description:
        'Gestiona configuraciones generales, empresa, seguridad, notificaciones e inventario',
      icon: <Settings className="h-8 w-8" />,
      path: '/settings/system',
      color: 'text-purple-600',
      available: true,
    },
    {
      id: 'thresholds',
      title: 'Umbrales de Stock',
      description:
        'Configura los niveles mínimos y máximos de stock por producto o categoría',
      icon: <Sliders className="h-8 w-8" />,
      path: '/settings/thresholds',
      color: 'text-blue-600',
      available: true,
    },
    {
      id: 'permissions',
      title: 'Permisos y Roles',
      description: 'Administra roles de usuario y permisos de acceso al sistema',
      icon: <Shield className="h-8 w-8" />,
      path: '/settings/permissions',
      color: 'text-red-600',
      available: false,
    },
    {
      id: 'backup',
      title: 'Respaldo y Restauración',
      description: 'Configura respaldos automáticos y restaura datos anteriores',
      icon: <Database className="h-8 w-8" />,
      path: '/backups',
      color: 'text-green-600',
      available: true,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Configuración del Sistema</h1>
        <p className="text-gray-600 mt-2">
          Gestiona la configuración general de SRI Inventarios
        </p>
      </div>

      {/* Settings Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {settings.map((setting) => (
          <Card
            key={setting.id}
            className={`${
              setting.available
                ? 'hover:shadow-lg transition-shadow cursor-pointer'
                : 'opacity-60'
            }`}
            onClick={() => setting.available && router.push(setting.path)}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className={setting.color}>{setting.icon}</div>
                {!setting.available && (
                  <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">
                    Próximamente
                  </span>
                )}
              </div>
              <CardTitle className="mt-4">{setting.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">{setting.description}</p>
              {setting.available && (
                <div className="mt-4 flex items-center text-sm text-blue-600 font-medium">
                  Configurar
                  <span className="ml-1">→</span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Acerca de la Configuración
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-gray-600">
          <p>
            Esta sección te permite personalizar el comportamiento del sistema
            de acuerdo a las necesidades de tu organización.
          </p>
          <p>
            Las configuraciones aquí realizadas afectan a todos los usuarios del
            sistema. Asegúrate de tener los permisos necesarios antes de
            realizar cambios importantes.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
