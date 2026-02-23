'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ShoppingBag, Plus, Minus, Trash2, Search } from 'lucide-react';
import { PurchaseService } from '@/services/purchaseService';
import { SupplierService } from '@/services/supplierService';
import { ProductService } from '@/services/productService';
import { LocationService } from '@/services/locationService';
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Input,
  SimpleSelect,
  Textarea,
  Skeleton,
} from '@/components/ui';
import type { Product, Location, Supplier, CreatePurchaseItemDTO } from '@/types';
import toast from 'react-hot-toast';

interface CartItem extends CreatePurchaseItemDTO {
  product_name: string;
  product_sku: string;
  subtotal: number;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
  }).format(value);
};

export default function CreatePurchasePage() {
  const router = useRouter();

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState<string>('');
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [supplierInvoice, setSupplierInvoice] = useState('');
  const [notes, setNotes] = useState('');
  const [expectedDate, setExpectedDate] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = products.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.sku.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts([]);
    }
  }, [searchQuery, products]);

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      const [suppliersData, locationsData, productsData] = await Promise.all([
        SupplierService.getSuppliers({ is_active: true }),
        LocationService.getLocations(),
        ProductService.getProducts({ is_active: true }),
      ]);
      setSuppliers(suppliersData.suppliers);
      setLocations(locationsData);
      setProducts(productsData.data?.items || []);

      if (locationsData.length > 0) {
        setSelectedLocation(locationsData[0].id);
      }
    } catch (error: any) {
      toast.error(error.message || 'Error al cargar datos');
      console.error('Error loading initial data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addToCart = (product: Product) => {
    const existingItem = cart.find((item) => item.product_id === product.id);

    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.product_id === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
                subtotal: (item.quantity + 1) * item.unit_cost,
              }
            : item
        )
      );
    } else {
      const newItem: CartItem = {
        product_id: product.id,
        product_name: product.name,
        product_sku: product.sku,
        quantity: 1,
        unit_cost: product.cost_price,
        discount_percent: 0,
        subtotal: product.cost_price,
      };
      setCart([...cart, newItem]);
    }

    setSearchQuery('');
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(
      cart
        .map((item) => {
          if (item.product_id === productId) {
            const newQuantity = Math.max(0, item.quantity + delta);
            return {
              ...item,
              quantity: newQuantity,
              subtotal: newQuantity * item.unit_cost,
            };
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const updateUnitCost = (productId: string, newCost: number) => {
    setCart(
      cart.map((item) => {
        if (item.product_id === productId) {
          return {
            ...item,
            unit_cost: newCost,
            subtotal: item.quantity * newCost,
          };
        }
        return item;
      })
    );
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter((item) => item.product_id !== productId));
  };

  const getSubtotal = () => {
    return cart.reduce((sum, item) => sum + item.subtotal, 0);
  };

  const getTaxAmount = () => {
    return getSubtotal() * 0.19; // IVA 19%
  };

  const getTotal = () => {
    return getSubtotal() + getTaxAmount();
  };

  const handleSubmit = async (asDraft: boolean = true) => {
    if (!selectedSupplier) {
      toast.error('Selecciona un proveedor');
      return;
    }

    if (!selectedLocation) {
      toast.error('Selecciona una ubicación');
      return;
    }

    if (cart.length === 0) {
      toast.error('Agrega al menos un producto');
      return;
    }

    try {
      setIsSubmitting(true);

      const purchaseData = {
        supplier_id: selectedSupplier,
        location_id: selectedLocation,
        supplier_invoice: supplierInvoice || undefined,
        notes: notes || undefined,
        expected_date: expectedDate || undefined,
        items: cart.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
          unit_cost: item.unit_cost,
          discount_percent: item.discount_percent,
        })),
      };

      const purchase = await PurchaseService.createPurchase(purchaseData);

      if (!asDraft) {
        await PurchaseService.orderPurchase(purchase.id);
        toast.success('Orden de compra creada y enviada');
      } else {
        toast.success('Orden de compra guardada como borrador');
      }

      router.push('/purchases');
    } catch (error: any) {
      toast.error(error.message || 'Error al crear orden de compra');
      console.error('Error creating purchase:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Skeleton className="h-96 w-full" />
          </div>
          <div>
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.push('/purchases')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <ShoppingBag className="h-7 w-7" />
            Nueva Orden de Compra
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Crea una nueva orden de compra</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Product Search & Cart */}
        <div className="lg:col-span-2 space-y-6">
          {/* Supplier & Location */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SimpleSelect
                  label="Proveedor"
                  value={selectedSupplier}
                  onValueChange={(value) => setSelectedSupplier(value)}
                  placeholder="Seleccionar proveedor"
                  options={suppliers.map((s) => ({ value: s.id, label: s.name }))}
                />
                <SimpleSelect
                  label="Ubicación de Destino"
                  value={selectedLocation}
                  onValueChange={(value) => setSelectedLocation(value)}
                  options={locations.map((l) => ({ value: l.id, label: l.name }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Product Search */}
          <Card>
            <CardHeader>
              <CardTitle>Agregar Productos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <Input
                  placeholder="Buscar producto por nombre o SKU..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  leftIcon={<Search className="h-4 w-4 text-gray-400" />}
                />

                {filteredProducts.length > 0 && (
                  <div className="absolute z-10 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                    {filteredProducts.map((product) => (
                      <button
                        key={product.id}
                        className="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex justify-between items-center"
                        onClick={() => addToCart(product)}
                      >
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {product.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            SKU: {product.sku}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-gray-900 dark:text-white">
                            {formatCurrency(product.cost_price)}
                          </div>
                          <div className="text-sm text-green-600">
                            <Plus className="h-4 w-4 inline" /> Agregar
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Cart */}
          <Card>
            <CardHeader>
              <CardTitle>Productos ({cart.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {cart.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  Busca y agrega productos a la orden de compra.
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Header */}
                  <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-500 dark:text-gray-400 border-b pb-2">
                    <div className="col-span-4">Producto</div>
                    <div className="col-span-2">Costo Unit.</div>
                    <div className="col-span-2">Cantidad</div>
                    <div className="col-span-2 text-right">Subtotal</div>
                    <div className="col-span-2"></div>
                  </div>

                  {cart.map((item) => (
                    <div
                      key={item.product_id}
                      className="grid grid-cols-12 gap-4 items-center py-3 border-b border-gray-200 dark:border-gray-700"
                    >
                      <div className="col-span-4">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {item.product_name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {item.product_sku}
                        </div>
                      </div>

                      <div className="col-span-2">
                        <Input
                          type="number"
                          value={item.unit_cost}
                          onChange={(e) =>
                            updateUnitCost(item.product_id, parseFloat(e.target.value) || 0)
                          }
                          min={0}
                          className="w-full"
                        />
                      </div>

                      <div className="col-span-2">
                        <div className="flex items-center gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.product_id, -1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-10 text-center font-semibold">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.product_id, 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>

                      <div className="col-span-2 text-right font-semibold">
                        {formatCurrency(item.subtotal)}
                      </div>

                      <div className="col-span-2 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFromCart(item.product_id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Details & Summary */}
        <div className="space-y-6">
          {/* Additional Details */}
          <Card>
            <CardHeader>
              <CardTitle>Detalles Adicionales</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="N° Factura Proveedor"
                placeholder="Número de factura"
                value={supplierInvoice}
                onChange={(e) => setSupplierInvoice(e.target.value)}
              />
              <Input
                label="Fecha Esperada de Entrega"
                type="date"
                value={expectedDate}
                onChange={(e) => setExpectedDate(e.target.value)}
              />
              <Textarea
                label="Notas"
                placeholder="Notas adicionales..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </CardContent>
          </Card>

          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Resumen</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Subtotal</span>
                  <span>{formatCurrency(getSubtotal())}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>IVA (19%)</span>
                  <span>{formatCurrency(getTaxAmount())}</span>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                  <div className="flex justify-between text-xl font-bold text-gray-900 dark:text-white">
                    <span>Total</span>
                    <span>{formatCurrency(getTotal())}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              variant="primary"
              className="w-full"
              size="lg"
              onClick={() => handleSubmit(false)}
              disabled={isSubmitting || cart.length === 0}
              isLoading={isSubmitting}
            >
              Crear y Enviar Pedido
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => handleSubmit(true)}
              disabled={isSubmitting || cart.length === 0}
            >
              Guardar como Borrador
            </Button>
            <Button
              variant="ghost"
              className="w-full"
              onClick={() => router.push('/purchases')}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
