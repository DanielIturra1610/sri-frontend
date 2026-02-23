'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, PackageCheck, Check, AlertTriangle } from 'lucide-react';
import { PurchaseService } from '@/services/purchaseService';
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Input,
  Skeleton,
} from '@/components/ui';
import type { Purchase, ReceivePurchaseItemDTO } from '@/types';
import toast from 'react-hot-toast';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
  }).format(value);
};

interface ReceiveItemState {
  item_id: string;
  product_name: string;
  product_sku: string;
  ordered_quantity: number;
  received_quantity: number;
  pending_quantity: number;
  quantity_to_receive: number;
  notes: string;
}

export default function ReceivePurchasePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [purchase, setPurchase] = useState<Purchase | null>(null);
  const [items, setItems] = useState<ReceiveItemState[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      loadPurchase();
    }
  }, [id]);

  const loadPurchase = async () => {
    try {
      setIsLoading(true);
      const data = await PurchaseService.getPurchase(id);
      setPurchase(data);

      // Initialize items state
      const itemsState: ReceiveItemState[] = (data.items || [])
        .filter((item) => item.received_quantity < item.quantity)
        .map((item) => ({
          item_id: item.id,
          product_name: item.product_name,
          product_sku: item.product_sku,
          ordered_quantity: item.quantity,
          received_quantity: item.received_quantity,
          pending_quantity: item.quantity - item.received_quantity,
          quantity_to_receive: item.quantity - item.received_quantity, // Default to receiving all pending
          notes: '',
        }));
      setItems(itemsState);
    } catch (error: any) {
      toast.error(error.message || 'Error al cargar compra');
      console.error('Error loading purchase:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    setItems(
      items.map((item) => {
        if (item.item_id === itemId) {
          return {
            ...item,
            quantity_to_receive: Math.max(0, Math.min(quantity, item.pending_quantity)),
          };
        }
        return item;
      })
    );
  };

  const updateNotes = (itemId: string, notes: string) => {
    setItems(
      items.map((item) => {
        if (item.item_id === itemId) {
          return { ...item, notes };
        }
        return item;
      })
    );
  };

  const receiveAll = () => {
    setItems(
      items.map((item) => ({
        ...item,
        quantity_to_receive: item.pending_quantity,
      }))
    );
  };

  const clearAll = () => {
    setItems(
      items.map((item) => ({
        ...item,
        quantity_to_receive: 0,
      }))
    );
  };

  const handleSubmit = async () => {
    const itemsToReceive = items.filter((item) => item.quantity_to_receive > 0);

    if (itemsToReceive.length === 0) {
      toast.error('Ingresa al menos una cantidad a recibir');
      return;
    }

    try {
      setIsSubmitting(true);

      const receiveData = {
        items: itemsToReceive.map((item) => ({
          item_id: item.item_id,
          quantity: item.quantity_to_receive,
          notes: item.notes || undefined,
        })),
      };

      await PurchaseService.receivePurchase(id, receiveData);
      toast.success('Mercadería recibida exitosamente. El inventario ha sido actualizado.');
      router.push(`/purchases/${id}`);
    } catch (error: any) {
      toast.error(error.message || 'Error al recibir mercadería');
      console.error('Error receiving purchase:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!purchase) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">Compra no encontrada</p>
        <Button variant="outline" onClick={() => router.push('/purchases')} className="mt-4">
          Volver a Compras
        </Button>
      </div>
    );
  }

  if (purchase.status === 'received') {
    return (
      <div className="text-center py-12">
        <Check className="h-16 w-16 text-green-600 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          Compra Completamente Recibida
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          Todos los productos de esta orden ya han sido recibidos.
        </p>
        <Button variant="outline" onClick={() => router.push(`/purchases/${id}`)}>
          Ver Detalles
        </Button>
      </div>
    );
  }

  if (purchase.status === 'cancelled') {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-16 w-16 text-red-600 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Compra Cancelada</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          No se puede recibir una compra cancelada.
        </p>
        <Button variant="outline" onClick={() => router.push('/purchases')}>
          Volver a Compras
        </Button>
      </div>
    );
  }

  const totalToReceive = items.reduce((sum, item) => sum + item.quantity_to_receive, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.push(`/purchases/${id}`)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <PackageCheck className="h-7 w-7" />
            Recibir Mercadería
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Compra: {purchase.purchase_number} | Proveedor: {purchase.supplier?.name}
          </p>
        </div>
      </div>

      {/* Info Card */}
      <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <CardContent className="pt-6">
          <p className="text-blue-800 dark:text-blue-200">
            Al recibir la mercadería, el inventario se actualizará automáticamente en la ubicación{' '}
            <strong>{purchase.location?.name}</strong>.
          </p>
        </CardContent>
      </Card>

      {/* Items to Receive */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Productos Pendientes ({items.length})</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={receiveAll}>
                Recibir Todo
              </Button>
              <Button variant="outline" size="sm" onClick={clearAll}>
                Limpiar
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No hay productos pendientes de recibir.
            </div>
          ) : (
            <div className="space-y-4">
              {/* Header */}
              <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-500 dark:text-gray-400 border-b pb-2">
                <div className="col-span-4">Producto</div>
                <div className="col-span-2 text-center">Pedido</div>
                <div className="col-span-2 text-center">Recibido</div>
                <div className="col-span-2 text-center">Pendiente</div>
                <div className="col-span-2 text-center">A Recibir</div>
              </div>

              {items.map((item) => (
                <div
                  key={item.item_id}
                  className="grid grid-cols-12 gap-4 items-center py-3 border-b border-gray-100 dark:border-gray-800"
                >
                  <div className="col-span-4">
                    <div className="font-medium text-gray-900 dark:text-white">
                      {item.product_name}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{item.product_sku}</div>
                  </div>

                  <div className="col-span-2 text-center text-gray-700 dark:text-gray-300">
                    {item.ordered_quantity}
                  </div>

                  <div className="col-span-2 text-center">
                    <span
                      className={
                        item.received_quantity > 0 ? 'text-green-600' : 'text-gray-500'
                      }
                    >
                      {item.received_quantity}
                    </span>
                  </div>

                  <div className="col-span-2 text-center text-orange-600 font-medium">
                    {item.pending_quantity}
                  </div>

                  <div className="col-span-2">
                    <Input
                      type="number"
                      min={0}
                      max={item.pending_quantity}
                      value={item.quantity_to_receive}
                      onChange={(e) =>
                        updateQuantity(item.item_id, parseInt(e.target.value) || 0)
                      }
                      className="text-center"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-between items-center">
        <div className="text-gray-600 dark:text-gray-400">
          Total a recibir: <strong className="text-gray-900 dark:text-white">{totalToReceive}</strong>{' '}
          unidades
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={() => router.push(`/purchases/${id}`)}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={isSubmitting || totalToReceive === 0}
            isLoading={isSubmitting}
            leftIcon={<PackageCheck className="h-4 w-4" />}
          >
            Confirmar Recepción
          </Button>
        </div>
      </div>
    </div>
  );
}
