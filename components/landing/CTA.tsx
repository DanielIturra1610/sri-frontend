'use client';

import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ArrowRight, Gift, Zap, HeartHandshake, Clock } from 'lucide-react';
import Link from 'next/link';

const earlyAdopterBenefits = [
  {
    icon: Gift,
    title: '30 días gratis',
    description: 'Prueba todas las funciones sin compromiso'
  },
  {
    icon: Zap,
    title: 'Configuración asistida',
    description: 'Te ayudamos a configurar tu inventario'
  },
  {
    icon: HeartHandshake,
    title: 'Soporte prioritario',
    description: 'Atención directa con nuestro equipo'
  },
  {
    icon: Clock,
    title: 'Precio de fundador',
    description: 'Tarifa especial de por vida'
  }
];

export function CTA() {
  return (
    <section className="py-20 lg:py-32 bg-gradient-to-b from-muted/30 to-background">
      <div className="container mx-auto px-4">
        <div className="relative max-w-5xl mx-auto">
          {/* Background decoration */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl" />
          </div>

          <div className="text-center bg-card border border-border rounded-3xl p-8 md:p-12 lg:p-16 shadow-soft-lg">
            {/* Early adopter badge */}
            <Badge variant="warning" className="mb-6 px-4 py-1.5 text-sm">
              <Gift className="w-3.5 h-3.5 mr-2" />
              Oferta de lanzamiento - Cupos limitados
            </Badge>

            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
              Sé de los primeros en transformar tu negocio
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              Únete ahora y obtén beneficios exclusivos para fundadores.
              Sin riesgo, cancela cuando quieras.
            </p>

            {/* Benefits grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
              {earlyAdopterBenefits.map((benefit, index) => (
                <div
                  key={index}
                  className="p-4 rounded-xl bg-muted/50 border border-border/50"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <benefit.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="font-semibold text-foreground mb-1">
                    {benefit.title}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {benefit.description}
                  </div>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
              <Link href="/register">
                <Button size="xl" className="shadow-lg shadow-primary/25 text-base" rightIcon={<ArrowRight className="w-5 h-5" />}>
                  Comenzar prueba gratuita
                </Button>
              </Link>
            </div>

            {/* Trust note */}
            <p className="text-sm text-muted-foreground">
              Sin tarjeta de crédito requerida. Configuración en menos de 5 minutos.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
