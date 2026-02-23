import { NextRequest, NextResponse } from 'next/server';

/**
 * Middleware for route protection and authentication
 * Runs on Edge Runtime before page loads
 */

// Define public routes that don't require authentication
const publicRoutes = [
  '/',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
];

// Define routes that require authentication but NOT a tenant (onboarding)
const onboardingRoutes = [
  '/onboarding',
];

// Define role-based permissions for routes
const rolePermissions: Record<string, string[]> = {
  // Admin/Owner routes
  '/users': ['OWNER', 'ADMIN'],
  '/settings/users': ['OWNER', 'ADMIN'],

  // Manager and above
  '/products/create': ['OWNER', 'ADMIN', 'MANAGER'],
  '/products/edit': ['OWNER', 'ADMIN', 'MANAGER'],
  '/categories': ['OWNER', 'ADMIN', 'MANAGER'],
  '/locations': ['OWNER', 'ADMIN', 'MANAGER'],
  '/transfers/create': ['OWNER', 'ADMIN', 'MANAGER'],
  '/import': ['OWNER', 'ADMIN', 'MANAGER'],

  // Auditor can view transactions but not modify
  '/inventory/transactions': ['OWNER', 'ADMIN', 'MANAGER', 'AUDITOR'],
  '/reports': ['OWNER', 'ADMIN', 'MANAGER', 'AUDITOR'],

  // All authenticated users can view (default for dashboard routes)
  '/dashboard': ['OWNER', 'ADMIN', 'MANAGER', 'AUDITOR', 'OPERATOR'],
  '/products': ['OWNER', 'ADMIN', 'MANAGER', 'AUDITOR', 'OPERATOR'],
  '/inventory': ['OWNER', 'ADMIN', 'MANAGER', 'AUDITOR', 'OPERATOR'],
};

/**
 * Check if a route is public (doesn't require authentication)
 */
function isPublicRoute(pathname: string): boolean {
  return publicRoutes.some(route => pathname === route || pathname.startsWith(route + '/') || pathname.startsWith(route + '?'));
}

/**
 * Check if a route is an onboarding route (requires auth but not tenant)
 */
function isOnboardingRoute(pathname: string): boolean {
  return onboardingRoutes.some(route => pathname === route || pathname.startsWith(route + '/'));
}

/**
 * Check if user has permission to access a route based on their role
 */
function hasPermission(pathname: string, userRole: string): boolean {
  // Find matching route permission
  for (const [route, allowedRoles] of Object.entries(rolePermissions)) {
    if (pathname.startsWith(route)) {
      return allowedRoles.includes(userRole);
    }
  }

  // If no specific permission is defined, allow access to authenticated users
  // This is safe because we already checked authentication
  return true;
}

/**
 * Parse user data from cookie
 */
function getUserFromCookie(request: NextRequest): { role: string; id: string; tenant_id?: string } | null {
  const userCookie = request.cookies.get('user');

  if (!userCookie) {
    return null;
  }

  try {
    const user = JSON.parse(userCookie.value);
    return {
      role: user.role,
      id: user.id,
      tenant_id: user.tenant_id,
    };
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get authentication status from cookies
  const accessToken = request.cookies.get('access_token');
  const user = getUserFromCookie(request);

  const isAuthenticated = !!accessToken && !!user;
  const hasTenant = !!user?.tenant_id;

  // Allow public routes
  if (isPublicRoute(pathname)) {
    // Landing page ("/") is always accessible - page.tsx handles redirect if authenticated
    // This avoids redirect loops when cookies exist but tokens are expired
    if (pathname === '/') {
      return NextResponse.next();
    }
    // If authenticated user with tenant trying to access auth pages, redirect to dashboard
    if (isAuthenticated && hasTenant && (pathname === '/login' || pathname === '/register')) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    // If authenticated user without tenant trying to access login, redirect to onboarding
    if (isAuthenticated && !hasTenant && pathname === '/login') {
      return NextResponse.redirect(new URL('/onboarding/create-tenant', request.url));
    }
    return NextResponse.next();
  }

  // Handle onboarding routes (require auth but not tenant)
  if (isOnboardingRoute(pathname)) {
    if (!isAuthenticated) {
      // Not authenticated, redirect to login
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
    if (hasTenant) {
      // Already has tenant, redirect to dashboard
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    // Authenticated without tenant - allow access to onboarding
    return NextResponse.next();
  }

  // Protect all other routes (require both auth AND tenant)
  if (!isAuthenticated) {
    // Not authenticated, redirect to login
    const loginUrl = new URL('/login', request.url);
    // Save the original URL to redirect back after login
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // User is authenticated but has no tenant - redirect to onboarding
  if (!hasTenant) {
    return NextResponse.redirect(new URL('/onboarding/create-tenant', request.url));
  }

  // Check role-based permissions
  if (!hasPermission(pathname, user.role)) {
    // User doesn't have permission, redirect to dashboard with error
    const dashboardUrl = new URL('/dashboard', request.url);
    dashboardUrl.searchParams.set('error', 'unauthorized');
    return NextResponse.redirect(dashboardUrl);
  }

  // User is authenticated, has tenant, and has permission
  return NextResponse.next();
}

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
