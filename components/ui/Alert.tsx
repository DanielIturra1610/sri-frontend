import React from 'react';
import { cn } from '@/lib/utils/cn';
import { X, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  title?: string;
  onClose?: () => void;
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = 'default', title, onClose, children, ...props }, ref) => {
    const variants = {
      default: {
        container: 'bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700',
        icon: 'text-gray-600 dark:text-gray-400',
        title: 'text-gray-900 dark:text-white',
        description: 'text-gray-700 dark:text-gray-300',
        Icon: Info,
      },
      success: {
        container: 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800',
        icon: 'text-green-600 dark:text-green-400',
        title: 'text-green-900 dark:text-green-300',
        description: 'text-green-700 dark:text-green-400',
        Icon: CheckCircle,
      },
      warning: {
        container: 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800',
        icon: 'text-yellow-600 dark:text-yellow-400',
        title: 'text-yellow-900 dark:text-yellow-300',
        description: 'text-yellow-700 dark:text-yellow-400',
        Icon: AlertTriangle,
      },
      danger: {
        container: 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800',
        icon: 'text-red-600 dark:text-red-400',
        title: 'text-red-900 dark:text-red-300',
        description: 'text-red-700 dark:text-red-400',
        Icon: AlertCircle,
      },
      info: {
        container: 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800',
        icon: 'text-blue-600 dark:text-blue-400',
        title: 'text-blue-900 dark:text-blue-300',
        description: 'text-blue-700 dark:text-blue-400',
        Icon: Info,
      },
    };

    const config = variants[variant];
    const Icon = config.Icon;

    return (
      <div
        ref={ref}
        className={cn(
          'relative rounded-lg border p-4',
          config.container,
          className
        )}
        {...props}
      >
        <div className="flex">
          <div className="flex-shrink-0">
            <Icon className={cn('h-5 w-5', config.icon)} />
          </div>
          <div className="ml-3 flex-1">
            {title && (
              <h3 className={cn('text-sm font-medium', config.title)}>{title}</h3>
            )}
            {children && (
              <div className={cn('text-sm', title && 'mt-2', config.description)}>
                {children}
              </div>
            )}
          </div>
          {onClose && (
            <div className="ml-auto pl-3">
              <button
                onClick={onClose}
                className={cn(
                  'inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2',
                  config.icon,
                  'hover:bg-black/5 dark:hover:bg-white/5'
                )}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }
);

Alert.displayName = 'Alert';

export { Alert };
