import apiClient, { ApiResponse, handleApiError } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import type {
  SystemSettings,
  UpdateCompanySettingsDTO,
  UpdateGeneralSettingsDTO,
  UpdateNotificationSettingsDTO,
  UpdateSecuritySettingsDTO,
  UpdateInventorySettingsDTO,
} from '@/types';

/**
 * Settings Service
 * Handles all system settings-related API calls
 */

export class SettingsService {
  /**
   * Get current system settings
   */
  static async getSettings(): Promise<SystemSettings> {
    try {
      const response = await apiClient.get<ApiResponse<SystemSettings>>(
        API_ENDPOINTS.SETTINGS.GET
      );
      return response.data.data!;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Update company/tenant settings
   */
  static async updateCompanySettings(data: UpdateCompanySettingsDTO): Promise<SystemSettings> {
    try {
      const response = await apiClient.put<ApiResponse<SystemSettings>>(
        API_ENDPOINTS.SETTINGS.UPDATE_COMPANY,
        data
      );
      return response.data.data!;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Update general settings
   */
  static async updateGeneralSettings(data: UpdateGeneralSettingsDTO): Promise<SystemSettings> {
    try {
      const response = await apiClient.put<ApiResponse<SystemSettings>>(
        API_ENDPOINTS.SETTINGS.UPDATE_GENERAL,
        data
      );
      return response.data.data!;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Update notification settings
   */
  static async updateNotificationSettings(
    data: UpdateNotificationSettingsDTO
  ): Promise<SystemSettings> {
    try {
      const response = await apiClient.put<ApiResponse<SystemSettings>>(
        API_ENDPOINTS.SETTINGS.UPDATE_NOTIFICATIONS,
        data
      );
      return response.data.data!;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Update security settings
   */
  static async updateSecuritySettings(data: UpdateSecuritySettingsDTO): Promise<SystemSettings> {
    try {
      const response = await apiClient.put<ApiResponse<SystemSettings>>(
        API_ENDPOINTS.SETTINGS.UPDATE_SECURITY,
        data
      );
      return response.data.data!;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Update inventory settings
   */
  static async updateInventorySettings(
    data: UpdateInventorySettingsDTO
  ): Promise<SystemSettings> {
    try {
      const response = await apiClient.put<ApiResponse<SystemSettings>>(
        API_ENDPOINTS.SETTINGS.UPDATE_INVENTORY,
        data
      );
      return response.data.data!;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Upload company logo
   */
  static async uploadLogo(file: File): Promise<{ logo_url: string }> {
    try {
      const formData = new FormData();
      formData.append('logo', file);

      const response = await apiClient.post<ApiResponse<{ logo_url: string }>>(
        API_ENDPOINTS.SETTINGS.UPLOAD_LOGO,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data.data!;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}
