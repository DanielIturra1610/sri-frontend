import apiClient, { ApiResponse, handleApiError } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import type { Stock, Transaction, CreateTransactionDTO } from '@/types';

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
   * Create stock adjustment/transaction
   */
  static async createTransaction(data: CreateTransactionDTO): Promise<Transaction> {
    try {
      const response = await apiClient.post<ApiResponse<Transaction>>(
        API_ENDPOINTS.STOCK.ADJUST,
        data
      );
      return response.data.data!;
    } catch (error) {
      throw new Error(handleApiError(error));
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
