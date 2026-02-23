'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, XCircle, Loader2, CreditCard } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

function BillingCallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'pending'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const processCallback = async () => {
      // Check for payment status from query params
      const paymentStatus = searchParams.get('payment');
      const token = searchParams.get('token');

      // If coming from payment redirect
      if (paymentStatus || token) {
        // Flow payment status: 1 = pending, 2 = paid, 3 = rejected, 4 = cancelled
        if (paymentStatus === '2' || paymentStatus === 'success') {
          setStatus('success');
          setMessage('Tu pago ha sido procesado exitosamente. Tu suscripción está activa.');
          localStorage.removeItem('pending_plan');
        } else if (paymentStatus === '1' || paymentStatus === 'pending') {
          setStatus('pending');
          setMessage('Tu pago está pendiente de confirmación. Te notificaremos cuando se complete.');
        } else if (paymentStatus === '3' || paymentStatus === 'rejected') {
          setStatus('error');
          setMessage('El pago fue rechazado. Por favor, intenta con otro medio de pago.');
        } else if (paymentStatus === '4' || paymentStatus === 'cancelled') {
          setStatus('error');
          setMessage('El pago fue cancelado.');
        } else if (token) {
          // Just token without status - backend will confirm via webhook
          setStatus('pending');
          setMessage('Verificando el estado del pago...');
          // Wait a moment and redirect
          setTimeout(() => {
            router.push('/settings/billing');
          }, 3000);
        } else {
          setStatus('error');
          setMessage('No se pudo determinar el estado del pago.');
        }
      } else {
        // No params - redirect back
        router.push('/settings/billing');
      }
    };

    processCallback();
  }, [searchParams, router]);

  const handleContinue = () => {
    router.push('/settings/billing');
  };

  const handleGoToDashboard = () => {
    router.push('/dashboard');
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-md">
      <Card>
        <CardHeader>
          <CardTitle className="text-center flex items-center justify-center gap-2">
            <CreditCard className="h-6 w-6" />
            {status === 'loading' && 'Procesando...'}
            {status === 'success' && 'Pago Exitoso'}
            {status === 'pending' && 'Pago Pendiente'}
            {status === 'error' && 'Error en el Pago'}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          {status === 'loading' && (
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
              <p className="text-gray-600 dark:text-gray-400">
                Procesando tu pago...
              </p>
            </div>
          )}

          {status === 'success' && (
            <div className="flex flex-col items-center gap-4">
              <CheckCircle className="h-12 w-12 text-green-600" />
              <p className="text-gray-600 dark:text-gray-400">{message}</p>
              <div className="flex gap-3 w-full">
                <Button
                  variant="outline"
                  onClick={handleContinue}
                  className="flex-1"
                >
                  Ver Facturación
                </Button>
                <Button
                  onClick={handleGoToDashboard}
                  className="flex-1"
                >
                  Ir al Dashboard
                </Button>
              </div>
            </div>
          )}

          {status === 'pending' && (
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-12 w-12 text-yellow-600 animate-spin" />
              <p className="text-gray-600 dark:text-gray-400">{message}</p>
              <Button onClick={handleContinue} className="w-full">
                Ir a Facturación
              </Button>
            </div>
          )}

          {status === 'error' && (
            <div className="flex flex-col items-center gap-4">
              <XCircle className="h-12 w-12 text-red-600" />
              <p className="text-gray-600 dark:text-gray-400">{message}</p>
              <div className="flex gap-3 w-full">
                <Button
                  variant="outline"
                  onClick={handleContinue}
                  className="flex-1"
                >
                  Volver
                </Button>
                <Button
                  onClick={handleContinue}
                  className="flex-1"
                >
                  Intentar de nuevo
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function BillingCallbackPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto py-8 px-4 max-w-md">
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-8">
            <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
            <p className="text-gray-600 dark:text-gray-400">Cargando...</p>
          </CardContent>
        </Card>
      </div>
    }>
      <BillingCallbackContent />
    </Suspense>
  );
}
