'use client';

import { useAuth } from '@/lib/contexts/AuthContext';

/**
 * Hook to check user permissions
 */
export function usePermissions() {
  const { user } = useAuth();

  const hasPermission = (permission: string): boolean => {
    if (!user || !user.permissions) return false;

    // Check for wildcard permission (all permissions)
    if (user.permissions.includes('*')) return true;

    // Check for exact match
    if (user.permissions.includes(permission)) return true;

    // Check for wildcard match (e.g., "products.*" matches "products.create")
    const parts = permission.split('.');
    if (parts.length === 2) {
      const wildcardPermission = `${parts[0]}.*`;
      if (user.permissions.includes(wildcardPermission)) return true;
    }

    return false;
  };

  const hasAnyPermission = (...permissions: string[]): boolean => {
    return permissions.some((permission) => hasPermission(permission));
  };

  const hasAllPermissions = (...permissions: string[]): boolean => {
    return permissions.every((permission) => hasPermission(permission));
  };

  const hasRole = (role: string): boolean => {
    if (!user) return false;
    return user.role === role;
  };

  const hasAnyRole = (...roles: string[]): boolean => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    hasAnyRole,
    permissions: user?.permissions || [],
    role: user?.role,
  };
}
