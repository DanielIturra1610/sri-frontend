import apiClient, { ApiResponse, handleApiError } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { setCookie, deleteCookie } from '@/lib/utils/cookies';
import type {
  LoginCredentials,
  RegisterData,
  AuthTokens,
  AuthUser,
  Tenant,
  CreateTenantData,
} from '@/types';

/**
 * Authentication Service
 * Handles all authentication-related API calls
 */

export class AuthService {
  /**
   * Login with email and password
   * Returns requires_tenant: true if user needs to create/select a tenant
   */
  static async login(credentials: LoginCredentials): Promise<{
    user: AuthUser;
    tokens: AuthTokens;
    requires_tenant: boolean;
    tenant?: Tenant;
  }> {
    try {
      const response = await apiClient.post<ApiResponse<{
        user: AuthUser;
        tenant?: Tenant;
        access_token: string;
        refresh_token: string;
        expires_in: number;
        requires_tenant: boolean;
      }>>(API_ENDPOINTS.AUTH.LOGIN, credentials);

      const { user, tenant, access_token, refresh_token, expires_in, requires_tenant } = response.data.data!;

      // Store tokens
      this.setTokens({
        access_token,
        refresh_token,
        expires_in,
      });

      // Store user info
      this.setUser(user);

      // Store tenant info if available
      if (tenant) {
        this.setTenant(tenant);
      }

      return {
        user,
        tokens: { access_token, refresh_token, expires_in },
        requires_tenant: requires_tenant || false,
        tenant,
      };
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Register a new user (without tenant)
   * User will need to verify email and then create/select tenant
   */
  static async register(data: RegisterData): Promise<{
    user: AuthUser;
    message: string;
  }> {
    try {
      const response = await apiClient.post<ApiResponse<{
        user: AuthUser;
      }>>(API_ENDPOINTS.AUTH.REGISTER, data);

      // Registration no longer returns tokens - user must verify email first
      return {
        user: response.data.data!.user,
        message: response.data.message || 'Registration successful. Please verify your email.',
      };
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Verify email with token
   */
  static async verifyEmail(token: string): Promise<{ message: string }> {
    try {
      const response = await apiClient.post<ApiResponse<{ message: string }>>(
        API_ENDPOINTS.AUTH.VERIFY_EMAIL,
        { token }
      );
      return { message: response.data.message || 'Email verified successfully' };
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Verify email directly (without token)
   * Used when email service is not configured - user clicks button to verify
   */
  static async verifyEmailDirect(email: string): Promise<{ message: string }> {
    try {
      const response = await apiClient.post<ApiResponse<{ message: string }>>(
        API_ENDPOINTS.AUTH.VERIFY_EMAIL_DIRECT,
        { email }
      );
      return { message: response.data.message || 'Email verified successfully' };
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Resend verification email
   */
  static async resendVerification(email: string): Promise<{ message: string }> {
    try {
      const response = await apiClient.post<ApiResponse<{ message: string }>>(
        API_ENDPOINTS.AUTH.RESEND_VERIFICATION,
        { email }
      );
      return { message: response.data.message || 'Verification email sent' };
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Create tenant during onboarding
   */
  static async createTenant(data: CreateTenantData): Promise<{
    tenant: Tenant;
    user: AuthUser;
  }> {
    try {
      const response = await apiClient.post<ApiResponse<{
        tenant: Tenant;
        user: AuthUser;
      }>>(API_ENDPOINTS.ONBOARDING.CREATE_TENANT, data);

      const { tenant, user } = response.data.data!;

      // Update stored user with new tenant_id
      this.setUser(user);

      // Store tenant info
      this.setTenant(tenant);

      // Refresh tokens to get new tokens with tenant_id included
      // This is necessary because the current tokens don't have tenant_id
      try {
        await this.refreshToken();
      } catch (refreshError) {
        console.warn('Token refresh after tenant creation failed:', refreshError);
        // Continue anyway - the user can still access, tokens will refresh on next 401
      }

      return { tenant, user };
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
   * Request password reset email
   */
  static async forgotPassword(email: string): Promise<{ message: string }> {
    try {
      const response = await apiClient.post<ApiResponse<{ message: string }>>(
        API_ENDPOINTS.AUTH.FORGOT_PASSWORD,
        { email }
      );

      return response.data.data!;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Reset password with token
   */
  static async resetPassword(token: string, password: string): Promise<{ message: string }> {
    try {
      const response = await apiClient.post<ApiResponse<{ message: string }>>(
        API_ENDPOINTS.AUTH.RESET_PASSWORD,
        { token, password }
      );

      return response.data.data!;
    } catch (error) {
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
   * Set tokens in localStorage and cookies
   */
  private static setTokens(tokens: AuthTokens): void {
    if (typeof window === 'undefined') return;

    // Store in localStorage (for client-side JS access)
    localStorage.setItem('access_token', tokens.access_token);
    localStorage.setItem('refresh_token', tokens.refresh_token);
    localStorage.setItem('token_expires_in', tokens.expires_in.toString());

    // Store in cookies (for middleware access)
    const expiresInSeconds = tokens.expires_in;
    setCookie('access_token', tokens.access_token, {
      expires: expiresInSeconds,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax',
    });
    setCookie('refresh_token', tokens.refresh_token, {
      expires: expiresInSeconds * 2, // Refresh token lasts longer
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax',
    });
  }

  /**
   * Set user in localStorage and cookies
   */
  private static setUser(user: AuthUser): void {
    if (typeof window === 'undefined') return;

    // Store in localStorage
    localStorage.setItem('user', JSON.stringify(user));

    // Store in cookies (for middleware - only essential data)
    setCookie('user', JSON.stringify({
      id: user.id,
      email: user.email,
      role: user.role,
      full_name: user.full_name,
      tenant_id: user.tenant_id,
    }), {
      expires: 7 * 24 * 60 * 60, // 7 days
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax',
    });
  }

  /**
   * Set tenant in localStorage and cookies
   */
  private static setTenant(tenant: Tenant): void {
    if (typeof window === 'undefined') return;

    // Store in localStorage
    localStorage.setItem('tenant', JSON.stringify(tenant));

    // Store in cookies (for middleware)
    setCookie('tenant', JSON.stringify({
      id: tenant.id,
      name: tenant.name,
    }), {
      expires: 7 * 24 * 60 * 60, // 7 days
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax',
    });
  }

  /**
   * Get current tenant from localStorage
   */
  static getCurrentTenant(): Tenant | null {
    if (typeof window === 'undefined') return null;

    const tenantStr = localStorage.getItem('tenant');
    if (!tenantStr) return null;

    try {
      return JSON.parse(tenantStr) as Tenant;
    } catch {
      return null;
    }
  }

  /**
   * Check if user has a tenant assigned
   */
  static hasTenant(): boolean {
    const user = this.getCurrentUser();
    return !!user?.tenant_id || !!this.getCurrentTenant();
  }

  /**
   * Clear all auth data from localStorage and cookies
   */
  private static clearAuth(): void {
    if (typeof window === 'undefined') return;

    // Clear localStorage
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('token_expires_in');
    localStorage.removeItem('user');
    localStorage.removeItem('tenant');

    // Clear cookies
    deleteCookie('access_token', { path: '/' });
    deleteCookie('refresh_token', { path: '/' });
    deleteCookie('user', { path: '/' });
    deleteCookie('tenant', { path: '/' });
  }
}
