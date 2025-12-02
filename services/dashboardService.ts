import apiClient, { ApiResponse, handleApiError } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';

/**
 * Dashboard Service
 * Handles all dashboard-related API calls
 */

// Dashboard metrics types (matches backend DashboardMetricsDTO)
export interface DashboardMetrics {
  total_products: number;
  total_units_in_stock: number;
  total_inventory_value: number;
  low_stock_products: number;
  out_of_stock_products: number;
  total_locations: number;
  total_categories: number;
  total_transactions_today: number;
  total_transactions_this_month: number;
  top_moving_product?: {
    product_id: string;
    product_name: string;
    sku: string;
    movements: number;
  };
  inventory_turnover: number;
  // Alias for backwards compatibility
  total_stock_value?: number;
}

// Chart data types (matches backend DashboardChartsDTO)
export interface DayMovement {
  date: string;
  inbound: number;
  outbound: number;
  net: number;
}

export interface LocationStock {
  location_id: string;
  location_name: string;
  total_units: number;
  total_value: number;
  product_count: number;
}

export interface CategoryValue {
  category_id: string;
  category_name: string;
  total_value: number;
  total_units: number;
  product_count: number;
}

export interface TopProduct {
  product_id: string;
  product_name: string;
  sku: string;
  movements: number;
}

export interface StockLevelDistribution {
  out_of_stock: number;
  low_stock: number;
  optimal: number;
  high_stock: number;
}

// Backend response structure
export interface DashboardChartsBackend {
  movements_by_day: DayMovement[];
  stock_by_location: LocationStock[];
  value_by_category: CategoryValue[];
  top_moving_products: TopProduct[];
  stock_level_distribution: StockLevelDistribution;
}

// Frontend-friendly aliases (for backwards compatibility)
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
  // Backend fields
  movements_by_day: DayMovement[];
  stock_by_location: LocationStock[];
  value_by_category: CategoryValue[];
  top_moving_products: TopProduct[];
  stock_level_distribution: StockLevelDistribution;
  // Frontend compatibility aliases
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
      const data = response.data.data!;
      // Add backwards compatibility alias
      data.total_stock_value = data.total_inventory_value;
      return data;
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
        // Map period to days for backend
        const periodToDays: Record<string, number> = {
          '7d': 7,
          '30d': 30,
          '90d': 90,
          '1y': 365,
        };
        queryParams.append('days', String(periodToDays[params.period] || 30));
      }

      const url = queryParams.toString()
        ? `${API_ENDPOINTS.DASHBOARD.CHARTS}?${queryParams.toString()}`
        : API_ENDPOINTS.DASHBOARD.CHARTS;

      const response = await apiClient.get<ApiResponse<DashboardChartsBackend>>(url);
      const backendData = response.data.data!;

      // Map backend data to frontend-compatible format
      const mapped: DashboardCharts = {
        // Keep original backend fields
        movements_by_day: backendData.movements_by_day || [],
        stock_by_location: backendData.stock_by_location || [],
        value_by_category: backendData.value_by_category || [],
        top_moving_products: backendData.top_moving_products || [],
        stock_level_distribution: backendData.stock_level_distribution || {
          out_of_stock: 0,
          low_stock: 0,
          optimal: 0,
          high_stock: 0,
        },
        // Map to frontend aliases
        stock_trend: (backendData.movements_by_day || []).map(m => ({
          date: m.date,
          entries: m.inbound,
          exits: m.outbound,
          adjustments: 0,
        })),
        category_distribution: (backendData.value_by_category || []).map((c, i, arr) => {
          const total = arr.reduce((sum, cat) => sum + cat.product_count, 0);
          return {
            category: c.category_name,
            count: c.product_count,
            percentage: total > 0 ? Math.round((c.product_count / total) * 100) : 0,
          };
        }),
        location_stock: (backendData.stock_by_location || []).map(l => ({
          location: l.location_name,
          total_stock: l.total_units,
          products: l.product_count,
          value: l.total_value,
        })),
        top_products: (backendData.top_moving_products || []).map(p => ({
          product: p.product_name,
          movements: p.movements,
          current_stock: 0, // Not provided by backend
          value: 0, // Not provided by backend
        })),
        alerts_trend: [], // Not provided by backend
      };

      return mapped;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}
