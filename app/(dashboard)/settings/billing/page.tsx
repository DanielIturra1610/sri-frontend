'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  CreditCard,
  Package,
  Receipt,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  RefreshCw,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/Alert';
import { Spinner } from '@/components/ui/Spinner';
import { BillingService } from '@/services/billingService';
import {
  formatCurrency,
  getSubscriptionStatusLabel,
  type Plan,
  type Subscription,
  type PaymentMethod,
  type PaymentHistory,
} from '@/types/billing';
import { cn } from '@/lib/utils/cn';
import toast from 'react-hot-toast';

// Components
import { SubscriptionCard } from '@/components/billing/SubscriptionCard';
import { PlanSelector } from '@/components/billing/PlanSelector';
import { PaymentMethodList } from '@/components/billing/PaymentMethodList';
import { InvoiceHistory } from '@/components/billing/InvoiceHistory';
import { AddPaymentMethodFlow } from '@/components/billing/AddPaymentMethodFlow';

type TabId = 'subscription' | 'payment-methods' | 'invoices';

interface Tab {
  id: TabId;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
}

const tabs: Tab[] = [
  { id: 'subscription', name: 'Suscripción', icon: Package },
  { id: 'payment-methods', name: 'Métodos de Pago', icon: CreditCard },
  { id: 'invoices', name: 'Historial de Pagos', icon: Receipt },
];

export default function BillingPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabId>('subscription');
  const [isLoading, setIsLoading] = useState(true);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [invoices, setInvoices] = useState<PaymentHistory[]>([]);
  const [showAddPaymentModal, setShowAddPaymentModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const loadBillingData = async () => {
    try {
      setIsLoading(true);
      const [plansData, subscriptionData, paymentMethodsData, invoicesData] =
        await Promise.all([
          BillingService.getPlans(),
          BillingService.getSubscription(),
          BillingService.getPaymentMethods(),
          BillingService.getInvoices(10, 0),
        ]);

      setPlans(plansData);
      setSubscription(subscriptionData);
      setPaymentMethods(paymentMethodsData);
      setInvoices(invoicesData.data);
    } catch (error: any) {
      toast.error(error.message || 'Error al cargar datos de facturación');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBillingData();
  }, []);

  const handleSubscribe = async (planSlug: string) => {
    try {
      setIsProcessing(true);
      // Create one-time payment order and redirect to Flow
      const paymentOrder = await BillingService.createPaymentOrder({
        plan_slug: planSlug,
      });

      toast.success('Redirigiendo a la pasarela de pago...');

      // Save plan slug in case we need it after return
      localStorage.setItem('pending_plan', planSlug);

      // Redirect to Flow payment page
      window.location.href = paymentOrder.payment_url;
    } catch (error: any) {
      toast.error(error.message || 'Error al crear orden de pago');
      setIsProcessing(false);
    }
    // Note: We don't setIsProcessing(false) on success because we're redirecting
  };

  const handleChangePlan = async (priceId: string) => {
    try {
      setIsProcessing(true);
      await BillingService.changePlan({ price_id: priceId });
      toast.success('Plan actualizado exitosamente');
      await loadBillingData();
    } catch (error: any) {
      toast.error(error.message || 'Error al cambiar plan');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!confirm('¿Estás seguro de que deseas cancelar tu suscripción?')) {
      return;
    }

    try {
      setIsProcessing(true);
      await BillingService.cancelSubscription();
      toast.success('Suscripción cancelada. Se mantendrá activa hasta el fin del período');
      await loadBillingData();
    } catch (error: any) {
      toast.error(error.message || 'Error al cancelar suscripción');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReactivateSubscription = async () => {
    try {
      setIsProcessing(true);
      await BillingService.reactivateSubscription();
      toast.success('Suscripción reactivada');
      await loadBillingData();
    } catch (error: any) {
      toast.error(error.message || 'Error al reactivar suscripción');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSetDefaultPaymentMethod = async (paymentMethodId: string) => {
    try {
      setIsProcessing(true);
      await BillingService.setDefaultPaymentMethod(paymentMethodId);
      toast.success('Método de pago predeterminado actualizado');
      await loadBillingData();
    } catch (error: any) {
      toast.error(error.message || 'Error al actualizar método de pago');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemovePaymentMethod = async (paymentMethodId: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este método de pago?')) {
      return;
    }

    try {
      setIsProcessing(true);
      await BillingService.removePaymentMethod(paymentMethodId);
      toast.success('Método de pago eliminado');
      await loadBillingData();
    } catch (error: any) {
      toast.error(error.message || 'Error al eliminar método de pago');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaymentMethodAdded = async () => {
    setShowAddPaymentModal(false);
    await loadBillingData();
    toast.success('Método de pago agregado exitosamente');
  };

  const currentPlan = plans.find((p) => p.slug === subscription?.plan_slug);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/settings')}
            leftIcon={<ArrowLeft className="h-4 w-4" />}
          >
            Volver
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <CreditCard className="h-7 w-7" />
              Facturación y Suscripción
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Gestiona tu plan, métodos de pago e historial de facturas
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={loadBillingData}
          disabled={isLoading}
          leftIcon={<RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />}
        >
          Actualizar
        </Button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap',
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                )}
              >
                <Icon className="h-5 w-5" />
                {tab.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : (
        <>
          {activeTab === 'subscription' && (
            <div className="space-y-6">
              {/* Current Subscription */}
              {subscription && (
                <SubscriptionCard
                  subscription={subscription}
                  currentPlan={currentPlan}
                  onCancel={handleCancelSubscription}
                  onReactivate={handleReactivateSubscription}
                  isProcessing={isProcessing}
                />
              )}

              {/* Plan Selector */}
              <PlanSelector
                plans={plans}
                currentPlanSlug={subscription?.plan_slug}
                onSelectPlan={subscription ? handleChangePlan : handleSubscribe}
                isProcessing={isProcessing}
                hasSubscription={!!subscription}
              />
            </div>
          )}

          {activeTab === 'payment-methods' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Métodos de Pago
                </h2>
                <Button
                  onClick={() => setShowAddPaymentModal(true)}
                  leftIcon={<CreditCard className="h-4 w-4" />}
                >
                  Agregar Tarjeta
                </Button>
              </div>

              <PaymentMethodList
                paymentMethods={paymentMethods}
                onSetDefault={handleSetDefaultPaymentMethod}
                onRemove={handleRemovePaymentMethod}
                isProcessing={isProcessing}
              />

              {paymentMethods.length === 0 && (
                <Alert variant="info">
                  <AlertTitle>Sin métodos de pago</AlertTitle>
                  <AlertDescription>
                    Agrega un método de pago para poder suscribirte a un plan.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {activeTab === 'invoices' && (
            <InvoiceHistory invoices={invoices} />
          )}
        </>
      )}

      {/* Add Payment Method Modal - Flow */}
      <AddPaymentMethodFlow
        isOpen={showAddPaymentModal}
        onClose={() => setShowAddPaymentModal(false)}
        onSuccess={handlePaymentMethodAdded}
      />
    </div>
  );
}
