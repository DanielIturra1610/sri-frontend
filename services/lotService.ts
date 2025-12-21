import apiClient, { ApiResponse, handleApiError } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import type {
  Lot,
  CreateLotDTO,
  UpdateLotDTO,
  AdjustLotDTO,
  LotFilters,
} from '@/types';

/**
 * Lot Service
 * Handles all lot/batch-related API calls
 */

export class LotService {
  /**
   * Get all lots with optional filters
   */
  static async getLots(filters?: LotFilters): Promise<{ lots: Lot[]; total: number }> {
    try {
      const params = new URLSearchParams();
      if (filters?.product_id) params.append('product_id', filters.product_id);
      if (filters?.location_id) params.append('location_id', filters.location_id);
      if (filters?.supplier_id) params.append('supplier_id', filters.supplier_id);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.search) params.append('search', filters.search);
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.page_size) params.append('limit', filters.page_size.toString());
      if (filters?.sort_by) params.append('sort_by', filters.sort_by);
      if (filters?.sort_order) params.append('sort_dir', filters.sort_order);

      const queryString = params.toString();
      const url = queryString
        ? `${API_ENDPOINTS.LOTS.LIST}?${queryString}`
        : API_ENDPOINTS.LOTS.LIST;

      const response = await apiClient.get<ApiResponse<{ lots: Lot[]; total: number }>>(url);
      return response.data.data || { lots: [], total: 0 };
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get lot by ID
   */
  static async getLot(id: string): Promise<Lot> {
    try {
      const response = await apiClient.get<ApiResponse<Lot>>(API_ENDPOINTS.LOTS.GET(id));
      return response.data.data!;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Create a new lot
   */
  static async createLot(data: CreateLotDTO): Promise<Lot> {
    try {
      const response = await apiClient.post<ApiResponse<Lot>>(API_ENDPOINTS.LOTS.CREATE, data);
      return response.data.data!;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Update an existing lot
   */
  static async updateLot(id: string, data: UpdateLotDTO): Promise<Lot> {
    try {
      const response = await apiClient.put<ApiResponse<Lot>>(API_ENDPOINTS.LOTS.UPDATE(id), data);
      return response.data.data!;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Delete a lot
   */
  static async deleteLot(id: string): Promise<void> {
    try {
      await apiClient.delete(API_ENDPOINTS.LOTS.DELETE(id));
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Adjust lot quantity
   */
  static async adjustQuantity(id: string, data: AdjustLotDTO): Promise<Lot> {
    try {
      const response = await apiClient.post<ApiResponse<Lot>>(
        API_ENDPOINTS.LOTS.ADJUST(id),
        data
      );
      return response.data.data!;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get lots by product ID
   */
  static async getLotsByProduct(productId: string): Promise<Lot[]> {
    try {
      const response = await apiClient.get<ApiResponse<Lot[]>>(
        API_ENDPOINTS.LOTS.BY_PRODUCT(productId)
      );
      return response.data.data || [];
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get lots by location ID
   */
  static async getLotsByLocation(locationId: string): Promise<Lot[]> {
    try {
      const response = await apiClient.get<ApiResponse<Lot[]>>(
        API_ENDPOINTS.LOTS.BY_LOCATION(locationId)
      );
      return response.data.data || [];
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get expiring lots
   */
  static async getExpiringLots(daysUntilExpiry: number = 30): Promise<Lot[]> {
    try {
      const response = await apiClient.get<ApiResponse<Lot[]>>(
        `${API_ENDPOINTS.LOTS.EXPIRING}?days=${daysUntilExpiry}`
      );
      return response.data.data || [];
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}
