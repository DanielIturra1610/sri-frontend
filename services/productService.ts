import apiClient, { ApiResponse, PaginatedResponse, handleApiError } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import type { Product, CreateProductDTO, ProductFilters, ProductLookupResponse } from '@/types';

/**
 * Product Service
 * Handles all product-related API calls
 */

export class ProductService {
  /**
   * Get all products with filters and pagination
   */
  static async getProducts(filters?: ProductFilters): Promise<PaginatedResponse<Product>> {
    try {
      const params = new URLSearchParams();

      if (filters?.search) params.append('search', filters.search);
      if (filters?.category_id) params.append('category_id', filters.category_id);
      if (filters?.is_active !== undefined) params.append('is_active', filters.is_active.toString());
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.page_size) params.append('page_size', filters.page_size.toString());
      if (filters?.sort_by) params.append('sort_by', filters.sort_by);
      if (filters?.sort_order) params.append('sort_order', filters.sort_order);

      const queryString = params.toString();
      const url = queryString ? `${API_ENDPOINTS.PRODUCTS.LIST}?${queryString}` : API_ENDPOINTS.PRODUCTS.LIST;

      const response = await apiClient.get<PaginatedResponse<Product>>(url);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get product by ID
   */
  static async getProduct(id: string): Promise<Product> {
    try {
      const response = await apiClient.get<ApiResponse<{ product: Product }>>(
        API_ENDPOINTS.PRODUCTS.GET(id)
      );
      // Backend returns { data: { product: {...} } }
      return response.data.data?.product ?? response.data.data as unknown as Product;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Create new product
   */
  static async createProduct(data: CreateProductDTO): Promise<Product> {
    try {
      const response = await apiClient.post<ApiResponse<{ product: Product }>>(
        API_ENDPOINTS.PRODUCTS.CREATE,
        data
      );
      // Backend returns { data: { product: {...} } }
      return response.data.data?.product ?? response.data.data as unknown as Product;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Update product
   */
  static async updateProduct(id: string, data: Partial<CreateProductDTO>): Promise<Product> {
    try {
      const response = await apiClient.patch<ApiResponse<{ product: Product }>>(
        API_ENDPOINTS.PRODUCTS.UPDATE(id),
        data
      );
      // Backend returns { data: { product: {...} } }
      return response.data.data?.product ?? response.data.data as unknown as Product;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Delete product
   */
  static async deleteProduct(id: string): Promise<void> {
    try {
      await apiClient.delete(API_ENDPOINTS.PRODUCTS.DELETE(id));
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Lookup product by barcode (local DB + Open Food Facts)
   * Returns existing product if found locally, or suggestion from Open Food Facts
   */
  static async lookupBarcode(barcode: string): Promise<ProductLookupResponse> {
    try {
      const response = await apiClient.get<ProductLookupResponse>(
        API_ENDPOINTS.PRODUCTS.LOOKUP(barcode)
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}
