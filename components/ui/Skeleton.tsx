import * as React from "react";
import { cn } from "@/lib/utils/cn";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  );
}

// Skeleton presets
function SkeletonCard() {
  return (
    <div className="rounded-lg border bg-card p-6 shadow-soft">
      <Skeleton className="mb-4 h-48 w-full" />
      <Skeleton className="mb-2 h-4 w-3/5" />
      <Skeleton className="h-4 w-2/5" />
    </div>
  );
}

function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      <div className="flex gap-4 border-b pb-3">
        <Skeleton className="h-4 w-[10%]" />
        <Skeleton className="h-4 w-[30%]" />
        <Skeleton className="h-4 w-[20%]" />
        <Skeleton className="h-4 w-[40%]" />
      </div>
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="flex gap-4">
          <Skeleton className="h-4 w-[10%]" />
          <Skeleton className="h-4 w-[30%]" />
          <Skeleton className="h-4 w-[20%]" />
          <Skeleton className="h-4 w-[40%]" />
        </div>
      ))}
    </div>
  );
}

function SkeletonAvatar({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizes = {
    sm: "h-8 w-8",
    md: "h-12 w-12",
    lg: "h-16 w-16",
  };

  return <Skeleton className={cn("rounded-full", sizes[size])} />;
}

function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          className={cn("h-4", index === lines - 1 ? "w-4/5" : "w-full")}
        />
      ))}
    </div>
  );
}

export { Skeleton, SkeletonCard, SkeletonTable, SkeletonAvatar, SkeletonText };
