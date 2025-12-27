'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Minus, Plus } from 'lucide-react';
import { Button, Input } from '@/components/ui';
import { cn } from '@/lib/utils/cn';

interface QuantityInputProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  expectedQuantity?: number;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
}

export function QuantityInput({
  value,
  onChange,
  min = 0,
  max = 99999,
  step = 1,
  expectedQuantity,
  size = 'lg',
  disabled = false,
  className,
}: QuantityInputProps) {
  const [inputValue, setInputValue] = useState(value.toString());

  useEffect(() => {
    setInputValue(value.toString());
  }, [value]);

  const handleIncrement = useCallback(() => {
    if (!disabled) {
      const newValue = Math.min(value + step, max);
      onChange(newValue);
    }
  }, [value, step, max, onChange, disabled]);

  const handleDecrement = useCallback(() => {
    if (!disabled) {
      const newValue = Math.max(value - step, min);
      onChange(newValue);
    }
  }, [value, step, min, onChange, disabled]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);

    const numVal = parseInt(val, 10);
    if (!isNaN(numVal) && numVal >= min && numVal <= max) {
      onChange(numVal);
    }
  };

  const handleBlur = () => {
    const numVal = parseInt(inputValue, 10);
    if (isNaN(numVal)) {
      setInputValue(value.toString());
    } else {
      const clampedValue = Math.max(min, Math.min(max, numVal));
      onChange(clampedValue);
      setInputValue(clampedValue.toString());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      handleIncrement();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      handleDecrement();
    }
  };

  const discrepancy = expectedQuantity !== undefined ? value - expectedQuantity : null;

  const sizeClasses = {
    sm: {
      button: 'h-8 w-8',
      buttonIcon: 'h-4 w-4',
      input: 'h-8 w-16 text-sm',
    },
    md: {
      button: 'h-10 w-10',
      buttonIcon: 'h-5 w-5',
      input: 'h-10 w-20 text-base',
    },
    lg: {
      button: 'h-14 w-14',
      buttonIcon: 'h-6 w-6',
      input: 'h-14 w-24 text-2xl',
    },
  };

  const sizes = sizeClasses[size];

  return (
    <div className={cn('flex flex-col items-center gap-3', className)}>
      {/* Input controls */}
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="secondary"
          size="icon"
          className={cn(sizes.button, 'rounded-full shrink-0')}
          onClick={handleDecrement}
          disabled={disabled || value <= min}
        >
          <Minus className={sizes.buttonIcon} />
        </Button>

        <Input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          className={cn(
            sizes.input,
            'text-center font-bold',
            discrepancy !== null &&
              discrepancy !== 0 &&
              (discrepancy > 0
                ? 'border-green-500 bg-green-50 focus:border-green-500 focus:ring-green-200'
                : 'border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-200')
          )}
        />

        <Button
          type="button"
          variant="secondary"
          size="icon"
          className={cn(sizes.button, 'rounded-full shrink-0')}
          onClick={handleIncrement}
          disabled={disabled || value >= max}
        >
          <Plus className={sizes.buttonIcon} />
        </Button>
      </div>

      {/* Discrepancy indicator */}
      {discrepancy !== null && discrepancy !== 0 && (
        <div
          className={cn(
            'text-sm font-medium px-3 py-1.5 rounded-full',
            discrepancy > 0
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-700'
          )}
        >
          {discrepancy > 0 ? '+' : ''}
          {discrepancy} unidades
          {discrepancy > 0 ? ' (sobrante)' : ' (faltante)'}
        </div>
      )}

      {/* Expected quantity reference */}
      {expectedQuantity !== undefined && (
        <div className="text-sm text-gray-500">
          Esperado: <span className="font-medium">{expectedQuantity}</span> unidades
        </div>
      )}
    </div>
  );
}
