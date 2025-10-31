import apiClient, { ApiResponse, handleApiError } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import type { Transaction, TransactionFilters } from '@/types';

/**
 * Transaction Service
 * Handles all transaction-related API calls
 */

export class TransactionService {
  /**
   * Get all transactions with optional filters
   */
  static async getTransactions(filters?: TransactionFilters): Promise<Transaction[]> {
    try {
      const params = new URLSearchParams();

      if (filters?.product_id) params.append('product_id', filters.product_id);
      if (filters?.location_id) params.append('location_id', filters.location_id);
      if (filters?.transaction_type) params.append('transaction_type', filters.transaction_type);
      if (filters?.date_from) params.append('date_from', filters.date_from);
      if (filters?.date_to) params.append('date_to', filters.date_to);
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.page_size) params.append('page_size', filters.page_size.toString());
      if (filters?.sort_by) params.append('sort_by', filters.sort_by);
      if (filters?.sort_order) params.append('sort_order', filters.sort_order);

      const url = params.toString()
        ? `${API_ENDPOINTS.TRANSACTIONS.LIST}?${params.toString()}`
        : API_ENDPOINTS.TRANSACTIONS.LIST;

      const response = await apiClient.get<ApiResponse<Transaction[]>>(url);
      return response.data.data || [];
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get transaction by ID
   */
  static async getTransaction(id: string): Promise<Transaction> {
    try {
      const response = await apiClient.get<ApiResponse<Transaction>>(
        API_ENDPOINTS.TRANSACTIONS.GET(id)
      );
      return response.data.data!;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Export transactions to Excel
   */
  static async exportToExcel(filters?: TransactionFilters): Promise<Blob> {
    try {
      const params = new URLSearchParams();

      if (filters?.product_id) params.append('product_id', filters.product_id);
      if (filters?.location_id) params.append('location_id', filters.location_id);
      if (filters?.transaction_type) params.append('transaction_type', filters.transaction_type);
      if (filters?.date_from) params.append('date_from', filters.date_from);
      if (filters?.date_to) params.append('date_to', filters.date_to);

      const url = params.toString()
        ? `${API_ENDPOINTS.TRANSACTIONS.LIST}/export?${params.toString()}`
        : `${API_ENDPOINTS.TRANSACTIONS.LIST}/export`;

      const response = await apiClient.get(url, {
        responseType: 'blob',
      });

      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}
