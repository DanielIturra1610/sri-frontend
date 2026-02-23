'use client';

import { useState } from 'react';
import { CreditCard, Loader2, ExternalLink } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Alert, AlertDescription } from '@/components/ui/Alert';
import { BillingService } from '@/services/billingService';

interface AddPaymentMethodFlowProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddPaymentMethodFlow({
  isOpen,
  onClose,
  onSuccess,
}: AddPaymentMethodFlowProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddCard = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Create SetupIntent - Flow returns a URL to redirect to
      const response = await BillingService.createSetupIntent();

      if (response.url) {
        // Redirect to Flow's card registration page
        window.location.href = response.url;
      } else {
        setError('No se pudo obtener la URL de registro de tarjeta');
      }
    } catch (err: any) {
      setError(err.message || 'Error al iniciar el registro de tarjeta');
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setError(null);
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Agregar Medio de Pago">
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-4">
          <CreditCard className="h-6 w-6 text-blue-600" />
          <p className="text-gray-600 dark:text-gray-400">
            Serás redirigido a Flow para registrar tu tarjeta de forma segura
          </p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-3">
            <img
              src="/images/flow-logo.png"
              alt="Flow"
              className="h-8"
              onError={(e) => {
                // Fallback if image doesn't exist
                e.currentTarget.style.display = 'none';
              }}
            />
            <span className="font-medium text-gray-900 dark:text-white">
              Pago seguro con Flow
            </span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Flow es el procesador de pagos líder en Chile. Tu información de pago está
            protegida con encriptación de nivel bancario.
          </p>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" />
          </svg>
          <span>
            Aceptamos Visa, Mastercard, American Express y tarjetas de débito
          </span>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleAddCard}
            disabled={isLoading}
            leftIcon={
              isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ExternalLink className="h-4 w-4" />
              )
            }
          >
            {isLoading ? 'Redirigiendo...' : 'Continuar a Flow'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
