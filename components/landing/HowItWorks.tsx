'use client';

import { Card } from '@/components/ui/Card';
import { UserPlus, Package, BarChart3, Rocket } from 'lucide-react';

const steps = [
  {
    number: '01',
    icon: UserPlus,
    title: 'Crea tu cuenta',
    description: 'Regístrate en menos de 2 minutos. Solo necesitas tu email y crear una contraseña.',
    color: 'bg-primary'
  },
  {
    number: '02',
    icon: Package,
    title: 'Configura tu inventario',
    description: 'Importa tus productos desde Excel o agrégalos manualmente. Te guiamos paso a paso.',
    color: 'bg-success'
  },
  {
    number: '03',
    icon: BarChart3,
    title: 'Gestiona y monitorea',
    description: 'Controla movimientos, recibe alertas automáticas y visualiza reportes en tiempo real.',
    color: 'bg-info'
  },
  {
    number: '04',
    icon: Rocket,
    title: 'Escala tu negocio',
    description: 'Añade ubicaciones, usuarios y funcionalidades a medida que tu empresa crece.',
    color: 'bg-warning'
  }
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 lg:py-32 bg-background">
      <div className="container mx-auto px-4">
        {/* Section header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Comienza en minutos, no en semanas
          </h2>
          <p className="text-lg text-muted-foreground">
            Diseñamos el proceso más simple para que puedas empezar a controlar
            tu inventario hoy mismo.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              {/* Connector line (hidden on last item and mobile) */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-border to-transparent" />
              )}

              <Card variant="ghost" className="text-center p-6 relative">
                {/* Step number */}
                <div className="text-6xl font-bold text-muted/20 absolute top-4 right-4">
                  {step.number}
                </div>

                {/* Icon */}
                <div className={`w-16 h-16 rounded-2xl ${step.color} flex items-center justify-center mx-auto mb-6 shadow-lg`}>
                  <step.icon className="w-8 h-8 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  {step.title}
                </h3>
                <p className="text-muted-foreground">
                  {step.description}
                </p>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
