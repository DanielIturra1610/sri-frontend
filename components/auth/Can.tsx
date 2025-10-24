'use client';

import React from 'react';
import { usePermissions } from '@/lib/hooks/usePermissions';
import type { UserRole } from '@/types';

interface CanProps {
  children: React.ReactNode;
  permission?: string;
  permissions?: string[];
  role?: UserRole | UserRole[];
  requireAll?: boolean; // If true, user must have ALL permissions/roles
  fallback?: React.ReactNode;
}

/**
 * Component to conditionally render content based on user permissions or roles
 *
 * @example
 * // Check single permission
 * <Can permission="products.create">
 *   <CreateProductButton />
 * </Can>
 *
 * @example
 * // Check multiple permissions (any)
 * <Can permissions={['products.create', 'products.update']}>
 *   <EditButton />
 * </Can>
 *
 * @example
 * // Check multiple permissions (all)
 * <Can permissions={['products.create', 'inventory.adjust']} requireAll>
 *   <AdvancedFeature />
 * </Can>
 *
 * @example
 * // Check role
 * <Can role="ADMIN">
 *   <AdminPanel />
 * </Can>
 *
 * @example
 * // Check multiple roles
 * <Can role={['OWNER', 'ADMIN']}>
 *   <ManageUsers />
 * </Can>
 *
 * @example
 * // With fallback
 * <Can permission="products.create" fallback={<p>No tienes permisos</p>}>
 *   <CreateProductButton />
 * </Can>
 */
export function Can({
  children,
  permission,
  permissions = [],
  role,
  requireAll = false,
  fallback = null,
}: CanProps) {
  const {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    hasAnyRole,
  } = usePermissions();

  let hasAccess = false;

  // Check single permission
  if (permission) {
    hasAccess = hasPermission(permission);
  }
  // Check multiple permissions
  else if (permissions.length > 0) {
    hasAccess = requireAll
      ? hasAllPermissions(...permissions)
      : hasAnyPermission(...permissions);
  }
  // Check role(s)
  else if (role) {
    const roles = Array.isArray(role) ? role : [role];
    hasAccess = roles.length === 1
      ? hasRole(roles[0])
      : hasAnyRole(...roles);
  }
  // If no permission or role specified, deny access
  else {
    hasAccess = false;
  }

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

/**
 * Component to hide content based on permissions/roles (opposite of Can)
 */
export function Cannot({
  children,
  permission,
  permissions = [],
  role,
  requireAll = false,
}: Omit<CanProps, 'fallback'>) {
  const {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    hasAnyRole,
  } = usePermissions();

  let hasAccess = false;

  if (permission) {
    hasAccess = hasPermission(permission);
  } else if (permissions.length > 0) {
    hasAccess = requireAll
      ? hasAllPermissions(...permissions)
      : hasAnyPermission(...permissions);
  } else if (role) {
    const roles = Array.isArray(role) ? role : [role];
    hasAccess = roles.length === 1
      ? hasRole(roles[0])
      : hasAnyRole(...roles);
  }

  if (hasAccess) {
    return null;
  }

  return <>{children}</>;
}
