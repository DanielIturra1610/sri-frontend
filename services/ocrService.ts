import apiClient, { ApiResponse, handleApiError } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import type { OCRResponse, OCRProductSuggestion, BarcodeResult, OCRRequestType } from '@/types';

/**
 * OCR Service
 * Handles all OCR-related API calls using Google Cloud Vision
 */

export class OCRService {
  /**
   * Process an image and extract product information
   * @param imageBase64 - Base64 encoded image (with or without data URI prefix)
   * @param type - Type of scan to perform
   */
  static async processImage(
    imageBase64: string,
    type: OCRRequestType = 'product_label'
  ): Promise<OCRResponse> {
    try {
      const response = await apiClient.post<ApiResponse<OCRResponse>>(
        API_ENDPOINTS.OCR.PROCESS,
        {
          image_base64: imageBase64,
          type,
        }
      );
      return response.data.data as OCRResponse;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Extract only text from an image
   * @param imageBase64 - Base64 encoded image
   */
  static async extractText(imageBase64: string): Promise<string> {
    try {
      const response = await apiClient.post<ApiResponse<{ text: string }>>(
        API_ENDPOINTS.OCR.TEXT,
        {
          image_base64: imageBase64,
        }
      );
      return response.data.data?.text ?? '';
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Detect barcodes in an image
   * @param imageBase64 - Base64 encoded image
   */
  static async detectBarcodes(imageBase64: string): Promise<BarcodeResult[]> {
    try {
      const response = await apiClient.post<ApiResponse<{ barcodes: BarcodeResult[] }>>(
        API_ENDPOINTS.OCR.BARCODES,
        {
          image_base64: imageBase64,
        }
      );
      return response.data.data?.barcodes ?? [];
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get product suggestion from an image
   * This is the main method for the product creation flow
   * @param imageBase64 - Base64 encoded image
   */
  static async suggestProduct(imageBase64: string): Promise<OCRProductSuggestion | null> {
    try {
      const response = await apiClient.post<ApiResponse<{ suggestion: OCRProductSuggestion }>>(
        API_ENDPOINTS.OCR.SUGGEST,
        {
          image_base64: imageBase64,
        }
      );
      return response.data.data?.suggestion ?? null;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Convert a File to base64 string
   * @param file - File object from input or camera
   */
  static fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  }

  /**
   * Compress an image before sending to OCR
   * Reduces file size while maintaining quality for OCR
   * @param file - Original file
   * @param maxWidth - Maximum width (default 1920)
   * @param quality - JPEG quality 0-1 (default 0.8)
   */
  static async compressImage(
    file: File,
    maxWidth: number = 1920,
    quality: number = 0.8
  ): Promise<string> {
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
          const base64 = canvas.toDataURL('image/jpeg', quality);
          resolve(base64);
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
