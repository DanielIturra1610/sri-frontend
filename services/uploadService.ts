import apiClient, { handleApiError } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import type { UploadResponse } from '@/types';

/**
 * Upload Service
 * Handles file uploads to the server
 */

export class UploadService {
  /**
   * Upload an image file
   * @param file - The file to upload
   * @param type - Type of upload (product, lot, document)
   */
  static async uploadImage(
    file: File,
    type: 'product' | 'lot' | 'document' = 'product'
  ): Promise<UploadResponse> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);

      const response = await apiClient.post<{ success: boolean; data: UploadResponse }>(
        API_ENDPOINTS.UPLOAD.IMAGE,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Delete an uploaded image
   * @param url - The URL of the image to delete
   */
  static async deleteImage(url: string): Promise<void> {
    try {
      await apiClient.delete(API_ENDPOINTS.UPLOAD.IMAGE, {
        data: { url },
      });
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Compress an image before upload
   * @param file - Original file
   * @param maxWidth - Maximum width
   * @param quality - JPEG quality (0-1)
   */
  static async compressImage(
    file: File,
    maxWidth: number = 1920,
    quality: number = 0.8
  ): Promise<File> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      img.onload = () => {
        let { width, height } = img;

        // Calculate new dimensions
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const compressedFile = new File([blob], file.name, {
                  type: 'image/jpeg',
                  lastModified: Date.now(),
                });
                resolve(compressedFile);
              } else {
                reject(new Error('Could not compress image'));
              }
            },
            'image/jpeg',
            quality
          );
        } else {
          reject(new Error('Could not get canvas context'));
        }
      };

      img.onerror = () => reject(new Error('Could not load image'));

      // Read file as data URL
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Could not read file'));
      reader.readAsDataURL(file);
    });
  }
}
