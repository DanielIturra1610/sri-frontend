"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
  Shield,
  Database,
  ChevronRight,
  ClipboardList,
} from "lucide-react";
import { Can } from "@/components/auth";
import { PERMISSIONS } from "@/lib/constants/permissions";
import { cn } from "@/lib/utils/cn";
import { AlertBadge } from "@/components/alerts";
import { ScrollArea } from "@/components/ui/ScrollArea";
import { Separator } from "@/components/ui/Separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/Tooltip";
import type { UserRole } from "@/types";

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
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Productos",
    href: "/products",
    icon: Package,
    permission: PERMISSIONS.PRODUCTS_VIEW,
    children: [
      {
        name: "Ver productos",
        href: "/products",
        icon: Package,
        permission: PERMISSIONS.PRODUCTS_VIEW,
      },
      {
        name: "Categorias",
        href: "/categories",
        icon: FolderTree,
        permission: PERMISSIONS.CATEGORIES_VIEW,
      },
    ],
  },
  {
    name: "Inventario",
    href: "/stock",
    icon: Warehouse,
    permission: PERMISSIONS.INVENTORY_VIEW,
    children: [
      {
        name: "Stock",
        href: "/stock",
        icon: Warehouse,
        permission: PERMISSIONS.INVENTORY_VIEW,
      },
      {
        name: "Alertas",
        href: "/alerts",
        icon: AlertTriangle,
        permission: PERMISSIONS.INVENTORY_VIEW,
      },
      {
        name: "Transferencias",
        href: "/transfers",
        icon: ArrowRightLeft,
        permission: PERMISSIONS.TRANSFERS_VIEW,
      },
      {
        name: "Transacciones",
        href: "/inventory/transactions",
        icon: FileText,
        permission: PERMISSIONS.INVENTORY_VIEW,
      },
      {
        name: "Ubicaciones",
        href: "/locations",
        icon: MapPin,
        permission: PERMISSIONS.LOCATIONS_VIEW,
      },
      {
        name: "Conteo Fisico",
        href: "/counts",
        icon: ClipboardList,
        permission: PERMISSIONS.INVENTORY_VIEW,
      },
    ],
  },
  {
    name: "Importar",
    href: "/import",
    icon: Upload,
    permission: PERMISSIONS.IMPORT_PRODUCTS,
  },
  {
    name: "Reportes",
    href: "/reports",
    icon: BarChart3,
    permission: PERMISSIONS.REPORTS_VIEW,
  },
  {
    name: "Configuracion",
    href: "/settings",
    icon: Settings,
    permission: PERMISSIONS.SETTINGS_VIEW,
    children: [
      {
        name: "Umbrales de Stock",
        href: "/settings/thresholds",
        icon: Settings,
        permission: PERMISSIONS.SETTINGS_VIEW,
      },
    ],
  },
  {
    name: "Usuarios",
    href: "/users",
    icon: Users,
    role: ["OWNER", "ADMIN"],
  },
  {
    name: "Logs de Auditoria",
    href: "/audit-logs",
    icon: Shield,
    role: ["OWNER", "ADMIN", "AUDITOR"],
  },
  {
    name: "Respaldos",
    href: "/backups",
    icon: Database,
    role: ["OWNER", "ADMIN"],
  },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = React.useState<string[]>([]);

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  const toggleExpanded = (name: string) => {
    setExpandedItems((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  };

  // Auto-expand parent items if child is active
  React.useEffect(() => {
    navigation.forEach((item) => {
      if (item.children?.some((child) => isActive(child.href))) {
        setExpandedItems((prev) =>
          prev.includes(item.name) ? prev : [...prev, item.name]
        );
      }
    });
  }, [pathname]);

  return (
    <TooltipProvider delayDuration={0}>
      {/* Mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-sidebar transition-transform duration-300 ease-in-out lg:translate-x-0",
          "border-r border-sidebar-border",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header with Logo */}
        <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary shadow-sm">
              <span className="text-lg font-bold text-primary-foreground">
                S
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-sidebar-foreground">
                SRI Inventarios
              </span>
              <span className="text-[10px] text-muted-foreground">
                Sistema de Gestion
              </span>
            </div>
          </Link>

          {/* Close button (mobile only) */}
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 px-3 py-4">
          <nav className="space-y-1">
            {navigation.map((item) => {
              const shouldRender = !item.permission && !item.role;
              const isItemActive = isActive(item.href);
              const isExpanded = expandedItems.includes(item.name);
              const hasChildren = item.children && item.children.length > 0;

              if (shouldRender || item.permission || item.role) {
                return (
                  <Can
                    key={item.name}
                    permission={item.permission}
                    role={item.role}
                    fallback={shouldRender ? undefined : null}
                  >
                    <div className="space-y-1">
                      {/* Main nav item */}
                      {hasChildren ? (
                        <button
                          onClick={() => toggleExpanded(item.name)}
                          className={cn(
                            "group flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-all duration-200",
                            isItemActive
                              ? "bg-sidebar-primary/10 text-sidebar-primary"
                              : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <item.icon
                              className={cn(
                                "h-4 w-4 transition-colors",
                                isItemActive
                                  ? "text-sidebar-primary"
                                  : "text-muted-foreground group-hover:text-sidebar-accent-foreground"
                              )}
                            />
                            <span>{item.name}</span>
                          </div>
                          <ChevronRight
                            className={cn(
                              "h-4 w-4 text-muted-foreground transition-transform duration-200",
                              isExpanded && "rotate-90"
                            )}
                          />
                        </button>
                      ) : (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Link
                              href={item.href}
                              className={cn(
                                "group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all duration-200",
                                isItemActive
                                  ? "bg-sidebar-primary/10 text-sidebar-primary"
                                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                              )}
                            >
                              <item.icon
                                className={cn(
                                  "h-4 w-4 transition-colors",
                                  isItemActive
                                    ? "text-sidebar-primary"
                                    : "text-muted-foreground group-hover:text-sidebar-accent-foreground"
                                )}
                              />
                              <span>{item.name}</span>
                            </Link>
                          </TooltipTrigger>
                          <TooltipContent side="right">
                            {item.name}
                          </TooltipContent>
                        </Tooltip>
                      )}

                      {/* Submenu */}
                      {hasChildren && (
                        <div
                          className={cn(
                            "overflow-hidden transition-all duration-200",
                            isExpanded
                              ? "max-h-96 opacity-100"
                              : "max-h-0 opacity-0"
                          )}
                        >
                          <div className="ml-4 space-y-1 border-l border-sidebar-border pl-3 pt-1">
                            {item.children?.map((child) => (
                              <Can
                                key={child.name}
                                permission={child.permission}
                                role={child.role}
                              >
                                <Link
                                  href={child.href}
                                  className={cn(
                                    "group flex items-center justify-between rounded-md px-3 py-1.5 text-sm transition-all duration-200",
                                    isActive(child.href)
                                      ? "bg-sidebar-primary/10 text-sidebar-primary font-medium"
                                      : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                                  )}
                                >
                                  <div className="flex items-center gap-3">
                                    <child.icon
                                      className={cn(
                                        "h-3.5 w-3.5 transition-colors",
                                        isActive(child.href)
                                          ? "text-sidebar-primary"
                                          : "text-muted-foreground group-hover:text-sidebar-accent-foreground"
                                      )}
                                    />
                                    <span>{child.name}</span>
                                  </div>
                                  {child.href === "/alerts" && <AlertBadge />}
                                </Link>
                              </Can>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </Can>
                );
              }
              return null;
            })}
          </nav>
        </ScrollArea>

        {/* Footer */}
        <div className="border-t border-sidebar-border p-4">
          <Separator className="mb-3" />
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">v1.0.0</span>
            <span className="text-[10px] text-muted-foreground">
              SRI Inventarios
            </span>
          </div>
        </div>
      </aside>
    </TooltipProvider>
  );
}
