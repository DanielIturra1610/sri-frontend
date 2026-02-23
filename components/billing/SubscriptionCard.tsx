'use client';

import { Calendar, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  type Plan,
  type Subscription,
  type SubscriptionStatus,
  formatCurrency,
  getSubscriptionStatusLabel,
} from '@/types/billing';

interface SubscriptionCardProps {
  subscription: Subscription;
  currentPlan?: Plan;
  onCancel: () => void;
  onReactivate: () => void;
  isProcessing: boolean;
}

const statusColors: Record<SubscriptionStatus, 'success' | 'warning' | 'destructive' | 'info' | 'muted'> = {
  active: 'success',
  trialing: 'info',
  past_due: 'warning',
  canceled: 'destructive',
  unpaid: 'destructive',
  incomplete: 'warning',
  incomplete_expired: 'muted',
};

export function SubscriptionCard({
  subscription,
  currentPlan,
  onCancel,
  onReactivate,
  isProcessing,
}: SubscriptionCardProps) {
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('es-CL', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const isActive = subscription.status === 'active' || subscription.status === 'trialing';
  const isCanceled = subscription.cancel_at_period_end;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="flex items-center gap-2">
            {isActive ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <XCircle className="h-5 w-5 text-red-600" />
            )}
            Tu Suscripción
          </CardTitle>
          <Badge variant={statusColors[subscription.status]}>
            {getSubscriptionStatusLabel(subscription.status)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Plan Info */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {currentPlan?.name || 'Plan Desconocido'}
              </h3>
              {currentPlan && (
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                  {formatCurrency(currentPlan.amount, currentPlan.currency)}
                  <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                    /{currentPlan.interval === 'month' ? 'mes' : 'año'}
                  </span>
                </p>
              )}
            </div>
          </div>

          {/* Features */}
          {currentPlan?.features && currentPlan.features.length > 0 && (
            <ul className="mt-4 space-y-2">
              {currentPlan.features.map((feature, index) => (
                <li key={index} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Period Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Inicio del período</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {formatDate(subscription.current_period_start)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {isCanceled ? 'Se cancela el' : 'Próxima facturación'}
              </p>
              <p className="font-medium text-gray-900 dark:text-white">
                {formatDate(subscription.current_period_end)}
              </p>
            </div>
          </div>
        </div>

        {/* Trial Info */}
        {subscription.status === 'trialing' && subscription.trial_end && (
          <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-700 dark:text-blue-300">
            <AlertTriangle className="h-5 w-5" />
            <span className="text-sm">
              Tu período de prueba termina el {formatDate(subscription.trial_end)}
            </span>
          </div>
        )}

        {/* Cancel Warning */}
        {isCanceled && (
          <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg text-yellow-700 dark:text-yellow-300">
            <AlertTriangle className="h-5 w-5" />
            <span className="text-sm">
              Tu suscripción se cancelará al final del período actual
            </span>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          {isCanceled ? (
            <Button
              onClick={onReactivate}
              disabled={isProcessing}
              variant="primary"
            >
              Reactivar Suscripción
            </Button>
          ) : (
            <Button
              onClick={onCancel}
              disabled={isProcessing}
              variant="outline"
              className="text-red-600 border-red-300 hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/20"
            >
              Cancelar Suscripción
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
