import apiClient, { ApiResponse, handleApiError } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import type {
  Plan,
  Subscription,
  PaymentMethod,
  PaymentHistory,
  SetupIntentResponse,
  PlansResponse,
  CreateSubscriptionDTO,
  ChangePlanDTO,
  AddPaymentMethodDTO,
  PaginatedBillingResponse,
  PaymentOrderResponse,
  CreatePaymentOrderDTO,
} from '@/types/billing';

/**
 * Billing Service
 * Handles all billing and subscription-related API calls
 */
export class BillingService {
  /**
   * Get available subscription plans
   */
  static async getPlans(): Promise<Plan[]> {
    try {
      const response = await apiClient.get<ApiResponse<PlansResponse>>(
        API_ENDPOINTS.BILLING.PLANS
      );
      return response.data.data?.plans || [];
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Create a setup intent for adding a payment method
   */
  static async createSetupIntent(): Promise<SetupIntentResponse> {
    try {
      const response = await apiClient.post<ApiResponse<SetupIntentResponse>>(
        API_ENDPOINTS.BILLING.SETUP_INTENT
      );
      return response.data.data!;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get current subscription
   */
  static async getSubscription(): Promise<Subscription | null> {
    try {
      const response = await apiClient.get<ApiResponse<Subscription | null>>(
        API_ENDPOINTS.BILLING.SUBSCRIPTION
      );
      return response.data.data || null;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Create a new subscription
   */
  static async createSubscription(data: CreateSubscriptionDTO): Promise<Subscription> {
    try {
      const response = await apiClient.post<ApiResponse<Subscription>>(
        API_ENDPOINTS.BILLING.SUBSCRIBE,
        data
      );
      return response.data.data!;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Cancel subscription (at end of period)
   */
  static async cancelSubscription(): Promise<void> {
    try {
      await apiClient.post(API_ENDPOINTS.BILLING.CANCEL);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Reactivate a subscription set to cancel
   */
  static async reactivateSubscription(): Promise<Subscription> {
    try {
      const response = await apiClient.post<ApiResponse<Subscription>>(
        API_ENDPOINTS.BILLING.REACTIVATE
      );
      return response.data.data!;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Change subscription plan
   */
  static async changePlan(data: ChangePlanDTO): Promise<Subscription> {
    try {
      const response = await apiClient.post<ApiResponse<Subscription>>(
        API_ENDPOINTS.BILLING.CHANGE_PLAN,
        data
      );
      return response.data.data!;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get payment methods
   */
  static async getPaymentMethods(): Promise<PaymentMethod[]> {
    try {
      const response = await apiClient.get<ApiResponse<PaymentMethod[]>>(
        API_ENDPOINTS.BILLING.PAYMENT_METHODS
      );
      return response.data.data || [];
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Add a payment method
   */
  static async addPaymentMethod(data: AddPaymentMethodDTO): Promise<PaymentMethod> {
    try {
      const response = await apiClient.post<ApiResponse<PaymentMethod>>(
        API_ENDPOINTS.BILLING.ADD_PAYMENT_METHOD,
        data
      );
      return response.data.data!;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Remove a payment method
   */
  static async removePaymentMethod(paymentMethodId: string): Promise<void> {
    try {
      await apiClient.delete(
        API_ENDPOINTS.BILLING.REMOVE_PAYMENT_METHOD(paymentMethodId)
      );
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Set default payment method
   */
  static async setDefaultPaymentMethod(paymentMethodId: string): Promise<void> {
    try {
      await apiClient.post(
        API_ENDPOINTS.BILLING.SET_DEFAULT_PAYMENT_METHOD(paymentMethodId)
      );
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get payment history / invoices
   */
  static async getInvoices(
    limit: number = 10,
    offset: number = 0
  ): Promise<{ data: PaymentHistory[]; total: number }> {
    try {
      const response = await apiClient.get<PaginatedBillingResponse<PaymentHistory>>(
        API_ENDPOINTS.BILLING.INVOICES,
        { params: { limit, offset } }
      );
      return {
        data: response.data.data || [],
        total: response.data.meta?.total || 0,
      };
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Create a one-time payment order
   * Returns the Flow.cl payment URL to redirect the user
   */
  static async createPaymentOrder(data: CreatePaymentOrderDTO): Promise<PaymentOrderResponse> {
    try {
      const response = await apiClient.post<ApiResponse<PaymentOrderResponse>>(
        API_ENDPOINTS.BILLING.PAY,
        data
      );
      return response.data.data!;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}
