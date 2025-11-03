/**
 * API Endpoints
 * Centralized API endpoint definitions
 */

export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
  },

  // Users
  USERS: {
    LIST: '/users',
    CREATE: '/users',
    GET: (id: string) => `/users/${id}`,
    UPDATE: (id: string) => `/users/${id}`,
    DELETE: (id: string) => `/users/${id}`,
    PROFILE: '/users/profile',
    UPDATE_PROFILE: '/users/profile',
    CHANGE_PASSWORD: '/users/profile/password',
  },

  // Products
  PRODUCTS: {
    LIST: '/products',
    CREATE: '/products',
    GET: (id: string) => `/products/${id}`,
    UPDATE: (id: string) => `/products/${id}`,
    DELETE: (id: string) => `/products/${id}`,
  },

  // Categories
  CATEGORIES: {
    LIST: '/categories',
    CREATE: '/categories',
    GET: (id: string) => `/categories/${id}`,
    UPDATE: (id: string) => `/categories/${id}`,
    DELETE: (id: string) => `/categories/${id}`,
  },

  // Locations
  LOCATIONS: {
    LIST: '/locations',
    CREATE: '/locations',
    GET: (id: string) => `/locations/${id}`,
    UPDATE: (id: string) => `/locations/${id}`,
    DELETE: (id: string) => `/locations/${id}`,
  },

  // Inventory - Stock
  STOCK: {
    LIST: '/inventory/stock',
    GET_BY_PRODUCT: (productId: string) => `/inventory/stock/product/${productId}`,
    GET_BY_LOCATION: (locationId: string) => `/inventory/stock/location/${locationId}`,
    ADJUST: '/inventory/transactions',
  },

  // Inventory - Transactions
  TRANSACTIONS: {
    LIST: '/inventory/transactions',
    GET: (id: string) => `/inventory/transactions/${id}`,
  },

  // Transfers
  TRANSFERS: {
    LIST: '/transfers',
    CREATE: '/transfers',
    GET: (id: string) => `/transfers/${id}`,
    GET_BY_PRODUCT: (productId: string) => `/transfers/product/${productId}`,
    GET_BY_STATUS: (status: string) => `/transfers/status/${status}`,
    UPDATE_STATUS: (id: string) => `/transfers/${id}/status`,
    COMPLETE: (id: string) => `/transfers/${id}/complete`,
    CANCEL: (id: string) => `/transfers/${id}/cancel`,
    DELETE: (id: string) => `/transfers/${id}`,
  },

  // Import
  IMPORT: {
    PRODUCTS_WITH_STOCK: '/import/products-with-stock',
    PRODUCTS_ONLY: '/import/products-only',
    STOCK_ONLY: '/import/stock-only',
    TEMPLATE: '/import/template', // ?type=products-with-stock|products-only|stock-only
  },

  // Dashboard
  DASHBOARD: {
    METRICS: '/dashboard/metrics',
    CHARTS: '/dashboard/charts',
  },

  // Notifications
  NOTIFICATIONS: {
    LIST: '/notifications',
    GET: (id: string) => `/notifications/${id}`,
    MARK_READ: (id: string) => `/notifications/${id}/read`,
    MARK_ALL_READ: '/notifications/read-all',
    DELETE: (id: string) => `/notifications/${id}`,
    UNREAD_COUNT: '/notifications/unread-count',
  },
} as const;
