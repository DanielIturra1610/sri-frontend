'use client';

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent
} from '@/components/ui/Card';
import {
  Package,
  ArrowLeftRight,
  Bell,
  BarChart3,
  MapPin,
  Users,
  Shield,
  Clock,
  Zap
} from 'lucide-react';

const features = [
  {
    icon: Package,
    title: 'Gestión de Productos',
    description: 'Administra tu catálogo completo con categorías, SKUs, códigos de barras y control de stock mínimo.',
    color: 'text-primary',
    bgColor: 'bg-primary/10'
  },
  {
    icon: ArrowLeftRight,
    title: 'Transferencias',
    description: 'Mueve inventario entre ubicaciones con trazabilidad completa y aprobaciones configurables.',
    color: 'text-success',
    bgColor: 'bg-success/10'
  },
  {
    icon: Bell,
    title: 'Alertas Inteligentes',
    description: 'Recibe notificaciones de stock bajo, productos por vencer y movimientos inusuales.',
    color: 'text-warning',
    bgColor: 'bg-warning/10'
  },
  {
    icon: BarChart3,
    title: 'Reportes y Analytics',
    description: 'Dashboards interactivos con métricas clave, tendencias y exportación a múltiples formatos.',
    color: 'text-info',
    bgColor: 'bg-info/10'
  },
  {
    icon: MapPin,
    title: 'Multi-ubicación',
    description: 'Gestiona múltiples almacenes, tiendas o bodegas desde una única plataforma centralizada.',
    color: 'text-destructive',
    bgColor: 'bg-destructive/10'
  },
  {
    icon: Users,
    title: 'Control de Accesos',
    description: 'Roles y permisos granulares para cada usuario según sus responsabilidades.',
    color: 'text-primary',
    bgColor: 'bg-primary/10'
  },
  {
    icon: Shield,
    title: 'Auditoría Completa',
    description: 'Historial detallado de todas las operaciones con timestamps y usuarios responsables.',
    color: 'text-success',
    bgColor: 'bg-success/10'
  },
  {
    icon: Clock,
    title: 'Tiempo Real',
    description: 'Sincronización instantánea de datos entre todos los dispositivos y usuarios conectados.',
    color: 'text-info',
    bgColor: 'bg-info/10'
  },
  {
    icon: Zap,
    title: 'Ajustes Rápidos',
    description: 'Realiza ajustes de inventario, mermas y correcciones con flujos de aprobación.',
    color: 'text-warning',
    bgColor: 'bg-warning/10'
  }
];

export function Features() {
  return (
    <section id="features" className="py-20 lg:py-32 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Section header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Todo lo que necesitas para gestionar tu inventario
          </h2>
          <p className="text-lg text-muted-foreground">
            Herramientas potentes y fáciles de usar diseñadas para optimizar
            cada aspecto de tu gestión de stock.
          </p>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card
              key={index}
              variant="interactive"
              className="group"
            >
              <CardHeader>
                <div className={`w-12 h-12 rounded-xl ${feature.bgColor} flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}>
                  <feature.icon className={`w-6 h-6 ${feature.color}`} />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
