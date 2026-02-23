import apiClient, { ApiResponse, handleApiError } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import type {
  Sale,
  CreateSaleDTO,
  QuickSaleDTO,
  CancelSaleDTO,
  SaleSummary,
  DailySales,
  SaleFilters,
} from '@/types';

/**
 * Sale Service
 * Handles all sale-related API calls
 */

export class SaleService {
  /**
   * Get all sales with optional filters
   */
  static async getSales(filters?: SaleFilters): Promise<{ sales: Sale[]; total: number }> {
    try {
      const params = new URLSearchParams();
      if (filters?.location_id) params.append('location_id', filters.location_id);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.payment_method) params.append('payment_method', filters.payment_method);
      if (filters?.date_from) params.append('date_from', filters.date_from);
      if (filters?.date_to) params.append('date_to', filters.date_to);
      if (filters?.search) params.append('search', filters.search);
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.page_size) params.append('limit', filters.page_size.toString());
      if (filters?.sort_by) params.append('sort_by', filters.sort_by);
      if (filters?.sort_order) params.append('sort_order', filters.sort_order);

      const queryString = params.toString();
      const url = queryString
        ? `${API_ENDPOINTS.SALES.LIST}?${queryString}`
        : API_ENDPOINTS.SALES.LIST;

      const response = await apiClient.get<ApiResponse<{ sales: Sale[]; total: number }>>(url);
      return response.data.data || { sales: [], total: 0 };
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get sale by ID
   */
  static async getSale(id: string): Promise<Sale> {
    try {
      const response = await apiClient.get<ApiResponse<Sale>>(API_ENDPOINTS.SALES.GET(id));
      return response.data.data!;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Create new sale (draft)
   */
  static async createSale(data: CreateSaleDTO): Promise<Sale> {
    try {
      const response = await apiClient.post<ApiResponse<Sale>>(API_ENDPOINTS.SALES.CREATE, data);
      return response.data.data!;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Quick sale - Create and complete in one step
   */
  static async quickSale(data: QuickSaleDTO): Promise<Sale> {
    try {
      const response = await apiClient.post<ApiResponse<Sale>>(
        API_ENDPOINTS.SALES.QUICK_SALE,
        data
      );
      return response.data.data!;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Complete a draft sale
   */
  static async completeSale(id: string): Promise<Sale> {
    try {
      const response = await apiClient.post<ApiResponse<Sale>>(API_ENDPOINTS.SALES.COMPLETE(id));
      return response.data.data!;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Cancel a sale
   */
  static async cancelSale(id: string, data: CancelSaleDTO): Promise<Sale> {
    try {
      const response = await apiClient.post<ApiResponse<Sale>>(
        API_ENDPOINTS.SALES.CANCEL(id),
        data
      );
      return response.data.data!;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get sales summary
   */
  static async getSummary(filters?: {
    location_id?: string;
    date_from?: string;
    date_to?: string;
  }): Promise<SaleSummary> {
    try {
      const params = new URLSearchParams();
      if (filters?.location_id) params.append('location_id', filters.location_id);
      if (filters?.date_from) params.append('date_from', filters.date_from);
      if (filters?.date_to) params.append('date_to', filters.date_to);

      const queryString = params.toString();
      const url = queryString
        ? `${API_ENDPOINTS.SALES.SUMMARY}?${queryString}`
        : API_ENDPOINTS.SALES.SUMMARY;

      const response = await apiClient.get<ApiResponse<SaleSummary>>(url);
      return response.data.data!;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get daily sales data
   */
  static async getDailySales(filters?: {
    location_id?: string;
    date_from?: string;
    date_to?: string;
  }): Promise<DailySales[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.location_id) params.append('location_id', filters.location_id);
      if (filters?.date_from) params.append('date_from', filters.date_from);
      if (filters?.date_to) params.append('date_to', filters.date_to);

      const queryString = params.toString();
      const url = queryString
        ? `${API_ENDPOINTS.SALES.DAILY}?${queryString}`
        : API_ENDPOINTS.SALES.DAILY;

      const response = await apiClient.get<ApiResponse<DailySales[]>>(url);
      return response.data.data || [];
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}
