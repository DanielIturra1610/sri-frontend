'use client';

import { Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { type Plan, formatCurrency } from '@/types/billing';
import { cn } from '@/lib/utils/cn';

interface PlanSelectorProps {
  plans: Plan[];
  currentPlanSlug?: string;
  onSelectPlan: (planSlug: string) => void;
  isProcessing: boolean;
  hasSubscription: boolean;
}

export function PlanSelector({
  plans,
  currentPlanSlug,
  onSelectPlan,
  isProcessing,
  hasSubscription,
}: PlanSelectorProps) {
  // Sort plans by amount (price_monthly)
  const sortedPlans = [...plans].sort((a, b) => (a.price_monthly || a.amount) - (b.price_monthly || b.amount));

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
        {hasSubscription ? 'Cambiar Plan' : 'Selecciona un Plan'}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {sortedPlans.map((plan, index) => {
          const isCurrent = plan.slug === currentPlanSlug;
          const isMiddle = index === 1; // Professional plan usually

          return (
            <Card
              key={plan.id}
              className={cn(
                'relative transition-all',
                isMiddle && 'border-blue-500 dark:border-blue-400 shadow-lg',
                isCurrent && 'ring-2 ring-green-500'
              )}
            >
              {isMiddle && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge variant="default" className="bg-blue-600">
                    Más Popular
                  </Badge>
                </div>
              )}
              {isCurrent && (
                <div className="absolute -top-3 right-4">
                  <Badge variant="success">
                    Plan Actual
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-2">
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {plan.description}
                </p>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Price */}
                <div className="text-center">
                  <span className="text-4xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(plan.price_monthly || plan.amount, plan.currency)}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400">
                    /mes
                  </span>
                </div>

                {/* Features */}
                <ul className="space-y-3">
                  {plan.features.map((feature, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400"
                    >
                      <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Action */}
                <Button
                  onClick={() => onSelectPlan(plan.slug)}
                  disabled={isProcessing || isCurrent}
                  variant={isMiddle ? 'primary' : 'outline'}
                  className="w-full"
                >
                  {isProcessing ? 'Procesando...' :
                   isCurrent ? 'Plan Actual' :
                   hasSubscription ? 'Renovar Plan' : 'Pagar y Activar'}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
