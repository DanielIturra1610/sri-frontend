import apiClient, { ApiResponse, PaginatedResponse, handleApiError } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import type {
  Backup,
  BackupFilters,
  CreateBackupDTO,
  RestoreBackupDTO,
  BackupConfig,
  UpdateBackupConfigDTO,
} from '@/types';

/**
 * Backup Service
 * Handles all backup and restore related API calls
 */

export class BackupService {
  /**
   * Get all backups with optional filters
   */
  static async getBackups(filters?: BackupFilters): Promise<PaginatedResponse<Backup>> {
    try {
      const params = new URLSearchParams();

      if (filters?.backup_type) params.append('backup_type', filters.backup_type);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.date_from) params.append('date_from', filters.date_from);
      if (filters?.date_to) params.append('date_to', filters.date_to);
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.page_size) params.append('page_size', filters.page_size.toString());
      if (filters?.sort_by) params.append('sort_by', filters.sort_by);
      if (filters?.sort_order) params.append('sort_order', filters.sort_order);

      const url = params.toString()
        ? `${API_ENDPOINTS.BACKUPS.LIST}?${params.toString()}`
        : API_ENDPOINTS.BACKUPS.LIST;

      const response = await apiClient.get<PaginatedResponse<Backup>>(url);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get backup by ID
   */
  static async getBackup(id: string): Promise<Backup> {
    try {
      const response = await apiClient.get<ApiResponse<Backup>>(
        API_ENDPOINTS.BACKUPS.GET(id)
      );
      return response.data.data!;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Create a new backup
   */
  static async createBackup(data: CreateBackupDTO): Promise<Backup> {
    try {
      const response = await apiClient.post<ApiResponse<Backup>>(
        API_ENDPOINTS.BACKUPS.CREATE,
        data
      );
      return response.data.data!;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Delete a backup
   */
  static async deleteBackup(id: string): Promise<void> {
    try {
      await apiClient.delete(API_ENDPOINTS.BACKUPS.DELETE(id));
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Download a backup file
   */
  static async downloadBackup(id: string, filename: string): Promise<void> {
    try {
      const response = await apiClient.get(API_ENDPOINTS.BACKUPS.DOWNLOAD(id), {
        responseType: 'blob',
      });

      // Create download link
      const url = window.URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Restore from backup
   */
  static async restoreBackup(data: RestoreBackupDTO): Promise<{ message: string }> {
    try {
      const response = await apiClient.post<ApiResponse<{ message: string }>>(
        API_ENDPOINTS.BACKUPS.RESTORE,
        data
      );
      return response.data.data!;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get backup configuration
   */
  static async getBackupConfig(): Promise<BackupConfig> {
    try {
      const response = await apiClient.get<ApiResponse<BackupConfig>>(
        API_ENDPOINTS.BACKUPS.CONFIG
      );
      return response.data.data!;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Update backup configuration
   */
  static async updateBackupConfig(data: UpdateBackupConfigDTO): Promise<BackupConfig> {
    try {
      const response = await apiClient.put<ApiResponse<BackupConfig>>(
        API_ENDPOINTS.BACKUPS.UPDATE_CONFIG,
        data
      );
      return response.data.data!;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Format file size
   */
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }
}
