'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  FileText,
  TrendingUp,
  DollarSign,
  Activity,
  Download,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface ReportType {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
  color: string;
}

export default function ReportsPage() {
  const router = useRouter();

  const reports: ReportType[] = [
    {
      id: 'valuation',
      title: 'Valorización de Inventario',
      description:
        'Valor total del inventario por producto, categoría y ubicación',
      icon: <DollarSign className="h-8 w-8" />,
      path: '/reports/valuation',
      color: 'text-green-600',
    },
    {
      id: 'movements',
      title: 'Movimientos de Stock',
      description:
        'Historial de transacciones y movimientos por período',
      icon: <Activity className="h-8 w-8" />,
      path: '/reports/movements',
      color: 'text-blue-600',
    },
    {
      id: 'rotation',
      title: 'Rotación de Productos',
      description:
        'Análisis de productos con mayor y menor movimiento',
      icon: <TrendingUp className="h-8 w-8" />,
      path: '/reports/rotation',
      color: 'text-purple-600',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Reportes de Inventario</h1>
        <p className="text-gray-600 mt-2">
          Análisis y reportes detallados del inventario
        </p>
      </div>

      {/* Report Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.map((report) => (
          <Card
            key={report.id}
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => router.push(report.path)}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className={report.color}>{report.icon}</div>
                <FileText className="h-5 w-5 text-gray-400" />
              </div>
              <CardTitle className="mt-4">{report.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">{report.description}</p>
              <div className="mt-4 flex items-center text-sm text-blue-600 font-medium">
                Ver reporte
                <span className="ml-1">→</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Acciones Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              variant="outline"
              className="justify-start"
              onClick={() => router.push('/reports/valuation')}
            >
              <DollarSign className="h-4 w-4 mr-2" />
              Generar Reporte de Valorización
            </Button>
            <Button
              variant="outline"
              className="justify-start"
              onClick={() => router.push('/reports/movements')}
            >
              <Activity className="h-4 w-4 mr-2" />
              Ver Movimientos del Mes
            </Button>
            <Button
              variant="outline"
              className="justify-start"
              onClick={() => router.push('/reports/rotation')}
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Analizar Rotación
            </Button>
            <Button
              variant="outline"
              className="justify-start"
              onClick={() => {
                alert('Funcionalidad de exportación en desarrollo');
              }}
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar Todos los Reportes
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
