'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Modal, ModalFooter } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import {
  Package,
  Tag,
  Barcode,
  Building2,
  DollarSign,
  Plus,
  X,
  ExternalLink
} from 'lucide-react';
import type { ProductSuggestion, CreateProductDTO } from '@/types';

interface ProductSuggestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  suggestion: ProductSuggestion;
  onCreateProduct: (data: CreateProductDTO) => Promise<void>;
}

export function ProductSuggestionModal({
  isOpen,
  onClose,
  suggestion,
  onCreateProduct,
}: ProductSuggestionModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state with pre-filled data from suggestion
  const [formData, setFormData] = useState({
    name: suggestion.name || '',
    sku: '',
    barcode: suggestion.barcode || '',
    brand: suggestion.brand || '',
    description: suggestion.description || '',
    cost_price: 0,
    sale_price: 0,
  });

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.name.trim()) {
      setError('El nombre del producto es requerido');
      return;
    }
    if (!formData.sku.trim()) {
      setError('El SKU es requerido');
      return;
    }
    if (formData.sale_price <= 0) {
      setError('El precio de venta debe ser mayor a 0');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await onCreateProduct({
        name: formData.name.trim(),
        sku: formData.sku.trim(),
        barcode: formData.barcode.trim() || undefined,
        brand: formData.brand.trim() || undefined,
        description: formData.description.trim() || undefined,
        cost_price: formData.cost_price,
        sale_price: formData.sale_price,
        unit_of_measure: 'unit',
        is_active: true,
      });

      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear el producto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Producto encontrado en Open Food Facts"
      description="Revisa y completa la informacion para agregar este producto"
      size="lg"
    >
      <div className="space-y-6">
        {/* Product Info from Open Food Facts */}
        <div className="flex gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          {suggestion.image_url && (
            <div className="flex-shrink-0">
              <Image
                src={suggestion.image_url}
                alt={suggestion.name}
                width={100}
                height={100}
                className="rounded-lg object-cover"
                unoptimized
              />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="info">Open Food Facts</Badge>
              <ExternalLink className="h-3 w-3 text-gray-400" />
            </div>
            <h3 className="font-semibold text-lg truncate">{suggestion.name}</h3>
            {suggestion.brand && (
              <p className="text-sm text-gray-600">
                <Building2 className="inline h-3 w-3 mr-1" />
                {suggestion.brand}
              </p>
            )}
            {suggestion.quantity && (
              <p className="text-sm text-gray-500">{suggestion.quantity}</p>
            )}
            {suggestion.category && (
              <p className="text-xs text-gray-400 mt-1 truncate">
                <Tag className="inline h-3 w-3 mr-1" />
                {suggestion.category}
              </p>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Package className="inline h-4 w-4 mr-1" />
              Nombre del Producto *
            </label>
            <Input
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Nombre del producto"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Tag className="inline h-4 w-4 mr-1" />
              SKU *
            </label>
            <Input
              value={formData.sku}
              onChange={(e) => handleInputChange('sku', e.target.value.toUpperCase())}
              placeholder="Ej: PROD-001"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Barcode className="inline h-4 w-4 mr-1" />
              Codigo de Barras
            </label>
            <Input
              value={formData.barcode}
              onChange={(e) => handleInputChange('barcode', e.target.value)}
              placeholder="Codigo de barras"
              disabled
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Building2 className="inline h-4 w-4 mr-1" />
              Marca
            </label>
            <Input
              value={formData.brand}
              onChange={(e) => handleInputChange('brand', e.target.value)}
              placeholder="Marca del producto"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <DollarSign className="inline h-4 w-4 mr-1" />
              Precio Costo
            </label>
            <Input
              type="number"
              min="0"
              step="1"
              value={formData.cost_price}
              onChange={(e) => handleInputChange('cost_price', parseFloat(e.target.value) || 0)}
              placeholder="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <DollarSign className="inline h-4 w-4 mr-1" />
              Precio Venta *
            </label>
            <Input
              type="number"
              min="0"
              step="1"
              value={formData.sale_price}
              onChange={(e) => handleInputChange('sale_price', parseFloat(e.target.value) || 0)}
              placeholder="0"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Descripcion
          </label>
          <Input
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Descripcion del producto"
          />
        </div>
      </div>

      <ModalFooter>
        <Button variant="outline" onClick={onClose} disabled={loading}>
          <X className="h-4 w-4 mr-2" />
          Cancelar
        </Button>
        <Button onClick={handleSubmit} disabled={loading}>
          {loading ? (
            <Spinner className="h-4 w-4 mr-2" />
          ) : (
            <Plus className="h-4 w-4 mr-2" />
          )}
          Crear Producto
        </Button>
      </ModalFooter>
    </Modal>
  );
}
