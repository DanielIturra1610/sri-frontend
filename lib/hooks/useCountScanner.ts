'use client';

import { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CountService } from '@/services/countService';
import { ProductService } from '@/services/productService';
import type { ScanResult, InventoryCountItem, ProductSuggestion } from '@/types';
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
  lotId?: string;
  lotNumber?: string;
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
  onProductSuggestion?: (suggestion: ProductSuggestion, barcode: string) => void;
  defaultQuantity?: number;
}

export interface UseCountScannerReturn {
  scanBarcode: (barcode: string, quantity?: number, lotId?: string, notes?: string) => Promise<ScanResult | null>;
  lookupBarcode: (barcode: string) => Promise<void>;
  registerManual: (productId: string, quantity: number, lotId?: string, notes?: string) => Promise<InventoryCountItem | null>;
  updateItemCount: (itemId: string, quantity: number, notes?: string) => Promise<InventoryCountItem | null>;
  isScanning: boolean;
  isLookingUp: boolean;
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
  onProductSuggestion,
  defaultQuantity = 1,
}: UseCountScannerOptions): UseCountScannerReturn {
  const queryClient = useQueryClient();

  const [lastScan, setLastScan] = useState<ScanResult | null>(null);
  const [scanHistory, setScanHistory] = useState<ScanHistoryItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLookingUp, setIsLookingUp] = useState(false);

  // Scan barcode mutation
  const scanMutation = useMutation({
    mutationFn: async ({
      barcode,
      quantity,
      lotId,
      notes,
    }: {
      barcode: string;
      quantity: number;
      lotId?: string;
      notes?: string;
    }) => {
      return CountService.scanBarcode(countId, { barcode, lot_id: lotId, quantity, notes });
    },
    onSuccess: (result, variables) => {
      setLastScan(result);
      setError(null);

      // Add to history
      const historyItem: ScanHistoryItem = {
        barcode: variables.barcode,
        productName: result.product?.name || result.item?.product?.name || 'Producto',
        lotId: variables.lotId,
        lotNumber: result.item?.lot?.lot_number,
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
    onError: (err: Error, variables) => {
      const errorMessage = err.message;

      if (errorMessage === 'BARCODE_NOT_FOUND' || errorMessage.includes('barcode not found') || errorMessage.includes('producto no encontrado')) {
        // Try to lookup barcode in Open Food Facts
        lookupBarcode(variables.barcode);
      } else if (errorMessage === 'COUNT_NOT_IN_PROGRESS') {
        setError('La sesion de conteo no esta en progreso');
        toast.error('La sesion de conteo no esta activa');
        onScanError?.(err);
      } else {
        setError(errorMessage);
        toast.error(errorMessage);
        onScanError?.(err);
      }
    },
  });

  // Lookup barcode in Open Food Facts
  const lookupBarcode = useCallback(async (barcode: string) => {
    try {
      setIsLookingUp(true);
      setError(null);

      const response = await ProductService.lookupBarcode(barcode);

      if (response.success && response.source === 'open_food_facts' && response.data?.suggestion) {
        toast.success('Producto encontrado en Open Food Facts');
        onProductSuggestion?.(response.data.suggestion, barcode);
      } else if (response.success && response.source === 'local' && response.data?.product) {
        // This shouldn't happen since we already tried local, but handle it anyway
        toast.success('Producto encontrado localmente');
      } else {
        setError('Codigo de barras no encontrado en ninguna base de datos');
        toast.error('Codigo de barras no encontrado');
      }
    } catch (err) {
      setError('Codigo de barras no encontrado');
      toast.error('Codigo de barras no encontrado en ninguna base de datos');
    } finally {
      setIsLookingUp(false);
    }
  }, [onProductSuggestion]);

  // Register manual count mutation
  const registerMutation = useMutation({
    mutationFn: async ({
      productId,
      quantity,
      lotId,
      notes,
    }: {
      productId: string;
      quantity: number;
      lotId?: string;
      notes?: string;
    }) => {
      return CountService.registerCount(countId, { product_id: productId, lot_id: lotId, quantity, notes });
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
    async (barcode: string, quantity?: number, lotId?: string, notes?: string): Promise<ScanResult | null> => {
      try {
        const result = await scanMutation.mutateAsync({
          barcode,
          quantity: quantity ?? defaultQuantity,
          lotId,
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
    async (productId: string, quantity: number, lotId?: string, notes?: string): Promise<InventoryCountItem | null> => {
      try {
        const result = await registerMutation.mutateAsync({
          productId,
          quantity,
          lotId,
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
    lookupBarcode,
    registerManual,
    updateItemCount,
    isScanning: scanMutation.isPending || registerMutation.isPending || updateMutation.isPending,
    isLookingUp,
    lastScan,
    scanHistory,
    error,
    clearError,
    clearLastScan,
    clearHistory,
  };
}

export default useCountScanner;
