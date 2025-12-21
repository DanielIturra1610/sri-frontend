'use client';

import * as React from 'react';
import { useState } from 'react';
import { Package, FileText, CheckCircle, AlertTriangle, X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Button } from '@/components/ui/Button';
import { ProductQuickSpecs } from './ProductQuickSpecs';
import type { Product, ProductSpecifications } from '@/types';

export interface ProductIdentificationCardProps {
  product: Product;
  expectedQuantity?: number;
  className?: string;
  onConfirm?: (quantity: number, notes?: string) => void;
  onCancel?: () => void;
  showQuantityInput?: boolean;
}

export function ProductIdentificationCard({
  product,
  expectedQuantity,
  className,
  onConfirm,
  onCancel,
  showQuantityInput = true,
}: ProductIdentificationCardProps) {
  const [quantity, setQuantity] = useState<number>(expectedQuantity || 0);
  const [notes, setNotes] = useState('');
  const [showFullSpecs, setShowFullSpecs] = useState(false);

  const specifications = product.attributes?.specifications as ProductSpecifications | undefined;
  const hasImage = !!product.image_url;
  const hasSpecs = specifications && Object.keys(specifications).length > 0;

  const handleConfirm = () => {
    onConfirm?.(quantity, notes || undefined);
  };

  const handleQuantityChange = (delta: number) => {
    setQuantity((prev) => Math.max(0, prev + delta));
  };

  return (
    <div className={cn('bg-white dark:bg-gray-900 rounded-xl shadow-lg overflow-hidden', className)}>
      {/* Header with image */}
      <div className="relative">
        {hasImage ? (
          <div className="aspect-video bg-gray-100 dark:bg-gray-800">
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-contain"
            />
          </div>
        ) : (
          <div className="aspect-video bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <Package className="h-16 w-16 text-gray-400" />
          </div>
        )}

        {/* Cancel button */}
        {onCancel && (
          <button
            onClick={onCancel}
            className="absolute top-3 right-3 p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        )}

        {/* Product badge */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-400" />
            <span className="text-white font-medium">Producto identificado</span>
          </div>
        </div>
      </div>

      {/* Product info */}
      <div className="p-4 space-y-4">
        {/* Name and SKU */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {product.name}
          </h3>
          <div className="flex flex-wrap gap-2 mt-1 text-sm text-gray-600 dark:text-gray-400">
            <span>SKU: {product.sku}</span>
            {product.barcode && (
              <>
                <span className="text-gray-300 dark:text-gray-600">|</span>
                <span>Codigo: {product.barcode}</span>
              </>
            )}
          </div>
          {product.brand && (
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
              Marca: {product.brand}
            </p>
          )}
        </div>

        {/* Quick specs */}
        {hasSpecs && (
          <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
            <ProductQuickSpecs specifications={specifications} maxItems={4} />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFullSpecs(true)}
              leftIcon={<FileText className="h-4 w-4" />}
              className="mt-2"
            >
              Ver ficha tecnica completa
            </Button>
          </div>
        )}

        {/* Lot tracking indicator */}
        {product.track_lots && (
          <div className="flex items-center gap-2 p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg text-sm">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <span className="text-amber-700 dark:text-amber-400">
              Este producto requiere seguimiento por lotes
            </span>
          </div>
        )}

        {/* Expected quantity */}
        {expectedQuantity !== undefined && (
          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">Stock esperado</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {expectedQuantity} <span className="text-sm font-normal text-gray-500">unidades</span>
            </p>
          </div>
        )}

        {/* Quantity input */}
        {showQuantityInput && (
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Cantidad contada
            </label>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="lg"
                onClick={() => handleQuantityChange(-1)}
                disabled={quantity <= 0}
                className="w-14 h-14 text-xl"
              >
                -
              </Button>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(0, parseInt(e.target.value) || 0))}
                className="flex-1 h-14 text-center text-2xl font-bold border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                min="0"
              />
              <Button
                variant="outline"
                size="lg"
                onClick={() => handleQuantityChange(1)}
                className="w-14 h-14 text-xl"
              >
                +
              </Button>
            </div>

            {/* Notes */}
            <textarea
              placeholder="Notas (opcional)..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              rows={2}
            />

            {/* Confirm button */}
            {onConfirm && (
              <Button
                variant="primary"
                size="lg"
                onClick={handleConfirm}
                className="w-full"
                leftIcon={<CheckCircle className="h-5 w-5" />}
              >
                Confirmar conteo
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Full specs modal */}
      {showFullSpecs && specifications && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-lg w-full max-h-[80vh] overflow-auto">
            <div className="sticky top-0 flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Ficha Tecnica
              </h3>
              <button
                onClick={() => setShowFullSpecs(false)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4">
              <ProductQuickSpecs specifications={specifications} showAll />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductIdentificationCard;
