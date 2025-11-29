import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { deleteCookie, setCookie } from '@/lib/utils/cookies';

// API Base URL from environment
const baseUrl = process.env.NEXT_PUBLIC_API_URL?.trim() || 'http://localhost:8080';
// Ensure /api/v1 suffix is present
const API_URL = baseUrl.endsWith('/api/v1') ? baseUrl : `${baseUrl}/api/v1`;

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds
});

// Token refresh state - prevents multiple simultaneous refresh attempts
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

// Process queued requests after token refresh
const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
};

// Helper to clear all auth data (localStorage + cookies) and redirect to login
const clearAuthAndRedirect = () => {
  if (typeof window === 'undefined') return;

  // Clear localStorage
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('token_expires_in');
  localStorage.removeItem('user');
  localStorage.removeItem('tenant');

  // Clear cookies (this prevents redirect loop with middleware)
  deleteCookie('access_token', { path: '/' });
  deleteCookie('refresh_token', { path: '/' });
  deleteCookie('user', { path: '/' });
  deleteCookie('tenant', { path: '/' });

  // Redirect to login
  window.location.href = '/login';
};

// Request interceptor - Add auth token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get token from localStorage
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');

      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors and refresh token
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // If error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      // If already refreshing, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token: string) => {
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${token}`;
              }
              resolve(apiClient(originalRequest));
            },
            reject: (err: unknown) => {
              reject(err);
            },
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Try to refresh the token
        const refreshToken = localStorage.getItem('refresh_token');

        if (!refreshToken) {
          // No refresh token, clear all auth data and redirect to login
          processQueue(new Error('No refresh token'), null);
          clearAuthAndRedirect();
          return Promise.reject(error);
        }

        // Call refresh token endpoint
        const response = await axios.post(`${API_URL}/auth/refresh`, {
          refresh_token: refreshToken,
        });

        const { access_token, refresh_token: newRefreshToken } = response.data.data;

        // Save new tokens to localStorage
        localStorage.setItem('access_token', access_token);
        if (newRefreshToken) {
          localStorage.setItem('refresh_token', newRefreshToken);
        }

        // Also update cookies for middleware
        setCookie('access_token', access_token, {
          expires: 3600, // 1 hour
          path: '/',
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'Lax',
        });
        if (newRefreshToken) {
          setCookie('refresh_token', newRefreshToken, {
            expires: 7200, // 2 hours
            path: '/',
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Lax',
          });
        }

        // Process all queued requests with new token
        processQueue(null, access_token);

        // Update the failed request with new token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
        }

        // Retry the original request
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed, reject all queued requests
        processQueue(refreshError, null);
        // Clear all auth data and redirect to login
        clearAuthAndRedirect();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Handle other errors
    return Promise.reject(error);
  }
);

export default apiClient;

// Helper function to handle API errors
export const handleApiError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ message?: string; error?: string }>;

    // Server responded with error
    if (axiosError.response) {
      return axiosError.response.data?.message ||
             axiosError.response.data?.error ||
             'An error occurred';
    }

    // Request was made but no response
    if (axiosError.request) {
      return 'No response from server. Please check your connection.';
    }
  }

  // Something else happened
  return 'An unexpected error occurred';
};

// Type for API responses
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

// Type for paginated responses
export interface PaginatedResponse<T = any> {
  success: boolean;
  message: string;
  data: {
    items: T[];
    total: number;
    page: number;
    page_size: number;
    total_pages: number;
  };
}
