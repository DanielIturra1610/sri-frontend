'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Save, UserPlus, Info } from 'lucide-react';
import { UserService } from '@/services/userService';
import { createUserSchema, type CreateUserFormData, roleLabels, roleDescriptions } from '@/lib/validations/user';
import { Button, Input, Select, Checkbox, Card, CardHeader, CardTitle, CardContent, Alert } from '@/components/ui';
import type { UserRole } from '@/types';
import toast from 'react-hot-toast';

export default function CreateUserPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      is_active: true,
      role: 'OPERATOR',
    },
  });

  const selectedRole = watch('role');

  // Handle form submission
  const onSubmit = async (data: CreateUserFormData) => {
    try {
      setIsSubmitting(true);

      // Convert empty strings to undefined
      const userData = {
        ...data,
        rut: data.rut || undefined,
        phone: data.phone || undefined,
      };

      await UserService.createUser(userData);

      toast.success('Usuario creado exitosamente');
      router.push('/users');
    } catch (error: any) {
      toast.error(error.message || 'Error al crear usuario');
      console.error('Error creating user:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

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
            <UserPlus className="h-7 w-7" />
            Crear Usuario
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Agrega un nuevo usuario al sistema
          </p>
        </div>
      </div>

      {/* Info Alert */}
      <Alert variant="info" title="Información Importante">
        Los usuarios tendrán acceso al sistema según el rol asignado. Asegúrate de seleccionar el
        rol apropiado para cada usuario.
      </Alert>

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
              label="Contraseña"
              type="password"
              placeholder="••••••••"
              error={errors.password?.message}
              {...register('password')}
              helperText="Mínimo 8 caracteres, debe incluir mayúscula, minúscula y número"
            />

            <Alert variant="warning" title="Nota de Seguridad">
              Asegúrate de que la contraseña sea segura y comunícala al usuario de forma segura.
              El usuario podrá cambiarla después de su primer inicio de sesión.
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
            Crear Usuario
          </Button>
        </div>
      </form>
    </div>
  );
}
