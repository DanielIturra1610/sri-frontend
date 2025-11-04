'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Save, UserCog, Info } from 'lucide-react';
import { UserService } from '@/services/userService';
import { updateUserSchema, type UpdateUserFormData, roleLabels, roleDescriptions } from '@/lib/validations/user';
import { Button, Input, Select, Checkbox, Card, CardHeader, CardTitle, CardContent, Alert, Skeleton } from '@/components/ui';
import type { User, UserRole } from '@/types';
import toast from 'react-hot-toast';

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;

  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<UpdateUserFormData>({
    resolver: zodResolver(updateUserSchema),
  });

  const selectedRole = watch('role');

  // Load user data
  useEffect(() => {
    const loadUser = async () => {
      try {
        setIsLoading(true);
        const data = await UserService.getUser(userId);
        setUser(data);

        // Set form values
        setValue('email', data.email);
        setValue('full_name', data.full_name);
        setValue('rut', data.rut || '');
        setValue('phone', data.phone || '');
        setValue('role', data.role);
        setValue('is_active', data.is_active);
      } catch (error: any) {
        toast.error(error.message || 'Error al cargar usuario');
        console.error('Error loading user:', error);
        router.push('/users');
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      loadUser();
    }
  }, [userId, router, setValue]);

  // Handle form submission
  const onSubmit = async (data: UpdateUserFormData) => {
    try {
      setIsSubmitting(true);

      // Convert empty strings to undefined
      const userData = {
        email: data.email,
        full_name: data.full_name,
        rut: data.rut || undefined,
        phone: data.phone || undefined,
        role: data.role,
        is_active: data.is_active,
        // Only include password if it was provided
        ...(data.password ? { password: data.password } : {}),
      };

      await UserService.updateUser(userId, userData);

      toast.success('Usuario actualizado exitosamente');
      router.push('/users');
    } catch (error: any) {
      toast.error(error.message || 'Error al actualizar usuario');
      console.error('Error updating user:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-12 w-1/2" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <UserCog className="h-7 w-7" />
            Editar Usuario
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Modifica la información del usuario: {user.full_name}
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Información Personal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Nombre Completo"
              placeholder="Ej: Juan Pérez González"
              error={errors.full_name?.message}
              {...register('full_name')}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Email"
                type="email"
                placeholder="usuario@ejemplo.com"
                error={errors.email?.message}
                {...register('email')}
              />

              <Input
                label="RUT (Opcional)"
                placeholder="12345678-9"
                error={errors.rut?.message}
                {...register('rut')}
              />
            </div>

            <Input
              label="Teléfono (Opcional)"
              placeholder="+56 9 1234 5678"
              error={errors.phone?.message}
              {...register('phone')}
            />
          </CardContent>
        </Card>

        {/* Security */}
        <Card>
          <CardHeader>
            <CardTitle>Seguridad</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Nueva Contraseña (Opcional)"
              type="password"
              placeholder="Dejar en blanco para mantener la actual"
              error={errors.password?.message}
              {...register('password')}
              helperText="Solo completa este campo si deseas cambiar la contraseña"
            />

            <Alert variant="info" title="Cambio de Contraseña">
              Si cambias la contraseña, asegúrate de comunicársela al usuario de forma segura.
            </Alert>
          </CardContent>
        </Card>

        {/* Role & Permissions */}
        <Card>
          <CardHeader>
            <CardTitle>Rol y Permisos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select
              label="Rol"
              error={errors.role?.message}
              {...register('role')}
            >
              {(Object.keys(roleLabels) as UserRole[]).map((role) => (
                <option key={role} value={role}>
                  {roleLabels[role]}
                </option>
              ))}
            </Select>

            {/* Role Description */}
            {selectedRole && (
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-900 dark:text-blue-100">
                      {roleLabels[selectedRole as UserRole]}
                    </p>
                    <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                      {roleDescriptions[selectedRole as UserRole]}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Checkbox
                id="is_active"
                label="Usuario activo"
                {...register('is_active')}
              />
              <p className="text-sm text-gray-600 dark:text-gray-400 ml-7">
                Los usuarios inactivos no podrán iniciar sesión en el sistema
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-3">
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
            leftIcon={<Save className="h-4 w-4" />}
            isLoading={isSubmitting}
          >
            Guardar Cambios
          </Button>
        </div>
      </form>
    </div>
  );
}
