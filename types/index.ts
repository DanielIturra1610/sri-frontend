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
