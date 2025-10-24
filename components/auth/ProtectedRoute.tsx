'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { usePermissions } from '@/lib/hooks/usePermissions';
import type { UserRole } from '@/types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: string;
  requiredPermissions?: string[];
  requiredRole?: UserRole | UserRole[];
  requireAll?: boolean;
  redirectTo?: string;
  fallback?: React.ReactNode;
}

/**
 * Component to protect routes requiring authentication and/or specific permissions
 *
 * @example
 * // Require authentication only
 * <ProtectedRoute>
 *   <DashboardContent />
 * </ProtectedRoute>
 *
 * @example
 * // Require specific permission
 * <ProtectedRoute requiredPermission="products.create">
 *   <CreateProductPage />
 * </ProtectedRoute>
 *
 * @example
 * // Require specific role
 * <ProtectedRoute requiredRole={['OWNER', 'ADMIN']}>
 *   <AdminPage />
 * </ProtectedRoute>
 */
export function ProtectedRoute({
  children,
  requiredPermission,
  requiredPermissions = [],
  requiredRole,
  requireAll = false,
  redirectTo = '/login',
  fallback = <div className="flex items-center justify-center min-h-screen">Cargando...</div>,
}: ProtectedRouteProps) {
  const router = useRouter();
  const { user, loading, isAuthenticated } = useAuth();
  const {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    hasAnyRole,
  } = usePermissions();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push(redirectTo);
    }
  }, [loading, isAuthenticated, router, redirectTo]);

  // Still loading
  if (loading) {
    return <>{fallback}</>;
  }

  // Not authenticated
  if (!isAuthenticated || !user) {
    return null;
  }

  // Check permissions if required
  if (requiredPermission || requiredPermissions.length > 0) {
    let hasAccess = false;

    if (requiredPermission) {
      hasAccess = hasPermission(requiredPermission);
    } else if (requiredPermissions.length > 0) {
      hasAccess = requireAll
        ? hasAllPermissions(...requiredPermissions)
        : hasAnyPermission(...requiredPermissions);
    }

    if (!hasAccess) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Acceso denegado</h1>
            <p className="text-gray-600">No tienes permisos para acceder a esta página.</p>
          </div>
        </div>
      );
    }
  }

  // Check role if required
  if (requiredRole) {
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    const hasRoleAccess = roles.length === 1
      ? hasRole(roles[0])
      : hasAnyRole(...roles);

    if (!hasRoleAccess) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Acceso denegado</h1>
            <p className="text-gray-600">
              Tu rol actual no tiene permisos para acceder a esta página.
            </p>
          </div>
        </div>
      );
    }
  }

  // User has access
  return <>{children}</>;
}
