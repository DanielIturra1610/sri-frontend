'use client';

import React, { useState, useCallback } from 'react';
import {
  Upload,
  Download,
  FileSpreadsheet,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  FileText,
} from 'lucide-react';
import { ImportService, ImportTemplateType, ImportOptions } from '@/services/importService';
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
  Alert,
  Checkbox,
  Progress,
} from '@/components/ui';
import { Can } from '@/components/auth';
import { PERMISSIONS } from '@/lib/constants/permissions';
import type { ImportResult } from '@/types';
import toast from 'react-hot-toast';

export default function ImportPage() {
  // State
  const [selectedType, setSelectedType] = useState<ImportTemplateType>('products-with-stock');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [isDryRun, setIsDryRun] = useState(false);

  // Import options
  const [options, setOptions] = useState<ImportOptions>({
    dry_run: false,
    update_existing: true,
    create_categories: true,
    create_locations: true,
    skip_invalid_rows: true,
  });

  // Handle template download
  const handleDownloadTemplate = async (type: ImportTemplateType) => {
    try {
      const blob = await ImportService.downloadTemplate(type);

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `plantilla_${type}_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Plantilla descargada exitosamente');
    } catch (error: any) {
      toast.error(error.message || 'Error al descargar plantilla');
      console.error('Error downloading template:', error);
    }
  };

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  // Handle drag and drop
  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);

    const files = event.dataTransfer.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  }, []);

  const handleFile = (file: File) => {
    // Validate file type
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv',
    ];
    const validExtensions = ['.xlsx', '.xls', '.csv'];

    const hasValidType = validTypes.includes(file.type);
    const hasValidExtension = validExtensions.some((ext) => file.name.toLowerCase().endsWith(ext));

    if (!hasValidType && !hasValidExtension) {
      toast.error('Tipo de archivo no válido. Use .xlsx, .xls o .csv');
      return;
    }

    setSelectedFile(file);
    setImportResult(null);
    toast.success(`Archivo "${file.name}" seleccionado`);
  };

  // Handle import
  const handleImport = async (dryRun: boolean = false) => {
    if (!selectedFile) {
      toast.error('Seleccione un archivo para importar');
      return;
    }

    try {
      setIsImporting(true);
      setImportProgress(0);
      setIsDryRun(dryRun);

      const importOptions: ImportOptions = {
        ...options,
        dry_run: dryRun,
      };

      // Simulate progress
      const progressInterval = setInterval(() => {
        setImportProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 300);

      let result: ImportResult;

      switch (selectedType) {
        case 'products-with-stock':
          result = await ImportService.importProductsWithStock(selectedFile, importOptions);
          break;
        case 'products-only':
          result = await ImportService.importProductsOnly(selectedFile, importOptions);
          break;
        case 'stock-only':
          result = await ImportService.importStockOnly(selectedFile, importOptions);
          break;
        default:
          throw new Error('Tipo de importación no válido');
      }

      clearInterval(progressInterval);
      setImportProgress(100);
      setImportResult(result);

      if (dryRun) {
        toast.success('Vista previa completada. Revise los resultados.');
      } else {
        toast.success('Importación completada exitosamente');
      }
    } catch (error: any) {
      toast.error(error.message || 'Error al importar archivo');
      console.error('Error importing:', error);
    } finally {
      setIsImporting(false);
    }
  };

  // Handle download error report
  const handleDownloadErrorReport = () => {
    if (!importResult) return;

    const blob = ImportService.generateErrorReport(importResult);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `reporte_errores_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    toast.success('Reporte de errores descargado');
  };

  // Reset import
  const handleReset = () => {
    setSelectedFile(null);
    setImportResult(null);
    setImportProgress(0);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Upload className="h-7 w-7" />
          Importación Masiva
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Importa productos y stock desde archivos Excel o CSV
        </p>
      </div>

      {/* Step 1: Download Template */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 font-bold">
              1
            </span>
            Descargar Plantilla
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Selecciona el tipo de importación y descarga la plantilla correspondiente:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Products with Stock */}
            <Card className="border-2 hover:border-blue-500 transition-colors">
              <CardContent className="pt-6">
                <div className="text-center space-y-3">
                  <FileSpreadsheet className="h-12 w-12 mx-auto text-blue-600 dark:text-blue-400" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Productos + Stock
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Importar productos con su inventario inicial
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<Download className="h-4 w-4" />}
                    onClick={() => handleDownloadTemplate('products-with-stock')}
                    className="w-full"
                  >
                    Descargar
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Products Only */}
            <Card className="border-2 hover:border-blue-500 transition-colors">
              <CardContent className="pt-6">
                <div className="text-center space-y-3">
                  <FileSpreadsheet className="h-12 w-12 mx-auto text-green-600 dark:text-green-400" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Solo Productos
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Importar solo catálogo de productos
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<Download className="h-4 w-4" />}
                    onClick={() => handleDownloadTemplate('products-only')}
                    className="w-full"
                  >
                    Descargar
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Stock Only */}
            <Card className="border-2 hover:border-blue-500 transition-colors">
              <CardContent className="pt-6">
                <div className="text-center space-y-3">
                  <FileSpreadsheet className="h-12 w-12 mx-auto text-orange-600 dark:text-orange-400" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">Solo Stock</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Actualizar inventario de productos existentes
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<Download className="h-4 w-4" />}
                    onClick={() => handleDownloadTemplate('stock-only')}
                    className="w-full"
                  >
                    Descargar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Step 2: Select Import Type */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 font-bold">
              2
            </span>
            Seleccionar Tipo de Importación
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Button
              variant={selectedType === 'products-with-stock' ? 'primary' : 'outline'}
              onClick={() => setSelectedType('products-with-stock')}
            >
              Productos + Stock
            </Button>
            <Button
              variant={selectedType === 'products-only' ? 'primary' : 'outline'}
              onClick={() => setSelectedType('products-only')}
            >
              Solo Productos
            </Button>
            <Button
              variant={selectedType === 'stock-only' ? 'primary' : 'outline'}
              onClick={() => setSelectedType('stock-only')}
            >
              Solo Stock
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Step 3: Upload File */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 font-bold">
              3
            </span>
            Subir Archivo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Drag & Drop Zone */}
          <div
            className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
              isDragging
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                : 'border-gray-300 dark:border-gray-700'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <Upload
              className={`h-16 w-16 mx-auto mb-4 ${
                isDragging ? 'text-blue-600' : 'text-gray-400'
              }`}
            />
            <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {selectedFile
                ? `Archivo seleccionado: ${selectedFile.name}`
                : 'Arrastra y suelta tu archivo aquí'}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              o haz clic para seleccionar un archivo
            </p>
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <span className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                Seleccionar Archivo
              </span>
            </label>
            {selectedFile && (
              <div className="mt-4 flex items-center justify-center gap-2">
                <FileSpreadsheet className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {selectedFile.name}
                </span>
                <span className="text-sm text-gray-500">
                  ({(selectedFile.size / 1024).toFixed(2)} KB)
                </span>
              </div>
            )}
          </div>

          {/* Import Options */}
          <Card className="bg-gray-50 dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="text-sm">Opciones de Importación</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Checkbox
                id="update_existing"
                label="Actualizar productos existentes"
                checked={options.update_existing}
                onChange={(e) =>
                  setOptions({ ...options, update_existing: e.target.checked })
                }
              />
              <Checkbox
                id="create_categories"
                label="Crear categorías automáticamente"
                checked={options.create_categories}
                onChange={(e) =>
                  setOptions({ ...options, create_categories: e.target.checked })
                }
              />
              <Checkbox
                id="create_locations"
                label="Crear ubicaciones automáticamente"
                checked={options.create_locations}
                onChange={(e) =>
                  setOptions({ ...options, create_locations: e.target.checked })
                }
              />
              <Checkbox
                id="skip_invalid_rows"
                label="Omitir filas inválidas y continuar"
                checked={options.skip_invalid_rows}
                onChange={(e) =>
                  setOptions({ ...options, skip_invalid_rows: e.target.checked })
                }
              />
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Can permission={PERMISSIONS.IMPORT_PRODUCTS}>
              <Button
                variant="outline"
                leftIcon={<Info className="h-4 w-4" />}
                onClick={() => handleImport(true)}
                disabled={!selectedFile || isImporting}
                isLoading={isImporting && isDryRun}
              >
                Vista Previa (Dry Run)
              </Button>
              <Button
                variant="primary"
                leftIcon={<Upload className="h-4 w-4" />}
                onClick={() => handleImport(false)}
                disabled={!selectedFile || isImporting}
                isLoading={isImporting && !isDryRun}
              >
                Importar Archivo
              </Button>
            </Can>
            {selectedFile && (
              <Button variant="ghost" onClick={handleReset}>
                Limpiar
              </Button>
            )}
          </div>

          {/* Progress Bar */}
          {isImporting && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Importando...</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {importProgress}%
                </span>
              </div>
              <Progress value={importProgress} />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Step 4: Results */}
      {importResult && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 font-bold">
                  4
                </span>
                Resultados de la Importación
                {isDryRun && (
                  <Badge variant="info" className="ml-2">
                    VISTA PREVIA
                  </Badge>
                )}
              </CardTitle>
              {importResult.errors.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<Download className="h-4 w-4" />}
                  onClick={handleDownloadErrorReport}
                >
                  Descargar Reporte de Errores
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Success Alert */}
            {importResult.success && (
              <Alert variant="success" title="Importación Exitosa">
                {isDryRun
                  ? 'La vista previa se completó sin errores críticos. Puedes proceder con la importación real.'
                  : 'Los datos se importaron correctamente.'}
              </Alert>
            )}

            {/* Error Alert */}
            {!importResult.success && (
              <Alert variant="danger" title="Importación Fallida">
                Se encontraron errores durante la importación. Revise el reporte detallado.
              </Alert>
            )}

            {/* Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                      {importResult.total_rows}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Filas Totales</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                      {importResult.products_created}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Creados</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                      {importResult.products_updated}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Actualizados</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                      {importResult.products_skipped}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Omitidos</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Additional Info */}
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-gray-600 dark:text-gray-400">
                  Categorías creadas: <strong>{importResult.categories_created}</strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-gray-600 dark:text-gray-400">
                  Ubicaciones creadas: <strong>{importResult.locations_created}</strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-gray-600 dark:text-gray-400">
                  Stock creado: <strong>{importResult.stock_created}</strong>
                </span>
              </div>
            </div>

            {/* Errors */}
            {importResult.errors.length > 0 && (
              <div>
                <h3 className="font-semibold text-red-600 dark:text-red-400 mb-3 flex items-center gap-2">
                  <XCircle className="h-5 w-5" />
                  Errores ({importResult.errors.length})
                </h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {importResult.errors.slice(0, 10).map((error, index) => (
                    <div
                      key={index}
                      className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-sm"
                    >
                      <span className="font-medium">Fila {error.row_number}:</span> {error.error}
                      {error.field && (
                        <span className="text-gray-600 dark:text-gray-400">
                          {' '}
                          (Campo: {error.field})
                        </span>
                      )}
                    </div>
                  ))}
                  {importResult.errors.length > 10 && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                      Y {importResult.errors.length - 10} errores más...
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Warnings */}
            {importResult.warnings.length > 0 && (
              <div>
                <h3 className="font-semibold text-orange-600 dark:text-orange-400 mb-3 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Advertencias ({importResult.warnings.length})
                </h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {importResult.warnings.slice(0, 10).map((warning, index) => (
                    <div
                      key={index}
                      className="p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded text-sm"
                    >
                      <span className="font-medium">Fila {warning.row_number}:</span>{' '}
                      {warning.message}
                      <span className="text-gray-600 dark:text-gray-400">
                        {' '}
                        (Campo: {warning.field})
                      </span>
                    </div>
                  ))}
                  {importResult.warnings.length > 10 && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                      Y {importResult.warnings.length - 10} advertencias más...
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Proceed with Import */}
            {isDryRun && importResult.success && (
              <Alert variant="info" title="Vista Previa Completada">
                <p className="mb-3">
                  La validación se completó correctamente. ¿Deseas proceder con la importación
                  real?
                </p>
                <Button
                  variant="primary"
                  leftIcon={<Upload className="h-4 w-4" />}
                  onClick={() => handleImport(false)}
                  isLoading={isImporting}
                >
                  Proceder con Importación
                </Button>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
