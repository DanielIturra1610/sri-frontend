import apiClient, { ApiResponse, handleApiError } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import type { Supplier, CreateSupplierDTO, UpdateSupplierDTO, SupplierFilters } from '@/types';

/**
 * Supplier Service
 * Handles all supplier-related API calls
 */

export class SupplierService {
  /**
   * Get all suppliers with optional filters
   */
  static async getSuppliers(
    filters?: SupplierFilters
  ): Promise<{ suppliers: Supplier[]; total: number }> {
    try {
      const params = new URLSearchParams();
      if (filters?.search) params.append('search', filters.search);
      if (filters?.is_active !== undefined) params.append('is_active', String(filters.is_active));
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.page_size) params.append('limit', filters.page_size.toString());
      if (filters?.sort_by) params.append('sort_by', filters.sort_by);
      if (filters?.sort_order) params.append('sort_order', filters.sort_order);

      const queryString = params.toString();
      const url = queryString
        ? `${API_ENDPOINTS.SUPPLIERS.LIST}?${queryString}`
        : API_ENDPOINTS.SUPPLIERS.LIST;

      const response = await apiClient.get<ApiResponse<{ suppliers: Supplier[]; total: number }>>(
        url
      );
      return response.data.data || { suppliers: [], total: 0 };
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get supplier by ID
   */
  static async getSupplier(id: string): Promise<Supplier> {
    try {
      const response = await apiClient.get<ApiResponse<Supplier>>(API_ENDPOINTS.SUPPLIERS.GET(id));
      return response.data.data!;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Create new supplier
   */
  static async createSupplier(data: CreateSupplierDTO): Promise<Supplier> {
    try {
      const response = await apiClient.post<ApiResponse<Supplier>>(
        API_ENDPOINTS.SUPPLIERS.CREATE,
        data
      );
      return response.data.data!;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Update supplier
   */
  static async updateSupplier(id: string, data: UpdateSupplierDTO): Promise<Supplier> {
    try {
      const response = await apiClient.put<ApiResponse<Supplier>>(
        API_ENDPOINTS.SUPPLIERS.UPDATE(id),
        data
      );
      return response.data.data!;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Delete supplier
   */
  static async deleteSupplier(id: string): Promise<void> {
    try {
      await apiClient.delete(API_ENDPOINTS.SUPPLIERS.DELETE(id));
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}
