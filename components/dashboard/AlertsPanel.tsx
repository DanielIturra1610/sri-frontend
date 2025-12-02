"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
  Button,
} from "@/components/ui";
import { AlertTriangle, XCircle, TrendingDown, ArrowRight, PackageX } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { Stock } from "@/types";

interface AlertsPanelProps {
  stockData: Stock[];
}

export function AlertsPanel({ stockData }: AlertsPanelProps) {
  const router = useRouter();
  const safeStockData = Array.isArray(stockData) ? stockData : [];

  // Filter critical and low stock items
  const criticalStock = safeStockData.filter((item) => item.quantity === 0).slice(0, 5);
  const lowStock = safeStockData
    .filter(
      (item) =>
        item.quantity > 0 &&
        item.minimum_stock &&
        item.quantity < item.minimum_stock
    )
    .slice(0, 5);

  const totalAlerts = criticalStock.length + lowStock.length;

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-warning/10">
              <AlertTriangle className="h-4 w-4 text-warning" />
            </div>
            <div>
              <CardTitle className="text-base">Alertas de Stock</CardTitle>
              <p className="text-xs text-muted-foreground">
                {totalAlerts} alertas activas
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/alerts")}
            className="gap-1 text-xs"
          >
            Ver todas
            <ArrowRight className="h-3 w-3" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Critical stock */}
        {criticalStock.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-destructive" />
              <h4 className="text-sm font-semibold text-destructive">
                Stock Critico ({criticalStock.length})
              </h4>
            </div>
            <div className="space-y-2">
              {criticalStock.map((item) => (
                <div
                  key={item.id}
                  className={cn(
                    "group flex items-center justify-between rounded-lg border p-3 transition-all",
                    "border-destructive/20 bg-destructive/5",
                    "hover:border-destructive/40 hover:bg-destructive/10 cursor-pointer"
                  )}
                  onClick={() => router.push(`/stock/${item.id}`)}
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {item.product_name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {item.location_name}
                    </p>
                  </div>
                  <Badge variant="destructive" size="sm">
                    Sin stock
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Low stock */}
        {lowStock.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-warning" />
              <h4 className="text-sm font-semibold text-warning-foreground">
                Stock Bajo ({lowStock.length})
              </h4>
            </div>
            <div className="space-y-2">
              {lowStock.map((item) => (
                <div
                  key={item.id}
                  className={cn(
                    "group flex items-center justify-between rounded-lg border p-3 transition-all",
                    "border-warning/20 bg-warning/5",
                    "hover:border-warning/40 hover:bg-warning/10 cursor-pointer"
                  )}
                  onClick={() => router.push(`/stock/${item.id}`)}
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {item.product_name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {item.location_name}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-warning">
                      {item.quantity}
                      <span className="text-muted-foreground font-normal">
                        {" "}
                        / {item.minimum_stock}
                      </span>
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      actual / minimo
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No alerts */}
        {criticalStock.length === 0 && lowStock.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
              <PackageX className="h-8 w-8 text-success" />
            </div>
            <p className="mt-4 font-medium text-foreground">
              No hay alertas de stock
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Todos los productos tienen stock adecuado
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
