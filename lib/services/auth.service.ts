import apiClient, { ApiResponse, handleApiError } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import type {
  LoginCredentials,
  RegisterData,
  AuthTokens,
  AuthUser,
} from '@/types';

/**
 * Authentication Service
 * Handles all authentication-related API calls
 */

export class AuthService {
  /**
   * Login with email and password
   */
  static async login(credentials: LoginCredentials): Promise<{
    user: AuthUser;
    tokens: AuthTokens;
  }> {
    try {
      const response = await apiClient.post<ApiResponse<{
        user: AuthUser;
        access_token: string;
        refresh_token: string;
        expires_in: number;
      }>>(API_ENDPOINTS.AUTH.LOGIN, credentials);

      const { user, access_token, refresh_token, expires_in } = response.data.data!;

      // Store tokens
      this.setTokens({
        access_token,
        refresh_token,
        expires_in,
      });

      // Store user info
      this.setUser(user);

      return {
        user,
        tokens: { access_token, refresh_token, expires_in },
      };
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Register a new tenant
   */
  static async register(data: RegisterData): Promise<{
    user: AuthUser;
    tokens: AuthTokens;
  }> {
    try {
      const response = await apiClient.post<ApiResponse<{
        user: AuthUser;
        access_token: string;
        refresh_token: string;
        expires_in: number;
      }>>(API_ENDPOINTS.AUTH.REGISTER, data);

      const { user, access_token, refresh_token, expires_in } = response.data.data!;

      // Store tokens
      this.setTokens({
        access_token,
        refresh_token,
        expires_in,
      });

      // Store user info
      this.setUser(user);

      return {
        user,
        tokens: { access_token, refresh_token, expires_in },
      };
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Logout - clear tokens and user info
   */
  static async logout(): Promise<void> {
    try {
      // Call logout endpoint to blacklist token
      await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
    } catch (error) {
      // Continue with logout even if API call fails
      console.error('Logout error:', error);
    } finally {
      // Clear local storage
      this.clearAuth();
    }
  }

  /**
   * Refresh access token
   */
  static async refreshToken(): Promise<AuthTokens> {
    try {
      const refreshToken = this.getRefreshToken();

      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await apiClient.post<ApiResponse<{
        access_token: string;
        refresh_token: string;
        expires_in: number;
      }>>(API_ENDPOINTS.AUTH.REFRESH, {
        refresh_token: refreshToken,
      });

      const tokens = response.data.data!;
      this.setTokens(tokens);

      return tokens;
    } catch (error) {
      this.clearAuth();
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get current user from localStorage
   */
  static getCurrentUser(): AuthUser | null {
    if (typeof window === 'undefined') return null;

    const userStr = localStorage.getItem('user');
    if (!userStr) return null;

    try {
      return JSON.parse(userStr) as AuthUser;
    } catch {
      return null;
    }
  }

  /**
   * Get access token
   */
  static getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('access_token');
  }

  /**
   * Get refresh token
   */
  static getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('refresh_token');
  }

  /**
   * Check if user is authenticated
   */
  static isAuthenticated(): boolean {
    return !!this.getAccessToken() && !!this.getCurrentUser();
  }

  /**
   * Set tokens in localStorage
   */
  private static setTokens(tokens: AuthTokens): void {
    if (typeof window === 'undefined') return;

    localStorage.setItem('access_token', tokens.access_token);
    localStorage.setItem('refresh_token', tokens.refresh_token);
    localStorage.setItem('token_expires_in', tokens.expires_in.toString());
  }

  /**
   * Set user in localStorage
   */
  private static setUser(user: AuthUser): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('user', JSON.stringify(user));
  }

  /**
   * Clear all auth data
   */
  private static clearAuth(): void {
    if (typeof window === 'undefined') return;

    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('token_expires_in');
    localStorage.removeItem('user');
  }
}
