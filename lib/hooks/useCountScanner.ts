'use client';

import { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CountService } from '@/services/countService';
import type { ScanResult, InventoryCountItem } from '@/types';
import toast from 'react-hot-toast';

export interface ScanState {
  isScanning: boolean;
  lastScan: ScanResult | null;
  scanHistory: ScanHistoryItem[];
  error: string | null;
}

export interface ScanHistoryItem {
  barcode: string;
  productName: string;
  quantity: number;
  timestamp: Date;
  success: boolean;
  alreadyCounted: boolean;
}

export interface UseCountScannerOptions {
  countId: string;
  onScanSuccess?: (result: ScanResult) => void;
  onScanError?: (error: Error) => void;
  onAlreadyCounted?: (result: ScanResult) => void;
  defaultQuantity?: number;
}

export interface UseCountScannerReturn {
  scanBarcode: (barcode: string, quantity?: number, notes?: string) => Promise<ScanResult | null>;
  registerManual: (productId: string, quantity: number, notes?: string) => Promise<InventoryCountItem | null>;
  updateItemCount: (itemId: string, quantity: number, notes?: string) => Promise<InventoryCountItem | null>;
  isScanning: boolean;
  lastScan: ScanResult | null;
  scanHistory: ScanHistoryItem[];
  error: string | null;
  clearError: () => void;
  clearLastScan: () => void;
  clearHistory: () => void;
}

export function useCountScanner({
  countId,
  onScanSuccess,
  onScanError,
  onAlreadyCounted,
  defaultQuantity = 1,
}: UseCountScannerOptions): UseCountScannerReturn {
  const queryClient = useQueryClient();

  const [lastScan, setLastScan] = useState<ScanResult | null>(null);
  const [scanHistory, setScanHistory] = useState<ScanHistoryItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Scan barcode mutation
  const scanMutation = useMutation({
    mutationFn: async ({
      barcode,
      quantity,
      notes,
    }: {
      barcode: string;
      quantity: number;
      notes?: string;
    }) => {
      return CountService.scanBarcode(countId, { barcode, quantity, notes });
    },
    onSuccess: (result, variables) => {
      setLastScan(result);
      setError(null);

      // Add to history
      const historyItem: ScanHistoryItem = {
        barcode: variables.barcode,
        productName: result.product?.name || result.item?.product?.name || 'Producto',
        quantity: variables.quantity,
        timestamp: new Date(),
        success: !result.already_counted,
        alreadyCounted: result.already_counted,
      };

      setScanHistory((prev) => [historyItem, ...prev.slice(0, 49)]); // Keep last 50

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['count', countId] });
      queryClient.invalidateQueries({ queryKey: ['count-items', countId] });
      queryClient.invalidateQueries({ queryKey: ['count-summary', countId] });

      if (result.already_counted) {
        toast.error(`Este producto ya fue contado (${result.previous_count} unidades)`);
        onAlreadyCounted?.(result);
      } else {
        toast.success('Producto registrado correctamente');
        onScanSuccess?.(result);
      }
    },
    onError: (err: Error) => {
      const errorMessage = err.message;

      if (errorMessage === 'BARCODE_NOT_FOUND') {
        setError('Código de barras no encontrado en el sistema');
        toast.error('Código de barras no encontrado');
      } else if (errorMessage === 'COUNT_NOT_IN_PROGRESS') {
        setError('La sesión de conteo no está en progreso');
        toast.error('La sesión de conteo no está activa');
      } else {
        setError(errorMessage);
        toast.error(errorMessage);
      }

      onScanError?.(err);
    },
  });

  // Register manual count mutation
  const registerMutation = useMutation({
    mutationFn: async ({
      productId,
      quantity,
      notes,
    }: {
      productId: string;
      quantity: number;
      notes?: string;
    }) => {
      return CountService.registerCount(countId, { product_id: productId, quantity, notes });
    },
    onSuccess: () => {
      setError(null);

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['count', countId] });
      queryClient.invalidateQueries({ queryKey: ['count-items', countId] });
      queryClient.invalidateQueries({ queryKey: ['count-summary', countId] });

      toast.success('Conteo registrado manualmente');
    },
    onError: (err: Error) => {
      const errorMessage = err.message;

      if (errorMessage === 'PRODUCT_ALREADY_COUNTED') {
        setError('Este producto ya fue contado');
        toast.error('Este producto ya fue contado en esta sesión');
      } else if (errorMessage === 'COUNT_NOT_IN_PROGRESS') {
        setError('La sesión de conteo no está en progreso');
        toast.error('La sesión de conteo no está activa');
      } else {
        setError(errorMessage);
        toast.error(errorMessage);
      }
    },
  });

  // Update item count mutation
  const updateMutation = useMutation({
    mutationFn: async ({
      itemId,
      quantity,
      notes,
    }: {
      itemId: string;
      quantity: number;
      notes?: string;
    }) => {
      return CountService.updateItemCount(countId, itemId, { quantity, notes });
    },
    onSuccess: () => {
      setError(null);

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['count', countId] });
      queryClient.invalidateQueries({ queryKey: ['count-items', countId] });
      queryClient.invalidateQueries({ queryKey: ['count-summary', countId] });

      toast.success('Conteo actualizado');
    },
    onError: (err: Error) => {
      setError(err.message);
      toast.error(err.message);
    },
  });

  // Scan barcode handler
  const scanBarcode = useCallback(
    async (barcode: string, quantity?: number, notes?: string): Promise<ScanResult | null> => {
      try {
        const result = await scanMutation.mutateAsync({
          barcode,
          quantity: quantity ?? defaultQuantity,
          notes,
        });
        return result;
      } catch {
        return null;
      }
    },
    [scanMutation, defaultQuantity]
  );

  // Register manual handler
  const registerManual = useCallback(
    async (productId: string, quantity: number, notes?: string): Promise<InventoryCountItem | null> => {
      try {
        const result = await registerMutation.mutateAsync({
          productId,
          quantity,
          notes,
        });
        return result;
      } catch {
        return null;
      }
    },
    [registerMutation]
  );

  // Update item handler
  const updateItemCount = useCallback(
    async (itemId: string, quantity: number, notes?: string): Promise<InventoryCountItem | null> => {
      try {
        const result = await updateMutation.mutateAsync({
          itemId,
          quantity,
          notes,
        });
        return result;
      } catch {
        return null;
      }
    },
    [updateMutation]
  );

  // Clear functions
  const clearError = useCallback(() => setError(null), []);
  const clearLastScan = useCallback(() => setLastScan(null), []);
  const clearHistory = useCallback(() => setScanHistory([]), []);

  return {
    scanBarcode,
    registerManual,
    updateItemCount,
    isScanning: scanMutation.isPending || registerMutation.isPending || updateMutation.isPending,
    lastScan,
    scanHistory,
    error,
    clearError,
    clearLastScan,
    clearHistory,
  };
}

export default useCountScanner;
