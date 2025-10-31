'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  Warehouse,
  FolderTree,
  MapPin,
  ArrowRightLeft,
  FileText,
  Upload,
  BarChart3,
  Settings,
  Users,
  X,
  AlertTriangle,
} from 'lucide-react';
import { Can } from '@/components/auth';
import { PERMISSIONS } from '@/lib/constants/permissions';
import { cn } from '@/lib/utils/cn';
import { AlertBadge } from '@/components/alerts';
import type { UserRole } from '@/types';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  permission?: string;
  role?: UserRole | UserRole[];
  children?: NavItem[];
}

const navigation: NavItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Productos',
    href: '/products',
    icon: Package,
    permission: PERMISSIONS.PRODUCTS_VIEW,
    children: [
      {
        name: 'Ver productos',
        href: '/products',
        icon: Package,
        permission: PERMISSIONS.PRODUCTS_VIEW,
      },
      {
        name: 'Categorías',
        href: '/categories',
        icon: FolderTree,
        permission: PERMISSIONS.CATEGORIES_VIEW,
      },
    ],
  },
  {
    name: 'Inventario',
    href: '/stock',
    icon: Warehouse,
    permission: PERMISSIONS.INVENTORY_VIEW,
    children: [
      {
        name: 'Stock',
        href: '/stock',
        icon: Warehouse,
        permission: PERMISSIONS.INVENTORY_VIEW,
      },
      {
        name: 'Alertas',
        href: '/alerts',
        icon: AlertTriangle,
        permission: PERMISSIONS.INVENTORY_VIEW,
      },
      {
        name: 'Transferencias',
        href: '/transfers',
        icon: ArrowRightLeft,
        permission: PERMISSIONS.TRANSFERS_VIEW,
      },
      {
        name: 'Transacciones',
        href: '/inventory/transactions',
        icon: FileText,
        permission: PERMISSIONS.INVENTORY_VIEW,
      },
      {
        name: 'Ubicaciones',
        href: '/locations',
        icon: MapPin,
        permission: PERMISSIONS.LOCATIONS_VIEW,
      },
    ],
  },
  {
    name: 'Importar',
    href: '/import',
    icon: Upload,
    permission: PERMISSIONS.IMPORT_PRODUCTS,
  },
  {
    name: 'Reportes',
    href: '/reports',
    icon: BarChart3,
    permission: PERMISSIONS.REPORTS_VIEW,
  },
  {
    name: 'Configuración',
    href: '/settings',
    icon: Settings,
    permission: PERMISSIONS.SETTINGS_VIEW,
    children: [
      {
        name: 'Umbrales de Stock',
        href: '/settings/thresholds',
        icon: Settings,
        permission: PERMISSIONS.SETTINGS_VIEW,
      },
    ],
  },
  {
    name: 'Usuarios',
    href: '/users',
    icon: Users,
    role: ['OWNER', 'ADMIN'],
  },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-gray-900/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-40 h-screen transition-transform lg:translate-x-0',
          'w-64 bg-white border-r border-gray-200 dark:bg-gray-900 dark:border-gray-700',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <span className="font-semibold text-lg text-gray-900 dark:text-white">
              SRI Inventarios
            </span>
          </Link>

          {/* Close button (mobile only) */}
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <ul className="space-y-1">
            {navigation.map((item) => {
              // Check if item should be rendered based on permissions/roles
              const shouldRender = !item.permission && !item.role;

              if (shouldRender || item.permission || item.role) {
                return (
                  <Can
                    key={item.name}
                    permission={item.permission}
                    role={item.role}
                    fallback={shouldRender ? undefined : null}
                  >
                    <li>
                      {/* Main nav item */}
                      <Link
                        href={item.href}
                        className={cn(
                          'flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                          isActive(item.href)
                            ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                            : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                        )}
                      >
                        <item.icon className="w-5 h-5 mr-3" />
                        {item.name}
                      </Link>

                      {/* Submenu */}
                      {item.children && item.children.length > 0 && (
                        <ul className="mt-1 ml-4 space-y-1">
                          {item.children.map((child) => (
                            <Can
                              key={child.name}
                              permission={child.permission}
                              role={child.role}
                            >
                              <li>
                                <Link
                                  href={child.href}
                                  className={cn(
                                    'flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors',
                                    isActive(child.href)
                                      ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                                      : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
                                  )}
                                >
                                  <div className="flex items-center">
                                    <child.icon className="w-4 h-4 mr-3" />
                                    {child.name}
                                  </div>
                                  {/* Alert Badge for Alerts menu item */}
                                  {child.href === '/alerts' && <AlertBadge />}
                                </Link>
                              </li>
                            </Can>
                          ))}
                        </ul>
                      )}
                    </li>
                  </Can>
                );
              }
              return null;
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Version 1.0.0
          </div>
        </div>
      </aside>
    </>
  );
}
