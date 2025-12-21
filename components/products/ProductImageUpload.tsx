'use client';

import * as React from 'react';
import { useState, useRef, useCallback } from 'react';
import { Camera, Upload, X, Loader2, Image as ImageIcon, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Button } from '@/components/ui/Button';
import { UploadService } from '@/services/uploadService';
import toast from 'react-hot-toast';

export interface ProductImageUploadProps {
  currentImage?: string;
  onImageChange: (url: string | null) => void;
  className?: string;
  disabled?: boolean;
}

export function ProductImageUpload({
  currentImage,
  onImageChange,
  className,
  disabled = false,
}: ProductImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection
  const handleFile = useCallback(async (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor selecciona un archivo de imagen.');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('La imagen es muy grande. Maximo 10MB.');
      return;
    }

    try {
      setIsUploading(true);

      // Show preview immediately
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Compress and upload
      const compressedFile = await UploadService.compressImage(file, 1920, 0.8);
      const result = await UploadService.uploadImage(compressedFile, 'product');

      setPreview(result.url);
      onImageChange(result.url);
      toast.success('Imagen subida correctamente');
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Error al subir la imagen');
      setPreview(currentImage || null);
    } finally {
      setIsUploading(false);
    }
  }, [currentImage, onImageChange]);

  // Handle file input change
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
    // Reset input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [handleFile]);

  // Handle drag events
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  // Handle drop
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (disabled) return;

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFile(file);
    }
  }, [disabled, handleFile]);

  // Handle remove
  const handleRemove = useCallback(async () => {
    if (preview && preview !== currentImage) {
      try {
        await UploadService.deleteImage(preview);
      } catch (error) {
        console.error('Error deleting image:', error);
      }
    }
    setPreview(null);
    onImageChange(null);
  }, [preview, currentImage, onImageChange]);

  return (
    <div className={cn('w-full', className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleInputChange}
        className="hidden"
        disabled={disabled || isUploading}
      />

      {preview ? (
        // Image preview
        <div className="relative group">
          <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
            <img
              src={preview}
              alt="Imagen del producto"
              className="w-full h-full object-contain"
            />
            {isUploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <Loader2 className="h-8 w-8 text-white animate-spin" />
              </div>
            )}
          </div>

          {/* Actions overlay */}
          {!disabled && !isUploading && (
            <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                leftIcon={<Camera className="h-4 w-4" />}
              >
                Cambiar
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleRemove}
                leftIcon={<Trash2 className="h-4 w-4" />}
              >
                Eliminar
              </Button>
            </div>
          )}
        </div>
      ) : (
        // Upload area
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={cn(
            'relative w-full aspect-square rounded-lg border-2 border-dashed transition-colors',
            dragActive
              ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
            {isUploading ? (
              <>
                <Loader2 className="h-10 w-10 text-gray-400 animate-spin mb-3" />
                <p className="text-sm text-gray-500 dark:text-gray-400">Subiendo imagen...</p>
              </>
            ) : (
              <>
                <ImageIcon className="h-10 w-10 text-gray-400 mb-3" />
                <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-3">
                  Arrastra una imagen aqui o haz clic para seleccionar
                </p>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={disabled}
                    leftIcon={<Upload className="h-4 w-4" />}
                  >
                    Subir imagen
                  </Button>
                </div>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                  JPG, PNG, WebP. Max 10MB.
                </p>
              </>
            )}
          </div>
        </div>
      )}

      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
        Sube una foto clara del producto para que los operadores lo identifiquen durante el conteo.
      </p>
    </div>
  );
}

export default ProductImageUpload;
