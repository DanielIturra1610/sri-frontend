import apiClient, { ApiResponse, PaginatedResponse, handleApiError } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import type { Notification, NotificationFilters } from '@/types';

/**
 * Notification Service
 * Handles all notification-related API calls
 */

export class NotificationService {
  /**
   * Get all notifications with optional filters
   */
  static async getNotifications(filters?: NotificationFilters): Promise<PaginatedResponse<Notification>> {
    try {
      const params = new URLSearchParams();

      if (filters?.type) params.append('type', filters.type);
      if (filters?.is_read !== undefined) params.append('is_read', filters.is_read.toString());
      if (filters?.date_from) params.append('date_from', filters.date_from);
      if (filters?.date_to) params.append('date_to', filters.date_to);
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.page_size) params.append('page_size', filters.page_size.toString());
      if (filters?.sort_by) params.append('sort_by', filters.sort_by);
      if (filters?.sort_order) params.append('sort_order', filters.sort_order);

      const url = params.toString()
        ? `${API_ENDPOINTS.NOTIFICATIONS.LIST}?${params.toString()}`
        : API_ENDPOINTS.NOTIFICATIONS.LIST;

      const response = await apiClient.get<PaginatedResponse<Notification>>(url);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get notification by ID
   */
  static async getNotification(id: string): Promise<Notification> {
    try {
      const response = await apiClient.get<ApiResponse<Notification>>(
        API_ENDPOINTS.NOTIFICATIONS.GET(id)
      );
      return response.data.data!;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get unread notifications count
   */
  static async getUnreadCount(): Promise<number> {
    try {
      const response = await apiClient.get<ApiResponse<{ count: number }>>(
        API_ENDPOINTS.NOTIFICATIONS.UNREAD_COUNT
      );
      return response.data.data?.count || 0;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(id: string): Promise<Notification> {
    try {
      const response = await apiClient.put<ApiResponse<Notification>>(
        API_ENDPOINTS.NOTIFICATIONS.MARK_READ(id)
      );
      return response.data.data!;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Mark all notifications as read
   */
  static async markAllAsRead(): Promise<{ message: string; count: number }> {
    try {
      const response = await apiClient.put<ApiResponse<{ message: string; count: number }>>(
        API_ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ
      );
      return response.data.data!;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Delete a notification
   */
  static async deleteNotification(id: string): Promise<void> {
    try {
      await apiClient.delete(API_ENDPOINTS.NOTIFICATIONS.DELETE(id));
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get recent unread notifications (for dropdown)
   */
  static async getRecentUnread(limit: number = 5): Promise<Notification[]> {
    try {
      const response = await this.getNotifications({
        is_read: false,
        page: 1,
        page_size: limit,
        sort_by: 'created_at',
        sort_order: 'desc',
      });
      return response.data.items;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}
