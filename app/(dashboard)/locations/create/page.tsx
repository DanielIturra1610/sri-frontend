'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Save } from 'lucide-react';
import { LocationService } from '@/services/locationService';
import { locationSchema, type LocationFormData, locationTypeLabels } from '@/lib/validations/location';
import { Button, Input, Textarea, Select, Checkbox, Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import toast from 'react-hot-toast';

export default function CreateLocationPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LocationFormData>({
    resolver: zodResolver(locationSchema),
    defaultValues: {
      is_active: true,
      type: 'warehouse',
    },
  });

  // Handle form submission
  const onSubmit = async (data: LocationFormData) => {
    try {
      setIsSubmitting(true);

      // Convert empty strings to undefined
      const locationData = {
        ...data,
        description: data.description || undefined,
      };

      await LocationService.createLocation(locationData);

      toast.success('Ubicación creada exitosamente');
      router.push('/locations');
    } catch (error: any) {
      toast.error(error.message || 'Error al crear ubicación');
      console.error('Error creating location:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          leftIcon={<ArrowLeft className="h-4 w-4" />}
        >
          Volver
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Nueva Ubicación
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Agrega una nueva ubicación al inventario
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Información Básica</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Código"
                placeholder="Ej: BOD-001"
                helperText="Solo mayúsculas, números, guiones y guiones bajos"
                error={errors.code?.message}
                {...register('code')}
              />

              <Select
                label="Tipo de Ubicación"
                error={errors.type?.message}
                {...register('type')}
              >
                {Object.entries(locationTypeLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
            </div>

            <Input
              label="Nombre de la Ubicación"
              placeholder="Ej: Bodega Central Santiago"
              error={errors.name?.message}
              {...register('name')}
            />

            <Textarea
              label="Descripción"
              placeholder="Descripción de la ubicación..."
              rows={3}
              error={errors.description?.message}
              {...register('description')}
            />
          </CardContent>
        </Card>

        {/* Status */}
        <Card>
          <CardHeader>
            <CardTitle>Estado</CardTitle>
          </CardHeader>
          <CardContent>
            <Checkbox
              label="Ubicación activa"
              {...register('is_active')}
              defaultChecked
            />
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Las ubicaciones inactivas no estarán disponibles para nuevas transacciones
            </p>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 sticky bottom-0 bg-gray-50 dark:bg-gray-950 py-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
            leftIcon={<Save className="h-4 w-4" />}
          >
            {isSubmitting ? 'Guardando...' : 'Crear Ubicación'}
          </Button>
        </div>
      </form>
    </div>
  );
}
