// Billing types for Stripe integration

export type SubscriptionStatus =
  | 'active'
  | 'past_due'
  | 'canceled'
  | 'unpaid'
  | 'trialing'
  | 'incomplete'
  | 'incomplete_expired';

export type PaymentStatus =
  | 'succeeded'
  | 'pending'
  | 'failed'
  | 'refunded'
  | 'canceled';

export interface Plan {
  id: string;
  name: string;
  slug: string;
  description: string;
  price_id: string; // flow_plan_id from backend
  price_monthly: number;
  price_yearly: number;
  amount: number; // For display (monthly price by default)
  currency: string;
  interval: string;
  features: string[];
  max_users?: number;
  max_products?: number;
  max_locations?: number;
}

export interface Subscription {
  id: string;
  status: SubscriptionStatus;
  plan_id: string;
  plan_slug?: string;
  plan_name?: string;
  billing_cycle: 'monthly' | 'yearly';
  current_period_start?: string;
  current_period_end?: string;
  cancel_at_period_end: boolean;
  trial_end?: string;
  created_at: string;
}

export interface PaymentMethod {
  id: string;
  brand: string;
  last4: string;
  exp_month: number;
  exp_year: number;
  is_default: boolean;
}

export interface PaymentHistory {
  id: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  description?: string;
  flow_order_id?: string;
  failure_message?: string;
  created_at: string;
}

export interface SetupIntentResponse {
  client_secret: string;
  url?: string; // Flow.cl redirect URL for card registration
}

export interface PaymentOrderResponse {
  order_id: string;
  token: string;
  payment_url: string;
  amount: number;
  currency: string;
}

export interface CreatePaymentOrderDTO {
  plan_slug: string;
}

export interface PlansResponse {
  plans: Plan[];
}

export interface CreateSubscriptionDTO {
  plan_slug: string;
  billing_cycle: 'monthly' | 'yearly';
}

export interface ChangePlanDTO {
  price_id: string;
}

export interface AddPaymentMethodDTO {
  payment_method_id: string;
}

// API Response wrappers
export interface BillingApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface PaginatedBillingResponse<T> {
  success: boolean;
  data: T[];
  meta: {
    total: number;
    limit: number;
    offset: number;
  };
}

// Helper function to format currency
export function formatCurrency(amount: number, currency: string = 'clp'): string {
  const currencyMap: Record<string, { locale: string; currency: string }> = {
    clp: { locale: 'es-CL', currency: 'CLP' },
    usd: { locale: 'en-US', currency: 'USD' },
    eur: { locale: 'de-DE', currency: 'EUR' },
  };

  const config = currencyMap[currency.toLowerCase()] || currencyMap.clp;

  return new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency: config.currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Helper to get subscription status in Spanish
export function getSubscriptionStatusLabel(status: SubscriptionStatus): string {
  const labels: Record<SubscriptionStatus, string> = {
    active: 'Activa',
    past_due: 'Pago pendiente',
    canceled: 'Cancelada',
    unpaid: 'Sin pagar',
    trialing: 'Periodo de prueba',
    incomplete: 'Incompleta',
    incomplete_expired: 'Expirada',
  };
  return labels[status] || status;
}

// Helper to get payment status in Spanish
export function getPaymentStatusLabel(status: PaymentStatus): string {
  const labels: Record<PaymentStatus, string> = {
    succeeded: 'Exitoso',
    pending: 'Pendiente',
    failed: 'Fallido',
    refunded: 'Reembolsado',
    canceled: 'Cancelado',
  };
  return labels[status] || status;
}

// Helper to get card brand display name
export function getCardBrandLabel(brand: string): string {
  const brands: Record<string, string> = {
    visa: 'Visa',
    mastercard: 'Mastercard',
    amex: 'American Express',
    discover: 'Discover',
    diners: 'Diners Club',
    jcb: 'JCB',
    unionpay: 'UnionPay',
  };
  return brands[brand.toLowerCase()] || brand;
}
