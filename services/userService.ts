import apiClient, { ApiResponse, handleApiError } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import type { User, UserRole } from '@/types';

/**
 * User Service
 * Handles all user management API calls
 */

export interface CreateUserDTO {
  email: string;
  full_name: string;
  password: string;
  rut?: string;
  phone?: string;
  role: UserRole;
  is_active?: boolean;
}

export interface UpdateUserDTO {
  email?: string;
  full_name?: string;
  password?: string;
  rut?: string;
  phone?: string;
  role?: UserRole;
  is_active?: boolean;
}

export interface UserFilters {
  search?: string;
  role?: UserRole;
  is_active?: boolean;
  page?: number;
  page_size?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface UpdateProfileDTO {
  full_name?: string;
  email?: string;
  rut?: string;
  phone?: string;
}

export interface ChangePasswordDTO {
  current_password: string;
  new_password: string;
}

export class UserService {
  /**
   * Get all users with optional filters
   */
  static async getUsers(filters?: UserFilters): Promise<User[]> {
    try {
      const params = new URLSearchParams();

      if (filters?.search) params.append('search', filters.search);
      if (filters?.role) params.append('role', filters.role);
      if (filters?.is_active !== undefined) params.append('is_active', filters.is_active.toString());
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.page_size) params.append('page_size', filters.page_size.toString());
      if (filters?.sort_by) params.append('sort_by', filters.sort_by);
      if (filters?.sort_order) params.append('sort_order', filters.sort_order);

      const url = params.toString()
        ? `${API_ENDPOINTS.USERS.LIST}?${params.toString()}`
        : API_ENDPOINTS.USERS.LIST;

      const response = await apiClient.get<ApiResponse<{ users: User[]; total: number }>>(url);
      return response.data.data?.users || [];
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get user by ID
   */
  static async getUser(id: string): Promise<User> {
    try {
      const response = await apiClient.get<ApiResponse<User>>(
        API_ENDPOINTS.USERS.GET(id)
      );
      return response.data.data!;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Create a new user
   */
  static async createUser(data: CreateUserDTO): Promise<User> {
    try {
      const response = await apiClient.post<ApiResponse<User>>(
        API_ENDPOINTS.USERS.CREATE,
        data
      );
      return response.data.data!;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Update a user
   */
  static async updateUser(id: string, data: UpdateUserDTO): Promise<User> {
    try {
      const response = await apiClient.put<ApiResponse<User>>(
        API_ENDPOINTS.USERS.UPDATE(id),
        data
      );
      return response.data.data!;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Delete a user
   */
  static async deleteUser(id: string): Promise<void> {
    try {
      await apiClient.delete(API_ENDPOINTS.USERS.DELETE(id));
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Activate a user
   */
  static async activateUser(id: string): Promise<User> {
    try {
      return await this.updateUser(id, { is_active: true });
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Deactivate a user
   */
  static async deactivateUser(id: string): Promise<User> {
    try {
      return await this.updateUser(id, { is_active: false });
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get current user profile
   */
  static async getCurrentProfile(): Promise<User> {
    try {
      const response = await apiClient.get<ApiResponse<User>>(
        API_ENDPOINTS.USERS.PROFILE
      );
      return response.data.data!;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Update current user profile
   */
  static async updateProfile(data: UpdateProfileDTO): Promise<User> {
    try {
      const response = await apiClient.put<ApiResponse<User>>(
        API_ENDPOINTS.USERS.UPDATE_PROFILE,
        data
      );
      return response.data.data!;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Change current user password
   */
  static async changePassword(data: ChangePasswordDTO): Promise<{ message: string }> {
    try {
      const response = await apiClient.put<ApiResponse<{ message: string }>>(
        API_ENDPOINTS.USERS.CHANGE_PASSWORD,
        data
      );
      return response.data.data!;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}
