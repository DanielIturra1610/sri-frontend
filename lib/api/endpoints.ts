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
    VERIFY_EMAIL: '/auth/verify-email',
    VERIFY_EMAIL_DIRECT: '/auth/verify-email-direct',
    RESEND_VERIFICATION: '/auth/resend-verification',
  },

  // Onboarding (authenticated but no tenant)
  ONBOARDING: {
    CREATE_TENANT: '/onboarding/tenants',
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
    LOOKUP: (barcode: string) => `/products/lookup/${barcode}`,
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
    CREATE: '/inventory/stock',
    GET: (id: string) => `/inventory/stock/${id}`,
    GET_BY_PRODUCT: (productId: string) => `/inventory/stock/product/${productId}`,
    GET_BY_LOCATION: (locationId: string) => `/inventory/stock/location/${locationId}`,
    ADJUST: (stockId: string) => `/inventory/stock/${stockId}/adjust`,
    RESERVE: (stockId: string) => `/inventory/stock/${stockId}/reserve`,
    RELEASE: (stockId: string) => `/inventory/stock/${stockId}/release`,
  },

  // Inventory - Transactions
  TRANSACTIONS: {
    LIST: '/inventory/transactions',
    GET: (id: string) => `/inventory/transactions/${id}`,
  },

  // Inventory - Physical Counts
  COUNTS: {
    LIST: '/inventory/counts',
    CREATE: '/inventory/counts',
    GET: (id: string) => `/inventory/counts/${id}`,
    START: (id: string) => `/inventory/counts/${id}/start`,
    COMPLETE: (id: string) => `/inventory/counts/${id}/complete`,
    CANCEL: (id: string) => `/inventory/counts/${id}/cancel`,
    DELETE: (id: string) => `/inventory/counts/${id}`,
    ITEMS: (id: string) => `/inventory/counts/${id}/items`,
    PENDING: (id: string) => `/inventory/counts/${id}/pending`,
    COUNTED: (id: string) => `/inventory/counts/${id}/counted`,
    SCAN: (id: string) => `/inventory/counts/${id}/scan`,
    UPDATE_ITEM: (countId: string, itemId: string) => `/inventory/counts/${countId}/items/${itemId}`,
    DISCREPANCIES: (id: string) => `/inventory/counts/${id}/discrepancies`,
    SUMMARY: (id: string) => `/inventory/counts/${id}/summary`,
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

  // Audit Logs
  AUDIT_LOGS: {
    LIST: '/audit-logs',
    GET: (id: string) => `/audit-logs/${id}`,
    EXPORT: '/audit-logs/export', // ?format=csv|xlsx&date_from=&date_to=
  },

  // System Settings
  SETTINGS: {
    GET: '/settings',
    UPDATE_COMPANY: '/settings/company',
    UPDATE_GENERAL: '/settings/general',
    UPDATE_NOTIFICATIONS: '/settings/notifications',
    UPDATE_SECURITY: '/settings/security',
    UPDATE_INVENTORY: '/settings/inventory',
    UPLOAD_LOGO: '/settings/logo',
  },

  // Backups
  BACKUPS: {
    LIST: '/backups',
    CREATE: '/backups',
    GET: (id: string) => `/backups/${id}`,
    DELETE: (id: string) => `/backups/${id}`,
    DOWNLOAD: (id: string) => `/backups/${id}/download`,
    RESTORE: '/backups/restore',
    CONFIG: '/backups/config',
    UPDATE_CONFIG: '/backups/config',
  },

  // Billing
  BILLING: {
    PLANS: '/billing/plans',
    SETUP_INTENT: '/billing/setup-intent',
    SUBSCRIPTION: '/billing/subscription',
    SUBSCRIBE: '/billing/subscribe',
    CANCEL: '/billing/cancel',
    REACTIVATE: '/billing/reactivate',
    CHANGE_PLAN: '/billing/change-plan',
    PAYMENT_METHODS: '/billing/payment-methods',
    ADD_PAYMENT_METHOD: '/billing/payment-methods',
    REMOVE_PAYMENT_METHOD: (id: string) => `/billing/payment-methods/${id}`,
    SET_DEFAULT_PAYMENT_METHOD: (id: string) => `/billing/payment-methods/${id}/default`,
    INVOICES: '/billing/invoices',
    PAY: '/billing/pay', // One-time payment order
  },

  // Sales
  SALES: {
    LIST: '/sales',
    CREATE: '/sales',
    QUICK_SALE: '/sales/quick',
    GET: (id: string) => `/sales/${id}`,
    COMPLETE: (id: string) => `/sales/${id}/complete`,
    CANCEL: (id: string) => `/sales/${id}/cancel`,
    SUMMARY: '/sales/summary',
    DAILY: '/sales/daily',
  },

  // Suppliers
  SUPPLIERS: {
    LIST: '/suppliers',
    CREATE: '/suppliers',
    GET: (id: string) => `/suppliers/${id}`,
    UPDATE: (id: string) => `/suppliers/${id}`,
    DELETE: (id: string) => `/suppliers/${id}`,
  },

  // Purchases
  PURCHASES: {
    LIST: '/purchases',
    CREATE: '/purchases',
    GET: (id: string) => `/purchases/${id}`,
    ORDER: (id: string) => `/purchases/${id}/order`,
    RECEIVE: (id: string) => `/purchases/${id}/receive`,
    CANCEL: (id: string) => `/purchases/${id}/cancel`,
    SUMMARY: '/purchases/summary',
  },

  // OCR (Google Vision)
  OCR: {
    PROCESS: '/ocr/process',
    TEXT: '/ocr/text',
    BARCODES: '/ocr/barcodes',
    SUGGEST: '/ocr/suggest',
  },

  // Upload
  UPLOAD: {
    IMAGE: '/upload/image',
  },

  // Lots (Batch tracking)
  LOTS: {
    LIST: '/lots',
    CREATE: '/lots',
    GET: (id: string) => `/lots/${id}`,
    UPDATE: (id: string) => `/lots/${id}`,
    DELETE: (id: string) => `/lots/${id}`,
    ADJUST: (id: string) => `/lots/${id}/adjust`,
    EXPIRING: '/lots/expiring',
    BY_PRODUCT: (productId: string) => `/lots/product/${productId}`,
    BY_LOCATION: (locationId: string) => `/lots/location/${locationId}`,
  },
} as const;
