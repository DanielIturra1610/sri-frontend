'use client';

import { Card } from '@/components/ui/Card';
import { TrendingDown, Clock, AlertTriangle, DollarSign } from 'lucide-react';

const problems = [
  {
    icon: DollarSign,
    value: '23%',
    label: 'Capital atrapado',
    description: 'En inventario que no rota',
    color: 'text-destructive'
  },
  {
    icon: AlertTriangle,
    value: '15%',
    label: 'Ventas perdidas',
    description: 'Por falta de stock',
    color: 'text-warning'
  },
  {
    icon: TrendingDown,
    value: '8%',
    label: 'Mermas anuales',
    description: 'Por mal seguimiento',
    color: 'text-destructive'
  },
  {
    icon: Clock,
    value: '12hrs',
    label: 'Tiempo semanal',
    description: 'En conteos manuales',
    color: 'text-warning'
  }
];

export function Stats() {
  return (
    <section className="py-20 lg:py-32 bg-background">
      <div className="container mx-auto px-4">
        {/* Section header */}
        <div className="text-center max-w-3xl mx-auto mb-6">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            ¿Te suena familiar?
          </h2>
          <p className="text-lg text-muted-foreground">
            Estos son los problemas más comunes que enfrentan las empresas
            sin un sistema de inventarios adecuado.
          </p>
        </div>

        {/* Problems grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {problems.map((problem, index) => (
            <Card
              key={index}
              variant="outlined"
              className="text-center p-8 border-destructive/20 bg-destructive/5"
            >
              <div className="w-14 h-14 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-6">
                <problem.icon className={`w-7 h-7 ${problem.color}`} />
              </div>
              <div className={`text-4xl md:text-5xl font-bold mb-2 ${problem.color}`}>
                {problem.value}
              </div>
              <div className="text-lg font-semibold text-foreground mb-1">
                {problem.label}
              </div>
              <div className="text-sm text-muted-foreground">
                {problem.description}
              </div>
            </Card>
          ))}
        </div>

        {/* Solution callout */}
        <div className="text-center max-w-2xl mx-auto p-8 rounded-2xl bg-primary/5 border border-primary/20">
          <p className="text-xl font-semibold text-foreground mb-2">
            Con SRI Inventarios, nuestros usuarios reportan:
          </p>
          <p className="text-lg text-primary font-bold">
            Reducción del 40% en pérdidas por stock + 60% menos tiempo en gestión
          </p>
        </div>
      </div>
    </section>
  );
}
