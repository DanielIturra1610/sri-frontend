import apiClient, { ApiResponse, handleApiError } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import type { Transfer, CreateTransferDTO, TransferStatus } from '@/types';

/**
 * Transfer Service
 * Handles all transfer-related API calls
 */

export class TransferService {
  /**
   * Get all transfers
   */
  static async getTransfers(): Promise<Transfer[]> {
    try {
      const response = await apiClient.get<ApiResponse<{ transfers: Transfer[]; total: number }>>(
        API_ENDPOINTS.TRANSFERS.LIST
      );
      // Backend returns { data: { transfers: [...], total: N } }
      return response.data.data?.transfers || [];
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get transfer by ID
   */
  static async getTransfer(id: string): Promise<Transfer> {
    try {
      const response = await apiClient.get<ApiResponse<Transfer>>(
        API_ENDPOINTS.TRANSFERS.GET(id)
      );
      return response.data.data!;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get transfers by product
   */
  static async getTransfersByProduct(productId: string): Promise<Transfer[]> {
    try {
      const response = await apiClient.get<ApiResponse<Transfer[]>>(
        API_ENDPOINTS.TRANSFERS.GET_BY_PRODUCT(productId)
      );
      return response.data.data || [];
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get transfers by status
   */
  static async getTransfersByStatus(status: TransferStatus): Promise<Transfer[]> {
    try {
      const response = await apiClient.get<ApiResponse<Transfer[]>>(
        API_ENDPOINTS.TRANSFERS.GET_BY_STATUS(status)
      );
      return response.data.data || [];
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Create new transfer
   */
  static async createTransfer(data: CreateTransferDTO): Promise<Transfer> {
    try {
      const response = await apiClient.post<ApiResponse<Transfer>>(
        API_ENDPOINTS.TRANSFERS.CREATE,
        data
      );
      return response.data.data!;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Update transfer status
   */
  static async updateStatus(id: string, status: TransferStatus): Promise<Transfer> {
    try {
      const response = await apiClient.patch<ApiResponse<Transfer>>(
        API_ENDPOINTS.TRANSFERS.UPDATE_STATUS(id),
        { status }
      );
      return response.data.data!;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Complete transfer
   */
  static async completeTransfer(id: string): Promise<Transfer> {
    try {
      const response = await apiClient.post<ApiResponse<Transfer>>(
        API_ENDPOINTS.TRANSFERS.COMPLETE(id)
      );
      return response.data.data!;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Cancel transfer
   */
  static async cancelTransfer(id: string): Promise<Transfer> {
    try {
      const response = await apiClient.post<ApiResponse<Transfer>>(
        API_ENDPOINTS.TRANSFERS.CANCEL(id)
      );
      return response.data.data!;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Delete transfer
   */
  static async deleteTransfer(id: string): Promise<void> {
    try {
      await apiClient.delete(API_ENDPOINTS.TRANSFERS.DELETE(id));
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}
