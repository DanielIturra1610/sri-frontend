'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Search,
  CreditCard,
  Banknote,
  ArrowLeft,
  Barcode,
} from 'lucide-react';
import { SaleService } from '@/services/saleService';
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
  Skeleton,
} from '@/components/ui';
import type { Product, Location, CreateSaleItemDTO, PaymentMethod } from '@/types';
import toast from 'react-hot-toast';

interface CartItem extends CreateSaleItemDTO {
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

export default function CreateSalePage() {
  const router = useRouter();
  const searchRef = useRef<HTMLInputElement>(null);

  const [locations, setLocations] = useState<Location[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [customerName, setCustomerName] = useState('');
  const [customerRut, setCustomerRut] = useState('');
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
          p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (p.barcode && p.barcode.includes(searchQuery))
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts([]);
    }
  }, [searchQuery, products]);

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      const [locationsData, productsData] = await Promise.all([
        LocationService.getLocations(),
        ProductService.getProducts({ is_active: true }),
      ]);
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
                subtotal: (item.quantity + 1) * item.unit_price,
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
        unit_price: product.sale_price,
        discount_percent: 0,
        subtotal: product.sale_price,
      };
      setCart([...cart, newItem]);
    }

    setSearchQuery('');
    searchRef.current?.focus();
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
              subtotal: newQuantity * item.unit_price,
            };
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter((item) => item.product_id !== productId));
  };

  const getTotal = () => {
    return cart.reduce((sum, item) => sum + item.subtotal, 0);
  };

  const getTaxAmount = () => {
    return getTotal() * 0.19; // IVA 19%
  };

  const handleSubmit = async (asDraft: boolean = false) => {
    if (!selectedLocation) {
      toast.error('Selecciona una ubicación');
      return;
    }

    if (cart.length === 0) {
      toast.error('Agrega al menos un producto al carrito');
      return;
    }

    try {
      setIsSubmitting(true);

      const saleData = {
        location_id: selectedLocation,
        customer_name: customerName || undefined,
        customer_rut: customerRut || undefined,
        payment_method: paymentMethod,
        items: cart.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          discount_percent: item.discount_percent,
        })),
      };

      const sale = await SaleService.createSale(saleData);

      if (!asDraft) {
        await SaleService.completeSale(sale.id);
        toast.success('Venta completada exitosamente');
      } else {
        toast.success('Venta guardada como borrador');
      }

      router.push('/sales');
    } catch (error: any) {
      toast.error(error.message || 'Error al procesar venta');
      console.error('Error processing sale:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickSale = async () => {
    if (!selectedLocation) {
      toast.error('Selecciona una ubicación');
      return;
    }

    if (cart.length === 0) {
      toast.error('Agrega al menos un producto al carrito');
      return;
    }

    try {
      setIsSubmitting(true);

      await SaleService.quickSale({
        location_id: selectedLocation,
        items: cart.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
        })),
        payment_method: paymentMethod,
        customer_name: customerName || undefined,
        customer_rut: customerRut || undefined,
      });

      toast.success('Venta rápida completada');
      router.push('/sales');
    } catch (error: any) {
      toast.error(error.message || 'Error al procesar venta rápida');
      console.error('Error processing quick sale:', error);
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
        <Button variant="ghost" onClick={() => router.push('/sales')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <ShoppingCart className="h-7 w-7" />
            Nueva Venta
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Punto de venta</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Product Search & Cart */}
        <div className="lg:col-span-2 space-y-6">
          {/* Location Selector */}
          <Card>
            <CardContent className="pt-6">
              <SimpleSelect
                label="Ubicación"
                value={selectedLocation}
                onValueChange={(value) => setSelectedLocation(value)}
                options={locations.map((l) => ({ value: l.id, label: l.name }))}
              />
            </CardContent>
          </Card>

          {/* Product Search */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Barcode className="h-5 w-5" />
                Buscar Producto
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <Input
                  ref={searchRef}
                  placeholder="Buscar por nombre, SKU o código de barras..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  leftIcon={<Search className="h-4 w-4 text-gray-400" />}
                  autoFocus
                />

                {/* Search Results */}
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
                            {product.barcode && ` | Código: ${product.barcode}`}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-gray-900 dark:text-white">
                            {formatCurrency(product.sale_price)}
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
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Carrito ({cart.length} items)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {cart.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  El carrito está vacío. Busca y agrega productos.
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div
                      key={item.product_id}
                      className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700"
                    >
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {item.product_name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {item.product_sku} | {formatCurrency(item.unit_price)} c/u
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.product_id, -1)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-12 text-center font-semibold">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.product_id, 1)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="w-24 text-right font-semibold">
                          {formatCurrency(item.subtotal)}
                        </div>

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

        {/* Right Column - Payment & Summary */}
        <div className="space-y-6">
          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle>Datos del Cliente (Opcional)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Nombre"
                placeholder="Nombre del cliente"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />
              <Input
                label="RUT"
                placeholder="12.345.678-9"
                value={customerRut}
                onChange={(e) => setCustomerRut(e.target.value)}
              />
            </CardContent>
          </Card>

          {/* Payment Method */}
          <Card>
            <CardHeader>
              <CardTitle>Método de Pago</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant={paymentMethod === 'cash' ? 'primary' : 'outline'}
                  onClick={() => setPaymentMethod('cash')}
                  className="flex items-center gap-2"
                >
                  <Banknote className="h-5 w-5" />
                  Efectivo
                </Button>
                <Button
                  variant={paymentMethod === 'card' ? 'primary' : 'outline'}
                  onClick={() => setPaymentMethod('card')}
                  className="flex items-center gap-2"
                >
                  <CreditCard className="h-5 w-5" />
                  Tarjeta
                </Button>
                <Button
                  variant={paymentMethod === 'transfer' ? 'primary' : 'outline'}
                  onClick={() => setPaymentMethod('transfer')}
                  className="col-span-2"
                >
                  Transferencia
                </Button>
              </div>
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
                  <span>{formatCurrency(getTotal())}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>IVA (19%)</span>
                  <span>{formatCurrency(getTaxAmount())}</span>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                  <div className="flex justify-between text-xl font-bold text-gray-900 dark:text-white">
                    <span>Total</span>
                    <span>{formatCurrency(getTotal() + getTaxAmount())}</span>
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
              onClick={handleQuickSale}
              disabled={isSubmitting || cart.length === 0}
              isLoading={isSubmitting}
            >
              Completar Venta
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
              onClick={() => router.push('/sales')}
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
