/**
 * Permission constants and role definitions
 */

export const ROLES = {
  OWNER: 'OWNER',
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  AUDITOR: 'AUDITOR',
  OPERATOR: 'OPERATOR',
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];

/**
 * Role hierarchy - higher number = more permissions
 */
export const ROLE_HIERARCHY: Record<Role, number> = {
  [ROLES.OWNER]: 5,
  [ROLES.ADMIN]: 4,
  [ROLES.MANAGER]: 3,
  [ROLES.AUDITOR]: 2,
  [ROLES.OPERATOR]: 1,
};

/**
 * Check if a role has equal or higher privileges than another
 */
export function hasMinimumRole(userRole: Role, requiredRole: Role): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

/**
 * Permission definitions by feature area
 */
export const PERMISSIONS = {
  // Product permissions
  PRODUCTS_VIEW: 'products.view',
  PRODUCTS_CREATE: 'products.create',
  PRODUCTS_UPDATE: 'products.update',
  PRODUCTS_DELETE: 'products.delete',

  // Category permissions
  CATEGORIES_VIEW: 'categories.view',
  CATEGORIES_MANAGE: 'categories.manage',

  // Inventory permissions
  INVENTORY_VIEW: 'inventory.view',
  INVENTORY_ADJUST: 'inventory.adjust',

  // Location permissions
  LOCATIONS_VIEW: 'locations.view',
  LOCATIONS_MANAGE: 'locations.manage',

  // Transfer permissions
  TRANSFERS_VIEW: 'transfers.view',
  TRANSFERS_CREATE: 'transfers.create',
  TRANSFERS_COMPLETE: 'transfers.complete',
  TRANSFERS_CANCEL: 'transfers.cancel',

  // Transaction permissions
  TRANSACTIONS_VIEW: 'transactions.view',
  TRANSACTIONS_EXPORT: 'transactions.export',

  // Import permissions
  IMPORT_PRODUCTS: 'import.products',
  IMPORT_STOCK: 'import.stock',

  // Report permissions
  REPORTS_VIEW: 'reports.view',
  REPORTS_EXPORT: 'reports.export',

  // User management permissions
  USERS_VIEW: 'users.view',
  USERS_CREATE: 'users.create',
  USERS_UPDATE: 'users.update',
  USERS_DELETE: 'users.delete',

  // Settings permissions
  SETTINGS_VIEW: 'settings.view',
  SETTINGS_UPDATE: 'settings.update',
} as const;

/**
 * Default permissions by role
 */
export const ROLE_PERMISSIONS: Record<Role, string[]> = {
  [ROLES.OWNER]: ['*'], // Owner has all permissions

  [ROLES.ADMIN]: [
    PERMISSIONS.PRODUCTS_VIEW,
    PERMISSIONS.PRODUCTS_CREATE,
    PERMISSIONS.PRODUCTS_UPDATE,
    PERMISSIONS.PRODUCTS_DELETE,
    PERMISSIONS.CATEGORIES_VIEW,
    PERMISSIONS.CATEGORIES_MANAGE,
    PERMISSIONS.INVENTORY_VIEW,
    PERMISSIONS.INVENTORY_ADJUST,
    PERMISSIONS.LOCATIONS_VIEW,
    PERMISSIONS.LOCATIONS_MANAGE,
    PERMISSIONS.TRANSFERS_VIEW,
    PERMISSIONS.TRANSFERS_CREATE,
    PERMISSIONS.TRANSFERS_COMPLETE,
    PERMISSIONS.TRANSFERS_CANCEL,
    PERMISSIONS.TRANSACTIONS_VIEW,
    PERMISSIONS.TRANSACTIONS_EXPORT,
    PERMISSIONS.IMPORT_PRODUCTS,
    PERMISSIONS.IMPORT_STOCK,
    PERMISSIONS.REPORTS_VIEW,
    PERMISSIONS.REPORTS_EXPORT,
    PERMISSIONS.USERS_VIEW,
    PERMISSIONS.USERS_CREATE,
    PERMISSIONS.USERS_UPDATE,
    PERMISSIONS.USERS_DELETE,
    PERMISSIONS.SETTINGS_VIEW,
    PERMISSIONS.SETTINGS_UPDATE,
  ],

  [ROLES.MANAGER]: [
    PERMISSIONS.PRODUCTS_VIEW,
    PERMISSIONS.PRODUCTS_CREATE,
    PERMISSIONS.PRODUCTS_UPDATE,
    PERMISSIONS.CATEGORIES_VIEW,
    PERMISSIONS.CATEGORIES_MANAGE,
    PERMISSIONS.INVENTORY_VIEW,
    PERMISSIONS.INVENTORY_ADJUST,
    PERMISSIONS.LOCATIONS_VIEW,
    PERMISSIONS.LOCATIONS_MANAGE,
    PERMISSIONS.TRANSFERS_VIEW,
    PERMISSIONS.TRANSFERS_CREATE,
    PERMISSIONS.TRANSFERS_COMPLETE,
    PERMISSIONS.TRANSACTIONS_VIEW,
    PERMISSIONS.TRANSACTIONS_EXPORT,
    PERMISSIONS.IMPORT_PRODUCTS,
    PERMISSIONS.IMPORT_STOCK,
    PERMISSIONS.REPORTS_VIEW,
    PERMISSIONS.REPORTS_EXPORT,
  ],

  [ROLES.AUDITOR]: [
    PERMISSIONS.PRODUCTS_VIEW,
    PERMISSIONS.CATEGORIES_VIEW,
    PERMISSIONS.INVENTORY_VIEW,
    PERMISSIONS.LOCATIONS_VIEW,
    PERMISSIONS.TRANSFERS_VIEW,
    PERMISSIONS.TRANSACTIONS_VIEW,
    PERMISSIONS.TRANSACTIONS_EXPORT,
    PERMISSIONS.REPORTS_VIEW,
    PERMISSIONS.REPORTS_EXPORT,
  ],

  [ROLES.OPERATOR]: [
    PERMISSIONS.PRODUCTS_VIEW,
    PERMISSIONS.CATEGORIES_VIEW,
    PERMISSIONS.INVENTORY_VIEW,
    PERMISSIONS.LOCATIONS_VIEW,
    PERMISSIONS.TRANSFERS_VIEW,
    PERMISSIONS.TRANSACTIONS_VIEW,
  ],
};

/**
 * Get role display name
 */
export function getRoleDisplayName(role: Role): string {
  const displayNames: Record<Role, string> = {
    [ROLES.OWNER]: 'Propietario',
    [ROLES.ADMIN]: 'Administrador',
    [ROLES.MANAGER]: 'Gerente',
    [ROLES.AUDITOR]: 'Auditor',
    [ROLES.OPERATOR]: 'Operador',
  };
  return displayNames[role] || role;
}

/**
 * Get role description
 */
export function getRoleDescription(role: Role): string {
  const descriptions: Record<Role, string> = {
    [ROLES.OWNER]: 'Acceso total al sistema',
    [ROLES.ADMIN]: 'Administración completa del tenant',
    [ROLES.MANAGER]: 'Gestión de inventario y productos',
    [ROLES.AUDITOR]: 'Solo lectura y reportes',
    [ROLES.OPERATOR]: 'Operaciones básicas de inventario',
  };
  return descriptions[role] || '';
}
