import apiClient, { ApiResponse, handleApiError } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import type { Stock, Transaction } from '@/types';

// DTO for creating new stock record
export interface CreateStockDTO {
  product_id: string;
  location_id: string;
  quantity?: number;
  minimum_stock?: number;
  maximum_stock?: number;
}

// DTO for adjusting existing stock
export interface AdjustStockDTO {
  quantity: number;
  reason: string;
}

/**
 * Stock Service
 * Handles all stock and inventory transaction-related API calls
 */

export class StockService {
  /**
   * Get all stock items
   */
  static async getAllStock(): Promise<Stock[]> {
    try {
      const response = await apiClient.get<ApiResponse<{ stock: Stock[]; total: number }>>(
        API_ENDPOINTS.STOCK.LIST
      );
      return response.data.data?.stock || [];
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get stock by product ID (all locations)
   */
  static async getStockByProduct(productId: string): Promise<Stock[]> {
    try {
      const response = await apiClient.get<ApiResponse<{ stock: Stock[]; total: number }>>(
        API_ENDPOINTS.STOCK.GET_BY_PRODUCT(productId)
      );
      return response.data.data?.stock || [];
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get stock by location ID (all products)
   */
  static async getStockByLocation(locationId: string): Promise<Stock[]> {
    try {
      const response = await apiClient.get<ApiResponse<{ stock: Stock[]; total: number }>>(
        API_ENDPOINTS.STOCK.GET_BY_LOCATION(locationId)
      );
      return response.data.data?.stock || [];
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Create new stock record (for initial stock)
   */
  static async createStock(data: CreateStockDTO): Promise<Stock> {
    try {
      const response = await apiClient.post<ApiResponse<Stock>>(
        API_ENDPOINTS.STOCK.CREATE,
        data
      );
      return response.data.data!;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Adjust stock quantity (for existing stock records)
   */
  static async adjustStock(stockId: string, data: AdjustStockDTO): Promise<Stock> {
    try {
      const response = await apiClient.post<ApiResponse<Stock>>(
        API_ENDPOINTS.STOCK.ADJUST(stockId),
        data
      );
      return response.data.data!;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Create or adjust stock - handles both scenarios
   * If stock record exists for product+location, adjust it
   * If not, create new stock record
   */
  static async createOrAdjustStock(
    productId: string,
    locationId: string,
    quantity: number,
    reason: string
  ): Promise<Stock> {
    try {
      // First, check if stock record exists
      const existingStock = await this.getStockByProduct(productId);
      const stockRecord = existingStock.find(s => s.location_id === locationId);

      if (stockRecord) {
        // Adjust existing stock
        return await this.adjustStock(stockRecord.id, { quantity, reason });
      } else {
        // Create new stock record
        return await this.createStock({
          product_id: productId,
          location_id: locationId,
          quantity,
        });
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get transaction history
   */
  static async getTransactions(): Promise<Transaction[]> {
    try {
      const response = await apiClient.get<ApiResponse<{ transactions: Transaction[]; total: number }>>(
        API_ENDPOINTS.TRANSACTIONS.LIST
      );
      return response.data.data?.transactions || [];
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
}
