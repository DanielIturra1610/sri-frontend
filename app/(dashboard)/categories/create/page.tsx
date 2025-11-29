'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Save } from 'lucide-react';
import { CategoryService } from '@/services/categoryService';
import { categorySchema, type CategoryFormData } from '@/lib/validations/category';
import { Button, Input, Textarea, NativeSelect as Select, Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import type { Category } from '@/types';
import toast from 'react-hot-toast';

export default function CreateCategoryPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
  });

  // Load categories for parent selector
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await CategoryService.getCategories();
        setCategories(data);
      } catch (error) {
        console.error('Error loading categories:', error);
        toast.error('Error al cargar categorías');
      }
    };

    loadCategories();
  }, []);

  // Handle form submission
  const onSubmit = async (data: CategoryFormData) => {
    try {
      setIsSubmitting(true);

      // Convert empty strings to undefined
      const categoryData = {
        ...data,
        description: data.description || undefined,
        parent_id: data.parent_id || undefined,
      };

      await CategoryService.createCategory(categoryData);

      toast.success('Categoría creada exitosamente');
      router.push('/categories');
    } catch (error: any) {
      toast.error(error.message || 'Error al crear categoría');
      console.error('Error creating category:', error);
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
            Nueva Categoría
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Agrega una nueva categoría al catálogo
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
            <Input
              label="Nombre de la Categoría"
              placeholder="Ej: Electrónica"
              error={errors.name?.message}
              {...register('name')}
            />

            <Textarea
              label="Descripción"
              placeholder="Descripción de la categoría..."
              rows={3}
              error={errors.description?.message}
              {...register('description')}
            />

            <Select
              label="Categoría Padre (Opcional)"
              error={errors.parent_id?.message}
              {...register('parent_id')}
            >
              <option value="">Sin categoría padre</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </Select>
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
            {isSubmitting ? 'Guardando...' : 'Crear Categoría'}
          </Button>
        </div>
      </form>
    </div>
  );
}
