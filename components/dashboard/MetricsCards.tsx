"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  Package,
  Warehouse,
  Layers,
  Users,
  AlertTriangle,
  XCircle,
  ArrowRightLeft,
  Bell,
  DollarSign,
  Activity,
  TrendingUp,
  ArrowUpRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui";
import { cn } from "@/lib/utils/cn";
import type { DashboardMetrics } from "@/services/dashboardService";

interface MetricsCardsProps {
  metrics: DashboardMetrics;
}

export function MetricsCards({ metrics }: MetricsCardsProps) {
  const router = useRouter();

  const metricsConfig = [
    {
      title: "Total Productos",
      value: metrics.total_products ?? 0,
      icon: Package,
      gradient: "from-blue-500 to-blue-600",
      bgGradient: "from-blue-500/10 to-blue-600/10",
      iconBg: "bg-blue-500/10",
      iconColor: "text-blue-600",
      link: "/products",
    },
    {
      title: "Ubicaciones",
      value: metrics.total_locations ?? 0,
      icon: Warehouse,
      gradient: "from-emerald-500 to-emerald-600",
      bgGradient: "from-emerald-500/10 to-emerald-600/10",
      iconBg: "bg-emerald-500/10",
      iconColor: "text-emerald-600",
      link: "/locations",
    },
    {
      title: "Categorias",
      value: metrics.total_categories ?? 0,
      icon: Layers,
      gradient: "from-violet-500 to-violet-600",
      bgGradient: "from-violet-500/10 to-violet-600/10",
      iconBg: "bg-violet-500/10",
      iconColor: "text-violet-600",
      link: "/categories",
    },
    {
      title: "Unidades en Stock",
      value: metrics.total_units_in_stock ?? 0,
      icon: Users,
      gradient: "from-indigo-500 to-indigo-600",
      bgGradient: "from-indigo-500/10 to-indigo-600/10",
      iconBg: "bg-indigo-500/10",
      iconColor: "text-indigo-600",
      link: "/inventory/stock",
    },
  ];

  const alertMetrics = [
    {
      title: "Sin Stock",
      value: metrics.out_of_stock_products ?? 0,
      icon: XCircle,
      color: "text-destructive",
      bgColor: "bg-destructive/10",
      borderColor: "border-destructive/20",
      link: "/inventory/stock",
      subtitle: "sin existencias",
      urgent: true,
    },
    {
      title: "Stock Bajo",
      value: metrics.low_stock_products ?? 0,
      icon: AlertTriangle,
      color: "text-warning",
      bgColor: "bg-warning/10",
      borderColor: "border-warning/20",
      link: "/inventory/stock",
      subtitle: "por debajo del minimo",
      urgent: (metrics.low_stock_products ?? 0) > 5,
    },
    {
      title: "Mov. Hoy",
      value: metrics.total_transactions_today ?? 0,
      icon: ArrowRightLeft,
      color: "text-orange-600",
      bgColor: "bg-orange-500/10",
      borderColor: "border-orange-500/20",
      link: "/inventory/transactions",
    },
    {
      title: "Mov. Este Mes",
      value: metrics.total_transactions_this_month ?? 0,
      icon: Bell,
      color: "text-pink-600",
      bgColor: "bg-pink-500/10",
      borderColor: "border-pink-500/20",
      link: "/inventory/transactions",
      subtitle: "transacciones",
    },
  ];

  const summaryMetrics = [
    {
      title: "Valor Total Inventario",
      value: `$${(metrics.total_inventory_value ?? 0).toLocaleString("es-CL")}`,
      icon: DollarSign,
      gradient: "from-emerald-500 to-teal-500",
      description: "Valor estimado del stock",
    },
    {
      title: "Rotacion Inventario",
      value: `${(metrics.inventory_turnover ?? 0).toFixed(1)}%`,
      icon: Activity,
      gradient: "from-blue-500 to-cyan-500",
      description: "Indice de rotacion",
    },
    {
      title: "Producto Mas Movido",
      value: metrics.top_moving_product?.product_name ?? "N/A",
      icon: TrendingUp,
      gradient: "from-violet-500 to-purple-500",
      description: metrics.top_moving_product ? `${metrics.top_moving_product.movements} movimientos` : "Sin movimientos",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Main metrics grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metricsConfig.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card
              key={metric.title}
              variant="interactive"
              onClick={() => metric.link && router.push(metric.link)}
              className="group overflow-hidden"
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      {metric.title}
                    </p>
                    <p className="text-3xl font-bold tracking-tight text-foreground">
                      {metric.value.toLocaleString()}
                    </p>
                  </div>
                  <div
                    className={cn(
                      "flex h-12 w-12 items-center justify-center rounded-xl transition-transform group-hover:scale-110",
                      metric.iconBg
                    )}
                  >
                    <Icon className={cn("h-6 w-6", metric.iconColor)} />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-xs text-muted-foreground">
                  <ArrowUpRight className="mr-1 h-3 w-3 text-primary" />
                  <span className="text-primary font-medium">Ver detalles</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Alert metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {alertMetrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card
              key={metric.title}
              variant="interactive"
              onClick={() => metric.link && router.push(metric.link)}
              className={cn(
                "group border-l-4 transition-all",
                metric.borderColor,
                metric.urgent &&
                  metric.value > 0 &&
                  "animate-pulse ring-2 ring-destructive/20"
              )}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                      metric.bgColor
                    )}
                  >
                    <Icon className={cn("h-5 w-5", metric.color)} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-muted-foreground truncate">
                      {metric.title}
                    </p>
                    <div className="flex items-baseline gap-2">
                      <span
                        className={cn("text-2xl font-bold", metric.color)}
                      >
                        {metric.value}
                      </span>
                      {metric.subtitle && (
                        <span className="text-xs text-muted-foreground">
                          {metric.subtitle}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Summary metrics */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {summaryMetrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.title} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="flex items-center">
                  <div
                    className={cn(
                      "flex h-full w-20 items-center justify-center bg-gradient-to-br py-6",
                      metric.gradient
                    )}
                  >
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <div className="flex-1 p-4">
                    <p className="text-sm font-medium text-muted-foreground">
                      {metric.title}
                    </p>
                    <p className="mt-1 text-2xl font-bold text-foreground">
                      {metric.value}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {metric.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
