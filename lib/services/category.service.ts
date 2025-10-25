import apiClient, { ApiResponse, handleApiError } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import type { Category } from '@/types';

/**
 * Category Service
 * Handles all category-related API calls
 */

export class CategoryService {
  /**
   * Get all categories
   */
  static async getCategories(): Promise<Category[]> {
    try {
      const response = await apiClient.get<ApiResponse<Category[]>>(
        API_ENDPOINTS.CATEGORIES.LIST
      );
      return response.data.data || [];
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get category by ID
   */
  static async getCategory(id: string): Promise<Category> {
    try {
      const response = await apiClient.get<ApiResponse<Category>>(
        API_ENDPOINTS.CATEGORIES.GET(id)
      );
      return response.data.data!;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}
