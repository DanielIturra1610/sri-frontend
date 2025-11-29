'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { ArrowLeft, ClipboardList, MapPin, FileText } from 'lucide-react';
import { CountService } from '@/services/countService';
import { LocationService } from '@/services/locationService';
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  Input,
  Skeleton,
} from '@/components/ui';
import { NativeSelect } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import type { Location, CreateInventoryCountDTO } from '@/types';
import toast from 'react-hot-toast';

interface CountFormData {
  location_id: string;
  notes?: string;
}

export default function CreateCountPage() {
  const router = useRouter();
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CountFormData>();

  const selectedLocationId = watch('location_id');

  // Load locations
  useEffect(() => {
    loadLocations();
  }, []);

  const loadLocations = async () => {
    try {
      setIsLoading(true);
      const data = await LocationService.getLocations();
      // Only show active locations
      const activeLocations = data.filter((loc) => loc.is_active);
      setLocations(activeLocations);
    } catch (error: any) {
      toast.error(error.message || 'Error al cargar ubicaciones');
      console.error('Error loading locations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: CountFormData) => {
    try {
      setIsSubmitting(true);

      const payload: CreateInventoryCountDTO = {
        location_id: data.location_id,
        notes: data.notes || undefined,
      };

      const count = await CountService.create(payload);
      toast.success('Sesión de conteo creada exitosamente');

      // Redirect to the count details or list
      router.push(`/counts/${count.id}`);
    } catch (error: any) {
      toast.error(error.message || 'Error al crear la sesión de conteo');
      console.error('Error creating count:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedLocation = locations.find((l) => l.id === selectedLocationId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <ClipboardList className="h-7 w-7" />
            Nueva Sesión de Conteo
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Crea una nueva sesión de conteo físico de inventario
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Seleccionar Ubicación
                </CardTitle>
                <CardDescription>
                  Elige la ubicación donde realizarás el conteo físico
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-10 w-full" />
                ) : locations.length === 0 ? (
                  <div className="text-center py-8">
                    <MapPin className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                      No hay ubicaciones disponibles
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Debes crear al menos una ubicación antes de iniciar un conteo.
                    </p>
                    <div className="mt-6">
                      <Button
                        variant="primary"
                        onClick={() => router.push('/locations/create')}
                      >
                        Crear Ubicación
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <NativeSelect
                      {...register('location_id', {
                        required: 'Debes seleccionar una ubicación',
                      })}
                      error={errors.location_id?.message}
                    >
                      <option value="">Selecciona una ubicación</option>
                      {locations.map((location) => (
                        <option key={location.id} value={location.id}>
                          {location.name} ({location.code})
                        </option>
                      ))}
                    </NativeSelect>

                    {selectedLocation && (
                      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {selectedLocation.name}
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Código: {selectedLocation.code}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Tipo: {selectedLocation.type}
                        </p>
                        {selectedLocation.description && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                            {selectedLocation.description}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Notas (Opcional)
                </CardTitle>
                <CardDescription>
                  Agrega notas o comentarios sobre esta sesión de conteo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  {...register('notes')}
                  placeholder="Ej: Conteo mensual de inventario, auditoria trimestral, etc."
                  rows={4}
                />
              </CardContent>
            </Card>
          </div>

          {/* Info Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Información</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                    ¿Qué es una sesión de conteo?
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Una sesión de conteo te permite verificar el inventario físico
                    de una ubicación específica usando el escáner de código de barras.
                  </p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                    Flujo de trabajo
                  </h4>
                  <ol className="text-sm text-gray-500 dark:text-gray-400 mt-1 list-decimal list-inside space-y-1">
                    <li>Crea la sesión (estado: Borrador)</li>
                    <li>Inicia el conteo (estado: En Progreso)</li>
                    <li>Escanea los productos con la cámara</li>
                    <li>Revisa las discrepancias</li>
                    <li>Completa y aplica ajustes</li>
                  </ol>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                    Importante
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Solo se pueden tener activas las sesiones de conteo que estén
                    en estado &quot;En Progreso&quot;. Los borradores pueden ser eliminados.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
            disabled={isLoading || locations.length === 0}
          >
            Crear Sesión
          </Button>
        </div>
      </form>
    </div>
  );
}
