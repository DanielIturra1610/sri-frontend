import apiClient, { ApiResponse, handleApiError } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import type {
  InventoryCount,
  InventoryCountItem,
  CreateInventoryCountDTO,
  CompleteCountDTO,
  CancelCountDTO,
  ScanBarcodeDTO,
  RegisterCountDTO,
  UpdateCountItemDTO,
  ScanResult,
  DiscrepancyItem,
  CountSummary,
  CountFilters,
} from '@/types';

/**
 * Count Service
 * Handles all physical inventory count-related API calls
 * Including barcode scanning functionality for camera integration
 */

interface CountListResponse {
  counts: InventoryCount[];
  total: number;
  page: number;
  pages: number;
}

interface CountItemsResponse {
  items: InventoryCountItem[];
  total: number;
}

interface DiscrepanciesResponse {
  discrepancies: DiscrepancyItem[];
  total: number;
}

export class CountService {
  /**
   * Create a new inventory count session
   */
  static async create(data: CreateInventoryCountDTO): Promise<InventoryCount> {
    try {
      const response = await apiClient.post<ApiResponse<InventoryCount>>(
        API_ENDPOINTS.COUNTS.CREATE,
        data
      );
      return response.data.data!;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get all count sessions with optional filters
   */
  static async list(filters?: CountFilters): Promise<CountListResponse> {
    try {
      const response = await apiClient.get<ApiResponse<CountListResponse>>(
        API_ENDPOINTS.COUNTS.LIST,
        { params: filters }
      );
      return response.data.data || { counts: [], total: 0, page: 1, pages: 0 };
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get a count session by ID
   */
  static async getById(id: string): Promise<InventoryCount> {
    try {
      const response = await apiClient.get<ApiResponse<InventoryCount>>(
        API_ENDPOINTS.COUNTS.GET(id)
      );
      return response.data.data!;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Start a count session (transition from DRAFT to IN_PROGRESS)
   */
  static async start(id: string): Promise<InventoryCount> {
    try {
      const response = await apiClient.post<ApiResponse<InventoryCount>>(
        API_ENDPOINTS.COUNTS.START(id)
      );
      return response.data.data!;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Complete a count session and optionally apply adjustments
   */
  static async complete(id: string, data: CompleteCountDTO): Promise<InventoryCount> {
    try {
      const response = await apiClient.post<ApiResponse<InventoryCount>>(
        API_ENDPOINTS.COUNTS.COMPLETE(id),
        data
      );
      return response.data.data!;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Cancel a count session
   */
  static async cancel(id: string, data: CancelCountDTO): Promise<InventoryCount> {
    try {
      const response = await apiClient.post<ApiResponse<InventoryCount>>(
        API_ENDPOINTS.COUNTS.CANCEL(id),
        data
      );
      return response.data.data!;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Delete a count session (only DRAFT status)
   */
  static async delete(id: string): Promise<void> {
    try {
      await apiClient.delete(API_ENDPOINTS.COUNTS.DELETE(id));
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get all items for a count session
   */
  static async getItems(countId: string): Promise<InventoryCountItem[]> {
    try {
      const response = await apiClient.get<ApiResponse<CountItemsResponse>>(
        API_ENDPOINTS.COUNTS.ITEMS(countId)
      );
      return response.data.data?.items || [];
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get pending (not yet counted) items
   */
  static async getPendingItems(countId: string): Promise<InventoryCountItem[]> {
    try {
      const response = await apiClient.get<ApiResponse<CountItemsResponse>>(
        API_ENDPOINTS.COUNTS.PENDING(countId)
      );
      return response.data.data?.items || [];
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get already counted items
   */
  static async getCountedItems(countId: string): Promise<InventoryCountItem[]> {
    try {
      const response = await apiClient.get<ApiResponse<CountItemsResponse>>(
        API_ENDPOINTS.COUNTS.COUNTED(countId)
      );
      return response.data.data?.items || [];
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Scan a barcode - CRITICAL for camera functionality
   * This is the main method used when scanning products with the camera
   */
  static async scanBarcode(countId: string, data: ScanBarcodeDTO): Promise<ScanResult> {
    try {
      const response = await apiClient.post<ApiResponse<ScanResult>>(
        API_ENDPOINTS.COUNTS.SCAN(countId),
        data
      );
      return response.data.data!;
    } catch (error: any) {
      // Handle specific error codes
      const errorData = error.response?.data?.error;
      if (errorData?.code === 'BARCODE_NOT_FOUND') {
        throw new Error('BARCODE_NOT_FOUND');
      }
      if (errorData?.code === 'PRODUCT_ALREADY_COUNTED') {
        // Return the scan result with already_counted flag
        return {
          already_counted: true,
          previous_count: errorData.details?.previous_count,
          counted_at: errorData.details?.counted_at,
          counted_by: errorData.details?.counted_by,
          item: errorData.details?.item_id ? { id: errorData.details.item_id } as InventoryCountItem : {} as InventoryCountItem,
        };
      }
      if (errorData?.code === 'COUNT_NOT_IN_PROGRESS') {
        throw new Error('COUNT_NOT_IN_PROGRESS');
      }
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Manually register a count (without barcode scanning)
   */
  static async registerCount(countId: string, data: RegisterCountDTO): Promise<InventoryCountItem> {
    try {
      const response = await apiClient.post<ApiResponse<InventoryCountItem>>(
        API_ENDPOINTS.COUNTS.ITEMS(countId),
        data
      );
      return response.data.data!;
    } catch (error: any) {
      const errorData = error.response?.data?.error;
      if (errorData?.code === 'PRODUCT_ALREADY_COUNTED') {
        throw new Error('PRODUCT_ALREADY_COUNTED');
      }
      if (errorData?.code === 'COUNT_NOT_IN_PROGRESS') {
        throw new Error('COUNT_NOT_IN_PROGRESS');
      }
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Update the count for an existing item
   */
  static async updateItemCount(
    countId: string,
    itemId: string,
    data: UpdateCountItemDTO
  ): Promise<InventoryCountItem> {
    try {
      const response = await apiClient.put<ApiResponse<InventoryCountItem>>(
        API_ENDPOINTS.COUNTS.UPDATE_ITEM(countId, itemId),
        data
      );
      return response.data.data!;
    } catch (error: any) {
      const errorData = error.response?.data?.error;
      if (errorData?.code === 'COUNT_NOT_IN_PROGRESS') {
        throw new Error('COUNT_NOT_IN_PROGRESS');
      }
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get items with discrepancies (for reporting)
   */
  static async getDiscrepancies(countId: string): Promise<DiscrepancyItem[]> {
    try {
      const response = await apiClient.get<ApiResponse<DiscrepanciesResponse>>(
        API_ENDPOINTS.COUNTS.DISCREPANCIES(countId)
      );
      return response.data.data?.discrepancies || [];
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get count session summary
   */
  static async getSummary(countId: string): Promise<CountSummary> {
    try {
      const response = await apiClient.get<ApiResponse<CountSummary>>(
        API_ENDPOINTS.COUNTS.SUMMARY(countId)
      );
      return response.data.data!;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}
