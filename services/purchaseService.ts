import apiClient, { ApiResponse, handleApiError } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import type {
  Purchase,
  CreatePurchaseDTO,
  ReceivePurchaseDTO,
  CancelPurchaseDTO,
  PurchaseSummary,
  PurchaseFilters,
} from '@/types';

/**
 * Purchase Service
 * Handles all purchase-related API calls
 */

export class PurchaseService {
  /**
   * Get all purchases with optional filters
   */
  static async getPurchases(
    filters?: PurchaseFilters
  ): Promise<{ purchases: Purchase[]; total: number }> {
    try {
      const params = new URLSearchParams();
      if (filters?.supplier_id) params.append('supplier_id', filters.supplier_id);
      if (filters?.location_id) params.append('location_id', filters.location_id);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.date_from) params.append('date_from', filters.date_from);
      if (filters?.date_to) params.append('date_to', filters.date_to);
      if (filters?.search) params.append('search', filters.search);
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.page_size) params.append('limit', filters.page_size.toString());
      if (filters?.sort_by) params.append('sort_by', filters.sort_by);
      if (filters?.sort_order) params.append('sort_order', filters.sort_order);

      const queryString = params.toString();
      const url = queryString
        ? `${API_ENDPOINTS.PURCHASES.LIST}?${queryString}`
        : API_ENDPOINTS.PURCHASES.LIST;

      const response = await apiClient.get<ApiResponse<{ purchases: Purchase[]; total: number }>>(
        url
      );
      return response.data.data || { purchases: [], total: 0 };
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get purchase by ID
   */
  static async getPurchase(id: string): Promise<Purchase> {
    try {
      const response = await apiClient.get<ApiResponse<Purchase>>(API_ENDPOINTS.PURCHASES.GET(id));
      return response.data.data!;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Create new purchase
   */
  static async createPurchase(data: CreatePurchaseDTO): Promise<Purchase> {
    try {
      const response = await apiClient.post<ApiResponse<Purchase>>(
        API_ENDPOINTS.PURCHASES.CREATE,
        data
      );
      return response.data.data!;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Mark purchase as ordered
   */
  static async orderPurchase(id: string): Promise<Purchase> {
    try {
      const response = await apiClient.post<ApiResponse<Purchase>>(
        API_ENDPOINTS.PURCHASES.ORDER(id)
      );
      return response.data.data!;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Receive purchase items (updates inventory automatically)
   */
  static async receivePurchase(id: string, data: ReceivePurchaseDTO): Promise<Purchase> {
    try {
      const response = await apiClient.post<ApiResponse<Purchase>>(
        API_ENDPOINTS.PURCHASES.RECEIVE(id),
        data
      );
      return response.data.data!;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Cancel a purchase
   */
  static async cancelPurchase(id: string, data: CancelPurchaseDTO): Promise<Purchase> {
    try {
      const response = await apiClient.post<ApiResponse<Purchase>>(
        API_ENDPOINTS.PURCHASES.CANCEL(id),
        data
      );
      return response.data.data!;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get purchases summary
   */
  static async getSummary(filters?: {
    supplier_id?: string;
    location_id?: string;
    date_from?: string;
    date_to?: string;
  }): Promise<PurchaseSummary> {
    try {
      const params = new URLSearchParams();
      if (filters?.supplier_id) params.append('supplier_id', filters.supplier_id);
      if (filters?.location_id) params.append('location_id', filters.location_id);
      if (filters?.date_from) params.append('date_from', filters.date_from);
      if (filters?.date_to) params.append('date_to', filters.date_to);

      const queryString = params.toString();
      const url = queryString
        ? `${API_ENDPOINTS.PURCHASES.SUMMARY}?${queryString}`
        : API_ENDPOINTS.PURCHASES.SUMMARY;

      const response = await apiClient.get<ApiResponse<PurchaseSummary>>(url);
      return response.data.data!;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}
