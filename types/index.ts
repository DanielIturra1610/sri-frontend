/**
 * Global TypeScript types and interfaces
 */

// User types
export interface User {
  id: string;
  tenant_id: string;
  email: string;
  full_name: string;
  rut?: string;
  phone?: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
}

export type UserRole = 'OWNER' | 'ADMIN' | 'MANAGER' | 'AUDITOR' | 'OPERATOR';

// Auth types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  rut_empresa: string;
  email: string;
  phone?: string;
  plan: 'basic' | 'professional' | 'enterprise';
  user: {
    full_name: string;
    email: string;
    password: string;
  };
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export interface AuthUser extends User {
  permissions: string[];
}

// Product types
export interface Product {
  id: string;
  sku: string;
  barcode?: string;
  name: string;
  description?: string;
  category_id?: string;
  category_name?: string;
  brand?: string;
  unit_of_measure: UnitOfMeasure;
  cost_price: number;
  sale_price: number;
  tax_rate?: number;
  minimum_stock?: number;
  maximum_stock?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type UnitOfMeasure = 'unit' | 'kg' | 'gram' | 'liter' | 'ml' | 'meter' | 'cm' | 'sqm' | 'box' | 'pack' | 'pallet';

export interface CreateProductDTO {
  sku: string;
  barcode?: string;
  name: string;
  description?: string;
  category_id?: string;
  brand?: string;
  unit_of_measure: UnitOfMeasure;
  cost_price: number;
  sale_price: number;
  tax_rate?: number;
  minimum_stock?: number;
  maximum_stock?: number;
  is_active?: boolean;
}

// Category types
export interface Category {
  id: string;
  name: string;
  description?: string;
  parent_id?: string;
  parent_name?: string;
  created_at: string;
}

export interface CreateCategoryDTO {
  name: string;
  description?: string;
  parent_id?: string;
}

// Location types
export interface Location {
  id: string;
  code: string;
  name: string;
  type: LocationType;
  description?: string;
  is_active: boolean;
  created_at: string;
}

export type LocationType = 'warehouse' | 'store' | 'distribution_center' | 'supplier' | 'other';

export interface CreateLocationDTO {
  code: string;
  name: string;
  type: LocationType;
  description?: string;
  is_active?: boolean;
}

// Stock types
export interface Stock {
  id: string;
  product_id: string;
  product_name: string;
  product_sku: string;
  location_id: string;
  location_name: string;
  quantity: number;
  minimum_stock?: number;
  maximum_stock?: number;
  last_movement_at?: string;
  created_at: string;
  updated_at: string;
}

// Transaction types
export interface Transaction {
  id: string;
  product_id: string;
  product_name: string;
  product_sku: string;
  location_id: string;
  location_name: string;
  transaction_type: TransactionType;
  quantity: number;
  previous_quantity: number;
  new_quantity: number;
  reference_type?: string;
  reference_id?: string;
  notes?: string;
  created_by: string;
  created_at: string;
}

export type TransactionType = 'purchase' | 'sale' | 'adjustment' | 'transfer_in' | 'transfer_out' | 'count';

export interface CreateTransactionDTO {
  product_id: string;
  location_id: string;
  transaction_type: TransactionType;
  quantity: number;
  notes?: string;
}

// Transfer types
export interface Transfer {
  id: string;
  product_id: string;
  product_name: string;
  product_sku: string;
  from_location_id: string;
  from_location_name: string;
  to_location_id: string;
  to_location_name: string;
  quantity: number;
  status: TransferStatus;
  reason?: string;
  created_by: string;
  completed_by?: string;
  created_at: string;
  completed_at?: string;
}

export type TransferStatus = 'pending' | 'in_transit' | 'completed' | 'cancelled';

export interface CreateTransferDTO {
  product_id: string;
  from_location_id: string;
  to_location_id: string;
  quantity: number;
  reason?: string;
}

// Import types
export interface ImportResult {
  success: boolean;
  total_rows: number;
  products_created: number;
  products_updated: number;
  products_skipped: number;
  categories_created: number;
  locations_created: number;
  stock_created: number;
  transactions_logged: number;
  errors: ImportError[];
  warnings: ImportWarning[];
  processed_at: string;
  processing_time: string;
}

export interface ImportError {
  row_number: number;
  field?: string;
  value?: string;
  error: string;
}

export interface ImportWarning {
  row_number: number;
  field: string;
  message: string;
}

// Pagination types
export interface PaginationParams {
  page?: number;
  page_size?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface PaginatedData<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

// Filter types
export interface ProductFilters extends PaginationParams {
  search?: string;
  category_id?: string;
  is_active?: boolean;
}

export interface StockFilters extends PaginationParams {
  product_id?: string;
  location_id?: string;
  low_stock?: boolean;
}

export interface TransactionFilters extends PaginationParams {
  product_id?: string;
  location_id?: string;
  transaction_type?: TransactionType;
  date_from?: string;
  date_to?: string;
}

export interface TransferFilters extends PaginationParams {
  product_id?: string;
  from_location_id?: string;
  to_location_id?: string;
  status?: TransferStatus;
  date_from?: string;
  date_to?: string;
}

// Notification types
export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  reference_type?: string;
  reference_id?: string;
  is_read: boolean;
  created_at: string;
  read_at?: string;
}

export type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'stock_alert' | 'transfer' | 'system';

export interface NotificationFilters extends PaginationParams {
  type?: NotificationType;
  is_read?: boolean;
  date_from?: string;
  date_to?: string;
}

export interface CreateNotificationDTO {
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  reference_type?: string;
  reference_id?: string;
}

// Audit log types
export interface AuditLog {
  id: string;
  tenant_id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  action: AuditAction;
  entity_type: AuditEntityType;
  entity_id?: string;
  entity_name?: string;
  description: string;
  metadata?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export type AuditAction =
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'LOGIN'
  | 'LOGOUT'
  | 'FAILED_LOGIN'
  | 'PASSWORD_CHANGE'
  | 'STOCK_ADJUSTMENT'
  | 'TRANSFER_CREATE'
  | 'TRANSFER_COMPLETE'
  | 'TRANSFER_CANCEL'
  | 'IMPORT'
  | 'EXPORT'
  | 'VIEW';

export type AuditEntityType =
  | 'USER'
  | 'PRODUCT'
  | 'CATEGORY'
  | 'LOCATION'
  | 'STOCK'
  | 'TRANSFER'
  | 'TRANSACTION'
  | 'NOTIFICATION'
  | 'SETTINGS'
  | 'AUTH'
  | 'SYSTEM';

export interface AuditLogFilters extends PaginationParams {
  user_id?: string;
  action?: AuditAction;
  entity_type?: AuditEntityType;
  entity_id?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
}

// System Settings types
export interface SystemSettings {
  id: string;
  tenant_id: string;

  // Company/Tenant settings
  company_name: string;
  company_rut: string;
  company_email?: string;
  company_phone?: string;
  company_address?: string;
  company_city?: string;
  company_country?: string;
  company_logo_url?: string;

  // General settings
  timezone: string;
  date_format: string;
  currency: string;
  language: string;

  // Notification settings
  email_notifications_enabled: boolean;
  low_stock_notifications: boolean;
  transfer_notifications: boolean;
  system_notifications: boolean;

  // Security settings
  session_timeout_minutes: number;
  password_expiry_days: number;
  require_strong_password: boolean;
  enable_two_factor: boolean;

  // Inventory settings
  auto_calculate_reorder_point: boolean;
  default_stock_unit: string;
  allow_negative_stock: boolean;
  require_approval_for_adjustments: boolean;

  updated_at: string;
  updated_by?: string;
}

export interface UpdateCompanySettingsDTO {
  company_name?: string;
  company_rut?: string;
  company_email?: string;
  company_phone?: string;
  company_address?: string;
  company_city?: string;
  company_country?: string;
}

export interface UpdateGeneralSettingsDTO {
  timezone?: string;
  date_format?: string;
  currency?: string;
  language?: string;
}

export interface UpdateNotificationSettingsDTO {
  email_notifications_enabled?: boolean;
  low_stock_notifications?: boolean;
  transfer_notifications?: boolean;
  system_notifications?: boolean;
}

export interface UpdateSecuritySettingsDTO {
  session_timeout_minutes?: number;
  password_expiry_days?: number;
  require_strong_password?: boolean;
  enable_two_factor?: boolean;
}

export interface UpdateInventorySettingsDTO {
  auto_calculate_reorder_point?: boolean;
  default_stock_unit?: string;
  allow_negative_stock?: boolean;
  require_approval_for_adjustments?: boolean;
}

// Backup types
export interface Backup {
  id: string;
  tenant_id: string;
  name: string;
  description?: string;
  backup_type: BackupType;
  format: BackupFormat;
  size_bytes: number;
  file_path: string;
  status: BackupStatus;
  created_by: string;
  created_by_name: string;
  created_at: string;
  completed_at?: string;
  error_message?: string;
  includes_tables?: string[];
}

export type BackupType = 'FULL' | 'PARTIAL' | 'MANUAL' | 'AUTOMATIC';
export type BackupFormat = 'SQL' | 'JSON' | 'XLSX';
export type BackupStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';

export interface BackupFilters extends PaginationParams {
  backup_type?: BackupType;
  status?: BackupStatus;
  date_from?: string;
  date_to?: string;
}

export interface CreateBackupDTO {
  name: string;
  description?: string;
  backup_type: BackupType;
  format: BackupFormat;
  includes_tables?: string[];
}

export interface RestoreBackupDTO {
  backup_id: string;
  restore_tables?: string[];
  confirm: boolean;
}

export interface BackupConfig {
  id: string;
  tenant_id: string;
  auto_backup_enabled: boolean;
  auto_backup_frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  auto_backup_time: string; // HH:mm format
  auto_backup_day?: number; // 1-31 for monthly, 0-6 for weekly (0=Sunday)
  retention_days: number;
  backup_format: BackupFormat;
  notification_email?: string;
  updated_at: string;
}

export interface UpdateBackupConfigDTO {
  auto_backup_enabled?: boolean;
  auto_backup_frequency?: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  auto_backup_time?: string;
  auto_backup_day?: number;
  retention_days?: number;
  backup_format?: BackupFormat;
  notification_email?: string;
}
