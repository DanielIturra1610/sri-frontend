'use client';

import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  ArrowRight,
  Package,
  BarChart3,
  Shield,
  Rocket,
  Gift,
  CreditCard
} from 'lucide-react';
import Link from 'next/link';

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-background via-background to-muted/30">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 py-20 lg:py-32">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge - Early Access */}
          <Badge variant="success" className="mb-6 px-4 py-1.5 text-sm animate-pulse">
            <Rocket className="w-3.5 h-3.5 mr-2" />
            Prueba gratuita por 30 días - Sin tarjeta de crédito
          </Badge>

          {/* Main heading */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-6">
            Deja de perder dinero por{' '}
            <span className="text-primary bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              mal control de stock
            </span>
          </h1>

          {/* Subtitle - Problem focused */}
          <p className="text-lg md:text-xl text-muted-foreground mb-6 max-w-2xl mx-auto leading-relaxed">
            El 43% de las PyMEs pierden ventas por falta de stock o tienen capital
            atrapado en inventario excesivo. Nosotros te ayudamos a resolver eso.
          </p>

          {/* Value proposition */}
          <div className="flex flex-wrap justify-center gap-4 mb-10 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Gift className="w-4 h-4 text-success" />
              <span>30 días gratis</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <CreditCard className="w-4 h-4 text-success" />
              <span>Sin tarjeta requerida</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Rocket className="w-4 h-4 text-success" />
              <span>Configuración en 5 minutos</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link href="/register">
              <Button size="xl" className="shadow-lg shadow-primary/25 text-base" rightIcon={<ArrowRight className="w-5 h-5" />}>
                Empezar prueba gratuita
              </Button>
            </Link>
            <Link href="#features">
              <Button variant="outline" size="xl">
                Ver cómo funciona
              </Button>
            </Link>
          </div>

          {/* Feature highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <div className="flex items-center justify-center gap-3 p-4 rounded-xl bg-card border border-border/50 shadow-soft">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                <Package className="w-5 h-5 text-primary" />
              </div>
              <span className="font-medium text-foreground">Control de stock</span>
            </div>
            <div className="flex items-center justify-center gap-3 p-4 rounded-xl bg-card border border-border/50 shadow-soft">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-success/10">
                <BarChart3 className="w-5 h-5 text-success" />
              </div>
              <span className="font-medium text-foreground">Alertas automáticas</span>
            </div>
            <div className="flex items-center justify-center gap-3 p-4 rounded-xl bg-card border border-border/50 shadow-soft">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-info/10">
                <Shield className="w-5 h-5 text-info" />
              </div>
              <span className="font-medium text-foreground">Multi-ubicación</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
