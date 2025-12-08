'use client';

import * as React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader, IScannerControls } from '@zxing/browser';
import { Result, BarcodeFormat, DecodeHintType } from '@zxing/library';
import { cn } from '@/lib/utils/cn';
import { Button } from '@/components/ui/Button';
import { Camera, CameraOff, FlashlightOff, Flashlight, RotateCcw } from 'lucide-react';

export interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
  onError?: (error: Error) => void;
  className?: string;
  enabled?: boolean;
  formats?: BarcodeFormat[];
}

interface CameraDevice {
  deviceId: string;
  label: string;
}

export function BarcodeScanner({
  onScan,
  onError,
  className,
  enabled = true,
  formats,
}: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  const lastScanRef = useRef<string>('');
  const lastScanTimeRef = useRef<number>(0);

  const [isScanning, setIsScanning] = useState(false);
  const [cameras, setCameras] = useState<CameraDevice[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string>('');
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [torchEnabled, setTorchEnabled] = useState(false);
  const [torchSupported, setTorchSupported] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debounce time for scans (prevent duplicate scans)
  const SCAN_DEBOUNCE_MS = 2000;

  // Initialize reader with hints
  const initializeReader = useCallback(() => {
    const hints = new Map();

    // Set formats to scan
    if (formats && formats.length > 0) {
      hints.set(DecodeHintType.POSSIBLE_FORMATS, formats);
    } else {
      // Default formats for inventory barcodes
      hints.set(DecodeHintType.POSSIBLE_FORMATS, [
        BarcodeFormat.EAN_13,
        BarcodeFormat.EAN_8,
        BarcodeFormat.CODE_128,
        BarcodeFormat.CODE_39,
        BarcodeFormat.UPC_A,
        BarcodeFormat.UPC_E,
        BarcodeFormat.QR_CODE,
      ]);
    }

    hints.set(DecodeHintType.TRY_HARDER, true);

    readerRef.current = new BrowserMultiFormatReader(hints);
    return readerRef.current;
  }, [formats]);

  // Request camera permission explicitly (needed for mobile)
  const requestCameraPermission = useCallback(async () => {
    try {
      // Request permission by getting a temporary stream
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }, // Prefer back camera on mobile
      });
      // Stop the stream immediately - we just needed to trigger permission prompt
      stream.getTracks().forEach(track => track.stop());
      setHasPermission(true);
      return true;
    } catch (err: any) {
      console.error('Camera permission error:', err);
      if (err.name === 'NotAllowedError') {
        setHasPermission(false);
        setError('Permiso de cámara denegado. Por favor, habilita el acceso a la cámara en la configuración del navegador.');
      } else if (err.name === 'NotFoundError') {
        setError('No se encontró ninguna cámara en el dispositivo.');
      } else {
        setError('Error al acceder a la cámara: ' + err.message);
      }
      return false;
    }
  }, []);

  // Get available cameras
  const getCameras = useCallback(async () => {
    try {
      // First, try to list devices (might be empty on mobile without permission)
      let videoInputDevices = await BrowserMultiFormatReader.listVideoInputDevices();

      // If no devices found and we haven't requested permission yet, try requesting
      if (videoInputDevices.length === 0 && hasPermission === null) {
        console.log('No cameras found, requesting permission...');
        const granted = await requestCameraPermission();
        if (granted) {
          // Try again after permission granted
          videoInputDevices = await BrowserMultiFormatReader.listVideoInputDevices();
        }
      }

      const cameraList: CameraDevice[] = videoInputDevices.map((device, index) => ({
        deviceId: device.deviceId,
        label: device.label || `Cámara ${index + 1}`,
      }));

      setCameras(cameraList);

      // Prefer back camera (for mobile scanning)
      const backCamera = cameraList.find(
        (cam) => cam.label.toLowerCase().includes('back') ||
                 cam.label.toLowerCase().includes('trasera') ||
                 cam.label.toLowerCase().includes('rear') ||
                 cam.label.toLowerCase().includes('environment')
      );

      if (backCamera) {
        setSelectedCamera(backCamera.deviceId);
      } else if (cameraList.length > 0) {
        setSelectedCamera(cameraList[0].deviceId);
      }

      return cameraList;
    } catch (err) {
      console.error('Error getting cameras:', err);
      setError('No se pudieron obtener las cámaras disponibles');
      return [];
    }
  }, [hasPermission, requestCameraPermission]);

  // Check torch support
  const checkTorchSupport = useCallback(async () => {
    if (!videoRef.current?.srcObject) return false;

    try {
      const stream = videoRef.current.srcObject as MediaStream;
      const track = stream.getVideoTracks()[0];

      if (track) {
        const capabilities = track.getCapabilities() as MediaTrackCapabilities & { torch?: boolean };
        const supported = 'torch' in capabilities && capabilities.torch === true;
        setTorchSupported(supported);
        return supported;
      }
    } catch (err) {
      console.log('Torch not supported');
    }

    setTorchSupported(false);
    return false;
  }, []);

  // Toggle torch
  const toggleTorch = useCallback(async () => {
    if (!videoRef.current?.srcObject || !torchSupported) return;

    try {
      const stream = videoRef.current.srcObject as MediaStream;
      const track = stream.getVideoTracks()[0];

      if (track) {
        const newTorchState = !torchEnabled;
        await track.applyConstraints({
          advanced: [{ torch: newTorchState } as MediaTrackConstraintSet],
        });
        setTorchEnabled(newTorchState);
      }
    } catch (err) {
      console.error('Error toggling torch:', err);
    }
  }, [torchEnabled, torchSupported]);

  // Handle scan result
  const handleScan = useCallback(
    (result: Result) => {
      const barcode = result.getText();
      const now = Date.now();

      // Debounce duplicate scans
      if (barcode === lastScanRef.current && now - lastScanTimeRef.current < SCAN_DEBOUNCE_MS) {
        return;
      }

      lastScanRef.current = barcode;
      lastScanTimeRef.current = now;

      // Vibrate if supported
      if (navigator.vibrate) {
        navigator.vibrate(100);
      }

      onScan(barcode);
    },
    [onScan]
  );

  // Start scanning
  const startScanning = useCallback(async () => {
    if (!videoRef.current) return;

    setError(null);

    try {
      // If no camera selected, try to get cameras first (will request permission on mobile)
      let cameraToUse = selectedCamera;
      if (!cameraToUse) {
        console.log('No camera selected, getting cameras...');
        const cameraList = await getCameras();
        if (cameraList.length === 0) {
          setError('No se encontraron cámaras. Asegúrate de dar permiso de acceso a la cámara.');
          return;
        }
        // Use the first camera or back camera
        const backCamera = cameraList.find(
          (cam) => cam.label.toLowerCase().includes('back') ||
                   cam.label.toLowerCase().includes('trasera') ||
                   cam.label.toLowerCase().includes('rear')
        );
        cameraToUse = backCamera?.deviceId || cameraList[0].deviceId;
        setSelectedCamera(cameraToUse);
      }

      const reader = readerRef.current || initializeReader();

      const controls = await reader.decodeFromVideoDevice(
        cameraToUse,
        videoRef.current,
        (result, error) => {
          if (result) {
            handleScan(result);
          }
          // Ignore decode errors (no barcode found in frame)
          if (error && error.name !== 'NotFoundException') {
            console.log('Scan error:', error);
          }
        }
      );

      controlsRef.current = controls;
      setIsScanning(true);
      setHasPermission(true);

      // Check torch support after starting
      setTimeout(checkTorchSupport, 500);
    } catch (err: any) {
      console.error('Error starting scanner:', err);

      if (err.name === 'NotAllowedError') {
        setHasPermission(false);
        setError('Permiso de cámara denegado. Por favor, habilita el acceso a la cámara en la configuración del navegador.');
      } else if (err.name === 'NotFoundError') {
        setError('No se encontró ninguna cámara.');
      } else if (err.name === 'NotReadableError') {
        setError('La cámara está siendo usada por otra aplicación. Cierra otras apps que usen la cámara.');
      } else {
        setError('Error al iniciar el escáner: ' + err.message);
      }

      onError?.(err);
    }
  }, [selectedCamera, getCameras, initializeReader, handleScan, checkTorchSupport, onError]);

  // Stop scanning
  const stopScanning = useCallback(() => {
    if (controlsRef.current) {
      controlsRef.current.stop();
      controlsRef.current = null;
    }

    setIsScanning(false);
    setTorchEnabled(false);
  }, []);

  // Switch camera
  const switchCamera = useCallback(() => {
    if (cameras.length < 2) return;

    const currentIndex = cameras.findIndex((cam) => cam.deviceId === selectedCamera);
    const nextIndex = (currentIndex + 1) % cameras.length;
    const nextCamera = cameras[nextIndex];

    setSelectedCamera(nextCamera.deviceId);

    if (isScanning) {
      stopScanning();
      // Will restart with new camera due to effect
    }
  }, [cameras, selectedCamera, isScanning, stopScanning]);

  // Request camera permission and get cameras
  useEffect(() => {
    getCameras();
    initializeReader();

    return () => {
      stopScanning();
      readerRef.current = null;
    };
  }, [getCameras, initializeReader, stopScanning]);

  // Auto start/stop based on enabled prop and selected camera
  // On mobile, we don't auto-start if hasPermission is null (not yet requested)
  useEffect(() => {
    if (enabled && selectedCamera && !isScanning && hasPermission !== false) {
      startScanning();
    } else if (!enabled && isScanning) {
      stopScanning();
    }
  }, [enabled, selectedCamera, isScanning, hasPermission, startScanning, stopScanning]);

  // Restart scanning when camera changes
  useEffect(() => {
    if (isScanning && selectedCamera) {
      stopScanning();
      const timer = setTimeout(() => {
        startScanning();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [selectedCamera]);

  return (
    <div className={cn('relative w-full', className)}>
      {/* Video container */}
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-black">
        <video
          ref={videoRef}
          className="h-full w-full object-cover"
          playsInline
          muted
        />

        {/* Scanning overlay */}
        {isScanning && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            {/* Scan frame */}
            <div className="relative h-48 w-64 rounded-lg border-2 border-primary">
              {/* Corner indicators */}
              <div className="absolute -left-0.5 -top-0.5 h-6 w-6 rounded-tl-lg border-l-4 border-t-4 border-primary" />
              <div className="absolute -right-0.5 -top-0.5 h-6 w-6 rounded-tr-lg border-r-4 border-t-4 border-primary" />
              <div className="absolute -bottom-0.5 -left-0.5 h-6 w-6 rounded-bl-lg border-b-4 border-l-4 border-primary" />
              <div className="absolute -bottom-0.5 -right-0.5 h-6 w-6 rounded-br-lg border-b-4 border-r-4 border-primary" />

              {/* Scan line animation */}
              <div className="absolute left-2 right-2 top-0 h-0.5 animate-pulse bg-primary/80"
                   style={{ animation: 'scan-line 2s ease-in-out infinite' }} />
            </div>
          </div>
        )}

        {/* Error overlay */}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 p-4">
            <div className="text-center text-white max-w-xs">
              <CameraOff className="mx-auto mb-2 h-12 w-12 text-destructive" />
              <p className="text-sm mb-2">{error}</p>
              <div className="text-xs text-gray-400 mb-3 space-y-1">
                <p>Para habilitar la cámara manualmente:</p>
                <p><strong>Chrome:</strong> Toca el candado 🔒 → Permisos → Cámara → Permitir</p>
                <p><strong>Safari:</strong> Configuración → Safari → Cámara</p>
              </div>
              <div className="flex flex-col gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    setError(null);
                    setHasPermission(null);

                    // Check if API is available
                    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                      setError('Tu navegador no soporta acceso a la cámara. Intenta con Chrome o Safari.');
                      return;
                    }

                    // Check if secure context
                    if (!window.isSecureContext) {
                      setError('Se requiere HTTPS para usar la cámara. Verifica que la URL comience con https://');
                      return;
                    }

                    try {
                      const stream = await navigator.mediaDevices.getUserMedia({
                        video: { facingMode: 'environment' },
                      });
                      stream.getTracks().forEach(track => track.stop());
                      setHasPermission(true);
                      await getCameras();
                      startScanning();
                    } catch (err: any) {
                      console.error('Permission error:', err.name, err.message);
                      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                        setHasPermission(false);
                        setError('Permiso bloqueado. Debes habilitarlo manualmente en la configuración del navegador (ver instrucciones arriba).');
                      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
                        setError('No se encontró cámara en este dispositivo.');
                      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
                        setError('La cámara está en uso por otra aplicación.');
                      } else if (err.name === 'OverconstrainedError') {
                        // Try without facingMode constraint
                        try {
                          const stream2 = await navigator.mediaDevices.getUserMedia({ video: true });
                          stream2.getTracks().forEach(track => track.stop());
                          setHasPermission(true);
                          await getCameras();
                          startScanning();
                        } catch {
                          setError('Error al acceder a la cámara: ' + err.message);
                        }
                      } else {
                        setError('Error: ' + err.name + ' - ' + err.message);
                      }
                    }
                  }}
                >
                  Solicitar Permiso
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-400"
                  onClick={() => {
                    // Copy diagnostic info
                    const info = `
Navegador: ${navigator.userAgent}
Secure Context: ${window.isSecureContext}
MediaDevices: ${!!navigator.mediaDevices}
URL: ${window.location.href}
                    `.trim();
                    navigator.clipboard?.writeText(info);
                    alert('Info copiada: ' + info);
                  }}
                >
                  Copiar info de diagnóstico
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Not scanning overlay */}
        {!isScanning && !error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
            <div className="text-center text-white">
              <Camera className="mx-auto mb-2 h-12 w-12" />
              <p className="text-sm">Cámara pausada</p>
              <p className="text-xs text-gray-400 mt-1">Presiona el botón Escanear para iniciar</p>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="mt-3 flex items-center justify-center gap-2">
        {/* Toggle scanning */}
        <Button
          variant={isScanning ? 'destructive' : 'default'}
          size="sm"
          onClick={isScanning ? stopScanning : startScanning}
        >
          {isScanning ? (
            <>
              <CameraOff className="h-4 w-4" />
              Pausar
            </>
          ) : (
            <>
              <Camera className="h-4 w-4" />
              Escanear
            </>
          )}
        </Button>

        {/* Switch camera */}
        {cameras.length > 1 && (
          <Button
            variant="outline"
            size="icon"
            onClick={switchCamera}
            title="Cambiar cámara"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        )}

        {/* Toggle torch */}
        {torchSupported && (
          <Button
            variant={torchEnabled ? 'secondary' : 'outline'}
            size="icon"
            onClick={toggleTorch}
            title={torchEnabled ? 'Apagar linterna' : 'Encender linterna'}
          >
            {torchEnabled ? (
              <Flashlight className="h-4 w-4" />
            ) : (
              <FlashlightOff className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>

      {/* Camera selector (if multiple cameras) */}
      {cameras.length > 1 && (
        <div className="mt-2 text-center">
          <p className="text-xs text-muted-foreground">
            Cámara: {cameras.find((c) => c.deviceId === selectedCamera)?.label || 'Desconocida'}
          </p>
        </div>
      )}

      {/* Scan line animation styles */}
      <style jsx>{`
        @keyframes scan-line {
          0%, 100% {
            top: 0;
          }
          50% {
            top: calc(100% - 2px);
          }
        }
      `}</style>
    </div>
  );
}

export default BarcodeScanner;
