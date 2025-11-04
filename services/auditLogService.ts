import apiClient, { ApiResponse, PaginatedResponse, handleApiError } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import type { AuditLog, AuditLogFilters } from '@/types';

/**
 * Audit Log Service
 * Handles all audit log-related API calls
 */

export class AuditLogService {
  /**
   * Get all audit logs with optional filters
   */
  static async getAuditLogs(filters?: AuditLogFilters): Promise<PaginatedResponse<AuditLog>> {
    try {
      const params = new URLSearchParams();

      if (filters?.user_id) params.append('user_id', filters.user_id);
      if (filters?.action) params.append('action', filters.action);
      if (filters?.entity_type) params.append('entity_type', filters.entity_type);
      if (filters?.entity_id) params.append('entity_id', filters.entity_id);
      if (filters?.date_from) params.append('date_from', filters.date_from);
      if (filters?.date_to) params.append('date_to', filters.date_to);
      if (filters?.search) params.append('search', filters.search);
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.page_size) params.append('page_size', filters.page_size.toString());
      if (filters?.sort_by) params.append('sort_by', filters.sort_by);
      if (filters?.sort_order) params.append('sort_order', filters.sort_order);

      const url = params.toString()
        ? `${API_ENDPOINTS.AUDIT_LOGS.LIST}?${params.toString()}`
        : API_ENDPOINTS.AUDIT_LOGS.LIST;

      const response = await apiClient.get<PaginatedResponse<AuditLog>>(url);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get audit log by ID
   */
  static async getAuditLog(id: string): Promise<AuditLog> {
    try {
      const response = await apiClient.get<ApiResponse<AuditLog>>(
        API_ENDPOINTS.AUDIT_LOGS.GET(id)
      );
      return response.data.data!;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Export audit logs to file
   */
  static async exportAuditLogs(params: {
    format: 'csv' | 'xlsx';
    date_from?: string;
    date_to?: string;
    user_id?: string;
    action?: string;
    entity_type?: string;
  }): Promise<Blob> {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('format', params.format);
      if (params.date_from) queryParams.append('date_from', params.date_from);
      if (params.date_to) queryParams.append('date_to', params.date_to);
      if (params.user_id) queryParams.append('user_id', params.user_id);
      if (params.action) queryParams.append('action', params.action);
      if (params.entity_type) queryParams.append('entity_type', params.entity_type);

      const url = `${API_ENDPOINTS.AUDIT_LOGS.EXPORT}?${queryParams.toString()}`;

      const response = await apiClient.get(url, {
        responseType: 'blob',
      });

      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Download exported audit logs
   */
  static downloadExport(blob: Blob, format: 'csv' | 'xlsx') {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const timestamp = new Date().toISOString().split('T')[0];
    link.download = `audit-logs-${timestamp}.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
}
