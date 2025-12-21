'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft,
  Camera,
  CheckCircle,
  Package,
  AlertTriangle,
  History,
  X,
  Plus,
  Minus,
} from 'lucide-react';
import { CountService } from '@/services/countService';
import { ProductService } from '@/services/productService';
import { useCountScanner } from '@/lib/hooks/useCountScanner';
import { BarcodeScanner } from '@/components/scanner/BarcodeScanner';
import { ProductSuggestionModal } from '@/components/inventory/ProductSuggestionModal';
import { ProductIdentificationCard } from '@/components/inventory/ProductIdentificationCard';
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
  Skeleton,
  Input,
} from '@/components/ui';
import { Progress } from '@/components/ui/Progress';
import {
  countStatusLabels,
  countStatusColors,
  formatDiscrepancy,
  getDiscrepancyColor,
} from '@/lib/validations/count';
import type { InventoryCount, CountSummary, ScanResult, ProductSuggestion, CreateProductDTO } from '@/types';
import toast from 'react-hot-toast';

export default function CountScanPage() {
  const router = useRouter();
  const params = useParams();
  const countId = params.id as string;

  const [count, setCount] = useState<InventoryCount | null>(null);
  const [summary, setSummary] = useState<CountSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [showHistory, setShowHistory] = useState(false);
  const [lastScanResult, setLastScanResult] = useState<ScanResult | null>(null);

  // Open Food Facts integration state
  const [showSuggestionModal, setShowSuggestionModal] = useState(false);
  const [currentSuggestion, setCurrentSuggestion] = useState<ProductSuggestion | null>(null);

  // Use the count scanner hook
  const {
    scanBarcode,
    isScanning: isScanningApi,
    isLookingUp,
    scanHistory,
    error: scanError,
    clearError,
  } = useCountScanner({
    countId,
    onScanSuccess: (result) => {
      setLastScanResult(result);
      loadSummary();
    },
    onAlreadyCounted: (result) => {
      setLastScanResult(result);
    },
    onProductSuggestion: (suggestion) => {
      setCurrentSuggestion(suggestion);
      setShowSuggestionModal(true);
    },
  });

  // Load count details
  useEffect(() => {
    if (countId) {
      loadCountDetails();
    }
  }, [countId]);

  const loadCountDetails = async () => {
    try {
      setIsLoading(true);
      const countData = await CountService.getById(countId);

      // Check if count is in progress
      if (countData.status !== 'IN_PROGRESS') {
        toast.error('Esta sesión de conteo no está en progreso');
        router.push(`/counts/${countId}`);
        return;
      }

      setCount(countData);
      await loadSummary();
    } catch (error: any) {
      toast.error(error.message || 'Error al cargar el conteo');
      console.error('Error loading count:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSummary = async () => {
    try {
      const summaryData = await CountService.getSummary(countId);
      setSummary(summaryData);
    } catch (error) {
      console.error('Error loading summary:', error);
    }
  };

  // Handle barcode scan
  const handleScan = useCallback(
    async (barcode: string) => {
      clearError();
      setLastScanResult(null);
      await scanBarcode(barcode, quantity);
    },
    [scanBarcode, quantity, clearError]
  );

  // Quantity controls
  const incrementQuantity = () => setQuantity((q) => q + 1);
  const decrementQuantity = () => setQuantity((q) => Math.max(1, q - 1));

  // Handle create product from Open Food Facts suggestion
  const handleCreateProduct = async (data: CreateProductDTO) => {
    try {
      await ProductService.createProduct(data);
      toast.success('Producto creado exitosamente');
      setShowSuggestionModal(false);
      setCurrentSuggestion(null);
    } catch (error: any) {
      throw new Error(error.message || 'Error al crear el producto');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!count) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="mx-auto h-12 w-12 text-yellow-500" />
        <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
          Conteo no encontrado
        </h3>
        <Button
          variant="primary"
          className="mt-6"
          onClick={() => router.push('/counts')}
        >
          Volver a Conteos
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push(`/counts/${countId}`)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Camera className="h-6 w-6" />
              Escaneo de Productos
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {count.location?.name || 'Ubicación desconocida'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge
            variant={countStatusColors[count.status]}
            className="text-xs px-2 py-1"
          >
            {countStatusLabels[count.status]}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowHistory(!showHistory)}
            leftIcon={<History className="h-4 w-4" />}
          >
            {showHistory ? 'Ocultar' : 'Historial'}
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Progreso: {summary?.counted_products || count.items_counted} /{' '}
              {summary?.total_products || count.items_count} productos
            </span>
            <span className="text-sm font-bold text-primary">
              {Math.round(summary?.progress || count.progress)}%
            </span>
          </div>
          <Progress value={summary?.progress || count.progress} className="h-2" />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Scanner Section */}
        <div className="space-y-4">
          {/* Barcode Scanner */}
          <Card>
            <CardHeader className="py-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Escáner de Código de Barras
              </CardTitle>
            </CardHeader>
            <CardContent>
              <BarcodeScanner
                onScan={handleScan}
                onError={(error) => console.error('Scanner error:', error)}
                enabled={count.status === 'IN_PROGRESS'}
                className="mb-4"
              />

              {/* Quantity Input */}
              <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Cantidad a registrar
                </label>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={decrementQuantity}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Input
                    type="number"
                    value={quantity}
                    onChange={(e) =>
                      setQuantity(Math.max(1, parseInt(e.target.value) || 1))
                    }
                    className="w-20 text-center"
                    min={1}
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={incrementQuantity}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Error Display */}
          {scanError && (
            <Card className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
              <CardContent className="py-4">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-red-600 dark:text-red-400 font-medium">
                      {scanError}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={clearError}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Last Scan & History */}
        <div className="space-y-4">
          {/* Last Scan Result with Product Identification */}
          {lastScanResult && lastScanResult.product && (
            <div className="space-y-3">
              {/* Status badge */}
              <div
                className={`flex items-center gap-2 p-3 rounded-lg ${
                  lastScanResult.already_counted
                    ? 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800'
                    : 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                }`}
              >
                {lastScanResult.already_counted ? (
                  <>
                    <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                    <span className="text-yellow-600 dark:text-yellow-400 font-medium">
                      Producto ya contado
                    </span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                    <span className="text-green-600 dark:text-green-400 font-medium">
                      Producto registrado
                    </span>
                  </>
                )}
                {lastScanResult.already_counted && lastScanResult.counted_at && (
                  <span className="text-xs text-gray-500 ml-auto">
                    {new Date(lastScanResult.counted_at).toLocaleString('es-CL')}
                  </span>
                )}
              </div>

              {/* Product Identification Card */}
              <ProductIdentificationCard
                product={lastScanResult.product}
                expectedQuantity={lastScanResult.item?.expected_quantity}
                showQuantityInput={false}
              />

              {/* Count summary */}
              <Card>
                <CardContent className="py-4">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded">
                      <div className="text-xs text-gray-500">Esperado</div>
                      <div className="text-lg font-bold text-gray-900 dark:text-white">
                        {lastScanResult.item?.expected_quantity || '-'}
                      </div>
                    </div>
                    <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded">
                      <div className="text-xs text-gray-500">Contado</div>
                      <div className="text-lg font-bold text-gray-900 dark:text-white">
                        {lastScanResult.already_counted
                          ? lastScanResult.previous_count
                          : lastScanResult.item?.counted_quantity || '-'}
                      </div>
                    </div>
                    <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded">
                      <div className="text-xs text-gray-500">Diferencia</div>
                      <div
                        className={`text-lg font-bold ${getDiscrepancyColor(
                          lastScanResult.discrepancy || 0
                        )}`}
                      >
                        {formatDiscrepancy(lastScanResult.discrepancy || 0)}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Scan History */}
          {(showHistory || scanHistory.length > 0) && (
            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-base flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <History className="h-5 w-5" />
                    Historial de Escaneos
                  </span>
                  <Badge variant="secondary">{scanHistory.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="max-h-64 overflow-y-auto">
                {scanHistory.length === 0 ? (
                  <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                    No hay escaneos recientes
                  </p>
                ) : (
                  <div className="space-y-2">
                    {scanHistory.slice(0, 10).map((item, index) => (
                      <div
                        key={index}
                        className={`flex items-center justify-between p-2 rounded-lg ${
                          item.success
                            ? 'bg-green-50 dark:bg-green-900/20'
                            : item.alreadyCounted
                            ? 'bg-yellow-50 dark:bg-yellow-900/20'
                            : 'bg-red-50 dark:bg-red-900/20'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {item.success ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : item.alreadyCounted ? (
                            <AlertTriangle className="h-4 w-4 text-yellow-600" />
                          ) : (
                            <X className="h-4 w-4 text-red-600" />
                          )}
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {item.productName}
                            </p>
                            <p className="text-xs text-gray-500">
                              {item.barcode}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold">{item.quantity}</p>
                          <p className="text-xs text-gray-500">
                            {item.timestamp.toLocaleTimeString('es-CL')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Quick Stats */}
          <Card>
            <CardContent className="py-4">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {summary?.counted_products || count.items_counted}
                  </div>
                  <div className="text-xs text-gray-500">Contados</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-yellow-600">
                    {summary?.pending_products ||
                      count.items_count - count.items_counted}
                  </div>
                  <div className="text-xs text-gray-500">Pendientes</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => router.push(`/counts/${countId}`)}
            >
              Ver Detalles
            </Button>
            <Button
              variant="primary"
              className="flex-1"
              onClick={() => router.push(`/counts/${countId}/complete`)}
            >
              Finalizar Conteo
            </Button>
          </div>
        </div>
      </div>

      {/* Loading Overlay */}
      {(isScanningApi || isLookingUp) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-64">
            <CardContent className="py-6 text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                {isLookingUp ? 'Buscando en Open Food Facts...' : 'Procesando escaneo...'}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Product Suggestion Modal (Open Food Facts) */}
      {currentSuggestion && (
        <ProductSuggestionModal
          isOpen={showSuggestionModal}
          onClose={() => {
            setShowSuggestionModal(false);
            setCurrentSuggestion(null);
          }}
          suggestion={currentSuggestion}
          onCreateProduct={handleCreateProduct}
        />
      )}
    </div>
  );
}
