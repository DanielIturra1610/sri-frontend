'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

// Route name mappings for better display
const routeNames: Record<string, string> = {
  dashboard: 'Dashboard',
  products: 'Productos',
  categories: 'Categorías',
  inventory: 'Inventario',
  stock: 'Stock',
  locations: 'Ubicaciones',
  transfers: 'Transferencias',
  transactions: 'Transacciones',
  import: 'Importar',
  reports: 'Reportes',
  settings: 'Configuración',
  users: 'Usuarios',
  profile: 'Mi Perfil',
  create: 'Crear',
  edit: 'Editar',
  new: 'Nuevo',
};

interface BreadcrumbItem {
  label: string;
  href: string;
  active?: boolean;
}

function formatSegment(segment: string): string {
  // Check if it's a UUID or ID (skip formatting)
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(segment)) {
    return 'Detalle';
  }

  // Use mapped name or capitalize
  return routeNames[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
}

export function Breadcrumbs() {
  const pathname = usePathname();

  // Don't show breadcrumbs on dashboard home or auth pages
  if (pathname === '/dashboard' || pathname.startsWith('/login') || pathname.startsWith('/register')) {
    return null;
  }

  // Build breadcrumb items
  const segments = pathname.split('/').filter(Boolean);
  const breadcrumbs: BreadcrumbItem[] = [
    {
      label: 'Dashboard',
      href: '/dashboard',
    },
  ];

  let currentPath = '';
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    const isLast = index === segments.length - 1;

    breadcrumbs.push({
      label: formatSegment(segment),
      href: currentPath,
      active: isLast,
    });
  });

  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
      {breadcrumbs.map((item, index) => (
        <React.Fragment key={item.href}>
          {index > 0 && (
            <ChevronRight className="w-4 h-4 text-gray-400" />
          )}

          {item.active ? (
            <span className="font-medium text-gray-900 dark:text-white">
              {item.label}
            </span>
          ) : (
            <Link
              href={item.href}
              className={cn(
                'hover:text-blue-600 dark:hover:text-blue-400 transition-colors',
                index === 0 && 'flex items-center'
              )}
            >
              {index === 0 && <Home className="w-4 h-4 mr-1" />}
              {item.label}
            </Link>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}
