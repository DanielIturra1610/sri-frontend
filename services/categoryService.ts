import apiClient, { ApiResponse, handleApiError } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import type { Category, CreateCategoryDTO } from '@/types';

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

  /**
   * Create new category
   */
  static async createCategory(data: CreateCategoryDTO): Promise<Category> {
    try {
      const response = await apiClient.post<ApiResponse<Category>>(
        API_ENDPOINTS.CATEGORIES.CREATE,
        data
      );
      return response.data.data!;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Update category
   */
  static async updateCategory(id: string, data: Partial<CreateCategoryDTO>): Promise<Category> {
    try {
      const response = await apiClient.patch<ApiResponse<Category>>(
        API_ENDPOINTS.CATEGORIES.UPDATE(id),
        data
      );
      return response.data.data!;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Delete category
   */
  static async deleteCategory(id: string): Promise<void> {
    try {
      await apiClient.delete(API_ENDPOINTS.CATEGORIES.DELETE(id));
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}
