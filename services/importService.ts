import apiClient, { ApiResponse, handleApiError } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import type { ImportResult } from '@/types';

/**
 * Import Service
 * Handles all import-related API calls
 */

export type ImportTemplateType = 'products-with-stock' | 'products-only' | 'stock-only';

export interface ImportOptions {
  dry_run?: boolean;
  update_existing?: boolean;
  create_categories?: boolean;
  create_locations?: boolean;
  skip_invalid_rows?: boolean;
}

export class ImportService {
  /**
   * Download import template
   */
  static async downloadTemplate(type: ImportTemplateType): Promise<Blob> {
    try {
      const response = await apiClient.get(
        `${API_ENDPOINTS.IMPORT.TEMPLATE}?type=${type}`,
        {
          responseType: 'blob',
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Import products with stock (Option B)
   */
  static async importProductsWithStock(
    file: File,
    options: ImportOptions = {}
  ): Promise<ImportResult> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      // Append options
      if (options.dry_run !== undefined) {
        formData.append('dry_run', options.dry_run.toString());
      }
      if (options.update_existing !== undefined) {
        formData.append('update_existing', options.update_existing.toString());
      }
      if (options.create_categories !== undefined) {
        formData.append('create_categories', options.create_categories.toString());
      }
      if (options.create_locations !== undefined) {
        formData.append('create_locations', options.create_locations.toString());
      }
      if (options.skip_invalid_rows !== undefined) {
        formData.append('skip_invalid_rows', options.skip_invalid_rows.toString());
      }

      const response = await apiClient.post<ApiResponse<ImportResult>>(
        API_ENDPOINTS.IMPORT.PRODUCTS_WITH_STOCK,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      return response.data.data!;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Import products only (Option A)
   */
  static async importProductsOnly(
    file: File,
    options: ImportOptions = {}
  ): Promise<ImportResult> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      // Append options
      if (options.dry_run !== undefined) {
        formData.append('dry_run', options.dry_run.toString());
      }
      if (options.update_existing !== undefined) {
        formData.append('update_existing', options.update_existing.toString());
      }
      if (options.create_categories !== undefined) {
        formData.append('create_categories', options.create_categories.toString());
      }
      if (options.skip_invalid_rows !== undefined) {
        formData.append('skip_invalid_rows', options.skip_invalid_rows.toString());
      }

      const response = await apiClient.post<ApiResponse<ImportResult>>(
        API_ENDPOINTS.IMPORT.PRODUCTS_ONLY,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      return response.data.data!;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Import stock only (Option C)
   */
  static async importStockOnly(
    file: File,
    options: ImportOptions = {}
  ): Promise<ImportResult> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      // Append options
      if (options.dry_run !== undefined) {
        formData.append('dry_run', options.dry_run.toString());
      }
      if (options.create_locations !== undefined) {
        formData.append('create_locations', options.create_locations.toString());
      }
      if (options.skip_invalid_rows !== undefined) {
        formData.append('skip_invalid_rows', options.skip_invalid_rows.toString());
      }

      const response = await apiClient.post<ApiResponse<ImportResult>>(
        API_ENDPOINTS.IMPORT.STOCK_ONLY,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      return response.data.data!;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Generate error report from import result
   */
  static generateErrorReport(result: ImportResult): Blob {
    const lines: string[] = [
      'Import Error Report',
      `Generated: ${new Date().toLocaleString()}`,
      '',
      `Total Rows: ${result.total_rows}`,
      `Products Created: ${result.products_created}`,
      `Products Updated: ${result.products_updated}`,
      `Products Skipped: ${result.products_skipped}`,
      `Categories Created: ${result.categories_created}`,
      `Locations Created: ${result.locations_created}`,
      `Stock Created: ${result.stock_created}`,
      '',
      '--- ERRORS ---',
      '',
    ];

    if (result.errors.length > 0) {
      result.errors.forEach((error) => {
        lines.push(
          `Row ${error.row_number}: ${error.error}${
            error.field ? ` (Field: ${error.field})` : ''
          }${error.value ? ` (Value: ${error.value})` : ''}`
        );
      });
    } else {
      lines.push('No errors found.');
    }

    lines.push('', '--- WARNINGS ---', '');

    if (result.warnings.length > 0) {
      result.warnings.forEach((warning) => {
        lines.push(
          `Row ${warning.row_number}: ${warning.message} (Field: ${warning.field})`
        );
      });
    } else {
      lines.push('No warnings found.');
    }

    const content = lines.join('\n');
    return new Blob([content], { type: 'text/plain;charset=utf-8' });
  }
}
