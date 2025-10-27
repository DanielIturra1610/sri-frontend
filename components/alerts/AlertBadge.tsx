'use client';

import React, { useState, useEffect } from 'react';
import { StockService } from '@/services/stockService';
import type { Stock } from '@/types';

interface AlertBadgeProps {
  className?: string;
}

export function AlertBadge({ className = '' }: AlertBadgeProps) {
  const [alertCount, setAlertCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAlertCount();

    // Refresh every 5 minutes
    const interval = setInterval(loadAlertCount, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const loadAlertCount = async () => {
    try {
      const stock = await StockService.getAllStock();

      // Count items with alerts (quantity = 0 or quantity < minimum_stock)
      const alertItems = stock.filter((item: Stock) => {
        if (item.quantity === 0) return true;
        if (item.minimum_stock && item.quantity < item.minimum_stock) return true;
        return false;
      });

      setAlertCount(alertItems.length);
    } catch (error) {
      console.error('Error loading alert count:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Don't show badge if no alerts or still loading
  if (isLoading || alertCount === 0) {
    return null;
  }

  return (
    <span
      className={`inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full ${className}`}
    >
      {alertCount}
    </span>
  );
}
