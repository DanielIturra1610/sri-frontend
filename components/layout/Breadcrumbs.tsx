"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils/cn";

// Route name mappings for better display
const routeNames: Record<string, string> = {
  dashboard: "Dashboard",
  products: "Productos",
  categories: "Categorias",
  inventory: "Inventario",
  stock: "Stock",
  locations: "Ubicaciones",
  transfers: "Transferencias",
  transactions: "Transacciones",
  import: "Importar",
  reports: "Reportes",
  settings: "Configuracion",
  users: "Usuarios",
  profile: "Mi Perfil",
  create: "Crear",
  edit: "Editar",
  new: "Nuevo",
  alerts: "Alertas",
  backups: "Respaldos",
  "audit-logs": "Logs de Auditoria",
  thresholds: "Umbrales",
  permissions: "Permisos",
};

interface BreadcrumbItem {
  label: string;
  href: string;
  active?: boolean;
}

function formatSegment(segment: string): string {
  // Check if it's a UUID or ID (skip formatting)
  if (
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      segment
    )
  ) {
    return "Detalle";
  }

  // Use mapped name or capitalize
  return (
    routeNames[segment] ||
    segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ")
  );
}

export function Breadcrumbs() {
  const pathname = usePathname();

  // Don't show breadcrumbs on dashboard home or auth pages
  if (
    pathname === "/dashboard" ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/register")
  ) {
    return null;
  }

  // Build breadcrumb items
  const segments = pathname.split("/").filter(Boolean);
  const breadcrumbs: BreadcrumbItem[] = [
    {
      label: "Dashboard",
      href: "/dashboard",
    },
  ];

  let currentPath = "";
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
    <nav
      aria-label="Breadcrumb"
      className="mb-6 flex items-center space-x-1 text-sm"
    >
      <ol className="flex items-center space-x-1">
        {breadcrumbs.map((item, index) => (
          <li key={item.href} className="flex items-center">
            {index > 0 && (
              <ChevronRight className="mx-1 h-4 w-4 text-muted-foreground" />
            )}

            {item.active ? (
              <span className="font-medium text-foreground">{item.label}</span>
            ) : (
              <Link
                href={item.href}
                className={cn(
                  "flex items-center text-muted-foreground transition-colors hover:text-primary",
                  index === 0 && "gap-1"
                )}
              >
                {index === 0 && <Home className="h-4 w-4" />}
                <span>{item.label}</span>
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
