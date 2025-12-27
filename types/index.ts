/**
 * Global TypeScript types and interfaces
 */

// User types
export interface User {
  id: string;
  tenant_id?: string; // Optional - user may not have tenant yet (onboarding)
  email: string;
  full_name: string;
  rut?: string;
  phone?: string;
  role: UserRole;
  is_active: boolean;
  email_verified: boolean;
  created_at: string;
}

export type UserRole = 'OWNER' | 'ADMIN' | 'MANAGER' | 'AUDITOR' | 'OPERATOR';

// Auth types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  full_name: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export interface AuthUser extends User {
  permissions: string[];
}

// Login response with requires_tenant flag
export interface LoginResponse {
  user: AuthUser;
  tenant?: Tenant;
  expires_in: number;
  requires_tenant: boolean;
}

// Tenant types
export interface Tenant {
  id: string;
  name: string;
  rut_empresa: string;
  email: string;
  phone?: string;
  address?: string;
  plan: TenantPlan;
  status: TenantStatus;
  created_at: string;
}

export type TenantPlan = 'basic' | 'professional' | 'enterprise';
export type TenantStatus = 'active' | 'suspended' | 'cancelled';

export interface CreateTenantData {
  name: string;
  rut_empresa: string;
  email: string;
  phone?: string;
  address?: string;
  plan?: TenantPlan;
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
  track_lots: boolean;
  image_url?: string;
  attributes?: ProductAttributes;
  images?: string[];
  created_at: string;
  updated_at: string;
}

// Product specifications for industrial products
export interface ProductSpecifications {
  weight?: string;
  dimensions?: string;
  material?: string;
  grade?: string;
  certifications?: string[];
  storage_temp?: string;
  shelf_life?: string;
  instructions?: string;
  manufacturer?: string;
  country_of_origin?: string;
  custom_fields?: Record<string, string>;
}

// Product attributes containing specifications
export interface ProductAttributes {
  specifications?: ProductSpecifications;
  [key: string]: any;
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
  track_lots?: boolean;
  attributes?: ProductAttributes;
  images?: string[];
}

// Upload types
export interface UploadResponse {
  url: string;
  thumbnail_url?: string;
  filename: string;
  size: number;
  content_type: string;
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

// Product Lookup types (Open Food Facts integration)
export interface ProductSuggestion {
  barcode: string;
  name: string;
  brand: string;
  category: string;
  image_url: string;
  quantity: string;
  description: string;
}

export interface ProductLookupResponse {
  success: boolean;
  source: 'local' | 'open_food_facts';
  message: string;
  data?: {
    product?: Product;
    suggestion?: ProductSuggestion;
  };
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

// Inventory Count types (Physical counting with camera/barcode)
export type CountStatus = 'DRAFT' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface InventoryCount {
  id: string;
  location_id: string;
  status: CountStatus;
  started_at?: string;
  completed_at?: string;
  created_by: string;
  completed_by?: string;
  cancelled_by?: string;
  cancelled_at?: string;
  cancellation_reason?: string;
  notes?: string;
  total_expected: number;
  total_counted: number;
  total_discrepancy: number;
  items_count: number;
  items_counted: number;
  progress: number;
  created_at: string;
  updated_at: string;
  location?: Location;
}

export interface InventoryCountItem {
  id: string;
  inventory_count_id: string;
  product_id: string;
  stock_id?: string;
  lot_id?: string;
  expected_quantity: number;
  counted_quantity?: number;
  discrepancy?: number;
  scanned_barcode?: string;
  counted_by?: string;
  counted_at?: string;
  notes?: string;
  is_counted: boolean;
  has_discrepancy: boolean;
  created_at: string;
  updated_at: string;
  product?: Product;
  lot?: Lot;
}

export interface CreateInventoryCountDTO {
  location_id: string;
  notes?: string;
}

export interface CompleteCountDTO {
  apply_adjustments: boolean;
  notes?: string;
}

export interface CancelCountDTO {
  reason: string;
}

export interface ScanBarcodeDTO {
  barcode: string;
  lot_id?: string;
  quantity: number;
  notes?: string;
}

export interface RegisterCountDTO {
  product_id: string;
  lot_id?: string;
  quantity: number;
  notes?: string;
}

export interface UpdateCountItemDTO {
  quantity: number;
  notes?: string;
}

export interface ScanResult {
  already_counted: boolean;
  previous_count?: number;
  counted_at?: string;
  counted_by?: string;
  item: InventoryCountItem;
  product?: Product;
  discrepancy?: number;
}

export interface DiscrepancyItem {
  product_id: string;
  product_sku: string;
  product_name: string;
  product_barcode?: string;
  expected_quantity: number;
  counted_quantity: number;
  discrepancy: number;
  discrepancy_type: 'shortage' | 'surplus';
}

export interface CountSummary {
  id: string;
  location_name: string;
  status: string;
  total_products: number;
  counted_products: number;
  pending_products: number;
  with_discrepancy: number;
  total_expected: number;
  total_counted: number;
  total_discrepancy: number;
  progress: number;
}

export interface CountFilters extends PaginationParams {
  location_id?: string;
  status?: CountStatus;
  date_from?: string;
  date_to?: string;
}

// Sale types
export type SaleStatus = 'draft' | 'completed' | 'cancelled' | 'refunded';
export type PaymentMethod = 'cash' | 'card' | 'transfer' | 'mixed' | 'other';

export interface Sale {
  id: string;
  sale_number: string;
  location_id: string;
  location_name?: string;
  customer_name?: string;
  customer_rut?: string;
  customer_email?: string;
  customer_phone?: string;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total: number;
  payment_method: PaymentMethod;
  payment_reference?: string;
  status: SaleStatus;
  notes?: string;
  items: SaleItem[];
  created_by: string;
  completed_by?: string;
  cancelled_by?: string;
  created_at: string;
  completed_at?: string;
  cancelled_at?: string;
  cancel_reason?: string;
}

export interface SaleItem {
  id: string;
  sale_id: string;
  product_id: string;
  product_name: string;
  product_sku: string;
  product_barcode?: string;
  quantity: number;
  unit_price: number;
  discount_percent: number;
  discount_amount: number;
  tax_rate: number;
  tax_amount: number;
  subtotal: number;
  total: number;
}

export interface CreateSaleDTO {
  location_id: string;
  customer_name?: string;
  customer_rut?: string;
  customer_email?: string;
  customer_phone?: string;
  payment_method: PaymentMethod;
  payment_reference?: string;
  notes?: string;
  items: CreateSaleItemDTO[];
}

export interface CreateSaleItemDTO {
  product_id: string;
  quantity: number;
  unit_price: number;
  discount_percent?: number;
}

export interface QuickSaleDTO {
  location_id: string;
  items: QuickSaleItemDTO[];
  payment_method: PaymentMethod;
  payment_reference?: string;
  customer_name?: string;
  customer_rut?: string;
}

export interface QuickSaleItemDTO {
  barcode?: string;
  product_id?: string;
  quantity: number;
}

export interface CancelSaleDTO {
  reason: string;
}

export interface SaleSummary {
  total_sales: number;
  total_amount: number;
  total_tax: number;
  completed_sales: number;
  cancelled_sales: number;
  average_sale: number;
}

export interface DailySales {
  date: string;
  total_sales: number;
  total_amount: number;
}

export interface SaleFilters extends PaginationParams {
  location_id?: string;
  status?: SaleStatus;
  payment_method?: PaymentMethod;
  date_from?: string;
  date_to?: string;
  search?: string;
}

// Supplier types
export interface Supplier {
  id: string;
  name: string;
  rut?: string;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  address?: string;
  city?: string;
  notes?: string;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface CreateSupplierDTO {
  name: string;
  rut?: string;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  address?: string;
  city?: string;
  notes?: string;
}

export interface UpdateSupplierDTO {
  name?: string;
  rut?: string;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  address?: string;
  city?: string;
  notes?: string;
  is_active?: boolean;
}

export interface SupplierFilters extends PaginationParams {
  search?: string;
  is_active?: boolean;
}

// Purchase types
export type PurchaseStatus = 'draft' | 'ordered' | 'partial' | 'received' | 'cancelled';

export interface Purchase {
  id: string;
  purchase_number: string;
  supplier_id: string;
  supplier?: Supplier;
  location_id: string;
  location?: Location;
  supplier_invoice?: string;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total: number;
  status: PurchaseStatus;
  notes?: string;
  expected_date?: string;
  ordered_at?: string;
  received_at?: string;
  cancelled_at?: string;
  cancel_reason?: string;
  items: PurchaseItem[];
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface PurchaseItem {
  id: string;
  purchase_id: string;
  product_id: string;
  product_name: string;
  product_sku: string;
  quantity: number;
  received_quantity: number;
  unit_cost: number;
  discount_percent: number;
  discount_amount: number;
  tax_rate: number;
  tax_amount: number;
  subtotal: number;
  total: number;
  inventory_updated: boolean;
}

export interface CreatePurchaseDTO {
  supplier_id: string;
  location_id: string;
  supplier_invoice?: string;
  notes?: string;
  expected_date?: string;
  items: CreatePurchaseItemDTO[];
}

export interface CreatePurchaseItemDTO {
  product_id: string;
  quantity: number;
  unit_cost: number;
  discount_percent?: number;
}

export interface ReceivePurchaseDTO {
  items: ReceivePurchaseItemDTO[];
}

export interface ReceivePurchaseItemDTO {
  item_id: string;
  quantity: number;
  notes?: string;
}

export interface CancelPurchaseDTO {
  reason: string;
}

export interface PurchaseSummary {
  total_purchases: number;
  total_amount: number;
  total_tax: number;
  pending_purchases: number;
  received_purchases: number;
}

export interface PurchaseFilters extends PaginationParams {
  supplier_id?: string;
  location_id?: string;
  status?: PurchaseStatus;
  date_from?: string;
  date_to?: string;
  search?: string;
}

// OCR types
export type OCRRequestType = 'product_label' | 'invoice' | 'barcode' | 'price_tag' | 'generic';

export interface OCRRequest {
  image_base64: string;
  type?: OCRRequestType;
  language?: string;
}

export interface BarcodeResult {
  value: string;
  format: string;
  confidence: number;
}

export interface PriceResult {
  value: number;
  currency: string;
  raw: string;
  confidence: number;
  type: 'cost' | 'sale' | 'promo';
}

export interface OCRProductSuggestion {
  name?: string;
  brand?: string;
  description?: string;
  barcode?: string;
  sku?: string;
  category?: string;
  cost_price?: number;
  sale_price?: number;
  unit_of_measure?: string;
  weight?: string;
  volume?: string;
  ingredients?: string;
  expiration_date?: string;
  image_url?: string;
  confidence: number;
  source: 'ocr' | 'ocr+openfoodfacts';
}

export interface OCRResponse {
  success: boolean;
  raw_text?: string;
  confidence: number;
  barcodes?: BarcodeResult[];
  suggestion?: OCRProductSuggestion;
  labels?: string[];
  prices?: PriceResult[];
  processed_at: string;
  error?: string;
}

// Lot/Batch types
export type LotStatus = 'available' | 'expired' | 'quarantine' | 'consumed' | 'recalled';

export interface Lot {
  id: string;
  product_id: string;
  location_id: string;
  lot_number: string;
  batch_code?: string;
  manufacture_date?: string;
  expiry_date?: string;
  received_date?: string;
  supplier_id?: string;
  initial_quantity: number;
  current_quantity: number;
  unit_cost?: number;
  status: LotStatus;
  notes?: string;
  attributes?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  // Joined fields
  product_name?: string;
  product_sku?: string;
  location_name?: string;
  supplier_name?: string;
  // Computed fields
  days_until_expiry?: number;
  is_expired: boolean;
  is_low_stock: boolean;
}

export interface CreateLotDTO {
  product_id: string;
  location_id: string;
  lot_number: string;
  batch_code?: string;
  manufacture_date?: string;
  expiry_date?: string;
  received_date?: string;
  supplier_id?: string;
  initial_quantity: number;
  unit_cost?: number;
  notes?: string;
  attributes?: Record<string, unknown>;
}

export interface UpdateLotDTO {
  lot_number?: string;
  batch_code?: string;
  manufacture_date?: string;
  expiry_date?: string;
  received_date?: string;
  supplier_id?: string;
  unit_cost?: number;
  status?: LotStatus;
  notes?: string;
  attributes?: Record<string, unknown>;
}

export interface AdjustLotDTO {
  quantity_change: number;
  reason: string;
}

export interface LotFilters extends PaginationParams {
  product_id?: string;
  location_id?: string;
  supplier_id?: string;
  status?: LotStatus;
  search?: string;
}
