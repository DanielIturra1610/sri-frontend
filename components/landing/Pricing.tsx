'use client';

import { Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils/cn';
import { useAuth } from '@/lib/contexts/AuthContext';

const plans = [
  {
    name: 'Básico',
    slug: 'basico',
    description: 'Ideal para pequeños negocios que están comenzando',
    price: 9990,
    interval: 'mes',
    features: [
      'Hasta 500 productos',
      '2 ubicaciones',
      '3 usuarios',
      'Reportes básicos',
      'Soporte por email',
      'Alertas de stock bajo',
    ],
    cta: 'Comenzar Gratis',
    popular: false,
  },
  {
    name: 'Profesional',
    slug: 'profesional',
    description: 'Para negocios en crecimiento con múltiples ubicaciones',
    price: 24990,
    interval: 'mes',
    features: [
      'Hasta 5,000 productos',
      '10 ubicaciones',
      '10 usuarios',
      'Reportes avanzados',
      'Soporte prioritario',
      'Alertas personalizadas',
      'Integraciones API',
      'Exportación ilimitada',
    ],
    cta: 'Probar 14 días gratis',
    popular: true,
  },
  {
    name: 'Empresarial',
    slug: 'empresarial',
    description: 'Solución completa para grandes operaciones',
    price: 49990,
    interval: 'mes',
    features: [
      'Productos ilimitados',
      'Ubicaciones ilimitadas',
      'Usuarios ilimitados',
      'Reportes personalizados',
      'Soporte 24/7',
      'Alertas avanzadas con IA',
      'API completa',
      'Integraciones premium',
      'Onboarding dedicado',
      'SLA garantizado',
    ],
    cta: 'Contactar Ventas',
    popular: false,
  },
];

function formatPrice(price: number): string {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

export function Pricing() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const handlePlanSelect = (planSlug: string) => {
    if (isAuthenticated) {
      // Si está autenticado, ir a billing
      router.push('/settings/billing');
    } else {
      // Si no está autenticado, ir a registro con el plan preseleccionado
      router.push(`/register?plan=${planSlug}`);
    }
  };

  return (
    <section id="pricing" className="py-20 lg:py-32 bg-background">
      <div className="container mx-auto px-4">
        {/* Section header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Planes simples y transparentes
          </h2>
          <p className="text-lg text-muted-foreground">
            Elige el plan que mejor se adapte a tu negocio. Todos incluyen 14 días
            de prueba gratis sin compromiso.
          </p>
        </div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={cn(
                'relative flex flex-col',
                plan.popular && 'border-primary shadow-xl scale-105 z-10'
              )}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground px-4 py-1">
                    Más Popular
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-2">
                <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                <p className="text-muted-foreground text-sm mt-2">
                  {plan.description}
                </p>
              </CardHeader>

              <CardContent className="flex-1 flex flex-col">
                {/* Price */}
                <div className="text-center py-6 border-b border-border mb-6">
                  <span className="text-4xl md:text-5xl font-bold text-foreground">
                    {formatPrice(plan.price)}
                  </span>
                  <span className="text-muted-foreground ml-1">/{plan.interval}</span>
                </div>

                {/* Features */}
                <ul className="space-y-3 flex-1 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Button
                  variant={plan.popular ? 'primary' : 'outline'}
                  className="w-full"
                  size="lg"
                  onClick={() => handlePlanSelect(plan.slug)}
                >
                  {plan.cta}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Additional info */}
        <div className="text-center mt-12 text-muted-foreground">
          <p>
            Todos los precios son en pesos chilenos (CLP) e incluyen IVA.
          </p>
          <p className="mt-2">
            ¿Necesitas algo diferente?{' '}
            <a href="mailto:ventas@sriinventarios.cl" className="text-primary hover:underline">
              Contáctanos
            </a>{' '}
            para un plan personalizado.
          </p>
        </div>
      </div>
    </section>
  );
}
