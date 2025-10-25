import React from 'react';
import { cn } from '@/lib/utils/cn';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
}

export function Skeleton({
  className,
  variant = 'text',
  width,
  height,
  style,
  ...props
}: SkeletonProps) {
  const variants = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded',
  };

  return (
    <div
      className={cn(
        'animate-pulse bg-gray-200 dark:bg-gray-700',
        variants[variant],
        className
      )}
      style={{
        width: width,
        height: height || (variant === 'text' ? '1rem' : undefined),
        ...style,
      }}
      {...props}
    />
  );
}

// Skeleton presets
export function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
      <Skeleton variant="rectangular" height="12rem" className="mb-4" />
      <Skeleton className="mb-2" width="60%" />
      <Skeleton width="40%" />
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="flex gap-4">
          <Skeleton width="10%" />
          <Skeleton width="30%" />
          <Skeleton width="20%" />
          <Skeleton width="40%" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonAvatar({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
  };

  return <Skeleton variant="circular" className={sizes[size]} />;
}
