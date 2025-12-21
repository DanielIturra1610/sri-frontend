'use client';

import * as React from 'react';
import { useState, useRef, useCallback } from 'react';
import { Camera, Upload, X, Loader2, Check, RotateCcw, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { OCRService } from '@/services/ocrService';
import { UploadService } from '@/services/uploadService';
import type { OCRProductSuggestion, OCRResponse } from '@/types';
import toast from 'react-hot-toast';

export interface ProductScannerProps {
  onScanComplete: (suggestion: OCRProductSuggestion) => void;
  onCancel: () => void;
  className?: string;
}

type ScanState = 'idle' | 'camera' | 'preview' | 'processing' | 'success' | 'error';

export function ProductScanner({
  onScanComplete,
  onCancel,
  className,
}: ProductScannerProps) {
  const [state, setState] = useState<ScanState>('idle');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ocrResult, setOcrResult] = useState<OCRResponse | null>(null);
  const [saveImage, setSaveImage] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Start camera
  const startCamera = useCallback(async () => {
    try {
      setError(null);
      setState('camera');

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (err: any) {
      console.error('Camera error:', err);
      if (err.name === 'NotAllowedError') {
        setError('Permiso de cámara denegado. Habilita el acceso en la configuración del navegador.');
      } else if (err.name === 'NotFoundError') {
        setError('No se encontró ninguna cámara en el dispositivo.');
      } else {
        setError('Error al acceder a la cámara: ' + err.message);
      }
      setState('error');
    }
  }, []);

  // Stop camera
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, []);

  // Capture photo from camera
  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
      setImagePreview(dataUrl);
      stopCamera();
      setState('preview');
    }
  }, [stopCamera]);

  // Handle file upload
  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Por favor selecciona un archivo de imagen válido.');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('La imagen es muy grande. Máximo 10MB.');
      return;
    }

    try {
      setError(null);
      const base64 = await OCRService.compressImage(file, 1920, 0.8);
      setImagePreview(base64);
      setState('preview');
    } catch (err) {
      setError('Error al procesar la imagen.');
      console.error(err);
    }
  }, []);

  // Process image with OCR
  const processImage = useCallback(async () => {
    if (!imagePreview) return;

    setState('processing');
    setError(null);

    try {
      const result = await OCRService.processImage(imagePreview, 'product_label');
      setOcrResult(result);

      if (result.success && result.suggestion) {
        setState('success');
      } else {
        setError(result.error || 'No se pudo extraer información de la imagen.');
        setState('error');
      }
    } catch (err: any) {
      console.error('OCR error:', err);
      setError(err.message || 'Error al procesar la imagen.');
      setState('error');
    }
  }, [imagePreview]);

  // Confirm and use the scanned data
  const confirmScan = useCallback(async () => {
    if (!ocrResult?.suggestion) return;

    let suggestion = { ...ocrResult.suggestion };

    // Upload image if saveImage is enabled
    if (saveImage && imagePreview) {
      try {
        setIsUploading(true);

        // Convert base64 to File
        const response = await fetch(imagePreview);
        const blob = await response.blob();
        const file = new File([blob], 'product-scan.jpg', { type: 'image/jpeg' });

        // Compress and upload
        const compressedFile = await UploadService.compressImage(file, 1920, 0.8);
        const uploadResult = await UploadService.uploadImage(compressedFile, 'product');

        suggestion.image_url = uploadResult.url;
        toast.success('Imagen guardada correctamente');
      } catch (err: any) {
        console.error('Error uploading image:', err);
        toast.error('No se pudo guardar la imagen, pero los datos fueron extraidos');
      } finally {
        setIsUploading(false);
      }
    }

    onScanComplete(suggestion);
  }, [ocrResult, onScanComplete, saveImage, imagePreview]);

  // Reset to initial state
  const reset = useCallback(() => {
    stopCamera();
    setImagePreview(null);
    setError(null);
    setOcrResult(null);
    setState('idle');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [stopCamera]);

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return (
    <div className={cn('flex flex-col', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Escanear Producto
        </h3>
        <Button variant="ghost" size="icon" onClick={onCancel}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Main content area */}
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800 mb-4">
        {/* Idle state - show options */}
        {state === 'idle' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6">
            <ImageIcon className="h-16 w-16 text-gray-400" />
            <p className="text-center text-gray-600 dark:text-gray-400">
              Toma una foto o sube una imagen del producto para extraer información automáticamente
            </p>
            <div className="flex gap-3">
              <Button onClick={startCamera} leftIcon={<Camera className="h-4 w-4" />}>
                Usar Cámara
              </Button>
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                leftIcon={<Upload className="h-4 w-4" />}
              >
                Subir Imagen
              </Button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        )}

        {/* Camera state */}
        {state === 'camera' && (
          <>
            <video
              ref={videoRef}
              className="h-full w-full object-cover"
              playsInline
              muted
              autoPlay
            />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="border-2 border-dashed border-white/50 rounded-lg w-3/4 h-3/4" />
            </div>
          </>
        )}

        {/* Preview state */}
        {(state === 'preview' || state === 'processing' || state === 'success') && imagePreview && (
          <img
            src={imagePreview}
            alt="Vista previa"
            className="h-full w-full object-contain"
          />
        )}

        {/* Processing overlay */}
        {state === 'processing' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60">
            <Loader2 className="h-12 w-12 text-white animate-spin mb-3" />
            <p className="text-white text-sm">Procesando imagen...</p>
            <p className="text-white/70 text-xs mt-1">Extrayendo información del producto</p>
          </div>
        )}

        {/* Success overlay */}
        {state === 'success' && ocrResult?.suggestion && (
          <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/80 to-transparent">
            <div className="w-full p-4 text-white">
              <div className="flex items-center gap-2 mb-2">
                <Check className="h-5 w-5 text-green-400" />
                <span className="font-medium">Información extraída</span>
                <span className="text-xs text-white/70 ml-auto">
                  {Math.round(ocrResult.suggestion.confidence * 100)}% confianza
                </span>
              </div>
              <div className="text-sm space-y-1">
                {ocrResult.suggestion.name && (
                  <p><span className="text-white/70">Nombre:</span> {ocrResult.suggestion.name}</p>
                )}
                {ocrResult.suggestion.brand && (
                  <p><span className="text-white/70">Marca:</span> {ocrResult.suggestion.brand}</p>
                )}
                {ocrResult.suggestion.barcode && (
                  <p><span className="text-white/70">Código:</span> {ocrResult.suggestion.barcode}</p>
                )}
                {ocrResult.suggestion.sale_price && (
                  <p><span className="text-white/70">Precio:</span> ${ocrResult.suggestion.sale_price.toLocaleString('es-CL')}</p>
                )}
              </div>
              <div className="mt-3 pt-2 border-t border-white/20">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={saveImage}
                    onChange={(e) => setSaveImage(e.target.checked)}
                    className="w-4 h-4 rounded border-white/30 bg-white/10 text-primary-500 focus:ring-primary-500"
                  />
                  <span className="text-sm">Guardar esta foto como imagen del producto</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Error state */}
        {state === 'error' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 p-6">
            <X className="h-12 w-12 text-red-400 mb-3" />
            <p className="text-white text-center text-sm mb-4">{error}</p>
            <Button variant="outline" size="sm" onClick={reset}>
              Intentar de nuevo
            </Button>
          </div>
        )}
      </div>

      {/* Hidden canvas for photo capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Action buttons */}
      <div className="flex gap-3">
        {state === 'camera' && (
          <>
            <Button variant="ghost" onClick={() => { stopCamera(); setState('idle'); }} className="flex-1">
              Cancelar
            </Button>
            <Button onClick={capturePhoto} className="flex-1" leftIcon={<Camera className="h-4 w-4" />}>
              Capturar
            </Button>
          </>
        )}

        {state === 'preview' && (
          <>
            <Button variant="ghost" onClick={reset} className="flex-1" leftIcon={<RotateCcw className="h-4 w-4" />}>
              Otra imagen
            </Button>
            <Button onClick={processImage} className="flex-1" leftIcon={<Check className="h-4 w-4" />}>
              Analizar
            </Button>
          </>
        )}

        {state === 'success' && (
          <>
            <Button variant="ghost" onClick={reset} className="flex-1" leftIcon={<RotateCcw className="h-4 w-4" />} disabled={isUploading}>
              Escanear otro
            </Button>
            <Button
              onClick={confirmScan}
              className="flex-1"
              leftIcon={isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              disabled={isUploading}
            >
              {isUploading ? 'Guardando...' : 'Usar datos'}
            </Button>
          </>
        )}
      </div>

      {/* OCR Raw text (collapsible for debugging) */}
      {state === 'success' && ocrResult?.raw_text && (
        <details className="mt-4 text-sm">
          <summary className="cursor-pointer text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
            Ver texto detectado
          </summary>
          <pre className="mt-2 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-auto max-h-32 text-xs whitespace-pre-wrap">
            {ocrResult.raw_text}
          </pre>
        </details>
      )}
    </div>
  );
}

export default ProductScanner;
