import React from 'react';
import { cn } from '@/lib/utils/cn';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      className,
      label,
      error,
      id,
      ...props
    },
    ref
  ) => {
    const checkboxId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className="flex items-start">
        <div className="flex items-center h-5">
          <input
            ref={ref}
            id={checkboxId}
            type="checkbox"
            className={cn(
              'w-4 h-4 text-blue-600 bg-white border-gray-300 rounded',
              'focus:ring-2 focus:ring-blue-500 focus:ring-offset-0',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'dark:bg-gray-800 dark:border-gray-600 dark:focus:ring-blue-600',
              error && 'border-red-500 dark:border-red-600',
              className
            )}
            {...props}
          />
        </div>
        {label && (
          <div className="ml-3 text-sm">
            <label
              htmlFor={checkboxId}
              className={cn(
                'font-medium text-gray-700 dark:text-gray-300',
                props.disabled && 'opacity-50 cursor-not-allowed'
              )}
            >
              {label}
            </label>
            {error && (
              <p className="text-red-600 dark:text-red-400">{error}</p>
            )}
          </div>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export { Checkbox };
