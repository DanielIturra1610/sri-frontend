import apiClient, { ApiResponse, handleApiError } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';

/**
 * Dashboard Service
 * Handles all dashboard-related API calls
 */

// Dashboard metrics types
export interface DashboardMetrics {
  total_products: number;
  total_locations: number;
  total_categories: number;
  total_users: number;
  critical_stock: number;
  low_stock: number;
  out_of_stock: number;
  pending_transfers: number;
  unread_notifications: number;
  total_stock_value: number;
  stock_movements_today: number;
  stock_movements_week: number;
}

// Chart data types
export interface StockTrendData {
  date: string;
  entries: number;
  exits: number;
  adjustments: number;
}

export interface CategoryDistribution {
  category: string;
  count: number;
  percentage: number;
}

export interface LocationStockData {
  location: string;
  total_stock: number;
  products: number;
  value: number;
}

export interface TopProductsData {
  product: string;
  movements: number;
  current_stock: number;
  value: number;
}

export interface DashboardCharts {
  stock_trend: StockTrendData[];
  category_distribution: CategoryDistribution[];
  location_stock: LocationStockData[];
  top_products: TopProductsData[];
  alerts_trend: {
    date: string;
    critical: number;
    low: number;
  }[];
}

export class DashboardService {
  /**
   * Get dashboard metrics
   */
  static async getMetrics(): Promise<DashboardMetrics> {
    try {
      const response = await apiClient.get<ApiResponse<DashboardMetrics>>(
        API_ENDPOINTS.DASHBOARD.METRICS
      );
      return response.data.data!;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get dashboard charts data
   */
  static async getCharts(params?: {
    period?: '7d' | '30d' | '90d' | '1y';
  }): Promise<DashboardCharts> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.period) {
        queryParams.append('period', params.period);
      }

      const url = queryParams.toString()
        ? `${API_ENDPOINTS.DASHBOARD.CHARTS}?${queryParams.toString()}`
        : API_ENDPOINTS.DASHBOARD.CHARTS;

      const response = await apiClient.get<ApiResponse<DashboardCharts>>(url);
      return response.data.data!;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}
