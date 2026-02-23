'use client';

import { CreditCard, Star, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { type PaymentMethod, getCardBrandLabel } from '@/types/billing';

interface PaymentMethodListProps {
  paymentMethods: PaymentMethod[];
  onSetDefault: (paymentMethodId: string) => void;
  onRemove: (paymentMethodId: string) => void;
  isProcessing: boolean;
}

// Card brand logos/colors
const brandColors: Record<string, string> = {
  visa: 'bg-blue-600',
  mastercard: 'bg-orange-500',
  amex: 'bg-blue-800',
  discover: 'bg-orange-600',
  default: 'bg-gray-600',
};

export function PaymentMethodList({
  paymentMethods,
  onSetDefault,
  onRemove,
  isProcessing,
}: PaymentMethodListProps) {
  const getBrandColor = (brand: string) =>
    brandColors[brand.toLowerCase()] || brandColors.default;

  return (
    <div className="space-y-4">
      {paymentMethods.map((method) => (
        <Card key={method.id}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Card Icon */}
                <div
                  className={`w-12 h-8 rounded flex items-center justify-center ${getBrandColor(
                    method.brand
                  )}`}
                >
                  <CreditCard className="h-5 w-5 text-white" />
                </div>

                {/* Card Info */}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {getCardBrandLabel(method.brand)} •••• {method.last4}
                    </span>
                    {method.is_default && (
                      <Badge variant="success" size="sm">
                        <Star className="h-3 w-3 mr-1" />
                        Predeterminada
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Expira {method.exp_month.toString().padStart(2, '0')}/{method.exp_year}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                {!method.is_default && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onSetDefault(method.id)}
                    disabled={isProcessing}
                  >
                    Hacer Predeterminada
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemove(method.id)}
                  disabled={isProcessing || method.is_default}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {paymentMethods.length === 0 && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No tienes métodos de pago registrados</p>
        </div>
      )}
    </div>
  );
}
