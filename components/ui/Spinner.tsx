import React from 'react';
import { cn } from '@/lib/utils/cn';

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'primary' | 'secondary' | 'white';
}

export function Spinner({ className, size = 'md', variant = 'primary', ...props }: SpinnerProps) {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12',
  };

  const variants = {
    primary: 'border-blue-600',
    secondary: 'border-gray-600',
    white: 'border-white',
  };

  return (
    <div
      className={cn('inline-block', className)}
      {...props}
    >
      <div
        className={cn(
          'animate-spin rounded-full border-2 border-solid border-current border-r-transparent',
          sizes[size],
          variants[variant]
        )}
        role="status"
      >
        <span className="sr-only">Cargando...</span>
      </div>
    </div>
  );
}

export interface LoadingOverlayProps {
  isLoading: boolean;
  text?: string;
}

export function LoadingOverlay({ isLoading, text = 'Cargando...' }: LoadingOverlayProps) {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-xl">
        <div className="flex flex-col items-center">
          <Spinner size="lg" />
          <p className="mt-4 text-gray-700 dark:text-gray-300">{text}</p>
        </div>
      </div>
    </div>
  );
}
