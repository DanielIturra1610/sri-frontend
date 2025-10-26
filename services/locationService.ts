import apiClient, { ApiResponse, handleApiError } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import type { Location, CreateLocationDTO } from '@/types';

/**
 * Location Service
 * Handles all location-related API calls
 */

export class LocationService {
  /**
   * Get all locations
   */
  static async getLocations(): Promise<Location[]> {
    try {
      const response = await apiClient.get<ApiResponse<Location[]>>(
        API_ENDPOINTS.LOCATIONS.LIST
      );
      return response.data.data || [];
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get location by ID
   */
  static async getLocation(id: string): Promise<Location> {
    try {
      const response = await apiClient.get<ApiResponse<Location>>(
        API_ENDPOINTS.LOCATIONS.GET(id)
      );
      return response.data.data!;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Create new location
   */
  static async createLocation(data: CreateLocationDTO): Promise<Location> {
    try {
      const response = await apiClient.post<ApiResponse<Location>>(
        API_ENDPOINTS.LOCATIONS.CREATE,
        data
      );
      return response.data.data!;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Update location
   */
  static async updateLocation(id: string, data: Partial<CreateLocationDTO>): Promise<Location> {
    try {
      const response = await apiClient.patch<ApiResponse<Location>>(
        API_ENDPOINTS.LOCATIONS.UPDATE(id),
        data
      );
      return response.data.data!;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Delete location
   */
  static async deleteLocation(id: string): Promise<void> {
    try {
      await apiClient.delete(API_ENDPOINTS.LOCATIONS.DELETE(id));
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}
